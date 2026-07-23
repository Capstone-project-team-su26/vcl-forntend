# Future plan — Ops vẽ full map kho

**Trạng thái:** hoãn (không làm giai đoạn hiện tại)  
**Ngày ghi:** 2026-07-23  
**Phạm vi:** `vcl-forntend` Ops + có thể cần BE

---

## Quyết định hiện tại (đã chọn)

- Trang Ops **Bố trí vị trí kho** = master địa chỉ **Zone → Shelf → Bin** (cây / form).
- **Không** vẽ mặt bằng CAD / kéo dãy kệ trên canvas.
- **Xếp kiện lên kệ (put-away)** = Warehouse Staff (mobile / API put-away), không phải Ops web.
- Admin chỉ tạo kho; Ops tạo vị trí lưu trữ.

Lý do: đủ cho WMS chạy put-away/pick; full map là overkill và dễ trùng cảm giác “xếp hàng lên kệ”.

---

## Future — Ops vẽ full map kho

Chỉ mở lại khi kho thật sự phức tạp (nhiều aisle/dock, cần hướng dẫn đường đi / mô phỏng) **và** team chấp nhận sửa BE + FE lớn.

### Mục tiêu

Ops vẽ / chỉnh **mặt bằng vật lý** kho: zone chức năng, dãy rack, lối đi, dock nhận/xuất — **không** gắn kiện hàng lên ô.

### Ngoài phạm vi (vẫn thuộc staff)

- Put-away / pick kiện
- Overlay tồn (`layout/status` heatmap) trên màn Ops design — nếu cần thì tách dashboard riêng

### Vì sao hiện tại chưa làm

| Lý do | Chi tiết |
|-------|----------|
| Nghiệp vụ | Location master đã đủ cho put-away; CAD không bắt buộc |
| BE hiện tại | `CreateWarehouseLocationLayoutDto` = gắn **bin** lên `rowIndex`/`columnIndex`; không model aisle / rack run / dock |
| Effort | FE canvas + có thể đổi schema layout; không phải polish nhỏ |
| UX risk | Grid bin dễ bị hiểu nhầm là xếp hàng lên kệ |

### Hướng kỹ thuật gợi ý (khi làm)

1. **BE**
   - Tách rõ: `locations` (master) vs `layout` (hình học mặt bằng).
   - Mở rộng layout object: `ZONE_AREA` | `RACK` | `AISLE` | `DOCK` (hoặc tương đương), không chỉ cell `BIN`.
   - `GET .../layout/status` chỉ cho dashboard / AI putaway / mobile — **không** trộn vào editor Ops.
2. **FE**
   - Editor canvas (snap grid): đặt rack/zone polygon hoặc block, không thẻ “ô chứa kiện”.
   - Vẫn đồng bộ tạo/cập nhật Zone/Shelf/Bin khi lưu (hoặc link layout → location master).
3. **Phân công**
   - Ops: vẽ map + master vị trí
   - Staff: put-away trên vị trí đã có
   - Admin: master kho Origin/Destination

### Nguồn tham chiếu (ngành)

- [NetSuite — Warehouse layout](https://www.netsuite.com/portal/resource/articles/erp/warehouse-layout.shtml) — layout facility vs luồng nhận–lưu–xuất
- [NetSuite — Warehouse slotting](https://www.netsuite.com/portal/resource/articles/inventory-management/warehouse-slotting.shtml) — slotting ≠ vẽ map; gắn SKU vào vị trí
- [Hammerhead — Warehouse Layout Design Guide](https://www.hammerheadllc.com/articles/warehouse-layout-design-guide) — zone, racking, aisle, dock
- [Davanti — warehouse location structure](https://davanti-wics.com/en/what-is-a-warehouse-location-structure-and-how-do-you-design-one/) — hierarchy địa chỉ cho WMS

### Điều kiện mở lại plan

- [ ] Có yêu cầu vận hành rõ (kho lớn / nhiều khu / cần training bằng map)
- [ ] BE sẵn sàng contract layout không phụ thuộc ô BIN + heatmap tồn
- [ ] Ước lượng FE+BE được approve (không làm “vẽ lại grid cũ”)

---

## Liên kết code hiện tại

- Ops UI: `src/app/pages/operations/components/WarehouseLayoutPage.jsx`
- Module: `src/modules/warehouses/`
- Handoff kho: `doc/warehouse-ops-handoff.md`
