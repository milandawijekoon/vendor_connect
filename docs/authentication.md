# Authentication & Authorization

## 1. Strategy

- **JWT access tokens** (stateless), signed with `JWT_SECRET`, short-lived
  (e.g. 30 minutes, configurable via `JWT_EXPIRES_IN`)
- **bcrypt** for password hashing (cost factor 10–12), never store plain text
- Designed so a **refresh-token table** can be added later (e.g. a `RefreshToken` model
  keyed to `User`) without restructuring existing auth guards/controllers — the access
  token contract (`sub`, `role`, `email`, `exp`) stays the same either way.

## 2. Registration & Login Flow

```
POST /auth/register
  → validate input (email format, password policy, role)
  → check for existing user (409 if duplicate)
  → hash password with bcrypt
  → create User row
  → return JWT

POST /auth/login
  → find user by email
  → compare password with bcrypt.compare
  → return JWT (401 on mismatch, do not reveal which field was wrong)
```

## 3. Password Policy (MVP)

- Minimum 8 characters
- At least one letter and one number
- Enforced via DTO validation (`class-validator` custom rule), not just frontend

## 4. Authorization Model

Role-based access control with three roles: `CUSTOMER`, `VENDOR`, `ADMIN`.

- **`@Roles(Role.VENDOR)` decorator + `RolesGuard`** — protects vendor-only endpoints
  (e.g. `PATCH /vendors/:id`)
- **Ownership checks** — beyond role, a vendor can only edit *their own* profile. This is
  enforced in the service layer (compare `req.user.id` to `vendorProfile.userId`), not
  just the guard, since guards alone can't express "owns this specific resource."
- **`@Roles(Role.ADMIN)`** — protects all `/admin/*` endpoints

## 5. Token Handling

- Access token returned in response body on login/register (frontend stores in memory /
  httpOnly cookie — avoid `localStorage` for anything beyond MVP prototyping, to reduce
  XSS exposure)
- `AuthGuard` extracts and verifies JWT on protected routes, attaches `req.user`
- Expired token → `401` with a clear `"error": "TokenExpired"` so frontend can redirect
  to login cleanly

## 6. Failure Cases Handled

| Case | Response |
|---|---|
| Invalid credentials | 401, generic message |
| Expired token | 401, `TokenExpired` |
| Missing token on protected route | 401 |
| Valid token, wrong role | 403 |
| Valid token, wrong owner | 403 |
| Duplicate email on register | 409 |

## 7. Security Notes

- Rate limit `/auth/login` and `/auth/register` specifically (brute-force protection)
  via `@nestjs/throttler`
- `JWT_SECRET` and all credentials come from environment variables, validated at
  startup (app fails fast if missing, rather than running insecurely)
- No sensitive data (passwords, tokens) ever appears in logs
