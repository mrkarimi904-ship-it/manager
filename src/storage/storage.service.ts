import { Injectable, OnModuleInit } from '@nestjs/common';
import * as MinIO from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private minioClient: MinIO.Client | null = null;
  private isEnabled = false;
  private bucketName: string = '';

  async onModuleInit() {
    this.initializeMinIO();
  }

  private initializeMinIO() {
    const minioEnable = process.env.MINIO_ENABLE;
    const minioUrl = process.env.MINIO_URL;
    const minioBucket = process.env.MINIO_BUCKET;
    const minioAccess = process.env.MINIO_ACCESS;
    const minioSecret = process.env.MINIO_SECRET;

    // Check if all required environment variables are available
    if (minioEnable === 'true' && minioUrl && minioBucket && minioSecret) {
      try {
        // Parse MinIO URL (format: http://host:port or https://host:port)
        const url = new URL(minioUrl);
        const host = url.hostname;
        const port = parseInt(url.port) || (url.protocol === 'https:' ? 443 : 9000);
        const useSSL = url.protocol === 'https:';

        // Use access key from env or default to secret (some MinIO setups use same for both)
        const accessKey = minioAccess;
        const secretKey = minioSecret;

        this.minioClient = new MinIO.Client({
          endPoint: host,
          port: port,
          useSSL: useSSL,
          accessKey: accessKey,
          secretKey: secretKey,
        });

        this.bucketName = minioBucket;
        this.isEnabled = true;

        // Ensure bucket exists
        this.ensureBucketExists().catch(err => {
          console.error('Failed to ensure MinIO bucket exists:', err);
          this.isEnabled = false;
        });

        console.log(`MinIO storage enabled: ${minioUrl}/${minioBucket}`);
      } catch (error) {
        console.error('MinIO initialization failed:', error.message);
        this.isEnabled = false;
      }
    } else {
      console.log('MinIO storage disabled - environment variables not configured');
      this.isEnabled = false;
    }
  }

  private async ensureBucketExists(): Promise<void> {
    if (!this.minioClient || !this.isEnabled) return;

    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      console.log(`Created MinIO bucket: ${this.bucketName}`);
    }
  }

  isMinIOEnabled(): boolean {
    return this.isEnabled && this.minioClient !== null;
  }

  async checkHealth(): Promise<{ ok: boolean; enabled: boolean; bucket: string | null; message?: string }> {
    if (!this.isMinIOEnabled() || !this.minioClient) {
      return { ok: true, enabled: false, bucket: null, message: 'MinIO not configured' };
    }
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      return {
        ok: exists,
        enabled: true,
        bucket: this.bucketName,
        message: exists ? 'Bucket reachable' : 'Bucket not found',
      };
    } catch (error) {
      return {
        ok: false,
        enabled: true,
        bucket: this.bucketName,
        message: error?.message || 'MinIO unreachable',
      };
    }
  }

  /**
   * Upload a base64 image to MinIO
   * @param base64Image Base64 encoded image string
   * @param objectPath Path in MinIO (e.g., 'lpr_id/1.jpg')
   * @returns Promise<string> URL or path to the uploaded object
   */
  async uploadImage(base64Image: string, objectPath: string): Promise<string> {
    if (!this.isMinIOEnabled() || !this.minioClient) {
      throw new Error('MinIO is not enabled or client is not initialized');
    }

    try {
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(base64Image, 'base64');

      // Upload to MinIO
      await this.minioClient.putObject(this.bucketName, objectPath, imageBuffer, imageBuffer.length, {
        'Content-Type': 'image/jpeg',
      });

      // Return the path (you can also return full URL if needed)
      return objectPath;
    } catch (error) {
      console.error(`Failed to upload image to MinIO: ${objectPath}`, error);
      throw error;
    }
  }

  /**
   * Upload multiple images for an LPR result
   * @param lprId LPR result ID
   * @param images Object with image fields (plateimage, vehicleimage, frame, generatedplateimage)
   * @returns Object with MinIO paths instead of base64 data
   */
  async uploadLprImages(lprId: string, images: {
    plateimage?: string;
    vehicleimage?: string;
    frame?: string;
    generatedplateimage?: string;
  }): Promise<{
    plateimage?: string;
    vehicleimage?: string;
    frame?: string;
    generatedplateimage?: string;
  }> {
    const result: any = {};
    const imageMapping = [
      { key: 'plateimage', filename: '1.jpg' },
      { key: 'vehicleimage', filename: '2.jpg' },
      { key: 'frame', filename: '3.jpg' },
      { key: 'generatedplateimage', filename: '4.jpg' },
    ];

    for (const mapping of imageMapping) {
      const imageData = images[mapping.key as keyof typeof images];
      if (imageData) {
        const objectPath = `${lprId}/${mapping.filename}`;
        try {
          await this.uploadImage(imageData, objectPath);
          result[mapping.key] = objectPath; // Store path instead of base64
        } catch (error) {
          console.error(`Failed to upload ${mapping.key} for LPR ${lprId}:`, error);
          // Fallback to storing base64 if MinIO upload fails
          result[mapping.key] = imageData;
        }
      }
    }

    return result;
  }

  /**
   * Get image URL from MinIO path
   * @param objectPath Path in MinIO
   * @param expiry Expiry time in seconds (default: 7 days)
   * @returns Presigned URL
   */
  async getImageUrl(objectPath: string, expiry: number = 604800): Promise<string> {
    if (!this.isMinIOEnabled() || !this.minioClient) {
      throw new Error('MinIO is not enabled or client is not initialized');
    }

    try {
      return await this.minioClient.presignedGetObject(this.bucketName, objectPath, expiry);
    } catch (error) {
      console.error(`Failed to generate presigned URL for ${objectPath}:`, error);
      throw error;
    }
  }

  /**
   * Delete images for an LPR result
   * @param lprId LPR result ID
   */
  async deleteLprImages(lprId: string): Promise<void> {
    if (!this.isMinIOEnabled() || !this.minioClient) return;

    const objects = [
      `${lprId}/1.jpg`,
      `${lprId}/2.jpg`,
      `${lprId}/3.jpg`,
      `${lprId}/4.jpg`,
    ];

    try {
      await this.minioClient.removeObjects(this.bucketName, objects);
    } catch (error) {
      console.error(`Failed to delete images for LPR ${lprId}:`, error);
    }
  }

  /**
   * Download image from MinIO and convert to base64
   * @param objectPath Path in MinIO (e.g., 'lpr_id/1.jpg')
   * @returns Base64 encoded image string or null if not found
   */
  async getImageAsBase64(objectPath: string): Promise<string | null> {
    if (!this.isMinIOEnabled() || !this.minioClient) {
      return null;
    }

    try {
      const dataStream = await this.minioClient.getObject(this.bucketName, objectPath);
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        dataStream.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        dataStream.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const base64 = buffer.toString('base64');
          resolve(base64);
        });
        dataStream.on('error', (err) => {
          console.error(`Failed to download image from MinIO: ${objectPath}`, err);
          resolve(null);
        });
      });
    } catch (error) {
      console.error(`Failed to get image from MinIO: ${objectPath}`, error);
      return null;
    }
  }

  /**
   * Check if a string is a MinIO path (contains '/' and ends with '.jpg')
   * @param value String to check
   * @returns true if it looks like a MinIO path
   */
  isMinIOPath(value: string | null | undefined): boolean {
    if (!value || typeof value !== 'string') return false;
    // MinIO paths are like "lpr_id/1.jpg", base64 strings are much longer and don't contain '/'
    return value.includes('/') && (value.endsWith('.jpg') || value.endsWith('.jpeg') || value.endsWith('.png'));
  }

  /**
   * Convert LPR image data from MinIO paths to base64
   * @param lprId LPR result ID
   * @param images Object with image fields (may contain paths, null, or base64)
   * @returns Object with base64 images
   */
  async convertLprImagesToBase64(lprId: string, images: {
    plateimage?: string | null;
    vehicleimage?: string | null;
    frame?: string | null;
    generatedplateimage?: string | null;
  }): Promise<{
    plateimage?: string | null;
    vehicleimage?: string | null;
    frame?: string | null;
    generatedplateimage?: string | null;
  }> {
    const result: any = {};
    const imageMapping = [
      { key: 'plateimage', filename: '1.jpg' },
      { key: 'vehicleimage', filename: '2.jpg' },
      { key: 'frame', filename: '3.jpg' },
      { key: 'generatedplateimage', filename: '4.jpg' },
    ];

    for (const mapping of imageMapping) {
      const imageData = images[mapping.key as keyof typeof images];
      if (imageData) {
        // Check if it's a MinIO path or already base64
        if (this.isMinIOPath(imageData)) {
          // It's a MinIO path, download and convert to base64
          const base64 = await this.getImageAsBase64(imageData);
          result[mapping.key] = base64 || imageData; // Fallback to original if download fails
        } else {
          // It's already base64, use as-is
          result[mapping.key] = imageData;
        }
      } else {
        // Image is null/empty - try to read from MinIO using standard path
        const objectPath = `${lprId}/${mapping.filename}`;
        const base64 = await this.getImageAsBase64(objectPath);
        result[mapping.key] = base64; // Will be null if not found in MinIO
      }
    }

    return result;
  }
}

