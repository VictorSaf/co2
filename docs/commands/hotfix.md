---
description: Emergency fix for production issues
globs:
alwaysApply: false
---

# Hotfix - Emergency Production Fix

Speed and safety are critical. Minimal changes only.

## Severity Levels

| Level | Impact | Response Time |
|-------|--------|---------------|
| P0 | System down | Immediate |
| P1 | Major feature broken | < 1 hour |
| P2 | Minor feature broken | < 4 hours |

## Hotfix Rules

⚠️ **MINIMAL CHANGES ONLY**

- Fix ONLY the immediate issue
- NO refactoring
- NO "while we're here" improvements
- NO new features
- Proper fix comes later in a normal PR

## Process

```
1. IDENTIFY   → What exactly is broken?
2. REPRODUCE  → Can you trigger it?
3. FIX        → Smallest possible change
4. VERIFY     → Does it work? No side effects?
5. DEPLOY     → Get it live ASAP
6. DOCUMENT   → Log what happened
```

## Output Format

```markdown
# 🚨 Hotfix: [Brief Description]

**Severity:** P0 / P1 / P2
**Reported:** [time]
**Resolved:** [time]

## Issue
[What's broken - be specific]

## Impact
- Users affected: [number/percentage]
- Revenue impact: [if applicable]

## Root Cause
[Quick analysis of why this happened]

## Fix

**File:** `src/api/checkout.ts:142`

```diff
- const total = items.reduce((sum, item) => sum + item.price);
+ const total = items.reduce((sum, item) => sum + item.price, 0);
```

## Verification
- [ ] Fix deployed to staging
- [ ] Verified working
- [ ] Deployed to production
- [ ] Monitoring shows improvement

## Rollback Plan
If fix causes issues:
1. Revert commit: `git revert [hash]`
2. Deploy previous version
3. Alert on-call team

## Follow-up Tasks
- [ ] Add proper test for this case
- [ ] Full root cause analysis
- [ ] Update monitoring/alerting
- [ ] Team post-mortem

## Timeline
- 10:00 - Issue reported
- 10:05 - Investigation started
- 10:15 - Root cause identified
- 10:20 - Fix deployed
- 10:25 - Verified working
```

---

Describe the production issue.
