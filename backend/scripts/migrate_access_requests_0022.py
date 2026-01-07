#!/usr/bin/env python3
"""
Database Migration Script for Access Request Form Enhancements (Feature 0022)

This script migrates the access_requests table to:
1. Add the 'position' column (VARCHAR(100), NOT NULL)
2. Make the 'reference' column NOT NULL

Usage:
    python migrate_access_requests_0022.py [--dry-run] [--database PATH]

Options:
    --dry-run    Show what would be done without making changes
    --database   Path to database file (default: kyc_database_dev.db in backend directory)
"""

import sys
import os
import argparse
import sqlite3
from pathlib import Path

# Add parent directory to path to import app modules
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))


def check_column_exists(cursor, table_name, column_name):
    """Check if a column exists in a table"""
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [row[1] for row in cursor.fetchall()]
    return column_name in columns


def check_column_nullable(cursor, table_name, column_name):
    """Check if a column is nullable (returns True if nullable, False if NOT NULL)"""
    cursor.execute(f"PRAGMA table_info({table_name})")
    for row in cursor.fetchall():
        if row[1] == column_name:
            # Column 3 is 'notnull' - 0 means nullable, 1 means NOT NULL
            return row[3] == 0
    return None


def get_null_count(cursor, table_name, column_name):
    """Get count of NULL values in a column"""
    cursor.execute(f"SELECT COUNT(*) FROM {table_name} WHERE {column_name} IS NULL")
    return cursor.fetchone()[0]


def migrate_database(database_path, dry_run=False):
    """Perform the migration"""
    print(f"Connecting to database: {database_path}")
    
    if not os.path.exists(database_path):
        print(f"ERROR: Database file not found: {database_path}")
        return False
    
    conn = sqlite3.connect(database_path)
    cursor = conn.cursor()
    
    try:
        # Check current state
        print("\n=== Checking Current Database State ===")
        
        position_exists = check_column_exists(cursor, 'access_requests', 'position')
        reference_nullable = check_column_nullable(cursor, 'access_requests', 'reference')
        null_reference_count = get_null_count(cursor, 'access_requests', 'reference')
        
        print(f"Position column exists: {position_exists}")
        print(f"Reference column nullable: {reference_nullable}")
        print(f"NULL reference values: {null_reference_count}")
        
        # Determine what needs to be done
        needs_position = not position_exists
        needs_reference_not_null = reference_nullable is True
        
        if not needs_position and not needs_reference_not_null:
            print("\n✅ Database is already up to date. No migration needed.")
            return True
        
        print("\n=== Migration Plan ===")
        if needs_position:
            print("1. Add 'position' column (VARCHAR(100), NOT NULL)")
            if null_reference_count > 0:
                print(f"   - Will set default value '' for existing {null_reference_count} records")
        if needs_reference_not_null:
            print("2. Make 'reference' column NOT NULL")
            if null_reference_count > 0:
                print(f"   - Will update {null_reference_count} NULL values to ''")
        
        if dry_run:
            print("\n[DRY RUN] Would execute the above changes.")
            return True
        
        # Perform migration
        print("\n=== Executing Migration ===")
        
        # Step 1: Update NULL reference values to empty string
        if needs_reference_not_null and null_reference_count > 0:
            print(f"Updating {null_reference_count} NULL reference values to empty string...")
            cursor.execute("UPDATE access_requests SET reference = '' WHERE reference IS NULL")
            conn.commit()
            print("✅ NULL reference values updated")
        
        # Step 2: Add position column if it doesn't exist
        if needs_position:
            print("Adding 'position' column...")
            # SQLite doesn't support adding NOT NULL column directly if table has data
            # We'll add it as nullable first, then update and add constraint
            cursor.execute("ALTER TABLE access_requests ADD COLUMN position VARCHAR(100)")
            conn.commit()
            print("✅ Position column added")
            
            # Set default value for existing records
            existing_count = cursor.execute("SELECT COUNT(*) FROM access_requests").fetchone()[0]
            if existing_count > 0:
                print(f"Setting default value '' for {existing_count} existing records...")
                cursor.execute("UPDATE access_requests SET position = '' WHERE position IS NULL")
                conn.commit()
                print("✅ Default values set")
        
        # Step 3: Make reference NOT NULL
        if needs_reference_not_null:
            print("Making 'reference' column NOT NULL...")
            # SQLite doesn't support ALTER COLUMN, so we need to recreate the table
            # This is a more complex operation
            
            # Get all data
            cursor.execute("SELECT id, entity, contact, reference, status, created_at, reviewed_at, reviewed_by, notes FROM access_requests")
            rows = cursor.fetchall()
            
            # Get column info to check if position exists
            cursor.execute("PRAGMA table_info(access_requests)")
            columns_info = cursor.fetchall()
            has_position = any(col[1] == 'position' for col in columns_info)
            
            # Create new table with correct schema
            print("Recreating table with NOT NULL constraint...")
            cursor.execute("DROP TABLE IF EXISTS access_requests_new")
            
            if has_position:
                create_table_sql = """
                CREATE TABLE access_requests_new (
                    id VARCHAR(36) PRIMARY KEY,
                    entity VARCHAR(200) NOT NULL,
                    contact VARCHAR(120) NOT NULL,
                    position VARCHAR(100) NOT NULL,
                    reference VARCHAR(100) NOT NULL,
                    status VARCHAR(20) NOT NULL,
                    created_at DATETIME NOT NULL,
                    reviewed_at DATETIME,
                    reviewed_by VARCHAR(36),
                    notes TEXT
                )
                """
            else:
                create_table_sql = """
                CREATE TABLE access_requests_new (
                    id VARCHAR(36) PRIMARY KEY,
                    entity VARCHAR(200) NOT NULL,
                    contact VARCHAR(120) NOT NULL,
                    reference VARCHAR(100) NOT NULL,
                    status VARCHAR(20) NOT NULL,
                    created_at DATETIME NOT NULL,
                    reviewed_at DATETIME,
                    reviewed_by VARCHAR(36),
                    notes TEXT
                )
                """
            
            cursor.execute(create_table_sql)
            
            # Copy data
            if has_position:
                cursor.executemany("""
                    INSERT INTO access_requests_new 
                    (id, entity, contact, position, reference, status, created_at, reviewed_at, reviewed_by, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, rows)
            else:
                # Add empty position for existing records
                cursor.executemany("""
                    INSERT INTO access_requests_new 
                    (id, entity, contact, reference, status, created_at, reviewed_at, reviewed_by, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, [(row[0], row[1], row[2], row[3] or '', row[4], row[5], row[6], row[7], row[8]) for row in rows])
            
            # Drop old table and rename new one
            cursor.execute("DROP TABLE access_requests")
            cursor.execute("ALTER TABLE access_requests_new RENAME TO access_requests")
            
            # Recreate indexes
            print("Recreating indexes...")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_access_requests_contact ON access_requests(contact)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_access_requests_created_at ON access_requests(created_at)")
            
            conn.commit()
            print("✅ Reference column is now NOT NULL")
        
        # Verify migration
        print("\n=== Verifying Migration ===")
        position_exists_after = check_column_exists(cursor, 'access_requests', 'position')
        reference_nullable_after = check_column_nullable(cursor, 'access_requests', 'reference')
        
        print(f"Position column exists: {position_exists_after}")
        print(f"Reference column nullable: {reference_nullable_after}")
        
        if position_exists_after and not reference_nullable_after:
            print("\n✅ Migration completed successfully!")
            return True
        else:
            print("\n⚠️  Migration completed but verification shows unexpected state.")
            return False
            
    except Exception as e:
        print(f"\n❌ Error during migration: {str(e)}")
        conn.rollback()
        return False
    finally:
        conn.close()


def main():
    parser = argparse.ArgumentParser(
        description='Migrate access_requests table for Feature 0022'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without making changes'
    )
    parser.add_argument(
        '--database',
        type=str,
        default=None,
        help='Path to database file (default: kyc_database_dev.db in backend directory)'
    )
    
    args = parser.parse_args()
    
    # Determine database path
    if args.database:
        database_path = args.database
    else:
        backend_dir = Path(__file__).parent.parent
        database_path = backend_dir / 'kyc_database_dev.db'
    
    database_path = str(database_path)
    
    print("=" * 60)
    print("Access Request Form Enhancements - Database Migration")
    print("Feature: 0022")
    print("=" * 60)
    
    success = migrate_database(database_path, dry_run=args.dry_run)
    
    if success:
        print("\n✅ Migration process completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Migration process failed!")
        sys.exit(1)


if __name__ == '__main__':
    main()

