import { Module, Global } from '@nestjs/common';
import { ProcessingService } from './processing.service';
import { FilesModule } from '../../files/files.module';
import { JobController } from './job.controller';

@Global()
@Module({
  imports: [FilesModule],
  controllers: [JobController],
  providers: [ProcessingService],
  exports: [ProcessingService],
})
export class SharedToolsModule {}
