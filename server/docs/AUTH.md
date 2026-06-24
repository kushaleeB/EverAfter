# EverAfter — Authentication Module

Complete JWT + bcrypt authentication with refresh token rotation and password reset.

## Endpoints

Base: `/api/v1/auth`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | — | Create account + issue tokens |
| POST | `/login` | — | Authenticate + issue tokens |
| POST | `/refresh` | — | Rotate refresh token |
| POST | `/logout` | — | Revoke single session |
| POST | `/forgot-password` | — | Send reset link (email stub in dev) |
| POST | `/reset-password` | — | Set new password via token |
| GET | `/me` | Bearer | Current user profile |
| POST | `/logout-all` | Bearer | Revoke all sessions |
| POST | `/change-password` | Bearer | Change password while logged in |

## Token Strategy

- **Access token:** JWT, short-lived (default 15m), sent as `Authorization: Bearer <token>`
- **Refresh token:** Opaque 96-char hex, stored in `user_sessions`, rotated on each refresh
- **Reset token:** Opaque 64-char hex, SHA-256 hashed in `password_reset_tokens`

## Request Examples

### Register
```json
POST /api/v1/auth/register
{
  "email": "eleanor@example.com",
  "password": "SecurePass1",
  "firstName": "Eleanor",
  "lastName": "Ashford"
}
```

### Login
```json
POST /api/v1/auth/login
{ "email": "eleanor@example.com", "password": "SecurePass1" }
```

### Refresh
```json
POST /api/v1/auth/refresh
{ "refreshToken": "<refresh_token>" }
```

### Forgot Password
```json
POST /api/v1/auth/forgot-password
{ "email": "eleanor@example.com" }
```

### Reset Password
```json
POST /api/v1/auth/reset-password
{ "token": "<reset_token>", "password": "NewSecurePass1" }
```

## Database Tables

See `database/auth-schema.sql`:
- `users` — accounts with bcrypt password hashes
- `user_sessions` — refresh token store with rotation
- `password_reset_tokens` — hashed reset tokens with expiry

## Security

- bcrypt with 12 salt rounds
- Rate limiting on auth endpoints (20 req / 15 min)
- Email enumeration prevention on forgot-password
- All sessions revoked on password reset
- Password rules: 8+ chars, uppercase, lowercase, number
