# VeriScreen

Student web app + Spring Boot backend for verified academic document access and screening, now connected to a simulated university SIS and a separate HELSB officer portal.

## Documentation

| Document | Description |
|----------|-------------|
| [docs/architecture/overview.md](docs/architecture/overview.md) | How VeriScreen, SIS, and HELSB connect |
| [docs/api/integration.md](docs/api/integration.md) | Cross-system APIs |
| [docs/database/overview.md](docs/database/overview.md) | Separate databases |
| [docs/VeriScreen-Backend-Guide.tex](docs/VeriScreen-Backend-Guide.tex) | Full architecture guide (compile to PDF with `pdflatex`) |
| [docs/CODE_REVIEW_CHECKLIST.md](docs/CODE_REVIEW_CHECKLIST.md) | Pre-commit SOLID / security checklist |
| [docs/database-least-privilege.sql](docs/database-least-privilege.sql) | PostgreSQL least-privilege user setup |
| [docs/university-sis-integration.md](docs/university-sis-integration.md) | Simulated university SIS sync with VeriScreen |
| [docs/veriscreen_project_proposal.pdf](docs/veriscreen_project_proposal.pdf) | Final year project proposal |

## Project structure

| Folder | Description |
|--------|-------------|
<<<<<<< HEAD
| `backend/` | VeriScreen Spring Boot API (JWT, PostgreSQL, PDFs, QR) |
| `frontend/` | VeriScreen React student web portal |
| `mobile/` | Expo student mobile app |
| `simulated-student-system/` | Authoritative student records + registrar UI |
| `helsb-portal/` | HELSB officer API and portal |
=======
| `backend/` | Spring Boot REST API (JWT, PostgreSQL, OpenAPI, university sync) |
| `university-sim/` | Simulated university SIS (source of truth for academic data) |
| `frontend/` | React + TypeScript student web portal |
| `mobile/` | Expo (React Native) student mobile app |
>>>>>>> 8b452b7f50d2ea25c209b6f89403623c1d980c82
| `docs/` | Architecture guides and project documents |

## Quick start

Create three databases:

```sql
CREATE DATABASE veriscreen_db;
CREATE DATABASE sis_db;
CREATE DATABASE helsb_db;
```

Then start in this order:

1. Simulated SIS backend (`simulated-student-system/backend`, port **8082**)
2. HELSB backend (`helsb-portal/backend`, port **8083**)
3. VeriScreen backend (`backend`, port **8081**)
4. Frontends: VeriScreen `:5173`, HELSB `:5174`, SIS `:5175`

### 1. Backend

**Recommended (university SIS connected):**

1. Create PostgreSQL database:
   ```sql
   CREATE DATABASE veriscreen_db;
   ```
2. Update `backend/src/main/resources/application.properties` with your PostgreSQL password.
3. Start the simulated university SIS first (needs `university_db` — see [university-sim/README.md](university-sim/README.md)):
   ```bash
   cd university-sim
   mvnw.cmd spring-boot:run
   ```
   SIS: `http://localhost:8090` — permanent PostgreSQL by default
4. Then start VeriScreen (sync pulls students on startup):
   ```bash
   cd backend
   mvnw.cmd spring-boot:run
   ```

<<<<<<< HEAD
API: `http://localhost:8081`  
Swagger: `http://localhost:8081/swagger-ui.html`
=======
To run VeriScreen **without** the SIS, set `university.sync.enabled=false` in `application.properties`.

API: `http://localhost:8080`  
Swagger: `http://localhost:8080/swagger-ui.html`  
Manual sync: `POST http://localhost:8080/api/v1/admin/sync/university` with header `X-Api-Key: dev-shared-secret`
>>>>>>> 8b452b7f50d2ea25c209b6f89403623c1d980c82

### 2. Frontend

1. Install and run:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open `http://localhost:5173`
3. Sign in with a mock student account (see below).

**Ports (this is normal):**
| App | URL |
|-----|-----|
| Frontend (web UI) | `http://localhost:5173` |
| Backend (API) | `http://localhost:8081` |

In dev, the frontend **proxies** `/api` requests to the backend, so you don't need to worry about different ports in the browser.

**Both web and backend must be running at the same time** — start the backend first, then the frontend.

### 3. Mobile app

1. Keep the backend running.
2. Install and start Expo:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
3. Scan the QR code with Expo Go, or press `a` for an Android emulator.

A phone cannot use `localhost`. The app uses your PC's LAN IP on port 8080 by default. Details: [mobile/README.md](mobile/README.md).

### 4. HELSB officer portal

```bash
cd helsb-portal/frontend
npm install
npm run dev
```

Open http://localhost:5174

| Username | Password |
|----------|----------|
| `mwaka.chanda@helsb.zm` | `password123` |
| `chanda.phiri@helsb.zm` | `password123` |

### 5. Simulated student information system

```bash
cd simulated-student-system/frontend
npm install
npm run dev
```

Open http://localhost:5175 — registrar username `registrar`, password `password123`.

VeriScreen reads academic data from this system over HTTP. It does not connect to `sis_db` directly.

## Mock student accounts

All mock students use password `password123`.

| Student ID | Name | Scenario |
|------------|------|----------|
| `2021465934` | Samuel Chibinji Mwanza | Strong grades; small fee balance; approved HELSB loan |
| `2022030346` | Nosiku Mukuka | Fees fully paid; HELSB application under review |
| `2020123456` | Grace Banda | Outstanding fees; blocked from exams; HELSB not eligible |
| `2019876543` | Peter Zulu | Partial payments; multi-year history; approved HELSB |

## Student web app features

- Login with student ID + password
- Dashboard with summary stats
- Profile, documents, registrations, fees, examinations, academic results, HELSB status
- JWT stored in browser local storage
- Responsive layout for desktop and mobile browsers

## Architecture

| Layer | Responsibility |
|-------|----------------|
| `controller` | HTTP only — request/response, validation trigger |
| `service` | Business logic, security checks, document generation |
| `repository` | Database access (JPA) |
| `entity` | Persistence model |
| `dto` | API contracts (never expose entities) |
| `mapper` | Entity → DTO mapping |
| `config` | Security, OpenAPI |
| `exception` | Centralized HTTP error responses |
| `constants` | Shared API path constants (`ApiPaths`) |

## Backend setup

1. Create PostgreSQL database:
   ```sql
   CREATE DATABASE veriscreen_db;
   ```
   Optional least-privilege app user: see [docs/database-least-privilege.sql](docs/database-least-privilege.sql).

2. Update `backend/src/main/resources/application.properties` with your PostgreSQL password.

3. Build and run:
   ```bash
   cd backend
   mvnw.cmd clean install
   mvnw.cmd spring-boot:run
   ```

API base: `http://localhost:8080`  
API discovery (GET): [http://localhost:8080/api/v1](http://localhost:8080/api/v1)  
Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

## REST API endpoints

### Legacy paths (Sprint 1 / Postman)

| Method | URL | Auth |
|--------|-----|------|
| POST | `http://localhost:8080/api/auth/login` | None |
| GET | `http://localhost:8080/api/student/profile` | Bearer JWT |
| GET | `http://localhost:8080/api/student/documents` | Bearer JWT |

### Versioned paths (recommended)

| Method | URL | Auth |
|--------|-----|------|
| POST | `http://localhost:8080/api/v1/auth/login` | None |
| GET | `http://localhost:8080/api/v1/students/me/profile` | Bearer JWT |
| GET | `http://localhost:8080/api/v1/students/{studentId}/profile` | Bearer JWT (own ID only) |
| GET | `http://localhost:8080/api/v1/students/me/documents` | Bearer JWT |
| GET | `http://localhost:8080/api/v1/students/{studentId}/documents` | Bearer JWT (own ID only) |
| GET | `http://localhost:8080/api/v1/students/me/registrations` | Bearer JWT |
| GET | `http://localhost:8080/api/v1/students/{studentId}/registrations` | Bearer JWT (own ID only) |
| GET | `http://localhost:8080/api/v1/students/me/fees` | Bearer JWT |
| GET | `http://localhost:8080/api/v1/students/{studentId}/fees` | Bearer JWT (own ID only) |
| GET | `http://localhost:8080/api/v1/students/me/examinations` | Bearer JWT |
| GET | `http://localhost:8080/api/v1/students/{studentId}/examinations` | Bearer JWT (own ID only) |
| GET | `http://localhost:8080/api/v1/students/me/academic-results` | Bearer JWT |
| GET | `http://localhost:8080/api/v1/students/{studentId}/academic-results` | Bearer JWT (own ID only) |
| GET | `http://localhost:8080/api/v1/students/me/helsb` | Bearer JWT |
| GET | `http://localhost:8080/api/v1/students/{studentId}/helsb` | Bearer JWT (own ID only) |

### Login body

```json
{ "id": "2021465934", "password": "password123" }
```

### Mock student accounts

All mock students use password `password123`.

| Student ID | Name | Scenario |
|------------|------|----------|
| `2021465934` | Samuel Chibinji Mwanza | Strong grades; small fee balance; approved HELSB loan |
| `2022030346` | Nosiku Mukuka | Fees fully paid; HELSB application under review |
| `2020123456` | Grace Banda | Outstanding fees; blocked from exams; HELSB not eligible |
| `2019876543` | Peter Zulu | Partial payments; multi-year history; approved HELSB |

### Example

```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

GET http://localhost:8080/api/student/profile
Authorization: Bearer <accessToken>
```

## Troubleshooting

| Problem | Cause | Fix |
|---------|--------|-----|
| **Network error** on login | Backend not running, or frontend not restarted after setup | Start backend on port **8080**, restart frontend (`Ctrl+C` then `npm run dev`) |
| **403** on login | Bearer token sent on login | Clear site data / localStorage; login again |
| **405** / method not supported | GET on login URL | Login must be **POST** with JSON body |
| **401** on profile | Missing or invalid token | Login first; use `Authorization: Bearer <accessToken>` |

## Code review

Pre-commit checklist: [docs/CODE_REVIEW_CHECKLIST.md](docs/CODE_REVIEW_CHECKLIST.md)

## Adding a new document type (Open/Closed)

1. Create a class implementing `DocumentGenerator` (or extend `AbstractPlaceholderDocumentGenerator`).
2. Annotate with `@Component`.
3. No changes required to `DocumentServiceImpl` or controllers.
