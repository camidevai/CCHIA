import collaboratorsData from '../data/collaborators.json';

// Componente de Carrusel Infinito - Colaboradores
const InfiniteCarousel = () => {
  // Obtener datos desde JSON
  const { sectionTitle, sectionSubtitle, collaborators } = collaboratorsData;

  // Duplicar los colaboradores para el efecto infinito
  const duplicatedCollaborators = [...collaborators, ...collaborators];

  return (
    <section className="py-20 bg-gradient-to-b from-light-bg-primary via-light-bg-secondary to-light-bg-primary dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-primary overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Title */}
        <div className="text-center mb-12">
          <h3 className="text-3xl sm:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-3">
            {sectionTitle}
          </h3>
          <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary mt-2">
            {sectionSubtitle}
          </p>
          <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-4" />
        </div>

        {/* Gradient overlays para efecto fade en los bordes */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-light-bg-secondary dark:from-dark-bg-secondary to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-light-bg-secondary dark:from-dark-bg-secondary to-transparent z-10 pointer-events-none" />

        {/* Carrusel */}
        <div className="flex gap-8 animate-scroll-left">
          {duplicatedCollaborators.map((collaborator, index) => (
            <div
              key={`${collaborator.name}-${index}`}
              className="group relative px-12 py-10 bg-light-bg-primary dark:bg-dark-bg-primary rounded-2xl border-2 border-light-border-primary dark:border-dark-border-primary hover:border-accent whitespace-nowrap flex-shrink-0 shadow-lg hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300 hover:scale-105 overflow-hidden min-w-[280px]"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative flex flex-col items-center justify-center gap-4">
                {/* Logo Placeholder */}
                <div className="w-32 h-32 rounded-xl bg-light-bg-secondary dark:bg-dark-bg-secondary border-2 border-dashed border-light-border-primary dark:border-dark-border-primary flex items-center justify-center group-hover:border-accent transition-colors duration-300">
                  <svg className="w-16 h-16 text-light-text-tertiary dark:text-dark-text-tertiary opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* Status Badge */}
                <div className="px-4 py-2 bg-accent/10 border border-accent/30 rounded-full">
                  <span className="text-sm font-semibold text-accent">
                    {collaborator.status}
                  </span>
                </div>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfiniteCarousel;

