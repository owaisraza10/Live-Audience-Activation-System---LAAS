"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function CheckoutPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock payment handler
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate a 2-second payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  // --- SUCCESS STATE ---
  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-8 animate-fade-in">
        <div className="m3-card max-w-lg w-full text-center space-y-6 py-12">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-primary">Account Activated!</h1>
          <p className="opacity-70 text-lg">
            Your payment was successful. You are now an official Activator for this season.
          </p>
          <div className="pt-6">
            <Link href="/live-events" className="inline-block w-full py-4 rounded-[28px] font-bold text-lg hover:shadow-lg transition-shadow"
                  style={{ backgroundColor: 'var(--m3-primary)', color: 'var(--m3-on-primary)' }}>
              Enter the Live Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- CHECKOUT FORM STATE ---
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Secure Checkout</h1>
        <p className="opacity-70">Complete your purchase to activate your audience power.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* LEFT: PAYMENT FORM */}
        <div className="w-full md:w-2/3 m3-card">
          <h2 className="text-xl font-bold mb-6">Payment Details</h2>
          <form onSubmit={handlePayment} className="space-y-6">
            
            {/* Card Information */}
            <div>
              <label className="block text-sm font-bold mb-2 opacity-80">Card Information</label>
              <div className="border border-gray-300 rounded-[16px] overflow-hidden">
                <input 
                  type="text" 
                  placeholder="Card number"
                  required
                  className="w-full p-4 border-b border-gray-200 focus:outline-none focus:bg-gray-50 bg-transparent"
                />
                <div className="flex">
                  <input 
                    type="text" 
                    placeholder="MM / YY"
                    required
                    className="w-1/2 p-4 border-r border-gray-200 focus:outline-none focus:bg-gray-50 bg-transparent"
                  />
                  <input 
                    type="text" 
                    placeholder="CVC"
                    required
                    className="w-1/2 p-4 focus:outline-none focus:bg-gray-50 bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Billing Name */}
            <div>
              <label className="block text-sm font-bold mb-2 opacity-80">Name on Card</label>
              <input 
                type="text" 
                placeholder="John Doe"
                required
                className="w-full p-4 rounded-[16px] border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-transparent"
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isProcessing}
              className={`w-full py-4 rounded-[28px] font-bold text-lg transition-all flex justify-center items-center gap-2 ${
                isProcessing ? 'opacity-70 cursor-wait' : 'hover:shadow-lg'
              }`}
              style={{ backgroundColor: 'var(--m3-primary)', color: 'var(--m3-on-primary)' }}
            >
              {isProcessing ? 'Processing Payment...' : 'Pay & Activate - $4.99'}
            </button>
            <p className="text-xs text-center opacity-50 mt-4 flex items-center justify-center gap-1">
              🔒 Payments are secure and encrypted.
            </p>
          </form>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="m3-card bg-surface-variant">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            
            <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-4">
              <div>
                <p className="font-bold">Standard Tier</p>
                <p className="text-sm opacity-70">Activator Access</p>
              </div>
              <p className="font-bold">$4.99</p>
            </div>
            
            <div className="flex justify-between items-center text-sm opacity-80 mb-2">
              <p>Subtotal</p>
              <p>$4.99</p>
            </div>
            <div className="flex justify-between items-center text-sm opacity-80 mb-4 border-b border-gray-300 pb-4">
              <p>Tax</p>
              <p>$0.00</p>
            </div>
            
            <div className="flex justify-between items-center text-xl font-bold text-primary">
              <p>Total</p>
              <p>$4.99</p>
            </div>
          </div>
          
          <div className="m3-card shadow-none border border-gray-200">
            <h3 className="font-bold text-sm mb-2">What you get today:</h3>
            <ul className="text-sm space-y-2 opacity-80">
              <li className="flex gap-2"><span>✓</span> Instant Live Voting access</li>
              <li className="flex gap-2"><span>✓</span> Replay & VOD access</li>
              <li className="flex gap-2"><span>✓</span> Base-level profile badges</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}