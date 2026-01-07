"""
Migration script to add role columns to User table
Adds: role, seller_code, buyer_code columns
"""
import sys
import os
import sqlite3
import argparse
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def check_column_exists(cursor, table_name, column_name):
    """Check if a column exists in a table"""
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    return any(col[1] == column_name for col in columns)


def check_index_exists(cursor, index_name):
    """Check if an index exists"""
    cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND name=?", (index_name,))
    return cursor.fetchone() is not None


def migrate_user_roles(database_path, dry_run=False):
    """Add role columns to User table"""
    print(f"Migrating User table: {database_path}")
    
    if not os.path.exists(database_path):
        print(f"ERROR: Database file not found: {database_path}")
        return False
    
    conn = sqlite3.connect(database_path)
    cursor = conn.cursor()
    
    try:
        print("\n=== Checking Current Database State ===")
        
        # Check existing columns
        role_exists = check_column_exists(cursor, 'users', 'role')
        seller_code_exists = check_column_exists(cursor, 'users', 'seller_code')
        buyer_code_exists = check_column_exists(cursor, 'users', 'buyer_code')
        
        print(f"Role column exists: {role_exists}")
        print(f"Seller code column exists: {seller_code_exists}")
        print(f"Buyer code column exists: {buyer_code_exists}")
        
        # Check indexes
        role_idx_exists = check_index_exists(cursor, 'ix_users_role')
        seller_code_idx_exists = check_index_exists(cursor, 'ix_users_seller_code')
        buyer_code_idx_exists = check_index_exists(cursor, 'ix_users_buyer_code')
        
        changes_needed = not (role_exists and seller_code_exists and buyer_code_exists and 
                             role_idx_exists and seller_code_idx_exists and buyer_code_idx_exists)
        
        if not changes_needed:
            print("\n✅ All columns and indexes already exist - no changes needed")
            return True
        
        print("\n=== Migration Plan ===")
        if not role_exists:
            print("1. Add 'role' column (VARCHAR(20))")
        if not seller_code_exists:
            print("2. Add 'seller_code' column (VARCHAR(50))")
        if not buyer_code_exists:
            print("3. Add 'buyer_code' column (VARCHAR(50))")
        if not role_idx_exists:
            print("4. Create index 'ix_users_role'")
        if not seller_code_idx_exists:
            print("5. Create index 'ix_users_seller_code'")
        if not buyer_code_idx_exists:
            print("6. Create index 'ix_users_buyer_code'")
        
        if dry_run:
            print("\n[DRY RUN] Would execute the above changes.")
            return True
        
        print("\n=== Executing Migration ===")
        
        # Add columns
        if not role_exists:
            print("Adding 'role' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20)")
        
        if not seller_code_exists:
            print("Adding 'seller_code' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN seller_code VARCHAR(50)")
        
        if not buyer_code_exists:
            print("Adding 'buyer_code' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN buyer_code VARCHAR(50)")
        
        # Create indexes
        if not role_idx_exists:
            print("Creating index 'ix_users_role'...")
            cursor.execute("CREATE INDEX ix_users_role ON users(role)")
        
        if not seller_code_idx_exists:
            print("Creating index 'ix_users_seller_code'...")
            cursor.execute("CREATE INDEX ix_users_seller_code ON users(seller_code)")
        
        if not buyer_code_idx_exists:
            print("Creating index 'ix_users_buyer_code'...")
            cursor.execute("CREATE INDEX ix_users_buyer_code ON users(buyer_code)")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error during migration: {e}")
        conn.rollback()
        import traceback
        traceback.print_exc()
        return False
    finally:
        conn.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Migrate User table to add role columns')
    parser.add_argument('--database', type=str, default='kyc_database_dev.db',
                       help='Path to database file (default: kyc_database_dev.db)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be done without making changes')
    
    args = parser.parse_args()
    
    # Resolve database path
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    database_path = backend_dir / args.database
    
    success = migrate_user_roles(str(database_path), dry_run=args.dry_run)
    sys.exit(0 if success else 1)

