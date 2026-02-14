---
name: architecture
scope: architecture
---

# Arquitectura

## Aplica a
Decisiones de estructura, dependencias y patrones del proyecto.

## Principios arquitectónicos

### 1. Separación de responsabilidades
Cada módulo/componente tiene una responsabilidad clara y única.

### 2. Dependencias hacia adentro
- UI depende de lógica de negocio
- Lógica de negocio depende de datos
- Datos no dependen de nada interno

### 3. Interfaces claras
- Definir contratos entre módulos
- Cambiar implementación sin afectar consumidores

### 4. Evitar acoplamiento
- Módulos independientes
- Comunicación a través de interfaces definidas
- No compartir estado mutable

## Estructura de carpetas

```
src/
├── components/     # UI components
├── features/       # Feature modules
├── lib/           # Shared utilities
├── hooks/         # Custom hooks (React)
├── services/      # External service integrations
├── types/         # TypeScript types/interfaces
└── utils/         # Pure utility functions
```

## Reglas de dependencia

### Correcto
```
component → hook → service → api
feature → lib
page → feature → component
```

### Incorrecto
```
service → component  (servicio no debe conocer UI)
util → hook         (util debe ser puro)
lib → feature       (lib no debe depender de features)
```

## Decisiones arquitectónicas

Toda decisión significativa debe:
1. Documentarse en un ADR
2. Considerar al menos 2 alternativas
3. Explicar el contexto y trade-offs
4. Ser revisada antes de implementar

Ubicación: `.claude/docs/architecture/`

## Ejemplos

### Correcto: Feature module autónomo
```typescript
// features/auth/
├── components/     # UI específica de auth
├── hooks/         # useAuth, useLogin
├── services/      # authService
├── types/         # User, Session
└── index.ts       # Public API
```

### Incorrecto: Feature acoplada
```typescript
// Componente que hace fetch directo
function UserProfile() {
  const [user, setUser] = useState();
  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(setUser);
  }, []);
}

// Correcto: usar hook/service
function UserProfile() {
  const { user } = useUser();
}
```

## Razón
Una arquitectura clara facilita:
- Entender el sistema rápidamente
- Hacer cambios con confianza
- Testear componentes aislados
- Escalar el equipo

## Cuándo romper las reglas
- Prototipos rápidos (con plan de refactorizar)
- Casos edge bien justificados
- Siempre documentar la excepción
