import { Module } from '@nestjs/common';
import { WatermarkController } from './watermark.controller';
import { WatermarkService } from './watermark.service';

@Module({
  controllers: [WatermarkController],
  providers: [WatermarkService],
  exports: [WatermarkService],
})
export class WatermarkModule {}
