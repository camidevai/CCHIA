---
name: generate-component
version: 2.0
description: "Genera un nuevo componente siguiendo los patrones del proyecto. Se personaliza durante /genesis según el stack de frontend."
---

# Generate Component

## QUICK REFERENCE

### BLOCKING CONDITIONS
> ⛔ Si alguna es TRUE, DETENER inmediatamente

- [ ] Nombre no es PascalCase válido
- [ ] Componente con ese nombre ya existe
- [ ] Frontend framework no detectado
- [ ] Path de destino no existe

### REQUIRED OUTPUTS
> 📦 Archivos que DEBEN existir al finalizar

- [ ] `{ComponentName}/{ComponentName}.tsx` (o .vue/.svelte)
- [ ] `{ComponentName}/index.ts` con re-exports
- [ ] `{ComponentName}/{ComponentName}.test.tsx` (si `--with-tests`)
- [ ] `{ComponentName}/{ComponentName}.stories.tsx` (si `--with-stories`)

### PHASES OVERVIEW
```
PHASE 1 → PHASE 2 → PHASE 3 → PHASE 4
VALIDATE  CREATE    GENERATE  EXPORT
   ↓        ↓          ↓         ↓
 Name     Folder     Files     index.ts
 valid    created    created   updated
```

### PARAMETERS
| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `--name` | Nombre del componente | Requerido |
| `--path` | Ruta de destino | src/components |
| `--with-tests` | Generar tests | false |
| `--with-stories` | Generar Storybook | false |

---

## Overview

Skill de proyecto para generar componentes de UI siguiendo los patrones establecidos en el proyecto.

> **NOTA**: Este skill se personaliza durante /genesis según el framework (React, Vue, Svelte, etc.) y las convenciones del proyecto.

## Parámetros

- `--name {nombre}`: Nombre del componente (requerido)
- `--path {ruta}`: Ruta donde crear (default: src/components)
- `--with-tests`: Generar archivo de tests
- `--with-stories`: Generar archivo de Storybook

## Template base (React + TypeScript)

### Estructura generada

```
{path}/{ComponentName}/
├── {ComponentName}.tsx      # Componente
├── {ComponentName}.test.tsx # Tests (si --with-tests)
├── {ComponentName}.stories.tsx # Stories (si --with-stories)
└── index.ts                 # Re-export
```

### {ComponentName}.tsx

```tsx
import { type FC } from 'react';

interface {ComponentName}Props {
  // TODO: Define props
}

export const {ComponentName}: FC<{ComponentName}Props> = (props) => {
  return (
    <div>
      {/* TODO: Implement component */}
    </div>
  );
};
```

### {ComponentName}.test.tsx

```tsx
import { render, screen } from '@testing-library/react';
import { {ComponentName} } from './{ComponentName}';

describe('{ComponentName}', () => {
  it('renders correctly', () => {
    render(<{ComponentName} />);
    // TODO: Add assertions
  });
});
```

### index.ts

```typescript
export { {ComponentName} } from './{ComponentName}';
export type { {ComponentName}Props } from './{ComponentName}';
```

## Proceso

1. **Validar nombre**: PascalCase, no existe ya
2. **Crear carpeta**: En la ruta especificada
3. **Generar archivos**: Según flags y template
4. **Actualizar exports**: Si hay barrel file

## Convenciones (configurables en génesis)

- Naming: PascalCase para componentes
- Un componente por archivo
- Props interface con sufijo Props
- Tests co-localizados
- Re-export desde index

## Personalización

Durante /genesis, este skill se adapta según:

### React
- Functional components con hooks
- TypeScript interfaces para props
- Testing Library para tests

### Vue
- Composition API con `<script setup>`
- Props con defineProps
- Vitest + Vue Test Utils

### Svelte
- Archivos .svelte
- Props con export let
- Svelte Testing Library

## Output

```
✅ Componente generado: {ComponentName}

📁 Archivos creados:
   - {path}/{ComponentName}/{ComponentName}.tsx
   - {path}/{ComponentName}/{ComponentName}.test.tsx (si aplica)
   - {path}/{ComponentName}/index.ts

👉 Siguiente: Implementa la lógica del componente
```

---

## FINAL CHECKPOINT

Antes de terminar, verificar:

- [ ] Nombre validado (PascalCase, no existe)
- [ ] Carpeta del componente creada
- [ ] Archivo de componente creado con template
- [ ] index.ts con re-exports creado
- [ ] Tests creados (si `--with-tests`)
- [ ] Stories creados (si `--with-stories`)
- [ ] Output mostrado con archivos creados
