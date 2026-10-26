# Comprehensive Elevator Test Suite Implementation Plan

- **Timestamp:** 2026-09-30 18:44
- **Objective:** Thiết kế và triển khai bộ kiểm thử tự động toàn diện (Unit & Integration Tests) bao phủ 12 nhóm kiểm thử (34 test cases) từ chuyển động cơ bản, thuật toán SCAN (LOOK), điều phối phân bổ Dispatcher cho 3 thang máy, an toàn cửa, biên dữ liệu và tình huống thực tế phức tạp.

---

## 1. Bối Cảnh & Mục Tiêu Kỹ Thuật (Context & Requirements)

Hệ thống điều khiển thang máy (`elevator-be`) được xây dựng theo kiến trúc Clean Architecture & Domain-Driven Design (DDD):
- **Động cơ mô phỏng thời gian thực (Deterministic Tick Engine):** Mọi sự kiện và chuyển động cập nhật rời rạc theo từng `tick()`.
- **Thuật toán lập lịch thang đơn (SCAN / LOOK Scheduling):** Thang máy phục vụ tất cả các yêu cầu cùng hướng phía trước trước khi đổi hướng phục vụ các yêu cầu phía sau/ngược chiều.
- **Bộ điều phối cụm thang (Dispatcher Strategy):** Phân bổ Hall Call thông minh cho 3 thang máy dựa trên độ tương thích hướng di chuyển, khoảng cách và chi phí thời gian chờ.

---

## 2. Danh Mục 34 Test Cases Chi Tiết (12 Nhóm Kiểm Thử)

### Nhóm 1: Basic Elevator Movement (Tests 1 – 6)
- **Test 1:** E1 tại tầng 1 (IDLE), gọi E1 đến tầng 5 $\rightarrow$ Di chuyển tuần tự $1 \rightarrow 2 \rightarrow 3 \rightarrow 4 \rightarrow 5$, dừng và mở cửa tại tầng 5.
- **Test 2:** E1 tại tầng 5, chọn tầng 2 $\rightarrow$ Di chuyển tuần tự $5 \rightarrow 4 \rightarrow 3 \rightarrow 2$.
- **Test 3:** E1 tại tầng 1, chọn tầng 10 $\rightarrow$ Di chuyển tuần tự $1 \rightarrow \dots \rightarrow 10$.
- **Test 4:** E1 tại tầng 10, chọn tầng 1 $\rightarrow$ Di chuyển tuần tự $10 \rightarrow \dots \rightarrow 1$.
- **Test 5:** E1 tại tầng 5, chọn tầng 5 $\rightarrow$ Không di chuyển, mở cửa tại chỗ.
- **Test 6:** E1 tại tầng 1, không có request $\rightarrow$ Giữ nguyên trạng thái `IDLE` qua các ticks.

### Nhóm 2: Hall Request + SCAN Algorithm (Tests 7 – 10)
- **Test 7 (UP request cùng hướng):** E1 ($1 \rightarrow 10$), Hall Call: Tầng 5 UP $\rightarrow$ Lộ trình $1 \rightarrow 5 \rightarrow 10$ (dừng đón khách tại tầng 5).
- **Test 8 (DOWN request ngược hướng):** E1 ($1 \rightarrow 10$), Hall Call: Tầng 5 DOWN $\rightarrow$ Lộ trình $1 \rightarrow 10 \rightarrow 5$ (không dừng tầng 5 lúc đi lên; phục vụ sau khi đã lên tầng 10 và quay đầu).
- **Test 9 (Elevator đang DOWN):** E1 ($10 \rightarrow 1$), Hall Call: Tầng 5 DOWN $\rightarrow$ Lộ trình $10 \rightarrow 5 \rightarrow 1$ (dừng tầng 5).
- **Test 10 (Elevator DOWN, request UP):** E1 ($10 \rightarrow 1$), Hall Call: Tầng 5 UP $\rightarrow$ Lộ trình $10 \rightarrow 1 \rightarrow 5$ (không dừng tầng 5 lúc đi xuống).

### Nhóm 3: Nhiều Hall Request cùng hướng (Tests 11 – 12)
- **Test 11 (SCAN cùng chiều):** E1 tại tầng 1, Dest 10, Hall Calls: Tầng 3 UP, Tầng 5 UP, Tầng 7 UP $\rightarrow$ Lộ trình $1 \rightarrow 3 \rightarrow 5 \rightarrow 7 \rightarrow 10$ (không nhảy cóc $1 \rightarrow 7 \rightarrow 3 \dots$).
- **Test 12 (Request đến bất quy tắc):** E1 ($1 \rightarrow 10$), nhận lần lượt: Tầng 7 UP $\rightarrow$ Tầng 3 UP $\rightarrow$ Tầng 5 UP $\rightarrow$ Vẫn tự sắp xếp theo lộ trình SCAN $1 \rightarrow 3 \rightarrow 5 \rightarrow 7 \rightarrow 10$.

### Nhóm 4: Request xuất hiện khi thang đang chạy (Tests 13 – 15)
- **Test 13 (Request phía trước):** E1 ($1 \rightarrow 10$) đang qua tầng 3, xuất hiện Tầng 5 UP $\rightarrow$ Tiếp tục lên $3 \rightarrow 5 \rightarrow 10$.
- **Test 14 (Request phía sau):** E1 ($1 \rightarrow 10$) đã lên tầng 5, xuất hiện Tầng 3 UP $\rightarrow$ Đi hết $5 \rightarrow 10$ rồi mới quay lại tầng 3 ($5 \rightarrow 10 \rightarrow 3$), không quay đầu đột ngột.
- **Test 15 (Request ngược hướng phía sau):** E1 ($1 \rightarrow 10$) đang ở tầng 5, xuất hiện Tầng 3 DOWN $\rightarrow$ Lộ trình $5 \rightarrow 10 \rightarrow 3$.

### Nhóm 5: Destination Request bên trong Cabin (Tests 16 – 18)
- **Test 16 (Hành khách vào tại các tầng):** Khách tại tầng 1 chọn Dest=7; tại tầng 5 khách mới vào chọn Dest=9 $\rightarrow$ Lộ trình $1 \rightarrow 5 \rightarrow 7 \rightarrow 9$.
- **Test 17 (Chọn nhiều tầng cùng lúc):** Đang tại tầng 1 (UP), bấm chọn [10, 5, 8] $\rightarrow$ Sắp xếp theo SCAN: $1 \rightarrow 5 \rightarrow 8 \rightarrow 10$.
- **Test 18 (Destination phía sau chiều chạy):** Tại tầng 1 hướng lên 10, khi qua tầng 5 ai đó bấm tầng 3 $\rightarrow$ Lộ trình $1 \rightarrow 10 \rightarrow 3$.

### Nhóm 6: Điều phối 3 Thang Máy (3 Elevators Dispatcher) (Tests 19 – 21)
- **Test 19 (Tất cả IDLE):** E1=1, E2=1, E3=1, Hall Call: Tầng 5 UP $\rightarrow$ Dispatcher phân bổ chính xác cho 1 thang duy nhất, không có 2-3 thang cùng chạy.
- **Test 20 (Ưu tiên thang đang cùng chiều phù hợp):** E1 ($1 \rightarrow 10$), E2 (8 IDLE), E3 (9 IDLE), Call Tầng 5 UP $\rightarrow$ E1 được phân bổ vì tiện đường đón khách ($1 \rightarrow 5 \rightarrow 10$).
- **Test 21 (Ưu tiên thang gần nhất khi IDLE):** E1 (1 IDLE), E2 (4 IDLE), E3 (9 IDLE), Call Tầng 5 UP $\rightarrow$ E2 gần tầng 5 nhất ($|4 - 5| = 1$) được điều phối.

### Nhóm 7: Dispatcher + Direction Scoring (Tests 22 – 23)
- **Test 22 (Loại trừ thang chạy ngược chiều):** E1 ($1 \rightarrow 10$ UP), E2 ($8 \rightarrow 1$ DOWN), E3 (5 IDLE), Call Tầng 6 UP $\rightarrow$ E2 (ngược chiều) bị loại hoặc điểm phạt cao; E1 hoặc E3 được chọn phù hợp.
- **Test 23 (Nhiều thang cùng hướng - chọn thang tối ưu chi phí):** E1 ($1 \rightarrow 10$ UP), E2 ($8 \rightarrow 1$ DOWN), E3 ($3 \rightarrow 8$ UP), Call Tầng 5 UP $\rightarrow$ E3 gần hơn E1 nên được ưu tiên đón tại tầng 5 ($3 \rightarrow 5 \rightarrow 8$).

### Nhóm 8: Vòng Đời Cửa & An Toàn (Door Safety & Lifecycle) (Tests 24 – 27)
- **Test 24 (Mở cửa):** E1 tại tầng 5, gọi `pressOpenDoor()` $\rightarrow$ Trạng thái chuyển sang `OPEN`.
- **Test 25 (Đóng cửa):** E1 tại tầng 5 (`OPEN`), gọi `pressCloseDoor()` $\rightarrow$ Trạng thái chuyển sang `CLOSED`.
- **Test 26 (Mở $\rightarrow$ Đóng $\rightarrow$ Di chuyển):** E1 tại tầng 5 (`OPEN`), chọn tầng 8 $\rightarrow$ Cửa đóng lại rồi mới di chuyển lên 8.
- **Test 27 (Khóa an toàn khi cửa mở):** Khi cửa đang `OPEN` hoặc `OPENING`, cabin không thể thay đổi `currentFloor` cho đến khi cửa đã `CLOSED`.

### Nhóm 9: Kiểm Thử Biên (Boundary Cases) (Tests 28 – 30)
- **Test 28 (Tầng 0):** Gọi tầng 0 $\rightarrow$ Bị từ chối (Throw Error hoặc Validation Error).
- **Test 29 (Tầng 11):** Gọi tầng 11 $\rightarrow$ Bị từ chối.
- **Test 30 (Biên nút gọi tầng):** Tầng 1 gọi DOWN $\rightarrow$ Bị từ chối; Tầng 10 gọi UP $\rightarrow$ Bị từ chối.

### Nhóm 10: Khử Trùng Lặp Yêu Cầu (Duplicate Request Handling) (Tests 31 – 32)
- **Test 31 (Bấm liên tiếp nhiều lần):** Bấm Tầng 5 UP 3 lần liên tiếp $\rightarrow$ Chỉ ghi nhận 1 Hall Request duy nhất.
- **Test 32 (Nhiều người cùng gọi tại 1 tầng):** 2 hành khách cùng gọi Tầng 5 UP $\rightarrow$ Thang dừng 1 lần duy nhất tại tầng 5.

### Nhóm 11: Yêu Cầu Đồng Thời (Concurrent Requests) (Test 33)
- **Test 33 (Batch concurrent):** Gửi đồng thời [F2 UP, F5 UP, F7 DOWN, F9 DOWN] cho cụm 3 thang máy $\rightarrow$ Không mất request, không bị duplicate, các thang được phân bổ cân bằng.

### Nhóm 12: Kịch Bản Thực Tế Toàn Diện (Comprehensive E2E Scenario) (Test 34)
- **Test 34 (Full Multi-Step E2E):**
  - Khởi tạo: E1=1, E2=1, E3=1 (tất cả IDLE).
  - Bước 1: Khách tại tầng 1 chọn Dest=10 $\rightarrow$ E1 nhận lệnh ($1 \rightarrow 10$).
  - Bước 2: Khi E1 đang qua tầng 3, xuất hiện F5 UP $\rightarrow$ E1 đón tại tầng 5 ($3 \rightarrow 5 \rightarrow 10$).
  - Bước 3: Trong lúc E1 ở tầng 5, xuất hiện F7 DOWN $\rightarrow$ E1 ghi nhớ nhưng tiếp tục đi lên 10, sau đó mới quay lại đón F7 ($5 \rightarrow 10 \rightarrow 7$).
  - Bước 4: Trong lúc E1 đang đi lên tiếp, xuất hiện F8 UP $\rightarrow$ E1 đón F8 trên đường lên ($5 \rightarrow 8 \rightarrow 10$), và vẫn đảm bảo sau đó quay lại đón F7 DOWN ($10 \rightarrow 7$).

---

## 3. Cấu Trúc File Kiểm Thử & Kế Hoạch Thực Hiện

File kiểm thử mới:
- `elevator-be/src/domain/comprehensive-simulation.spec.ts`

Tổ chức cấu trúc test suite theo 12 `describe` blocks tương ứng với 12 nhóm, sử dụng vòng lặp `tick()` thuần túy của Domain Entity & Aggregate Root để đảm bảo tính xác định (deterministic) 100%, không bị phụ thuộc vào delay mạng hay hệ số thời gian.

---

## 4. Tiêu Chí Hoàn Thành (Acceptance Criteria)
1. Cả 34 test cases được viết đầy đủ, rõ ràng và có assertion chặt chẽ.
2. Chạy lệnh `npm test` trong `elevator-be` đạt 100% PASS cho toàn bộ các spec files.
3. Không làm ảnh hưởng đến mã nguồn domain hiện hành.
