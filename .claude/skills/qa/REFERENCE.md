# QA Reference

> Documentación compartida para ambos modos de QA (Standard y ENV Mode).
> Incluye formatos de sesión, templates, y material de referencia.

---

## Formato de Sesión (Standard Mode)

```markdown
# Sesión: QA - Issue #{número}
Fecha: {ISO timestamp}
Skill: /qa

## Resumen
QA {aprobado|fallido|condicional} para issue #{número}

## Ambiente de pruebas
- Tipo: {worktree feature | ambiente QA}
- Path: {path}

## Resultados de tests
| Métrica | Valor |
|---------|-------|
| Total | {n} |
| Pasando | {n} |
| Fallando | {n} |
| Cobertura | {n}% |

## Análisis estático
- Linting: {n} errores, {n} warnings
- Types: {n} errores

## Security Gate
| Check | Resultado |
|-------|-----------|
| Secrets Detection | {PASS|FAIL} |
| Dependency Audit | {PASS|FAIL|WARNING} |
| Code Patterns | {PASS|FAIL} |
| File Size | {PASS|FAIL|WARNING} |
| Sensitive Files | {PASS|FAIL} |
| **TOTAL** | **{PASS|FAIL}** |

## Accessibility Gate (si aplica)
| Check | Resultado |
|-------|-----------|
| Estructura/Semántica | {PASS|FAIL} |
| Navegación Teclado | {PASS|FAIL} |
| Formularios | {PASS|FAIL} |
| ARIA | {PASS|FAIL|WARNING} |
| **TOTAL** | **{PASS|FAIL|WARNING}** |

## Criterios de Aceptación
| AC | Estado | Evidencia |
|----|--------|-----------|
| AC1 | ✓ | {archivo:línea} |
| AC2 | ✓ | {test name} |

## Resultado final
**{APPROVED|FAILED|CONDITIONAL}**

## Próximo paso sugerido
/merge --issue {número}  # si aprobado
# o
Corregir errores y ejecutar /qa de nuevo
```

---

## Formato de Sesión (ENV MODE)

```markdown
# Sesión: QA Env - Ambiente QA
Fecha: {ISO timestamp}
Skill: /qa --env qa

## Resumen
QA de integración {aprobado|fallido|condicional} para ambiente qa/

## Promoción
- Commit: {hash}
- Timestamp: {ISO}
- Features: {n}

## Features incluidos
| # | Feature | QA Individual | Sesión |
|---|---------|---------------|--------|
| 1 | {nombre} | APPROVED | {ref} |

## Full Test Suite
| Suite | Total | Pass | Fail | Coverage |
|-------|-------|------|------|----------|
| Unit | {n} | {n} | {n} | {n}% |
| Integration | {n} | {n} | {n} | {n}% |
| E2E | {n} | {n} | {n} | - |

## Análisis estático
- Linting: {n} errores, {n} warnings
- Types: {n} errores
- Build: {PASS|FAIL}

## Cross-Feature Integration
| Check | Estado |
|-------|--------|
| Conflictos de rutas | {PASS|FAIL} |
| Componentes duplicados | {PASS|FAIL} |
| Estado compartido | {PASS|FAIL} |
| Versiones de dependencias | {PASS|FAIL} |
| Regression | {PASS|FAIL} |

## Security Gate (Basic)
| Check | Resultado |
|-------|-----------|
| Secrets Detection | {PASS|FAIL} |
| Dependency Audit | {PASS|FAIL|WARNING} |
| Code Patterns | {PASS|FAIL} |
| File Size | {PASS|WARNING|FAIL} |
| Sensitive Files | {PASS|FAIL} |
| **TOTAL** | **{PASS|FAIL}** |

## @security Deep Review
{Resumen del Security Review Report o "N/A - agente no disponible"}

## Accessibility Gate (si UI)
{Tabla de checks o "N/A (no UI)"}

## @ux-accessibility Full Audit (si UI)
{Resumen del Accessibility Audit Report o "N/A"}

## Resultado final
**{APPROVED|FAILED|CONDITIONAL}**

## Blocking issues (si FAILED)
1. {detalle}

## Conditions (si CONDITIONAL)
1. {detalle}

## Próximo paso sugerido
/release  # si APPROVED
```

---

## Iteración automática (Standard Mode only)

Si QA falla y usuario acepta `--fix`:
1. Identificar errores específicos
2. Invocar @developer con contexto
3. Aplicar correcciones
4. Re-ejecutar /qa
5. Máximo 3 iteraciones

> **Nota**: `--fix` NO está disponible en ENV MODE.
> En ENV MODE las correcciones requieren ciclo completo:
> develop → /promote --to qa → /qa --env qa

---

## Niveles WCAG

| Nivel | Impacto | Acción |
|-------|---------|--------|
| A | Crítico | BLOQUEA merge/release |
| AA | Importante | WARNING, documenta |
| AAA | Deseable | Informativo |

---

## Validaciones por Stack

### React/Next.js
- Components render sin errores
- No warnings en consola
- Accesibilidad verificada
- Build sin errores

### API/Backend
- Endpoints responden correctamente
- Validación de inputs
- Manejo de errores
- Security headers

### CLI
- Comandos ejecutan sin errores
- Help text presente
- Exit codes correctos
- Input validation

### Python
- pytest con markers de suite
- mypy type checking
- ruff linting
- Coverage report

### Go
- go test con coverage
- go vet
- golangci-lint
- Build sin errores

### Rust
- cargo test
- cargo clippy
- cargo audit
- Build sin errores

---

## Security Gate Checks Detail

### Secrets Detection Patterns

```
# High confidence patterns
AWS_ACCESS_KEY_ID.*=.*[A-Z0-9]{20}
AWS_SECRET_ACCESS_KEY.*=.*[A-Za-z0-9/+=]{40}
GITHUB_TOKEN.*=.*gh[ps]_[A-Za-z0-9]{36}
-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----
password\s*[:=]\s*['"][^'"]+['"]

# Medium confidence (require context)
api_key.*=
secret.*=
token.*=
```

### Code Pattern Vulnerabilities

| Pattern | Risk | Detection |
|---------|------|-----------|
| SQL concatenation | SQL Injection | `query.*\+.*\$` |
| eval() with input | Code Injection | `eval\(.*\$` |
| dangerouslySetInnerHTML | XSS | Without DOMPurify |
| exec() with input | Command Injection | `exec\(.*\$` |
| Regex from user | ReDoS | `new RegExp\(.*\$` |

---

## Accessibility Checks Detail

### Structure/Semantics
- [ ] Uso de landmarks (header, nav, main, footer)
- [ ] Heading hierarchy (h1 → h2 → h3, sin saltos)
- [ ] Lists para contenido relacionado (ul/ol)
- [ ] Tables con headers (th) y scope

### Keyboard Navigation
- [ ] Tab order lógico (izq→der, arriba→abajo)
- [ ] Todos los interactivos focuseables
- [ ] Focus visible (outline no removido)
- [ ] Skip links para navegación rápida
- [ ] Escape cierra modales/dropdowns

### Forms
- [ ] Labels asociados (for/id o wrapping)
- [ ] Required indicado visualmente Y programáticamente
- [ ] Errores identifican el campo
- [ ] Instrucciones antes del input

### ARIA
- [ ] Roles correctos para widgets custom
- [ ] States comunicados (aria-expanded, aria-selected)
- [ ] Live regions para contenido dinámico
- [ ] aria-describedby para instrucciones adicionales

---

## Ver también

- **Guía**: `.claude/docs/guides/qa-flow-guide.md`
- **Skill anterior**: `.claude/skills/build-feature/SKILL.md`
- **Skill siguiente**: `.claude/skills/merge/SKILL.md`
- **Security Gate**: `.claude/security/SECURITY-GATE.md`
- **Security Integration**: `.claude/security/qa-security-integration.md`
- **Validación**: `.claude/validation/VALIDATION.md`
- **Session template**: `.claude/skills/_common/session-template.md`
- **Exceptions**: `.claude/security/exceptions.yml` (si existe)
