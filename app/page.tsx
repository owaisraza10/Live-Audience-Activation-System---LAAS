import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans animate-fade-in flex flex-col">
      
      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden border-b border-gray-200 dark:border-gray-800">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        <div className="inline-block px-4 py-1.5 rounded-full border-2 text-sm font-bold tracking-widest uppercase mb-6"
             style={{ borderColor: 'var(--m3-primary)', color: 'var(--m3-primary)' }}>
          Season 1 is LIVE
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
          Don't just watch the show. <br />
          <span style={{ color: 'var(--m3-primary)' }}>Control the outcome.</span>
        </h1>
        
        <p className="text-xl opacity-80 max-w-2xl mb-10 leading-relaxed">
          Welcome to the Live Audience Activation System. The only streaming platform where your votes instantly change the physical challenges, punishments, and rewards for the cast in real-time.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/join" 
            className="px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-lg"
            style={{ backgroundColor: 'var(--m3-primary)', color: 'var(--m3-on-primary)' }}
          >
            Join the Live Experience
          </Link>
          <Link 
            href="/live-now" 
            className="px-8 py-4 rounded-full font-bold text-lg transition-colors border-2"
            style={{ borderColor: 'var(--m3-surface-variant)', color: 'var(--m3-on-surface)' }}
          >
            Spectate Now
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How LAAS Works</h2>
          <p className="opacity-70 text-lg">Three steps between you and absolute power.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Watch Live', desc: 'Tune in to our 24/7 interactive broadcasts and watch the drama unfold in real-time.', icon: '📺' },
            { step: '02', title: 'Director Pushes a Decision', desc: 'A 30-second window opens. The cast freezes. You get a notification to cast your vote.', icon: '⚡' },
            { step: '03', title: 'The Cast Obeys', desc: 'The winning vote is locked in. The physical environment changes instantly based on your choice.', icon: '🎬' }
          ].map((feature, i) => (
            <div key={i} className="m3-card relative overflow-hidden group border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-6xl mb-6 opacity-80 group-hover:scale-110 transition-transform duration-300 origin-bottom-left">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
              <p className="opacity-70 leading-relaxed">{feature.desc}</p>
              <div className="absolute top-6 right-6 text-6xl font-black opacity-5 group-hover:opacity-10 transition-opacity">
                {feature.step}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MEMBERSHIP TIERS */}
      <section className="py-24 px-6 bg-surface-variant">
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Choose Your Power Level</h2>
            <p className="opacity-70 text-lg">Upgrade to VIP to make your voice deafening.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Standard Tier */}
            <div className="bg-surface p-10 rounded-[32px] border border-gray-200 shadow-sm flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Activator (Standard)</h3>
              <div className="text-4xl font-black mb-6">Free</div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex gap-3"><span>✓</span> <span>Access to Live Video Stream</span></li>
                <li className="flex gap-3"><span>✓</span> <span>1x Voting Power on Live Decisions</span></li>
                <li className="flex gap-3"><span>✓</span> <span>Earn basic Rewards & Badges</span></li>
                <li className="flex gap-3 opacity-50"><span>✕</span> <span>Locked out of Behind the Scenes VODs</span></li>
              </ul>
              <Link href="/join" className="w-full py-4 text-center rounded-xl font-bold border-2 transition-colors hover:bg-gray-100" style={{ borderColor: 'var(--m3-surface-variant)' }}>
                Create Free Account
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="p-10 rounded-[32px] shadow-xl flex flex-col relative overflow-hidden"
                 style={{ backgroundColor: 'var(--m3-primary)', color: 'var(--m3-on-primary)' }}>
              <div className="absolute top-6 right-6 bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Most Powerful
              </div>
              <h3 className="text-2xl font-bold mb-2 text-on-primary">VIP Legacy</h3>
              <div className="text-4xl font-black mb-6">$9.99<span className="text-lg font-normal opacity-80">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-grow font-medium">
                <li className="flex gap-3"><span>✓</span> <span>Everything in Standard</span></li>
                <li className="flex gap-3 font-bold"><span>🔥</span> <span>2x Voting Multiplier (Whale Power)</span></li>
                <li className="flex gap-3"><span>✓</span> <span>Full Access to "The Vault" VOD Library</span></li>
                <li className="flex gap-3"><span>✓</span> <span>Exclusive VIP Chat Badges</span></li>
              </ul>
              <Link href="/checkout" className="w-full py-4 text-center rounded-xl font-bold bg-black text-white hover:bg-gray-900 transition-colors shadow-lg">
                Upgrade to VIP
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 text-center opacity-60 border-t border-gray-200">
        <p className="font-bold mb-2">LAAS © {new Date().getFullYear()}</p>
        <p className="text-sm">The Live Audience Activation System is a real-time engagement experiment.</p>
      </footer>

    </div>
  );
}