import { Injectable, Logger } from '@nestjs/common';
import { ProcessingService } from '../shared/processing.service';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { JobStatus } from '@prisma/client';
import { JpgToPdfDto, PdfToJpgDto, WordToPdfDto, PdfToWordDto } from './dto/convert.dto';
import { zipFiles } from '../shared/utils/zip.util';

const execAsync = promisify(exec);

@Injectable()
export class ConvertService {
  private readonly logger = new Logger(ConvertService.name);

  constructor(private readonly processingService: ProcessingService) {}

  async startJpgToPdfJob(userId: string, dto: JpgToPdfDto) {
    const job = await this.processingService.createJob(userId, 'JPG_TO_PDF', dto.inputFileIds);
    this.processJpgToPdf(job.id, userId, dto).catch(err => this.logger.error(err));
    return job;
  }

  async processJpgToPdf(jobId: string, userId: string, dto: JpgToPdfDto) {
    try {
      this.logger.log(`[Job ${jobId}] Proses mulai`);
      await this.processingService.updateJobStatus(jobId, JobStatus.PROCESSING);
      const localPaths = await this.processingService.downloadInputsToTemp(jobId, dto.inputFileIds, userId);
      
      const pdfDoc = await PDFDocument.create();
      for (let i = 0; i < localPaths.length; i++) {
        const imageBytes = await fs.readFile(localPaths[i]);
        let image;
        try {
          image = await pdfDoc.embedJpg(imageBytes);
        } catch {
          image = await pdfDoc.embedPng(imageBytes); // Fallback to PNG just in case
        }
        
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        
        await this.processingService.updateJobProgress(jobId, Math.floor(((i + 1) / localPaths.length) * 80));
      }

      const outputBytes = await pdfDoc.save();
      await this.processingService.uploadOutputAndLink(
        jobId, userId, Buffer.from(outputBytes), `converted_${Date.now()}.pdf`, 'application/pdf', 'pdf'
      );

      await this.processingService.updateJobProgress(jobId, 100);
      await this.processingService.updateJobStatus(jobId, JobStatus.COMPLETED);
    } catch (e: any) {
      await this.processingService.updateJobStatus(jobId, JobStatus.FAILED, e.message);
    } finally {
      await this.processingService.cleanupJobDir(jobId);
    }
  }

  async startPdfToJpgJob(userId: string, dto: PdfToJpgDto) {
    const job = await this.processingService.createJob(userId, 'PDF_TO_JPG', [dto.inputFileId]);
    this.processPdfToJpg(job.id, userId, dto).catch(err => this.logger.error(err));
    return job;
  }

  async processPdfToJpg(jobId: string, userId: string, dto: PdfToJpgDto) {
    const jobDir = this.processingService.getOutputDir(jobId);
    await fs.mkdir(jobDir, { recursive: true });
    try {
      this.logger.log(`[Job ${jobId}] Proses mulai`);
      await this.processingService.updateJobStatus(jobId, JobStatus.PROCESSING);
      const localPaths = await this.processingService.downloadInputsToTemp(jobId, [dto.inputFileId], userId);
      
      // Using Poppler (pdftocairo or pdftoppm)
      const inputPath = localPaths[0];
      const outputPrefix = path.join(jobDir, 'page');
      const dpi = dto.dpi || 300;
      
      // Requires poppler-utils in PATH (e.g. pdftocairo)
      // Command: pdftocairo -jpeg -r 300 input.pdf page
      await execAsync(`pdftocairo -jpeg -r ${dpi} "${inputPath}" "${outputPrefix}"`);
      await this.processingService.updateJobProgress(jobId, 70);

      // Find all generated images
      const files = await fs.readdir(jobDir);
      const imageFiles = files.filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg')).map(f => path.join(jobDir, f));
      
      const zipPath = path.join(jobDir, 'images.zip');
      await zipFiles(imageFiles, zipPath);
      
      const zipBuffer = await fs.readFile(zipPath);
      await this.processingService.uploadOutputAndLink(
        jobId, userId, zipBuffer, `images_${Date.now()}.zip`, 'application/zip', 'zip'
      );

      await this.processingService.updateJobProgress(jobId, 100);
      await this.processingService.updateJobStatus(jobId, JobStatus.COMPLETED);
    } catch (e: any) {
      this.logger.error(`Poppler Convert error: ${e.message}`);
      await this.processingService.updateJobStatus(jobId, JobStatus.FAILED, e.message);
    } finally {
      await this.processingService.cleanupJobDir(jobId);
    }
  }

  async startWordToPdfJob(userId: string, dto: WordToPdfDto) {
    const job = await this.processingService.createJob(userId, 'WORD_TO_PDF', [dto.inputFileId]);
    this.processLibreOffice(job.id, userId, [dto.inputFileId], 'pdf').catch(err => this.logger.error(err));
    return job;
  }

  async startPdfToWordJob(userId: string, dto: PdfToWordDto) {
    const job = await this.processingService.createJob(userId, 'PDF_TO_WORD', [dto.inputFileId]);
    this.processLibreOffice(job.id, userId, [dto.inputFileId], 'docx').catch(err => this.logger.error(err));
    return job;
  }

  async processLibreOffice(jobId: string, userId: string, inputFileIds: string[], outExt: string) {
    const jobDir = this.processingService.getOutputDir(jobId);
    await fs.mkdir(jobDir, { recursive: true });
    try {
      this.logger.log(`[Job ${jobId}] Proses mulai`);
      await this.processingService.updateJobStatus(jobId, JobStatus.PROCESSING);
      const localPaths = await this.processingService.downloadInputsToTemp(jobId, inputFileIds, userId);
      const inputPath = localPaths[0];

      // Requires LibreOffice in PATH (soffice)
      // Command: soffice --headless --convert-to pdf --outdir /temp/jobId input.docx
      await execAsync(`soffice --headless --convert-to ${outExt} --outdir "${jobDir}" "${inputPath}"`);
      await this.processingService.updateJobProgress(jobId, 70);

      // Find output file
      const files = await fs.readdir(jobDir);
      const outFileName = files.find(f => f.endsWith(`.${outExt}`) && f !== path.basename(inputPath));
      
      if (!outFileName) throw new Error('Output file not found after LibreOffice conversion');
      
      const outPath = path.join(jobDir, outFileName);
      const outBuffer = await fs.readFile(outPath);
      const mime = outExt === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      await this.processingService.uploadOutputAndLink(
        jobId, userId, outBuffer, `converted_${Date.now()}.${outExt}`, mime, outExt
      );

      await this.processingService.updateJobProgress(jobId, 100);
      await this.processingService.updateJobStatus(jobId, JobStatus.COMPLETED);
    } catch (e: any) {
      this.logger.error(`LibreOffice Convert error: ${e.message}`);
      await this.processingService.updateJobStatus(jobId, JobStatus.FAILED, e.message);
    } finally {
      await this.processingService.cleanupJobDir(jobId);
    }
  }
}
