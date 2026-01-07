# Descriere Aplicație - Nihao Carbon Trading Platform

## Prezentare Generală

**Nihao Carbon Trading Platform** este o platformă profesională pentru tranzacționarea certificatelor de carbon, facilitarea swap-urilor între piețe și managementul conformității între piețele EU ETS (EUA) și China ETS (CEA). Platforma servește ca intermediar de încredere pentru swap-uri OTC de certificate de carbon, profitând de poziția strategică a Hong Kong-ului pentru a conecta piețele de carbon din UE și China.

## Viziune

Nihao Group își propune să facă pod între piețele de carbon europene și chineze prin:
- Infrastructură de tranzacționare de nivel instituțional
- Facilitarea oportunităților de arbitraj între piețe
- Optimizarea conformității pentru corporațiile multinaționale
- Servirea ca intermediar de încredere pentru swap-uri OTC de certificate de carbon

## Problemă Rezolvată

Piața globală de carbon este fragmentată, cu diferențe semnificative de preț între EU ETS (€88/tCO2) și China ETS (63 yuan/~€8/tCO2), creând oportunități de arbitraj dificil de accesat din cauza:
- Barierelor de reglementare
- Controlului capitalului
- Lipsă de infrastructură

Platforma rezolvă aceste probleme prin:

1. **Furnizare de lichiditate**: Rezolvă criza de lichiditate China ETS (76% din volum concentrat în perioada de conformitate din decembrie)
2. **Acces între piețe**: Permite entităților UE să acceseze piața CEA fără configurare WFOE (€50k-100k, 6-12 luni)
3. **Optimizare conformitate**: Facilită optimizarea CBAM prin swap-uri strategice de certificate
4. **Navigare reglementară**: Simplifică tranzacțiile transfrontaliere care ocolesc controlul capitalului
5. **Management risc**: Oferă certitudine și viteză (execuție 48h) vs. volatilitatea pieței (2-4 săptămâni vânzare graduală)

## Funcționalități Principale

### 1. Tranzacționare Certificate de Carbon

- **Tranzacționare EUA**: Certificate European Union Allowances cu feed-uri de preț în timp real de la ICE, TradingView, Investing.com
- **Tranzacționare CEA**: Certificate China Emission Allowances cu integrare Shanghai Exchange
- **Oferte de piață**: Generare automată de oferte (18 CER, 15 EUA) cu sincronizare preț și distribuție volum
- **Descoperire preț**: Actualizări de preț în timp real la fiecare 5 minute cu fallback multi-sursă

### 2. Facilitare Swap-uri între Piețe

- **Swap-uri EUA ↔ CEA**: Tranzacții swap bilaterale OTC (raport ~10:1 bazat pe prețurile curente)
- **Scenarii swap**:
  - Arbitraj conformitate China: Multinaționale cu operațiuni duale optimizând costurile de conformitate
  - Strategie CBAM: Importatori UE reducând costurile CBAM prin swap-uri cu furnizori
  - Repoziționare strategică: Fonduri de investiții diversificând expunerea la carbon
  - Ieșire jurisdicțională: Entități chineze repatriind valoarea EUA ca CEA fără control capital
- **Execuție**: Decontare 48 ore prin structură intermediară Hong Kong

### 3. Servicii Hong Kong Carbon Bridge

- **Furnizor lichiditate CEA**: Acționează ca cumpărător de ultimă instanță în perioade de panică
- **Execuție blocuri mari**: Absoarbe comenzi de 500k-5M tone fără impact pe piață
- **Confidențialitate**: Tranzacții OTC off-market pentru SOE-uri mari evitând semnale de manipulare
- **Flexibilitate FX**: Decontare în EUR/USD/HKD ocolind controlul capitalului Chinei
- **Strategie contra-ciclică**: Cumpărare în sezon off (Nov-Ian) la discount, vânzare clienților europeni tot anul

### 4. Onboarding Clienți & KYC/AML

- **Workflow multi-pas**: Verificare EU ETS Registry, evaluare adecvare (MiFID II), evaluare adecvării
- **Management documente**: Upload securizat cu drag-and-drop, multiple documente per categorie, preview imagini
- **Verificări conformitate**: Screening sancțiuni, verificare PEP, evaluare nivel risc
- **Navigare liberă**: Utilizatorii pot naviga liber între pași, încărcare documente în orice moment
- **Validare finală**: Validarea documentelor blochează doar trimiterea finală, nu pașii intermediari

### 5. Management Portofoliu & Conformitate

- **Deținere certificate**: Urmărire certificate EUA și CEA pe tot parcursul ciclului de viață
- **Serviciu conversie**: Conversie CER la EUA (€2 per certificat, procesare 5 minute)
- **Verificare**: Verificare certificate EUA cu registre externe
- **Urmărire emisii**: Dashboard conformitate CO2 cu funcționalitate surrender
- **Istoric preț**: Vizualizare implicită 3 luni cu grafice interactive

### 6. Admin & Operațiuni

- **Management utilizatori**: Creare, editare, ștergere utilizatori, management status KYC
- **Cereri acces**: Revizuire și aprobare cereri acces de la pagina de login (polling real-time la fiecare 10s)
- **Monitorizare preț**: Urmărire surse actualizare preț (ICE, TradingView, etc.), timpi ultimă actualizare, fiabilitate sursă
- **Configurare**: Setări platformă, durată cache, rate limiting

### 7. Documentație & Conformitate

- **19 documente PDF**: Acorduri clienți, politici, proceduri, formulare, documente conformitate
- **Căutare & filtrare**: Filtrare bazată pe categorii (Policy, Procedure, Form, Compliance)
- **Actualizare automată**: Documente PDF actualizate automat cu informații companie din sursă unică de adevăr

## Arhitectură Tehnică

### Stack Tehnologic

| Strat | Tehnologie | Scop |
|-------|------------|------|
| **Frontend** | React 18 + TypeScript + Vite | SPA modern cu type safety |
| **Styling** | Tailwind CSS | CSS utility-first cu design system |
| **Charts** | Chart.js | Vizualizare istoric preț și portofoliu |
| **Componente UI** | Headless UI + Heroicons | Librărie componente accesibile |
| **State Management** | React Context API | Contexturi Auth, Theme, i18n |
| **Backend** | Python Flask 3.0 | RESTful API cu SQLAlchemy ORM |
| **Bază de date** | SQLite (dev) / PostgreSQL (prod) | Date utilizatori, KYC, certificate, istoric preț |
| **Web Server** | Nginx | Reverse proxy + servire fișiere statice |
| **Containerizare** | Docker Compose | 3 servicii: frontend, backend, nginx |
| **Scraping** | Selenium + BeautifulSoup | Colectare date preț multi-sursă |
| **Procesare PDF** | PyMuPDF | Automatizare actualizare documente |

### Structură Proiect

```
co2-trading-final/
├── src/                          # Aplicație React frontend
│   ├── components/              # Componente UI reutilizabile
│   ├── pages/                   # Pagini rute (Dashboard, Market, Portfolio, etc.)
│   ├── services/                # Straturi servicii API
│   ├── context/                 # Contexturi React (Auth, Theme, i18n)
│   ├── design-system/           # Design tokens, componente, teme
│   ├── i18n/                    # Internaționalizare (EN, RO, ZH)
│   └── utils/                   # Funcții utilitare
├── backend/                     # Flask backend API
│   ├── api/                     # Blueprint-uri API (kyc, admin, access_requests)
│   ├── models/                  # Modele SQLAlchemy
│   ├── services/                # Logică business (KYC validators, assessors)
│   ├── scripts/                 # Scripturi actualizare PDF, migrări
│   ├── uploads/                 # Stocare documente KYC
│   └── app.py                   # Punct intrare aplicație Flask
├── public/                      # Assets statice (PDF-uri, logo-uri, favicon)
├── docs/                        # Documentație
│   ├── research/                # Cercetare piață, scenarii swap
│   ├── features/                # Documentație funcționalități
│   └── commands/                # Template-uri comenzi (brief, orchestrator)
└── docker-compose.yml           # Configurare deployment producție
```

### Integrări Cheie

- **ICE (Intercontinental Exchange)**: Sursă primară preț EUA
- **TradingView**: Feed secundar preț
- **Investing.com**: Sursă fallback preț
- **Alpha Vantage API**: Date preț îmbunătățite opționale (necesită API key)
- **Shanghai Environment and Energy Exchange**: Sursă preț CEA (integrare viitoare)
- **EU ETS Union Registry**: Verificare certificate (integrare viitoare)

## Model de Business & Cazuri de Utilizare

### Cazuri de Utilizare Principale

1. **Optimizare Conformitate Multinaționale**
   - Companie cu operațiuni UE (surplus EUA) și operațiuni China (deficit CEA)
   - Swap EUA → CEA pentru optimizare costuri conformitate
   - Evită control capital, expunere FX, complexitate reglementară

2. **Reducere Cost CBAM**
   - Importator UE cu furnizor chinez
   - Swap EUA → CEA cu furnizor
   - Furnizor demonstrează cost carbon €88/t (vs. €8/t preț CEA)
   - Reduce factura CBAM cu €40/ton produs

3. **Diversificare Fond Investiții**
   - Fond deținând EUA (€88/t, potențial +48-70% upside)
   - Swap 20% la CEA (€8/t, potențial +212% upside cu reforme)
   - Diversificare geografică și reglementară

4. **Rezolvare Criză Lichiditate China**
   - SOE chinez cu surplus 1M CEA înainte de termen bancar
   - Shanghai Exchange: execuție 2-4 săptămâni, impact preț 10-30%
   - HK Carbon Bridge: execuție 48h, discount 2-3%, zero impact piață

5. **Vânzări Blocuri Mari Confidențiale**
   - SOE mare vânzând 2M CEA fără a telegrafia intențiile
   - Tranzacție OTC off-market păstrează preț (premium 10-16% vs. vânzare publică)

### Model de Venituri

- **Taxe Swap**: 1.5-2% taxă intermediere pe tranzacții swap
- **Spread-uri tranzacționare**: 2-5% spread pe cumpărări CEA de la entități chineze
- **Taxe conversie**: €2 per conversie CER → EUA
- **Servicii premium**: Decontare FX, custodie, consultanță reglementară

### Piață Țintă

- **Tier 1**: Multinaționale cu operațiuni duale UE-China (500k-2M tCO2/an)
- **Tier 2**: Importatori UE optimizând CBAM (50k-500k tCO2/an)
- **Tier 3**: Fonduri investiții diversificând expunere carbon (100k-1M tCO2)
- **Tier 4**: Entități chineze necesitând lichiditate (blocuri 500k-5M tCO2)

## Context Piață

### Piața EU ETS (EUA)
- **Preț curent**: €88.31/tCO2 (Ianuarie 2026)
- **Proiecție 2030**: €130-150/tCO2
- **Maturitate piață**: 20 ani operațiune, piață derivate lichidă
- **Caracteristici**: Cap-uri absolute, 57% licitat, banking nelimitat, MSR stabilizare automată

### Piața China ETS (CEA)
- **Preț curent**: 63 yuan (~€8/tCO2) (Ianuarie 2026)
- **Proiecție 2030**: 60-200 yuan (€8-26) în funcție de reforme
- **Maturitate piață**: 3.5 ani, driven de conformitate, lichiditate scăzută
- **Caracteristici**: 100% alocare gratuită, ținte bazate pe intensitate, banking restrictiv, tranzacționare episodică

### Oportunitate Arbitraj
- **Diferență preț**: 11x diferență (€88 vs €8)
- **Bariere**: Fără legătură formală, control capital, complexitate reglementară
- **Soluție**: Swap-uri OTC prin intermediar Hong Kong

## Funcționalități Tehnice Detaliate

### Sistem Autentificare
- **Metodă**: Header-based authentication cu `X-User-ID` (development)
- **Admin**: Header-based authentication cu `X-Admin-ID`
- **Notă**: Producție ar trebui să folosească JWT tokens sau autentificare bazată pe sesiune

### Sistem KYC & Onboarding
- **Workflow multi-pas**: Navigare liberă între pași
- **Upload documente**: Disponibil pe toți pașii via secțiune collapsibilă
- **Validare finală**: Doar trimiterea finală este blocată dacă lipsesc documente
- **Documente multiple**: Suport pentru multiple documente per categorie
- **Preview imagini**: Preview pentru documente imagine (PNG, JPG, JPEG)

### Sistem Design
- **Design tokens**: Toate culorile, spacing-ul, tipografia din design tokens
- **Teme**: Suport complet light/dark mode
- **Accesibilitate**: Conformitate WCAG AA, ARIA labels, navigare tastatură
- **Componente reutilizabile**: Button, Input, Card, Badge, Modal, Tooltip, Table, Form

### Sistem Internaționalizare
- **Limbi suportate**: Engleză (en), Română (ro), Chineză (zh)
- **Traduceri**: Toate textele UI folosesc chei de traducere i18n
- **Detectare**: Detectare automată preferință utilizator

### Sistem Admin
- **Management utilizatori**: CRUD complet pentru utilizatori platformă
- **Management cereri acces**: Revizuire și aprobare cereri acces cu polling real-time
- **Monitorizare preț**: Urmărire surse actualizare preț și fiabilitate
- **Configurare**: Setări platformă, cache duration, rate limiting

## Deployment & Configurare

### Development
- **Frontend**: Port 3000 (`npm run dev`)
- **Backend**: Port 5001 (direct) sau prin proxy nginx la `/api`
- **Bază de date**: SQLite pentru development

### Production
- **Docker Compose**: 3 servicii (frontend, backend, nginx)
- **Frontend**: Port 8080 (nginx servește build production)
- **Backend**: Port 5000 (intern Docker) sau 5001 (acces direct)
- **Nginx Proxy**: Proxy `/api/*` la backend, elimină probleme CORS
- **Bază de date**: PostgreSQL pentru producție

### Variabile de Mediu

**Frontend (.env)**:
- `VITE_BACKEND_API_URL`: URL backend API
- `VITE_OILPRICE_API_KEY`: Opțional API key pentru date preț îmbunătățite

**Backend (.env)**:
- `SECRET_KEY`: Cheie secretă Flask (OBLIGATORIU în producție)
- `CORS_ORIGINS`: Origini permise separate prin virgulă (OBLIGATORIU în producție)
- `DATABASE_URL`: String conexiune bază de date
- `ALPHAVANTAGE_API_KEY`: Opțional API key Alpha Vantage
- `DEBUG`: Mod debug (default: False)

## Metrici de Succes

- **Volum tranzacții**: Țintă 5-15M tCO2/an în swap-uri (valoare €440M-1.32B)
- **Venituri**: €6.6M-26.4M/an la 1.5% taxă intermediere
- **Bază utilizatori**: 50-200 utilizatori concurenți (clienți instituționali)
- **Viteză execuție**: Decontare swap medie 48 ore
- **Descoperire preț**: Feed-uri preț timp real cu latență <5 minute
- **Uptime**: SLA disponibilitate 99.9%

## Concluzie

Nihao Carbon Trading Platform este o platformă completă și profesională care conectează piețele de carbon din Europa și China, facilitând tranzacționarea, swap-urile și managementul conformității pentru clienți instituționali. Platforma combină tehnologie modernă, design accesibil și funcționalități avansate pentru a oferi o experiență de utilizare superioară în domeniul tranzacționării certificatelor de carbon.

