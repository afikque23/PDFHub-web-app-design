import { Injectable, Logger } from '@nestjs/common';
import { ProcessingService } from '../shared/processing.service';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs/promises';
import { JobStatus } from '@prisma/client';

@Injectable()
export class MergeService {
  private readonly logger = new Logger(MergeService.name);

  constructor(private readonly processingService: ProcessingService) {}

  async startMergeJob(userId: string, inputFileIds: string[]) {
    const job = await this.processingService.createJob(userId, 'MERGE', inputFileIds);
    
    // Start background processing
    this.processMerge(job.id, userId, inputFileIds).catch((err) => {
      this.logger.error(`Merge Job ${job.id} failed`, err);
    });

    return job;
  }

  async processMerge(jobId: string, userId: string, inputFileIds: string[]) {
    try {
      this.logger.log(`[Job ${jobId}] Proses mulai`);
      await this.processingService.updateJobStatus(jobId, JobStatus.PROCESSING);
      await this.processingService.updateJobProgress(jobId, 10);

      // 1. Download
      const localPaths = await this.processingService.downloadInputsToTemp(jobId, inputFileIds, userId);
      await this.processingService.updateJobProgress(jobId, 40);

      // 2. Merge logic
      const mergedPdf = await PDFDocument.create();
      
      for (let i = 0; i < localPaths.length; i++) {
        const path = localPaths[i];
        const pdfBytes = await fs.readFile(path);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        
        // Update progress incrementally
        const progress = 40 + Math.floor(((i + 1) / localPaths.length) * 40);
        await this.processingService.updateJobProgress(jobId, progress);
      }

      const mergedPdfBytes = await mergedPdf.save();
      const outputBuffer = Buffer.from(mergedPdfBytes);

      // 3. Upload Output
      await this.processingService.updateJobProgress(jobId, 90);
      await this.processingService.uploadOutputAndLink(
        jobId,
        userId,
        outputBuffer,
        `merged_${Date.now()}.pdf`,
        'application/pdf',
        'pdf'
      );

      // 4. Cleanup & Complete
      await this.processingService.updateJobProgress(jobId, 100);
      await this.processingService.updateJobStatus(jobId, JobStatus.COMPLETED);
      this.logger.log(`[Job ${jobId}] Proses selesai`);
    } catch (error: any) {
      this.logger.error(`Error in Merge Job ${jobId}: ${error.message}`);
      await this.processingService.updateJobStatus(jobId, JobStatus.FAILED, error.message);
    } finally {
      await this.processingService.cleanupJobDir(jobId);
    }
  }
}
