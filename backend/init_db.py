"""
Initialize database and create tables
"""
from app import app
from database import db
from models import (
    User, KYCDocument, KYCWorkflow, AccessRequest, PriceHistory,
    Listing, DemandListing, Negotiation, NegotiationMessage,
    SwapRequest, SwapQuote, Transaction, LegalDocument, CEAPortfolio
)
from models.user import KYCStatus, RiskLevel, SanctionsCheckStatus, UserRole
from utils.helpers import generate_uuid
import hashlib

def create_default_user():
    """Create default user 'Victor' if it doesn't exist"""
    # Use a consistent UUID for Victor (based on username hash)
    # This ensures the same UUID is used every time
    # IMPORTANT: This must match the UUID generation algorithm in frontend (AuthContext.tsx and adminService.ts)
    username = 'Victor'
    email = 'victor@nihao-carbon.com'
    
    # Generate consistent UUID from username using the SAME algorithm as frontend
    # Frontend algorithm: simple hash-based UUID generation
    hash = 0
    for char in username:
        hash = ((hash << 5) - hash) + ord(char)
        hash = hash & hash  # Convert to 32-bit integer
    positive_hash = format(abs(hash), 'x').zfill(8)
    user_uuid = f"00000000-0000-4000-8000-{positive_hash}{positive_hash}{positive_hash}{positive_hash}"[:36]
    
    # Check if user already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        if existing_user.id != user_uuid:
            print("\n" + "="*70)
            print("⚠️  UUID MISMATCH DETECTED")
            print("="*70)
            print(f"User '{username}' exists with UUID: {existing_user.id}")
            print(f"Frontend expects UUID:        {user_uuid}")
            print("\nThis mismatch will prevent admin access from working correctly.")
            print("\nTo fix this issue, you have two options:")
            print("\n1. RECOMMENDED: Reinitialize the database")
            print("   - Backup your data if needed")
            print("   - Delete the database file: backend/kyc_database_dev.db")
            print("   - Run this script again: python init_db.py")
            print("\n2. MANUAL FIX: Update the user ID in the database")
            print("   - This requires direct database access")
            print("   - Update the 'id' field for user 'Victor' to:", user_uuid)
            print("   - WARNING: This may break relationships with other tables")
            print("\n" + "="*70)
            print("⚠️  Continuing with existing UUID - admin features may not work!")
            print("="*70 + "\n")
        else:
            print(f"✓ User '{username}' already exists with correct ID: {existing_user.id}")
        return existing_user.id
    
    # Create password hash (for demo: 'VictorVic')
    password = 'VictorVic'
    password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
    
    # Create new user with admin privileges
    user = User(
        id=user_uuid,
        username=username,
        email=email,
        password_hash=password_hash,
        kyc_status=KYCStatus.PENDING,
        risk_level=RiskLevel.LOW,
        sanctions_check_status=SanctionsCheckStatus.PENDING,
        is_admin=True,
        role=UserRole.ADMIN  # Set admin role
    )
    
    db.session.add(user)
    db.session.commit()
    
    print(f"Created user '{username}' with ID: {user_uuid}")
    return user_uuid

with app.app_context():
    db.create_all()
    print("Database initialized successfully!")
    print("Tables created:")
    print("  - users, kyc_documents, kyc_workflows, access_requests, price_history")
    print("  - listings, demand_listings, negotiations, negotiation_messages")
    print("  - swap_requests, swap_quotes, transactions, legal_documents, cea_portfolio")
    
    # Create default user
    user_id = create_default_user()
    print(f"\nDefault user ready. Use this ID in frontend: {user_id}")

