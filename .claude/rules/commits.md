---
name: commits
scope: commits
---

# Convenciones de Commits

## Aplica a
Todos los commits en el repositorio.

## Formato

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Tipos permitidos

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Cambios en documentación |
| `style` | Formato (no afecta código) |
| `refactor` | Refactorización |
| `test` | Agregar o modificar tests |
| `chore` | Tareas de mantenimiento |
| `perf` | Mejoras de performance |

## Reglas

### 1. Descripción
- Imperativo: "add" no "added" ni "adding"
- Primera letra minúscula
- Sin punto al final
- Máximo 72 caracteres

### 2. Scope (opcional)
- Nombre del módulo/feature afectado
- En minúsculas
- Ejemplos: `auth`, `api`, `ui`

### 3. Body (opcional)
- Explicar "qué" y "por qué", no "cómo"
- Separado del título por línea en blanco
- Wrap a 72 caracteres

### 4. Footer (opcional)
- Referencias a issues: `Closes #123`
- Breaking changes: `BREAKING CHANGE: descripción`
- Co-authored: `Co-Authored-By: Name <email>`

## Ejemplos

### Correcto
```
feat(auth): add password reset flow

Implements forgot password functionality with email verification.
Users can now reset their password via email link.

Closes #45
```

```
fix(api): handle timeout in user fetch

The API was failing silently on timeouts. Now it properly
throws an error that the UI can handle.
```

```
refactor(utils): simplify date formatting
```

### Incorrecto
```
Added new feature          # No type, pasado, vago
feat: Fixed the bug        # Type incorrecto, mayúscula
FEAT(AUTH): ADD LOGIN      # Todo mayúsculas
feat(auth): add login.     # Punto al final
```

## Commits atómicos

Cada commit debe:
- Compilar correctamente
- Pasar los tests
- Representar un cambio lógico único
- Poder revertirse independientemente

### Correcto
```
feat(auth): add login form component
feat(auth): add login API endpoint
feat(auth): connect login form to API
```

### Incorrecto
```
feat(auth): add login (WIP)
fix(auth): fix login bugs
feat(auth): finish login
```

## Razón

Commits bien formateados:
- Generan changelogs automáticos
- Facilitan code review
- Permiten bisect efectivo
- Documentan la historia del proyecto

## Hook de validación

Se recomienda configurar commit-msg hook para validar formato:

```bash
# .git/hooks/commit-msg
#!/bin/sh
npx commitlint --edit $1
```
