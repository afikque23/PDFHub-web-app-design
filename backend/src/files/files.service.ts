import { Injectable, ConflictException, BadRequestException, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { FileStatus } from '@prisma/client';
import * as FileType from 'file-type';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  // Allowed mime types mapping to extensions
  private readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/jpg',
  ];

  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async upload(userId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    if (file.size > 100 * 1024 * 1024) throw new BadRequestException('File exceeds 100MB limit');

    // Re-validate mime type using file-type package
    const fileTypeResult = await FileType.fromBuffer(file.buffer);
    const mimeType = fileTypeResult?.mime || file.mimetype;
    
    if (!this.ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new BadRequestException('Invalid file type');
    }

    // Calculate Hash
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Duplicate Check
    const existingFile = await this.prisma.file.findUnique({
      where: {
        userId_hash: {
          userId,
          hash,
        },
      },
    });

    if (existingFile) {
      throw new ConflictException('File sudah pernah diupload');
    }

    // Generate storage name & path
    const extension = file.originalname.split('.').pop() || '';
    const storedName = `${uuidv4()}.${extension}`;
    const storagePath = `${userId}/${storedName}`;

    // Create DB Entry (Status: UPLOADING)
    const dbFile = await this.prisma.file.create({
      data: {
        userId,
        originalName: file.originalname,
        storedName,
        mimeType,
        extension,
        size: file.size,
        bucket: 'pdfhub-files',
        storagePath,
        status: FileStatus.UPLOADING,
        hash,
      },
    });

    try {
      // Upload to Supabase
      const uploadedPath = await this.supabase.uploadFile(storagePath, file.buffer, mimeType);
      
      if (!uploadedPath) throw new Error('Upload failed without throwing an error');

      // Extract basic metadata (mock calculation for images/pdf)
      // Real width/height parsing would require image-size package, pdf-parse for pages.
      // We will leave them null for now, or just extract them if needed.

      return await this.prisma.file.update({
        where: { id: dbFile.id },
        data: { status: FileStatus.UPLOADED },
      });
    } catch (error) {
      // If supabase upload fails, set status to FAILED
      await this.prisma.file.update({
        where: { id: dbFile.id },
        data: { status: FileStatus.FAILED },
      });
      throw new InternalServerErrorException('Gagal mengunggah file ke Storage');
    }
  }

  async findUserFiles(userId: string) {
    return this.prisma.file.findMany({
      where: { userId, status: { not: FileStatus.DELETED } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.file.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file || file.status === FileStatus.DELETED) {
      throw new NotFoundException('File tidak ditemukan');
    }

    return file;
  }

  async getDownloadUrl(id: string, userId: string, isAdmin: boolean) {
    const file = await this.findById(id);
    
    if (!isAdmin && file.userId !== userId) {
      throw new NotFoundException('File tidak ditemukan');
    }

    return this.supabase.createSignedUrl(file.storagePath, 300); // 5 minutes
  }

  async delete(id: string, userId: string, isAdmin: boolean) {
    const file = await this.findById(id);

    if (!isAdmin && file.userId !== userId) {
      throw new NotFoundException('File tidak ditemukan');
    }

    // Attempt to delete from Supabase
    try {
      await this.supabase.deleteFile(file.storagePath);
    } catch (e) {
      this.logger.error(`Storage deletion failed for ${file.storagePath}`, e);
      // We proceed to soft delete even if storage deletion fails
    }

    // Soft delete in DB
    return this.prisma.file.update({
      where: { id },
      data: { status: FileStatus.DELETED },
    });
  }

  async restore(id: string, userId: string, isAdmin: boolean) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File tidak ditemukan');

    if (!isAdmin && file.userId !== userId) {
      throw new NotFoundException('File tidak ditemukan');
    }

    return this.prisma.file.update({
      where: { id },
      data: { status: FileStatus.UPLOADED },
    });
  }

  async updateStatus(id: string, status: FileStatus) {
    return this.prisma.file.update({
      where: { id },
      data: { status },
    });
  }
}
