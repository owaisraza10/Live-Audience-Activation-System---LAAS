"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Event, Poll, PollResults } from '../../../../lib/types';
import { getEvent } from '../../../../lib/api/events';
import { 
  getPollsForEvent, 
  createPoll, 
  getPollResults, 
  updatePoll, 
  deletePoll 
} from '../../../../lib/api/polls';

export default function EventPollsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [results, setResults] = useState<Record<string, PollResults>>({});

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [pollType, setPollType] = useState<'poll' | 'decision'>('decision');
  
  // NEW: Duration state (Default to 30 minutes)
  const [durationMinutes, setDurationMinutes] = useState<number>(30);

  async function refresh() {
    const [ev, pollList] = await Promise.all([
      getEvent(eventId),
      getPollsForEvent(eventId),
    ]);
    setEvent(ev);
    setPolls(pollList);

    const resultsMap: Record<string, PollResults> = {};
    for (const p of pollList) {
      const r = await getPollResults(p.id);
      if (r) resultsMap[p.id] = r;
    }
    setResults(resultsMap);
  }

  useEffect(() => {
    refresh();
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    const interval = setInterval(refresh, 3000); // Admin side still uses interval for simplicity
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, [eventId]);

  function startEdit(poll: Poll) {
    setEditingId(poll.id);
    setQuestion(poll.question);
    setPollType(poll.type);
    setOptionsText('Options and duration cannot be edited after a poll is created to protect vote integrity. Delete and recreate if needed.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setQuestion('');
    setOptionsText('');
    setPollType('decision');
    setDurationMinutes(30); // Reset timer
  }

  async function handleSavePoll() {
    if (editingId) {
      // UPDATE existing poll (Metadata only)
      await updatePoll(editingId, { question, type: pollType });
    } else {
      // CREATE new poll
      const options = optionsText
        .split('\n')
        .map((o) => o.trim())
        .filter(Boolean);
      
      if (!question || options.length < 2) return;

      const now = new Date();
      // NEW: Calculate end time based on the custom input
      const end = new Date(now.getTime() + (durationMinutes * 60 * 1000));

      await createPoll({
        event_id: eventId,
        question,
        options,
        type: pollType,
        start_time: now.toISOString(),
        end_time: end.toISOString(),
        show_results: true,
      });
    }

    cancelEdit(); // resets form
    refresh();
  }

  async function handleDelete(pollId: string) {
    if (window.confirm("Are you sure you want to delete this poll? All votes will be permanently lost.")) {
      await deletePoll(pollId);
      if (editingId === pollId) cancelEdit();
      refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-gray-700 pb-6">
          <a href="/admin/events" className="text-xs uppercase tracking-wider text-gray-500 hover:text-gray-300">
            ← back to events
          </a>
          <h1 className="text-2xl font-bold mt-2">
            {event ? event.title : 'Loading…'}
          </h1>
          <p className="opacity-70 text-sm">Polls & live decisions for this event</p>
        </div>

        {/* EDITOR FORM */}
        <div className={`rounded-2xl p-8 border transition-all ${editingId ? 'bg-gray-800 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'bg-gray-800 border-gray-700'}`}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            {editingId ? <><span className="text-yellow-400">✏️</span> Edit Poll</> : 'Create poll'}
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2 opacity-80">Question</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Choose the next challenge"
                className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2 opacity-80 flex justify-between">
                <span>Options (one per line)</span>
                {editingId && <span className="text-yellow-500 text-xs">Locked</span>}
              </label>
              <textarea
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                rows={4}
                disabled={!!editingId}
                placeholder={'Puzzle\nPhysical Task\nTrivia'}
                className={`w-full p-4 rounded-xl bg-gray-900 border focus:outline-none focus:border-blue-500 font-mono text-sm ${editingId ? 'border-gray-800 opacity-50 cursor-not-allowed text-yellow-500' : 'border-gray-700'}`}
              />
            </div>

            {/* NEW: Poll Type and Duration Controls */}
            <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
              <div className="flex gap-4">
                {(['decision', 'poll'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setPollType(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold uppercase border-2 ${
                      pollType === t
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-gray-700 text-gray-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 bg-gray-900 p-2 rounded-xl border border-gray-700">
                <label className="text-sm font-bold opacity-80 pl-2">Duration (mins):</label>
                <input
                  type="number"
                  min="1"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 1)}
                  disabled={!!editingId}
                  className={`w-20 p-2 rounded-lg bg-gray-800 text-center font-mono border focus:outline-none focus:border-blue-500 ${
                    editingId ? 'border-gray-800 opacity-50 cursor-not-allowed text-yellow-500' : 'border-gray-600'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSavePoll}
                className={`px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors ${
                  editingId ? 'bg-yellow-500 text-black hover:bg-yellow-600' : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {editingId ? 'Save Changes' : 'Launch poll'}
              </button>
              {editingId && (
                <button
                  onClick={cancelEdit}
                  className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider border border-gray-700 text-gray-400 hover:border-gray-500"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ACTIVE / PAST POLLS */}
        <div className="space-y-4">
          {polls.length === 0 && (
            <p className="opacity-50 text-sm">No polls for this event yet.</p>
          )}
          {polls.map((poll) => {
            const r = results[poll.id];
            return (
              <div
                key={poll.id}
                className={`bg-gray-800 rounded-2xl p-6 border transition-all space-y-4 ${editingId === poll.id ? 'border-yellow-500' : 'border-gray-700'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{poll.question}</h3>
                    <span className="text-xs uppercase tracking-wider opacity-50">
                      {poll.type} · {r?.total_votes ?? 0} votes
                    </span>
                  </div>
                  
                  {/* EDIT & DELETE BUTTONS */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(poll)}
                      className="px-3 py-2 rounded-lg text-xs font-bold uppercase border border-gray-700 text-gray-300 hover:border-yellow-500 hover:text-yellow-500 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(poll.id)}
                      className="px-3 py-2 rounded-lg text-xs font-bold uppercase border border-gray-700 text-gray-500 hover:border-red-500 hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {r?.options.map((opt) => (
                    <div key={opt.option_id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{opt.text}</span>
                        <span className="opacity-60">
                          {opt.percentage}% ({opt.weighted_count} wt)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-900 overflow-hidden">
                        <div
                          className="h-full bg-red-500 transition-all duration-500"
                          style={{ width: `${opt.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}