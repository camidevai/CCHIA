# Despliegue en Netlify - CCHIA Website

Este documento explica cómo desplegar la aplicación CCHIA en Netlify.

## 🚀 Opción 1: Despliegue desde GitHub (Recomendado)

### Paso 1: Conectar con Netlify
1. Ve a [Netlify](https://app.netlify.com/)
2. Inicia sesión o crea una cuenta
3. Haz clic en **"Add new site"** → **"Import an existing project"**
4. Selecciona **"Deploy with GitHub"**
5. Autoriza a Netlify para acceder a tu cuenta de GitHub
6. Selecciona el repositorio: **camidevai/CCHIA**

### Paso 2: Configurar el Build
Netlify detectará automáticamente la configuración desde `netlify.toml`, pero verifica:

- **Branch to deploy**: `main`
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### Paso 3: Desplegar
1. Haz clic en **"Deploy site"**
2. Espera a que termine el build (2-3 minutos)
3. Tu sitio estará disponible en una URL como: `https://random-name-123456.netlify.app`

### Paso 4: Personalizar el dominio (Opcional)
1. En el dashboard de Netlify, ve a **"Site settings"** → **"Domain management"**
2. Haz clic en **"Options"** → **"Edit site name"**
3. Cambia el nombre a algo como: `cchia` → `https://cchia.netlify.app`

---

## 🚀 Opción 2: Despliegue con Netlify CLI

### Instalación
```bash
npm install -g netlify-cli
```

### Login
```bash
netlify login
```

### Build local
```bash
npm run build
```

### Despliegue
```bash
# Deploy de prueba
netlify deploy

# Deploy a producción
netlify deploy --prod
```

---

## 🚀 Opción 3: Drag & Drop Manual

### Paso 1: Build local
```bash
npm run build
```

### Paso 2: Desplegar
1. Ve a [Netlify Drop](https://app.netlify.com/drop)
2. Arrastra la carpeta `dist` a la zona de drop
3. Tu sitio se desplegará automáticamente

---

## ⚙️ Configuración Incluida

El archivo `netlify.toml` ya está configurado con:

- ✅ Build command optimizado
- ✅ Redirects para SPA (Single Page Application)
- ✅ Headers de seguridad
- ✅ Cache para assets estáticos
- ✅ Configuración para diferentes contextos (production, preview, branch)

---

## 🔄 Despliegue Continuo

Una vez conectado con GitHub, Netlify desplegará automáticamente:

- ✅ Cada push a la rama `main` → Deploy a producción
- ✅ Cada Pull Request → Deploy preview
- ✅ Cada rama → Branch deploy

---

## 🌐 Variables de Entorno (Si las necesitas)

Si en el futuro necesitas variables de entorno:

1. Ve a **"Site settings"** → **"Environment variables"**
2. Agrega las variables necesarias
3. Redeploy el sitio

---

## 📊 Monitoreo

Netlify proporciona:
- Analytics de tráfico
- Logs de build
- Notificaciones de deploy
- Performance metrics

---

## 🔗 Enlaces Útiles

- [Documentación de Netlify](https://docs.netlify.com/)
- [Netlify CLI](https://cli.netlify.com/)
- [Netlify Status](https://www.netlifystatus.com/)

---

## 🆘 Solución de Problemas

### Build falla
- Verifica que `package.json` tenga todas las dependencias
- Revisa los logs de build en Netlify
- Asegúrate de que `npm run build` funcione localmente

### Página en blanco
- Verifica que el `publish directory` sea `dist`
- Revisa que los redirects estén configurados correctamente

### Tema no persiste
- El tema se guarda en localStorage del navegador
- Funciona correctamente en producción

---

## 📝 Notas

- El sitio es completamente estático (no requiere servidor)
- El build toma aproximadamente 2-3 minutos
- Netlify ofrece 100GB de ancho de banda gratis al mes
- SSL/HTTPS está habilitado automáticamente

