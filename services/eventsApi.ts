import { supabase } from '../lib/supabase';
import { Event } from './types';

// GET /events/live
export async function getLiveEvent(): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'live')
    .single();
    
  if (error) return null;
  return data;
}

// GET /events/upcoming
export async function getUpcomingEvents(): Promise<Event[]> {
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'upcoming');
    
  return data || [];
}

// GET /events/replay
export async function getReplayEvents(): Promise<Event[]> {
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'ended');
    
  return data || [];
}

// GET /events (all)
export async function getAllEvents(): Promise<Event[]> {
  const { data } = await supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: false });
    
  return data || [];
}

// GET /events/{id}
export async function getEvent(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) return null;
  return data;
}

// POST /events
export async function createEvent(input: Omit<Event, 'id'>): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .insert([input])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// PATCH /events/{id}
export async function updateEvent(
  id: string,
  patch: Partial<Omit<Event, 'id'>>
): Promise<Event | null> {
  
  // Logic: Ensure only one event is 'live' at a time
  if (patch.status === 'live') {
    await supabase
      .from('events')
      .update({ status: 'ended' })
      .neq('id', id);
  }

  const { data, error } = await supabase
    .from('events')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// DELETE /events/{id}
export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}