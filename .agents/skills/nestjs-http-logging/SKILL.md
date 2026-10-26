---
name: nestjs-http-logging
description: >-
  Best practices for HTTP Request Lifecycle Tracking in NestJS with Winston, Daily Rotate File,
  and Chalk Color Formatting. Automatically logs START, END with execution duration (ms),
  and detailed ERROR traces across all endpoints.
---

# NestJS HTTP Lifecycle Logging Guide (Winston + Daily Rotate File)

Tài liệu hướng dẫn triển khai module ghi nhật ký HTTP (HTTP Request Lifecycle Tracking) trong NestJS kết hợp giữa **Winston Daily Rotate File** (ghi file quay vòng tự động) và **Chalk** (định dạng màu trực quan trên terminal).

---

## 1. Vòng Đời Ghi Nhật Ký (Request Lifecycle)

```text
Incoming Request
      │
      ▼
[1. START LOG] ──────► In ra: Client IP, User (ID, Email), Method, Path, URL, Payload
      │
      ├───► (Chạy qua Controller, Services, Database) ──► Đo thời gian thực thi (Date.now() - now)
      │
      ├──── [2. SUCCESS END LOG] (tap)  ──► In ra: Execution Time (ms), Status Code, DONE
      │
      └──── [3. ERROR LOG] (catchError) ──► In ra: Error Type, Error Message, Status Code
```

### Ví dụ Output trên Console / File Log:

* **Khi Request đến (START):**
  ```text
  [2026-09-29 23:24:00] - [info] - [127.0.0.1] - START | USER: - - - | StatusCode: 200 | POST | PATH: /api/elevators/call | URL: /api/elevators/call | PAYLOAD: {"floor":5,"direction":"UP"}
  ```

* **Khi Thành công (END):**
  ```text
  [2026-09-29 23:24:00] - [info] - [127.0.0.1] - END | USER: - - - | StatusCode: 200 | PATH: /api/elevators/call | URL: /api/elevators/call | TIME: [15ms] | PAYLOAD: {"floor":5,"direction":"UP"} - DONE
  ```

* **Khi Xảy ra lỗi (ERROR):**
  ```text
  [2026-09-29 23:24:00] - [error] - [127.0.0.1] - USER: - - - | StatusCode: 400 | PATH: /api/elevators/call | URL: /api/elevators/call | TYPE: CANNOT_CALL_UP_HIGHEST | ERROR: Không thể gọi UP ở tầng cao nhất | PAYLOAD: {"floor":10,"direction":"UP"}
  ```

---

## 2. Cài Đặt Thư Viện Cần Thiết

```bash
yarn add winston winston-daily-rotate-file chalk@^4.1.2 moment
```
*(Lưu ý: `chalk@^4.1.2` tương thích hoàn hảo với môi trường CommonJS và Jest của NestJS)*

---

## 3. Cấu Trúc File & Mã Nguồn Trọn Gói

```text
src/common/
├── helpers/
│   └── log-formatter.helper.ts     # Định dạng chuỗi log màu mè với Chalk
├── loggers/
│   ├── logger.service.ts           # AppLogger quản lý Winston Console + Daily Rotate File
│   └── logger.module.ts            # Global Module tự động gắn HttpLoggingInterceptor
└── interceptors/
    └── http-logging.interceptor.ts # Interceptor bắt chu trình START -> END / ERROR
```

### 3.1. File Helper: `src/common/helpers/log-formatter.helper.ts`
```typescript
import chalk from 'chalk';

export class LogFormatter {
  private static labels = {
    path: chalk.bold.magenta('PATH:'),
    url: chalk.bold.magenta('URL:'),
    payload: chalk.bold.magenta('PAYLOAD:'),
    time: chalk.bold.magenta('TIME:'),
    type: chalk.bold.magenta('TYPE:'),
    error: chalk.bold.red('ERROR:'),
    user: chalk.bold.yellow('USER:'),
  };

  private static userInfo(request: any) {
    return `${this.labels.user} ${chalk.cyan(request?.user?.id ?? '-')} - ${chalk.yellow(
      request?.user?.email ?? request?.user?.phone ?? '-',
    )}`;
  }

  private static getErrorInfo(error: any) {
    return {
      status: error.response?.statusCode ?? error.status ?? 500,
      type: error.response?.error ?? error.response?.type ?? error.name ?? 'UnknownError',
      message:
        error.response?.message ??
        error.response?.msg ??
        error.message ??
        'Unknown message',
    };
  }

  static start(request: any): string {
    return `START | ${this.userInfo(request)} | ${chalk.green(
      'StatusCode: ' + (request?.res?.statusCode ?? 200),
    )} | ${chalk.magenta(request.method?.toUpperCase())} | ${
      this.labels.path
    } ${request.route?.path ?? request.path} | ${this.labels.url} ${
      request.url
    } | ${this.labels.payload} ${JSON.stringify(request.body ?? {})}`;
  }

  static end(request: any, responseTime: number): string {
    return `END | ${this.userInfo(request)} | ${chalk.green(
      'StatusCode: ' + (request?.res?.statusCode ?? 200),
    )} | ${this.labels.path} ${request.route?.path ?? request.path} | ${
      this.labels.url
    } ${request.url} | ${this.labels.time} [${responseTime}ms] | ${
      this.labels.payload
    } ${JSON.stringify(request.body ?? {})} - DONE`;
  }

  static error(request: any, error: any): string {
    const { status, type, message } = this.getErrorInfo(error);
    return `${this.userInfo(request)} | ${chalk.red(
      'StatusCode: ' + status,
    )} | ${this.labels.path} ${request.route?.path ?? request.path} | ${
      this.labels.url
    } ${request.url} | ${this.labels.type} ${type} | ${
      this.labels.error
    } ${typeof message === 'object' ? JSON.stringify(message) : message} | ${
      this.labels.payload
    } ${JSON.stringify(request.body ?? {})}`;
  }
}
```

### 3.2. File Module: `src/common/loggers/logger.module.ts`
```typescript
import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpLoggingInterceptor } from '../interceptors/http-logging.interceptor';
import { AppLogger } from './logger.service';

@Global()
@Module({
  providers: [
    AppLogger,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
  ],
  exports: [AppLogger],
})
export class LoggerModule {}
```
Chỉ cần import `LoggerModule` vào `AppModule`, toàn bộ các request vào hệ thống sẽ được tự động log đầy đủ mà không cần cấu hình thêm ở từng Controller.
