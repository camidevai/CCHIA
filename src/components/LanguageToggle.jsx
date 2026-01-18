import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="relative">
      {/* Contenedor con glassmorphism */}
      <motion.div
        className="relative flex items-center gap-1 p-1 rounded-full bg-gradient-to-r from-light-bg-secondary/80 to-light-bg-primary/80 dark:from-dark-bg-secondary/80 dark:to-dark-bg-primary/80 backdrop-blur-md border border-light-border-primary/30 dark:border-dark-border-primary/30 shadow-lg"
        whileHover={{ scale: 1.02 }}
        style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Botón ES */}
        <motion.button
          onClick={() => language !== 'es' && toggleLanguage()}
          className="relative z-10 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 overflow-hidden"
          whileHover={{ scale: language === 'es' ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Cambiar a Español"
        >
          {/* Background activo con gradiente */}
          {language === 'es' && (
            <motion.div
              layoutId="activeLanguage"
              className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary-light rounded-full"
              initial={false}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
              style={{
                boxShadow: '0 0 20px rgba(31, 182, 166, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              }}
            />
          )}

          {/* Glow effect en hover */}
          {language !== 'es' && (
            <motion.div
              className="absolute inset-0 bg-secondary/20 rounded-full opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}

          {/* Texto */}
          <span
            className={`relative z-10 transition-colors duration-300 ${
              language === 'es'
                ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-secondary dark:hover:text-secondary-light'
            }`}
          >
            ES
          </span>

          {/* Icono de bandera España */}
          <span className="ml-1 text-xs">🇪🇸</span>
        </motion.button>

        {/* Separador */}
        <div className="w-px h-6 bg-light-border-primary/30 dark:bg-dark-border-primary/30" />

        {/* Botón EN */}
        <motion.button
          onClick={() => language !== 'en' && toggleLanguage()}
          className="relative z-10 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 overflow-hidden"
          whileHover={{ scale: language === 'en' ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Switch to English"
        >
          {/* Background activo con gradiente */}
          {language === 'en' && (
            <motion.div
              layoutId="activeLanguage"
              className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary-light rounded-full"
              initial={false}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
              style={{
                boxShadow: '0 0 20px rgba(31, 182, 166, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              }}
            />
          )}

          {/* Glow effect en hover */}
          {language !== 'en' && (
            <motion.div
              className="absolute inset-0 bg-secondary/20 rounded-full opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}

          {/* Texto */}
          <span
            className={`relative z-10 transition-colors duration-300 ${
              language === 'en'
                ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-secondary dark:hover:text-secondary-light'
            }`}
          >
            EN
          </span>

          {/* Icono de bandera USA/UK */}
          <span className="ml-1 text-xs">🇺🇸</span>
        </motion.button>

        {/* Glow exterior en hover */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-0 pointer-events-none"
          whileHover={{ opacity: 1 }}
          style={{
            boxShadow: '0 0 30px rgba(31, 182, 166, 0.3)',
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {/* Icono de globo flotante (opcional) */}
      <motion.div
        className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-secondary to-secondary-light rounded-full flex items-center justify-center shadow-lg"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <svg
          className="w-2.5 h-2.5 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
            clipRule="evenodd"
          />
        </svg>
      </motion.div>
    </div>
  );
};

export default LanguageToggle;

