# 📚 Instrucciones: Sistema de Eventos con API

## 🎯 ¿Qué se implementó?

Ahora el sistema de eventos **modifica directamente los archivos JSON** en lugar de usar localStorage o cookies.

### ✅ Cambios Realizados:

1. **Backend API** (servidor Node.js/Express)
2. **Frontend actualizado** para usar la API
3. **CRUD completo** que escribe en `src/data/events.json`

---

## 🚀 Cómo Usar el Sistema

### **Paso 1: Instalar Dependencias**

#### A. Instalar dependencias del proyecto principal:

```bash
npm install
```

#### B. Instalar dependencias del servidor:

```bash
cd server
npm install
cd ..
```

---

### **Paso 2: Iniciar los Servidores**

Tienes **2 opciones**:

#### **Opción A: Ejecutar ambos servidores a la vez (RECOMENDADO)**

```bash
npm run dev:full
```

Esto iniciará:
- ✅ Backend API en `http://localhost:3001`
- ✅ Frontend React en `http://localhost:5173`

#### **Opción B: Ejecutar en terminales separadas**

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

### **Paso 3: Usar el Sistema**

1. **Abrir el navegador**: http://localhost:5173
2. **Ver eventos en la página principal** (sección "Próximos Eventos")
3. **Ir al panel admin**: http://localhost:5173/admin/login
4. **Login**: `admin` / `123`
5. **Gestionar eventos**:
   - ➕ Crear nuevo evento
   - ✏️ Editar evento existente
   - 🗑️ Eliminar evento

---

## 📂 ¿Dónde se Guardan los Eventos?

Los eventos se guardan en archivos JSON:

```
src/
  data/
    events.json          ← Eventos en español
    en/
      events.json        ← Eventos en inglés
```

### **Ejemplo de `events.json`:**

```json
[
  {
    "id": "1737334800000",
    "title": "DATAFRONTIERS 2026 - Congreso Internacional de Ciencia de Datos",
    "date": "2026-06-04T09:00:00",
    "description": "Congreso Internacional de Ciencia de Datos...",
    "photo": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    "createdAt": "2026-01-19T20:00:00.000Z",
    "updatedAt": "2026-01-19T20:00:00.000Z"
  }
]
```

---

## 🔄 Flujo de Trabajo

```
┌─────────────────────────────────────────────────────────┐
│  1. Usuario abre la app                                 │
│     ↓                                                   │
│  2. Frontend hace GET /api/events                       │
│     ↓                                                   │
│  3. Backend lee src/data/events.json                    │
│     ↓                                                   │
│  4. Eventos se muestran en la página                    │
│     ↓                                                   │
│  5. Admin crea/edita/elimina evento                     │
│     ↓                                                   │
│  6. Frontend hace POST/PUT/DELETE a la API              │
│     ↓                                                   │
│  7. Backend modifica events.json                        │
│     ↓                                                   │
│  8. Cambios se reflejan inmediatamente                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar solo frontend |
| `npm run server` | Iniciar solo backend |
| `npm run dev:full` | Iniciar frontend + backend |
| `npm run build` | Compilar para producción |

---

## 📡 Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/events` | Obtener todos los eventos |
| GET | `/api/events/:id` | Obtener un evento específico |
| POST | `/api/events` | Crear nuevo evento |
| PUT | `/api/events/:id` | Actualizar evento |
| DELETE | `/api/events/:id` | Eliminar evento |

---

## ⚠️ Importante

### **Ambos servidores deben estar corriendo:**

- ❌ **Solo frontend** → No funcionará el CRUD
- ❌ **Solo backend** → No se verá la interfaz
- ✅ **Ambos** → Sistema completo funcional

### **Puertos:**

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

---

## 🐛 Solución de Problemas

### **Error: "Cannot connect to API"**

**Causa:** El servidor backend no está corriendo.

**Solución:**
```bash
cd server
npm start
```

### **Error: "Port 3001 already in use"**

**Causa:** Ya hay un proceso usando el puerto 3001.

**Solución:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### **Los cambios no se guardan**

**Causa:** El servidor backend no está corriendo o hay un error de permisos.

**Solución:**
1. Verificar que el servidor esté corriendo
2. Verificar permisos de escritura en `src/data/`
3. Ver la consola del servidor para errores

---

## 📝 Notas Técnicas

- **No se usa localStorage**: Todo se guarda en JSON
- **No se usan cookies**: Autenticación simple con contexto
- **Sincronización ES/EN**: Los eventos se guardan en ambos idiomas
- **Persistencia real**: Los cambios sobreviven a reinicios del servidor

---

## 🎯 Próximos Pasos

1. ✅ Instalar dependencias: `npm install` y `cd server && npm install`
2. ✅ Iniciar sistema: `npm run dev:full`
3. ✅ Abrir navegador: http://localhost:5173
4. ✅ Ir al admin: http://localhost:5173/admin/login
5. ✅ Crear/Editar/Eliminar eventos
6. ✅ Ver cambios en `src/data/events.json`

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que ambos servidores estén corriendo
2. Revisa la consola del navegador (F12)
3. Revisa la consola del servidor backend
4. Verifica que los archivos JSON existan en `src/data/`

---

¡Listo! Ahora tienes un sistema completo de gestión de eventos que modifica directamente los archivos JSON. 🎉

