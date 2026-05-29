# VeriScreen Code Review Checklist (Pre-Commit Self-Check)

Refactored backend status after SOLID / layered architecture pass.

## SOLID Principles

| # | Check | Pass |
|---|--------|------|
| S | Every class has one clear responsibility (`JwtServiceImpl` = JWT only; `StudentServiceImpl` = profile logic; controllers = HTTP only) | ✅ |
| O | New document types via new `DocumentGenerator` implementation (e.g. transcript) without changing existing generators | ✅ |
| L | Any `DocumentGenerator` implementation (placeholder vs future PDF) is interchangeable by `DocumentServiceImpl` | ✅ |
| I | Small interfaces: `JwtService`, `AuthService`, `StudentService`, `DocumentService`, `DocumentGenerator` | ✅ |
| D | Controllers and filters depend on interfaces (`AuthService`, `JwtService`), not concrete types | ✅ |

## Dependency Injection & IoC

| # | Check | Pass |
|---|--------|------|
| 1 | Dependencies injected via constructor (no `new` for services/repos) | ✅ |
| 2 | Constructor injection used throughout | ✅ |
| 3 | No `@Autowired` static fields | ✅ |

## Separation of Concerns (Layered Architecture)

| # | Check | Pass |
|---|--------|------|
| 1 | Controllers handle HTTP only | ✅ |
| 2 | Services contain business logic (access checks, document orchestration) | ✅ |
| 3 | Repositories = JPA only | ✅ |
| 4 | Entities never returned from REST; DTOs + `StudentMapper` | ✅ |
| 5 | No SQL/JPA in controllers | ✅ |

## DRY

| # | Check | Pass |
|---|--------|------|
| 1 | JWT logic centralized in `JwtServiceImpl` | ✅ |
| 2 | Ownership checks in `StudentAccessValidator`; mapping in `StudentMapper` | ✅ |
| 3 | API paths in `ApiPaths`; JWT config in `application.properties` | ✅ |

## KISS

| # | Check | Pass |
|---|--------|------|
| 1 | Simple strategy list for documents; no extra layers beyond needed | ✅ |
| 2 | Service layer added where it carries real logic | ✅ |
| 3 | Meaningful names; SLF4J debug logs without secrets | ✅ |

## API-First & RESTful Design

| # | Check | Pass |
|---|--------|------|
| 1 | Noun-based paths: `/api/v1/students/me/profile`, `/api/v1/auth/login` | ✅ |
| 2 | GET for reads, POST for login | ✅ |
| 3 | Status codes via `GlobalExceptionHandler` (400, 401, 403, 404, 500) | ✅ |
| 4 | Swagger UI at `/swagger-ui.html` | ✅ |
| 5 | Legacy Sprint 1 paths (`/api/auth/login`, `/api/student/*`) documented and supported | ✅ |

## Security (Principle of Least Privilege)

| # | Check | Pass |
|---|--------|------|
| 1 | DB user privileges: see `docs/database-least-privilege.sql` (ops setup) | ⚠️ Ops |
| 2 | `StudentAccessValidator` enforces self-access on `/{studentId}/` routes | ✅ |
| 3 | BCrypt passwords in `DataLoader` | ✅ |
| 4 | JWT expiration from config; validated per request in filter | ✅ |
| 5 | No passwords/tokens in logs | ✅ |

## Fail Fast & Input Validation

| # | Check | Pass |
|---|--------|------|
| 1 | `@Valid` + `@NotBlank` on `LoginRequest` | ✅ |
| 2 | `ResourceNotFoundException` / `OwnershipViolationException` in services | ✅ |
| 3 | Invalid JWT not swallowed silently in filter; auth failures throw to handler | ✅ |

## Code Quality & Maintainability

| # | Check | Pass |
|---|--------|------|
| 1 | Lombok on entities/DTOs; `@Slf4j` on services | ✅ |
| 2 | Comments on interfaces and security components where non-obvious | ✅ |
| 3 | Magic strings reduced via `ApiPaths` and properties | ✅ |
| 4 | Compiles cleanly | ✅ |
| 5 | `JwtServiceImplTest` unit tests | ✅ |

## Database & JPA

| # | Check | Pass |
|---|--------|------|
| 1 | `@ManyToOne` + `@JoinColumn` on child entities | ✅ |
| 2 | `FetchType.LAZY` on associations (N+1 avoided until collections are queried) | ✅ |
| 3 | `ddl-auto=create-drop` for dev; use `validate` + migrations in production | ⚠️ Dev only |
