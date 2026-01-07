---
description: Create UI components and interfaces
globs:
alwaysApply: false
---

# Interface - UI Component Creation

Create user interface components using the design system.

## Design System First

**ALWAYS check `src/design-system/` for existing components before creating new ones.**

### Available Components
```typescript
import { 
  Button, 
  Input, 
  Card, 
  Badge, 
  Modal, 
  Tooltip, 
  Table, 
  Form 
} from '@/design-system';
```

### Design Tokens
```typescript
import { 
  colors, 
  typography, 
  spacing, 
  shadows, 
  borders,
  transitions 
} from '@/design-system/tokens';
```

## Process

1. **Check Design System** - Existing components?
2. **Wireframe** - Layout structure
3. **Component** - Build with tokens
4. **States** - All interaction states
5. **A11y** - Accessibility check

## Component States

Every component should handle:
- `default` - Normal state
- `hover` - Mouse over
- `active` - Being clicked
- `focus` - Keyboard focus
- `disabled` - Not interactive
- `loading` - Async operation
- `error` - Validation failed
- `empty` - No data

## Output Format

```markdown
# Interface: [Component Name]

## Wireframe

```
┌─────────────────────────────┐
│ ┌─────┐                     │
│ │ IMG │  Title Here         │
│ └─────┘  Subtitle text      │
│                             │
│ Description text goes here  │
│ spanning multiple lines.    │
│                             │
│ [Action Button]             │
└─────────────────────────────┘
```

## Component

```tsx
import { Button, Card } from '@/design-system';
import { spacing } from '@/design-system/tokens';

interface UserCardProps {
  user: User;
  onAction: () => void;
}

export function UserCard({ user, onAction }: UserCardProps) {
  return (
    <Card className={`p-${spacing.lg}`}>
      <div className="flex gap-4">
        <Avatar src={user.avatar} alt={user.name} />
        <div>
          <h3 className="text-lg font-semibold">{user.name}</h3>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>
      <p className="mt-4">{user.bio}</p>
      <Button onClick={onAction} className="mt-4">
        View Profile
      </Button>
    </Card>
  );
}
```

## States

```tsx
// Loading
<UserCard.Skeleton />

// Empty
<Card>
  <EmptyState message="No user found" />
</Card>

// Error
<Card>
  <ErrorState message="Failed to load user" onRetry={refetch} />
</Card>
```

## Accessibility

- [x] Semantic HTML (`article`, `header`, etc.)
- [x] Keyboard navigation (tab order)
- [x] ARIA labels for interactive elements
- [x] Color contrast (4.5:1 minimum)
- [x] Focus indicators visible
- [x] Screen reader friendly
```

---

Describe the UI to create.
