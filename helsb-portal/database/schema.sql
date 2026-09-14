-- HELSB database schema
CREATE TABLE IF NOT EXISTS helsb_officers (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
    id BIGSERIAL PRIMARY KEY,
    application_number VARCHAR(40) NOT NULL UNIQUE,
    veriscreen_application_id BIGINT,
    student_id VARCHAR(20) NOT NULL,
    student_name VARCHAR(160),
    nrc VARCHAR(32),
    programme VARCHAR(120),
    faculty VARCHAR(160),
    status VARCHAR(32) NOT NULL,
    document_ids VARCHAR(1000),
    notes VARCHAR(2000),
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by VARCHAR(120)
);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications (student_id);

CREATE TABLE IF NOT EXISTS application_reviews (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications (id),
    officer_id BIGINT REFERENCES helsb_officers (id),
    decision VARCHAR(32) NOT NULL,
    comment VARCHAR(2000),
    created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS application_status_history (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications (id),
    from_status VARCHAR(32),
    to_status VARCHAR(32) NOT NULL,
    changed_by VARCHAR(120),
    comment VARCHAR(2000),
    changed_at TIMESTAMPTZ
);
