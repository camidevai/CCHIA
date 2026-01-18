# 📁 Estructura de Datos JSON - CCHIA

Esta carpeta contiene todos los datos de contenido de la aplicación CCHIA en formato JSON, permitiendo una gestión centralizada y fácil actualización del contenido sin modificar el código de los componentes.

## 📋 Archivos de Datos

### `site.json`
Configuración general del sitio web.
- Nombre del sitio
- Logos (light/dark mode)
- Meta tags (description, keywords)

### `navigation.json`
Enlaces de navegación principal.
- Links del navbar
- Estructura de menú

### `hero.json`
Contenido de la sección Hero (portada).
- Título principal
- Subtítulo
- Descripción
- Textos de botones CTA
- Información de la mascota

### `objectives.json`
Objetivos y misión de CCHIA (carrusel Mission).
- Título de sección
- Lista de objetivos con:
  - Título
  - Descripción
  - Imagen

### `benefits.json`
Beneficios de unirse a CCHIA.
- Título de sección
- Lista de beneficios con:
  - Icono (identificador)
  - Título
  - Descripción
- Información adicional

### `collaborators.json`
Colaboradores y aliados estratégicos (carrusel infinito).
- Título de sección
- Lista de colaboradores con:
  - Nombre
  - Logo (ruta o null)
  - Estado

### `contact.json`
Formulario de contacto y sección "Únete".
- Configuración del formulario
- Campos y validaciones
- Razones para unirse
- Información de contacto

### `footer.json`
Contenido del footer.
- Información de marca
- Links sociales
- Secciones de links
- Copyright

## 🔄 Cómo Usar

### Importar datos en componentes:

```javascript
import navigationData from '../data/navigation.json';
import heroData from '../data/hero.json';
import objectivesData from '../data/objectives.json';
// etc...

// Usar en el componente
const { navLinks } = navigationData;
```

### Actualizar contenido:

1. Edita el archivo JSON correspondiente
2. Los cambios se reflejarán automáticamente en la aplicación
3. No es necesario modificar código de componentes

## ✅ Ventajas

- ✅ **Centralización**: Todo el contenido en un solo lugar
- ✅ **Mantenibilidad**: Fácil actualización sin tocar código
- ✅ **Escalabilidad**: Agregar nuevos elementos es simple
- ✅ **Multiidioma**: Base para futura internacionalización
- ✅ **Separación**: Contenido separado de la lógica

## 📝 Notas

- Los iconos SVG se mantienen en los componentes por su complejidad
- Las rutas de imágenes son relativas a la carpeta `public/`
- El año en copyright se calcula dinámicamente: `{year}`

