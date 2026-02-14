---
name: add-test
version: 2.0
description: "Genera tests para un módulo existente. Analiza el código y genera tests apropiados según el tipo de módulo."
---

# Add Test

## QUICK REFERENCE

### BLOCKING CONDITIONS
> ⛔ Si alguna es TRUE, DETENER inmediatamente

- [ ] Archivo --target no existe
- [ ] Stack de testing no detectado (no jest/vitest/pytest)
- [ ] Módulo no tiene exports públicos testeables

### REQUIRED OUTPUTS
> 📦 Archivos que DEBEN existir al finalizar

- [ ] Archivo de test creado (`{module}.test.ts` o similar)
- [ ] Tests ejecutables (pasan lint)

### PHASES OVERVIEW
```
PHASE 1 → PHASE 2 → PHASE 3
ANALYZE   GENERATE  VERIFY
   ↓         ↓         ↓
 Module    Tests    Location
 type      code     + output
```

### PARAMETERS
| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `--target {path}` | Archivo a testear | Requerido |
| `--type {unit\|integration\|e2e}` | Tipo de test | unit |
| `--coverage` | Alcanzar cobertura completa | false |

---

## Overview

Skill de proyecto para generar tests para código existente. Analiza el módulo objetivo y genera tests apropiados según su tipo (componente, función, endpoint, etc.).

> **NOTA**: Este skill se personaliza durante /genesis según el stack de testing del proyecto.

## Parámetros

- `--target {path}`: Archivo a testear (requerido)
- `--type {unit|integration|e2e}`: Tipo de test (default: unit)
- `--coverage`: Intentar alcanzar cobertura completa

## Proceso

### 1. Análisis del módulo

Lee el archivo target y detecta:
- Tipo de módulo (componente, función, clase, endpoint)
- Exports públicos a testear
- Dependencias a mockear
- Casos edge detectables

### 2. Generación de tests

Según el tipo de módulo:

#### Función pura
```typescript
import { functionName } from './module';

describe('functionName', () => {
  it('handles normal input', () => {
    expect(functionName(input)).toBe(expected);
  });

  it('handles edge case', () => {
    expect(functionName(edgeInput)).toBe(edgeExpected);
  });

  it('throws on invalid input', () => {
    expect(() => functionName(invalid)).toThrow();
  });
});
```

#### Componente React
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component prop={value} />);
    expect(screen.getByText('text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    render(<Component />);
    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByText('result')).toBeInTheDocument();
  });
});
```

#### Endpoint API
```typescript
import request from 'supertest';
import { app } from '../app';

describe('GET /resource', () => {
  it('returns 200 with data', async () => {
    const response = await request(app)
      .get('/resource')
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });

  it('returns 404 for missing resource', async () => {
    await request(app)
      .get('/resource/nonexistent')
      .expect(404);
  });
});
```

### 3. Ubicación del test

Convenciones soportadas:
- Co-localizado: `module.test.ts` junto al módulo
- Carpeta __tests__: `__tests__/module.test.ts`
- Carpeta tests: `tests/module.test.ts`

Detecta la convención del proyecto y la sigue.

## Estrategia de testing

### Qué testear
- Happy path (caso normal)
- Edge cases (límites, vacíos, null)
- Error handling (inputs inválidos)
- Interacciones (si aplica)

### Qué NO testear
- Implementación interna
- Librerías de terceros
- Getters/setters triviales

### Mocks
- Mockear dependencias externas
- No mockear el módulo bajo test
- Mocks mínimos necesarios

## Convenciones de tests

```typescript
describe('ModuleName', () => {
  // Setup compartido
  beforeEach(() => {
    // reset state
  });

  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange
      const input = ...;

      // Act
      const result = method(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

## Personalización por stack

### Jest (JS/TS)
- describe/it syntax
- expect matchers
- jest.mock para mocks

### Vitest
- Compatible con Jest
- Mejor performance
- ESM nativo

### Pytest
- Funciones test_*
- fixtures para setup
- pytest.mark para categorías

## Output

```
✅ Tests generados para: {target}

📁 Archivo de test: {test_path}

📋 Tests generados:
   - {test 1 description}
   - {test 2 description}
   - {test 3 description}

📊 Cobertura estimada: {casos cubiertos}

👉 Siguiente: Ejecuta los tests con `npm test` o `/qa`
```

## Flags adicionales

### --coverage
Intenta cubrir todos los paths del código:
- Todas las ramas condicionales
- Todos los casos de error
- Todos los valores de retorno

### --type integration
Genera tests que prueban múltiples módulos juntos:
- Sin mockear dependencias internas
- Base de datos de test (si aplica)
- Servicios externos mockeados

---

## FINAL CHECKPOINT

Antes de terminar, verificar:

- [ ] Módulo target analizado correctamente
- [ ] Tipo de módulo detectado (función/componente/endpoint)
- [ ] Tests generados cubren happy path, edge cases, errors
- [ ] Ubicación de test sigue convención del proyecto
- [ ] Tests ejecutables (pasan lint, sintaxis correcta)
- [ ] Output mostrado con lista de tests generados
