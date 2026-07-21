# vcl-forntend — Hệ thống nội bộ (Next.js)

**Quy ổc chung monorepo + agent:** file [`../AGENTS.md`](../AGENTS.md) tại thư mục `FrameProject`.

Web **nội bộ** cho nhân viên VCL — **Admin**, **Sale**, **Operations**. **Khách hàng** dùng repo/app riêng (mobile hoặc web customer tách biệt).

Stack: **Next.js** (App Router), **JavaScript**, **Tailwind CSS**. Package manager mặc định: **Bun**.

## Yêu cầu môi trường

- [Bun](https://bun.sh) ≥ 1.2 (khuyến nghị) — hoặc Node.js 20+ nếu dùng npm/pnpm/yarn
- Trình duyệt hiện đại để dev

## Cài đặt lần đầu

```bash
cd vcl-forntend
bun install
cp .env.example .env.local
bun dev
```

URL mặc định: [http://localhost:3000](http://localhost:3000) → chuyển tới `/pages/auth/login`.

> Nếu không dùng Bun: `npm install`, `npm run dev`, `npm run build`, v.v.

---

## Chế độ Mock (khuyến nghị cho nhóm FE)

Nhóm FE có thể **chạy app không cần backend** bằng dữ liệu giả trong repo.

### Bật Mock

1. Copy `.env.example` → `.env.local` (nếu chưa có).
2. Trong `.env.local`, đặt:

```env
NEXT_PUBLIC_DATA_SOURCE=mock
```

3. Restart dev server: `bun dev`.

Trang login hiện hộp **“Chế độ Mock — mật khẩu bất kỳ”** và các nút chọn role nhân viên nhanh.

### Tài khoản Mock

| Email | Role | Sau login đi tới |
|-------|------|------------------|
| `sale@vcl.com` | Sale | `/pages/sales/consignments` |
| `admin@vcl.com` | Admin | `/pages/admin/users` |
| `ops@vcl.com` | Operations | `/pages/operations` |

**Mật khẩu:** nhập bất kỳ (vd. `123456`).

**Email linh hoạt:** nếu email chứa từ khóa thì tự map role — `admin`, `sale`, `ops` → role tương ứng.

Danh sách preset: `src/utils/mocks/mockAccounts.js`.

### Chuyển Mock ↔ API khi dev

Góc **dưới phải** màn hình (chỉ môi trường dev):

- Nút **Mock** / **API** — bật/tắt nhanh, trang sẽ reload.
- **Reset** — xóa ghi đè `localStorage`, dùng lại giá trị trong `.env.local`.

### Tính năng có Mock

| Khu vực | Route ví dụ | Service / dữ liệu |
|---------|-------------|-------------------|
| Đăng nhập / quên mật khẩu | `/pages/auth/login`, `/pages/auth/forgot-password` | `authMocks.js` |
| Admin — Users | `/pages/admin/users` | `userService.js` + `mockStore.users` |
| Admin — Hàng cấm | `/pages/admin/restricted-items` | `restrictedItemService.js` |
| Admin — Bảng giá | `/pages/admin/pricing-rules` | `pricingRuleService.js` |
| Sales — Ký gửi | `/pages/sales/consignments` | `orderConsignmentService.js` |
| Operations dashboard | `/pages/operations` | `operationsService.js` |
| Sales workspace | `/pages/sales` | `staffService.js` |
| Transfer (sales) | `/pages/sales/transfer` | `operationsService.js` |

### Tính năng cần API thật

Khi `NEXT_PUBLIC_DATA_SOURCE=api`, FE gọi backend qua proxy Next.js (`/api/*` → `API_URL`).

Cấu hình API (`.env.local`):

```env
API_URL=https://api-vcl.purintech.id.vn
NEXT_PUBLIC_DATA_SOURCE=api
```

Tài khoản test trên server (dev buttons): `sales@test.com` / `Sales123`, `admin@test.com` / `Admin123`, `ops@test.com` / `Ops123`. Nút chỉ hiện khi `NODE_ENV=development`.

Swagger: xem host API trong `.env.local` (vd. `{API_URL}/swagger`).

> FE chỉ gọi HTTP API qua proxy `/api/*`. **Không** có connection string / truy cập thẳng database.

### Thêm / sửa dữ liệu Mock

```
src/utils/mocks/          ← core mock (dataSource, delay, accounts, store aggregator)
src/modules/<feature>/
├── index.js              ← facade public (UI chỉ import đây)
├── api.js                ← gọi /api/*
├── mock.js               ← đọc/ghi mock
├── mappers.js            ← normalize / toApi payload
└── seed.js               ← (tuỳ chọn) seed domain, gắn vào mockStore
```

**Quy trình khi làm feature mới:**

1. Tạo `src/modules/<feature>/` với `api` / `mock` / `mappers` / `index`.
2. Seed: thêm vào `mockStore` hoặc `modules/<feature>/seed.js` rồi import vào store.
3. UI import từ `@/modules/<feature>` — không gọi `apiRequest` trực tiếp từ component.
4. Kiểm tra với `NEXT_PUBLIC_DATA_SOURCE=mock` trước khi nối API.

Helper: `isMockMode()` từ `src/utils/mocks/dataSource.js` (hoặc `import { isMockMode } from "@/utils/mocks"`).

### Dark mode

Nút **mặt trăng / mặt trời** góc dưới trái — theme lưu `localStorage` key `vcl:theme`.

---

## Các lệnh thường dùng

| Mục đích | Lệnh |
|---------|------|
| Chạy dev (Turbopack, mặc định) | `bun run dev` |
| Dev webpack (fallback Windows) | `bun run dev:webpack` |
| Xóa cache `.next` | `bun run clean` |
| Build production | `bun run build` |
| Chạy bản đã build (sau `build`) | `bun run start` |
| Lint | `bun run lint` |

## Cấu trúc project (colocation theo route)

- **`src/app/pages/`** — Toàn bộ page, chia theo role (URL vẫn `/pages/...`):
  - **`auth/`** — đăng nhập, quên/đặt lại mật khẩu (công khai)
  - **`admin/`** — Admin
  - **`sales/`** — Sale (ký gửi, purchase, …)
  - **`operations/`** — Operations (dashboard vận hành)
- **`src/app/components/`** — UI dùng chung toàn app (logo, theme, auth guard, …).
- **`src/modules/<feature>/`** — domain logic: `api.js` + `mock.js` + `mappers.js` + `index.js` (facade `isMockMode()`).
- **`src/hooks/`** — React hooks dùng chung (vd. `useAuth`).
- **`src/utils/`** — helper dùng chung: API client, mocks core, `appRoutes.js`, `routeAccess.js` (không nhét service domain mới vào đây).

Ví dụ:

```
src/app/pages/
├── auth/login/page.jsx
├── admin/users/page.jsx
├── sales/page.jsx
├── sales/transfer/page.jsx
└── operations/page.jsx
```

Constants đường dẫn: `src/utils/appRoutes.js` — import `ROUTES` khi link/navigate.
Constants site: `src/utils/site.js`

## Phân quyền theo role (FE)

| Route | Role được phép |
|-------|----------------|
| `/pages/admin/*` | Admin |
| `/pages/sales/*` | Sale |
| `/pages/operations` | OperationsManager |
| `/`, `/pages/auth/*` | Công khai |

- **`src/middleware.js`** — chặn route sớm (đọc cookie `vcl_role`, `vcl_auth`).
- **`src/app/components/AuthGuard.jsx`** — guard phía client trong layout từng khu vực.
- **`src/utils/routeAccess.js`** — map route ↔ role (sửa tại đây khi thêm route mới).
- **API 401** → đăng xuất, chuyển `/pages/auth/login?next=...`. **API 403** → về trang home của role + banner cảnh báo.

Cookie đồng bộ từ session khi login/logout (`src/utils/authSession.js`).

## Việc cần nhớ khi làm feature mới

1. Thêm route trong `src/app/pages/<role>/<tên-route>/page.jsx`.
2. Đặt component của route vào `components/` cùng cấp route.
3. Cập nhật `src/utils/appRoutes.js` và `src/utils/routeAccess.js` nếu thêm khu vực mới.
4. Domain logic (CRUD/API/mock) → `src/modules/<feature>/`.
5. Hook / helper thật sự dùng chung → `src/hooks/`, `src/utils/`.
6. UI dùng toàn app → `src/app/components/`.
7. Module facade: **mock + API** qua `isMockMode()` trong `index.js` (xem mục Mock ở trên).

## Alias import

Alias **`@/`** trỏ tới **`src/`** (cấu hình trong `jsconfig.json`).

## Repository liên quan

- **Customer app** — repo riêng (web/mobile khách hàng), không nằm trong repo này.
- **Mobile (Expo)** trong cùng workspace: **`../vcl-mobile`** — xem README trong đó.

## Tài liệu thêm

- [Next.js Docs](https://nextjs.org/docs)
- [Turbopack (dev)](https://nextjs.org/docs/app/api-reference/turbopack)
