# Guía Completa: Flujo de /worktree

> Documentación detallada del sistema de Git Worktrees del framework InformatiK-AI.

## Índice

- [Visión General](#visión-general)
- [Comandos Disponibles](#comandos-disponibles)
- [Comando: init](#comando-init)
- [Comando: create](#comando-create)
- [Comando: list](#comando-list)
- [Comando: switch](#comando-switch)
- [Comando: delete](#comando-delete)
- [Comando: cleanup](#comando-cleanup)
- [Comando: env sync](#comando-env-sync)
- [Comando: status](#comando-status)
- [Estructura de Archivos](#estructura-de-archivos)
- [Ambientes Permanentes](#ambientes-permanentes)
- [Features Temporales](#features-temporales)
- [Integración con GitFlow](#integración-con-gitflow)
- [Integración con Otros Skills](#integración-con-otros-skills)
- [Ejemplo Práctico](#ejemplo-práctico-desarrollo-de-feature)
- [Troubleshooting](#troubleshooting)
- [Resumen Visual](#resumen-visual)

---

## Visión General

El skill `/worktree` gestiona **Git Worktrees** para desarrollo aislado de features. Proporciona ambientes permanentes (dev, qa, prod) y worktrees temporales por feature, integrando GitFlow.

### ¿Qué son Git Worktrees?

Los worktrees permiten tener **múltiples directorios de trabajo** del mismo repositorio, cada uno en un branch diferente, sin necesidad de stash o switch constante.

### Beneficios

| Beneficio | Descripción |
|-----------|-------------|
| **Aislamiento** | Cada feature tiene su propio espacio |
| **Sin stash** | No necesitas guardar cambios para cambiar de contexto |
| **Ambientes siempre listos** | dev, qa, prod disponibles instantáneamente |
| **Menos errores** | No mezclas trabajo de diferentes features |
| **GitFlow natural** | Flujo de branches integrado |

### Cuándo Usar Worktrees

| Escenario | Recomendación |
|-----------|---------------|
| Proyecto con múltiples features simultáneas | ✅ Muy recomendado |
| Necesidad de probar en diferentes branches | ✅ Muy recomendado |
| Proyecto pequeño, un feature a la vez | ⚠️ Opcional |
| Script o proyecto trivial | ❌ No necesario |

---

## Comandos Disponibles

| Comando | Descripción | Frecuencia |
|---------|-------------|------------|
| `init` | Configura estructura inicial | Una vez por proyecto |
| `create {nombre}` | Crea worktree para feature/hotfix | Por cada feature |
| `list` | Lista worktrees activos | Consulta frecuente |
| `switch {nombre}` | Muestra path del worktree | Navegación |
| `delete {nombre}` | Elimina worktree temporal | Cleanup manual |
| `cleanup` | Limpia worktrees huérfanos | Mantenimiento |
| `update {nombre}` | Sincroniza feature con develop (merge) | Antes de merge |
| `env sync {env}` | Sincroniza ambiente con remote (reset) | Actualización |
| `status` | Estado completo del sistema | Diagnóstico |

---

## Comando: init

### Propósito

Configura la estructura inicial de worktrees para el proyecto. Se ejecuta **una sola vez** por proyecto.

### Prerrequisitos

- Repositorio Git inicializado
- Branch `main` existente

### Sintaxis

```bash
/worktree init
```

### Proceso

```
1. Verificar Git repo
   git rev-parse --is-inside-work-tree
        │
        ▼
2. Crear estructura de directorios
   .worktrees/
   ├── .meta/
   ├── environments/
   └── features/
        │
        ▼
3. Crear branch develop (si no existe)
   git checkout -b develop
        │
        ▼
4. Crear worktrees de ambiente
   ├─► dev  → branch develop (único dueño)
   │     git worktree add .worktrees/environments/dev develop
   ├─► qa   → detached HEAD en origin/develop
   │     git worktree add --detach .worktrees/environments/qa origin/develop
   └─► prod → detached HEAD en origin/main (readonly)
         git worktree add --detach .worktrees/environments/prod origin/main
        │
        ▼
5. Guardar configuración
   .worktrees/.meta/config.json
        │
        ▼
6. Actualizar .gitignore
   + .worktrees/
```

### Estructura Creada

```
.worktrees/
├── .meta/
│   ├── config.json           # Configuración del sistema
│   └── active-features.json  # Features activos
├── environments/
│   ├── dev/                  # → develop (branch)
│   ├── qa/                   # → origin/develop (detached HEAD)
│   └── prod/                 # → origin/main (detached HEAD, READONLY)
└── features/                 # Worktrees temporales
```

### Output

```
✅ Sistema de worktrees inicializado

📁 Estructura creada:
   .worktrees/
   ├── environments/
   │   ├── dev/   → develop (branch)
   │   ├── qa/    → origin/develop (detached HEAD)
   │   └── prod/  → origin/main (detached HEAD, readonly)
   └── features/  (vacío)

📝 Configuración guardada:
   .worktrees/.meta/config.json

📄 .gitignore actualizado:
   + .worktrees/

🌳 Branch develop: creado/verificado

👉 Usa /worktree create {nombre} para crear tu primer feature
```

### config.json

```json
{
  "initialized": true,
  "initializedAt": "2026-01-28T10:00:00Z",
  "mainBranch": "main",
  "developBranch": "develop",
  "environments": {
    "dev": {
      "branch": "develop",
      "detached": false,
      "path": ".worktrees/environments/dev"
    },
    "qa": {
      "branch": "develop",
      "detached": true,
      "path": ".worktrees/environments/qa"
    },
    "prod": {
      "branch": "main",
      "detached": true,
      "path": ".worktrees/environments/prod",
      "readonly": true
    }
  }
}
```

> **Nota**: `detached: true` indica que el worktree usa HEAD desacoplado (creado con `--detach`). Solo `dev/` tiene un branch real para poder ejecutar merges directamente.

---

## Comando: create

### Propósito

Crea un nuevo worktree para desarrollo de feature o hotfix.

### Sintaxis

```bash
/worktree create {nombre}
```

### Detección Automática de Tipo

| Patrón en nombre | Tipo | Branch |
|------------------|------|--------|
| Empieza con número | hotfix | `hotfix/{nombre}` |
| Contiene "hotfix" | hotfix | `hotfix/{nombre}` |
| Otro | feature | `feature/{nombre}` |

### Ejemplos

```bash
# Feature normal
/worktree create auth-login
→ feature/auth-login

# Hotfix (empieza con número)
/worktree create 123-fix-payment
→ hotfix/123-fix-payment

# Hotfix (contiene "hotfix")
/worktree create hotfix-urgent
→ hotfix/hotfix-urgent
```

### Proceso

```
1. Verificar que branch no existe
        │
        ▼
2. Actualizar referencia de develop
   git fetch origin develop
        │
        ▼
3. Crear branch y worktree (operación atómica)
   git worktree add -b {tipo}/{nombre} .worktrees/features/{tipo}-{nombre} origin/develop
   (NO cambia HEAD del repo principal - seguro para creación simultánea)
        │
        ▼
4. Registrar en active-features.json
```

### Output

```
✅ Worktree creado: feature-auth-login

📁 Directorio:
   .worktrees/features/feature-auth-login

🌳 Branch:
   feature/auth-login (basado en develop)

📋 Registrado en:
   .worktrees/.meta/active-features.json

👉 Para trabajar en el feature:
   cd .worktrees/features/feature-auth-login
```

### active-features.json

```json
{
  "features": [
    {
      "name": "auth-login",
      "type": "feature",
      "branch": "feature/auth-login",
      "path": ".worktrees/features/feature-auth-login",
      "createdAt": "2026-01-28T10:30:00Z",
      "issue": null
    }
  ],
  "lastUpdated": "2026-01-28T10:30:00Z"
}
```

---

## Comando: list

### Propósito

Lista todos los worktrees activos, organizados por tipo.

### Sintaxis

```bash
/worktree list
```

### Output

```
🌳 Worktrees activos

AMBIENTES (permanentes):
┌──────┬──────────┬──────────┬─────────────────────────────────┐
│ Env  │ Branch   │ HEAD     │ Path                            │
├──────┼──────────┼──────────┼─────────────────────────────────┤
│ dev  │ develop  │ branch   │ .worktrees/environments/dev     │
│ qa   │ develop  │ detached │ .worktrees/environments/qa      │
│ prod │ main     │ detached │ .worktrees/environments/prod 🔒 │
└──────┴──────────┴──────────┴─────────────────────────────────┘

FEATURES (temporales):
┌─────────────────┬─────────────────────┬─────────────────────────────────────────┐
│ Nombre          │ Branch              │ Path                                    │
├─────────────────┼─────────────────────┼─────────────────────────────────────────┤
│ feature-auth    │ feature/auth-login  │ .worktrees/features/feature-auth-login  │
│ hotfix-123      │ hotfix/123-payment  │ .worktrees/features/hotfix-123-payment  │
└─────────────────┴─────────────────────┴─────────────────────────────────────────┘

Total: 5 worktrees (3 ambientes + 2 features)
```

### Comando Git Equivalente

```bash
git worktree list
```

---

## Comando: switch

### Propósito

Muestra el path de un worktree para facilitar la navegación.

### Sintaxis

```bash
/worktree switch {nombre}
```

### Resolución de Path

| Tipo | Input | Path resuelto |
|------|-------|---------------|
| Ambiente | `dev`, `qa`, `prod` | `.worktrees/environments/{nombre}` |
| Feature | `auth-login` | `.worktrees/features/feature-auth-login` |
| Hotfix | `123-payment` | `.worktrees/features/hotfix-123-payment` |

### Ejemplos

```bash
# Cambiar a ambiente dev
/worktree switch dev
→ cd .worktrees/environments/dev

# Cambiar a feature
/worktree switch auth-login
→ cd .worktrees/features/feature-auth-login
```

### Output

```
📍 Worktree: feature-auth-login

Para navegar al worktree:

   cd .worktrees/features/feature-auth-login

Branch actual: feature/auth-login
Último commit: abc1234 - feat(auth): add login form
```

---

## Comando: update

### Propósito

Sincroniza un worktree de feature con los últimos cambios de develop. Esencial para desarrollo paralelo cuando otros features ya se mergearon a develop.

### Sintaxis

```bash
/worktree update {nombre}
```

### Diferencia con `env sync`

| Comando | Propósito | Operación | Target |
|---------|-----------|-----------|--------|
| `update {nombre}` | Sincronizar feature con develop | `git merge` (preserva historial) | Worktree de feature |
| `env sync {env}` | Sincronizar ambiente con remote | `git pull` (dev) / `git reset --hard` (qa/prod) | Ambiente permanente |

### Cuándo Usar

| Escenario | Recomendación |
|-----------|---------------|
| Otro feature se mergeó a develop | Sincronizar para evitar conflictos |
| Antes de `/merge` | Obligatorio para desarrollo paralelo |
| `/worktree status` muestra divergencia | Sincronizar para mantener consistencia |
| Feature lleva mucho tiempo sin sync | Recomendado periódicamente |

### Proceso

```
1. Verificar worktree existe y es feature
        │
        ▼
2. Verificar sin operaciones git pendientes
        │
        ▼
3. Sincronizar con develop
   cd .worktrees/features/{tipo}-{nombre}
   git fetch origin develop
   git merge origin/develop --no-ff -m "chore: sync with develop"
        │
        ▼
4. Si hay conflictos → Resolución manual
        │
        ▼
5. Informar resultado
```

### Output

```
✅ Feature auth-login sincronizado con develop

Commits incorporados: 3
Estado: Limpio, listo para continuar desarrollo
```

### Con Conflictos

```
⚠️ Conflictos al sincronizar auth-login con develop:

Archivos en conflicto:
  - src/middleware/session.ts
  - src/types/user.ts

Resuelve los conflictos manualmente:
  cd .worktrees/features/feature-auth-login
  # Resolver conflictos en los archivos
  git add {archivos_resueltos}
  git commit
```

---

## Comando: delete

### Propósito

Elimina un worktree temporal (feature o hotfix).

### Sintaxis

```bash
/worktree delete {nombre}
```

### Restricciones

| Tipo | Permite eliminar |
|------|------------------|
| Feature | ✅ Sí |
| Hotfix | ✅ Sí |
| Ambiente (dev/qa/prod) | ❌ No |

### Proceso

```
1. Verificar que no es ambiente
        │
        ▼
2. Verificar cambios sin commit
   ├─► Si hay cambios → Confirmar
   └─► Si no hay → Continuar
        │
        ▼
3. Eliminar worktree
   git worktree remove ... --force
        │
        ▼
4. Preguntar si eliminar branch
   ├─► Sí → git branch -d ...
   └─► No → Mantener branch
        │
        ▼
5. Actualizar active-features.json
```

### Output

```
⚠️ Worktree feature-auth-login tiene cambios sin commit:
   - src/components/Login.tsx (modified)

¿Eliminar de todas formas? Los cambios se perderán. [s/N]

> s

🗑️ Worktree eliminado: feature-auth-login

¿Eliminar también el branch feature/auth-login? [s/N]

> s

🌳 Branch eliminado: feature/auth-login

📋 active-features.json actualizado
```

### Error: Intentar Eliminar Ambiente

```
❌ No se puede eliminar ambiente: dev

Los ambientes (dev, qa, prod) son permanentes.
Solo se pueden eliminar features y hotfixes.

Para sincronizar un ambiente, usa:
   /worktree env sync dev
```

---

## Comando: cleanup

### Propósito

Limpia worktrees huérfanos (referencias a worktrees que ya no existen).

### Sintaxis

```bash
/worktree cleanup
```

### Proceso

```
1. Buscar huérfanos (dry-run)
   git worktree prune --dry-run
        │
        ▼
2. Mostrar huérfanos encontrados
        │
        ▼
3. Confirmar limpieza
        │
        ▼
4. Ejecutar limpieza
   git worktree prune
        │
        ▼
5. Sincronizar active-features.json
```

### Output

```
🔍 Buscando worktrees huérfanos...

Encontrados 2 huérfanos:
   - .worktrees/features/feature-old (branch eliminado)
   - .worktrees/features/hotfix-test (directorio no existe)

¿Limpiar estos worktrees? [S/n]

> s

🧹 Limpieza completada:
   - 2 referencias huérfanas eliminadas
   - active-features.json sincronizado

Estado actual: 3 ambientes + 1 feature activo
```

### Si No Hay Huérfanos

```
✅ No se encontraron worktrees huérfanos

El sistema está limpio.
```

---

## Comando: env sync

### Propósito

Sincroniza un ambiente con su branch remoto.

### Sintaxis

```bash
/worktree env sync {env}
```

### Ambientes Válidos

| Ambiente | Branch | Notas |
|----------|--------|-------|
| `dev` | develop | Desarrollo activo |
| `qa` | develop/release | Testing |
| `prod` | main | Readonly |

### Proceso

```
1. Verificar cambios locales
   ├─► Si hay cambios → Confirmar descarte
   └─► Si no hay → Continuar
        │
        ▼
2. Sincronizar con remote (según tipo de ambiente)

   Para dev/ (branch real):
     cd .worktrees/environments/dev
     git pull origin develop

   Para qa/ y prod/ (detached HEAD):
     cd .worktrees/environments/{env}
     git fetch origin
     git reset --hard origin/{branch}
        │
        ▼
3. Post-sync (si aplica)
   npm install / pip install
```

> **Nota**: dev/ usa `git pull` porque tiene branch real (develop).
> qa/ y prod/ usan `git reset --hard` porque trabajan con detached HEAD.

### Output

```
🔄 Sincronizando ambiente: dev

⚠️ Hay cambios locales que se perderán:
   - config.local.js (modified)

¿Continuar y descartar cambios? [s/N]

> s

📥 Sincronizando con origin/develop...

✅ Ambiente dev sincronizado

   Branch: develop
   Commit: abc1234 - feat: latest changes
   Fecha: 2026-01-28 10:45:00

📦 Ejecutando post-sync: npm install
   ✓ Dependencias instaladas
```

### Ambiente prod (Readonly)

```
🔄 Sincronizando ambiente: prod

📥 Sincronizando con origin/main...

✅ Ambiente prod sincronizado

   Branch: main
   Commit: def5678 - Release v1.2.3

🔒 Recordatorio: prod es READONLY
   No hagas commits directamente en este ambiente.
```

---

## Comando: status

### Propósito

Muestra el estado completo del sistema de worktrees.

### Sintaxis

```bash
/worktree status
```

### Output

```
📊 Estado del sistema de worktrees

CONFIGURACIÓN:
   Inicializado: ✅ 2026-01-28
   Main branch: main
   Develop branch: develop

AMBIENTES:
┌──────┬──────────┬──────────┬─────────────────────────────────┐
│ Env  │ Branch   │ Estado   │ Último commit                   │
├──────┼──────────┼──────────┼─────────────────────────────────┤
│ dev  │ develop  │ ✅ Limpio │ abc1234 - feat: add auth        │
│ qa   │ develop  │ ⚠️ 2 mod  │ abc1234 - feat: add auth        │
│ prod │ main     │ ✅ Limpio │ def5678 - Release v1.2.3     🔒 │
└──────┴──────────┴──────────┴─────────────────────────────────┘

FEATURES ACTIVOS:
┌─────────────────┬─────────────────────┬──────────┬───────────────┐
│ Nombre          │ Branch              │ Estado   │ Commits ahead │
├─────────────────┼─────────────────────┼──────────┼───────────────┤
│ feature-auth    │ feature/auth-login  │ ⚠️ 3 mod │ +5 de develop │
│ hotfix-123      │ hotfix/123-payment  │ ✅ Limpio │ +2 de develop │
└─────────────────┴─────────────────────┴──────────┴───────────────┘

RESUMEN:
   Total worktrees: 5
   Ambientes: 3 (1 con cambios)
   Features: 2 (1 con cambios)
   Huérfanos: 0
```

---

## Estructura de Archivos

### Estructura Completa

```
proyecto/
├── .worktrees/
│   ├── .meta/
│   │   ├── config.json           # Configuración del sistema
│   │   └── active-features.json  # Features activos
│   ├── environments/
│   │   ├── dev/                  # Worktree → develop
│   │   │   └── [copia del proyecto]
│   │   ├── qa/                   # Worktree → develop
│   │   │   └── [copia del proyecto]
│   │   └── prod/                 # Worktree → main (readonly)
│   │       └── [copia del proyecto]
│   └── features/
│       ├── feature-auth-login/   # Worktree → feature/auth-login
│       │   └── [copia del proyecto]
│       └── hotfix-123-payment/   # Worktree → hotfix/123-payment
│           └── [copia del proyecto]
├── src/
├── package.json
└── .gitignore                    # Incluye .worktrees/
```

### Archivos de Configuración

#### config.json

```json
{
  "initialized": true,
  "initializedAt": "2026-01-28T10:00:00Z",
  "mainBranch": "main",
  "developBranch": "develop",
  "environments": {
    "dev": {
      "branch": "develop",
      "detached": false,
      "path": ".worktrees/environments/dev"
    },
    "qa": {
      "branch": "develop",
      "detached": true,
      "path": ".worktrees/environments/qa"
    },
    "prod": {
      "branch": "main",
      "detached": true,
      "path": ".worktrees/environments/prod",
      "readonly": true
    }
  }
}
```

#### active-features.json

```json
{
  "features": [
    {
      "name": "auth-login",
      "type": "feature",
      "branch": "feature/auth-login",
      "path": ".worktrees/features/feature-auth-login",
      "issue": "001",
      "createdAt": "2026-01-28T10:30:00Z"
    }
  ],
  "lastUpdated": "2026-01-28T10:30:00Z"
}
```

---

## Ambientes Permanentes

### Descripción

Los ambientes son worktrees que **siempre existen** y representan estados específicos del proyecto.

| Ambiente | Branch | Propósito | Modificable |
|----------|--------|-----------|-------------|
| `dev` | develop | Desarrollo activo | ✅ Sí |
| `qa` | develop/release | Testing formal | ⚠️ Temporal |
| `prod` | main | Producción | ❌ Readonly |

### Ambiente: dev

```
Propósito: Desarrollo activo, integración de features

Branch: develop

Uso:
- Probar integración de features mergeados
- Desarrollo exploratorio rápido
- Base para crear nuevos features

Comandos:
- /worktree switch dev
- /worktree env sync dev
```

### Ambiente: qa

```
Propósito: Testing formal antes de release

Branch: develop (o release/* durante releases)

Uso:
- Ejecutar /qa en ambiente aislado
- Testing de regresión
- Validación pre-release

Comandos:
- /worktree switch qa
- /worktree env sync qa
```

### Ambiente: prod

```
Propósito: Representar estado de producción

Branch: main

Uso:
- Verificar estado actual de producción
- Debugging de issues en prod
- Referencia para hotfixes

⚠️ READONLY: No hacer commits directos

Comandos:
- /worktree switch prod
- /worktree env sync prod
```

---

## Features Temporales

### Descripción

Los worktrees de features son **temporales** y se crean/eliminan según el desarrollo.

### Ciclo de Vida

```
1. Crear worktree
   /worktree create auth-login
        │
        ▼
2. Desarrollar en worktree
   cd .worktrees/features/feature-auth-login
   # ... código ...
   git commit
        │
        ▼
3. QA en worktree o ambiente QA
   /qa --issue 001
        │
        ▼
4. Merge
   /merge --issue 001
        │
        ▼
5. Cleanup automático
   Worktree eliminado
   Branch eliminado
```

### Nomenclatura

| Tipo | Branch | Worktree |
|------|--------|----------|
| Feature | `feature/{slug}` | `.worktrees/features/feature-{slug}` |
| Hotfix | `hotfix/{id}-{slug}` | `.worktrees/features/hotfix-{id}-{slug}` |

### Reglas

1. **Un feature = un worktree**
   - No mezclar trabajo de múltiples features

2. **Basados en develop**
   - Siempre crear desde develop actualizado

3. **Eliminar tras merge**
   - /merge hace cleanup automático

---

## Integración con GitFlow

### Flujo Visual

```
                                    main
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         │    ┌───────────────────────┴───────────────────────┐   │
         │    │                    develop                     │   │
         │    │                       │                        │   │
         │    │    ┌──────────────────┼──────────────────┐    │   │
         │    │    │                  │                  │    │   │
         │    │    │     feature/     │     feature/     │    │   │
         │    │    │     auth-login   │     user-profile │    │   │
         │    │    │         │        │         │        │    │   │
         │    │    │         ▼        │         ▼        │    │   │
         │    │    │     [worktree]   │     [worktree]   │    │   │
         │    │    │                  │                  │    │   │
         │    │    └──────────────────┴──────────────────┘    │   │
         │    │                                                │   │
         │    │              release/v1.2.0                    │   │
         │    │                    │                           │   │
         │    │                    ▼                           │   │
         │    │               [ambiente qa]                    │   │
         │    │                                                │   │
         │    └────────────────────────────────────────────────┘   │
         │                                                          │
         │                    [ambiente prod]                       │
         │                                                          │
         └──────────────────────────────────────────────────────────┘

         [ambiente dev]
```

### Correspondencia

| GitFlow | Worktree |
|---------|----------|
| Branch main | Ambiente prod |
| Branch develop | Ambiente dev |
| Feature branches | Worktrees temporales |
| Release branches | Ambiente qa |
| Hotfix branches | Worktrees temporales |

---

## Integración con Otros Skills

### /build-feature

```
Si worktrees están habilitados:

/build-feature --issue 001
        │
        ├─► Verificar si existe worktree
        │
        ├─► Si NO existe → Crear automáticamente
        │     /worktree create 001-video-background
        │
        └─► Trabajar en el worktree
```

### /qa

```
Si worktrees están habilitados:

/qa --issue 001 (standard mode - por feature)
        │
        ├─► Preguntar ambiente de pruebas:
        │     a) Worktree de feature (rápido)
        │     b) Ambiente QA formal
        │
        ├─► Si (a) → Ejecutar en worktree del feature
        │
        └─► Si (b) → Sincronizar QA, merge temporal, probar

/qa --env qa (env mode - integración post-promote)
        │
        ├─► Ejecutar en .worktrees/environments/qa/
        ├─► Full test suite + cross-feature integration
        ├─► @security deep review (STRIDE + OWASP)
        ├─► @ux-accessibility full WCAG audit
        └─► Resultado → gate para /release
```

### /merge

```
/merge --issue 001
        │
        ├─► cd .worktrees/environments/dev
        │     (merge se ejecuta DENTRO de dev/ porque develop está checked out ahí)
        ├─► Stash cambios exploratorios si existen
        ├─► git pull origin develop
        ├─► git merge {branch} --no-ff (merge del feature a develop)
        ├─► git push origin develop
        │
        ├─► cd {repo_principal}
        ├─► Cleanup automático:
        │     ├─► Eliminar worktree del feature
        │     └─► Eliminar branch feature
        │
        └─► Actualizar active-features.json
```

> **Nota**: El merge opera dentro de dev/ porque git no permite `git checkout develop` en el repo principal cuando ese branch ya está en uso por el worktree dev/. dev/ queda sincronizado automáticamente al ejecutar el merge ahí.

---

## Ejemplo Práctico: Desarrollo de Feature

### Escenario

Desarrollar feature de autenticación (issue #001).

### Flujo Completo

```bash
# 1. Inicializar worktrees (si no está hecho)
/worktree init

# 2. Crear worktree para el feature
/worktree create 001-auth-login

# 3. Navegar al worktree
cd .worktrees/features/feature-001-auth-login

# 4. Desarrollar...
# ... editar archivos ...
git add src/features/auth/login.tsx src/features/auth/types.ts
git commit -m "feat(auth): add login form"

# 5. Más desarrollo...
git commit -m "feat(auth): add validation"
git commit -m "test(auth): add unit tests"

# 6. Verificar estado
/worktree status

# 7. Ejecutar QA en el worktree
/qa --issue 001

# 8. Si QA pasa, merge (cleanup automático)
/merge --issue 001

# 9. El worktree ya fue eliminado automáticamente
/worktree list
# Solo muestra ambientes + otros features
```

### Timeline Visual

```
Tiempo →

/worktree init
      │
      ▼
Ambientes creados: dev, qa, prod
      │
      ▼
/worktree create 001-auth-login
      │
      ▼
[Worktree feature-001-auth-login creado]
      │
      ▼
Desarrollo en worktree...
   commit 1, commit 2, commit 3
      │
      ▼
/qa --issue 001
      │
      ├─► Tests pasan
      ├─► Security Gate OK
      └─► QA Aprobado
      │
      ▼
/merge --issue 001
      │
      ├─► Feature branch → develop
      ├─► Issue cerrado
      └─► Worktree eliminado automáticamente
      │
      ▼
Solo quedan: dev, qa, prod
```

---

## Troubleshooting

### "Worktree ya existe"

**Síntoma:** Error al crear worktree con nombre existente.

**Solución:**
```bash
# Verificar worktrees existentes
/worktree list

# Si está huérfano, limpiar
/worktree cleanup

# O eliminar manualmente
/worktree delete {nombre}
```

### "Branch ya existe"

**Síntoma:** El branch ya existe pero no tiene worktree.

**Solución:**
```bash
# Crear worktree para branch existente
git worktree add .worktrees/features/feature-{nombre} feature/{nombre}
```

### "Worktree tiene cambios sin guardar"

**Síntoma:** No se puede eliminar worktree con cambios.

**Solución:**
```bash
# Opción 1: Guardar cambios
cd .worktrees/features/feature-{nombre}
git add {archivos_modificados} && git commit -m "WIP"

# Opción 2: Descartar cambios
git checkout -- .

# Opción 3: Forzar eliminación
/worktree delete {nombre}
# Confirmar cuando pregunte
```

### "No se puede sincronizar ambiente"

**Síntoma:** Error al sincronizar con remote.

**Solución:**
```bash
# Verificar conexión
git fetch origin

# Verificar branch remoto existe
git branch -r | grep {branch}

# Forzar sincronización
cd .worktrees/environments/{env}
git fetch origin
git reset --hard origin/{branch}
```

### "Directorio .worktrees no existe"

**Síntoma:** Comandos fallan porque no hay inicialización.

**Solución:**
```bash
/worktree init
```

---

## Resumen Visual

```
/worktree
    │
    ├─► init
    │       │
    │       ├─► Crear estructura .worktrees/
    │       ├─► Crear branch develop
    │       ├─► Crear ambientes (dev, qa, prod)
    │       └─► Guardar configuración
    │
    ├─► create {nombre}
    │       │
    │       ├─► Detectar tipo (feature/hotfix)
    │       ├─► Actualizar develop
    │       ├─► Crear branch
    │       ├─► Crear worktree
    │       └─► Registrar en active-features.json
    │
    ├─► list
    │       │
    │       └─► Mostrar ambientes + features
    │
    ├─► switch {nombre}
    │       │
    │       └─► Mostrar path del worktree
    │
    ├─► delete {nombre}
    │       │
    │       ├─► Verificar no es ambiente
    │       ├─► Confirmar si hay cambios
    │       ├─► Eliminar worktree
    │       └─► Opcional: eliminar branch
    │
    ├─► cleanup
    │       │
    │       ├─► Buscar huérfanos
    │       ├─► Confirmar limpieza
    │       └─► git worktree prune
    │
    ├─► env sync {env}
    │       │
    │       ├─► Confirmar descarte de cambios
    │       ├─► git fetch && reset --hard
    │       └─► Post-sync (npm install, etc.)
    │
    └─► status
            │
            └─► Mostrar estado completo
```

---

## Comandos Git Equivalentes

| /worktree | Git equivalente |
|-----------|-----------------|
| `list` | `git worktree list` |
| `create {nombre}` | `git worktree add .worktrees/... branch` |
| `delete {nombre}` | `git worktree remove ... --force` |
| `cleanup` | `git worktree prune` |
| `status` | `git worktree list --porcelain` + análisis |

---

## Referencias

- Skill Worktree: `.claude/skills/worktree/SKILL.md`
- Rules Git Worktrees: `.claude/rules/git-worktrees.md`
- Rules Git Protection: `.claude/rules/git-protection.md`
- Git Worktrees Docs: https://git-scm.com/docs/git-worktree
- GitFlow: https://nvie.com/posts/a-successful-git-branching-model/
