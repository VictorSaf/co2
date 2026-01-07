---
description: Validate implementation plan before coding
globs:
alwaysApply: false
---

# Validate - Plan Verification

Validate plans before implementation.

## Checklist

- [ ] **Completeness** - All sections filled
- [ ] **Feasibility** - Can be built with current stack
- [ ] **Consistency** - Matches app-truth.md conventions
- [ ] **Dependencies** - All identified and available
- [ ] **Risks** - Realistic assessment
- [ ] **Testability** - Clear testing strategy

## Verify Against Codebase

- Do referenced files exist?
- Compatible with existing patterns?
- Any conflicts with other features?
- Dependencies available?

## Output Format

```markdown
# Plan Validation: [Feature Name]

**Status:** ✅ APPROVED / ⚠️ NEEDS REVISION / ❌ REJECTED

## Checklist Results
- [x] Completeness - All sections present
- [x] Feasibility - Achievable
- [ ] Consistency - ⚠️ Issue found
- [x] Dependencies - Available
- [x] Risks - Addressed
- [x] Testability - Clear strategy

## Issues Found

### Issue 1: Inconsistent Naming
**Severity:** Medium
**Location:** Files to Create section
**Problem:** Component named `userCard` but convention is PascalCase
**Suggestion:** Rename to `UserCard`

### Issue 2: Missing Dependency
**Severity:** High
**Problem:** Plan uses `date-fns` but it's not in package.json
**Suggestion:** Add to dependencies or use native Date

## Questions for Clarification
1. Should this support mobile responsive design?
2. Is caching required for the API calls?

## Verdict

**Approved:** YES / NO
**Blocker Issues:** 0
**Revision Required:** [specific items]
```

---

Validate the plan in docs/features/.
