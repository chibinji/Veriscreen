# VeriScreen

Student web app + Spring Boot backend for verified academic document access and screening.

## Documentation

| Document | Description |
|----------|-------------|
| [docs/VeriScreen-Backend-Guide.tex](docs/VeriScreen-Backend-Guide.tex) | Full architecture guide (compile to PDF with `pdflatex`) |
| [docs/CODE_REVIEW_CHECKLIST.md](docs/CODE_REVIEW_CHECKLIST.md) | Pre-commit SOLID / security checklist |
| [docs/database-least-privilege.sql](docs/database-least-privilege.sql) | PostgreSQL least-privilege user setup |
| [docs/veriscreen_project_proposal.pdf](docs/veriscreen_project_proposal.pdf) | Final year project proposal |

## Project structure

| Folder | Description |
|--------|-------------|
| `backend/` | Spring Boot REST API (JWT, PostgreSQL, OpenAPI) |
| `frontend/` | React + TypeScript student web portal |
| `docs/` | Architecture guides and project documents |

## Quick start

### 1. Backend

1. Create PostgreSQL database:
   ```sql
   CREATE DATABASE veriscreen_db;
   ```
2. Update `backend/src/main/resources/application.properties` with your PostgreSQL password.
3. Run:
   ```bash
   cd backend
   mvnw.cmd spring-boot:run
   ```

API: `http://localhost:8080`  
Swagger: `http://localhost:8080/swagger-ui.html`

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
| Backend (API) | `http://localhost:8080` |

In dev, the frontend **proxies** `/api` requests to the backend, so you don't need to worry about different ports in the browser.

**Both must be running at the same time** — start the backend first, then the frontend.

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
