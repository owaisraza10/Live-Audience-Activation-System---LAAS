"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AdminDashboardHome() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [savingLimits, setSavingLimits] = useState(false);
  
  // Dynamic Stats State
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPoints: 0,
    totalVotes: 0
  });

  // Vote Limits State
  const [limits, setLimits] = useState({
    free: 1,
    standard: 3,
    premium: 5
  });

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { data: usersData } = await supabase.from('users').select('points');
        const totalPoints = usersData?.reduce((acc, user) => acc + (user.points || 0), 0) || 0;
        const { count: votesCount } = await supabase.from('votes').select('*', { count: 'exact', head: true });

        // Safely fetch settings
        const { data: settingsData, error: settingsError } = await supabase.from('app_settings').select('*');
        
        if (settingsError) {
          console.error("Database Error (Settings):", settingsError.message);
        } else if (settingsData) {
          const limitMap: any = { free: 1, standard: 3, premium: 5 };
          settingsData.forEach(item => {
            if (item.key === 'free_vote_limit') limitMap.free = item.value;
            if (item.key === 'standard_vote_limit') limitMap.standard = item.value;
            if (item.key === 'premium_vote_limit') limitMap.premium = item.value;
          });
          setLimits(limitMap);
        }

        setStats({
          totalUsers: userCount || 0,
          totalPoints: totalPoints,
          totalVotes: votesCount || 0
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // SECURE SAVE WITH STRICT ERROR CATCHING
  const handleSaveLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLimits(true);
    
    // The supabase library returns an { error } object if it fails, it doesn't throw a catchable JS error!
    const { error } = await supabase.from('app_settings').upsert([
      { key: 'free_vote_limit', value: Number(limits.free) },
      { key: 'standard_vote_limit', value: Number(limits.standard) },
      { key: 'premium_vote_limit', value: Number(limits.premium) }
    ]);

    setSavingLimits(false);

    // Now it will actually tell you if it failed!
    if (error) {
      console.error("Failed to save limits:", error);
      alert(`Database Error: ${error.message}`);
    } else {
      alert("✅ Vote limits updated successfully!");
    }
  };

  const navLinks = [
    { name: 'Dashboard Home', path: '/admin', icon: '🏠' },
    { name: 'Events Management', path: '/admin/events', icon: '📅' },
    { name: 'Seasons & Missions', path: '/admin/seasons', icon: '🎬' },
    { name: 'Behind the Scenes', path: '/admin/bts', icon: '🎥' },
    { name: 'Replay VOD Library', path: '/admin/replays', icon: '📼' },
    { name: 'User Economy', path: '/admin/users', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold tracking-widest text-primary uppercase">LAAS Admin</h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">Command Center</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link key={link.name} href={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive ? 'bg-primary/10 text-primary border border-primary/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}>
                <span className="text-lg">{link.icon}</span> {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-gray-950">
        <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 p-6 sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            <p className="text-sm opacity-60">Live platform metrics and tier configurations.</p>
          </div>
        </header>

        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-fade-in">
          
          {/* DYNAMIC METRICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Registered Users', value: loading ? '...' : stats.totalUsers, icon: '👥' },
              { label: 'Total Votes Cast', value: loading ? '...' : stats.totalVotes, icon: '🗳️' },
              { label: 'Economy Points Mined', value: loading ? '...' : stats.totalPoints.toLocaleString(), icon: '🎯' },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-2xl">{stat.icon}</span>
                  {!loading && <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">Live</span>}
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* TIER VOTE LIMIT SETTER CONFIGURATION PANEL */}
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-primary">⚙️</span> Audience Tier Vote Limits
                </h3>
                <p className="text-sm opacity-60 mt-1">Configure how many total poll decisions each tier can make per live event.</p>
              </div>
            </div>

            <form onSubmit={handleSaveLimits} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Free Tier Limit</label>
                <input 
                  type="number" min="1" max="100"
                  value={limits.free}
                  onChange={(e) => setLimits({ ...limits, free: parseInt(e.target.value) || 1 })}
                  className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl font-mono text-white focus:border-primary outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-400">Standard Tier Limit</label>
                <input 
                  type="number" min="1" max="100"
                  value={limits.standard}
                  onChange={(e) => setLimits({ ...limits, standard: parseInt(e.target.value) || 1 })}
                  className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl font-mono text-white focus:border-primary outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-yellow-400">Premium Tier Limit</label>
                <input 
                  type="number" min="1" max="100"
                  value={limits.premium}
                  onChange={(e) => setLimits({ ...limits, premium: parseInt(e.target.value) || 1 })}
                  className="w-full p-4 bg-gray-950 rounded-xl font-mono text-white outline-none border border-yellow-500/50 focus:border-yellow-400 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                  required
                />
              </div>

              <div className="md:col-span-3 flex justify-end pt-4">
                <button 
                  type="submit" disabled={savingLimits}
                  className="px-8 py-3 bg-primary text-on-primary font-bold uppercase tracking-widest rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-lg"
                >
                  {savingLimits ? 'Saving Configuration...' : 'Save Vote Limits'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}