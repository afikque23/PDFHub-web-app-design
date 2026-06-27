import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count();
    const totalFiles = await this.prisma.file.count();
    const totalJobs = await this.prisma.processingJob.count();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayJobs = await this.prisma.processingJob.count({
      where: { createdAt: { gte: today } }
    });
    
    const todayUploads = await this.prisma.file.count({
      where: { createdAt: { gte: today } }
    });

    const completedJobs = await this.prisma.processingJob.count({
      where: { status: 'COMPLETED' }
    });

    const failedJobs = await this.prisma.processingJob.count({
      where: { status: 'FAILED' }
    });

    const jobsWithTime = await this.prisma.processingJob.findMany({
      where: { status: 'COMPLETED', processingTime: { not: null } },
      select: { processingTime: true }
    });

    const avgProcessingTime = jobsWithTime.length > 0 
      ? Math.round(jobsWithTime.reduce((acc, job) => acc + (job.processingTime || 0), 0) / jobsWithTime.length) 
      : 0;

    const files = await this.prisma.file.findMany({ select: { size: true } });
    const totalStorageUsed = files.reduce((acc, file) => acc + file.size, 0);

    return {
      totalUsers,
      totalFiles,
      totalJobs,
      todayJobs,
      todayUploads,
      completedJobs,
      failedJobs,
      avgProcessingTime,
      totalStorageUsed,
      workerStatus: {
        status: 'ONLINE',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        version: '1.0.0'
      }
    };
  }

  async getUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { files: true, processingJobs: true }
          }
        }
      }),
      this.prisma.user.count()
    ]);
    return { data: users, total, page, limit };
  }

  async getFiles(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, fullName: true } } }
      }),
      this.prisma.file.count()
    ]);
    return { data: files, total, page, limit };
  }

  async getJobs(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      this.prisma.processingJob.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } }
      }),
      this.prisma.processingJob.count()
    ]);
    return { data: jobs, total, page, limit };
  }

  async getAnalytics() {
    const tools = await this.prisma.processingJob.groupBy({
      by: ['tool'],
      _count: { tool: true }
    });

    const statusStats = await this.prisma.processingJob.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    // Dummy logic for daily jobs due to Prisma groupBy date limitation
    const recentJobs = await this.prisma.processingJob.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)) // last 7 days
        }
      },
      select: { createdAt: true }
    });

    const dailyJobsMap = new Map<string, number>();
    recentJobs.forEach(job => {
      const date = job.createdAt.toISOString().split('T')[0];
      dailyJobsMap.set(date, (dailyJobsMap.get(date) || 0) + 1);
    });

    const dailyJobs = Array.from(dailyJobsMap.entries()).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));

    return { tools, statusStats, dailyJobs };
  }
}
