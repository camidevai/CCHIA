---
name: promote
version: 2.0
description: "Gate de promoción entre ambientes. Sincroniza código de develop a qa o de main a prod con verificaciones de calidad."
---

# Promote - Gate de Promoción entre Ambientes

## QUICK REFERENCE

### BLOCKING CONDITIONS
> ⛔ Si alguna es TRUE, DETENER inmediatamente

**Para `--to qa`:**
- [ ] Sistema de worktrees no inicializado
- [ ] Ambiente qa/ no existe
- [ ] Features sin QA individual aprobado
- [ ] Security Gate fallido en algún feature
- [ ] Sesión QA expirada (>7 días) sin override

**Para `--to prod`:**
- [ ] No hay release completado en main
- [ ] qa/ no sincronizado con develop
- [ ] Ambiente prod/ no existe

### REQUIRED OUTPUTS
> 📦 Archivos que DEBEN existir al finalizar

- [ ] Ambiente sincronizado (qa/ o prod/)
- [ ] `.worktrees/.meta/promotions.json` actualizado
- [ ] `.claude/sessions/YYYY-MM-DD-promote-{env}.md`

### PHASES OVERVIEW

**Promoción a QA:**
```
PRE-CHECK → VERIFY QA → VERIFY SECURITY → SYNC qa/ → SMOKE TESTS → REGISTER
```

**Promoción a PROD:**
```
PRE-CHECK → VERIFY RELEASE → VERIFY qa/ SYNC → SYNC prod/ → REGISTER
```

### PARAMETERS
| Parámetro | Descripción | Requerido |
|-----------|-------------|-----------|
| `--to {qa\|prod}` | Ambiente destino | Sí |
| `--dry-run` | Simular sin ejecutar | No |
| `--force` | Omitir verificaciones | No |

---

## Overview

Skill que implementa un gate explícito de promoción entre ambientes de worktrees. Verifica que el código haya pasado los controles de calidad antes de sincronizar el ambiente destino.

## Parámetros

| Parámetro | Descripción | Requerido | Validación |
|-----------|-------------|-----------|------------|
| `--to {qa\|prod}` | Ambiente destino de la promoción | Sí | Solo `qa` o `prod`. Otro valor → ERROR: "Ambiente inválido. Use --to qa o --to prod" |
| `--dry-run` | Simula la promoción sin ejecutar cambios | No | Flag booleano |
| `--force` | Omite verificaciones (no recomendado) | No | Flag booleano. Se registra en sesión como bypass |

## Prerrequisitos

1. Sistema de worktrees inicializado (`/worktree init`)
2. Ambientes de worktree existentes (dev/, qa/, prod/)
3. Working tree limpio en el repo principal

---

## Reglas de Promoción

| Desde | Hacia | Requiere | Branch |
|-------|-------|----------|--------|
| develop | qa | QA aprobado en features mergeados | develop |
| main | prod | Release completado | main |

### Flujo conceptual

```text
DESARROLLO
   │
   ▼
develop ────► qa/     (/promote --to qa)
   │           │
   │           ▼
   │        Pruebas formales
   │           │
   ▼           │
/release ──────┘
   │
   ▼
main ──────► prod/    (/promote --to prod)
```

---

## Proceso

### Fase 0: Pre-checks

```bash
# 0. Verificar promotions.json existe y es válido
PROMOTIONS_FILE=".worktrees/.meta/promotions.json"
if [[ ! -f "$PROMOTIONS_FILE" ]]; then
  echo "WARNING: promotions.json no encontrado, creando..."
  # Crear con estructura base
  cat > "$PROMOTIONS_FILE" << 'EOJSON'
{
  "promotions": [],
  "lastSync": {
    "dev": null,
    "qa": null,
    "prod": null
  }
}
EOJSON
  echo "✓ promotions.json creado en $PROMOTIONS_FILE"
fi

# Validar que el JSON es parseable
if ! python3 -c "import json; json.load(open('$PROMOTIONS_FILE'))" 2>/dev/null && \
   ! node -e "JSON.parse(require('fs').readFileSync('$PROMOTIONS_FILE','utf8'))" 2>/dev/null; then
  echo "ERROR: promotions.json tiene formato inválido"
  echo "👉 Verifica o elimina .worktrees/.meta/promotions.json para recrearlo"
  exit 1
fi

# 1. Verificar worktrees inicializados
if [[ ! -d ".worktrees/environments" ]]; then
  echo "ERROR: Sistema de worktrees no inicializado"
  echo "👉 Ejecuta /worktree init primero"
  exit 1
fi

# 2. Verificar ambiente destino existe
if [[ ! -d ".worktrees/environments/${ENV}" ]]; then
  echo "ERROR: Ambiente ${ENV} no existe"
  exit 1
fi

# 3. Verificar working tree limpio
if [[ -n $(git status --porcelain) ]]; then
  echo "ERROR: Working tree no está limpio"
  exit 1
fi
```

---

### Promoción a QA (`/promote --to qa`)

#### 1. Verificar features con QA aprobado

Buscar sesiones de QA recientes:

```bash
# Listar sesiones de QA
ls -la .claude/sessions/*-qa-*.md

# Verificar estado de QA en cada sesión
# Buscar: "## Resultado: APROBADO"
```

**Algoritmo de verificacion de QA aprobado:**
1. Obtener lista de features mergeados a develop desde ultima promocion a qa
   (comparar commits entre `promotions.json` ultima entrada y HEAD de develop)
2. Para cada feature: buscar sesion mas reciente `.claude/sessions/*-qa-{issue}.md`
3. Verificar que el resultado sea `APPROVED` (no FAILED ni CONDITIONAL)
4. Verificar que la sesion sea mas reciente que el ultimo commit del feature
   (QA posterior a cambios = valido; QA anterior a cambios = invalido)
5. Si feature tiene multiples sesiones QA, usar la mas reciente

**Criterios temporales:**
- QA aprobado tiene validez de **7 dias** desde la fecha de la sesion
- Si han pasado mas de 7 dias desde la aprobacion:
  ```
  ⚠️ QA de feature/{nombre} expiró (aprobado hace {N} días).
  La sesión QA tiene más de 7 días de antigüedad.

  Opciones:
  a) Re-ejecutar /qa --issue {N} (recomendado)
  b) Continuar con QA expirado (no recomendado, se documenta en sesión)
  ```
- Si el codigo del feature cambio despues de la aprobacion QA → QA invalido, requiere re-ejecucion

Si hay features sin QA aprobado → **BLOQUEAR promocion completa**:

```
⛔ Promoción a QA BLOQUEADA

Todos los features mergeados a develop DEBEN tener QA aprobado
antes de promover. La sincronización copia TODO develop, no es
posible una promoción parcial selectiva.

Features sin QA aprobado:
────────────────────────────────
feature/001-auth-login     QA: PENDING  ← BLOQUEANTE

Features con QA aprobado:
────────────────────────────────
feature/002-payments       QA: APPROVED ✓

👉 Ejecuta /qa --issue 001 primero para desbloquear la promoción.
```

> **Importante**: La promocion a QA hace `git reset --hard origin/develop`, lo que copia TODO el contenido de develop al ambiente qa/. No es posible copiar selectivamente solo ciertos features. Por eso TODOS los features en develop deben tener QA aprobado antes de promover.

> **Workaround para bloqueo parcial:**
> Si Feature A esta lista pero Feature B no:
> 1. Revertir Feature B de develop: `git revert {commit_de_B}`
> 2. Ejecutar `/promote --to qa` (solo con Feature A)
> 3. Una vez Feature B este lista, re-merge y promover de nuevo
>
> Este workaround es costoso. Preferir completar QA de todos los features antes de promover.

#### 2. Verificar Security Gate

Buscar en sesiones de QA que Security Gate haya pasado:

```
🔒 Security Gate Status:

Feature                    Security Gate
────────────────────────────────────────
feature/001-auth-login     APROBADO ✓
feature/002-payments       APROBADO ✓

✓ Todos los features pasaron Security Gate
```

Si algún feature no pasó:

```
❌ Security Gate no aprobado:

feature/003-user-data      RECHAZADO
   - Secrets detectados en config.ts
   - Vulnerabilidad en dependencia

Promoción bloqueada. Ejecuta /qa para resolver.
```

#### 2.5. Verificar release en progreso

```bash
# Detectar si hay un release branch activo
RELEASE_BRANCH=$(git branch -r --list "origin/release/*" | head -1 | tr -d ' ')

if [[ -n "$RELEASE_BRANCH" ]]; then
  echo "⚠️ Release en progreso detectado: $RELEASE_BRANCH"
  echo ""
  echo "Durante un release activo, el ambiente qa/ debería apuntar"
  echo "al branch de release para pruebas formales de la versión."
  echo ""
  echo "Opciones:"
  echo "  a) Sincronizar qa/ con release branch (recomendado durante release)"
  echo "  b) Sincronizar qa/ con develop (flujo normal)"
  echo "  c) Abortar promoción"
fi
```

> **Nota sobre releases**: Durante `/release`, el ambiente qa/ se cambia temporalmente al branch de release para pruebas formales de la versión. Después del release, qa/ vuelve a sincronizarse con develop.

#### 3. Sincronizar worktree qa/

```bash
cd .worktrees/environments/qa

# Si hay release en progreso y se eligió sincronizar con release:
# git fetch origin
# git reset --hard $RELEASE_BRANCH

# Flujo normal (sin release en progreso):
git fetch origin develop
git reset --hard origin/develop
```

#### 4. Ejecutar smoke tests en qa/

> **Definición de smoke tests**: Tests mínimos que verifican que la aplicación arranca y las funciones críticas responden. Se buscan en orden:
> 1. `npm test -- --testPathPattern="smoke"` (Jest/Vitest con tag smoke)
> 2. `pytest -m smoke` (pytest con marker smoke)
> 3. Si no hay smoke tests configurados → WARNING pero no bloqueante
>
> Para configurar smoke tests en tu proyecto, tagea tests críticos con "smoke" marker/pattern.

```bash
cd .worktrees/environments/qa

# Instalar dependencias si es necesario
npm install 2>/dev/null || pip install -r requirements.txt 2>/dev/null

# Ejecutar tests básicos
npm test -- --testPathPattern="smoke" 2>/dev/null || \
pytest -m smoke 2>/dev/null || \
echo "No smoke tests configurados"
```

Resultado:

```
🧪 Smoke Tests en QA:

Tests ejecutados: 5
Pasaron: 5
Fallaron: 0

✓ Ambiente QA listo para /qa --env qa
```

#### 5. Registrar promoción

Actualizar `.worktrees/.meta/promotions.json`:

```json
{
  "promotions": [
    {
      "from": "develop",
      "to": "qa",
      "commit": "abc123def",
      "timestamp": "2026-02-03T10:00:00Z",
      "features": ["001-auth-login", "002-payments"],
      "qaStatus": "APPROVED",
      "securityGate": "PASSED"
    }
  ],
  "lastSync": {
    "dev": "2026-02-03T10:00:00Z",
    "qa": "2026-02-03T10:00:00Z",
    "prod": "2026-02-01T15:00:00Z"
  }
}
```

---

### Promoción a PROD (`/promote --to prod`)

#### 1. Verificar release completado

```bash
# Verificar que main tiene el último release
LAST_TAG=$(git describe --tags --abbrev=0 --match "v*" 2>/dev/null)
MAIN_COMMIT=$(git rev-parse main)
TAG_COMMIT=$(git rev-list -n 1 $LAST_TAG)

if [[ "$MAIN_COMMIT" != "$TAG_COMMIT" ]]; then
  echo "⚠️ main tiene commits sin release"
  echo "   Último tag: $LAST_TAG"
  echo "   Commits adelante: $(git rev-list $LAST_TAG..main --count)"
fi
```

Si no hay release reciente:

```
❌ No se puede promover a PROD:

main tiene 3 commits sin release.
Último release: v1.2.0 (hace 5 días)

👉 Ejecuta /release primero para crear un release formal.
```

#### 2. Verificar qa/ sincronizado

```bash
QA_COMMIT=$(cd .worktrees/environments/qa && git rev-parse HEAD)
DEVELOP_COMMIT=$(git rev-parse develop)

if [[ "$QA_COMMIT" != "$DEVELOP_COMMIT" ]]; then
  echo "⚠️ qa/ no está sincronizado con develop"
fi
```

#### 3. Sincronizar worktree prod/

```bash
cd .worktrees/environments/prod
git fetch origin main
git reset --hard origin/main
```

#### 4. Verificar estado de prod/

```bash
cd .worktrees/environments/prod

# Verificar versión
cat package.json | grep version || \
cat pyproject.toml | grep version || \
git describe --tags
```

Resultado:

```
📦 Ambiente PROD actualizado:

Versión: v1.3.0
Commit: def456abc
Tag: v1.3.0

✓ prod/ refleja el último release
```

---

## Resumen final

### Promoción a QA exitosa

```
✅ Promoción a QA completada

📋 Detalles:
   Desde: develop (abc123d)
   Hacia: qa/
   Features incluidos: 2

📁 Features promovidos:
   - 001-auth-login (QA: APPROVED)
   - 002-payments (QA: APPROVED)

🔒 Security Gate: VERIFICADO

🧪 Smoke Tests: 5/5 pasaron

📍 Registrado en:
   .worktrees/.meta/promotions.json

👉 Próximos pasos:
   - Ejecutar /qa --env qa (QA formal de integración)
   - Cuando esté validado: /release
```

### Promoción a PROD exitosa

```
✅ Promoción a PROD completada

📋 Detalles:
   Desde: main (def456a)
   Hacia: prod/
   Release: v1.3.0

📦 Estado de prod/:
   Versión: v1.3.0
   Commit: def456abc

📍 Registrado en:
   .worktrees/.meta/promotions.json

👉 Próximos pasos:
   - Verificar aplicación en prod/
   - Monitorear logs y métricas
```

---

## Modo Dry-Run

Con `--dry-run` se simula todo el proceso sin ejecutar cambios:

```
🏃 Modo dry-run: Simulación de /promote --to qa

Se ejecutaría:
  1. ✓ Pre-checks pasarían
  2. ✓ 2 features con QA aprobado
  3. ✓ Security Gate verificado
  4. → Sincronizar qa/ con develop
  5. → Ejecutar smoke tests
  6. → Registrar en promotions.json

No se ejecutaron cambios reales.
```

---

## Registro de sesión

> Formato base: `.claude/skills/_common/session-template.md`

Crear `.claude/sessions/YYYY-MM-DD-promote-{env}.md` con:

```markdown
# Sesión: Promote to {ENV}

**Fecha:** 2026-02-03
**Skill:** /promote --to {env}
**Duración:** ~2 min

## Resumen

Promoción de código a ambiente {ENV} completada.

## Detalles de Promoción

| Campo | Valor |
|-------|-------|
| Desde | develop / main |
| Hacia | qa / prod |
| Commit | abc123def |
| Features | 2 |

## Verificaciones

- [x] Pre-checks pasados
- [x] QA aprobado en features
- [x] Security Gate verificado
- [x] Smoke tests pasaron

## Features Incluidos

- 001-auth-login (QA: APPROVED)
- 002-payments (QA: APPROVED)

## Próximo paso sugerido

- /qa --env qa (QA formal de integración en ambiente qa/)
```

---

## Manejo de Errores

### QA no aprobado

```
❌ No se puede promover a QA:

Features sin QA aprobado:
  - feature/003-user-profile

👉 Ejecuta /qa --issue 003 primero
```

### Security Gate fallido

```
❌ Security Gate bloqueó la promoción:

feature/001-auth-login:
  - Secrets detectados: API_KEY en .env.local
  - Vulnerabilidad: lodash < 4.17.21

👉 Resuelve los problemas y ejecuta /qa nuevamente
```

### Worktrees no inicializados

```
❌ Sistema de worktrees no inicializado

El skill /promote requiere worktrees de ambiente.

👉 Ejecuta /worktree init primero
```

### Conflictos en sincronización

```
⚠️ Conflictos detectados al sincronizar qa/:

Archivos en conflicto:
  - src/config.ts
  - package.json

Opciones:
  a) Resolver manualmente
  b) Forzar reset (perder cambios locales en qa/)
  c) Abortar promoción

¿Qué deseas hacer? [a/b/c]
```

---

## Integración con otros Skills

| Skill | Integración |
|-------|-------------|
| `/merge` | Sugiere /promote --to qa después de merge |
| `/qa` | Verifica QA aprobado antes de promoción. Post-promote sugiere `/qa --env qa` |
| `/release` | Auto-ejecuta /promote --to prod post-release |
| `/worktree status` | Muestra estado de promociones pendientes |

---

## Principios

1. **Gate explícito**: No hay promoción automática sin verificación
2. **QA primero**: develop → qa requiere QA aprobado
3. **Release primero**: main → prod requiere release
4. **Security verificado**: No se promociona código con vulnerabilidades
5. **Trazabilidad**: Toda promoción queda registrada
6. **Ambiente aislado**: Cada worktree representa un ambiente real

---

## FINAL CHECKPOINT

Antes de terminar, verificar:

**Para `--to qa`:**
- [ ] Todos los features tienen QA individual aprobado
- [ ] Security Gate verificado en todos
- [ ] qa/ sincronizado con develop
- [ ] Smoke tests ejecutados (si configurados)
- [ ] promotions.json actualizado
- [ ] Sesión registrada
- [ ] Próximo paso comunicado (`/qa --env qa`)

**Para `--to prod`:**
- [ ] Release completado en main
- [ ] prod/ sincronizado con main
- [ ] promotions.json actualizado
- [ ] Sesión registrada
- [ ] Próximo paso comunicado (verificar en prod)

---

## Ver también

- **Guía**: `.claude/docs/guides/promotion-flow-guide.md`
- **Skill anterior**: `.claude/skills/merge/SKILL.md`
- **Skill siguiente**: `.claude/skills/qa/SKILL.md` (con `--env qa`)
- **Validación**: `.claude/validation/VALIDATION.md` → "Checklist: /promote"
- **Session template**: `.claude/skills/_common/session-template.md`
- **Git Worktrees**: `.claude/rules/git-worktrees.md`
