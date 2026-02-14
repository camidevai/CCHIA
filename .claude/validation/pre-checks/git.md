# Git Pre-checks

## Propósito
Verificaciones de Git antes de ejecutar skills que dependen de control de versiones.

---

## Checks Disponibles

### 1. Repositorio Existe

```bash
git rev-parse --is-inside-work-tree
```

| Resultado | Severidad | Acción |
|-----------|-----------|--------|
| true | OK | Continuar |
| false/error | ERROR | Bloquear |

**Mensaje de error:**
```
❌ GIT_NOT_FOUND: No se encontró repositorio git

Problema:
  El directorio actual no es un repositorio git.

Solución:
  Inicializa un repositorio:

  git init

  O clona un repositorio existente:

  git clone <url>
```

---

### 2. Estado del Working Tree

```bash
git status --porcelain
```

| Resultado | Severidad | Acción |
|-----------|-----------|--------|
| Vacío | OK | Continuar |
| Con cambios | WARN | Advertir, preguntar |

**Mensaje de warning:**
```
⚠️ DIRTY_WORKTREE: Hay cambios sin commitear

Archivos modificados:
  M  src/app.ts
  M  src/utils.ts
  ?  temp.log

Opciones:
  1. Stash: git stash push -m "antes de skill"
  2. Commitear (staging explícito): git add <archivos> && git commit -m "wip"
  3. Continuar de todas formas

  ⚠️ NUNCA usar `git add .` o `git add -A` — hacer staging explícito por archivo.

¿Qué deseas hacer? [1/2/3]
```

---

### 3. Remote Configurado

```bash
git remote -v
```

| Resultado | Severidad | Acción |
|-----------|-----------|--------|
| Con remotes | OK | Continuar |
| Sin remotes | WARN | Advertir (si skill necesita push) |

**Mensaje de warning:**
```
⚠️ NO_REMOTE: No hay remote configurado

Problema:
  No hay repositorio remoto configurado.
  Skills que necesitan push/pull no funcionarán.

Solución:
  Agrega un remote:

  git remote add origin <url>

O continúa si solo trabajarás localmente.
```

---

### 4. Branch Actual

```bash
git branch --show-current
```

| Resultado | Severidad | Acción |
|-----------|-----------|--------|
| Nombre de branch | OK | Continuar |
| Vacío (detached) | CONTEXTUAL | Ver tabla abajo |

**Evaluación contextual de Detached HEAD:**

> El detached HEAD es válido en ciertos contextos con worktrees.

```bash
# Detectar contexto
CURRENT_PATH=$(pwd)
IS_QA_ENV=$(echo "$CURRENT_PATH" | grep -q "\.worktrees/environments/qa" && echo "true" || echo "false")
IS_PROD_ENV=$(echo "$CURRENT_PATH" | grep -q "\.worktrees/environments/prod" && echo "true" || echo "false")
IS_DEV_ENV=$(echo "$CURRENT_PATH" | grep -q "\.worktrees/environments/dev" && echo "true" || echo "false")
```

| Contexto | Detached HEAD | Severidad | Acción |
|----------|---------------|-----------|--------|
| `.worktrees/environments/qa/` | Esperado | **OK** | Continuar (qa/ usa detached por diseño) |
| `.worktrees/environments/prod/` | Esperado | **OK** | Continuar (prod/ usa detached por diseño) |
| `.worktrees/environments/dev/` | Inesperado | **ERROR** | Bloquear (dev/ debe estar en develop) |
| `.worktrees/features/*` | Inesperado | **WARN** | Advertir (feature debe estar en branch) |
| Repo principal | Inesperado | **WARN** | Advertir (debería estar en main) |

**Mensaje para qa/ y prod/ (OK):**
```
ℹ️ DETACHED_HEAD: Modo detached HEAD (esperado)

Contexto:
  Estás en ambiente {qa|prod} con detached HEAD.
  Esto es el comportamiento esperado por diseño.

  qa/ y prod/ usan detached HEAD para sincronizarse
  con origin/develop y origin/main respectivamente.

Continuar: ✅
```

**Mensaje para dev/ en detached (ERROR):**
```
⛔ DETACHED_HEAD: dev/ está en detached HEAD (inesperado)

Problema:
  El ambiente dev/ debería estar en el branch 'develop',
  pero está en detached HEAD.

  Esto indica un estado corrupto del worktree.

Solución:
  cd .worktrees/environments/dev
  git checkout develop

  Si develop no existe localmente:
  git checkout -b develop origin/develop
```

**Mensaje para otros contextos (WARN):**
```
⚠️ DETACHED_HEAD: Estás en modo detached HEAD

Problema:
  No estás en un branch, estás en un commit específico.
  Los commits que hagas podrían perderse.

Solución:
  Crea un branch desde aquí:

  git checkout -b nombre-del-branch

O vuelve a un branch existente:

  git checkout main
```

---

### 5. No hay Merge/Rebase en Progreso

```bash
# Verificar merge en progreso
test -f .git/MERGE_HEAD

# Verificar rebase en progreso
test -d .git/rebase-merge || test -d .git/rebase-apply
```

| Resultado | Severidad | Acción |
|-----------|-----------|--------|
| No existe | OK | Continuar |
| Existe | ERROR | Bloquear hasta resolver |

**Mensaje de error (merge):**
```
❌ MERGE_IN_PROGRESS: Hay un merge sin terminar

Problema:
  Hay un merge en progreso que debe completarse o abortarse.

Solución:
  Completar el merge:

  git add <archivos-resueltos>
  git commit

  O abortar:

  git merge --abort
```

**Mensaje de error (rebase):**
```
❌ REBASE_IN_PROGRESS: Hay un rebase sin terminar

Problema:
  Hay un rebase en progreso que debe completarse o abortarse.

Solución:
  Continuar el rebase:

  git rebase --continue

  O abortar:

  git rebase --abort
```

---

### 6. Branch Base Actualizado (opcional)

```bash
# Fetch para comparar
git fetch origin develop

# Comparar
git rev-list HEAD..origin/develop --count
```

| Resultado | Severidad | Acción |
|-----------|-----------|--------|
| 0 | OK | Continuar |
| >0 | WARN | Sugerir pull |

**Mensaje de warning:**
```
⚠️ BRANCH_BEHIND: Tu branch está detrás del remoto

Problema:
  develop tiene 5 commits que no tienes localmente.
  Podrías tener conflictos al hacer merge.

Solución:
  Actualiza antes de continuar:

  git pull origin develop

O continúa sabiendo que podrías tener conflictos.
```

---

## Orden de Ejecución

```
1. Repositorio existe     → Si falla, ERROR (no continuar)
2. Merge/Rebase pendiente → Si falla, ERROR (no continuar)
3. Estado worktree        → Si falla, WARN (preguntar)
4. Branch actual          → Si falla, WARN (notificar)
5. Remote configurado     → Si falla, WARN (si aplica)
6. Branch actualizado     → Si falla, WARN (si aplica)
```

---

## Implementación

### Función de check completo

```typescript
interface GitCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

async function runGitChecks(): Promise<GitCheckResult> {
  const result: GitCheckResult = {
    passed: true,
    errors: [],
    warnings: []
  };

  // 1. Repositorio existe
  try {
    await exec('git rev-parse --is-inside-work-tree');
  } catch {
    result.passed = false;
    result.errors.push('GIT_NOT_FOUND');
    return result; // No continuar
  }

  // 2. Merge/Rebase pendiente
  if (await fileExists('.git/MERGE_HEAD')) {
    result.passed = false;
    result.errors.push('MERGE_IN_PROGRESS');
    return result;
  }

  if (await dirExists('.git/rebase-merge') || await dirExists('.git/rebase-apply')) {
    result.passed = false;
    result.errors.push('REBASE_IN_PROGRESS');
    return result;
  }

  // 3. Estado worktree
  const status = await exec('git status --porcelain');
  if (status.trim()) {
    result.warnings.push('DIRTY_WORKTREE');
  }

  // 4. Branch actual
  const branch = await exec('git branch --show-current');
  if (!branch.trim()) {
    result.warnings.push('DETACHED_HEAD');
  }

  // 5. Remote configurado
  const remotes = await exec('git remote -v');
  if (!remotes.trim()) {
    result.warnings.push('NO_REMOTE');
  }

  return result;
}
```

---

## Uso en Skills

### Template

```markdown
## Pre-check: Git

Verificando estado de git...

1. ✅ Repositorio git encontrado
2. ✅ No hay merge/rebase pendiente
3. ⚠️ Hay 2 archivos modificados
4. ✅ Branch actual: feature/login
5. ✅ Remote configurado: origin

### Advertencias:

⚠️ Hay cambios sin commitear. Se recomienda commitear o stash antes.

¿Continuar de todas formas? [s/N]
```
