import { Controller, Sse, Param, UseGuards, NotFoundException, Req } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EventsService } from './events.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Sse('jobs/:jobId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe to Realtime Job Updates via Server-Sent Events (SSE). Use ?token=... for browser EventSource' })
  async subscribeToJob(@Param('jobId') jobId: string, @CurrentUser() user: any): Promise<Observable<any>> {
    return this.eventsService.subscribeToJob(jobId, user.id, user.role === 'ADMIN');
  }
}
