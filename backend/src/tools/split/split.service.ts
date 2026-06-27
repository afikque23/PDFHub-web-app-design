import { Injectable, Logger } from '@nestjs/common';
import { ProcessingService } from '../shared/processing.service';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs/promises';
import * as path from 'path';
import { JobStatus } from '@prisma/client';
import { SplitDto, SplitMode } from './dto/split.dto';
import { zipFiles } from '../shared/utils/zip.util';

@Injectable()
export class SplitService {
  private readonly logger = new Logger(SplitService.name);

  constructor(private readonly processingService: ProcessingService) {}

  async startSplitJob(userId: string, dto: SplitDto) {
    const job = await this.processingService.createJob(userId, 'SPLIT', [dto.inputFileId]);
    
    this.processSplit(job.id, userId, dto).catch((err) => {
      this.logger.error(`Split Job ${job.id} failed`, err);
    });

    return job;
  }

  private parseRange(rangeStr: string, maxPages: number): number[] {
    const pages = new Set<number>();
    const parts = rangeStr.split(',');
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= maxPages) pages.add(i - 1); // 0-indexed
          }
        }
      } else {
        const num = parseInt(part.trim(), 10);
        if (!isNaN(num) && num >= 1 && num <= maxPages) pages.add(num - 1);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  }

  async processSplit(jobId: string, userId: string, dto: SplitDto) {
    const jobDir = this.processingService.getOutputDir(jobId);
    await fs.mkdir(jobDir, { recursive: true });
    try {
      this.logger.log(`[Job ${jobId}] Proses mulai`);
      await this.processingService.updateJobStatus(jobId, JobStatus.PROCESSING);
      await this.processingService.updateJobProgress(jobId, 10);

      const localPaths = await this.processingService.downloadInputsToTemp(jobId, [dto.inputFileId], userId);
      const pdfBytes = await fs.readFile(localPaths[0]);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const totalPages = pdfDoc.getPageCount();

      let outputBuffer: Buffer;
      let outputName: string;
      let outputMime: string;
      let outputExt: string;

      await this.processingService.updateJobProgress(jobId, 40);

      if (dto.mode === SplitMode.ALL) {
        // Extract all pages into separate PDFs and ZIP them
        const splitFiles: string[] = [];
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(copiedPage);
          const newPdfBytes = await newPdf.save();
          
          const splitPath = path.join(jobDir, `page_${i + 1}.pdf`);
          await fs.writeFile(splitPath, newPdfBytes);
          splitFiles.push(splitPath);
          
          const progress = 40 + Math.floor(((i + 1) / totalPages) * 30);
          await this.processingService.updateJobProgress(jobId, progress);
        }

        const zipPath = path.join(jobDir, 'split_all.zip');
        await zipFiles(splitFiles, zipPath);
        outputBuffer = await fs.readFile(zipPath);
        outputName = `split_${Date.now()}.zip`;
        outputMime = 'application/zip';
        outputExt = 'zip';

      } else {
        // RANGE or CUSTOM
        let indicesToExtract: number[] = [];
        if (dto.mode === SplitMode.RANGE && dto.range) {
          indicesToExtract = this.parseRange(dto.range, totalPages);
        } else if (dto.mode === SplitMode.CUSTOM && dto.pages) {
          indicesToExtract = dto.pages.filter(p => p >= 1 && p <= totalPages).map(p => p - 1);
        }

        if (indicesToExtract.length === 0) {
          throw new Error('No valid pages to extract');
        }

        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdfDoc, indicesToExtract);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        outputBuffer = Buffer.from(await newPdf.save());
        outputName = `split_extracted_${Date.now()}.pdf`;
        outputMime = 'application/pdf';
        outputExt = 'pdf';
      }

      await this.processingService.updateJobProgress(jobId, 80);

      await this.processingService.uploadOutputAndLink(
        jobId, userId, outputBuffer, outputName, outputMime, outputExt
      );

      await this.processingService.updateJobProgress(jobId, 100);
      await this.processingService.updateJobStatus(jobId, JobStatus.COMPLETED);
      this.logger.log(`[Job ${jobId}] Proses selesai`);
    } catch (error: any) {
      this.logger.error(`Error in Split Job ${jobId}: ${error.message}`);
      await this.processingService.updateJobStatus(jobId, JobStatus.FAILED, error.message);
    } finally {
      await this.processingService.cleanupJobDir(jobId);
    }
  }
}
