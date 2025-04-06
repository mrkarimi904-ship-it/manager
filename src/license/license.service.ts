import { HttpException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as os from 'os';
import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import { DbService } from 'src/db/db.service';
import { LoggerService } from 'src/logger/logger.service';
import { generalResponse } from 'src/app.consts';

const execAsync = promisify(exec);
interface LicensePayload {
  hardwareKey: string;
  features: Array<{ key: string, value: string | number | boolean }>;
  expiryDate: string;
  customerId: string;
}

@Injectable()
export class LicenseService {

  private cachedHardwareId: string | null = null;
  constructor(private db: DbService, private loggerService: LoggerService) {}

  async getLicense(): Promise<generalResponse> {
    try {
      const license = await this.db.license.findUnique({ where: { id: 'main' } })
      let license_features = {}
      let license_expiry = "Expired"
      let license_id = ""
      if (license.key !== '' && license.license !== '') {
        const license_data: LicensePayload = JSON.parse(license.license)
        const exp = new Date(license_data.expiryDate)
        const today = new Date()
        today.setHours(0,0,0,0)
        if (exp > today) {
          license_expiry = license_data.expiryDate
          license_features = license_data.features
          license_id = license_data.customerId
        }
      }
      const d = {
        hardwareKey: await this.getHardwareId(),
        licenseKey: license.key,
        features: license_features,
        expiryDate: license_expiry,
        customerId: license_id
      }
      return { status: true, data: d, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async verifyLicense(licenseKey: string): Promise<generalResponse> {
    try {
      const licenseStr = Buffer.from(Buffer.from(licenseKey, 'base64').toString('utf-8'), 'base64').toString('utf-8');
      const license = JSON.parse(licenseStr);

      if (!license.hardwareId || !license.signature) { throw { message: 'Invalid license format' } }

      const currentHardwareId = await this.getHardwareId();
      if (license.hardwareId !== currentHardwareId) { throw { message: 'Hardware ID mismatch' } }

      // Verify signature
      const hmac = crypto.createHmac('sha256', currentHardwareId);
      const { signature, ...licenseData } = license;
      hmac.update(JSON.stringify(licenseData));
      const expectedSignature = hmac.digest('hex');

      if (signature !== expectedSignature) { throw { message: 'Invalid signature' } }

      await this.db.license.update({ where: { id: 'main' }, data: { license: JSON.stringify(license.payload), key: licenseKey } })

      const d = { valid: true, payload: license.payload };
      return { status: true, data: d, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async deleteLicense(): Promise<generalResponse> {
    try {
      await this.db.license.update({ where: { id: 'main' }, data: { license: '', key: '' } })
      return { status: true, data: null, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async generateLicense(payload: LicensePayload): Promise<generalResponse> {
    try {
      const hardwareId = payload.hardwareKey;
      const licenseData = { hardwareId, payload, timestamp: Date.now() };
      // Create a signed license
      const hmac = crypto.createHmac('sha256', hardwareId);
      hmac.update(JSON.stringify(licenseData));
      const signature = hmac.digest('hex');
      const license = { ...licenseData, signature };
      const d = { licenseKey: Buffer.from(JSON.stringify(Buffer.from(JSON.stringify(license)).toString('base64'))).toString('base64') };
      return { status: true, data: d, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }






  async getHardwareId(): Promise<string> {
    if (this.cachedHardwareId) return this.cachedHardwareId;

    const isDocker = await this.isRunningInDocker();
    const identifiers = {
      environment: isDocker ? 'docker' : 'os',
      identifiers: isDocker
        ? await this.getDockerIdentifiers()
        : await this.getOsIdentifiers(),
      commonIdentifiers: await this.getCommonIdentifiers(),
    };

    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(identifiers));
    this.cachedHardwareId = `hwid-${hash.digest('hex').substring(0, 16)}`;

    return this.cachedHardwareId;
  }

  // Private helper methods for hardware ID generation
  private async isRunningInDocker(): Promise<boolean> {
    try {
      if (require('fs').existsSync('/.dockerenv')) return true;
      if (process.platform === 'linux') {
        const cgroup = require('fs').readFileSync('/proc/self/cgroup', 'utf8');
        return cgroup.includes('docker') || cgroup.includes('kubepods');
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  private async getDockerIdentifiers(): Promise<Record<string, string>> {
    return {
      containerId: this.getContainerId(),
      imageId: process.env.IMAGE_ID || 'unknown',
      hostHostname: process.env.HOST_HOSTNAME || await this.getHostHostname(),
    };
  }

  private async getOsIdentifiers(): Promise<Record<string, string>> {
    return {
      macAddress: this.getMacAddress(),
      cpuId: await this.getCpuId(),
      diskSerial: await this.getDiskSerial(),
      motherboardInfo: await this.getMotherboardInfo(),
    };
  }

  private async getCommonIdentifiers(): Promise<Record<string, string>> {
    return {
      hostname: os.hostname(),
      osPlatform: os.platform(),
      osArch: os.arch(),
      totalMemory: os.totalmem().toString(),
      nodeId: process.env.NODE_ID || 'default-node',
      networkInterfaces: this.getNetworkInterfacesHash(),
    };
  }

  private getContainerId(): string {
    try {
      if (process.platform === 'linux') {
        const cgroup = execSync('cat /proc/self/cgroup').toString();
        const match = cgroup.match(/([0-9a-f]{64})/);
        if (match) return match[1];
      }
      return os.hostname();
    } catch (e) {
      return 'unknown-container';
    }
  }

  private async getHostHostname(): Promise<string> {
    try {
      if (process.platform === 'linux') {
        const { stdout } = await execAsync('cat /etc/hostname');
        return stdout.trim();
      }
      return 'unknown-host';
    } catch (e) {
      return 'hostname-error';
    }
  }

  private getMacAddress(): string {
    try {
      const networkInterfaces = os.networkInterfaces();
      for (const [, interfaces] of Object.entries(networkInterfaces)) {
        for (const iface of interfaces) {
          if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
            return iface.mac;
          }
        }
      }
      return 'no-mac-address';
    } catch (e) {
      return 'mac-address-error';
    }
  }

  private async getCpuId(): Promise<string> {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('wmic cpu get ProcessorId');
        return stdout.replace('ProcessorId', '').trim();
      } else if (process.platform === 'linux') {
        const { stdout } = await execAsync('cat /proc/cpuinfo | grep -m 1 "serial" | awk \'{print $3}\'');
        return stdout.trim() || 'no-cpu-serial';
      }
      return 'unsupported-platform';
    } catch (e) {
      return 'cpu-id-error';
    }
  }

  private async getDiskSerial(): Promise<string> {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('wmic diskdrive get serialnumber');
        return stdout.replace('SerialNumber', '').trim();
      } else if (process.platform === 'linux') {
        const { stdout } = await execAsync('lsblk -o serial -d -n');
        return stdout.trim() || 'no-disk-serial';
      }
      return 'unsupported-platform';
    } catch (e) {
      return 'disk-serial-error';
    }
  }

  private async getMotherboardInfo(): Promise<string> {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('wmic baseboard get serialnumber');
        return stdout.replace('SerialNumber', '').trim();
      } else if (process.platform === 'linux') {
        const { stdout } = await execAsync('dmidecode -t baseboard | grep "Serial Number"');
        return stdout.replace('Serial Number:', '').trim() || 'no-mb-serial';
      }
      return 'unsupported-platform';
    } catch (e) {
      return 'motherboard-error';
    }
  }

  private getNetworkInterfacesHash(): string {
    try {
      const interfaces = os.networkInterfaces();
      const hash = crypto.createHash('sha256');
      hash.update(JSON.stringify(interfaces));
      return hash.digest('hex').substring(0, 8);
    } catch (e) {
      return 'network-hash-error';
    }
  }








  async can_add_new_camera(): Promise<boolean> {

    const license = await this.db.license.findUnique({ where: { id: 'main' } })
    if (!license) { return false }
    const total_cameras = await this.db.camera.count()
    if (license.key === '' || license.license === '') {
      if (total_cameras < 5) { return true } else { return false }
    }

    if (license.key !== '' && license.license !== '') {
      const license_data: LicensePayload = JSON.parse(license.license)
      const exp = new Date(license_data.expiryDate)
      const today = new Date()
      today.setHours(0,0,0,0)
      if (exp < today) { return false }
      const feature = license_data.features.filter(x => x.key === "camera")
      if (feature.length !== 1) { return false }
      const cam_count = parseInt(feature[0].value.toString())
      if (cam_count > total_cameras) { return true }
    }

    return false
  }
}