---
description: Fix all issues from code review
globs:
alwaysApply: false
---

# Fix - Resolve Review Issues

Fix all issues identified in code review.

## Process

1. Read `docs/features/XXXX_REVIEW.md`
2. Fix ALL 🔴 Critical issues
3. Fix ALL 🟡 Important issues
4. Optionally fix 🟢 Minor issues

## Output Format

For each fix:

```markdown
## Fix: [Issue Title]

**File:** `src/file.ts`
**Line:** 42
**Status:** ✅ Fixed

**Before:**
```typescript
// vulnerable code
const query = `SELECT * FROM users WHERE id = ${userId}`;
```

**After:**
```typescript
// secure code
const query = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

**Explanation:** Used parameterized query to prevent SQL injection.
```

## Summary Format

```markdown
# Fix Summary

## Issues Resolved
- 🔴 Critical: X/X fixed
- 🟡 Important: X/X fixed
- 🟢 Minor: X/X fixed

## Changes Made
| File | Lines Changed | Type |
|------|--------------|------|
| `src/file.ts` | 42-45 | Security fix |

## Verification
- [ ] Build passes
- [ ] Tests pass
- [ ] No new linter errors

**Ready for re-review:** YES / NO
```

---

Fix issues from the latest review.
