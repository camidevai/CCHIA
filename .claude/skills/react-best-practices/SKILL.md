---
name: react-best-practices
version: 2.0
description: "Comprehensive React code review, pattern guidance, and component generation with full ecosystem support."
---

# React Best Practices

## QUICK REFERENCE

### BLOCKING CONDITIONS
> ⛔ Si alguna es TRUE, DETENER inmediatamente

- [ ] No se detectó React en package.json
- [ ] Archivo target no existe (modo review)
- [ ] Nombre de componente inválido (modo generate)

### REQUIRED OUTPUTS

**Review Mode:**
- [ ] Report con findings por severidad (Critical/Warning/Info)
- [ ] Sugerencias de fix específicas

**Generate Mode:**
- [ ] Archivos de componente creados
- [ ] index.ts con re-exports

**Patterns Mode:**
- [ ] Patrones relevantes mostrados con ejemplos

### PHASES OVERVIEW
```
DETECT → PROCESS → OUTPUT
   ↓        ↓        ↓
package  Mode-     Report/
.json    specific  Files
```

### PARAMETERS
| Parámetro | Descripción |
|-----------|-------------|
| `review [path]` | Analiza código para anti-patterns |
| `generate [type] --name` | Genera componente/hook/form/page/test |
| `patterns [topic]` | Muestra patrones por tema |

---

## Overview

Token-efficient skill for React development guidance. Provides code review, pattern matching, anti-pattern detection, and smart component generation.

## Triggers

### Genesis Detection
Activated when package.json contains:
- `react` or `react-dom`
- `next` (Next.js)
- `@remix-run/*` (Remix)
- `gatsby` (Gatsby)

### Manual Invocation
```
/react-best-practices [mode] [options]
```

### Auto-Injection
On `.tsx` / `.jsx` file operations, inject slim context to agents.

---

## Modes

### Review Mode (default)
```
/react-best-practices review [path]
```
Analyzes code for anti-patterns, performance issues, and TypeScript best practices.

### Generate Mode
```
/react-best-practices generate [type] --name [Name]
```
Types: `component`, `hook`, `form`, `page`, `test`

### Patterns Mode
```
/react-best-practices patterns [topic]
```
Topics: `hooks`, `state`, `routing`, `data`, `forms`, `styling`, `animations`, `auth`, `i18n`

---

## Configuration Schema

```yaml
react-best-practices:
  enabled: true
  mode: advisory          # advisory | standard | strict
  typescript: true        # auto-detected from tsconfig.json
  auto-inject: true       # inject slim context on .tsx/.jsx
  auto-review: true       # pre-commit anti-pattern scan
  smart-suggestions: true # context-aware hints
  auto-generate: true     # template triggers on natural language
  performance-alerts: true # optimization hints
  verbose: true           # show all suggestions

  # Ecosystem detection (auto from package.json)
  ecosystem:
    state: null           # zustand | jotai | redux | context
    routing: null         # react-router | nextjs | remix
    data: null            # tanstack-query | swr | none
    forms: null           # react-hook-form | formik | none
    styling: null         # tailwind | css-modules | styled | emotion
    ui: null              # radix | shadcn | headless-ui | none
```

---

## Slim Injection (Auto-Context)

Injected to @developer and @architect when working on React files (~50 lines).

```markdown
## React Quick Reference

### Component Pattern
- FC<Props> for typed components
- Props interface above component
- Destructure props in signature
- Single responsibility per component

### Hooks Rules
- Only call at top level (no conditionals/loops)
- Custom hooks: `use` prefix, return typed tuple/object
- useEffect: minimal deps, cleanup function when needed
- useMemo/useCallback: only for referential equality or expensive computation

### State Guidelines
- Lift state to lowest common ancestor
- Derive state when possible (no redundant state)
- Use reducer for complex state logic
- Prefer controlled components

### Performance
- Avoid: inline objects/functions in JSX (causes re-renders)
- Avoid: array index as key (unless static list)
- Use: React.memo for pure presentational components
- Use: Suspense + lazy for code splitting

### TypeScript
- Never use `any` - prefer `unknown` or proper typing
- Discriminated unions for variant props
- Generic components for reusable patterns
- Strict null checks enabled

### Anti-Patterns (AVOID)
- Direct state mutation
- Missing effect cleanup
- Props drilling > 2 levels (use context/state lib)
- useEffect for derived state
- Sync state with props (use key or derive)
```

---

## Process by Mode

### Review Process

1. **Scan** - Load target files
2. **Check** - Run CHECKS.md anti-pattern detection
3. **Report** - Output findings with severity and fix suggestions

Output format:
```
📋 React Code Review: {path}

🔴 Critical (must fix):
- [line:col] {issue} → {fix}

🟡 Warning (should fix):
- [line:col] {issue} → {fix}

🔵 Info (consider):
- [line:col] {suggestion}

✅ Good patterns found:
- {pattern observed}
```

### Generate Process

1. **Parse** - Extract name and type from command
2. **Detect** - Check ecosystem from package.json
3. **Template** - Load from GENERATORS.md
4. **Customize** - Apply project conventions
5. **Output** - Create files with proper structure

### Patterns Process

1. **Topic** - Identify requested pattern category
2. **Load** - Lazy-load section from PATTERNS.md
3. **Context** - Add project-specific ecosystem info
4. **Output** - Display relevant patterns only

---

## Integration Points

### Agent Integration

**@developer:**
- Receives slim injection on React files
- Access to generate templates
- Anti-pattern warnings during implementation

**@architect:**
- State management decision framework
- Routing architecture patterns
- Performance optimization strategies

### Automation Features

| Feature | Trigger | Action |
|---------|---------|--------|
| Auto-inject | .tsx/.jsx open | Inject slim context |
| Pre-commit scan | git commit | Advisory anti-pattern check |
| Smart suggestions | Code context | Pattern recommendations |
| Auto-generate | Natural language | Template suggestion |
| Performance alerts | Pattern detection | Optimization hints |
| Package detection | package.json change | Update ecosystem config |

---

## Files

| File | Purpose | Token Budget |
|------|---------|--------------|
| SKILL.md | Entry point, config, injection | ~500 |
| PATTERNS.md | Ecosystem patterns (lazy-load) | ~1500 |
| CHECKS.md | Anti-patterns, review process | ~400 |
| GENERATORS.md | Code templates | ~300 |

---

## Output Examples

### Review Output
```
📋 React Code Review: src/components/UserProfile.tsx

🔴 Critical:
- [15:5] useEffect missing dependency: userId → Add to deps array
- [23:10] State mutation detected → Use setState with new object

🟡 Warning:
- [8:1] Component over 200 lines → Consider splitting
- [45:12] Inline object in JSX → Extract to useMemo

🔵 Info:
- [3:1] Consider adding displayName for DevTools

✅ Good patterns:
- Proper TypeScript interface for props
- Custom hook extraction for data fetching
```

### Generate Output
```
✅ Component generated: UserCard

📁 Files created:
   - src/components/UserCard/UserCard.tsx
   - src/components/UserCard/UserCard.test.tsx
   - src/components/UserCard/index.ts

📦 Detected ecosystem:
   - TypeScript: yes
   - Styling: tailwind
   - Testing: vitest + testing-library

👉 Next: Implement component logic
```

---

## FINAL CHECKPOINT

**Review Mode:**
- [ ] Archivo(s) target leídos
- [ ] Anti-patterns verificados contra CHECKS.md
- [ ] Report generado con severidades
- [ ] Sugerencias de fix proporcionadas

**Generate Mode:**
- [ ] Nombre validado (PascalCase)
- [ ] Ecosistema detectado
- [ ] Archivos creados según template
- [ ] index.ts con exports

**Patterns Mode:**
- [ ] Topic identificado
- [ ] Sección de PATTERNS.md cargada
- [ ] Patrones mostrados con ejemplos
