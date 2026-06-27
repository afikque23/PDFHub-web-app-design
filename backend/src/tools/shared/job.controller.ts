import { Controller, Get, Param, UseGuards, Post, Body, InternalServerErrorException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ProcessingService } from './processing.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JobStatus, JobPriority } from '@prisma/client';
import { CreateJobDto } from './dto/create-job.dto';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('jobs')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('jobs')
export class JobController {
  constructor(
    private readonly processingService: ProcessingService,
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new processing job in the queue' })
  async createJob(@Body() dto: CreateJobDto, @CurrentUser() user: any) {
    const job = await this.prisma.processingJob.create({
      data: {
        userId: user.id,
        tool: dto.tool,
        inputFileIds: dto.inputFileIds,
        priority: dto.priority || JobPriority.NORMAL,
        options: dto.options || {},
        status: JobStatus.WAITING,
      },
    });

    return {
      jobId: job.id,
      status: job.status,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs for current user (Admin gets all)' })
  async getJobs(@CurrentUser() user: any) {
    const where = user.role === 'ADMIN' ? {} : { userId: user.id };
    return this.prisma.processingJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        tool: true,
        status: true,
        progress: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job progress, status, and download URL' })
  async getJobStatus(@Param('id') id: string, @CurrentUser() user: any) {
    const job = await this.processingService.getJob(id, user.id, user.role === 'ADMIN');
    
    let downloadUrl = null;
    if (job.status === JobStatus.COMPLETED && job.outputFileId) {
      downloadUrl = await this.supabaseService.createSignedUrl(job.outputFileId, 3600, 'pdfhub-output');
    }

    return {
      id: job.id,
      tool: job.tool,
      status: job.status,
      progress: job.progress,
      processingTime: job.processingTime,
      errorMessage: job.errorMessage,
      downloadUrl,
    };
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry a FAILED job' })
  async retryJob(@Param('id') id: string, @CurrentUser() user: any) {
    const job = await this.processingService.getJob(id, user.id, user.role === 'ADMIN');
    
    if (job.status !== JobStatus.FAILED) {
      throw new BadRequestException('Only FAILED jobs can be retried');
    }

    const updatedJob = await this.prisma.processingJob.update({
      where: { id },
      data: {
        status: JobStatus.WAITING,
        errorMessage: null,
        progress: 0,
        workerId: null,
        startedAt: null,
        completedAt: null,
      },
    });

    return { jobId: updatedJob.id, status: updatedJob.status };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a WAITING or QUEUED job' })
  async cancelJob(@Param('id') id: string, @CurrentUser() user: any) {
    const job = await this.processingService.getJob(id, user.id, user.role === 'ADMIN');
    
    if (job.status !== JobStatus.WAITING && job.status !== JobStatus.QUEUED) {
      throw new BadRequestException('Only WAITING or QUEUED jobs can be cancelled');
    }

    const updatedJob = await this.prisma.processingJob.update({
      where: { id },
      data: {
        status: JobStatus.CANCELLED,
      },
    });

    return { jobId: updatedJob.id, status: updatedJob.status };
  }
}

