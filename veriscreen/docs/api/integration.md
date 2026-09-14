# APIs

## Simulated Student System (`http://localhost:8082`)

Protected by `X-API-Key` (`SIS_API_KEY`).

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/students/{studentId}` | Student record |
| GET | `/api/students/{studentId}/results` | Academic results |
| GET | `/api/students/{studentId}/registration` | Registrations |
| GET | `/api/students/{studentId}/examinations` | Examinations |
| GET | `/api/students/{studentId}/payments` | Payments |

Registrar JWT (`POST /api/v1/auth/login`) unlocks `/api/v1/registrar/students/**`.

## HELSB system (`http://localhost:8083`)

Inbound (VeriScreen, `X-API-Key` = `HELSB_API_KEY`):

| Method | Path |
|--------|------|
| POST | `/api/v1/inbound/applications` |
| GET | `/api/v1/inbound/students/{studentId}/applications` |

Officer JWT:

| Method | Path |
|--------|------|
| POST | `/api/v1/auth/login` |
| GET | `/api/v1/officer/stats` |
| GET | `/api/v1/officer/applications?status=&search=` |
| GET | `/api/v1/officer/applications/{id}` |
| POST | `/api/v1/officer/applications/{id}/confirm` |
| POST | `/api/v1/officer/applications/{id}/reject` |

## VeriScreen (`http://localhost:8081`)

Existing student APIs are unchanged. Added:

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/internal/helsb/decisions` | `X-API-Key` callback key |
