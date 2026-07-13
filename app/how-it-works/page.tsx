"use client";

import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white animate-fade-in">
      
      {/* HERO SECTION */}
      <div className="relative py-20 px-8 flex flex-col items-center text-center overflow-hidden border-b border-gray-800">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <p className="text-primary font-bold uppercase tracking-widest text-sm">Welcome to LAAS</p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            You Are Not Just Watching.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              You Are Directing.
            </span>
          </h1>
          <p className="text-xl opacity-80 leading-relaxed max-w-2xl mx-auto">
            The Live Audience Activation System is the first interactive broadcast network where your decisions shape the story in real-time. Here is how you take control.
          </p>
        </div>
      </div>

      {/* THE 3-STEP PROCESS */}
      <div className="max-w-6xl mx-auto px-8 py-20 space-y-24">
        
        {/* Step 1 */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 order-2 md:order-1 space-y-6">
            <div className="w-12 h-12 bg-primary/20 text-primary flex items-center justify-center rounded-full text-xl font-bold">1</div>
            <h2 className="text-3xl font-bold">Observe the Narrative</h2>
            <p className="opacity-70 text-lg leading-relaxed">
              Tune into our weekly live broadcasts or catch up on asynchronous "Missions" through the Season Structure hub. Every broadcast drops participants into high-stakes scenarios where nothing is scripted.
            </p>
          </div>
          <div className="w-full md:w-1/2 order-1 md:order-2">
            <div className="aspect-video bg-gray-800 rounded-[28px] border border-gray-700 flex items-center justify-center shadow-2xl relative overflow-hidden">
               <span className="text-6xl">📺</span>
               <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">LIVE</div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <div className="aspect-square md:aspect-video bg-surface-variant rounded-[28px] border border-gray-700 p-8 flex flex-col justify-center gap-4 shadow-2xl relative overflow-hidden">
               <div className="w-full h-12 bg-gray-800 rounded-xl border-2 border-primary flex items-center px-4 justify-between text-primary font-bold">
                 <span>Drop the supplies</span> <span>→</span>
               </div>
               <div className="w-full h-12 bg-gray-900 rounded-xl border border-gray-700 flex items-center px-4 opacity-50">
                 <span>Keep them starving</span>
               </div>
               <div className="w-full h-12 bg-gray-900 rounded-xl border border-gray-700 flex items-center px-4 opacity-50">
                 <span>Extract the team</span>
               </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-6">
            <div className="w-12 h-12 bg-primary/20 text-primary flex items-center justify-center rounded-full text-xl font-bold">2</div>
            <h2 className="text-3xl font-bold">Make Critical Decisions</h2>
            <p className="opacity-70 text-lg leading-relaxed">
              When the director pushes a "Live Decision," a poll appears on your screen. You have exactly 60 seconds to vote. The winning choice is instantly executed by the participants on screen. You hold their fate in your hands.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 order-2 md:order-1 space-y-6">
            <div className="w-12 h-12 bg-primary/20 text-primary flex items-center justify-center rounded-full text-xl font-bold">3</div>
            <h2 className="text-3xl font-bold">Build Your Live Strength</h2>
            <p className="opacity-70 text-lg leading-relaxed">
              Every action you take is permanently recorded on the blockchain-inspired gamification ledger. Build your "Live Strength" points to unlock legacy badges, exclusive VIP access, and influence multipliers.
            </p>
          </div>
          <div className="w-full md:w-1/2 order-1 md:order-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-6 rounded-[24px] border border-gray-700 text-center flex flex-col items-center gap-2">
                <span className="text-3xl">🎫</span>
                <span className="font-bold">Attend Live</span>
                <span className="text-green-400 font-bold text-sm">+10 Points</span>
              </div>
              <div className="bg-gray-800 p-6 rounded-[24px] border border-gray-700 text-center flex flex-col items-center gap-2">
                <span className="text-3xl">🗳️</span>
                <span className="font-bold">Cast a Vote</span>
                <span className="text-green-400 font-bold text-sm">+5 Points</span>
              </div>
              <div className="bg-gray-800 p-6 rounded-[24px] border border-gray-700 text-center flex flex-col items-center gap-2 col-span-2">
                <span className="text-3xl">🎯</span>
                <span className="font-bold">Complete Weekly Missions</span>
                <span className="text-green-400 font-bold text-sm">+20 Points</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CALL TO ACTION */}
      <div className="bg-gradient-to-t from-black to-gray-900 py-24 text-center px-8 border-t border-gray-800">
        <h2 className="text-4xl font-bold mb-6">Ready to take control?</h2>
        <p className="opacity-70 max-w-xl mx-auto mb-10 text-lg">
          Join thousands of other viewers shaping the narrative. Create your free observer account or upgrade to VIP Legacy for 2x voting power.
        </p>
        <Link 
          href="/join"
          className="inline-block px-10 py-4 bg-primary text-on-primary font-bold text-lg rounded-full uppercase tracking-widest hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] transition-all hover:-translate-y-1"
        >
          Activate Account
        </Link>
      </div>

    </div>
  );
}