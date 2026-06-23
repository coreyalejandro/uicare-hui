# Design System

This project uses a lightweight design system located in `web/src/design-system`.
It centralizes visual tokens and responsive values so that components remain
consistent and easy to maintain.

## Tokens

- **Colors** – defined in `colors.ts`. Colors map to CSS variables set in
  `globals.css` and include background, foreground, accent and utility colors.
- **Spacing** – `spacing.ts` defines rem-based spacing units (`xs` through
  `xxl`) plus a panel width token. Use these for margins, padding and sizing.
- **Typography** – `typography.ts` exposes font-size tokens for headings and
  body copy.
- **Breakpoints** – responsive breakpoints are provided in `breakpoints.ts` and
  can be used for media queries.

## Usage

Import tokens into components and apply them via the `style` prop or custom
utility classes. Example:

```tsx
import { spacing, typography } from '@/design-system';

export function Example() {
  return (
    <h2 style={{ fontSize: typography.h2, marginBottom: spacing.md }}>
      Accessible heading
    </h2>
  );
}
```

Using shared tokens helps enforce consistent spacing, typography and color usage
across the application while making future design changes easier.
