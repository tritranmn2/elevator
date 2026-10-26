# AI Directives & Standard Operating Procedures (SOP)

Tài liệu này định nghĩa các quy tắc, tiêu chuẩn làm việc và cấu trúc quản lý dành cho AI Agent khi tham gia vào dự án **Elevator**.

---

## 1. Cấu Trúc Quản Lý Dự Án

Dự án tuân thủ cấu trúc chuẩn hóa cho AI Agent và tài liệu phát triển:

```text
.
├── .agents/
│   ├── skills/          # Các kỹ năng tùy biến (Custom Skills có SKILL.md)
│   └── rules/           # Các quy tắc hướng dẫn riêng biệt theo chủ đề
├── docs/
│   ├── ai-planing/      # Kế hoạch phát triển, roadmap, task breakdown
│   └── analysis/        # Phân tích kỹ thuật, kiến trúc, tài liệu nghiệp vụ
├── AGENTS.md            # Bộ chỉ thị và quy chuẩn AI chung của dự án
└── ...
```

---

## 2. Quy Chuẩn Đặt Tên Tài Liệu (Docs Convention)

Tất cả các tài liệu được tạo ra trong `docs/ai-planing/` và `docs/analysis/` **bắt buộc** phải tuân thủ định dạng timestamp sau:

$$\text{Định dạng: } \mathbf{YYMMDDHHMM}\text{-}\mathbf{\langle\text{ten-file}\rangle}\mathbf{.md}$$

- **YY**: 2 số cuối của năm (ví dụ: `26` cho năm 2026).
- **MM**: Tháng 2 chữ số (`01` - `12`).
- **DD**: Ngày 2 chữ số (`01` - `31`).
- **HH**: Giờ theo định dạng 24h (`00` - `23`).
- **MM**: Phút (`00` - `59`).
- **`<ten-file>`**: Viết thường dạng kebab-case (chữ thường nối với dấu gạch ngang, không dấu tiếng Việt).

**Ví dụ:**
- `docs/ai-planing/2609292215-initial-project-setup.md`
- `docs/analysis/2609292230-elevator-state-machine-architecture.md`

---

## 3. Quy Trình Làm Việc Của AI Agent (Workflow Directives)

### 3.1. Tiếp nhận và Lập kế hoạch (Planning Phase)
- Trước khi thực hiện các tác vụ phức tạp hoặc tác vụ lớn, AI Agent phải tạo kế hoạch chi tiết lưu tại thư mục `docs/ai-planing/YYMMDDHHMM-<ten-ke-hoach>.md`.
- Kế hoạch cần nêu rõ:
  1. Mục tiêu (Objective).
  2. Bối cảnh & Yêu cầu kỹ thuật (Context & Requirements).
  3. Các bước thực hiện tuần tự kèm tiêu chí hoàn thành (Action Items & Acceptance Criteria).
  4. Rủi ro và giải pháp dự phòng (Risks & Mitigations).

### 3.2. Nghiên cứu & Phân tích (Analysis Phase)
- Các tài liệu phân tích nghiệp vụ, mô hình dữ liệu, sơ đồ kiến trúc, so sánh thư viện/công nghệ phải được lưu tại thư mục `docs/analysis/YYMMDDHHMM-<ten-phan-tich>.md`.
- Sử dụng sơ đồ trực quan (Mermaid format) khi cần mô tả flow hoặc quan hệ dữ liệu.

### 3.3. Thực thi và Cập nhật (Execution Phase)
- Giữ vững tính toàn vẹn của mã nguồn và tài liệu hiện hữu.
- Tạo liên kết markdown clickable (`file://...`) đến các tệp và định nghĩa code có liên quan khi trao đổi.
- Kiểm tra tính đúng đắn và test kỹ trước khi hoàn tất phản hồi.

---

## 4. Quản Lý Custom Skills & Rules

- **Skills (`.agents/skills/<skill-name>/SKILL.md`)**: Sử dụng khi cần đóng gói quy trình phức tạp có hướng dẫn mẫu hoặc helper script.
- **Rules (`.agents/rules/*.md`)**: Quy định các coding convention, style guide, hoặc ràng buộc công nghệ cụ thể cho từng ngôn ngữ/framework được sử dụng trong dự án.
