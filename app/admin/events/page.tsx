"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Event, EventStatus } from '../../../lib/types';
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../../../lib/api/events';

const emptyDraft: Omit<Event, 'id'> = {
  title: '',
  description: '',
  status: 'upcoming',
  start_time: new Date().toISOString().slice(0, 16),
  end_time: null,
  stream_url: '',
  season_id: 'season_01',
  mission_id: null,
  thumbnail: '',
};

function statusStyles(status: EventStatus, active: boolean) {
  const map: Record<EventStatus, string> = {
    live: 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]',
    upcoming: 'border-yellow-500 bg-yellow-500/10 text-yellow-500',
    ended: 'border-gray-400 bg-gray-400/10 text-gray-300',
  };
  return active ? map[status] : 'border-gray-700 text-gray-500 hover:border-gray-500';
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<Event, 'id'>>(emptyDraft);
  const [isCreating, setIsCreating] = useState(false);

  async function refresh() {
    setEvents(await getAllEvents());
  }

  useEffect(() => {
    refresh();
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function startEdit(event: Event) {
    setEditingId(event.id);
    setIsCreating(false);
    const { id, ...rest } = event;
    setDraft(rest);
  }

  function startCreate() {
    setEditingId(null);
    setIsCreating(true);
    setDraft(emptyDraft);
  }

  async function handleSetStatus(id: string, status: EventStatus) {
    await updateEvent(id, { status });
    refresh();
  }

  async function handleSave() {
    if (editingId) {
      await updateEvent(editingId, draft);
    } else {
      await createEvent(draft);
    }
    setEditingId(null);
    setIsCreating(false);
    refresh();
  }

  async function handleDelete(id: string) {
    await deleteEvent(id);
    if (editingId === id) {
      setEditingId(null);
    }
    refresh();
  }

  const isEditorOpen = isCreating || editingId !== null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="border-b border-gray-700 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-red-500 tracking-widest uppercase mb-1">
              CMS Control
            </h1>
            <p className="opacity-70">Manage events, status & stream routing</p>
          </div>
          <button
            onClick={startCreate}
            className="px-5 py-3 rounded-xl font-bold uppercase tracking-wider bg-blue-500/10 border-2 border-blue-500 text-blue-400 hover:bg-blue-500/20"
          >
            + New event
          </button>
        </div>

        {/* EVENT LIST */}
        <div className="space-y-4">
          {events.length === 0 && (
            <p className="opacity-50 text-sm">No events yet. Create one to get started.</p>
          )}
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">{event.title || 'Untitled event'}</h2>
                  <p className="text-sm opacity-60">{event.description}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase border border-gray-700 text-gray-300 hover:border-gray-500"
                  >
                    Polls
                  </Link>
                  <button
                    onClick={() => startEdit(event)}
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase border border-gray-700 text-gray-300 hover:border-gray-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="px-3 py-2 rounded-lg text-xs font-bold uppercase border border-gray-700 text-gray-500 hover:border-red-500 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(['upcoming', 'live', 'ended'] as EventStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSetStatus(event.id, s)}
                    className={`p-3 rounded-xl font-bold uppercase tracking-wider text-sm border-2 transition-all ${statusStyles(
                      s,
                      event.status === s
                    )}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {event.status === 'live' && (
                <p className="text-xs opacity-50">
                  * Live now — routes all viewers on the frontend to {event.stream_url || 'no stream URL set'}.
                </p>
              )}
            </div>
          ))}
        </div>

        {/* EDITOR */}
        {isEditorOpen && (
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-xl font-bold mb-6">
              {isCreating ? 'Create event' : 'Edit event'}
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2 opacity-80">Title</label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 opacity-80">Description</label>
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  rows={2}
                  className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 opacity-80">
                  Stream URL
                </label>
                <input
                  type="text"
                  value={draft.stream_url}
                  onChange={(e) => setDraft({ ...draft, stream_url: e.target.value })}
                  className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500 font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 opacity-80">
                    Start time
                  </label>
                  <input
                    type="datetime-local"
                    value={draft.start_time?.slice(0, 16)}
                    onChange={(e) => setDraft({ ...draft, start_time: e.target.value })}
                    className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 opacity-80">
                    Season ID
                  </label>
                  <input
                    type="text"
                    value={draft.season_id}
                    onChange={(e) => setDraft({ ...draft, season_id: e.target.value })}
                    className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider bg-blue-500 text-white hover:bg-blue-600"
                >
                  Save event
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setIsCreating(false);
                  }}
                  className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider border border-gray-700 text-gray-400 hover:border-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}