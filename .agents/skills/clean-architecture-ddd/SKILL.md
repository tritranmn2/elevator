---
name: clean-architecture-ddd
description: >-
  Guidelines and best practices for implementing Clean Architecture and Domain-Driven Design (DDD)
  in TypeScript/Node.js backend projects. Use when designing domain entities, aggregate roots,
  value objects, repositories, domain services, and maintaining separation of concerns between
  pure business logic and infrastructure frameworks.
---

# Clean Architecture & Domain-Driven Design (DDD) Guide

Tài liệu hướng dẫn áp dụng Kiến trúc Tinh gọn (Clean Architecture) và Thiết kế Hướng Tên miền (Domain-Driven Design - DDD) cho các dự án TypeScript/Node.js.

---

## 1. Nguyên Tắc Phụ Thuộc (Dependency Rule)

```text
+-------------------------------------------------------+
|  Presentation / Infrastructure Layer (NestJS / WS)   |
|     +-----------------------------------------------+ |
|     |  Application Layer (Services, Use Cases)      | |
|     |     +---------------------------------------+ | |
|     |     |  Domain Layer (Entities, Aggregates)  | | |
|     |     |  * Pure TypeScript                    | | |
|     |     |  * Zero external framework imports    | | |
|     |     +---------------------------------------+ | |
|     +-----------------------------------------------+ |
+-------------------------------------------------------+
```

1. **Lớp Domain (Tâm kiến trúc - Tâm điểm dự án):**
   - Chứa các thực thể (`Entity`), Đối tượng giá trị (`Value Object`), Đối tượng tập hợp (`Aggregate Root`), và Giao diện (`Interfaces / Strategies`).
   - **Bắt buộc:** Viết bằng Pure TypeScript, tuyệt đối không phụ thuộc (import) bất kỳ thư viện framework nào (`@nestjs/*`, `express`, `typeorm`, `socket.io`,...).
   - Đảm bảo có thể chạy và kiểm thử độc lập 100% bằng Unit Tests thuần túy.

2. **Lớp Application (Điều phối nghiệp vụ):**
   - Chứa Application Services, Use Cases, DTOs điều phối luồng dữ liệu từ bên ngoài vào Domain Layer.
   - Không chứa logic nghiệp vụ cốt lõi (logic cốt lõi phải nằm trong Entity/Domain Service).

3. **Lớp Infrastructure & Presentation (Giao tiếp ngoại vi):**
   - Chứa Controllers, WebSocket Gateways, DTO Validators (`class-validator`), Repositories, Timers / Simulation loops.
   - Phụ thuộc vào Application Layer và Domain Layer, không bao giờ ngược lại.

---

## 2. Các Thành Phần Cốt Lõi Của DDD

### 2.1. Entity & Encapsulation
- Mỗi Entity có danh tính duy nhất (`id`), đóng gói dữ liệu nội bộ qua `private`/`protected` fields.
- Mọi biến đổi trạng thái phải thông qua các phương thức nghiệp vụ có ý nghĩa (Domain Methods), không dùng public setter tùy tiện.

### 2.2. Aggregate Root
- Quản lý vòng đời và tính toàn vẹn dữ liệu của một nhóm thực thể liên quan (ví dụ: `ElevatorSystem` quản lý 3 `Elevator` và điều phối yêu cầu).
- Mọi tương tác từ bên ngoài vào nhóm thực thể phải đi qua Aggregate Root.

### 2.3. Domain Events
- Khi có sự thay đổi trạng thái quan trọng (ví dụ: Thang đến tầng `elevator:arrived`, cửa mở `elevator:door_opened`), Domain sinh ra Event để Application / Presentation layer phân phát ra ngoài mà không làm vấy bẩn logic lõi.
