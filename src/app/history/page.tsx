'use client';
import { useState } from 'react';
import { useArtHistory } from '@/hooks/useArtHistory';
import { useTVSelection } from '@/hooks/useTVSelection';
import { usePush } from '@/hooks/usePush';
import type { ArtHistoryItem } from '@/types';

const SOURCE_LABELS: Record<string, string> = {
  generated: '✦ Generated',
  uploaded: '↑ Uploaded',
  styled: '🎨 Styled',
  occasion: '🎉 Occasion',
};

export default function HistoryPage() {
  const { history, removeItem } = useArtHistory();
  const { selectedIds } = useTVSelection();
  const { pushing, push } = usePush();
  const [selected, setSelected] = useState<ArtHistoryItem | null>(null);
  const [pushingId, setPushingId] = useState<string | null>(null);

  const handleRepush = async (item: ArtHistoryItem) => {
    if (pushing) return;
    setPushingId(item.id);
    await push(item.imageUrl, selectedIds);
    setPushingId(null);
  };

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 gap-4">
        <div className="text-6xl opacity-30">🖼</div>
        <h2 className="text-xl font-bold text-white/60">No art history yet</h2>
        <p className="text-white/30 text-sm text-center">Generate or upload art and push it to your TVs</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-12 pb-4">
      <h1 className="text-2xl font-bold mb-5">
        <span className="text-accent">◷</span> History
      </h1>

      <div className="grid grid-cols-2 gap-3">
        {history.map(item => (
          <div
            key={item.id}
            className="bg-surface-2 rounded-xl overflow-hidden border border-white/5"
          >
            <button
              onClick={() => setSelected(item)}
              className="w-full aspect-square relative block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.prompt || 'Art'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <span className="text-[9px] text-white/60">{SOURCE_LABELS[item.source] || item.source}</span>
              </div>
            </button>
            <div className="p-2 flex items-center justify-between gap-2">
              <p className="text-[10px] text-white/40 truncate flex-1">
                {item.prompt ? item.prompt.slice(0, 40) : new Date(item.createdAt).toLocaleDateString()}
              </p>
              <button
                onClick={() => handleRepush(item)}
                disabled={pushingId === item.id || selectedIds.length === 0}
                className={`
                  flex-shrink-0 text-[10px] px-2 py-1 rounded-lg font-medium transition-all
                  ${pushingId === item.id ? 'bg-white/10 text-white/30' : 'bg-accent/20 text-accent'}
                `}
              >
                {pushingId === item.id ? '...' : '▶ Push'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-end"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-surface w-full rounded-t-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selected.imageUrl} alt={selected.prompt || 'Art'} className="w-full rounded-xl aspect-square object-cover" />

            {selected.prompt && (
              <div>
                <p className="text-xs text-white/40 mb-1">Prompt</p>
                <p className="text-sm text-white/80">{selected.prompt}</p>
              </div>
            )}

            <div className="flex gap-4 text-xs text-white/40">
              <span>{SOURCE_LABELS[selected.source]}</span>
              <span>{new Date(selected.createdAt).toLocaleString()}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { handleRepush(selected); setSelected(null); }}
                disabled={selectedIds.length === 0}
                className="flex-1 py-3 bg-accent text-black rounded-xl font-semibold text-sm"
              >
                Push to {selectedIds.length} TV{selectedIds.length !== 1 ? 's' : ''}
              </button>
              <button
                onClick={() => { removeItem(selected.id); setSelected(null); }}
                className="px-4 py-3 bg-red-500/20 text-red-400 rounded-xl font-semibold text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
