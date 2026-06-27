import { Module, Global } from '@nestjs/common';
import { FileValidationService } from './file-validation.service';
import { VirusScanService } from './virus-scan.service';

@Global()
@Module({
  providers: [FileValidationService, VirusScanService],
  exports: [FileValidationService],
})
export class SecurityModule {}
