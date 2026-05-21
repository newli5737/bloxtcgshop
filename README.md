# PokéMart

Monorepo theo [PRD.md](./PRD.md): **Next.js 14** (web) + **NestJS 10** (API) + **Prisma 6** + **PostgreSQL**.

**Phạm vi hiện tại:** không triển khai **giỏ hàng** và **thanh toán** (đúng hướng PRD v1 / yêu cầu của bạn).

## Yêu cầu

- Node 20+
- pnpm 9+
- PostgreSQL cài **trực tiếp trên máy** (không dùng Docker trong repo này)

## Cấu hình database

Tạo database `pokemon`, user `postgres`, password `test1234` (hoặc chỉnh trong `DATABASE_URL`).

Chuỗi kết nối mặc định trong `packages/database/.env` và `apps/api/.env`:

`postgresql://postgres:test1234@localhost:5432/pokemon`

Nếu PostgreSQL của bạn chạy cổng khác (không dùng `5432`), sửa host/port trong `DATABASE_URL`.

## Port ứng dụng (không dùng 3000 / 3001)

Mặc định trong repo:

| Dịch vụ | Port |
|--------|------|
| Web (Next.js) | **3040** |
| API (NestJS) | **3041** |

Đổi port: `apps/api/.env` → `PORT`, `CORS_ORIGINS`; `apps/web/.env.local` → `NEXT_PUBLIC_API_URL`; script `dev`/`start` trong `apps/web/package.json` nếu cần cổng web khác.

## Cài đặt

```bash
pnpm install
pnpm db:generate
pnpm db:push
pnpm db:seed
```

## Chạy dev

Hai terminal (hoặc `pnpm dev` từ root nếu Turbo chạy song song):

```bash
pnpm --filter @pokemart/api dev
pnpm --filter @pokemart/web dev
```

- Web: http://localhost:3040 → redirect sang `/en`
- API: http://localhost:3041/v1
- Swagger: http://localhost:3041/docs

## Tài khoản seed

- Admin: `admin@pokemart.local` / `admin123`
- User: `user@pokemart.local` / `user123`

## Biến môi trường

- `packages/database/.env` — `DATABASE_URL`
- `apps/api/.env` — JWT + `DATABASE_URL` + `PORT` + `CORS_ORIGINS`
- `apps/web/.env.local` — `NEXT_PUBLIC_API_URL` (phải trùng host/port API, ví dụ `http://localhost:3041/v1`)

## Đã triển khai (v1 nền tảng)

- Schema Prisma + seed mẫu.
- API REST `/v1`: catalog, tin, banner, xếp hạng, tìm kiếm, JWT, wishlist, admin stats.
- Web đa ngôn ngữ `en` / `vi` / `ja`: trang chủ, sản phẩm, danh mục, set, Pokémon, tin, xếp hạng.

Chưa làm: NextAuth UI đầy đủ, upload Cloudinary, Redis, panel admin trên web — có thể bổ sung sau.
