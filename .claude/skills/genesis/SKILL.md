---
name: genesis
version: 2.0
description: "Skill de génesis. Discovery estructurado que genera la infraestructura completa de Claude Code para un proyecto."
---

# Genesis - Fábrica de Software

## QUICK REFERENCE

### BLOCKING CONDITIONS
> ⛔ Condiciones que DETIENEN la ejecución

- [ ] Usuario no responde a pregunta de discovery → Esperar respuesta
- [ ] Usuario rechaza equipo de agentes propuesto → Ajustar y reconfirmar
- [ ] Usuario rechaza artefacto generado → Modificar según feedback
- [ ] No existe `.claude/agents/templates/` → Error: templates no encontrados

### REQUIRED OUTPUTS
> 📦 Archivos que DEBEN crearse al finalizar

- [ ] `CLAUDE.md` (raíz del proyecto) - Documentación principal personalizada
- [ ] `.claude/agents/developer.md` - Agent core
- [ ] `.claude/agents/architect.md` - Agent core
- [ ] `.claude/agents/qa.md` - Agent core
- [ ] `.claude/agents/ux-accessibility.md` - Agent core
- [ ] `.claude/agents/{especializados}.md` - Según detección (0-6)
- [ ] `.claude/sessions/YYYY-MM-DD-genesis.md` - Registro de sesión

### PHASES OVERVIEW
```
PHASE 1: Discovery → PHASE 2: Agents → PHASE 3: Generation → PHASE 4: Setup → PHASE 5: Onboarding
      ↓                   ↓                  ↓                   ↓                ↓
  5 preguntas      Detectar+Confirmar   Crear artefactos    Worktrees+Hooks   Explicar flujo
```

### IF FAILS
> 🔧 Si genesis falla a mitad de ejecución → Ver sección **RECOVERY PROCEDURE**

---

## PHASE 1: Discovery

### GATE IN
> Condiciones para entrar

- [ ] Usuario invocó `/genesis`
- [ ] Directorio de trabajo es válido
- [ ] **Check `.claude/` existente:**
  - Si `.claude/` NO existe → continuar normalmente
  - Si `.claude/` existe → preguntar al usuario:
    ```
    ⚠️ Se detectó una configuración existente en .claude/

    Opciones:
    a) Sobrescribir todo (elimina configuración actual)
    b) Merge inteligente (preservar lo existente, solo agregar nuevo)
    c) Cancelar genesis

    ¿Qué deseas hacer? [a/b/c]
    ```
  - Si elige (a) → continuar, sobrescribir
  - Si elige (b) → en PHASE 3, verificar si cada archivo existe antes de crear
  - Si elige (c) → STOP

### MUST DO
> ⚠️ Preguntas UNA A UNA, esperando respuesta antes de continuar

1. [ ] **Pregunta 1: Idea de negocio**
   ```
   ¿Cuál es tu idea de negocio o producto?
   Describe brevemente qué problema resuelve y para quién.
   ```

2. [ ] **Pregunta 2: Tipo de producto**
   ```
   ¿Qué tipo de producto es?
   a) Web App (SPA/MPA)
   b) API/Backend
   c) Mobile App
   d) CLI Tool
   e) Librería/SDK
   f) Landing Page
   g) Otro: ___
   ```

3. [ ] **Pregunta 3: Prioridades**
   ```
   Ordena estas prioridades de mayor a menor importancia (1-3):
   [ ] Experiencia de usuario (UX)
   [ ] Performance/Escalabilidad
   [ ] Velocidad de desarrollo
   ```

4. [ ] **Pregunta 4: Stack tecnológico**

   > **Auto-deteccion**: Antes de preguntar, verificar archivos existentes:
   > - `package.json` -> Node.js/JavaScript
   > - `requirements.txt` / `pyproject.toml` -> Python
   > - `Cargo.toml` -> Rust
   > - `go.mod` -> Go
   > - `pom.xml` / `build.gradle` -> Java
   > Si se detecta, sugerir como default: "Detecte {stack} en el proyecto. Confirmas?"

   ```
   ¿Tienes preferencia de stack o quieres que sugiera uno?
   a) Tengo preferencia: ___
   b) Sugiéreme según el tipo de producto
   ```

5. [ ] **Pregunta 5: Contexto del proyecto**
   ```
   Para configurar el equipo de agentes óptimo, selecciona todo lo que aplique:

   **a) Dominio:**
   [ ] E-commerce / Pagos
   [ ] Healthcare / Salud
   [ ] Finanzas / Banca
   [ ] SaaS B2B
   [ ] AI / Machine Learning
   [ ] IoT / Hardware
   [ ] Otro: ___

   **b) Requisitos de seguridad:**
   [ ] Autenticación de usuarios
   [ ] Pagos con tarjeta
   [ ] Datos sensibles (PII, información personal)
   [ ] Cumplimiento regulatorio (GDPR, HIPAA, PCI)
   [ ] Ninguno especial

   **c) Infraestructura:**
   [ ] Containers (Docker, Kubernetes)
   [ ] Cloud managed (AWS, GCP, Azure)
   [ ] CI/CD complejo
   [ ] On-premise / Híbrido
   [ ] Simple (hosting básico)

   **d) Integraciones clave:**
   [ ] Auth provider (Auth0, Firebase Auth, Cognito)
   [ ] Payment provider (Stripe, PayPal, MercadoPago)
   [ ] APIs externas importantes
   [ ] Bases de datos múltiples
   [ ] Message queues / Event streaming

   **e) Características especiales:**
   [ ] Alto tráfico / Alta escala
   [ ] Real-time (WebSockets, SSE)
   [ ] GraphQL
   [ ] Microservicios
   [ ] Monolito modular
   ```

### CHECKPOINT
> ✅ Verificar antes de continuar

- [ ] Tengo respuesta a las 5 preguntas
- [ ] Entiendo el producto y su contexto
- [ ] Puedo determinar qué agentes necesita

### OUTPUTS
- Respuestas del discovery almacenadas para siguiente fase

### IF FAILS
> ❌ Si usuario no responde o abandona

```
Discovery incompleto. Para continuar con /genesis necesito:
- Respuestas a todas las preguntas de discovery
- Ejecuta /genesis nuevamente cuando estés listo
```

---

## PHASE 2: Agent Selection

### GATE IN
> Condiciones para entrar

- [ ] PHASE 1 completada
- [ ] Tengo todas las respuestas del discovery

### MUST DO
> ⚠️ Todas las acciones son OBLIGATORIAS

1. [ ] **Analizar señales del discovery**

   | Señales detectadas | Agente activado |
   |-------------------|-----------------|
   | Pagos, PCI, Finanzas, HIPAA, GDPR, datos sensibles | `@security` |
   | Docker, K8s, AWS/GCP/Azure, CI/CD complejo | `@devops` |
   | AI/ML, Machine Learning en dominio | `@ml-engineer` |
   | Mobile App, React Native, Flutter | `@mobile` |
   | GraphQL, API pública, Microservicios, APIs externas | `@api-specialist` |
   | Alto tráfico, Alta escala, Performance prioritario | `@performance` |

2. [ ] **Presentar equipo propuesto al usuario**
   ```
   📋 Equipo de agentes para tu proyecto:

   **Core (obligatorios):**
   - @developer - Implementación de código con protocolo RADAR
   - @architect - Decisiones de diseño y arquitectura
   - @qa - Quality Assurance y Security Gate
   - @ux-accessibility - WCAG, ARIA, patrones de usabilidad

   **Especializados (detectados según tu proyecto):**
   - @{nombre} [DETECTADO: {señal que lo activó}]
     → {responsabilidades principales}

   ¿Confirmas este equipo? (puedes agregar/quitar agentes)
   ```

3. [ ] **Esperar confirmación del usuario**
   - Si confirma → Continuar a PHASE 3
   - Si quiere modificar → Ajustar lista y reconfirmar

### CHECKPOINT
> ✅ Verificar antes de continuar

- [ ] Usuario confirmó el equipo de agentes
- [ ] Lista final de agentes definida (core + especializados)

### OUTPUTS
- Lista confirmada de agentes a generar

### IF FAILS
> ❌ Si usuario rechaza repetidamente

```
No se pudo acordar el equipo de agentes.
Opciones:
1. Continuar solo con agentes core (developer, architect, qa, ux-accessibility)
2. Cancelar genesis y revisar requisitos
```

---

## PHASE 3: Generation

### GATE IN
> Condiciones para entrar

- [ ] PHASE 2 completada
- [ ] Equipo de agentes confirmado
- [ ] Templates existen en `.claude/agents/templates/`

### MUST DO
> ⚠️ Generar CON VALIDACIÓN - presentar y esperar OK antes de crear

1. [ ] **Cargar Knowledge Base**

   Leer archivos según matriz de inyección:

   | Agente | Universal | Stack | Domain |
   |--------|-----------|-------|--------|
   | @developer | testing, git, security basics | stack/patterns | - |
   | @architect | api-design, performance, observability | stack/patterns | - |
   | @qa | testing, security checks | stack/security | - |
   | @ux-accessibility | accessibility (FULL) | react/patterns (si aplica) | - |
   | @security | security (FULL) | stack/security | domain/compliance |
   | @devops | observability | - | domain/infrastructure |
   | @ml-engineer | performance | python/patterns | domain/ml-patterns |
   | @mobile | testing | - | - |
   | @api-specialist | api-design (FULL) | stack/patterns | - |
   | @performance | performance (FULL), observability | stack/patterns | - |

2. [ ] **Generar CLAUDE.md**
   - Presentar contenido propuesto
   - Esperar confirmación
   - Crear archivo en raíz

3. [ ] **Generar Agents Core**
   Para cada uno (developer, architect, qa, ux-accessibility):

   **Proceso de generación:**
   a. Leer template base: `.claude/agents/templates/agent-radar-template.md`
   b. Personalizar secciones del template:
      - Reemplazar `{AGENT_NAME}` con nombre del agente
      - Reemplazar `{RESPONSIBILITIES}` con responsabilidades específicas
      - Reemplazar `{KNOWLEDGE}` con conocimiento inyectado (paso c)
   c. Inyectar knowledge (append al final del agente, en sección "## Conocimiento Experto"):
      - Leer archivos de knowledge según matriz (paso 1)
      - Usar versión slim de `knowledge/_inject/` si existe
      - Si no existe slim, extraer secciones clave del archivo full
      - Formato: copiar contenido como subsecciones dentro del agente
   d. Presentar contenido propuesto al usuario
   e. Esperar confirmación
   f. Crear archivo en `.claude/agents/{nombre}.md`

   **Ejemplo before/after:**
   ```
   BEFORE (template):
   ## Conocimiento Experto
   {KNOWLEDGE}

   AFTER (developer.md):
   ## Conocimiento Experto

   ### Testing Essentials
   (contenido de knowledge/_inject/testing-essentials.md)

   ### Git Mastery
   (contenido de knowledge/universal/git-mastery.md - secciones clave)

   ### Security Basics
   (contenido de knowledge/_inject/security-essentials.md - resumen)
   ```

4. [ ] **Generar Agents Especializados**
   Para cada agente detectado:
   - Mismo proceso que paso 3 (template + knowledge injection)
   - Knowledge específico según matriz del paso 1 (domain/ y stack/)
   - Presentar contenido propuesto
   - Esperar confirmación
   - Crear archivo en `.claude/agents/{nombre}.md`

5. [ ] **Detectar y registrar Skills de Stack**

   Si existe `package.json`, detectar:
   - `react` → Registrar `/react-best-practices`
   - Ecosystem (state, routing, forms, styling, ui)

   Crear configuración en CLAUDE.md

### CHECKPOINT
> ✅ Verificar antes de continuar

- [ ] CLAUDE.md creado y confirmado
- [ ] Todos los agents core creados
- [ ] Todos los agents especializados creados
- [ ] Skills de stack detectados y documentados

### OUTPUTS
- `CLAUDE.md`
- `.claude/agents/developer.md`
- `.claude/agents/architect.md`
- `.claude/agents/qa.md`
- `.claude/agents/ux-accessibility.md`
- `.claude/agents/{especializados}.md` (según detección)

### IF FAILS
> ❌ Si falla la generación

```
Error en generación de artefactos.
Archivos creados hasta el momento: {lista}
Archivos pendientes: {lista}

Para recuperar:
1. Revisar archivos creados
2. Ejecutar /genesis --resume para continuar
```

---

## PHASE 4: Setup

### GATE IN
> Condiciones para entrar

- [ ] PHASE 3 completada
- [ ] Artefactos principales creados

### MUST DO
> ⚠️ Configuraciones opcionales con confirmación

1. [ ] **Preguntar sobre Git Worktrees**
   ```
   ¿Deseas habilitar Git Worktrees para desarrollo aislado?

   Los worktrees permiten:
   - Ambientes permanentes (dev, qa, prod)
   - Un worktree por feature, sin stash/switch
   - Flujo GitFlow integrado

   a) Sí, configurar worktrees
   b) No, prefiero flujo tradicional
   ```

2. [ ] **Si elige worktrees:**
   - Verificar repositorio Git existe
   - Si no existe, preguntar si inicializar
   - Ejecutar configuración de worktrees:
     - Crear `.worktrees/environments/` (dev, qa, prod)
     - Crear `.worktrees/features/`
     - Inicializar branch `develop` si no existe
     - Actualizar `.gitignore`
   - Documentar en CLAUDE.md

3. [ ] **Configurar Hooks mínimos**
   - pre-commit: Linting + formato
   - commit-msg: Validar conventional commits
   - Presentar configuración y esperar aprobación

### CHECKPOINT
> ✅ Verificar antes de continuar

- [ ] Decisión de worktrees tomada y aplicada
- [ ] Hooks configurados (si aprobados)

### OUTPUTS
- `.worktrees/` (si habilitado)
- Hooks en `.git/hooks/` o `.husky/` (si aprobado)
- CLAUDE.md actualizado con sección de worktrees

### IF FAILS
> ❌ Si falla setup de worktrees

```
Error configurando worktrees: {error}
El proyecto puede continuar sin worktrees.
Puedes habilitarlos después con: /worktree init
```

---

## PHASE 5: Onboarding

### GATE IN
> Condiciones para entrar

- [ ] PHASE 4 completada
- [ ] Infraestructura básica creada

### MUST DO
> ⚠️ Comunicar resultado y próximos pasos

1. [ ] **Mostrar resumen de génesis**
   ```
   ✅ Génesis completado. Tu proyecto está configurado.

   📁 Infraestructura creada:
      - CLAUDE.md (documentación principal)
      - Agents Core: @developer, @architect, @qa, @ux-accessibility
      - Agents Especializados: {lista de detectados}
      - Skills de proyecto: {lista}
      - Worktrees: {habilitados|no configurados}

   🤖 Tu equipo de agentes:
      - @developer: Implementación de código
      - @architect: Decisiones de diseño
      - @qa: Testing y Security Gate
      - @ux-accessibility: WCAG, ARIA, usabilidad
      {Para cada agente especializado creado}
      - @{nombre}: {rol breve}

   📍 Flujo de desarrollo:
      [✓] Génesis ← estás aquí
      [ ] Brainstorming
      [ ] Crear Issues
      [ ] Build Feature
      [ ] QA + Merge

   👉 Próximo paso: /brainstorming para diseñar tu primera feature
   ```

2. [ ] **Si worktrees habilitados, agregar:**
   ```
   🌳 Worktrees configurados:
      - dev   → develop
      - qa    → develop
      - prod  → main (readonly)

      Usa /worktree create {feature} para desarrollo aislado
   ```

3. [ ] **Crear sesión de registro**
   Archivo: `.claude/sessions/YYYY-MM-DD-genesis.md`

### CHECKPOINT
> ✅ Verificar antes de finalizar

- [ ] Usuario recibió resumen completo
- [ ] Sesión registrada
- [ ] Próximo paso comunicado

### OUTPUTS
- `.claude/sessions/YYYY-MM-DD-genesis.md`

### IF FAILS
> ❌ No debería fallar, pero si ocurre:

```
Genesis completado pero no se pudo crear sesión de registro.
La infraestructura está lista. Próximo paso: /brainstorming
```

---

## FINAL CHECKPOINT

Antes de terminar, verificar:

- [ ] CLAUDE.md existe y está completo
- [ ] Todos los agents core existen
- [ ] Agents especializados detectados fueron creados
- [ ] Sesión de génesis registrada
- [ ] Usuario conoce el próximo paso (/brainstorming)

---

## RECOVERY PROCEDURE

> 🔧 Si /genesis falla a mitad de ejecución, seguir estos pasos para recuperar.

### Detectar Estado de Fallo

```bash
# Verificar qué archivos fueron creados
ls -la CLAUDE.md 2>/dev/null && echo "CLAUDE.md: EXISTS" || echo "CLAUDE.md: MISSING"
ls -la .claude/agents/*.md 2>/dev/null | wc -l | xargs -I {} echo "Agents creados: {}"
ls -la .claude/sessions/*-genesis.md 2>/dev/null && echo "Sesión: EXISTS" || echo "Sesión: MISSING"
```

### Escenarios de Fallo y Recuperación

| Fase donde falló | Estado parcial | Acción de recuperación |
|------------------|----------------|------------------------|
| PHASE 1 (Discovery) | Nada creado | Simplemente re-ejecutar `/genesis` |
| PHASE 2 (Agent Selection) | Nada creado | Re-ejecutar `/genesis` |
| PHASE 3 (Generation) | Algunos archivos creados | Ver "Recuperar PHASE 3" abajo |
| PHASE 4 (Setup) | Agents creados, config parcial | Ver "Recuperar PHASE 4" abajo |
| PHASE 5 (Onboarding) | Todo creado | Solo comunicar próximo paso |

### Recuperar PHASE 3 (Generation)

Si genesis falló durante la generación de archivos:

1. **Identificar archivos faltantes:**
   ```bash
   # Archivos core esperados
   EXPECTED="developer architect qa ux-accessibility"
   for AGENT in $EXPECTED; do
     if [[ ! -f ".claude/agents/${AGENT}.md" ]]; then
       echo "FALTANTE: ${AGENT}.md"
     fi
   done
   ```

2. **Opciones de recuperación:**

   **Opción A: Re-ejecutar genesis con merge (recomendado)**
   ```
   /genesis
   # Cuando pregunte por configuración existente, elegir:
   #   b) Merge inteligente (preservar lo existente, solo agregar nuevo)
   ```

   **Opción B: Generar agentes faltantes manualmente**
   ```bash
   # 1. Copiar template
   cp .claude/agents/templates/agent-radar-template.md .claude/agents/{nombre}.md

   # 2. Editar y personalizar según rol
   # 3. Inyectar knowledge relevante
   ```

   **Opción C: Limpiar y re-ejecutar**
   ```bash
   # ADVERTENCIA: Esto elimina TODO lo generado
   rm -rf .claude/agents/*.md  # Preserva templates/
   rm -f CLAUDE.md
   rm -f .claude/sessions/*-genesis.md

   # Luego re-ejecutar
   /genesis
   ```

### Recuperar PHASE 4 (Setup)

Si genesis falló durante configuración de worktrees o hooks:

1. **Verificar estado de worktrees:**
   ```bash
   git worktree list
   ls -la .worktrees/ 2>/dev/null
   ```

2. **Si worktrees están corruptos:**
   ```bash
   # Limpiar worktrees huérfanos
   git worktree prune

   # Re-inicializar via skill
   /worktree init
   ```

3. **Si hooks no se configuraron:**
   ```bash
   # Los hooks son opcionales, se pueden agregar después
   # Ver .claude/docs/guides/setup-hooks-guide.md
   ```

### Preservar Progreso del Discovery

Si necesitas re-ejecutar genesis pero quieres preservar las respuestas del discovery:

1. **Antes de re-ejecutar**, guarda las respuestas en un archivo temporal:
   ```
   # Respuestas del discovery previo:
   1. Idea: {tu respuesta}
   2. Tipo: {tu respuesta}
   3. Prioridades: {tu respuesta}
   4. Stack: {tu respuesta}
   5. Contexto: {tu respuesta}
   ```

2. **Al re-ejecutar `/genesis`**, proporciona las mismas respuestas.

### Validar Recuperación Exitosa

Después de recuperar, verificar integridad:

```bash
# Checklist de validación
echo "=== Validación de Genesis ==="

# 1. CLAUDE.md
[[ -f "CLAUDE.md" ]] && echo "✅ CLAUDE.md" || echo "❌ CLAUDE.md"

# 2. Agents core
for AGENT in developer architect qa ux-accessibility; do
  [[ -f ".claude/agents/${AGENT}.md" ]] && echo "✅ ${AGENT}.md" || echo "❌ ${AGENT}.md"
done

# 3. Sesión registrada
[[ -n "$(ls .claude/sessions/*-genesis.md 2>/dev/null)" ]] && echo "✅ Sesión genesis" || echo "⚠️ Sin sesión (opcional)"

# 4. Estructura base
[[ -d ".claude/agents/templates" ]] && echo "✅ Templates" || echo "❌ Templates"
[[ -d ".claude/skills" ]] && echo "✅ Skills" || echo "❌ Skills"
[[ -d ".claude/rules" ]] && echo "✅ Rules" || echo "❌ Rules"

echo "=== Fin validación ==="
```

### Contactar Soporte

Si la recuperación manual no funciona:

1. Documenta el error exacto que ocurrió
2. Lista los archivos que existen vs los esperados
3. Ejecuta `/audit --scope quick` para diagnóstico
4. Reporta en: https://github.com/anthropics/claude-code/issues

---

## REFERENCE

> 📚 Información adicional. Esta sección NO contiene acciones.

### Catálogo de Agentes

**Core (siempre se crean):**

| Agente | Rol | Template |
|--------|-----|----------|
| `@developer` | Implementación de código | `.claude/agents/developer.md` |
| `@architect` | Decisiones de diseño | `.claude/agents/architect.md` |
| `@qa` | Quality Assurance | `.claude/agents/qa.md` |
| `@ux-accessibility` | UX y Accesibilidad | `.claude/agents/ux-accessibility.md` |

**Especializados (según detección):**

| Agente | Cuándo se activa |
|--------|------------------|
| `@security` | Pagos, datos sensibles, compliance |
| `@devops` | Containers, cloud, CI/CD |
| `@api-specialist` | APIs complejas, GraphQL, microservices |
| `@ml-engineer` | AI/ML en el dominio |
| `@mobile` | Apps móviles |
| `@performance` | Alta escala, performance crítico |

### Stacks Sugeridos por Tipo

**Web App (SPA):**
- Frontend: React/Next.js + TypeScript
- Styling: Tailwind CSS
- State: Zustand o React Query
- Testing: Vitest + Testing Library

**API/Backend:**
- Runtime: Node.js o Python
- Framework: Express/FastAPI
- DB: PostgreSQL + Redis
- Testing: Jest/Pytest + Supertest

**Mobile App:**
- Framework: React Native o Flutter
- State: Zustand/Riverpod
- Testing: Jest/Flutter test
- Activa: @mobile

**CLI Tool:**
- Runtime: Node.js o Go
- Parser: Commander.js o Cobra
- Testing: Jest/Go test

### React Ecosystem Detection

Si existe `package.json` con React:

```
zustand → state: zustand
jotai → state: jotai
@reduxjs/toolkit → state: redux
react-router-dom → routing: react-router
next → routing: nextjs
@tanstack/react-query → data: tanstack-query
swr → data: swr
react-hook-form → forms: react-hook-form
tailwindcss → styling: tailwind
@radix-ui/* → ui: radix
@headlessui/* → ui: headless-ui
```

### Template de CLAUDE.md

```markdown
# {Nombre del Proyecto}

## Descripción
{Descripción breve del producto}

## Stack
- **Frontend**: {si aplica}
- **Backend**: {si aplica}
- **Base de datos**: {si aplica}

## Configuración

```yaml
issues:
  backend: {local|github}
  repo: {owner/repo si github}
```

## Equipo de Agentes

### Core
| Agente | Rol |
|--------|-----|
| @developer | Implementación de código |
| @architect | Decisiones de diseño |
| @qa | Quality Assurance |
| @ux-accessibility | WCAG, ARIA, usabilidad |

### Especializados
| Agente | Rol | Activado por |
|--------|-----|--------------|
| @{nombre} | {rol} | {señal} |

## Convenciones
{Convenciones específicas del proyecto}

## Skills disponibles
{Lista de skills generados}
```

### Template de Sesión Genesis

```markdown
# Sesión: Genesis
Fecha: {ISO timestamp}
Skill: /genesis
Versión: 2.0

---

## REQUIRED FIELDS

### Resumen
Configuración inicial del proyecto {nombre}.

### Resultado
**COMPLETED**

### Archivos modificados
- [ ] `CLAUDE.md` (nuevo)
- [ ] `.claude/agents/developer.md` (nuevo)
- [ ] `.claude/agents/architect.md` (nuevo)
- [ ] `.claude/agents/qa.md` (nuevo)
- [ ] `.claude/agents/ux-accessibility.md` (nuevo)
{Para cada agente especializado}
- [ ] `.claude/agents/{nombre}.md` (nuevo)

### Próximo paso sugerido
/brainstorming

---

## OPTIONAL FIELDS

### Decisiones tomadas
- Stack: {stack elegido}
- Tipo: {tipo de producto}
- Prioridades: {orden}
- Worktrees: {habilitados|no configurados}

### Señales detectadas
{Lista de señales que activaron agentes}

### Equipo generado
**Core:** @developer, @architect, @qa, @ux-accessibility
**Especializados:** {lista con razón de activación}

### Knowledge inyectado
{Qué knowledge se inyectó en cada agent}
```

### Principios de Ejecución

1. **Una pregunta a la vez** - No abrumar al usuario
2. **Validación antes de crear** - Mostrar propuesta, esperar OK
3. **Detección inteligente** - Solo agentes necesarios
4. **Protocolo RADAR** - Todos los agentes razonan antes de actuar
5. **Knowledge embebido** - Agents con ~300+ líneas de expertise
6. **YAGNI** - Solo generar lo necesario para empezar
7. **Explicar el flujo** - Usuario entiende qué sigue

---

## Ver también

- **Guía**: `.claude/docs/guides/genesis-flow-guide.md`
- **Skill siguiente**: `.claude/skills/brainstorming/SKILL.md`
- **Validación**: `.claude/validation/VALIDATION.md` → "Checklist: /genesis"
- **Session template**: `.claude/skills/_common/session-template.md`
- **Agent templates**: `.claude/agents/templates/agent-radar-template.md`
- **Knowledge base**: `.claude/knowledge/`
