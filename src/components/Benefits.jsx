import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import benefitsData from '../data/benefits.json';
import { benefitIcons } from './BenefitIcons';

const Benefits = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Obtener datos desde JSON
  const { sectionTitle, sectionSubtitle, sectionDescription, benefits, additionalInfo } = benefitsData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section id="beneficios" className="py-20 bg-light-bg-primary dark:bg-dark-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
            {sectionTitle}
          </h2>
          <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto">
            {sectionSubtitle}
          </p>
          <p className="text-lg text-light-text-tertiary dark:text-dark-text-tertiary mt-4 max-w-4xl mx-auto">{sectionDescription}
            Sé parte del movimiento que está transformando Chile a través de la inteligencia artificial. Conecta con profesionales, empresas y organizaciones que comparten tu visión de un futuro impulsado por la IA responsable.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group p-8 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl shadow-lg border border-light-border-primary dark:border-dark-border-primary hover:shadow-2xl transition-all duration-300 hover:border-accent"
            >
              <div className="text-accent mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {benefitIcons[benefit.icon]}
              </div>
              <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-3">
                {benefit.title}
              </h3>
              <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary mb-6">
            Red de colaboración y networking • Acceso a eventos y recursos exclusivos • Visibilidad y crecimiento para tu organización
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Benefits;

