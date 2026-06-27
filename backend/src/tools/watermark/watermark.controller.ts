import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { WatermarkService } from './watermark.service';
import { WatermarkDto } from './dto/watermark.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('tools/watermark')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('tools/watermark')
export class WatermarkController {
  constructor(private readonly watermarkService: WatermarkService) {}

  @Post()
  @ApiOperation({ summary: 'Add a text or image watermark to a PDF' })
  async addWatermark(@Body() dto: WatermarkDto, @CurrentUser() user: any) {
    if (!dto.text && !dto.imageFileId) {
      throw new BadRequestException('Either text or imageFileId must be provided for watermark');
    }

    const job = await this.watermarkService.startWatermarkJob(user.id, dto);
    return {
      success: true,
      message: 'Watermark job started successfully',
      data: { jobId: job.id },
    };
  }
}
