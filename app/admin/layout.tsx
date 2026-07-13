"use client";

import { useState, useEffect } from 'react';

// Inline icons (no external dependency required)
const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 7 11 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 7 11 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const ShieldAlertIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const FingerprintIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 10a2 2 0 0 0-2 2c0 1.5-.5 2.8-1 4" />
    <path d="M12 6a6 6 0 0 1 6 6c0 1.7-.3 3.3-1 4.7" />
    <path d="M6 18a10 10 0 0 0 1.5-5.4A4.5 4.5 0 0 1 12 8" />
    <path d="M2 12a10 10 0 0 1 18-6" />
    <path d="M8 20a12 12 0 0 0 1.8-3" />
    <path d="M17 20.4a14 14 0 0 0 1.5-3.4" />
  </svg>
);

export default function AdminSecurityLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Login Form State
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  // ⚠️ CUSTOM ADMIN CREDENTIALS ⚠️
  // Set these to whatever you want. This is completely separate from your Supabase database.
  const CUSTOM_ADMIN_ID = "admin";
  const CUSTOM_ADMIN_PASS = "laas2026";

  // Check if they already logged in during this browser session
  useEffect(() => {
    const authStatus = sessionStorage.getItem('laas_custom_admin');
    if (authStatus === 'granted') {
      setIsAuthorized(true);
    }
    setLoading(false);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verify against your custom hardcoded credentials
    if (adminId === CUSTOM_ADMIN_ID && password === CUSTOM_ADMIN_PASS) {
      sessionStorage.setItem('laas_custom_admin', 'granted');
      setIsAuthorized(true);
    } else {
      setError("Access Denied: Invalid Admin ID or Password.");
      setPassword(''); // Wipe password on failure for security
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <div className="relative w-16 h-16 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <FingerprintIcon className="absolute inset-0 m-auto w-6 h-6 text-primary" />
          </div>
          <p className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-white/50">
            Loading Security Protocol
          </p>
        </div>
      </div>
    );
  }

  // If not authorized, render the Custom Login Screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[150px]" />
        </div>

        {/* Grid texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div
          className={`w-full max-w-md relative z-10 ${shake ? 'animate-shake' : ''}`}
        >
          <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

            {/* Icon badge */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <LockIcon className="w-7 h-7 text-primary" strokeWidth={2} />
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-wide text-white uppercase mb-2">
                System Admin
              </h1>
              <p className="text-white/40 text-sm">Isolated network — enter credentials to continue</p>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-red-950/40 border border-red-500/30 text-red-400 text-sm font-medium rounded-xl animate-fade-in">
                <ShieldAlertIcon className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold mb-2 text-white/50 uppercase tracking-widest">
                  Admin ID
                </label>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter Admin ID"
                  required
                  autoComplete="username"
                  className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-white placeholder:text-white/25 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-2 text-white/50 uppercase tracking-widest">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-3.5 pr-12 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-white placeholder:text-white/25 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-2 rounded-xl bg-primary text-on-primary font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.45)] hover:brightness-110 active:scale-[0.98] transition-all duration-200"
              >
                Secure Login
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] text-white/25 font-mono tracking-wide">
              🔒 Session-based access · not linked to Supabase
            </p>
          </div>
        </div>

        <style jsx global>{`
          @keyframes shake {
            10%, 90% { transform: translateX(-1px); }
            20%, 80% { transform: translateX(2px); }
            30%, 50%, 70% { transform: translateX(-4px); }
            40%, 60% { transform: translateX(4px); }
          }
          .animate-shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.25s ease-out;
          }
        `}</style>
      </div>
    );
  }

  // If authorized, render the actual Admin Panel
  return <>{children}</>;
}