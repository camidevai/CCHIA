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
      className="relative p-2 rounded-lg hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary transition-all duration-300 group"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Panel de Administración"
      title={isAuthenticated ? 'Panel de Administración' : 'Iniciar Sesión'}
    >
      {/* Icono de admin - Estilo CCHIA */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className="w-6 h-6"
      >
        <path
          fill="#1FB6A6"
          d="M24,4c-2.2,0-4,1.8-4,4s1.8,4,4,4s4-1.8,4-4S26.2,4,24,4z M24,16c-4.4,0-8,3.6-8,8v4h4v16h8V28h4v-4C32,19.6,28.4,16,24,16z"
        />
        <circle fill="#1FB6A6" cx="24" cy="8" r="3"/>
        <path
          fill="#1FB6A6"
          d="M20,24c-1.1,0-2,0.9-2,2v2h2v-2h8v2h2v-2c0-1.1-0.9-2-2-2H20z"
        />
      </svg>

      {/* Indicador de autenticación */}
      {isAuthenticated && (
        <motion.div
          className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500 border-2 border-light-bg-primary dark:border-dark-bg-primary"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
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

