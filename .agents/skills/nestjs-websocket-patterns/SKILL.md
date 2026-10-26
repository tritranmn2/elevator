---
name: nestjs-websocket-patterns
description: >-
  Best practices for structuring NestJS WebSocket Gateways, Socket.IO integration,
  realtime event emitters, connection lifecycle management, and DTO validation in TypeScript.
  Use when creating WebSocket gateways, broadcasting real-time state, or handling two-way client-server events.
---

# NestJS & WebSocket Gateway Best Practices

Tài liệu hướng dẫn triển khai WebSocket Gateway và kiến trúc Realtime Event-Driven trong NestJS sử dụng `@nestjs/websockets` và `socket.io`.

---

## 1. Cấu Trúc Gateway Chuẩn

### 1.1. Lifecycle & Decorators
```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/elevator-ws',
})
export class ElevatorGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(ElevatorGateway.name);

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Broadcast Snapshot toàn hệ thống mỗi tick
  public broadcastSystemTick(payload: any) {
    this.server.emit('simulation:tick', payload);
  }

  // Phát event đặc thù (Delta event)
  public emitElevatorArrived(payload: { elevatorId: number; floor: number; direction: string }) {
    this.server.emit('elevator:arrived', payload);
  }
}
```

---

## 2. Chiến Lược Streaming Dữ Liệu (Snapshot vs Delta Events)

1. **Snapshot Stream (`simulation:tick`):**
   - Được phát định kỳ 1 giây/lần.
   - Chứa toàn bộ trạng thái của cả 3 thang máy (`currentFloor`, `direction`, `state`, `doorState`, `requestsQueue`).
   - Giúp Frontend React dễ dàng đồng bộ lại UI nếu có gói tin bị trễ hoặc khi mới F5 trang.

2. **Delta Events (Sự kiện tức thì):**
   - Được phát ngay khi trạng thái thay đổi (`elevator:arrived`, `elevator:door_opened`, `elevator:door_closed`).
   - Giúp Frontend kích hoạt ngay lập tức các hiệu ứng âm thanh, modal chọn tầng hoặc animation mà không cần đợi tick tiếp theo.

---

## 3. Tách Biệt Giữa Command (REST) Và Query/Stream (WebSocket)
* **REST API:** Dùng cho các hành động thay đổi trạng thái (Commands) như `POST /api/elevators/call`, `POST /api/elevators/:id/destination` để tận dụng NestJS Validation Pipes (`class-validator`) và HTTP Status Codes rõ ràng.
* **WebSocket:** Chuyên trách việc nhận phản hồi và phát sóng dữ liệu đa phương tiện theo thời gian thực (Real-time Broadcaster).
