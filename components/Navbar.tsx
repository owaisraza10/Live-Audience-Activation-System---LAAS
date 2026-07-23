"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  // --- AUTH STATE ---
  const [user, setUser] = useState<{ email: string; tier: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('laas_user');
    if (session) {
      setUser(JSON.parse(session));
    } else {
      setUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('laas_user');
    setUser(null);
    router.push('/'); 
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Live Events', path: '/live-events' },
    { name: 'Behind the Scenes', path: '/behind-the-scenes' },
    { name: 'Rewards', path: '/rewards' },
    { name: 'Season Structure', path: '/season-structure' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Partners', path: '/partners' }
  ];

  return (
    <nav className="flex items-center justify-between p-4 shadow-md sticky top-0 z-50 transition-all" 
         style={{ backgroundColor: 'var(--m3-surface)', color: 'var(--m3-on-surface)' }}>
      
      <div className="text-2xl font-bold" style={{ color: 'var(--m3-primary)' }}>
        <Link href="/">LAAS</Link>
      </div>

      <div className="hidden lg:flex gap-6 font-medium">
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            href={link.path} 
            className="hover:opacity-70 transition-opacity"
          >
            {link.name}
          </Link>
        ))}
      </div>
      
      <div>
        {user ? (
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold opacity-80">{user.email}</span>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--m3-primary)' }}>
                {user.tier} Tier
              </span>
            </div>
            
            {/* Avatar links to profile */}
            <Link href="/profile">
              <div className="h-10 w-10 flex items-center justify-center font-bold text-lg hover:opacity-80 transition-opacity cursor-pointer"
                   style={{ 
                     backgroundColor: 'var(--m3-primary)', 
                     color: 'var(--m3-on-primary)',
                     borderRadius: '50%' 
                   }}>
                {user.email.charAt(0).toUpperCase()}
              </div>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="px-4 py-2 font-bold text-sm transition-opacity hover:opacity-80"
              style={{ 
                backgroundColor: 'var(--m3-surface-variant)', 
                color: 'var(--m3-on-surface-variant)',
                borderRadius: 'var(--m3-radius-large)' 
              }}
            >
              Log Out
            </button>
          </div>
        ) : (
          <Link 
            href="/join" 
            className="px-6 py-2 font-bold transition-shadow hover:shadow-lg inline-block animate-fade-in"
            style={{ 
              backgroundColor: 'var(--m3-primary)', 
              color: 'var(--m3-on-primary)',
              borderRadius: 'var(--m3-radius-large)'
            }}
          >
            Join LAAS
          </Link>
        )}
      </div>
    </nav>
  );
}