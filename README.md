# VeriScreen

Sprint 1 backend: Spring Boot REST API with JWT authentication and student endpoints.

## Backend setup

1. Create PostgreSQL database:
   ```sql
   CREATE DATABASE veriscreen_db;
   ```

2. Update `backend/src/main/resources/application.properties` with your PostgreSQL password.

3. Build and run:
   ```bash
   cd backend
   mvnw.cmd clean install
   mvnw.cmd spring-boot:run
   ```

API runs at `http://localhost:8080`.

## Postman tests

| Method | URL | Auth |
|--------|-----|------|
| POST | `http://localhost:8080/api/auth/login` | None — body: `{"id":"2021465934","password":"password123"}` |
| GET | `http://localhost:8080/api/student/profile` | `Authorization: Bearer <token>` |
| GET | `http://localhost:8080/api/student/documents` | `Authorization: Bearer <token>` |
