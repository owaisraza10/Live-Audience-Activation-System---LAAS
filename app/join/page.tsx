"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, signUp, getCurrentUser } from '../../lib/api/auth';

export default function JoinPage() {
  const [view, setView] = useState<'tiers' | 'login' | 'signup'>('tiers');
  const router = useRouter();

  // Real Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // --- BULLETPROOF AUTH HANDLER ---
  const handleAuth = async (e: React.FormEvent, isSignup: boolean) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (isSignup) {
        await signUp(email, password);
        setSuccess("Account created successfully! You can now log in.");
        setView('login');
        setPassword(''); 
        setLoading(false);
        return; 
      } else {
        await signIn(email, password);
      }

      const profile = await getCurrentUser();
      
      if (profile) {
        localStorage.setItem('laas_user', JSON.stringify(profile));
        router.push('/behind-the-scenes');
      } else {
        throw "Could not load user profile.";
      }
      
    } catch (err: any) {
      // Print the EXACT error from Supabase
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* AUTH TOGGLE */}
      <div className="flex justify-center pt-4">
        <div className="flex bg-surface-variant p-2 rounded-full" style={{ width: 'fit-content' }}>
          <button 
            onClick={() => { setView('tiers'); setError(''); setSuccess(''); }}
            className={`px-8 py-3 rounded-full font-bold transition-all ${view === 'tiers' || view === 'signup' ? 'bg-primary text-on-primary shadow-md' : 'opacity-70 hover:opacity-100'}`}
          >
            Join LAAS (Sign Up)
          </button>
          <button 
            onClick={() => { setView('login'); setError(''); setSuccess(''); }}
            className={`px-8 py-3 rounded-full font-bold transition-all ${view === 'login' ? 'bg-primary text-on-primary shadow-md' : 'opacity-70 hover:opacity-100'}`}
          >
            Log In
          </button>
        </div>
      </div>

      {/* VIEW 1: TIER SELECTION */}
      {view === 'tiers' && (
        <div className="space-y-12 animate-fade-in">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">Join the Live Audience</h1>
            <p className="text-xl opacity-70">
              Select your tier to activate your account. Your decisions shape the show.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
            {/* FREE TIER */}
            <div className="m3-card flex flex-col border border-gray-200 shadow-none">
              <h2 className="text-2xl font-bold mb-2">Observer (Free)</h2>
              <div className="text-4xl font-bold mb-6">$0<span className="text-lg opacity-60 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-grow opacity-80">
                <li className="flex gap-2"><span>✓</span> Watch live events</li>
                <li className="flex gap-2"><span>✓</span> Access basic chat</li>
                <li className="flex gap-2"><span>✓</span> View live poll results</li>
                <li className="flex gap-2 opacity-40"><span>—</span> Cannot vote on decisions</li>
              </ul>
              <button 
                onClick={() => setView('signup')}
                className="w-full py-3 rounded-full font-bold border-2 transition-colors hover:bg-primary hover:text-on-primary"
                style={{ borderColor: 'var(--m3-primary)', color: 'var(--m3-primary)' }}
              >
                Select Free
              </button>
            </div>

            {/* STANDARD TIER */}
            <div className="m3-card flex flex-col relative scale-105 shadow-md" 
                 style={{ backgroundColor: 'var(--m3-surface-variant)' }}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full">
                Most Popular
              </div>
              <h2 className="text-2xl font-bold mb-2 mt-2">Activator</h2>
              <div className="text-4xl font-bold mb-6">$4.99<span className="text-lg opacity-60 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-grow opacity-80">
                <li className="flex gap-2"><span>✓</span> Watch live events & chat</li>
                <li className="flex gap-2 font-bold text-primary"><span>✓</span> Vote on live decisions</li>
                <li className="flex gap-2"><span>✓</span> Earn standard badges</li>
                <li className="flex gap-2"><span>✓</span> 72-hour Replay (VOD) access</li>
              </ul>
              <Link href="/checkout" className="block w-full">
                <button className="w-full py-3 rounded-full font-bold hover:shadow-lg transition-shadow"
                        style={{ backgroundColor: 'var(--m3-primary)', color: 'var(--m3-on-primary)' }}>
                  Select Standard
                </button>
              </Link>
            </div>

            {/* PREMIUM TIER */}
            <div className="m3-card flex flex-col border-2" 
                 style={{ borderColor: 'var(--m3-primary)' }}>
              <h2 className="text-2xl font-bold mb-2">VIP Legacy</h2>
              <div className="text-4xl font-bold mb-6">$9.99<span className="text-lg opacity-60 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-grow opacity-80">
                <li className="flex gap-2"><span>✓</span> All Standard features</li>
                <li className="flex gap-2 font-bold text-primary"><span>✓</span> 2x Voting Power multiplier</li>
                <li className="flex gap-2"><span>✓</span> Permanent VOD access</li>
                <li className="flex gap-2"><span>✓</span> Exclusive legacy badges</li>
              </ul>
              <Link href="/checkout" className="block w-full">
                <button className="w-full py-3 rounded-full font-bold hover:shadow-lg transition-shadow"
                        style={{ backgroundColor: 'var(--m3-primary)', color: 'var(--m3-on-primary)' }}>
                  Select Premium
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LOGIN FORM */}
      {view === 'login' && (
        <div className="max-w-md mx-auto pt-8 animate-fade-in">
          <div className="m3-card">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary mb-2">Welcome Back</h2>
              <p className="opacity-70">Log in to activate your audience power.</p>
            </div>
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm text-center border border-green-200 font-bold">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center border border-red-200 font-bold">
                {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={(e) => handleAuth(e, false)}>
              <div>
                <label className="block text-sm font-bold mb-2 opacity-80">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full p-4 rounded-[16px] border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 opacity-80">Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full p-4 rounded-[16px] border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-transparent"
                />
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-[28px] font-bold text-lg hover:shadow-lg transition-shadow mt-4 disabled:opacity-50"
                style={{ backgroundColor: 'var(--m3-primary)', color: 'var(--m3-on-primary)' }}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 3: SIGNUP FORM (FREE TIER) */}
      {view === 'signup' && (
        <div className="max-w-md mx-auto pt-8 animate-fade-in">
          <div className="m3-card">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary mb-2">Create Free Account</h2>
              <p className="opacity-70">Create your observer account to watch and chat.</p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center border border-red-200 font-bold">
                {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={(e) => handleAuth(e, true)}>
              <div>
                <label className="block text-sm font-bold mb-2 opacity-80">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full p-4 rounded-[16px] border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 opacity-80">Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min 6 chars)"
                  required
                  minLength={6}
                  className="w-full p-4 rounded-[16px] border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-transparent"
                />
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-[28px] font-bold text-lg hover:shadow-lg transition-shadow mt-4 disabled:opacity-50"
                style={{ backgroundColor: 'var(--m3-primary)', color: 'var(--m3-on-primary)' }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button 
                onClick={() => { setView('tiers'); setError(''); }}
                className="text-sm opacity-60 hover:opacity-100 hover:text-primary transition-all font-bold"
              >
                ← Back to Tiers
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}