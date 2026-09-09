"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PPVUser {
  id: string;
  name: string;
  email: string;
  votesAvailable: number;
  points: number; // This drives the Legacy System
}

export default function RewardsPage() {
  const router = useRouter();
  const [user, setUser] = useState<PPVUser | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('laas_user');
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(session));
  }, [router]);

  if (!user) return null;

  // Mock Badges - In production, this would be calculated based on user's db records
  const badges = [
    { id: 'first_blood', name: 'First Blood', description: 'Cast your very first live decision.', icon: '🩸', unlocked: user.points >= 10, requirement: 10 },
    { id: 'loyalist', name: 'The Loyalist', description: 'Attend 5 consecutive live broadcasts.', icon: '🛡️', unlocked: user.points >= 50, requirement: 50 },
    { id: 'puppet_master', name: 'Puppet Master', description: 'Your vote aligned with the winning decision 10 times.', icon: '🎭', unlocked: user.points >= 100, requirement: 100 },
    { id: 'whale', name: 'High Roller', description: 'Purchase a vote pack and swing a major poll.', icon: '🐋', unlocked: user.points >= 250, requirement: 250 },
    { id: 'season_veteran', name: 'Season 1 Veteran', description: 'Participated in the inaugural LAAS season.', icon: '🎖️', unlocked: user.points >= 500, requirement: 500 },
  ];

  // Calculate rank progression
  const nextMilestone = badges.find(b => !b.unlocked)?.requirement || 1000;
  const progressPercentage = Math.min(100, (user.points / nextMilestone) * 100);

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20">
      
      {/* Header Section */}
      <div className="bg-gray-900 border-b border-gray-800 pt-16 pb-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Audience Legacy</h1>
            <p className="opacity-70 text-lg max-w-xl">
              Influence cannot be bought, it must be earned. Track your activity, unlock exclusive badges, and cement your legacy in the broadcast.
            </p>
          </div>
          
          {/* User Score Card */}
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 text-center shadow-2xl min-w-[250px]">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Total Activity Score</p>
            <div className="text-5xl font-black text-primary mb-1">{user.points}</div>
            <p className="text-sm font-medium text-gray-400">Earned Points</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        
        {/* Progression Bar */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xl font-bold">Next Milestone</h2>
              <p className="text-sm text-gray-400 mt-1">Unlock your next badge at {nextMilestone} points.</p>
            </div>
            <div className="text-primary font-bold">{user.points} / {nextMilestone}</div>
          </div>
          <div className="w-full h-4 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Badges Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span>🏅</span> Earned Badges
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge) => (
              <div 
                key={badge.id}
                className={`relative rounded-2xl p-6 border transition-all ${
                  badge.unlocked 
                    ? 'bg-gray-900 border-primary/50 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] hover:border-primary' 
                    : 'bg-gray-950 border-gray-800 opacity-60 grayscale'
                }`}
              >
                {!badge.unlocked && (
                  <div className="absolute top-4 right-4 text-xs font-bold bg-gray-800 px-2 py-1 rounded text-gray-400">
                    🔒 {badge.requirement} pts
                  </div>
                )}
                <div className="text-5xl mb-4 drop-shadow-lg">{badge.icon}</div>
                <h3 className={`text-lg font-bold mb-2 ${badge.unlocked ? 'text-white' : 'text-gray-400'}`}>
                  {badge.name}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Explainer / Disclaimer */}
        <div className="border-t border-gray-800 pt-12 text-center max-w-2xl mx-auto">
          <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-4">How it works</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            LAAS is committed to a merit-based ecosystem. Your marketing status, legacy rank, and badges are determined strictly by your participation, interactions, and completed missions within the platform. Legacy cannot be bypassed with a monthly subscription.
          </p>
        </div>

      </div>
    </div>
  );
}