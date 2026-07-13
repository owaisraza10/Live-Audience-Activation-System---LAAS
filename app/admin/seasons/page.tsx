"use client";

import { useState, useEffect } from 'react';
import { 
  getAllSeasons, 
  getSeasonMissions, 
  saveSeason, 
  saveMission, 
  deleteMission 
} from '../../../lib/api/seasons';

export default function AdminSeasonsPage() {
  // Data State
  const [seasons, setSeasons] = useState<any[]>([]);
  const [activeSeason, setActiveSeason] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [isEditingSeason, setIsEditingSeason] = useState(false);
  const [editingMission, setEditingMission] = useState<any | null>(null);

  // Form State
  const [seasonForm, setSeasonForm] = useState({ title: '', description: '', total_weeks: 12, current_week: 1 });
  const [missionForm, setMissionForm] = useState({ week: 1, title: '', description: '', video_url: '', poll_id: '' });

  async function refresh() {
    setLoading(true);
    const allSeasons = await getAllSeasons();
    setSeasons(allSeasons);
    
    if (allSeasons.length > 0) {
      // Default to most recent season
      const current = activeSeason || allSeasons[0];
      setActiveSeason(current);
      setSeasonForm({
        title: current.title,
        description: current.description,
        total_weeks: current.total_weeks,
        current_week: current.current_week
      });
      
      const seasonMissions = await getSeasonMissions(current.id);
      setMissions(seasonMissions);
    }
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  // --- SEASON HANDLERS ---
  async function handleSaveSeason() {
    try {
      await saveSeason(seasonForm, isEditingSeason ? activeSeason?.id : undefined);
      setIsEditingSeason(false);
      refresh();
    } catch (err) {
      alert("Failed to save season.");
    }
  }

  // --- MISSION HANDLERS ---
  function startMissionEdit(mission?: any) {
    if (mission) {
      setEditingMission(mission);
      setMissionForm({
        week: mission.week,
        title: mission.title,
        description: mission.description || '',
        video_url: mission.video_url || '',
        poll_id: mission.poll_id || ''
      });
    } else {
      setEditingMission({ isNew: true });
      setMissionForm({ week: missions.length + 1, title: '', description: '', video_url: '', poll_id: '' });
    }
  }

  async function handleSaveMission() {
    if (!activeSeason) return;
    try {
      const payload = {
        ...missionForm,
        season_id: activeSeason.id,
        poll_id: missionForm.poll_id || null // Ensure empty string becomes null
      };
      
      await saveMission(payload, editingMission?.isNew ? undefined : editingMission.id);
      setEditingMission(null);
      refresh();
    } catch (err) {
      alert("Failed to save mission.");
    }
  }

  async function handleDeleteMission(id: string) {
    if (window.confirm("Delete this mission permanently?")) {
      await deleteMission(id);
      refresh();
    }
  }

  if (loading) return <div className="p-8 text-white">Loading CMS...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-gray-700 pb-6">
          <div>
            <h1 className="text-3xl font-bold">Season & Mission Control</h1>
            <p className="opacity-70 text-sm mt-1">Manage the narrative arc and asynchronous content.</p>
          </div>
          <button 
            onClick={() => {
              setActiveSeason(null);
              setSeasonForm({ title: '', description: '', total_weeks: 12, current_week: 1 });
              setIsEditingSeason(true);
            }}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-sm"
          >
            + New Season
          </button>
        </div>

        {/* 1. SEASON MANAGER */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-primary">Season Settings</h2>
            {!isEditingSeason && activeSeason && (
              <button onClick={() => setIsEditingSeason(true)} className="text-sm uppercase tracking-wider font-bold border border-gray-600 px-3 py-1 rounded hover:border-primary hover:text-primary transition-colors">
                Edit Season
              </button>
            )}
          </div>

          {isEditingSeason ? (
            <div className="space-y-4 bg-gray-900 p-6 rounded-xl border border-primary/50">
              <input 
                type="text" placeholder="Season Title" value={seasonForm.title}
                onChange={e => setSeasonForm({...seasonForm, title: e.target.value})}
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-primary outline-none"
              />
              <textarea 
                placeholder="Season Description" value={seasonForm.description} rows={3}
                onChange={e => setSeasonForm({...seasonForm, description: e.target.value})}
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-primary outline-none"
              />
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold opacity-70 uppercase tracking-wider block mb-1">Total Weeks</label>
                  <input type="number" value={seasonForm.total_weeks} onChange={e => setSeasonForm({...seasonForm, total_weeks: parseInt(e.target.value)})} className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 outline-none" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Current Active Week</label>
                  <input type="number" value={seasonForm.current_week} onChange={e => setSeasonForm({...seasonForm, current_week: parseInt(e.target.value)})} className="w-full p-3 rounded-lg bg-gray-800 border border-primary outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveSeason} className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold">Save Season</button>
                <button onClick={() => setIsEditingSeason(false)} className="px-6 py-2 border border-gray-600 rounded-lg font-bold text-gray-400">Cancel</button>
              </div>
            </div>
          ) : (
            activeSeason && (
              <div className="flex flex-col md:flex-row gap-8 items-center bg-gray-900 p-6 rounded-xl">
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold mb-2">{activeSeason.title}</h3>
                  <p className="opacity-70 text-sm">{activeSeason.description}</p>
                </div>
                <div className="flex gap-6 text-center shrink-0">
                  <div className="bg-gray-800 p-4 rounded-xl min-w-[100px]">
                    <div className="text-3xl font-bold text-primary">{activeSeason.current_week}</div>
                    <div className="text-xs uppercase tracking-wider opacity-70 mt-1">Current Week</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-xl min-w-[100px]">
                    <div className="text-3xl font-bold">{activeSeason.total_weeks}</div>
                    <div className="text-xs uppercase tracking-wider opacity-70 mt-1">Total Weeks</div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* 2. MISSIONS MANAGER */}
        {activeSeason && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Weekly Missions</h2>
              {!editingMission && (
                <button onClick={() => startMissionEdit()} className="px-4 py-2 bg-white text-black rounded-lg font-bold text-sm">
                  + Add Mission
                </button>
              )}
            </div>

            {/* Mission Editor Form */}
            {editingMission && (
              <div className="mb-8 bg-gray-900 p-6 rounded-xl border border-gray-600 space-y-4 shadow-xl">
                <h3 className="font-bold text-lg border-b border-gray-700 pb-2 mb-4">
                  {editingMission.isNew ? 'Create New Mission' : `Edit Mission (Week ${missionForm.week})`}
                </h3>
                
                <div className="flex gap-4">
                  <div className="w-24">
                    <label className="text-xs font-bold opacity-70 uppercase block mb-1">Week</label>
                    <input type="number" value={missionForm.week} onChange={e => setMissionForm({...missionForm, week: parseInt(e.target.value)})} className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold opacity-70 uppercase block mb-1">Title</label>
                    <input type="text" value={missionForm.title} onChange={e => setMissionForm({...missionForm, title: e.target.value})} className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold opacity-70 uppercase block mb-1">Description</label>
                  <textarea value={missionForm.description} rows={3} onChange={e => setMissionForm({...missionForm, description: e.target.value})} className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700" />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold opacity-70 uppercase block mb-1">Video URL (YouTube/Vimeo)</label>
                    <input type="text" placeholder="https://..." value={missionForm.video_url} onChange={e => setMissionForm({...missionForm, video_url: e.target.value})} className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 font-mono text-sm" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold opacity-70 uppercase block mb-1">Linked Poll ID (Optional)</label>
                    <input type="text" placeholder="UUID from Polls DB" value={missionForm.poll_id} onChange={e => setMissionForm({...missionForm, poll_id: e.target.value})} className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 font-mono text-sm" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={handleSaveMission} className="px-6 py-2 bg-white text-black rounded-lg font-bold">Save Mission</button>
                  <button onClick={() => setEditingMission(null)} className="px-6 py-2 border border-gray-600 rounded-lg font-bold text-gray-400">Cancel</button>
                </div>
              </div>
            )}

            {/* Mission List */}
            <div className="space-y-3">
              {missions.length === 0 && !editingMission && (
                <p className="text-center p-8 opacity-50 border border-dashed border-gray-700 rounded-xl">No missions created for this season yet.</p>
              )}
              {missions.map(mission => (
                <div key={mission.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${mission.week === activeSeason.current_week ? 'bg-primary/10 border-primary' : 'bg-gray-900 border-gray-700'}`}>
                  <div className="flex items-center gap-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${mission.week === activeSeason.current_week ? 'bg-primary text-on-primary' : 'bg-gray-800 text-gray-400'}`}>
                      W{mission.week}
                    </div>
                    <div>
                      <h4 className="font-bold">{mission.title}</h4>
                      <p className="text-xs opacity-60 truncate max-w-md">{mission.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {mission.poll_id && <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">Poll Linked</span>}
                    {mission.video_url && <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">Video</span>}
                    <button onClick={() => startMissionEdit(mission)} className="ml-4 px-3 py-1 border border-gray-600 rounded text-xs font-bold hover:text-white transition-colors">Edit</button>
                    <button onClick={() => handleDeleteMission(mission.id)} className="px-3 py-1 border border-gray-600 text-red-500 rounded text-xs font-bold hover:bg-red-500 hover:text-white transition-colors">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}