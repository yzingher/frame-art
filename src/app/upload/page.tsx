'use client';
import { useState, useRef } from 'react';
import TVGrid from '@/components/TVGrid';
import PushButton from '@/components/PushButton';
import PeopleToggles from '@/components/PeopleToggles';
import { useTVSelection } from '@/hooks/useTVSelection';
import { usePush } from '@/hooks/usePush';
import { useArtHistory } from '@/hooks/useArtHistory';
import { buildPersonDescriptions, PersonName } from '@/lib/people';

export default function UploadPage() {
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [aiStyle, setAiStyle] = useState(false);
  const [stylePrompt, setStylePrompt] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<PersonName[]>([]);
  const [styling, setStyling] = useState(false);
  const [styledUrl, setStyledUrl] = useState<string | null>(null);
  const [styleError, setStyleError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const { selectedIds, toggle } = useTVSelection();
  const { pushing, results, error: pushError, push, reset } = usePush();
  const { addItem } = useArtHistory();

  const togglePerson = (name: PersonName) => {
    setSelectedPeople(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 6);
    if (!files.length) return;

    setUploadedUrls([]);
    setStyledUrl(null);
    setUploadError(null);
    setStyleError(null);
    reset();

    // Generate previews
    const newPreviews = await Promise.all(
      files.map(
        file =>
          new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onload = ev => resolve(ev.target?.result as string);
            reader.readAsDataURL(file);
          })
      )
    );
    setPreviews(newPreviews);

    // Upload all files
    setUploading(true);
    try {
      const urls = await Promise.all(
        files.map(async file => {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Upload failed');
          return data.imageUrl as string;
        })
      );
      setUploadedUrls(urls);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleStyleGenerate = async () => {
    if (!previews.length || !stylePrompt.trim()) return;
    setStyling(true);
    setStyleError(null);
    setStyledUrl(null);
    reset();

    try {
      const images = previews.map(p => p.split(',')[1]);
      const peopleDesc = buildPersonDescriptions(selectedPeople);
      const finalPrompt = `${stylePrompt.trim()}${peopleDesc ? ` — featuring: ${peopleDesc}` : ''}`;

      const res = await fetch('/api/style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images, prompt: finalPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Style generation failed');
      setStyledUrl(data.imageUrl);
    } catch (err: unknown) {
      setStyleError(err instanceof Error ? err.message : 'Style generation failed');
    } finally {
      setStyling(false);
    }
  };

  const handlePush = async () => {
    const urlToPush = styledUrl ?? uploadedUrls[0] ?? null;
    if (!urlToPush) return;
    const success = await push(urlToPush, selectedIds);
    if (success || results.some(r => r.status === 'success')) {
      addItem({
        imageUrl: urlToPush,
        source: styledUrl ? 'styled' : 'uploaded',
        tvIds: selectedIds,
      });
    }
  };

  const handleClear = () => {
    setPreviews([]);
    setUploadedUrls([]);
    setStyledUrl(null);
    setUploadError(null);
    setStyleError(null);
    reset();
    if (fileRef.current) fileRef.current.value = '';
  };

  const hasPhotos = previews.length > 0;
  const canPush = !aiStyle
    ? uploadedUrls.length > 0
    : !!styledUrl;

  return (
    <div className="min-h-screen bg-background px-4 pt-12 pb-4 space-y-5">
      <h1 className="text-2xl font-bold">
        <span className="text-accent">↑</span> Upload Art
      </h1>

      {/* TV Grid */}
      <TVGrid selectedIds={selectedIds} onToggle={toggle} />

      {/* File input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {!hasPhotos ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-white/20 rounded-2xl py-16 flex flex-col items-center gap-3 text-white/40 active:border-accent/50 active:text-accent/50 transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <span className="text-sm font-medium">Tap to select photos (up to 6)</span>
          <span className="text-xs">JPEG, PNG, HEIC supported</span>
        </button>
      ) : (
        <div className="space-y-3">
          {/* Thumbnails grid */}
          <div className={`grid gap-2 ${previews.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative rounded-xl overflow-hidden border border-white/10 aspect-square"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <svg className="animate-spin w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
                {!uploading && uploadedUrls[i] && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-green-500/80 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            ))}
            {previews.length < 6 && (
              <button
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center text-white/30 active:border-accent/40 transition-all text-2xl"
              >
                +
              </button>
            )}
          </div>
          <button
            onClick={handleClear}
            className="text-sm text-white/40 underline w-full text-center"
          >
            Clear photos
          </button>
        </div>
      )}

      {uploadError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-red-400 text-sm">{uploadError}</p>
        </div>
      )}

      {/* AI Style toggle */}
      {hasPhotos && (
        <div className="flex items-center justify-between px-1">
          <div>
            <p className="text-sm text-white/70">🎨 Generate AI art from these photos</p>
            <p className="text-xs text-white/30">Use GPT-4o + DALL-E 3 to create styled artwork</p>
          </div>
          <button
            onClick={() => setAiStyle(!aiStyle)}
            className={`w-12 h-6 rounded-full transition-all relative ${aiStyle ? 'bg-accent' : 'bg-white/20'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${aiStyle ? 'left-[26px]' : 'left-0.5'}`} />
          </button>
        </div>
      )}

      {/* AI Style form */}
      {hasPhotos && aiStyle && (
        <div className="space-y-4">
          <textarea
            value={stylePrompt}
            onChange={e => setStylePrompt(e.target.value)}
            placeholder="Describe the scene or style... e.g. watercolour painting of a cosy family moment"
            rows={3}
            className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-accent/50"
          />

          <PeopleToggles selected={selectedPeople} onToggle={togglePerson} />

          {/* AI styled result preview */}
          {styledUrl && (
            <div className="rounded-2xl overflow-hidden border border-white/10 aspect-square relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={styledUrl} alt="AI styled art" className="w-full h-full object-cover" />
            </div>
          )}

          {styleError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-400 text-sm">{styleError}</p>
            </div>
          )}

          {!styledUrl && (
            <button
              onClick={handleStyleGenerate}
              disabled={styling || !stylePrompt.trim() || !uploadedUrls.length}
              className={`
                w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200
                ${styling || !stylePrompt.trim() || !uploadedUrls.length
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-accent text-black active:scale-95'
                }
              `}
            >
              {styling ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating AI art...
                </span>
              ) : '✦ Generate AI Art'}
            </button>
          )}
        </div>
      )}

      {/* Push button */}
      {canPush && (
        <PushButton
          onPush={handlePush}
          pushing={pushing}
          selectedCount={selectedIds.length}
          results={results}
        />
      )}

      {pushError && (
        <p className="text-red-400 text-sm text-center">{pushError}</p>
      )}
    </div>
  );
}
