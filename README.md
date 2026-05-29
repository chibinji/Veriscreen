# VeriScreen

Sprint 1 backend: layered Spring Boot REST API with JWT authentication, SOLID-oriented design, and OpenAPI documentation.

## Documentation

| Document | Description |
|----------|-------------|
| [docs/VeriScreen-Backend-Guide.tex](docs/VeriScreen-Backend-Guide.tex) | Full architecture guide (compile to PDF with `pdflatex`) |
| [docs/CODE_REVIEW_CHECKLIST.md](docs/CODE_REVIEW_CHECKLIST.md) | Pre-commit SOLID / security checklist |
| [docs/database-least-privilege.sql](docs/database-least-privilege.sql) | PostgreSQL least-privilege user setup |

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

### Login body

```json
{ "id": "2021465934", "password": "password123" }
```

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
| **403** on login | Wrong URL not permitted, or Bearer token sent on login | Use `/api/auth/login` or `/api/v1/auth/login`; set Authorization to **No Auth** for login |
| **405** / method not supported | GET on login URL | Login must be **POST** with JSON body |
| **401** on profile | Missing or invalid token | Login first; use `Authorization: Bearer <accessToken>` |

## Code review

Pre-commit checklist: [docs/CODE_REVIEW_CHECKLIST.md](docs/CODE_REVIEW_CHECKLIST.md)

## Adding a new document type (Open/Closed)

1. Create a class implementing `DocumentGenerator` (or extend `AbstractPlaceholderDocumentGenerator`).
2. Annotate with `@Component`.
3. No changes required to `DocumentServiceImpl` or controllers.
