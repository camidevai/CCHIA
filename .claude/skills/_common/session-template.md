# Template de Sesión v2.0

> **Changelog:**
> - v2.0: Agregado template para `/qa --env qa` (ENV MODE). Separación clara de templates standard vs env.
> - v1.0: Templates base para todos los skills.

> Formato estándar para registro de sesiones de skills.

## Convención de nombre de archivo

```
.claude/sessions/YYYY-MM-DD-{skill}-{contexto}.md
```

### Nombres por skill

| Skill | Formato | Ejemplo |
|-------|---------|---------|
| `/genesis` | `YYYY-MM-DD-genesis.md` | `2026-02-04-genesis.md` |
| `/brainstorming` | `YYYY-MM-DD-brainstorming-{feature}.md` | `2026-02-04-brainstorming-auth.md` |
| `/create-issues` | `YYYY-MM-DD-create-issues-{feature}.md` | `2026-02-04-create-issues-auth.md` |
| `/build-feature` | `YYYY-MM-DD-build-feature-{issue}.md` | `2026-02-04-build-feature-001.md` |
| `/qa` (standard) | `YYYY-MM-DD-qa-{issue}.md` | `2026-02-04-qa-001.md` |
| `/qa --env qa` | `YYYY-MM-DD-qa-env-qa.md` | `2026-02-04-qa-env-qa.md` |
| `/merge` | `YYYY-MM-DD-merge-{issue}.md` | `2026-02-04-merge-001.md` |
| `/promote` | `YYYY-MM-DD-promote-{env}.md` | `2026-02-04-promote-qa.md` |
| `/release` | `YYYY-MM-DD-release-vX.Y.Z.md` | `2026-02-04-release-v1.2.0.md` |

---

## Template Base

```markdown
# Sesión: {Skill} - {Contexto}
Fecha: {fecha y hora ISO}
Skill: /{nombre-skill}
Versión: 2.0

---

## REQUIRED FIELDS
> ⚠️ Todos estos campos son OBLIGATORIOS

### Resumen
{1-2 oraciones describiendo qué se realizó}

### Resultado
**{COMPLETED|FAILED|PARTIAL}**

### Archivos modificados
- [ ] `{path}` ({nuevo|modificado|eliminado})

### Próximo paso sugerido
/{skill-siguiente} {parámetros si aplica}

---

## OPTIONAL FIELDS
> Los siguientes campos se incluyen según el skill

### Decisiones tomadas
- {Decisión 1}: {Razón breve}

### Trade-offs considerados
- {Alternativa descartada}: {Por qué}

### Errores encontrados
- {Error}: {Cómo se resolvió}

### Notas adicionales
{Contexto relevante para futuras sesiones}
```

---

## Templates por Skill

### /build-feature

```markdown
# Sesión: Build Feature - Issue #{número}
Fecha: {ISO timestamp}
Skill: /build-feature
Versión: 2.0

---

## REQUIRED FIELDS

### Resumen
Implementación de issue #{número} - {título}

### Resultado
**{COMPLETED|FAILED|PARTIAL}**

### ACs verificados
| AC | Estado | Evidencia |
|----|--------|-----------|
| AC1: {desc} | ✓ | {archivo:línea} |
| AC2: {desc} | ✓ | {archivo:línea} |

### Archivos modificados
- [ ] `{path}` ({nuevo|modificado})

### Próximo paso sugerido
/qa --issue {número}

---

## OPTIONAL FIELDS

### Worktree (si habilitado)
- Path: {path}
- Branch: {branch}

### Decisiones tomadas
- {Decisión}: {Razón}

### Trade-offs considerados
- {Alternativa}: {Por qué descartada}
```

### /qa

```markdown
# Sesión: QA - Issue #{número}
Fecha: {ISO timestamp}
Skill: /qa
Versión: 2.0

---

## REQUIRED FIELDS

### Resumen
QA {aprobado|fallido|condicional} para issue #{número}

### Resultado
**{APPROVED|FAILED|CONDITIONAL}**

### Security Gate
| Check | Resultado |
|-------|-----------|
| Secrets Detection | {PASS|FAIL} |
| Dependency Audit | {PASS|FAIL|WARNING} |
| Code Patterns | {PASS|FAIL} |
| File Size | {PASS|WARNING|FAIL} |
| Sensitive Files | {PASS|FAIL} |
| **TOTAL** | **{PASS|FAIL}** |

### Criterios de Aceptación
| AC | Estado | Evidencia |
|----|--------|-----------|
| AC1 | ✓ | {evidencia} |
| AC2 | ✓ | {evidencia} |

### Próximo paso sugerido
/merge --issue {número}

---

## OPTIONAL FIELDS

### Stack detected
- {node|python|go|rust|unknown}

### Ambiente de pruebas
- Tipo: {worktree feature | ambiente QA}
- Path: {path}

### Resultados de tests
| Métrica | Valor |
|---------|-------|
| Total | {n} |
| Pasando | {n} |
| Fallando | {n} |
| Cobertura | {n}% |

### Análisis estático
- Linting: {n} errores, {n} warnings
- Types: {n} errores

### Accessibility Gate (si UI)
| Check | Resultado |
|-------|-----------|
| Estructura/Semántica | {PASS|FAIL} |
| Navegación Teclado | {PASS|FAIL} |
| Formularios | {PASS|FAIL} |
| ARIA | {PASS|FAIL|WARNING} |
| **TOTAL** | **{PASS|FAIL|WARNING}** |

### Errores encontrados
- {Error}: {Cómo se resolvió}

### Correcciones aplicadas
- {Corrección}: {Archivo}
```

---

> **ATENCION**: El siguiente template es EXCLUSIVO para `/qa --env qa` (ENV MODE).
> NO usar para QA standard (`/qa --issue N`). Para QA standard, usar template anterior.

### /qa --env qa (ENV MODE ONLY)

```markdown
# Sesión: QA Env - Ambiente QA
Fecha: {ISO timestamp}
Skill: /qa --env qa
Versión: 2.0

---

## REQUIRED FIELDS

### Resumen
QA de integración {aprobado|fallido|condicional} para ambiente qa/

### Resultado
**{APPROVED|FAILED|CONDITIONAL}**

### Features incluidos
| # | Feature | QA Individual | Sesión |
|---|---------|---------------|--------|
| 1 | {nombre} | {APPROVED} | {sesión-ref} |
| 2 | {nombre} | {APPROVED} | {sesión-ref} |

### Full Test Suite
| Suite | Total | Pasando | Fallando | Cobertura |
|-------|-------|---------|----------|-----------|
| Unit | {n} | {n} | {n} | {n}% |
| Integration | {n} | {n} | {n} | {n}% |
| E2E | {n} | {n} | {n} | - |
| **Total** | **{n}** | **{n}** | **{n}** | **{n}%** |

### Análisis estático
- Linting: {n} errores, {n} warnings
- Types: {n} errores
- Build: {PASS|FAIL}

### Cross-Feature Integration
| Check | Estado | Detalle |
|-------|--------|---------|
| Conflictos de rutas | {PASS|FAIL} | {detalle} |
| Componentes duplicados | {PASS|FAIL} | {detalle} |
| Estado compartido | {PASS|FAIL} | {detalle} |
| Versiones de dependencias | {PASS|FAIL} | {detalle} |
| Regression (features integrados) | {PASS|FAIL} | {detalle} |

### Security Gate (Basic)
| Check | Resultado |
|-------|-----------|
| Secrets Detection | {PASS|FAIL} |
| Dependency Audit | {PASS|FAIL|WARNING} |
| Code Patterns | {PASS|FAIL} |
| File Size | {PASS|WARNING|FAIL} |
| Sensitive Files | {PASS|FAIL} |
| **TOTAL** | **{PASS|FAIL}** |

### @security Deep Review
| Categoría | Findings | Severidad máxima |
|-----------|----------|-----------------|
| STRIDE Threat Model | {n} | {CRITICAL|HIGH|MEDIUM|LOW|NONE} |
| OWASP Top 10 | {n} | {CRITICAL|HIGH|MEDIUM|LOW|NONE} |
| Auth/AuthZ | {n} | {CRITICAL|HIGH|MEDIUM|LOW|NONE} |
| Secrets Management | {n} | {CRITICAL|HIGH|MEDIUM|LOW|NONE} |
| Compliance | {n} | {CRITICAL|HIGH|MEDIUM|LOW|NONE} |
| Cross-Feature Attack Surface | {n} | {CRITICAL|HIGH|MEDIUM|LOW|NONE} |
| Dependency Supply Chain | {n} | {CRITICAL|HIGH|MEDIUM|LOW|NONE} |
| **TOTAL** | **{n}** | **{severidad máxima}** |

> Si @security no disponible: "Fallback a checks básicos - agente no activado en /genesis"

### Accessibility Gate (si UI)
| Check | Resultado |
|-------|-----------|
| Estructura/Semántica | {PASS|FAIL} |
| Navegación Teclado | {PASS|FAIL} |
| Formularios | {PASS|FAIL} |
| ARIA | {PASS|FAIL|WARNING} |
| **TOTAL** | **{PASS|FAIL|WARNING}** |

### @ux-accessibility Full Audit (si UI)
| Categoría | Violations | Nivel |
|-----------|-----------|-------|
| Structure | {n} | {A|AA|AAA} |
| Keyboard | {n} | {A|AA|AAA} |
| Images | {n} | {A|AA|AAA} |
| Forms | {n} | {A|AA|AAA} |
| Color | {n} | {A|AA|AAA} |
| Dynamic Content | {n} | {A|AA|AAA} |
| Cross-Feature UX Consistency | {n} | {A|AA|AAA} |
| **TOTAL** | **{n}** | **{nivel máximo violado}** |

> Si @ux-accessibility no disponible: "Fallback a checks básicos - agente no activado en /genesis"
> Si proyecto sin UI: "N/A (no UI)"

### Blocking Issues (si FAILED)
1. {issue bloqueante con detalle}

### Conditions (si CONDITIONAL)
1. {condición con detalle y riesgo aceptado}

### Próximo paso sugerido
/release  # si APPROVED
# o
Corregir en develop → /promote --to qa → /qa --env qa  # si FAILED

---

## OPTIONAL FIELDS

### Agent Reports

#### @security Report
{Contenido completo del Security Review Report}

#### @ux-accessibility Report
{Contenido completo del Accessibility Audit Report}

### Notas adicionales
{Contexto relevante para el release}
```

### /merge

```markdown
# Sesión: Merge - Issue #{número}
Fecha: {ISO timestamp}
Skill: /merge
Versión: 2.0

---

## REQUIRED FIELDS

### Resumen
Merge {completado|fallido} para issue #{número}

### Resultado
**{COMPLETED|FAILED}**

### Archivos modificados
- [ ] CHANGELOG.md (modificado)

### Próximo paso sugerido
/release  # o siguiente issue

---

## OPTIONAL FIELDS

### Divergence check
- {N} commits behind | up to date

### PR/Commit
- Tipo: {PR|commit directo}
- Referencia: {PR URL o commit hash}

### Worktree cleanup
- [ ] Worktree eliminado: {path}
- [ ] Branch eliminado: {branch}
```

### /brainstorming

```markdown
# Sesión: Brainstorming - {Feature}
Fecha: {ISO timestamp}
Skill: /brainstorming
Versión: 2.0

---

## REQUIRED FIELDS

### Resumen
Ideación completada para {feature}

### Resultado
**{COMPLETED|NEEDS_CLARIFICATION}**

### Archivos modificados
- [ ] `.claude/docs/features/{feature}/design.md` (nuevo)

### Próximo paso sugerido
/create-issues

---

## OPTIONAL FIELDS

### Alternativas consideradas
| Opción | Pros | Contras | Decisión |
|--------|------|---------|----------|
| {A} | {pros} | {contras} | ✓/✗ |
| {B} | {pros} | {contras} | ✓/✗ |

### Preguntas pendientes
- {Pregunta que necesita clarificación}
```

### /promote

```markdown
# Sesión: Promote - {env}
Fecha: {ISO timestamp}
Skill: /promote
Versión: 2.0

---

## REQUIRED FIELDS

### Resumen
Promoción {completada|fallida} de develop a {qa|prod}

### Resultado
**{COMPLETED|FAILED}**

### From/To
- From: {develop|main}
- To: {qa|prod}

### Commit hash
- {hash del commit promovido}

### Features incluidos
| # | Feature | QA Individual | Sesión |
|---|---------|---------------|--------|
| 1 | {nombre} | {APPROVED|CONDITIONAL} | {sesión-ref} |
| 2 | {nombre} | {APPROVED|CONDITIONAL} | {sesión-ref} |

### QA status per feature
| Feature | Status | Notas |
|---------|--------|-------|
| {nombre} | {APPROVED|CONDITIONAL|FAILED} | {detalle si aplica} |

### Security Gate status
- {PASS|FAIL|NOT RUN}

### Smoke tests
- {PASS|FAIL|NOT RUN}

### Archivos modificados
- [ ] `.worktrees/.meta/promotions.json` (modificado)

### Próximo paso sugerido
/qa --env qa  # si promote a qa
/release      # si promote a prod (post-release auto)

---

## OPTIONAL FIELDS

### Errores encontrados
- {Error}: {Cómo se resolvió}

### Notas adicionales
{Contexto relevante para QA o release}
```

### /release

```markdown
# Sesión: Release - v{X.Y.Z}
Fecha: {ISO timestamp}
Skill: /release
Versión: 2.0

---

## REQUIRED FIELDS

### Resumen
Release v{X.Y.Z} {completado|fallido}

### Resultado
**{COMPLETED|FAILED}**

### Versión
- Anterior: v{X.Y.Z}
- Nueva: v{X.Y.Z}
- Tipo: {major|minor|patch}

### qa-env session
- {YYYY-MM-DD-qa-env-qa.md | NOT RUN}

### Changelog
{Resumen de cambios incluidos en el release}

### Archivos modificados
- [ ] `CHANGELOG.md` (modificado)
- [ ] `package.json` / `pyproject.toml` (versión actualizada)

### Próximo paso sugerido
/promote --to prod  # automático post-release

---

## OPTIONAL FIELDS

### Features incluidos
| # | Feature | Issue |
|---|---------|-------|
| 1 | {nombre} | #{número} |

### Tags
- Tag: v{X.Y.Z}
- Commit: {hash}

### Notas adicionales
{Contexto relevante para el despliegue}
```

---

## Checklist de Validación

Antes de guardar una sesión, verificar:

- [ ] Nombre de archivo sigue convención: `YYYY-MM-DD-{skill}-{contexto}.md`
- [ ] Todos los REQUIRED FIELDS están completos
- [ ] Resultado tiene valor válido
- [ ] Próximo paso es accionable
- [ ] Archivos modificados tienen checkbox `[ ]`

---

## Ejemplo Mínimo Válido

```markdown
# Sesión: QA - Issue #42
Fecha: 2026-01-15T10:30:00
Skill: /qa
Versión: 2.0

---

## REQUIRED FIELDS

### Resumen
QA aprobado para issue #42 - Login feature

### Resultado
**APPROVED**

### Security Gate
| Check | Resultado |
|-------|-----------|
| Secrets Detection | PASS |
| Dependency Audit | PASS |
| Code Patterns | PASS |
| File Size | PASS |
| Sensitive Files | PASS |
| **TOTAL** | **PASS** |

### Criterios de Aceptación
| AC | Estado | Evidencia |
|----|--------|-----------|
| Login form renders | ✓ | src/components/Login.tsx:15 |
| Validates email | ✓ | test: "validates email format" |

### Próximo paso sugerido
/merge --issue 42
```
