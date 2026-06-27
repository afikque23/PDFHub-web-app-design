import { Injectable, Logger } from '@nestjs/common';
import { ProcessingService } from '../shared/processing.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { JobStatus } from '@prisma/client';
import { CompressDto, CompressionLevel } from './dto/compress.dto';

const execAsync = promisify(exec);

@Injectable()
export class CompressService {
  private readonly logger = new Logger(CompressService.name);

  constructor(private readonly processingService: ProcessingService) {}

  async startCompressJob(userId: string, dto: CompressDto) {
    const job = await this.processingService.createJob(userId, 'COMPRESS', [dto.inputFileId]);
    
    this.processCompress(job.id, userId, dto).catch((err) => {
      this.logger.error(`Compress Job ${job.id} failed`, err);
    });

    return job;
  }

  async processCompress(jobId: string, userId: string, dto: CompressDto) {
    const jobDir = this.processingService.getOutputDir(jobId);
    await fs.mkdir(jobDir, { recursive: true });
    try {
      this.logger.log(`[Job ${jobId}] Proses mulai`);
      await this.processingService.updateJobStatus(jobId, JobStatus.PROCESSING);
      await this.processingService.updateJobProgress(jobId, 10);

      const localPaths = await this.processingService.downloadInputsToTemp(jobId, [dto.inputFileId], userId);
      await this.processingService.updateJobProgress(jobId, 40);

      const inputPath = localPaths[0];
      const outputPath = path.join(jobDir, `compressed_${Date.now()}.pdf`);

      let pdfSettings = '/ebook'; // Medium
      if (dto.compressionLevel === CompressionLevel.LOW) pdfSettings = '/prepress';
      if (dto.compressionLevel === CompressionLevel.HIGH) pdfSettings = '/screen';

      // Use 'gswin64c' or 'gswin32c' on Windows, or 'gs' on Linux/Mac
      // We assume 'gs' is aliased or we try 'gswin64c' if 'gs' fails.
      // But for a generic approach, we'll try 'gs' first.
      const gsCommand = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${pdfSettings} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;
      
      try {
        await execAsync(gsCommand);
      } catch (e) {
        // Fallback for windows if gs is not in path but gswin64c is
        try {
          await execAsync(`gswin64c -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${pdfSettings} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`);
        } catch (e2) {
          throw new Error('Ghostscript command failed. Please ensure Ghostscript is installed and added to PATH.');
        }
      }

      await this.processingService.updateJobProgress(jobId, 80);

      const outputBuffer = await fs.readFile(outputPath);

      await this.processingService.uploadOutputAndLink(
        jobId,
        userId,
        outputBuffer,
        `compressed_${Date.now()}.pdf`,
        'application/pdf',
        'pdf'
      );

      await this.processingService.updateJobProgress(jobId, 100);
      await this.processingService.updateJobStatus(jobId, JobStatus.COMPLETED);
      this.logger.log(`[Job ${jobId}] Proses selesai`);
    } catch (error: any) {
      this.logger.error(`Error in Compress Job ${jobId}: ${error.message}`);
      await this.processingService.updateJobStatus(jobId, JobStatus.FAILED, error.message);
    } finally {
      await this.processingService.cleanupJobDir(jobId);
    }
  }
}
