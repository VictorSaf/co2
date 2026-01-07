---
description: Pre-commit quality checks
globs:
alwaysApply: false
---

# Pre-commit - Final Quality Gate

Last checks before committing code.

## Checklist

```
□ Code compiles/builds
□ All tests pass
□ Lint passes (no errors)
□ Types check (no errors)
□ No security issues
□ No secrets in code
□ No debug code (console.log, print, debugger)
□ No TODO/FIXME blocking commit
□ Documentation updated
□ CHANGELOG updated (if needed)
```

## Review Each Changed File

- Only intentional changes?
- Debug code removed?
- Commented code removed?
- No hardcoded values that should be config?

## Output Format

```markdown
# Pre-Commit Check

**Status:** ✅ READY TO COMMIT / ❌ ISSUES FOUND

## Automated Checks
| Check | Status | Details |
|-------|--------|---------|
| Build | ✅ Pass | |
| Tests | ✅ 42/42 | |
| Lint | ✅ Clean | |
| Types | ✅ Clean | |
| Security | ✅ Clean | |

## Manual Checks
- [x] No debug code
- [x] No secrets
- [ ] ⚠️ Found `console.log` in `src/api.ts:42`

## Issues to Fix
1. Remove console.log at src/api.ts:42
2. Remove commented code at src/utils.ts:15-20

## Files Changed
```
M  src/components/UserCard.tsx
M  src/api/users.ts
A  src/hooks/useUser.ts
A  tests/useUser.test.ts
```

## Suggested Commit Message
```
feat(users): add user profile card component

- Create UserCard component with avatar support
- Add useUser hook for data fetching
- Include comprehensive tests

Closes #123
```

**Ready to commit:** YES / NO
```

---

Check the staged changes before commit.
