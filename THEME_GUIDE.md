# 🎨 CCHIA Theme System - Guía de Uso

Sistema de diseño completo basado en la identidad visual de la **Cámara Chilena de Inteligencia Artificial**.

---

## 📋 Tabla de Contenidos

1. [Paleta de Colores](#paleta-de-colores)
2. [Uso en Tailwind](#uso-en-tailwind)
3. [Variables CSS](#variables-css)
4. [Componentes Predefinidos](#componentes-predefinidos)
5. [Tipografía](#tipografía)
6. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🎨 Paleta de Colores

### Colores de Marca (Brand)

| Color | Hex | Uso |
|-------|-----|-----|
| **Primary Blue** | `#0A2A66` | Marca institucional, headers, botones primarios |
| **Secondary Teal** | `#1FB6A6` | Innovación, acentos, links, highlights |
| **Dark Blue** | `#081C45` | Fondos oscuros, footer, autoridad |
| **Teal Light** | `#4EE3D3` | Acentos en modo oscuro, efectos glow |

---

## 🌞 Tema Claro (Light Theme)

**Sensación:** Profesional, institucional, confianza + innovación

### Fondos
- `bg-light-bg-primary` → `#FFFFFF` (Fondo principal)
- `bg-light-bg-secondary` → `#F2F4F8` (Fondo suave)
- `bg-light-bg-tertiary` → `#E8EDF5` (Fondo alternativo)

### Textos (Tonos azules institucionales - sin negro)
- `text-light-text-primary` → `#0A2A66` (Azul institucional principal)
- `text-light-text-secondary` → `#4A5F8A` (Azul grisáceo medio)
- `text-light-text-tertiary` → `#7A8FB8` (Azul grisáceo claro)

### Bordes
- `border-light-border-primary` → `#D9DEE8`
- `border-light-border-secondary` → `#E8EDF5`

---

## 🌙 Tema Oscuro (Dark Theme)

**Sensación:** Futurista, tech authority, Matrix/IA

### Fondos
- `bg-dark-bg-primary` → `#081C45` (Fondo principal)
- `bg-dark-bg-secondary` → `#0A2A66` (Fondo secundario)
- `bg-dark-bg-tertiary` → `#0D3380` (Fondo alternativo)

### Textos
- `text-dark-text-primary` → `#E5EAF3` (Texto principal)
- `text-dark-text-secondary` → `#AAB4C8` (Texto secundario)
- `text-dark-text-tertiary` → `#8B95A8` (Texto terciario)

### Bordes
- `border-dark-border-primary` → `#1E3A8A`
- `border-dark-border-secondary` → `#1A3470`

---

## 🎯 Colores de Acción

### Primary (Adaptativo)
```jsx
// Light mode: #0A2A66 (Azul institucional)
// Dark mode: #1FB6A6 (Teal)
className="bg-primary hover:bg-primary-hover"
```

### Accent (Teal)
```jsx
// Light mode: #1FB6A6
// Dark mode: #4EE3D3
className="text-accent border-accent"
```

---

## 💻 Uso en Tailwind

### Ejemplo de Card
```jsx
<div className="bg-light-bg-primary dark:bg-dark-bg-primary 
                border-2 border-light-border-primary dark:border-dark-border-primary
                rounded-2xl p-6 shadow-lg
                hover:border-accent transition-all duration-300">
  <h3 className="text-light-text-primary dark:text-dark-text-primary 
                 text-2xl font-bold mb-4">
    Título
  </h3>
  <p className="text-light-text-secondary dark:text-dark-text-secondary">
    Descripción
  </p>
</div>
```

### Ejemplo de Botón Primario
```jsx
<button className="bg-primary hover:bg-primary-hover 
                   text-white px-6 py-3 rounded-lg
                   font-semibold transition-all duration-300
                   hover:scale-105 hover:shadow-xl">
  Únete Ahora
</button>
```

### Ejemplo de Botón Secundario (Teal)
```jsx
<button className="bg-accent hover:bg-accent-hover 
                   text-white px-6 py-3 rounded-lg
                   font-semibold transition-all duration-300">
  Conoce Más
</button>
```

---

## 🔤 Variables CSS

Puedes usar variables CSS directamente:

```css
.custom-element {
  background: var(--bg-main);
  color: var(--text-main);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
}

.custom-button {
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
}

.custom-button:hover {
  background: var(--button-primary-hover);
}
```

---

## 🎨 Clases Utility Predefinidas

### Efectos Glow
```jsx
<h1 className="glow-text">Texto con resplandor</h1>
<h1 className="glow-text-strong">Texto con resplandor fuerte</h1>
```

### Glass Morphism
```jsx
<div className="glass-effect p-6 rounded-xl">
  Contenido con efecto cristal
</div>
```

### Gradientes
```jsx
<div className="gradient-primary p-8">Gradiente azul institucional</div>
<div className="gradient-secondary p-8">Gradiente teal</div>
<div className="gradient-accent p-8">Gradiente combinado</div>
```

### Botones Predefinidos
```jsx
<button className="btn-primary">Botón Primario</button>
<button className="btn-secondary">Botón Secundario</button>
```

### Cards
```jsx
<div className="card">
  Contenido de la tarjeta con hover effect
</div>
```

---

## ✨ Tipografía

### Fuentes
- **Principal:** `Inter` (UI, cuerpo, navegación)
- **Headings:** `Space Grotesk` (opcional, más futurista)

### Escala Tipográfica
```jsx
<h1 className="text-5xl font-bold">Título Principal</h1>
<h2 className="text-4xl font-bold">Título Secundario</h2>
<h3 className="text-3xl font-semibold">Título Terciario</h3>
<p className="text-lg">Texto grande</p>
<p className="text-base">Texto normal</p>
<p className="text-sm">Texto pequeño</p>
```

---

## 🚀 Ejemplos Completos

### Hero Section
```jsx
<section className="bg-gradient-primary py-20">
  <div className="max-w-7xl mx-auto px-4">
    <h1 className="text-6xl font-bold text-white glow-text-strong mb-6">
      Cámara Chilena de IA
    </h1>
    <p className="text-xl text-white/90 mb-8">
      Impulsando el futuro de la inteligencia artificial
    </p>
    <button className="btn-secondary">
      Únete Ahora
    </button>
  </div>
</section>
```

---

## 📱 Responsive

Todos los colores son responsive y se adaptan automáticamente al tema (light/dark).

```jsx
// Automático con dark mode
<div className="bg-light-bg-primary dark:bg-dark-bg-primary">
  Contenido adaptativo
</div>
```

---

## 🎯 Mejores Prácticas

1. ✅ Usa siempre pares light/dark para consistencia
2. ✅ Prefiere `accent` para CTAs y elementos interactivos
3. ✅ Usa `primary` para elementos institucionales
4. ✅ Aplica `glow-text` solo en títulos importantes
5. ✅ Mantén contraste adecuado (WCAG AA mínimo)

---

**Creado para CCHIA** 🇨🇱🤖

