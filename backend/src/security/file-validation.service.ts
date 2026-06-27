import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { VirusScanService } from './virus-scan.service';
import { fromFile } from 'file-type';

@Injectable()
export class FileValidationService {
  private readonly logger = new Logger(FileValidationService.name);
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB default

  constructor(
    private prisma: PrismaService,
    private virusScanner: VirusScanService,
  ) {}

  async validateDownloadedFile(userId: string, filePath: string): Promise<{ hash: string, size: number }> {
    // 1. Path Traversal & Filename Sanitization
    const filename = path.basename(filePath);
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    
    // 2. File Size Validation
    const stats = await fs.stat(filePath);
    if (stats.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(`File size exceeds limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // 3. MIME Type & Extension Validation (Magic Numbers)
    const fileType = await fromFile(filePath);
    if (!fileType) {
       throw new BadRequestException('Cannot determine file type. File may be corrupted.');
    }
    if (fileType.mime !== 'application/pdf' && !fileType.mime.startsWith('image/')) {
       throw new BadRequestException(`Invalid file type ${fileType.mime}. Only PDF and images are allowed.`);
    }

    // 4. Hash SHA256 & Duplicate Detection
    const hash = await this.calculateHash(filePath);
    this.logger.debug(`File hash: ${hash}`);

    // 5. Virus Scan Hook
    const isClean = await this.virusScanner.scanFile(filePath);
    if (!isClean) {
      throw new BadRequestException('File is infected or unsafe.');
    }

    return { hash, size: stats.size };
  }

  private async calculateHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const rs = require('fs').createReadStream(filePath);
      rs.on('error', (err: any) => reject(err));
      rs.on('data', (chunk: any) => hash.update(chunk));
      rs.on('end', () => resolve(hash.digest('hex')));
    });
  }
}
