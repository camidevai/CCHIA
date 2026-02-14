---
name: qa
version: 2.0
description: "Testing y análisis de calidad"
---

# QA - Quality Assurance

## QUICK REFERENCE

### BLOCKING CONDITIONS
> ⛔ Si alguna es TRUE, el resultado de QA es FAILED

**Standard Mode (`/qa --issue N`):**
- [ ] Security Gate FAILED
- [ ] Accessibility Gate FAILED (violaciones nivel A)
- [ ] Tests críticos fallando
- [ ] ACs no verificados

**ENV Mode (`/qa --env qa`):**
- [ ] No existe entrada en promotions.json para qa
- [ ] Security Gate básico FAILED
- [ ] @security CRITICAL o HIGH sin mitigación
- [ ] Full test suite con fallos críticos
- [ ] Cross-feature integration FAIL
- [ ] Build FAIL
- [ ] WCAG A violations

### REQUIRED OUTPUTS
> 📦 Archivos que DEBEN existir al finalizar

**Standard Mode:**
- [ ] `.claude/sessions/YYYY-MM-DD-qa-{issue}.md`

**ENV Mode:**
- [ ] `.claude/sessions/YYYY-MM-DD-qa-env-qa.md`

**Ambos modos:**
- [ ] Resultado claro: `APPROVED` | `FAILED` | `CONDITIONAL`

### PHASES OVERVIEW

**Standard Mode:**
```
PHASE 1 → PHASE 2 → PHASE 3 → PHASE 4 → PHASE 5
CONTEXT   TESTING   VERIFY    GATES     DECISION
```

**ENV Mode:**
```
PHASE 1E → PHASE 2E → PHASE 3E → PHASE 4E → PHASE 5E
CONTEXT    FULL       CROSS-     DEEP       DECISION
           SUITE      FEATURE    REVIEW
```

### PARAMETERS
| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `--issue {N}` | Issue a validar | Último en progreso |
| `--fix` | Corregir errores automáticamente | No (solo Standard) |
| `--env qa` | Ejecutar QA de integración | No |

---

## MODE ROUTER

> Detecta el modo de ejecución y carga el archivo correspondiente.

### Validación de parámetros

| Parámetro | Valores válidos | Si inválido |
|-----------|----------------|-------------|
| `--env` | `qa` | ERROR: "Valor inválido. Solo `qa` soportado." |
| `--issue` | Número existente | ERROR: "Issue #{N} no encontrado." |
| `--fix` + `--env qa` | N/A | ERROR (ver abajo) |

**Error `--fix` con `--env qa`:**
```
ERROR: "--fix no está disponible en modo ENV. El modo --env qa ejecuta
validación formal de solo lectura. Para corregir issues, trabaja en
develop y sigue el ciclo: develop → /promote --to qa → /qa --env qa"
```

### Detección de modo

```
┌─────────────────────────────────────────────────────────────┐
│                     PARAMETER CHECK                          │
├─────────────────────────────────────────────────────────────┤
│  ¿--env qa presente?                                        │
│       │                                                      │
│       ├── SÍ ──► Verificar prerrequisitos ENV               │
│       │              │                                       │
│       │              ├── OK ──► CARGAR: ENV-MODE.md         │
│       │              │          (Fases 1E-5E)               │
│       │              │                                       │
│       │              └── FAIL ──► ERROR con sugerencias     │
│       │                                                      │
│       └── NO ──► CARGAR: STANDARD.md                        │
│                  (Fases 1-5)                                │
└─────────────────────────────────────────────────────────────┘
```

| Condición | Modo | Archivo |
|-----------|------|---------|
| `--env qa` presente | **ENV MODE** | `ENV-MODE.md` |
| `--issue N` o default | **STANDARD MODE** | `STANDARD.md` |

### Prerrequisitos de ENV MODE

> Fuente autoritativa: `.claude/validation/VALIDATION.md` → "Checklist: /qa --env qa"

- [ ] Git repository existe
- [ ] Sistema de worktrees inicializado (`.worktrees/environments/`)
- [ ] Ambiente `qa/` existe
- [ ] qa/ sincronizado con último `/promote --to qa`
- [ ] `promotions.json` tiene entrada con `"to": "qa"`
- [ ] Todos los features promovidos tienen QA individual APPROVED
- [ ] Tests pueden ejecutarse (dependencias instaladas)
- [ ] Security Gate configurado
- [ ] No hay features con conflictos pendientes
- [ ] Directorio `.claude/sessions/` existe y es escribible

**Si algún prerrequisito falla:**
```
⛔ No se puede ejecutar /qa --env qa

{Prerrequisito que falló}

👉 Sugerencias:
   - Si worktrees no inicializados: /worktree init
   - Si no hay promoción a qa: /promote --to qa
   - Si QA individual falta: /qa --issue N para cada feature
```

---

## Carga dinámica

**Si ENV MODE detectado → Cargar y ejecutar: `ENV-MODE.md`**

**Si STANDARD MODE → Cargar y ejecutar: `STANDARD.md`**

La documentación compartida (formatos de sesión, niveles WCAG, validaciones por stack) está en: `REFERENCE.md`

---

## Principios clave

1. **Security Gate es OBLIGATORIO** — No puede saltarse ni bypass
2. **Accessibility Gate bloquea en nivel A** — AA es warning, AAA informativo
3. **ENV MODE no soporta --fix** — Correcciones vía ciclo completo
4. **Sesión siempre se crea** — Documenta resultado para /merge y /release

---

## FINAL CHECKPOINT (ambos modos)

- [ ] Modo detectado correctamente
- [ ] Archivo correspondiente cargado y ejecutado
- [ ] Security Gate ejecutado (OBLIGATORIO)
- [ ] Resultado claro: APPROVED | FAILED | CONDITIONAL
- [ ] Sesión creada en `.claude/sessions/`
- [ ] Próximo paso comunicado

---

## Archivos del skill

| Archivo | Contenido | Líneas |
|---------|-----------|--------|
| `SKILL.md` | Mode router, QUICK REFERENCE | ~150 |
| `STANDARD.md` | Fases 1-5 para `/qa --issue N` | ~250 |
| `ENV-MODE.md` | Fases 1E-5E para `/qa --env qa` | ~400 |
| `REFERENCE.md` | Templates, WCAG levels, stack validations | ~200 |

---

## Ver también

- **Guía**: `.claude/docs/guides/qa-flow-guide.md`
- **Skill anterior**: `.claude/skills/build-feature/SKILL.md`
- **Skill siguiente**: `.claude/skills/merge/SKILL.md`
- **Security Gate**: `.claude/security/SECURITY-GATE.md`
- **Validación**: `.claude/validation/VALIDATION.md`
