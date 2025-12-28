import type { NameAffixToken, NameAffixTokenType } from './types';
import {
  buildAffixVariantIndex,
  normalizeAffixVariantForMatch,
  PREFIX_AFFIX_ENTRIES,
  SUFFIX_AFFIX_ENTRIES,
} from './data/affixes';

type AffixContext = 'prefix' | 'suffix';

const ROMAN_NUMERALS = new Set(['II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']);

const PREFIX_INDEX = buildAffixVariantIndex(PREFIX_AFFIX_ENTRIES, 'prefix');
const SUFFIX_INDEX = buildAffixVariantIndex(SUFFIX_AFFIX_ENTRIES, 'suffix');

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
// Nobility/royalty are treated as "style" for now (no dedicated token type).
const NOBILITY_AND_ROYALTY = new Set([
  'HER MAJESTY',
  'HIS MAJESTY',
  'HER GRACE',
  'HIS GRACE',
  'PRINCE',
  'PRINCESS',
  'DUKE',
  'DUCHESS',
  'EARL',
  'LORD',
  'LADY',
  'BARON',
  'BARONESS',
  'COUNT',
  'COUNTESS',
  'MARQUESS',
  'MARQUIS',
  'VISCOUNT',
  'VISCOUNTESS',
  'VISC', // common abbreviation used in "The Rt Hon Visc"
]);
const RELIGIOUS = new Set(['REV', 'REVEREND', 'FR', 'FATHER', 'RABBI', 'IMAM', 'PASTOR', 'SISTER', 'SR', 'BR', 'BROTHER']);
const MILITARY = new Set(['PVT', 'CPL', 'SGT', 'LT', 'CPT', 'CAPT', 'MAJ', 'COL', 'GEN', 'ADM']);
const JUDICIAL = new Set(['JUDGE', 'JUSTICE']);
const PROFESSIONAL = new Set(['ESQ', 'CPA', 'CFA', 'PE', 'RN', 'DDS']);
const EDUCATION = new Set(['PHD', 'MD', 'JD', 'MBA', 'MS', 'MA', 'BS', 'BA', 'DVM']);
const POSTNOMINAL_HONOR = new Set(['OBE', 'MBE', 'CBE', 'KBE', 'DBE']);

const SPLITTABLE_WORDS = new Set<string>([
  ...HONORIFIC,
  ...NOBILITY_AND_ROYALTY,
  ...RELIGIOUS,
  ...MILITARY,
  ...JUDICIAL,
  ...PROFESSIONAL,
  ...EDUCATION,
  ...POSTNOMINAL_HONOR,
  'JR',
  'SR',
  ...ROMAN_NUMERALS,
  'HON', // allow splitting "The Hon Dr" once style phrase is handled
]);

// Expand splittable word set based on canonical affix data (single-word variants).
for (const entry of [...PREFIX_AFFIX_ENTRIES, ...SUFFIX_AFFIX_ENTRIES]) {
  const candidates: string[] = [];
  if (entry.short) candidates.push(entry.short);
  if (entry.long) candidates.push(entry.long);
  if (entry.variants) candidates.push(...entry.variants);
  for (const c of candidates) {
    const k = normalizeAffixVariantForMatch(c);
    if (k && !k.includes(' ')) SPLITTABLE_WORDS.add(k);
  }
}

const MULTIWORD_PREFIX_PHRASES: Array<{ words: string[]; len: number }> = (() => {
  const phrases: Array<{ words: string[]; len: number }> = [];
  const add = (s: string) => {
    const k = normalizeAffixVariantForMatch(s);
    if (!k || !k.includes(' ')) return;
    const words = k.split(' ').filter(Boolean);
    if (words.length >= 2) phrases.push({ words, len: words.length });
  };

  for (const entry of PREFIX_AFFIX_ENTRIES) {
    if (entry.short) add(entry.short);
    if (entry.long) add(entry.long);
    if (entry.variants) entry.variants.forEach(add);
  }

  // Greedy longest-first, de-duped
  phrases.sort((a, b) => b.len - a.len);
  const seen = new Set<string>();
  return phrases.filter(p => {
    const key = p.words.join(' ');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
})();

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
    .replace(/[\u2019\u2018\u02BC]/g, "'")
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
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

  if (NOBILITY_AND_ROYALTY.has(normalizedKey)) return 'style';
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
  const entry = (ctx === 'prefix' ? PREFIX_INDEX : SUFFIX_INDEX).get(normalizedKey);
  const type = entry ? entry.type : classifyType(normalizedKey, ctx);
  const isAbbrev = looksAbbreviated(v, normalizedKey);

  const requiresCommaBefore =
    ctx === 'suffix' &&
    (type === 'generational' || type === 'professional' || type === 'education' || type === 'postnominalHonor' || normalizedKey === 'ESQ');

  return {
    type,
    value: v,
    normalized: normalizedKey,
    entryId: entry?.id,
    canonicalShort: entry?.short,
    canonicalLong: entry?.long,
    isAbbrev: isAbbrev || undefined,
    requiresCommaBefore: requiresCommaBefore || undefined,
  };
}

function matchKnownPrefixPhraseAt(words: string[], startIdx: number): number {
  const remaining = words.slice(startIdx);
  for (const p of MULTIWORD_PREFIX_PHRASES) {
    if (remaining.length < p.len) continue;
    const slice = remaining.slice(0, p.len).join(' ');
    if (slice === p.words.join(' ')) return p.len;
  }
  return 0;
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
    { phrase: ['HIS', 'MAJESTY'], len: 2 },
    { phrase: ['HER', 'MAJESTY'], len: 2 },
    { phrase: ['HIS', 'GRACE'], len: 2 },
    { phrase: ['HER', 'GRACE'], len: 2 },
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
      if (ctx === 'prefix') {
        const knownLen = matchKnownPrefixPhraseAt(normalizedWords, i);
        if (knownLen > 0) {
          out.push(words.slice(i, i + knownLen).join(' '));
          i += knownLen;
          continue;
        }
      }

      const styleLen = matchStylePhraseAt(normalizedWords, i);
      if (styleLen > 0) {
        out.push(words.slice(i, i + styleLen).join(' '));
        i += styleLen;
        continue;
      }

      // If the current word is independently recognizable, split it off.
      if (SPLITTABLE_WORDS.has(normalizedWords[i])) {
        out.push(words[i]);
        i += 1;
        continue;
      }

      // If a later word is recognizable (e.g., "... Sir", "... Dr"), split the preceding phrase,
      // then loop to consume the recognizable word(s) without swallowing trailing name parts.
      const nextSplittableIdx = normalizedWords.findIndex((w, idx) => idx > i && SPLITTABLE_WORDS.has(w));
      if (nextSplittableIdx > i) {
        out.push(words.slice(i, nextSplittableIdx).join(' '));
        i = nextSplittableIdx;
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


