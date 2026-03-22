'use client';
import { useState } from 'react';
import TVGrid from '@/components/TVGrid';
import PushButton from '@/components/PushButton';
import PeopleToggles from '@/components/PeopleToggles';
import { useTVSelection } from '@/hooks/useTVSelection';
import { usePush } from '@/hooks/usePush';
import { useArtHistory } from '@/hooks/useArtHistory';
import { buildPersonDescriptions, PersonName } from '@/lib/people';

const STYLES = [
  { id: 'realistic', label: 'Realistic', emoji: '📷' },
  { id: 'pixar', label: 'Pixar', emoji: '🎬' },
  { id: 'watercolour', label: 'Watercolour', emoji: '🎨' },
  { id: 'van-gogh', label: 'Van Gogh', emoji: '🌻' },
  { id: 'cartoon', label: 'Cartoon', emoji: '💥' },
];

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('');
  const [enhance, setEnhance] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [selectedPeople, setSelectedPeople] = useState<PersonName[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const { selectedIds, toggle } = useTVSelection();
  const { pushing, results, error: pushError, push, reset } = usePush();
  const { addItem } = useArtHistory();

  const togglePerson = (name: PersonName) => {
    setSelectedPeople(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setGenError(null);
    setGeneratedUrl(null);
    setEnhancedPrompt(null);
    reset();

    const peopleDesc = buildPersonDescriptions(selectedPeople);
    const styleLabel = STYLES.find(s => s.id === selectedStyle)?.label || 'Realistic';
    const finalPrompt = `${prompt.trim()}${peopleDesc ? ` — featuring: ${peopleDesc}` : ''} — painted in ${styleLabel} style`;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          enhance,
          size: 'square',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setGeneratedUrl(data.imageUrl);
      if (data.enhancedPrompt) setEnhancedPrompt(data.enhancedPrompt);
    } catch (err: unknown) {
      setGenError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handlePush = async () => {
    if (!generatedUrl) return;
    const success = await push(generatedUrl, selectedIds);
    if (success || results.some(r => r.status === 'success')) {
      addItem({
        imageUrl: generatedUrl,
        prompt: enhancedPrompt || prompt,
        style: selectedStyle,
        source: 'generated',
        tvIds: selectedIds,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 pt-12 pb-4 space-y-5">
      <h1 className="text-2xl font-bold">
        <span className="text-accent">✦</span> Generate Art
      </h1>

      {/* TV Grid */}
      <TVGrid selectedIds={selectedIds} onToggle={toggle} />

      {/* Style selector */}
      <div>
        <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Style</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {STYLES.map(style => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`
                flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all
                ${selectedStyle === style.id
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-white/10 bg-surface-2 text-white/60'
                }
              `}
            >
              <span>{style.emoji}</span>
              <span>{style.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt input */}
      <div className="space-y-2">
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="A cosy mountain cabin in autumn fog, warm light in the windows..."
          maxLength={1000}
          rows={3}
          className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-accent/50"
        />

        {/* Enhance toggle */}
        <div className="flex items-center justify-between px-1">
          <div>
            <p className="text-sm text-white/70">✨ Enhance prompt</p>
            <p className="text-xs text-white/30">GPT-4o refines your prompt for better results</p>
          </div>
          <button
            onClick={() => setEnhance(!enhance)}
            className={`
              w-12 h-6 rounded-full transition-all relative
              ${enhance ? 'bg-accent' : 'bg-white/20'}
            `}
          >
            <span className={`
              absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all
              ${enhance ? 'left-[26px]' : 'left-0.5'}
            `} />
          </button>
        </div>

        {enhancedPrompt && (
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-3">
            <p className="text-xs text-accent/80 mb-1">Enhanced prompt:</p>
            <p className="text-xs text-white/60 leading-relaxed">{enhancedPrompt}</p>
          </div>
        )}
      </div>

      {/* People toggles */}
      <PeopleToggles selected={selectedPeople} onToggle={togglePerson} />

      {/* Generated image preview */}
      {generatedUrl && (
        <div className="rounded-2xl overflow-hidden border border-white/10 aspect-square relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={generatedUrl} alt="Generated art" className="w-full h-full object-cover" />
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg border border-white/20"
          >
            ↺ Regenerate
          </button>
        </div>
      )}

      {/* Error */}
      {genError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-red-400 text-sm">{genError}</p>
        </div>
      )}

      {/* Generate button */}
      {!generatedUrl ? (
        <button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className={`
            w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200
            ${generating || !prompt.trim()
              ? 'bg-white/10 text-white/30 cursor-not-allowed'
              : 'bg-accent text-black active:scale-95'
            }
          `}
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating your art...
            </span>
          ) : '✦ Generate Art'}
        </button>
      ) : (
        <PushButton
          onPush={handlePush}
          pushing={pushing}
          selectedCount={selectedIds.length}
          results={results}
          disabled={!generatedUrl}
        />
      )}

      {pushError && (
        <p className="text-red-400 text-sm text-center">{pushError}</p>
      )}
    </div>
  );
}
