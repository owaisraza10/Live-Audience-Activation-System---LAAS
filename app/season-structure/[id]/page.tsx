"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { getMission } from '../../../lib/api/seasons';
import { submitVote, getPollResults } from '../../../lib/api/polls';
import { recordMissionCompletion } from '../../../lib/api/rewards';

export default function MissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = params.id as string;

  // --- STATE ---
  const [user, setUser] = useState<{ id: string; email: string; tier: string } | null>(null);
  const [mission, setMission] = useState<any>(null);
  
  // Poll & Gamification State
  const [poll, setPoll] = useState<any>(null);
  const [pollResults, setPollResults] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // 2. Fetch Mission Data & Poll
  async function loadMissionData(currentUser: any) {
    if (!currentUser) return;
    setLoading(true);

    try {
      // Fetch the mission
      const missionData = await getMission(missionId);
      setMission(missionData);

      // Check if user already got their +20 points for this mission
      const { data: completionRecord } = await supabase
        .from('user_missions')
        .select('id')
        .eq('mission_id', missionId)
        .eq('user_id', currentUser.id)
        .maybeSingle();
      
      if (completionRecord) setHasCompleted(true);

      // If a poll is linked, fetch its data and results
      if (missionData?.poll_id) {
        const { data: pollData } = await supabase
          .from('polls')
          .select('id, question, type, show_results, options:poll_options(id, text)')
          .eq('id', missionData.poll_id)
          .single();
        
        setPoll(pollData);

        if (pollData) {
          const results = await getPollResults(pollData.id);
          setPollResults(results);

          // Securely check if this EXACT user ID has a vote on record
          const { data: voteOnRecord } = await supabase
            .from('votes')
            .select('id')
            .eq('poll_id', pollData.id)
            .eq('user_id', currentUser.id)
            .maybeSingle();
            
          if (voteOnRecord) setHasVoted(true);
        }
      }
    } catch (error) {
      console.error("Failed to load mission:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      loadMissionData(user);
    }
  }, [user, missionId]);

  // 3. Complete Mission / Voting Action
  async function handleInteraction(optionId?: string) {
    if (!user || isProcessing) return;
    setIsProcessing(true);

    try {
      // If there is a poll, submit the vote first (+5 points via DB trigger)
      if (poll && optionId) {
        const tier = user.tier === 'premium' ? 'premium' : 'standard';
        await submitVote(poll.id, optionId, user.id, tier);
        setHasVoted(true);
      }

      // Record Mission Completion (+20 points via DB trigger)
      if (!hasCompleted) {
        await recordMissionCompletion(user.id, missionId);
        setHasCompleted(true);
      }

      // Refresh to get updated poll results
      await loadMissionData(user);
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('already voted')) {
        setHasVoted(true);
        if (!hasCompleted) await recordMissionCompletion(user.id, missionId);
        await loadMissionData(user);
      } else {
        alert(error.message || "An error occurred.");
      }
    } finally {
      setIsProcessing(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-primary font-bold animate-pulse bg-gray-900">
        Decrypting Mission Logs...
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <h1 className="text-2xl font-bold mb-4">Mission Not Found</h1>
        <Link href="/season-structure" className="text-primary hover:underline">← Back to Archives</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <Link href="/season-structure" className="text-xs uppercase tracking-wider text-gray-500 hover:text-gray-300 flex items-center gap-2 mb-4">
            ← Back to Season Arc
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <span className="bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Week {mission.week}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold">{mission.title}</h1>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT: CONTENT & VIDEO (65%) */}
          <div className="w-full lg:w-[65%] space-y-6">
            
            {/* Embedded Video Player */}
            <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-xl relative">
              {mission.video_url ? (
                <iframe 
                  src={mission.video_url} 
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                  <span className="text-5xl mb-4">📹</span>
                  <p className="font-bold">Mission feed offline or classified.</p>
                </div>
              )}
            </div>

            {/* Mission Briefing */}
            <div className="bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700">
              <h2 className="text-xl font-bold text-primary mb-4">Mission Debrief</h2>
              <p className="text-lg opacity-80 leading-relaxed whitespace-pre-wrap">
                {mission.description}
              </p>
            </div>
          </div>

          {/* RIGHT: INTERACTION ENGINE (35%) */}
          <div className="w-full lg:w-[35%] flex flex-col gap-6">
            
            {/* Gamification Status Card */}
            <div className={`p-6 rounded-2xl border-2 transition-colors ${
              hasCompleted ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-surface-variant border-gray-700'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold uppercase tracking-wider text-sm">Mission Status</h3>
                <span className="text-2xl">{hasCompleted ? '✅' : '🎯'}</span>
              </div>
              {hasCompleted ? (
                <p className="text-sm font-bold mt-2">+20 Live Strength Points Claimed</p>
              ) : (
                <p className="text-sm opacity-70 mt-2">Complete this mission to earn +20 Live Strength.</p>
              )}
            </div>

            {/* Mission Vote / Poll */}
            {poll ? (
              <div className="bg-surface rounded-2xl p-6 border border-gray-700 flex flex-col shadow-lg">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-primary">Decide the Outcome</h2>
                  {user.tier === 'premium' && (
                    <span className="text-[10px] font-bold bg-primary text-on-primary px-2 py-1 rounded uppercase tracking-wider">
                      2x Vote
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold leading-tight mb-6">{poll.question}</h3>

                {/* ACTIVE VOTING VIEW */}
                {!hasVoted ? (
                  <div className="space-y-3">
                    {poll.options?.map((opt: any) => (
                      <button
                        key={opt.id}
                        onClick={() => handleInteraction(opt.id)}
                        disabled={isProcessing}
                        className="w-full p-4 rounded-xl font-bold text-left border-2 hover:bg-primary hover:text-on-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-between items-center group"
                        style={{ borderColor: 'var(--m3-primary)', color: 'var(--m3-primary)' }}
                      >
                        <span>{opt.text}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* LOCKED RESULTS VIEW */
                  <div className="space-y-5 animate-fade-in">
                    <p className="text-sm font-bold uppercase tracking-wider mb-2 text-green-500">
                      Vote Locked & Recorded
                    </p>
                    {pollResults?.options.map((opt: any) => (
                      <div key={opt.option_id} className="relative">
                        <div className="flex justify-between text-sm mb-1 z-10 relative px-3 pt-2 font-bold text-white">
                          <span>{opt.text}</span>
                          <span>{opt.percentage}%</span>
                        </div>
                        <div className="w-full h-10 bg-gray-900 rounded-lg overflow-hidden absolute top-0 left-0 border border-gray-800">
                          <div 
                            className="h-full bg-primary/40 transition-all duration-1000 ease-out" 
                            style={{ width: `${opt.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* NO POLL - JUST A COMPLETION BUTTON */
              <div className="bg-surface rounded-2xl p-6 border border-gray-700 flex flex-col text-center">
                <span className="text-4xl mb-4">📺</span>
                <h3 className="font-bold text-lg mb-2">Watch to Complete</h3>
                <p className="text-sm opacity-70 mb-6">Acknowledge you have received the debrief to claim your reward.</p>
                <button
                  onClick={() => handleInteraction()}
                  disabled={hasCompleted || isProcessing}
                  className="w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-colors disabled:opacity-50 bg-primary text-on-primary hover:brightness-110"
                >
                  {hasCompleted ? 'Mission Completed' : 'Acknowledge Debrief'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}