import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <motion.button
      onClick={toggleLanguage}
      className="relative p-2 rounded-lg hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary transition-all duration-300 group"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      title={language === 'es' ? 'Cambiar a Inglés' : 'Switch to Spanish'}
    >
      {/* Icono de idioma - Estilo CCHIA */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className="w-6 h-6"
      >
        <circle fill="#1FB6A6" cx="24" cy="24" r="20"/>
        <path
          fill="#fff"
          d="M24,6c-9.9,0-18,8.1-18,18s8.1,18,18,18s18-8.1,18-18S33.9,6,24,6z M24,38c-2.2,0-4.3-0.4-6.2-1.2 c0.8-1.5,2.5-2.5,4.4-2.5h3.6c1.9,0,3.6,1,4.4,2.5C28.3,37.6,26.2,38,24,38z M33.5,35.2c-1.3-2.3-3.8-3.9-6.7-3.9h-3.6 c-2.9,0-5.4,1.6-6.7,3.9c-3.1-2.5-5.1-6.3-5.1-10.6c0-1.5,0.2-2.9,0.6-4.3h4.5c0.6,0,1-0.4,1-1s-0.4-1-1-1h-3.9 c0.9-2.1,2.3-3.9,4.1-5.3c0.4,0.8,1.2,1.3,2.1,1.3h2c0.6,0,1-0.4,1-1s-0.4-1-1-1h-2c-0.3,0-0.5-0.1-0.7-0.2 c1.7-0.9,3.6-1.4,5.6-1.4c2,0,3.9,0.5,5.6,1.4c-0.2,0.1-0.4,0.2-0.7,0.2h-2c-0.6,0-1,0.4-1,1s0.4,1,1,1h2c0.9,0,1.7-0.5,2.1-1.3 c1.8,1.4,3.2,3.2,4.1,5.3h-3.9c-0.6,0-1,0.4-1,1s0.4,1,1,1h4.5c0.4,1.4,0.6,2.8,0.6,4.3C38.6,28.9,36.6,32.7,33.5,35.2z"
        />
        <text
          x="24"
          y="28"
          fontSize="12"
          fontWeight="bold"
          fill="#1FB6A6"
          textAnchor="middle"
        >
          {language === 'es' ? 'ES' : 'EN'}
        </text>
      </svg>

      {/* Indicador de idioma activo */}
      <motion.div
        className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-secondary"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6],
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

