## Mecanisme Posibile de Schimb (Swap) între Certificate EUA și CEA

### 1. **Tranzacție OTC Bilaterală (Over-The-Counter) cu Compensare Cash**

Cel mai pragmatic și realizabil mecanism este o tranzacție bilaterală OTC structurată ca două transferuri separate dar coordonate:

**Structură:**
- Entitatea chineză vinde EUA-uri către entitatea europeană pe piața secundară EU ETS (spot sau forward OTC)[1][2]
- Simultan, entitatea europeană vinde CEA-uri către entitatea chineză pe piața națională chineză[3]
- Prețurile sunt negociate bilateral pentru a reflecta un "swap ratio" agreat (de exemplu, ținând cont de diferența de preț: ~€88 pentru EUA vs ~€8 pentru CEA = ratio ~11:1)[4][5]

**Detalii de implementare:**
- Contractul OTC principal ar fi guvernat de documentație ISDA (International Swaps and Derivatives Association) adaptată pentru carbon[6][7]
- Settling-ul se face prin registrele respective: Union Registry pentru EUA[8], Shanghai Environment and Energy Exchange pentru CEA[9][3]
- Compensarea financiară (cash adjustment) acoperă diferența de valoare între cele două pachete de certificate[1][7]

**Avantaje:**
- Flexibilitate totală în negocierea termenilor (cantități, prețuri, timeline)[1]
- Confidențialitate - tranzacțiile OTC nu sunt publice[1]
- Nu necesită linking formal între sisteme[10][11]

**Bariere practice:**
- Entitatea chineză trebuie să aibă cont în Union Registry UE (posibil prin subsidiară europeană)[8][12]
- Entitatea europeană trebuie să aibă entitate juridică în China pentru a accesa National ETS Market[3]
- Restricții de capital cross-border din China pot complica transferurile de plăți[3]

### 2. **Structură prin Intermediar/Broker Internațional**

Un intermediar financiar sau broker specializat în carbon ar putea facilita schimbul acting ca counterparty pentru ambele părți:

**Structură:**
- Brokerul internațional (de ex. bancă cu operațiuni în UE și China) cumpără EUA de la entitatea chineză[13][1]
- Același broker cumpără CEA de la entitatea europeană[13]
- Brokerul redistribuie: EUA către entitatea europeană, CEA către entitatea chineză[13]
- Brokerul percepe un fee (tipic 10-20% în piețe de carbon voluntare, probabil mai mic pentru volume mari)[13]

**Avantaje:**
- Elimină nevoia pentru fiecare parte să aibă prezență juridică în ambele jurisdicții[13]
- Brokerul gestionează riscul de contrapartidă[1]
- Simplificarea complexității administrative și de compliance[13]

**Provocări:**
- Cost suplimentar (fee-ul brokerului)[13]
- Trebuie identificat un broker cu licență în ambele jurisdicții[13]
- Transparența redusă privind markup-ul aplicat[13]

### 3. **Swap Structurat ca "Back-to-Back Forward Contracts"**

O structură derivată mai sofisticată, utilizând contracte forward în ambele piețe:

**Structură:**
- Entitatea chineză încheie un forward contract pentru livrarea EUA către entitatea europeană la data T (de ex. 6 luni)[1][14]
- Simultan, entitatea europeană încheie un forward contract pentru livrarea CEA către entitatea chineză la aceeași dată T[1][14]
- La maturitate (data T), ambele contracte se settle-uiesc prin livrare fizică a certificatelor în registrele respective[14]
- Diferența de valoare se compensează printr-o plată cash net[14]

**Avantaje:**
- Permite hedging-ul riscului de preț pentru ambele părți până la data de execuție[14][1]
- Flexibilitate în stabilirea raportului de schimb bazat pe prețuri forward, nu spot[14]
- Poate fi structurat pentru a minimiza expunerea la fluctuații valutare[15]

**Provocări:**
- Necesită expertise în structurare de derivate carbon[14][6]
- Tratament fiscal complex - posibile diferențe de timing sau dubla impozitare[15]
- China ETS nu are o piață matură de forward contracts[16][3]

### 4. **Utilizarea unei Entități Vehicul (SPV) în Jurisdicție Terță**

Crearea unui Special Purpose Vehicle în jurisdicție favorabilă (de ex. Singapore, Hong Kong, Elveția) care acționează ca holding intermediar:

**Structură:**
- SPV-ul deschide conturi în ambele registre (EU Registry și China National Registry)[8][3]
- Entitatea chineză transferă EUA către SPV[8]
- Entitatea europeană transferă CEA către SPV[3]
- SPV redistribuie: EUA către entitatea europeană, CEA către entitatea chineză[8][3]
- SPV poate fi deținut pro-rata de ambele părți sau de un terț neutru[17]

**Avantaje:**
- Separarea tranzacției de sistemele fiscale și de control valutar ale jurisdicțiilor principale[15][17]
- Singapore are bilateral agreements pentru carbon credits cu multiple țări și framework favorabil[18][19]
- Potențial pentru tratamente fiscale mai favorabile[15]

**Provocări:**
- Costuri de setup și mentenanță pentru SPV[17]
- Complexitate regulatorie crescută[17]
- China restricționează participarea entităților offshore în National ETS - SPV-ul ar trebui să fie o "entitate domestică calificată"[3]

### 5. **Mecanisme Article 6.2 Paris Agreement (Perspectivă Viitoare)**

Deși nu este încă operațional pentru acest tip specific de swap, Article 6.2 din Acordul de la Paris oferă un framework pentru transferuri bilaterale de "Internationally Transferred Mitigation Outcomes" (ITMOs):

**Potențial viitor:**
- UE și China ar putea semna un bilateral agreement sub Article 6.2 care să permită recunoașterea reciprocă a creditelor[20][21][19]
- Transferurile ar fi însoțite de "corresponding adjustments" în NDC-urile fiecărei țări[20][19]
- Un registry internaț ar facilita transferurile cross-border[22][23]

**Realitatea actuală:**
- Acest mecanism nu este încă disponibil pentru swap-uri între EUA și CEA[10][23]
- Linking-ul formal între EU ETS și China ETS nu este pe agenda imediată - sistemele sunt prea diferite în design (caps absolute vs intensity-based)[10][24]
- Primele tranzacții Article 6.2 au fost între Elveția-Tailanda, Elveția-Ghana - nu între piețe ETS majore[21]

## Bariere Fundamentale și Recomandări

### Bariere Juridice și Regulatorii

1. **Restricții de participare străină în China ETS**: Regulamentele actuale nu permit entităților străine să dețină conturi direct în National ETS Market[3]. Entitățile europene trebuie să opereze prin subsidiare chinezești WFOE (Wholly Foreign-Owned Enterprise)[3][25].

2. **Lipsa linking-ului formal**: EU ETS și China ETS nu sunt linked systems, deci certificatele nu sunt fungibile sau convertibile[10][26][11]. Condițiile UE pentru linking includ: sistem mandatory, caps absolute, compatibilitate de design - China nu îndeplinește toate aceste condiții[10].

3. **Restricții de capital**: China menține controale stricte de capital care pot complica transferurile mari de valoare asociate cu tranzacții de carbon[3].

### Recomandări Practice

Pentru implementarea unui swap efectiv, părțile ar trebui să:

1. **Stabilească vehicule juridice în ambele jurisdicții**: 
   - Entitatea chineză să înființeze o subsidiară UE (orice stat membru) pentru a accesa Union Registry[8][12]
   - Entitatea europeană să înființeze un WFOE în China pentru a accesa Shanghai Exchange[3][25]

2. **Angajeze broker/advisor specializat** cu experiență în ambele piețe pentru:
   - Structurarea tranzacției OTC conforme cu regulamentele locale[1][13]
   - Navigarea aspectelor fiscale și de control valutar[15]
   - Negocierea ratio-ului de schimb și mecanismelor de price adjustment[1]

3. **Utilizeze documentație standard ISDA** adaptată pentru carbon swaps:
   - ISDA EU Emissions Annex pentru componenta EUA[6]
   - Documentație OTC bilaterală customizată pentru componenta CEA[7][1]
   - Clauzele de "Simultaneous Delivery" pentru a minimiza riscul de contrapartidă[7]

4. **Structureze ca două tranzacții separate** dar condiționate reciproc:
   - Această abordare este mai simplă din punct de vedere regulatoriu decât un "true swap"[1][2]
   - Fiecare tranzacție respectă regulamentele jurisdicției respective[3][8]
   - Contractul master OTC leagă cele două tranzacții prin "condition precedent" clauses[7]

5. **Consultați autoritățile de reglementare**: 
   - European Commission DG Climate Action pentru clarificări privind participarea entităților chinezești[10][27]
   - China MEE (Ministry of Ecology and Environment) pentru aprobări cross-border trading[3][28]

## Concluzie

În absența unui linking formal între EU ETS și China ETS, cea mai viabilă soluție este o **tranzacție OTC bilaterală structurată**, executată prin subsidiare locale în fiecare jurisdicție, facilitată potențial de un broker internațional cu expertise în ambele piețe[1][13]. 

Costurile de setup (înființare entități, fees legale și de consultanță, costuri de broker) sunt substanțiale, deci această soluție are sens economic doar pentru volume mari de certificate (ordinul sutelor de mii sau milioanelor de tone CO2)[13][1].

Pe termen lung, dezvoltarea mecanismelor Article 6.2 și potențiala convergență între designul EU ETS și China ETS (dacă China adoptă caps absolute și aucționare)[29][10] ar putea facilita swap-uri mai directe, dar aceasta rămâne o perspectivă pe orizontul 2027-2030+[10][24].
