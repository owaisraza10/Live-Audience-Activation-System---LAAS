// Matches "Event Data Model" in the LAAS backend spec (section 1)
export type EventStatus = 'live' | 'upcoming' | 'ended';

export interface Event {
  id: string;
  title: string;
  description: string;
  status: EventStatus;
  start_time: string; // ISO datetime
  end_time: string | null;
  stream_url: string;
  season_id: string;
  mission_id: string | null;
  thumbnail: string;
}

// Matches "Poll Data Model" in the LAAS backend spec (section 2)
export type PollType = 'poll' | 'decision';

export interface PollOption {
  id: string;
  text: string;
}

export interface Poll {
  id: string;
  event_id: string;
  question: string;
  options: PollOption[];
  type: PollType;
  start_time: string;
  end_time: string;
  show_results: boolean;
}

// Matches "Vote Data Model" — weight is set server-side from user.tier
export interface Vote {
  id: string;
  poll_id: string;
  user_id: string;
  option_id: string;
  weight: number;
  timestamp: string;
}

export interface PollResults {
  poll_id: string;
  total_votes: number;
  options: {
    option_id: string;
    text: string;
    vote_count: number;
    weighted_count: number;
    percentage: number;
  }[];
}

export interface BtsVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: string;
  created_at: string;
  required_tier: 'free' | 'standard' | 'premium'; // <-- ADD THIS LINE
}