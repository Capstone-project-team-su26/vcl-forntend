# Warehouse handoff — TODO BE & Warehouse Staff App

Ngày: 2026-07-21  
Phạm vi: lệch nghiệp vụ kho (check-in → put-away → tồn → xuất) phát hiện trên DB `AppDb` + swagger.  
FE nội bộ (`vcl-forntend`) đã vá phần mình — xem mục cuối.

---

## Đã làm trên FE (không cần làm lại)

- [x] Phiếu tiếp nhận Sales: chỉ cho chọn kho **Destination** (không Origin).
- [x] Chuẩn hóa `warehouseType` casing (`ORIGIN` → `Origin`).
- [x] Label status: check-in ≠ đã có tồn; thêm `WAITING_FOR_PARCEL`.
- [x] Admin kho: bỏ capacity ảo (BE không lưu).
- [x] Ops web: trang **Phân bố vị trí kho** (`/pages/operations/warehouse-layout`) — tạo Zone/Shelf/Bin + gắn layout.

---

## Backend — TODO

### P0 — Lệch tồn / status (đang xảy ra trên DB)

- [ ] **Tách rõ status đơn vs tồn**
  - Hiện: check-in kiện → order `WAREHOUSE_RECEIVED` dù chưa put-away / chưa có `INVENTORIES`.
  - Đề xuất: `CHECKED_IN` (hoặc giữ tên hiện tại nhưng **chỉ** set khi đã có inventory / `STORED`), hoặc không set `WAREHOUSE_RECEIVED` trước khi `POST /inventories/from-parcel/{parcelId}` thành công.
  - Verify: 4/5 đơn `WAREHOUSE_RECEIVED` có parcel `RECEIVED`, **0 inventory**.

- [ ] **`from-parcel` không được bỏ sót**
  - Put-away xong phải có tồn khả dụng.
  - Ưu tiên: **tự tạo inventory trong put-away** (bỏ bước POST rời), hoặc bắt buộc gọi `from-parcel` trong cùng transaction / saga; fail → rollback status.

- [ ] **WRO / xuất kho không tạo inventory zombie**
  - Case: cùng `parcel_id` + `order_item_id` → 1 row `AVAILABLE` qty=`0` + 1 row `RELEASED` qty=`2`.
  - Sửa: update **một** row (AVAILABLE → RELEASED / giảm qty), không insert row AVAILABLE=0.

- [ ] **Receiving note chỉ chấp nhận kho Destination**
  - Validate server-side `warehouseType` (case-insensitive).
  - Case lỗi: `WRN-52537062` gắn kho Origin `CN-GZ`.

### P1 — Role & master data

- [ ] **Cho phép Operations / WarehouseStaff tạo vị trí**
  - Swagger: `POST /api/warehouses/{id}/locations` đang “chỉ Admin”.
  - Ops web cần tạo Zone/Shelf/Bin — mở role Ops + WarehouseStaff (hoặc endpoint riêng cho ops).

- [ ] **Chuẩn hóa `warehouse_type` trong DB**
  - Đang lẫn `ORIGIN` / `Origin` / `Destination`.
  - Migration hoặc normalize khi ghi; filter không phụ thuộc casing.

- [ ] **(Optional) Soft capacity trên warehouse**
  - **Không** bắt buộc. Nguồn sự thật = `BINS.max_volume` / `current_volume`.
  - Chỉ thêm `Warehouses.Capacity` nếu cần hint báo cáo — nullable, không enforce put-away.

### P2 — Cleanup data (một lần)

- [ ] 4 parcel `RECEIVED` + order `WAREHOUSE_RECEIVED` không inventory → quyết định: put-away + from-parcel, hoặc hạ status về chờ xử lý.
- [ ] Xóa / merge inventory `AVAILABLE` qty=`0` (parcel `PCL-20260620103028-258201`).
- [ ] Review receiving note ACTIVE gắn Origin — đổi Destination hoặc hủy + tạo lại.

### Gợi ý query kiểm tra (sau khi fix)

```sql
-- Đơn “đã nhận kho” nhưng không có tồn
SELECT o.consignment_code, o.status, p.package_code, p.package_status
FROM ORDERS o
JOIN PARCELS p ON p.consignment_id = o.id
WHERE o.status = 'WAREHOUSE_RECEIVED'
  AND NOT EXISTS (SELECT 1 FROM INVENTORIES i WHERE i.parcel_id = p.id);

-- Inventory trùng parcel + item
SELECT parcel_id, order_item_id, COUNT(*) cnt, SUM(quantity) sum_qty
FROM INVENTORIES
GROUP BY parcel_id, order_item_id
HAVING COUNT(*) > 1;
```

---

## Warehouse Staff App (mobile) — TODO

### P0 — Pipeline nhập kho đủ bước

- [ ] Sau **scan phiếu tiếp nhận** → **check-in** → **put-away** → đảm bảo có **tồn** (tự động hoặc gọi `from-parcel`; không dừng ở check-in).
- [ ] UI không hiện “đã nhập kho / sẵn sàng xuất” nếu chưa có `inventoryId` / status inventory `AVAILABLE`.
- [ ] Put-away bắt buộc chọn Zone/Shelf/Bin hợp lệ (kho đích đã có layout).

### P1 — Xuất kho (WRO)

- [ ] Chỉ pick từ inventory `AVAILABLE` qty &gt; 0.
- [ ] Complete WRO: xác nhận số lượng; không để lại dòng AVAILABLE=0.
- [ ] Đồng bộ với picking list confirm (`/api/picking-lists/{id}/confirm`).

### P1 — UX / đồng bộ với Ops web

- [ ] Tra cứu layout/status (`GET .../layout/status`) khi gợi ý vị trí / AI putaway.
- [ ] Không cho scan/gắn receiving note vào kho Origin.
- [ ] Copy: “Check-in” ≠ “Đã có tồn trên kệ”.

### P2 — Master vị trí

- [ ] Nếu app cũng tạo bin: dùng cùng contract `CreateLocationRequestDto` (`zoneName`, `shelfCode`, `binCode`, `maxVolume`, `maxWeight`).
- [ ] Tôn trọng sức chứa bin khi put-away (cảnh báo khi gần `max_volume` / `max_weight`).

---

## Phân công gợi ý

| Việc | Owner |
|------|--------|
| Status + from-parcel + WRO inventory | BE |
| Validate Destination trên receiving note | BE |
| Role Ops trên `POST .../locations` | BE |
| Pipeline mobile đủ bước + copy đúng | Warehouse Staff App |
| Sơ đồ / tạo bin trên web | Ops web (đã có FE) |
| Master kho Origin/Destination | Admin web (đã có FE) |

---

## Liên hệ FE

Repo: `vcl-forntend`  
Trang Ops layout: `/pages/operations/warehouse-layout`  
Module: `src/modules/warehouses/` (layout + storage location DTO khớp swagger).
