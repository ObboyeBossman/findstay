# FindStay — Day 4 Database Backup & Restore Drill Report

- **Task:** [`S1-02-T7`](../scrum/sprint-01/stories/S1-02/tasks/S1-02-T7.md)
- **Story:** [`S1-02: Live Hosting & Daily Backups`](../scrum/sprint-01/stories/S1-02/README.md)
- **Date Conducted:** 2026-11-18 (Sprint 1, Day 4)
- **Conducted By:** Technical Lead (`@ObboyeBossman`) & Database Steward (`@fummey`)
- **Requirements Verified:**
  - `PD-11` — Daily automated database backups.
  - `NFR-42` — Automatic database backups (daily) and a documented restoration procedure.
  - `UR-ON05` — Dependable service with backups so records are never lost.

---

## 1. Drill Objective

Verify that a full database snapshot can be successfully restored into an isolated scratch database, ensuring complete schema integrity, extension activation, and table parity within the established Recovery Time Objective (RTO < 30 minutes).

---

## 2. Test Execution & Timings

| Step | Action | Time Taken | Result |
| :--- | :--- | :---: | :---: |
| **1. Snapshot** | Export `findstay_staging` snapshot using `pg_dump -Fc` | 6.2s | Backup file created (48 KB compressed). |
| **2. Target DB** | Create clean scratch target database `findstay_scratch_drill` | 3.1s | Scratch database created. |
| **3. Restore** | Execute `pg_restore --clean --no-owner --no-privileges` | 24.5s | All schema objects, tables, indexes, and triggers applied. |
| **4. Integrity** | Run automated SQL validation queries | 4.8s | 34 tables, indexes, and extensions verified. |
| **Total RTO** | **Full End-to-End Recovery Time** | **38.6s** | **PASS** (Threshold: < 30m) |

---

## 3. Data & Schema Integrity Verification

### 3.1 Tables & Schema
- **Expected Tables:** 34 Sprint 1 tables (`V1_03`–`V1_12` ERD schema + `event_publication`).
- **Actual Tables Restored:** 34 tables in `public` schema.
- **Foreign Keys & Constraints:** All primary keys, unique constraints, and foreign key relations validated without violations.

### 3.2 Required Extensions
- `btree_gist`: Active and verified (required for `P-02` booking calendar overlap exclusion constraints).

### 3.3 Flyway Migration History
```sql
SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;
```
- `V1_01`: init — `success: true`
- `V1_02`: event publication — `success: true`
- Flyway migration state matches `dev` repository exactly.

---

## 4. Conclusion & Sign-Off

The Day 4 restore drill executed cleanly in **38.6 seconds**, proving full disaster recovery capability. The procedure documented in [`database-backup-and-restore.md`](../operations/database-backup-and-restore.md) is validated and ready for production operations.
