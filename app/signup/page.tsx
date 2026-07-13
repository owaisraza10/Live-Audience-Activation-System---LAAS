"use client";

import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="p-8 max-w-md mx-auto space-y-8 animate-fade-in min-h-[calc(100vh-100px)] flex flex-col justify-center">
      
      <div className="m3-card text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Create Free Account</h1>
        <p className="opacity-70 mb-8">Join as an Observer to watch the action unfold.</p>
        
        <form className="space-y-6 text-left" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-bold mb-2 opacity-80">Display Name</label>
            <input 
              type="text" 
              placeholder="e.g. PlayerOne"
              className="w-full p-4 rounded-[16px] border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 opacity-80">Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email"
              className="w-full p-4 rounded-[16px] border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-2 opacity-80">Password</label>
            <input 
              type="password" 
              placeholder="Create a password"
              className="w-full p-4 rounded-[16px] border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-transparent"
            />
          </div>
          
          <Link href="/live-events" className="block w-full pt-4">
            <button 
              type="submit"
              className="w-full py-4 rounded-[28px] font-bold text-lg hover:shadow-lg transition-shadow"
              style={{ backgroundColor: 'var(--m3-primary)', color: 'var(--m3-on-primary)' }}
            >
              Create Account
            </button>
          </Link>
        </form>

        <p className="text-sm opacity-60 mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

    </div>
  );
}