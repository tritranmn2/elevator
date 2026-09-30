import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AppLogger } from '../loggers/logger.service';
import { LogFormatter } from '../helpers/log-formatter.helper';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const clientIp = request.ip || request.headers?.['x-forwarded-for'] || request.socket?.remoteAddress || '127.0.0.1';

    // 1. Ghi log START
    this.logger.info({
      message: LogFormatter.start(request),
      clientIp,
    });

    const now = Date.now();

    return next.handle().pipe(
      // 2. Ghi log nếu xảy ra ERROR
      catchError((error) => {
        this.logger.error({
          message: LogFormatter.error(request, error),
          clientIp,
        });
        return throwError(() => error);
      }),
      // 3. Ghi log khi hoàn tất (END)
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.info({
          message: LogFormatter.end(request, responseTime),
          clientIp,
        });
      }),
    );
  }
}
