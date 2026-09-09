"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PPVUser {
  id: string;
  name: string;
  email: string;
  votesAvailable: number;
  points: number;
}

// Inline SVG icons (no lucide-react available in this project)
const IconTicket = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 5v14" strokeDasharray="2 2"/>
  </svg>
);
const IconTrophy = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 5h2a2 2 0 0 1 2 2 4 4 0 0 1-4 4M7 5H5a2 2 0 0 0-2 2 4 4 0 0 0 4 4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconFilm = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" strokeLinecap="round"/>
  </svg>
);
const IconWhale = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 13c2-4 6-6 11-6 4 0 7 2.5 7 5.5S18 18 13 18c-3.5 0-6.5-1.5-8-4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="16" cy="10" r="0.5" fill="currentColor"/>
    <path d="M3 13c-1 1-1.5 2-1.5 2s1 .5 2-.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCheck = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconSpinner = ({ className = "" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25"/>
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);
const IconLogOut = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<PPVUser | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('laas_user');
    if (!session) {
      router.push('/login');
      return;
    }
    try {
      setUser(JSON.parse(session));
    } catch {
      localStorage.removeItem('laas_user');
      router.push('/login');
      return;
    }
    setIsLoadingSession(false);
  }, [router]);

  const handlePurchase = (packId: string, votesToAdd: number) => {
    if (!user) return;
    setIsPurchasing(packId);

    setTimeout(() => {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, votesAvailable: (prev.votesAvailable || 0) + votesToAdd };
        localStorage.setItem('laas_user', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        return updated;
      });

      setIsPurchasing(null);
      setPurchaseSuccess(true);
      setTimeout(() => setPurchaseSuccess(false), 3000);
    }, 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem('laas_user');
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  };

  // Skeleton instead of blank white/black flash while session resolves
  if (isLoadingSession || !user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <IconSpinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  const votePacks = [
    { id: 'pack_1', name: 'Starter Pack', votes: 5, price: '$4.99', popular: false, Icon: IconTicket },
    { id: 'pack_2', name: 'Director Pack', votes: 20, price: '$14.99', popular: true, Icon: IconFilm },
    { id: 'pack_3', name: 'Whale Pack', votes: 100, price: '$49.99', popular: false, Icon: IconWhale },
  ];

  const votingHistory = [
    { id: 1, date: 'Week 3', decision: 'Selected "Endurance Penalty" for Team Alpha', impact: 'Match Lost' },
    { id: 2, date: 'Week 2', decision: 'Granted "Immunity Idol" to Player 4', impact: 'Player Saved' },
    { id: 3, date: 'Week 1', decision: 'Voted for "Water Challenge"', impact: 'Challenge Played' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20 animate-fade-in">

      {/* HEADER */}
      <div className="relative overflow-hidden bg-gray-900 border-b border-gray-800 pt-12 pb-12 px-6">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 20% 0%, rgba(var(--primary-rgb),0.5), transparent 60%)' }}
        />
        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center text-4xl font-black font-heading shadow-[0_0_24px_rgba(var(--primary-rgb),0.35)] shrink-0 ring-2 ring-white/10">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>

          <div className="text-center md:text-left flex-grow">
            <h1 className="font-heading text-3xl md:text-4xl font-black mb-1">{user.name || 'User'}</h1>
            <p className="opacity-60 font-mono text-sm mb-5">{user.email}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Link
                href="/rewards"
                className="px-4 py-2.5 bg-gray-950/80 backdrop-blur border border-gray-800 rounded-2xl text-sm font-bold flex items-center gap-2 hover:border-gray-600 transition-colors shadow-md"
              >
                <IconTrophy className="w-4 h-4 text-pulse-orange" />
                {user.points} Legacy Points
              </Link>
              <div className="px-4 py-2.5 bg-primary/10 backdrop-blur border border-primary/30 text-primary rounded-2xl text-sm font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(var(--primary-rgb),0.15)]">
                <IconTicket className="w-4 h-4" />
                {user.votesAvailable} Votes Available
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS TOAST */}
      {purchaseSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-black px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-fade-in flex items-center gap-2"
        >
          <IconCheck className="w-4 h-4" />
          Payment Successful! Votes added to your balance.
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">

        {/* STORE */}
        <section>
          <div className="mb-8 text-center md:text-left">
            <h2 className="font-heading text-2xl font-bold mb-2">Buy Influence</h2>
            <p className="text-gray-400">Stock up on Pay-Per-Vote packs to swing the narrative during live broadcasts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-6">
  {votePacks.map((pack) => {
    const isThisPurchasing = isPurchasing === pack.id;
    return (
      <div
        key={pack.id}
        className={`relative h-full bg-gray-900 rounded-[28px] p-8 flex flex-col border transition-all ${
          pack.popular
            ? 'border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] md:scale-105'
            : 'border-gray-800 hover:border-gray-600'
        }`}
      >
        {pack.popular && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
            Most Popular
          </div>
        )}

        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <pack.Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-heading text-2xl font-bold mb-2">{pack.name}</h3>
        <div className="text-gray-400 mb-6 font-medium text-sm border-b border-gray-800 pb-6">
          Instant delivery. Never expires.
        </div>

        <div className="mb-8">
          <span className="text-5xl font-black tracking-tighter font-heading">{pack.votes}</span>
          <span className="text-gray-500 font-bold ml-2">Votes</span>
        </div>

        <Link href={`/checkout?pack=${pack.id}`} className="w-full">
  <button 
    className={`mt-auto w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${
      pack.popular 
        ? 'bg-primary text-on-primary hover:brightness-110 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]' 
        : 'bg-gray-800 text-white hover:bg-gray-700'
    } flex justify-center items-center gap-2`}
  >
    Buy for {pack.price}
  </button>
</Link>
      </div>
    );
  })}
</div>
        </section>

        {/* VOTING HISTORY */}
        <section>
          <div className="mb-8">
            <h2 className="font-heading text-2xl font-bold mb-2">Voting History</h2>
            <p className="text-gray-400">A record of your influence on the broadcast.</p>
          </div>

          {votingHistory.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-[28px] p-12 text-center text-gray-500">
              No votes cast yet.
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-[28px] overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-950 text-xs uppercase tracking-wider text-gray-500">
                      <th className="p-6 font-bold">Event</th>
                      <th className="p-6 font-bold">Your Decision</th>
                      <th className="p-6 font-bold">Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votingHistory.map((vote) => (
                      <tr key={vote.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors">
                        <td className="p-6 font-medium text-gray-300 whitespace-nowrap">{vote.date}</td>
                        <td className="p-6 text-white font-bold">{vote.decision}</td>
                        <td className="p-6">
                          <span className="px-3 py-1 bg-gray-950 border border-gray-700 text-gray-300 text-xs font-bold rounded-full">
                            {vote.impact}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* ACCOUNT SETTINGS */}
        <section className="border-t border-gray-800 pt-12">
          <h2 className="text-xl font-bold mb-6 text-gray-400">Account Settings</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-[28px] p-6 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <h3 className="font-bold text-white mb-1">Sign Out</h3>
                <p className="text-sm text-gray-500">Log out of your LAAS account on this device.</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-8 py-3 bg-gray-950 border border-gray-700 hover:border-gray-500 rounded-2xl font-bold text-sm transition-colors w-full md:w-auto flex items-center justify-center gap-2"
              >
                <IconLogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}