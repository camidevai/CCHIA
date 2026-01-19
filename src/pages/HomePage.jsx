import { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy load components for better performance
const Hero = lazy(() => import('../components/Hero'));
const InfiniteCarousel = lazy(() => import('../components/InfiniteCarousel'));
const Mission = lazy(() => import('../components/Mission'));
const Benefits = lazy(() => import('../components/Benefits'));
const CallToAction = lazy(() => import('../components/CallToAction'));

const HomePage = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Hero />
      <Mission />
      <Benefits />
      <InfiniteCarousel />
      <CallToAction />
    </Suspense>
  );
};

export default HomePage;

