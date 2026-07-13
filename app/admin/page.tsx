"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AdminDashboardHome() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  
  // Dynamic Stats State
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    totalPoints: 0,
    totalVotes: 0
  });

  useEffect(() => {
    async function fetchDashboardStats() {
      setLoading(true);
      try {
        // 1. Get Total Users
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // 2. Get Premium Users
        const { count: premiumCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('tier', 'premium');

        // 3. Calculate Total Economy Points
        const { data: usersData } = await supabase.from('users').select('points');
        const totalPoints = usersData?.reduce((acc, user) => acc + (user.points || 0), 0) || 0;

        // 4. Get Total Votes Cast
        const { count: votesCount } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalUsers: userCount || 0,
          premiumUsers: premiumCount || 0,
          totalPoints: totalPoints,
          totalVotes: votesCount || 0
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

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
            <p className="text-sm opacity-60">Live platform metrics and health.</p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-green-900/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Database Connected
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-fade-in">
          
          {/* DYNAMIC METRICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Registered', value: loading ? '...' : stats.totalUsers, icon: '👥' },
              { label: 'Premium Activators', value: loading ? '...' : stats.premiumUsers, icon: '⭐' },
              { label: 'Total Votes Cast', value: loading ? '...' : stats.totalVotes, icon: '🗳️' },
              { label: 'Economy Points', value: loading ? '...' : stats.totalPoints.toLocaleString(), icon: '🎯' },
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

          {/* QUICK ACTIONS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/admin/events" className="group bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-primary transition-colors">
              <span className="text-4xl block mb-4">📅</span>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Manage Live Events</h3>
              <p className="opacity-60 text-sm">Create, edit, and push live broadcasts to the audience.</p>
            </Link>

            <Link href="/admin/seasons" className="group bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-primary transition-colors">
              <span className="text-4xl block mb-4">🎬</span>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Story & Missions</h3>
              <p className="opacity-60 text-sm">Update the season timeline and configure asynchronous missions.</p>
            </Link>

            <Link href="/admin/users" className="group bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-primary transition-colors">
              <span className="text-4xl block mb-4">👥</span>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">User Economy</h3>
              <p className="opacity-60 text-sm">View registered users, track points, and manage premium tiers.</p>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}