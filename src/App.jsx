import { lazy, Suspense, useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavbarProvider, useNavbar } from './contexts/NavbarContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load components for better performance
const Hero = lazy(() => import('./components/Hero'));
const InfiniteCarousel = lazy(() => import('./components/InfiniteCarousel'));
const Mission = lazy(() => import('./components/Mission'));
const Benefits = lazy(() => import('./components/Benefits'));
const CallToAction = lazy(() => import('./components/CallToAction'));
const Footer = lazy(() => import('./components/Footer'));

const AppContent = () => {
  const { isNavExpanded } = useNavbar();
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

  return (
    <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary transition-colors duration-300">
      <Navbar />

      <Suspense fallback={<LoadingSpinner />}>
        {/* Main content with dynamic left padding for vertical navbar on desktop */}
        <main
          className="transition-all duration-300"
          style={{ paddingLeft }}
        >
          <Hero />
          <Mission />
          <Benefits />
          <InfiniteCarousel />
          <CallToAction />
        </main>

        <Footer />
      </Suspense>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <NavbarProvider>
        <AppContent />
      </NavbarProvider>
    </ThemeProvider>
  );
}

export default App;

