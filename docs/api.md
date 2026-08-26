# API Design

Base URL (dev): `http://localhost:4000/api/v1`

## Conventions

- REST, JSON request/response bodies
- Standard HTTP status codes (200, 201, 400, 401, 403, 404, 409, 422, 500)
- Consistent error shape:
  ```json
  { "statusCode": 400, "message": "Validation failed", "error": "Bad Request" }
  ```
- Pagination via query params: `?page=1&limit=20` → response includes `{ data, total, page, limit }`
- All list endpoints support `sort` and relevant `filter` query params
- Swagger/OpenAPI docs served at `/api/docs` in non-production environments

## Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | – | Register as couple or vendor |
| POST | `/auth/login` | – | Returns JWT access token |
| GET | `/auth/me` | JWT | Current user profile |

## Categories

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/categories` | – | List all categories |

## Vendors

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/vendors` | – | Search/filter vendors (`category`, `city`, `minPrice`, `maxPrice`, `q`, `page`, `limit`, `sort`) |
| GET | `/vendors/:slug` | – | Vendor public profile |
| POST | `/vendors` | JWT (VENDOR) | Create own vendor profile (onboarding) |
| PATCH | `/vendors/:id` | JWT (VENDOR, owner) | Update own profile |
| POST | `/vendors/:id/images` | JWT (VENDOR, owner) | Upload portfolio image (multipart → Cloudinary) |
| DELETE | `/vendors/:id/images/:imageId` | JWT (VENDOR, owner) | Remove portfolio image |

## Reviews

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/vendors/:id/reviews` | – | List reviews for a vendor |
| POST | `/vendors/:id/reviews` | JWT (COUPLE) | Submit a review (one per vendor per user) |

## Inquiries

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/vendors/:id/inquiries` | – (guest allowed) | Submit inquiry/lead to a vendor |
| GET | `/vendor/inquiries` | JWT (VENDOR) | List leads for logged-in vendor (`status`, `page`) |
| PATCH | `/vendor/inquiries/:id` | JWT (VENDOR, owner) | Update inquiry status (contacted/confirmed/closed) |

## Admin

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/vendors?status=pending` | JWT (ADMIN) | List vendors awaiting approval |
| PATCH | `/admin/vendors/:id/approve` | JWT (ADMIN) | Approve vendor → triggers search indexing |
| PATCH | `/admin/vendors/:id/reject` | JWT (ADMIN) | Reject vendor with reason |
| PATCH | `/admin/vendors/:id/suspend` | JWT (ADMIN) | Suspend a previously approved vendor |

## Error Handling Rules

- Validation errors → `400` with field-level messages
- Auth required but missing/invalid token → `401`
- Authenticated but not authorized (e.g. editing another vendor's profile) → `403`
- Resource not found → `404`
- Duplicate resource (e.g. email already registered, duplicate review) → `409`
- Never return raw Prisma/database error messages or stack traces to the client
