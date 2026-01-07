# Plan Validation: Feature 0026

**Status:** ⚠️ NEEDS REVISION

## Checklist

- [x] **Completeness** - All sections filled
- [x] **Feasibility** - Can be built with revisions
- [⚠️] **Consistency** - Some inconsistencies with app-truth.md
- [⚠️] **Dependencies** - Most identified, some missing
- [x] **Risks** - Realistic assessment
- [x] **Testability** - Clear strategy

## Issues Found

### Issue 1: Market Analysis Endpoint Doesn't Exist
**Severity:** High
**Problem:** The plan references `GET /api/market/analysis` endpoint to be extended, but this endpoint does not exist in the current codebase. The `MarketAnalysis.tsx` page uses `StatsContext` which pulls data from price history endpoints (`/api/eua/history`, `/api/cer/history`), not a dedicated market analysis API.

**Current Implementation:**
- `MarketAnalysis.tsx` uses `useStats()` hook from `StatsContext`
- Data comes from `marketStats.priceHistory` (frontend calculation)
- No backend API endpoint for market analysis exists

**Suggestion:** 
1. Either create the `/api/market/analysis` endpoint first (as a new endpoint), or
2. Modify the plan to extend the existing price history endpoints instead
3. Consider creating a new `/api/market/analysis` endpoint that aggregates data from multiple sources

### Issue 2: Terminology Inconsistency (CEA vs CER)
**Severity:** Medium
**Problem:** The plan consistently uses "CEA" (China ETS Allowances) throughout, but the current codebase uses "CER" (Certified Emission Reduction). The app-truth.md mentions both:
- EU ETS uses "EUA" (European Union Allowances)
- China ETS uses "CEA" (China ETS Allowances)
- But the codebase currently uses "CER" for Chinese certificates

**Current Codebase:**
- `Market.tsx` filters offers by `offer.type === 'CER'`
- `StatsContext` has `averagePriceCER`, `volumeCER`
- Price history endpoints: `/api/cer/price`, `/api/cer/history`

**Suggestion:**
1. Clarify if this feature is meant to introduce CEA terminology (replacing CER), or
2. If CER and CEA are different certificate types, update the plan to clarify the distinction
3. Consider a migration plan if renaming CER to CEA throughout the codebase

### Issue 3: Missing Market Data Integration Details
**Severity:** Medium
**Problem:** The plan references market data for calculations (EUA price, CEA price, swap ratios) but doesn't specify:
- How to get real-time CEA prices (currently only CER prices exist)
- Where swap ratio data comes from
- How to detect compliance periods for liquidity crisis detection

**Suggestion:**
1. Add details about CEA price data source (similar to EUA price scraper)
2. Specify swap ratio calculation method or data source
3. Define compliance period detection logic (calendar-based? API-based?)

### Issue 4: Database Migration Strategy Unclear
**Severity:** Low
**Problem:** The plan mentions creating migration scripts but doesn't specify:
- Migration tool/framework to use (Flask-Migrate? Alembic? Custom scripts?)
- Rollback strategy
- Data migration requirements (if any)

**Current Codebase:**
- Uses SQLAlchemy ORM
- Has example migration script: `backend/scripts/migrate_access_requests_0022.py`
- Database initialization in `backend/app.py` uses `db.create_all()`

**Suggestion:**
1. Follow existing migration pattern (custom Python scripts)
2. Add rollback instructions to migration script
3. Document backup requirements before migration

### Issue 5: API Endpoint Naming Convention
**Severity:** Low
**Problem:** New endpoints use `/api/value-calculator/` prefix, but existing endpoints follow different patterns:
- `/api/kyc/...` (KYC endpoints)
- `/api/admin/...` (Admin endpoints)
- `/api/eua/...`, `/api/cer/...` (Price endpoints)

**Suggestion:**
1. Consider `/api/calculator/...` for consistency, or
2. Keep `/api/value-calculator/...` if this is intentional for clarity
3. Document naming convention decision

### Issue 6: Frontend Route Protection Missing
**Severity:** Low
**Problem:** The plan adds new routes (`/value-calculator`, `/benefits`, `/market-opportunities`) but doesn't specify:
- Whether these routes require authentication
- Whether they require KYC approval
- Route protection strategy

**Current Pattern:**
- Protected routes use `ProtectedRoute` wrapper (requires auth + KYC approval)
- Onboarding routes use `OnboardingRoute` wrapper (requires auth only)

**Suggestion:**
1. Specify route protection for each new page
2. Consider if calculator should be public (for demo) or protected
3. Benefits page might be public for marketing purposes

### Issue 7: Research Scenarios Source Not Verified
**Severity:** Low
**Problem:** The plan references specific scenarios from "cercetare" (research) but doesn't specify:
- Where these scenarios are documented
- If they exist in the codebase/docs
- How to validate calculations against them

**Suggestion:**
1. Verify research scenarios exist in documentation
2. Add references to specific documents/files
3. Consider adding scenario data as test fixtures

## Questions

1. **CEA vs CER**: Should the codebase be updated to use "CEA" terminology throughout, or are CER and CEA different certificate types that should coexist?

2. **Market Analysis Endpoint**: Should we create a new `/api/market/analysis` endpoint, or extend existing price history endpoints?

3. **CEA Price Data**: How will CEA price data be obtained? Is there a scraper similar to the EUA price scraper, or is it from a different source?

4. **Swap Ratio Calculation**: How are swap ratios calculated? Are they:
   - Fixed ratios based on market prices?
   - Negotiated per transaction?
   - Historical averages?

5. **Compliance Period Detection**: How should the system detect compliance periods for liquidity crisis detection?
   - Hardcoded dates (e.g., December deadline)?
   - Calendar-based calculation?
   - API integration?

6. **Route Protection**: Should the new calculator and benefits pages be:
   - Public (no auth required) for marketing/demo purposes?
   - Protected (auth required) for registered users only?
   - KYC-protected (approved users only)?

## Verified Against Codebase

### ✅ Files That Exist
- `backend/models/` - Database models exist (User, KYCDocument, KYCWorkflow, AccessRequest, PriceHistory)
- `backend/api/` - API blueprint pattern exists
- `backend/services/` - Service layer pattern exists
- `src/pages/Dashboard.tsx` - Can be modified as planned
- `src/pages/Market.tsx` - Can be modified as planned
- `src/pages/MarketAnalysis.tsx` - Can be extended as planned
- `src/App.tsx` - Routes can be added
- `src/context/` - Context pattern exists (can add ValueContext)
- `src/services/` - Service pattern exists (can add new services)
- `src/components/` - Component pattern exists (can add new components)

### ⚠️ Files That Don't Exist (Expected - New Files)
- `backend/models/value_scenario.py` - Will be created
- `backend/models/market_opportunity.py` - Will be created
- `backend/services/value_calculator.py` - Will be created
- `backend/services/swap_calculator.py` - Will be created
- `backend/services/market_opportunity_detector.py` - Will be created
- `backend/api/value_calculator.py` - Will be created
- `backend/api/market_opportunities.py` - Will be created
- All frontend files listed in plan - Will be created

### ❌ Endpoints That Don't Exist
- `GET /api/market/analysis` - Referenced but doesn't exist (needs to be created first or plan revised)

## Compatibility Assessment

### ✅ Compatible
- Database schema changes (adding new tables) - Compatible with SQLAlchemy
- API endpoint patterns - Follows existing blueprint pattern
- Frontend component patterns - Follows existing React/TypeScript patterns
- Context pattern - Compatible with existing context providers
- Service layer - Compatible with existing service pattern
- Route structure - Compatible with React Router setup

### ⚠️ Needs Clarification
- CEA vs CER terminology - Need to clarify if this is a rename or addition
- Market analysis endpoint - Need to create or revise plan
- Price data sources - Need to specify CEA price source

## Approved: NO (Needs Revision)

**Recommendation:** Address the High and Medium severity issues before proceeding, particularly:
1. Clarify CEA vs CER terminology
2. Create or revise market analysis endpoint strategy
3. Specify CEA price data source
4. Add route protection specifications

Once these issues are resolved, the plan should be re-validated before implementation begins.

