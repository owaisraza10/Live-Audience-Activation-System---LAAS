import { supabase } from '../supabase';
import { type BtsVideo } from '../types';

// GET ALL VIDEOS
export async function getAllBtsVideos(): Promise<BtsVideo[]> {
  const { data, error } = await supabase
    .from('bts_videos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching BTS videos:', error.message);
    return [];
  }
  return data || [];
}

// UPLOAD (CREATE) NEW VIDEO
export async function uploadBtsVideo(
  input: Omit<BtsVideo, 'id' | 'created_at'>
): Promise<BtsVideo | null> {
  // Notice we don't generate the ID or date anymore. Supabase does that automatically!
  const { data, error } = await supabase
    .from('bts_videos')
    .insert([input])
    .select()
    .single();

  if (error) {
    console.error('Error uploading BTS video:', error.message);
    return null;
  }
  return data;
}

// UPDATE EXISTING VIDEO
export async function updateBtsVideo(
  id: string,
  patch: Partial<Omit<BtsVideo, 'id' | 'created_at'>>
): Promise<BtsVideo | null> {
  const { data, error } = await supabase
    .from('bts_videos')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating BTS video:', error.message);
    return null;
  }
  return data;
}

// DELETE VIDEO
export async function deleteBtsVideo(id: string): Promise<void> {
  const { error } = await supabase
    .from('bts_videos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting BTS video:', error.message);
  }
}