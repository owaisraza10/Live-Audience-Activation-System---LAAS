import { supabase } from "@/lib/supabase";

interface PollOption {
  id: string;
  text: string;
}

interface Poll {
  id: string;
  event_id: string;
  question: string;
  options: PollOption[];
  type: string;
  start_time: string;
  end_time: string;
  show_results: boolean;
}

interface Vote {
  id: string;
  poll_id: string;
  user_id: string;
  option_id: string;
  timestamp: string;
}

interface PollResults {
  poll_id: string;
  total_votes: number;
  options: Array<{
    option_id: string;
    text: string;
    vote_count: number;
    percentage: number;
  }>;
}

const POLLS_KEY = 'laas_cms_polls';
const VOTES_KEY = 'laas_cms_votes';

function readPolls(): Poll[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(POLLS_KEY);
  return raw ? (JSON.parse(raw) as Poll[]) : [];
}

function writePolls(polls: Poll[]) {
  localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
  window.dispatchEvent(new Event('storage'));
}

function readVotes(): Vote[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(VOTES_KEY);
  return raw ? (JSON.parse(raw) as Vote[]) : [];
}

function generateId(prefix: string): string {
  return `${prefix}_` + Math.random().toString(36).slice(2, 9);
}

// GET /polls/active?event_id=xxx
export async function getActivePoll(eventId: string): Promise<Poll | null> {
  const now = new Date();
  return (
    readPolls().find(
      (p) =>
        p.event_id === eventId &&
        new Date(p.start_time) <= now &&
        new Date(p.end_time) >= now
    ) ?? null
  );
}

// GET /polls?event_id=xxx
export async function getPollsForEvent(eventId: string): Promise<Poll[]> {
  return readPolls().filter((p) => p.event_id === eventId);
}

// POST /polls (Admin)
export async function createPoll(input: {
  event_id: string;
  question: string;
  options: string[];
  type: Poll['type'];
  start_time: string;
  end_time: string;
  show_results: boolean;
}): Promise<Poll> {
  const options: PollOption[] = input.options.map((text) => ({
    id: generateId('opt'),
    text,
  }));
  const poll: Poll = {
    id: generateId('poll'),
    event_id: input.event_id,
    question: input.question,
    options,
    type: input.type,
    start_time: input.start_time,
    end_time: input.end_time,
    show_results: input.show_results,
  };
  writePolls([...readPolls(), poll]);
  return poll;
}

// POST /votes - Pure Supabase insertion without tiers or weights
export async function submitVote(pollId: string, optionId: string, userId: string) {
  const { data, error } = await supabase
    .from('votes')
    .insert([
      { poll_id: pollId, option_id: optionId, user_id: userId }
    ]);

  if (error) throw error;
  return data;
}

// GET /polls/{id}/results
export async function getPollResults(pollId: string): Promise<PollResults | null> {
  const poll = readPolls().find((p) => p.id === pollId);
  if (!poll) return null;

  const votes = readVotes().filter((v) => v.poll_id === pollId);
  const totalVotes = votes.length || 1;

  const options = poll.options.map((opt) => {
    const optionVotes = votes.filter((v) => v.option_id === opt.id);
    const count = optionVotes.length;
    return {
      option_id: opt.id,
      text: opt.text,
      vote_count: count,
      percentage: Math.round((count / totalVotes) * 100),
    };
  });

  return { poll_id: pollId, total_votes: votes.length, options };
}