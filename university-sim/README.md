# University SIS Simulation

Simulated university Student Information System (SIS) used as the **source of truth** for VeriScreen academic data.

## Database (permanent / production-like)

Default storage is **PostgreSQL** database `university_db`. Data survives app restarts. Demo seed runs **only when the student table is empty**.

1. Create the database once:

```sql
CREATE DATABASE university_db;
```

Or run [`db/create-university-db.sql`](db/create-university-db.sql).

2. Match credentials in [`src/main/resources/application.properties`](src/main/resources/application.properties) (`postgres` / `admin` by default — same style as VeriScreen).

3. Start:

```powershell
cd university-sim
.\mvnw.cmd spring-boot:run
```

- API: `http://localhost:8090`
- Swagger: `http://localhost:8090/swagger-ui.html`

Inspect data with **pgAdmin**, **DBeaver**, or `psql`:

```sql
\c university_db
SELECT * FROM students;
SELECT * FROM fees;
```

### Optional: disposable in-memory H2 (demos only)

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev-h2"
```

Then open `http://localhost:8090/h2-console` with JDBC URL `jdbc:h2:mem:university_db`, user `sa`, blank password. That profile **wipes data on stop**.

## Security

All `/sis/**` routes require header:

```http
X-Api-Key: dev-shared-secret
```

Change `sis.api-key` before any real deployment.

## SIS API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/sis/v1/students` | List student IDs |
| GET | `/sis/v1/students/{id}` | Profile |
| GET | `/sis/v1/students/{id}/registrations` | Registrations |
| GET | `/sis/v1/students/{id}/fees` | Fees |
| GET | `/sis/v1/students/{id}/examinations` | Examinations |
| GET | `/sis/v1/students/{id}/academic-results` | Results |
| PATCH | `/sis/v1/students/{id}/fees/{feeId}` | Update fee (demo) |
| PATCH | `/sis/v1/students/{id}/examinations/{examinationId}` | Update exam (demo) |

## Demo students

Same IDs as VeriScreen: `2021465934`, `2022030346`, `2020123456`, `2019876543`.

## Demo: clear Grace Banda fees

1. List Grace’s fees (note the fee id with outstanding balance):

```powershell
curl -H "X-Api-Key: dev-shared-secret" http://localhost:8090/sis/v1/students/2020123456/fees
```

2. Clear the outstanding balance (replace `{feeId}`):

```powershell
curl -X PATCH -H "X-Api-Key: dev-shared-secret" -H "Content-Type: application/json" `
  -d "{\"outstandingBalance\":0}" `
  http://localhost:8090/sis/v1/students/2020123456/fees/{feeId}
```

3. Optionally mark the blocked exam eligible:

```powershell
curl -X PATCH -H "X-Api-Key: dev-shared-secret" -H "Content-Type: application/json" `
  -d "{\"eligible\":true,\"status\":\"CLEARED\"}" `
  http://localhost:8090/sis/v1/students/2020123456/examinations/{examinationId}
```

4. Re-sync VeriScreen (see [docs/university-sis-integration.md](../docs/university-sis-integration.md)).

Fee/exam changes in PostgreSQL stay after restart until you change them again.
