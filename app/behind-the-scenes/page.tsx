"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type BtsVideo } from '../../lib/types';
import { getAllBtsVideos } from '../../lib/api/bts';

export default function BehindTheScenes() {
  const router = useRouter();
  const [user, setUser] = useState<{ tier: string } | null>(null);
  const [videos, setVideos] = useState<BtsVideo[]>([]);

  // Hierarchy of tiers to check permissions
  const tierWeights: Record<string, number> = {
    free: 0,
    standard: 1,
    premium: 2,
  };

  useEffect(() => {
    // 1. Auth check
    const session = localStorage.getItem('laas_user');
    if (!session) {
      router.push('/join');
    } else {
      setUser(JSON.parse(session));
    }

    // 2. Load BTS Videos
    async function load() {
      setVideos(await getAllBtsVideos());
    }
    load();
    
    const onStorage = () => load();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [router]);

  // Bulletproof permission logic
  const canWatch = (requiredTier?: string) => {
    if (!user) return false;
    const userLevel = (user.tier || 'free').toLowerCase();
    const reqLevel = (requiredTier || 'free').toLowerCase();
    const userWeight = tierWeights[userLevel] ?? 0;
    const reqWeight = tierWeights[reqLevel] ?? 0;
    return userWeight >= reqWeight;
  };

  if (!user) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">The Vault</h1>
        <p className="opacity-70 text-lg mb-4">Exclusive behind-the-scenes access based on your membership.</p>
        <div className="inline-block px-4 py-2 bg-surface-variant rounded-full text-sm font-bold border border-gray-200">
          Your Access Level: <span className="uppercase text-primary">{user.tier}</span>
        </div>
      </div>

      {videos.length === 0 && (
        <div className="text-center py-24 m3-card border border-gray-200">
          <span className="text-4xl opacity-50 mb-4 block">🎬</span>
          <h3 className="font-bold text-xl opacity-70">No videos in the Vault yet</h3>
          <p className="opacity-50">Check back later for exclusive drops.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video) => {
          const safeTier = (video.required_tier || 'free').toLowerCase();
          const hasAccess = canWatch(video.required_tier);
          
          return (
          <div key={video.id} className="m3-card overflow-hidden p-0 flex flex-col border border-gray-200 relative">
            
            {/* TIER BADGE */}
            <div className={`absolute top-4 left-4 z-10 text-xs font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-md ${
              safeTier === 'premium' ? 'bg-purple-600 text-white' :
              safeTier === 'standard' ? 'bg-blue-600 text-white' :
              'bg-gray-200 text-gray-800'
            }`}>
              {safeTier === 'free' ? 'Free Access' : `${safeTier} Exclusive`}
            </div>

            {/* CONDITIONAL VIDEO PLAYER OR LOCK SCREEN */}
            {hasAccess ? (
              <div className="aspect-video bg-black w-full relative">
                {video.video_url.includes('youtube') ? (
                  <iframe 
                    src={video.video_url.replace('watch?v=', 'embed/')} 
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                ) : video.video_url.includes('drive.google.com') ? (
                  <iframe 
                    src={video.video_url.replace('/view', '/preview').replace('/edit', '/preview')} 
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                ) : (
                  <video controls className="w-full h-full object-cover">
                    <source src={video.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono font-bold">
                  {video.duration}
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-surface-variant w-full flex flex-col items-center justify-center p-6 text-center border-b border-gray-200">
                <span className="text-4xl mb-4">🔒</span>
                <h3 className="font-bold text-lg mb-2">
                  Requires {safeTier.charAt(0).toUpperCase() + safeTier.slice(1)} Tier
                </h3>
                <p className="text-sm opacity-60 mb-4 max-w-[250px]">
                  Your current <span className="uppercase font-bold">{user.tier}</span> account does not have access to this video.
                </p>
                <button 
                  onClick={() => router.push('/checkout')}
                  className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold text-sm hover:shadow-md transition-shadow"
                >
                  Upgrade to VIP
                </button>
              </div>
            )}

            <div className="p-6 flex-grow">
              <h3 className="text-xl font-bold mb-2 pr-4" style={{ opacity: hasAccess ? 1 : 0.6 }}>
                {video.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ opacity: hasAccess ? 0.7 : 0.4 }}>
                {video.description}
              </p>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}