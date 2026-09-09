# University SIS ↔ VeriScreen integration

## Architecture

The **university-sim** service (port **8090**) owns student profile, registrations, fees, examinations, and academic results.

**VeriScreen** (port **8080**) pulls that data into `veriscreen_db`, keeps JWT login + document generation, and owns HELSB application status rows.

```
university-sim (8090)  --GET /sis/v1/...-->  VeriScreen sync  -->  PostgreSQL
                                                              -->  Student JWT API (8080)
```

Shared secret header (both apps):

```properties
# university-sim
sis.api-key=dev-shared-secret

# VeriScreen backend
university.api-key=dev-shared-secret
university.base-url=http://localhost:8090
university.sync.enabled=true
university.sync.cron=0 */5 * * * *
```

## Startup order

1. PostgreSQL with both databases:
   ```sql
   CREATE DATABASE veriscreen_db;
   CREATE DATABASE university_db;
   ```
2. `cd university-sim` → `.\mvnw.cmd spring-boot:run` (uses permanent `university_db`)
3. `cd backend` → `.\mvnw.cmd spring-boot:run`

On VeriScreen startup, sync runs automatically. If the SIS is down, VeriScreen still boots and logs an error; call the manual sync endpoint after the SIS is up.

University SIS data is stored in PostgreSQL with `ddl-auto=update`, so fee/exam edits survive restarts. Seed data is inserted only when `students` is empty.

## Manual sync

```powershell
curl -X POST -H "X-Api-Key: dev-shared-secret" http://localhost:8080/api/v1/admin/sync/university
```

Expected: `{"syncedStudents":4,"status":"ok"}`

## Auth note

Student passwords stay in VeriScreen (BCrypt). New students created by sync get demo password `password123`. The SIS does not authenticate students for the mobile/web apps.

## Offline / local seed mode

To use the old in-process seed without university-sim:

```properties
university.sync.enabled=false
```

Then restart VeriScreen; [`DataLoader`](../backend/src/main/java/com/veriscreen/backend/service/DataLoader.java) seeds academic + HELSB data locally.

## End-to-end demo script

1. Start university-sim and VeriScreen (sync enabled).
2. Login as Grace: `2020123456` / `password123`.
3. Confirm fees show an outstanding balance and exams include `BLOCKED_FEES`.
4. In university-sim, PATCH her fee balance to `0` and exam to `eligible=true`, `status=CLEARED`.
5. `POST /api/v1/admin/sync/university`.
6. Refresh VeriScreen screening endpoints — fees/exams reflect the SIS change.
