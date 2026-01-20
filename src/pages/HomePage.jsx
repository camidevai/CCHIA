import { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy load components for better performance
const Hero = lazy(() => import('../components/Hero'));
const InfiniteCarousel = lazy(() => import('../components/InfiniteCarousel'));
const Mission = lazy(() => import('../components/Mission'));
const EventsCalendar = lazy(() => import('../components/EventsCalendar'));
const Benefits = lazy(() => import('../components/Benefits'));
const PartnersSection = lazy(() => import('../components/PartnersSection'));
const CallToAction = lazy(() => import('../components/CallToAction'));

const HomePage = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Hero />
      <Mission />
      <EventsCalendar />
      <Benefits />
      <PartnersSection />
      <InfiniteCarousel />
      <CallToAction />
    </Suspense>
  );
};

export default HomePage;

