import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CompressService } from './compress.service';
import { CompressDto } from './dto/compress.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('tools/compress')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('tools/compress')
export class CompressController {
  constructor(private readonly compressService: CompressService) {}

  @Post()
  @ApiOperation({ summary: 'Compress a PDF file using Ghostscript' })
  async compressPdf(@Body() dto: CompressDto, @CurrentUser() user: any) {
    const job = await this.compressService.startCompressJob(user.id, dto);
    return {
      success: true,
      message: 'Compress job started successfully',
      data: { jobId: job.id },
    };
  }
}
