#!/usr/bin/env python3
"""
Database Migration Script for Feature 0026 - Value Scenarios and Market Opportunities

This script creates:
1. value_scenarios table
2. market_opportunities table

Usage:
    python migrate_0026_value_scenarios.py [--dry-run] [--database PATH]

Options:
    --dry-run    Show what would be done without making changes
    --database   Path to database file (default: kyc_database_dev.db in backend directory)
"""

import sys
import os
import argparse
import sqlite3
from pathlib import Path
from datetime import datetime

# Add parent directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))


def check_table_exists(cursor, table_name):
    """Check if a table exists"""
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
    return cursor.fetchone() is not None


def migrate_database(database_path, dry_run=False):
    """Perform the migration"""
    print(f"Connecting to database: {database_path}")
    
    if not os.path.exists(database_path):
        print(f"ERROR: Database file not found: {database_path}")
        return False
    
    conn = sqlite3.connect(database_path)
    cursor = conn.cursor()
    
    try:
        # Check if tables already exist
        print("\n=== Checking Current Database State ===")
        
        value_scenarios_exists = check_table_exists(cursor, 'value_scenarios')
        market_opportunities_exists = check_table_exists(cursor, 'market_opportunities')
        
        print(f"value_scenarios table exists: {value_scenarios_exists}")
        print(f"market_opportunities table exists: {market_opportunities_exists}")
        
        if value_scenarios_exists and market_opportunities_exists:
            print("\n✅ Tables already exist. No migration needed.")
            return True
        
        print("\n=== Migration Plan ===")
        if not value_scenarios_exists:
            print("1. Create 'value_scenarios' table")
            print("   - Columns: id, user_id, scenario_type, input_data, nihao_benefits, alternative_costs, savings, created_at")
            print("   - Indexes: idx_value_scenarios_user_id, idx_value_scenarios_created_at")
        if not market_opportunities_exists:
            print("2. Create 'market_opportunities' table")
            print("   - Columns: id, opportunity_type, market_data, potential_savings, expires_at, created_at")
            print("   - Indexes: idx_market_opportunities_type, idx_market_opportunities_expires_at")
        
        if dry_run:
            print("\n[DRY RUN] Would execute the above changes.")
            return True
        
        # Perform migration
        print("\n=== Executing Migration ===")
        
        # Create value_scenarios table
        if not value_scenarios_exists:
            print("Creating 'value_scenarios' table...")
            cursor.execute("""
                CREATE TABLE value_scenarios (
                    id VARCHAR(36) PRIMARY KEY,
                    user_id VARCHAR(36) NOT NULL,
                    scenario_type VARCHAR(20) NOT NULL,
                    input_data TEXT NOT NULL,
                    nihao_benefits TEXT NOT NULL,
                    alternative_costs TEXT NOT NULL,
                    savings REAL NOT NULL,
                    created_at DATETIME NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)
            cursor.execute("CREATE INDEX idx_value_scenarios_user_id ON value_scenarios(user_id)")
            cursor.execute("CREATE INDEX idx_value_scenarios_created_at ON value_scenarios(created_at)")
            conn.commit()
            print("✅ value_scenarios table created")
        
        # Create market_opportunities table
        if not market_opportunities_exists:
            print("Creating 'market_opportunities' table...")
            cursor.execute("""
                CREATE TABLE market_opportunities (
                    id VARCHAR(36) PRIMARY KEY,
                    opportunity_type VARCHAR(30) NOT NULL,
                    market_data TEXT NOT NULL,
                    potential_savings REAL NOT NULL,
                    expires_at DATETIME,
                    created_at DATETIME NOT NULL
                )
            """)
            cursor.execute("CREATE INDEX idx_market_opportunities_type ON market_opportunities(opportunity_type)")
            cursor.execute("CREATE INDEX idx_market_opportunities_expires_at ON market_opportunities(expires_at)")
            conn.commit()
            print("✅ market_opportunities table created")
        
        # Verify migration
        print("\n=== Verifying Migration ===")
        value_scenarios_exists_after = check_table_exists(cursor, 'value_scenarios')
        market_opportunities_exists_after = check_table_exists(cursor, 'market_opportunities')
        
        print(f"value_scenarios table exists: {value_scenarios_exists_after}")
        print(f"market_opportunities table exists: {market_opportunities_exists_after}")
        
        if value_scenarios_exists_after and market_opportunities_exists_after:
            print("\n✅ Migration completed successfully!")
            return True
        else:
            print("\n⚠️  Migration completed but verification shows unexpected state.")
            return False
        
    except Exception as e:
        print(f"\n❌ Error during migration: {str(e)}")
        import traceback
        traceback.print_exc()
        conn.rollback()
        return False
    finally:
        conn.close()


def main():
    parser = argparse.ArgumentParser(
        description='Migrate database for Feature 0026'
    )
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done')
    parser.add_argument('--database', type=str, default=None, help='Path to database file')
    
    args = parser.parse_args()
    
    if args.database:
        database_path = args.database
    else:
        backend_dir = Path(__file__).parent.parent
        database_path = backend_dir / 'kyc_database_dev.db'
    
    database_path = str(database_path)
    
    print("=" * 60)
    print("Feature 0026 - Database Migration")
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

