'use client';
import { PEOPLE, PersonName } from '@/lib/people';

interface Props {
  selected: PersonName[];
  onToggle: (name: PersonName) => void;
}

const PERSON_ORDER: PersonName[] = ['Max', 'Lila', 'Daddy', 'Tori'];

export default function PeopleToggles({ selected, onToggle }: Props) {
  return (
    <div>
      <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Who&apos;s in it?</p>
      <div className="flex gap-2 flex-wrap">
        {PERSON_ORDER.map(name => {
          const isSelected = selected.includes(name);
          return (
            <button
              key={name}
              onClick={() => onToggle(name)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium
                transition-all duration-150 active:scale-95
                ${isSelected
                  ? 'border-accent bg-accent/10 text-accent shadow-[0_0_10px_rgba(212,175,55,0.25)]'
                  : 'border-white/15 bg-surface-2 text-white/60 active:border-white/30'
                }
              `}
            >
              <span>{PEOPLE[name].emoji}</span>
              <span>{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
