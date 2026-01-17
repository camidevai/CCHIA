import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Mission = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const objectives = [
    {
      icon: '🌐',
      title: 'Red de Aprendizaje Colectivo',
      description: 'Constituir una red amplia de miembros activos entre personas naturales, consultores, startups, investigadores, estudiantes, pymes, organismos públicos y empresas para intercambiar conocimiento en IA.',
    },
    {
      icon: '💻',
      title: 'Plataforma Digital',
      description: 'Desarrollar una plataforma de colaboración para miembros, que integre un directorio de talento, un mapa de necesidades sectoriales y un repositorio de recursos, con el objetivo de conectar el ecosistema de IA en Chile.',
    },
    {
      icon: '📚',
      title: 'Capacitación y Sensibilización',
      description: 'Implementar programas de capacitación y sensibilización que fomenten la comprensión de la IA ética e inclusiva entre diversos públicos, catalizando proyectos con impacto social.',
    },
    {
      icon: '🤝',
      title: 'Alianzas Estratégicas',
      description: 'Formalizar alianzas estratégicas con organizaciones de IA en Latinoamérica y desarrollar una Red Global de Talento Chileno en IA, fomentando la colaboración y el intercambio de conocimiento a escala regional.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
    <section id="vision" className="py-20 bg-light-bg-secondary dark:bg-dark-bg-secondary">
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
            Nuestros Objetivos
          </h2>
          <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto">
            Para Impulsar el Futuro de la Inteligencia Artificial en Chile
          </p>
          <p className="text-lg text-light-text-tertiary dark:text-dark-text-tertiary mt-4 max-w-4xl mx-auto">
            Trabajamos con una visión clara y objetivos ambiciosos para transformar el ecosistema de inteligencia artificial en Chile y posicionarnos como referente regional.
          </p>
        </motion.div>

        {/* Objectives Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {objectives.map((objective, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              className="p-8 bg-light-bg-primary dark:bg-dark-bg-primary rounded-xl shadow-lg border border-light-border-primary dark:border-dark-border-primary hover:shadow-2xl transition-all duration-300"
            >
              <div className="text-5xl mb-4">{objective.icon}</div>
              <h3 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                {objective.title}
              </h3>
              <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                {objective.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <h3 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
            Sobre Nosotros
          </h3>
          <h4 className="text-2xl font-semibold text-accent mb-6">
            Nuestra Misión
          </h4>
          <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary max-w-4xl mx-auto leading-relaxed">
            Articular, facilitar y fortalecer la colaboración entre consultores, startups, investigadores, organismos públicos y empresas de todos los tamaños para acelerar la adopción responsable y descentralizada de la IA en Chile. Funcionamos como un sistema operativo que conecta talento, capital, conocimiento e infraestructura desde cualquier rincón del país.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 px-8 py-4 bg-accent text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Sé protagonista
          </motion.button>
        </motion.div>

        {/* Call to Action Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-16 p-10 bg-gradient-to-r from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/10 rounded-2xl border border-accent/30"
        >
          <h3 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4 text-center">
            Conecta, colabora y lidera el futuro de la IA en Chile
          </h3>
          <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary text-center max-w-3xl mx-auto mb-6">
            Forma parte de la red que impulsa la inteligencia artificial en nuestro país. Comparte experiencias, accede a oportunidades únicas y haz crecer tu impacto junto a los líderes del ecosistema.
          </p>
          <div className="text-center">
            <span className="text-accent font-semibold">Súmate al ecosistema</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Mission;

