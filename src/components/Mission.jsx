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
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section id="vision" className="py-20 bg-light-bg-secondary dark:bg-dark-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative p-8 bg-light-bg-primary dark:bg-dark-bg-primary rounded-2xl shadow-lg border-2 border-light-border-primary dark:border-dark-border-primary hover:border-accent dark:hover:border-accent transition-all duration-300 overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-accent to-accent/50 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-5 rounded-xl bg-accent/10 text-4xl">
                  {objective.icon}
                </div>
                <h3 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4 group-hover:text-accent transition-colors duration-300">
                  {objective.title}
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                  {objective.description}
                </p>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Mission;
