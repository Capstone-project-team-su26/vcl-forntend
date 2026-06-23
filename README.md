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

Danh sách preset: `src/utils/mocks/mockAccounts.js`.

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
src/utils/mocks/
├── mockStore.js      ← seed chính (users, ký gửi, hàng cấm, bảng giá, …)
├── mockAccounts.js   ← email / role đăng nhập nhanh
├── mockDelay.js      ← giả lập độ trễ mạng
├── authMocks.js      ← register, OTP, forgot password
├── dataSource.js     ← bật/tắt mock vs API
└── index.js          ← export gộp (import `@/utils/mocks`)
```

**Quy trình khi làm feature mới:**

1. Thêm seed vào `mockStore.js` (hoặc file mock riêng trong `mocks/` nếu lớn).
2. Trong `src/utils/<tên>Service.js`:
   - `if (isMockMode()) return ...Mock(...)`
   - `else return apiRequest(...)`
3. Kiểm tra với `NEXT_PUBLIC_DATA_SOURCE=mock` trước khi nối API.

Helper: `isMockMode()` từ `src/utils/mocks/dataSource.js` (hoặc `import { isMockMode } from "@/utils/mocks"`).

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

## Cấu trúc project (colocation theo route)

Giống pattern App Router phổ biến: **component nằm cạnh route**, code dùng chung ở `src/hooks`, `src/utils`. Toàn bộ code **JavaScript** (`.js` / `.jsx`).

- **`src/app/`** — Route Next.js; mỗi route có thể có **`components/`** riêng.
- **`src/app/components/`** — UI dùng chung toàn app (logo, theme, homepage, …).
- **`src/hooks/`** — React hooks dùng chung (vd. `useAuth`).
- **`src/utils/`** — API client, services, mocks, config, constants, helpers.

Ví dụ trang staff:

- Route: `src/app/staff/page.jsx`
- UI: `src/app/staff/components/StaffPage.jsx`, `StaffShell.jsx`, …

Constants site: `src/utils/site.js`

## Phân quyền theo role (FE)

| Route | Role được phép |
|-------|----------------|
| `/admin/*` | Admin |
| `/staff/*`, `/transfer` | Sale, WarehouseStaff, OperationsManager |
| `/operational-dashboard` | OperationsManager |
| `/profile`, `/purchaserequest` | Customer |
| `/`, `/login`, `/pricing`, `/customer` | Công khai |

- **`src/middleware.js`** — chặn route sớm (đọc cookie `vcl_role`, `vcl_auth`).
- **`src/app/components/AuthGuard.jsx`** — guard phía client trong layout từng khu vực.
- **`src/utils/routeAccess.js`** — map route ↔ role (sửa tại đây khi thêm route mới).
- **API 401** → đăng xuất, chuyển `/login?next=...`. **API 403** → về trang home của role + banner cảnh báo.

Cookie đồng bộ từ session khi login/logout (`src/utils/authSession.js`).

## Việc cần nhớ khi làm feature mới

1. Thêm route trong `src/app/<tên-route>/page.jsx`.
2. Đặt component của route vào `src/app/<tên-route>/components/`.
3. Route con (vd. admin/users) → `src/app/admin/users/components/`.
4. Hook / service dùng nhiều nơi → `src/hooks/`, `src/utils/`.
5. UI dùng toàn app → `src/app/components/`.
6. Service layer: hỗ trợ **mock + API** qua `isMockMode()` (xem mục Mock ở trên).

## Alias import

Alias **`@/`** trỏ tới **`src/`** (cấu hình trong `jsconfig.json`).

## Repository liên quan

Mobile (Expo) nằm song song trong cùng workspace: **`../vcl-mobile`** — xem README trong đó cho lệnh & cấu trúc React Native.

## Tài liệu thêm

- [Next.js Docs](https://nextjs.org/docs)
- [Turbopack (dev)](https://nextjs.org/docs/app/api-reference/turbopack)
