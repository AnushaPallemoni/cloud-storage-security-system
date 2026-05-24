-- =====================================================
-- Cloud Storage Security & Auditing System
-- PostgreSQL Setup Script
-- Run this ONCE before starting the application
-- =====================================================

-- Step 1: Create database
CREATE DATABASE cloudsec_db;

-- Step 2: Connect to it (\c cloudsec_db in psql)

-- NOTE: Hibernate auto-creates all tables on first run.
-- The SQL below is just for reference / manual setup.

CREATE TABLE IF NOT EXISTS users (
    id           BIGSERIAL PRIMARY KEY,
    username     VARCHAR(50)  UNIQUE NOT NULL,
    email        VARCHAR(100) UNIQUE NOT NULL,
    password     VARCHAR(255) NOT NULL,
    role         VARCHAR(30)  NOT NULL DEFAULT 'USER',
    public_key   VARCHAR(1000),
    identity_hash VARCHAR(255),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cloud_files (
    id            BIGSERIAL PRIMARY KEY,
    file_name     VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path     VARCHAR(500) NOT NULL,
    file_size     BIGINT,
    file_type     VARCHAR(100),
    file_hash     VARCHAR(64),
    sanitized_path VARCHAR(500),
    is_sanitized  BOOLEAN DEFAULT FALSE,
    is_shared     BOOLEAN DEFAULT FALSE,
    status        VARCHAR(30) DEFAULT 'UPLOADED',
    owner_id      BIGINT REFERENCES users(id) ON DELETE CASCADE,
    uploaded_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_requests (
    id              BIGSERIAL PRIMARY KEY,
    file_id         BIGINT REFERENCES cloud_files(id) ON DELETE CASCADE,
    requested_by    BIGINT REFERENCES users(id),
    audited_by      BIGINT REFERENCES users(id),
    challenge_token VARCHAR(256),
    proof_response  VARCHAR(512),
    status          VARCHAR(30) DEFAULT 'PENDING',
    audit_result    TEXT,
    requested_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at    TIMESTAMP
);

CREATE TABLE IF NOT EXISTS file_shares (
    id           BIGSERIAL PRIMARY KEY,
    file_id      BIGINT REFERENCES cloud_files(id) ON DELETE CASCADE,
    shared_by    BIGINT REFERENCES users(id),
    shared_with  BIGINT REFERENCES users(id),
    use_sanitized BOOLEAN DEFAULT TRUE,
    share_token  VARCHAR(255) UNIQUE,
    shared_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verify
SELECT table_name FROM information_schema.tables WHERE table_schema='public';
