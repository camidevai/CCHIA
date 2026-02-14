---
name: code-style
scope: code
---

# Estilo de Código

## Aplica a
Todo el código fuente del proyecto.

## Reglas generales

### Naming
- **Variables/funciones**: camelCase
- **Clases/componentes**: PascalCase
- **Constantes**: UPPER_SNAKE_CASE
- **Archivos**: kebab-case.ts o PascalCase.tsx (componentes)

### Formato
- Indentación: 2 espacios
- Máximo 100 caracteres por línea
- Una línea en blanco entre bloques lógicos
- Sin líneas en blanco al final del archivo

### Imports
- Ordenar: externos → internos → relativos
- Agrupar por tipo
- No usar `import *`

### Funciones
- Funciones pequeñas (< 30 líneas ideal)
- Un nivel de abstracción por función
- Nombres descriptivos que indiquen qué hace

### Comentarios
- Código auto-documentado preferido
- Comentar el "por qué", no el "qué"
- TODO/FIXME con contexto

## Ejemplos

### Correcto
```typescript
// Constantes arriba
const MAX_RETRY_ATTEMPTS = 3;

// Función con nombre descriptivo
function calculateTotalPrice(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

// Comentario explicando decisión
// Usamos retry exponencial porque la API tiene rate limiting
async function fetchWithRetry(url: string): Promise<Response> {
  // ...
}
```

### Incorrecto
```typescript
// Nombre no descriptivo
function calc(x) {
  return x.reduce((a, b) => a + b.p * b.q, 0);
}

// Comentario innecesario
// Suma los precios
function sumPrices(items) {
  return items.reduce((t, i) => t + i.price, 0);
}
```

## Test Files

### Naming
- **Test files**: `{nombre}.test.ts` o `{nombre}.spec.ts` (consistente dentro del proyecto)
- **Test directories**: `__tests__/` junto al codigo o `tests/` en raiz
- **Mocks**: `__mocks__/{modulo}.ts`
- **Fixtures**: `__fixtures__/{nombre}.ts` o `fixtures/{nombre}.json`
- **Factories**: `{nombre}.factory.ts`

### Ubicacion
| Estrategia | Estructura | Cuando usar |
|-----------|-----------|-------------|
| Co-located | `src/auth/login.tsx` + `src/auth/login.test.tsx` | Default para unit tests |
| Centralized | `tests/unit/auth/login.test.tsx` | Proyectos grandes con muchos tests |
| Hybrid | Unit co-located + Integration/E2E en `tests/` | Proyectos con multiples niveles |

### Estructura interna
```typescript
// Agrupacion con describe
describe('LoginForm', () => {
  describe('rendering', () => {
    it('renders email input', () => {});
    it('renders password input', () => {});
  });

  describe('validation', () => {
    it('shows error for invalid email', () => {});
  });

  describe('submission', () => {
    it('calls onSubmit with form data', () => {});
  });
});
```

### Convenciones de nombres de tests
```typescript
// Correcto: describe que hace
it('validates email format before submission', () => {});

// Incorrecto: ambiguo
it('should work', () => {});
it('test 1', () => {});
```

## Razon
Codigo consistente es mas facil de leer, mantener y revisar. Reduce la carga cognitiva del equipo.

## Herramientas
- ESLint/Prettier (JS/TS)
- Ruff/Black (Python)
- rustfmt (Rust)
- gofmt (Go)
