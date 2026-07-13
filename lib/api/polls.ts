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
  
  // Step A: Insert the Poll
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

  // Step B: Insert the Options linked to that Poll
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
// 4. SUBMIT VOTE
// ==========================================
export async function submitVote(
  pollId: string,
  optionId: string,
  userId: string,
  userTier: 'free' | 'standard' | 'premium'
): Promise<Vote> {
  const weight = userTier === 'premium' ? 2 : 1;

  const { data, error } = await supabase
    .from('votes')
    .insert([{
      poll_id: pollId,
      option_id: optionId,
      user_id: userId,
      weight: weight
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
// 5. GET POLL RESULTS (MATH & AGGREGATION)
// ==========================================
export async function getPollResults(pollId: string): Promise<PollResults | null> {
  // Fetch Poll with options
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('*, options:poll_options(*)')
    .eq('id', pollId)
    .maybeSingle();

  if (pollError || !poll) return null;

  // Fetch all votes for this poll
  const { data: votes, error: votesError } = await supabase
    .from('votes')
    .select('*')
    .eq('poll_id', pollId);

  const safeVotes = votes || [];
  
  // Calculate total weighted votes (avoid division by zero)
  const totalWeighted = safeVotes.reduce((sum, v) => sum + (v.weight || 1), 0) || 1;

  // Map the results exactly to your UI's expected format
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
  // Because we set up ON DELETE CASCADE in the database, 
  // deleting the poll automatically deletes its options and votes!
  const { error } = await supabase
    .from('polls')
    .delete()
    .eq('id', id);

  if (error) console.error('Error deleting poll:', error.message);
}