"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase'; // 🔥 Added Supabase import

export default function JoinPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    agreedToTerms: false
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms) {
      alert("You must agree to the Terms of Service to join LAAS.");
      return;
    }

    setIsLoading(true);

    try {
      const newUserId = crypto.randomUUID();

      // 🔥 INSERT THE USER INTO SUPABASE SO THEY OFFICIALLY EXIST
      const { error } = await supabase.from('users').insert({
        id: newUserId,
        email: formData.email,
        name: formData.name,
      });

      if (error) {
        console.warn("DB Insert Note:", error.message);
      }

      // Create the local session
      const newUser = {
        id: newUserId,
        name: formData.name,
        email: formData.email,
        country: formData.country,
        votesAvailable: 1, // First vote is free!
        points: 0
      };

      localStorage.setItem('laas_user', JSON.stringify(newUser));
      window.dispatchEvent(new Event('storage'));
      
      router.push('/live-events');
    } catch (err) {
      console.error(err);
      alert("Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-black text-white flex flex-col md:flex-row font-sans">
      
      {/* LEFT SIDE: The LAAS Model Explanation */}
      <div className="w-full md:w-1/2 bg-gray-950 p-8 md:p-16 flex flex-col justify-center border-r border-gray-800">
        <div className="max-w-md mx-auto md:mx-0">
          <Link href="/" className="text-4xl font-black tracking-widest text-primary mb-8 inline-block">
            LAAS
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Shape the Narrative.
          </h1>
          <p className="text-gray-400 text-lg mb-12">
            Join the next generation of interactive broadcasting. No subscriptions. No monthly fees. You control how much influence you exert.
          </p>

          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center shrink-0 text-xl">🎟️</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Register Free</h3>
                <p className="text-gray-500 text-sm">Sign up in seconds. No credit card required.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center shrink-0 text-xl text-primary">🎁</div>
              <div>
                <h3 className="font-bold text-lg mb-1 text-primary">Your First Vote is Free</h3>
                <p className="text-gray-500 text-sm">Jump straight into the broadcast and make your first live decision on us.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center shrink-0 text-xl">⚡</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Pay-per-Vote & Boosts</h3>
                <p className="text-gray-500 text-sm">Want to swing the vote? Buy extra votes or Boost Influence only when you need it.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center shrink-0 text-xl">🏆</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Audience Legacy System</h3>
                <p className="text-gray-500 text-sm">Earn badges and rewards based on your interactions and tasks. Marketing status is earned, never bought.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Registration Form */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-gray-900 relative">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-3xl font-bold mb-2">Create your account</h2>
          <p className="text-gray-400 mb-8">Enter your details to claim your free vote.</p>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2 opacity-80 uppercase tracking-wider text-xs">Full Name</label>
              <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="John Doe" className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 focus:outline-none focus:border-primary text-white" />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 opacity-80 uppercase tracking-wider text-xs">Email Address</label>
              <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 focus:outline-none focus:border-primary text-white" />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 opacity-80 uppercase tracking-wider text-xs">Country</label>
              <select required value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 focus:outline-none focus:border-primary text-white appearance-none">
                <option value="" disabled>Select your country...</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="IN">India</option>
                <option value="EU">Europe (Other)</option>
                <option value="OT">Other</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-1">
                  <input type="checkbox" required checked={formData.agreedToTerms} onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})} className="w-5 h-5 rounded border-gray-700 bg-gray-950 appearance-none checked:bg-primary checked:border-primary transition-colors cursor-pointer peer" />
                  <span className="absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none font-bold text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and acknowledge that my marketing and legacy status will be determined solely by my activity on the platform.
                </span>
              </label>
            </div>

            <button type="submit" disabled={isLoading} className="w-full mt-4 p-4 rounded-xl bg-primary text-on-primary font-bold uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
              {isLoading ? 'Creating Account...' : 'Join & Claim Free Vote'}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-gray-800 pt-6">
            <p className="text-sm text-gray-500">
              Already have an account? <Link href="/login" className="text-white font-bold hover:text-primary transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}