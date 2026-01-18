# 🌍 Guía de Traducción - CCHIA

## Sistema de Internacionalización (i18n)

La aplicación CCHIA ahora soporta **múltiples idiomas** con cambio dinámico en tiempo real.

### 🗂️ Idiomas Disponibles

- **Español (es)** - Idioma por defecto
- **English (en)** - Inglés

---

## 📁 Estructura de Carpetas

```
src/data/
├── (raíz)                 # Archivos en español (por defecto)
│   ├── navigation.json
│   ├── hero.json
│   ├── objectives.json
│   ├── benefits.json
│   ├── collaborators.json
│   ├── contact.json
│   ├── footer.json
│   └── site.json
│
└── en/                    # Archivos en inglés
    ├── navigation.json
    ├── hero.json
    ├── objectives.json
    ├── benefits.json
    ├── collaborators.json
    ├── contact.json
    ├── footer.json
    └── site.json
```

---

## 🔧 Cómo Usar las Traducciones

### En Componentes React

```javascript
import { useTranslation } from '../hooks/useTranslation';

const MyComponent = () => {
  const { t, language } = useTranslation();
  const navigationData = t('navigation');
  const heroData = t('hero');
  
  return (
    <div>
      <h1>{heroData.title.line1}</h1>
      <p>Idioma actual: {language}</p>
    </div>
  );
};
```

### Archivos Disponibles

| Clave | Archivo | Contenido |
|-------|---------|-----------|
| `'navigation'` | `navigation.json` | Links de navegación |
| `'hero'` | `hero.json` | Sección Hero |
| `'objectives'` | `objectives.json` | Objetivos del carrusel |
| `'benefits'` | `benefits.json` | Beneficios |
| `'collaborators'` | `collaborators.json` | Colaboradores |
| `'contact'` | `contact.json` | Formulario de contacto |
| `'footer'` | `footer.json` | Footer |
| `'site'` | `site.json` | Configuración general |

---

## 🎨 Componente de Cambio de Idioma

El componente `<LanguageToggle />` permite cambiar entre idiomas:

```javascript
import LanguageToggle from './components/LanguageToggle';

// En Navbar o cualquier componente
<LanguageToggle />
```

**Características:**
- ✅ Cambio instantáneo entre ES/EN
- ✅ Guarda preferencia en `localStorage`
- ✅ Indicadores visuales del idioma activo
- ✅ Animaciones suaves con Framer Motion

---

## ➕ Agregar un Nuevo Idioma

### Paso 1: Crear Carpeta y Archivos

```bash
mkdir src/data/fr  # Ejemplo: Francés
```

Copiar todos los archivos JSON y traducir el contenido.

### Paso 2: Actualizar `useTranslation.js`

```javascript
// src/hooks/useTranslation.js

// Importar archivos del nuevo idioma
import navigationFR from '../data/fr/navigation.json';
import heroFR from '../data/fr/hero.json';
// ... otros imports

const translations = {
  es: { ... },
  en: { ... },
  fr: {  // Nuevo idioma
    navigation: navigationFR,
    hero: heroFR,
    objectives: objectivesFR,
    benefits: benefitsFR,
    collaborators: collaboratorsFR,
    contact: contactFR,
    footer: footerFR,
    site: siteFR,
  },
};
```

### Paso 3: Actualizar `LanguageContext.jsx`

```javascript
// Agregar validación para el nuevo idioma
const savedLanguage = localStorage.getItem('language');
const validLanguages = ['es', 'en', 'fr'];
return validLanguages.includes(savedLanguage) ? savedLanguage : 'es';
```

### Paso 4: Actualizar `LanguageToggle.jsx`

Modificar el componente para soportar más de 2 idiomas (dropdown en lugar de toggle).

---

## 📝 Notas Importantes

1. **Consistencia**: Mantener la misma estructura JSON en todos los idiomas
2. **Imágenes**: Las rutas de imágenes pueden ser las mismas o específicas por idioma
3. **Formato**: Respetar el formato de variables como `{year}` en copyright
4. **Testing**: Probar todos los componentes en cada idioma nuevo

---

## 🚀 Ventajas del Sistema

- ✅ **Centralizado**: Todo el contenido en archivos JSON
- ✅ **Escalable**: Fácil agregar nuevos idiomas
- ✅ **Mantenible**: Cambios sin tocar código React
- ✅ **Performante**: Sin librerías externas pesadas
- ✅ **Persistente**: Guarda preferencia del usuario
- ✅ **Reactivo**: Cambio instantáneo en toda la app

