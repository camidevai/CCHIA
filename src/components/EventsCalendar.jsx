import { motion } from 'framer-motion';
import { useEvents } from '../contexts/EventsContext';
import { useTranslation } from '../contexts/LanguageContext';

const EventsCalendar = () => {
  const { getUpcomingEvents, getDaysUntilEvent, formatEventDate } = useEvents();
  const { t } = useTranslation();
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

  if (upcomingEvents.length === 0) {
    return null; // Don't show section if no upcoming events
  }

  return (
    <section className="py-20 px-6 bg-light-bg-secondary dark:bg-dark-bg-secondary">
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

        {/* Events Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {upcomingEvents.map((event) => {
            const badge = getEventBadge(event.date);
            
            return (
              <motion.div
                key={event.id}
                variants={cardVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative bg-light-bg-primary dark:bg-dark-bg-primary rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-light-border-primary dark:border-dark-border-primary"
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
                <div className="p-6">
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
                  <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm leading-relaxed line-clamp-3">
                    {truncateText(event.description)}
                  </p>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-secondary rounded-2xl transition-all duration-300 pointer-events-none"></div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default EventsCalendar;

