import { Injectable, Logger } from '@nestjs/common';
import { ProcessingService } from '../shared/processing.service';
import { PDFDocument, degrees } from 'pdf-lib';
import * as fs from 'fs/promises';
import { JobStatus } from '@prisma/client';
import { RotateDto } from './dto/rotate.dto';

@Injectable()
export class RotateService {
  private readonly logger = new Logger(RotateService.name);

  constructor(private readonly processingService: ProcessingService) {}

  async startRotateJob(userId: string, dto: RotateDto) {
    const job = await this.processingService.createJob(userId, 'ROTATE', [dto.inputFileId]);
    
    this.processRotate(job.id, userId, dto).catch((err) => {
      this.logger.error(`Rotate Job ${job.id} failed`, err);
    });

    return job;
  }

  async processRotate(jobId: string, userId: string, dto: RotateDto) {
    try {
      this.logger.log(`[Job ${jobId}] Proses mulai`);
      await this.processingService.updateJobStatus(jobId, JobStatus.PROCESSING);
      await this.processingService.updateJobProgress(jobId, 10);

      const localPaths = await this.processingService.downloadInputsToTemp(jobId, [dto.inputFileId], userId);
      await this.processingService.updateJobProgress(jobId, 40);

      const pdfBytes = await fs.readFile(localPaths[0]);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      const targetPages = dto.pages ? dto.pages.map(p => p - 1) : pages.map((_, i) => i);
      
      for (const idx of targetPages) {
        if (idx >= 0 && idx < pages.length) {
          const page = pages[idx];
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + dto.angle));
        }
      }

      await this.processingService.updateJobProgress(jobId, 80);

      const outputBytes = await pdfDoc.save();
      const outputBuffer = Buffer.from(outputBytes);

      await this.processingService.uploadOutputAndLink(
        jobId,
        userId,
        outputBuffer,
        `rotated_${Date.now()}.pdf`,
        'application/pdf',
        'pdf'
      );

      await this.processingService.updateJobProgress(jobId, 100);
      await this.processingService.updateJobStatus(jobId, JobStatus.COMPLETED);
      this.logger.log(`[Job ${jobId}] Proses selesai`);
    } catch (error: any) {
      this.logger.error(`Error in Rotate Job ${jobId}: ${error.message}`);
      await this.processingService.updateJobStatus(jobId, JobStatus.FAILED, error.message);
    } finally {
      await this.processingService.cleanupJobDir(jobId);
    }
  }
}
