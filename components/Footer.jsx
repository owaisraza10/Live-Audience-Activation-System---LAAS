import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-300 border-t border-gray-800 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: Brand Identity */}
          <div className="space-y-4">
            <Link href="/" className="text-3xl font-black tracking-widest inline-block transition-opacity hover:opacity-80" style={{ color: 'var(--m3-primary)' }}>
              LAAS
            </Link>
            <p className="text-sm opacity-60 leading-relaxed max-w-xs">
              The next generation of interactive broadcasting. Shape the narrative, make live decisions, and unlock exclusive rewards.
            </p>
          </div>

          {/* Column 2: Platform Links */}
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-sm">Platform</h4>
            <ul className="space-y-3 text-sm opacity-70 font-medium">
              <li><Link href="/live-events" className="hover:text-primary transition-colors">Live Broadcasts</Link></li>
              <li><Link href="/behind-the-scenes" className="hover:text-primary transition-colors">The Vault (BTS)</Link></li>
              <li><Link href="/rewards" className="hover:text-primary transition-colors">Rewards & Economy</Link></li>
              <li><Link href="/season-structure" className="hover:text-primary transition-colors">Season Structure</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal & Support */}
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-sm">Legal & Support</h4>
            <ul className="space-y-3 text-sm opacity-70 font-medium">
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><a href="mailto:support@laas.tv" className="hover:text-primary transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Column 4: Community / Socials */}
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-sm">Community</h4>
            <div className="flex gap-4 opacity-80">
              {/* Replace # with your actual social links. Using emoji/text as placeholders for icons */}
              <a href="#" className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center hover:bg-primary hover:text-black hover:border-primary transition-all text-lg">
                𝕏
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center hover:bg-primary hover:text-black hover:border-primary transition-all text-lg">
                💬
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center hover:bg-primary hover:text-black hover:border-primary transition-all text-lg">
                📸
              </a>
            </div>
            <div className="mt-6">
              <Link href="/join" className="text-xs font-bold uppercase tracking-wider text-primary hover:underline">
                Become a VIP Member →
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Divider & Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium opacity-50">
          <p>&copy; {currentYear} LAAS Interactive. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Made for the Audience</span>
            <span className="hidden md:inline">•</span>
            <span>Broadcast Worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}