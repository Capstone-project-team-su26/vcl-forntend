# Yêu cầu backend — thủ tục xuất khô

## Hiện trạng

Frontend đã có trang `/pages/operations/export-procedures` nhưng backend chưa có API cung cấp
checklist thủ tục cho lô hàng biển FCL/LCL. Khi API trả `404`, frontend chủ động hiển thị dữ liệu
`DEMO` và gắn cảnh báo; dữ liệu này không được xem là hồ sơ vận hành thật.

## API tối thiểu cần triển khai

### `GET /api/export-procedures`

- Quyền truy cập: `OperationsManager`.
- Trả `200` với một mảng hoặc `{ "items": [...] }`.
- Ngày giờ dùng ISO 8601 có múi giờ hoặc UTC.
- Không trả dữ liệu mẫu trong production.
- Danh sách cần đủ dữ liệu chi tiết để frontend mở dialog mà không gọi thêm API.

Mẫu response:

```json
{
  "items": [
    {
      "id": "uuid",
      "jobCode": "EXP-2026-0001",
      "masterCode": "MST-SEA-0001",
      "bookingNumber": "BOOKING-001",
      "loadType": "FCL",
      "carrier": "Carrier name",
      "vesselVoyage": "Vessel / Voyage",
      "originPort": "Cát Lái, VN",
      "destinationPort": "Los Angeles, US",
      "customerName": "Customer name",
      "etd": "2026-07-27T18:00:00+07:00",
      "customs": {
        "declarationNumber": "304123456789",
        "status": "CLEARED",
        "channel": "GREEN"
      },
      "cutoffs": [
        {
          "id": "vgm",
          "label": "VGM cut-off",
          "dueAt": "2026-07-26T12:00:00+07:00",
          "completed": true
        }
      ],
      "documents": [
        {
          "id": "uuid",
          "code": "CUSTOMS_DECLARATION",
          "label": "Tờ khai hải quan xuất khẩu",
          "group": "CUSTOMS",
          "requirement": "LEGAL_REQUIRED",
          "status": "APPROVED",
          "blocking": true,
          "dueAt": "2026-07-26T10:00:00+07:00",
          "owner": "Khai báo HQ",
          "reference": "304123456789",
          "note": ""
        }
      ]
    }
  ]
}
```

## Enum và ý nghĩa

- `loadType`: `FCL`, `LCL`.
- `customs.status`: `NOT_DECLARED`, `SUBMITTED`, `INSPECTION`, `CLEARED`.
- `customs.channel`: `UNASSIGNED`, `GREEN`, `YELLOW`, `RED`.
- `documents.group`: `COMMERCIAL`, `CUSTOMS`, `CARRIER_PORT`, `POST_DEPARTURE`.
- `documents.requirement`:
  - `LEGAL_REQUIRED`: thành phần hồ sơ pháp lý áp dụng cho lô.
  - `CONDITIONAL`: chỉ bắt buộc khi mặt hàng/thị trường yêu cầu.
  - `OPERATIONAL`: chứng từ phục vụ hãng tàu, cảng hoặc bàn giao.
- `documents.status`: `NOT_STARTED`, `IN_PROGRESS`, `SUBMITTED`, `APPROVED`, `ISSUE`,
  `NOT_APPLICABLE`.
- `blocking = true`: mục chưa hoàn thành có thể chặn thông quan hoặc xếp tàu.

Backend không cần trả phần trăm hoặc trạng thái tổng hợp. Frontend tự tính từ checklist để tránh
lệch quy tắc giữa danh sách và chi tiết.

## Quy tắc dữ liệu bắt buộc

- Mỗi lô có `id`, `jobCode`, `bookingNumber`, `loadType`, `etd`, `customs`, `cutoffs` và
  `documents`.
- FCL phải có các mục vận hành SI, VGM, container/seal và CY cut-off.
- LCL dùng CFS cargo cut-off/phiếu nhận hàng CFS; VGM ở cấp lô LCL phải là `NOT_APPLICABLE`.
- Cut-off phải lấy từ revision booking mới nhất, không suy ra bằng số giờ cố định trước ETD.
- Giấy phép xuất khẩu, kiểm tra chuyên ngành và C/O phải phản ánh điều kiện của từng mặt hàng;
  không mặc định bắt buộc cho mọi lô.
- Tờ khai, Invoice, Packing List, SI, VGM, container/seal và B/L phải đối soát cùng số lượng,
  trọng lượng, mô tả hàng, cảng và voyage khi các trường đó tồn tại.
- Không lưu URL tạm hoặc đường dẫn file nội bộ không có quyền truy cập.

## API giai đoạn cập nhật hồ sơ

Trang hiện tại là read-only. Khi cần cho nhân viên cập nhật, backend bổ sung:

- `GET /api/export-procedures/{id}` nếu payload danh sách được rút gọn.
- `PATCH /api/export-procedures/{id}/documents/{documentId}` để cập nhật trạng thái, người phụ
  trách, hạn và ghi chú; dùng kiểm soát đồng thời (`rowVersion` hoặc ETag).
- Endpoint upload tài liệu hỗ trợ PDF/JPG/PNG, giới hạn dung lượng, quét malware và trả metadata
  file; không dùng endpoint upload ảnh hiện tại nếu endpoint đó không hỗ trợ PDF/chính sách lưu
  trữ chứng từ.
- Audit log gồm người sửa, thời điểm, giá trị cũ/mới; hồ sơ hải quan không được hard delete.

## Tiêu chí nghiệm thu

- Tài khoản Operations gọi được API; role khác nhận `403`, chưa đăng nhập nhận `401`.
- API trả `200` khi không có dữ liệu với danh sách rỗng, không dùng `404`.
- Một lô FCL, một lô LCL và một lô có luồng vàng/đỏ hiển thị đúng trên frontend.
- Ngày giờ và trạng thái cut-off không lệch múi giờ Việt Nam.
- Không có mã `DEMO` hoặc dữ liệu giả trong response production.
- Contract được đưa vào OpenAPI/Swagger và giữ tương thích với các enum trên.
