import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class UploadLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('FileUpload');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // We expect Multer to have populated request.file
    const { ip, user, method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const file = request.file;
          if (file) {
            const duration = Date.now() - startTime;
            this.logger.log(
              `Upload Success | User: ${user?.id || 'Anonymous'} | IP: ${ip} | File: ${file.originalname} | Size: ${file.size} bytes | Mime: ${file.mimetype} | Duration: ${duration}ms`,
            );
          }
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `Upload Failed | User: ${user?.id || 'Anonymous'} | IP: ${ip} | Error: ${err.message} | Duration: ${duration}ms`,
          );
        },
      }),
    );
  }
}
