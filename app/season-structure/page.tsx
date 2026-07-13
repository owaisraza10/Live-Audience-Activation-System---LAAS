"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentSeason, getSeasonMissions } from '../../lib/api/seasons';

export default function SeasonStructurePage() {
  const [currentSeason, setCurrentSeason] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeasonData() {
      const season = await getCurrentSeason();
      setCurrentSeason(season);
      
      if (season) {
        const seasonMissions = await getSeasonMissions(season.id);
        setMissions(seasonMissions);
      }
      setLoading(false);
    }
    
    loadSeasonData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-primary font-bold animate-pulse">
        Loading Season Archives...
      </div>
    );
  }

  if (!currentSeason) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        <h2 className="text-2xl font-bold mb-2">No Active Season</h2>
        <p>The production team has not configured a season yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* 1. SEASON OVERVIEW */}
        <div className="text-center space-y-4 pt-8">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Current Season</p>
          <h1 className="text-4xl md:text-5xl font-bold">{currentSeason.title}</h1>
          <p className="opacity-70 text-lg max-w-2xl mx-auto leading-relaxed">
            {currentSeason.description}
          </p>
        </div>

        {/* 2. SEASON STORY ARC (Visual Timeline) */}
        <div className="bg-surface-variant rounded-[28px] p-8 border border-gray-800 shadow-lg">
          <h2 className="text-xl font-bold mb-6 text-primary">Story Arc Progress</h2>
          <div className="relative pt-2">
            <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-800 rounded-full -translate-y-1/2"></div>
            <div 
              className="absolute top-1/2 left-0 h-2 bg-primary rounded-full -translate-y-1/2 transition-all duration-1000"
              style={{ width: `${(currentSeason.current_week / currentSeason.total_weeks) * 100}%` }}
            ></div>
            
            <div className="relative flex justify-between w-full">
              {[...Array(currentSeason.total_weeks)].map((_, i) => {
                const weekNum = i + 1;
                const isCompleted = weekNum < currentSeason.current_week;
                const isActive = weekNum === currentSeason.current_week;
                
                return (
                  <div key={weekNum} className="flex flex-col items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors ${
                      isActive ? 'bg-primary text-on-primary ring-4 ring-primary/30' : 
                      isCompleted ? 'bg-primary text-on-primary' : 'bg-gray-800 text-gray-500'
                    }`}>
                      {weekNum}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between mt-4 text-sm font-bold opacity-70">
            <span>Week 1</span>
            <span>Week {currentSeason.current_week} (Now)</span>
            <span>Week {currentSeason.total_weeks} (Finale)</span>
          </div>
        </div>

        {/* 3. WEEKLY MISSIONS GRID */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Weekly Missions</h2>
          {missions.length === 0 ? (
            <p className="opacity-50 text-sm">Missions are currently classified.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {missions.map((mission) => {
                const isCompleted = mission.week < currentSeason.current_week;
                const isActive = mission.week === currentSeason.current_week;
                const isLocked = mission.week > currentSeason.current_week;

                return (
                  <div 
                    key={mission.id} 
                    className={`flex flex-col rounded-[24px] overflow-hidden border-2 transition-all ${
                      isActive ? 'border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] bg-surface' : 
                      isLocked ? 'border-transparent bg-gray-900 opacity-60 grayscale' : 
                      'border-gray-800 bg-surface'
                    }`}
                  >
                    <div className="h-40 bg-gray-800 relative flex items-center justify-center overflow-hidden">
                      {mission.video_url && !isLocked ? (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <span className="text-4xl opacity-50">▶️</span>
                        </div>
                      ) : (
                        <span className="text-4xl opacity-20">
                          {isLocked ? '🔒' : '✓'}
                        </span>
                      )}
                      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isActive ? 'bg-primary text-on-primary' : 'bg-gray-700 text-white'
                      }`}>
                        Week {mission.week}
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold mb-2">{mission.title}</h3>
                      <p className="text-sm opacity-70 mb-6 flex-grow">
                        {isLocked ? 'Mission details classified until week ' + mission.week : mission.description}
                      </p>
                      
                      {!isLocked ? (
                        <Link 
                          href={`/season-structure/${mission.id}`}
                          className={`w-full py-3 block rounded-xl font-bold text-center uppercase tracking-wider text-sm transition-colors ${
                            isActive ? 'bg-primary text-on-primary hover:brightness-110' : 'bg-gray-800 hover:bg-gray-700'
                          }`}
                        >
                          {isActive ? 'Enter Mission' : 'View Debrief'}
                        </Link>
                      ) : (
                        <button disabled className="w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm bg-gray-900 border border-gray-700 text-gray-600 cursor-not-allowed">
                          Locked
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. FINAL WEEK HIGHLIGHT */}
        <div className="rounded-[28px] bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8 md:p-12 text-center flex flex-col items-center">
          <span className="text-5xl mb-4">🏆</span>
          <h2 className="text-3xl font-bold mb-3">The Season Finale</h2>
          <p className="opacity-70 max-w-xl mx-auto mb-6">
            In Week {currentSeason.total_weeks}, the cumulative results of every audience decision will culminate in the final live event. Your Live Strength points and legacy badges will be cemented for the next season.
          </p>
          <button disabled className="px-8 py-3 rounded-xl bg-gray-800 text-gray-500 font-bold uppercase tracking-widest text-sm border border-gray-700 cursor-not-allowed">
            Unlocks in {Math.max(0, currentSeason.total_weeks - currentSeason.current_week)} Weeks
          </button>
        </div>

      </div>
    </div>
  );
}