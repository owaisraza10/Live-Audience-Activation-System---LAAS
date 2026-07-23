"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AdminPollManager() {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Poll State
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // 1. Fetch existing polls
  useEffect(() => {
    fetchPolls();

    // Listen for real-time votes coming in
    const subscription = supabase
      .channel('public:poll_votes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_votes' }, payload => {
        fetchPolls(); // Refresh the counts when a vote drops
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function fetchPolls() {
    // In a real app, you'd filter by the current `event_id`
    const { data: pollsData } = await supabase
      .from('polls')
      .select('*, poll_votes(option_id, vote_weight)')
      .order('created_at', { ascending: false });

    if (pollsData) setPolls(pollsData);
    setLoading(false);
  }

  // 2. Draft & Push a New Poll
  const handlePushPoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !optionA || !optionB) return;
    setIsPublishing(true);

    const options = [
      { id: 'A', text: optionA },
      { id: 'B', text: optionB }
    ];

    // Optional: Auto-close any currently 'active' polls so only one is live at a time
    await supabase.from('polls').update({ status: 'closed' }).eq('status', 'active');

    // Push the new poll
    const { error } = await supabase.from('polls').insert([{
      event_id: 'current_live_event', // Hardcoded for now
      question,
      options,
      status: 'active'
    }]);

    if (!error) {
      setQuestion('');
      setOptionA('');
      setOptionB('');
      fetchPolls();
    }
    setIsPublishing(false);
  };

  // 3. Close an Active Poll
  const handleClosePoll = async (pollId: string) => {
    await supabase.from('polls').update({ status: 'closed' }).eq('id', pollId);
    fetchPolls();
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold uppercase tracking-widest text-primary">Live Poll Control</h1>
          <p className="opacity-60 text-sm mt-2">Push sequential decisions to the audience during a broadcast.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* DRAFTING CONSOLE */}
          <div className="lg:col-span-1 bg-gray-900 border border-gray-800 p-6 rounded-2xl h-fit sticky top-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">⚡</span> Draft New Poll
            </h2>
            <form onSubmit={handlePushPoll} className="space-y-4">
              <div>
                <label className="block text-xs font-bold opacity-60 uppercase mb-2">The Decision</label>
                <textarea 
                  value={question} onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., Who should receive the Endurance Penalty?"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:border-primary outline-none resize-none"
                  rows={3} required
                />
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-bold opacity-60 uppercase">Options</label>
                <input 
                  type="text" value={optionA} onChange={(e) => setOptionA(e.target.value)}
                  placeholder="Option A (e.g., Team Alpha)" required
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:border-primary outline-none"
                />
                <input 
                  type="text" value={optionB} onChange={(e) => setOptionB(e.target.value)}
                  placeholder="Option B (e.g., Team Bravo)" required
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:border-primary outline-none"
                />
              </div>
              <button 
                type="submit" disabled={isPublishing}
                className="w-full py-4 mt-4 bg-primary text-on-primary font-bold uppercase tracking-widest rounded-xl hover:brightness-110 disabled:opacity-50 transition-all"
              >
                {isPublishing ? 'Transmitting...' : 'Push Live to Audience'}
              </button>
            </form>
          </div>

          {/* POLL HISTORY & ACTIVE POLLS */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold mb-4">Broadcast Timeline</h2>
            
            {loading ? (
              <div className="p-8 text-center opacity-50 animate-pulse border border-gray-800 rounded-2xl">Syncing with server...</div>
            ) : polls.length === 0 ? (
              <div className="p-8 text-center opacity-50 border border-gray-800 rounded-2xl bg-gray-900">No polls have been pushed yet.</div>
            ) : (
              polls.map((poll) => {
                // Calculate weighted results
                const votesForA = poll.poll_votes?.filter((v: any) => v.option_id === 'A').reduce((sum: number, v: any) => sum + v.vote_weight, 0) || 0;
                const votesForB = poll.poll_votes?.filter((v: any) => v.option_id === 'B').reduce((sum: number, v: any) => sum + v.vote_weight, 0) || 0;
                const totalVotes = votesForA + votesForB;
                const percentA = totalVotes > 0 ? Math.round((votesForA / totalVotes) * 100) : 0;
                const percentB = totalVotes > 0 ? Math.round((votesForB / totalVotes) * 100) : 0;

                return (
                  <div key={poll.id} className={`p-6 border rounded-2xl transition-all ${poll.status === 'active' ? 'bg-primary/10 border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)]' : 'bg-gray-900 border-gray-800'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded mb-3 inline-block ${poll.status === 'active' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-800 text-gray-400'}`}>
                          {poll.status === 'active' ? '🔴 LIVE ON SCREEN' : 'CLOSED'}
                        </span>
                        <h3 className="text-lg font-bold">{poll.question}</h3>
                      </div>
                      {poll.status === 'active' && (
                        <button onClick={() => handleClosePoll(poll.id)} className="px-4 py-2 bg-gray-950 border border-gray-700 hover:border-red-500 hover:text-red-500 rounded-lg text-sm font-bold transition-colors">
                          End Poll
                        </button>
                      )}
                    </div>

                    {/* Results Bars */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>A: {poll.options[0].text}</span>
                          <span className="font-bold">{votesForA} pts ({percentA}%)</span>
                        </div>
                        <div className="w-full bg-gray-950 rounded-full h-3 overflow-hidden">
                          <div className="bg-white h-3 transition-all duration-1000" style={{ width: `${percentA}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>B: {poll.options[1].text}</span>
                          <span className="font-bold">{votesForB} pts ({percentB}%)</span>
                        </div>
                        <div className="w-full bg-gray-950 rounded-full h-3 overflow-hidden">
                          <div className="bg-primary h-3 transition-all duration-1000" style={{ width: `${percentB}%` }}></div>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
}