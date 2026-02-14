# Design: React Best Practices Skill

## Overview

A comprehensive, token-efficient React skill for the InformatiK-AI Framework that provides:
- **Code review**: Analyze React code against best practices
- **Pattern guidance**: Guide agents to follow React patterns
- **Component generation**: Create components following established patterns

**Invocation**: Auto-registered during `/genesis` for React projects, auto-injected for @developer on .tsx/.jsx files, manual via `/react-best-practices`.

**Strictness**: Advisory mode (suggestions without blocking).

## Approach

Token-efficient design with 4 files:
1. `SKILL.md` - Entry point and slim injection
2. `PATTERNS.md` - All patterns with lazy-loaded sections
3. `CHECKS.md` - Anti-patterns and review process
4. `GENERATORS.md` - Code templates

Estimated total: ~2700 tokens full load, ~300 tokens slim injection.

## Architecture

```
.claude/skills/react-best-practices/
├── SKILL.md         # Entry + triggers + slim injection
├── PATTERNS.md      # Lazy-loaded pattern sections
├── CHECKS.md        # Anti-patterns + review
└── GENERATORS.md    # Templates
```

**Integration points**:
- Genesis: Detects React, registers skill
- Agent injection: @developer receives slim patterns
- Rule generation: Creates `.claude/rules/react.md`

## Components

### SKILL.md
- Trigger definitions (genesis, manual, auto)
- Mode configurations (review, generate, patterns)
- Slim injection (50 lines for agent context)
- Automation config schema

### PATTERNS.md Sections
| Section | Content |
|---------|---------|
| hooks | useState, useEffect, useCallback, useMemo, custom |
| components | Composition, render props, children patterns |
| typescript | Props typing, generics, discriminated unions |
| state | Context, Zustand, Jotai, Redux Toolkit |
| routing | React Router v6, Next.js, Remix |
| data | TanStack Query, SWR, RSC |
| forms | React Hook Form, Formik, Zod/Yup |
| styling | CSS-in-JS, Tailwind, CSS Modules, theming |
| animations | Framer Motion, reduced motion |
| ui | Radix, Shadcn/ui, headless patterns |
| auth | NextAuth, Clerk, protected routes |
| i18n | react-i18next, next-intl |

### CHECKS.md
- Anti-patterns: State mutation, effect deps, any abuse, performance
- Review process: Structure → Logic → Performance
- Migration guide: Class → functional

### GENERATORS.md
- Functional component template (TypeScript)
- Custom hook template (with overloads)
- Test file template (RTL)
- Form component template
- Page/route template

## Data Flow

```
1. /genesis detects React in package.json
         ↓
2. Registers react-best-practices skill
         ↓
3. Generates .claude/rules/react.md
         ↓
4. @developer works on .tsx file
         ↓
5. Slim injection auto-loaded (300 tokens)
         ↓
6. Agent writes code with pattern awareness
         ↓
7. Pre-commit: CHECKS.md scans (advisory)
         ↓
8. Warnings surfaced, user decides
```

## Automation Features

| Feature | Trigger | Action |
|---------|---------|--------|
| Auto-inject | Open/create .tsx/.jsx | Load slim patterns |
| Pre-commit scan | Before React file commit | Run anti-pattern checks |
| Smart suggestions | Write useState/useEffect | Suggest typing/cleanup |
| Auto-generate | "create component for X" | Use templates |
| Performance alerts | Inline functions in JSX | Suggest useCallback |
| Package detection | Deps in package.json | Inject relevant patterns |

## Error Handling

- **Missing dependency**: Advisory warning, suggest installation
- **Pattern conflict**: Show both patterns, user decides
- **Unknown library**: Fall back to core React patterns
- **Large file**: Suggest component splitting (>150 lines)

## Testing Strategy

1. **Unit**: Verify section loading works correctly
2. **Integration**: Test genesis → skill registration flow
3. **Manual**:
   - Run `/react-best-practices review` on sample file
   - Run `/react-best-practices generate component`
   - Verify slim injection in @developer context
4. **Token audit**: Measure actual token usage per operation
