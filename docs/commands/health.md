---
description: Project health check and quality assessment
globs:
alwaysApply: false
---

# Health - Project Quality Assessment

Comprehensive project health check.

## Areas to Check

| Area | Weight | What to Check |
|------|--------|---------------|
| Code Quality | 25% | Complexity, duplication, smells |
| Documentation | 20% | README, API docs, comments |
| Dependencies | 15% | Outdated, vulnerabilities |
| Architecture | 25% | Patterns, consistency, debt |
| Testing | 15% | Coverage, quality |

## Output Format

```markdown
# Project Health Check

**Overall Score:** 78/100 🟡
**Date:** [date]

---

## 📊 Code Quality: 82/100

### ✅ Strengths
- Consistent naming conventions
- Good TypeScript usage
- Functions are reasonably sized

### ⚠️ Warnings
- 3 functions over 50 lines
- Some duplicate code in utils/

### ❌ Problems
- High cyclomatic complexity in `processOrder()`

---

## 📚 Documentation: 70/100

### ✅ Strengths
- README is comprehensive
- Good inline comments

### ⚠️ Warnings
- API documentation incomplete
- Missing JSDoc on 12 public functions

### ❌ Problems
- app-truth.md is outdated

---

## 📦 Dependencies: 75/100

### ✅ Up to Date
- react: 18.2.0 ✓
- typescript: 5.0.0 ✓

### ⚠️ Minor Updates Available
- axios: 1.2.0 → 1.4.0
- lodash: 4.17.20 → 4.17.21

### ❌ Security Issues
- None found ✓

---

## 🏗️ Architecture: 80/100

### ✅ Strengths
- Clear separation of concerns
- Consistent folder structure

### ⚠️ Warnings
- Some circular dependencies detected
- API layer inconsistencies

### ❌ Problems
- No clear error handling strategy

---

## 🧪 Testing: 65/100

### Coverage
- Statements: 72%
- Branches: 58%
- Functions: 80%
- Lines: 71%

### ✅ Strengths
- Critical paths tested
- Good mocking patterns

### ❌ Problems
- No integration tests
- Edge cases missing

---

## 🎯 Priority Actions

### This Week (High Priority)
1. Fix security vulnerability in auth module
2. Add error handling strategy
3. Update outdated dependencies

### This Month (Medium Priority)
4. Increase test coverage to 80%
5. Complete API documentation
6. Refactor processOrder function

### This Quarter (Low Priority)
7. Add integration tests
8. Set up performance monitoring
9. Migrate to newer patterns

---

## 📈 Trend

| Metric | Last Month | Now | Trend |
|--------|------------|-----|-------|
| Coverage | 65% | 72% | 📈 +7% |
| Tech Debt | 45 issues | 38 issues | 📈 -7 |
| Dependencies | 5 outdated | 2 outdated | 📈 Better |
```

---

Run health check on this project.
