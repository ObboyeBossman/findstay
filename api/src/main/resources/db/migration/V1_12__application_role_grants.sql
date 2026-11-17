-- =====================================================================
-- FindStay V1_12 — the application DB role and its grants (grants last)
-- Task S1-01-T9 (issue #33), built from the approved ERD §3.8, §6
-- ("grants last") and S1-08 AC 2.
--
-- Design (DEC-S1-01/J):
--   * findstay_app is a NOLOGIN group role carrying exactly the
--     privileges the running application needs. The deployment's
--     interactive user (the Render PostgreSQL user, or `postgres` in
--     local dev) is GRANTed membership once, outside the migrations —
--     see the runbook in api/README.md. Migrations themselves always
--     run as the database owner, which is unaffected by these grants.
--   * audit.audit_log is the exception that gives this script its
--     point: findstay_app holds INSERT and SELECT on it and NOTHING
--     ELSE — there is no UPDATE or DELETE grant to abuse, so the
--     append-only rule (S1-08 AC 2) is enforced at the database role
--     level, whatever application code does.
--   * Default privileges are set so tables added by LATER migrations
--     in the eight CRUD schemas are granted automatically — future
--     migrations cannot forget. The audit schema is deliberately
--     EXCLUDED: any future audit-owned table must be granted
--     explicitly, which is the safe direction for an append-only
--     module.
--   * No sequences exist (UUIDs are application-generated UUIDv7),
--     so there are no sequence grants.
-- =====================================================================

-- The group role, idempotently (safe on databases where it already
-- exists, e.g. a rebuild from a partial dump)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'findstay_app') THEN
        CREATE ROLE findstay_app NOLOGIN;
    END IF;
END
$$;

-- Reach the schemas at all
GRANT USAGE ON SCHEMA
    public, identity, organization, media, verification,
    listing, availability, audit, notification, admin
    TO findstay_app;

-- Business tables: full CRUD (hard delete is a designed R1 operation
-- for photos and blocks; everything else is app-mediated)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA
    identity, organization, media, verification,
    listing, availability, notification, admin
    TO findstay_app;

-- Spring Modulith's event registry (created by V1_02)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_publication TO findstay_app;

-- audit.audit_log — append-only: INSERT + SELECT, and that is all
-- (S1-08 AC 2; ERD §3.8). No UPDATE, no DELETE, no TRUNCATE.
GRANT SELECT, INSERT ON audit.audit_log TO findstay_app;

-- Future tables created by later migrations in the CRUD schemas are
-- granted automatically (the audit schema stays excluded on purpose)
ALTER DEFAULT PRIVILEGES IN SCHEMA identity
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO findstay_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA organization
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO findstay_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA media
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO findstay_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA verification
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO findstay_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA listing
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO findstay_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA availability
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO findstay_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA notification
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO findstay_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA admin
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO findstay_app;
