import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { MergeService } from './merge.service';
import { MergeDto } from './dto/merge.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('tools/merge')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('tools/merge')
export class MergeController {
  constructor(private readonly mergeService: MergeService) {}

  @Post()
  @ApiOperation({ summary: 'Merge multiple PDF files into one' })
  async mergePdfs(@Body() mergeDto: MergeDto, @CurrentUser() user: any) {
    const job = await this.mergeService.startMergeJob(user.id, mergeDto.inputFileIds);
    return {
      success: true,
      message: 'Merge job started successfully',
      data: { jobId: job.id },
    };
  }
}
