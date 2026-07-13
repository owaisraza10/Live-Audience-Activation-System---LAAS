"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Event, Poll, PollResults } from '../../lib/types';
import { getLiveEvent } from '../../lib/api/events';
import { getActivePoll, submitVote, getPollResults } from '../../lib/api/polls';
import { supabase } from '../../lib/supabase'; 
import { recordEventAttendance } from '../../lib/api/rewards'; // NEW: Import the attendance tracker

export default function LiveNowPage() {
  const router = useRouter();
  
  // --- AUTH STATE ---
  const [user, setUser] = useState<{ id: string; email: string; tier: string } | null>(null);

  // --- API STATE ---
  const [liveEvent, setLiveEvent] = useState<Event | null>(null);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [pollResults, setPollResults] = useState<PollResults | null>(null);
  
  // --- UI STATE ---
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false); 
  const [timeLeft, setTimeLeft] = useState(0);

  // 1. Strict Auth Check
  useEffect(() => {
    const session = localStorage.getItem('laas_user');
    if (!session) {
      router.push('/join');
      return;
    } 

    const parsedUser = JSON.parse(session);
    
    // If the user has an old mock session without an ID, purge it!
    if (!parsedUser.id) {
      localStorage.removeItem('laas_user');
      router.push('/join');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  // 2. Fetch Data Core
  async function refreshData(currentUser = user) {
    if (!currentUser) return;

    const currentEvent = await getLiveEvent();
    setLiveEvent(currentEvent);

    if (currentEvent) {
      // NEW: Securely log event attendance (+10 points)[cite: 1, 2]
      // (The database unique constraint prevents duplicate points on refresh)
      await recordEventAttendance(currentUser.id, currentEvent.id);

      const currentPoll = await getActivePoll(currentEvent.id);
      setActivePoll(currentPoll);

      if (currentPoll) {
        const results = await getPollResults(currentPoll.id);
        setPollResults(results);
        
        const end = new Date(currentPoll.end_time).getTime();
        const now = new Date().getTime();
        setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)));

        // Securely check if this EXACT user ID has a vote on record
        const { data: voteOnRecord } = await supabase
          .from('votes')
          .select('id')
          .eq('poll_id', currentPoll.id)
          .eq('user_id', currentUser.id)
          .maybeSingle();
          
        setHasVoted(!!voteOnRecord);
      } else {
        setPollResults(null);
        setHasVoted(false);
      }
    }
  }

  // 3. Supabase Real-Time WebSockets
  useEffect(() => {
    if (!user) return;
    
    refreshData(user);
    
    const channel = supabase
      .channel('live-audience-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => refreshData(user))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'polls' }, () => refreshData(user))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => refreshData(user))
      .subscribe();

    return () => {
      supabase.removeChannel(channel); 
    };
  }, [user]);

  // 4. Timer Countdown Logic
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // 5. Bulletproof Voting Action
  async function handleVote(optionId: string) {
    if (!user || !activePoll || isVoting) return;
    
    setIsVoting(true); // Lock the UI instantly so they can't double-click

    try {
      const tier = user.tier === 'premium' ? 'premium' : 'standard';
      
      await submitVote(activePoll.id, optionId, user.id, tier);
      
      setHasVoted(true);
      refreshData(user);
    } catch (error: any) {
      console.error(error);
      
      // If the database rejects it because they already voted on another tab/device,
      // force the UI into the "Locked Metrics" view anyway!
      if (error.message.includes('already voted')) {
        setHasVoted(true);
        refreshData(user);
      } else {
        alert(error.message || "An error occurred while voting.");
      }
    } finally {
      setIsVoting(false); // Unlock the UI process
    }
  }

  if (!user) return null;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-76px)] animate-fade-in">
      
      {/* LEFT SIDE: VIDEO PLAYER (70%) */}
      <div className="w-full lg:w-[70%] bg-black relative flex flex-col border-r border-gray-800">
        {liveEvent ? (
          <div className="flex-grow w-full h-full relative">
            <div className="absolute top-6 left-6 z-10 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              LIVE
            </div>
            <iframe 
              src={`${liveEvent.stream_url}?autoplay=1&mute=1`} 
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 mb-6 opacity-20">
              <svg fill="currentColor" viewBox="0 0 24 24" className="text-white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Waiting for Broadcast...</h2>
            <p className="text-gray-400 max-w-md">
              The production team has not marked an event as live yet. Stay tuned.
            </p>
          </div>
        )}

        <div className="bg-gray-900 text-white p-6 border-t border-gray-800 flex justify-between items-center">
          <h1 className="text-2xl font-bold opacity-90">
            {liveEvent?.title || 'No Active Event Scheduled'}
          </h1>
        </div>
      </div>

      {/* RIGHT SIDE: INTERACTIVE PANEL (30%) */}
      <div className="w-full lg:w-[30%] bg-surface flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-surface-variant flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary">Live Decision</h2>
          {user.tier === 'premium' && (
            <span className="text-xs font-bold bg-primary text-on-primary px-3 py-1 rounded-full uppercase tracking-wider">
              2x Vote Active
            </span>
          )}
        </div>

        <div className="flex-grow p-6 overflow-y-auto flex flex-col justify-center">
          {!activePoll ? (
            <div className="text-center opacity-50 flex flex-col items-center">
              <span className="text-4xl mb-4">⏳</span>
              <p className="font-bold mb-2">Standby for Interaction</p>
              <p className="text-sm">The director will push live decisions here during the broadcast.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                <h3 className="text-2xl font-bold leading-tight max-w-[75%]">
                  {activePoll.question}
                </h3>
                <div className={`text-2xl font-mono font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                  {timeLeft > 0 ? `${timeLeft}s` : '0s'}
                </div>
              </div>

              {/* ACTIVE VOTING VIEW */}
              {!hasVoted && timeLeft > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm font-bold opacity-70 uppercase tracking-wider mb-2">Cast your vote</p>
                  {activePoll.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleVote(opt.id)}
                      disabled={isVoting}
                      className="w-full p-4 rounded-xl font-bold text-left border-2 hover:bg-primary hover:text-on-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-between items-center group"
                      style={{ borderColor: 'var(--m3-primary)', color: 'var(--m3-primary)' }}
                    >
                      <span>{opt.text}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                  ))}
                </div>
              ) : (
                /* LIVE RESULTS VIEW (Metrics shown after voting!) */
                <div className="space-y-5 animate-fade-in">
                  <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${timeLeft > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {timeLeft > 0 ? 'Live Results (Poll Open)' : 'Final Results (Poll Closed)'}
                  </p>
                  {pollResults?.options.map((opt) => (
                    <div key={opt.option_id} className="relative">
                      <div className="flex justify-between text-sm mb-1 z-10 relative px-3 pt-2 font-bold">
                        <span>{opt.text}</span>
                        <span>{opt.percentage}%</span>
                      </div>
                      <div className="w-full h-10 bg-gray-200 rounded-lg overflow-hidden absolute top-0 left-0">
                        <div 
                          className="h-full bg-primary/30 transition-all duration-700 ease-out" 
                          style={{ width: `${opt.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  
                  {hasVoted && timeLeft > 0 && (
                    <div className="mt-8 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-center font-bold text-sm">
                      ✓ Vote locked in. Waiting for poll to close...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}