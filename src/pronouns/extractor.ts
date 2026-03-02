import type { PronounExtractionResult } from './types';
import { parsePronounSpec } from './parser';
import { SPEC_ALIASES } from './data';

/**
 * Pattern for detecting pronouns in parentheses at the end of a name.
 * Matches: (he/him), (she/her), (they/them), etc.
 */
const PRONOUN_SUFFIX_RE = /\s*\(([^)]+)\)\s*$/;

/**
 * Pattern for detecting if something looks like pronouns (contains /).
 */
const LOOKS_LIKE_PRONOUNS_RE = /^[a-z]+\/[a-z]+/i;

/**
 * Words that indicate the parenthetical is NOT pronouns.
 */
const NON_PRONOUN_WORDS = new Set([
  'billing',
  'shipping',
  'home',
  'work',
  'office',
  'mobile',
  'cell',
  'primary',
  'secondary',
  'main',
  'alt',
  'alternative',
  'personal',
  'business',
  'emergency',
  'contact',
  'other',
  'preferred',
  'cabin',
  'vacation',
  'rental',
  'legal',
  'maiden',
  'former',
  'deceased',
  'retired',
  'inactive',
  'accounts',
  'payable',
  'receivable',
  'department',
  'dept',
  'div',
  'division',
]);

/**
 * Check if a string looks like it could be pronouns.
 */
function looksLikePronouns(spec: string): boolean {
  const trimmed = spec.trim().toLowerCase();

  // Must contain a slash to be pronoun-like
  if (!LOOKS_LIKE_PRONOUNS_RE.test(trimmed)) {
    return false;
  }

  // Check against known non-pronoun words
  const firstWord = trimmed.split(/[\/\s]/)[0];
  if (NON_PRONOUN_WORDS.has(firstWord)) {
    return false;
  }

  // Check if it's a known alias (strong signal)
  const normalized = trimmed.replace(/\s+/g, '');
  if (SPEC_ALIASES[normalized]) {
    return true;
  }

  // Check if first part looks like a pronoun (short, alphabetic)
  if (firstWord.length <= 5 && /^[a-z]+$/i.test(firstWord)) {
    return true;
  }

  return false;
}

/**
 * Extract pronouns from a name string if present.
 *
 * Looks for pronoun specifications in parentheses at the end of names:
 * - "Alex Johnson (they/them)"
 * - "Sam Smith (he/his)"
 * - "Jordan Lee (she/her/hers)"
 *
 * Does NOT extract non-pronoun parentheticals:
 * - "John Smith (billing)" → not extracted
 * - "The Smith Family (cabin)" → not extracted
 *
 * @param nameWithPronouns - The name string potentially containing pronouns
 * @returns Object with cleaned name and optional pronouns
 *
 * @example
 * ```typescript
 * extractPronouns('Alex Johnson (they/them)');
 * // { name: 'Alex Johnson', pronouns: {...}, rawPronounSpec: 'they/them' }
 *
 * extractPronouns('John Smith (billing)');
 * // { name: 'John Smith (billing)' } - not extracted
 *
 * extractPronouns('Jane Doe');
 * // { name: 'Jane Doe' } - no pronouns found
 * ```
 */
export function extractPronouns(nameWithPronouns: string): PronounExtractionResult {
  if (!nameWithPronouns) {
    return { name: '' };
  }

  const match = nameWithPronouns.match(PRONOUN_SUFFIX_RE);

  if (!match) {
    return { name: nameWithPronouns };
  }

  const rawSpec = match[1].trim();
  const potentialName = nameWithPronouns.slice(0, match.index!).trim();

  // Check if it looks like pronouns
  if (!looksLikePronouns(rawSpec)) {
    return { name: nameWithPronouns };
  }

  // Try to parse as pronouns
  try {
    const pronouns = parsePronounSpec(rawSpec);
    return {
      name: potentialName,
      pronouns,
      rawPronounSpec: rawSpec,
    };
  } catch {
    // Failed to parse - treat as non-pronoun parenthetical
    return { name: nameWithPronouns };
  }
}

/**
 * Check if a name string appears to contain pronouns.
 *
 * Useful for conditional logic without extracting.
 *
 * @param name - The name string to check
 * @returns true if the name appears to contain pronouns
 */
export function hasPronouns(name: string): boolean {
  if (!name) return false;

  const match = name.match(PRONOUN_SUFFIX_RE);
  if (!match) return false;

  return looksLikePronouns(match[1]);
}

/**
 * Use extracted or inferred pronouns to hint at gender.
 *
 * Maps pronoun sets to gender hints:
 * - he/him → 'male'
 * - she/her → 'female'
 * - they/them, neopronouns → 'unknown'
 * - name-only, any → 'unknown'
 *
 * @param rawSpec - The raw pronoun spec string
 * @returns Gender hint or 'unknown'
 */
export function pronounsToGenderHint(
  rawSpec: string
): 'male' | 'female' | 'unknown' {
  const norm = rawSpec.trim().toLowerCase().replace(/\s+/g, '');

  // Check for he/him variants
  if (
    norm.startsWith('he/') ||
    norm === 'he' ||
    norm.includes('/him')
  ) {
    return 'male';
  }

  // Check for she/her variants
  if (
    norm.startsWith('she/') ||
    norm === 'she' ||
    norm.includes('/her')
  ) {
    return 'female';
  }

  // Everything else is unknown
  return 'unknown';
}
