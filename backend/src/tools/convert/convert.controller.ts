import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ConvertService } from './convert.service';
import { JpgToPdfDto, PdfToJpgDto, WordToPdfDto, PdfToWordDto } from './dto/convert.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('tools/convert')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('tools/convert')
export class ConvertController {
  constructor(private readonly convertService: ConvertService) {}

  @Post('jpg-to-pdf')
  @ApiOperation({ summary: 'Convert multiple JPGs into one PDF' })
  async jpgToPdf(@Body() dto: JpgToPdfDto, @CurrentUser() user: any) {
    const job = await this.convertService.startJpgToPdfJob(user.id, dto);
    return { success: true, message: 'JPG to PDF job started', data: { jobId: job.id } };
  }

  @Post('pdf-to-jpg')
  @ApiOperation({ summary: 'Convert PDF pages into a ZIP of JPGs' })
  async pdfToJpg(@Body() dto: PdfToJpgDto, @CurrentUser() user: any) {
    const job = await this.convertService.startPdfToJpgJob(user.id, dto);
    return { success: true, message: 'PDF to JPG job started', data: { jobId: job.id } };
  }

  @Post('word-to-pdf')
  @ApiOperation({ summary: 'Convert Word document to PDF using LibreOffice' })
  async wordToPdf(@Body() dto: WordToPdfDto, @CurrentUser() user: any) {
    const job = await this.convertService.startWordToPdfJob(user.id, dto);
    return { success: true, message: 'Word to PDF job started', data: { jobId: job.id } };
  }

  @Post('pdf-to-word')
  @ApiOperation({ summary: 'Convert PDF to Word document using LibreOffice' })
  async pdfToWord(@Body() dto: PdfToWordDto, @CurrentUser() user: any) {
    const job = await this.convertService.startPdfToWordJob(user.id, dto);
    return { success: true, message: 'PDF to Word job started', data: { jobId: job.id } };
  }
}
