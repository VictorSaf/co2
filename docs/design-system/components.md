# Component Documentation

All design system components are located in `src/design-system/components/` and exported through `src/design-system/components/index.ts`.

## Button

A standardized button component with multiple variants and sizes.

### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'info';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}
```

### Usage

```tsx
import { Button } from '../design-system';

<Button variant="primary" size="md">Click me</Button>
<Button variant="outline" leftIcon={<Icon />}>With Icon</Button>
<Button variant="danger" isLoading>Loading...</Button>
<Button variant="success" fullWidth>Full Width</Button>
```

## Input

A standardized input component with label, error handling, and icon support.

### Props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dark';
}
```

### Usage

```tsx
import { Input } from '../design-system';

<Input label="Email" type="email" placeholder="Enter your email" />
<Input label="Password" type="password" error="Password is required" />
<Input leftIcon={<Icon />} helperText="Helper text" />
<Input variant="dark" label="Dark Input" />
```

## Card

A standardized card component with multiple variants and padding options.

### Props

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}
```

### Usage

```tsx
import { Card } from '../design-system';

<Card variant="elevated" padding="lg">
  <h2>Card Title</h2>
  <p>Card content</p>
</Card>

<Card variant="outlined" hover>
  Hoverable card
</Card>
```

## Badge

A standardized badge component for displaying labels, statuses, or counts.

### Props

```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}
```

### Usage

```tsx
import { Badge } from '../design-system';

<Badge variant="success">Active</Badge>
<Badge variant="error" dot>Error</Badge>
<Badge variant="warning" size="lg">Warning</Badge>
```

## Modal

A standardized modal component using Headless UI Dialog.

### Props

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
}
```

### Usage

```tsx
import { Modal } from '../design-system';

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modal Title" size="md">
  <p>Modal content</p>
</Modal>
```

## Tooltip

A tooltip component with accessibility support and design system integration.

### Props

```typescript
interface TooltipProps {
  text: string;
  ariaLabel: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'default' | 'dark';
  iconClassName?: string;
}
```

### Usage

```tsx
import { Tooltip } from '../design-system';

<Tooltip text="Help text" ariaLabel="Help information" position="top" />
<Tooltip text="Dark tooltip" ariaLabel="Dark variant" variant="dark" />
```

## Table

A standardized table component with striped rows, hover effects, and compact mode.

### Props

```typescript
interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
}
```

### Usage

```tsx
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../design-system';

<Table striped hover>
  <TableHead>
    <TableRow>
      <TableHeader>Name</TableHeader>
      <TableHeader>Email</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Form Components

### FormField

Wrapper component for form fields with label, error, and helper text.

### Props

```typescript
interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}
```

### Usage

```tsx
import { FormField } from '../design-system';

<FormField label="Email" required error="Email is required">
  <Input type="email" />
</FormField>
```

### FormLabel

Standalone label component.

### FormError

Standalone error message component.

## Best Practices

1. **Always use design system components** instead of creating custom styled components
2. **Use semantic variants** (success, error, warning, info) for status indicators
3. **Leverage component props** for customization rather than overriding styles
4. **Follow accessibility guidelines** - components include ARIA attributes by default
5. **Use appropriate sizes** - choose sizes that match your UI hierarchy

