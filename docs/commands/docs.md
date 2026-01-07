---
description: Write documentation for code
globs:
alwaysApply: false
---

# Docs - Technical Documentation

Create clear, useful documentation.

## Documentation Types

### JSDoc/TSDoc
```typescript
/**
 * Brief description of function.
 * 
 * @param userId - The unique identifier of the user
 * @param options - Configuration options
 * @returns The user object or null if not found
 * @throws {NotFoundError} When user doesn't exist
 * 
 * @example
 * const user = await getUser('123');
 * console.log(user.name);
 */
```

### README Section
```markdown
## Feature Name

Brief description of what this feature does.

### Usage

```typescript
import { feature } from './feature';

const result = feature(input);
```

### Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| timeout | number | 5000 | Request timeout in ms |
```

### API Documentation
```markdown
### `POST /api/users`

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "id": "123",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Errors:**
- `400` - Invalid input
- `409` - Email already exists
```

## Rules

- Be concise but complete
- Include working examples
- Update existing docs, don't duplicate
- Update `app-truth.md` if architecture changed

---

Document the selected code or feature.
