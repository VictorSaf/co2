# Database Migration: Access Request Form Enhancements (Feature 0022)

## Overview

This migration script updates the `access_requests` table to support the new position field and makes the reference field mandatory.

## Changes

1. **Add `position` column**: VARCHAR(100), NOT NULL
2. **Make `reference` column NOT NULL**: Update existing NULL values to empty string first

## Prerequisites

- Python 3.7+
- SQLite database file (default: `backend/kyc_database_dev.db`)
- Database file must exist and contain `access_requests` table

## Usage

### Dry Run (Recommended First)

Check what the migration would do without making changes:

```bash
cd backend
python scripts/migrate_access_requests_0022.py --dry-run
```

### Execute Migration

Run the migration:

```bash
cd backend
python scripts/migrate_access_requests_0022.py
```

### Custom Database Path

If your database is in a different location:

```bash
python scripts/migrate_access_requests_0022.py --database /path/to/your/database.db
```

## What the Migration Does

1. **Checks current state**: Verifies if migration is needed
2. **Updates NULL references**: Sets any NULL `reference` values to empty string `''`
3. **Adds position column**: Adds `position` column if it doesn't exist
4. **Sets default values**: Sets `position = ''` for existing records
5. **Makes reference NOT NULL**: Recreates table with NOT NULL constraint on `reference`
6. **Recreates indexes**: Restores all indexes on the table

## Safety Features

- **Dry run mode**: Test migration without making changes
- **State verification**: Checks current database state before migration
- **Transaction safety**: Uses database transactions for atomicity
- **Rollback on error**: Automatically rolls back on any error
- **Verification**: Verifies migration success after completion

## Manual SQL Alternative

If you prefer to run SQL manually, here are the commands:

```sql
-- Step 1: Update NULL reference values
UPDATE access_requests SET reference = '' WHERE reference IS NULL;

-- Step 2: Add position column (if it doesn't exist)
ALTER TABLE access_requests ADD COLUMN position VARCHAR(100);

-- Step 3: Set default values for existing records
UPDATE access_requests SET position = '' WHERE position IS NULL;

-- Step 4: Make reference NOT NULL (SQLite requires table recreation)
-- This is complex and handled automatically by the migration script
-- See the script for the full table recreation logic
```

**Note**: SQLite doesn't support `ALTER COLUMN`, so making `reference` NOT NULL requires recreating the table. The migration script handles this automatically.

## Troubleshooting

### Database File Not Found

```
ERROR: Database file not found: /path/to/database.db
```

**Solution**: Ensure the database file exists, or use `--database` to specify the correct path.

### Migration Already Applied

```
✅ Database is already up to date. No migration needed.
```

**Solution**: This is normal if the migration has already been run. No action needed.

### Migration Fails

If migration fails, check:
1. Database file permissions (must be writable)
2. No other processes are using the database
3. Database file is not corrupted

The script will automatically roll back any changes if an error occurs.

## Related Files

- **Feature Plan**: `docs/features/0022_PLAN.md`
- **Code Review**: `docs/features/0022_REVIEW.md`
- **Model**: `backend/models/access_request.py`
- **API**: `backend/api/access_requests.py`

## Version

- **Feature**: 0022
- **Migration Version**: 1.0
- **Date**: 2024

