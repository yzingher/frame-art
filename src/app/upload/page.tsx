'use client';
import { useState, useRef } from 'react';
import TVGrid from '@/components/TVGrid';
import PushButton from '@/components/PushButton';
import { useTVSelection } from '@/hooks/useTVSelection';
import { usePush } from '@/hooks/usePush';
import { useArtHistory } from '@/hooks/useArtHistory';

export default function UploadPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { selectedIds, toggle } = useTVSelection();
  const { pushing, results, error: pushError, push, reset } = usePush();
  const { addItem } = useArtHistory();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    setUploadError(null);
    setUploadedUrl(null);
    reset();

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setUploadedUrl(data.imageUrl);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handlePush = async () => {
    if (!uploadedUrl) return;
    const success = await push(uploadedUrl, selectedIds);
    if (success || results.some(r => r.status === 'success')) {
      addItem({
        imageUrl: uploadedUrl,
        source: 'uploaded',
        tvIds: selectedIds,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 pt-12 pb-4 space-y-5">
      <h1 className="text-2xl font-bold">
        <span className="text-accent">↑</span> Upload Art
      </h1>

      {/* TV Grid */}
      <TVGrid selectedIds={selectedIds} onToggle={toggle} />

      {/* Upload area */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!preview ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-white/20 rounded-2xl py-16 flex flex-col items-center gap-3 text-white/40 active:border-accent/50 active:text-accent/50 transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <span className="text-sm font-medium">Tap to select from camera roll</span>
          <span className="text-xs">JPEG, PNG, HEIC supported</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl overflow-hidden border border-white/10 aspect-square relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <svg className="animate-spin w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setPreview(null);
              setUploadedUrl(null);
              reset();
              if (fileRef.current) fileRef.current.value = '';
            }}
            className="text-sm text-white/40 underline w-full text-center"
          >
            Choose different image
          </button>
        </div>
      )}

      {uploadError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-red-400 text-sm">{uploadError}</p>
        </div>
      )}

      {/* Push button */}
      {uploadedUrl && (
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
