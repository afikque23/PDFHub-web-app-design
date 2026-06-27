import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { JobStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileValidationService } from '../../security/file-validation.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ProcessingService {
  private readonly logger = new Logger(ProcessingService.name);
  private readonly inputBaseDir = path.join(process.cwd(), 'temp', 'input');
  private readonly outputBaseDir = path.join(process.cwd(), 'temp', 'output');

  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
    private eventEmitter: EventEmitter2,
    private fileValidation: FileValidationService,
  ) {}

  async initializeDirectories() {
    await fs.mkdir(this.inputBaseDir, { recursive: true });
    await fs.mkdir(this.outputBaseDir, { recursive: true });
  }

  getOutputDir(jobId: string): string {
    return path.join(this.outputBaseDir, jobId);
  }

  async createJob(userId: string, tool: string, inputFileIds: string[], options: any = {}) {
    return this.prisma.processingJob.create({
      data: {
        userId,
        tool,
        inputFileIds,
        options,
        status: JobStatus.WAITING,
      },
    });
  }

  async updateJobProgress(jobId: string, progress: number) {
    const updatedJob = await this.prisma.processingJob.update({
      where: { id: jobId },
      data: { progress },
    });
    this.eventEmitter.emit('job.updated', {
      id: jobId,
      status: updatedJob.status,
      progress: updatedJob.progress,
    });
    return updatedJob;
  }

  async updateJobStatus(jobId: string, status: JobStatus, errorMessage?: string) {
    const data: any = { status };
    if (errorMessage) data.errorMessage = errorMessage;
    if (status === JobStatus.COMPLETED || status === JobStatus.FAILED) {
      data.completedAt = new Date();
      const job = await this.prisma.processingJob.findUnique({ where: { id: jobId } });
      if (job?.startedAt) {
        data.processingTime = new Date().getTime() - job.startedAt.getTime();
      }
    }

    const updatedJob = await this.prisma.processingJob.update({
      where: { id: jobId },
      data,
    });

    let downloadUrl;
    if (status === JobStatus.COMPLETED && updatedJob.outputFileId) {
      downloadUrl = await this.supabase.createSignedUrl(updatedJob.outputFileId, 3600, 'pdfhub-output');
    }

    this.eventEmitter.emit('job.updated', {
      id: jobId,
      status: updatedJob.status,
      progress: updatedJob.progress,
      errorMessage,
      downloadUrl,
    });

    return updatedJob;
  }

  async downloadInputsToTemp(jobId: string, inputFileIds: string[], userId?: string): Promise<string[]> {
    this.logger.log(`[Job ${jobId}] Download mulai`);
    await this.updateJobStatus(jobId, JobStatus.DOWNLOADING);
    
    const jobDir = path.join(this.inputBaseDir, jobId);
    await fs.mkdir(jobDir, { recursive: true });

    const downloadedPaths: string[] = [];

    for (let i = 0; i < inputFileIds.length; i++) {
      const storagePath = inputFileIds[i]; // Front-end passes the path
      const blob = await this.supabase.download(storagePath, 'pdfhub-input');
      
      if (!blob) throw new InternalServerErrorException(`Failed to download ${storagePath} from pdfhub-input`);
      
      const buffer = Buffer.from(await blob.arrayBuffer());
      const fileName = path.basename(storagePath);
      const localPath = path.join(jobDir, `${i}_${fileName}`);
      await fs.writeFile(localPath, buffer);
      
      if (userId) {
        await this.fileValidation.validateDownloadedFile(userId, localPath);
      }
      
      downloadedPaths.push(localPath);
    }

    this.logger.log(`[Job ${jobId}] Download selesai`);
    return downloadedPaths;
  }

  async uploadOutputAndLink(jobId: string, userId: string, outputBuffer: Buffer, originalName: string, mimeType: string, extension: string): Promise<string> {
    this.logger.log(`[Job ${jobId}] Upload mulai`);
    await this.updateJobStatus(jobId, JobStatus.UPLOADING);

    const storedName = `${jobId}_${Date.now()}.${extension}`;
    const storagePath = `${userId}/${storedName}`;

    // Upload to pdfhub-output
    const uploadedPath = await this.supabase.uploadFile(storagePath, outputBuffer, mimeType, 'pdfhub-output');
    if (!uploadedPath) throw new Error('Upload to output bucket failed');

    // Update job with storage path
    await this.prisma.processingJob.update({
      where: { id: jobId },
      data: { outputFileId: storagePath },
    });

    this.logger.log(`[Job ${jobId}] Upload selesai`);
    return storagePath;
  }

  async cleanupJobDir(jobId: string) {
    const inputDir = path.join(this.inputBaseDir, jobId);
    const outputDir = path.join(this.outputBaseDir, jobId); // In case they use output directly
    try {
      await fs.rm(inputDir, { recursive: true, force: true });
      await fs.rm(outputDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore
    }
  }

  async getJob(jobId: string, userId: string, isAdmin: boolean) {
    const job = await this.prisma.processingJob.findUnique({
      where: { id: jobId },
      include: {
        user: { select: { fullName: true, email: true } },
      }
    });

    if (!job || (!isAdmin && job.userId !== userId)) {
      throw new InternalServerErrorException('Job not found');
    }

    return job;
  }
}
