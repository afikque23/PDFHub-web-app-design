import { Module } from '@nestjs/common';
import { SharedToolsModule } from './shared/shared-tools.module';
import { MergeModule } from './merge/merge.module';
import { SplitModule } from './split/split.module';
import { RotateModule } from './rotate/rotate.module';
import { WatermarkModule } from './watermark/watermark.module';
import { CompressModule } from './compress/compress.module';
import { ConvertModule } from './convert/convert.module';
import { OcrModule } from './ocr/ocr.module';

import { WorkerService } from './shared/worker.service';
import { CleanupService } from './shared/cleanup.service';

@Module({
  imports: [
    SharedToolsModule,
    MergeModule,
    SplitModule,
    RotateModule,
    WatermarkModule,
    CompressModule,
    ConvertModule,
    OcrModule,
  ],
  providers: [WorkerService, CleanupService],
})
export class ToolsModule {}
