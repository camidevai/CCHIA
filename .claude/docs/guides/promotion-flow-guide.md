# Guia Completa: Flujo de Promocion entre Ambientes

> Documentacion detallada del sistema de promocion de codigo entre ambientes del framework InformatiK-AI.

## Indice

- [Vision General](#vision-general)
- [Conceptos Clave](#conceptos-clave)
- [Reglas de Promocion](#reglas-de-promocion)
- [Comando /promote](#comando-promote)
- [Promocion a QA](#promocion-a-qa)
- [Promocion a PROD](#promocion-a-prod)
- [Integracion con Otros Skills](#integracion-con-otros-skills)
- [Metadata de Promociones](#metadata-de-promociones)
- [Ejemplo Practico](#ejemplo-practico-flujo-completo)
- [Troubleshooting](#troubleshooting)
- [Resumen Visual](#resumen-visual)

---

## Vision General

El sistema de promocion implementa **gates explicitos** para mover codigo entre ambientes. En lugar de sincronizaciones automaticas, requiere verificacion de calidad antes de cada promocion.

### Por que Gates de Promocion?

| Sin Gates | Con Gates |
|-----------|-----------|
| Codigo puede llegar a QA sin tests | QA solo recibe codigo verificado |
| Produccion puede tener vulnerabilidades | Security Gate bloquea promocion |
| Dificil rastrear que llego a cada ambiente | Historial completo de promociones |
| Errores se propagan rapidamente | Cada paso es verificado |

### Modelo de Ambientes

```
           DESARROLLO               QA                 PRODUCCION
         ┌───────────┐         ┌─────────┐          ┌──────────┐
         │           │         │         │          │          │
         │  develop  │────────►│   qa/   │          │  prod/   │
         │   dev/    │ promote │         │          │          │
         │           │ --to qa │         │          │          │
         └───────────┘         └────┬────┘          └────▲─────┘
                                    │                    │
                                    │    /release        │
                                    │        │           │
                                    │        ▼           │
                                    │      main ─────────┘
                                    │              promote
                                    │              --to prod
                                    │
                               Pruebas
                               Formales
```

---

## Conceptos Clave

### Ambiente vs Branch

| Concepto | Descripcion | Ejemplo |
|----------|-------------|---------|
| **Branch** | Linea de codigo en Git | `develop`, `main` |
| **Ambiente** | Worktree que simula servidor | `dev/`, `qa/`, `prod/` |
| **Promocion** | Sincronizar ambiente con branch | `qa/` ← `develop` |

### Estados de Codigo

```
Codigo en feature branch
         │
         ▼
    /qa aprobado?
    ├─► NO  → No puede promocionar
    └─► SI  ─┐
             │
             ▼
    Security Gate?
    ├─► FAIL → No puede promocionar
    └─► PASS ─┐
              │
              ▼
    Listo para /promote --to qa
```

### Trazabilidad

Cada promocion se registra en `promotions.json`:
- Timestamp
- Commit promovido
- Features incluidos
- Estado de QA
- Estado de Security Gate

---

## Reglas de Promocion

### Matriz de Promociones

| Origen | Destino | Requiere | Comando |
|--------|---------|----------|---------|
| develop | qa/ | QA aprobado + Security Gate | `/promote --to qa` |
| main | prod/ | Release completado | `/promote --to prod` |

### Flujo Obligatorio

```
Feature mergeado a develop
         │
         │  (automatico via /merge)
         ▼
    dev/ sincronizado
         │
         │  (manual, cuando listo)
         ▼
/promote --to qa
         │
         ├─► Verifica QA de features
         ├─► Verifica Security Gate
         └─► Sincroniza qa/
         │
         ▼
/qa --env qa (validación formal)
         │
         │  (cuando validado)
         ▼
/release
         │
         ├─► GitFlow: develop → main
         └─► Auto: /promote --to prod
         │
         ▼
    prod/ refleja main
```

### Gates de Bloqueo

| Gate | Que bloquea | Solucion |
|------|-------------|----------|
| QA Pendiente | `/promote --to qa` | Ejecutar `/qa` primero |
| Security Gate Fallido | `/promote --to qa` | Resolver vulnerabilidades |
| Sin Release | `/promote --to prod` | Ejecutar `/release` primero |

---

## Comando /promote

### Sintaxis

```bash
/promote --to {qa|prod} [--dry-run] [--force]
```

### Parametros

| Parametro | Descripcion | Requerido |
|-----------|-------------|-----------|
| `--to` | Ambiente destino (`qa` o `prod`) | Si |
| `--dry-run` | Simular sin ejecutar cambios | No |
| `--force` | Omitir verificaciones | No (peligroso) |

### Ejemplos

```bash
# Promocionar a QA
/promote --to qa

# Ver que pasaria sin ejecutar
/promote --to qa --dry-run

# Promocionar a produccion post-release
/promote --to prod
```

---

## Promocion a QA

### Prerequisitos

1. Sistema de worktrees inicializado
2. Features con QA aprobado
3. Security Gate pasado

### Proceso Detallado

```
/promote --to qa
         │
         ▼
┌─────────────────────────────┐
│ FASE 1: Pre-checks          │
├─────────────────────────────┤
│ - Worktrees inicializados?  │
│ - qa/ existe?               │
│ - Working tree limpio?      │
│ - Security Gate pasado?     │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ FASE 2: Verificar QA        │
├─────────────────────────────┤
│ - Buscar sesiones de QA     │
│ - Verificar estado APROBADO │
│ - Listar features pendientes│
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ FASE 3: Security Gate       │
├─────────────────────────────┤
│ - Verificar en sesiones QA  │
│ - Todos deben tener PASSED  │
│ - Bloquear si alguno fallo  │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ FASE 3.5: Verificar Lock    │
├─────────────────────────────┤
│ if merge.lock exists:       │
│   BLOQUEAR (merge activo)   │
│ else: adquirir lock         │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ FASE 4: Sincronizar         │
├─────────────────────────────┤
│ cd .worktrees/environments/ │
│    qa                       │
│ git fetch origin develop    │
│ git reset --hard origin/    │
│    develop                  │
│ (liberar lock al finalizar) │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ FASE 5: Smoke Tests         │
├─────────────────────────────┤
│ - npm test (smoke)          │
│ - Verificar que ambiente    │
│   funciona                  │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ FASE 6: Registrar           │
├─────────────────────────────┤
│ - Actualizar promotions.json│
│ - Crear sesion de promocion │
└─────────────────────────────┘
```

### Output Exitoso

```
✅ Promocion a QA completada

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

👉 Proximos pasos:
   - Ejecutar /qa --env qa (QA formal de integración)
   - Cuando esté validado: /release
```

### Output con Features Pendientes

```
⚠️ Features pendientes de QA:

Feature                    Status
────────────────────────────────
feature/001-auth-login     QA: PENDING
feature/002-payments       QA: APPROVED

¿Continuar promocion parcial? [s/N]

Nota: Solo se promoveran los commits de features con QA aprobado.
```

### Output Bloqueado por Security Gate

```
❌ Security Gate no aprobado:

feature/003-user-data      RECHAZADO
   - Secrets detectados en config.ts
   - Vulnerabilidad en dependencia

Promocion bloqueada. Ejecuta /qa para resolver.
```

---

## Promocion a PROD

### Prerequisitos

1. Release completado (`/release` ejecutado)
2. Tag en main
3. qa/ validado (recomendado)

### Proceso Detallado

```
/promote --to prod
         │
         ▼
┌─────────────────────────────┐
│ FASE 1: Verificar Release   │
├─────────────────────────────┤
│ - Existe tag en main?       │
│ - main tiene commits sin    │
│   release?                  │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ FASE 2: Verificar qa/       │
├─────────────────────────────┤
│ - qa/ sincronizado?         │
│ - Advertir si no            │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ FASE 2.5: Verificar Lock    │
├─────────────────────────────┤
│ if merge.lock exists:       │
│   BLOQUEAR (merge activo)   │
│ else: adquirir lock         │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ FASE 3: Sincronizar         │
├─────────────────────────────┤
│ cd .worktrees/environments/ │
│    prod                     │
│ git fetch origin main       │
│ git reset --hard origin/main│
│ (liberar lock al finalizar) │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ FASE 4: Verificar           │
├─────────────────────────────┤
│ - Verificar version         │
│ - Confirmar tag             │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ FASE 5: Registrar           │
├─────────────────────────────┤
│ - Actualizar promotions.json│
│ - Crear sesion de promocion │
└─────────────────────────────┘
```

### Output Exitoso

```
✅ Promocion a PROD completada

📋 Detalles:
   Desde: main (def456a)
   Hacia: prod/
   Release: v1.3.0

📦 Estado de prod/:
   Version: v1.3.0
   Commit: def456abc

📍 Registrado en:
   .worktrees/.meta/promotions.json

👉 Proximos pasos:
   - Verificar aplicacion en prod/
   - Monitorear logs y metricas
```

### Output sin Release

```
❌ No se puede promover a PROD:

main tiene 3 commits sin release.
Ultimo release: v1.2.0 (hace 5 dias)

👉 Ejecuta /release primero para crear un release formal.
```

---

## Integracion con Otros Skills

### Con /merge

Despues de cada merge exitoso:

```
/merge --issue 001
         │
         ├─► Merge normal
         ├─► Cleanup worktree
         ├─► Auto-sync dev/
         │
         └─► Detectar estado de qa/
                  │
                  ▼
         "qa/ esta 2 commits atras"
                  │
                  ▼
         Sugerir: /promote --to qa
```

### Con /release

Antes y despues del release:

```
/release
         │
         ├─► PRE-CHECK: qa/ sincronizado?
         │     └─► Warning si no
         │
         ├─► PRE-CHECK: /qa --env qa ejecutado?
         │     ├─► FAILED → Bloquear release
         │     ├─► CONDITIONAL → Warning
         │     └─► NOT RUN → Warning
         │
         ├─► PRE-CHECK: Features con QA pendiente?
         │     └─► Warning si hay
         │
         ├─► GitFlow normal
         │
         └─► POST: Auto /promote --to prod
```

### Con /worktree status

Status mejorado muestra informacion de promociones:

```
=== ESTADO DE AMBIENTES ===

ENV     BRANCH      COMMIT    SYNC STATUS
───────────────────────────────────────────────────
dev/    develop     abc123d   [3 commits ahead of qa]
qa/     develop     def456a   [2 commits ahead of prod]
prod/   main        789xyz0   [v1.2.3] ✓ sincronizado

=== ACCIONES SUGERIDAS ===

→ /promote --to qa     (2 features con QA aprobado)
→ /release             (qa validado, considerar release)
```

---

## Metadata de Promociones

### Archivo: `.worktrees/.meta/promotions.json`

```json
{
  "promotions": [
    {
      "id": "promo-001",
      "from": "develop",
      "to": "qa",
      "commit": "abc123def456",
      "timestamp": "2026-02-03T10:00:00Z",
      "features": ["001-auth-login", "002-payments"],
      "qaStatus": "APPROVED",
      "securityGate": "PASSED",
      "smokeTests": {
        "total": 5,
        "passed": 5,
        "failed": 0
      }
    },
    {
      "id": "promo-002",
      "from": "main",
      "to": "prod",
      "commit": "def456abc789",
      "timestamp": "2026-02-03T12:00:00Z",
      "release": "v1.3.0",
      "type": "auto-post-release"
    }
  ],
  "lastSync": {
    "dev": "2026-02-03T10:00:00Z",
    "qa": "2026-02-03T10:00:00Z",
    "prod": "2026-02-03T12:00:00Z"
  }
}
```

### Campos de Promocion

| Campo | Descripcion |
|-------|-------------|
| `id` | Identificador unico |
| `from` | Branch origen |
| `to` | Ambiente destino |
| `commit` | Hash del commit promovido |
| `timestamp` | Fecha y hora |
| `features` | Lista de features incluidos |
| `qaStatus` | Estado de QA (APPROVED/PARTIAL) |
| `securityGate` | Estado de Security Gate |
| `release` | Version si es promocion a prod |
| `type` | Tipo (manual/auto-post-release) |

### Usos de la Metadata

1. **Auditoria**: Saber que llego a cada ambiente y cuando
2. **Debugging**: Rastrear origen de problemas
3. **Reportes**: Generar informes de promociones
4. **Rollback**: Saber a que estado volver

---

## Ejemplo Practico: Flujo Completo

### Escenario

Desarrollar 2 features, promocionar a QA, hacer release y promocionar a produccion.

### Paso a Paso

```bash
# 1. Inicializar (si no esta hecho)
/worktree init

# 2. Crear y desarrollar feature 1
/worktree create 001-auth-login
cd .worktrees/features/feature-001-auth-login
# ... desarrollo ...
git commit -m "feat(auth): add login"

# 3. QA del feature 1
/qa --issue 001
# → QA: APPROVED
# → Security Gate: PASSED

# 4. Merge del feature 1
/merge --issue 001
# → dev/ sincronizado
# → "qa/ esta 1 commit atras"

# 5. Repetir para feature 2
/worktree create 002-payments
# ... desarrollo, qa, merge ...

# 6. Verificar estado
/worktree status
# → dev/ [2 commits ahead of qa]
# → "2 features con QA aprobado"

# 7. PROMOCION A QA
/promote --to qa
# → Verifica QA de ambos features
# → Security Gate verificado
# → qa/ sincronizado con develop
# → Smoke tests pasan

# 8. QA formal de integración
/qa --env qa
# → Full test suite, cross-feature, @security, @ux-accessibility

# 9. RELEASE
/release
# → Pre-check: qa/ sincronizado ✓
# → GitFlow: release → main
# → Tag v1.1.0 creado
# → Auto: /promote --to prod
# → prod/ refleja v1.1.0

# 10. Verificar estado final
/worktree status
# → dev/  [sincronizado]
# → qa/   [sincronizado]
# → prod/ [v1.1.0] ✓
```

### Timeline Visual

```
Tiempo →

DESARROLLO
──────────────────────────────────────────
feat-001 ──► QA ──► merge
                     │
feat-002 ──► QA ──► merge
                     │
                     ▼
              dev/ actualizado
              (2 commits)
                     │
PROMOCION            │
──────────────────────────────────────────
                     │
              /promote --to qa
                     │
                     ▼
              qa/ sincronizado
                     │
RELEASE              │
──────────────────────────────────────────
                     │
              /release
                     │
                     ├─► v1.1.0 tag
                     │
                     └─► auto /promote --to prod
                              │
                              ▼
                        prod/ = v1.1.0
```

---

## Troubleshooting

### "QA no aprobado"

**Sintoma:** Promocion bloqueada por features sin QA.

**Solucion:**
```bash
# Ver features pendientes
/worktree status

# Ejecutar QA para cada uno
/qa --issue {numero}

# Reintentar promocion
/promote --to qa
```

### "Security Gate fallido"

**Sintoma:** Promocion bloqueada por vulnerabilidades.

**Solucion:**
```bash
# Ver detalles en sesion de QA
cat .claude/sessions/*-qa-{issue}.md

# Resolver problemas identificados:
# - Eliminar secrets
# - Actualizar dependencias vulnerables
# - Corregir patrones inseguros

# Re-ejecutar QA
/qa --issue {numero}

# Reintentar promocion
/promote --to qa
```

### "No hay release"

**Sintoma:** No se puede promocionar a prod sin release.

**Solucion:**
```bash
# Verificar estado
git describe --tags

# Crear release
/release

# La promocion a prod es automatica post-release
```

### "qa/ desincronizado"

**Sintoma:** Release advierte que qa/ no esta sincronizado.

**Solucion:**
```bash
# Promocionar a QA primero
/promote --to qa

# Validar en ambiente QA
cd .worktrees/environments/qa
npm test

# Luego hacer release
/release
```

### "Conflictos en sincronizacion"

**Sintoma:** Error al sincronizar ambiente.

**Solucion:**
```bash
# Forzar sincronizacion (perder cambios locales)
cd .worktrees/environments/{env}
git fetch origin
git reset --hard origin/{branch}

# O resolver manualmente si hay cambios importantes
git stash
git pull
git stash pop
```

---

## Resumen Visual

### Flujo Completo

```
                    DESARROLLO
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    ▼                    ▼                    ▼
Feature 1           Feature 2           Feature N
    │                    │                    │
    ▼                    ▼                    ▼
  /qa                  /qa                  /qa
    │                    │                    │
    ▼                    ▼                    ▼
 /merge              /merge              /merge
    │                    │                    │
    └────────────────────┼────────────────────┘
                         │
                         ▼
                    dev/ actualizado
                         │
                         │ /promote --to qa
                         ▼
         ┌───────────────────────────────┐
         │        GATE: QA + Security    │
         └───────────────┬───────────────┘
                         │
                         ▼
                    qa/ actualizado
                         │
                    Pruebas formales
                         │
                         │ /release
                         ▼
         ┌───────────────────────────────┐
         │    GATE: Release + GitFlow    │
         └───────────────┬───────────────┘
                         │
                         │ auto /promote --to prod
                         ▼
                    prod/ = release
```

### Comandos Clave

| Fase | Comando | Gate |
|------|---------|------|
| Desarrollo | `/qa`, `/merge` | QA + Security |
| Promocion QA | `/promote --to qa` | QA aprobado |
| Release | `/release` | qa/ sync |
| Promocion Prod | `/promote --to prod` | Release existe |

### Archivos Involucrados

| Archivo | Proposito |
|---------|-----------|
| `.worktrees/.meta/promotions.json` | Historial de promociones |
| `.worktrees/.meta/active-features.json` | Features en desarrollo |
| `.claude/sessions/*-promote-*.md` | Sesiones de promocion |
| `.claude/sessions/*-qa-*.md` | Estado de QA (referencia) |

---

## Referencias

- Skill Promote: `.claude/skills/promote/SKILL.md`
- Skill Worktree: `.claude/skills/worktree/SKILL.md`
- Skill Release: `.claude/skills/release/SKILL.md`
- Skill Merge: `.claude/skills/merge/SKILL.md`
- Rules Git Worktrees: `.claude/rules/git-worktrees.md`
- Security Gate: `.claude/security/SECURITY-GATE.md`
