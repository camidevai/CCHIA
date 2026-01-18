import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useNavbar } from '../contexts/NavbarContext';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { useTranslation } from '../hooks/useTranslation';

// Icon Components - Material Design Style with CCHIA Teal (#1FB6A6)
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
    <path fill="#1FB6A6" d="M24,4L6,18v24h12V28h12v14h12V18L24,4z"/>
  </svg>
);

const VisionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
    <path fill="#1FB6A6" d="M24,8C12,8,2,18,2,24s10,16,22,16s22-10,22-16S36,8,24,8z M24,34c-5.5,0-10-4.5-10-10s4.5-10,10-10s10,4.5,10,10S29.5,34,24,34z"/>
    <circle fill="#1FB6A6" cx="24" cy="24" r="6"/>
  </svg>
);

const BenefitsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
    <path fill="#1FB6A6" d="M24,4l-6,6l-8-2l2,8l-6,6l6,6l-2,8l8-2l6,6l6-6l8,2l-2-8l6-6l-6-6l2-8l-8,2L24,4z"/>
    <circle fill="#fff" cx="24" cy="24" r="6"/>
  </svg>
);

const JoinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
    <circle fill="#1FB6A6" cx="18" cy="16" r="8"/>
    <circle fill="#1FB6A6" cx="30" cy="16" r="8"/>
    <path fill="#1FB6A6" d="M18,26c-6.6,0-12,5.4-12,12v6h24v-6C30,31.4,24.6,26,18,26z"/>
    <path fill="#1FB6A6" d="M30,26c-1.4,0-2.7,0.2-4,0.6c3.4,2.3,5.6,6.2,5.6,10.6V44h16v-6C47.6,31.4,36.6,26,30,26z"/>
  </svg>
);

const ContactIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
    <path fill="#1FB6A6" d="M40,8H8C5.8,8,4,9.8,4,12v24c0,2.2,1.8,4,4,4h32c2.2,0,4-1.8,4-4V12C44,9.8,42.2,8,40,8z"/>
    <path fill="#fff" d="M24,26L8,16h32L24,26z"/>
    <path fill="#fff" d="M24,30l-16-10v16h32V20L24,30z"/>
  </svg>
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isNavExpanded, toggleNav } = useNavbar();
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Obtener datos de navegación según idioma
  const { t } = useTranslation();
  const navigationData = t('navigation');
  const siteData = t('site');
  const { navLinks } = navigationData;

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    const element = document.querySelector(href);
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

  return (
    <>
      {/* Vertical Navbar - Left Side */}
      <motion.nav
        initial={{ x: -100 }}
        animate={{
          x: 0,
          width: isNavExpanded ? '200px' : '80px'
        }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 h-screen z-50 transition-all duration-300 hidden md:flex flex-col ${
          isScrolled
            ? 'bg-light-bg-primary/95 dark:bg-dark-bg-primary/95 backdrop-blur-md shadow-2xl'
            : 'bg-light-bg-primary/80 dark:bg-dark-bg-primary/80 backdrop-blur-sm'
        } border-r-2 border-light-border-primary dark:border-dark-border-primary`}
      >
        <div className="flex flex-col h-full py-8 px-4 relative">
          {/* Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleNav}
            className="absolute -right-4 top-8 w-8 h-8 rounded-full bg-accent shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow z-10"
            aria-label={isNavExpanded ? 'Colapsar menú' : 'Expandir menú'}
          >
            <motion.svg
              animate={{ rotate: isNavExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </motion.svg>
          </motion.button>

          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex items-center justify-center mb-8"
          >
            <img
              src={theme === 'dark' ? siteData.logo.dark : siteData.logo.light}
              alt={siteData.siteName}
              className={`object-contain transition-all duration-300 ${isNavExpanded ? 'h-24 w-24' : 'h-12 w-12'}`}
            />
          </motion.div>

          {/* Desktop Navigation - Vertical */}
          <div className={`flex flex-col space-y-3 ${isNavExpanded ? 'items-stretch' : 'items-center'}`}>
            {navLinks.map((link, index) => {
              const icons = [
                <HomeIcon key="home" />,
                <VisionIcon key="vision" />,
                <BenefitsIcon key="benefits" />,
                <JoinIcon key="join" />,
                <ContactIcon key="contact" />
              ];
              return (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="group relative"
                >
                  {/* Menu Item */}
                  <div className="relative px-4 py-3 rounded-xl bg-gradient-to-r from-light-bg-secondary to-light-bg-primary dark:from-dark-bg-secondary dark:to-dark-bg-primary border-2 border-light-border-primary dark:border-dark-border-primary group-hover:border-accent group-hover:shadow-lg group-hover:shadow-accent/20 flex items-center gap-3 transition-all duration-300 overflow-hidden">
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Icon with glow effect */}
                    <div className="flex-shrink-0 relative z-10 filter drop-shadow-[0_0_10px_rgba(0,188,212,0.5)] dark:drop-shadow-[0_0_20px_rgba(0,188,212,0.8)] group-hover:drop-shadow-[0_0_15px_rgba(0,188,212,0.9)] transition-all duration-300">
                      {icons[index]}
                    </div>

                    {/* Text */}
                    {isNavExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary group-hover:text-accent leading-tight relative z-10 transition-colors duration-300"
                      >
                        {link.name}
                      </motion.span>
                    )}

                    {/* Accent bar on left */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                  </div>

                  {/* Tooltip when collapsed */}
                  {!isNavExpanded && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-light-bg-primary dark:bg-dark-bg-primary border-2 border-accent rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 whitespace-nowrap shadow-lg z-50">
                      <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                        {link.name}
                      </span>
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-accent" />
                    </div>
                  )}
                </motion.a>
              );
            })}
          </div>

          {/* Spacer to push toggles to bottom */}
          <div className="flex-1"></div>

          {/* Theme and Language Toggles at Bottom */}
          <div className="mt-auto flex flex-col gap-3 items-center">
            <LanguageToggle />
            <ThemeToggle inline={true} />
          </div>
        </div>
      </motion.nav>

      {/* Mobile Top Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 md:hidden ${
          isScrolled
            ? 'bg-light-bg-primary/95 dark:bg-dark-bg-primary/95 backdrop-blur-md shadow-lg'
            : 'bg-light-bg-primary/80 dark:bg-dark-bg-primary/80 backdrop-blur-sm'
        }`}
      >
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <img
                src={theme === 'dark' ? siteData.logo.dark : siteData.logo.light}
                alt={siteData.siteName}
                className="h-12 w-auto transition-all duration-300"
              />
            </motion.div>

            {/* Right side: Language Toggle, Theme Toggle, and Mobile Menu Button */}
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle inline={true} />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors text-light-text-primary dark:text-dark-text-primary"
                aria-label="Toggle menu"
              >
                <div className="w-6 h-5 flex flex-col justify-between">
                  <span className={`block h-0.5 w-full bg-current transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`block h-0.5 w-full bg-current transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                  <span className={`block h-0.5 w-full bg-current transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-light-bg-primary dark:bg-dark-bg-primary border-t border-light-border-primary dark:border-dark-border-primary"
            >
              <div className="px-4 py-4 space-y-3">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="block py-2 text-light-text-primary dark:text-dark-text-primary hover:text-accent transition-colors"
                  >
                    {link.name}
                  </a>
                ))}

                {/* Theme Toggle in Mobile Menu */}
                <div className="pt-4 border-t border-light-border-primary dark:border-dark-border-primary flex justify-center">
                  <ThemeToggle inline={true} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;

