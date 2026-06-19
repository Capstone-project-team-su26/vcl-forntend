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
cp .env.example .env.local
bun dev
```

URL mặc định: [http://localhost:3000](http://localhost:3000).

> Nếu không dùng Bun: `npm install`, `npm run dev`, `npm run build`, v.v.

---

## Chế độ Mock (khuyến nghị cho nhóm FE)

Nhóm FE có thể **chạy app không cần backend** bằng dữ liệu giả trong repo. Đây là cách làm việc mặc định khi dev UI, demo, hoặc backend chưa sẵn sàng.

### Bật Mock

1. Copy `.env.example` → `.env.local` (nếu chưa có).
2. Trong `.env.local`, đặt:

```env
NEXT_PUBLIC_DATA_SOURCE=mock
```

3. Restart dev server: `bun dev`.

Trang login sẽ hiện hộp **“Chế độ Mock — mật khẩu bất kỳ”** và các nút chọn role nhanh.

### Tài khoản Mock

| Email | Role | Sau login đi tới | Ghi chú |
|-------|------|------------------|---------|
| `sale@vcl.com` | Sale | `/staff?salesTab=consignments` | Duyệt / từ chối ký gửi |
| `admin@vcl.com` | Admin | `/admin/users` | Users, Hàng cấm, Bảng giá |
| `warehouse@vcl.com` | Warehouse Staff | `/staff` | Kho (không thấy tab Sales) |
| `customer@example.com` | Customer | `/profile` | Hồ sơ, purchase request mock |

**Mật khẩu:** nhập bất kỳ (vd. `123456`).

**Email linh hoạt:** nếu email chứa từ khóa thì tự map role — `admin`, `sale`, `warehouse`, `ops` → role tương ứng; còn lại → Customer.

Danh sách preset: `src/shared/mocks/mockAccounts.js`.

### Chuyển Mock ↔ API khi dev

Góc **dưới phải** màn hình (chỉ môi trường dev):

- Nút **Mock** / **API** — bật/tắt nhanh, trang sẽ reload.
- **Reset** — xóa ghi đè `localStorage`, dùng lại giá trị trong `.env.local`.

### Tính năng có Mock

| Khu vực | Route ví dụ | Service / dữ liệu |
|---------|-------------|-------------------|
| Đăng nhập / đăng ký / OTP | `/login`, `/register` | `authMocks.js` |
| Admin — Users | `/admin/users` | `userService.js` + `mockStore.users` |
| Admin — Hàng cấm | `/admin/restricted-items` | `restrictedItemService.js` |
| Admin — Bảng giá | `/admin/pricing-rules` | `pricingRuleService.js` |
| Staff — Ký gửi | `/staff?salesTab=consignments` | `orderConsignmentService.js` |
| Customer — Profile | `/profile` | `profileService.js` |
| Purchase request | `/purchaserequest` | `mockStore.purchaseRequests` |
| Operations dashboard | `/operational-dashboard` | `operationsService.js` |
| Staff workspace | `/staff` | `staffService.js` |
| Pricing / Transfer (UI) | `/pricing`, `/transfer` | `mockStore` |

### Tính năng cần API thật

Khi `NEXT_PUBLIC_DATA_SOURCE=api`, FE gọi backend qua proxy Next.js (`/api/*` → `API_URL`).

Cấu hình API (`.env.local`):

```env
API_URL=https://api-vcl.purintech.id.vn
NEXT_PUBLIC_DATA_SOURCE=api
```

Tài khoản test trên server (gọi endpoint seed):

- Admin: `GET /api/Test/seed-admin` → `admin@test.com` / `Admin123`
- Staff kho: `GET /api/Test/seed-staff` → `staff@employee.com` / `Employee123`

Swagger: `https://api-vcl.purintech.id.vn/swagger/v1/swagger.json`

### Thêm / sửa dữ liệu Mock

```
src/shared/mocks/
├── mockStore.js      ← seed chính (users, ký gửi, hàng cấm, bảng giá, …)
├── mockAccounts.js   ← email / role đăng nhập nhanh
├── mockDelay.js      ← giả lập độ trễ mạng
└── authMocks.js      ← register, OTP, forgot password
```

**Quy trình khi làm feature mới:**

1. Thêm seed vào `mockStore.js` (hoặc file mock riêng nếu lớn).
2. Trong `src/shared/services/<tên>Service.js`:
   - `if (isMockMode()) return ...Mock(...)`
   - `else return apiRequest(...)`
3. Kiểm tra với `NEXT_PUBLIC_DATA_SOURCE=mock` trước khi nối API.

Helper: `isMockMode()` từ `src/shared/config/dataSource.js`.

### Dark mode

Nút **mặt trăng / mặt trời** góc dưới trái — theme lưu `localStorage` key `vcl:theme`.

---

## Các lệnh thường dùng

| Mục đích | Lệnh |
|---------|------|
| Chạy dev (Turbopack) | `bun dev` |
| Build production | `bun run build` |
| Chạy bản đã build (sau `build`) | `bun run start` |
| Lint | `bun run lint` |

## Cấu trúc module-based (quan trọng)

- **`src/app/`** — Route/layout của Next (**chỉ nên giữ layer mỏng**): import UI từ module.
- **`src/modules/<tên-module>/`** — Logic & component theo tính năng (vd. `home`). Export công khai qua **`index.js`** của module đó.
- **`src/shared/`** — Code dùng chung giữa các module (constants, UI nhỏ, utils, services, mocks, …).

Ví dụ: trang chủ import từ module `home`:

- Route: `src/app/page.js`
- UI module: `src/modules/home/components/HomePage.js`

Constants chung web (tên app, mô tả): `src/shared/constants/site.js`

## Việc cần nhớ khi làm feature mới

1. Tạo thư mục `src/modules/<tên-feature>/` (component, hook riêng feature nếu cần).
2. Export từ `src/modules/<tên-feature>/index.js`.
3. Thêm route trong `src/app/...` và import component từ `@/modules/...`.
4. Thứ có thể tái sử dụng ở nhiều module → đặt vào `src/shared/`.
5. Service layer: hỗ trợ **mock + API** qua `isMockMode()` (xem mục Mock ở trên).

## Alias import

Alias **`@/`** trỏ tới **`src/`** (cấu hình trong `jsconfig.json`).

## Repository liên quan

Mobile (Expo) nằm song song trong cùng workspace: **`../vcl-mobile`** — xem README trong đó cho lệnh & cấu trúc React Native.

## Tài liệu thêm

- [Next.js Docs](https://nextjs.org/docs)
- [Turbopack (dev)](https://nextjs.org/docs/app/api-reference/turbopack)
