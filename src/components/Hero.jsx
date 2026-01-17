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

  const mascotVariants = {
    hidden: { x: 100, opacity: 0, rotate: -10 },
    visible: {
      x: 0,
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 1,
        ease: 'easeOut',
      },
    },
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

      {/* Content Container - Two Column Layout */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column - Text Content */}
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="text-center lg:text-left"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4">
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
              className="text-xl sm:text-2xl lg:text-3xl text-light-text-secondary dark:text-dark-text-secondary mb-6"
            >
              Impulsando la Inteligencia Artificial en Chile.
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-light-text-tertiary dark:text-dark-text-tertiary mb-8"
            >
              Únete a la organización líder en IA de Chile. Conecta, innova y transforma el futuro con nosotros.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleScrollToContact}
                className="w-full sm:w-auto px-8 py-4 bg-accent text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 dark:shadow-accent/50"
              >
                ¡Contáctanos hoy!
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleScrollToVision}
                className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-accent text-accent rounded-lg font-semibold text-lg hover:bg-accent hover:text-white transition-all duration-300"
              >
                Conoce Más
              </motion.button>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              variants={itemVariants}
              className="mt-12 flex flex-wrap justify-center lg:justify-start gap-3"
            >
              {['Eventos exclusivos', 'Networking', 'Capacitaciones'].map((feature) => (
                <div
                  key={feature}
                  className="px-5 py-2 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-full text-sm font-medium border border-light-border-primary dark:border-dark-border-primary"
                >
                  {feature}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Mascot Image */}
          <motion.div
            variants={mascotVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="relative flex items-center justify-center lg:justify-end min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]"
          >
            {/* Glow effect behind mascot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-80 h-80 sm:w-[28rem] sm:h-[28rem] lg:w-[36rem] lg:h-[36rem] bg-accent/20 dark:bg-accent/30 rounded-full blur-3xl animate-pulse" />
            </div>

            {/* Mascot Image with floating animation */}
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative z-10"
            >
              <motion.img
                src="/imagenes/mascota/mascotaDeLado.png"
                alt="CCHIA Mascot"
                className="w-80 h-80 sm:w-[28rem] sm:h-[28rem] lg:w-[36rem] lg:h-[36rem] xl:w-[42rem] xl:h-[42rem] object-contain drop-shadow-2xl"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-10 right-10 w-24 h-24 border-4 border-accent/30 rounded-full"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              className="absolute bottom-20 left-10 w-20 h-20 border-4 border-accent/20 rounded-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

