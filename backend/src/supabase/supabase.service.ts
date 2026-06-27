import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;
  private readonly bucketName = 'pdfhub-files'; // Updated bucket name for files

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn('Supabase credentials not fully configured in .env');
    }

    this.supabase = createClient(
      supabaseUrl || 'http://localhost',
      supabaseKey || 'dummy_key',
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async uploadFile(path: string, fileBuffer: Buffer, mimetype: string, bucket: string = this.bucketName): Promise<string | null> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType: mimetype,
        upsert: true,
      });

    if (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw error;
    }

    return data.path;
  }

  async deleteFile(path: string, bucket: string = this.bucketName): Promise<boolean> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw error;
    }
    return true;
  }

  async createSignedUrl(path: string, expiresIn: number = 300, bucket: string = this.bucketName): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error || !data) {
      this.logger.error(`Error creating signed URL: ${error?.message}`);
      throw error || new Error('Failed to create signed URL');
    }

    return data.signedUrl;
  }

  async download(path: string, bucket: string = this.bucketName): Promise<Blob | null> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .download(path);

    if (error) {
      this.logger.error(`Error downloading file: ${error.message}`);
      throw error;
    }
    return data;
  }

  async exists(path: string, bucket: string = this.bucketName): Promise<boolean> {
    const folderPath = path.substring(0, path.lastIndexOf('/')) || '';
    const fileName = path.substring(path.lastIndexOf('/') + 1);
    
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .list(folderPath, {
        search: fileName,
      });

    if (error || !data) return false;
    return data.some(file => file.name === fileName);
  }

  async getMetadata(path: string, bucket: string = this.bucketName): Promise<any> {
    const folderPath = path.substring(0, path.lastIndexOf('/')) || '';
    const fileName = path.substring(path.lastIndexOf('/') + 1);
    
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .list(folderPath, {
        search: fileName,
      });

    if (error || !data) {
      this.logger.error(`Error getting metadata: ${error?.message}`);
      throw error || new Error('File not found');
    }
    
    const fileMetadata = data.find(file => file.name === fileName);
    if (!fileMetadata) throw new Error('File not found');
    
    return fileMetadata;
  }

  async deleteExpiredFiles(folderPath: string, maxAgeInSeconds: number): Promise<void> {
    const { data: files, error: listError } = await this.supabase.storage
      .from(this.bucketName)
      .list(folderPath);

    if (listError) {
      this.logger.error(`Error listing files: ${listError.message}`);
      return;
    }

    const now = new Date().getTime();
    const pathsToDelete = files
      .filter((file) => {
        const fileDate = new Date(file.created_at || 0).getTime();
        return (now - fileDate) / 1000 > maxAgeInSeconds;
      })
      .map((file) => `${folderPath}/${file.name}`);

    if (pathsToDelete.length > 0) {
      const { error: deleteError } = await this.supabase.storage
        .from(this.bucketName)
        .remove(pathsToDelete);

      if (deleteError) {
        this.logger.error(`Error deleting expired files: ${deleteError.message}`);
      } else {
        this.logger.log(`Deleted ${pathsToDelete.length} expired files`);
      }
    }
  }
}
