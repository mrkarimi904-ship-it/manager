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

    // These identifiers will persist across container recreations
    const identifiers = {
      // 1. Host machine identifiers (works in Docker when properly mounted)
      hostMachineId: await this.getHostMachineId(),
      hostCpuInfo: await this.getHostCpuInfo(),
      hostDiskInfo: await this.getHostDiskInfo(),

      // 2. Fallback identifiers that are stable in most environments
      stableNetworkHash: this.getStableNetworkHash(),
      systemUUID: await this.getSystemUUID(),

      // 3. Environment context
      environment: await this.getEnvironmentContext(),
    };

    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(identifiers));
    this.cachedHardwareId = `hwid-${hash.digest('hex').substring(0, 16)}`;

    return this.cachedHardwareId;
  }

  private async getHostMachineId(): Promise<string> {
    try {
      // Try to get the host's machine-id (exists on most Linux systems)
      const { stdout } = await execAsync('cat /host/etc/machine-id 2>/dev/null || cat /etc/machine-id 2>/dev/null || echo no-machine-id');
      return stdout.trim();
    } catch {
      return 'machine-id-error';
    }
  }

  private async getHostCpuInfo(): Promise<string> {
    try {
      // Get CPU information that's consistent across containers
      const { stdout } = await execAsync('cat /host/proc/cpuinfo 2>/dev/null || cat /proc/cpuinfo 2>/dev/null | grep -m 1 "model name" | awk -F": " \'{print $2}\'');
      return stdout.trim() || 'no-cpu-info';
    } catch {
      return 'cpu-info-error';
    }
  }

  private async getHostDiskInfo(): Promise<string> {
    try {
      // Get root filesystem UUID which is host-stable
      const { stdout } = await execAsync('(findmnt -n -o SOURCE / | xargs blkid -o value -s UUID 2>/dev/null) || echo no-disk-uuid');
      return stdout.trim();
    } catch {
      return 'disk-info-error';
    }
  }

  private getStableNetworkHash(): string {
    try {
      // Create hash from all physical network interfaces
      const interfaces = os.networkInterfaces();
      const physicalInterfaces = Object.values(interfaces)
        .flat()
        .filter(i => !i.internal && i.mac && i.mac !== '00:00:00:00:00:00');

      const hash = crypto.createHash('sha256');
      physicalInterfaces.forEach(i => hash.update(i.mac));
      return hash.digest('hex').substring(0, 8);
    } catch {
      return 'network-hash-error';
    }
  }

  private async getSystemUUID(): Promise<string> {
    try {
      // Try to get DMI system UUID (works on physical/virtual machines)
      const { stdout } = await execAsync('cat /host/sys/class/dmi/id/product_uuid 2>/dev/null || cat /sys/class/dmi/id/product_uuid 2>/dev/null || echo no-system-uuid');
      return stdout.trim();
    } catch {
      return 'system-uuid-error';
    }
  }

  private async getEnvironmentContext(): Promise<string> {
    try {
      const isDocker = await this.isRunningInDocker();
      const isK8s = process.env.KUBERNETES_SERVICE_HOST ? 'k8s' : 'no';
      return `${isDocker ? 'docker' : 'bare'}-${isK8s}`;
    } catch {
      return 'env-context-error';
    }
  }

  private async isRunningInDocker(): Promise<boolean> {
    try {
      if (require('fs').existsSync('/.dockerenv')) return true;
      if (process.platform === 'linux') {
        const cgroup = require('fs').readFileSync('/proc/self/cgroup', 'utf8');
        return cgroup.includes('docker') || cgroup.includes('kubepods');
      }
      return false;
    } catch {
      return false;
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


  async is_not_expired(): Promise<boolean> {
    try {
      const license = await this.db.license.findUnique({ where: { id: 'main' } })
      if (license.key !== '' && license.license !== '') {
        const license_data: LicensePayload = JSON.parse(license.license)
        const exp = new Date(license_data.expiryDate)
        const today = new Date()
        today.setHours(0,0,0,0)
        if (exp > today) {
          return true
        } else {
          return false
        }
      }
      return false
    } catch (error) {
      return false
    }
  }
}