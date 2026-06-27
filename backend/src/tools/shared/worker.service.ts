import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { ProcessingService } from './processing.service';
import { JobStatus, JobPriority } from '@prisma/client';
import { CompressService } from '../compress/compress.service';
import { SplitService } from '../split/split.service';
import { MergeService } from '../merge/merge.service';
import { RotateService } from '../rotate/rotate.service';
import { WatermarkService } from '../watermark/watermark.service';
import { ConvertService } from '../convert/convert.service';
import { OcrService } from '../ocr/ocr.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WorkerService {
  private readonly logger = new Logger(WorkerService.name);
  private readonly workerId: string;
  private isProcessing = false; // Prevent overlapping ticks if one tick is slow

  constructor(
    private prisma: PrismaService,
    private processingService: ProcessingService,
    private configService: ConfigService,
    private compressService: CompressService,
    private splitService: SplitService,
    private mergeService: MergeService,
    private rotateService: RotateService,
    private watermarkService: WatermarkService,
    private convertService: ConvertService,
    private ocrService: OcrService,
  ) {
    this.workerId = this.configService.get<string>('WORKER_ID') || `worker-oracle-01`;
  }

  @Interval(2000)
  async handleQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Find a WAITING job and lock it using a transaction
      // Prisma doesn't support native SKIP LOCKED via Prisma Client API yet, 
      // but we can use raw query for true concurrency or atomic update.
      // Since Oracle free tier might just run one instance of worker, atomic update is safe.
      
      const jobToProcess = await this.prisma.$transaction(async (tx) => {
        // Find highest priority waiting job
        const job = await tx.processingJob.findFirst({
          where: { status: JobStatus.WAITING },
          orderBy: [
            { priority: 'desc' }, // HIGH > NORMAL > LOW
            { createdAt: 'asc' }, // FIFO
          ],
        });

        if (!job) return null;

        // Lock it
        return tx.processingJob.update({
          where: { id: job.id },
          data: {
            status: JobStatus.QUEUED,
            workerId: this.workerId,
            startedAt: new Date(),
          },
        });
      });

      if (jobToProcess) {
        this.logger.log(`[Worker ${this.workerId}] Mengambil Job ${jobToProcess.id} (${jobToProcess.tool})`);
        
        // Execute the job in background (don't await so the worker can pick up more jobs in next ticks if needed, 
        // OR await if we want purely sequential processing. Awaiting is safer for low RAM).
        await this.executeJob(jobToProcess);
      }
    } catch (error) {
      this.logger.error('Worker polling error', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async executeJob(job: any) {
    try {
      this.logger.log(`[Worker ${this.workerId}] Memproses Job ${job.id}`);
      // Options fallback
      const options = job.options || {};
      
      // Dispatch based on tool
      switch (job.tool.toUpperCase()) {
        case 'COMPRESS':
          await this.compressService.processCompress(job.id, job.userId, { inputFileId: job.inputFileIds[0], ...options });
          break;
        case 'SPLIT':
          await this.splitService.processSplit(job.id, job.userId, { inputFileId: job.inputFileIds[0], ...options });
          break;
        case 'MERGE':
          await this.mergeService.processMerge(job.id, job.userId, job.inputFileIds);
          break;
        case 'ROTATE':
          await this.rotateService.processRotate(job.id, job.userId, { inputFileId: job.inputFileIds[0], ...options });
          break;
        case 'WATERMARK':
          await this.watermarkService.processWatermark(job.id, job.userId, { inputFileId: job.inputFileIds[0], ...options });
          break;
        case 'CONVERT_JPG_TO_PDF':
          await this.convertService.processJpgToPdf(job.id, job.userId, { inputFileIds: job.inputFileIds, ...options });
          break;
        case 'CONVERT_PDF_TO_JPG':
          await this.convertService.processPdfToJpg(job.id, job.userId, { inputFileId: job.inputFileIds[0], ...options });
          break;
        case 'CONVERT_WORD_TO_PDF':
        case 'CONVERT_PDF_TO_WORD':
          const outExt = job.tool.toUpperCase() === 'CONVERT_WORD_TO_PDF' ? 'pdf' : 'docx';
          await this.convertService.processLibreOffice(job.id, job.userId, job.inputFileIds, outExt);
          break;
        case 'OCR':
          await this.ocrService.processOcr(job.id, job.userId, { inputFileId: job.inputFileIds[0], ...options });
          break;
        default:
          throw new Error(`Unknown tool: ${job.tool}`);
      }
    } catch (e: any) {
      this.logger.error(`[Worker ${this.workerId}] Job ${job.id} gagal: ${e.message}`);
      // If the tool service didn't catch and update status (it should have), we ensure it here.
      await this.processingService.updateJobStatus(job.id, JobStatus.FAILED, e.message);
    }
  }

  // Timeout Watchdog every 1 minute
  @Interval(60000)
  async handleTimeouts() {
    const timeoutLimit = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
    const stuckJobs = await this.prisma.processingJob.findMany({
      where: {
        status: { in: [JobStatus.PROCESSING, JobStatus.DOWNLOADING, JobStatus.UPLOADING] },
        startedAt: { lt: timeoutLimit },
      },
    });

    for (const job of stuckJobs) {
      this.logger.warn(`[Worker Watchdog] Timeout Job ${job.id}. Mengganti status ke FAILED.`);
      await this.processingService.updateJobStatus(job.id, JobStatus.FAILED, 'Job execution timed out after 10 minutes');
      await this.processingService.cleanupJobDir(job.id);
    }
  }
}
