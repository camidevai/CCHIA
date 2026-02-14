# Recovery Procedures

## Propósito
Procedimientos de recuperación para escenarios comunes de fallo.

---

## Git Recovery

### Merge Fallido

**Síntomas:**
- `git status` muestra "You have unmerged paths"
- Archivos con marcadores `<<<<<<<`

**Recuperación:**

```bash
# Opción 1: Abortar merge completamente
git merge --abort

# Opción 2: Resolver y continuar
# 1. Editar archivos con conflictos
# 2. Quitar marcadores <<<<<<<, =======, >>>>>>>
# 3. Elegir qué código mantener
git add <archivos-resueltos>
git commit
```

**Verificación:**
```bash
git status
# Debe mostrar "nothing to commit, working tree clean"
```

---

### Rebase Fallido

**Síntomas:**
- `git status` muestra "rebase in progress"
- Directorio `.git/rebase-merge` o `.git/rebase-apply` existe

**Recuperación:**

```bash
# Opción 1: Abortar rebase (volver al estado anterior)
git rebase --abort

# Opción 2: Continuar rebase
# 1. Resolver conflictos
git add <archivos-resueltos>
git rebase --continue

# Opción 3: Saltar commit problemático
git rebase --skip
```

**Verificación:**
```bash
ls .git/rebase-*
# No debe existir ningún directorio
```

---

### Commit Accidental

**Síntomas:**
- Commit hecho que no debería existir
- Archivos incorrectos commiteados

**Recuperación (no pusheado):**

```bash
# Deshacer commit, mantener cambios staged
git reset --soft HEAD~1

# Deshacer commit, mantener cambios unstaged
git reset HEAD~1

# Deshacer commit Y cambios (PELIGROSO)
git reset --hard HEAD~1
```

**Recuperación (ya pusheado):**

```bash
# Crear commit que revierte los cambios
git revert HEAD
git push
```

---

### Pérdida de Commits (después de reset/rebase)

**Síntomas:**
- Commits "desaparecieron"
- Branch no tiene el trabajo esperado

**Recuperación:**

```bash
# 1. Ver historial de HEAD
git reflog

# 2. Buscar el commit perdido (por mensaje o hash)
# abc1234 HEAD@{5}: commit: Mi commit perdido

# 3. Recuperar
git checkout abc1234  # Ver el commit
git branch recovery abc1234  # Crear branch de recuperación
# O
git reset --hard abc1234  # Mover branch actual ahí
```

---

### Branch Eliminado

**Síntomas:**
- Branch borrado accidentalmente
- `git branch` no lo muestra

**Recuperación:**

```bash
# 1. Buscar en reflog
git reflog | grep "nombre-del-branch"

# 2. Recrear desde el commit
git branch nombre-del-branch abc1234
```

---

### Push Force Accidental

**Síntomas:**
- Commits de otros desaparecieron del remoto
- Historial de remote cambió

**Recuperación (si tienes el estado anterior):**

```bash
# 1. Buscar estado anterior en reflog
git reflog show origin/main

# 2. Force push al estado correcto
git push --force origin abc1234:main

# 3. Notificar al equipo INMEDIATAMENTE
```

**Recuperación (si no tienes el estado):**

```bash
# Pedir a alguien del equipo que tenga el estado correcto que haga:
git push --force origin main
```

---

## Worktree Recovery

### Worktree Corrupto

**Síntomas:**
- Error al acceder a worktree
- `git worktree list` muestra estado raro

**Recuperación:**

```bash
# 1. Limpiar registros huérfanos
git worktree prune

# 2. Verificar estado
git worktree list

# 3. Si aún hay problemas, eliminar y recrear
git worktree remove /path/to/worktree --force
git worktree add /path/to/worktree branch-name
```

---

### Worktree con Cambios Sin Guardar

**Síntomas:**
- Necesitas eliminar worktree pero tiene cambios

**Recuperación:**

```bash
# 1. Ir al worktree
cd /path/to/worktree

# 2. Guardar cambios
git stash push -m "WIP antes de eliminar worktree"

# 3. Volver al repo principal
cd /path/to/main-repo

# 4. Aplicar stash en otro lugar si es necesario
git stash list
git stash apply stash@{0}
```

---

### Merge fallido en dev/ worktree

Si un merge falla dentro de `.worktrees/environments/dev/`:

1. **Abortar el merge:**
   ```bash
   cd .worktrees/environments/dev
   git merge --abort
   ```

2. **Verificar estado:**
   ```bash
   git status  # Debe mostrar "nothing to commit, working tree clean"
   ```

3. **Liberar lock de merge:**
   ```bash
   rm .worktrees/.meta/merge.lock
   ```

4. **El feature branch NO se elimina** (puede intentar merge de nuevo)

5. **Registrar en sesión:** Documentar el fallo y la razón

### Stale merge.lock

Si `.worktrees/.meta/merge.lock` existe pero ningún merge está en progreso:

1. **Verificar antigüedad:**
   ```bash
   stat .worktrees/.meta/merge.lock  # Ver timestamp
   ```

2. **Si > 10 minutos:** Probablemente stale
   ```bash
   cat .worktrees/.meta/merge.lock   # Ver qué feature lo creó
   rm .worktrees/.meta/merge.lock
   echo "⚠️ Lock stale eliminado"
   ```

3. **Verificar que no hay merge en progreso:**
   ```bash
   cd .worktrees/environments/dev
   git status  # No debe mostrar "merge in progress"
   ```

### Auto-stash recovery

Si el auto-stash antes de una operación falla:

1. **Commitear cambios primero:**
   ```bash
   cd .worktrees/environments/dev
   git add {archivos_específicos}
   git commit -m "chore: save WIP before merge"
   ```

2. **Reintentar la operación**

3. **Si los cambios eran exploratorios:**
   ```bash
   git stash push -m "exploratory changes"
   # Después de la operación:
   git stash pop  # Recuperar si se necesitan
   ```

---

## Skill Recovery

### /build-feature Fallido

**Síntomas:**
- Skill terminó con error
- Estado parcial (algunos archivos creados)

**Recuperación:**

```bash
# 1. Ver qué se creó
git status

# 2. Si hay worktree problemático
git worktree remove .worktrees/features/feature-xyz --force

# 3. Limpiar archivos no trackeados si es necesario
git clean -fd  # CUIDADO: elimina archivos no trackeados

# 4. Volver a branch base
# Con worktrees: cd .worktrees/environments/dev (NO usar git checkout develop)
# Sin worktrees: git checkout develop

# 5. Reintentar
/build-feature --issue xyz
```

---

### /merge Fallido

**Síntomas:**
- Merge quedó a medias
- Estado inconsistente

**Recuperación:**

```bash
# 1. Abortar merge en progreso
git merge --abort

# 2. Verificar estado del branch destino
# Con worktrees: cd .worktrees/environments/dev (NO usar git checkout develop)
# Sin worktrees: git checkout develop
git status

# 3. Si develop está corrupto, restaurar desde remote
git fetch origin
git reset --hard origin/develop

# 4. Reintentar merge manualmente o con skill
```

---

### /qa Fallido

**Síntomas:**
- Tests no terminaron
- Reporte incompleto

**Recuperación:**

```bash
# 1. Limpiar estado de tests
npm test -- --clearCache  # Node
pytest --cache-clear      # Python

# 2. Verificar que tests pueden ejecutarse
npm test  # Ejecutar manualmente

# 3. Reintentar skill
/qa
```

---

### /genesis Fallido

**Síntomas:**
- Skill terminó con error antes de completar
- Archivos parcialmente creados en `.claude/`
- CLAUDE.md incompleto o no existe
- Agentes/skills faltantes respecto al stack detectado

**Diagnóstico:**

```bash
# 1. Verificar qué se creó
ls -la .claude/

# 2. Verificar CLAUDE.md
cat CLAUDE.md 2>/dev/null || echo "CLAUDE.md no existe"

# 3. Verificar agentes creados
ls .claude/agents/*.md 2>/dev/null | wc -l

# 4. Verificar skills creados
ls .claude/skills/*/SKILL.md 2>/dev/null | wc -l

# 5. Verificar sesión de genesis (puede tener info del fallo)
cat .claude/sessions/*-genesis-*.md 2>/dev/null || echo "Sin sesión de genesis"

# 6. Verificar estado de discovery (si existe)
cat .claude/docs/discovery/*.md 2>/dev/null || echo "Sin discovery"
```

**Opciones de Recuperación:**

#### Opción A: Reinicio Limpio (Recomendado si < 50% completado)

```bash
# 1. Backup de lo existente (por si tiene valor)
mv .claude .claude-failed-$(date +%Y%m%d-%H%M%S)

# 2. Eliminar CLAUDE.md parcial
rm -f CLAUDE.md

# 3. Reiniciar genesis desde cero
/genesis
```

**Cuándo usar:**
- CLAUDE.md no existe o está muy incompleto
- Menos de la mitad de agentes/skills creados
- Discovery no se completó

#### Opción B: Continuar Desde Punto de Fallo (Si > 50% completado)

```bash
# 1. Identificar qué falta comparando con estructura esperada
# Estructura esperada post-genesis:
# .claude/
# ├── agents/          (4+ archivos .md)
# ├── skills/          (9+ directorios con SKILL.md)
# ├── rules/           (4+ archivos .md)
# ├── knowledge/       (estructura con _inject/)
# ├── validation/      (pre-checks/, recovery/)
# ├── security/        (SECURITY-GATE.md, checks/)
# ├── docs/            (architecture/, features/, guides/)
# └── sessions/        (directorio para sesiones)

# 2. Verificar cada componente
for dir in agents skills rules knowledge validation security docs sessions; do
  if [ -d ".claude/$dir" ]; then
    echo "✓ .claude/$dir existe"
  else
    echo "✗ .claude/$dir FALTA"
  fi
done

# 3. Si la estructura base existe, completar manualmente o con /genesis --continue
# (El flag --continue intenta detectar estado y continuar)
```

**Cuándo usar:**
- CLAUDE.md existe y tiene contenido sustancial
- Discovery completado con datos del proyecto
- Más de la mitad de la estructura creada

#### Opción C: Recuperación Manual (Si hay conflictos o datos valiosos)

```bash
# 1. Preservar discovery si tiene valor
cp -r .claude/docs/discovery .claude-discovery-backup

# 2. Preservar sesiones existentes
cp -r .claude/sessions .claude-sessions-backup

# 3. Limpiar estructura corrupta
rm -rf .claude

# 4. Recrear estructura base manualmente
mkdir -p .claude/{agents,skills,rules,knowledge,validation,security,docs,sessions}

# 5. Restaurar datos preservados
cp -r .claude-discovery-backup .claude/docs/discovery
cp -r .claude-sessions-backup/* .claude/sessions/

# 6. Ejecutar genesis con datos preservados
/genesis
```

**Cuándo usar:**
- Hay datos valiosos en discovery que no quieres perder
- Conflictos con archivos existentes
- Necesitas control granular del proceso

**Checklist Post-Recovery:**

Después de recuperar /genesis, verificar:

- [ ] `CLAUDE.md` existe y tiene secciones completas
- [ ] `.claude/agents/` tiene al menos: developer.md, architect.md, qa.md, ux-accessibility.md
- [ ] `.claude/skills/` tiene los 9 skills core con SKILL.md
- [ ] `.claude/rules/` tiene: architecture.md, code-style.md, commits.md, git-protection.md
- [ ] `.claude/knowledge/_inject/` tiene archivos *-essentials.md
- [ ] `.claude/validation/` tiene pre-checks/ y recovery/
- [ ] `.claude/security/` tiene SECURITY-GATE.md y checks/
- [ ] `.claude/sessions/` existe (puede estar vacío)
- [ ] Ejecutar `/qa` en un feature simple para validar que el flujo funciona

**Prevención:**

Para evitar fallos futuros de /genesis:
1. Ejecutar en directorio limpio (sin .claude/ previo)
2. Asegurar conexión estable si usa APIs externas
3. Proporcionar información clara en el discovery
4. No interrumpir el proceso a mitad de ejecución

---

### /release Fallido

**Síntomas:**
- Release quedó a medias
- Tag creado pero merge incompleto
- GitHub Release publicado pero hay errores

**Recuperación (antes de push):**

```bash
# 1. Si estás en branch de release, volver a develop
# Con worktrees: cd .worktrees/environments/dev
# Sin worktrees: git checkout develop

# 2. Eliminar branch de release
git branch -D release/vX.Y.Z

# 3. Si el tag fue creado localmente
git tag -d vX.Y.Z

# 4. Limpiar estado
git status
```

**Recuperación (después de push):**

```bash
# 1. Eliminar tag remoto
git push origin :refs/tags/vX.Y.Z

# 2. Eliminar tag local
git tag -d vX.Y.Z

# 3. Revertir merge en main
git checkout main
git revert -m 1 HEAD
git push origin main

# 4. Revertir merge en develop
# Con worktrees: cd .worktrees/environments/dev
# Sin worktrees: git checkout develop
git revert -m 1 HEAD
git push origin develop

# 5. Si se creó GitHub Release
gh release delete vX.Y.Z --yes
```

**Recuperación (CHANGELOG corrupto):**

```bash
# 1. Ver estado anterior del archivo
git log --oneline CHANGELOG.md

# 2. Restaurar versión anterior
git checkout HEAD~1 -- CHANGELOG.md

# 3. Commitear la restauración
git add CHANGELOG.md
git commit -m "fix: restore CHANGELOG.md after failed release"
```

**Verificación post-rollback:**

```bash
# 1. Verificar que no existe el tag
git tag -l "vX.Y.Z"  # Debe estar vacío

# 2. Verificar estado de branches
git log --oneline main -3
git log --oneline develop -3

# 3. Verificar GitHub Release eliminado
gh release view vX.Y.Z  # Debe dar error
```

---

## Database Recovery

### Migración Fallida

**Síntomas:**
- Schema en estado inconsistente
- Aplicación no inicia

**Recuperación:**

```bash
# 1. Rollback última migración
npm run migrate:rollback  # Node
python manage.py migrate <app> <migration_anterior>  # Django

# 2. Verificar schema
npm run db:status

# 3. Arreglar migración y reintentar
```

---

### Datos Corruptos en Dev

**Síntomas:**
- Datos de desarrollo inconsistentes
- Foreign key errors

**Recuperación:**

```bash
# 1. Drop y recrear DB (solo desarrollo!)
npm run db:drop
npm run db:create
npm run db:migrate
npm run db:seed
```

---

## Container Recovery

### Container No Inicia

**Síntomas:**
- `docker compose up` falla
- Container reinicia continuamente

**Recuperación:**

```bash
# 1. Ver logs
docker compose logs -f servicio

# 2. Recrear sin cache
docker compose build --no-cache servicio
docker compose up -d servicio

# 3. Si persiste, limpiar volúmenes (CUIDADO: pierde datos)
docker compose down -v
docker compose up -d
```

---

### Puerto Ocupado

**Síntomas:**
- Error "port already in use"

**Recuperación:**

```bash
# 1. Encontrar proceso
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# 2. Matar proceso
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# 3. O usar otro puerto
PORT=3001 npm start
```

---

## Checklist Post-Recovery

### Después de cualquier recuperación:

- [ ] `git status` muestra estado limpio
- [ ] `git log` muestra historial esperado
- [ ] Aplicación inicia correctamente
- [ ] Tests pasan
- [ ] No hay archivos huérfanos
- [ ] Documentar en sesión qué pasó y cómo se resolvió

### Si el problema fue grave:

- [ ] Notificar al equipo
- [ ] Crear issue para investigar causa raíz
- [ ] Actualizar procedimientos si es necesario
- [ ] Considerar agregar pre-check para evitar recurrencia
