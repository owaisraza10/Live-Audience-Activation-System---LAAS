"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Interface matching our PPV User
interface PPVUser {
  id: string;
  name: string;
  email: string;
  votesAvailable: number;
  points: number;
}

const VOTE_PACKS = {
  pack_1: { name: 'Starter Pack', votes: 5, price: 4.99, icon: '🎟️' },
  pack_2: { name: 'Director Pack', votes: 20, price: 14.99, icon: '🎬' },
  pack_3: { name: 'Whale Pack', votes: 100, price: 49.99, icon: '🐋' }
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packId = searchParams.get('pack') || 'pack_1';
  
  // Safely fallback to pack_1 if they somehow pass a bad ID
  const selectedPack = VOTE_PACKS[packId as keyof typeof VOTE_PACKS] || VOTE_PACKS['pack_1'];

  const [user, setUser] = useState<PPVUser | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mock Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('laas_user');
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(session));
  }, [router]);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsProcessing(true);

    // Mocking Payment Gateway Delay
    setTimeout(() => {
      const newBalance = (user.votesAvailable || 0) + selectedPack.votes;
      const updatedUser = { ...user, votesAvailable: newBalance };
      
      localStorage.setItem('laas_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage')); // Update navbar instantly
      
      setSuccess(true);
      
      // Redirect to live stream after 2 seconds
      setTimeout(() => {
        router.push('/live-events');
      }, 2000);
    }, 2000);
  };

  if (!user) return null;

  if (success) {
    return (
      <div className="min-h-[calc(100vh-76px)] bg-black text-white flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-black text-5xl mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
          ✓
        </div>
        <h1 className="text-3xl font-black mb-2">Payment Successful!</h1>
        <p className="text-gray-400 text-lg mb-8 text-center max-w-md">
          {selectedPack.votes} votes have been added to your account. Redirecting you to the live broadcast...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-76px)] bg-black text-white font-sans py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/profile" className="text-gray-500 hover:text-white font-bold text-sm mb-8 inline-block transition-colors">
          ← Back to Profile
        </Link>

        <h1 className="text-3xl md:text-4xl font-black mb-10">Secure Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* PAYMENT FORM */}
          <div className="w-full lg:w-3/5 bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span>💳</span> Payment Details
            </h2>
            
            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label className="block text-xs font-bold mb-2 opacity-80 uppercase tracking-wider text-gray-400">Cardholder Name</label>
                <input 
                  required 
                  type="text" 
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 focus:outline-none focus:border-primary text-white transition-colors" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 opacity-80 uppercase tracking-wider text-gray-400">Card Number</label>
                <input 
                  required 
                  type="text"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="XXXX XXXX XXXX XXXX"
                  className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 focus:outline-none focus:border-primary text-white font-mono transition-colors" 
                />
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-xs font-bold mb-2 opacity-80 uppercase tracking-wider text-gray-400">Expiry (MM/YY)</label>
                  <input 
                    required 
                    type="text"
                    maxLength={5}
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 focus:outline-none focus:border-primary text-white font-mono transition-colors" 
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-bold mb-2 opacity-80 uppercase tracking-wider text-gray-400">CVC</label>
                  <input 
                    required 
                    type="password"
                    maxLength={4}
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="•••"
                    className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 focus:outline-none focus:border-primary text-white font-mono transition-colors" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full mt-6 p-4 rounded-xl bg-primary text-on-primary font-bold uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] flex justify-center items-center gap-2"
              >
                {isProcessing ? (
                  <span className="animate-pulse">Processing Payment...</span>
                ) : (
                  <>Pay ${selectedPack.price.toFixed(2)}</>
                )}
              </button>
              <p className="text-center text-xs text-gray-600 font-medium">
                🔒 Secure 256-bit SSL encryption
              </p>
            </form>
          </div>

          {/* ORDER SUMMARY */}
          <div className="w-full lg:w-2/5">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8 sticky top-24">
              <h2 className="text-xl font-bold mb-6 text-gray-300">Order Summary</h2>
              
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-800">
                <div className="text-4xl">{selectedPack.icon}</div>
                <div>
                  <h3 className="font-bold text-lg">{selectedPack.name}</h3>
                  <p className="text-primary font-bold text-sm">+{selectedPack.votes} Votes Added</p>
                </div>
              </div>

              <div className="space-y-4 text-sm font-medium text-gray-400 mb-6 pb-6 border-b border-gray-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">${selectedPack.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span className="text-white">$0.00</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-lg">Total</span>
                <span className="text-3xl font-black text-white">${selectedPack.price.toFixed(2)}</span>
              </div>

              <div className="bg-gray-900 rounded-xl p-4 text-xs text-gray-500 leading-relaxed border border-gray-800">
                By confirming this purchase, you agree to the LAAS Terms of Service. Votes are non-refundable and never expire. 
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Wrapping in Suspense is required by Next.js when using useSearchParams()
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}