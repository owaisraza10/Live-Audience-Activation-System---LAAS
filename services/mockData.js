// services/mockData.js

export const trendingEvents = [
  { id: 'evt_001', title: 'Week 1 Live Mission', description: 'Audience decides the next challenge.', status: 'upcoming', date: '2026-07-15' },
  { id: 'evt_002', title: 'Week 2 Live Mission', description: 'Deep dive into behavioral intelligence.', status: 'upcoming', date: '2026-07-22' },
  { id: 'evt_003', title: 'Week 3 Live Mission', description: 'Interactive decision making finale.', status: 'upcoming', date: '2026-07-29' }
];

export const rewards = [
  { id: 'r1', name: 'Early Supporter Badge', description: 'For those who joined in Season 1.' },
  { id: 'r2', name: 'Digital Shout-out', description: 'Featured on the live stream.' },
  { id: 'r3', name: 'Exclusive Clip Access', description: 'Unlock behind-the-scenes footage.' }
];

export const seasonConfig = {
  currentWeek: 3,
  totalWeeks: 12
};

// Add this to the bottom of services/mockData.js

export const allEvents = [
  // A currently live event
  { id: 'evt_live_1', title: 'Week 4 Live Decision', description: 'The audience decides the fate of the team right now.', status: 'live', date: '2026-07-08', duration: 'LIVE' },
  
  // Upcoming events
  { id: 'evt_up_1', title: 'Week 5 Live Mission', description: 'Audience decides the next challenge.', status: 'upcoming', date: '2026-07-15', duration: 'Upcoming' },
  { id: 'evt_up_2', title: 'Week 6 Live Mission', description: 'Deep dive into behavioral intelligence.', status: 'upcoming', date: '2026-07-22', duration: 'Upcoming' },
  
  // Past events (Replays)
  { id: 'evt_rep_1', title: 'Week 3 Live Mission', description: 'Interactive decision making finale.', status: 'ended', date: '2026-07-01', duration: '1h 45m' },
  { id: 'evt_rep_2', title: 'Week 2 Live Mission', description: 'The first major plot twist.', status: 'ended', date: '2026-06-24', duration: '2h 10m' },
  { id: 'evt_rep_3', title: 'Week 1 Live Mission', description: 'The season premiere.', status: 'ended', date: '2026-06-17', duration: '1h 55m' }
];