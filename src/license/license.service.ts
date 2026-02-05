import { HttpException, Injectable, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import { DbService } from 'src/db/db.service';
import { LoggerService } from 'src/logger/logger.service';
import { generalResponse } from 'src/app.consts';
import { licenseGenerateDto, licensePostDto } from './license.dtos';
import { collectFingerprint } from './hwid.utils';
import { openLicense, issueLicense, nowIso } from './license.utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class LicenseService {
  private cachedFingerprint: any = null;

  constructor(private db: DbService, private loggerService: LoggerService, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // GET /license - Get current license status
  async getLicense(): Promise<generalResponse> {
    try {
      const license = await this.db.license.findUnique({ where: { id: 'main' } });
      const fingerprint = await this.getFingerprint();
      const machineCode = Buffer.from(fingerprint.hwid, 'hex').toString('base64url').slice(0, 16);

      // State 1: No license
      if (!license || !license.key || license.key === '') {
        return {
          status: true,
          data: {
            machineCode,
            hardwareId: fingerprint.hwid,
            state: 'no_license',
            license: null,
            valid: false,
            expired: false,
          },
          error: null,
          msg: null,
        };
      }

      // Try to decrypt and validate license
      try {
        const keys = await this.getKeys();
        if (!keys || !keys.public_key) {
          return {
            status: true,
            data: {
              machineCode,
              hardwareId: fingerprint.hwid,
              state: 'no_license',
              license: null,
              valid: false,
              expired: false,
              error: 'Public key not configured',
            },
            error: null,
            msg: null,
          };
        }

        const payload = await openLicense({
          licenseString: license.key,
          hwidHex: fingerprint.hwid,
          ed25519PublicKeyPem: keys.public_key,
        });

        // Extract features from payload - new structure only
        // lpr_count / recorder_count = max simultaneous ACTIVE (running) instances; creation is unlimited when lpr/recorder is enabled
        const features = payload.features && typeof payload.features === 'object' && !Array.isArray(payload.features) ? payload.features : {
          camera: 0,
          recorder: false,
          lpr: false,
          recorder_count: 0,
          lpr_count: 0,
        };

        // Current active (running) counts - for UI to show "X / Y active"
        const [activeLprCount, activeRecorderCount] = await Promise.all([
          this.db.camera_lpr_camera.count({ where: { isActive: true } }),
          this.db.camera_recorder_camera.count({ where: { isActive: true } }),
        ]);

        // Check expiry
        let isValid = false;
        let isExpired = false;
        let state = 'active';

        if (payload.expire) {
          const expDate = new Date(payload.expire);
          expDate.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          isExpired = expDate < today;
          isValid = !isExpired;
          state = isExpired ? 'expired' : 'active';
        } else {
          isValid = true; // No expiry means perpetual
          state = 'active';
        }

        return {
          status: true,
          data: {
            machineCode,
            hardwareId: fingerprint.hwid,
            state,
            license: {
              name: payload.name,
              org: payload.org,
              expire: payload.expire,
              features,
              usage: { activeLpr: activeLprCount, activeRecorder: activeRecorderCount },
              issuedAt: payload.issued_at,
            },
            valid: isValid,
            expired: isExpired,
          },
          error: null,
          msg: null,
        };
      } catch (error) {
        // License invalid or can't be decrypted
        return {
          status: true,
          data: {
            machineCode,
            hardwareId: fingerprint.hwid,
            state: 'no_license',
            license: null,
            valid: false,
            expired: false,
            error: error.message || 'Invalid license',
          },
          error: null,
          msg: null,
        };
      }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  // GET /license/code - Get challenge data for generating new license
  async getLicenseCode(): Promise<generalResponse> {
    try {
      const fingerprint = await this.getFingerprint();
      const machineCode = Buffer.from(fingerprint.hwid, 'hex').toString('base64url').slice(0, 16);

      const challenge = {
        product: process.env.PRODUCT || 'VMS Manager',
        collected_at: nowIso(),
        fingerprint: {
          machine_id: fingerprint.strong.machineId || fingerprint.strong.machineGuid || '',
          smbios_uuid: fingerprint.strong.smbiosUuid || '',
          disk_serial: fingerprint.strong.diskSerial || '',
          tpm_present: !!fingerprint.strong.tpmEk,
        },
        hwid: fingerprint.hwid,
        nonce: crypto.randomBytes(16).toString('hex'),
        meta: {
          os: fingerprint.platform,
          agent_version: '2.0.0',
          machine_code: machineCode,
        },
      };

      return {
        status: true,
        data: challenge,
        error: null,
        msg: null,
      };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  // POST /license - Verify and store license
  async verifyLicense(body: licensePostDto): Promise<generalResponse> {
    try {
      const fingerprint = await this.getFingerprint();
      const keys = await this.getKeys();

      if (!keys || !keys.public_key) {
        throw new Error('Public key not configured. Please configure keys first.');
      }

      // Verify and decrypt license
      const payload = await openLicense({
        licenseString: body.licenseKey,
        hwidHex: fingerprint.hwid,
        ed25519PublicKeyPem: keys.public_key,
      });

      // Check expiry
      if (payload.expire) {
        const expDate = new Date(payload.expire);
        expDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expDate < today) {
          throw new Error('License has expired');
        }
      }

      // Store license
      await this.db.license.upsert({
        where: { id: 'main' },
        create: {
          id: 'main',
          key: body.licenseKey,
          license: JSON.stringify(payload),
        },
        update: {
          key: body.licenseKey,
          license: JSON.stringify(payload),
        },
      });

      // Clear license cache
      await this.cacheManager.del('license_payload');

      this.loggerService.log('License activated', 0, null, undefined, undefined, null);

      // Extract features for response - new structure only (lpr_count/recorder_count = max simultaneous active)
      const features = payload.features && typeof payload.features === 'object' && !Array.isArray(payload.features) ? payload.features : {
        camera: 0,
        recorder: false,
        lpr: false,
        recorder_count: 0,
        lpr_count: 0,
      };

      const [activeLprCount, activeRecorderCount] = await Promise.all([
        this.db.camera_lpr_camera.count({ where: { isActive: true } }),
        this.db.camera_recorder_camera.count({ where: { status: 'RUNNING' } }),
      ]);

      return {
        status: true,
        data: {
          valid: true,
          payload: {
            name: payload.name,
            org: payload.org,
            expire: payload.expire,
            features: features,
            usage: { activeLpr: activeLprCount, activeRecorder: activeRecorderCount },
          },
        },
        error: null,
        msg: null,
      };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error.message || error, msg: error.message }, 406);
    }
  }

  // DELETE /license - Delete/clear license
  async deleteLicense(): Promise<generalResponse> {
    try {
      await this.db.license.update({
        where: { id: 'main' },
        data: {
          key: '',
          license: '',
        },
      });

      // Clear license cache
      await this.cacheManager.del('license_payload');

      this.loggerService.log('License deleted', 0, null, undefined, undefined, null);

      return {
        status: true,
        data: { deleted: true },
        error: null,
        msg: null,
      };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error.message || error, msg: error.message }, 406);
    }
  }

  // POST /license/generate - Generate new license (backend only, Swagger)
  // async generateLicense(body: licenseGenerateDto): Promise<generalResponse> {
  //   try {
  //     const challenge = body.challenge;
  //     if (!challenge || !challenge.hwid) {
  //       throw new Error('Invalid challenge data');
  //     }

  //     // Get or use provided keys
  //     let publicKey: string;
  //     let privateKey: string;

  //     if (body.publicKey && body.privateKey) {
  //       publicKey = body.publicKey;
  //       privateKey = body.privateKey;
  //     } else {
  //       const keys = await this.getKeys();
  //       if (!keys || !keys.public_key || !keys.private_key) {
  //         throw new Error('Keys not configured. Please provide keys or configure them in database.');
  //       }
  //       publicKey = keys.public_key;
  //       privateKey = keys.private_key;
  //     }

  //     // Build payload features object
  //     const features = {
  //       camera: body.camera || 0,
  //       recorder: body.recorder || false,
  //       lpr: body.lpr || false,
  //       recorder_count: body.recorder_count || 0,
  //       lpr_count: body.lpr_count || 0,
  //     };

  //     const payload = {
  //       name: body.name || '',
  //       org: body.org || '',
  //       expire: body.expire || null,
  //       features: features,
  //       issued_at: nowIso(),
  //       fingerprint: {
  //         hwid: challenge.hwid,
  //         strong: challenge.fingerprint,
  //       },
  //     };

  //     // Generate license
  //     const licenseKey = issueLicense({
  //       payloadJson: payload,
  //       hwidHex: challenge.hwid,
  //       ed25519PrivateKeyPem: privateKey,
  //     });

  //     return {
  //       status: true,
  //       data: {
  //         licenseKey,
  //         payload,
  //       },
  //       error: null,
  //       msg: null,
  //     };
  //   } catch (error) {
  //     throw new HttpException({ status: false, data: null, error: error.message || error, msg: error.message }, 406);
  //   }
  // }

  // Helper methods
  private async getFingerprint() {
    if (!this.cachedFingerprint) {
      this.cachedFingerprint = collectFingerprint();
    }
    return this.cachedFingerprint;
  }

  private async getKeys() {
    return await this.db.license_keys.findUnique({ where: { id: 'main' } });
  }

  private async getCachedLicensePayload(): Promise<any | null> {
    const cacheKey = 'license_payload';
    let payload = await this.cacheManager.get(cacheKey) as any;

    if (!payload) {
      const license = await this.db.license.findUnique({ where: { id: 'main' } });
      if (!license || !license.key || license.key === '') {
        return null;
      }

      try {
        const fingerprint = await this.getFingerprint();
        const keys = await this.getKeys();
        if (!keys || !keys.public_key) return null;

        payload = await openLicense({
          licenseString: license.key,
          hwidHex: fingerprint.hwid,
          ed25519PublicKeyPem: keys.public_key,
        });

        // Cache for 5 minutes (300000 ms)
        await this.cacheManager.set(cacheKey, payload, 300000);
      } catch {
        return null;
      }
    }

    return payload;
  }

  // License validation methods (used by other services)
  async can_add_new_camera(): Promise<boolean> {
    const license = await this.db.license.findUnique({ where: { id: 'main' } });
    if (!license || !license.key || license.key === '') {
      // Free tier: allow up to 5 cameras
      const total_cameras = await this.db.camera.count({ where: { deleted: false } });
      return total_cameras < 5;
    }

    try {
      const payload = await this.getCachedLicensePayload();
      if (!payload) return false;

      // Check expiry
      if (payload.expire) {
        const expDate = new Date(payload.expire);
        expDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expDate < today) return false;
      }

      // Check camera limit - new structure only
      const total_cameras = await this.db.camera.count({ where: { deleted: false } });
      const camLimit = (payload.features && typeof payload.features === 'object' && !Array.isArray(payload.features)) ? (payload.features.camera || 0) : 0;
      return total_cameras < camLimit;
    } catch {
      return false;
    }
  }

  /**
   * Whether one more LPR can be started (active/running).
   * Limit is on simultaneous active LPRs only; users can create any number of LPR configs when lpr is enabled.
   * Used at LPR start time, not at creation time.
   * @param excludeLprId When restarting an existing LPR, pass its id so it is excluded from the count (avoids license limit error after process restart).
   */
  async can_add_new_lpr(excludeLprId?: string): Promise<boolean> {
    const license = await this.db.license.findUnique({ where: { id: 'main' } });
    if (!license || !license.key || license.key === '') {
      return false; // No free tier for LPR
    }

    try {
      const payload = await this.getCachedLicensePayload();
      if (!payload) return false;

      // Check expiry
      if (payload.expire) {
        const expDate = new Date(payload.expire);
        expDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expDate < today) return false;
      }

      // Check LPR enabled and active-count limit only (creation is unlimited)
      if (!payload.features || typeof payload.features !== 'object' || Array.isArray(payload.features)) {
        return false;
      }

      const lprEnabled = payload.features.lpr === true;
      if (!lprEnabled) return false;

      const lprCountLimit = payload.features.lpr_count || 0;
      const where: { isActive: true; id?: { not: string } } = { isActive: true };
      if (excludeLprId) {
        where.id = { not: excludeLprId };
      }
      const active_lprs = await this.db.camera_lpr_camera.count({ where });
      return active_lprs < lprCountLimit;
    } catch {
      return false;
    }
  }

  async can_add_new_recorder_service(): Promise<boolean> {
    const license = await this.db.license.findUnique({ where: { id: 'main' } });
    if (!license || !license.key || license.key === '') {
      return false; // No free tier for recorder service
    }

    try {
      const payload = await this.getCachedLicensePayload();
      if (!payload) return false;

      // Check expiry
      if (payload.expire) {
        const expDate = new Date(payload.expire);
        expDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expDate < today) return false;
      }

      // Check recorder service enabled - new structure only
      if (!payload.features || typeof payload.features !== 'object' || Array.isArray(payload.features)) {
        return false;
      }

      return payload.features.recorder === true;
    } catch {
      return false;
    }
  }

  /**
   * Whether one more recorder can be started (active/running).
   * Limit is on simultaneous active recorders only; users can create any number of recorder configs when recorder is enabled.
   * Used at recorder start time, not at creation time.
   * @param excludeRecorderId When restarting an existing recorder, pass its id so it is excluded from the count (avoids license limit error after process restart).
   */
  async can_add_new_active_recorder(excludeRecorderId?: string): Promise<boolean> {
    const license = await this.db.license.findUnique({ where: { id: 'main' } });
    if (!license || !license.key || license.key === '') {
      return false; // No free tier for recorder
    }

    try {
      const payload = await this.getCachedLicensePayload();
      if (!payload) return false;

      // Check expiry
      if (payload.expire) {
        const expDate = new Date(payload.expire);
        expDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expDate < today) return false;
      }

      // Check recorder enabled and active-count limit only (creation is unlimited)
      if (!payload.features || typeof payload.features !== 'object' || Array.isArray(payload.features)) {
        return false;
      }

      const recorderEnabled = payload.features.recorder === true;
      if (!recorderEnabled) return false;

      const recorderCountLimit = payload.features.recorder_count || 0;
      const where: { isActive: true; id?: { not: string } } = { isActive: true };
      if (excludeRecorderId) {
        where.id = { not: excludeRecorderId };
      }
      const active_recorders = await this.db.camera_recorder_camera.count({ where });
      return active_recorders < recorderCountLimit;
    } catch {
      return false;
    }
  }

  async can_add_new_lpr_service(): Promise<boolean> {
    const license = await this.db.license.findUnique({ where: { id: 'main' } });
    if (!license || !license.key || license.key === '') {
      return false; // No free tier for LPR service
    }

    try {
      const payload = await this.getCachedLicensePayload();
      if (!payload) return false;

      // Check expiry
      if (payload.expire) {
        const expDate = new Date(payload.expire);
        expDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expDate < today) return false;
      }

      // Check LPR service enabled - new structure only
      if (!payload.features || typeof payload.features !== 'object' || Array.isArray(payload.features)) {
        return false;
      }

      return payload.features.lpr === true;
    } catch {
      return false;
    }
  }

  async is_not_expired(): Promise<boolean> {
    try {
      const license = await this.db.license.findUnique({ where: { id: 'main' } });
      if (!license || !license.key || license.key === '') {
        return false;
      }

      const payload = await this.getCachedLicensePayload();
      if (!payload) return false;

      // Check expiry
      if (payload.expire) {
        const expDate = new Date(payload.expire);
        expDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return expDate >= today;
      }

      return true; // No expiry means perpetual
    } catch {
      return false;
    }
  }
}
