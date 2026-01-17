import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary">
      <motion.div
        className="relative w-20 h-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 border-4 border-accent/30 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-accent rounded-full" />
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;

