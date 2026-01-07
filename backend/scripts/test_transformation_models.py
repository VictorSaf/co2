"""
Test script for transformation models
Verifies that all models can be imported and have correct structure
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_model_imports():
    """Test that all models can be imported"""
    print("Testing model imports...")
    
    try:
        from models import (
            User, UserRole,
            Listing, ListingStatus,
            DemandListing, DemandStatus, IntendedUse,
            Negotiation, NegotiationStatus, NegotiationMessage, MessageSenderType,
            SwapRequest, SwapRequestStatus, SwapQuote, SwapQuoteStatus,
            Transaction, TransactionType, TransactionStatus,
            LegalDocument, LegalDocumentType, CEAPortfolio
        )
        print("✅ All models imported successfully")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_model_structure():
    """Test that models have required attributes"""
    print("\nTesting model structure...")
    
    try:
        from models import Listing, DemandListing, Negotiation, SwapRequest, Transaction
        
        # Test Listing model
        listing_attrs = ['id', 'seller_id', 'seller_code', 'volume', 'price_per_tonne', 'status']
        for attr in listing_attrs:
            if not hasattr(Listing, attr):
                print(f"❌ Listing missing attribute: {attr}")
                return False
        
        # Test DemandListing model
        demand_attrs = ['id', 'buyer_id', 'buyer_code', 'volume_needed', 'max_price', 'status']
        for attr in demand_attrs:
            if not hasattr(DemandListing, attr):
                print(f"❌ DemandListing missing attribute: {attr}")
                return False
        
        # Test Negotiation model
        negotiation_attrs = ['id', 'listing_id', 'initiator_id', 'counterparty_code', 'status']
        for attr in negotiation_attrs:
            if not hasattr(Negotiation, attr):
                print(f"❌ Negotiation missing attribute: {attr}")
                return False
        
        # Test SwapRequest model
        swap_attrs = ['id', 'requester_id', 'eua_volume', 'status']
        for attr in swap_attrs:
            if not hasattr(SwapRequest, attr):
                print(f"❌ SwapRequest missing attribute: {attr}")
                return False
        
        # Test Transaction model
        transaction_attrs = ['id', 'transaction_type', 'seller_id', 'buyer_id', 'volume', 'status']
        for attr in transaction_attrs:
            if not hasattr(Transaction, attr):
                print(f"❌ Transaction missing attribute: {attr}")
                return False
        
        print("✅ All models have required attributes")
        return True
        
    except Exception as e:
        print(f"❌ Structure test error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_enums():
    """Test that enums are properly defined"""
    print("\nTesting enums...")
    
    try:
        from models.user import UserRole
        from models.listing import ListingStatus
        from models.demand_listing import DemandStatus, IntendedUse
        from models.negotiation import NegotiationStatus, MessageSenderType
        from models.swap import SwapRequestStatus, SwapQuoteStatus
        from models.transaction import TransactionType, TransactionStatus, LegalDocumentType
        
        # Test enum values
        assert UserRole.CEA_SELLER.value == 'cea_seller'
        assert UserRole.CEA_BUYER.value == 'cea_buyer'
        assert UserRole.EUA_HOLDER.value == 'eua_holder'
        assert UserRole.ADMIN.value == 'admin'
        
        assert ListingStatus.ACTIVE.value == 'active'
        assert DemandStatus.ACTIVE.value == 'active'
        assert NegotiationStatus.OPEN.value == 'open'
        assert SwapRequestStatus.PENDING.value == 'pending'
        assert TransactionType.CEA_SALE.value == 'cea_sale'
        
        print("✅ All enums properly defined")
        return True
        
    except Exception as e:
        print(f"❌ Enum test error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_api_imports():
    """Test that API blueprints can be imported"""
    print("\nTesting API blueprint imports...")
    
    try:
        from api.seller import seller_bp
        from api.buyer import buyer_bp
        from api.swap import swap_bp
        
        assert seller_bp is not None
        assert buyer_bp is not None
        assert swap_bp is not None
        
        print("✅ All API blueprints imported successfully")
        return True
        
    except Exception as e:
        print(f"❌ API import error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_to_dict_methods():
    """Test that models have to_dict methods"""
    print("\nTesting to_dict methods...")
    
    try:
        from models import Listing, DemandListing, SwapRequest
        
        # Check that to_dict methods exist
        assert hasattr(Listing, 'to_dict')
        assert hasattr(DemandListing, 'to_dict')
        assert hasattr(SwapRequest, 'to_dict')
        
        print("✅ All models have to_dict methods")
        return True
        
    except Exception as e:
        print(f"❌ to_dict test error: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("="*70)
    print("TRANSFORMATION MODELS TEST SUITE")
    print("="*70)
    
    tests = [
        ("Model Imports", test_model_imports),
        ("Model Structure", test_model_structure),
        ("Enums", test_enums),
        ("API Imports", test_api_imports),
        ("to_dict Methods", test_to_dict_methods),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    print("\n" + "="*70)
    print("TEST RESULTS SUMMARY")
    print("="*70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print("\n" + "="*70)
    print(f"Total: {passed}/{total} tests passed")
    print("="*70)
    
    return passed == total


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)

