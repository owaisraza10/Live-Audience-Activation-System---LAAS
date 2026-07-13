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
  weight: number;
  timestamp: string;
}

interface PollResults {
  poll_id: string;
  total_votes: number;
  options: Array<{
    option_id: string;
    text: string;
    vote_count: number;
    weighted_count: number;
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

function writeVotes(votes: Vote[]) {
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
  window.dispatchEvent(new Event('storage'));
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

// GET /polls?event_id=xxx (admin list — not in spec but needed for CMS)
export async function getPollsForEvent(eventId: string): Promise<Poll[]> {
  return readPolls().filter((p) => p.event_id === eventId);
}

// POST /polls (Admin)
export async function createPoll(input: {
  event_id: string;
  question: string;
  options: string[]; // plain text options; ids generated here
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

// POST /votes
// weight is applied server-side per the spec's weighted voting logic:
//   premium tier -> weight 2, everyone else -> weight 1
export async function submitVote(
  pollId: string,
  optionId: string,
  userId: string,
  userTier: 'free' | 'standard' | 'premium'
): Promise<Vote> {
  const existing = readVotes();
  const alreadyVoted = existing.some(
    (v) => v.poll_id === pollId && v.user_id === userId
  );
  if (alreadyVoted) {
    throw new Error('User has already voted in this poll');
  }

  const vote: Vote = {
    id: generateId('vote'),
    poll_id: pollId,
    user_id: userId,
    option_id: optionId,
    weight: userTier === 'premium' ? 2 : 1,
    timestamp: new Date().toISOString(),
  };
  writeVotes([...existing, vote]);
  return vote;
}

// GET /polls/{id}/results
export async function getPollResults(pollId: string): Promise<PollResults | null> {
  const poll = readPolls().find((p) => p.id === pollId);
  if (!poll) return null;

  const votes = readVotes().filter((v) => v.poll_id === pollId);
  const totalWeighted = votes.reduce((sum, v) => sum + v.weight, 0) || 1;

  const options = poll.options.map((opt) => {
    const optionVotes = votes.filter((v) => v.option_id === opt.id);
    const weightedCount = optionVotes.reduce((sum, v) => sum + v.weight, 0);
    return {
      option_id: opt.id,
      text: opt.text,
      vote_count: optionVotes.length,
      weighted_count: weightedCount,
      percentage: Math.round((weightedCount / totalWeighted) * 100),
    };
  });

  return { poll_id: pollId, total_votes: votes.length, options };
}