---
description: QUICK MODE - Fast implementation fără overhead complet
globs:
alwaysApply: false
---

# ⚡ QUICK MODE

Pentru task-uri mici sau iterații rapide. Skip-ează documentation și unele verificări.

## Când să folosești QUICK vs AUTO

| Situație | Command |
|----------|---------|
| Feature nou complet | `@auto` |
| Bug fix simplu | `@quick` |
| Refactoring mic | `@quick` |
| Schimbare UI mică | `@quick` |
| Feature complex | `@auto` |
| Ceva ce merge în producție | `@auto` |

## QUICK Workflow

```
TASK
  │
  ▼
┌────────────────────┐
│ 1. ANALYZE (5s)    │  ← Înțelege ce trebuie făcut
└────────────────────┘
  │
  ▼
┌────────────────────┐
│ 2. IMPLEMENT (Xs)  │  ← Scrie codul direct
└────────────────────┘
  │
  ▼
┌────────────────────┐
│ 3. VERIFY (10s)    │  ← Lint + Type check + Build
└────────────────────┘
  │
  ▼
┌────────────────────┐
│ 4. COMMIT (2s)     │  ← Generează commit message
└────────────────────┘
  │
  ▼
✅ DONE
```

## Ce se SKIP-ează

- ❌ Plan document
- ❌ Validation step
- ❌ Full code review
- ❌ Comprehensive tests
- ❌ Documentation update
- ❌ Changelog entry

## Ce se FACE

- ✅ Quick analysis
- ✅ Direct implementation
- ✅ Lint auto-fix
- ✅ Type checking
- ✅ Build verification
- ✅ Commit message generation

## Output Format

```
⚡ QUICK MODE: "[task]"

Analyzing... done (2s)
Implementing... done (15s)
Verifying... done (5s)

────────────────────────
✅ QUICK COMPLETE (22s)

Changed:
  M src/components/Button.tsx
  
Commit:
  git commit -am "fix(ui): correct button hover state"
```

## Exemplu

**Input:**
```
@quick fix the button hover color in Button.tsx
```

**Output:**
```
⚡ QUICK: "fix button hover color"

→ Found: src/components/Button.tsx:45
→ Issue: hover:bg-blue-500 should be hover:bg-blue-600
→ Fixed: Updated className

✅ Done (8s)

git commit -am "fix(ui): correct button hover color"
```

---

Descrie ce trebuie făcut rapid.
