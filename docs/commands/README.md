# 🤖 Cursor Auto-Pilot Workflow System

Sistem automat de development workflow pentru Cursor. **Un singur command, zero intervenție.**

## 🚀 Quick Start

```bash
# Pune folderul în proiectul tău
cp -r commands/ docs/commands/

# În Cursor, pentru un feature complet:
@commands/auto Add user authentication with OAuth2

# Pentru fix-uri rapide:
@commands/quick fix the login button alignment
```

## 📋 Commands

### Primary Commands (Auto-Pilot)

| Command | Timp | Descriere |
|---------|------|-----------|
| `@auto [task]` | 1-5 min | **Full workflow automat** - plan, implement, test, docs, commit |
| `@quick [task]` | 10-30s | **Fast mode** - implement direct fără overhead |

### Manual Commands (Control Total)

| Command | Descriere |
|---------|-----------|
| `@orchestrator` | Analizează proiectul, sugerează ce să faci |
| `@plan [task]` | Creează doar planul |
| `@validate` | Validează un plan existent |
| `@review` | Code review pe schimbări |
| `@fix` | Fix issues din review |
| `@test` | Scrie teste |
| `@docs` | Scrie documentație |
| `@precommit` | Verificări finale |

### Utility Commands

| Command | Descriere |
|---------|-----------|
| `@debug [issue]` | Debugging sistematic |
| `@hotfix [issue]` | Fix urgent producție |
| `@refactor` | Îmbunătățește cod fără schimbare comportament |
| `@health` | Project health check |
| `@brief` | Creează app-truth.md |
| `@interface` | Creează componente UI |

## 🔄 Auto-Pilot Workflow

```
@auto "Add dark mode"
         │
         ▼
    ┌─────────┐
    │ ANALYZE │ → Citește app-truth.md, înțelege contextul
    └────┬────┘
         ▼
    ┌─────────┐
    │  PLAN   │ → Creează plan detaliat (auto-validat)
    └────┬────┘
         ▼
    ┌─────────┐
    │IMPLEMENT│ → Scrie codul, fix lint errors
    └────┬────┘
         ▼
    ┌─────────┐
    │ REVIEW  │ → Self-review, fix issues (loop max 3x)
    └────┬────┘
         ▼
    ┌─────────┐
    │  TEST   │ → Scrie și rulează teste
    └────┬────┘
         ▼
    ┌─────────┐
    │  DOCS   │ → Update documentație
    └────┬────┘
         ▼
    ┌─────────┐
    │ COMMIT  │ → Pre-commit checks, generează mesaj
    └────┬────┘
         ▼
    ✅ DONE
```

## ⚡ Quick Mode Workflow

```
@quick "fix button color"
         │
         ▼
    ┌─────────┐
    │ ANALYZE │ → Quick analysis
    └────┬────┘
         ▼
    ┌─────────┐
    │IMPLEMENT│ → Direct implementation
    └────┬────┘
         ▼
    ┌─────────┐
    │ VERIFY  │ → Lint + Types + Build
    └────┬────┘
         ▼
    ✅ DONE
```

## 📁 Files Generated

```
docs/
├── commands/           # Aceste comenzi
│   ├── auto.md         # 🤖 Auto-pilot
│   ├── quick.md        # ⚡ Quick mode
│   ├── orchestrator.md # 🎯 Manual orchestrator
│   └── ...             # Alte comenzi
├── features/           # Feature documentation
│   ├── 0001_PLAN.md
│   ├── 0001_REVIEW.md
│   └── ...
└── workflow-state.json # Current workflow state
```

## 🎯 Choosing the Right Command

```
                    ┌─────────────────┐
                    │  Ce tip de task? │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌─────────┐    ┌─────────┐    ┌─────────┐
        │ Feature │    │Bug/Fix  │    │Emergency│
        │   Nou   │    │  Mic    │    │Production│
        └────┬────┘    └────┬────┘    └────┬────┘
             │              │              │
             ▼              ▼              ▼
        ┌─────────┐    ┌─────────┐    ┌─────────┐
        │ @auto   │    │ @quick  │    │ @hotfix │
        └─────────┘    └─────────┘    └─────────┘
```

## 🔧 Setup

### 1. Copy Commands
```bash
cp -r commands/ your-project/docs/commands/
```

### 2. Create app-truth.md
```bash
# În Cursor:
@commands/brief
```

### 3. (Optional) Add .cursorrules
```bash
cp commands/.cursorrules your-project/.cursorrules
```

## 💡 Tips

### Pentru cele mai bune rezultate:

1. **Fii specific în task description:**
   ```
   # Bun
   @auto Add OAuth2 login with Google provider, store tokens in httpOnly cookies
   
   # Mai puțin bun
   @auto Add login
   ```

2. **Folosește @quick pentru iterații:**
   ```
   @auto Add user profile page      # Prima dată
   @quick fix avatar upload         # Iterații
   @quick add bio field             # Iterații
   ```

3. **Verifică starea dacă ceva nu merge:**
   ```
   # Vezi unde a rămas workflow-ul
   cat docs/workflow-state.json
   
   # Continuă de unde a rămas
   @continue
   ```

## 🚨 Error Handling

### Auto-recoverable:
- Lint errors → auto-fix
- Type errors → auto-fix
- Failed tests → debug & retry (3x)

### Manual intervention:
- Build complet broken
- Circular dependencies
- Security vulnerabilities

### Resume after manual fix:
```
@continue
```

## 📊 Timing Estimates

| Task Type | @auto | @quick |
|-----------|-------|--------|
| Small fix | 30-60s | 10-20s |
| UI component | 2-3 min | 30-60s |
| API endpoint | 2-4 min | 1-2 min |
| Full feature | 3-5 min | N/A |

## 🔄 Version History

- **v2.0** - Auto-pilot mode, quick mode, state tracking
- **v1.0** - Manual orchestrator workflow

---

**Made for maximum efficiency in Cursor.**
