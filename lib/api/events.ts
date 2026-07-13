import { supabase } from '../supabase';
import { type Event, type EventStatus } from '../types';

// ==========================================
// FRONTEND AUDIENCE FUNCTIONS
// ==========================================

export async function getLiveEvent(): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'live')
    .maybeSingle();

  if (error) console.error('Error fetching live event:', error.message);
  return data;
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'upcoming')
    .order('start_time', { ascending: true });

  if (error) console.error('Error fetching upcoming events:', error.message);
  return data || [];
}

export async function getReplayEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'ended')
    .order('start_time', { ascending: false });

  if (error) console.error('Error fetching replays:', error.message);
  return data || [];
}


// ==========================================
// ADMIN CMS FUNCTIONS
// ==========================================

export async function getAllEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: false });

  if (error) console.error('Error fetching all events:', error.message);
  return data || [];
}

export async function createEvent(input: Omit<Event, 'id'>): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .insert([input])
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error.message);
    return null;
  }
  return data;
}

export async function updateEvent(id: string, patch: Partial<Event>): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error.message);
    return null;
  }
  return data;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) console.error('Error deleting event:', error.message);
}

// GET A SINGLE EVENT BY ID
export async function getEvent(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching single event:', error.message);
    return null;
  }
  return data;
}