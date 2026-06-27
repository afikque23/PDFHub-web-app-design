import { Injectable, Logger } from '@nestjs/common';
import { ProcessingService } from '../shared/processing.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { JobStatus } from '@prisma/client';
import { OcrDto, OcrLanguage, OcrOutputFormat } from './dto/ocr.dto';
import { createWorker } from 'tesseract.js';
import { PDFDocument } from 'pdf-lib';

const execAsync = promisify(exec);

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(private readonly processingService: ProcessingService) {}

  async startOcrJob(userId: string, dto: OcrDto) {
    const job = await this.processingService.createJob(userId, 'OCR', [dto.inputFileId]);
    
    this.processOcr(job.id, userId, dto).catch((err) => {
      this.logger.error(`OCR Job ${job.id} failed`, err);
    });

    return job;
  }

  async processOcr(jobId: string, userId: string, dto: OcrDto) {
    const jobDir = this.processingService.getOutputDir(jobId);
    await fs.mkdir(jobDir, { recursive: true });
    try {
      this.logger.log(`[Job ${jobId}] Proses mulai`);
      await this.processingService.updateJobStatus(jobId, JobStatus.PROCESSING);
      await this.processingService.updateJobProgress(jobId, 10);

      const localPaths = await this.processingService.downloadInputsToTemp(jobId, [dto.inputFileId], userId);
      await this.processingService.updateJobProgress(jobId, 30);

      const inputPath = localPaths[0];
      const isPdf = inputPath.toLowerCase().endsWith('.pdf');
      
      let imagePaths: string[] = [];

      if (isPdf) {
        // Convert PDF to images first
        const outputPrefix = path.join(jobDir, 'page');
        await execAsync(`pdftocairo -jpeg -r 150 "${inputPath}" "${outputPrefix}"`);
        const files = await fs.readdir(jobDir);
        imagePaths = files.filter(f => f.endsWith('.jpg')).map(f => path.join(jobDir, f));
      } else {
        imagePaths = [inputPath];
      }

      await this.processingService.updateJobProgress(jobId, 50);

      const worker = await createWorker(dto.language || OcrLanguage.ENG);
      
      let fullText = '';
      const pdfDocsBytes: Uint8Array[] = [];

      for (let i = 0; i < imagePaths.length; i++) {
        if (dto.format === OcrOutputFormat.PDF) {
          const { data: { pdf } } = await worker.recognize(imagePaths[i], { pdfTitle: 'OCR Result' } as any);
          if (pdf) pdfDocsBytes.push(new Uint8Array(pdf as any));
        } else {
          const { data: { text } } = await worker.recognize(imagePaths[i]);
          fullText += text + '\n\n';
        }
        
        const progress = 50 + Math.floor(((i + 1) / imagePaths.length) * 40);
        await this.processingService.updateJobProgress(jobId, progress);
      }

      await worker.terminate();

      let outputBuffer: Buffer;
      let outputName: string;
      let outputMime: string;
      let outputExt: string;

      if (dto.format === OcrOutputFormat.PDF) {
        const mergedPdf = await PDFDocument.create();
        for (const bytes of pdfDocsBytes) {
          const pdfDoc = await PDFDocument.load(bytes);
          const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          copiedPages.forEach(page => mergedPdf.addPage(page));
        }
        outputBuffer = Buffer.from(await mergedPdf.save());
        outputName = `ocr_${Date.now()}.pdf`;
        outputMime = 'application/pdf';
        outputExt = 'pdf';
      } else {
        outputBuffer = Buffer.from(fullText, 'utf-8');
        outputName = `ocr_${Date.now()}.txt`;
        outputMime = 'text/plain';
        outputExt = 'txt';
      }

      await this.processingService.updateJobProgress(jobId, 95);

      await this.processingService.uploadOutputAndLink(
        jobId,
        userId,
        outputBuffer,
        outputName,
        outputMime,
        outputExt
      );

      await this.processingService.updateJobProgress(jobId, 100);
      await this.processingService.updateJobStatus(jobId, JobStatus.COMPLETED);
      this.logger.log(`[Job ${jobId}] Proses selesai`);
    } catch (error: any) {
      this.logger.error(`Error in OCR Job ${jobId}: ${error.message}`);
      await this.processingService.updateJobStatus(jobId, JobStatus.FAILED, error.message);
    } finally {
      await this.processingService.cleanupJobDir(jobId);
    }
  }
}
