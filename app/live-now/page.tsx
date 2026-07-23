"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Event, Poll, PollResults } from '../../lib/types';
import { getLiveEvent } from '../../lib/api/events';
import { getPollsForEvent, submitVote, getPollResults } from '../../lib/api/polls';
import { supabase } from '../../lib/supabase'; 
import { recordEventAttendance } from '../../lib/api/rewards';

// ⚙️ CONFIGURATION: How many DIFFERENT polls a user can vote on per event
function getVoteLimit(tier?: string): number {
  if (!tier) return 1;
  const t = String(tier).toLowerCase().trim();
  if (t === 'premium') return 5;
  if (t === 'standard') return 3;
  return 1; // Free users can only vote on 1 poll per event
}

export default function LiveNowPage() {
  const router = useRouter();
  
  // --- AUTH STATE ---
  const [user, setUser] = useState<{ id: string; email: string; tier: string } | null>(null);

  // --- API STATE ---
  const [liveEvent, setLiveEvent] = useState<Event | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollResults, setPollResults] = useState<Record<string, PollResults>>({});
  
  // TRACK WHICH POLLS THE USER HAS VOTED ON
  const [myVotes, setMyVotes] = useState<Record<string, boolean>>({}); 
  
  // --- UI STATE ---
  const [isVoting, setIsVoting] = useState(false); 
  const [now, setNow] = useState(new Date().getTime());

  // 1. Strict Auth Check
  useEffect(() => {
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
  }, [router]);

  // 2. Fetch Data Core
  async function refreshData(currentUser = user) {
    if (!currentUser) return;

    const currentEvent = await getLiveEvent();
    setLiveEvent(currentEvent);

    if (currentEvent) {
      await recordEventAttendance(currentUser.id, currentEvent.id);

      const eventPolls = await getPollsForEvent(currentEvent.id);
      setPolls(eventPolls);

      const resultsMap: Record<string, PollResults> = {};
      for (const p of eventPolls) {
        const r = await getPollResults(p.id);
        if (r) resultsMap[p.id] = r;
      }
      setPollResults(resultsMap);

      // Fetch which polls this user has already voted on
      const { data: userVotesOnRecord } = await supabase
        .from('votes')
        .select('poll_id')
        .eq('user_id', currentUser.id);
        
      if (userVotesOnRecord) {
        const votesMap: Record<string, boolean> = {};
        userVotesOnRecord.forEach(v => {
          votesMap[v.poll_id] = true;
        });
        setMyVotes(votesMap);
      }
    } else {
      setPolls([]);
      setPollResults({});
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

  // 4. Master Clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate global limits for the event
  const userVoteLimit = getVoteLimit(user?.tier);
  // Count how many polls in THIS event the user has voted on
  const totalVotesCastInEvent = polls.filter(p => myVotes[p.id]).length;
  const votesRemaining = Math.max(0, userVoteLimit - totalVotesCastInEvent);

  // 5. Vote Action (1 vote per poll)
  async function handleVote(pollId: string, optionId: string) {
    if (!user || isVoting || myVotes[pollId]) return;
    
    // Block if they have used up their event limit
    if (votesRemaining <= 0) return;
    
    setIsVoting(true);

    try {
      const normalizedTier = user.tier?.toLowerCase().trim();
      const userTier: 'premium' | 'standard' | 'free' =
        normalizedTier === 'premium' || normalizedTier === 'standard'
          ? normalizedTier
          : 'free';
      await submitVote(pollId, optionId, user.id, userTier);
      
      // Optimistically lock this poll
      setMyVotes(prev => ({ ...prev, [pollId]: true }));
      
      refreshData(user);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "An error occurred while voting.");
      refreshData(user); 
    } finally {
      setIsVoting(false);
    }
  }

  if (!user) return null;

  const activePolls = polls.filter(p => new Date(p.end_time).getTime() > now);
  const closedPolls = polls.filter(p => new Date(p.end_time).getTime() <= now);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-76px)] animate-fade-in font-sans">
      
      {/* LEFT SIDE: VIDEO PLAYER */}
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
          <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-gray-950">
            <div className="w-24 h-24 mb-6 opacity-20 text-white">
              <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Waiting for Broadcast...</h2>
            <p className="text-gray-400 max-w-md">The production team has not marked an event as live yet. Stay tuned.</p>
          </div>
        )}

        <div className="bg-gray-900 text-white p-6 border-t border-gray-800 flex justify-between items-center">
          <h1 className="text-2xl font-bold opacity-90">{liveEvent?.title || 'No Active Event Scheduled'}</h1>
        </div>
      </div>

      {/* RIGHT SIDE: INTERACTIVE PANEL */}
      <div className="w-full lg:w-[30%] bg-gray-900 flex flex-col max-h-[calc(100vh-76px)] overflow-hidden">
        
        {/* Tier Quota Header */}
        <div className="p-6 border-b border-gray-800 bg-gray-950 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-primary">Live Decisions</h2>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">
              {totalVotesCastInEvent} / {userVoteLimit} Decisions Made
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            votesRemaining > 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {votesRemaining} Remaining
          </div>
        </div>

        <div className="flex-grow p-6 overflow-y-auto space-y-8 bg-gray-950">
          
          {polls.length === 0 ? (
            <div className="text-center opacity-50 flex flex-col items-center pt-10">
              <span className="text-4xl mb-4 text-white">⏳</span>
              <p className="font-bold mb-2 text-white">Standby for Interaction</p>
              <p className="text-sm text-gray-400">The director will push live decisions here.</p>
            </div>
          ) : (
            <>
              {/* --- ACTIVE POLLS --- */}
              {activePolls.length > 0 && (
                <div className="space-y-6">
                  {activePolls.map(poll => {
                    const timeLeft = Math.max(0, Math.floor((new Date(poll.end_time).getTime() - now) / 1000));
                    const isVoted = myVotes[poll.id];
                    const results = pollResults[poll.id];

                    return (
                      <div key={poll.id} className={`bg-gray-800 border shadow-lg rounded-xl p-5 space-y-4 ${
                        !isVoted && votesRemaining === 0 ? 'border-red-900/50 opacity-90' : 'border-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]'
                      }`}>
                        <div className="flex justify-between items-start border-b border-gray-700 pb-3">
                          <h3 className="text-lg font-bold leading-tight max-w-[75%] text-white">{poll.question}</h3>
                          <div className={`text-xl font-mono font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                            {timeLeft}s
                          </div>
                        </div>

                        {isVoted ? (
                          // STATE 1: ALREADY VOTED ON THIS POLL (Show Results)
                          <div className="space-y-4 animate-fade-in">
                            <p className="text-xs font-bold text-green-500 uppercase tracking-wider">
                              ✓ Decision Locked In
                            </p>
                            {results?.options.map((opt) => (
                              <div key={opt.option_id} className="relative">
                                <div className="flex justify-between text-sm mb-1 z-10 relative px-3 pt-2 font-bold text-white">
                                  <span>{opt.text}</span>
                                  <span>{opt.percentage}%</span>
                                </div>
                                <div className="w-full h-10 bg-gray-900 rounded-lg overflow-hidden absolute top-0 left-0 border border-gray-700">
                                  <div 
                                    className="h-full bg-primary/40 transition-all duration-700 ease-out" 
                                    style={{ width: `${opt.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : votesRemaining === 0 ? (
                          // STATE 2: OUT OF VOTES FOR THE EVENT (Show Upgrade Prompt)
                          <div className="space-y-3">
                            {poll.options.map((opt) => (
                              <div key={opt.id} className="w-full p-4 rounded-xl font-bold text-left border border-gray-700 bg-gray-900 text-gray-600 flex justify-between items-center cursor-not-allowed">
                                <span>{opt.text}</span>
                                <span>🔒</span>
                              </div>
                            ))}
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                              <p className="text-sm font-bold text-red-400 mb-2">Limit Reached</p>
                              <p className="text-xs text-gray-400 mb-3">You have used all {userVoteLimit} of your decisions for this event.</p>
                              <Link href="/checkout">
                                <button className="px-4 py-2 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider rounded-lg hover:brightness-110 w-full transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
                                  Upgrade to Unlock
                                </button>
                              </Link>
                            </div>
                          </div>
                        ) : (
                          // STATE 3: READY TO VOTE
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cast your vote</p>
                            {poll.options.map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => handleVote(poll.id, opt.id)}
                                disabled={isVoting}
                                className="w-full p-4 rounded-xl font-bold text-left border-2 hover:bg-primary hover:text-on-primary disabled:opacity-50 transition-colors flex justify-between items-center group text-white border-gray-600 hover:border-primary"
                              >
                                <span>{opt.text}</span>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* --- CLOSED POLLS (Past Results) --- */}
              {closedPolls.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-gray-800">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Past Decisions</h3>
                  {closedPolls.map(poll => {
                    const results = pollResults[poll.id];
                    return (
                      <div key={poll.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 opacity-80">
                        <h4 className="font-bold text-sm mb-3 text-white">{poll.question}</h4>
                        <div className="space-y-2">
                          {results?.options.map((opt) => (
                            <div key={opt.option_id} className="flex justify-between text-xs text-gray-400">
                              <span>{opt.text}</span>
                              <span className="font-bold text-gray-300">{opt.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}