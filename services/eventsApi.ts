import { Event } from '../types';

// ---------------------------------------------------------------------------
// MOCK DATA LAYER — reads/writes localStorage under the key below.
// Every exported function here maps 1:1 to a real endpoint from the spec.
// When the backend is ready, replace the body of each function with a
// `fetch(...)` call to the matching endpoint (noted in each comment) and
// leave every call site in the app untouched.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'laas_cms_events';

function readAll(): Event[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedIfEmpty();
  try {
    return JSON.parse(raw) as Event[];
  } catch {
    return [];
  }
}

function writeAll(events: Event[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  // Lets other tabs/pages (e.g. the public "Live Now" page) react immediately
  window.dispatchEvent(new Event('storage'));
}

function seedIfEmpty(): Event[] {
  const seed: Event[] = [
    {
      id: 'evt_001',
      title: 'Week 4: The Breaking Point',
      description: 'Audience decides the next challenge.',
      status: 'upcoming',
      start_time: new Date(Date.now() + 3600_000).toISOString(),
      end_time: null,
      stream_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      season_id: 'season_01',
      mission_id: null,
      thumbnail: '',
    },
  ];
  writeAll(seed);
  return seed;
}

function generateId(): string {
  return 'evt_' + Math.random().toString(36).slice(2, 9);
}

// GET /events/live
export async function getLiveEvent(): Promise<Event | null> {
  return readAll().find((e) => e.status === 'live') ?? null;
}

// GET /events/upcoming
export async function getUpcomingEvents(): Promise<Event[]> {
  return readAll().filter((e) => e.status === 'upcoming');
}

// GET /events/replay
export async function getReplayEvents(): Promise<Event[]> {
  return readAll().filter((e) => e.status === 'ended');
}

// GET /events (all — for the admin list view; not in spec but needed for CMS)
export async function getAllEvents(): Promise<Event[]> {
  return readAll();
}

// GET /events/{id}
export async function getEvent(id: string): Promise<Event | null> {
  return readAll().find((e) => e.id === id) ?? null;
}

// POST /events (Admin only)
export async function createEvent(input: Omit<Event, 'id'>): Promise<Event> {
  const events = readAll();
  const newEvent: Event = { ...input, id: generateId() };
  writeAll([...events, newEvent]);
  return newEvent;
}

// PATCH /events/{id}
export async function updateEvent(
  id: string,
  patch: Partial<Omit<Event, 'id'>>
): Promise<Event | null> {
  const events = readAll();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return null;

  // Enforce: only one event can be "live" at a time
  if (patch.status === 'live') {
    events.forEach((e, i) => {
      if (i !== idx && e.status === 'live') e.status = 'ended';
    });
  }

  events[idx] = { ...events[idx], ...patch };
  writeAll(events);
  return events[idx];
}

// DELETE /events/{id}
export async function deleteEvent(id: string): Promise<void> {
  writeAll(readAll().filter((e) => e.id !== id));
}