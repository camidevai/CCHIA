import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import MatrixBackground from './MatrixBackground';

const Hero = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: 'easeOut',
      },
    },
  };

  const handleScrollToContact = () => {
    const element = document.querySelector('#contacto');
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollToVision = () => {
    const element = document.querySelector('#vision');
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Matrix Background - Visible in both light and dark modes */}
      <MatrixBackground />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-light-bg-primary/50 to-light-bg-primary dark:via-dark-bg-primary/50 dark:to-dark-bg-primary z-10" />

      {/* Content */}
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4">
            <span className="block text-light-text-primary dark:text-dark-text-primary">
              Cámara Chilena de
            </span>
            <span className="block text-accent glow-text mt-2">
              Inteligencia Artificial
            </span>
          </h1>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-xl sm:text-2xl lg:text-3xl text-light-text-secondary dark:text-dark-text-secondary mb-6 max-w-4xl mx-auto"
        >
          Impulsando la Inteligencia Artificial en Chile.
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-light-text-tertiary dark:text-dark-text-tertiary mb-12 max-w-3xl mx-auto"
        >
          Únete a la organización líder en IA de Chile. Conecta, innova y transforma el futuro con nosotros.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleScrollToContact}
            className="px-8 py-4 bg-accent text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 dark:shadow-accent/50"
          >
            ¡Contáctanos hoy!
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleScrollToVision}
            className="px-8 py-4 bg-transparent border-2 border-accent text-accent rounded-lg font-semibold text-lg hover:bg-accent hover:text-white transition-all duration-300"
          >
            Conoce Más
          </motion.button>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          variants={itemVariants}
          className="mt-16 flex flex-wrap justify-center gap-4"
        >
          {['Acceso a eventos exclusivos', 'Networking con expertos', 'Recursos y capacitaciones'].map((feature) => (
            <div
              key={feature}
              className="px-6 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-full text-sm font-medium border border-light-border-primary dark:border-dark-border-primary"
            >
              {feature}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;

