import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminButton = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleClick = () => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    } else {
      navigate('/admin/login');
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className="relative flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-light-bg-secondary/80 dark:bg-dark-bg-secondary/80 backdrop-blur-sm rounded-lg border border-light-border-primary/40 dark:border-dark-border-primary/40 hover:border-secondary dark:hover:border-secondary-light transition-all duration-300 shadow-sm hover:shadow-md group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Panel de Administración"
      title={isAuthenticated ? 'Panel de Administración' : 'Iniciar Sesión'}
    >
      {/* Icono de admin */}
      <svg 
        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-light-text-tertiary dark:text-dark-text-tertiary group-hover:text-secondary transition-colors duration-300" 
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>

      {/* Texto */}
      <span className="text-xs sm:text-sm font-semibold text-light-text-primary dark:text-dark-text-primary group-hover:text-secondary transition-colors duration-300">
        Admin
      </span>

      {/* Indicador de autenticación */}
      {isAuthenticated && (
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-green-500"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  );
};

export default AdminButton;

