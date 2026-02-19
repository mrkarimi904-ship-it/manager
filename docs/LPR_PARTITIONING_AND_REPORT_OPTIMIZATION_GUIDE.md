# LPR Results: Partitioning & Report Optimization Guide

Use this guide to re-implement the LPR performance improvements (partitioning, database-side reports, automatic partition creation) after undoing the changes.

---

## Overview

**Problems addressed:**
1. 100M+ LPR records slow down the database
2. Reports (`reportHourly`, `reportWeekDay`, `reportMonthDay`) load ALL matching rows into Node.js memory and aggregate there—catastrophic at scale
3. No automatic partition creation—manual SQL each month is required

**Solutions:**
1. Time-based partitioning on `lpr_result` by `created_at`
2. Move report aggregation to database (`GROUP BY` in SQL)
3. NestJS scheduled task to auto-create monthly partitions

---

## Part 1: Fix Report Aggregation

**File:** `vms_manager/src/lpr_results/lpr_results.service.ts`

### 1.1 Add Prisma import
```ts
import { Prisma } from '@prisma/client';
```

### 1.2 Add helper method `buildReportWhereConditions`
Private method that builds SQL WHERE conditions from query params. Handles: camera filter (junction table `_cameraTolpr_result`), search (ocr ILIKE), isBlackList, isWhiteList, isNotifable, brand/color/model/type/address (ILIKE), dateFrom, dateTo.

Returns `Prisma.Sql[]`. Uses `Prisma.sql` and `Prisma.join` for safe parameterization.

### 1.3 Replace `reportHourly`, `reportWeekDay`, `reportMonthDay`
- Get cameras with user permission where (same as before)
- Call `buildReportWhereConditions(cameras, query)`
- Use `$queryRaw` with `Prisma.sql`:
  - **reportHourly:** `SELECT EXTRACT(HOUR FROM r.created_at)::int AS hour, COUNT(*)::bigint AS count FROM lpr_result r WHERE ... GROUP BY EXTRACT(HOUR FROM r.created_at)`
  - **reportWeekDay:** `SELECT EXTRACT(DOW FROM r.created_at)::int AS day, ... GROUP BY EXTRACT(DOW FROM r.created_at)` (0=Sunday)
  - **reportMonthDay:** `SELECT EXTRACT(DAY FROM r.created_at)::int AS day, ... GROUP BY EXTRACT(DAY FROM r.created_at)` (1-31)
- Fill missing hours/days with 0 to match expected output format
- Junction table: `_cameraTolpr_result` has `A`=camera.id, `B`=lpr_result.id. Use `EXISTS (SELECT 1 FROM "_cameraTolpr_result" ctr WHERE ctr."B" = r.id AND ctr."A" IN (${Prisma.join(cameraIds)}))`

---

## Part 2: Time-Based Partitioning Migration

**File:** `vms_manager/prisma/migrations/20250219000000_lpr_result_partitioning/migration.sql`

### Key steps:
1. Add `lpr_created_at` column to `_cameraTolpr_result` and `_lpr_resultTolpr_result_image` (required for FK to partitioned table PK)
2. Populate from `lpr_result.created_at` (delete orphaned rows first)
3. Set NOT NULL
4. Drop FKs, rename `lpr_result` → `lpr_result_old`
5. Create partitioned table with `PARTITION BY RANGE ("created_at")`, PK must be `("id", "created_at")`
6. Create DEFAULT partition `lpr_result_default`
7. `INSERT INTO lpr_result SELECT * FROM lpr_result_old`
8. Drop old table
9. Recreate indexes
10. Recreate FKs: `("B", "lpr_created_at") REFERENCES lpr_result("id", "created_at")`
11. Create triggers to auto-populate `lpr_created_at` when Prisma inserts into junction tables

### Trigger functions:
- `set_camera_lpr_created_at()` on `_cameraTolpr_result` BEFORE INSERT
- `set_lpr_result_image_created_at()` on `_lpr_resultTolpr_result_image` BEFORE INSERT

**Requires:** PostgreSQL 11+ (DEFAULT partition), 15+ for FK support.

---

## Part 3: Automatic Partition Creation

**File:** `vms_manager/src/lpr_results/lpr_partition.service.ts` (new)

```ts
@Injectable()
export class LprPartitionService implements OnModuleInit {
  async onModuleInit() {
    await this.ensurePartitionsForMonthsAhead(2).catch(...);
  }
  @Cron('15 0 1 * *', { timeZone: 'UTC' })
  async ensureMonthlyPartitions() {
    await this.ensurePartitionsForMonthsAhead(2);
  }
  async ensurePartitionsForMonthsAhead(monthsAhead: number) {
    // For each month 0..monthsAhead-1: compute year, month, fromStr, toStr, partitionName
    // partitionName = lpr_result_YYYY_MM
    // SQL: CREATE TABLE IF NOT EXISTS "partitionName" PARTITION OF "lpr_result"
    //      FOR VALUES FROM ('fromStr') TO ('toStr')
    // Catch: 42P16 (not partitioned), 42P07 (already exists)
  }
}
```

**File:** `vms_manager/src/lpr_results/lpr_results.module.ts`

Add `LprPartitionService` to `providers` array.

---

## Reference: Junction Table Structure

- `_cameraTolpr_result`: A = camera.id, B = lpr_result.id
- `_lpr_resultTolpr_result_image`: A = lpr_result.id, B = lpr_result_image.id

---

## Applying the Migration

```bash
cd vms_manager && npx prisma migrate deploy
```

---

## Future: Adding Monthly Partitions Manually (if needed)

```sql
CREATE TABLE "lpr_result_2025_02" PARTITION OF "lpr_result"
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

With `LprPartitionService` this is automatic; no manual steps needed.
