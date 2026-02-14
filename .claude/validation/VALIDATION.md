# Validation Layer

## Propósito
Capa de validación que asegura robustez en la ejecución de skills.
Todos los skills DEBEN ejecutar pre-checks antes de operaciones críticas.

> **Logging**: Los resultados de validación se registran en la sesión del skill que invocó la validación (`.claude/sessions/YYYY-MM-DD-{skill}-{context}.md`). No se genera archivo de log separado.

---

## Pre-checks Obligatorios

Antes de ejecutar cualquier skill, verificar las condiciones necesarias.

### Niveles de severidad

| Nivel | Acción |
|-------|--------|
| ERROR | Bloquear ejecución, no continuar |
| WARN | Mostrar advertencia, pedir confirmación |
| INFO | Notificar, continuar automáticamente |

---

## Checks Disponibles

### 1. Git Checks
Ubicación: `.claude/validation/pre-checks/git.md`

```markdown
[ ] Repositorio git existe
[ ] Estado del working tree
[ ] Remote configurado
[ ] Branch actual identificado
[ ] No hay merge/rebase en progreso
```

### 2. Tools Checks
Ubicación: `.claude/validation/pre-checks/tools.md`

```markdown
[ ] Herramientas del stack instaladas
[ ] Versiones mínimas cumplidas
[ ] Variables de entorno requeridas
```

**Algoritmo de detección de stack** (autoritativo en `qa/SKILL.md` Phase 2):

```bash
# Detección por archivos de configuración:
if [ -f "package.json" ]; then STACK="node"; fi
if [ -f "pyproject.toml" ] || [ -f "requirements.txt" ]; then STACK="python"; fi
if [ -f "go.mod" ]; then STACK="go"; fi
if [ -f "Cargo.toml" ]; then STACK="rust"; fi

# Prioridad de detección: package.json > pyproject.toml > go.mod > Cargo.toml
# Multi-stack: si se detectan múltiples, ejecutar checks de cada uno
# Si no se detecta stack: WARNING y solicitar configuración manual
```

### 3. Files Checks
```markdown
[ ] Archivos requeridos existen
[ ] Permisos de escritura
[ ] Espacio en disco suficiente
```

---

## Integración con Skills

### Template de Pre-checks

Cada skill debe incluir al inicio:

```markdown
## Pre-checks

Ejecutar antes de comenzar:

1. **Git** (si aplica):
   - Verificar repo existe
   - Estado limpio o advertir

2. **Herramientas** (según stack):
   - Verificar instalación
   - Sugerir instalación si falta

3. **Archivos** (según skill):
   - Verificar existencia
   - Verificar permisos

### Si un check falla:

- ERROR → Mostrar mensaje claro, no continuar
- WARN → Mostrar advertencia, preguntar si continuar
- INFO → Notificar, continuar
```

---

## Mensajes de Error Claros

### Formato de error

```
❌ [TIPO]: [Descripción breve]

Problema:
  [Descripción detallada del problema]

Solución:
  [Pasos para resolver]

Comando sugerido:
  [Comando si aplica]
```

### Ejemplos

```
❌ GIT_NOT_FOUND: No se encontró repositorio git

Problema:
  El directorio actual no es un repositorio git.
  Algunos skills requieren git para funcionar.

Solución:
  Inicializa un repositorio git:

  git init
```

```
❌ TOOL_MISSING: npm no está instalado

Problema:
  Este proyecto usa Node.js pero npm no está disponible.

Solución:
  Instala Node.js desde https://nodejs.org
  O con nvm:

  nvm install --lts
```

```
⚠️ DIRTY_WORKTREE: Hay cambios sin commitear

Problema:
  Hay 3 archivos modificados y 1 sin trackear.
  El skill puede continuar pero los cambios podrían perderse.

Opciones:
  1. Commitear cambios primero
  2. Stash cambios: git stash
  3. Continuar de todas formas (no recomendado)

¿Continuar? [s/N]
```

---

## Error Handling Patterns

### Try-Catch estructurado

```typescript
try {
  // Operación
} catch (error) {
  if (error.code === 'ENOENT') {
    // Archivo no existe - ERROR recuperable
    showError('FILE_NOT_FOUND', {
      file: error.path,
      suggestion: 'Verifica la ruta del archivo'
    });
  } else if (error.code === 'EACCES') {
    // Sin permisos - ERROR recuperable
    showError('PERMISSION_DENIED', {
      file: error.path,
      suggestion: 'Ejecuta con permisos adecuados'
    });
  } else {
    // Error inesperado - loggear y mostrar genérico
    logError(error);
    showError('UNEXPECTED_ERROR', {
      requestId: generateRequestId(),
      suggestion: 'Revisa los logs para más detalles'
    });
  }
}
```

### Rollback en operaciones múltiples

```typescript
const checkpoint = createCheckpoint();

try {
  await step1();
  await step2();
  await step3();
} catch (error) {
  await rollbackTo(checkpoint);
  throw new OperationFailedError('Operación revertida', { cause: error });
}
```

---

## Recovery Procedures

Ubicación: `.claude/validation/recovery/procedures.md`

### Escenarios comunes

| Escenario | Procedimiento |
|-----------|---------------|
| Merge fallido | `git merge --abort` |
| Rebase fallido | `git rebase --abort` |
| Commit parcial | `git reset --soft HEAD~1` |
| Worktree corrupto | `git worktree remove && recrear` |
| Estado desconocido | `git reflog && git reset` |

---

## Checklist por Skill

### /genesis
- [ ] Directorio vacío o con .git
- [ ] Permisos de escritura
- [ ] No hay CLAUDE.md existente (o confirmar sobrescribir)

### /build-feature
- [ ] Git repository existe
- [ ] Issue existe y está en backlog
- [ ] Branch base (develop) está actualizado
- [ ] No hay merge/rebase en progreso
- [ ] Herramientas del stack instaladas

### /qa
- [ ] Git repository existe
- [ ] Tests pueden ejecutarse
- [ ] Branch de feature existe
- [ ] Cambios commiteados

### /qa --env qa
- [ ] Git repository existe
- [ ] Sistema worktrees inicializado (`.worktrees/environments/` existe)
- [ ] Ambiente qa/ existe (`.worktrees/environments/qa/`)
- [ ] qa/ está sincronizado con último `/promote --to qa` (comparar HEAD con promotions.json)
- [ ] promotions.json tiene al menos una entrada con `"to": "qa"`
- [ ] Todos los features promovidos tienen sesión QA individual APPROVED
- [ ] Tests pueden ejecutarse en qa/ (dependencias instaladas)
- [ ] Security Gate configurado (`.claude/security/SECURITY-GATE.md` existe)
- [ ] No hay features con conflictos pendientes en qa/
- [ ] Directorio `.claude/sessions/` existe y es escribible

### /merge
- [ ] Git repository existe
- [ ] QA pasó (Security Gate OK)
- [ ] Branch destino existe
- [ ] Remote accesible

### /promote
- [ ] Git repository existe
- [ ] Sistema worktrees inicializado (`.worktrees/environments/` existe)
- [ ] Merge lock no activo (`.worktrees/.meta/merge.lock` no existe o stale)
- [ ] Target ambiente existe (`qa/` o `prod/`)
- [ ] Si `--to qa`: al menos un feature merged a develop con QA APPROVED
- [ ] Si `--to qa`: no hay promote pendiente sin `/qa --env qa`
- [ ] Si `--to prod`: release completado (tag existe en main)
- [ ] Remote accesible (para push)

### /release
- [ ] Git repository existe
- [ ] Branch actual es `develop` o `main`
- [ ] Working tree limpio
- [ ] Sin merge/rebase en progreso
- [ ] Sincronizado con remote
- [ ] Commits nuevos desde último tag
- [ ] QA env session existe y resultado es APPROVED o CONDITIONAL
  - Si FAILED → bloquear release
  - Si CONDITIONAL → advertir, preguntar confirmación
  - Si no existe → advertir: "Se recomienda `/qa --env qa` antes de release"

---

## Configuración de Validación

### Deshabilitar checks (no recomendado)

En casos excepcionales, se pueden saltar checks:

```bash
# Variable de entorno
SKIP_VALIDATION=1

# Por check específico
SKIP_GIT_CHECK=1
SKIP_TOOLS_CHECK=1
```

### Modo estricto

Para CI/CD o ambientes de producción:

```bash
STRICT_VALIDATION=1  # Todos los WARN se convierten en ERROR
```

---

## Logging de Validación

### Qué loggear

```
[INFO]  Pre-check iniciado: git
[OK]    Git repository encontrado
[OK]    Working tree limpio
[WARN]  Remote no configurado - algunas funciones limitadas
[INFO]  Pre-check completado: git (2 OK, 1 WARN)

[INFO]  Pre-check iniciado: tools
[OK]    npm v20.10.0 encontrado
[OK]    node v20.10.0 encontrado
[INFO]  Pre-check completado: tools (2 OK)

[INFO]  Todos los pre-checks pasaron. Continuando...
```

### Formato en sesión

Al final de cada skill, incluir en la sesión:

```yaml
validation:
  git:
    passed: true
    warnings: ["Remote no configurado"]
  tools:
    passed: true
    warnings: []
  overall: passed
```
