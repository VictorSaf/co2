# Design System Examples

This document provides practical examples of using the design system.

## Basic Component Usage

### Form with Validation

```tsx
import { Input, Button, FormField } from '../design-system';
import { useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!email || !password) {
      setError('All fields are required');
      return;
    }
    // Submit logic
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Email" required error={error}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error && !email ? 'Email is required' : undefined}
        />
      </FormField>
      
      <FormField label="Password" required>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error && !password ? 'Password is required' : undefined}
        />
      </FormField>

      <Button type="submit" variant="primary" fullWidth>
        Sign In
      </Button>
    </form>
  );
}
```

### Card with Badges

```tsx
import { Card, Badge } from '../design-system';

function UserCard({ user }) {
  return (
    <Card variant="elevated" padding="lg" hover>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{user.name}</h3>
        <Badge variant={user.active ? 'success' : 'error'} dot>
          {user.active ? 'Active' : 'Inactive'}
        </Badge>
      </div>
      <p className="text-text-secondary">{user.email}</p>
    </Card>
  );
}
```

### Modal with Form

```tsx
import { Modal, Input, Button } from '../design-system';
import { useState } from 'react';

function EditUserModal({ isOpen, onClose, user }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const handleSave = () => {
    // Save logic
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit User"
      size="md"
    >
      <div className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

## Responsive Design

### Using Breakpoint Hook

```tsx
import { useBreakpoint } from '../design-system/hooks';
import { Card } from '../design-system';

function ResponsiveGrid({ items }) {
  const isDesktop = useBreakpoint('lg');
  const isTablet = useBreakpoint('md');

  const columns = isDesktop ? 3 : isTablet ? 2 : 1;

  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {items.map((item) => (
        <Card key={item.id} padding="md">
          {item.content}
        </Card>
      ))}
    </div>
  );
}
```

## Theme Usage

### Theme Toggle Button

```tsx
import { useTheme } from '../design-system/hooks';
import { Button } from '../design-system';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      leftIcon={theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    >
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </Button>
  );
}
```

## Data Tables

### Table with Actions

```tsx
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  Button,
  Badge,
} from '../design-system';

function UsersTable({ users, onEdit, onDelete }) {
  return (
    <Table striped hover>
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Email</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.active ? 'success' : 'error'}>
                {user.active ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(user.id)}>
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Custom Styling with Tokens

### Using Tokens Programmatically

```tsx
import { colors, spacing, typography } from '../design-system/tokens';

function CustomComponent() {
  const style = {
    backgroundColor: colors.functional.background.light,
    color: colors.functional.text.primary.light,
    padding: spacing[4],
    fontSize: typography.fontSize.base[0],
    lineHeight: typography.fontSize.base[1].lineHeight,
  };

  return <div style={style}>Custom styled content</div>;
}
```

### Using CSS Variables

```css
.custom-component {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  padding: var(--spacing-4);
  font-size: var(--font-size-base);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  transition: var(--transition-default);
}

.custom-component:hover {
  box-shadow: var(--shadow-lg);
}
```

## Loading States

### Button with Loading

```tsx
import { Button } from '../design-system';
import { useState } from 'react';

function SubmitButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await submitData();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="primary"
      isLoading={isLoading}
      onClick={handleSubmit}
      disabled={isLoading}
    >
      Submit
    </Button>
  );
}
```

## Error Handling

### Form with Error Display

```tsx
import { Input, Button, Card } from '../design-system';
import { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <Card padding="lg">
      <Input
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
      />
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
      />
      <Button variant="primary" onClick={validate}>
        Submit
      </Button>
    </Card>
  );
}
```

## Best Practices Demonstrated

1. **Use design system components** - All examples use design system components
2. **Leverage component props** - Customization through props, not style overrides
3. **Handle states properly** - Loading, error, and disabled states
4. **Accessibility** - Components include ARIA attributes
5. **Theme support** - All components work in light and dark themes
6. **Responsive design** - Examples show responsive patterns

