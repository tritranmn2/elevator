---
name: nestjs-transform-interceptor
description: >-
  Best practice guide for Centralized Response Wrapping in NestJS using TransformInterceptor.
  Automatically wraps success responses into a standardized structure { success: true, statusCode, data, ... }
  and formats paginated responses without manual boilerplate in Services or Controllers.
---

# NestJS Centralized Response Wrapping Guide (TransformInterceptor)

Tài liệu hướng dẫn áp dụng cơ chế **Centralized Response Wrapping** trong NestJS thông qua `TransformInterceptor`.

Nhờ cơ chế này, tại các Service / Controller bạn không cần thủ công bọc format JSON `{ success: true, ... }`, mà chỉ cần return dữ liệu thuần túy; hệ thống sẽ tự động biến đổi thành format chuẩn.

---

## 1. Phân Loại 2 Dạng Response Chuẩn Của Hệ Thống

### Dạng 1: Dữ liệu đơn lẻ (Single Object / Action Result)
Dùng cho các API chi tiết (`Get Detail`), tạo mới (`Create`), cập nhật (`Update`),...

* **Trong Controller:**
  ```typescript
  return product; 
  // hoặc return { isSuccess: true };
  ```
* **Format Client nhận được:**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "id": 1,
      "name": "Sản phẩm A",
      "price": 5000000
    }
  }
  ```

### Dạng 2: Dữ liệu phân trang (Paginated List)
Dùng cho các API danh sách có `page` và `perPage` từ Query Params.

* **Trong Controller:**
  ```typescript
  return {
    data: products, // Mảng danh sách kết quả
    total: totalCount // Tổng số bản ghi
  };
  ```
* **Format Client nhận được:**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "page": 1,
    "perPage": 10,
    "total": 120,
    "data": [
      { "id": 1, "name": "Sản phẩm A" },
      { "id": 2, "name": "Sản phẩm B" }
    ]
  }
  ```

---

## 2. Bộ Mã Nguồn Mẫu (Reusable Boilerplate)

### Bước 1: Tạo `src/common/interceptors/transform.interceptor.ts`
```typescript
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

        // 2. Bypass không bọc JSON nếu là stream file
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
```

### Bước 2: Đăng ký Global Interceptor trong `main.ts`
```typescript
app.useGlobalInterceptors(new TransformInterceptor());
```

---

## 3. Bức Tranh Tổng Thể Error & Response Của Hệ Thống
* **Success (200, 201):** Tự động đi qua `TransformInterceptor` $\to$ `{ success: true, statusCode, data, ... }`.
* **Business Exception (400, 404, 403, ...):** Dùng `throw ErrorHttpException(...)` $\to$ `{ code, success: false, type, msg }`.
