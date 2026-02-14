# Tools Pre-checks

## Propósito
Verificar que las herramientas necesarias del stack están instaladas y funcionando.

---

## Detección de Stack

### Detectar desde archivos del proyecto

| Archivo | Stack |
|---------|-------|
| `package.json` | Node.js |
| `requirements.txt`, `pyproject.toml` | Python |
| `Cargo.toml` | Rust |
| `go.mod` | Go |
| `pom.xml`, `build.gradle` | Java |
| `composer.json` | PHP |
| `Gemfile` | Ruby |

### Detectar framework desde package.json

```json
{
  "dependencies": {
    "react": "^18.0.0",     // → React
    "next": "^14.0.0",      // → Next.js
    "express": "^4.18.0",   // → Express
    "nestjs": "^10.0.0"     // → NestJS
  }
}
```

---

## Checks por Stack

### Node.js

| Herramienta | Comando | Versión mínima |
|-------------|---------|----------------|
| node | `node --version` | 18.0.0 |
| npm | `npm --version` | 9.0.0 |
| yarn (si usa) | `yarn --version` | 1.22.0 |
| pnpm (si usa) | `pnpm --version` | 8.0.0 |

**Mensaje de error:**
```
❌ NODE_NOT_FOUND: Node.js no está instalado

Problema:
  Este proyecto requiere Node.js pero no está disponible.

Solución:
  Instala Node.js:

  # Con nvm (recomendado):
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  nvm install 20

  # O descarga desde:
  https://nodejs.org
```

**Mensaje de versión antigua:**
```
⚠️ NODE_VERSION_OLD: Node.js v16.0.0 encontrado, se requiere v18.0.0+

Problema:
  Tu versión de Node.js es antigua y podría no ser compatible.

Solución:
  Actualiza Node.js:

  nvm install 20
  nvm use 20
```

---

### Python

| Herramienta | Comando | Versión mínima |
|-------------|---------|----------------|
| python | `python --version` | 3.9.0 |
| pip | `pip --version` | 21.0.0 |
| poetry (si usa) | `poetry --version` | 1.5.0 |

**Mensaje de error:**
```
❌ PYTHON_NOT_FOUND: Python no está instalado

Problema:
  Este proyecto requiere Python pero no está disponible.

Solución:
  Instala Python:

  # Con pyenv (recomendado):
  pyenv install 3.11
  pyenv global 3.11

  # O descarga desde:
  https://python.org
```

---

### Rust

| Herramienta | Comando | Versión mínima |
|-------------|---------|----------------|
| rustc | `rustc --version` | 1.70.0 |
| cargo | `cargo --version` | 1.70.0 |

**Mensaje de error:**
```
❌ RUST_NOT_FOUND: Rust no está instalado

Problema:
  Este proyecto requiere Rust pero no está disponible.

Solución:
  Instala Rust con rustup:

  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

---

### Go

| Herramienta | Comando | Versión mínima |
|-------------|---------|----------------|
| go | `go version` | 1.21.0 |

**Mensaje de error:**
```
❌ GO_NOT_FOUND: Go no está instalado

Problema:
  Este proyecto requiere Go pero no está disponible.

Solución:
  Instala Go:

  # macOS con Homebrew:
  brew install go

  # O descarga desde:
  https://go.dev/dl/
```

---

## Herramientas Comunes

### Git (siempre requerido)

```bash
git --version
```

### Docker (si proyecto usa)

```bash
docker --version
docker compose version
```

**Mensaje de error:**
```
❌ DOCKER_NOT_FOUND: Docker no está instalado

Problema:
  Este proyecto usa Docker pero no está disponible.

Solución:
  Instala Docker Desktop:
  https://docker.com/get-started
```

### Database clients

| DB | Comando |
|----|---------|
| PostgreSQL | `psql --version` |
| MySQL | `mysql --version` |
| MongoDB | `mongosh --version` |
| Redis | `redis-cli --version` |

---

## Variables de Entorno

### Verificar existencia

```bash
# Verificar que existe
test -n "$DATABASE_URL"

# Verificar formato (no valor)
echo "$DATABASE_URL" | grep -qE '^postgres://'
```

### Variables comunes requeridas

| Variable | Cuándo |
|----------|--------|
| `DATABASE_URL` | Proyecto usa DB |
| `REDIS_URL` | Proyecto usa Redis |
| `JWT_SECRET` | API con auth |
| `API_KEY` | Integraciones externas |

**Mensaje de error:**
```
❌ ENV_MISSING: Variables de entorno requeridas no encontradas

Problema:
  Faltan variables de entorno necesarias:
  - DATABASE_URL
  - JWT_SECRET

Solución:
  1. Copia el archivo de ejemplo:
     cp .env.example .env

  2. Edita .env con tus valores:
     DATABASE_URL=postgres://...
     JWT_SECRET=...

  3. Carga el archivo:
     source .env
```

---

## Dependencias del Proyecto

### Node.js

```bash
# Verificar node_modules existe
test -d node_modules

# Verificar lockfile sincronizado
npm ci --dry-run
```

**Mensaje de error:**
```
❌ DEPS_NOT_INSTALLED: Dependencias no instaladas

Problema:
  node_modules no existe o está desactualizado.

Solución:
  Instala las dependencias:

  npm install
  # o
  yarn install
```

### Python

```bash
# Verificar virtualenv activo
test -n "$VIRTUAL_ENV"

# Verificar dependencias
pip check
```

---

## Implementación

### Función de check

```typescript
interface ToolsCheckResult {
  passed: boolean;
  stack: string;
  tools: {
    name: string;
    found: boolean;
    version?: string;
    requiredVersion?: string;
    error?: string;
  }[];
  envVars: {
    name: string;
    found: boolean;
    error?: string;
  }[];
}

async function runToolsChecks(): Promise<ToolsCheckResult> {
  // 1. Detectar stack
  const stack = await detectStack();

  // 2. Obtener herramientas requeridas
  const requiredTools = getRequiredTools(stack);

  // 3. Verificar cada herramienta
  const tools = await Promise.all(
    requiredTools.map(async (tool) => {
      try {
        const version = await exec(`${tool.command}`);
        return {
          name: tool.name,
          found: true,
          version: parseVersion(version),
          requiredVersion: tool.minVersion
        };
      } catch {
        return {
          name: tool.name,
          found: false,
          error: `${tool.name} not found`
        };
      }
    })
  );

  // 4. Verificar variables de entorno
  const envVars = getRequiredEnvVars(stack).map(name => ({
    name,
    found: !!process.env[name]
  }));

  return {
    passed: tools.every(t => t.found) && envVars.every(e => e.found),
    stack,
    tools,
    envVars
  };
}
```

---

## Uso en Skills

### Template de output

```markdown
## Pre-check: Herramientas

Stack detectado: Node.js + React

### Herramientas del sistema:

| Herramienta | Estado | Versión |
|-------------|--------|---------|
| git | ✅ | 2.42.0 |
| node | ✅ | 20.10.0 |
| npm | ✅ | 10.2.0 |

### Variables de entorno:

| Variable | Estado |
|----------|--------|
| DATABASE_URL | ✅ |
| JWT_SECRET | ❌ Faltante |

### Dependencias:

| Estado | Detalle |
|--------|---------|
| ⚠️ | node_modules existe pero puede estar desactualizado |

---

❌ Hay problemas que impiden continuar:
   - JWT_SECRET no está definido

Solución:
  Agrega JWT_SECRET a tu archivo .env
```
