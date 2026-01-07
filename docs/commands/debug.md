---
description: Systematically debug an issue
globs:
alwaysApply: false
---

# Debug - Systematic Issue Resolution

Find and fix bugs systematically.

## Process

```
1. REPRODUCE → Can you trigger it?
2. ISOLATE   → Smallest failing code?
3. IDENTIFY  → What line is wrong?
4. FIX       → What resolves it?
5. VERIFY    → No side effects?
```

## Techniques

- Trace data flow
- Log variable values
- Binary search to narrow down
- Check recent changes

## Output Format

```markdown
# Bug Analysis

## Problem
[What's broken - be specific]

## Reproduction Steps
1. Do X
2. Then Y
3. See error Z

## Root Cause
**File:** `src/file.ts:42`
**Issue:** [Technical explanation]

## Fix

**Before:**
```code
// buggy code
```

**After:**
```code
// fixed code
```

## Why This Works
[Explanation of the fix]

## Prevention
- [ ] Add test for this case
- [ ] Add input validation
- [ ] Add error boundary
```

---

Describe the bug to debug.
