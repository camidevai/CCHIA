# Security Gate

## Propósito
Gate de seguridad OBLIGATORIO antes de merge a branches protegidos.
Si Security Gate falla, el merge NO puede proceder.

---

## Integración en Flujo

```text
/build-feature
      │
      ▼
    /qa ─────────────────┐
      │                  │
      ├─► Tests          │
      │                  │
      ├─► Security Gate ◄┘ (OBLIGATORIO)
      │
      ▼
   /merge ─► Verificar que Security Gate pasó
```

### Modos de Operación

| Modo | Scope | Trigger |
|------|-------|---------|
| Standard | Archivos MODIFICADOS (diff del feature) | `/qa --issue N` |
| Full Codebase | TODOS los archivos en qa/ | `/qa --env qa` |

En modo Full Codebase, los mismos 5 checks se ejecutan sobre todo el repositorio,
complementados con @security deep review (STRIDE, OWASP, compliance).

### Invocación de @security

Durante `/qa --env qa` (modo Full Codebase), la invocación de @security sigue estas reglas:

| Condición | Acción |
|-----------|--------|
| @security fue activado en `/genesis` | Ejecutar STRIDE + OWASP + Compliance deep review |
| @security NO fue activado en `/genesis` | Solo Security Gate básico (5 checks). Nota en sesión: "@security no activo, deep review no realizado" |
| Proyecto sin señales de seguridad | Security Gate básico siempre se ejecuta (es obligatorio para todos los proyectos) |

**Regla**: Los 5 checks del Security Gate son **SIEMPRE obligatorios** para todos los proyectos, independientemente de si @security fue activado. El deep review (STRIDE, OWASP, Compliance) solo se ejecuta si @security está disponible.

> El scope "Full Codebase" significa: TODOS los archivos presentes en `.worktrees/environments/qa/`,
> que corresponden al estado acumulado de todos los features promovidos via `/promote --to qa`.
> No es un cherry-pick selectivo; es el snapshot completo de develop al momento de la promoción.

> **Comando de diff para análisis**:
> - Feature QA (modo estándar): `git diff develop...HEAD` (cambios del feature vs develop)
> - ENV QA (modo integración): Analizar todos los archivos del proyecto en qa/ (full codebase scan)
> - Promote verification: `git diff {last_promote_commit}..HEAD` (cambios desde última promoción)

---

## Checks del Security Gate

### 1. Secrets Detection
Ubicación: `.claude/security/checks/secrets.md`

Buscar en archivos modificados (Standard) o todos los archivos (Full Codebase):
- API keys
- Passwords hardcodeados
- Private keys
- Tokens de acceso
- Credenciales de DB

**Severidad:** BLOQUEANTE

---

### 2. Dependency Audit
Ubicación: `.claude/security/checks/dependencies.md`

Ejecutar auditoría de dependencias:
- npm audit / pip-audit / cargo audit
- Identificar vulnerabilidades HIGH/CRITICAL

**Severidad:** Ver tabla autoritativa en `.claude/security/checks/dependencies.md` → sección "Contextual Severity Assessment"

> ⚠️ **FUENTE AUTORITATIVA**: La tabla de severidades contextual en `dependencies.md` es la fuente única de verdad para evaluar severidades. No duplicar aquí para evitar inconsistencias.

**Resumen rápido (referencia, no autoritativo):**
- CRITICAL en producción → BLOQUEANTE
- CRITICAL en devDependencies → WARNING
- HIGH en producción → WARNING
- Otros → INFO

---

### 3. Code Patterns
Verificar patrones peligrosos según stack:

**Node.js:**
- SQL concatenado (injection)
- eval() con input de usuario
- child_process.exec con input sin sanitizar
- fs operations sin validación de path

**React:**
- dangerouslySetInnerHTML sin sanitización
- Secrets en código cliente

**General:**
- console.log con datos sensibles
- Comentarios con passwords/tokens

**Severidad:** BLOQUEANTE si se detecta

---

### 4. File Size Check
Archivos inusualmente grandes que podrían ser:
- Binarios accidentales
- Dumps de datos
- Archivos de log

| Tamaño | Severidad |
|--------|-----------|
| >1MB | WARNING |
| >10MB | BLOQUEANTE |

---

### 5. Sensitive Files
Archivos que NO deberían estar en el repo:

```text
.env
.env.local
.env.production
*.pem
*.key
id_rsa
credentials.json
*.sqlite
*.db
```

**Severidad:** BLOQUEANTE

---

## Formato de Reporte

### Security Gate PASADO

```
╔══════════════════════════════════════════════════════════════╗
║                    🔒 SECURITY GATE                          ║
╠══════════════════════════════════════════════════════════════╣
║  Estado: ✅ APROBADO                                         ║
║  Fecha: 2026-01-15 10:30:00                                  ║
║  Branch: feature/auth-login                                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Secrets Detection     ✅ Sin secrets detectados             ║
║  Dependency Audit      ✅ Sin vulnerabilidades críticas      ║
║  Code Patterns         ✅ Sin patrones peligrosos            ║
║  File Size             ✅ Todos los archivos <1MB            ║
║  Sensitive Files       ✅ Sin archivos sensibles             ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  El código puede proceder a merge.                           ║
╚══════════════════════════════════════════════════════════════╝
```

### Security Gate FALLIDO

```
╔══════════════════════════════════════════════════════════════╗
║                    🔒 SECURITY GATE                          ║
╠══════════════════════════════════════════════════════════════╣
║  Estado: ⛔ BLOQUEADO                                        ║
║  Fecha: 2026-01-15 10:30:00                                  ║
║  Branch: feature/auth-login                                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Secrets Detection     ⛔ FALLO                              ║
║  ├─ src/config.ts:15                                         ║
║  │  └─ Posible API key detectada                             ║
║  └─ src/db.ts:8                                              ║
║     └─ Password hardcodeado                                  ║
║                                                              ║
║  Dependency Audit      ⚠️ WARNING                            ║
║  └─ lodash@4.17.20: Prototype Pollution (HIGH)               ║
║     Fix: npm update lodash                                   ║
║                                                              ║
║  Code Patterns         ✅ OK                                 ║
║  File Size             ✅ OK                                 ║
║  Sensitive Files       ✅ OK                                 ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  ⛔ MERGE BLOQUEADO                                          ║
║                                                              ║
║  Acciones requeridas:                                        ║
║  1. Mover secrets a variables de entorno                     ║
║  2. Actualizar lodash o justificar excepción                 ║
║                                                              ║
║  Después de corregir, ejecutar /qa de nuevo.                 ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Excepciones

### Cuándo se permite excepción

1. **Falso positivo confirmado**
   - El patrón detectado no es realmente un secret
   - Documentar por qué es falso positivo

2. **Vulnerabilidad sin fix disponible**
   - No hay versión parcheada
   - Mitigación implementada
   - Issue abierto para tracking

3. **Archivo grande necesario**
   - Assets del proyecto (imágenes, fonts)
   - Debe estar en .gitattributes para LFS

### Proceso de excepción

```markdown
## Excepción de Security Gate

**Tipo:** [Secret/Dependency/Pattern/File]
**Ubicación:** [archivo:línea]
**Detectado como:** [descripción del problema]

### Justificación
[Por qué es un falso positivo o por qué se necesita excepción]

### Mitigación (si aplica)
[Qué se hizo para mitigar el riesgo]

### Aprobado por
- Nombre: [quien aprueba]
- Fecha: [fecha]
- Expira: [fecha o "nunca"]
```

---

## Configuración

### Archivo de excepciones

`.claude/security/exceptions.yml`

```yaml
exceptions:
  - type: secret
    pattern: "TEST_API_KEY"
    reason: "Key de ambiente de test, no es secret real"
    expires: never

  - type: dependency
    package: "lodash@4.17.20"
    vulnerability: "CVE-2021-23337"
    reason: "No usamos la función afectada"
    expires: "2026-06-01"
    mitigations:
      - "Validación de input en todas las entradas"

  - type: file_size
    path: "public/images/hero.png"
    reason: "Asset del sitio, optimizado"
    max_size: "5MB"
```

### Comandos de bypass (SOLO DESARROLLO)

```bash
# Saltar Security Gate (NUNCA en produccion)
SKIP_SECURITY_GATE=1 /merge

# REQUIERE justificacion documentada en la sesion:
# ⚠️ Security Gate bypassed
#
# Justificacion: {razon del bypass - OBLIGATORIO}
# Autorizado por: {nombre/rol - OBLIGATORIO}
# Fecha: {ISO timestamp}
# Scope: {este merge/release especifico}
#
# Sin justificacion documentada, el bypass queda como violacion de proceso.
```

---

## Integración con CI/CD

### GitHub Actions

```yaml
security-gate:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Secrets Detection
      run: |
        # Usar gitleaks o similar
        gitleaks detect --source . --verbose

    - name: Dependency Audit
      run: npm audit --audit-level=high

    - name: Code Patterns
      run: |
        # Buscar patrones peligrosos
        ! grep -rn "eval(" --include="*.js" --include="*.ts" src/
```

### Pre-push hook

```bash
#!/bin/bash
# .git/hooks/pre-push

# Ejecutar Security Gate básico antes de push
echo "Running Security Gate..."

# Secrets
if grep -rn "password\s*=" --include="*.ts" --include="*.js" src/; then
  echo "❌ Possible hardcoded password detected"
  exit 1
fi

# Audit
npm audit --audit-level=critical
if [ $? -ne 0 ]; then
  echo "❌ Critical vulnerabilities found"
  exit 1
fi

echo "✅ Security Gate passed"
```

---

## Métricas

### Tracking de Security Gate

```yaml
# En cada sesión de /qa
security_gate:
  timestamp: "2026-01-15T10:30:00Z"
  branch: "feature/auth-login"
  result: "passed" | "failed" | "bypassed"

  checks:
    secrets:
      passed: true
      findings: 0
    dependencies:
      passed: true
      critical: 0
      high: 1
      medium: 3
    patterns:
      passed: true
      findings: 0
    files:
      passed: true
      large_files: 0

  exceptions_used: []
  bypass_reason: null
```

### Dashboard sugerido

```
Security Gate - Últimos 30 días

Ejecuciones:  45
Pasados:      42 (93%)
Fallidos:     3 (7%)
Bypassed:     0 (0%)

Top findings:
- Secrets detectados: 5
- Dependencies HIGH: 12
- Patrones peligrosos: 2

Tiempo promedio: 15s
```

---

## Checklist Pre-Merge

Antes de aprobar merge, verificar:

- [ ] Security Gate ejecutado en última versión del código
- [ ] Resultado: APROBADO
- [ ] Si hay warnings, están justificados
- [ ] Si hay excepciones, están documentadas
- [ ] No se usó bypass
