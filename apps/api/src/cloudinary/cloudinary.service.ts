import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface UploadResult {
  publicId: string;
  url: string;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly configured: boolean;

  constructor(config: ConfigService) {
    const cloudName = config.get<string>('cloudinary.cloudName');
    const apiKey = config.get<string>('cloudinary.apiKey');
    const apiSecret = config.get<string>('cloudinary.apiSecret');

    this.configured = Boolean(cloudName && apiKey && apiSecret);

    if (this.configured) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    } else {
      this.logger.warn('Cloudinary credentials not set — image uploads will be unavailable');
    }
  }

  uploadImage(buffer: Buffer, folder = 'vendorconnect/portfolio'): Promise<UploadResult> {
    if (!this.configured) {
      throw new ServiceUnavailableException('Image uploads are not configured on this server');
    }

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
        (error, result) => {
          if (error ?? !result) {
            return reject(error instanceof Error ? error : new Error('Cloudinary upload failed'));
          }
          resolve({ publicId: result.public_id, url: result.secure_url });
        },
      );
      stream.end(buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!this.configured) return;
    await cloudinary.uploader.destroy(publicId);
  }
}
