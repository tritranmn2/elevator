---
name: oop-solid-design-patterns
description: >-
  Comprehensive guide and best practices for applying Object-Oriented Programming (OOP)
  pillars (Encapsulation, Inheritance, Polymorphism, Abstraction), SOLID principles, and
  GoF design patterns (Strategy, State, Factory, Observer) in TypeScript. Use when designing
  domain models, refactoring conditional logic, or preparing technical interview presentations.
---

# OOP, SOLID & Design Patterns Best Practices

Tài liệu hướng dẫn thực hành Lập trình Hướng đối tượng (OOP), Nguyên lý SOLID và Các mẫu thiết kế (Design Patterns) trong TypeScript.

---

## 1. Bốn Trụ Cột OOP (Four Pillars of OOP)

### 1.1. Tính Đóng Gói (Encapsulation)
- **Quy tắc:** Bảo vệ trạng thái nội bộ của đối tượng bằng cách đặt các biến thành `private` hoặc `protected`.
- **Hành vi:** Cung cấp các phương thức có tên rõ nghĩa theo nghiệp vụ (`move()`, `openDoor()`, `assignRequest()`), không cung cấp các getter/setter vô nghĩa làm rò rỉ trạng thái.
- **Tính bất biến (Invariants):** Đối tượng tự chịu trách nhiệm kiểm tra tính hợp lệ trước khi chuyển trạng thái (ví dụ: Không cho phép di chuyển nếu cửa chưa đóng).

### 1.2. Tính Kế Thừa (Inheritance)
- **Quy tắc:** Trích xuất các thuộc tính và hành vi chung vào lớp trừu tượng cơ sở (`abstract class ElevatorRequest`).
- **Mở rộng:** Các lớp con (`UpHallRequest`, `DownHallRequest`, `DestinationRequest`) kế thừa lớp cơ sở và bổ sung các đặc trưng riêng.
- **Lưu ý:** Ưu tiên kế thừa khi có mối quan hệ rõ ràng "IS-A" (Là một loại).

### 1.3. Tính Đa Hình (Polymorphism)
- **Quy tắc:** Thay thế các chuỗi `if-else` hoặc `switch-case` phức tạp dựa trên loại (`type`) bằng cách gọi phương thức trừu tượng đa hình.
- **Ví dụ thực tế:** Thay vì kiểm tra `if (request.type === 'UP') ...`, gọi trực tiếp `request.canBeServedBy(elevator)` để từng loại request tự đưa ra quyết định dựa trên ngữ cảnh của thang máy.

### 1.4. Tính Trừu Tượng (Abstraction)
- **Quy tắc:** Ẩn đi chi tiết cài đặt phức tạp sau các `interface` hoặc `abstract class`. Người sử dụng chỉ cần quan tâm đến hợp đồng giao tiếp (Contract) mà không cần biết logic bên trong hoạt động ra sao.

---

## 2. Nguyên Lý SOLID Trong TypeScript

| Nguyên lý | Tên đầy đủ | Cách áp dụng trong dự án Elevator |
| :--- | :--- | :--- |
| **S** | Single Responsibility Principle | Mỗi class chỉ chịu 1 trách nhiệm: `Door` chỉ lo trạng thái cửa/timer, `Elevator` chỉ lo chuyển động/dừng, `Dispatcher` chỉ lo chọn thang tối ưu. |
| **O** | Open/Closed Principle | Mở rộng thuật toán phân bổ bằng cách thêm class mới implements `ElevatorSelectionStrategy` mà không cần sửa code của `ElevatorDispatcher`. |
| **L** | Liskov Substitution Principle | Bất kỳ lớp con nào của `ElevatorRequest` (`UpHallRequest`, `DownHallRequest`) đều có thể thay thế cho `ElevatorRequest` mà không làm hỏng tính đúng đắn của hệ thống. |
| **I** | Interface Segregation Principle | Tạo các interface nhỏ gọn, tập trung (ví dụ: `ElevatorSelectionStrategy`, `SimulationTicker`) thay vì một interface "vạn năng" khổng lồ. |
| **D** | Dependency Inversion Principle | Các module cấp cao (`ElevatorSystem`) phụ thuộc vào trừu tượng (`ElevatorSelectionStrategy`) chứ không phụ thuộc trực tiếp vào cài đặt cụ thể (`NearestSuitableStrategy`). |

---

## 3. Các Design Patterns Trọng Tâm

### 3.1. Strategy Pattern (Mẫu Chiến Lược)
- **Mục đích:** Đóng gói thuật toán lựa chọn thang máy vào các đối tượng riêng biệt có thể hoán đổi linh hoạt khi runtime.
- **Triển khai:** `ElevatorSelectionStrategy` $\to$ `NearestSuitableElevatorStrategy`, `EcoFriendlyStrategy`, `LoadBalancingStrategy`.

### 3.2. State Pattern / State Machine
- **Mục đích:** Kiểm soát các trạng thái hữu hạn của thang máy (`IDLE`, `MOVING_UP`, `MOVING_DOWN`, `DOOR_OPENING`, `DOOR_OPEN`, `DOOR_CLOSING`) và định nghĩa rõ ràng các bước chuyển tiếp hợp lệ.
