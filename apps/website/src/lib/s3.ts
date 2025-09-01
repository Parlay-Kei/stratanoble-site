import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from './logger';

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'strata-noble-documents';

class S3Service {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      region: AWS_REGION,
      credentials: AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      } : undefined,
    });
    this.bucket = S3_BUCKET_NAME;
  }

  async uploadDocument(
    key: string,
    buffer: Buffer,
    contentType: string = 'application/pdf'
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
        Metadata: {
          uploadedAt: new Date().toISOString(),
          service: 'strata-noble'
        }
      });

      await this.client.send(command);
      
      const url = `https://${this.bucket}.s3.${AWS_REGION}.amazonaws.com/${key}`;
      
      logger.info('Document uploaded to S3', { key, url });
      return url;
    } catch (error) {
      logger.error('Failed to upload document to S3', error instanceof Error ? error : new Error(String(error)), { key });
      throw new Error('Failed to upload document');
    }
  }

  async getDocument(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);
      
      if (!response.Body) {
        throw new Error('Document not found');
      }

      const chunks: Uint8Array[] = [];
      // @ts-ignore - AWS SDK types issue
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      logger.error('Failed to get document from S3', error instanceof Error ? error : new Error(String(error)), { key });
      throw new Error('Failed to retrieve document');
    }
  }

  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.client, command, {
        expiresIn,
      });

      logger.info('Generated signed download URL', { key, expiresIn });
      return signedUrl;
    } catch (error) {
      logger.error('Failed to generate signed URL', error instanceof Error ? error : new Error(String(error)), { key });
      throw new Error('Failed to generate download link');
    }
  }

  async deleteDocument(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      
      logger.info('Document deleted from S3', { key });
    } catch (error) {
      logger.error('Failed to delete document from S3', error instanceof Error ? error : new Error(String(error)), { key });
      throw new Error('Failed to delete document');
    }
  }

  generateDocumentKey(type: 'nda' | 'template' | 'signed', clientEmail: string, suffix?: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const emailHash = clientEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const suffixPart = suffix ? `_${suffix}` : '';
    
    return `documents/${type}/${timestamp}/${emailHash}${suffixPart}.pdf`;
  }
}

export const s3Service = new S3Service();
