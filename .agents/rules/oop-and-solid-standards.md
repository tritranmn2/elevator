# Quy Chuẩn Lập Trình OOP, SOLID & Clean Architecture Cho Dự Án Elevator

Tất cả các tác vụ lập trình Backend trong dự án phải tuân thủ nghiêm ngặt các nguyên tắc sau:

## 1. Clean Architecture & Phân Tách Tầng (Layer Separation)
- **Domain Layer (`src/domain/`):** Phải là **Pure TypeScript**. Tuyệt đối không import bất kỳ package framework nào (`@nestjs/*`, `socket.io`, `express`,...).
- **Application Layer (`src/application/` hoặc `src/modules/`):** Chịu trách nhiệm kết nối NestJS với Domain Model.

## 2. Tiêu Chuẩn OOP & SOLID
- **Encapsulation:** Trạng thái bên trong Entity (`Elevator`, `Door`) phải là `private` hoặc `protected`. Không dùng public properties để gán trực tiếp.
- **Inheritance & Polymorphism:** Sử dụng phân cấp `ElevatorRequest` để thay thế các câu lệnh `if-else` kiểm tra loại request bằng các phương thức đa hình (ví dụ: `canBeServedBy()`).
- **Strategy Pattern:** Việc chọn thang máy phục vụ phải được trừu tượng hóa qua interface `ElevatorSelectionStrategy`.
- **Single Responsibility (SRP):** Tách biệt rõ ràng trách nhiệm giữa Quản lý trạng thái cửa (`Door`), Quản lý di chuyển (`Elevator`), và Phân bổ điều phối (`Dispatcher`).
