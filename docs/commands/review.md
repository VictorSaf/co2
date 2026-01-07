---
description: Perform thorough code review
globs:
alwaysApply: false
---

# Review - Automated Code Review

Thorough and constructive code review.

## Check For

| Area | What to Check |
|------|---------------|
| **Correctness** | Does it work? Edge cases? |
| **Security** | Vulnerabilities? Input validation? |
| **Performance** | Bottlenecks? N+1 queries? |
| **Maintainability** | Readable? DRY? |
| **Testing** | Testable? Tests exist? |

## Output Format

Create `docs/features/XXXX_REVIEW.md`:

```markdown
# Code Review: [Feature]

**Status:** ✅ APPROVED / ⚠️ CHANGES REQUESTED
**Reviewer:** AI
**Date:** [date]

## Files Reviewed
| File | Status | Notes |
|------|--------|-------|
| `src/file.ts` | ✅ | Clean |
| `src/other.ts` | ⚠️ | Issues found |

## Issues

### 🔴 Critical (must fix)

**File:** `src/file.ts:42`
**Problem:** SQL injection vulnerability
**Fix:**
```typescript
// Use parameterized query
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### 🟡 Important (should fix)

**File:** `src/other.ts:15`
**Problem:** Missing error handling
**Fix:** Add try-catch block

### 🟢 Minor (nice to have)

**File:** `src/utils.ts:8`
**Problem:** Variable name unclear
**Suggestion:** Rename `x` to `userCount`

## What's Good ✨
- Clean component structure
- Good TypeScript usage
- Helpful comments

## Summary
- 🔴 Critical: X issues
- 🟡 Important: X issues
- 🟢 Minor: X issues
```

---

Review the selected code or recent changes.
