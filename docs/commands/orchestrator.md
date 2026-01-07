---
description: Analyze project state and suggest next action (Manual Mode)
globs:
alwaysApply: false
---

# Orchestrator (Manual Mode)

Analizează proiectul și sugerează următoarea acțiune. Folosește când vrei control manual.

> 💡 **TIP:** Pentru automatizare completă, folosește `@auto [task]` în loc.

## Quick Analysis

```bash
# Ce fac?
1. Citesc app-truth.md
2. Verific docs/features/ pentru work activ
3. Verific git status
4. Determin următorul pas
```

## Decision Matrix

| Stare | Prioritate | Acțiune | Command |
|-------|------------|---------|---------|
| Lipsește app-truth.md | 🔴 Critical | Creează brief | `@brief` |
| Erori linter | 🔴 Critical | Fix errors | Fix direct |
| Producție down | 🔴 Critical | Hotfix | `@hotfix` |
| Cod fără review | 🟡 High | Review | `@review` |
| Review cu issues | 🟡 High | Fix issues | `@fix` |
| Fără teste | 🟡 High | Scrie teste | `@test` |
| Plan fără cod | 🟢 Medium | Implementează | Start coding |
| Fără plan activ | 🟢 Medium | Planifică | `@plan` |
| Feature fără docs | 🟢 Medium | Documentează | `@docs` |
| Ready commit | 🟢 Medium | Pre-commit | `@precommit` |

## Output Format

```markdown
# 📊 Project State

## Foundation
- ✅ app-truth.md exists
- ✅ Project structure OK

## Active Work
- **Feature:** 0025 - User Authentication
- **Status:** Implementation in progress
- **Files:** 3 modified, 1 new

## Git Status
- Branch: `feature/0025-auth`
- Uncommitted: 4 files

## Quality
- Linter: ✅ Clean
- Tests: ⚠️ Missing for new code
- Docs: ⚠️ Not updated

---

## 🎯 Recommended Action

**Command:** `@test`
**Reason:** New code lacks test coverage

## Alternative
- `@review` - If you want review first
- Continue coding - If feature incomplete
```

## Workflow Visualization

```
            ┌──────────────────────────────────────┐
            │           ORCHESTRATOR               │
            │         (Decision Point)             │
            └──────────────────┬───────────────────┘
                               │
        ┌──────────┬───────────┼───────────┬──────────┐
        ▼          ▼           ▼           ▼          ▼
    ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐
    │ PLAN  │  │REVIEW │  │ TEST  │  │ DOCS  │  │HOTFIX │
    └───────┘  └───────┘  └───────┘  └───────┘  └───────┘
```

---

Rulează pentru a vedea starea proiectului și ce să faci next.
