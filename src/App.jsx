import { lazy, Suspense } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load components for better performance
const Hero = lazy(() => import('./components/Hero'));
const InfiniteCarousel = lazy(() => import('./components/InfiniteCarousel'));
const Mission = lazy(() => import('./components/Mission'));
const Benefits = lazy(() => import('./components/Benefits'));
const CallToAction = lazy(() => import('./components/CallToAction'));
const Footer = lazy(() => import('./components/Footer'));

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary transition-colors duration-300">
        <Navbar />

        <Suspense fallback={<LoadingSpinner />}>
          {/* Main content with left padding for vertical navbar on desktop */}
          <main className="md:pl-[200px] transition-all duration-300">
            <Hero />
            <InfiniteCarousel />
            <Mission />
            <Benefits />
            <CallToAction />
          </main>

          <Footer />
        </Suspense>
      </div>
    </ThemeProvider>
  );
}

export default App;

