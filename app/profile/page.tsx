"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; tier: string } | null>(null);

  // --- AUTH CHECK ---
  useEffect(() => {
    const session = localStorage.getItem('laas_user');
    if (!session) {
      router.push('/join');
    } else {
      setUser(JSON.parse(session));
    }
  }, [router]);

  // Prevent flash of empty content while checking auth
  if (!user) return null;

  // Mock data for voting history
  const votingHistory = [
    { id: 1, date: 'Week 3', decision: 'Selected "Endurance Penalty" for Team Alpha', impact: 'Match Lost' },
    { id: 2, date: 'Week 2', decision: 'Granted "Immunity Idol" to Player 4', impact: 'Player Saved' },
    { id: 3, date: 'Week 1', decision: 'Voted for "Water Challenge"', impact: 'Challenge Played' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-center gap-6 m3-card bg-surface-variant">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold shadow-md"
             style={{ backgroundColor: 'var(--m3-primary)', color: 'var(--m3-on-primary)' }}>
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-3xl font-bold mb-1">{user.email}</h1>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black text-white">
            {user.tier} Tier Member
          </span>
        </div>
        {user.tier === 'standard' && (
          <Link href="/checkout">
            <button className="px-6 py-2 rounded-full font-bold border-2 hover:bg-primary hover:text-on-primary transition-colors"
                    style={{ borderColor: 'var(--m3-primary)', color: 'var(--m3-primary)' }}>
              Upgrade to Premium
            </button>
          </Link>
        )}
      </div>

      {/* STATS GRID */}
      <h2 className="text-2xl font-bold pt-4">Your Audience Power</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="m3-card text-center space-y-2 border border-gray-200 shadow-none">
          <div className="text-sm font-bold opacity-60 uppercase">Voting Power</div>
          <div className="text-4xl font-bold text-primary">
            {user.tier === 'premium' ? '2x' : '1x'}
          </div>
          <div className="text-sm opacity-70">Multiplier applied to all votes</div>
        </div>
        
        <div className="m3-card text-center space-y-2 border border-gray-200 shadow-none">
          <div className="text-sm font-bold opacity-60 uppercase">Votes Cast</div>
          <div className="text-4xl font-bold text-primary">3</div>
          <div className="text-sm opacity-70">Across all live events</div>
        </div>

        <div className="m3-card text-center space-y-2 border border-gray-200 shadow-none">
          <div className="text-sm font-bold opacity-60 uppercase">Badges Earned</div>
          <div className="text-4xl font-bold text-primary">1</div>
          <div className="text-sm opacity-70">"First Blood" badge unlocked</div>
        </div>
      </div>

      {/* VOTING HISTORY */}
      <h2 className="text-2xl font-bold pt-4">Voting History</h2>
      <div className="m3-card shadow-none border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300 opacity-70 text-sm">
                <th className="pb-4 font-bold">Event</th>
                <th className="pb-4 font-bold">Your Decision</th>
                <th className="pb-4 font-bold">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {votingHistory.map((vote) => (
                <tr key={vote.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-medium">{vote.date}</td>
                  <td className="py-4">{vote.decision}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-gray-200 text-xs font-bold rounded-full">
                      {vote.impact}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}