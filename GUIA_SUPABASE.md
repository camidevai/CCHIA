# 🚀 Guía de Configuración Supabase - CCHIA

## 📋 Información del Proyecto

- **Nombre de Base de Datos**: CCHIA
- **URL del Proyecto**: https://uwaapfclxbmlnywhzzjc.supabase.co
- **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (ya configurada)

---

## 🎯 Paso 1: Crear las Tablas en Supabase

### **A. Ir al SQL Editor**

1. Abre tu proyecto Supabase: https://uwaapfclxbmlnywhzzjc.supabase.co
2. En el menú lateral, haz clic en **"SQL Editor"**
3. Haz clic en **"New Query"**

---

### **B. Ejecutar Query para Tabla de Eventos**

Copia y pega este código SQL completo:

```sql
-- ============================================
-- TABLA DE EVENTOS
-- ============================================

-- Crear tabla de eventos
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  description TEXT CHECK (char_length(description) <= 500),
  photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índice para búsquedas por fecha
CREATE INDEX idx_events_date ON events(date);

-- Habilitar Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer eventos (público)
CREATE POLICY "Eventos públicos para lectura"
  ON events FOR SELECT
  TO public
  USING (true);

-- Política: Solo usuarios autenticados pueden insertar
CREATE POLICY "Solo autenticados pueden crear eventos"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Solo usuarios autenticados pueden actualizar
CREATE POLICY "Solo autenticados pueden actualizar eventos"
  ON events FOR UPDATE
  TO authenticated
  USING (true);

-- Política: Solo usuarios autenticados pueden eliminar
CREATE POLICY "Solo autenticados pueden eliminar eventos"
  ON events FOR DELETE
  TO authenticated
  USING (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INSERTAR EVENTO INICIAL: DATAFRONTIERS 2026
-- ============================================

INSERT INTO events (title, date, description, photo)
VALUES (
  'DATAFRONTIERS 2026 - Congreso Internacional de Ciencia de Datos',
  '2026-06-04 09:00:00+00',
  'Congreso Internacional de Ciencia de Datos que se celebrará los días 4 y 5 de junio de 2026 en la Universidad Técnica Federico Santa María, Sede Joaquín - Santiago. Organizado por el Departamento de Electrónica e Informática de la UTFSM Sede Concepción. Este evento reunirá a destacados líderes de la industria, académicos y representantes del sector público para explorar las últimas tendencias en análisis de datos, inteligencia artificial y su impacto en nuestra sociedad.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
);
```

**Haz clic en "RUN" o presiona Ctrl+Enter**

✅ **Resultado esperado**: "Success. No rows returned"

---

## 🎯 Paso 2: Crear Usuario Administrador

### **A. Ir a Authentication**

1. En el menú lateral, haz clic en **"Authentication"**
2. Haz clic en **"Users"**
3. Haz clic en **"Add user"** → **"Create new user"**

### **B. Crear el Usuario Admin**

Llena el formulario:

- **Email**: `admin@cchia.cl`
- **Password**: `123` (o la que prefieras)
- **Auto Confirm User**: ✅ **Activar** (importante!)

Haz clic en **"Create user"**

✅ **Resultado**: Usuario admin creado exitosamente

---

## 🎯 Paso 3: Verificar la Configuración

### **A. Verificar Tabla de Eventos**

1. Ve a **"Table Editor"** en el menú lateral
2. Deberías ver la tabla **"events"**
3. Haz clic en ella
4. Deberías ver 1 fila con el evento DATAFRONTIERS 2026

### **B. Verificar Usuario Admin**

1. Ve a **"Authentication"** → **"Users"**
2. Deberías ver el usuario `admin@cchia.cl`
3. Estado: **Confirmed** ✅

---

## 🎯 Paso 4: Probar la Aplicación

### **A. Iniciar el Proyecto**

```bash
npm run dev
```

### **B. Probar Login**

1. Abre: http://localhost:5173/admin/login
2. Ingresa:
   - **Email**: `admin@cchia.cl`
   - **Password**: `123` (o la que configuraste)
3. Haz clic en **"Iniciar Sesión"**

✅ **Resultado**: Deberías ser redirigido al dashboard

### **C. Probar CRUD de Eventos**

1. En el dashboard, ve a la sección de eventos
2. **Crear**: Haz clic en "+ Crear Evento"
3. **Editar**: Haz clic en el ícono de lápiz
4. **Eliminar**: Haz clic en el ícono de basura

✅ **Resultado**: Los cambios se reflejan en Supabase inmediatamente

---

## 📊 Estructura de la Base de Datos

### **Tabla: events**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | ID único (auto-generado) |
| `title` | VARCHAR(100) | Título del evento |
| `date` | TIMESTAMPTZ | Fecha y hora del evento |
| `description` | TEXT | Descripción (máx 500 caracteres) |
| `photo` | TEXT | URL de la imagen |
| `created_at` | TIMESTAMPTZ | Fecha de creación (auto) |
| `updated_at` | TIMESTAMPTZ | Fecha de actualización (auto) |

---

## 🔒 Seguridad (Row Level Security)

### **Políticas Configuradas:**

✅ **Lectura (SELECT)**: Público (cualquiera puede ver eventos)
✅ **Crear (INSERT)**: Solo usuarios autenticados
✅ **Actualizar (UPDATE)**: Solo usuarios autenticados
✅ **Eliminar (DELETE)**: Solo usuarios autenticados

---

## 🎓 Próximos Pasos

1. ✅ Ejecutar SQL para crear tabla `events`
2. ✅ Crear usuario admin en Authentication
3. ✅ Iniciar la aplicación: `npm run dev`
4. ✅ Probar login con `admin@cchia.cl`
5. ✅ Crear/Editar/Eliminar eventos
6. ✅ Verificar cambios en Supabase Table Editor

---

## 🐛 Troubleshooting

### **Error: "Invalid login credentials"**

**Causa**: Email o contraseña incorrectos, o usuario no confirmado.

**Solución**:
1. Ve a Authentication → Users
2. Verifica que el usuario esté **Confirmed**
3. Si no, haz clic en los 3 puntos → "Confirm email"

### **Error: "new row violates row-level security policy"**

**Causa**: No estás autenticado o las políticas RLS están mal configuradas.

**Solución**:
1. Verifica que hayas iniciado sesión
2. Revisa las políticas en Table Editor → events → Policies

### **No se ven los eventos en la página**

**Causa**: La tabla está vacía o hay un error de conexión.

**Solución**:
1. Ve a Table Editor → events
2. Verifica que haya al menos 1 evento
3. Revisa la consola del navegador (F12) para errores

---

¡Listo! Ahora tienes Supabase completamente configurado. 🎉

