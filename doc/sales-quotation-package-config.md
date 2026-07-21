# Task (đã chỉnh) — Sales xem cấu hình đóng gói trên báo giá ký gửi

Phiên bản chỉnh lại theo FE hiện tại + swagger/API thật (2026-07-21). Bản gốc dùng route `/staff/...` và `POST .../quotation/estimate` — **không còn đúng**.

## Mục tiêu

Sales tạo/xem báo giá thấy **cấu hình thùng Customer đã chọn** khi tạo đơn, thấy **phí vỏ thùng** trong chi tiết báo giá, **không** được đổi loại thùng thay Customer. Nếu kho đã có dữ liệu kiện, đối chiếu và cảnh báo khi lệch.

## Route (FE thật)

| Role | URL |
|------|-----|
| Sales | `/pages/sales/consignments/{orderId}/quotation` |
| Admin (cùng panel) | `/pages/admin/consignments/{orderId}/quotation` |

Không có `/staff/quotations/` hay `/staff/consignments/...` trong repo này.

Auth: layout Sales/Admin đã chặn role khác — không thêm gate riêng nếu đã đi qua layout.

## API dùng (đã chỉnh)

| Việc | Endpoint | Ghi chú |
|------|----------|---------|
| Chi tiết đơn + lựa chọn thùng Customer | `GET /api/orders/consignments/{orderId}` | `items[].packageConfigurationId` + nested `packageConfiguration` (`configCode`, `configName`, kích thước, `maxWeight`, `packageFee`, `estimatedFee`) |
| Báo giá (ưu tiên) | `GET /api/orders/{orderId}/quotation` | Có `additionalFees` gồm dòng `PACKING_FEE` |
| Báo giá theo id | `GET /api/quotations/{quotationId}` | Cùng shape `QuotationDetailResponse` |
| ~~Estimate~~ | ~~`POST .../quotation/estimate`~~ | **BE đã bỏ** — FE tính local; thuế/snapshot lấy từ GET quotation nếu có |

**Không** hard-code phí/kích thước thùng — lấy từ `packageConfiguration` / `PACKING_FEE` API.

## Phân biệt 2 khái niệm (tránh nhầm task)

| | Cấu hình thùng (package configuration) | Dịch vụ đóng gói thêm (pricing rule) |
|--|----------------------------------------|--------------------------------------|
| Ví dụ | `MEDIUM` / Medium Box | `WOOD_CRATE` / Đóng thùng gỗ |
| Nguồn | Customer chọn trên item → `packageConfigurationId` | Customer chọn `pricingRuleIds` |
| Phí trên báo giá | `additionalFees[]` code/feeType `PACKING_FEE` | Phụ phí catalog (`WOOD_CRATE`, …) |
| Sales trên màn báo giá | **Chỉ xem** — khóa, không đổi loại thùng | Có thể chỉnh **số lượng** phụ phí (như hiện tại), không chọn lại rule thay khách |

## UI cần có trên màn báo giá

1. **Khối read-only “Cấu hình đóng gói Customer đã chọn”** (theo từng mặt hàng/kiện có `packageConfiguration`):
   - Mã (`configCode`)
   - Tên (`configName`)
   - Kích thước chuẩn D × R × C
   - Khối lượng tối đa
   - Phí vỏ thùng (`packageFee` / `estimatedFee` nếu BE trả)
2. **Trong bảng khoản phí**: dòng `PACKING_FEE` hiển thị rõ (label BE, vd. “Phí đóng thùng (Medium Box)”), **khóa** số lượng / không cho tắt.
3. **Tổng tiền**: dùng số liệu sau khi gộp phí đóng gói (ưu tiên `totalEstimatedCost` / breakdown BE khi đã có snapshot; local estimate giữ `PACKING_FEE` từ API).
4. **Kiện thực tế từ kho** (khi `quotation.parcels` hoặc dữ liệu kho có):
   - Hiện kích thước/cân thực tế (và `packageCode` nếu có).
   - Cảnh báo nếu lệch lựa chọn Customer (xem mục BE gap).
5. Loading khi load đơn/báo giá; lỗi nếu GET thất bại.

## Acceptance Criteria (đã chỉnh)

- [ ] Sales xem được loại thùng Customer chọn (`configCode` / `configName` + thông số từ API).
- [ ] Sales thấy phí vỏ thùng trong chi tiết báo giá (dòng `PACKING_FEE` và/hoặc `packageFee` trên config).
- [ ] Sales **không** chọn/đổi `packageConfiguration` trên màn báo giá.
- [ ] Tổng báo giá phản ánh phí đóng gói từ backend (không hard-code).
- [ ] Loading + error state khi lấy đơn/báo giá thất bại.
- [ ] Chỉ Sales/Admin vào được qua route nội bộ hiện có.
- [ ] Nếu kho đã trả kiện (`parcels` / field actual config): hiện thông tin kiện thực tế.
- [ ] Nếu có đủ dữ liệu so khớp loại thùng thực tế ≠ lựa chọn Customer: hiện cảnh báo.

## BE gap / phụ thuộc

Swagger parcel check-in **chưa** có `packageConfigurationId` / `actualPackageConfiguration*`.  
`ParcelQuotationDetailDto` chỉ có kích thước + cân + `shippingFee`.

→ Cảnh báo “loại thùng thực tế khác loại Customer chọn” **chỉ bật đầy đủ** khi BE bổ sung actual package config trên parcel/item.  
Interim FE: khi có `parcels[]` với D×R×C, có thể cảnh báo **lệch kích thước** so với config chuẩn (heuristic), và ghi rõ đây không phải đổi `configCode`.

## Out of scope (bản này)

- Wire chọn thùng phía Customer web (repo khác).
- Cho Sales đổi `packageConfigurationId`.
- Khôi phục `POST .../quotation/estimate`.
- Màn list `/staff/quotations/`.
