# React Code Generators

Templates for generating React code following best practices.

---

## Component Template

### Basic Functional Component

```tsx
// {{ComponentName}}.tsx
import { type FC } from 'react';

interface {{ComponentName}}Props {
  /** Description of prop */
  // Add props here
}

export const {{ComponentName}}: FC<{{ComponentName}}Props> = (props) => {
  return (
    <div>
      {/* Implementation */}
    </div>
  );
};

{{ComponentName}}.displayName = '{{ComponentName}}';
```

### Component with State

```tsx
// {{ComponentName}}.tsx
import { type FC, useState, useCallback } from 'react';

interface {{ComponentName}}Props {
  initialValue?: string;
  onChange?: (value: string) => void;
}

export const {{ComponentName}}: FC<{{ComponentName}}Props> = ({
  initialValue = '',
  onChange,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  return (
    <div>
      {/* Implementation using value and handleChange */}
    </div>
  );
};
```

### Component with Children

```tsx
// {{ComponentName}}.tsx
import { type FC, type ReactNode } from 'react';

interface {{ComponentName}}Props {
  children: ReactNode;
  className?: string;
}

export const {{ComponentName}}: FC<{{ComponentName}}Props> = ({
  children,
  className,
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};
```

---

## Custom Hook Template

### Basic Hook

```tsx
// use{{HookName}}.ts
import { useState, useCallback } from 'react';

interface Use{{HookName}}Options {
  initialValue?: string;
}

interface Use{{HookName}}Return {
  value: string;
  setValue: (value: string) => void;
  reset: () => void;
}

export function use{{HookName}}(
  options: Use{{HookName}}Options = {}
): Use{{HookName}}Return {
  const { initialValue = '' } = options;
  const [value, setValue] = useState(initialValue);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return { value, setValue, reset };
}
```

### Async Hook

```tsx
// use{{HookName}}.ts
import { useState, useEffect, useCallback } from 'react';

interface Use{{HookName}}Return<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function use{{HookName}}<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = []
): Use{{HookName}}Return<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    const controller = new AbortController();

    refetch();

    return () => controller.abort();
  }, deps);

  return { data, isLoading, error, refetch };
}
```

### Toggle Hook

```tsx
// useToggle.ts
import { useState, useCallback } from 'react';

export function useToggle(
  initialValue = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const set = useCallback((v: boolean) => setValue(v), []);

  return [value, toggle, set];
}
```

---

## Test Template

### Component Test

```tsx
// {{ComponentName}}.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { {{ComponentName}} } from './{{ComponentName}}';

describe('{{ComponentName}}', () => {
  it('renders correctly', () => {
    render(<{{ComponentName}} />);

    expect(screen.getByRole('...')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<{{ComponentName}} onClick={handleClick} />);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('displays correct content based on props', () => {
    render(<{{ComponentName}} title="Test Title" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

### Hook Test

```tsx
// use{{HookName}}.test.ts
import { renderHook, act } from '@testing-library/react';
import { use{{HookName}} } from './use{{HookName}}';

describe('use{{HookName}}', () => {
  it('returns initial value', () => {
    const { result } = renderHook(() => use{{HookName}}());

    expect(result.current.value).toBe('');
  });

  it('updates value correctly', () => {
    const { result } = renderHook(() => use{{HookName}}());

    act(() => {
      result.current.setValue('new value');
    });

    expect(result.current.value).toBe('new value');
  });

  it('resets to initial value', () => {
    const { result } = renderHook(() =>
      use{{HookName}}({ initialValue: 'initial' })
    );

    act(() => {
      result.current.setValue('changed');
      result.current.reset();
    });

    expect(result.current.value).toBe('initial');
  });
});
```

---

## Form Template

### Form with React Hook Form + Zod

```tsx
// {{FormName}}Form.tsx
import { type FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const {{formName}}Schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type {{FormName}}FormData = z.infer<typeof {{formName}}Schema>;

interface {{FormName}}FormProps {
  onSubmit: (data: {{FormName}}FormData) => Promise<void>;
}

export const {{FormName}}Form: FC<{{FormName}}FormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<{{FormName}}FormData>({
    resolver: zodResolver({{formName}}Schema),
  });

  const handleFormSubmit = async (data: {{FormName}}FormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" role="alert">
            {errors.email.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...register('password')}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <span id="password-error" role="alert">
            {errors.password.message}
          </span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};
```

---

## Page Template

### Next.js App Router Page

```tsx
// app/{{route}}/page.tsx
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: '{{PageTitle}}',
  description: '{{PageDescription}}',
};

interface {{PageName}}PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function {{PageName}}Page({
  params,
  searchParams,
}: {{PageName}}PageProps) {
  // Fetch data here (server component)
  // const data = await fetchData(params.id);

  return (
    <main>
      <h1>{{PageTitle}}</h1>
      {/* Page content */}
    </main>
  );
}
```

### React Router Page

```tsx
// pages/{{PageName}}Page.tsx
import { type FC } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export const {{PageName}}Page: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  return (
    <main>
      <h1>{{PageTitle}}</h1>
      {/* Page content */}
    </main>
  );
};
```

---

## Index/Barrel File

```tsx
// index.ts
export { {{ComponentName}} } from './{{ComponentName}}';
export type { {{ComponentName}}Props } from './{{ComponentName}}';
```

---

## Context Template

```tsx
// {{ContextName}}Context.tsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type FC,
  type ReactNode,
} from 'react';

interface {{ContextName}}State {
  value: string;
}

interface {{ContextName}}Actions {
  setValue: (value: string) => void;
  reset: () => void;
}

type {{ContextName}}ContextValue = {{ContextName}}State & {{ContextName}}Actions;

const {{ContextName}}Context = createContext<{{ContextName}}ContextValue | null>(null);

const initialState: {{ContextName}}State = {
  value: '',
};

interface {{ContextName}}ProviderProps {
  children: ReactNode;
  initialValue?: string;
}

export const {{ContextName}}Provider: FC<{{ContextName}}ProviderProps> = ({
  children,
  initialValue = '',
}) => {
  const [state, setState] = useState<{{ContextName}}State>({
    value: initialValue,
  });

  const setValue = useCallback((value: string) => {
    setState(prev => ({ ...prev, value }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <{{ContextName}}Context.Provider value={{ ...state, setValue, reset }}>
      {children}
    </{{ContextName}}Context.Provider>
  );
};

export function use{{ContextName}}(): {{ContextName}}ContextValue {
  const context = useContext({{ContextName}}Context);
  if (!context) {
    throw new Error('use{{ContextName}} must be used within {{ContextName}}Provider');
  }
  return context;
}
```

---

## Usage

Replace placeholders:
- `{{ComponentName}}` - PascalCase component name (e.g., `UserCard`)
- `{{HookName}}` - PascalCase hook name without `use` (e.g., `User` for `useUser`)
- `{{FormName}}` - PascalCase form name (e.g., `Login`)
- `{{formName}}` - camelCase form name (e.g., `login`)
- `{{PageName}}` - PascalCase page name (e.g., `Dashboard`)
- `{{PageTitle}}` - Human-readable title (e.g., `Dashboard`)
- `{{PageDescription}}` - SEO description
- `{{ContextName}}` - PascalCase context name (e.g., `Theme`)
- `{{route}}` - URL route path (e.g., `dashboard`)
