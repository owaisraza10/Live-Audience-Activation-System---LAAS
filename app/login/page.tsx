"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase'; // 🔥 Added Supabase import

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Check if this email exists in your Supabase DB
      let { data: dbUser } = await supabase
        .from('users')
        .select('id, points')
        .eq('email', email)
        .maybeSingle();

      let validUserId;

      // 2. If they don't exist in the DB yet, insert them so the Foreign Key passes!
      if (!dbUser) {
        validUserId = crypto.randomUUID();
        const { error } = await supabase.from('users').insert({
          id: validUserId,
          email: email,
          name: email.split('@')[0]
        });
        
        if (error) console.warn("DB Sync Note:", error.message);
      } else {
        validUserId = dbUser.id;
      }

      // 3. Set up the local session using the VALID database ID
      const user = {
        id: validUserId,
        name: email.split('@')[0],
        email: email,
        votesAvailable: 0, // Still set to 0 so you can test the PPV lock screen
        points: dbUser?.points || 120 
      };

      localStorage.setItem('laas_user', JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));
      
      router.push('/live-events'); 
    } catch (err) {
      console.error(err);
      alert("An error occurred while logging in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-black text-white flex justify-center items-center font-sans p-6">
      <div className="w-full max-w-md bg-gray-900 p-8 md:p-10 rounded-2xl border border-gray-800 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-black tracking-widest text-primary inline-block">LAAS</Link>
          <h1 className="text-2xl font-bold mt-4">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-2">Sign in to join the broadcast.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2 opacity-80 uppercase tracking-wider text-xs">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 focus:outline-none focus:border-primary text-white" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 opacity-80 uppercase tracking-wider text-xs">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 focus:outline-none focus:border-primary text-white" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full mt-2 p-4 rounded-xl bg-primary text-on-primary font-bold uppercase tracking-widest hover:brightness-110 disabled:opacity-50">
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-gray-800 pt-6">
          <p className="text-sm text-gray-500">
            Don't have an account? <Link href="/join" className="text-white font-bold hover:text-primary transition-colors">Register for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}