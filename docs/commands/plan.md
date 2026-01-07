---
description: Create detailed implementation plan for a feature
globs:
alwaysApply: false
---

# Plan - Feature Implementation Planning

Create detailed implementation plan before coding.

## Process

1. Read `app-truth.md` for project context
2. Determine next feature number
3. Create `docs/features/XXXX_PLAN.md`

## Plan Template

```markdown
# Feature XXXX: [Title]

## Overview
[2-3 sentences describing the feature]

## Objectives
- [ ] Primary goal
- [ ] Secondary goals

## Technical Approach

### Architecture Changes
- [What changes to overall architecture]

### Data Model Changes
- [New tables/schemas/types]

### API Changes
- [New endpoints or modifications]

### UI Changes
- [New components or screens]

## Implementation Steps

### Phase 1: [Foundation]
1. Step one
2. Step two

### Phase 2: [Core Logic]
1. Step one
2. Step two

### Phase 3: [Integration]
1. Step one
2. Step two

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/X.tsx` | CREATE | New component |
| `src/api/x.ts` | MODIFY | Add endpoint |

## Dependencies
- [ ] External packages needed
- [ ] Internal modules required

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk 1] | High | [Mitigation] |

## Estimation

**Complexity:** Simple / Medium / Complex
**Estimated Time:** X hours
```

---

Provide the feature description to plan.
