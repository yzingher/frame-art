'use client';
import { TVS } from '@/lib/tv-config';
import TVCard from './TVCard';

interface TVGridProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
  lastImages?: Record<string, string>;
}

export default function TVGrid({ selectedIds, onToggle, lastImages = {} }: TVGridProps) {
  const allSelected = selectedIds.length === TVS.length;

  const toggleAll = () => {
    if (allSelected) {
      TVS.forEach(tv => {
        if (selectedIds.includes(tv.id)) onToggle(tv.id);
      });
    } else {
      TVS.forEach(tv => {
        if (!selectedIds.includes(tv.id)) onToggle(tv.id);
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-white/50">
          {selectedIds.length} / {TVS.length} selected
        </span>
        <button
          onClick={toggleAll}
          className="text-sm text-accent font-medium"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {TVS.map(tv => (
          <TVCard
            key={tv.id}
            tv={tv}
            selected={selectedIds.includes(tv.id)}
            onToggle={onToggle}
            lastImage={lastImages[tv.id]}
          />
        ))}
      </div>
    </div>
  );
}
