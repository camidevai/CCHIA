import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Paths to JSON files
const EVENTS_PATH = path.join(__dirname, '../src/data/events.json');
const EVENTS_EN_PATH = path.join(__dirname, '../src/data/en/events.json');
const ADMIN_PATH = path.join(__dirname, '../src/data/admin.json');

// Helper function to read JSON file
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

// Helper function to write JSON file
async function writeJSON(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

// ============================================
// EVENTS ENDPOINTS
// ============================================

// GET all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await readJSON(EVENTS_PATH);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error loading events' });
  }
});

// GET single event by ID
app.get('/api/events/:id', async (req, res) => {
  try {
    const events = await readJSON(EVENTS_PATH);
    const event = events.find(e => e.id === req.params.id);
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error loading event' });
  }
});

// POST create new event
app.post('/api/events', async (req, res) => {
  try {
    const events = await readJSON(EVENTS_PATH);
    const eventsEn = await readJSON(EVENTS_EN_PATH);
    
    const newEvent = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    events.push(newEvent);
    eventsEn.push(newEvent); // Same event for both languages initially

    const success = await writeJSON(EVENTS_PATH, events);
    await writeJSON(EVENTS_EN_PATH, eventsEn);

    if (success) {
      res.status(201).json(newEvent);
    } else {
      res.status(500).json({ error: 'Error creating event' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error creating event' });
  }
});

// PUT update event
app.put('/api/events/:id', async (req, res) => {
  try {
    const events = await readJSON(EVENTS_PATH);
    const eventsEn = await readJSON(EVENTS_EN_PATH);
    
    const index = events.findIndex(e => e.id === req.params.id);
    const indexEn = eventsEn.findIndex(e => e.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const updatedEvent = {
      ...events[index],
      ...req.body,
      id: req.params.id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };

    events[index] = updatedEvent;
    if (indexEn !== -1) {
      eventsEn[indexEn] = updatedEvent;
    }

    await writeJSON(EVENTS_PATH, events);
    await writeJSON(EVENTS_EN_PATH, eventsEn);

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: 'Error updating event' });
  }
});

// DELETE event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const events = await readJSON(EVENTS_PATH);
    const eventsEn = await readJSON(EVENTS_EN_PATH);
    
    const filteredEvents = events.filter(e => e.id !== req.params.id);
    const filteredEventsEn = eventsEn.filter(e => e.id !== req.params.id);

    if (filteredEvents.length === events.length) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await writeJSON(EVENTS_PATH, filteredEvents);
    await writeJSON(EVENTS_EN_PATH, filteredEventsEn);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting event' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Events API: http://localhost:${PORT}/api/events`);
});

