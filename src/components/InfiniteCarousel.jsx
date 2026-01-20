import { useTranslation } from '../hooks/useTranslation';
import { usePartners } from '../contexts/PartnersContext';

// Componente de Carrusel Infinito - Colaboradores
const InfiniteCarousel = () => {
  const { t } = useTranslation();
  const { partners, isLoading } = usePartners();

  // Obtener datos de traducción
  const collaboratorsData = t('collaborators');
  const { sectionTitle, sectionSubtitle } = collaboratorsData || {
    sectionTitle: 'Trabajamos con',
    sectionSubtitle: 'Nuestros colaboradores y aliados estratégicos'
  };

  // Duplicar los aliados SOLO 2 veces para el efecto infinito seamless
  // Esto es suficiente para que el loop sea imperceptible
  const duplicatedPartners = partners.length > 0 ? [...partners, ...partners] : [];

  // Mostrar la sección siempre, pero el carrusel solo si hay partners
  const hasPartners = !isLoading && partners.length > 0;

  return (
    <section className="py-20 bg-gradient-to-b from-light-bg-primary via-light-bg-secondary to-light-bg-primary dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-primary overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Title */}
        <div className="text-center mb-8 md:mb-12 px-4">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-3">
            {sectionTitle}
          </h3>
          <p className="text-base sm:text-lg text-light-text-secondary dark:text-dark-text-secondary mt-2">
            {sectionSubtitle}
          </p>
          <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-4" />
        </div>

        {/* Mostrar carrusel solo si hay partners */}
        {hasPartners ? (
          <>
            {/* Gradient overlays para efecto fade en los bordes */}
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-light-bg-secondary dark:from-dark-bg-secondary to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-light-bg-secondary dark:from-dark-bg-secondary to-transparent z-10 pointer-events-none" />

            {/* Carrusel */}
            <div className="flex gap-8 sm:gap-12 md:gap-16 animate-scroll-left">
              {duplicatedPartners.map((partner, index) => (
            <div
              key={`${partner.id}-${index}`}
              className="group relative px-6 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10 bg-light-bg-primary dark:bg-dark-bg-primary rounded-xl sm:rounded-2xl border-2 border-light-border-primary dark:border-dark-border-primary hover:border-secondary dark:hover:border-secondary-light whitespace-nowrap flex-shrink-0 shadow-lg hover:shadow-2xl hover:shadow-secondary/20 transition-all duration-300 hover:scale-105 overflow-hidden min-w-[200px] sm:min-w-[240px] md:min-w-[300px]"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative flex flex-col items-center justify-center gap-3 sm:gap-4">
                {/* Logo */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-lg sm:rounded-xl bg-white dark:bg-dark-bg-secondary p-3 sm:p-4 flex items-center justify-center border-2 border-light-border-primary dark:border-dark-border-primary group-hover:border-secondary dark:group-hover:border-secondary-light transition-all duration-300 shadow-md">
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
                <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-secondary/10 border border-secondary/30 rounded-full">
                  <span className="text-xs sm:text-sm font-semibold text-light-text-primary dark:text-dark-text-primary group-hover:text-secondary dark:group-hover:text-secondary-light transition-colors duration-300">
                    {partner.name}
                  </span>
                </div>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-secondary/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-lg">
              {isLoading ? 'Cargando aliados...' : 'Próximamente agregaremos nuestros aliados estratégicos'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default InfiniteCarousel;

