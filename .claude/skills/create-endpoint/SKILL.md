---
name: create-endpoint
version: 2.0
description: "Genera un nuevo endpoint de API siguiendo los patrones del proyecto. Se personaliza durante /genesis según el stack de backend."
---

# Create Endpoint

## QUICK REFERENCE

### BLOCKING CONDITIONS
> ⛔ Si alguna es TRUE, DETENER inmediatamente

- [ ] Método HTTP inválido
- [ ] Path con formato incorrecto
- [ ] Resource ya existe con mismo path/método
- [ ] Backend framework no detectado

### REQUIRED OUTPUTS
> 📦 Archivos que DEBEN existir al finalizar

- [ ] `{resource}.routes.ts` (o equivalente)
- [ ] `{resource}.controller.ts` (o equivalente)
- [ ] `{resource}.validator.ts` (o equivalente)
- [ ] Ruta registrada en index de rutas
- [ ] `{resource}.test.ts` (si `--with-tests`)

### PHASES OVERVIEW
```
PHASE 1 → PHASE 2 → PHASE 3 → PHASE 4
VALIDATE  DETECT    GENERATE  REGISTER
   ↓        ↓          ↓         ↓
 Params  Resource   Files     Routes
 valid   name       created   index
```

### PARAMETERS
| Parámetro | Descripción | Requerido |
|-----------|-------------|-----------|
| `--method` | GET/POST/PUT/PATCH/DELETE | Sí |
| `--path` | Ruta del endpoint | Sí |
| `--name` | Nombre del handler | No (deriva de path) |
| `--with-tests` | Generar tests | No |

---

## Overview

Skill de proyecto para generar endpoints de API siguiendo los patrones establecidos en el proyecto.

> **NOTA**: Este skill se personaliza durante /genesis según el framework (Express, FastAPI, NestJS, etc.) y las convenciones del proyecto.

## Parámetros

- `--method {GET|POST|PUT|PATCH|DELETE}`: Método HTTP (requerido)
- `--path {ruta}`: Ruta del endpoint (requerido)
- `--name {nombre}`: Nombre del handler (opcional, se deriva de path)
- `--with-tests`: Generar tests de integración

## Template base (Express + TypeScript)

### Estructura generada

```
src/
├── routes/
│   └── {resource}.routes.ts    # Rutas
├── controllers/
│   └── {resource}.controller.ts # Lógica
├── validators/
│   └── {resource}.validator.ts  # Validación
└── __tests__/
    └── {resource}.test.ts       # Tests (si --with-tests)
```

### {resource}.routes.ts

```typescript
import { Router } from 'express';
import { {handlerName} } from '../controllers/{resource}.controller';
import { validate{Resource} } from '../validators/{resource}.validator';

const router = Router();

router.{method}('{path}', validate{Resource}, {handlerName});

export default router;
```

### {resource}.controller.ts

```typescript
import { Request, Response, NextFunction } from 'express';

export async function {handlerName}(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // TODO: Implement logic
    res.json({ message: 'Success' });
  } catch (error) {
    next(error);
  }
}
```

### {resource}.validator.ts

```typescript
import { body, param } from 'express-validator';

export const validate{Resource} = [
  // TODO: Add validation rules
];
```

### {resource}.test.ts

```typescript
import request from 'supertest';
import { app } from '../app';

describe('{METHOD} {path}', () => {
  it('returns 200 on success', async () => {
    const response = await request(app)
      .{method}('{path}')
      .expect(200);

    // TODO: Add assertions
  });
});
```

## Proceso

1. **Validar parámetros**: Método válido, path formato correcto
2. **Detectar resource**: Extraer del path (ej: /users/:id → users)
3. **Generar archivos**: Según template y flags
4. **Registrar ruta**: Actualizar routes/index.ts

## Convenciones (configurables en génesis)

### Rutas
- RESTful: `/resource`, `/resource/:id`
- Kebab-case para paths
- Versioning: `/v1/resource`

### Controllers
- Un controller por resource
- Async/await para operaciones
- Error handling centralizado

### Validación
- Validar en middleware
- Mensajes de error claros
- Sanitizar inputs

## Personalización

Durante /genesis, este skill se adapta según:

### Express
- Router de Express
- Middleware chain
- express-validator

### FastAPI
- Decoradores de ruta
- Pydantic models
- Dependency injection

### NestJS
- Controllers decorados
- DTOs con class-validator
- Services inyectados

## Output

```
✅ Endpoint generado: {METHOD} {path}

📁 Archivos creados:
   - src/routes/{resource}.routes.ts
   - src/controllers/{resource}.controller.ts
   - src/validators/{resource}.validator.ts
   - src/__tests__/{resource}.test.ts (si aplica)

📝 Ruta registrada en: src/routes/index.ts

👉 Siguiente: Implementa la lógica en el controller
```

---

## FINAL CHECKPOINT

Antes de terminar, verificar:

- [ ] Parámetros validados (método, path)
- [ ] Resource detectado del path
- [ ] Archivos generados (routes, controller, validator)
- [ ] Ruta registrada en routes/index.ts
- [ ] Tests generados (si `--with-tests`)
- [ ] Output mostrado con archivos creados
