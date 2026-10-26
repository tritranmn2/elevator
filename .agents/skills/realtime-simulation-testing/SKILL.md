---
name: realtime-simulation-testing
description: >-
  Best practices for building and unit-testing deterministic simulation engines,
  tick-based loops, state machine transitions, timer counters, and asynchronous event streams
  in Node.js / TypeScript. Use when designing tick engines, fake timer tests, or event emitter pipelines.
---

# Realtime Simulation & Deterministic Testing Guide

Hướng dẫn xây dựng và kiểm thử động cơ mô phỏng thời gian thực (Deterministic Simulation Engine) và máy trạng thái (State Machine) trong Node.js/TypeScript.

---

## 1. Nguyên Tắc Thiết Kế Deterministic Simulation Loop

### 1.1. Tách Rời Nhịp Mô Phỏng (Tick) Khỏi Hệ Thống Thực Tế
- **Tick-based Simulation:** Mọi thay đổi về vị trí, hướng di chuyển, và trạng thái cửa của thang máy chỉ xảy ra tại các bước nhảy thời gian rời rạc (`tick()`).
- **Deterministic:** Với cùng một chuỗi các request đầu vào, hệ thống chạy $N$ ticks phải luôn cho ra cùng một kết quả duy nhất (không phụ thuộc vào tốc độ CPU hay độ trễ mạng).

```typescript
// Pattern: Pure domain tick
export class ElevatorSystem {
  public tick(): ElevatorEvent[] {
    const events: ElevatorEvent[] = [];
    for (const elevator of this.elevators) {
      const elevatorEvents = elevator.tick();
      events.push(...elevatorEvents);
    }
    return events;
  }
}
```

### 1.2. Tránh Race Condition Trong Memory
- Các lệnh gọi từ REST Controller/WebSocket được đẩy vào hàng đợi tiếp nhận (`incomingRequests`).
- Khi động cơ gọi `tick()`, hàng đợi này sẽ được xử lý tuần tự trước khi cập nhật vị trí di chuyển của các thang máy.

---

## 2. Best Practices Viết Unit Test Bằng Jest Fake Timers

### 2.1. Kiểm Thử Vòng Đời Cửa (Door Dwell Timer)
Sử dụng `jest.useFakeTimers()` hoặc gọi trực tiếp `tick()` liên tiếp để kiểm thử chuyển trạng thái mà không cần chờ thời gian thật:

```typescript
describe('Door Dwell Timer Lifecycle', () => {
  it('should remain open for 3 ticks then automatically close', () => {
    const door = new Door(3); // 3 ticks dwell
    door.open();
    expect(door.getState()).toBe(DoorState.OPEN);

    door.tick(); // Dwell tick 1 -> remaining 2
    expect(door.getState()).toBe(DoorState.OPEN);

    door.tick(); // Dwell tick 2 -> remaining 1
    expect(door.getState()).toBe(DoorState.OPEN);

    door.tick(); // Dwell tick 3 -> timer expired -> starts closing
    expect(door.getState()).toBe(DoorState.CLOSING);

    door.tick(); // Closed completely
    expect(door.getState()).toBe(DoorState.CLOSED);
  });
});
```

### 2.2. Kiểm Thử Thuật Toán Di Chuyển Không Dừng Ngược Chiều
```typescript
it('should pick up passengers going up and ignore down calls on the way up', () => {
  const elevator = new Elevator(1); // Floor 1
  elevator.assignHallRequest(new UpHallRequest(5));
  elevator.assignHallRequest(new DownHallRequest(4));

  // Di chuyển từ tầng 1 lên tầng 5
  while (elevator.getCurrentFloor() < 5) {
    elevator.tick();
  }

  // Phải dừng ở tầng 5 (UP) và KHÔNG dừng ở tầng 4 (DOWN) trong lượt lên
  expect(elevator.getCurrentFloor()).toBe(5);
  expect(elevator.getDoorState()).toBe(DoorState.OPEN);
});
```
