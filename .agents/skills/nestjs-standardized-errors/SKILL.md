---
name: nestjs-standardized-errors
description: >-
  Best practice and implementation guide for Standardized Error Responses in NestJS.
  Enforces a centralized ErrorCode dictionary, CustomErrorException extending HttpException,
  and ErrorHttpException factory function to decouple network HTTP status codes from business error codes.
---

# NestJS Standardized Error Response Guide

Tài liệu hướng dẫn chuẩn hóa cấu trúc lỗi trả về trong NestJS (Standardized Error Response), phân tách rõ ràng giữa **HTTP Status Code** (giao thức mạng) và **Business Error Code** (mã lỗi nghiệp vụ).

---

## 1. Cấu Trúc Payload Chuẩn Trả Về Client

```json
{
  "code": 4400,
  "success": false,
  "type": "INVALID_FLOOR_RANGE",
  "msg": "Tầng yêu cầu phải nằm trong khoảng từ 1 đến 10"
}
```

* **HTTP Header Status:** `400 Bad Request` (hoặc `404 Not Found`, `403 Forbidden`,...).
* **Body JSON:** Chứa mã định danh `code` (số nguyên), `type` (chuỗi hằng số chuẩn hóa), và `msg` (thông điệp chi tiết).

---

## 2. Kiến Trúc 3 Tầng Xử Lý Lỗi

```text
[ Controller / Service / Handler ]
             │
             ▼ throw ErrorHttpException(HttpStatus.NOT_FOUND, ErrorCode.ELEVATOR_NOT_FOUND)
[ CustomErrorException (extends HttpException) ]
             │
             ▼ (NestJS Built-in Serialization)
[ Client JSON Response ]
```

---

## 3. Bộ Mã Nguồn Mẫu (Reusable Boilerplate)

### Bước 1: Từ điển mã lỗi `src/common/config/error-code.config.ts`
```typescript
export interface IError {
  code: number;
  type: string;
  msg: string;
  count?: number;
}

export const ErrorCode = {
  // Lỗi hệ thống cơ bản
  BACKEND: { code: 5000, type: 'ERROR_BACKEND', msg: 'Internal Server Error' },
  BAD_REQUEST: { code: 4000, type: 'BAD_REQUEST', msg: 'Bad Request' },
  UNAUTHORIZED: { code: 4010, type: 'UNAUTHORIZED', msg: 'Unauthorized' },
  FORBIDDEN: { code: 4030, type: 'FORBIDDEN', msg: 'Forbidden' },
  NOT_FOUND: { code: 4040, type: 'NOT_FOUND', msg: 'Not Found' },
  VALIDATION_ERROR: { code: 4220, type: 'VALIDATION_ERROR', msg: 'Validation Error' },

  // Domain Thang Máy (Elevator)
  ELEVATOR_NOT_FOUND: { code: 4401, type: 'ELEVATOR_NOT_FOUND', msg: 'Thang máy không tồn tại' },
  INVALID_FLOOR_RANGE: { code: 4402, type: 'INVALID_FLOOR_RANGE', msg: 'Tầng vượt quá giới hạn cho phép' },
  CANNOT_CALL_UP_HIGHEST: { code: 4403, type: 'CANNOT_CALL_UP_HIGHEST', msg: 'Không thể gọi UP ở tầng cao nhất' },
  CANNOT_CALL_DOWN_LOWEST: { code: 4404, type: 'CANNOT_CALL_DOWN_LOWEST', msg: 'Không thể gọi DOWN ở tầng thấp nhất' },
  DOOR_CANNOT_OPEN_MOVING: { code: 4405, type: 'DOOR_CANNOT_OPEN_MOVING', msg: 'Không thể mở cửa khi thang đang di chuyển' },
} as const;

export type ErrorCodeKey = keyof typeof ErrorCode;
export default ErrorCode;
```

### Bước 2: Factory Exception `src/common/exceptions/custom-http.exception.ts`
```typescript
import { HttpException, HttpStatus } from '@nestjs/common';
import ErrorCode, { IError } from '../config/error-code.config';

export class CustomErrorException extends HttpException {
  constructor(
    statusCode: HttpStatus,
    code: number,
    type: string,
    msg: string,
    count?: number,
  ) {
    super(
      {
        code,
        success: false,
        type,
        msg,
        ...(count !== undefined ? { count } : {}),
      },
      statusCode,
    );
  }
}

export const ErrorHttpException = (
  httpStatus: HttpStatus,
  error?: IError,
): CustomErrorException => {
  return new CustomErrorException(
    httpStatus,
    error?.code ?? ErrorCode.BACKEND.code,
    error?.type ?? ErrorCode.BACKEND.type,
    error?.msg ?? ErrorCode.BACKEND.msg,
    error?.count,
  );
};
```

### Bước 3: Sử dụng trong Service / Controller
```typescript
if (!elevator) {
  throw ErrorHttpException(HttpStatus.NOT_FOUND, ErrorCode.ELEVATOR_NOT_FOUND);
}
```

---

## 4. Lợi Điểm Khi Áp Dụng
1. **Không Hardcode String:** Mọi message & code được quản lý tập trung ở `ErrorCode`.
2. **Hỗ trợ Đa Ngôn Ngữ & Frontend/Mobile:** Client có thể bắt `type` để hiển thị popup/icon tương ứng mà không phụ thuộc vào chuỗi text thô.
3. **Tự động tương thích NestJS:** Do kế thừa trực tiếp từ `HttpException`, NestJS tự serialize sang JSON mà không bắt buộc cấu hình ExceptionFilter phức tạp.
