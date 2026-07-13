"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AdminUsersPage() {
  const pathname = usePathname();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all users on load
  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Admin function to manually change a user's tier
  async function handleTierChange(userId: string, currentTier: string) {
    const newTier = currentTier === 'premium' ? 'free' : 'premium';
    
    if (window.confirm(`Are you sure you want to change this user to ${newTier.toUpperCase()}?`)) {
      const { error } = await supabase
        .from('users')
        .update({ tier: newTier })
        .eq('id', userId);

      if (error) {
        alert("Failed to update user tier.");
      } else {
        // Refresh the local state instantly
        setUsers(users.map(u => u.id === userId ? { ...u, tier: newTier } : u));
      }
    }
  }

  // Sidebar Links (Copied to maintain layout)
  const navLinks = [
    { name: 'Dashboard Home', path: '/admin', icon: '🏠' },
    { name: 'Events Management', path: '/admin/events', icon: '📅' },
    { name: 'Seasons & Missions', path: '/admin/seasons', icon: '🎬' },
    { name: 'Behind the Scenes', path: '/admin/bts', icon: '🎥' },
    { name: 'Replay VOD Library', path: '/admin/replays', icon: '📼' },
    { name: 'User Economy', path: '/admin/users', icon: '👥' },
  ];

  // Filter logic for the search bar
  const filteredUsers = users.filter(user => 
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold tracking-widest text-primary uppercase">LAAS Admin</h1>
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
      <main className="flex-1 overflow-y-auto bg-gray-950 p-6 md:p-8">
        
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">User Economy Management</h1>
              <p className="opacity-60 text-sm mt-1">View player points, active tiers, and registration data.</p>
            </div>
            
            <div className="w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Search email or name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80 p-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-950 border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="p-4">Audience Member</th>
                    <th className="p-4">Current Tier</th>
                    <th className="p-4">Live Strength (Points)</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 animate-pulse">Loading database records...</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold">{user.name}</p>
                          <p className="text-xs opacity-60 font-mono">{user.email}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                            user.tier === 'premium' ? 'bg-primary/20 text-primary border-primary/50' : 'bg-gray-800 text-gray-400 border-gray-700'
                          }`}>
                            {user.tier}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🎯</span>
                            <span className="font-bold">{user.points || 0}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm opacity-70">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleTierChange(user.id, user.tier)}
                            className="px-4 py-2 border border-gray-600 rounded-lg text-xs font-bold hover:bg-white hover:text-black transition-colors"
                          >
                            {user.tier === 'premium' ? 'Revoke VIP' : 'Upgrade to VIP'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}