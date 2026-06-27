import { Injectable, Logger } from '@nestjs/common';
import { ProcessingService } from '../shared/processing.service';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as fs from 'fs/promises';
import { JobStatus } from '@prisma/client';
import { WatermarkDto, WatermarkPosition } from './dto/watermark.dto';

@Injectable()
export class WatermarkService {
  private readonly logger = new Logger(WatermarkService.name);

  constructor(private readonly processingService: ProcessingService) {}

  async startWatermarkJob(userId: string, dto: WatermarkDto) {
    const inputIds = [dto.inputFileId];
    if (dto.imageFileId) inputIds.push(dto.imageFileId);

    const job = await this.processingService.createJob(userId, 'WATERMARK', inputIds);
    
    this.processWatermark(job.id, userId, dto).catch((err) => {
      this.logger.error(`Watermark Job ${job.id} failed`, err);
    });

    return job;
  }

  async processWatermark(jobId: string, userId: string, dto: WatermarkDto) {
    try {
      this.logger.log(`[Job ${jobId}] Proses mulai`);
      await this.processingService.updateJobStatus(jobId, JobStatus.PROCESSING);
      await this.processingService.updateJobProgress(jobId, 10);

      const inputIds = [dto.inputFileId];
      if (dto.imageFileId) inputIds.push(dto.imageFileId);

      const localPaths = await this.processingService.downloadInputsToTemp(jobId, inputIds, userId);
      await this.processingService.updateJobProgress(jobId, 40);

      const pdfPath = localPaths[0];
      const pdfBytes = await fs.readFile(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      let imageEmbed: any = null;
      let imgWidth = 0;
      let imgHeight = 0;

      if (dto.imageFileId && localPaths.length > 1) {
        const imagePath = localPaths[1];
        const imageBytes = await fs.readFile(imagePath);
        // Simplified: Try png then jpg
        try {
          imageEmbed = await pdfDoc.embedPng(imageBytes);
        } catch {
          imageEmbed = await pdfDoc.embedJpg(imageBytes);
        }
        
        const dims = imageEmbed.scale(0.5); // Example scale down
        imgWidth = dims.width;
        imgHeight = dims.height;
      }

      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const text = dto.text || '';
      const fontSize = dto.fontSize || 48;
      const opacity = dto.opacity ?? 0.5;
      const rotationAngle = dto.rotation ?? 45;
      const position = dto.position || WatermarkPosition.CENTER;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        
        let x = width / 2;
        let y = height / 2;
        
        // Very basic positioning logic
        if (position === WatermarkPosition.TOP_LEFT) { x = 50; y = height - 50; }
        else if (position === WatermarkPosition.TOP_RIGHT) { x = width - 150; y = height - 50; }
        else if (position === WatermarkPosition.BOTTOM_LEFT) { x = 50; y = 50; }
        else if (position === WatermarkPosition.BOTTOM_RIGHT) { x = width - 150; y = 50; }

        if (imageEmbed) {
          page.drawImage(imageEmbed, {
            x: position === WatermarkPosition.CENTER ? x - (imgWidth / 2) : x,
            y: position === WatermarkPosition.CENTER ? y - (imgHeight / 2) : y,
            width: imgWidth,
            height: imgHeight,
            opacity: opacity,
            rotate: degrees(rotationAngle),
          });
        } else {
          const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
          page.drawText(text, {
            x: position === WatermarkPosition.CENTER ? x - (textWidth / 2) : x,
            y,
            size: fontSize,
            font: helveticaFont,
            color: rgb(0.5, 0.5, 0.5),
            opacity: opacity,
            rotate: degrees(rotationAngle),
          });
        }

        const progress = 40 + Math.floor(((i + 1) / pages.length) * 40);
        await this.processingService.updateJobProgress(jobId, progress);
      }

      const outputBytes = await pdfDoc.save();
      const outputBuffer = Buffer.from(outputBytes);

      await this.processingService.uploadOutputAndLink(
        jobId,
        userId,
        outputBuffer,
        `watermarked_${Date.now()}.pdf`,
        'application/pdf',
        'pdf'
      );

      await this.processingService.updateJobProgress(jobId, 100);
      await this.processingService.updateJobStatus(jobId, JobStatus.COMPLETED);
      this.logger.log(`[Job ${jobId}] Proses selesai`);
    } catch (error: any) {
      this.logger.error(`Error in Watermark Job ${jobId}: ${error.message}`);
      await this.processingService.updateJobStatus(jobId, JobStatus.FAILED, error.message);
    } finally {
      await this.processingService.cleanupJobDir(jobId);
    }
  }
}
