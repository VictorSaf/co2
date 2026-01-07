"""
Migration script for transformation models
Adds new tables for Seller Portal, Buyer Marketplace, Swap Desk, and related functionality
"""
import sys
import os
import sqlite3
import argparse
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import db
from flask import Flask
from models import (
    Listing, DemandListing, Negotiation, NegotiationMessage,
    SwapRequest, SwapQuote, Transaction, LegalDocument, CEAPortfolio
)


def migrate_transformation_models(database_path, dry_run=False):
    """Create all new tables for transformation"""
    print(f"Creating transformation models tables: {database_path}")
    
    if not os.path.exists(database_path):
        print(f"ERROR: Database file not found: {database_path}")
        return False
    
    # Create minimal Flask app for SQLAlchemy
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{database_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    with app.app_context():
        print("Creating transformation models tables...")
        
        try:
            if dry_run:
                print("[DRY RUN] Would create the following tables:")
                print("   - listings")
                print("   - demand_listings")
                print("   - negotiations")
                print("   - negotiation_messages")
                print("   - swap_requests")
                print("   - swap_quotes")
                print("   - transactions")
                print("   - legal_documents")
                print("   - cea_portfolio")
                return True
            
            # Create all tables
            db.create_all()
            
            print("✅ Successfully created all transformation model tables:")
            print("   - listings")
            print("   - demand_listings")
            print("   - negotiations")
            print("   - negotiation_messages")
            print("   - swap_requests")
            print("   - swap_quotes")
            print("   - transactions")
            print("   - legal_documents")
            print("   - cea_portfolio")
            
            # Check if User table needs role column update
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            user_columns = [col['name'] for col in inspector.get_columns('users')]
            
            if 'role' not in user_columns:
                print("\n⚠️  User table needs role column update")
                print("   Run: python scripts/migrate_user_roles.py")
            else:
                print("\n✅ User table already has role columns")
            
            print("\n✅ Migration completed successfully!")
            return True
            
        except Exception as e:
            print(f"\n❌ Error during migration: {e}")
            import traceback
            traceback.print_exc()
            return False


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Create transformation model tables')
    parser.add_argument('--database', type=str, default='kyc_database_dev.db',
                       help='Path to database file (default: kyc_database_dev.db)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be done without making changes')
    
    args = parser.parse_args()
    
    # Resolve database path
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    database_path = backend_dir / args.database
    
    success = migrate_transformation_models(str(database_path), dry_run=args.dry_run)
    sys.exit(0 if success else 1)

