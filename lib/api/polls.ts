import { supabase } from '../supabase';
import type { Poll, PollOption, PollResults, Vote } from '../types';

// ==========================================
// 1. GET ACTIVE POLL
// ==========================================
export async function getActivePoll(eventId: string): Promise<Poll | null> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('polls')
    .select('*, options:poll_options(*)')
    .eq('event_id', eventId)
    .lte('start_time', now)
    .gte('end_time', now)
    .maybeSingle();

  if (error) console.error('Error fetching active poll:', error.message);
  return data;
}

// ==========================================
// 2. GET ALL POLLS FOR AN EVENT
// ==========================================
export async function getPollsForEvent(eventId: string): Promise<Poll[]> {
  const { data, error } = await supabase
    .from('polls')
    .select('*, options:poll_options(*)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching polls:', error.message);
    return [];
  }
  return data || [];
}

// ==========================================
// 3. CREATE A POLL
// ==========================================
export async function createPoll(input: {
  event_id: string;
  question: string;
  options: string[];
  type: Poll['type'];
  start_time: string;
  end_time: string;
  show_results: boolean;
}): Promise<Poll> {
  
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert([{
      event_id: input.event_id,
      question: input.question,
      type: input.type,
      start_time: input.start_time,
      end_time: input.end_time,
      show_results: input.show_results
    }])
    .select()
    .single();

  if (pollError || !poll) {
    throw new Error(`Error creating poll: ${pollError?.message}`);
  }

  const optionInserts = input.options.map(text => ({
    poll_id: poll.id,
    text: text
  }));

  const { data: pollOptions, error: optionsError } = await supabase
    .from('poll_options')
    .insert(optionInserts)
    .select();

  if (optionsError) {
    console.error('Error creating poll options:', optionsError.message);
  }

  return { ...poll, options: pollOptions || [] } as Poll;
}

// ==========================================
// 4. SUBMIT VOTE (Auto-syncs user to prevent FK errors)
// ==========================================
export async function submitVote(
  pollId: string,
  optionId: string,
  userId: string
): Promise<Vote> {
  // 🔥 Auto-ensure user exists in Supabase to prevent foreign key constraint crashes
  await supabase
    .from('users')
    .upsert(
      { id: userId, email: `${userId.slice(0, 8)}@laas.local`, name: 'Viewer' },
      { onConflict: 'id', ignoreDuplicates: true }
    );

  const { data, error } = await supabase
    .from('votes')
    .insert([{
      poll_id: pollId,
      option_id: optionId,
      user_id: userId,
      weight: 1
    }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('User has already voted in this poll');
    }
    throw new Error(`Error submitting vote: ${error.message}`);
  }
  
  return data as Vote;
}

// ==========================================
// 5. GET POLL RESULTS
// ==========================================
export async function getPollResults(pollId: string): Promise<PollResults | null> {
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('*, options:poll_options(*)')
    .eq('id', pollId)
    .maybeSingle();

  if (pollError || !poll) return null;

  const { data: votes, error: votesError } = await supabase
    .from('votes')
    .select('*')
    .eq('poll_id', pollId);

  const safeVotes = votes || [];
  const totalWeighted = safeVotes.reduce((sum, v) => sum + (v.weight || 1), 0) || 1;

  const mappedOptions = (poll.options || []).map((opt: PollOption) => {
    const optionVotes = safeVotes.filter(v => v.option_id === opt.id);
    const weightedCount = optionVotes.reduce((sum, v) => sum + (v.weight || 1), 0);
    
    return {
      option_id: opt.id,
      text: opt.text,
      vote_count: optionVotes.length,
      weighted_count: weightedCount,
      percentage: Math.round((weightedCount / totalWeighted) * 100),
    };
  });

  return { 
    poll_id: pollId, 
    total_votes: safeVotes.length, 
    options: mappedOptions 
  };
}

// ==========================================
// 6. UPDATE POLL METADATA
// ==========================================
export async function updatePoll(
  id: string, 
  patch: Partial<{ question: string; type: 'poll' | 'decision' }>
): Promise<void> {
  const { error } = await supabase
    .from('polls')
    .update(patch)
    .eq('id', id);

  if (error) console.error('Error updating poll:', error.message);
}

// ==========================================
// 7. DELETE POLL
// ==========================================
export async function deletePoll(id: string): Promise<void> {
  const { error } = await supabase
    .from('polls')
    .delete()
    .eq('id', id);

  if (error) console.error('Error deleting poll:', error.message);
}