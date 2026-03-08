# API configuration (environment variables)

This page lists environment variables used by the Moteur API. Details (rate limits, behaviour) are in [REST API](REST%20API.md).

---

## Base & CORS

| Variable | Description |
|----------|-------------|
| `API_BASE_PATH` | Base path for all API routes (e.g. `/api`). Default: empty. |
| `CORS_ORIGINS` | Comma-separated allowed origins. Default: `http://localhost:3000`, `http://localhost:5173`. |

---

## Request body

| Variable | Description |
|----------|-------------|
| `API_BODY_LIMIT` | Max JSON body size (e.g. `1mb`). Default: `1mb`. |

---

## Request logging & usage

| Variable | Description |
|----------|-------------|
| `API_REQUEST_LOG_FILE` | Absolute path to the request audit log file (JSON lines). If set, admin and public requests are appended. |
| `API_REQUEST_LOG_DIR` | Directory for the log file; file name is `api-requests.log`. Used only if `API_REQUEST_LOG_FILE` is not set. |

**Note:** API key and `Authorization` header are never written to the log. Use log rotation (e.g. logrotate) and retain logs as required for audit or billing.

---

## Rate limiting

| Variable | Description |
|----------|-------------|
| `API_RATE_LIMIT_ADMIN_MAX` | Max admin requests per 15 min (per IP). Default: 10000 (effectively off). |
| `API_RATE_LIMIT_PUBLIC_MAX` | Max public requests per 15 min per project. Default: 1000. |
| `API_RATE_LIMIT_FORMS_MAX` | Max form submissions per 15 min per form (keyed by projectId+formId). Default: 60. |

---

## Security (Helmet)

| Variable | Description |
|----------|-------------|
| `HELMET_DISABLED` | Set to `1` to disable Helmet (e.g. for local Swagger). |
| `HELMET_CSP_DISABLED` | Set to `1` to disable only Content-Security-Policy. |

---

## Auth (JWT, OAuth)

See your deployment or [REST API](REST%20API.md) for auth-related env (e.g. `AUTH_*`, JWT secret).

---

## Storage & data

Project and content storage are configured via core; see the main [README](../README.md) and project/storage docs.
