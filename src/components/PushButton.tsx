'use client';
import type { PushResult } from '@/types';
import { TVS } from '@/lib/tv-config';

interface PushButtonProps {
  onPush: () => void;
  pushing: boolean;
  selectedCount: number;
  results?: PushResult[];
  disabled?: boolean;
}

export default function PushButton({ onPush, pushing, selectedCount, results = [], disabled }: PushButtonProps) {
  const hasResults = results.length > 0;
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="space-y-3">
      <button
        onClick={onPush}
        disabled={pushing || disabled || selectedCount === 0}
        className={`
          w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200
          ${pushing || disabled || selectedCount === 0
            ? 'bg-white/10 text-white/30 cursor-not-allowed'
            : 'bg-accent text-black active:scale-95 hover:bg-accent-dim'
          }
        `}
      >
        {pushing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Pushing to {selectedCount} TV{selectedCount !== 1 ? 's' : ''}...
          </span>
        ) : (
          `Push to ${selectedCount} TV${selectedCount !== 1 ? 's' : ''}`
        )}
      </button>

      {hasResults && (
        <div className="grid grid-cols-3 gap-1.5">
          {results.map(result => {
            const tv = TVS.find(t => t.id === result.tvId);
            return (
              <div
                key={result.tvId}
                className={`
                  flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px]
                  ${result.status === 'success' ? 'bg-green-500/20 text-green-400' :
                    result.status === 'error' ? 'bg-red-500/20 text-red-400' :
                    'bg-white/10 text-white/50'}
                `}
              >
                <span>{result.status === 'success' ? '✓' : result.status === 'error' ? '✗' : '⟳'}</span>
                <span className="truncate">{tv?.name || result.tvId}</span>
              </div>
            );
          })}
        </div>
      )}

      {hasResults && (
        <p className="text-center text-sm text-white/50">
          {successCount > 0 && <span className="text-green-400">{successCount} success</span>}
          {errorCount > 0 && successCount > 0 && ' · '}
          {errorCount > 0 && <span className="text-red-400">{errorCount} failed</span>}
        </p>
      )}
    </div>
  );
}
