import Link from 'next/link';

// Inline SVG icons (no lucide-react in this project)
const IconTicket = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 5v14" strokeDasharray="2 2"/>
  </svg>
);
const IconTV = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="6" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 2 12 6 16 2M8 20h8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconBolt = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconClapper = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 8.5 19 5l1 4-15 3.5L4 8.5Z" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="4" y="10" width="16" height="10" rx="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 8 9 12M12 7l1 4M16 6l1 4" strokeLinecap="round"/>
  </svg>
);
const IconGift = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="9" width="18" height="12" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 9v-1a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1M12 6v15M8 6a2.5 2.5 0 0 1 0-5c1.5 0 4 2 4 5M16 6a2.5 2.5 0 0 0 0-5c-1.5 0-4 2-4 5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconTrophy = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 5h2a2 2 0 0 1 2 2 4 4 0 0 1-4 4M7 5H5a2 2 0 0 0-2 2 4 4 0 0 0 4 4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconVideo = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="6" width="14" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="m16 10 6-3v10l-6-3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconArrowRight = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconEye = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const howItWorks = [
  { step: '01', title: 'Watch Live', desc: 'Tune in to our interactive broadcasts and watch the drama unfold in real-time.', Icon: IconTV, accent: 'primary' },
  { step: '02', title: 'A Decision Appears', desc: 'A limited window opens. The cast freezes. You cast your vote to decide their fate.', Icon: IconBolt, accent: 'orange' },
  { step: '03', title: 'The Cast Obeys', desc: 'The winning vote is locked in. The physical environment changes instantly based on the audience.', Icon: IconClapper, accent: 'teal' },
];

const modelFeatures = [
  { title: 'First Vote is Free', desc: 'Register an account and your first live decision is completely on the house.', Icon: IconGift, highlighted: true },
  { title: 'Pay-Per-Vote', desc: 'Want to keep swinging the narrative? Buy vote packs starting at just $4.99. No recurring fees.', Icon: IconTicket, highlighted: false },
  { title: 'Audience Legacy', desc: 'Earn badges and platform status strictly through participation. Influence cannot be bought.', Icon: IconTrophy, highlighted: false },
  { title: 'Unlocked Vault', desc: 'All Behind-The-Scenes content, 24/7 cameras, and raw footage are free for registered users.', Icon: IconVideo, highlighted: false },
];

const stats = [
  { label: 'Votes Cast This Season', value: '482K+' },
  { label: 'Live Broadcast Hours', value: '640+' },
  { label: 'Active Voters Tonight', value: '9,204' },
  { label: 'Subscription Required', value: '$0' },
];

const accentClasses: Record<string, string> = {
  primary: 'bg-primary/15 border-primary/40 text-primary',
  orange: 'bg-pulse-orange/15 border-pulse-orange/40 text-pulse-orange',
  teal: 'bg-telemetry-teal/15 border-telemetry-teal/40 text-telemetry-teal',
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen text-white font-sans animate-fade-in flex flex-col overflow-x-hidden bg-[#08080b]">

      {/* AMBIENT BACKGROUND — fixed, sits behind every section so the theme carries the whole way down */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[#08080b]" />
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-primary/25 blur-[160px] rounded-full" />
        <div className="absolute top-[28%] -right-40 w-[550px] h-[550px] bg-telemetry-teal/15 blur-[160px] rounded-full" />
        <div className="absolute top-[55%] left-[10%] w-[500px] h-[500px] bg-pulse-orange/12 blur-[150px] rounded-full" />
        <div className="absolute top-[80%] right-[15%] w-[450px] h-[450px] bg-primary/12 blur-[150px] rounded-full" />
        <div className="absolute top-[100%] left-[30%] w-[400px] h-[400px] bg-telemetry-teal/10 blur-[140px] rounded-full" />

        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', backgroundSize: '48px 48px' }}
        />
        {/* film-grain texture so the dark areas don't look flat/banded */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] mix-blend-overlay">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-28 overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/15 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/50 bg-primary/10 backdrop-blur text-primary text-sm font-bold tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Season 1 is LIVE
        </div>

        <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tight mb-6 max-w-4xl leading-[1.1] drop-shadow-lg">
          Don't just watch the show. <br />
          <span className="bg-gradient-to-r from-primary via-primary to-telemetry-teal bg-clip-text text-transparent">
            Control the outcome.
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed font-medium">
          Welcome to LAAS. The only interactive streaming platform where your votes instantly change the physical challenges, punishments, and rewards for the cast in real-time. No subscriptions required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/join"
            className="group px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:brightness-110 shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] bg-primary text-on-primary uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <IconTicket className="w-5 h-5" />
            Claim Free Vote
            <IconArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/live-events"
            className="px-8 py-4 rounded-2xl font-bold text-lg transition-colors border-2 border-white/10 hover:border-white/25 bg-white/5 backdrop-blur text-white uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <IconEye className="w-5 h-5" />
            Spectate Live
          </Link>
        </div>

        {/* STATS STRIP */}
        <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4 py-6 rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-heading text-2xl md:text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-[11px] md:text-xs uppercase tracking-wider text-gray-500 font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-black uppercase tracking-widest">The Loop</span>
          <h2 className="font-heading text-4xl font-bold mt-2 mb-4">How LAAS Works</h2>
          <p className="text-gray-400 text-lg">Three steps between you and absolute power.</p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="hidden md:block absolute top-[52px] left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-primary/40 via-pulse-orange/40 to-telemetry-teal/40" />

          {howItWorks.map((feature) => (
            <div
              key={feature.step}
              className="relative bg-white/[0.04] backdrop-blur-xl rounded-[28px] p-8 overflow-hidden group border border-white/10 hover:border-primary/50 transition-all shadow-lg hover:-translate-y-1"
            >
              <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${accentClasses[feature.accent]}`}>
                <feature.Icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              <div className="absolute top-6 right-6 font-heading text-6xl font-black text-white/[0.04] group-hover:text-white/[0.07] transition-colors">
                {feature.step}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* THE LAAS MODEL */}
      <section className="relative py-24 px-6 border-t border-b border-white/5">
        <div className="max-w-6xl mx-auto w-full relative">
          <div className="text-center mb-16">
            <span className="text-telemetry-teal text-sm font-black uppercase tracking-widest">Zero Subscriptions</span>
            <h2 className="font-heading text-4xl font-bold mt-2 mb-4">A Merit-Based Ecosystem</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We hate monthly subscriptions as much as you do. LAAS operates entirely on a Pay-Per-Vote and engagement model. You only pay for the influence you want.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modelFeatures.map((feature) => (
              <div
                key={feature.title}
                className={`p-8 rounded-[28px] border transition-all flex flex-col items-center text-center backdrop-blur-xl ${
                  feature.highlighted
                    ? 'bg-primary/10 border-primary/40 shadow-[0_0_25px_rgba(var(--primary-rgb),0.12)]'
                    : 'bg-white/[0.04] border-white/10 hover:border-primary/40'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${
                  feature.highlighted ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-white/5 border-white/10 text-gray-300'
                }`}>
                  <feature.Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex justify-center">
            <Link href="/join">
              <button className="group px-10 py-5 bg-primary text-on-primary font-black uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] flex items-center gap-3">
                Create Free Account
                <IconArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto relative rounded-[28px] border border-primary/30 bg-white/[0.04] backdrop-blur-xl p-12 md:p-16 text-center overflow-hidden shadow-[0_0_60px_rgba(var(--primary-rgb),0.1)]">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/25 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-telemetry-teal/20 blur-[100px] rounded-full pointer-events-none" />
          <h2 className="font-heading text-3xl md:text-4xl font-black mb-4">Ready to change the outcome?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Your first vote is free. Every decision after that is entirely yours to buy.
          </p>
          <Link
            href="/join"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:brightness-110 shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] bg-primary text-on-primary uppercase tracking-widest"
          >
            <IconTicket className="w-5 h-5" />
            Get Started Free
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/5 px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span className="font-heading font-bold text-gray-300">LAAS</span>
          <span>© {new Date().getFullYear()} Live Audience Activation System. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/live-events" className="hover:text-gray-300 transition-colors">Live Events</Link>
            <Link href="/join" className="hover:text-gray-300 transition-colors">Join</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}