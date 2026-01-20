import { motion, AnimatePresence } from 'framer-motion';
import { useEvents } from '../contexts/EventsContext';

const EventsCalendar = () => {
  const { events, getDaysUntilEvent, formatEventDate, getUpcomingEvents } = useEvents();

  // Recalcular eventos próximos cada vez que cambie el array de eventos
  const upcomingEvents = getUpcomingEvents();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  // Get badge text based on days until event
  const getEventBadge = (eventDate) => {
    const days = getDaysUntilEvent(eventDate);
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    if (days <= 7) return `En ${days} días`;
    return null;
  };

  // Truncate description
  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <section id="eventos" className="py-20 px-6 bg-light-bg-secondary dark:bg-dark-bg-secondary">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
            Próximos Eventos
          </h2>
          <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
            Únete a nuestros eventos y forma parte de la comunidad de Inteligencia Artificial en Chile
          </p>
        </motion.div>

        {/* No Events Message */}
        {upcomingEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="inline-block p-8 bg-light-bg-primary dark:bg-dark-bg-primary rounded-2xl border-2 border-light-border-primary dark:border-dark-border-primary shadow-xl">
              <svg
                className="w-24 h-24 mx-auto mb-6 text-secondary dark:text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-3">
                No hay eventos próximos
              </h3>
              <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-md mx-auto">
                Estamos preparando nuevos eventos increíbles. ¡Mantente atento a nuestras redes sociales para las próximas novedades!
              </p>
            </div>
          </motion.div>
        ) : (
          /* Events Grid */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
          <AnimatePresence mode="popLayout">
            {upcomingEvents.map((event) => {
              const badge = getEventBadge(event.date);

              return (
                <motion.div
                  key={event.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                  layout
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group relative bg-light-bg-primary dark:bg-dark-bg-primary rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-light-border-primary dark:border-dark-border-primary flex flex-col"
                >
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.photo || '/imagenes/mascota/mascotaCentral.png'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Badge */}
                  {badge && (
                    <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                      {badge}
                    </div>
                  )}
                </div>

                {/* Event Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-secondary dark:text-secondary-light mb-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">{formatEventDate(event.date)}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-3 line-clamp-2">
                    {event.title}
                  </h3>

                  {/* Description */}
                  <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                    {truncateText(event.description)}
                  </p>

                  {/* Registration Button - Siempre al fondo */}
                  <a
                    href={event.registration_url || 'https://www.google.cl'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mt-auto"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span>Inscribirse</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-secondary rounded-2xl transition-all duration-300 pointer-events-none"></div>
              </motion.div>
            );
          })}
          </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default EventsCalendar;

