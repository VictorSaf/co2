---
description: Improve code quality without changing behavior
globs:
alwaysApply: false
---

# Refactor - Code Improvement

Improve code without changing behavior.

## Code Smells to Fix

| Smell | Solution |
|-------|----------|
| Long function (>50 lines) | Extract Method |
| Duplicate code | Extract & Reuse |
| Complex conditional | Strategy/Polymorphism |
| Long parameter list | Parameter Object |
| Large class | Extract Class |
| Deep nesting (>3 levels) | Early return |
| Magic numbers | Named constants |
| God object | Single Responsibility |

## Safety Rules

⚠️ **MUST NOT change behavior**

1. Run tests BEFORE refactoring
2. Make small, incremental changes
3. Run tests AFTER each change
4. If tests break, refactor is wrong

## Process

```
1. Identify smell
2. Write tests if missing
3. Small refactor step
4. Run tests
5. Repeat until clean
```

## Output Format

```markdown
# Refactoring: [Area/Component]

## Code Smells Found

| Location | Smell | Severity |
|----------|-------|----------|
| `src/utils.ts:50-120` | Long function | High |
| `src/api.ts:30,80` | Duplicate code | Medium |

## Changes Made

### 1. Extract `calculateTotal` function

**Before:**
```typescript
function processOrder(order) {
  // 70 lines of mixed logic
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.quantity;
    // ... 20 more lines
  }
  // ... 50 more lines
}
```

**After:**
```typescript
function calculateTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => 
    sum + item.price * item.quantity, 0
  );
}

function processOrder(order) {
  const total = calculateTotal(order.items);
  // ... cleaner logic
}
```

**Why:** Single responsibility - calculation logic is now isolated and testable.

### 2. Remove duplicate validation

**Before:** Same validation in 3 files
**After:** Shared `validateUser()` function

## Metrics

| Metric | Before | After |
|--------|--------|-------|
| Avg function length | 80 lines | 20 lines |
| Cyclomatic complexity | 15 | 5 |
| Duplicate code blocks | 5 | 0 |

## Tests
- ✅ All existing tests pass
- ✅ Added 3 new tests for extracted functions
```

---

Refactor the selected code.
