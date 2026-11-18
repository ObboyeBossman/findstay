# FindStay — Database Backup & Disaster Recovery Guide

- **Task:** [`S1-02-T6`](../scrum/sprint-01/stories/S1-02/tasks/S1-02-T6.md)
- **Story:** [`S1-02: Live Hosting & Daily Backups`](../scrum/sprint-01/stories/S1-02/README.md)
- **Requirements Satisfied:**
  - `PD-11` — Daily automated database backups.
  - `NFR-42` — Automatic database backups (daily) and a documented restoration procedure.
  - `UR-ON05` — Dependable service with backups so records are never lost.
- **Audience:** DevOps Engineers, Database Administrators, Technical Leads

---

## 1. Backup Architecture & Strategy

FindStay operates on PostgreSQL 17.11 hosted via Supabase Session Pooler with Flyway migrations managing schema versions (`V1_01` to `V1_12` + `V1_02__event_publication`).

### 1.1 Automated Daily Backups
- **Schedule:** Automated physical snapshots occur daily at **02:00 UTC** (02:00 Africa/Accra).
- **WAL Archiving:** Continuous Write-Ahead Logging (WAL) is active for Point-in-Time Recovery (PITR).
- **Storage Isolation:** Backups are stored in isolated, encrypted, geo-replicated object storage outside the primary database instance cluster.
- **Retention Schedule:**
  - **Staging:** 7 days rolling retention.
  - **Production:** 30 days rolling retention.

### 1.2 Recovery Targets
- **Recovery Point Objective (RPO):** Maximum 24 hours with daily snapshots; < 5 minutes with WAL replay.
- **Recovery Time Objective (RTO):** < 30 minutes from disaster declaration to full database restore and health validation.

---

## 2. Manual Backup Procedure (Pre-Deployment / Ad-Hoc)

Before major migrations, sprint releases, or schema updates, a manual snapshot must be generated using `pg_dump`:

```bash
# Set database connection from staging environment
export PG_URL="${SPRING_DATASOURCE_URL}"

# Export compressed, custom-format database snapshot
TIMESTAMP=$(date -u +%Y%m%d_%H%M%SZ)
pg_dump "$PG_URL" -Fc -f "findstay_backup_${TIMESTAMP}.dump"

# Verify dump file was created and is non-empty
ls -lh "findstay_backup_${TIMESTAMP}.dump"
```

---

## 3. Step-by-Step Restoration Procedure

Follow these steps to restore a backup into a fresh target or scratch database (e.g. for drills, disaster recovery, or staging refresh):

### Step 1: Provision Clean Scratch Database
```bash
# Connect as administrative user and create scratch database
psql -h aws-0-eu-west-2.pooler.supabase.com -p 5432 -U postgres.xavnlsinbzfcaacfzqac -d postgres \
  -c "CREATE DATABASE findstay_scratch;"
```

### Step 2: Restore Schema & Data
```bash
# Execute pg_restore against the target database
# Note: --no-owner and --no-privileges prevent role conflicts across environments
pg_restore -h aws-0-eu-west-2.pooler.supabase.com -p 5432 \
  -U postgres.xavnlsinbzfcaacfzqac \
  -d findstay_scratch \
  --clean --if-exists \
  --no-owner --no-privileges \
  "findstay_backup_${TIMESTAMP}.dump"
```

### Step 3: Run Database Integrity Checks
Run the following SQL queries to verify data and schema integrity:

```sql
-- 1. Verify Flyway migration history
SELECT version, description, type, installed_on, success 
FROM flyway_schema_history 
ORDER BY installed_rank DESC;

-- 2. Verify all Sprint 1 tables exist (34 tables expected)
SELECT count(*) AS total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 3. Verify lookup reference data is populated
SELECT count(*) AS room_types FROM accommodation_type;
SELECT count(*) AS billing_periods FROM billing_period;
```

### Step 4: Validate Application Connection
Update `SPRING_DATASOURCE_URL` to point to the restored database and verify that `/actuator/health` returns `status: UP` and database connection is healthy:

```bash
curl -sf https://findstay-api-staging.onrender.com/actuator/health | grep '"UP"'
```

---

## 4. Disaster Recovery Checklist

- [ ] Declare incident and record start timestamp.
- [ ] Identify latest viable automated snapshot or manual `.dump` archive.
- [ ] Provision target database instance.
- [ ] Run `pg_restore` with integrity logging.
- [ ] Verify 34 core tables, primary keys, and foreign keys.
- [ ] Verify `flyway_schema_history` matches latest deployed commit.
- [ ] Switch API connection strings and restart backend services.
- [ ] Verify `/actuator/health` and complete smoke test.
- [ ] Record incident resolution and total downtime elapsed (must meet RTO < 30m).
