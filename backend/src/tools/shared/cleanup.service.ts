import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../../supabase/supabase.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);
  private readonly inputBaseDir = path.join(process.cwd(), 'temp', 'input');
  private readonly outputBaseDir = path.join(process.cwd(), 'temp', 'output');

  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleAutoCleanup() {
    this.logger.log('Menjalankan Auto Cleanup Routine (Temp files & Old Jobs)...');

    // 1. Hapus job yang sudah lebih dari 30 hari
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const oldJobs = await this.prisma.processingJob.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
      },
    });
    this.logger.log(`Dihapus ${oldJobs.count} job yang lebih dari 30 hari.`);

    // 2. Bersihkan folder temp/input & temp/output yang tertinggal (orphan)
    // Walaupun worker selalu membersihkan, jika VPS mati mendadak, file bisa tersisa.
    // Kita hapus folder job yang statusnya COMPLETED, FAILED, atau CANCELLED, atau tidak ada di DB.
    
    try {
      const activeJobs = await this.prisma.processingJob.findMany({
        where: {
          status: { in: ['WAITING', 'QUEUED', 'DOWNLOADING', 'PROCESSING', 'UPLOADING'] }
        },
        select: { id: true }
      });
      const activeJobIds = new Set(activeJobs.map(j => j.id));

      await this.cleanDirectory(this.inputBaseDir, activeJobIds);
      await this.cleanDirectory(this.outputBaseDir, activeJobIds);

    } catch (e) {
      this.logger.error('Error saat auto cleanup direktori', e);
    }
  }

  private async cleanDirectory(dir: string, activeJobIds: Set<string>) {
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory()) {
          // item.name is assumed to be jobId
          if (!activeJobIds.has(item.name)) {
            const fullPath = path.join(dir, item.name);
            await fs.rm(fullPath, { recursive: true, force: true });
            this.logger.log(`Auto Cleanup: Dihapus ${fullPath}`);
          }
        }
      }
    } catch (e) {
      // Ignore if dir doesn't exist
    }
  }
}
