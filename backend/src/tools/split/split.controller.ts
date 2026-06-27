import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { SplitService } from './split.service';
import { SplitDto } from './dto/split.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('tools/split')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('tools/split')
export class SplitController {
  constructor(private readonly splitService: SplitService) {}

  @Post()
  @ApiOperation({ summary: 'Split a PDF file' })
  async splitPdf(@Body() splitDto: SplitDto, @CurrentUser() user: any) {
    const job = await this.splitService.startSplitJob(user.id, splitDto);
    return {
      success: true,
      message: 'Split job started successfully',
      data: { jobId: job.id },
    };
  }
}
