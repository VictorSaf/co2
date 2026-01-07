---
description: AUTO-PILOT - Rulează întregul workflow automat până la commit
globs: 
alwaysApply: false
---

# 🤖 AUTO-PILOT MODE

Tu ești Meta-Orchestratorul. Primești UN SINGUR TASK și îl duci până la COMMIT fără intervenție umană.

## REGULI ABSOLUTE

1. **NU CERE CONFIRMARE** - Execută direct
2. **NU TE OPRI** între pași - continuă automat
3. **RAPORTEAZĂ DOAR** la erori critice sau la final
4. **SALVEAZĂ STAREA** după fiecare pas în `docs/workflow-state.json`

## WORKFLOW AUTOMAT

```text
TASK INPUT
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 1: FOUNDATION                                     │
│  ────────────────────                                    │
│  1. Check app-truth.md → dacă lipsește, CREEAZĂ-L        │
│     folosind template extins din docs/commands/brief.md  │
│     (include business model, market context, use cases   │
│     din docs/research/)                                  │
│  2. Determină feature number (ultimul + 1)               │
│  3. Creează docs/features/XXXX_STATE.json               │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 2: PLANNING                                       │
│  ────────────────────                                    │
│  1. Creează XXXX_PLAN.md                                │
│  2. Auto-validează planul                                │
│  3. Dacă invalid → REVIZUIEȘTE și re-validează          │
│  4. Max 3 iterații, apoi raportează                      │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 3: IMPLEMENTATION                                 │
│  ────────────────────────                                │
│  1. Implementează conform planului                       │
│  2. Rulează linter → fix automat                        │
│  3. Verifică că codul compilează                        │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 4: QUALITY LOOP                                   │
│  ──────────────────────                                  │
│  1. Self-review codul                                    │
│  2. Fix issues găsite                                   │
│  3. Repeat până APPROVED (max 3 iterații)               │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 5: TESTING                                        │
│  ───────────────────                                     │
│  1. Scrie teste pentru codul nou                        │
│  2. Rulează testele                                      │
│  3. Dacă fail → debug & fix → re-test                   │
│  4. Max 3 iterații                                       │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 6: DOCUMENTATION                                  │
│  ─────────────────────────                               │
│  1. Update docs pentru feature                          │
│  2. Update app-truth.md dacă e cazul                    │
│     (conform structurii din brief.md cu business model) │
│  3. Generează CHANGELOG entry                           │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 7: PRE-COMMIT                                     │
│  ──────────────────────                                  │
│  1. Final checks (lint, types, tests)                   │
│  2. Remove debug code                                    │
│  3. Generează commit message                            │
└─────────────────────────────────────────────────────────┘
    │
    ▼
  ✅ DONE - Raport final
```

## STATE TRACKING

Creează și actualizează `docs/workflow-state.json`:

```json
{
  "feature_id": "0026",
  "task": "Add user authentication",
  "started_at": "2024-01-15T10:00:00Z",
  "current_phase": "implementation",
  "phases": {
    "foundation": { "status": "done", "duration_ms": 1200 },
    "planning": { "status": "done", "iterations": 1 },
    "implementation": { "status": "in_progress", "files_created": 3 },
    "quality": { "status": "pending" },
    "testing": { "status": "pending" },
    "documentation": { "status": "pending" },
    "precommit": { "status": "pending" }
  },
  "errors": [],
  "warnings": []
}
```

## FILE READING PRIORITY

Înainte de ORICE task, citește (dacă există):

1. **docs/commands/brief.md** - Template extins pentru app-truth.md cu business model, market context, use cases din research
2. **app-truth.md** - Arhitectură proiect și decizii importante
3. **docs/workflow-state.json** - Stare curentă workflow
4. **package.json** - Dependencies & scripts
5. **tsconfig.json** - TypeScript config

**IMPORTANT**: Când creezi sau actualizezi `app-truth.md`, folosește template-ul extins din `docs/commands/brief.md` care include:

- Business model detaliat (Seller Portal, Buyer Marketplace, Swap Desk)
- Market context (EU ETS vs China ETS)
- Use cases și value propositions pentru fiecare tip de participant
- Revenue model și fee structure
- Tax optimization strategies
- Swap mechanisms și atomic settlement

## EXECUȚIE

### La primirea task-ului

```markdown
## 🚀 AUTO-PILOT ACTIVATED

**Task:** [descriere]
**Feature ID:** XXXX
**Estimated phases:** 7

Starting in 3... 2... 1...

---

### Phase 1/7: Foundation ⏳
[execută silent]
✅ Foundation complete (1.2s)

### Phase 2/7: Planning ⏳
[execută silent]
✅ Plan created & validated (3.4s)

### Phase 3/7: Implementation ⏳
[execută silent - poate dura mai mult]
✅ Implementation complete (45.2s)
   - Created: 3 files
   - Modified: 2 files

### Phase 4/7: Quality ⏳
[execută silent]
⚠️ Review iteration 1: 2 issues found
⚠️ Review iteration 2: 1 issue found  
✅ Quality approved (12.3s)

### Phase 5/7: Testing ⏳
[execută silent]
✅ Tests passing: 8/8 (5.1s)

### Phase 6/7: Documentation ⏳
[execută silent]
✅ Docs updated (2.1s)

### Phase 7/7: Pre-commit ⏳
[execută silent]
✅ All checks passed (1.8s)

---

## ✅ TASK COMPLETE

**Duration:** 71.1s
**Files changed:** 5
**Tests added:** 8
**Commit ready:** YES

### Suggested commit:

```text
feat(auth): add user authentication with OAuth2

- Add OAuth2 provider integration
- Create login/logout endpoints
- Add session management
- Include comprehensive tests

Closes #123
```

### To commit

```bash
git add -A && git commit -m "feat(auth): add user authentication"
```

## HANDLING ERRORS

### Recoverable Errors (auto-fix)

- Linter errors → auto-fix și continuă
- Type errors → fix și continuă
- Test failures → debug, fix, retry (max 3x)
- Review issues → fix și re-review (max 3x)

### Critical Errors (STOP & report)

- Cannot parse app-truth.md (verifică că folosește template din brief.md)
- Circular dependencies detected
- Build completely broken after 3 attempts
- Security vulnerability detected

**Example Error Report:**

```markdown
## 🛑 AUTO-PILOT STOPPED

**Phase:** Implementation
**Error:** Build failed after 3 attempts

### Error Details

TypeError: Cannot read property 'x' of undefined
  at src/auth/provider.ts:42

### Attempted Fixes

1. Added null check - still failing
2. Added default value - still failing
3. Refactored function - still failing

### Manual Intervention Required

The issue appears to be in the external OAuth library.
Please check `src/auth/provider.ts:42` and verify the
library version is compatible.

### To Resume

After fixing, run: `@auto continue`
```

## SHORTCUTS

| Command                | Action                |
| ---------------------- | --------------------- |
| `@auto [task]`         | Start full workflow   |
| `@auto continue`       | Resume from last state |
| `@auto status`         | Show current state    |
| `@auto skip [phase]`   | Skip a phase          |
| `@auto rollback`       | Undo last phase       |

## OPTIMIZĂRI DE VITEZĂ

1. **Parallel Execution** (când posibil):
   - Lint + Type check = parallel
   - Tests + Docs = parallel (dacă independent)

2. **Caching**:
   - Skip unchanged files în review
   - Reuse test results dacă codul nu s-a schimbat

3. **Early Exit**:
   - Dacă planul e simplu, skip validation loop
   - Dacă codul e < 50 linii, simplified review

## EXEMPLU COMPLET

**Input:**

```text
@auto Add dark mode toggle to settings page
```

**Output (condensat):**

```text
🚀 AUTO-PILOT: "Add dark mode toggle to settings page"

✅ Phase 1: Foundation (0.8s)
✅ Phase 2: Planning (2.1s) - Feature 0027
✅ Phase 3: Implementation (23.4s) - 2 files
✅ Phase 4: Quality (8.2s) - 2 iterations
✅ Phase 5: Testing (4.1s) - 5 tests
✅ Phase 6: Documentation (1.9s)
✅ Phase 7: Pre-commit (1.2s)

─────────────────────────────────
✅ COMPLETE in 41.7s

Files: src/components/DarkModeToggle.tsx (new)
       src/pages/Settings.tsx (modified)
       src/tests/DarkModeToggle.test.tsx (new)

Commit: git add -A && git commit -m "feat(ui): add dark mode toggle"
```

---

Descrie task-ul și las AUTO-PILOT să facă restul.
