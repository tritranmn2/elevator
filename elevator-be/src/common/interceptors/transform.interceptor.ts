import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { HttpStatus, Injectable, StreamableFile } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  data: T;
  message?: string;
  page?: number;
  perPage?: number;
  total?: number;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse | StreamableFile | any> {
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data: any) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        // 1. Nếu data trả về rỗng (null / undefined)
        if (data === null || data === undefined) {
          return {
            success: false,
            statusCode,
            data: null,
            message: 'No data found',
          } as IApiResponse<null>;
        }

        // 2. Bypass không bọc JSON nếu là stream file (download file Excel, PDF, hình ảnh...)
        if (data instanceof StreamableFile) {
          return data;
        }

        // 3. Xử lý danh sách có phân trang (Khi Handler trả về { data: [...], total: ... })
        if (data && Array.isArray(data.data)) {
          const page = parseInt(request.query?.page, 10) || 1;
          const perPage = parseInt(request.query?.perPage, 10) || data.data.length;
          const { data: dataArray, total, ...otherFields } = data;
          return {
            success: true,
            statusCode,
            page,
            perPage,
            total: total ?? dataArray.length,
            ...otherFields,
            data: dataArray,
          } as IApiResponse<any[]>;
        }

        // 4. Xử lý dữ liệu đơn lẻ (Single Object / Array thông thường)
        if (statusCode >= HttpStatus.OK && statusCode <= HttpStatus.PARTIAL_CONTENT) {
          return {
            success: true,
            statusCode,
            data,
          } as IApiResponse<any>;
        }

        return data;
      }),
    );
  }
}
