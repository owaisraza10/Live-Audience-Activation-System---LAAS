"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserPoints, getUserBadges, getMonthlyRewards } from '../../lib/api/rewards';
import { recordDailyLogin } from '../../lib/api/rewards';

// --- RANK CALCULATION ENGINE ---
function calculateRank(pts: number) {
  if (pts < 50) return { current: 'Observer', next: 'Bronze Activator', max: 50 };
  if (pts < 250) return { current: 'Bronze Activator', next: 'Silver Activator', max: 250 };
  if (pts < 1000) return { current: 'Silver Activator', next: 'Gold Activator', max: 1000 };
  if (pts < 5000) return { current: 'Gold Activator', next: 'VIP Legend', max: 5000 };
  return { current: 'VIP Legend', next: 'Max Rank Achieved', max: 5000 };
}

// --- STATIC BEHAVIORAL BADGE CATALOG ---
const BADGE_CATALOG = [
  { id: 'early_supporter', name: 'Early Supporter', desc: 'Joined LAAS during the initial launch phase.', icon: '🚀' },
  { id: 'season_1_vet', name: 'Season 1 Veteran', desc: 'Participated actively throughout Season 1.', icon: '🎖️' },
  { id: 'first_vote', name: 'First Action', desc: 'Cast your first live vote.', icon: '🗳️' },
  { id: 'mission_master', name: 'Mission Master', desc: 'Completed a weekly mission successfully.', icon: '🎯' },
  { id: 'daily_devotee', name: 'Daily Devotee', desc: 'Logged in for 7 consecutive days.', icon: '🔥' },
  { id: 'legacy_holder', name: 'Legacy', desc: 'Hold an active account for a full season.', icon: '👑' },
];

export default function RewardsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string; tier: string } | null>(null);
  
  // Real Database State
  const [points, setPoints] = useState(0);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const [monthlyRewards, setMonthlyRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- AUTH & DATA FETCHING ---
  useEffect(() => {
    async function loadRewards() {
      const session = localStorage.getItem('laas_user');
      if (!session) {
        router.push('/join');
        return;
      }
      
      const parsedUser = JSON.parse(session);
      if (!parsedUser.id) {
        localStorage.removeItem('laas_user');
        router.push('/join');
        return;
      }
      
      setUser(parsedUser);

      try {
        // TRIGGER DAILY LOGIN (+2 POINTS)
        // This will silently fail in the database if they already logged in today, preventing spam!
        await recordDailyLogin(parsedUser.id);

        const [dbProfile, dbBadges, dbMonthly] = await Promise.all([
          getUserPoints(parsedUser.id),
          getUserBadges(parsedUser.id),
          getMonthlyRewards()
        ]);
        
        setPoints(dbProfile?.points || 0);
        setEarnedBadgeIds(dbBadges.map(b => b.id));
        setMonthlyRewards(dbMonthly || []);
      } catch (err) {
        console.error("Failed to load rewards", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadRewards();
  }, [router]);

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-primary font-bold animate-pulse">
        Loading your Live Strength...
      </div>
    ); 
  }

  // --- DYNAMIC CALCULATIONS ---
  const rankInfo = calculateRank(points);
  const pointsToNext = Math.max(0, rankInfo.max - points);
  const progressPercent = points >= rankInfo.max ? 100 : Math.round((points / rankInfo.max) * 100);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-fade-in">
      
      {/* HEADER & COMPLIANCE DISCLAIMER */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Rewards & Progression</h1>
          <p className="opacity-70 text-lg">Track your Live Strength, ranks, and unlocked badges.</p>
        </div>
        
        {/* MANDATORY LEGAL GUARDRAIL */}
        <div className="p-4 border border-gray-700 bg-gray-900 rounded-xl text-sm opacity-80 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <p>
            <strong>Compliance Notice:</strong> No guaranteed rewards. No financial returns. Rewards are discretionary and entertainment-based.
          </p>
        </div>
      </div>

      {/* TOP STATS & PROGRESS */}
      <div className="m3-card flex flex-col justify-center border-2" style={{ borderColor: 'var(--m3-primary)' }}>
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-sm font-bold opacity-70 uppercase tracking-wider mb-1">Current Rank</p>
            <h2 className="text-3xl font-bold">{rankInfo.current}</h2>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold text-primary">{points}</h2>
            <p className="text-sm opacity-70">Live Strength Points</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm font-bold">
            <span>{rankInfo.current}</span>
            <span className="opacity-70">
              {rankInfo.current === 'VIP Legend' ? 'Max Rank' : `${rankInfo.next} (${pointsToNext} pts away)`}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%`, backgroundColor: 'var(--m3-primary)' }}
            />
          </div>
        </div>
      </div>

      {/* MONTHLY REWARDS (CMS DRIVEN) */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Monthly Rewards</h2>
          <p className="opacity-70 text-sm mt-1">Discretionary community rewards. Unlockable via engagement.</p>
        </div>
        
        {monthlyRewards.length === 0 ? (
          <div className="text-center p-12 bg-surface-variant rounded-2xl border border-dashed border-gray-300 opacity-70">
            <p className="font-bold">New rewards dropping soon.</p>
            <p className="text-sm">Keep earning points and check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {monthlyRewards.map((reward) => (
              <div key={reward.id} className="bg-surface rounded-[24px] overflow-hidden border border-gray-200 shadow-sm flex flex-col">
                <div className="h-48 bg-gray-200 w-full relative">
                  {reward.image ? (
                    <img src={reward.image} alt={reward.reward_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-primary/10 text-primary">🎁</div>
                  )}
                  <div className="absolute top-4 right-4 bg-black/80 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {reward.month}
                  </div>
                </div>
                <div className="p-6 flex-grow">
                  <h3 className="font-bold text-xl mb-2">{reward.reward_name}</h3>
                  <p className="text-sm opacity-80 leading-snug">{reward.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BEHAVIORAL BADGES SHOWCASE */}
      <div>
        <h2 className="text-2xl font-bold mb-6 pt-4">Achievement Badges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BADGE_CATALOG.map((badge) => {
            const isEarned = earnedBadgeIds.includes(badge.id);

            return (
              <div 
                key={badge.id} 
                className={`p-6 rounded-[24px] border-2 transition-all flex items-start gap-4 ${
                  isEarned 
                    ? 'border-gray-200 bg-surface shadow-sm' 
                    : 'border-transparent bg-gray-100 opacity-60 grayscale'
                }`}
              >
                <div className="text-4xl">{badge.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
                  <p className="text-sm opacity-80 leading-snug">{badge.desc}</p>
                  {!isEarned && (
                    <span className="inline-block mt-3 text-xs font-bold uppercase tracking-wider bg-gray-300 px-2 py-1 rounded">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}