# Three-system architecture

VeriScreen remains the student-facing platform. Two new systems sit beside it:

```
Student  →  VeriScreen (frontend :5173, backend :8081, DB veriscreen_db)
                 │
                 │ API key  GET /api/students/{id}/...
                 v
          Simulated Student System (frontend :5175, backend :8082, DB sis_db)

Student  →  VeriScreen  POST /api/v1/students/me/helsb/submit
                 │
                 │ API key  POST /api/v1/inbound/applications
                 v
          HELSB system (frontend :5174, backend :8083, DB helsb_db)
                 │
                 │ officer confirm/reject
                 │ API key  POST /api/v1/internal/helsb/decisions
                 v
          VeriScreen updates HelsbApplication status
```

## What stayed in VeriScreen

- Student login (JWT, `students` table)
- Official PDF generation, document IDs, QR verification
- Student web and mobile portals
- Existing HELSB *student* pages

## What is authoritative where

| Data | System |
|------|--------|
| Login credentials | VeriScreen |
| Academic records (results, registration, exams, fees) | Simulated Student System |
| Issued PDFs and QR verification | VeriScreen |
| Officer review / confirm / reject | HELSB portal |
| Student-visible HELSB status | VeriScreen copy, synced from HELSB |

VeriScreen does not write to `sis_db` or `helsb_db`. It consumes their APIs.
