# 🛗 Multi-Elevator Real-Time Simulation System

Hệ thống mô phỏng vận hành 3 thang máy song song phục vụ tòa nhà 10 tầng thời gian thực (Real-time Simulation Engine) được xây dựng theo kiến trúc Clean Architecture & Domain-Driven Design (DDD).

---

## 🏗️ Tổng quan Công nghệ (Tech Stack)

| Thành phần | Công nghệ / Thư viện | Vai trò |
| :--- | :--- | :--- |
| **Backend** | NestJS 10, TypeScript, Socket.IO, Winston, Swagger | Engine mô phỏng chu kỳ tick (1s/tick), thuật toán điều phối LOOK/SCAN + Dispatcher, REST API & WebSocket Gateway |
| **Frontend** | React 19, TypeScript, Vite, Vitest, Testing Library, Lucide Icons | Giao diện điều khiển trung tâm (Command Center), trực quan hóa chuyển động thang máy, bảng điều khiển gọi tầng & cabin |
| **Testing** | Jest, ts-jest, Vitest, JSDOM | Hệ thống kiểm thử toàn diện: 81 tests (Backend) + 28 tests (Frontend) = **109 passing tests** |

---

## 📋 Yêu cầu Môi trường (Prerequisites)

- **Node.js**: **`v24.21.0`** (hoặc bất kỳ bản Node 24 nào `>= 24.15.0`).
  > ⚠️ **Lưu ý quan trọng:** Gói `jsdom@30.x` yêu cầu engine `^22.22.2 || ^24.15.0 || >=26.0.0`. Các bản Node cũ hơn như `20.x` hoặc `22.16.x` sẽ bị báo lỗi không tương thích. Vui lòng chuyển sang **Node 24**.
- **Package Manager**: `yarn` (`v1.22.x` hoặc mới hơn)

---

### 🛠️ Hướng dẫn Cài đặt Môi trường (NVM & Yarn)

Nếu máy của bạn chưa có Node.js, NVM hoặc Yarn, hãy thực hiện theo các bước sau:

#### 1. Cài đặt NVM (Node Version Manager) & Node.js

<details>
<summary><b>👉 Dành cho Linux / macOS / WSL (Ubuntu)</b></summary>

```bash
# 1. Tải và cài đặt nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 2. Áp dụng môi trường shell (hoặc khởi động lại Terminal)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 3. Cài đặt và kích hoạt Node.js phiên bản khuyến nghị
nvm install 24.21.0
nvm use 24.21.0
nvm alias default 24.21.0

# 4. Kiểm tra lại phiên bản
node -v   # -> v24.21.0
npm -v
```
</details>

<details>
<summary><b>👉 Dành cho Windows (Native Command Prompt / PowerShell)</b></summary>

1. Tải bộ cài `nvm-setup.exe` từ [nvm-windows Releases](https://github.com/coreybutler/nvm-windows/releases).
2. Chạy file cài đặt, sau đó mở Terminal mới và chạy:
   ```cmd
   nvm install 24.21.0
   nvm use 24.21.0
   ```
</details>

---

#### 2. Cài đặt Yarn

Sau khi đã cài đặt Node.js thành công, bạn có thể cài đặt `yarn` theo một trong 2 cách:

- **Cách 1: Kích hoạt thông qua Corepack (Khuyên dùng cho Node.js hiện đại)**
  ```bash
  corepack enable
  corepack prepare yarn@stable --activate
  ```

- **Cách 2: Cài đặt toàn cục qua npm**
  ```bash
  npm install -g yarn
  ```

- **Kiểm tra cài đặt:**
  ```bash
  yarn -v
  ```

---

## 🚀 Hướng dẫn Cài đặt & Chạy ứng dụng

### 1. Cấu hình biến môi trường (Environment Setup)

Tạo file `.env` từ file mẫu `.env.example` cho cả 2 project:

#### Backend (`elevator-be`):
```bash
cd elevator-be
cp .env.example .env
```
> *Mặc định Backend chạy tại port `3001`, Swagger Docs tại `http://localhost:3001/docs`.*

#### Frontend (`elevator-fe`):
```bash
cd elevator-fe
cp .env.example .env
```
> *Mặc định Frontend kết nối tới Backend tại `http://localhost:3001`.*

---

### 2. Khởi chạy Backend (`elevator-be`)

Mở một Terminal mới tại thư mục gốc:

```bash
# Di chuyển vào thư mục backend
cd elevator-be

# Cài đặt dependencies
yarn install

# Chạy ở chế độ Development (Hot-reload)
yarn start:dev
```

- **HTTP Server**: `http://localhost:3001`
- **Swagger API Docs**: `http://localhost:3001/docs`
- **WebSocket Gateway**: `ws://localhost:3001`

---

### 3. Khởi chạy Frontend (`elevator-fe`)

Mở một Terminal thứ hai tại thư mục gốc:

```bash
# Di chuyển vào thư mục frontend
cd elevator-fe

# Cài đặt dependencies
yarn install

# Chạy ở chế độ Development (Vite)
yarn dev
```

- **Frontend App**: `http://localhost:5173` (hoặc cổng hiển thị trên terminal)

---

## 🧪 Hướng dẫn Chạy Kiểm thử (Testing)

Hệ thống sở hữu bộ test toàn diện kiểm tra mọi kịch bản di chuyển, đón trả khách, xếp hàng và cạnh tranh tài nguyên:

### Chạy Test Backend (81 test cases)
```bash
cd elevator-be
yarn test
```
*Gồm: Unit tests cho Entity, Value Object, LOOK/SCAN Algorithm, State Machine, Dispatcher Service, và 34 kịch bản mô phỏng chi tiết (`comprehensive-simulation.spec.ts`).*

### Chạy Test Frontend (28 test cases)
```bash
cd elevator-fe
yarn test
```
*Gồm: Component tests cho Cabin, Bảng gọi tầng độc lập, Bảng điều khiển Cabin, Reducer và Selectors.*

### Kiểm tra Linting & Build Frontend
```bash
cd elevator-fe
yarn lint
yarn build
```

---

## 📡 API & WebSocket Specification

### REST Endpoints
- `GET /api/elevators`: Lấy trạng thái snapshot toàn bộ hệ thống thang máy.
- `POST /api/elevators/call`: Đặt lệnh gọi thang tại sảnh tầng (`floor`, `direction: "UP" | "DOWN"`).
- `POST /api/elevators/:id/destination`: Đặt lệnh chọn tầng đích bên trong cabin (`floor`).
- `POST /api/elevators/:id/door/open`: Lệnh cưỡng bức mở cửa thang máy.
- `POST /api/elevators/:id/door/close`: Lệnh cưỡng bức đóng cửa thang máy.

### WebSocket Events (Socket.IO)
- `simulation:snapshot`: Phát toàn bộ trạng thái hệ thống khi client kết nối hoặc reset.
- `simulation:tick`: Phát sự kiện sau mỗi nhịp tick mô phỏng (chứa snapshot mới và mảng các event phát sinh).
- `elevator:arrived`: Sự kiện thang máy vừa đến tầng đích.
- `elevator:door_state_changed`: Sự kiện trạng thái cửa chuyển đổi (`CLOSED`, `OPENING`, `OPEN`, `CLOSING`).

---

## 📂 Cấu trúc Thư mục Dự án

```text
.
├── elevator-be/                     # NestJS Backend Application
│   ├── src/
│   │   ├── domain/                  # Pure Business Logic (Entities, Value Objects, Enums)
│   │   ├── application/             # Application Services & Simulation Engine
│   │   ├── infrastructure/          # WebSocket Gateway, Winston Logging, DTOs
│   │   └── common/                  # Filters, Interceptors, Decorators
│   ├── test/
│   │   └── simulation/              # Comprehensive Simulation Test Suites
│   ├── .env.example                 # Mẫu cấu hình môi trường Backend
│   └── package.json
│
├── elevator-fe/                     # React 19 + TypeScript Frontend Application
│   ├── src/
│   │   ├── app/                     # App configuration & Providers
│   │   ├── features/elevator/       # Elevator Feature Module
│   │   │   ├── components/          # UI Components (Building, Cabin, Controls, Logs)
│   │   │   ├── model/               # Reducer, Types, Selectors
│   │   │   ├── websocket/           # Socket.IO Client Adapter
│   │   │   └── __tests__/           # Frontend Unit & Component Tests
│   │   └── styles/                  # Glassmorphism & Cyberpunk Design System
│   ├── .env.example                 # Mẫu cấu hình môi trường Frontend
│   └── package.json
│
├── docs/                            # Tài liệu phân tích & Kế hoạch phát triển
├── AGENTS.md                        # Quy chuẩn làm việc và tài liệu cho AI Agents
└── README.md                        # Hướng dẫn dự án chung
```
