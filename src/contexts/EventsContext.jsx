import { createContext, useContext, useState, useEffect } from 'react';
import { eventsAPI } from '../config/supabase';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load events from Supabase on mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Load all events from Supabase
  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await eventsAPI.getAll();
      setEvents(data || []);
    } catch (err) {
      console.error('Error loading events:', err);
      setError(err.message);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new event (Supabase)
  const createEvent = async (eventData) => {
    try {
      const newEvent = await eventsAPI.create(eventData);
      setEvents((prevEvents) => [...prevEvents, newEvent]);
      return newEvent;
    } catch (err) {
      console.error('Error creating event:', err);
      throw err;
    }
  };

  // Update an existing event (Supabase)
  const updateEvent = async (id, updatedData) => {
    try {
      const updatedEvent = await eventsAPI.update(id, updatedData);
      setEvents((prevEvents) =>
        prevEvents.map((event) => (event.id === id ? updatedEvent : event))
      );
      return updatedEvent;
    } catch (err) {
      console.error('Error updating event:', err);
      throw err;
    }
  };

  // Delete an event (Supabase)
  const deleteEvent = async (id) => {
    try {
      await eventsAPI.delete(id);
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting event:', err);
      throw err;
    }
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
    isLoading,
    error,
    loadEvents,
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

