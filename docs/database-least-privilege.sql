-- Principle of least privilege: application DB user (run as PostgreSQL superuser)
-- Adjust username/password to match application.properties

CREATE USER veriscreen_app WITH PASSWORD 'change_me';

GRANT CONNECT ON DATABASE veriscreen_db TO veriscreen_app;
GRANT USAGE ON SCHEMA public TO veriscreen_app;

-- Sprint 1: read/write on application tables only (no superuser, no DDL in production)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO veriscreen_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO veriscreen_app;

-- Production: revoke DDL; use Flyway/Liquibase with a separate migration role
-- REVOKE CREATE ON SCHEMA public FROM veriscreen_app;
