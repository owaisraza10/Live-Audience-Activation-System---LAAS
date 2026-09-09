"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Interface matching our PPV User
interface PPVUser {
  id: string;
  name: string;
  email: string;
  votesAvailable: number;
  points: number;
}

export default function BuyVotesPage() {
  const router = useRouter();
  const [user, setUser] = useState<PPVUser | null>(null);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('laas_user');
    if (!session) {
      router.push('/join');
      return;
    }
    setUser(JSON.parse(session));
  }, [router]);

  const handlePurchase = (packId: string, votesToAdd: number) => {
    if (!user) return;
    setIsPurchasing(packId);

    // Mocking the payment gateway processing time
    setTimeout(() => {
      const newBalance = (user.votesAvailable || 0) + votesToAdd;
      const updatedUser = { ...user, votesAvailable: newBalance };
      
      // Update local state and storage
      setUser(updatedUser);
      localStorage.setItem('laas_user', JSON.stringify(updatedUser));
      
      setIsPurchasing(null);
      setPurchaseSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setPurchaseSuccess(false), 3000);
    }, 1500);
  };

  if (!user) return null;

  const votePacks = [
    { id: 'pack_1', name: 'Starter Pack', votes: 5, price: '$4.99', popular: false, icon: '🎟️' },
    { id: 'pack_2', name: 'Director Pack', votes: 20, price: '$14.99', popular: true, icon: '🎬' },
    { id: 'pack_3', name: 'Whale Pack', votes: 100, price: '$49.99', popular: false, icon: '🐋' }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20">
      {/* Header Section */}
      <div className="bg-gray-900 border-b border-gray-800 pt-16 pb-12 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Boost Your Influence</h1>
        <p className="opacity-70 text-lg max-w-2xl mx-auto mb-8">
          Out of votes? Stock up on decisions and swing the narrative in your favor. Pay only for the influence you want.
        </p>
        
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-950 border border-gray-800 rounded-2xl shadow-lg">
          <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Current Balance:</span>
          <span className="text-2xl font-bold text-primary flex items-center gap-2">
            🎟️ {user.votesAvailable}
          </span>
        </div>
      </div>

      {/* Success Toast */}
      {purchaseSuccess && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-black px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-fade-in flex items-center gap-2">
          <span>✅</span> Payment Successful! Votes added to your balance.
        </div>
      )}

      {/* Pricing Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {votePacks.map((pack) => (
            <div 
              key={pack.id} 
              className={`relative bg-gray-900 rounded-3xl p-8 flex flex-col border transition-all ${
                pack.popular 
                  ? 'border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] transform md:-translate-y-4' 
                  : 'border-gray-800 hover:border-gray-600'
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-on-primary px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}
              
              <div className="text-5xl mb-4">{pack.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{pack.name}</h3>
              <div className="text-gray-400 mb-6 font-medium text-sm border-b border-gray-800 pb-6">
                Instant delivery. Never expires.
              </div>
              
              <div className="mb-8">
                <span className="text-5xl font-black tracking-tighter">{pack.votes}</span>
                <span className="text-gray-500 font-bold ml-2">Votes</span>
              </div>
              
              <button 
                onClick={() => handlePurchase(pack.id, pack.votes)}
                disabled={isPurchasing !== null}
                className={`mt-auto w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${
                  pack.popular 
                    ? 'bg-primary text-on-primary hover:brightness-110 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]' 
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                } disabled:opacity-50 flex justify-center items-center gap-2`}
              >
                {isPurchasing === pack.id ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>Buy for {pack.price}</>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Return to Action */}
        <div className="mt-16 text-center">
          <Link href="/live-events">
            <button className="px-8 py-4 bg-gray-900 border border-gray-700 text-white font-bold rounded-xl hover:border-primary transition-colors">
              ← Return to Live Stream
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}