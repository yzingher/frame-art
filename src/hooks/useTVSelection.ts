'use client';
import { useState, useEffect, useCallback } from 'react';
import { TVS } from '@/lib/tv-config';

const STORAGE_KEY = 'frame-art-tv-selection';

export function useTVSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        const valid = parsed.filter(id => TVS.some(tv => tv.id === id));
        setSelectedIds(valid.length ? valid : TVS.map(tv => tv.id));
      } else {
        setSelectedIds(TVS.map(tv => tv.id));
      }
    } catch {
      setSelectedIds(TVS.map(tv => tv.id));
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { selectedIds, toggle };
}
