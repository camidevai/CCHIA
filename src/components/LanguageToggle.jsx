import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <motion.button
      onClick={toggleLanguage}
      className="relative flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-light-bg-secondary/80 dark:bg-dark-bg-secondary/80 backdrop-blur-sm rounded-lg border border-light-border-primary/40 dark:border-dark-border-primary/40 hover:border-secondary dark:hover:border-secondary-light transition-all duration-300 shadow-sm hover:shadow-md group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      {/* Icono de globo */}
      <svg
        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-light-text-tertiary dark:text-dark-text-tertiary group-hover:text-secondary transition-colors duration-300"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
          clipRule="evenodd"
        />
      </svg>

      {/* Texto del idioma actual */}
      <span className="text-xs sm:text-sm font-semibold text-light-text-primary dark:text-dark-text-primary group-hover:text-secondary transition-colors duration-300">
        {language === 'es' ? 'ES' : 'EN'}
      </span>

      {/* Indicador de cambio (punto pulsante) */}
      <motion.div
        className="w-1 h-1 rounded-full bg-secondary"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.button>
  );
};

export default LanguageToggle;

