'use client';
import { useState, useEffect, useCallback } from 'react';
import type { ArtHistoryItem } from '@/types';

const STORAGE_KEY = 'frame-art-history';

export function useArtHistory() {
  const [history, setHistory] = useState<ArtHistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const addItem = useCallback((item: Omit<ArtHistoryItem, 'id' | 'createdAt'>) => {
    const newItem: ArtHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setHistory(prev => {
      const next = [newItem, ...prev].slice(0, 100);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    return newItem;
  }, []);

  const removeItem = useCallback((id: string) => {
    setHistory(prev => {
      const next = prev.filter(item => item.id !== id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { history, addItem, removeItem };
}
