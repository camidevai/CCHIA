# Knowledge Inject

Versiones compactas de knowledge para inyección en agents durante `/genesis`.

## Propósito

Los archivos en esta carpeta son versiones "slim" del knowledge completo,
optimizadas para inyección en agents sin cargar el documento completo.

## Archivos disponibles

| Archivo | Tokens | Referencia completa |
|---------|--------|---------------------|
| `security-essentials.md` | ~200 | `universal/security.md` |
| `testing-essentials.md` | ~150 | `universal/testing.md` |
| `ux-accessibility-essentials.md` | ~150 | `universal/accessibility.md` |

## Uso

Durante `/genesis`, al crear agents:

```markdown
## 3. Conocimiento Experto

### Security
<!-- Inyectar de knowledge/_inject/security-essentials.md -->

### Testing
<!-- Inyectar de knowledge/_inject/testing-essentials.md -->
```

## Cuándo usar cada versión

| Contexto | Versión |
|----------|---------|
| Inyección en agent | `_inject/*.md` (slim) |
| Consulta profunda | `universal/*.md` o `stacks/*/*.md` (completo) |
| Documentación | Links a versión completa |
