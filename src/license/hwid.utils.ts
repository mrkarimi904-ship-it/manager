import * as os from 'os';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { sha256hex } from './license.utils';

function execTry(cmd: string, opts: any = {}): string {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'], ...opts }).toString();
  } catch {
    return '';
  }
}

function readText(p: string): string {
  try {
    return fs.readFileSync(p, 'utf8').trim();
  } catch {
    return '';
  }
}

function norm(s: string): string {
  return (s || '').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

// -------- Linux (works in Docker) --------
function linuxStrong() {
  const hostMachineId = readText('/host/etc-machine-id') || readText('/host/etc/machine-id');
  const contMachineId = readText('/etc/machine-id') || readText('/var/lib/dbus/machine-id');
  const machineId = norm(hostMachineId || contMachineId);

  const hostDmi = (p: string) => readText(`/host/dmi/${p}`) || readText(`/sys/class/dmi/id/${p}`);
  const smbiosUuid = norm(hostDmi('product_uuid'));
  const biosVendor = norm(hostDmi('bios_vendor'));

  // Try system disk serial (best-effort)
  let diskSerial = '';
  try {
    const rootDev = execTry("df / | tail -1 | awk '{print $1}'").trim();
    if (rootDev) {
      const info = execTry(`udevadm info --query=all --name=${rootDev} | grep -m1 ID_SERIAL=`);
      diskSerial = norm(info.split('=')[1] || info);
    }
  } catch {}

  // Optional TPM EK (left blank unless you wire tpm2-tools)
  const tpmEk = '';

  return { machineId, smbiosUuid, diskSerial, biosVendor, tpmEk };
}

// -------- Windows (PowerShell-based) --------
function windowsStrong() {
  const ps = (code: string) =>
    execTry(`powershell.exe -NoProfile -NonInteractive -Command "${code}"`, { windowsHide: true });

  // MachineGuid
  const machineGuid = norm(
    ps('(Get-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Cryptography").MachineGuid')
  );

  // SMBIOS UUID
  const smbiosUuid = norm(ps('(Get-CimInstance Win32_ComputerSystemProduct).UUID'));

  // Disk serial of system disk
  const sysDrive = ps('$sys = (Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root -eq "$env:SystemDrive\\" })[0]; $sys.Root');
  const diskSerial = norm(
    ps(`
    $letter = "${sysDrive}".Substring(0,1);
    $vol = Get-Partition -DriveLetter $letter | Get-Disk | Select -First 1;
    $sn = (Get-PhysicalDisk | Where-Object { $_.FriendlyName -eq $vol.FriendlyName } | Select -First 1).SerialNumber;
    if (-not $sn) { $sn = (Get-Disk | Where-Object { $_.Number -eq $vol.Number } | Select -First 1).SerialNumber }
    $sn
  `)
  );

  return { machineGuid, smbiosUuid, diskSerial, biosVendor: '', tpmEk: '' };
}

export function collectFingerprint() {
  const plat = os.platform();
  const strong = plat === 'win32' ? windowsStrong() : linuxStrong();

  const parts = [];
  if (strong.tpmEk) parts.push(strong.tpmEk);
  if ('machineGuid' in strong) { parts.push(strong.machineGuid) }
  else if ('machineId' in strong) { parts.push(strong.machineId) }
  else { parts.push('') }
  parts.push(strong.smbiosUuid || '');
  parts.push(strong.diskSerial || '');

  const concat = parts.filter(Boolean).join('|');
  const hwid = sha256hex(Buffer.from(concat));

  const telemetry = {
    os: `${plat}-${os.release()}`,
    arch: os.arch(),
    cpuModel: os.cpus()?.[0]?.model || '',
    ramGB: Math.round(os.totalmem() / 1024 ** 3),
  };

  return {
    version: 2,
    platform: plat,
    strong,
    telemetry,
    hwid,
  };
}

