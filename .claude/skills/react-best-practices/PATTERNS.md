# React Patterns Reference

> Lazy-load by section marker. Each section is self-contained.

---

## [SECTION:core]

### Component Patterns

```tsx
// Typed functional component
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = ({
  variant,
  onClick,
  children,
  disabled = false
}) => (
  <button
    className={`btn btn-${variant}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);
```

### Custom Hook Pattern

```tsx
// Return typed tuple for simple hooks
function useToggle(initial = false): [boolean, () => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle];
}

// Return object for complex hooks
interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function useUser(id: string): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchUser(id);
      setUser(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { refetch(); }, [refetch]);

  return { user, isLoading, error, refetch };
}
```

### Compound Component Pattern

```tsx
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function Tabs({ children, defaultTab }: { children: ReactNode; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

function TabList({ children }: { children: ReactNode }) {
  return <div role="tablist">{children}</div>;
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tab must be inside Tabs');
  return (
    <button
      role="tab"
      aria-selected={ctx.activeTab === id}
      onClick={() => ctx.setActiveTab(id)}
    >
      {children}
    </button>
  );
}

Tabs.List = TabList;
Tabs.Tab = Tab;
```

### Render Props Pattern

```tsx
interface RenderProps<T> {
  data: T;
  isLoading: boolean;
}

interface DataFetcherProps<T> {
  url: string;
  children: (props: RenderProps<T>) => ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const { data, isLoading } = useFetch<T>(url);
  return <>{children({ data, isLoading })}</>;
}

// Usage
<DataFetcher<User[]> url="/api/users">
  {({ data, isLoading }) => isLoading ? <Spinner /> : <UserList users={data} />}
</DataFetcher>
```

## [/SECTION:core]

---

## [SECTION:state]

### Context with Reducer

```tsx
interface State {
  count: number;
  step: number;
}

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setStep'; payload: number };

const initialState: State = { count: 0, step: 1 };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment': return { ...state, count: state.count + state.step };
    case 'decrement': return { ...state, count: state.count - state.step };
    case 'setStep': return { ...state, step: action.payload };
  }
}

const CounterContext = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
} | null>(null);

export function CounterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <CounterContext.Provider value={{ state, dispatch }}>
      {children}
    </CounterContext.Provider>
  );
}

export function useCounter() {
  const ctx = useContext(CounterContext);
  if (!ctx) throw new Error('useCounter must be inside CounterProvider');
  return ctx;
}
```

### Zustand Pattern

```tsx
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        login: async (email, password) => {
          const { user, token } = await authApi.login(email, password);
          set({ user, token });
        },
        logout: () => set({ user: null, token: null }),
      }),
      { name: 'auth-storage' }
    )
  )
);

// Selectors for performance
const useUser = () => useAuthStore((s) => s.user);
const useIsAuthenticated = () => useAuthStore((s) => !!s.token);
```

### Jotai Pattern

```tsx
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

// Primitive atom
const countAtom = atom(0);

// Derived atom (read-only)
const doubleCountAtom = atom((get) => get(countAtom) * 2);

// Writable derived atom
const countWithMaxAtom = atom(
  (get) => get(countAtom),
  (get, set, newValue: number) => {
    set(countAtom, Math.min(newValue, 100));
  }
);

// Async atom
const userAtom = atom(async () => {
  const res = await fetch('/api/user');
  return res.json();
});

// Usage
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const double = useAtomValue(doubleCountAtom);
  return <button onClick={() => setCount(c => c + 1)}>{count} ({double})</button>;
}
```

### Redux Toolkit Pattern

```tsx
import { createSlice, configureStore, createAsyncThunk } from '@reduxjs/toolkit';

interface TodoState {
  items: Todo[];
  status: 'idle' | 'loading' | 'failed';
}

const fetchTodos = createAsyncThunk('todos/fetch', async () => {
  const res = await fetch('/api/todos');
  return res.json() as Promise<Todo[]>;
});

const todosSlice = createSlice({
  name: 'todos',
  initialState: { items: [], status: 'idle' } as TodoState,
  reducers: {
    add: (state, action: PayloadAction<Todo>) => {
      state.items.push(action.payload);
    },
    remove: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(t => t.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      });
  },
});

// Typed hooks
const useAppDispatch = useDispatch.withTypes<AppDispatch>();
const useAppSelector = useSelector.withTypes<RootState>();
```

## [/SECTION:state]

---

## [SECTION:routing]

### React Router v6

```tsx
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useParams,
  useSearchParams,
  useNavigate,
  Navigate,
} from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: 'users/:id', element: <UserProfile />, loader: userLoader },
      { path: 'admin', element: <ProtectedRoute><Admin /></ProtectedRoute> },
    ],
  },
]);

// Protected route pattern
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Data loading with loader
async function userLoader({ params }: LoaderFunctionArgs) {
  return fetch(`/api/users/${params.id}`);
}
```

### Next.js App Router

```tsx
// app/users/[id]/page.tsx
interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | undefined };
}

export default async function UserPage({ params }: PageProps) {
  const user = await getUser(params.id);
  return <UserProfile user={user} />;
}

// Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = await getUser(params.id);
  return { title: user.name };
}

// Static params
export async function generateStaticParams() {
  const users = await getUsers();
  return users.map((user) => ({ id: user.id }));
}

// Layout with parallel routes
// app/dashboard/@analytics/page.tsx
// app/dashboard/@team/page.tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: ReactNode;
  analytics: ReactNode;
  team: ReactNode;
}) {
  return (
    <div>
      {children}
      <div className="grid grid-cols-2">
        {analytics}
        {team}
      </div>
    </div>
  );
}
```

### Remix Pattern

```tsx
// routes/users.$id.tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Form, useNavigation } from '@remix-run/react';

export async function loader({ params }: LoaderFunctionArgs) {
  const user = await getUser(params.id);
  if (!user) throw new Response('Not Found', { status: 404 });
  return json({ user });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  await updateUser(params.id, Object.fromEntries(formData));
  return json({ success: true });
}

export default function UserRoute() {
  const { user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <Form method="post">
      <input name="name" defaultValue={user.name} />
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </Form>
  );
}
```

## [/SECTION:routing]

---

## [SECTION:data]

### TanStack Query

```tsx
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

// Query with typed response
function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes (was cacheTime)
  });
}

// Mutation with optimistic update
function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ['user', newUser.id] });
      const previous = queryClient.getQueryData(['user', newUser.id]);
      queryClient.setQueryData(['user', newUser.id], newUser);
      return { previous };
    },
    onError: (err, newUser, context) => {
      queryClient.setQueryData(['user', newUser.id], context?.previous);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
}

// Prefetching
function UserList() {
  const queryClient = useQueryClient();

  const prefetchUser = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['user', id],
      queryFn: () => fetchUser(id),
    });
  };

  return (
    <ul>
      {users.map(user => (
        <li key={user.id} onMouseEnter={() => prefetchUser(user.id)}>
          <Link to={`/users/${user.id}`}>{user.name}</Link>
        </li>
      ))}
    </ul>
  );
}
```

### SWR Pattern

```tsx
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function useUser(id: string) {
  const { data, error, isLoading, isValidating } = useSWR<User>(
    `/api/users/${id}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    user: data,
    isLoading,
    isError: error,
    isValidating,
  };
}

// Optimistic mutation
async function updateUser(id: string, updates: Partial<User>) {
  // Optimistic update
  mutate(`/api/users/${id}`, { ...currentUser, ...updates }, false);

  // API call
  await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

  // Revalidate
  mutate(`/api/users/${id}`);
}
```

### Server Components (Next.js)

```tsx
// Server Component (default in app/)
async function UserList() {
  const users = await db.user.findMany();
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          <UserCard user={user} />
        </li>
      ))}
    </ul>
  );
}

// Client Component for interactivity
'use client';

function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);
  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? 'Unlike' : 'Like'}
    </button>
  );
}

// Server Actions
async function createPost(formData: FormData) {
  'use server';
  const title = formData.get('title') as string;
  await db.post.create({ data: { title } });
  revalidatePath('/posts');
}
```

## [/SECTION:data]

---

## [SECTION:forms]

### React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await signUp(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <input type="password" {...register('confirmPassword')} />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}

      <button disabled={isSubmitting}>
        {isSubmitting ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

### Formik + Yup

```tsx
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(8, 'Min 8 characters').required('Required'),
});

function LoginForm() {
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        await login(values);
        setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <Field name="email" type="email" />
          <ErrorMessage name="email" component="span" />

          <Field name="password" type="password" />
          <ErrorMessage name="password" component="span" />

          <button type="submit" disabled={isSubmitting}>
            Login
          </button>
        </Form>
      )}
    </Formik>
  );
}
```

### Controlled Form Pattern

```tsx
interface FormState {
  name: string;
  email: string;
  role: 'admin' | 'user';
}

function useForm<T extends Record<string, unknown>>(initial: T) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const reset = () => setValues(initial);

  return { values, errors, setErrors, handleChange, reset };
}
```

## [/SECTION:forms]

---

## [SECTION:styling]

### Tailwind + cn utility

```tsx
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const buttonVariants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  ghost: 'bg-transparent hover:bg-gray-100',
};

const buttonSizes = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'rounded font-medium transition-colors',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    />
  );
}
```

### CSS Modules

```tsx
// Button.module.css
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}

.primary {
  background: var(--color-primary);
  color: white;
}

// Button.tsx
import styles from './Button.module.css';

function Button({ variant = 'primary', children }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      {children}
    </button>
  );
}
```

### Styled Components / Emotion

```tsx
import styled from '@emotion/styled';

interface ButtonProps {
  $variant: 'primary' | 'secondary';
}

const StyledButton = styled.button<ButtonProps>`
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  background: ${({ $variant }) =>
    $variant === 'primary' ? 'var(--color-primary)' : 'var(--color-secondary)'};
  color: ${({ $variant }) =>
    $variant === 'primary' ? 'white' : 'black'};

  &:hover {
    opacity: 0.9;
  }
`;

// Theme provider
const theme = {
  colors: { primary: '#3b82f6', secondary: '#e5e7eb' },
  spacing: { sm: '0.5rem', md: '1rem', lg: '1.5rem' },
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <StyledButton $variant="primary">Click me</StyledButton>
    </ThemeProvider>
  );
}
```

## [/SECTION:styling]

---

## [SECTION:animations]

### Framer Motion

```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Basic animation
function FadeIn({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// List animation
function AnimatedList({ items }: { items: string[] }) {
  return (
    <AnimatePresence>
      {items.map(item => (
        <motion.li
          key={item}
          layout
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          {item}
        </motion.li>
      ))}
    </AnimatePresence>
  );
}

// Gesture-based
function DraggableCard() {
  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Drag me
    </motion.div>
  );
}
```

### Accessibility: Reduced Motion

```tsx
import { useReducedMotion } from 'framer-motion';

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ x: 100 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5 }}
    >
      Content
    </motion.div>
  );
}

// CSS approach
const fadeIn = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .fade-in {
      animation: none;
    }
  }
`;
```

## [/SECTION:animations]

---

## [SECTION:ui]

### Radix UI Primitives

```tsx
import * as Dialog from '@radix-ui/react-dialog';

function Modal({ trigger, title, children }: {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg">
          <Dialog.Title className="text-lg font-bold">{title}</Dialog.Title>
          <Dialog.Description className="text-gray-600">
            {children}
          </Dialog.Description>
          <Dialog.Close asChild>
            <button className="absolute top-2 right-2">X</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### Shadcn/ui Pattern

```tsx
// components/ui/button.tsx (generated by shadcn)
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}
```

### Headless UI Pattern

```tsx
import { Menu, Transition } from '@headlessui/react';

function Dropdown() {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="px-4 py-2 bg-blue-600 text-white rounded">
        Options
      </Menu.Button>
      <Transition
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Menu.Items className="absolute mt-2 w-56 bg-white rounded shadow-lg">
          <Menu.Item>
            {({ active }) => (
              <button className={`${active && 'bg-blue-100'} w-full text-left px-4 py-2`}>
                Edit
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button className={`${active && 'bg-blue-100'} w-full text-left px-4 py-2`}>
                Delete
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
```

## [/SECTION:ui]

---

## [SECTION:auth]

### NextAuth.js

```tsx
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const user = await verifyUser(credentials.email, credentials.password);
        return user ?? null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = request.nextUrl.pathname.startsWith('/dashboard');
      if (isProtected && !isLoggedIn) return false;
      return true;
    },
  },
});

// middleware.ts
export { auth as middleware } from './auth';
export const config = { matcher: ['/dashboard/:path*'] };

// Usage in component
import { auth } from './auth';

async function Dashboard() {
  const session = await auth();
  if (!session) redirect('/login');
  return <div>Welcome {session.user.name}</div>;
}
```

### Clerk Integration

```tsx
import {
  ClerkProvider,
  SignIn,
  SignUp,
  UserButton,
  useUser,
  useAuth,
} from '@clerk/nextjs';

// layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html>
        <body>
          <header>
            <UserButton afterSignOutUrl="/" />
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

// Protected page
function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return <Spinner />;
  if (!isSignedIn) return <RedirectToSignIn />;

  return <div>Welcome {user.firstName}</div>;
}

// middleware.ts
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/about'],
});
```

### Protected Route Pattern

```tsx
interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check session on mount
    checkSession().then(setUser).finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const user = await authApi.login(email, password);
    setUser(user);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  if (isLoading) return <Spinner />;
  if (!user) return null;
  return <>{children}</>;
}
```

## [/SECTION:auth]

---

## [SECTION:i18n]

### react-i18next

```tsx
import i18n from 'i18next';
import { initReactI18next, useTranslation, Trans } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        welcome: 'Welcome, {{name}}!',
        items: '{{count}} item',
        items_plural: '{{count}} items',
      },
    },
    es: {
      translation: {
        welcome: 'Bienvenido, {{name}}!',
        items: '{{count}} artículo',
        items_plural: '{{count}} artículos',
      },
    },
  },
  lng: 'en',
  fallbackLng: 'en',
});

function Greeting({ name }: { name: string }) {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <p>{t('welcome', { name })}</p>
      <p>{t('items', { count: 5 })}</p>
      <button onClick={() => i18n.changeLanguage('es')}>Español</button>
    </div>
  );
}

// Rich text with Trans component
function RichText() {
  return (
    <Trans i18nKey="description">
      Read the <a href="/docs">documentation</a> for more info.
    </Trans>
  );
}
```

### next-intl

```tsx
// messages/en.json
{
  "HomePage": {
    "title": "Welcome",
    "items": "{count, plural, one {# item} other {# items}}"
  }
}

// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// Component usage
import { useTranslations } from 'next-intl';

function HomePage() {
  const t = useTranslations('HomePage');
  return <h1>{t('title')}</h1>;
}

// Server component
import { getTranslations } from 'next-intl/server';

async function ServerComponent() {
  const t = await getTranslations('HomePage');
  return <h1>{t('title')}</h1>;
}
```

## [/SECTION:i18n]
