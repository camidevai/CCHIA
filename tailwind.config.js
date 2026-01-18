/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CCHIA Brand Colors - Institutional Identity
        brand: {
          primary: '#0A2A66',      // Primary Blue - Institutional
          secondary: '#1FB6A6',    // Secondary Teal - Innovation
          'dark-blue': '#081C45',  // Dark Blue - Authority
          'soft-gray': '#F2F4F8',  // Soft Gray - UI Background
          'border-gray': '#D9DEE8', // Border Gray - Dividers
          'teal-light': '#4EE3D3', // Light Teal - Dark mode accent
        },

        // Light Theme - Professional & Institutional
        light: {
          bg: {
            primary: '#FFFFFF',      // Main background
            secondary: '#F2F4F8',    // Soft background
            tertiary: '#E8EDF5',     // Alternative background
          },
          text: {
            primary: '#0A2A66',      // Azul institucional principal (sin negro)
            secondary: '#4A5F8A',    // Azul grisáceo medio
            tertiary: '#7A8FB8',     // Azul grisáceo claro
          },
          border: {
            primary: '#D9DEE8',      // Main borders
            secondary: '#E8EDF5',    // Subtle borders
          }
        },

        // Dark Theme - Futuristic & Tech Authority
        dark: {
          bg: {
            primary: '#081C45',      // Main dark background
            secondary: '#0A2A66',    // Secondary dark background
            tertiary: '#0D3380',     // Alternative dark background
          },
          text: {
            primary: '#E5EAF3',      // Main text
            secondary: '#AAB4C8',    // Muted text
            tertiary: '#8B95A8',     // Light text
          },
          border: {
            primary: '#1E3A8A',      // Main borders
            secondary: '#1A3470',    // Subtle borders
          }
        },

        // Accent Colors - Adaptive per theme
        accent: {
          DEFAULT: '#1FB6A6',        // Default accent (light mode)
          light: '#4EE3D3',          // Light variant
          dark: '#0D9488',           // Dark variant
          hover: '#17A89A',          // Hover state
        },

        // Primary Action Colors
        primary: {
          DEFAULT: '#0A2A66',        // Light mode primary
          hover: '#082152',          // Hover state
          active: '#061838',         // Active state
          light: '#0D3380',          // Light variant
          dark: '#1FB6A6',           // Dark mode primary
        },

        // Semantic Colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'matrix-fall': 'matrixFall 20s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        matrixFall: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 188, 212, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 188, 212, 0.8)' },
        },
      },
      transitionDuration: {
        '300': '300ms',
      },
    },
  },
  plugins: [],
}

