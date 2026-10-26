# Quy Định Bắt Buộc: Tuyệt Đối Không Dùng Magic String & Raw Text

1. Mọi tên sự kiện WebSocket (`simulation:tick`, `elevator:arrived`,...), route paths (`api/elevators`, `call`,...), thông báo lỗi (`BadRequestException`, `Error`), log messages bắt buộc phải được định nghĩa trong `src/domain/constants/` hoặc Enums.
2. Không được hardcode bất kỳ chuỗi text nào trong Controller, Gateway, Service hay Domain.
3. Tất cả file hằng số phải sử dụng `as const` để bảo toàn tính Type-Safety của TypeScript.
