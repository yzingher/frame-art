'use client';
import { useState, useCallback } from 'react';
import type { PushResult } from '@/types';

export function usePush() {
  const [pushing, setPushing] = useState(false);
  const [results, setResults] = useState<PushResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const push = useCallback(async (imageUrl: string, tvIds: string[]) => {
    if (!tvIds.length) {
      setError('No TVs selected');
      return false;
    }

    setPushing(true);
    setError(null);
    setResults(tvIds.map(id => ({ tvId: id, status: 'pushing' as const })));

    try {
      const res = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, tvIds }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Push failed');

      setResults(data.results);
      return data.results.every((r: PushResult) => r.status === 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Push failed';
      setError(message);
      setResults(tvIds.map(id => ({ tvId: id, status: 'error' as const, error: message })));
      return false;
    } finally {
      setPushing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { pushing, results, error, push, reset };
}
