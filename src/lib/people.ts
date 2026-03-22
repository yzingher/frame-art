export type PersonName = 'Max' | 'Lila' | 'Daddy' | 'Tori';

export const PEOPLE: Record<PersonName, { emoji: string; description: string }> = {
  Max: {
    emoji: '🧒',
    description:
      'Young boy, approximately 4-5 years old. Light brown/chestnut hair, slightly tousled and parted to one side. Large, expressive dark brown eyes with a mischievous, cheeky smile. Round face with soft features. Fair skin with a warm tone. Slim build. Casual clothes — black hoodie and jeans. Confident, playful energy.',
  },
  Lila: {
    emoji: '👧',
    description:
      "Young girl, approximately 3-4 years old (Max's twin sister). Dark brown curly/wavy hair worn in two pigtail buns held with a pink hair tie. Big, round dark brown eyes with long lashes and a sweet, slightly shy smile showing her baby teeth. Round, cherubic face with soft cheeks. Fair skin. Petite build. Pink cardigan. Warm, curious expression.",
  },
  Daddy: {
    emoji: '👨',
    description:
      'Man in his early-to-mid 40s. Dark brown/nearly black wavy-curly hair, slightly tousled on top. Stubble beard and moustache, salt-and-pepper with flecks of grey. Warm brown eyes with crow\'s feet from smiling. Olive/Mediterranean skin tone. Lean-athletic build, tall. Strong jawline, prominent nose, expressive eyebrows. Big, open smile. Casual style.',
  },
  Tori: {
    emoji: '👩',
    description:
      'Young woman, late 20s/early 30s. Striking copper-red/auburn hair, long and wavy, worn down past her shoulders. Warm brown eyes, bright wide smile. Fair/light olive skin. Slim build, feminine features with high cheekbones. Expressive, vivacious energy — always mid-laugh or about to be. Radiates warmth and confidence.',
  },
};

const TWINS_DESCRIPTION =
  'Twin siblings, boy and girl, around 4 years old. The boy has lighter brown straight hair and a cheeky grin in a black hoodie and jeans. The girl has darker brown curly hair in pigtail buns with a pink hair tie and a sweet smile in a pink cardigan.';

const COUPLE_DESCRIPTION =
  'A couple in their 30s-40s. He has dark wavy-curly hair with salt-and-pepper stubble and olive skin. She has long flowing copper-red hair and fair skin. Both have warm brown eyes and big smiles.';

const FAMILY_DESCRIPTION =
  'A family of four. Dad has dark curly hair, salt-and-pepper stubble, olive skin, and a big grin. His partner has long copper-red/auburn hair, fair skin, and a bright warm smile. Their twin children (boy and girl, around 4) — the boy has lighter brown straight hair and a cheeky expression in a black hoodie; the girl has dark brown curly hair in pigtail buns and a sweet smile in a pink cardigan. All four have warm brown eyes.';

export function buildPersonDescriptions(selected: PersonName[]): string {
  if (selected.length === 0) return '';

  if (selected.length === 4) return FAMILY_DESCRIPTION;

  if (
    selected.length === 2 &&
    selected.includes('Max') &&
    selected.includes('Lila')
  ) {
    return TWINS_DESCRIPTION;
  }

  if (
    selected.length === 2 &&
    selected.includes('Daddy') &&
    selected.includes('Tori')
  ) {
    return COUPLE_DESCRIPTION;
  }

  return selected.map(name => PEOPLE[name].description).join(' ');
}
