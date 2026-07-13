"use client";

import { useState, useEffect } from 'react';
import { type BtsVideo } from '../../../lib/types';
import { getAllBtsVideos, uploadBtsVideo, deleteBtsVideo, updateBtsVideo } from '../../../lib/api/bts';

export default function AdminBtsPage() {
  const [videos, setVideos] = useState<BtsVideo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [requiredTier, setRequiredTier] = useState<'free' | 'standard' | 'premium'>('premium');

  async function load() {
    setVideos(await getAllBtsVideos());
  }

  useEffect(() => {
    load();
    const onStorage = () => load();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function startEdit(vid: BtsVideo) {
    setEditingId(vid.id);
    setTitle(vid.title);
    setDescription(vid.description);
    setVideoUrl(vid.video_url);
    setDuration(vid.duration);
    setRequiredTier(vid.required_tier);
    // Smooth scroll to the top of the form for good UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setDuration('');
    setRequiredTier('premium');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsUploading(true);
    setProgress(0);

    // Mock progress bar
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 20;
      });
    }, 200);

    setTimeout(async () => {
      if (editingId) {
        // UPDATE existing video
        await updateBtsVideo(editingId, {
          title,
          description,
          video_url: videoUrl,
          duration: duration || '0:00',
          required_tier: requiredTier
        });
      } else {
        // CREATE new video
        await uploadBtsVideo({
          title,
          description,
          video_url: videoUrl,
          thumbnail_url: '',
          duration: duration || '0:00',
          required_tier: requiredTier
        });
      }
      
      cancelEdit(); // Clears form and resets state
      setIsUploading(false);
      setProgress(0);
      load();
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="border-b border-gray-700 pb-6">
          <h1 className="text-3xl font-bold text-red-500 tracking-widest uppercase mb-1">
            BTS Asset Manager
          </h1>
          <p className="opacity-70">Upload and edit tiered content for the Vault.</p>
        </div>

        {/* EDITOR FORM */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl transition-all">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            {editingId ? (
              <><span className="text-yellow-400">✏️</span> Edit Video</>
            ) : (
              <><span className="text-blue-400">📤</span> Upload New Video</>
            )}
          </h2>
          
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2 opacity-80">Video Title</label>
              <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500 text-white" />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2 opacity-80">Description</label>
              <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500 text-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 opacity-80">Video Asset URL</label>
                <input required type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500 text-white font-mono text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 opacity-80">Duration</label>
                <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 12:34" className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500 text-white" />
              </div>
            </div>

            {/* TIER SELECTION */}
            <div className="border-t border-gray-700 pt-4 mt-2">
              <label className="block text-sm font-bold mb-2 opacity-80">Required Access Tier</label>
              <select 
                value={requiredTier} 
                onChange={(e) => setRequiredTier(e.target.value as any)}
                className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500 text-white font-bold"
              >
                <option value="free">Free (Everyone can watch)</option>
                <option value="standard">Standard (Standard & Premium Members)</option>
                <option value="premium">Premium Only (VIP Exclusive)</option>
              </select>
            </div>

            {isUploading ? (
              <div className="w-full h-14 bg-gray-900 rounded-xl overflow-hidden relative border border-gray-700 mt-4">
                <div className="h-full bg-blue-600 transition-all duration-200" style={{ width: `${progress}%` }}></div>
                <span className="absolute inset-0 flex items-center justify-center font-bold">Saving... {progress}%</span>
              </div>
            ) : (
              <div className="flex gap-3 pt-4">
                <button type="submit" className={`flex-grow px-8 py-4 rounded-xl font-bold uppercase tracking-wider transition-colors ${
                  editingId ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}>
                  {editingId ? 'Save Changes' : 'Upload to Vault'}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="px-8 py-4 rounded-xl font-bold uppercase tracking-wider border border-gray-700 text-gray-400 hover:border-gray-500 transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            )}
          </form>
        </div>

        {/* UPLOADED VIDEOS LIST */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Manage Uploads</h2>
          {videos.length === 0 && <p className="opacity-50 text-sm">No videos uploaded yet.</p>}
          {videos.map((vid) => (
            <div key={vid.id} className={`bg-gray-800 rounded-2xl p-6 border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
              editingId === vid.id ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-gray-700'
            }`}>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg">{vid.title}</h3>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                    vid.required_tier === 'premium' ? 'bg-purple-500/20 text-purple-400 border border-purple-500' :
                    vid.required_tier === 'standard' ? 'bg-blue-500/20 text-blue-400 border border-blue-500' :
                    'bg-gray-500/20 text-gray-400 border border-gray-500'
                  }`}>
                    {vid.required_tier}
                  </span>
                </div>
                <p className="text-sm opacity-60 line-clamp-1">{vid.description}</p>
                <p className="text-xs font-mono opacity-40 mt-1">{vid.duration} • ID: {vid.id}</p>
              </div>
              
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(vid)} className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-300 rounded-lg hover:border-yellow-500 hover:text-yellow-500 text-sm font-bold transition-colors">
                  Edit
                </button>
                <button onClick={() => { deleteBtsVideo(vid.id); load(); }} className="px-4 py-2 bg-gray-900 border border-gray-700 text-red-400 rounded-lg hover:border-red-500 text-sm font-bold transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}