# Thư mục `doc/` — tài liệu & log prompt (vcl-forntend)

**Quy chung cho cả nhóm + mọi agent:** xem [`../../AGENTS.md`](../../AGENTS.md) (gốc workspace `FrameProject`).

## Mục đích

- **Mọi file `.md` mới** cho tài liệu nội bộ, spec, runbook, ghi chú… **chỉ tạo trong `doc/`** (theo rule Cursor của project).
- **Log prompt / chỉ dẫn** từ từng thành viên: lưu theo **thư mục con = tên hoặc alias** của người đó.

## Cấu trúc gợi ý

```text
doc/
  DOCS.md                   ← file này
  future-plans/             ← plan hoãn / làm sau (vd. full map kho)
  <alias-nguoi-dung>/
    prompts-2026-05-10.md   ← log prompt theo ngày (hoặc dùng prompts.log.md)
  vi-du-minh/
    prompts.log.md
```

- **`<alias-nguoi-dung>`**: ví dụ `minh`, `team-a`, `nguyen.an` — thống nhất trong nhóm để dễ tìm.
- Nếu chưa có alias, rule AI có thể dùng tạm `doc/_chua-dat-ten/`; nên đổi tên thư mục sau cho đúng người.

## Nội dung một bản ghi log (gợi ý)

- Thời điểm (kèm múi giờ).
- Đoạn prompt / yêu cầu chính (copy hoặc tóm tắt không làm sai ý).
- Tóm tắt thay đổi hoặc quyết định đã thực hiện.

## README ở gốc repo

Hướng dẫn chạy project, stack, link sang mobile… nằm ở **`../README.md`** (gốc `vcl-forntend`), không thay thế `doc/`.
