import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OcrService } from './ocr.service';
import { OcrDto } from './dto/ocr.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('tools/ocr')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('tools/ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post()
  @ApiOperation({ summary: 'Extract text from PDF/Image using Tesseract.js' })
  async runOcr(@Body() dto: OcrDto, @CurrentUser() user: any) {
    const job = await this.ocrService.startOcrJob(user.id, dto);
    return {
      success: true,
      message: 'OCR job started successfully',
      data: { jobId: job.id },
    };
  }
}
