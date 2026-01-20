# ⚡ Configuración Rápida de Supabase

## 🚨 ERROR ACTUAL

```
GET https://uwaapfclxbmlnywhzzjc.supabase.co/rest/v1/events 401 (Unauthorized)
Error: Invalid API key
```

**Causa**: La API key no está configurada correctamente.

---

## ✅ SOLUCIÓN (5 minutos)

### **Paso 1: Obtener la API Key de Supabase** (2 min)

1. **Abre tu proyecto Supabase**: https://uwaapfclxbmlnywhzzjc.supabase.co

2. **Haz clic en el ícono de engranaje** ⚙️ (Project Settings) en el menú lateral

3. **Haz clic en "API"** en el submenú

4. **Copia la "anon public" key**:
   - Verás una sección que dice **"Project API keys"**
   - Busca la key que dice **"anon public"**
   - Haz clic en el botón **"Copy"** al lado de la key
   - Se ve algo así: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YWFwZmNseGJtbG55d2h6empjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNDU2MDAsImV4cCI6MjA1MjkyMTYwMH0.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

---

### **Paso 2: Crear archivo .env** (1 min)

1. **En la raíz del proyecto** (donde está `package.json`), crea un archivo llamado `.env`

2. **Pega este contenido** (reemplaza `TU_KEY_AQUI` con la key que copiaste):

```env
VITE_SUPABASE_URL=https://uwaapfclxbmlnywhzzjc.supabase.co
VITE_SUPABASE_ANON_KEY=TU_KEY_AQUI
```

**Ejemplo real:**
```env
VITE_SUPABASE_URL=https://uwaapfclxbmlnywhzzjc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YWFwZmNseGJtbG55d2h6empjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNDU2MDAsImV4cCI6MjA1MjkyMTYwMH0.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

3. **Guarda el archivo** (Ctrl+S)

---

### **Paso 3: Reiniciar el servidor** (1 min)

1. **Detén el servidor** (Ctrl+C en la terminal donde corre `npm run dev`)

2. **Inicia de nuevo**:
   ```bash
   npm run dev
   ```

3. **Abre el navegador**: http://localhost:5173

✅ **El error debería desaparecer**

---

## 📋 Checklist

- [ ] Abrí Supabase: https://uwaapfclxbmlnywhzzjc.supabase.co
- [ ] Fui a Project Settings → API
- [ ] Copié la "anon public" key
- [ ] Creé el archivo `.env` en la raíz
- [ ] Pegué las credenciales en `.env`
- [ ] Guardé el archivo
- [ ] Reinicié el servidor (`npm run dev`)
- [ ] Abrí http://localhost:5173

---

## 🎯 Siguiente Paso: Crear las Tablas

Una vez que el error 401 desaparezca, necesitas crear las tablas en Supabase:

### **Ir al SQL Editor**

1. En Supabase, haz clic en **"SQL Editor"** en el menú lateral
2. Haz clic en **"New Query"**
3. Copia y pega este SQL:

```sql
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

-- Crear índice
CREATE INDEX idx_events_date ON events(date);

-- Habilitar Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer
CREATE POLICY "Eventos públicos para lectura"
  ON events FOR SELECT
  TO public
  USING (true);

-- Política: Solo autenticados pueden crear
CREATE POLICY "Solo autenticados pueden crear eventos"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Solo autenticados pueden actualizar
CREATE POLICY "Solo autenticados pueden actualizar eventos"
  ON events FOR UPDATE
  TO authenticated
  USING (true);

-- Política: Solo autenticados pueden eliminar
CREATE POLICY "Solo autenticados pueden eliminar eventos"
  ON events FOR DELETE
  TO authenticated
  USING (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar evento inicial
INSERT INTO events (title, date, description, photo)
VALUES (
  'DATAFRONTIERS 2026 - Congreso Internacional de Ciencia de Datos',
  '2026-06-04 09:00:00+00',
  'Congreso Internacional de Ciencia de Datos que se celebrará los días 4 y 5 de junio de 2026 en la Universidad Técnica Federico Santa María, Sede Joaquín - Santiago.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
);
```

4. **Haz clic en "RUN"** (o presiona Ctrl+Enter)

✅ **Resultado esperado**: "Success. No rows returned"

---

## 🎯 Crear Usuario Admin

1. En Supabase, haz clic en **"Authentication"** → **"Users"**
2. Haz clic en **"Add user"** → **"Create new user"**
3. Llena:
   - **Email**: `admin@cchia.cl`
   - **Password**: `123`
   - **Auto Confirm User**: ✅ **ACTIVAR**
4. Haz clic en **"Create user"**

---

## 🎉 ¡Listo!

Ahora puedes:

1. **Ver eventos** en la página principal
2. **Login** en http://localhost:5173/admin/login con `admin@cchia.cl` / `123`
3. **Crear/Editar/Eliminar** eventos desde el panel admin

---

## 🐛 Si sigue sin funcionar

**Verifica que el archivo `.env` esté en la raíz:**

```
PAGINA PARA LA CAMARA/
├── .env                 ← DEBE ESTAR AQUÍ
├── package.json
├── src/
└── ...
```

**Verifica que la key sea correcta:**

- Debe empezar con `eyJ`
- Debe ser muy larga (más de 100 caracteres)
- No debe tener espacios ni saltos de línea

**Reinicia el servidor:**

```bash
# Detener (Ctrl+C)
# Iniciar de nuevo
npm run dev
```

---

¿Necesitas ayuda? Revisa `GUIA_SUPABASE.md` para más detalles.

