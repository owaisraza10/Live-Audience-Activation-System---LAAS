import { supabase } from '../supabase';

// ==========================================
// GET CURRENT SEASON 
// Spec: GET /seasons/current[cite: 1]
// ==========================================
export async function getCurrentSeason() {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle(); // Gets the most recently created season

  if (error) {
    console.error('Error fetching current season:', error.message);
    return null;
  }
  return data;
}

// ==========================================
// GET MISSIONS FOR A SEASON
// Spec: GET /seasons/{id}/missions[cite: 1]
// ==========================================
export async function getSeasonMissions(seasonId: string) {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('season_id', seasonId)
    .order('week', { ascending: true });

  if (error) {
    console.error('Error fetching season missions:', error.message);
    return [];
  }
  return data;
}

// ==========================================
// GET SPECIFIC MISSION DETAILS
// Spec: GET /missions/{id}[cite: 1]
// ==========================================
export async function getMission(missionId: string) {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('id', missionId)
    .single();

  if (error) {
    console.error('Error fetching mission details:', error.message);
    return null;
  }
  return data;
}

// ==========================================
// ADMIN: GET ALL SEASONS
// ==========================================
export async function getAllSeasons() {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching seasons:', error.message);
  return data || [];
}

// ==========================================
// ADMIN: CREATE/UPDATE SEASON
// ==========================================
export async function saveSeason(seasonData: any, seasonId?: string) {
  if (seasonId) {
    const { error } = await supabase.from('seasons').update(seasonData).eq('id', seasonId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('seasons').insert(seasonData);
    if (error) throw error;
  }
}

// ==========================================
// ADMIN: CREATE/UPDATE MISSION
// ==========================================
export async function saveMission(missionData: any, missionId?: string) {
  if (missionId) {
    const { error } = await supabase.from('missions').update(missionData).eq('id', missionId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('missions').insert(missionData);
    if (error) throw error;
  }
}

export async function deleteMission(missionId: string) {
  const { error } = await supabase.from('missions').delete().eq('id', missionId);
  if (error) throw error;
}