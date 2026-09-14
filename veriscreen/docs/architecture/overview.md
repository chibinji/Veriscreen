# Architecture

VeriScreen is now three connected systems. The original student portal was kept and extended; it was not rewritten.

```
Student  →  VeriScreen (frontend :5173, backend :8081, DB veriscreen_db)
                 │
                 │  X-API-Key  GET /api/students/{id}/...
                 ▼
         Simulated SIS (frontend :5175, backend :8082, DB sis_db)

Student  →  VeriScreen HELSB submit
                 │
                 │  X-API-Key  POST /api/v1/inbound/applications
                 ▼
         HELSB system (frontend :5174, backend :8083, DB helsb_db)
                 │
                 │  X-API-Key  POST /api/v1/internal/helsb/decisions
                 ▼
         VeriScreen application status
```

## Roles

| Role | System | Access |
|------|--------|--------|
| STUDENT | VeriScreen | Own profile, records, documents, HELSB application |
| HELSB_OFFICER | HELSB Officer Portal only | Review/confirm/reject applications |
| REGISTRAR | Simulated SIS console | Read-only student records |
| ADMIN | Existing VeriScreen mock UI | Unchanged; not required for the new flow |

Students cannot call HELSB officer APIs. Officers cannot log into the student portal with officer credentials.

## What stayed in VeriScreen

- JWT student login
- Issued documents, QR verification (`/api/verify/{id}`)
- Official PDF generation (OpenPDF)
- Student REST paths under `/api/v1/students/...`
- Existing student, registration, fee, exam, result, and HELSB JPA tables (still used as auth + fallback)

## What is new

- SIS is the source of truth for academic data when it is reachable
- HELSB applications are forwarded to the HELSB system
- Officer confirm/reject is written back onto the student's VeriScreen HELSB record
