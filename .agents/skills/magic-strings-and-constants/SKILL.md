---
name: magic-strings-and-constants
description: >-
  Strict guidelines for eliminating magic strings, magic numbers, and raw text literals from code.
  Mandates centralizing all WebSocket event names, API route paths, error messages, log prefixes,
  and domain string literals into structured constants or enums.
---

# No Magic Strings & Centralized Constants Guide

Tài liệu hướng dẫn và quy tắc bắt buộc về việc **loại bỏ 100% Magic Strings / Raw Text** trong toàn bộ mã nguồn dự án.

---

## 1. Nguyên Tắc Cốt Lõi (Zero Magic Strings Principle)

- **Không bao giờ viết chuỗi ký tự (raw string literal) trực tiếp trong logic:**
  - ❌ `socket.emit('simulation:tick', ...)`
  - ❌ `@Controller('api/elevators')`
  - ❌ `throw new Error('Floor must be between 1 and 10')`
  - ❌ `this.logger.log('Starting Simulation Engine')`

- **Bắt buộc tập trung toàn bộ vào Constants / Enums:**
  - ✅ `socket.emit(WS_EVENTS.SIMULATION_TICK, ...)`
  - ✅ `@Controller(API_ROUTES.ELEVATORS.ROOT)`
  - ✅ `throw new Error(ERROR_MESSAGES.INVALID_FLOOR_RANGE(min, max))`
  - ✅ `this.logger.log(LOG_MESSAGES.SIMULATION_ENGINE_STARTED)`

---

## 2. Phân Nhóm Constants Chuẩn Mực

```text
src/domain/constants/
├── elevator.constants.ts       # Số tầng, số thang máy, dwell time, tick rate
├── ws-events.constants.ts      # Toàn bộ tên WebSocket Event (simulation:tick, elevator:arrived,...)
├── api-routes.constants.ts     # Đường dẫn REST endpoints (api/elevators, call, destination,...)
└── error-messages.constants.ts # Tất cả thông báo lỗi và validation messages
```

---

## 3. Quy Ước Đặt Tên Constants
- Sử dụng `SCREAMING_SNAKE_CASE` cho tên hằng số và thuộc tính.
- Khai báo hằng số bằng `as const` của TypeScript để đảm bảo strict typing:

```typescript
export const WS_EVENTS = {
  SIMULATION_SNAPSHOT: 'simulation:snapshot',
  SIMULATION_TICK: 'simulation:tick',
  ELEVATOR_ARRIVED: 'elevator:arrived',
  DOOR_STATE_CHANGED: 'elevator:door_state_changed',
} as const;

export type WsEventType = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];
```
