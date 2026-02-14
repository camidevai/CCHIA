# Security Knowledge Base

## Propósito
Conocimiento experto de seguridad universal. Aplica a TODOS los proyectos, independiente del stack.
Para implementaciones específicas, ver `stacks/{stack}/security.md`.

---

## OWASP Top 10 (2024)

| # | Vulnerabilidad | Prevención |
|---|---------------|------------|
| 1 | Broken Access Control | Denegar por defecto, verificar autorización en cada endpoint |
| 2 | Cryptographic Failures | HTTPS, bcrypt/argon2, secrets en env vars |
| 3 | Injection | Prepared statements, validar input, escapar output |
| 4 | Insecure Design | Threat modeling, mínimo privilegio, defense in depth |
| 5 | Security Misconfiguration | Deshabilitar debug, actualizar deps, CORS restrictivo |
| 6 | Vulnerable Components | `npm audit`, `pip-audit`, `cargo audit` |
| 7 | Auth Failures | MFA, lockout, tokens cortos, no enumerar usuarios |
| 8 | Data Integrity | Firmar datos críticos, validar en servidor |
| 9 | Logging Failures | Loggear accesos/errores, NO secrets |
| 10 | SSRF | Whitelist de dominios, bloquear URLs internas |

---

## Principios de Autenticación

### Passwords
- Hash con bcrypt (12+ rounds) o argon2
- NUNCA MD5, SHA1, SHA256 sin salt
- Salt único por password (bcrypt lo incluye)

### Tokens (JWT/Session)
- Expiración corta (15min-1h)
- Regenerar después de login
- Algoritmo explícito, no `none`
- Verificar issuer y audience

### Protección anti-brute-force
- Rate limiting en login
- Lockout después de N fallos
- Delay progresivo

---

## Secret Management

### NUNCA commitear
- API keys, tokens
- Database credentials
- Private keys
- Archivos .env

### Estructura recomendada
```
.env.example   # Template sin valores (commitear)
.env           # Valores reales (en .gitignore)
```

### Detección de secrets (patrones)
- AWS: `AKIA[0-9A-Z]{16}`
- GitHub: `ghp_[a-zA-Z0-9]{36}`
- Stripe: `sk_live_[a-zA-Z0-9]{24}`
- Passwords en código: `password\s*=\s*['"][^'"]+['"]`

---

## Input Validation

### Principios
1. Validar en servidor SIEMPRE
2. Whitelist > Blacklist
3. Validar tipo, formato, rango
4. Sanitizar según contexto (HTML, SQL, Shell)

### Patrones comunes
- Email: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- UUID v4: `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`
- Slug: `^[a-z0-9]+(?:-[a-z0-9]+)*$`

---

## Checklist Pre-Producción

### Autenticación
- [ ] Passwords hasheados correctamente
- [ ] Tokens con expiración
- [ ] MFA disponible
- [ ] Lockout implementado

### Autorización
- [ ] Verificación en cada endpoint
- [ ] Mínimo privilegio
- [ ] IDs no secuenciales

### Datos
- [ ] HTTPS obligatorio
- [ ] Datos sensibles cifrados
- [ ] Logs sin secrets
- [ ] Backups cifrados

### Infraestructura
- [ ] Headers de seguridad
- [ ] CORS restrictivo
- [ ] Rate limiting
- [ ] Dependencias auditadas
