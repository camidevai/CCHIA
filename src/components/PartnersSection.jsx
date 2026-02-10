import { motion } from 'framer-motion';
import { usePartners } from '../contexts/PartnersContext';
import { useTranslation } from '../hooks/useTranslation';

const PartnersSection = () => {
  const { partners, isLoading } = usePartners();
  const { t } = useTranslation();

  // Si no hay aliados, no mostrar la sección
  if (isLoading || partners.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-20 bg-gradient-to-b from-light-bg-secondary via-light-bg-primary to-light-bg-secondary dark:from-dark-bg-secondary dark:via-dark-bg-primary dark:to-dark-bg-secondary relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
            {t('collaborators.sectionTitle', 'Trabajamos con')}
          </h2>
          <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto">
            {t('collaborators.sectionSubtitle', 'Nuestros colaboradores y aliados estratégicos')}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Partners Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
        >
          {partners.map((partner) => (
            <motion.div
              key={partner.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative bg-light-bg-primary dark:bg-dark-bg-primary rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-light-border-primary dark:border-dark-border-primary hover:border-secondary dark:hover:border-secondary-light"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

              {/* Logo Container */}
              <div className="relative aspect-video flex items-center justify-center p-4">
                <img
                  src={partner.logo_url || '/imagenes/mascota/mascotaCentral.png'}
                  alt={partner.name}
                  className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    e.target.src = '/imagenes/mascota/mascotaCentral.png';
                  }}
                />
              </div>

              {/* Partner Name */}
              <div className="relative mt-4">
                <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary text-center line-clamp-2 group-hover:text-secondary dark:group-hover:text-secondary-light transition-colors duration-300">
                  {partner.name}
                </h3>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-secondary/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-full h-px bg-gradient-to-r from-transparent via-secondary to-transparent mt-16"
        />
      </div>
    </section>
  );
};

export default PartnersSection;

