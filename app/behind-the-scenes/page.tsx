"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type BtsVideo } from '../../lib/types';
import { getAllBtsVideos } from '../../lib/api/bts';
import Link from 'next/link';

// Define the categories from your PRD
const BTS_CATEGORIES = [
  { id: 'all', label: 'All Content', icon: '📁' },
  { id: 'cameras', label: '24/7 Cameras', icon: '🎥' },
  { id: 'production', label: 'Production Room', icon: '🎛️' },
  { id: 'clips', label: 'Exclusive Clips', icon: '🎬' },
  { id: 'notes', label: 'Creator Notes', icon: '📝' }
];

export default function BehindTheScenes() {
  const router = useRouter();
  // Using a simplified user state since tiers are gone
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [videos, setVideos] = useState<BtsVideo[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Auth check - Only requirement is being a registered user
    const session = localStorage.getItem('laas_user');
    if (!session) {
      router.push('/join');
      return;
    } else {
      setUser(JSON.parse(session));
    }

    // 2. Load BTS Videos
    async function load() {
      setLoading(true);
      try {
        const data = await getAllBtsVideos();
        setVideos(data || []);
      } catch (err) {
        console.error("Failed to load BTS content", err);
      } finally {
        setLoading(false);
      }
    }
    load();
    
    const onStorage = () => load();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [router]);

  if (!user) return null;

  // Filter logic (Defaults existing DB items without a category to 'clips')
  const filteredVideos = videos.filter(video => {
    if (activeCategory === 'all') return true;
    
    // Safely cast to any to check for category
    const videoCat = ((video as any).category || 'clips').toLowerCase();
    return videoCat === activeCategory;
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      
      {/* HEADER SECTION */}
      <div className="bg-gray-900 border-b border-gray-800 pt-12 pb-8 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">The Vault</h1>
            <p className="opacity-70 text-lg max-w-xl">
              Immerse yourself in the broadcast. Access live 24/7 feeds, raw production footage, and exclusive creator notes.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <div className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-bold tracking-wider text-gray-300">
              ✓ Access Granted
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 animate-fade-in">
        
        {/* CATEGORY NAVIGATION TABS */}
        <div className="flex flex-wrap gap-3 mb-10 border-b border-gray-800 pb-6">
          {BTS_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border ${
                activeCategory === cat.id 
                  ? 'bg-primary text-on-primary border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' 
                  : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-600 hover:text-white'
              }`}
            >
              <span className="text-lg">{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl aspect-video animate-pulse"></div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredVideos.length === 0 && (
          <div className="text-center py-24 bg-gray-900 border border-gray-800 rounded-3xl">
            <span className="text-5xl opacity-50 mb-4 block">
              {BTS_CATEGORIES.find(c => c.id === activeCategory)?.icon || '🎬'}
            </span>
            <h3 className="font-bold text-2xl text-white mb-2">Nothing to see here yet</h3>
            <p className="opacity-50 max-w-md mx-auto">
              The production team hasn't dropped any content for this category. Check back later for exclusive updates!
            </p>
          </div>
        )}

        {/* VIDEO GRID */}
        {!loading && filteredVideos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video) => {
              const videoCategory = ((video as any).category || 'clips').toLowerCase();
              
              return (
              <div key={video.id} className="bg-gray-900 rounded-2xl overflow-hidden flex flex-col border border-gray-800 relative group hover:border-gray-600 transition-colors shadow-lg">
                
                {/* CATEGORY BADGE */}
                {activeCategory === 'all' && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="text-[10px] font-bold px-3 py-1.5 rounded bg-black/70 text-white backdrop-blur-md border border-white/10 uppercase tracking-widest shadow-lg">
                      {BTS_CATEGORIES.find(c => c.id === videoCategory)?.label || 'Exclusive'}
                    </div>
                  </div>
                )}

                {/* VIDEO PLAYER */}
                <div className="aspect-video bg-black w-full relative group-hover:brightness-110 transition-all">
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
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono font-bold">
                      {video.duration}
                    </div>
                  )}
                </div>

                {/* CONTENT DETAILS */}
                <div className="p-6 flex-grow flex flex-col justify-between bg-gray-900">
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                      {video.description}
                    </p>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}