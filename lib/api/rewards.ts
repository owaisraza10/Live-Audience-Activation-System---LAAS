import { supabase } from '../supabase';

// ==========================================
// GET USER'S TOTAL POINTS & PROFILE
// ==========================================
export async function getUserPoints(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('points, tier, role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching points:', error.message);
    return { points: 0, tier: 'free' };
  }
  return data;
}

// ==========================================
// GET USER'S UNLOCKED BADGES
// ==========================================
export async function getUserBadges(userId: string) {
  // We use Supabase relational joins to get the badge details alongside the unlock record
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      earned_at,
      badge:badges (
        id,
        name,
        description,
        image_url
      )
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching badges:', error.message);
    return [];
  }
  
  // Flatten the response slightly for easier frontend use
  return data.map(record => ({
    ...record.badge,
    earned_at: record.earned_at
  }));
}

// ==========================================
// GET GLOBAL LEADERBOARD (Top 100 Fans)
// ==========================================
export async function getLeaderboard(limit: number = 100) {
  const { data, error } = await supabase
    .from('users')
    .select('email, points, tier')
    .order('points', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error.message);
    return [];
  }
  
  // Mask emails for privacy on the public leaderboard (e.g., j***@gmail.com)
  return data.map(user => {
    const [name, domain] = user.email.split('@');
    const maskedEmail = `${name.charAt(0)}***@${domain}`;
    return {
      ...user,
      displayName: maskedEmail
    };
  });
}

// ==========================================
// GET MONTHLY REWARDS (CMS)
// ==========================================
export async function getMonthlyRewards() {
  const { data, error } = await supabase
    .from('monthly_rewards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching monthly rewards:', error.message);
    return [];
  }
  return data;
}

// ==========================================
// LOG DAILY LOGIN (+2 Points)
// ==========================================
export async function recordDailyLogin(userId: string) {
  // We quietly attempt an insert. If the unique constraint fails (they already logged in today), 
  // Supabase safely ignores it and no extra points are awarded.
  const { error } = await supabase.from('daily_logins').insert({ user_id: userId });
  if (!error) console.log('+2 Points: Daily Login Awarded!');
}

// ==========================================
// LOG EVENT ATTENDANCE (+10 Points)
// ==========================================
export async function recordEventAttendance(userId: string, eventId: string) {
  const { error } = await supabase.from('user_event_attendance').insert({ 
    user_id: userId, 
    event_id: eventId 
  });
  if (!error) console.log('+10 Points: Event Attendance Awarded!');
}

// ==========================================
// LOG MISSION COMPLETION (+20 Points)
// ==========================================
export async function recordMissionCompletion(userId: string, missionId: string) {
  const { error } = await supabase.from('user_missions').insert({ 
    user_id: userId, 
    mission_id: missionId 
  });
  if (!error) console.log('+20 Points: Mission Completed!');
}