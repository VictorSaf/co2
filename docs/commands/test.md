---
description: Write comprehensive tests for code
globs:
alwaysApply: false
---

# Test - Write Comprehensive Tests

Write thorough tests for new or existing code.

## Test Types

| Type | Scope | Speed |
|------|-------|-------|
| Unit | Single function | Fast |
| Integration | Component interactions | Medium |
| E2E | Full user flows | Slow |

## Coverage Requirements

- ✅ Happy path (normal flow)
- ✅ Error cases (what can fail)
- ✅ Edge cases (boundaries)
- ✅ Null/undefined handling
- ✅ Async operations

## Test Structure

```typescript
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Reset state
  });

  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange
      const input = createTestInput();
      
      // Act
      const result = methodName(input);
      
      // Assert
      expect(result).toBe(expected);
    });

    it('should throw when given invalid input', () => {
      expect(() => methodName(null)).toThrow('Invalid input');
    });

    it('should handle edge case', () => {
      const result = methodName([]);
      expect(result).toEqual([]);
    });
  });
});
```

## Naming Convention

```
should [action] when [condition]

Examples:
- should return empty array when input is empty
- should throw error when user not found
- should update state when form submitted
```

## Output

Create test files following project conventions:
- `*.test.ts` or `*.spec.ts`
- Mirror source file structure

---

Write tests for the selected code.
