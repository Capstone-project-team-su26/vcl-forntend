# vcl-forntend — Web (Next.js)

**Quy ước chung monorepo + agent:** file [`../AGENTS.md`](../AGENTS.md) tại thư mục `FrameProject`.

Frontend web dùng **Next.js** (App Router), **JavaScript**, **Tailwind CSS**, và **kiến trúc module-based**. Package manager mặc định của dự án là **Bun**.

## Yêu cầu môi trường

- [Bun](https://bun.sh) ≥ 1.2 (khuyến nghị) — hoặc Node.js 20+ nếu dùng npm/pnpm/yarn
- Trình duyệt hiện đại để dev

## Cài đặt lần đầu

Từ thư mục project:

```bash
cd vcl-forntend
bun install
```

## Các lệnh thường dùng

| Mục đích | Lệnh |
|---------|------|
| Chạy dev (Turbopack) | `bun dev` |
| Build production | `bun run build` |
| Chạy bản đã build (sau `build`) | `bun run start` |
| Lint | `bun run lint` |

URL mặc định: [http://localhost:3000](http://localhost:3000).

> Nếu không dùng Bun: `npm install`, `npm run dev`, `npm run build`, v.v.

## Cấu trúc module-based (quan trọng)

- **`src/app/`** — Route/layout của Next (**chỉ nên giữ layer mỏng**): import UI từ module.
- **`src/modules/<tên-module>/`** — Logic & component theo tính năng (vd. `home`). Export công khai qua **`index.js`** của module đó.
- **`src/shared/`** — Code dùng chung giữa các module (constants, UI nhỏ, utils, …).

Ví dụ: trang chủ import từ module `home`:

- Route: `src/app/page.js`
- UI module: `src/modules/home/components/HomePage.js`

Constants chung web (tên app, mô tả): `src/shared/constants/site.js`

## Việc cần nhớ khi làm feature mới

1. Tạo thư mục `src/modules/<tên-feature>/` (component, hook riêng feature nếu cần).
2. Export từ `src/modules/<tên-feature>/index.js`.
3. Thêm route trong `src/app/...` và import component từ `@/modules/...`.
4. Thứ có thể tái sử dụng ở nhiều module → đặt vào `src/shared/`.

## Alias import

Alias **`@/`** trỏ tới **`src/`** (cấu hình trong `jsconfig.json`).

## Repository liên quan

Mobile (Expo) nằm song song trong cùng workspace: **`../vcl-mobile`** — xem README trong đó cho lệnh & cấu trúc React Native.

## Tài liệu thêm

- [Next.js Docs](https://nextjs.org/docs)
- [Turbopack (dev)](https://nextjs.org/docs/app/api-reference/turbopack)
