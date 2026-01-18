import { motion } from 'framer-motion';
import { useNavbar } from '../contexts/NavbarContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import footerData from '../data/footer.json';
import { socialIcons } from './SocialIcons';

const Footer = () => {
  const { isNavExpanded } = useNavbar();
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const paddingLeft = isMobile ? '0' : (isNavExpanded ? '200px' : '80px');

  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
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
    }
  };

  return (
    <footer
      className="bg-light-bg-secondary dark:bg-dark-bg-secondary border-t border-light-border-primary dark:border-dark-border-primary transition-all duration-300"
      style={{ paddingLeft }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={theme === 'dark' ? footerData.brand.logo.dark : footerData.brand.logo.light}
                alt={footerData.brand.logo.alt}
                className="h-12 w-auto transition-all duration-300"
              />
              <span className="text-2xl font-bold text-accent"></span>
            </div>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6 max-w-md">
              {footerData.brand.description}
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {footerData.socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-secondary dark:text-dark-text-secondary hover:text-accent transition-colors"
                  aria-label={social.name}
                >
                  {socialIcons[social.icon]}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerData.footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="text-light-text-secondary dark:text-dark-text-secondary hover:text-accent transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-light-border-primary dark:border-dark-border-primary">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
              {footerData.copyright.replace('{year}', currentYear)}
            </p>
            <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">
              Hecho con ❤️ en Chile
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

