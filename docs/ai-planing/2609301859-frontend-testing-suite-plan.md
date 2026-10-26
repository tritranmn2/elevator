# Frontend Testing Suite Implementation Plan

- **Timestamp:** 2026-09-30 18:59
- **Objective:** Thiết kế và triển khai bộ kiểm thử toàn diện cho Frontend (`elevator-fe`) bằng Vitest + React Testing Library, bao phủ từ State Management (Reducer, Selectors), Component Rules (Floor Controls, Cabin Door, Destination Keypad) đến tương tác người dùng và đồng bộ Realtime State.

---

## 1. Bối Cảnh & Mục Tiêu Kỹ Thuật (Context & Requirements)

Frontend `elevator-fe` đóng vai trò là giao diện hiển thị mô phỏng thời gian thực (Realtime Command Center) cho cụm 3 thang máy 10 tầng:
- **Công nghệ:** React 19 + TypeScript + Vite + Vitest + React Testing Library + Lucide Icons + Vanilla CSS.
- **Mục tiêu kiểm thử:**
  1. Đảm bảo toàn bộ **Business Rules trên giao diện** (Floor 1/10 boundaries, Door Indicators vs Call Buttons) không bao giờ bị vỡ khi refactor.
  2. Đảm bảo **Visual States** (viền xanh lá khi mở cửa, đèn vàng khi nút được kích hoạt, sliding door 2 cánh) hiển thị chính xác theo dữ liệu state.
  3. Đảm bảo **State Management** (Reducer & Selectors) xử lý mượt mà luồng snapshot Socket.IO và không bị rò rỉ bộ nhớ.

---

## 2. Phân Tầng & Danh Mục Test Cases Chi Tiết

### Nhóm 1: Model, Reducer & Selectors Test (Data Layer)
- **`reducer.spec.ts`:**
  - Khởi tạo `initialState` với 3 thang máy tại tầng 1 (IDLE, CLOSED).
  - Xử lý Action `ELEVATORS_UPDATED` từ Socket.IO: Cập nhật vị trí, hướng di chuyển, trạng thái cửa.
  - Xử lý Action `SET_SELECTED_ELEVATOR`: Chuyển đổi tab điều khiển thang máy (1, 2, 3).
  - Xử lý Action `ADD_EVENT_LOG`: Thêm log mới và giới hạn buffer `MAX_LOGS` để tránh tràn RAM.
  - Xử lý Action `SET_CONNECTION_STATUS`: Cập nhật trạng thái kết nối WebSocket (`connected` / `disconnected`).
  - Xử lý Action `RESET_STATE`: Reset về trạng thái ban đầu khi mất kết nối hoặc khởi động lại.
- **`selectors.spec.ts`:**
  - `selectIsHallCallActive`: Xác định chính xác nút gọi tầng nào đang chờ phục vụ để bật đèn vàng (`active-yellow`).
  - `selectIsDestinationActive`: Xác định tầng đích nào trong cabin đã được bấm để bật đèn vàng trên bàn phím.
  - `selectElevatorLogs`: Lọc danh sách log sự kiện theo từng thang máy cụ thể.

---

### Nhóm 2: Floor Elevator Controls Test (`FloorElevatorControls.spec.tsx`)
- **Kiểm thử biên tầng (Floor Boundary Rules):**
  - **Tầng 10:** Chỉ render nút `DOWN` (`↓`), đèn `OPEN`, đèn `CLOSE`. Xác nhận **không có nút `UP`** và có placeholder giữ thẳng cột.
  - **Tầng 1:** Chỉ render nút `UP` (`↑`), đèn `OPEN`, đèn `CLOSE`. Xác nhận **không có nút `DOWN`** và có placeholder giữ thẳng cột.
  - **Tầng 2–9:** Render đầy đủ 4 cột thẳng hàng.
- **Kiểm thử tương tác (User Actions):**
  - Click nút `UP` $\rightarrow$ Kích hoạt `callElevator(floor, 'UP')`.
  - Click nút `DOWN` $\rightarrow$ Kích hoạt `callElevator(floor, 'DOWN')`.
  - Các đèn `OPEN` (`<|>`) và `CLOSE` (`>|<`) ở tầng là **đèn báo trạng thái (status indicator)**, click vào **không kích hoạt gọi API**.
- **Kiểm thử màu sắc (Visual Highlighting):**
  - Khi có lượt gọi tầng pending $\rightarrow$ Nút có class `.active-yellow`.
  - Khi thang dừng tại tầng và mở cửa $\rightarrow$ Đèn `<|>` sáng xanh lá (`.indicator-open-active`).
  - Khi thang dừng tại tầng và đóng cửa $\rightarrow$ Đèn `>|<` sáng xanh cyan (`.indicator-closing-active`).

---

### Nhóm 3: Cabin & Door Visualization Test (`ElevatorCabin.spec.tsx` & `ElevatorDoor.spec.tsx`)
- **Kiểm thử viền xanh lá khi mở cửa:**
  - Khi `doorState === 'OPEN'` hoặc `'OPENING'` $\rightarrow$ Thẻ `.elevator-cabin` có class `.door-open-green`.
  - Khi `doorState === 'CLOSED'` $\rightarrow$ Không có class `.door-open-green`.
- **Kiểm thử 2 cánh cửa kim loại:**
  - Render đủ 2 cánh: `.door-leaf-left` và `.door-leaf-right` với `width: 50%`.
  - Khi `doorState === 'CLOSED'` $\rightarrow$ 2 cánh ghép kín 100% full width, che kín khoang trong.
  - Khi `doorState === 'OPEN'` $\rightarrow$ Cửa trượt sang 2 bên và đèn khoang trong cabin (`.door-interior-light`) sáng.

---

### Nhóm 4: Cabin Keypad & Door Controls Test (`DestinationPanel.spec.tsx`)
- **Bàn phím tầng 1–10:**
  - Render đủ 10 nút bấm chọn tầng đích từ 1 đến 10.
  - Click nút tầng $N$ $\rightarrow$ Kích hoạt `selectDestination(elevatorId, N)`.
  - Nút của tầng đã được chọn sáng màu vàng (`.active-yellow`).
- **Nút điều khiển cửa trong Cabin:**
  - Nút Mở cửa (`<|>`): Click $\rightarrow$ Kích hoạt `pressOpenDoor(elevatorId)`.
  - Nút Đóng cửa (`>|<`): Click $\rightarrow$ Kích hoạt `pressCloseDoor(elevatorId)`.

---

## 3. Các Bước Thực Hiện Tuần Tự (Action Items)

1. **Cài đặt thư viện kiểm thử UI (nếu chưa có):**
   - `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.
   - Cấu hình `vitest.config.ts` hỗ trợ môi trường DOM (`environment: 'jsdom'`).
2. **Triển khai test cases:**
   - `src/features/elevator/components/Building/FloorElevatorControls.spec.tsx`
   - `src/features/elevator/components/Elevator/ElevatorCabin.spec.tsx`
   - `src/features/elevator/components/Elevator/DestinationPanel.spec.tsx`
3. **Chạy kiểm thử & Xác thực:**
   - Chạy `yarn test` và đảm bảo 100% test cases trên FE đều PASS.
   - Chạy `yarn lint` và `yarn build` đảm bảo không có lỗi TypeScript hay bundle.

---

## 4. Tiêu Chí Hoàn Thành (Acceptance Criteria)
- Bộ test bao phủ toàn diện cả tầng dữ liệu (State/Reducer/Selectors) và tầng giao diện (Components/User Events).
- Đảm bảo 100% các yêu cầu về UI của đề bài (Tầng 1/10, viền xanh mở cửa, nút vàng sáng đèn, cửa khép kín) đều có test case bảo vệ.
