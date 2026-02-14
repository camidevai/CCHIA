# React Anti-Pattern Detection & Review

## Quick Reference Checklist

Use this checklist for rapid code review.

### State Anti-Patterns

| Anti-Pattern | Detection | Fix |
|-------------|-----------|-----|
| Direct mutation | `state.x = y`, `arr.push()`, `obj.key = val` | Use spread: `{...state, x: y}`, `[...arr, item]` |
| Stale closure | State in callback without dep | Add to useCallback deps or use updater: `setState(prev => ...)` |
| Redundant state | State derived from props/other state | Compute during render or useMemo |
| Props to state sync | `useEffect(() => setState(prop))` | Use key prop or derive value |
| Initializing from fn | `useState(expensiveFn())` | Use lazy init: `useState(() => expensiveFn())` |

### Effect Anti-Patterns

| Anti-Pattern | Detection | Fix |
|-------------|-----------|-----|
| Missing deps | ESLint warning, stale values | Add all deps or use refs for stable identity |
| Over-fetching | No abort in cleanup | Add AbortController cleanup |
| Missing cleanup | Subscriptions, timers, listeners | Return cleanup function |
| Effect for derived | `useEffect(() => setDerived(...))` | Compute in render or useMemo |
| Effect for event | `useEffect(() => { if (x) doAction() })` | Move to event handler |

### Performance Anti-Patterns

| Anti-Pattern | Detection | Fix |
|-------------|-----------|-----|
| Inline objects | `style={{...}}`, `obj={{...}}` in JSX | Extract to const or useMemo |
| Inline functions | `onClick={() => fn(x)}` causing re-renders | useCallback or extract handler |
| Index as key | `arr.map((item, i) => <X key={i} />)` | Use stable unique ID |
| Unnecessary renders | Component re-renders with same props | React.memo for pure components |
| Large context | Single context with many values | Split contexts by update frequency |
| Missing code split | Large imports at top level | React.lazy + Suspense |

### TypeScript Anti-Patterns

| Anti-Pattern | Detection | Fix |
|-------------|-----------|-----|
| Using `any` | Type annotation `any` | Use `unknown`, proper type, or generic |
| Type assertions | `as SomeType` overuse | Narrow with guards or fix source |
| Missing return type | Function without explicit return | Add return type annotation |
| Non-null assertion | `value!.property` | Handle null case properly |
| Implicit any | Parameters without type | Add parameter types |

---

## 3-Step Review Process

### Step 1: Static Analysis

Scan for these patterns:

```
CRITICAL (must fix before merge):
- [ ] Direct state mutation (state.x = , push, pop, splice)
- [ ] Missing effect cleanup for subscriptions/timers
- [ ] useEffect with missing dependencies (if causes bugs)
- [ ] any type without justification
- [ ] Exposed secrets/hardcoded credentials

WARNING (should fix):
- [ ] Inline objects/functions in JSX (if component re-renders frequently)
- [ ] Index as key (if list is dynamic)
- [ ] useEffect for derived state
- [ ] Props drilling > 2 levels
- [ ] Component > 200 lines

INFO (consider):
- [ ] Missing displayName for DevTools
- [ ] Missing error boundary
- [ ] Missing loading states
- [ ] Missing accessibility attributes
```

### Step 2: Logic Review

Check component logic:

```
STRUCTURE:
- [ ] Single responsibility (does one thing well)
- [ ] Props interface is minimal and typed
- [ ] Side effects are controlled and cleaned up
- [ ] Error states are handled

STATE:
- [ ] Minimal state (no redundant/derived)
- [ ] State lives at lowest common ancestor
- [ ] Updates are immutable
- [ ] Complex state uses reducer

HOOKS:
- [ ] Custom hooks are extracted for reuse
- [ ] Hook rules followed (top level, conditional-free)
- [ ] Dependencies are correct
```

### Step 3: Integration Review

Check how component fits:

```
BOUNDARIES:
- [ ] Clear API (props in, events out)
- [ ] No leaking internal state
- [ ] Proper error propagation

COMPOSITION:
- [ ] Compound components where appropriate
- [ ] Render props/children for flexibility
- [ ] Context for deep prop passing

TESTING:
- [ ] Testable (pure logic extracted)
- [ ] Accessible (proper semantics, ARIA)
```

---

## Common Fixes

### Fix: State Mutation

```tsx
// WRONG
const [items, setItems] = useState([]);
const addItem = (item) => {
  items.push(item);  // Mutating!
  setItems(items);   // Same reference, no re-render
};

// RIGHT
const addItem = (item) => {
  setItems(prev => [...prev, item]);
};
```

### Fix: Effect Cleanup

```tsx
// WRONG
useEffect(() => {
  const sub = eventBus.subscribe(handler);
  // No cleanup - memory leak!
}, []);

// RIGHT
useEffect(() => {
  const sub = eventBus.subscribe(handler);
  return () => sub.unsubscribe();
}, []);
```

### Fix: Stale Closure

```tsx
// WRONG
const [count, setCount] = useState(0);
const handleClick = useCallback(() => {
  setCount(count + 1);  // Stale if count changes
}, []);  // Missing dep

// RIGHT (option 1: add dep)
const handleClick = useCallback(() => {
  setCount(count + 1);
}, [count]);

// RIGHT (option 2: updater function)
const handleClick = useCallback(() => {
  setCount(c => c + 1);  // Always fresh
}, []);
```

### Fix: Derived State

```tsx
// WRONG
const [items, setItems] = useState([]);
const [total, setTotal] = useState(0);

useEffect(() => {
  setTotal(items.reduce((sum, i) => sum + i.price, 0));
}, [items]);

// RIGHT
const [items, setItems] = useState([]);
const total = useMemo(
  () => items.reduce((sum, i) => sum + i.price, 0),
  [items]
);
```

### Fix: Inline Objects

```tsx
// WRONG - creates new object every render
<MyComponent style={{ color: 'red' }} config={{ debug: true }} />

// RIGHT - stable reference
const style = useMemo(() => ({ color: 'red' }), []);
const config = useMemo(() => ({ debug: true }), []);
<MyComponent style={style} config={config} />

// Or extract outside component if truly static
const STYLE = { color: 'red' };
const CONFIG = { debug: true };
```

### Fix: Index as Key

```tsx
// WRONG - breaks with reordering/insertion
{items.map((item, index) => (
  <Item key={index} {...item} />
))}

// RIGHT - use stable ID
{items.map(item => (
  <Item key={item.id} {...item} />
))}
```

---

## Migration Guide: Class to Functional

### State

```tsx
// Class
class Counter extends React.Component {
  state = { count: 0 };

  increment = () => {
    this.setState(prev => ({ count: prev.count + 1 }));
  };
}

// Functional
function Counter() {
  const [count, setCount] = useState(0);
  const increment = () => setCount(c => c + 1);
}
```

### Lifecycle

```tsx
// Class
componentDidMount() { fetchData(); }
componentDidUpdate(prevProps) {
  if (prevProps.id !== this.props.id) fetchData();
}
componentWillUnmount() { cleanup(); }

// Functional
useEffect(() => {
  fetchData();
  return () => cleanup();
}, [id]);  // Re-run when id changes
```

### Instance Variables

```tsx
// Class
class Timer extends React.Component {
  timerId = null;

  start = () => {
    this.timerId = setInterval(...);
  };
}

// Functional
function Timer() {
  const timerIdRef = useRef<number | null>(null);

  const start = () => {
    timerIdRef.current = setInterval(...);
  };
}
```

### Context

```tsx
// Class
static contextType = ThemeContext;
render() {
  return <div className={this.context.theme}>...</div>;
}

// Functional
function Component() {
  const theme = useContext(ThemeContext);
  return <div className={theme.theme}>...</div>;
}
```

### Error Boundaries

```tsx
// Still requires class (no hook equivalent yet)
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError(error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Wrap functional components
function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <MainContent />
    </ErrorBoundary>
  );
}
```

---

## Severity Levels

| Level | Description | Action |
|-------|-------------|--------|
| `CRITICAL` | Bugs, security issues, data loss | Block merge |
| `WARNING` | Performance, maintainability | Request fix |
| `INFO` | Style, best practices | Suggest improvement |

### Severity Assignment

```
CRITICAL:
- State mutation → bugs, unpredictable behavior
- Missing cleanup → memory leaks
- any without justification → type safety lost
- Hardcoded secrets → security vulnerability

WARNING:
- Inline objects/functions → performance (if frequent re-renders)
- Index as key → potential bugs with dynamic lists
- Large components → maintainability
- Props drilling → coupling

INFO:
- Missing displayName → debugging convenience
- Could use memo → potential optimization
- Could extract hook → reusability
```
