import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Observable, Subject, interval, map, finalize, merge } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private subjects = new Map<string, Subject<MessageEvent>>();

  constructor(private prisma: PrismaService) {}

  async subscribeToJob(jobId: string, userId: string, isAdmin: boolean): Promise<Observable<MessageEvent>> {
    const job = await this.prisma.processingJob.findUnique({ where: { id: jobId } });
    
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    
    if (!isAdmin && job.userId !== userId) {
      throw new ForbiddenException('Anda tidak berhak memantau Job ini');
    }

    this.logger.log(`Client Connected: Job ${jobId}`);

    if (!this.subjects.has(jobId)) {
      this.subjects.set(jobId, new Subject<MessageEvent>());
    }
    const subject = this.subjects.get(jobId)!;

    // Heartbeat every 15s
    const heartbeat$ = interval(15000).pipe(
      map(() => ({ data: { type: 'heartbeat', timestamp: new Date().toISOString() } } as MessageEvent))
    );

    // Initial state
    const initial$ = new Observable<MessageEvent>(subscriber => {
       subscriber.next({ data: { 
         id: job.id, 
         status: job.status, 
         progress: job.progress,
         options: job.options,
       }});
       subscriber.complete();
    });

    return merge(initial$, heartbeat$, subject.asObservable()).pipe(
      finalize(() => {
        this.logger.log(`Client Disconnected: Job ${jobId}`);
      })
    );
  }

  @OnEvent('job.updated')
  handleJobUpdate(payload: { id: string; status: string; progress: number; errorMessage?: string; downloadUrl?: string }) {
    const { id, status, progress, errorMessage, downloadUrl } = payload;
    
    if (this.subjects.has(id)) {
      const subject = this.subjects.get(id)!;
      
      this.logger.log(`Event Sent (Job ${id}): ${status} - ${progress}%`);

      subject.next({
        data: {
          id,
          status,
          progress,
          errorMessage,
          downloadUrl,
          updatedAt: new Date().toISOString()
        }
      });

      if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
        setTimeout(() => {
          subject.complete();
          this.subjects.delete(id);
        }, 500); // Give frontend 500ms to receive the final message before closing stream
      }
    }
  }
}
