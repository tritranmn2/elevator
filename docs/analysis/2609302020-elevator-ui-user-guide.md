# HƯỚNG DẪN SỬ DỤNG GIAO DIỆN (UI USER GUIDE)
## HỆ THỐNG MÔ PHỎNG THANG MÁY ĐA CABIN (ELEVATOR SIMULATION SYSTEM)

Tài liệu này cung cấp hướng dẫn chi tiết về cấu trúc giao diện, ý nghĩa các thành phần trực quan và các thao tác tương tác vận hành trên giao diện Dashboard điều khiển thang máy.

---

## 1. Tổng Quan Bố Cục Giao Diện (Dashboard Layout)

Giao diện được xây dựng theo phong cách **Glassmorphism Dark Mode** hiện đại, chia thành 3 phân vùng chính:

```
+---------------------------------------------------------------------------------------+
|  [Header] Logo & Tên Hệ Thống | Thông tin Tóm tắt | Trạng Thái Kết Nối WebSocket      |
+-------------------------------------------------------------+-------------------------+
|                                                             | [Status Panel]          |
|  [Building Visualization]                                   | - Selector chọn Thang   |
|  - Cột số tầng (Floor 10 -> Floor 1)                        | - Diagnostics Metrics   |
|  - 3 Giếng thang máy (Shaft E1, E2, E3)                      | - Bàn phím Cabin (1-10) |
|    + Nút gọi tầng sảnh (Lên/Xuống) - Bên Trái               | - Nút Mở/Đóng cửa Cabin |
|    + Cabin hiển thị & Cửa chuyển động - Ở Giữa              +-------------------------+
|    + Đèn báo trạng thái cửa tầng - Bên Phải                 | [Event Log]             |
|                                                             | - Dòng sự kiện Realtime |
+-------------------------------------------------------------+-------------------------+
```

---

## 2. Chi Tiết Các Phân Vùng & Cách Thao Tác

### 2.1. Thanh Tiêu Đề (Header)
- **Brand & Title**: Tên hệ thống mô phỏng và cấu hình (3 Thang song song • 10 Tầng • Thuật toán SCAN tối ưu).
- **Badge Trạng Thái Kết Nối (Connection Status)**:
  - 🟢 **REALTIME CONNECTED** (Đèn xanh nhấp nháy): Đã kết nối WebSocket với backend NestJS. Tất cả trạng thái và chuyển động được đồng bộ thời gian thực.
  - 🔴 **DISCONNECTED** (Đèn đỏ): Mất kết nối hoặc backend chưa khởi động.
- **Thanh Thông Báo Lỗi (Error Banner)**: Xuất hiện khi có ngoại lệ hệ thống hoặc thao tác không hợp lệ, kèm nút `✕` để đóng thông báo.

---

### 2.2. Khu Vực Mô Phỏng Tòa Nhà (Building Visualization)

Khu vực bên trái mô phỏng tòa nhà 10 tầng (từ tầng 10 xuống tầng 1) với 3 trục giếng thang tương ứng với **Elevator 1, Elevator 2, Elevator 3**.

Tại mỗi tầng của từng giếng thang gồm có 3 cụm phần tử:

#### A. Nút Gọi Thang Sảnh Tầng (Hall Call Buttons - Nằm Bên TRÁI Cửa)
Hành khách đứng tại sảnh tầng bấm gọi thang để di chuyển:
- 🔼 **Nút Gọi LÊN (Call UP)**:
  - Bấm để gọi thang đi lên các tầng cao hơn.
  - *Nút sẽ phát sáng vàng Neon (`active-yellow`)* khi yêu cầu đang nằm trong hàng đợi chờ phục vụ.
  - Tầng 10 (tầng cao nhất) không có nút gọi lên.
- 🔽 **Nút Gọi XUỐNG (Call DOWN)**:
  - Bấm để gọi thang đi xuống các tầng thấp hơn.
  - *Nút sẽ phát sáng vàng Neon* khi yêu cầu đang trong hàng đợi.
  - Tầng 1 (tầng trệt) không có nút gọi xuống.

> **💡 Lưu ý:** Hệ thống Dispatcher thông minh sẽ tự động phân bổ thang máy tối ưu nhất (theo khoảng cách và hướng di chuyển SCAN) đến đón khách.

#### B. Cabin Thang Máy (Elevator Cabin - Nằm Ở GIỮA Giếng Thang)
- **Nhận diện Cabin**:
  - Khi cabin đang dừng hoặc đi ngang qua tầng: Hiển thị khối Cabin với mã thang (`E1`, `E2`, `E3`) và ký hiệu hướng di chuyển (`↑` Lên, `↓` Xuống, `—` Đứng yên).
  - Viền phát sáng xanh ngọc (`door-open-green`) khi cửa đang mở hoặc đang mở ra tại tầng đó.
  - Hiệu ứng 2 cánh cửa vật lý trượt mở (`ElevatorDoor`) sang hai bên sống động.
- **Tương tác**:
  - Nhấp chuột (Click) trực tiếp vào Cabin bất kỳ trên tòa nhà để **chọn nhanh thang đó** trên Bảng điều khiển chi tiết bên phải.

#### C. Đèn Báo Trạng Thái Cửa Sảnh (Floor Door Indicators - Nằm Bên PHẢI Cửa)
Đây là cụm đèn LED tín hiệu an toàn lắp tại cửa tầng sảnh quan sát từ bên ngoài:
- 🚪 **Đèn Mở Cửa (`<|>` - Unfold)**: Sáng xanh Neon khi cửa thang tại tầng đó đang ở trạng thái `OPEN` hoặc `OPENING`. Báo hiệu hành khách có thể an toàn bước vào/ra.
- 🚪 **Đèn Đóng Cửa (`>|<` - Fold)**: Sáng màu cam hổ phách khi cửa thang tại tầng đó đang ở trạng thái `CLOSING`. Cảnh báo cửa đang khép lại.
- *Lưu ý:* Đây là cụm đèn hiển thị thụ động (Display Only), không tiếp nhận tương tác click.

---

### 2.3. Bảng Giám Sát & Điều Khiển Chi Tiết (Fleet Diagnostics & Controls)

Nằm ở góc trên bên phải, giúp giám sát chuyên sâu từng thang và thao tác điều khiển cabin:

#### A. Bộ Chuyển Tab Thang Máy (3-Tab Selector)
- Cho phép bấm chuyển đổi nhanh để xem chi tiết và điều khiển **Elevator 1**, **Elevator 2** hoặc **Elevator 3**.
- Thẻ Tab tóm tắt: Vị trí tầng hiện tại (ví dụ: `1F`, `5F`), hướng di chuyển mũi tên, và trạng thái cửa thu nhỏ.

#### B. Thẻ Thông Số Vận Hành (Fleet Diagnostics Card)
- **Trạng thái hoạt động (State Badge)**: Hiển thị trạng thái máy trạng thái FSM:
  - `IDLE`: Thang rảnh rỗi chờ lệnh.
  - `MOVING_UP`: Đang kéo tải chạy lên.
  - `MOVING_DOWN`: Đang kéo tải chạy xuống.
  - `DOOR_OPENING`: Đang bung cửa an toàn.
  - `DOOR_OPEN`: Cửa mở hoàn toàn, đón/trả khách.
  - `DOOR_CLOSING`: Cửa đang khép lại để chuẩn bị di chuyển.
- **4 Chỉ Số Thời Gian Thực (Metrics Grid)**:
  - `Current Floor`: Tầng hiện tại của cabin.
  - `Direction`: Hướng di chuyển ưu tiên (`UP`, `DOWN`, `IDLE`).
  - `Door State`: Trạng thái cơ cấu cửa (`CLOSED`, `OPENING`, `OPEN`, `CLOSING`).
  - `Target Queue`: Danh sách tất cả các tầng đích đang được xếp hàng phục vụ.

#### C. Bàn Phím Chọn Tầng Trong Cabin (Cabin Keypad 1 - 10)
- Mô phỏng bàn phím bấm số bên trong cabin thang máy:
  - Các nút số từ **1** đến **10**.
  - Bấm vào số tầng muốn đến: Nút số sẽ phát sáng vàng Neon xác nhận tầng đích đã ghi nhận vào danh sách di chuyển.
  - Tầng cabin đang đỗ sẽ hiển thị trạng thái hiện tại.

#### D. Nút Điều Khiển Cửa Cabin (Door Controls)
- 👐 **Nút Open (`<|>` Mở cửa)**:
  - Nhấn để mở cửa hoặc giữ cửa mở lâu hơn khi thang đang dừng ở tầng.
  - Bị vô hiệu hóa (disabled) khi cabin đang chuyển động di chuyển giữa các tầng.
- 🤝 **Nút Close (`>|<` Đóng cửa)**:
  - Nhấn để đóng cửa ngay lập tức, bỏ qua thời gian chờ đếm ngược (Hold Open Timer) để thang khởi hành ngay.
  - Bị vô hiệu hóa khi cửa đã đóng hoàn toàn hoặc thang đang di chuyển.

---

### 2.4. Nhật Ký Sự Kiện Thời Gian Thực (Real-time Event Stream)

Khu vực bên dưới bảng điều khiển, đóng vai trò như một Console giám sát toàn bộ hoạt động:
- Hiển thị theo thời gian thực các sự kiện phát sinh từ hệ thống kèm Timestamp `[HH:MM:SS]`.
- Phân loại màu sắc trực quan:
  - 🔵 **Info / Move**: Sự kiện chuyển tầng, thay đổi trạng thái động cơ.
  - 🟢 **Door**: Sự kiện mở/đóng cửa thành công.
  - 🟡 **Call / Destination**: Sự kiện khách gọi tầng sảnh hoặc chọn đích đến trong cabin.
  - 🔴 **Warn / Error**: Sự kiện cảnh báo quá tải, ngắt kết nối hoặc ngoại lệ.

---

## 3. Kịch Bản Vận Hành Mẫu (Step-by-Step Simulation Flow)

### Kịch bản 1: Gọi thang từ Sảnh Tầng
1. Nhìn vào tầng bạn đang đứng ở khu vực bên trái (ví dụ: **Tầng 3**).
2. Nhấn nút **▲ (Lên)** tại cột giếng thang của Elevator 1.
3. Nút ▲ sẽ sáng vàng.
4. Hệ thống điều động thang gần nhất di chuyển tới Tầng 3.
5. Khi thang đến Tầng 3:
   - Thang chuyển trạng thái `DOOR_OPENING` -> `DOOR_OPEN`.
   - Cánh cửa mở ra, viền cabin sáng xanh, đèn `<|>` bên phải sáng xanh.
   - Nút ▲ tắt đèn vàng (đã hoàn thành đón khách).

### Kịch bản 2: Hành khách vào Cabin và chọn Tầng đến
1. Khi cửa thang đang mở tại Tầng 3, trên Bảng điều khiển bên phải chọn tab của thang đó (ví dụ: **Elevator 1**).
2. Trên **Cabin Keypad**, nhấn chọn **Tầng 8**.
3. Nút **8** sáng vàng xác nhận mục tiêu.
4. Nếu muốn đi ngay lập tức: Nhấn nút **Close (`>|<`)** trên bảng điều khiển cửa để đóng cửa tức thì.
5. Cabin đóng cửa (`DOOR_CLOSING` -> `CLOSED`), đổi trạng thái sang `MOVING_UP` và chạy mượt mà lên Tầng 8.
6. Đến Tầng 8, thang dừng lại, mở cửa trả khách và hoàn tất chu trình.

---

## 4. Bảng Tra Cứu Trạng Thái Màu Sắc (Color Code Reference)

| Màu sắc | Ý nghĩa | Vị trí xuất hiện |
| :--- | :--- | :--- |
| **Vàng Neon** (`#f59e0b` / `var(--accent-yellow)`) | Lệnh đang active / Nút được bấm chọn | Nút gọi sảnh ▲/▼, Phím số Cabin 1-10 |
| **Xanh Ngọc Neon** (`#10b981` / `var(--status-open)`) | Cửa mở an toàn, Đã kết nối | Đèn báo `<|>`, Viền Cabin mở cửa, Header status |
| **Cam / Hổ phách** (`#f97316` / `var(--status-closing)`) | Cửa đang khép lại (Cảnh báo) | Đèn báo `>|<` bên phải cửa tầng |
| **Xanh Cyan** (`#06b6d4` / `var(--accent-cyan)`) | Thang đang được chọn điều khiển | Tab thang máy active, Tiêu đề phân vùng |
| **Đỏ / Đỏ hồng** (`#ef4444` / `var(--status-error)`) | Cửa đóng hoàn toàn, Lỗi, Ngắt kết nối | Header disconnected, Cảnh báo lỗi hệ thống |

---
*Tài liệu được cập nhật tự động đồng bộ với mã nguồn giao diện Frontend Elevator.*
