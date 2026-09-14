# Databases

Three PostgreSQL databases, created separately:

```sql
CREATE DATABASE veriscreen_db;
CREATE DATABASE sis_db;
CREATE DATABASE helsb_db;
```

| Database | Owner | Contents |
|----------|-------|----------|
| `veriscreen_db` | VeriScreen | Student login, issued documents, HELSB application references |
| `sis_db` | Simulated SIS | Authoritative students, registrations, results, examinations, payments |
| `helsb_db` | HELSB | Officers, applications, reviews, status history |

Hibernate `ddl-auto=update` creates tables on first run. SQL snapshots:

- `simulated-student-system/database/schema.sql`
- `helsb-portal/database/schema.sql`
