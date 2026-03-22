'use client';
import type { TV } from '@/types';

interface TVCardProps {
  tv: TV;
  selected: boolean;
  onToggle: (id: string) => void;
  lastImage?: string;
}

export default function TVCard({ tv, selected, onToggle, lastImage }: TVCardProps) {
  return (
    <button
      onClick={() => onToggle(tv.id)}
      className={`
        relative flex flex-col items-center justify-center rounded-xl p-2 aspect-[4/3] w-full
        border-2 transition-all duration-200 overflow-hidden
        ${selected
          ? 'border-accent bg-accent/10 glow-pulse'
          : 'border-white/10 bg-surface-2'
        }
      `}
    >
      {lastImage && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lastImage}
            alt={tv.name}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-1">
        {tv.rotate90 && (
          <span className="text-[8px] text-accent font-bold bg-accent/20 px-1 rounded">
            ↻ 90°
          </span>
        )}
        <span className="text-white text-[11px] font-semibold text-center leading-tight">
          {tv.name}
        </span>
        <span className="text-white/40 text-[9px]">{tv.size}</span>
      </div>

      {selected && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
          <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="white">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </button>
  );
}
