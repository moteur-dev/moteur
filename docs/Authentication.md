# Authentication

This page summarizes how to authenticate with the Moteur API: **JWT** for admin and Studio, **project API key** for read-only access (e.g. frontends and static site generators). For endpoint details, see [REST API](REST%20API.md). For environment variables, see [Configuration](Configuration.md).

---

## JWT (admin and Studio)

Use JWT when you need to create or update content, manage projects, or use Moteur Studio. The token is a Bearer token sent in the `Authorization` header.

### Getting a JWT

**Email/password login:**

```http
POST {basePath}/auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "..." }
```

Response: `{ "token": "<jwt>", "user": { ... } }`. Use `token` in subsequent requests:

```http
Authorization: Bearer <token>
```

**Refresh:** Before the token expires, call `POST {basePath}/auth/refresh` with the same (or a valid) JWT. Returns `{ "token": "<new-jwt>" }`.

**Current user:** `GET {basePath}/auth/me` (with JWT) returns `{ "user": { ... } }` including the user’s projects.

### OAuth (GitHub, Google)

If enabled, use the browser flow:

- `GET {basePath}/auth/github` or `GET {basePath}/auth/google` — redirects to the provider.
- Provider redirects back to `.../auth/github/callback` or `.../auth/google/callback`.
- The API sets a session or returns a token; `AUTH_REDIRECT_AFTER_LOGIN` (or default `/auth/callback`) is used as the final redirect.

List available providers with `GET {basePath}/auth/providers` (returns `{ "providers": [...] }`).

### Environment variables (JWT and OAuth)

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | **Required.** Secret used to sign and verify JWTs. Use a long random value in production. |
| `AUTH_USERS_FILE` | Path to the users file (default: `data/users.json`). See storage config. |
| `AUTH_REDIRECT_AFTER_LOGIN` | Where to redirect after OAuth login (default: `/auth/callback`). |
| `AUTH_GITHUB_CLIENT_ID` | GitHub OAuth app client ID (enables GitHub login when set with secret and redirect URI). |
| `AUTH_GITHUB_CLIENT_SECRET` | GitHub OAuth app secret. |
| `AUTH_GITHUB_REDIRECT_URI` | GitHub OAuth redirect URI (e.g. `http://localhost:3000/auth/github/callback`). |
| `AUTH_GOOGLE_CLIENT_ID` | Google OAuth client ID. |
| `AUTH_GOOGLE_CLIENT_SECRET` | Google OAuth secret. |
| `AUTH_GOOGLE_REDIRECT_URI` | Google OAuth redirect URI. |

---

## Project API key (read-only)

Each project has at most one **API key**. Use it to read data via the **Public API** (collections, pages, navigations, sitemaps). Key auth is **read-only**: GET requests only; POST/PATCH/DELETE with only the API key return 403.

### How to send the key

- **Header:** `x-api-key: <your-project-api-key>`
- **Query:** `?apiKey=<your-project-api-key>`

If both JWT and API key are present, JWT takes precedence for authorization.

### Getting the key

The key is created and rotated via the **Admin API** (with JWT). The raw key is returned **only once** when you generate or rotate it; store it securely (e.g. env var, secrets manager).

- **Generate:** `POST {basePath}/admin/projects/:projectId/api-key/generate` — returns `{ "rawKey": "...", "prefix": "mk_live_..." }`.
- **Rotate:** `POST {basePath}/admin/projects/:projectId/api-key/rotate` — replaces the key, returns the new raw key once.
- **Revoke:** `POST {basePath}/admin/projects/:projectId/api-key/revoke` — removes the key.
- **Status:** `GET {basePath}/admin/projects/:projectId/api-key` — returns prefix only (e.g. `mk_live_...`), not the raw key.

See [Public API and Collections](Public%20API%20and%20Collections.md) for using the key with collections.
