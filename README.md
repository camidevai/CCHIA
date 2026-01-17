# CCHIA - Cámara Chilena de Inteligencia Artificial

Modern React web application for the Chilean Chamber of Artificial Intelligence (CCHIA) featuring dual theme support (light/dark mode), advanced animations, and a highly technological design.

## 🚀 Features

### Theme System
- **Dual Theme Support**: Seamless light and dark mode switching
- **Persistent Preferences**: Theme selection saved in localStorage
- **System Preference Detection**: Automatically detects user's system theme preference
- **Smooth Transitions**: 300ms transitions between theme changes
- **Accessibility Compliant**: WCAG 2.1 AA contrast ratios in both themes

### Design & UX
- **Matrix Effect**: Animated Matrix-style background (dark mode only)
- **Framer Motion Animations**: Smooth entrance animations and transitions
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interactive Elements**: Hover effects, smooth scrolling, and micro-interactions
- **Glass Morphism**: Modern glassmorphic effects on cards and components

### Performance
- **Code Splitting**: React.lazy() for optimal bundle size
- **Optimized Assets**: Efficient loading and rendering
- **Smooth Animations**: Hardware-accelerated CSS animations
- **Reduced Motion Support**: Respects user's motion preferences

## 🛠️ Tech Stack

- **React 19**: Latest React with modern hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **React Intersection Observer**: Scroll-triggered animations

## 📦 Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Start development server**:
```bash
npm run dev
```

3. **Build for production**:
```bash
npm run build
```

4. **Preview production build**:
```bash
npm run preview
```

## 🎨 Theme Customization

### Color Palette

**Light Mode:**
- Primary Background: `#ffffff`
- Secondary Background: `#f8fafc`, `#f1f5f9`
- Text Primary: `#1f2937`
- Text Secondary: `#6b7280`
- Accent: `#00bcd4`

**Dark Mode:**
- Primary Background: `#0f172a`
- Secondary Background: `#1e293b`
- Text Primary: `#ffffff`
- Text Secondary: `#e5e7eb`
- Accent: `#00bcd4`

### Customizing Themes

Edit `tailwind.config.js` to customize colors:

```javascript
theme: {
  extend: {
    colors: {
      light: { /* light mode colors */ },
      dark: { /* dark mode colors */ },
      accent: { /* accent colors */ }
    }
  }
}
```

## 🧩 Component Structure

```
src/
├── components/
│   ├── Navbar.jsx           # Navigation with theme toggle
│   ├── ThemeToggle.jsx      # Theme switcher button
│   ├── Hero.jsx             # Hero section with CTA
│   ├── MatrixBackground.jsx # Animated Matrix effect
│   ├── Mission.jsx          # Mission and objectives
│   ├── Benefits.jsx         # Benefits grid
│   ├── CallToAction.jsx     # Contact form
│   ├── Footer.jsx           # Footer with links
│   └── LoadingSpinner.jsx   # Loading component
├── contexts/
│   └── ThemeContext.jsx     # Theme management
├── App.jsx                  # Main app component
├── main.jsx                 # Entry point
└── index.css                # Global styles
```

## ♿ Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Focus Indicators**: Clear focus states for all interactive elements
- **ARIA Labels**: Proper ARIA attributes for screen readers
- **Color Contrast**: WCAG 2.1 AA compliant contrast ratios
- **Reduced Motion**: Respects `prefers-reduced-motion` setting

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

No environment variables required for basic setup.

## 📄 License

© 2026 CCHIA - Cámara Chilena de Inteligencia Artificial. All rights reserved.

## 🤝 Contributing

For contributions, please contact CCHIA directly through the website.

## 📞 Contact

- **Email**: contacto@cchia.cl
- **Website**: www.cchia.cl
- **Location**: Santiago, Chile

