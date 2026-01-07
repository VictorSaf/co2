# Nihao Carbon Trading Platform

> Professional platform for carbon certificate trading, swap facilitation, and compliance management between EU ETS (EUA) and China ETS (CEA) markets

## Vision

Nihao Group aims to bridge the gap between European and Chinese carbon markets by providing institutional-grade trading infrastructure, facilitating cross-market arbitrage opportunities, and enabling compliance optimization for multinational corporations. The platform serves as a trusted intermediary for OTC carbon certificate swaps, leveraging Hong Kong's strategic position to connect EU and China carbon markets.

## ⚠️ TRANSFORMATION IN PROGRESS

**Status**: Platforma este în proces de transformare radicală conform documentației din `docs/research/`

**Plan de Transformare**: Vezi `docs/features/TRANSFORMATION_PLAN.md` pentru detalii complete

**Schimbări Majore**:
- Transformare din platformă simplă de trading → platformă complexă de intermediere OTC
- Adăugare Seller Portal pentru vânzători chinezi de CEA
- Adăugare Buyer Marketplace completă pentru cumpărători europeni
- Adăugare Swap Desk pentru swap-uri EUA↔CEA instituționale
- Sistem de matching bilateral anonim
- Auto-generare documente legale
- Calculatoare fiscale (CBAM, tax optimization)

## Problem Statement

The global carbon market is fragmented, with significant price disparities between EU ETS (€88/tCO2) and China ETS (63 yuan/~€8/tCO2) creating arbitrage opportunities that are difficult to access due to regulatory barriers, capital controls, and lack of infrastructure. Multinational corporations face compliance challenges across jurisdictions, while Chinese entities struggle with liquidity constraints and panic selling during compliance deadlines. The platform addresses these pain points by:

1. **Liquidity Provision**: Solving China ETS liquidity crisis (76% of volume concentrated in December compliance period, bid-ask spreads of 10-25% for large orders)
2. **Cross-Market Access**: Enabling EU entities to access China CEA market without WFOE setup (€50k-100k, 6-12 months)
3. **Compliance Optimization**: Facilitating CBAM (Carbon Border Adjustment Mechanism) optimization through strategic certificate swaps
4. **Regulatory Navigation**: Simplifying cross-border transactions that bypass capital controls through commodity-for-commodity swaps
5. **Risk Management**: Providing certainty and speed (48h execution) vs. market volatility (2-4 weeks gradual sale)

## Business Model & Use Cases

### Primary Use Cases

1. **Multinational Compliance Optimization**
   - Company with EU operations (surplus EUA) and China operations (deficit CEA)
   - Swap EUA → CEA to optimize compliance costs
   - Avoids capital controls, FX exposure, regulatory complexity

2. **CBAM Cost Reduction**
   - EU importer with Chinese supplier
   - Swap EUA → CEA with supplier
   - Supplier demonstrates €88/t carbon cost (vs. €8/t CEA price)
   - Reduces CBAM bill by €40/ton product

3. **Investment Fund Diversification**
   - Fund holding EUA (€88/t, +48-70% upside potential)
   - Swaps 20% to CEA (€8/t, +212% upside potential with reforms)
   - Geographic and regulatory diversification

4. **China Liquidity Crisis Resolution**
   - Chinese SOE with 1M CEA surplus before banking deadline
   - Shanghai Exchange: 2-4 weeks execution, 10-30% price impact
   - HK Carbon Bridge: 48h execution, 2-3% discount, zero market impact

5. **Confidential Large Block Sales**
   - Large SOE selling 2M CEA without telegraphing intentions
   - Off-market OTC transaction preserves price (10-16% premium vs. public sale)

### Revenue Model

- **Swap Fees**: 1.5-2% intermediation fee on swap transactions
- **Trading Spreads**: 2-5% spread on CEA purchases from Chinese entities
- **Conversion Fees**: €2 per CER → EUA conversion
- **Premium Services**: FX settlement, custody, regulatory consulting

### Target Market

- **Tier 1**: Multinationals with dual EU-China operations (500k-2M tCO2/year)
- **Tier 2**: EU importers optimizing CBAM (50k-500k tCO2/year)
- **Tier 3**: Investment funds diversifying carbon exposure (100k-1M tCO2)
- **Tier 4**: Chinese entities needing liquidity (500k-5M tCO2 blocks)

## Market Context

### EU ETS Market (EUA)
- **Current Price**: €88.31/tCO2 (January 2026)
- **Projected 2030**: €130-150/tCO2
- **Market Maturity**: 20 years of operation, liquid derivatives market
- **Characteristics**: Caps absolute, 57% auctioned, banking unlimited, MSR automatic stabilization

### China ETS Market (CEA)
- **Current Price**: 63 yuan (~€8/tCO2) (January 2026)
- **Projected 2030**: 60-200 yuan (€8-26) depending on reforms
- **Market Maturity**: 3.5 years, compliance-driven, low liquidity
- **Characteristics**: 100% free allocation, intensity-based targets, banking restrictive, episodic trading

### Arbitrage Opportunity
- **Price Gap**: 11x difference (€88 vs €8)
- **Barriers**: No formal linking, capital controls, regulatory complexity
- **Solution**: OTC swaps through Hong Kong intermediary

---

## Tech Stack

### Frontend
- **Framework**: React 18.2.0 with TypeScript 5.8.3
- **Build Tool**: Vite 6.3.5
- **Routing**: React Router DOM 6.20.0
- **Styling**: Tailwind CSS 3.3.5 with custom design system
- **State Management**: React Context API (AuthContext, CertificateContext, StatsContext, ThemeContext)
- **Charts**: Chart.js 4.4.0 with react-chartjs-2 5.2.0
- **UI Components**: Headless UI 1.7.17, Heroicons 2.0.18
- **Internationalization**: i18next 25.1.2 with react-i18next 15.5.1
- **Forms**: Tailwind Forms plugin 0.5.7
- **Date Handling**: date-fns 2.30.0
- **HTTP Client**: Axios 1.6.2
- **Code Splitting**: React lazy loading with error retry mechanism

### Backend
- **Runtime**: Python 3.14
- **Framework**: Flask 3.0.0
- **Database**: SQLite (development), PostgreSQL (production via DATABASE_URL)
- **ORM**: SQLAlchemy 3.1.1 (Flask-SQLAlchemy)
- **Migrations**: Flask-Migrate 4.0.5
- **CORS**: Flask-CORS 4.0.0
- **Rate Limiting**: Flask-Limiter 3.5.0
- **Background Jobs**: APScheduler 3.10.4
- **Web Scraping**: BeautifulSoup4 4.12.2, Selenium 4.15.2, lxml 4.9.3
- **PDF Processing**: PyMuPDF 1.23.8, reportlab 4.0.7
- **HTTP Requests**: requests 2.31.0
- **Server**: Gunicorn 21.2.0 (production)

### Infrastructure
- **Containerization**: Docker with docker-compose
- **Reverse Proxy**: Nginx (production)
- **Development**: Vite dev server with HMR
- **CI/CD**: Not configured (manual deployment)

## Port Configuration

### Frontend Development Server
- **Default Port**: 3000
- **Command**: `npm run dev`
- **URL**: http://localhost:3000
- **Configuration**: Set in `vite.config.ts` - uses PORT environment variable or defaults to 3000
- **Host**: 0.0.0.0 (accessible from all network interfaces)
- **HMR Port**: Same as server port (3000)
- **HMR Protocol**: WebSocket (ws://localhost:3000)
- **Allowed Hosts**: platonos.mooo.com, localhost, 127.0.0.1

### Backend API Server
- **Port**: 5000 (internal Docker)
- **External Port** (Docker): 5001 (for direct access if needed)
- **Proxy**: Nginx reverse proxy forwards `/api` requests to `http://backend:5000` (internal Docker service)
- **Health Check**: Available at `/health` endpoint (direct: `http://localhost:5001/health`, proxied: `http://localhost:8080/api/health`)
- **Production Access**: Frontend accesses backend through nginx proxy at `/api/*` (same-origin, no CORS issues)

## Project Structure

```
co2-trading-final/
├── src/                      # Frontend React application
│   ├── components/          # Reusable UI components
│   │   ├── admin/           # Admin-specific components
│   │   └── onboarding/      # Onboarding flow components
│   ├── pages/               # Page components (lazy-loaded)
│   ├── context/             # React Context providers
│   ├── services/             # API service clients
│   ├── design-system/       # Design system components and tokens
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   ├── i18n/                # Internationalization configuration
│   └── data/                # Static data files
├── backend/                 # Backend Flask application
│   ├── api/                 # API route blueprints
│   ├── models/              # SQLAlchemy database models
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   ├── tests/               # Backend tests
│   ├── scripts/             # Utility scripts
│   └── uploads/             # File upload storage
├── public/                   # Static assets
│   └── documentation/       # PDF documents
├── docs/                     # Documentation
│   ├── commands/            # Command documentation
│   ├── features/            # Feature documentation
│   └── design-system/       # Design system docs
└── theme/                    # Portable theme files
```

## Development Setup

### Running the Application
1. **Frontend**: `npm run dev` - runs on port 3000
2. **Backend**: Backend runs separately (Python Flask on port 5000, or Docker on 5001)

### Code Splitting & Lazy Loading
- **Implementation**: All page components use `lazyWithRetry()` wrapper for lazy loading
- **Error Handling**: Automatic retry on chunk load failures with page reload
- **Loading State**: `PageLoader` component shown during lazy load
- **Error Boundary**: `ErrorBoundary` component catches chunk loading errors and retries
- **Chunk Strategy**: Manual chunks configured in `vite.config.ts`:
  - `react-vendor`: React, React DOM, React Router
  - `chart-vendor`: Chart.js and plugins
  - `i18n-vendor`: i18next libraries
  - `ui-vendor`: Headless UI, Heroicons
  - `utils-vendor`: date-fns, axios, uuid

### Environment Variables

#### Frontend
- `PORT`: Overrides default port 3000 for frontend development server
- `VITE_BACKEND_API_URL`: Backend API URL
  - **Development**: `/api` (uses Vite proxy to `http://localhost:5001`)
  - **Production (Docker)**: `/api` (uses nginx reverse proxy to `http://backend:5000`)
  - **Fallback**: `http://localhost:5000` if not set
- `VITE_OILPRICE_API_KEY`: Optional API key for enhanced price data

#### Backend
- `FLASK_ENV`: Environment mode (`development` or `production`)
- `SECRET_KEY`: Flask secret key (required in production, defaults to insecure dev key)
- `DATABASE_URL`: Database connection string (defaults to SQLite)
- `CORS_ORIGINS`: Comma-separated allowed origins (defaults to `*` in dev, must be set in production)
- `OILPRICE_API_KEY`: API key for OilPriceAPI fallback
- `ALPHAVANTAGE_API_KEY`: Optional API key for Alpha Vantage (free tier: 500 calls/day)
- `RATELIMIT_STORAGE_URL`: Rate limiter storage (defaults to `memory://`)
- `HISTORICAL_DATA_DIR`: Directory for historical data files (defaults to `backend/data`)
- `SANCTIONS_CHECK_ENABLED`: Enable sanctions checking (defaults to `true`)
- `EU_ETS_VERIFICATION_ENABLED`: Enable EU ETS verification (defaults to `true`)

## Docker Configuration

### Services
- **backend**: Python Flask service on port 5001:5000 (external:internal)
  - Accessible directly at `http://localhost:5001` (for health checks, direct API access)
  - Accessible through nginx proxy at `http://localhost:8080/api/*`
- **co2-trading-app**: Production build on port 8080:80 (external:internal)
  - Serves static frontend files
  - Proxies `/api/*` requests to backend service
  - Uses nginx reverse proxy for API requests (eliminates CORS issues)
- **co2-trading-dev**: Development service on port 5174:5173 (optional, uses dev profile)
  - Uses Vite dev server with proxy configuration

### Nginx Reverse Proxy Configuration

#### API Proxy Setup
- **Location**: `/api` - All requests to `/api/*` are proxied to backend
- **Backend Target**: `http://backend:5000` (uses Docker service name for internal communication)
- **Proxy Headers**: 
  - `X-Real-IP`: Client's real IP address
  - `X-Forwarded-For`: Chain of proxy IPs
  - `X-Forwarded-Proto`: Original protocol (http/https)
  - `Host`: Original host header
- **Timeouts**: 
  - `proxy_connect_timeout`: 60s
  - `proxy_send_timeout`: 60s
  - `proxy_read_timeout`: 60s
- **File Uploads**: `client_max_body_size` set to 16MB (matches backend `MAX_CONTENT_LENGTH`)
- **CORS**: Handled by backend Flask-CORS (requests appear same-origin through proxy)

#### Benefits
- **No CORS Issues**: Requests appear same-origin from browser perspective
- **Service Discovery**: Uses Docker service names for internal communication
- **Security**: Backend not directly exposed (only through proxy)
- **Performance**: Nginx handles static files efficiently, proxies API requests

### Allowed Hosts
- platonos.mooo.com
- localhost
- 127.0.0.1

## Theme System

### Dark Mode Configuration

- **Implementation**: Tailwind CSS class-based dark mode (`darkMode: 'class'`)
- **Storage**: User preference persisted in `localStorage` with key `theme`
- **Values**: `'light'` or `'dark'`
- **Initialization**: Checks localStorage first, then system preference (`prefers-color-scheme` media query)
- **Context Provider**: `ThemeProvider` wraps entire application in `src/App.tsx`
- **HTML Class**: Dark mode applied via `dark` class on `<html>` element
- **Toggle Location**: Header component (desktop and mobile)

### Theme Context API

- **Hook**: `useTheme()` from `src/context/ThemeContext.tsx`
- **Returns**: `{ theme: 'light' | 'dark', toggleTheme: () => void }`
- **Usage**: Must be used within `ThemeProvider` component
- **Error Handling**: Throws error if used outside provider

### Chart.js Dark Mode

- **Utility**: `src/utils/chartTheme.ts` provides `getChartThemeColors(theme)` function
- **Usage**: All Chart.js charts should use this utility for consistent theming
- **Colors**: Returns theme-appropriate colors for grid, text, tooltip, and borders
- **Implementation Pattern**: Charts should recreate on theme change using `useEffect` with theme dependency

### Tailwind Dark Mode Classes

All components must use Tailwind's `dark:` prefix for dark mode variants:
- Backgrounds: `bg-white dark:bg-gray-800`, `bg-gray-100 dark:bg-gray-900`
- Text: `text-gray-900 dark:text-gray-100`, `text-gray-500 dark:text-gray-400`
- Borders: `border-gray-300 dark:border-gray-700`
- Shadows: `shadow dark:shadow-gray-900/50`

## Branding

### Application Name
- **Full Name**: "Nihao Carbon Certificates"
- **Short Name**: "Nihao"
- **Display**: Used consistently across all UI, metadata, and translations

### Logo Assets

- **Location**: `public/nihao-light.svg` and `public/nihao-dark.svg`
- **Component**: `src/components/Logo.tsx` - reusable Logo component
- **Theme Integration**: Logo automatically switches based on current theme (light/dark)
- **Usage**: Logo component must be used via `<Logo />` component, not direct image references
- **Default Styling**: `h-8 w-auto` (height: 2rem, width: auto)
- **Alt Text**: "Nihao Carbon Certificates" (default, customizable via props)
- **Error Handling**: Falls back to light logo if dark logo fails to load

### Logo Component API

- **Props**: 
  - `className?: string` - Custom CSS classes (default: `'h-8 w-auto'`)
  - `alt?: string` - Alt text for accessibility (default: `'Nihao Carbon Certificates'`)
- **Theme Dependency**: Uses `useTheme()` hook from `ThemeContext`
- **Implementation**: Automatically selects logo path based on current theme value

### Tooltip Component

- **Location**: `src/components/Tooltip.tsx`
- **Purpose**: Reusable tooltip component for displaying helpful information with accessibility support
- **Usage**: Used in Login page access request form for Entity, Contact, and Reference field guidance
- **Features**:
  - Keyboard accessible (focusable with Tab key)
  - Screen reader friendly (ARIA labels)
  - Responsive positioning (prevents overflow on small screens)
  - Smooth transitions (opacity fade-in/out)
  - Consistent styling with Login page design
- **Props**:
  - `text: string` - Tooltip text content (required)
  - `ariaLabel: string` - ARIA label for accessibility (required)
  - `iconClassName?: string` - Optional custom className for the icon
- **Styling**:
  - Dark theme optimized (matches Login page modal background `#12121a`)
  - Text formatting: `text-[0.7rem] tracking-[0.2em] uppercase` (consistent with form labels)
  - Responsive: `max-w-[calc(100vw-2rem)]` on small screens, `sm:max-w-none` on larger screens
  - Text wrapping: `break-words sm:break-normal` for responsive text handling
- **Accessibility**:
  - `tabIndex={0}` for keyboard navigation
  - `aria-label` attribute for screen readers
  - `role="button"` for semantic clarity
  - Focus ring styling: `focus:ring-2 focus:ring-[#14b8a6]`
  - Tooltip appears on both hover (`group-hover:opacity-100`) and keyboard focus (`group-focus-within:opacity-100`)

### Brand Consistency

All references to the application name must use:
- **i18n Key**: `appName` - "Nihao Carbon Certificates" (translated in all languages)
- **HTML Title**: "Nihao Carbon Certificates" (in `index.html`)
- **Web Manifest**: `name: "Nihao Carbon Certificates"`, `short_name: "Nihao"`
- **Translation Keys**: Updated from `swissO2Approach` to `nihaoApproach` in all locales

## Company Information

### Legal Entity
- **Company Name**: Italy Nihao Group Limited （HK）
- **Location**: Hong Kong
- **Address**: RM 905 WORKINGBERG COMM BLDG, 41-47 MARBLE RD, HONG KONG
- **Phone**: TEL 00852-3062 3366
- **Translation Keys**: `companyNameValue`, `addressLine1`, `addressLine2`, `addressLine3`, `phoneValue`

### Company History
- **Group Foundation**: 2006 - Group operations began in specialized carbon trading services
- **Company Founding**: 2015 - Italy Nihao Group Limited founded, establishing partnerships with Chinese state entities
- **Timeline Translation Keys**: `timeline2006`, `timeline2015` (and other year keys)

### Leadership
- **CEO**: Christian Meier (initials: CM)
- **CEO Description**: Translation key `ceoDesc` - "Christian Meier leads Italy Nihao Group Limited..."
- **Translation Keys**: `ceo`, `ceoDesc` (available in en, ro, zh)

### Company Description
All company descriptions use translation keys and are available in three languages (en, ro, zh):
- **Mission**: `missionDesc` - Mentions Italy Nihao Group Limited and exclusive collaboration contracts
- **Expertise**: `expertiseDesc` - Established in 2015, part of group with roots from 2006
- **Difference**: `differenceDesc` - Institutional market focus, discrete specialized services
- **OTC Approach**: `otcApproachDesc` - Mentions Italy Nihao Group Limited and institutional clients

## Application Architecture

### Context Providers Hierarchy
The application uses multiple React Context providers in this order:
1. **ThemeProvider** - Theme management (light/dark mode)
2. **AuthProvider** - Authentication and user state
3. **CertificateProvider** - Certificate data management
4. **StatsProvider** - Statistics and metrics
5. **MarketOffersSync** - Market offers synchronization component

### Route Protection
- **ProtectedRoute**: Requires authentication and KYC approval, redirects to `/onboarding` if KYC not approved
- **OnboardingRoute**: Requires authentication only, allows access even if KYC not started
- **Public Routes**: `/login` (redirects authenticated users to `/dashboard`)

### Routes Configuration
- `/` - Root redirects to `/login` or `/dashboard` based on auth status
- `/login` - Public login page (redirects authenticated users)
- `/dashboard` - Protected dashboard (requires KYC approval)
- `/market` - Protected market page
- `/portfolio` - Protected portfolio page
- `/emissions` - Protected emissions page
- `/about` - Protected about page
- `/documentation` - Protected documentation page
- `/market-analysis` - Protected market analysis page
- `/onboarding` - OnboardingRoute (accessible with auth, no KYC required)
- `/settings` - Protected admin settings page
- `/profile` - OnboardingRoute (accessible with auth, no KYC required)
- `*` - Catch-all redirects to `/login`

### Services Layer
All API communication goes through service layer:
- **accessRequestService.ts** - Access request management
- **adminService.ts** - Admin operations (users, config, access requests)
- **ceaPriceService.ts** - CEA price data
- **euaPriceService.ts** - EUA price data
- **kycService.ts** - KYC onboarding operations

### Error Handling
- **Error Boundary**: Catches React errors, handles chunk loading failures
- **Chunk Load Retry**: Automatic page reload on chunk load failures (1 second delay)
- **API Error Handling**: Standardized error responses with error codes
- **Network Errors**: User-friendly error messages

## UI Components

### Login Page

#### Route Configuration
- **Path**: `/login`
- **Component**: `src/pages/Login.tsx`
- **Protection**: Public route (no authentication required)
- **Redirect Behavior**: Authenticated users visiting `/login` are automatically redirected to `/dashboard`

#### Design Overview
- **Design Source**: Based on NG.html elegant design with animated canvas backgrounds
- **Theme**: Full-screen immersive dark theme with animated backgrounds
- **Layout**: Full-screen design with centered action buttons and brand watermark
- **Animations**: Two canvas layers (background and ecology) with continuous animations

#### Canvas Animations

**Background Canvas**:
- **Purpose**: Displays CO2 molecules, data particles, and trading chart lines
- **Implementation**: Uses `requestAnimationFrame` for smooth 60fps animation
- **Elements**: 
  - CO2Molecule class: Animated CO2 molecules with rotation and pulsing effects
  - DataParticle class: Floating data particles (green/white) representing trading data
  - TradingChart class: Animated line charts simulating market trends
- **Performance**: Animation runs continuously, properly cleaned up on component unmount

**Ecology Canvas**:
- **Purpose**: Displays growing tree/branches, leaves, and floating particles
- **Implementation**: Separate canvas layer with independent animation loop
- **Elements**: Tree growth animation, floating leaves, ecological particles
- **Performance**: Uses separate animation frame reference (`ecologyAnimationRef`) for proper cleanup
- **Important**: Each canvas animation MUST use its own `useRef` for animation frame ID to prevent memory leaks and ensure proper cleanup on unmount

#### Action Buttons

**Enter Button**:
- **Purpose**: Opens login modal for existing user authentication
- **Action**: Opens modal with username/password form
- **Authentication**: Uses `useAuth()` hook and `login()` function from AuthContext
- **Success**: Closes modal and navigates to `/dashboard`
- **Error**: Displays error message in modal

**Request Access Button**:
- **Purpose**: Opens registration modal for new user access requests
- **Action**: Opens modal with Entity, Contact, and Reference fields
- **Submission**: Calls `POST /api/access-requests` endpoint via `accessRequestService`
- **Success**: Closes modal and resets form (success message can be shown)
- **Error**: Displays error message in modal

#### Modal Management

**State Management**:
- **Modal Type**: `'login' | 'register' | null` state controls which modal is open
- **Open/Close**: Functions to show/hide modals with smooth transitions
- **Overlay Click**: Clicking outside modal closes it
- **Escape Key**: Pressing Escape key closes modal
- **Focus Management**: Modal traps focus when open

**Login Modal**:
- **Fields**: Username (required), Password (required)
- **Validation**: HTML5 required attributes, custom error messages
- **Loading State**: Button disabled and shows loading text during authentication
- **Error Display**: Error messages shown with `role="alert"` for accessibility

**Access Request Modal**:
- **Fields**: 
  - Entity (required, max 200 chars) - Info icon with tooltip: "Corporate name"
  - Contact (required, email format validation, max 120 chars) - Info icon with tooltip: "Corporate e-mail. Don't use personal e-mails!"
  - Position (required, max 100 chars) - "YOUR POSITION IN THE ENTITY" - No info icon
  - Reference (required, max 100 chars) - Info icon with tooltip: "Who introduces you to us?"
- **Validation**: 
  - Frontend: Email regex validation, required field checks for all fields (entity, contact, position, reference)
  - Backend: Email format validation, string sanitization, length limits, all fields required
- **Confirmation Flow**: 
  - After initial Submit, shows confirmation screen displaying all entered data
  - Confirmation screen has Edit button (returns to form with pre-filled data) and Submit button (final submission)
  - Success message displayed after final submission: "You will be contacted as soon as possible"
- **Info Icons**: 
  - Reusable `Tooltip` component (`src/components/Tooltip.tsx`) used for Entity, Contact, and Reference fields
  - InformationCircleIcon from Heroicons with keyboard-accessible tooltips
  - Tooltips appear on hover and keyboard focus
  - ARIA labels and focus rings for accessibility
  - Responsive positioning prevents overflow on small screens (max-width constraints, text wrapping)
  - Consistent styling matches modal background and form label formatting
- **Loading State**: Button disabled and shows loading text during submission
- **Error Display**: Error messages shown with `role="alert"` for accessibility
- **State Management**: React state tracks form fields, confirmation state, and confirmation data

#### Visual Design

**Color Scheme**:
- **Background**: Dark theme with CSS variables (`--dark-void`, `--dark-matter`, `--carbon-gray`)
- **Primary Colors**: Teal/cyan accents (`rgba(45, 212, 191, ...)`) for interactive elements
- **Text Colors**: White with varying opacity for hierarchy
- **Gradients**: Radial gradients for overlay effects

**Typography**:
- **Font Family**: Inter font family
- **Letter Spacing**: Specific tracking values (`tracking-[0.05em]`, `tracking-[0.2em]`)
- **Font Weights**: Varied weights for visual hierarchy
- **Sizes**: Responsive text sizing with rem units

**Visual Effects**:
- **Scanlines**: Subtle scanline effect overlay
- **Brand Watermark**: "Nihao Group" text with gradient and fade-in animation
- **Logo Icon**: SVG CO2 molecule animation
- **Fade-in Animations**: Logo, buttons, and brand watermark fade in on load

#### Responsive Behavior
- **Mobile Breakpoint**: 480px (matches NG.html media query)
- **Brand Watermark**: Scales down on mobile devices
- **Modal Padding**: Adjusts for mobile screens
- **Button Widths**: Full-width on mobile, auto-width on desktop
- **Canvas Sizing**: Responsive canvas sizing based on window dimensions

#### Accessibility Features
- **Keyboard Navigation**: 
  - Escape key closes modals
  - Tab order logical within modals
  - Focus trapped within modal when open
- **ARIA Labels**: Error messages have `role="alert"` for screen readers
- **Form Labels**: Proper form input labeling
- **Focus Management**: Consider auto-focusing first input when modal opens
- **Color Contrast**: Text colors meet WCAG AA contrast requirements

#### Translation Keys
- **Actions**: `enter`, `requestAccess`
- **Form Fields**: `entity`, `contact`, `position`, `positionPlaceholder`, `reference`, `username`, `password`
- **Info Tooltips**: `entityInfo`, `contactInfo`, `referenceInfo`
- **Confirmation Flow**: `confirmData`, `edit`, `confirmSubmit`, `willContactSoon`
- **Buttons**: `authenticate`, `submit`, `cancel`, `proceed`
- **Messages**: `accessRequestSubmitted`, `accessRequestError`, `invalidEmail`, `requiredField`
- **Available Languages**: English (en), Romanian (ro), Chinese (zh)

#### Authentication Integration
- **Hook**: Uses `useAuth()` from `src/context/AuthContext.tsx`
- **Login Function**: Calls `login(username, password)` method
- **Redirect Logic**: 
  - Already authenticated users are redirected to `/dashboard` via `useEffect`
  - Successful login navigates to `/dashboard`
  - Failed login displays error message in modal
- **Loading State**: Button shows loading text and is disabled during authentication

#### Access Request Integration
- **Service**: Uses `accessRequestService.ts` for API calls
- **Endpoint**: `POST /api/access-requests` (no authentication required)
- **Request Format**: `{ entity: string, contact: string, position: string, reference: string }`
- **Response Format**: `{ message: string, requestId: string }`
- **Error Handling**: Standardized error responses with error codes
- **Confirmation Flow**: Frontend shows confirmation screen before final API submission, allowing users to review and edit data

#### Error Handling
- **Error Display**: Error messages appear in modals with `role="alert"`
- **Error Styling**: Error messages styled for visibility
- **Error Clearing**: Errors cleared on form submission
- **Network Errors**: Handled with user-friendly messages
- **Validation Errors**: Specific messages for email format, required fields

### Header Navigation

#### Responsive Breakpoints
- **Navigation Visibility**: Hidden on screens smaller than `lg` (1024px), visible at `lg` breakpoint and above
- **Navigation Container**: `hidden lg:ml-6 lg:flex lg:space-x-3 xl:space-x-4 flex-shrink-0`
  - Spacing: `lg:space-x-3` (12px) at `lg` breakpoint, `xl:space-x-4` (16px) at `xl` breakpoint
  - `flex-shrink-0` prevents navigation container from compressing under flexbox pressure
  - Parent container uses `flex-1 min-w-0` to allow proper flex behavior and prevent overflow
- **Main Container Gap**: `gap-x-6 lg:gap-x-8` (ensures minimum spacing between navigation and controls)
  - Base gap: 1.5rem (24px) on all screens
  - `lg` breakpoint gap: 2rem (32px) for additional spacing
  - Prevents overlap between navigation links and right-side controls at `lg` breakpoint (1024px)
- **Text Sizing**: `text-sm` (consistent across all breakpoints for better readability)
- **Padding**: `px-3` (12px, consistent across all breakpoints for better touch targets)
- **Text Wrapping**: `whitespace-nowrap` applied to all navigation links to prevent wrapping
- **Right-side Controls**: Dark mode, language selector, and profile menu use `lg:` breakpoint for consistency, with `flex-shrink-0` to prevent compression

#### Implementation Details
- **File**: `src/components/Header.tsx`
- **Navigation Links**: Dashboard, Market, Market Analysis, Portfolio, Emissions, About, Documentation
- **Mobile Menu**: Still available below `lg` breakpoint via hamburger menu
- **Accessibility**: Proper ARIA labels and keyboard navigation maintained

### About Page

#### Contact Information Section
- **Location**: Displayed after Leadership Team section, before CTA section
- **Translation Keys**: `contactInformation`, `companyName`, `address`, `phone`
- **Structure**: Uses semantic HTML with `<address>` tag for address information
- **Dark Mode**: Full support with `bg-white dark:bg-gray-800` and `text-gray-900 dark:text-gray-100`
- **Accessibility**: Includes `aria-label` on contact section container

#### Timeline Component
- **Animation**: Uses Intersection Observer for fade-in animations
- **Timeline Items**: Styled with alternating left/right layout
- **Translation Keys**: `timeline2006`, `timeline2010`, `timeline2012`, `timeline2015`, `timeline2018`, `timeline2022`, `timeline2025`

### Documentation Page

#### Route Configuration
- **Path**: `/documentation`
- **Component**: `src/pages/Documentation.tsx` (lazy-loaded)
- **Protection**: Protected route requiring authentication
- **Route Definition**: `src/App.tsx` line 79-83

#### Document Metadata
- **Data File**: `src/data/documentation.ts`
- **Total Documents**: 19 PDF files
- **Document Structure**: Each document has `id`, `filename`, `titleKey`, `descriptionKey`, `category`, optional `number`, and `path`
- **Categories**: `Policy`, `Procedure`, `Form`, `Compliance`
- **Numbered Documents**: Documents 01-18 have sequential numbers, KYC document has no number

#### PDF File Serving
- **Location**: `public/documentation/` directory
- **Access Pattern**: PDFs served as static assets via `/documentation/{filename}.pdf` URLs
- **File Naming**: Follows pattern `Nihao_Carbon_{number}_{Title}.pdf` (or `Nihao_Carbon_Certificates_KYC_AML_Compliance_Procedure.pdf` for KYC)
- **Authentication**: PDFs are publicly accessible (static assets), but Documentation page route requires authentication

#### Features
- **Search**: Real-time filtering by document title or description (case-insensitive)
- **Category Filtering**: Filter by Policy, Procedure, Form, Compliance, or show All
- **Combined Filters**: Search and category filters work together (AND logic)
- **View Action**: Opens PDF in new browser tab (`target="_blank"`)
- **Download Action**: Triggers browser download via programmatic link creation
- **Empty State**: Displays "No documents found" message when filters yield no results

#### UI/UX Implementation
- **Layout**: Hero section with gradient background, search bar, category filter chips, responsive grid
- **Grid Responsiveness**: 
  - Mobile: 1 column (`grid-cols-1`)
  - Tablet: 2 columns (`md:grid-cols-2`)
  - Desktop: 3 columns (`lg:grid-cols-3`)
- **Document Cards**: 
  - Background: `bg-white dark:bg-gray-800`
  - Shadow: `shadow-md dark:shadow-gray-900/50`
  - Hover effects: `hover:shadow-lg dark:hover:shadow-gray-900/70`
  - Document number badge (for numbered documents)
  - Category badge
  - Title and description (description truncated with `line-clamp-3`)
  - Action buttons: View (primary) and Download (secondary)
- **Dark Mode**: Full support with all UI elements using `dark:` variants

#### Translation Keys
- **Page**: `documentation`, `documentationTitle`, `documentationSubtitle`
- **Actions**: `viewDocument`, `downloadDocument`, `searchDocuments`, `clearSearch`
- **Categories**: `allCategories`, `categoryPolicy`, `categoryProcedure`, `categoryForm`, `categoryCompliance`
- **States**: `noDocumentsFound`
- **Documents**: Each document has `doc{number}Title` and `doc{number}Description` keys (e.g., `doc01Title`, `doc01Description`)
- **KYC Document**: Uses `docKycTitle` and `docKycDescription` keys
- **Available Languages**: English (en), Romanian (ro), Chinese (zh)

#### Performance Optimizations
- **Memoization**: Document filtering uses `useMemo` hook to prevent unnecessary recalculations
- **Lazy Loading**: Documentation page component is lazy-loaded for code splitting
- **Static Assets**: PDFs served as static files for optimal performance

#### Accessibility
- **Search Input**: Includes search icon and clear button with ARIA labels
- **Category Buttons**: Keyboard accessible filter buttons
- **Action Buttons**: Proper button semantics with icons and text labels
- **Semantic HTML**: Proper heading hierarchy and semantic structure

### Profile Page

#### Route Configuration
- **Path**: `/profile`
- **Component**: `src/pages/Profile.tsx` (lazy-loaded)
- **Protection**: Uses `OnboardingRoute` wrapper (allows access even when onboarding hasn't started)
- **Route Definition**: `src/App.tsx` lines 118-122

#### Features
- **User Information Display**: Shows username, email, company name, address, contact person, and phone from user object and KYC data
- **KYC Status**: Color-coded status badges (pending/in-progress/approved/rejected/not-started)
- **Workflow Progress**: Visual progress bar showing current step and completion percentage
- **Document Status**: List of uploaded documents with verification status (uploaded/pending/verified/rejected)
- **Assessment Status**: Displays completion status for:
  - EU ETS Registry verification
  - Suitability assessment
  - Appropriateness assessment
- **Navigation Links**: Links to onboarding page to continue or start onboarding process

#### Data Loading
- **User Data**: Loaded from `useAuth()` hook
- **KYC Status**: Loaded using `getKYCStatus()` from `kycService`
- **Documents**: Loaded using `getDocuments()` from `kycService`
- **Error Handling**: 
  - 404 errors handled gracefully as "not started" state (no error shown)
  - Other errors display user-friendly messages
  - Document loading failures don't block page rendering

#### UI/UX Implementation
- **Layout**: Card-based layout similar to Dashboard
- **Grid Responsiveness**: Responsive grid layout adapting to screen sizes
- **Status Badges**: Color-coded badges for visual status indication
- **Progress Bar**: Visual progress indicator for workflow completion
- **Dark Mode**: Full support with all UI elements using `dark:` variants
- **Loading States**: Spinner shown during data loading
- **Empty States**: Graceful handling when KYC data is not available

#### Translation Keys
- **Page**: `profile`, `profileTitle`, `profileSubtitle`
- **Sections**: `userInformation`, `onboardingStatus`, `documentsStatus`, `assessmentStatus`
- **Fields**: `companyName`, `address`, `contactPerson`, `phone`, `email`
- **Status Labels**: `pending`, `inProgress`, `approved`, `rejected`, `notStarted`
- **Actions**: `completeOnboarding`, `viewDocuments`, `editProfile`
- **Available Languages**: English (en), Romanian (ro), Chinese (zh)

#### Error Handling
- **404 Errors**: Treated as "not started" state, no error message displayed
- **Authentication Errors**: Shows authentication required message
- **Server Errors**: Shows user-friendly server error message
- **Document Loading**: Failures are logged but don't block page rendering

### Dashboard Page

#### Price History Configuration
- **Default Timeframe**: Last 3 months of price history data
- **Implementation**: `src/pages/Dashboard.tsx` lines 32-37
- **Filtering Logic**: Uses `subMonths(new Date(), 3)` to calculate start date, filters entries where `entry.date >= startDate`
- **Fallback**: If less than 3 months of data available, shows all available data
- **Chart Data**: Filtered price history used for chart visualization

### Market Offers Configuration

#### Offer Generation
- **Location**: `src/components/MarketOffersSync.tsx`
- **CER Offers**: 18 offers generated
- **EUA Offers**: 15 offers generated
- **Price Synchronization**: Best (first) offer matches live price exactly, others are higher

#### Price Variations
- **CER Price Variation**: 0.5-1.5 EUR above live price (calculated as `Math.random() * 1 + 0.5`)
- **EUA Price Variation**: 1-2 EUR above live price (calculated as `Math.random() * 1 + 1`)
- **Best Price Rule**: First offer in sorted list always matches live price exactly

#### Volume Distribution
- **Weighted Random Selection**: 30% small volumes, 40% medium volumes, 30% large volumes
- **Small Volumes**: 
  - CER: 500-2000 tons (`Math.random() * 1500 + 500`)
  - EUA: 200-1000 tons (`Math.random() * 800 + 200`)
- **Medium Volumes**: 
  - CER: 2000-6000 tons (`Math.random() * 4000 + 2000`)
  - EUA: 1000-3500 tons (`Math.random() * 2500 + 1000`)
- **Large Volumes**: 
  - CER: 8000-15000 tons (`Math.random() * 7000 + 8000`)
  - EUA: 5000-10000 tons (`Math.random() * 5000 + 5000`)

#### Offer Synchronization
- **Live Price Sync**: Offers automatically sync when live prices update
- **Recreation Logic**: Offers recreated if they don't exist or have prices below live price
- **Sorting**: Offers sorted by price (lowest first) before setting

## PDF Document Update Tools

### Scripts Location
- **Directory**: `backend/scripts/`
- **Main Script**: `update_pdf_documents.py`
- **Report Generator**: `generate_update_report.py`
- **Configuration File**: `pdf_update_config.json`

### Configuration Source
- **Single Source of Truth**: All company-specific data is stored in `backend/scripts/pdf_update_config.json`
- **No Hardcoded Data**: Scripts load all configuration from JSON file
- **Validation**: Configuration is validated before processing (required fields, data formats)

### Company Data Structure
The configuration file contains:
- **Company Information**: Provider name, company name, address, phone, email, jurisdiction
- **Trading Parameters**: Order types, time in force, order submission method, execution venues
- **Fees**: CER transaction (2%), EUA spot transaction (5%), registry transfer (2%), account maintenance (0%)
- **Settlement**: Standard settlement (T+4), conversion settlement (T+2), settlement period (T+2)
- **Complaint Handling**: Methods, company contact, Financial Ombudsman details
- **Emergency Contacts**: Address and phone
- **Client Money Segregation**: Account name, number, bank details, SWIFT code

### Document Update Mapping
- **Total Documents**: 19 PDF files in `docs/documentation/`
- **Mapping**: Each document has specific sections defined in `DOCUMENT_UPDATES` dictionary
- **Sections**: provider_name, company_contact, jurisdiction, order_types, fees, settlement, execution_venues, complaint_methods, financial_ombudsman, emergency_contact, client_money

### Script Usage Patterns
- **Analysis Mode**: `--analyze-only` - Extract and analyze PDFs without modifications
- **Dry Run**: `--dry-run` - Test replacements without saving changes
- **Backup**: `--backup` - Create timestamped backups before updates
- **Custom Paths**: `--docs-dir PATH` and `--config PATH` for flexible directory structure

### PDF Text Replacement
- **Method**: Uses PyMuPDF's text search, redaction, and insertion capabilities
- **Matching**: Precise text matching with word boundaries to avoid false positives
- **Limitations**: PDF formatting may not be perfectly preserved; professional PDF editing software recommended for complex documents
- **Output**: Updated PDFs saved as `{filename}_updated.pdf` in same directory

### Dependencies
- **PyMuPDF**: Required for PDF text extraction and manipulation (`pip install PyMuPDF==1.23.8`)
- **reportlab**: Optional, for PDF generation if needed (`pip install reportlab==4.0.7`)

## Access Request System

### API Endpoints

#### Public Endpoints (`/api/access-requests`)
- **POST** `/api/access-requests` - Create new access request (no authentication required)
  - **Body**: `{ entity: string, contact: string, position: string, reference: string }`
  - **Validation**: 
    - Entity: Required, max 200 characters, sanitized
    - Contact: Required, valid email format, max 120 characters
    - Position: Required, max 100 characters, sanitized
    - Reference: Required, max 100 characters, sanitized
  - **Response**: `{ message: string, requestId: string }`
  - **Error Codes**: `MISSING_BODY`, `MISSING_ENTITY`, `MISSING_CONTACT`, `MISSING_POSITION`, `MISSING_REFERENCE`, `INVALID_EMAIL`, `ENTITY_TOO_LONG`, `CONTACT_TOO_LONG`, `POSITION_TOO_LONG`, `REFERENCE_TOO_LONG`

#### Admin Endpoints (`/api/admin/access-requests`)
- **GET** `/api/admin/access-requests` - List all access requests (requires admin authentication)
  - **Query Parameters**: 
    - `status` (optional): Filter by status (`pending`, `reviewed`, `approved`, `rejected`)
    - `limit` (optional): Number of results per page (default: 50)
    - `offset` (optional): Pagination offset (default: 0)
    - `search` (optional): Search by entity name or contact email (case-insensitive)
  - **Response**: `{ requests: AccessRequest[], total: number, limit: number, offset: number }`
  - **Sorting**: Results sorted by `created_at` descending (newest first)
- **GET** `/api/admin/access-requests/<request_id>` - Get specific access request (requires admin authentication)
  - **Response**: `AccessRequest` object with all fields
- **POST** `/api/admin/access-requests/<request_id>/review` - Update request status (requires admin authentication)
  - **Body**: `{ status: 'pending' | 'reviewed' | 'approved' | 'rejected', notes?: string }`
  - **Updates**: Sets `reviewed_at` to current timestamp, `reviewed_by` to admin ID from `X-Admin-ID` header
  - **Response**: Updated `AccessRequest` object

### Database Model

#### AccessRequest Model
- **Table**: `access_requests`
- **Fields**:
  - `id`: UUID primary key (string, 36 chars)
  - `entity`: Company/organization name (string, max 200 chars, required)
  - `contact`: Email address (string, max 120 chars, required, indexed)
  - `position`: User's position in the entity (string, max 100 chars, required)
  - `reference`: Reference number or code (string, max 100 chars, required)
  - `status`: Enum (`pending`, `reviewed`, `approved`, `rejected`), default `pending`, indexed
  - `created_at`: Timestamp (datetime, required, indexed)
  - `reviewed_at`: Review timestamp (datetime, optional)
  - `reviewed_by`: Admin user ID (string, 36 chars, optional)
  - `notes`: Admin notes (text, optional)
- **Serialization**: `to_dict(camel_case=True)` converts to camelCase for API responses
- **Database Migration**: Migration script available at `backend/scripts/migrate_access_requests_0022.py` to add `position` column and make `reference` NOT NULL

### Frontend Service

#### accessRequestService.ts
- **Location**: `src/services/accessRequestService.ts`
- **Function**: `submitAccessRequest(data: AccessRequestData): Promise<AccessRequestResponse>`
- **Interface**: `AccessRequestData` includes `entity`, `contact`, `position` (required), and `reference` (required, no longer optional)
- **Error Handling**: Standardized error handling with network error detection
- **API URL**: Uses `VITE_BACKEND_API_URL` environment variable or defaults to `/api` in dev

### Authentication
- **Public Endpoint**: POST `/api/access-requests` does not require authentication
- **Admin Endpoints**: All admin endpoints require `@require_admin` decorator
- **Rate Limiting**: Inherits default rate limits (200/day, 50/hour) from Flask-Limiter

### Frontend Component

#### AccessRequestsManagement Component
- **Location**: `src/components/admin/AccessRequestsManagement.tsx`
- **Features**:
  - List access requests with pagination (50 per page)
  - Display all fields: Entity, Contact, Position, Reference, Status, Created At, Actions
  - Filter by status (All, Pending, Reviewed, Approved, Rejected)
  - Search by entity name or contact email (debounced, 300ms delay)
  - Real-time polling for new requests (every 10 seconds)
  - Badge showing count of new pending requests
  - View details modal showing all request information including position field
  - Review modal for updating status and adding notes
  - Success notifications for status updates
- **Polling Logic**: 
  - Checks for new requests every 10 seconds
  - Compares `created_at` timestamps with `lastCheckedAt` baseline
  - Updates badge count and shows notification when new requests detected
  - Baseline set to oldest request's `created_at` on initial load
- **State Management**: Uses React hooks for requests, filters, modals, and polling state
- **Table Columns**: 7 columns total (Entity, Contact, Position, Reference, Status, Created At, Actions)

### Security
- **Input Validation**: Email format validation, string sanitization, length limits
- **SQL Injection**: Protected via SQLAlchemy ORM
- **XSS Protection**: Input sanitization and React automatic escaping
- **Path Safety**: No file uploads, no path traversal risks
- **Admin Authentication**: All admin endpoints require `@require_admin` decorator with `X-Admin-ID` header

## KYC & Onboarding System

### Onboarding Navigation and Document Upload

#### Free Navigation Between Steps
- **Non-Blocking Navigation**: Users can navigate freely between all onboarding steps without being blocked by document upload requirements
- **Continue Buttons**: Continue buttons are always visible on all steps, allowing users to proceed regardless of completion status
- **Stepper Navigation**: The onboarding stepper allows users to click on any step to navigate directly to it (no sequential restriction)
- **Document Upload Availability**: Document upload functionality is available on all onboarding steps via a collapsible section
- **Implementation**: `src/pages/Onboarding.tsx` - Continue buttons always rendered, stepper uses `onStepClick` prop for navigation

#### Document Upload on All Steps
- **Collapsible Section**: Each step includes a collapsible "Upload Documents" section that can be expanded/collapsed independently
- **Per-Step State**: Each step maintains its own expand/collapse state (using `Map<WorkflowStep, boolean>`), so expanding on one step doesn't affect others
  - **Implementation**: `src/pages/Onboarding.tsx` line 71 - `useState<Map<WorkflowStep, boolean>>(new Map())`
  - **State Management**: `DocumentUploadSection` component (lines 377-492) manages per-step state via `toggleExpand()` function
- **Document Count Display**: The collapsible header shows current document count (e.g., "Upload Documents (3/5 uploaded)")
- **Missing Documents Warning**: When expanded, shows a warning listing missing required documents (non-blocking)
- **Same Functionality**: All document upload components are available on every step, identical to the document collection step
- **Component Reuse**: `DocumentUploadSection` component (lines 377-492) is rendered on all steps: `eu_ets_verification`, `suitability_assessment`, `appropriateness_assessment`, `final_review`

#### Final Submission Validation
- **Document Validation**: Final submission is blocked if required documents are missing (only place where document validation blocks the user)
- **EU ETS Validation**: Final submission is blocked if EU ETS Registry is not verified
- **Clear Error Messages**: Missing documents and verification status are clearly displayed with specific lists of what's missing
- **User Guidance**: Users can upload missing documents directly from the final review step before submitting
- **Implementation**: `src/pages/Onboarding.tsx` lines 793-808 - Submit button disabled with `!hasAllRequiredDocuments() || !kycData.eu_ets_registry_verified`

#### Document Reloading Behavior
- **Optimized Reloading**: Documents are reloaded when KYC data changes (initial load or after updates), not on every step change
- **Callback-Based Updates**: Documents are also reloaded via callbacks in `handleDocumentUpload` (after 5 seconds) and `handleDocumentDelete` (after 1 second)
- **State Persistence**: Document state persists when navigating between steps, ensuring consistency across the workflow
- **Implementation**: `src/pages/Onboarding.tsx` lines 108-120 - `useEffect` depends only on `kycData`, not `currentStep`

### API Endpoints

#### User Endpoints (`/api/kyc`)
- **POST** `/api/kyc/register` - Start onboarding process (no authentication required, user_id in body)
- **POST** `/api/kyc/documents/upload` - Upload KYC document (requires authentication, supports multiple files)
- **GET** `/api/kyc/documents` - List user's documents (requires authentication)
- **GET** `/api/kyc/documents/<document_id>/preview` - Preview image document (requires authentication, image files only)
- **DELETE** `/api/kyc/documents/<document_id>` - Delete document (requires authentication)
- **POST** `/api/kyc/submit` - Submit KYC dossier for review (requires authentication)
- **GET** `/api/kyc/status` - Get current KYC status (requires authentication)
- **POST** `/api/kyc/eu-ets-verify` - Verify EU ETS Registry account (requires authentication)
- **POST** `/api/kyc/suitability-assessment` - Submit suitability assessment (requires authentication)
- **POST** `/api/kyc/appropriateness-assessment` - Submit appropriateness assessment (requires authentication)
- **GET** `/api/kyc/workflow` - Get workflow status (requires authentication)

#### Admin Endpoints (`/api/admin/kyc`)
- **GET** `/api/admin/kyc/pending` - List pending KYC dossiers (requires admin authentication)
- **GET** `/api/admin/kyc/<user_id>` - Get detailed KYC information (requires admin authentication)
- **POST** `/api/admin/kyc/<user_id>/approve` - Approve KYC dossier (requires admin authentication)
- **POST** `/api/admin/kyc/<user_id>/reject` - Reject KYC dossier (requires admin authentication)
- **POST** `/api/admin/kyc/<user_id>/request-update` - Request document updates (requires admin authentication)
- **POST** `/api/admin/kyc/<user_id>/verify-document/<document_id>` - Verify/reject document (requires admin authentication)
- **POST** `/api/admin/kyc/<user_id>/sanctions-check` - Run sanctions screening (requires admin authentication)
- **POST** `/api/admin/kyc/<user_id>/set-risk-level` - Set risk level (requires admin authentication)

### Authentication

#### Current Implementation (Development)
- **Method**: Header-based authentication using `X-User-ID` header
- **Admin Method**: Header-based authentication using `X-Admin-ID` header
- **Validation**: UUID format validation for user/admin IDs
- **Note**: This is a placeholder implementation. Production should use JWT tokens or session-based authentication.

#### Authentication Decorators
- **`@require_auth`**: Validates user authentication and UUID format
- **`@require_admin`**: Validates admin authentication and UUID format
- **Location**: `backend/utils/helpers.py`

**Note**: The `/api/kyc/register` endpoint does **not** use `@require_auth` decorator because it's the initial onboarding step. It accepts `user_id` in the request body and validates it directly. 

**User Auto-Creation in Development Mode**:
- **Development Mode**: When `DEBUG=True` in Flask config, the endpoint auto-creates users if they don't exist
  - Auto-created users have minimal fields: generated username (`user_{id[:8]}`), generated email (`user_{id[:8]}@example.com`), empty password hash, `PENDING` KYC status, `LOW` risk level
  - A warning is logged when auto-creating users
- **Production Mode**: When `DEBUG=False`, the endpoint returns 404 if user doesn't exist
- **Implementation**: Uses `current_app.config.get('DEBUG', False)` to check mode (not `FLASK_ENV` which may not be in config)
- **Testing**: Comprehensive test coverage in `backend/tests/test_user_creation_dev_mode.py` verifies behavior in both modes

All other endpoints require the `X-User-ID` header.

### File Upload Configuration

#### Upload Directory
- **Path**: `backend/uploads/kyc_documents/`
- **Permissions**: Directory created automatically if it doesn't exist
- **Security**: Files stored with UUID-based filenames to prevent path traversal

#### File Constraints
- **Max File Size**: 16MB (configurable via `Config.MAX_CONTENT_LENGTH`)
- **Allowed Types**: PDF, PNG, JPG, JPEG, DOC, DOCX
- **Validation**: Server-side validation of file type, size, and content-type matching
- **Path Safety**: All file paths validated to prevent directory traversal attacks
- **Multiple Documents**: Users can upload multiple documents per document type (no unique constraint on `(user_id, document_type)`)
- **Company Registration**: Company registration certificates accept all allowed file types (PDF, PNG, JPG, JPEG), not restricted to PDF only
- **Bulk Upload**: Frontend supports selecting and uploading multiple files at once (sequential upload to avoid overwhelming server)
- **Image Previews**: Image documents (PNG, JPG, JPEG) display thumbnail previews via preview endpoint
- **Document Sorting**: Documents are automatically sorted by upload date (newest first) in the UI for better user experience
- **Upload Progress Display**: Upload progress shows filename and file size ("Uploading [filename] ([size])... X%")
  - Single file upload: Shows current filename and size
  - Multiple file uploads: Shows current uploading file with queue count ("X more files queued")
  - Displays up to 3 filenames in queue list with "more" indicator if additional files
- **Success Message**: Enhanced upload confirmation with prominent filename display
  - Auto-dismisses after 5 seconds (extended from 3 seconds)
  - Dismissible via close button for user control
  - Includes checkmark icon and clear visual hierarchy
  - Accessibility: `role="alert"` and `aria-live="polite"` for screen readers
  - Full dark mode support with appropriate color variants

### Error Response Format

All API endpoints use standardized error responses:
```json
{
  "error": "User-friendly error message",
  "code": "ERROR_CODE"
}
```

**Standard Error Codes**:
- `AUTH_REQUIRED` - Authentication required
- `INVALID_USER_ID` - Invalid user ID format
- `MISSING_USER_ID` - User ID not provided
- `USER_NOT_FOUND` - User not found
- `DOCUMENT_NOT_FOUND` - Document not found
- `INVALID_FILE` - Invalid file type or size
- `MISSING_DOCUMENTS` - Required documents missing
- And others as defined in `backend/utils/helpers.py`

### Rate Limiting

- **Development Limits**: 5000 requests per day, 1000 requests per hour
- **Production Limits**: 200 requests per day, 50 requests per hour
- **Storage**: Memory-based by default, can be configured to use Redis
- **Configuration**: Set via `RATELIMIT_STORAGE_URL` environment variable
- **Implementation**: Flask-Limiter middleware
- **Key Function**: Uses `get_remote_address` for rate limit tracking

### CORS Configuration

- **Development**: Allows all origins by default
- **Production**: **MUST** set `CORS_ORIGINS` environment variable with comma-separated allowed origins
- **Warning**: System logs warning if CORS allows all origins in production
- **Configuration**: Set via `CORS_ORIGINS` environment variable (e.g., `CORS_ORIGINS=https://example.com,https://app.example.com`)

### Data Serialization

- **Backend Format**: Python models use snake_case internally
- **API Format**: All API responses use camelCase for frontend compatibility
- **Conversion**: Automatic conversion via `to_dict(camel_case=True)` method on models
- **Serializer**: `backend/utils/serializers.py` provides `to_camel_case()` utility

### Design System

The application uses a comprehensive design system for consistent styling and theming across all components.

#### Design System Structure

- **Location**: `src/design-system/`
- **Documentation**: `docs/design-system/`
- **Structure**:
  - `tokens/` - Design tokens (colors, typography, spacing, shadows, borders, transitions, breakpoints, z-index)
  - `themes/` - Theme configurations (light, dark)
  - `components/` - Reusable UI components (Button, Input, Card, Badge, Modal, Tooltip, Table, Form)
  - `hooks/` - Design system hooks (useTheme, useMediaQuery, useBreakpoint)
  - `utilities/` - Utility functions (cn, classNames)
  - `styles/` - CSS files (base.css, components.css, utilities.css, themes.css)

#### Core Principle

**Components must NEVER use hard-coded design values.** All colors, spacing, typography, shadows, and other design properties must reference design tokens. This ensures consistency and enables theme changes from a single source.

#### Design Tokens

- **Location**: `src/design-system/tokens/`
- **Purpose**: Centralized design values for colors, typography, spacing, shadows, borders, transitions, breakpoints, and z-index
- **Usage**: Imported by components to ensure consistency
- **Token Categories**:
  - Colors: Primary, secondary, semantic (success/error/warning/info), neutral, functional (background/text/border)
  - Typography: Font families, sizes, weights, text styles
  - Spacing: Scale (0-24), semantic spacing, component-specific spacing
  - Shadows: Standard shadows, dark mode shadows, colored shadows
  - Borders: Radius, width, colors
  - Transitions: Durations, timing functions, presets
  - Breakpoints: Responsive breakpoints (mobile, sm, md, lg, xl, 2xl)
  - Z-Index: Standard scale and semantic z-index values

#### Legacy Design Tokens

- **Location**: `src/design-system/tokens.ts` (legacy file)
- **Purpose**: Centralized constants for file upload limits, API configuration, UI constants
- **Usage**: Imported by components to ensure consistency
- **File Upload Config**: `FILE_UPLOAD_CONFIG` contains max file size and allowed types
- **API Config**: `API_CONFIG` contains retry logic and timeout settings
- **Note**: This file contains application-specific constants, not design tokens. Design tokens are in `src/design-system/tokens/` directory.

#### Design System Components

All components are located in `src/design-system/components/` and exported through `src/design-system/components/index.ts`:

- **Button**: Multiple variants (primary, secondary, outline, ghost, danger, success, info) and sizes (sm, md, lg)
- **Input**: Label, error handling, icon support, dark variant
- **Card**: Multiple variants (default, elevated, outlined) with padding options
- **Badge**: Status indicators with variants (primary, secondary, success, error, warning, info)
- **Modal**: Dialog component using Headless UI
- **Tooltip**: Accessible tooltip with position and variant options
- **Table**: Standardized table with striped rows, hover effects, compact mode
- **Form**: FormField, FormLabel, FormError components

#### Design System Hooks

- **Location**: `src/design-system/hooks/`
- **useTheme**: Access and control application theme (`{ theme, toggleTheme }`)
- **useMediaQuery**: Check if a media query matches (`useMediaQuery(query: string)`)
- **useBreakpoint**: Check if screen is at or above a breakpoint (`useBreakpoint(breakpoint)`)

#### Theme System

- **Implementation**: Tailwind CSS class-based dark mode (`darkMode: 'class'`)
- **Storage**: User preference persisted in `localStorage` with key `theme`
- **Values**: `'light'` or `'dark'`
- **Initialization**: Checks localStorage first, then system preference (`prefers-color-scheme` media query)
- **Context Provider**: `ThemeProvider` wraps entire application in `src/App.tsx`
- **HTML Class**: Dark mode applied via `dark` class on `<html>` element
- **CSS Variables**: Defined in `src/design-system/styles/themes.css` for dynamic theming

#### Usage Requirements

- **Components MUST use design tokens** - Never hardcode colors, spacing, or typography
- **Components MUST support theme switching** - All components must work in both light and dark themes
- **Use design system components** - Prefer design system components over custom styled components
- **Follow accessibility guidelines** - Components include ARIA attributes by default
- **Test both themes** - Ensure components work correctly in light and dark modes

#### Portable Theme Files

The design system theme is exported in portable formats for reuse in other applications:

- **`design-system-theme.json`** - Complete theme in JSON format (universal compatibility)
- **`design-system-theme.ts`** - Complete theme in TypeScript format (full type safety, exports `THEME_VERSION`)
- **`design-system-theme.schema.json`** - JSON Schema for validation and IDE autocomplete
- **`design-system-theme.package.json`** - npm package template for distribution
- **`DESIGN_SYSTEM_THEME_README.md`** - Complete usage documentation with examples for multiple frameworks
- **`scripts/validate-theme.js`** - Validation script to ensure theme files stay in sync

**Validation**: Run `node scripts/validate-theme.js` to verify theme files are synchronized and valid.

**Version Management**: Theme version is exported as `THEME_VERSION` constant in TypeScript and `version` field in JSON. Both must match.

**Type Exports**: TypeScript file exports 20+ granular types for better type safety (ColorScale, FontSize, SpacingScale, etc.).

#### Documentation

Complete design system documentation is available in `docs/design-system/`:
- `README.md` - Overview and quick start guide
- `tokens.md` - Complete token documentation
- `components.md` - Component API documentation
- `themes.md` - Theme system documentation
- `hooks.md` - Hooks documentation
- `migration-guide.md` - Guide for migrating existing components
- `examples.md` - Usage examples and patterns

### Security Considerations

#### Production Requirements
- **SECRET_KEY**: **MUST** be set via environment variable in production (no default allowed)
- **CORS**: **MUST** restrict to specific origins in production
- **File Uploads**: All paths validated, UUID-based filenames, content-type validation
- **Error Messages**: Internal errors logged but not exposed to clients
- **Rate Limiting**: Enabled by default to prevent abuse

#### File Upload Security
- Path traversal prevention via `validate_path_safe()` and absolute path checks
- UUID-based filenames prevent predictable file access
- Content-type validation matches file extension
- File size limits enforced server-side

### Database Models

#### User Model Extensions
- KYC status, risk level, document metadata
- EU ETS Registry information
- Suitability and appropriateness assessments
- Sanctions check status and PEP status

#### KYCDocument Model
- Document type, file path, verification status
- Upload and verification timestamps
- Reviewer information
- **Multiple Documents Per Type**: No unique constraint on `(user_id, document_type)`, allowing users to upload multiple documents per category

#### KYCWorkflow Model
- Current step tracking
- Workflow status and progress
- Reviewer assignment
- Workflow data (JSON)

## Price Data & Historical Data

### Price Update System
- **Background Scheduler**: APScheduler runs scheduled price updates every 1 minute
- **Cache Duration**: 2 minutes (120 seconds) for EUA and CEA prices
- **Price Sources**: Multiple fallback sources tracked per request:
  - ICE (Intercontinental Exchange) - Primary source
  - CarbonCredits.com
  - Alpha Vantage API (requires API key)
  - TradingView
  - Investing.com
  - MarketWatch
  - ICE public pages
  - OilPriceAPI (fallback)
  - Cached (when using cached data)
- **Source Tracking**: Each price update tracks which source provided the data
- **Source History**: In-memory tracking of last price and timestamp per source

### Historical Data
- **Storage**: JSON files in `backend/data/` directory
- **Collector**: `HistoricalDataCollector` class manages historical data
- **Data Files**: Separate files for EUA and CEA historical prices
- **Time Range**: 5+ years of daily price data
- **API Endpoints**: 
  - `/api/eua/history` - EUA historical data
  - `/api/cea/history` - CEA historical data
  - `/api/history/combined` - Combined historical data
  - `/api/eua/price/history` - Alternative EUA history endpoint

### Price API Endpoints
- **GET** `/api/eua/price` - Get current EUA price (cached, includes source)
- **POST** `/api/eua/price/refresh` - Force refresh EUA price
- **GET** `/api/cea/price` - Get current CEA price (cached)
- **GET** `/api/eua/history` - Get EUA historical data (with date filtering)
- **GET** `/api/cea/history` - Get CEA historical data (with date filtering)
- **GET** `/api/history/combined` - Get combined historical data

### Market Offers Synchronization
- **Component**: `MarketOffersSync` component syncs market offers with live prices
- **Location**: Rendered at app root level (outside routes)
- **CER Offers**: 18 offers generated with 0.5-1.5 EUR variation above live price
- **EUA Offers**: 15 offers generated with 1-2 EUR variation above live price
- **Best Price**: First offer always matches live price exactly
- **Volume Distribution**: Weighted random (30% small, 40% medium, 30% large volumes)

## Admin Settings System

### Overview
The Admin Settings page provides administrative functionality for platform management, accessible only to admin users (currently Victor). The page is organized into four main sections accessible via tabs: User Management, Configuration, Price Update Monitoring, and Access Requests Management.

### Price Source Tracking

The system tracks which data source provided each EUA price update, enabling administrators to monitor source reliability and performance.

#### Source Tracking Implementation

**Backend (`backend/app.py`)**:
- Global `source_price_history` dictionary tracks last price and timestamp per source
- Sources tracked: ICE (Intercontinental Exchange), Alpha Vantage API, TradingView, Investing.com, MarketWatch, ICE public pages, OilPriceAPI (fallback), Cached
- `update_source_price_history()` function updates history when prices are fetched
- Source information included in price responses via `source` field
- Status endpoint (`/api/admin/price-updates/status`) includes `lastSource`, `lastPrice`, and `sourcePrices` array

**Scraper (`backend/scraper.py`)**:
- `ICEScraper.scrape_ice_price()` method adds `source` field to returned price data
- Source mapping dictionary maps each fetch function to human-readable source name
- When a source succeeds, `source` field is set to the mapped name
- Fallback to "Cached" source when using cached prices

**Frontend (`src/components/admin/PriceUpdateMonitoring.tsx`)**:
- Displays `lastSource` value (replaces "Unknown" with actual source)
- Shows `lastPrice` from current cached response
- Displays detailed `sourcePrices` table with:
  - Source name
  - Last price obtained from that source (or "Never Used" if never used)
  - Last update timestamp (or "Never" if never used)
- Visual highlighting: Current active source shown with background color (`bg-primary-50 dark:bg-primary-900/20`) and bold text
- React key: Uses `sourcePrice.source` as key for stable rendering

**API Response Format**:
- Price endpoints (`/api/eua/price`, `/api/eua/price/refresh`) include `source` field in response
- Status endpoint includes:
  ```json
  {
    "eua": {
      "lastSource": "ICE (Intercontinental Exchange)",
      "lastPrice": 79.50,
      "sourcePrices": [
        {
          "source": "ICE (Intercontinental Exchange)",
          "lastPrice": 79.50,
          "lastUpdate": "2024-01-01T12:00:00Z"
        },
        ...
      ]
    }
  }
  ```

**Data Persistence**:
- Currently uses in-memory storage (`source_price_history` dictionary)
- History persists across requests within the same server instance
- For production, consider database storage or Redis for persistence across server restarts

### Authentication & Access Control

#### Admin User
- **Username**: Victor
- **Password**: VictorVic
- **Verification**: Frontend checks `user.username === 'Victor'` via `isAdmin()` function in `AuthContext`
- **UUID Generation**: Consistent UUID generated from username hash (same algorithm in `AuthContext.tsx`, `adminService.ts`, and `init_db.py`)
  - **Algorithm**: Simple hash-based UUID generation for consistency
  - **Format**: `00000000-0000-4000-8000-{hash}{hash}{hash}{hash}` (36 characters)
  - **Victor's UUID**: `00000000-0000-4000-8000-98b72b6798b7`
  - **Implementation**: 
    - Hash calculation: `hash = ((hash << 5) - hash) + char` for each character
    - Convert to positive hex: `format(abs(hash), 'x').zfill(8)`
    - Repeat hash 4 times to form 12-character suffix
  - **Important**: This algorithm must be identical across all implementations (frontend and backend)
  - **Limitation**: Hash-based approach may have collision risk for different usernames, but acceptable for single admin use case
  - **Future**: For multi-admin scenarios, consider UUID v5 with proper namespace
  - **UUID Mismatch Detection**: `backend/init_db.py` detects UUID mismatches when initializing database and provides clear warnings with actionable instructions
  - **Testing**: Comprehensive test coverage in `backend/tests/test_uuid_generation.py` ensures consistency across implementations

#### Access Control
- **Route**: `/settings` - Protected with `ProtectedRoute` wrapper
- **Frontend Check**: Settings component verifies admin status, redirects non-admin users to dashboard
- **Backend Check**: All admin endpoints use `@require_admin` decorator validating `X-Admin-ID` header
- **Header Link**: Settings link appears in Header profile dropdown menu for all authenticated users (but page redirects non-admins)

### API Endpoints

#### User Management (`/api/admin/users`)
- **POST** `/api/admin/users` - Create new user (requires admin authentication)
  - **Body**: `{ username: string, email: string, password?: string, companyName?: string, address?: string, contactPerson?: string, phone?: string }`
  - **Validation**: 
    - Username: Required, must be unique
    - Email: Required, must be valid format, must be unique
    - Password: Optional (if not provided, random UUID is hashed to prevent login without password reset)
  - **Default Values**: `is_admin=False`, `kyc_status='PENDING'`, `risk_level='LOW'`
  - **Response**: Created `User` object with camelCase fields
  - **Error Codes**: `MISSING_USERNAME`, `MISSING_EMAIL`, `INVALID_EMAIL`, `EMAIL_EXISTS`, `USERNAME_EXISTS`, `CREATE_USER_ERROR`
- **GET** `/api/admin/users` - List all users with pagination and filtering
  - Query params: `page`, `per_page`, `kyc_status`, `risk_level`, `search`
  - Response: `{ users: User[], total: number, page: number, perPage: number }`
- **GET** `/api/admin/users/<user_id>` - Get user details
- **PUT** `/api/admin/users/<user_id>` - Update user information
  - Body: `{ email?, companyName?, address?, contactPerson?, phone? }`
- **DELETE** `/api/admin/users/<user_id>` - Delete user

#### Configuration (`/api/admin/config`)
- **GET** `/api/admin/config` - Get current platform configuration
  - Response: `{ platformName, contactEmail, cacheDuration, rateLimitPerDay, rateLimitPerHour }`
- **PUT** `/api/admin/config` - Update platform configuration
  - Body: `{ platformName?, contactEmail?, cacheDuration?, rateLimitPerDay?, rateLimitPerHour? }`
  - Validation: `cacheDuration` must be between 60 and 600 seconds
- **GET** `/api/admin/config/price-updates` - Get price update configuration

#### Price Updates Status (`/api/admin/price-updates/status`)
- **GET** `/api/admin/price-updates/status` - Get price update status and configuration
  - Response includes:
    - EUA price update info (polling interval, cache duration, endpoint, libraries, data sources, last update, last source, last price, source prices array, status)
      - `lastSource`: Name of the source that provided the last price (e.g., "ICE (Intercontinental Exchange)", "Cached", etc.)
      - `lastPrice`: Last price obtained from the current cached response
      - `sourcePrices`: Array of objects with `source`, `lastPrice`, and `lastUpdate` for each data source
    - CER price update info (polling interval, cache duration, endpoint, libraries, method, last update, status)
    - Historical data collector info (libraries, method, data files)

### Frontend Components

#### Settings Page (`src/pages/Settings.tsx`)
- Tab-based navigation using Headless UI
- Admin check with redirect for non-admin users
- Four tab panels: User Management, Configuration, Price Update Monitoring, **Access Requests**
- Dark mode support

#### User Management Component (`src/components/admin/UserManagement.tsx`)
- User list table with pagination (100 users per page)
- Search functionality (username, email)
- Filtering by KYC status and risk level
- Actions: View details, Edit user, Delete user, **Create User**
- Modals: View details modal, Edit user modal, Delete confirmation modal, **Create User modal**
- Create User form with fields: username, email, password (optional), companyName, address, contactPerson, phone
- Form validation: Email format validation, required field checks
- Success/error notifications

#### Configuration Component (`src/components/admin/Configuration.tsx`)
- General settings (platform name, contact email - read-only)
- Cache settings (cache duration - editable, 60-600 seconds)
- Rate limiting settings (requests per day/hour - read-only)
- Form validation and error handling
- Success notifications

#### Price Update Monitoring Component (`src/components/admin/PriceUpdateMonitoring.tsx`)
- EUA price update information display
  - Shows last source that provided the price (replaces "Unknown" with actual source name)
  - Shows last price from current cached response
  - Displays detailed source prices table showing last price and last update timestamp for each data source
  - Visual highlighting (background color and bold text) for the current active source
  - Sources displayed: ICE (Intercontinental Exchange), Alpha Vantage API, TradingView, Investing.com, MarketWatch, ICE public pages, OilPriceAPI (fallback), Cached
  - Shows "Never Used" and "Never" for sources that haven't been used yet
  - Alpha Vantage API requires `ALPHAVANTAGE_API_KEY` environment variable (optional, free tier: 500 calls/day)
- CER price update information display
- Historical data collector information display
- Manual refresh button
- Auto-refresh status every 30 seconds
- Fallback to default values if API fails

#### Access Requests Management Component (`src/components/admin/AccessRequestsManagement.tsx`)
- Access requests list table with pagination (50 per page)
- Filter by status (All, Pending, Reviewed, Approved, Rejected)
- Search by entity name or contact email (debounced, 300ms)
- Real-time polling for new requests (every 10 seconds)
- Badge showing count of new pending requests
- View details modal showing all request information
- Review modal for updating status and adding notes
- Success notifications for status updates
- Dark mode support

### Admin Service (`src/services/adminService.ts`)
- **Functions**:
  - `getAllUsers(page, perPage, filters)` - List users with pagination and filtering
  - `getUserDetails(userId)` - Get user details
  - `updateUser(userId, data)` - Update user
  - `deleteUser(userId)` - Delete user
  - `createUser(data)` - Create new user (username, email, password?, companyName?, address?, contactPerson?, phone?)
  - `getAccessRequests(filters?)` - List access requests with pagination and filtering
  - `getAccessRequestDetails(requestId)` - Get specific access request details
  - `reviewAccessRequest(requestId, data)` - Update access request status and notes
  - `getConfig()` - Get platform configuration
  - `updateConfig(config)` - Update platform configuration
  - `getPriceUpdateStatus()` - Get price update status
  - `refreshPrices()` - Manual price refresh (calls EUA and CER endpoints)
- **TypeScript Types**:
  - `CreateUserData`: User creation data structure
  - `AccessRequest`: Access request object structure
  - `AccessRequestsResponse`: Paginated access requests response
  - `AccessRequestFilters`: Filter parameters for access requests
  - `ReviewData`: Review update data structure
- **Admin Headers**: Consistent admin ID generation matching `AuthContext`
- **API Path Helper**: `buildApiPath()` function for consistent API path construction

### Backend Implementation

#### Admin Users Blueprint (`backend/api/admin_users.py`)
- All endpoints protected with `@require_admin` decorator
- Pagination and filtering support
- Email uniqueness validation on update
- Proper error handling with `standard_error_response()`
- CamelCase serialization for API responses

#### Admin Config Blueprint (`backend/api/admin_config.py`)
- In-memory config store (uses environment variables as defaults)
- Cache duration validation (60-600 seconds)
- Proper error handling
- CamelCase serialization

#### Price Updates Status Endpoint (`backend/app.py`)
- Extracts last update times from cache
- Returns comprehensive status including libraries, data sources, endpoints
- Protected with `@require_admin` decorator

### Configuration Storage
- **Current Implementation**: In-memory dictionary (`PLATFORM_CONFIG` in `admin_config.py`)
- **Defaults**: Loaded from environment variables
- **Note**: In production, consider using database or config file for persistence

### Security Considerations
- All admin endpoints require `X-Admin-ID` header with valid UUID format
- Frontend verifies admin status before rendering Settings page
- Input validation on all update operations
- Email uniqueness check on user updates
- Cache duration bounds validation (60-600 seconds)
- SQL injection protection via SQLAlchemy ORM
- Rate limiting inherited from Flask-Limiter configuration

### Internationalization

#### Configuration
- **Library**: i18next 25.1.2 with react-i18next 15.5.1
- **Language Detection**: Browser language detection with localStorage persistence
- **Storage Key**: `i18nextLng` in localStorage
- **Fallback Language**: English (en)
- **Supported Languages**: English (en), Romanian (ro), Chinese (zh)
- **Debug Mode**: Enabled (logs missing translation keys)
- **Missing Key Handler**: Logs missing keys to console for development
- **Interpolation**: React-safe (escapeValue: false)

#### Translation Files
- **Location**: `src/i18n/locales/`
- **Files**: `en.ts`, `ro.ts`, `zh.ts`
- **Structure**: Flat object structure with nested keys for organization
- **Usage**: `useTranslation()` hook in components, `t('key')` function

#### Translation Keys
All UI text uses i18n translation keys. Key categories include:
- **Navigation**: `dashboard`, `market`, `portfolio`, `emissions`, `about`, `documentation`, `marketAnalysis`, `settings`, `profile`
- **Authentication**: `login`, `logout`, `username`, `password`, `authenticate`
- **KYC/Onboarding**: `onboarding`, `kycStatus`, `documentUpload`, `euEtsVerification`, `suitabilityAssessment`, `appropriatenessAssessment`
- **Admin**: `settings`, `userManagement`, `configuration`, `priceUpdateMonitoring`, `accessRequests`, `createUser`, `editUser`, `deleteUser`
- **Market**: `euaPrice`, `cerPrice`, `priceHistory`, `marketOffers`, `buy`, `sell`
- **Status**: `pending`, `inProgress`, `approved`, `rejected`, `notStarted`
- **Common**: `loading`, `error`, `success`, `cancel`, `submit`, `save`, `delete`, `edit`, `view`, `search`, `filter`

### UI/UX Features
- Tab-based navigation for main sections
- Responsive design with dark mode support
- Loading states for async operations
- Error and success notifications
- Confirmation dialogs for destructive actions
- Search and filter functionality
- Modal dialogs for detailed views and editing
- Auto-refresh for price update status (30 seconds)

## API Endpoints Summary

### Public Endpoints
- **POST** `/api/access-requests` - Create access request (no auth)
- **POST** `/api/kyc/register` - Start KYC onboarding (no auth, user_id in body)

### Price Endpoints (Public, Rate Limited)
- **GET** `/api/eua/price` - Get current EUA price
- **POST** `/api/eua/price/refresh` - Refresh EUA price
- **GET** `/api/cea/price` - Get current CEA price
- **GET** `/api/eua/history` - Get EUA historical data
- **GET** `/api/cea/history` - Get CEA historical data
- **GET** `/api/history/combined` - Get combined historical data

### User Endpoints (Requires Authentication)
- **POST** `/api/kyc/documents/upload` - Upload KYC documents
- **GET** `/api/kyc/documents` - List user documents
- **GET** `/api/kyc/documents/<id>/preview` - Preview document
- **DELETE** `/api/kyc/documents/<id>` - Delete document
- **POST** `/api/kyc/submit` - Submit KYC dossier
- **GET** `/api/kyc/status` - Get KYC status
- **POST** `/api/kyc/eu-ets-verify` - Verify EU ETS Registry
- **POST** `/api/kyc/suitability-assessment` - Submit suitability assessment
- **POST** `/api/kyc/appropriateness-assessment` - Submit appropriateness assessment
- **GET** `/api/kyc/workflow` - Get workflow status

### Admin Endpoints (Requires Admin Authentication)
- **GET** `/api/admin/users` - List users
- **POST** `/api/admin/users` - Create user
- **GET** `/api/admin/users/<id>` - Get user details
- **PUT** `/api/admin/users/<id>` - Update user
- **DELETE** `/api/admin/users/<id>` - Delete user
- **GET** `/api/admin/kyc/pending` - List pending KYC dossiers
- **GET** `/api/admin/kyc/<user_id>` - Get KYC details
- **POST** `/api/admin/kyc/<user_id>/approve` - Approve KYC
- **POST** `/api/admin/kyc/<user_id>/reject` - Reject KYC
- **POST** `/api/admin/kyc/<user_id>/request-update` - Request document update
- **POST** `/api/admin/kyc/<user_id>/verify-document/<doc_id>` - Verify document
- **POST** `/api/admin/kyc/<user_id>/sanctions-check` - Run sanctions check
- **POST** `/api/admin/kyc/<user_id>/set-risk-level` - Set risk level
- **GET** `/api/admin/access-requests` - List access requests
- **GET** `/api/admin/access-requests/<id>` - Get access request
- **POST** `/api/admin/access-requests/<id>/review` - Review access request
- **GET** `/api/admin/config` - Get platform config
- **PUT** `/api/admin/config` - Update platform config
- **GET** `/api/admin/config/price-updates` - Get price update config
- **GET** `/api/admin/price-updates/status` - Get price update status

### Health Check
- **GET** `/api/health` - Health check endpoint
- **GET** `/health` - Alternative health check (direct backend access)

## Important Notes

- Frontend development server **MUST** run on port **3000** (not 3001 or other ports)
- Backend API is proxied through `/api` path to avoid CORS issues
- HMR (Hot Module Replacement) uses WebSocket on the same port as the server
- CORS is enabled for cross-origin requests
- Dark mode class **MUST** be applied to `<html>` element (handled by ThemeContext)
- All new components **MUST** include dark mode variants for consistent UX
- Logo component **MUST** be used instead of direct image references to ensure theme consistency
- PDF update scripts **MUST** load configuration from `pdf_update_config.json` (single source of truth)
- PDF update scripts **MUST** validate configuration before processing
- Documentation page PDFs **MUST** be placed in `public/documentation/` directory for static serving
- Documentation page route **MUST** be protected with `ProtectedRoute` wrapper
- All document metadata **MUST** be defined in `src/data/documentation.ts` with proper i18n keys
- **SECRET_KEY** environment variable **MUST** be set in production (no default allowed)
- **CORS_ORIGINS** environment variable **MUST** be set in production to restrict allowed origins
- All KYC API endpoints **MUST** use `standard_error_response()` for consistent error formatting
- All API responses **MUST** use camelCase format via `to_dict(camel_case=True)` method
- File uploads **MUST** validate paths to prevent directory traversal attacks
- Rate limiting **MUST** be configured appropriately for production workloads
- The `/api/kyc/register` endpoint **MUST NOT** use `@require_auth` decorator (it's the initial onboarding step)
- All enum imports (e.g., `RiskLevel`, `KYCStatus`) **MUST** be explicitly imported when used
- Login page **MUST** use animated canvas backgrounds (background and ecology layers)
- Login page canvas animations **MUST** use separate `useRef` instances for each animation frame ID (`backgroundAnimationRef` and `ecologyAnimationRef`) to prevent memory leaks
- Login page **MUST** properly clean up animation loops on component unmount using `cancelAnimationFrame`
- Login page **MUST** redirect authenticated users to `/dashboard` automatically
- Login page modals **MUST** support Escape key to close and overlay click to close
- Login page error messages **MUST** include `role="alert"` for accessibility
- Access request API endpoint (`POST /api/access-requests`) **MUST** be public (no authentication required)
- Access request API **MUST** validate email format, sanitize inputs, and enforce length limits
- Access request API **MUST** require all fields: entity, contact, position, and reference (all are required)
- Access request model **MUST** include `position` field (VARCHAR(100), NOT NULL) and `reference` field (VARCHAR(100), NOT NULL)
- Access request model **MUST** use `to_dict(camel_case=True)` for API responses
- All access request API responses **MUST** use camelCase format for frontend compatibility
- Access request form **MUST** show confirmation screen before final submission, displaying all entered data
- Access request form **MUST** include info icons with tooltips on Entity, Contact, and Reference fields
- Access request form info icons **MUST** be keyboard accessible with ARIA labels and focus rings
- Database migration script **MUST** be run before deploying feature 0022 to add `position` column and make `reference` NOT NULL
- Historical data API endpoints **MUST** handle timezone-aware and timezone-naive dates correctly
- Historical data dates **MUST** be normalized to UTC timezone for consistent comparisons
- Historical data API responses **MUST** return dates in ISO 8601 format with UTC timezone (`+00:00`)
- Date filtering logic **MUST** use helper methods `_normalize_date_for_comparison()` and `_filter_data_by_date_range()` to ensure consistency
- Admin Settings page **MUST** verify user is admin (Victor) before rendering, redirecting non-admin users to dashboard
- Admin Settings page route (`/settings`) **MUST** be protected with `ProtectedRoute` wrapper
- All admin API endpoints **MUST** use `@require_admin` decorator and validate `X-Admin-ID` header
- Admin ID generation **MUST** be consistent between `AuthContext.tsx`, `adminService.ts`, and `init_db.py` (uses same UUID generation algorithm)
- UUID generation algorithm **MUST** match exactly across frontend and backend implementations to prevent admin access issues
- Database initialization (`init_db.py`) **MUST** detect UUID mismatches and provide clear warnings with actionable instructions
- User auto-creation in development mode **MUST** use `current_app.config.get('DEBUG', False)` (not `FLASK_ENV`) to check development mode
- Admin Settings page **MUST** use tab-based navigation (Headless UI) for four main sections: User Management, Configuration, Price Update Monitoring, Access Requests
- Admin access requests endpoints **MUST** use `@require_admin` decorator (not `@require_auth`)
- Access requests review endpoint **MUST** set `reviewed_by` field from `request.admin_id` (from `X-Admin-ID` header)
- Access requests management component **MUST** poll for new requests every 10 seconds
- Access requests management component **MUST** use debounced search (300ms delay) to reduce API calls
- User creation endpoint **MUST** hash password if provided, or generate random UUID hash if not provided (prevents login without password reset)
- User creation endpoint **MUST** set default values: `is_admin=False`, `kyc_status='PENDING'`, `risk_level='LOW'`
- User creation endpoint **MUST** validate email format and check for email/username uniqueness
- Profile page route (`/profile`) **MUST** use `OnboardingRoute` wrapper (not `ProtectedRoute`) to allow access even when onboarding hasn't started
- Dashboard price history chart **MUST** filter to show last 3 months by default (or all available if less than 3 months)
- Market offers **MUST** generate 18 CER offers and 15 EUA offers with price variations: CER 0.5-1.5 EUR above live price, EUA 1-2 EUR above live price
- Market offers **MUST** use weighted volume distribution: 30% small volumes (CER 500-2000, EUA 200-1000), 40% medium volumes (CER 2000-6000, EUA 1000-3500), 30% large volumes (CER 8000-15000, EUA 5000-10000)
- Market offers **MUST** ensure the first (best) offer matches live price exactly
- Onboarding page **MUST** handle 404 errors gracefully as "not started" state, not as errors
- KYC status API endpoint (`GET /api/kyc/status`) **MUST** return 404 when user hasn't started onboarding (not 500 or other error codes)
- Production frontend build (`co2-trading-app`) **MUST** use `VITE_BACKEND_API_URL=/api` build arg to enable nginx proxy
- Nginx proxy configuration **MUST** proxy `/api/*` requests to `http://backend:5000` (Docker service name)
- Nginx proxy **MUST** set proper proxy headers (X-Real-IP, X-Forwarded-For, X-Forwarded-Proto, Host)
- Nginx proxy **MUST** configure timeouts (connect: 60s, send: 60s, read: 60s) for better error handling
- Nginx proxy **MUST** set `client_max_body_size 16M` to support file uploads matching backend limit
- Nginx proxy **MUST NOT** add duplicate CORS headers in `/api` location block (backend Flask-CORS handles CORS)
- Frontend services **MUST** use relative URL `/api` in production (not absolute URLs like `http://localhost:5001`)
- Document upload component **MUST** display all uploaded documents per category, not just the most recent one
- Document upload component **MUST** keep upload area visible even after documents are uploaded to allow multiple uploads
- Company registration certificates **MUST** accept all allowed file types (PDF, PNG, JPG, JPEG), not restricted to PDF only
- Multiple documents per document type **MUST** be supported (no unique constraint on `(user_id, document_type)` in database)
- Price update endpoints (`/api/eua/price`, `/api/eua/price/refresh`) **MUST** include `source` field in response to track which data source provided the price
- Source price history **MUST** be updated whenever a price is fetched via `update_source_price_history()` function
- Price update status endpoint (`/api/admin/price-updates/status`) **MUST** include `lastSource`, `lastPrice`, and `sourcePrices` array in EUA section
- Source names **MUST** match exactly between `scraper.py` source_map, `app.py` source_price_history keys, and frontend display
- Onboarding page **MUST** allow free navigation between all steps without blocking on document upload requirements
- Onboarding page **MUST** provide document upload functionality on all steps via collapsible `DocumentUploadSection` component
- Onboarding page **MUST** maintain per-step expand/collapse state for document upload section using `Map<WorkflowStep, boolean>`
- Onboarding page **MUST** reload documents only when `kycData` changes, not on every step change (optimized to reduce API calls)
- Onboarding stepper **MUST** allow clicking on any step to navigate directly to it (no sequential restriction)
- Onboarding final submission **MUST** be the only place where document validation blocks the user (submit button disabled if documents missing)
- All page components **MUST** use `lazyWithRetry()` wrapper for code splitting with error recovery
- Error Boundary **MUST** handle chunk loading errors gracefully with automatic retry
- Rate limiting **MUST** use different limits for development (5000/day, 1000/hour) vs production (200/day, 50/hour)
- Background scheduler **MUST** run price updates every 1 minute via APScheduler
- Price cache **MUST** be 2 minutes (120 seconds) for both EUA and CEA prices
- Source tracking **MUST** update `source_price_history` whenever a price is fetched
- Market offers **MUST** sync automatically when live prices update via `MarketOffersSync` component
- i18n debug mode **MUST** log missing translation keys to console for development
- Context providers **MUST** be nested in correct order: ThemeProvider → AuthProvider → CertificateProvider → StatsProvider
- All API services **MUST** use relative URLs (`/api`) in production, not absolute URLs
- Chunk loading errors **MUST** trigger automatic page reload after 1 second delay
- Error Boundary **MUST** catch React errors and chunk loading failures separately

