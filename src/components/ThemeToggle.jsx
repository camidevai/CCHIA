import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

const ThemeToggle = ({ inline = false }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className={inline ? "relative" : "fixed bottom-8 right-8 z-50 md:hidden"}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg shadow-lg whitespace-nowrap text-sm"
        >
          {isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        </motion.div>
      )}

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        className={`relative ${inline ? 'w-12 h-12' : 'w-14 h-14'} rounded-full bg-accent shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center group`}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        aria-live="polite"
      >
        {/* Glow effect for dark mode */}
        {isDark && (
          <div className="absolute inset-0 rounded-full bg-accent opacity-50 blur-xl animate-glow-pulse" />
        )}

        {/* Icon Container */}
        <div className="relative w-6 h-6">
          {/* Sun Icon */}
          <motion.svg
            initial={false}
            animate={{
              scale: isDark ? 0 : 1,
              rotate: isDark ? 180 : 0,
              opacity: isDark ? 0 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </motion.svg>

          {/* Moon Icon */}
          <motion.svg
            initial={false}
            animate={{
              scale: isDark ? 1 : 0,
              rotate: isDark ? 0 : -180,
              opacity: isDark ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </motion.svg>
        </div>
      </motion.button>
    </motion.div>
  );
};

export default ThemeToggle;

