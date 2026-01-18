import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useTranslation } from '../hooks/useTranslation';

const Mission = () => {
  const { t } = useTranslation();
  const objectivesData = t('objectives');

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const sliderRef = useRef(null);

  // Obtener datos de objetivos desde JSON
  const { sectionTitle, sectionSubtitle, objectives } = objectivesData;

  // Configuración de React Slick
  const settings = {
    dots: true,
    infinite: true,
    speed: 600, // Más rápido (antes 800ms)
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 8000,
    fade: true,
    cssEase: 'cubic-bezier(0.43, 0.13, 0.23, 0.96)',
    pauseOnHover: true,
    arrows: false,
    dotsClass: 'slick-dots custom-dots',
  };



  return (
    <section id="vision" className="py-20 bg-light-bg-secondary dark:bg-dark-bg-secondary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
          <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-6" />
        </motion.div>

        {/* Carousel Container - React Slick */}
        <div className="relative bg-light-bg-primary dark:bg-dark-bg-primary rounded-3xl shadow-2xl p-8 lg:p-12 mission-slider">
          <Slider ref={sliderRef} {...settings}>
            {objectives.map((objective, index) => (
              <div key={index}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* Image Column - Página Izquierda */}
                  <div className="relative group">
                    <div
                      className="relative overflow-hidden rounded-2xl shadow-2xl"
                    >
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-accent/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                      {/* Image */}
                      <img
                        src={objective.image}
                        alt={objective.title}
                        className="w-full h-[400px] lg:h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />

                      {/* Border Glow */}
                      <div className="absolute inset-0 border-4 border-accent/0 group-hover:border-accent/50 rounded-2xl transition-all duration-500" />
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
                    <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
                  </div>

                  {/* Description Column - Página Derecha */}
                  <div className="relative">
                    {/* Slide Number */}
                    <div className="inline-block mb-4">
                      <span className="text-6xl font-bold text-accent/20">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6 leading-tight">
                      {objective.title}
                    </h3>

                    {/* Accent Line */}
                    <div className="w-20 h-1.5 bg-gradient-to-r from-accent to-accent/50 mb-6" />

                    {/* Description */}
                    <p className="text-lg sm:text-xl text-light-text-secondary dark:text-dark-text-secondary leading-relaxed mb-8">
                      {objective.description}
                    </p>

                    {/* Navigation Arrows */}
                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.1, x: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => sliderRef.current?.slickPrev()}
                        className="w-14 h-14 rounded-full bg-light-bg-primary dark:bg-dark-bg-primary border-2 border-accent hover:bg-accent hover:text-white transition-all duration-300 flex items-center justify-center shadow-lg group"
                        aria-label="Anterior"
                      >
                        <svg className="w-6 h-6 text-accent group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1, x: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => sliderRef.current?.slickNext()}
                        className="w-14 h-14 rounded-full bg-light-bg-primary dark:bg-dark-bg-primary border-2 border-accent hover:bg-accent hover:text-white transition-all duration-300 flex items-center justify-center shadow-lg group"
                        aria-label="Siguiente"
                      >
                        <svg className="w-6 h-6 text-accent group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default Mission;
