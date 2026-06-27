import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RotateService } from './rotate.service';
import { RotateDto } from './dto/rotate.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('tools/rotate')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('tools/rotate')
export class RotateController {
  constructor(private readonly rotateService: RotateService) {}

  @Post()
  @ApiOperation({ summary: 'Rotate a PDF file' })
  async rotatePdf(@Body() rotateDto: RotateDto, @CurrentUser() user: any) {
    const job = await this.rotateService.startRotateJob(user.id, rotateDto);
    return {
      success: true,
      message: 'Rotate job started successfully',
      data: { jobId: job.id },
    };
  }
}
