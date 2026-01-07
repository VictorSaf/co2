---
description: Create app-truth.md - Project foundation document
globs:
alwaysApply: false
---

# Brief - Create Project Foundation

Creează `app-truth.md` - documentul care definește tot proiectul conform documentației din `docs/research/`.

## Ce este app-truth.md?

Single source of truth pentru:

- Arhitectură și model de business
- Convenții cod
- Stack tehnic
- Structură fișiere
- Decizii importante
- Context piață și scenarii de utilizare

## Template Extins (Bazat pe Research)

```markdown
# Nihao Carbon Trading Platform - App Truth

## Overview

Nihao Carbon Trading Platform este o platformă profesională de intermediere OTC pentru tranzacționarea certificatelor de carbon și facilitarea swap-urilor între piețele EU ETS (EUA) și China ETS (CEA). Platforma servește ca intermediar de încredere conectând vânzători chinezi de CEA cu cumpărători europeni și facilitând swap-uri instituționale EUA↔CEA, profitând de poziția strategică a Hong Kong-ului.

**Problema rezolvată**: Piața globală de carbon este fragmentată, cu diferențe semnificative de preț între EU ETS (€88/tCO2) și China ETS (63 yuan/~€8/tCO2), creând oportunități de arbitraj dificil de accesat din cauza barierelor de reglementare, controlului capitalului și lipsei de infrastructură.

## Business Model & Market Context

### Piața EU ETS (EUA)
- **Preț curent**: €88.31/tCO2 (Ianuarie 2026)
- **Proiecție 2030**: €130-150/tCO2
- **Maturitate piață**: 20 ani operațiune, piață derivate lichidă
- **Caracteristici**: Cap-uri absolute, 57% licitat, banking nelimitat, MSR stabilizare automată
- **Lichiditate**: 13.7 miliarde tone CO2 tranzacționate în 2024, 4.7 milioane tranzacții

### Piața China ETS (CEA)
- **Preț curent**: 63 yuan (~€8/tCO2) (Ianuarie 2026)
- **Proiecție 2030**: 60-200 yuan (€8-26) în funcție de reforme
- **Maturitate piață**: 3.5 ani, driven de conformitate, lichiditate scăzută
- **Caracteristici**: 100% alocare gratuită, ținte bazate pe intensitate, banking restrictiv, tranzacționare episodică
- **Probleme structurale**: 
  - 76% din volum concentrat în perioada de conformare (decembrie)
  - Bid-ask spreads de 10-25% pentru ordine mari
  - Execuție 2-4 săptămâni pentru blocuri mari
  - Impact de preț 10-30% pentru vânzări mari

### Oportunitate Arbitraj
- **Diferență preț**: 11x diferență (€88 vs €8)
- **Bariere**: Fără legătură formală, control capital, complexitate reglementară
- **Soluție**: Swap-uri OTC prin intermediar Hong Kong

## Use Cases & Value Propositions

### 1. Vânzători CEA (China) - "Seller Portal"

**Problema**: 
- Lichiditate extremă de scăzută pe Shanghai Exchange (2-10x volum zilnic pentru ordine mari)
- Execuție lentă (2-4 săptămâni) cu impact masiv de preț (10-30% scădere)
- TVA 6% pe vânzări domestice vs 0% pe export
- Panic selling în perioade de deadline (octombrie-noiembrie 2025: prăbușire la 40 yuan)

**Soluția Nihao**:
- **Premium preț**: +8.5% față de Shanghai Exchange (¥62 vs ¥57.15 pentru 2M tone)
- **Viteză**: Execuție 48-72 ore vs 2-4 săptămâni
- **Optimizare fiscală**: 
  - 0% TVA export vs 6% domestic (economie ¥6.9M pe 2M tone)
  - Tratament inventar vs intangibil (deducere imediată vs amortizare 10 ani)
  - Credite fiscale 10% ITC pentru echipamente mediu
  - CIT redus 15% vs 25% pentru întreprinderi calificate
- **Confidențialitate**: Tranzacții OTC off-market pentru SOE-uri mari (premium 10-16%)
- **Flexibilitate FX**: Decontare în EUR/USD/HKD ocolind controlul capitalului

**Valoare creată**: +€5.70M total anual pentru vânzător 2M tone (132x ROI pe fee Nihao)

### 2. Cumpărători CEA (EU Industrials) - "Buyer Marketplace"

**Problema**:
- Costuri mari EUA: €357M/an pentru 4.2M tCO2 (€85/t)
- Expunere CBAM: €17.85M/an pentru importatori
- Acces dificil la piața China: Necesită WFOE (€50k-100k, 6-12 luni)

**Soluția Nihao**:
- **Portofoliu strategic**: Cumpără CEA la €8.50/t, swap în EUA când necesar
- **Optimizare CBAM**: 
  - CEA holdings reduc factura CBAM cu 40-60%
  - Economii €214M pe 3 ani pentru importator mare
- **Diversificare**: Expunere la China ETS reforms (potențial +212% upside vs +48-70% EUA)
- **Acces simplificat**: Fără WFOE setup, execuție turnkey

**Valoare creată**: -€557M costuri pe 3 ani (€186M/an mediu), 331x ROI pe fee Nihao

### 3. Deținători EUA (Fonduri Instituționale) - "Swap Desk"

**Problema**:
- Vânzare directă EUA: Slippage 4-7%, FX costs, timing risk
- Cumpărare CEA separată: Dificil fără WFOE, risc timing, costuri multiple

**Soluția Nihao**:
- **Swap atomic**: EUA↔CEA în 48-72 ore, zero slippage, zero FX
- **Ratio îmbunătățit**: 1:10.5 vs 1:10 spot (+€25M pe €500M rotation)
- **Optimizare fiscală**: 
  - Swap treatment: Deferred recognition vs immediate loss
  - Higher cost basis în CEA reduce tax viitor
  - Advantage +€34.92M (7% din poziție)
- **Confidențialitate**: 100% bilateral, zero market signal

**Valoare creată**: +€170-207M valoare pe 2 ani (34-41% din poziție), 68-83x ROI pe fee

## Revenue Model

### Fee Structure

**CEA Sales (către cumpărători Nihao)**:
- Volume < 1M t: 0.4% (€40k per €10M)
- Volume 1-5M t: 0.3% (€30k per €10M)
- Volume 5M+ t: 0.2% (€20k per €10M)

**Institutional Swaps**:
- Volume < €100M: 0.6% (€600k per €100M)
- Volume €100-500M: 0.5% (€500k per €100M)
- Volume €500M+: 0.4% (€400k per €100M)

**Buyer CEA Purchases**:
- Volume < 500k t: 0.3% (facilitation only)
- Volume 500k-5M t: 0.2%
- Volume 5M+ t: 0.15%

### Target Market & Volume

**Tier 1 Priority**: Multinaționale cu operațiuni duale UE-China
- Volume: 500k-2M tCO2/an per client
- Frequency: Trimestrial (compliance cycles)
- Conversion rate: 80%+ (dacă educați despre benefits)

**Tier 2 Priority**: Supply Chain CBAM Optimization
- Volume: 50k-500k tCO2/an per relationship
- Frequency: Annual contracts
- Conversion rate: 60%

**Tier 3 Priority**: Investment Funds Diversification
- Volume: 100k-1M tCO2 per fund
- Frequency: One-time rebalancing, quarterly adjustments
- Conversion rate: 30%

**Total Addressable Market**: 5-15 milioane tCO2/an în swaps EUA→CEA
- Transaction value: €440M-1.32B
- Fees anual: €6.6M-26.4M la 1.5% intermediation

## Platform Architecture (Conform Site Proposal)

### Primary Navigation

```text
NIHAO GROUP | Home | Market | Sellers | Buyers | Swaps | Analytics | Learn | Contact
```

### Core Sections

**1. Homepage**
- Hero: "Trade Carbon Globally. Execute Locally."
- 3 CTA boxes: "I HAVE SURPLUS CEA", "I WANT TO BUY CEA", "I HOLD EUA AND WANT TO ROTATE"
- Trust section: Lloyd's Insurance, Atomic Settlement, Multi-Jurisdictional, Deep Liquidity, Confidentiality
- How It Works: 3-step process (Register, Browse & Negotiate, Atomic Execution)

**2. Seller Portal (CEA Suppliers)**
- Create New Listing: Volume, Price Expectations, Timeline, Settlement Currency, Tax Optimization
- Active Listings: Table cu status, volume, preț, premium expected
- Negotiation Inbox: Bilateral negotiation threads cu generic codes (SELLER-CN-2847, BUYER-EU-5621)
- Legal & Tax Documents: Auto-generated pack (Master Swap Agreement, Tax Optimization Memo, Settlement Instructions, Regulatory Attestation)
- Completed Transactions: Istoric cu date anonimizate

**3. Buyer Marketplace (EU Industrials / CBAM)**
- Browse CEA Market: Advanced search filter (volume, price ceiling, seller quality, timeline, currency, intended use)
- Available CEA Offerings: Real-time market table anonymized
- Initiate Inquiry/Offer: Bilateral negotiation flow
- Post Your Demand: Demand listings pentru buyers
- CEA Portfolio Tracker: Holdings tracking cu projected scenarios
- CBAM Tax Calculator: Interactive tool showing CBAM liability reduction

**4. EUA Swap Desk (Portfolio Holders)**
- Request Swap Quote: Form pentru institutional investors (position, desired outcome, target profile, settlement terms)
- Quote Display & Negotiation: Nihao quote cu ratio 1:10.5, calculation, settlement structure, fees, tax treatment
- Swap Negotiation: Bilateral negotiation thread
- Atomic Swap Execution: Auto-generated legal package (Swap Agreement, Escrow Instructions, Insurance Certificate, Tax Memo, Regulatory Attestations)
- Institutional Portfolio Analytics: Multi-position tracking cu projected returns

**5. Real-Time Market Analytics**
- CEA vs EUA Price Correlation chart
- Nihao Execution Volume & Premium chart
- CBAM Impact Calculator
- CEA Supply & Demand Forecasting
- EUA→CEA Swap Volume Growth

**6. Educational Resources ("Learn")**
- Why Sell CEA to Nihao Instead of Shanghai ETS
- CEA Portfolio Strategy for EU Industrials
- EUA→CEA Swap Rationale & Execution
- CBAM Mechanics & CEA Optimization
- China ETS Tightening Cycle – Investment Thesis
- Tax Optimization Across 8 EU Jurisdictions

## Tech Stack

### Frontend
- Framework: React 18.2.0 + TypeScript 5.8.3
- Build Tool: Vite 6.3.5
- Routing: React Router DOM 6.20.0
- Styling: Tailwind CSS 3.3.5 cu design system custom
- State: React Context API (AuthContext, CertificateContext, StatsContext, ThemeContext)
- Charts: Chart.js 4.4.0
- UI Components: Headless UI 1.7.17, Heroicons 2.0.18
- Internationalization: i18next 25.1.2 (EN, RO, ZH)

### Backend
- Runtime: Python 3.14
- Framework: Flask 3.0.0
- Database: SQLite (dev) / PostgreSQL (prod)
- ORM: SQLAlchemy 3.1.1
- Background Jobs: APScheduler 3.10.4
- Web Scraping: BeautifulSoup4, Selenium pentru price feeds
- PDF Processing: PyMuPDF pentru document generation

### Infrastructure
- Containerization: Docker + docker-compose
- Reverse Proxy: Nginx pentru API proxying
- Price Feeds: ICE, TradingView, Investing.com, Alpha Vantage API

## Project Structure

```text
co2-trading-final/
├── src/                          # Frontend React
│   ├── components/              # UI components reutilizabile
│   │   ├── admin/               # Admin components
│   │   └── onboarding/           # Onboarding flow
│   ├── pages/                   # Page components (lazy-loaded)
│   │   ├── Dashboard.tsx
│   │   ├── Market.tsx
│   │   ├── SellerPortal.tsx    # NEW: Seller portal
│   │   ├── BuyerMarketplace.tsx # NEW: Buyer marketplace
│   │   └── SwapDesk.tsx         # NEW: Swap desk
│   ├── context/                 # React Context providers
│   ├── services/                # API service clients
│   ├── design-system/           # Design tokens & components
│   └── i18n/                    # Internationalization
├── backend/                     # Flask backend
│   ├── api/                     # API blueprints
│   │   ├── seller.py            # NEW: Seller endpoints
│   │   ├── buyer.py             # NEW: Buyer endpoints
│   │   └── swap.py              # NEW: Swap endpoints
│   ├── models/                  # SQLAlchemy models
│   │   ├── listing.py           # NEW: CEA listings
│   │   ├── demand_listing.py    # NEW: Buyer demand
│   │   └── swap.py              # NEW: Swap transactions
│   ├── services/                # Business logic
│   │   ├── matching_engine.py    # NEW: Bilateral matching
│   │   ├── document_generator.py # NEW: Legal docs
│   │   └── tax_calculator.py    # NEW: CBAM & tax calc
│   └── scripts/                 # Utility scripts
├── docs/
│   ├── research/                # Market research & scenarios
│   ├── features/                # Feature documentation
│   └── commands/                # Command templates
└── docker-compose.yml
```

## Conventions

### Naming
- Components: PascalCase (`SellerPortal.tsx`, `BuyerMarketplace.tsx`)
- Utilities: camelCase (`formatPrice.ts`, `calculateSwapRatio.ts`)
- Constants: UPPER_SNAKE (`MAX_LISTING_VOLUME`, `DEFAULT_SWAP_RATIO`)
- API endpoints: kebab-case (`/api/seller/listings`, `/api/buyer/demand`)

### Code Style
- ESLint + Prettier
- Strict TypeScript
- Functional components
- Custom hooks for logic
- Design system tokens (nu hardcoded values)

### Git
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
- Branch naming: `feature/`, `fix/`, `hotfix/`
- Feature branches: `feature/seller-portal`, `feature/buyer-marketplace`

## Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| State management | React Context API | Sufficient pentru app size, no external deps |
| Styling | Tailwind + Design System | Rapid development, consistency, theme support |
| API | REST | Team familiarity, Flask native |
| Matching | Bilateral anonymous | Confidentiality, no market signal |
| Settlement | Atomic (escrow) | Zero counterparty risk |
| Documents | Auto-generated PDFs | Consistency, speed, compliance |
| Price Discovery | Multi-source fallback | Reliability, redundancy |

## Tax Optimization (China Sellers)

### VAT Treatment
- **Domestic sale**: 6% TVA output pe valoarea tranzacției
- **Export structure**: 0% TVA output + ability to reclaim input VAT
- **Savings**: ¥6.9M pe 2M tone (€870k)

### CIT Optimization
- **Inventory treatment**: Full cost deduction în anul vânzării vs amortizare 10 ani
- **Environmental credits**: 10% ITC, 15% reduced CIT, tax holidays
- **Total savings**: €2.07M anual pentru 1M tone seller

### Clasificare CEA
- **Preferat**: Inventar ("held for sale") vs intangibil
- **Beneficii**: Deducere imediată vs amortizare lentă
- **Impact**: CIT mai mic cu 1.5M+ RMB pe tranzacții de 60M+

## Swap Mechanisms

### OTC Bilateral Structure
- **Format**: Two separate but coordinated transfers
- **EUA leg**: Vânzare EUA către entitate europeană pe EU ETS
- **CEA leg**: Vânzare CEA către entitate chineză pe China ETS
- **Cash adjustment**: Compensare pentru diferența de valoare
- **Documentation**: ISDA-style master agreement adaptat pentru carbon

### Atomic Settlement
- **Escrow**: Ambele assets în escrow simultan
- **Timeline**: T+1 bilateral confirmation, T+2 settlement
- **Insurance**: Lloyd's €75M coverage per transaction
- **Zero slippage**: Locked ratio, no price change risk

### Swap Ratios
- **Market implied**: 1:10 (€85 EUA / €8.5 CEA)
- **Nihao negotiated**: 1:10.5 (+5% improvement)
- **Value creation**: +€25M pe €500M rotation

## Environment

```env
# Required
DATABASE_URL=postgresql://user:pass@host/db
SECRET_KEY=<secure-random-key>
CORS_ORIGINS=https://app.nihao.com,https://www.nihao.com

# Price Feeds
ALPHAVANTAGE_API_KEY=<optional>
OILPRICE_API_KEY=<optional>

# Optional
DEBUG=false
SANCTIONS_CHECK_ENABLED=true
EU_ETS_VERIFICATION_ENABLED=true
```

## Process

1. Analyze existing codebase și research documentation
2. Identify patterns și convenții
3. Document current architecture
4. Include business model și market context din research
5. Note any inconsistencies to fix
6. Reference research documents pentru detalii

## Output

Creates `app-truth.md` in project root cu toate informațiile de mai sus.

---

**Note**: Acest template extins include informații detaliate din `docs/research/` despre:

- Model de business și use cases pentru fiecare tip de participant
- Context piață (EU ETS vs China ETS)
- Scenarii economice și raționamente
- Optimizări fiscale
- Mecanisme de swap
- Structura platformei conform site-proposal

Run to create or update project documentation.
