# Troubleshooting Guide

> Soluciones a problemas comunes del framework InformatiK-AI, organizados por categoria.

## Indice

- [Worktree Issues](#worktree-issues)
- [Merge Issues](#merge-issues)
- [QA Issues](#qa-issues)
- [Promote Issues](#promote-issues)
- [Release Issues](#release-issues)
- [Git Issues](#git-issues)
- [General Issues](#general-issues)
- [Checklist Post-Recovery](#checklist-post-recovery)

---

## Worktree Issues

### WT-01: Branch already checked out

**Problema:** Al intentar hacer `git checkout develop` en el repo principal, Git da error porque el branch ya esta en uso por un worktree.

**Sintomas:**
```
fatal: 'develop' is already checked out at '/path/to/.worktrees/environments/dev'
```

**Causa:** Git no permite tener el mismo branch checked out en dos worktrees simultaneamente. Cuando worktrees estan habilitados, `develop` esta en `dev/` y `main` esta en el repo principal.

**Solucion:**
```bash
# NO usar git checkout develop en repo principal
# En su lugar, navegar al worktree correspondiente:
cd .worktrees/environments/dev

# Para operaciones sobre develop (merge, pull, etc.),
# ejecutarlas DENTRO de dev/
```

**Referencia:** `.claude/rules/git-protection.md`, `.claude/rules/git-worktrees.md`

---

### WT-02: Orphaned worktrees

**Problema:** Worktrees huerfanos (el directorio fue eliminado manualmente pero Git aun tiene la referencia).

**Sintomas:**
```
$ git worktree list
/path/to/project                   abc1234 [main]
/path/to/.worktrees/features/feature-old  pruned
```

**Causa:** El directorio del worktree fue eliminado sin usar `git worktree remove`, o el proceso fue interrumpido.

**Solucion:**
```bash
# 1. Ver worktrees huerfanos
git worktree prune --dry-run

# 2. Limpiar referencias
git worktree prune

# 3. Verificar
git worktree list

# 4. Actualizar registro de features activos
# Editar .worktrees/.meta/active-features.json
# Eliminar la entrada del feature huerfano
```

---

### WT-03: Stale merge lock

**Problema:** El archivo `.worktrees/.meta/merge.lock` existe pero no hay merge en progreso. Bloquea nuevas operaciones.

**Sintomas:**
```
Merge en progreso (lock activo hace Xs). Esperar.
```

**Causa:** Un merge o promote anterior fallo sin liberar el lock, o el proceso fue interrumpido.

**Solucion:**
```bash
# 1. Verificar contenido del lock
cat .worktrees/.meta/merge.lock

# 2. Verificar que NO hay merge real en progreso
cd .worktrees/environments/dev
git status
# No debe mostrar "merge in progress"

# 3. Si NO hay merge en progreso, eliminar el lock
cd {repo_principal}
rm .worktrees/.meta/merge.lock

# 4. Si HAY un merge en progreso, decidir:
#    a) Completar el merge manualmente
#    b) Abortar: git merge --abort
#    Luego eliminar el lock
```

**Prevencion:** El lock se considera stale despues de 10 minutos. Verificar si el PID registrado en el lock sigue activo antes de eliminarlo.

---

### WT-04: Worktree cannot be removed

**Problema:** Error al intentar eliminar un worktree.

**Sintomas:**
```
fatal: cannot remove worktree: ... has modifications
```

**Causa:** El worktree tiene cambios sin commit o archivos untracked.

**Solucion:**
```bash
# Opcion 1: Guardar cambios primero
cd .worktrees/features/feature-{nombre}
git add {archivos}
git commit -m "chore: save WIP before cleanup"
cd {repo_principal}
git worktree remove .worktrees/features/feature-{nombre}

# Opcion 2: Descartar cambios y forzar
git worktree remove .worktrees/features/feature-{nombre} --force

# Opcion 3: Si el directorio no existe pero la referencia si
git worktree prune
```

---

### WT-05: Cannot create worktree - directory already exists

**Problema:** El directorio destino del worktree ya existe.

**Sintomas:**
```
fatal: '.../.worktrees/features/feature-auth' already exists
```

**Causa:** Un worktree previo no fue limpiado correctamente, o el directorio fue creado manualmente.

**Solucion:**
```bash
# 1. Verificar si hay worktree activo para ese directorio
git worktree list

# 2. Si aparece en la lista, eliminarlo primero
git worktree remove .worktrees/features/feature-auth --force

# 3. Si NO aparece en la lista, el directorio es huerfano
# Eliminar directorio manualmente (Windows/Linux)
rm -rf .worktrees/features/feature-auth     # Linux/Mac
rmdir /s /q .worktrees\features\feature-auth  # Windows

# 4. Limpiar referencias
git worktree prune

# 5. Reintentar creacion
/worktree create auth
```

---

## Merge Issues

### MG-01: Merge conflicts in worktree context

**Problema:** Conflictos al hacer merge de un feature a develop dentro de `dev/`.

**Sintomas:**
```
Auto-merging src/components/Shared.tsx
CONFLICT (content): Merge conflict in src/components/Shared.tsx
Automatic merge failed; fix conflicts and then commit the result.
```

**Causa:** El feature branch y develop modificaron los mismos archivos en las mismas lineas.

**Solucion paso a paso:**
```bash
# 1. Estas dentro de .worktrees/environments/dev/ donde ocurrio el merge
cd .worktrees/environments/dev

# 2. Ver archivos en conflicto
git status
# Muestra "both modified: ..."

# 3. Abrir cada archivo y resolver conflictos
# Buscar marcadores: <<<<<<<, =======, >>>>>>>
# Elegir que codigo mantener (o combinar)

# 4. Staging EXPLICITO de archivos resueltos (NUNCA git add -A)
git add src/components/Shared.tsx

# 5. Completar el merge
git commit -m "feat(scope): merge feature/xxx into develop

Resolved conflicts in src/components/Shared.tsx"

# 6. Push
git push origin develop
```

**Si la resolucion falla o no estas seguro:**
```bash
# Abortar y volver al estado anterior
git merge --abort

# El feature branch queda intacto para reintentar
# Liberar lock si existe
rm -f {repo_principal}/.worktrees/.meta/merge.lock
```

**Lo que NO se debe hacer si un merge falla:**
- NO eliminar el worktree del feature (el branch tiene trabajo valido)
- NO eliminar el feature branch
- NO usar `git add -A` o `git add .` (puede incluir archivos no deseados)

---

### MG-02: Merge lock stuck

**Problema:** El merge lock impide operaciones pero no hay merge activo.

**Sintomas:**
```
Merge en progreso (lock activo). Esperar.
```

**Causa:** El lock no fue liberado despues de un merge exitoso o fallido.

**Solucion:**

Ver [WT-03: Stale merge lock](#wt-03-stale-merge-lock) para la solucion completa.

---

### MG-03: Failed merge cleanup

**Problema:** El merge se completo pero el cleanup (eliminar worktree, branch, actualizar active-features.json) fallo.

**Sintomas:**
- El worktree del feature sigue existiendo despues del merge
- `active-features.json` aun lista el feature
- Branch feature aun existe

**Causa:** Interrupcion durante la fase de cleanup del skill `/merge`.

**Solucion:**
```bash
# 1. Verificar que el merge SI se completo
cd .worktrees/environments/dev
git log --oneline -5
# Debe mostrar el commit de merge

# 2. Cleanup manual del worktree
cd {repo_principal}
git worktree remove .worktrees/features/feature-{nombre} --force

# 3. Eliminar branch
git branch -d feature/{nombre}

# 4. Editar active-features.json
# Eliminar la entrada del feature completado

# 5. Liberar lock si existe
rm -f .worktrees/.meta/merge.lock
```

---

### MG-04: Merge target is main instead of develop

**Problema:** Un feature fue mergeado a main en lugar de develop.

**Sintomas:**
- Commits del feature aparecen en main pero no en develop
- GitFlow roto

**Causa:** Error del operador o skill mal configurado.

**Solucion:**
```bash
# 1. Revertir el merge en main
git checkout main
git revert -m 1 HEAD
git push origin main

# 2. Merge correcto a develop
# Con worktrees:
cd .worktrees/environments/dev
git pull origin develop
git merge feature/{nombre} --no-ff
git push origin develop
cd {repo_principal}

# Sin worktrees:
git checkout develop
git merge feature/{nombre} --no-ff
git push origin develop
```

---

## QA Issues

### QA-01: Session not found

**Problema:** El skill `/merge` o `/promote` no encuentra la sesion de QA aprobada.

**Sintomas:**
```
No se puede hacer merge: Issue #001 no tiene QA aprobado
```

**Causa:** La sesion QA no existe, tiene formato incorrecto, o el nombre del archivo no sigue la convencion.

**Solucion:**
```bash
# 1. Verificar que existe la sesion
ls .claude/sessions/*qa*001*

# 2. Verificar contenido (debe tener "Resultado: APROBADO")
# Buscar la linea de resultado en el archivo de sesion

# 3. Si no existe, ejecutar QA
/qa --issue 001

# 4. Si existe pero el formato es incorrecto, verificar que contiene:
#    - "Resultado: APROBADO" o "## Security Gate" con "APROBADO"
#    - El numero de issue correcto
```

**Formato esperado del nombre:** `YYYY-MM-DD-qa-{issue}.md`

---

### QA-02: Expired QA session

**Problema:** La sesion QA existe pero se considera "antigua" porque hubo cambios posteriores.

**Sintomas:**
```
QA aprobado pero hay commits posteriores. Re-ejecutar /qa.
```

**Causa:** Se hicieron commits despues de que QA aprobo, invalidando la sesion.

**Solucion:**
```bash
# 1. Verificar que commits adicionales
git log --oneline HEAD~5..HEAD

# 2. Si los commits son relevantes, re-ejecutar QA
/qa --issue 001

# 3. Si los commits son triviales (docs, formato), considerar
#    que la sesion aun es valida y documentar
```

---

### QA-03: Security Gate false positives

**Problema:** El Security Gate detecta "secrets" que no son realmente secrets.

**Sintomas:**
```
Security Gate: BLOQUEADO
Secrets Detection: API_KEY detectada en src/constants.ts
```

**Causa:** Variables con nombres que coinciden con patrones de secrets (api_key, secret, token) pero son constantes publicas o nombres de campo.

**Solucion:**
```bash
# 1. Verificar que NO es un secret real
# Revisar el archivo y linea reportada

# 2. Si es falso positivo, agregar comentario de exclusion
# En el codigo: agregar comentario // nosec en la linea

# 3. Documentar la excepcion en la sesion de QA
# Explicar por que no es un secret real

# 4. Re-ejecutar QA
/qa --issue 001
```

**Patrones comunes de falsos positivos:**
- `API_KEY` como nombre de campo en un tipo/interface (no un valor)
- `secret` en un string de documentacion
- `token` como nombre de parametro en una funcion
- `password` como label de un campo de formulario

---

### QA-04: qa-env session not found by /release

**Problema:** El skill `/release` busca sesion de `/qa --env qa` pero no la encuentra.

**Sintomas:**
```
No se encontro sesion de /qa --env qa. Se recomienda ejecutar.
```

**Causa:** No se ejecuto `/qa --env qa` despues de `/promote --to qa`, o la sesion tiene formato incorrecto.

**Solucion:**
```bash
# 1. Verificar si existe
ls .claude/sessions/*qa-env*

# 2. Si no existe, ejecutar
/qa --env qa

# 3. Si existe pero /release no la reconoce, verificar nombre:
#    Formato esperado: YYYY-MM-DD-qa-env-qa.md

# 4. /release puede proceder con warning si qa-env no se ejecuto
#    (no es bloqueante, pero se recomienda)
```

---

## Promote Issues

### PM-01: Blocked promotion

**Problema:** `/promote --to qa` esta bloqueado por features sin QA o Security Gate.

**Sintomas:**
```
Promocion bloqueada. Features sin QA aprobado:
  - feature/003-user-data: QA PENDING
```

**Causa:** Uno o mas features mergeados a develop no tienen QA aprobado o el Security Gate fallo.

**Solucion:**
```bash
# 1. Identificar features pendientes
/worktree status

# 2. Ejecutar QA para cada feature pendiente
/qa --issue 003

# 3. Resolver problemas de Security Gate si aplica

# 4. Reintentar promocion
/promote --to qa
```

**Alternativa:** Promocion parcial (solo features con QA aprobado):
```
El skill preguntara: "Continuar promocion parcial? [s/N]"
```

---

### PM-02: Empty or missing promotions.json

**Problema:** El archivo `promotions.json` no existe o esta vacio/corrupto.

**Sintomas:**
```
Error al leer promotions.json
```
O `/release` no puede verificar que qa fue promovido.

**Causa:** Primera ejecucion, archivo eliminado accidentalmente, o escritura interrumpida.

**Solucion:**
```bash
# 1. Verificar si existe
ls .worktrees/.meta/promotions.json

# 2. Si no existe, crear con estructura base
# El archivo debe contener:
```
```json
{
  "promotions": [],
  "lastSync": {
    "dev": null,
    "qa": null,
    "prod": null
  }
}
```
```bash
# 3. Si esta corrupto, restaurar desde backup o recrear
# Verificar con: cat .worktrees/.meta/promotions.json | python -m json.tool

# 4. Re-ejecutar /promote para regenerar metadata
/promote --to qa
```

---

### PM-03: Sync failures during promote

**Problema:** La sincronizacion del ambiente falla durante la promocion.

**Sintomas:**
```
Error al sincronizar qa/ con develop
```

**Causa:** Problemas de red, branch remoto no existe, o conflictos inesperados.

**Solucion:**
```bash
# 1. Verificar conectividad con remote
git fetch origin

# 2. Verificar que el branch remoto existe
git branch -r | grep develop

# 3. Sincronizar manualmente
cd .worktrees/environments/qa
git fetch origin develop
git reset --hard origin/develop

# 4. Volver al repo principal
cd {repo_principal}

# 5. Liberar lock si existe
rm -f .worktrees/.meta/merge.lock

# 6. Reintentar promocion o registrar manualmente en promotions.json
```

---

## Release Issues

### RL-01: No conventional commits found

**Problema:** `/release` no puede calcular la version porque no hay commits con formato conventional.

**Sintomas:**
```
No se encontraron commits convencionales desde v1.0.0.
No hay cambios para incluir en un release.
```

**Causa:** Los commits no siguen el formato `type(scope): description`.

**Solucion:**
```bash
# 1. Ver los commits desde el ultimo tag
git log v1.0.0..HEAD --oneline

# 2. Si hay commits pero sin formato conventional:
#    Opcion A: Forzar tipo de bump
/release --type minor

#    Opcion B: Reescribir commits (solo si NO estan pusheados)
#    PELIGROSO: no hacer en branches compartidos

# 3. Para futuros commits, usar formato conventional:
#    feat(scope): description
#    fix(scope): description
```

**Prevencion:** Configurar commit-msg hook para validar formato conventional.

---

### RL-02: Tag already exists

**Problema:** El tag calculado para el release ya existe.

**Sintomas:**
```
El tag v2.0.0 ya existe
```

**Causa:** Un release previo con esa version ya fue creado, o el tag fue creado manualmente.

**Solucion:**
```
El skill ofrece opciones:
  a) Usar siguiente version (v2.0.1)
  b) Eliminar tag existente y recrear (peligroso)
  c) Abortar release
```
```bash
# Si necesitas eliminar el tag:
# Solo local:
git tag -d v2.0.0

# Local y remoto:
git tag -d v2.0.0
git push origin :refs/tags/v2.0.0

# Luego reintentar
/release
```

---

### RL-03: qa-env not run before release

**Problema:** `/release` advierte que `/qa --env qa` no fue ejecutado.

**Sintomas:**
```
No se encontro sesion de /qa --env qa.
```

**Causa:** El flujo salto la fase de integracion formal.

**Solucion:**
```bash
# 1. Ejecutar la cadena completa
/promote --to qa

# 2. Ejecutar QA formal
/qa --env qa

# 3. Proceder con release
/release
```

**Nota:** Dependiendo del resultado de `/qa --env qa`:
- PASSED: release procede sin problema
- CONDITIONAL: release procede con warning
- FAILED: release bloqueado hasta resolver
- NOT RUN: release procede con warning

---

### RL-04: Conflict during release merge to main

**Problema:** Conflictos al hacer merge de la release branch a main.

**Sintomas:**
```
Conflicto detectado al hacer merge a main
Archivos en conflicto: ...
```

**Causa:** main tiene cambios (hotfix, otro release) que no estan en develop.

**Solucion:**
```bash
# Opcion A: Resolver conflictos
# 1. Resolver archivos en conflicto manualmente
# 2. git add {archivos resueltos}
# 3. git commit

# Opcion B: Abortar y sincronizar
git merge --abort
git checkout develop
git merge origin/main --no-ff
# Resolver conflictos en develop primero, luego reintentar release

# Opcion C: Abortar release completamente
git merge --abort
git checkout develop
git branch -d release/vX.Y.Z
```

---

### RL-05: Release partially completed

**Problema:** El release fallo a mitad del proceso GitFlow.

**Sintomas:**
- Branch `release/vX.Y.Z` existe pero no fue mergeada
- Tag creado pero merge incompleto
- Main y develop desincronizados

**Causa:** Error de red, conflictos, o interrupcion del proceso.

**Solucion (antes de push):**
```bash
# 1. Volver a develop
git checkout develop

# 2. Eliminar branch de release
git branch -D release/vX.Y.Z

# 3. Eliminar tag local si fue creado
git tag -d vX.Y.Z

# 4. Verificar estado
git status
git log --oneline -5
```

**Solucion (despues de push parcial):**
```bash
# 1. Eliminar tag remoto si fue pusheado
git push origin :refs/tags/vX.Y.Z
git tag -d vX.Y.Z

# 2. Revertir merge en main si fue pusheado
git checkout main
git revert -m 1 HEAD
git push origin main

# 3. Revertir merge en develop si fue pusheado
# Con worktrees:
cd .worktrees/environments/dev
git revert -m 1 HEAD
git push origin develop
cd {repo_principal}

# Sin worktrees:
git checkout develop
git revert -m 1 HEAD
git push origin develop

# 4. Eliminar GitHub Release si fue creado
gh release delete vX.Y.Z --yes

# 5. Limpiar
git branch -D release/vX.Y.Z
```

---

## Git Issues

### GI-01: Detached HEAD (expected vs unexpected)

**Problema:** Git muestra warning de "detached HEAD" y no esta claro si es un problema.

**Cuando es ESPERADO (no es problema):**
- Ambientes `qa/` y `prod/` de worktrees siempre usan detached HEAD por diseno
- Al ejecutar `git checkout {tag}` para inspeccion

**Cuando es INESPERADO (problema):**
- En ambiente `dev/` (debe estar en branch `develop`)
- En un worktree de feature (debe estar en su feature branch)
- En el repo principal (debe estar en `main`)

**Sintomas:**
```
HEAD detached at abc1234
```

**Solucion (si es inesperado):**
```bash
# Para dev/:
cd .worktrees/environments/dev
git checkout develop

# Para un feature worktree:
cd .worktrees/features/feature-{nombre}
git checkout feature/{nombre}

# Para repo principal:
git checkout main
```

**Solucion (si qa/ o prod/ perdieron su detached HEAD):**
```bash
# Resincronizar
cd .worktrees/environments/qa
git fetch origin develop
git reset --hard origin/develop

cd .worktrees/environments/prod
git fetch origin main
git reset --hard origin/main
```

---

### GI-02: Working tree dirty

**Problema:** Git reporta cambios no commiteados que bloquean operaciones.

**Sintomas:**
```
error: Your local changes to the following files would be overwritten
```

**Causa:** Hay archivos modificados, sin stage, o archivos untracked que interfieren.

**Solucion:**
```bash
# 1. Ver que hay pendiente
git status

# 2. Opcion A: Guardar cambios (si son utiles)
git stash push -m "WIP: descripcion"
# Despues de la operacion:
git stash pop

# 3. Opcion B: Commit (si estan listos)
git add {archivos_especificos}
git commit -m "type(scope): description"

# 4. Opcion C: Descartar (si no importan)
git checkout -- .
git clean -fd  # CUIDADO: elimina archivos no trackeados
```

---

### GI-03: Merge in progress blocking operations

**Problema:** Git tiene un merge sin terminar que bloquea otras operaciones.

**Sintomas:**
```
error: you are in the middle of a merge -- cannot rebase
```
O: `git status` muestra "You have unmerged paths"

**Causa:** Un merge anterior no fue completado ni abortado.

**Solucion:**
```bash
# Opcion A: Completar el merge
# 1. Resolver conflictos en archivos marcados
# 2. Stage archivos resueltos
git add {archivos}
# 3. Commit
git commit

# Opcion B: Abortar el merge
git merge --abort
```

**Verificacion:**
```bash
git status
# Debe mostrar "nothing to commit, working tree clean"
# O "On branch X, nothing to commit"

# Verificar que no hay archivos de merge pendiente
ls .git/MERGE_HEAD 2>/dev/null && echo "MERGE PENDIENTE" || echo "OK"
```

---

## General Issues

### GN-01: Skill not found

**Problema:** Un slash command no es reconocido.

**Sintomas:**
```
No se reconoce el skill "/nombre"
```

**Causa:** El skill no existe, el nombre esta mal escrito, o no fue generado durante `/genesis`.

**Solucion:**
```bash
# 1. Verificar skills disponibles
ls .claude/skills/

# 2. Verificar que el skill tiene SKILL.md
ls .claude/skills/{nombre}/SKILL.md

# 3. Skills del framework (siempre disponibles):
#    /genesis, /brainstorming, /create-issues, /build-feature,
#    /qa, /merge, /promote, /release, /worktree

# 4. Skills de proyecto (generados por /genesis):
#    /generate-component, /create-endpoint, /add-test
#    Estos solo existen si fueron generados para tu stack

# 5. Si falta un skill core, verificar la instalacion del framework
```

---

### GN-02: Agent not available

**Problema:** Un agente especializado es invocado pero no esta disponible.

**Sintomas:**
```
Agente @security no disponible. Usando checks basicos.
```

**Causa:** El agente no fue activado durante `/genesis` porque las senales del proyecto no lo requerian.

**Solucion:**
```bash
# 1. Ver agentes disponibles
ls .claude/agents/*.md

# 2. Agentes core (siempre disponibles):
#    @developer, @architect, @qa, @ux-accessibility

# 3. Agentes especializados (bajo demanda):
#    @security, @devops, @ml-engineer, @mobile,
#    @api-specialist, @performance
#    Estos se activan durante /genesis segun senales del proyecto

# 4. Si necesitas un agente que no fue activado:
#    Crear el archivo desde template:
#    Copiar .claude/agents/templates/{agente}.md a .claude/agents/{agente}.md
#    Personalizar segun el proyecto
```

**Nota:** Cuando un agente no esta disponible, el skill usa fallback a checks basicos. Esto no es bloqueante, pero reduce la profundidad del analisis.

---

### GN-03: Session file missing

**Problema:** Un skill espera encontrar una sesion previa pero no la encuentra.

**Sintomas:**
```
No se encontro sesion de build-feature para issue #001
```

**Causa:** La sesion no fue generada (skill interrumpido), el archivo fue eliminado, o el nombre no coincide con la convencion.

**Solucion:**
```bash
# 1. Verificar sesiones existentes
ls .claude/sessions/

# 2. Formato esperado por skill:
#    /build-feature: YYYY-MM-DD-build-{issue}.md
#    /qa:            YYYY-MM-DD-qa-{issue}.md
#    /qa --env qa:   YYYY-MM-DD-qa-env-qa.md
#    /merge:         YYYY-MM-DD-merge-{issue}.md
#    /promote:       YYYY-MM-DD-promote-{target}.md
#    /release:       YYYY-MM-DD-release-vX.Y.Z.md

# 3. Si la sesion no existe, re-ejecutar el skill correspondiente
#    Ejemplo: si falta sesion QA, ejecutar /qa --issue 001

# 4. Si la sesion existe pero con nombre incorrecto, renombrar
#    al formato esperado
```

---

### GN-04: Issues directory structure incorrect

**Problema:** El sistema de issues local no encuentra los issues o los muestra en estado incorrecto.

**Sintomas:**
- `/build-feature --issue 001` no encuentra el issue
- Issue muestra estado incorrecto

**Causa:** El issue no esta en la carpeta correcta segun su estado.

**Solucion:**
```bash
# 1. Verificar estructura de issues
ls .claude/issues/
# Debe tener: backlog/, in-progress/, done/

# 2. Verificar donde esta el issue
ls .claude/issues/backlog/*001*
ls .claude/issues/in-progress/*001*
ls .claude/issues/done/*001*

# 3. Mover al estado correcto si es necesario
# Para iniciar desarrollo:
mv .claude/issues/backlog/001-nombre.md .claude/issues/in-progress/

# 4. Actualizar frontmatter del issue (campo status)
```

---

## Checklist Post-Recovery

Despues de resolver cualquier problema de esta guia:

- [ ] `git status` muestra estado limpio (o detached HEAD esperado en qa/prod)
- [ ] `git worktree list` muestra todos los worktrees esperados
- [ ] No existe `.worktrees/.meta/merge.lock` residual
- [ ] `active-features.json` refleja el estado real de features activos
- [ ] Tests pasan: ejecutar suite de tests en el ambiente afectado
- [ ] Documentar en sesion: que paso, como se resolvio, como prevenir

---

## Cuando Escalar

| Situacion | Accion |
|-----------|--------|
| Problema resuelto con esta guia | Documentar y continuar |
| Problema persiste despues de solucion | Revisar `.claude/validation/recovery/procedures.md` |
| Perdida de datos o commits | Usar `git reflog` para recuperar, luego documentar |
| Problema afecta multiples worktrees | Considerar `git worktree prune` + reinicializacion |
| Problema de seguridad (secrets expuestos) | Rotar credenciales INMEDIATAMENTE, luego limpiar historial |

---

## Referencias

- Recovery procedures: `.claude/validation/recovery/procedures.md`
- Error handling patterns: `.claude/validation/error-handling/patterns.md`
- Git protection rules: `.claude/rules/git-protection.md`
- Git worktree rules: `.claude/rules/git-worktrees.md`
- Security Gate: `.claude/security/SECURITY-GATE.md`
