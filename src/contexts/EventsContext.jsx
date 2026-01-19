import { createContext, useContext, useState, useEffect } from 'react';
import initialEventsData from '../data/events.json';

const EventsContext = createContext();

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};

export const EventsProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load events from localStorage or initial JSON on mount
  useEffect(() => {
    const storedEvents = localStorage.getItem('cchia_events');
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents);
        setEvents(parsedEvents);
      } catch (error) {
        console.error('Error loading events from localStorage:', error);
        // If localStorage fails, load from JSON
        setEvents(initialEventsData);
      }
    } else {
      // If no localStorage data, load initial events from JSON
      setEvents(initialEventsData);
    }
    setIsLoaded(true);
  }, []);

  // Save events to localStorage whenever they change (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cchia_events', JSON.stringify(events));
    }
  }, [events, isLoaded]);

  // Create a new event
  const createEvent = (eventData) => {
    const newEvent = {
      id: Date.now().toString(),
      ...eventData,
      createdAt: new Date().toISOString(),
    };
    setEvents((prevEvents) => [...prevEvents, newEvent]);
    return newEvent;
  };

  // Update an existing event
  const updateEvent = (id, updatedData) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === id
          ? { ...event, ...updatedData, updatedAt: new Date().toISOString() }
          : event
      )
    );
  };

  // Delete an event
  const deleteEvent = (id) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
  };

  // Get all events
  const getAllEvents = () => {
    return events;
  };

  // Get upcoming events (future events only, sorted by date)
  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter((event) => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Get event by ID
  const getEventById = (id) => {
    return events.find((event) => event.id === id);
  };

  // Get days until event
  const getDaysUntilEvent = (eventDate) => {
    const now = new Date();
    const eventDateTime = new Date(eventDate);
    const diffTime = eventDateTime - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format event date
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-CL', options);
  };

  const value = {
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    getAllEvents,
    getUpcomingEvents,
    getEventById,
    getDaysUntilEvent,
    formatEventDate,
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
};

