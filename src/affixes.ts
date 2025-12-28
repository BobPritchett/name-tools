import type { NameAffixToken, NameAffixTokenType } from './types';

type AffixContext = 'prefix' | 'suffix';

const ROMAN_NUMERALS = new Set(['II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']);

// Minimal starter packs (expandable). Matching uses normalized (upper, periods removed).
const HONORIFIC = new Set(['MR', 'MRS', 'MS', 'MISS', 'MX', 'DR', 'PROF', 'SIR', 'DAME']);
const STYLE_PHRASES = new Set([
  'THE HON',
  'THE HONOURABLE',
  'THE RIGHT HONOURABLE',
  'RIGHT HONOURABLE',
  'THE RT HON',
  'HIS EXCELLENCY',
  'HER EXCELLENCY',
]);
const RELIGIOUS = new Set(['REV', 'REVEREND', 'FR', 'FATHER', 'RABBI', 'IMAM', 'PASTOR', 'SISTER', 'SR', 'BR', 'BROTHER']);
const MILITARY = new Set(['PVT', 'CPL', 'SGT', 'LT', 'CPT', 'CAPT', 'MAJ', 'COL', 'GEN', 'ADM']);
const JUDICIAL = new Set(['JUDGE', 'JUSTICE']);
const PROFESSIONAL = new Set(['ESQ', 'CPA', 'CFA', 'PE', 'RN', 'DDS']);
const EDUCATION = new Set(['PHD', 'MD', 'JD', 'MBA', 'MS', 'MA', 'BS', 'BA', 'DVM']);
const POSTNOMINAL_HONOR = new Set(['OBE', 'MBE', 'CBE', 'KBE', 'DBE']);

const SPLITTABLE_WORDS = new Set<string>([
  ...HONORIFIC,
  ...RELIGIOUS,
  ...MILITARY,
  ...JUDICIAL,
  ...PROFESSIONAL,
  ...EDUCATION,
  ...POSTNOMINAL_HONOR,
  'HON', // allow splitting "The Hon Dr" once style phrase is handled
]);

function collapseSpaces(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function stripEdgePunctuation(value: string): string {
  // Keep internal punctuation (e.g., Lt.-Col., O'Brien); remove only edges.
  return value.trim().replace(/^[,;:\s]+/, '').replace(/[,;:\s]+$/, '');
}

export function normalizeAffix(value: string): { normalized: string; normalizedKey: string } {
  const raw = collapseSpaces(stripEdgePunctuation(value));
  const normalized = raw
    .replace(/^[.]+/, '')
    .replace(/[.]+$/, '')
    .replace(/\s+/g, ' ')
    .toUpperCase();

  // Matching key: remove periods and collapse spaces.
  const normalizedKey = normalized.replace(/\./g, '').replace(/\s+/g, ' ').trim();
  return { normalized, normalizedKey };
}

function looksAbbreviated(value: string, normalizedKey: string): boolean {
  if (/[.]/.test(value)) return true;
  if (normalizedKey.includes(' ')) return false;
  // Common pattern: 2–5 letters (e.g., MD, MBA, CPA)
  return /^[A-Z]{2,5}$/.test(normalizedKey);
}

function classifyType(normalizedKey: string, ctx: AffixContext): NameAffixTokenType {
  // Conflict resolution: dynastic > generational > education/professional > military/judicial/religious > honorific/style > other
  if (ROMAN_NUMERALS.has(normalizedKey) && ctx === 'suffix') return 'dynasticNumber';
  if (/^(JR|SR)$/.test(normalizedKey)) return 'generational';

  if (EDUCATION.has(normalizedKey)) return 'education';
  if (PROFESSIONAL.has(normalizedKey)) return 'professional';
  if (POSTNOMINAL_HONOR.has(normalizedKey)) return 'postnominalHonor';

  if (MILITARY.has(normalizedKey)) return 'military';
  if (JUDICIAL.has(normalizedKey)) return 'judicial';

  // Disambiguate Sr.: prefix context can be "Sister"
  if (normalizedKey === 'SR' && ctx === 'prefix') return 'religious';
  if (RELIGIOUS.has(normalizedKey)) return 'religious';

  if (HONORIFIC.has(normalizedKey)) return 'honorific';
  if (STYLE_PHRASES.has(normalizedKey)) return 'style';

  // Heuristic for multi-word tokens (e.g., "Rear Admiral", "Air Vice Marshal")
  if (ctx === 'prefix' && normalizedKey.includes(' ')) {
    const k = normalizedKey;
    if (k.includes('EXCELLENCY') || k.includes('HONOURABLE') || k.includes('HON')) return 'style';
    if (k.includes('JUDGE') || k.includes('JUSTICE')) return 'judicial';
    if (k.includes('RABBI') || k.includes('IMAM') || k.includes('REVEREND') || k.includes('SISTER') || k.includes('BROTHER') || k.includes('FATHER')) return 'religious';
    if (k.includes('ADMIRAL') || k.includes('MARSHAL') || k.includes('GENERAL') || k.includes('COLONEL') || k.includes('CAPTAIN') || k.includes('LIEUTENANT') || k.includes('SERGEANT')) {
      return 'military';
    }
  }

  // Heuristic for suffix multi-word (rare)
  if (ctx === 'suffix' && normalizedKey.includes(' ')) {
    const k = normalizedKey;
    if (k.includes('PHD') || k.includes('MBA') || k.includes('MD') || k.includes('JD')) return 'education';
    if (k.includes('ESQ') || k.includes('CPA') || k.includes('RN') || k.includes('PE')) return 'professional';
  }

  return 'other';
}

export function classifyAffixToken(value: string, ctx: AffixContext): NameAffixToken {
  const v = collapseSpaces(stripEdgePunctuation(value));
  const { normalizedKey } = normalizeAffix(v);
  const type = classifyType(normalizedKey, ctx);
  const isAbbrev = looksAbbreviated(v, normalizedKey);

  const requiresCommaBefore =
    ctx === 'suffix' &&
    (type === 'generational' || type === 'professional' || type === 'education' || type === 'postnominalHonor' || normalizedKey === 'ESQ');

  return {
    type,
    value: v,
    normalized: normalizedKey,
    isAbbrev: isAbbrev || undefined,
    requiresCommaBefore: requiresCommaBefore || undefined,
  };
}

function matchStylePhraseAt(words: string[], startIdx: number): number {
  // Returns matched word length (0 if none). Greedy longest.
  // Currently supports: The Hon, The Rt Hon, Right Honourable, The Right Honourable, His/Her Excellency, The Honourable
  const remaining = words.slice(startIdx);
  const candidates: Array<{ phrase: string[]; len: number }> = [
    { phrase: ['THE', 'RIGHT', 'HONOURABLE'], len: 3 },
    { phrase: ['RIGHT', 'HONOURABLE'], len: 2 },
    { phrase: ['THE', 'HONOURABLE'], len: 2 },
    { phrase: ['THE', 'RT', 'HON'], len: 3 },
    { phrase: ['THE', 'HON'], len: 2 },
    { phrase: ['HIS', 'EXCELLENCY'], len: 2 },
    { phrase: ['HER', 'EXCELLENCY'], len: 2 },
  ];

  for (const c of candidates) {
    if (remaining.length < c.len) continue;
    const slice = remaining.slice(0, c.len).join(' ');
    if (slice === c.phrase.join(' ')) return c.len;
  }
  return 0;
}

export function splitAffixToAtomicParts(value: string, ctx: AffixContext): string[] {
  const raw = collapseSpaces(value);
  if (!raw) return [];

  // Split on top-level delimiters first.
  const delimiterSplit = raw
    .split(/[;,/]+/g)
    .map(s => s.trim())
    .filter(Boolean)
    .flatMap(chunk => {
      if (ctx === 'suffix') {
        // Rare: "PhD and MBA"
        return chunk.split(/\band\b/gi).map(s => s.trim()).filter(Boolean);
      }
      return [chunk];
    });

  const out: string[] = [];
  for (const chunk of delimiterSplit) {
    const words = chunk.split(/\s+/).filter(Boolean);
    if (words.length <= 1) {
      out.push(chunk);
      continue;
    }

    // Tokenize using style-phrase protection; otherwise decide whether to split into words.
    const normalizedWords = words.map(w => normalizeAffix(w).normalizedKey.replace(/\s+/g, ' '));

    // If every word is independently recognizable, split into words (e.g., "Prof Dr", "Lt Col").
    const allSplittable = normalizedWords.every(w => SPLITTABLE_WORDS.has(w));
    if (allSplittable) {
      out.push(...words);
      continue;
    }

    // Otherwise, try to carve out known multi-word style phrases, leaving the rest as single tokens.
    let i = 0;
    while (i < words.length) {
      const styleLen = matchStylePhraseAt(normalizedWords, i);
      if (styleLen > 0) {
        out.push(words.slice(i, i + styleLen).join(' '));
        i += styleLen;
        continue;
      }
      // Default: keep the whole remaining chunk as a single token to avoid nonsense splits (e.g., "Rear Admiral")
      out.push(words.slice(i).join(' '));
      break;
    }
  }

  return out.map(stripEdgePunctuation).map(collapseSpaces).filter(Boolean);
}

export function buildAffixTokens(displayValue: string | undefined, ctx: AffixContext): NameAffixToken[] | undefined {
  if (!displayValue) return undefined;
  const parts = splitAffixToAtomicParts(displayValue, ctx);
  if (parts.length === 0) return undefined;
  return parts.map(p => classifyAffixToken(p, ctx));
}

export function extractIdentitySuffixFromTokens(tokens?: NameAffixToken[]): string | undefined {
  if (!tokens || tokens.length === 0) return undefined;
  const identity = tokens.filter(t => t.type === 'generational' || t.type === 'dynasticNumber').map(t => t.value).filter(Boolean);
  return identity.length > 0 ? identity.join(', ') : undefined;
}


