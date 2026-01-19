# 🚀 API de Eventos CCHIA

Backend API para gestión de eventos que modifica directamente los archivos JSON.

## 📋 Características

- ✅ **CRUD Completo**: Create, Read, Update, Delete
- ✅ **Modifica JSON**: Escribe directamente en `src/data/events.json`
- ✅ **Bilingüe**: Sincroniza ES y EN automáticamente
- ✅ **CORS Habilitado**: Permite peticiones desde el frontend
- ✅ **Express.js**: API REST simple y rápida

## 🛠️ Instalación

### 1. Instalar dependencias del servidor

```bash
cd server
npm install
```

### 2. Iniciar el servidor

```bash
npm start
```

O en modo desarrollo (con auto-reload):

```bash
npm run dev
```

El servidor se ejecutará en: **http://localhost:3001**

## 📡 Endpoints de la API

### GET `/api/events`
Obtener todos los eventos

**Respuesta:**
```json
[
  {
    "id": "1737334800000",
    "title": "DATAFRONTIERS 2026",
    "date": "2026-06-04T09:00:00",
    "description": "Congreso Internacional...",
    "photo": "https://...",
    "createdAt": "2026-01-19T20:00:00.000Z",
    "updatedAt": "2026-01-19T20:00:00.000Z"
  }
]
```

### GET `/api/events/:id`
Obtener un evento específico

**Ejemplo:** `GET /api/events/1737334800000`

### POST `/api/events`
Crear un nuevo evento

**Body:**
```json
{
  "title": "Nuevo Evento",
  "date": "2026-12-31T18:00:00",
  "description": "Descripción del evento",
  "photo": "https://imagen.com/foto.jpg"
}
```

**Respuesta:** El evento creado con `id`, `createdAt` y `updatedAt` generados automáticamente.

### PUT `/api/events/:id`
Actualizar un evento existente

**Ejemplo:** `PUT /api/events/1737334800000`

**Body:**
```json
{
  "title": "Título Actualizado",
  "description": "Nueva descripción"
}
```

### DELETE `/api/events/:id`
Eliminar un evento

**Ejemplo:** `DELETE /api/events/1737334800000`

**Respuesta:**
```json
{
  "message": "Event deleted successfully"
}
```

## 🔄 Flujo de Trabajo

1. **Usuario abre la app** → Frontend carga eventos desde API
2. **Admin crea evento** → POST a `/api/events` → Se escribe en `events.json`
3. **Admin edita evento** → PUT a `/api/events/:id` → Se actualiza `events.json`
4. **Admin elimina evento** → DELETE a `/api/events/:id` → Se elimina de `events.json`

## 📂 Archivos Modificados

El servidor modifica estos archivos:

- `src/data/events.json` (Español)
- `src/data/en/events.json` (Inglés)

## ⚠️ Importante

### Ejecutar AMBOS servidores:

**Terminal 1 - Backend API:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend React:**
```bash
npm run dev
```

### URLs:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Events**: http://localhost:3001/api/events

## 🐛 Troubleshooting

### Error: "Cannot connect to API"

**Solución:** Asegúrate de que el servidor esté corriendo en el puerto 3001.

```bash
cd server
npm start
```

### Error: "ENOENT: no such file or directory"

**Solución:** Verifica que los archivos JSON existan:
- `src/data/events.json`
- `src/data/en/events.json`

### Error: "CORS policy"

**Solución:** El servidor ya tiene CORS habilitado. Verifica que estés usando `http://localhost:5173` para el frontend.

## 📝 Notas

- Los cambios se guardan **inmediatamente** en los archivos JSON
- No se usa localStorage ni cookies
- Los eventos se sincronizan en ambos idiomas (ES/EN)
- El servidor debe estar corriendo para que funcione el CRUD

## 🎯 Próximos Pasos

1. Iniciar el servidor: `cd server && npm start`
2. Iniciar el frontend: `npm run dev`
3. Ir al panel admin: http://localhost:5173/admin/login
4. Crear/Editar/Eliminar eventos
5. Ver los cambios reflejados en `src/data/events.json`

