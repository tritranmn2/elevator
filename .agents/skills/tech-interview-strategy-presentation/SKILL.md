---
name: tech-interview-strategy-presentation
description: >-
  Framework and strategy guide for presenting technical take-home projects in senior engineering
  interviews. Includes slide structures, architecture trade-off discussions, algorithm defense,
  system scalability explanations, and handling tough questions from interviewers.
---

# Hướng Dẫn Chuẩn Bị Thuyết Trình Chiến Lược Phỏng Vấn Kỹ Thuật (45 Phút)

Cẩm nang cấu trúc và chiến lược trình bày đồ án Elevator Simulation trong vòng phỏng vấn thứ 2 với Hội đồng phỏng vấn (45 phút).

---

## 1. Cấu Trúc Khung Trình Bày 45 Phút (Presentation Outline)

```text
[00:00 - 05:00]  1. Giới thiệu tổng quan & Phân tích bài toán
[05:00 - 15:00]  2. Kiến trúc Hệ thống & Thiết kế OOP / Clean Architecture
[15:00 - 25:00]  3. Thuật toán Điều phối (Dispatcher Strategy & LOOK Algorithm)
[25:00 - 32:00]  4. Thiết kế Realtime Simulation & State Machine
[32:00 - 38:00]  5. Live Demo & Unit Test Walkthrough
[38:00 - 45:00]  6. Khả năng Mở rộng (Scalability) & Hỏi - Đáp (Q&A)
```

---

## 2. Chiến Lược Giải Thích Quyết Định Kỹ Thuật (Trade-off Justifications)

### 2.1. Tại sao dùng In-memory State thay vì Cơ sở dữ liệu (PostgreSQL/MongoDB)?
* **Lập luận:**
  * Thang máy là một hệ thống vật lý mô phỏng theo thời gian thực (Soft Realtime Simulation) với chu kỳ 1s/tick.
  * Tần suất cập nhật vị trí và trạng thái cửa là liên tục. Việc đọc/ghi DB ở mỗi tick sẽ tạo I/O bottleneck không cần thiết và tăng độ trễ.
  * *Mở rộng thực tế:* Trong môi trường production quy mô lớn, in-memory state được lưu tại node điều khiển (Actor Model) hoặc Redis Cluster kết hợp Write-behind logging để lưu audit logs.

### 2.2. Tại sao chọn LOOK Algorithm thay vì FCFS hoặc SCAN?
* **FCFS (First-Come, First-Served):** Quá kém hiệu quả, gây ra tình trạng thang máy chạy con thoi hỗn loạn giữa các tầng, lãng phí năng lượng và tăng thời gian chờ.
* **SCAN thuần túy:** Bắt buộc thang phải chạy chạm đáy (Floor 1) và kịch nóc (Floor 10) mới đổi chiều, gây lãng phí hành trình nếu không có ai ở các tầng biên.
* **LOOK Algorithm (Giải pháp tối ưu):** Chỉ di chuyển đến tầng xa nhất có yêu cầu theo chiều hiện tại rồi lập tức đổi chiều, giúp tối thiểu hóa năng lượng và thời gian phục vụ hành khách.

---

## 3. Bộ Câu Hỏi "Bẫy" Phổ Biến & Cách Trả Lời Chuẩn Mực

### Q1: Nếu tòa nhà mở rộng lên 100 tầng và 20 thang máy thì kiến trúc này scale thế nào?
* **Trả lời:**
  1. **Zone Partitioning (Phân tầng):** Chia 20 thang thành các cụm (Group A: Tầng 1-30, Group B: Tầng 30-60, Group C: Express tầng 1 $\to$ 60-100).
  2. **Destination Dispatching System:** Yêu cầu hành khách chọn tầng đích ngay tại sảnh trước khi bước vào thang. Thuật toán sẽ nhóm những người đi cùng tầng vào chung một cabin.
  3. **Actor Model (Erlang/Akka/Node Worker Threads):** Mỗi thang máy là một Actor độc lập giao tiếp qua Message Passing.

### Q2: Tính đa hình (Polymorphism) được thể hiện ở đâu rõ nhất trong code của bạn?
* **Trả lời:**
  * Thể hiện ở lớp trừu tượng `ElevatorRequest` với các lớp con `UpHallRequest`, `DownHallRequest`, và `DestinationRequest`.
  * Thay vì dùng `switch(request.type)`, tôi để mỗi loại request tự thực thi phương thức `canBeServedBy(elevator)` dựa trên ngữ cảnh hướng và vị trí hiện tại của thang máy.
