'use client';
import { TVS } from '@/lib/tv-config';
import { useTVSelection } from '@/hooks/useTVSelection';
import TVCard from '@/components/TVCard';
import { useState } from 'react';

export default function TVsPage() {
  const { selectedIds, toggle } = useTVSelection();
  const [updating, setUpdating] = useState(false);

  async function handleCheckForUpdates() {
    setUpdating(true);
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-12 pb-4 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">
          <span className="text-accent">⬜</span> TVs
        </h1>
        <p className="text-sm text-white/40 mt-1">Select which TVs receive art when you push</p>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          onClick={() => TVS.forEach(tv => { if (!selectedIds.includes(tv.id)) toggle(tv.id); })}
          className="flex-1 py-2 bg-accent/10 border border-accent/30 text-accent text-sm rounded-xl"
        >
          Select All
        </button>
        <button
          onClick={() => TVS.forEach(tv => { if (selectedIds.includes(tv.id)) toggle(tv.id); })}
          className="flex-1 py-2 bg-white/5 border border-white/10 text-white/50 text-sm rounded-xl"
        >
          Deselect All
        </button>
      </div>

      {/* TV Grid */}
      <div className="grid grid-cols-3 gap-3">
        {TVS.map(tv => (
          <TVCard
            key={tv.id}
            tv={tv}
            selected={selectedIds.includes(tv.id)}
            onToggle={toggle}
          />
        ))}
      </div>

      {/* Check for updates */}
      <div className="pt-2 text-center">
        <button
          onClick={handleCheckForUpdates}
          disabled={updating}
          className="text-xs text-white/20 hover:text-white/40 transition-colors"
        >
          {updating ? 'Updating...' : 'Check for updates'}
        </button>
      </div>

      {/* Info */}
      <div className="space-y-2">
        {TVS.map(tv => (
          <div
            key={tv.id}
            className={`
              flex items-center gap-3 p-3 rounded-xl border transition-all
              ${selectedIds.includes(tv.id)
                ? 'border-accent/30 bg-accent/5'
                : 'border-white/5 bg-surface-2'
              }
            `}
          >
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${selectedIds.includes(tv.id) ? 'bg-accent' : 'bg-white/20'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{tv.name}</p>
              <p className="text-xs text-white/40">{tv.ip} · {tv.size}</p>
            </div>
            {tv.rotate90 && (
              <span className="text-xs text-accent/60 bg-accent/10 px-2 py-0.5 rounded-full flex-shrink-0">↻ rotates</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
