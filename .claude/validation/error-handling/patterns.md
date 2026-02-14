# Error Handling Patterns

## Propósito
Patrones estándar para manejo de errores en skills y operaciones.

---

## Principios

### 1. Fallar rápido, fallar claro
- Detectar errores lo antes posible
- Mensajes que expliquen el problema Y la solución
- No ocultar errores con silencios

### 2. Recuperabilidad
- Siempre dejar el sistema en estado consistente
- Preferir rollback a estado parcial corrupto
- Documentar qué se puede y qué no se puede recuperar

### 3. Contexto útil
- Incluir información para debugging
- Request ID / Session ID para correlación
- Stack trace solo en logs, no en UI

---

## Tipos de Errores

### Errores Operacionales (esperados)
```
- Archivo no existe
- Permiso denegado
- Red no disponible
- Input inválido
- Recurso no encontrado
```

**Tratamiento:**
- Mensaje claro al usuario
- Sugerir solución
- No requiere investigación

### Errores de Programación (bugs)
```
- Null pointer
- División por cero
- Type mismatch
- Assertion failed
```

**Tratamiento:**
- Loggear con contexto completo
- Mensaje genérico al usuario
- Requiere investigación

---

## Patrones de Manejo

### 1. Try-Catch Estructurado

```typescript
try {
  await operation();
} catch (error) {
  if (isOperationalError(error)) {
    // Error esperado - manejar específicamente
    handleOperationalError(error);
  } else {
    // Bug - loggear y re-throw o mensaje genérico
    logger.error('Unexpected error', { error, context });
    throw new InternalError('Operación fallida', { cause: error });
  }
}
```

### 2. Result Type (evitar excepciones)

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

async function safeOperation(): Promise<Result<Data>> {
  try {
    const data = await riskyOperation();
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

// Uso
const result = await safeOperation();
if (!result.success) {
  showError(result.error);
  return;
}
useData(result.data);
```

### 3. Error Wrapper con Contexto

```typescript
class OperationError extends Error {
  constructor(
    public code: string,
    message: string,
    public context: Record<string, any> = {},
    public cause?: Error
  ) {
    super(message);
    this.name = 'OperationError';
  }

  toUserMessage(): string {
    return `${this.message}\n\nCódigo: ${this.code}`;
  }
}

// Uso
throw new OperationError(
  'FILE_NOT_FOUND',
  'No se encontró el archivo de configuración',
  { path: configPath, searched: searchedPaths },
  originalError
);
```

### 4. Retry con Backoff

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    retryOn: (error: Error) => boolean;
  }
): Promise<T> {
  let lastError: Error;
  let delay = options.initialDelay;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!options.retryOn(error) || attempt === options.maxAttempts) {
        throw error;
      }

      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, {
        error: error.message
      });

      await sleep(delay);
      delay = Math.min(delay * 2, options.maxDelay);
    }
  }

  throw lastError;
}

// Uso
const result = await withRetry(
  () => fetchFromAPI(url),
  {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    retryOn: (e) => e.code === 'ETIMEDOUT' || e.code === 'ECONNRESET'
  }
);
```

### 5. Circuit Breaker

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure?: Date;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number = 5,
    private timeout: number = 30000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure!.getTime() > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailure = new Date();
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}
```

---

## Rollback Patterns

### 1. Checkpoint y Restore

```typescript
interface Checkpoint {
  id: string;
  timestamp: Date;
  state: any;
}

async function withCheckpoint<T>(
  operation: (checkpoint: Checkpoint) => Promise<T>
): Promise<T> {
  const checkpoint = await createCheckpoint();

  try {
    return await operation(checkpoint);
  } catch (error) {
    await restoreCheckpoint(checkpoint);
    throw new OperationRolledBackError(
      'Operación revertida debido a error',
      { checkpoint: checkpoint.id, cause: error }
    );
  }
}
```

### 2. Saga Pattern (operaciones múltiples)

```typescript
interface SagaStep<T> {
  name: string;
  execute: () => Promise<T>;
  compensate: (result: T) => Promise<void>;
}

async function executeSaga(steps: SagaStep<any>[]): Promise<void> {
  const completed: { step: SagaStep<any>; result: any }[] = [];

  try {
    for (const step of steps) {
      const result = await step.execute();
      completed.push({ step, result });
    }
  } catch (error) {
    // Compensar en orden inverso
    for (const { step, result } of completed.reverse()) {
      try {
        await step.compensate(result);
      } catch (compensateError) {
        logger.error(`Failed to compensate ${step.name}`, {
          error: compensateError
        });
      }
    }
    throw error;
  }
}

// Uso
await executeSaga([
  {
    name: 'createOrder',
    execute: async () => await createOrder(data),
    compensate: async (order) => await deleteOrder(order.id)
  },
  {
    name: 'chargePayment',
    execute: async () => await chargeCard(paymentData),
    compensate: async (charge) => await refundCharge(charge.id)
  },
  {
    name: 'updateInventory',
    execute: async () => await decrementStock(items),
    compensate: async (snapshot) => await restoreStock(snapshot)
  }
]);
```

### 3. Git-based Rollback

```bash
# Antes de operación peligrosa
BACKUP_BRANCH="backup-$(date +%Y%m%d-%H%M%S)"
git branch $BACKUP_BRANCH

# Operación...

# Si falla
git reset --hard $BACKUP_BRANCH
git branch -D $BACKUP_BRANCH
```

---

## Mensajes de Error

### Formato estándar

```
[EMOJI] [CÓDIGO]: [Título breve]

Problema:
  [Descripción del problema]
  [Contexto relevante]

Causa:
  [Si se conoce la causa raíz]

Solución:
  [Pasos concretos para resolver]

  [Comandos si aplica]

Alternativas:
  [Otras opciones si las hay]
```

### Ejemplos

```
❌ FILE_LOCKED: No se puede modificar el archivo

Problema:
  El archivo src/config.ts está siendo usado por otro proceso.

Causa:
  Probablemente tu editor tiene el archivo abierto.

Solución:
  1. Cierra el archivo en tu editor
  2. Ejecuta el comando de nuevo

Alternativa:
  Usa --force para forzar la escritura (no recomendado)
```

```
⚠️ NETWORK_TIMEOUT: La conexión tardó demasiado

Problema:
  No se pudo conectar a api.github.com en 30 segundos.

Causa posible:
  - Conexión a internet inestable
  - Firewall bloqueando la conexión
  - Servicio de GitHub con problemas

Solución:
  1. Verifica tu conexión a internet
  2. Prueba: ping api.github.com
  3. Revisa status.github.com

El skill continuará sin esta funcionalidad.
```

---

## Logging de Errores

### Qué incluir

```typescript
logger.error('Operation failed', {
  // Identificación
  requestId: context.requestId,
  sessionId: context.sessionId,
  skill: context.skillName,

  // Error info
  errorCode: error.code,
  errorMessage: error.message,
  errorStack: error.stack,

  // Contexto
  input: sanitize(input),
  state: getCurrentState(),

  // Timing
  duration: Date.now() - startTime,
  timestamp: new Date().toISOString()
});
```

### Qué NO incluir

```typescript
// NUNCA loggear
- Passwords
- Tokens/API keys
- Datos personales (PII)
- Números de tarjeta
- Secrets de cualquier tipo
```

---

## Checklist Error Handling

### Por operación
- [ ] Try-catch alrededor de operaciones que pueden fallar
- [ ] Errores específicos vs genéricos identificados
- [ ] Mensaje claro con solución
- [ ] Rollback si es operación destructiva
- [ ] Logging con contexto

### Por skill
- [ ] Pre-checks antes de operaciones
- [ ] Estado consistente garantizado al salir
- [ ] Sesión documenta errores encontrados
- [ ] Siguiente paso sugerido incluso en error

---

## 6. Worktree-Specific Error Handling

### Error: Branch already checked out

```
fatal: 'develop' is already checked out at '/path/.worktrees/environments/dev'
```

**Causa:** Intentar `git checkout develop` en repo principal cuando worktrees están activos.
**Solución:**
```bash
# No hacer checkout, operar directamente en el worktree:
cd .worktrees/environments/dev
# Ejecutar operaciones sobre develop aquí
```

### Error: Merge lock timeout

```
⛔ Merge en progreso para {feature}. Iniciado hace {N} minutos.
```

**Causa:** Otro merge no completó o falló sin liberar lock.
**Solución:**
```bash
# Verificar si el merge realmente está en progreso
cd .worktrees/environments/dev
git status

# Si no hay merge en progreso, el lock es stale:
rm .worktrees/.meta/merge.lock
echo "Lock stale eliminado"

# Si hay merge en progreso:
git merge --abort  # Si se desea cancelar
# O completar el merge manualmente
```

### Error: Detached HEAD recovery

```
HEAD detached at abc1234
```

**Causa:** qa/ o prod/ siempre usan detached HEAD. Esto es normal.
**Acción:** No intentar hacer checkout de un branch. Sincronizar con:
```bash
# Para qa/:
cd .worktrees/environments/qa
git fetch origin develop
git reset --hard origin/develop

# Para prod/:
cd .worktrees/environments/prod
git fetch origin main
git reset --hard origin/main
```

### Error: Auto-stash failed

```
error: Your local changes would be overwritten by merge
```

**Causa:** Cambios en dev/ que no se pudieron stashear antes de una operación.
**Solución:**
```bash
cd .worktrees/environments/dev
git stash push -m "manual stash before operation"
# Reintentar la operación
# Después: git stash pop (si se quieren recuperar los cambios)
```

### Error: Worktree path already exists

```
fatal: '.worktrees/features/feature-auth' already exists
```

**Causa:** Worktree no fue limpiado correctamente.
**Solución:**
```bash
# Verificar si el worktree aún está registrado
git worktree list

# Si está registrado pero corrupto:
git worktree remove .worktrees/features/feature-auth --force

# Si no está registrado pero el directorio existe:
rm -rf .worktrees/features/feature-auth
git worktree prune
```
