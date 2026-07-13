"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
// Note: this is a plain JSX file; TypeScript-only `import type` and inline type annotations removed
import { getLiveEvent, getUpcomingEvents, getReplayEvents } from '../../lib/api/events';

export default function LiveEventsHub() {
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('live');
  const [isLoading, setIsLoading] = useState(true);

  // --- DATA STATE ---
  const [liveEvent, setLiveEvent] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [replayEvents, setReplayEvents] = useState([]);

  // Fetch real data from your mock API
  async function fetchEvents() {
    // Fetch all event categories simultaneously for speed
    const [live, upcoming, replays] = await Promise.all([
      getLiveEvent(),
      getUpcomingEvents(),
      getReplayEvents()
    ]);
    
    setLiveEvent(live);
    setUpcomingEvents(upcoming);
    setReplayEvents(replays);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchEvents();

    // Listen for storage events (Instant updates when Admin makes a change!)
    window.addEventListener('storage', fetchEvents);
    return () => window.removeEventListener('storage', fetchEvents);
  }, []);

  // Helper to format ISO dates to readable strings
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl font-bold opacity-50">Loading Events...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* PAGE HEADER & TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Live Events Hub</h1>
          <p className="opacity-70 text-lg">Watch, interact, and catch up on past missions.</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-surface-variant p-2 rounded-full" style={{ width: 'fit-content' }}>
          <button 
            onClick={() => setActiveTab('live')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'live' ? 'bg-primary text-on-primary shadow-md' : 'opacity-70 hover:opacity-100'}`}
          >
            Live Now
          </button>
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'upcoming' ? 'bg-primary text-on-primary shadow-md' : 'opacity-70 hover:opacity-100'}`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setActiveTab('replay')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'replay' ? 'bg-primary text-on-primary shadow-md' : 'opacity-70 hover:opacity-100'}`}
          >
            Replays
          </button>
        </div>
      </div>

      {/* ----------------- TAB: LIVE NOW ----------------- */}
      {activeTab === 'live' && (
        <section className="space-y-6 animate-fade-in">
          {liveEvent ? (
            <div className="m3-card flex flex-col md:flex-row gap-8 border-2" style={{ borderColor: 'var(--m3-primary)' }}>
              {/* Fake Video Player (Thumbnail/Embed hook) */}
              <div className="w-full md:w-2/3 bg-black rounded-[16px] flex items-center justify-center aspect-video relative overflow-hidden">
                 <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  LIVE
                </div>
                {/* We just show a banner here, actual watching happens in /live-now */}
                <span className="text-white font-bold text-2xl tracking-widest uppercase opacity-50">
                  Broadcast In Progress
                </span>
              </div>
              
              {/* Event Info */}
              <div className="w-full md:w-1/3 flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-4">{liveEvent.title}</h2>
                <p className="opacity-80 mb-6 text-lg">{liveEvent.description}</p>
                <Link href="/live-now" className="block w-full">
                 <button className="bg-primary text-on-primary w-full py-4 rounded-[28px] font-bold text-lg hover:shadow-lg transition-shadow">
                  Enter Interactive Panel
                 </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="m3-card text-center py-20 border border-gray-200">
              <h2 className="text-2xl font-bold opacity-60">No Live Event Right Now</h2>
              <p className="opacity-50 mt-2">Check the Upcoming tab for the next broadcast.</p>
            </div>
          )}
        </section>
      )}

      {/* ----------------- TAB: UPCOMING ----------------- */}
      {activeTab === 'upcoming' && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {upcomingEvents.length === 0 && (
            <div className="col-span-full text-center py-12 opacity-50 font-bold">No upcoming events scheduled.</div>
          )}
          {upcomingEvents.map(event => (
            <div key={event.id} className="m3-card flex flex-col border border-gray-200">
              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
              <p className="text-sm font-bold text-primary mb-4">{formatDate(event.start_time)}</p>
              <p className="opacity-80 mb-6 flex-grow">{event.description || 'No description provided.'}</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-surface-variant text-on-surface py-2 rounded-full font-bold text-sm hover:opacity-80">
                  Set Reminder
                </button>
                <Link href="/live-now" className="flex-1">
                  <button className="w-full bg-primary text-on-primary py-2 rounded-full font-bold text-sm hover:shadow-md">
                    Waiting Room
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ----------------- TAB: REPLAY ----------------- */}
      {activeTab === 'replay' && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {replayEvents.length === 0 && (
            <div className="col-span-full text-center py-12 opacity-50 font-bold">No past events available for replay.</div>
          )}
          {replayEvents.map(event => (
            <div key={event.id} className="m3-card flex flex-col group cursor-pointer border border-gray-200">
              {/* VOD Thumbnail Placeholder */}
              <div className="w-full h-48 bg-gray-900 rounded-[16px] mb-4 flex items-center justify-center relative overflow-hidden">
                <span className="opacity-50 font-bold text-white uppercase tracking-widest text-sm">VOD Offline</span>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-bold">
                  REPLAY
                </div>
              </div>
              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{event.title}</h3>
              <p className="text-sm opacity-60 mt-1 mb-4">{formatDate(event.start_time)}</p>
              <Link href="/behind-the-scenes" className="mt-auto">
                <button className="w-full bg-surface-variant text-on-surface py-2 rounded-full font-bold group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  View in The Vault
                </button>
              </Link>
            </div>
          ))}
        </section>
      )}

    </div>
  );
}