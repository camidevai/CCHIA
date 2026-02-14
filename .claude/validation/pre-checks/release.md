# Release Pre-checks

## Propósito
Verificaciones específicas antes de ejecutar el skill `/release`.

---

## Checks Disponibles

### 1. Branch Permitido

```bash
BRANCH=$(git branch --show-current)
echo $BRANCH
```

| Resultado | Severidad | Acción |
|-----------|-----------|--------|
| develop | OK | Continuar (release normal) |
| main | OK | Continuar (hotfix release) |
| Otro | ERROR | Bloquear |

**Mensaje de error:**
```
❌ INVALID_BRANCH: Branch no permitido para release

Problema:
  Estás en branch: feature/auth
  Release solo puede iniciarse desde:
    - develop (release normal)
    - main (hotfix release)

Solución:
  Cambia al branch correcto:

  # Con worktrees: cd .worktrees/environments/dev
  # Sin worktrees: git checkout develop

  Si tienes cambios pendientes, primero haz merge:

  # Con worktrees: cd .worktrees/environments/dev
  # Sin worktrees: git checkout develop
  git merge feature/auth
```

---

### 2. Working Tree Limpio

```bash
git status --porcelain
```

| Resultado | Severidad | Acción |
|-----------|-----------|--------|
| Vacío | OK | Continuar |
| Con cambios | ERROR | Bloquear |

**Mensaje de error:**
```
❌ DIRTY_WORKTREE: Hay cambios sin commitear

Problema:
  El working tree debe estar limpio para hacer release.

Archivos modificados:
  M  src/app.ts
  M  package.json
  ?  temp.log

Solución:
  Guarda los cambios con stash:

  git stash push -m "before release"

  O commitea con staging explícito:

  git add src/file1.ts src/file2.ts
  git commit -m "chore: prepare for release"

  O descártalos:

  git checkout -- .
```

---

### 3. Sin Operaciones Git Pendientes

```bash
# Verificar merge en progreso
test -f .git/MERGE_HEAD && echo "MERGE"

# Verificar rebase en progreso
(test -d .git/rebase-merge || test -d .git/rebase-apply) && echo "REBASE"

# Verificar cherry-pick en progreso
test -f .git/CHERRY_PICK_HEAD && echo "CHERRY_PICK"
```

| Resultado | Severidad | Acción |
|-----------|-----------|--------|
| Ninguno | OK | Continuar |
| Cualquiera | ERROR | Bloquear |

**Mensaje de error (merge):**
```
❌ MERGE_IN_PROGRESS: Hay un merge sin terminar

Problema:
  Existe un merge en progreso que debe resolverse primero.

Solución:
  Completa el merge:

  git add <archivos-resueltos>
  git commit

  O abórtalo:

  git merge --abort
```

**Mensaje de error (rebase):**
```
❌ REBASE_IN_PROGRESS: Hay un rebase sin terminar

Problema:
  Existe un rebase en progreso que debe resolverse primero.

Solución:
  Continúa el rebase:

  git rebase --continue

  O abórtalo:

  git rebase --abort
```

---

### 4. Sincronización con Remote

```bash
# Fetch para comparar
git fetch origin

# Commits detrás del remote
BRANCH=$(git branch --show-current)
BEHIND=$(git rev-list HEAD..origin/$BRANCH --count 2>/dev/null || echo "0")

# Commits adelante del remote
AHEAD=$(git rev-list origin/$BRANCH..HEAD --count 2>/dev/null || echo "0")
```

| Resultado | Severidad | Acción |
|-----------|-----------|--------|
| BEHIND=0, AHEAD>=0 | OK | Continuar |
| BEHIND>0 | WARN | Advertir, sugerir pull |

**Mensaje de warning:**
```
⚠️ BRANCH_BEHIND: Tu branch está detrás del remote

Problema:
  origin/develop tiene 3 commits que no tienes localmente.
  Continuar podría causar conflictos al push.

Solución recomendada:
  Actualiza antes de continuar:

  git pull origin develop

Estado actual:
  - Commits detrás: 3
  - Commits adelante: 2

¿Continuar de todas formas? [s/N]
```

---

### 5. Tags Accesibles

```bash
# Verificar que hay al menos un tag o es primer release
git describe --tags --abbrev=0 --match "v*" 2>/dev/null
```

| Resultado | Severidad | Acción |
|-----------|-----------|--------|
| Tag encontrado | OK | Usar como base |
| Sin tags | OK | Primer release (v0.0.0 → v0.1.0 o v1.0.0) |

**Mensaje informativo (primer release):**
```
ℹ️ FIRST_RELEASE: No se encontraron tags previos

Este será el primer release del proyecto.
Se usará v0.0.0 como base para calcular la versión.

Versión sugerida según commits: v1.0.0 (MAJOR para primer release)

¿Continuar? [S/n]
```

---

### 6. Commits Disponibles

```bash
# Contar commits desde último tag
LAST_TAG=$(git describe --tags --abbrev=0 --match "v*" 2>/dev/null || echo "")
if [[ -n "$LAST_TAG" ]]; then
  COUNT=$(git rev-list $LAST_TAG..HEAD --count)
else
  COUNT=$(git rev-list HEAD --count)
fi
```

| Resultado | Severidad | Acción |
|-----------|-----------|--------|
| COUNT>0 | OK | Continuar |
| COUNT=0 | ERROR | Bloquear |

**Mensaje de error:**
```
❌ NO_COMMITS: No hay commits nuevos para release

Problema:
  No hay cambios desde el último release (v1.2.3).
  Un release vacío no tiene sentido.

Solución:
  Desarrolla nuevas features primero:

  /build-feature --issue 123

  O verifica que estás en el branch correcto:

  git log v1.2.3..HEAD --oneline
```

---

## Orden de Ejecución

```
1. Branch permitido       → Si falla, ERROR (no continuar)
2. Working tree limpio    → Si falla, ERROR (no continuar)
3. Sin operaciones git    → Si falla, ERROR (no continuar)
4. Sincronización remote  → Si falla, WARN (preguntar)
5. Tags accesibles        → Informativo
6. Commits disponibles    → Si falla, ERROR (no continuar)
```

---

## Implementación

### Función de check completo

```typescript
interface ReleaseCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  info: {
    branch: string;
    lastTag: string | null;
    commitCount: number;
    behindRemote: number;
    aheadRemote: number;
  };
}

async function runReleaseChecks(): Promise<ReleaseCheckResult> {
  const result: ReleaseCheckResult = {
    passed: true,
    errors: [],
    warnings: [],
    info: {
      branch: '',
      lastTag: null,
      commitCount: 0,
      behindRemote: 0,
      aheadRemote: 0
    }
  };

  // 1. Branch permitido
  const branch = await exec('git branch --show-current');
  result.info.branch = branch.trim();

  if (!['develop', 'main', 'master'].includes(result.info.branch)) {
    result.passed = false;
    result.errors.push('INVALID_BRANCH');
    return result;
  }

  // 2. Working tree limpio
  const status = await exec('git status --porcelain');
  if (status.trim()) {
    result.passed = false;
    result.errors.push('DIRTY_WORKTREE');
    return result;
  }

  // 3. Sin operaciones pendientes
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

  // 4. Sincronización con remote
  await exec('git fetch origin');
  try {
    const behind = await exec(`git rev-list HEAD..origin/${result.info.branch} --count`);
    result.info.behindRemote = parseInt(behind.trim()) || 0;

    const ahead = await exec(`git rev-list origin/${result.info.branch}..HEAD --count`);
    result.info.aheadRemote = parseInt(ahead.trim()) || 0;

    if (result.info.behindRemote > 0) {
      result.warnings.push('BRANCH_BEHIND');
    }
  } catch {
    // No remote, continuar
  }

  // 5. Tags accesibles
  try {
    const lastTag = await exec('git describe --tags --abbrev=0 --match "v*"');
    result.info.lastTag = lastTag.trim();
  } catch {
    result.info.lastTag = null; // Primer release
  }

  // 6. Commits disponibles
  let commitCount = 0;
  if (result.info.lastTag) {
    const count = await exec(`git rev-list ${result.info.lastTag}..HEAD --count`);
    commitCount = parseInt(count.trim()) || 0;
  } else {
    const count = await exec('git rev-list HEAD --count');
    commitCount = parseInt(count.trim()) || 0;
  }

  result.info.commitCount = commitCount;

  if (commitCount === 0) {
    result.passed = false;
    result.errors.push('NO_COMMITS');
  }

  return result;
}
```

---

## Uso en Skill

### Template de salida

```markdown
## Pre-check: Release

Verificando prerrequisitos para release...

1. ✅ Branch actual: develop (permitido)
2. ✅ Working tree limpio
3. ✅ No hay operaciones git pendientes
4. ⚠️ Branch está 2 commits detrás de origin/develop
5. ✅ Último tag: v1.2.3
6. ✅ 5 commits nuevos desde último release

### Advertencias:

⚠️ Hay 2 commits en origin/develop que no tienes.
   Considera hacer `git pull` antes de continuar.

¿Continuar con el release? [S/n]
```

### Si pasa todo

```markdown
## Pre-check: Release ✅

1. ✅ Branch: develop
2. ✅ Working tree limpio
3. ✅ Sin operaciones pendientes
4. ✅ Sincronizado con remote
5. ✅ Último tag: v1.2.3
6. ✅ 5 commits nuevos

Prerrequisitos cumplidos. Iniciando release...
```
