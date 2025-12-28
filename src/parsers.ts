import { isParticle } from './data/particles';
import { isCommonSurname, isCommonFirstName } from './data/surnames';
import { buildAffixTokens } from './affixes';
import { ParsedName } from './types';

/**
 * Parse a full name string into its component parts using international name parsing rules
 * Supports:
 * - Surname particles (van, von, de, da, etc.)
 * - Compound surnames (García Márquez)
 * - Nicknames in quotes or parentheses
 * - Complex suffixes and titles
 *
 * @param fullName - The full name to parse
 * @returns Object containing parsed name components
 */
export function parseName(fullName: string): ParsedName {
  if (!fullName || typeof fullName !== 'string') {
    throw new Error('Invalid name: expected non-empty string');
  }

  let text = fullName.trim();
  const result: ParsedName = {};

  // Step 1: Extract nicknames
  text = extractNickname(text, result);

  // Step 2: Extract suffixes
  text = extractSuffixes(text, result);

  // Step 3: Extract prefixes
  let parts = text.split(/\s+/);
  parts = extractPrefixes(parts, result);

  // Step 4: Determine surname boundary and assign parts
  assignNameParts(parts, result);

  if (!result.first && !result.last) {
    throw new Error('Invalid name: no name parts found after parsing');
  }

  // Additive metadata (does not alter the original display strings)
  result.prefixTokens = buildAffixTokens(result.prefix, 'prefix');
  result.suffixTokens = buildAffixTokens(result.suffix, 'suffix');
  deriveFamilyParticle(result);
  derivePreferredGiven(result);
  deriveSortHelpers(result);

  return result;
}

/**
 * Extract nickname (quoted or parenthesized text)
 */
function extractNickname(text: string, result: ParsedName): string {
  const nickMatch = text.match(/([\"\'\(\[\"\'])(.*?)([\"\'\)\]\"\'])/);
  if (nickMatch) {
    result.nickname = nickMatch[2].trim();
    return text.replace(nickMatch[0], ' ').replace(/\s+/g, ' ').trim();
  }
  return text;
}

/**
 * Extract suffixes and titles (right-to-left)
 */
function extractSuffixes(text: string, result: ParsedName): string {
  let workingText = text;
  const suffixesFound: string[] = [];

  const looksLikeKnownOrHeuristicSuffix = (value: string): boolean => {
    const tokens = buildAffixTokens(value, 'suffix');
    // For extraction, accept anything we can classify as a known/heuristic suffix.
    // Unknown credentials are handled separately via comma-tail heuristic.
    return !!tokens && tokens.length > 0 && tokens.some(t => t.type !== 'other');
  };

  const looksLikeUnknownPostNominalChunk = (value: string): boolean => {
    // Heuristic (comma-tail only): tolerate unknown degrees/certs without incorrectly swallowing locations.
    // We require:
    // - short, mostly-uppercase alphabetic token(s)
    // - optional periods/hyphens/spaces
    // - no digits
    const v = value.trim().replace(/^[,;:\s]+/, '').replace(/[,;:\s]+$/, '');
    if (!v) return false;
    if (v.length > 18) return false;
    if (/\d/.test(v)) return false;
    // allow only letters (unicode), periods, hyphens, spaces
    if (/[^\p{L}.\-\s]/u.test(v)) return false;
    // must have either explicit abbreviation punctuation or uppercase signal
    if (!/[.]/.test(v) && !/[A-Z]/.test(v)) return false;

    const lettersOnly = v
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.\-\s]/g, '');
    if (!/^[A-Za-z]+$/.test(lettersOnly)) return false;
    if (lettersOnly.length < 2 || lettersOnly.length > 10) return false;

    const upperCount = (lettersOnly.match(/[A-Z]/g) ?? []).length;
    // if no periods, require mostly uppercase (avoid "London")
    if (!/[.]/.test(v) && upperCount / lettersOnly.length < 0.7) return false;

    return true;
  };

  // First, identify all comma-separated parts from the end that are suffixes
  const parts = workingText.split(',');
  while (parts.length > 1) {
    const lastPart = parts[parts.length - 1].trim();
    const firstWordOfLast = lastPart.split(/\s+/)[0];

    if (
      looksLikeKnownOrHeuristicSuffix(firstWordOfLast) ||
      looksLikeKnownOrHeuristicSuffix(lastPart) ||
      looksLikeUnknownPostNominalChunk(lastPart) ||
      /queen|king|consort/i.test(lastPart)
    ) {
      suffixesFound.unshift(lastPart);
      parts.pop();
    } else {
      break;
    }
  }
  workingText = parts.join(',').trim();

  // Then check for space-separated suffixes at the end of the remaining text
  const spaceParts = workingText.split(/\s+/);
  const spaceSuffixes: string[] = [];

  while (spaceParts.length > 1) {
    const lastWord = spaceParts[spaceParts.length - 1];
    // Remove trailing punctuation for suffix check
    const cleanWord = lastWord.replace(/[,]$/, '');
    if (looksLikeKnownOrHeuristicSuffix(cleanWord)) {
      spaceSuffixes.unshift(lastWord);
      spaceParts.pop();
    } else {
      break;
    }
  }

  // Combine suffixes found, preserving order (space-separated ones come first in the original string)
  const allSuffixes = [...spaceSuffixes, ...suffixesFound];
  if (allSuffixes.length > 0) {
    result.suffix = allSuffixes.join(', ');
    workingText = spaceParts.join(' ').trim();
  }

  return workingText;
}

/**
 * Extract prefixes/salutations (left-to-right)
 */
function extractPrefixes(parts: string[], result: ParsedName): string[] {
  const prefixesFound: string[] = [];

  const looksLikePrefix = (value: string): boolean => {
    const tokens = buildAffixTokens(value, 'prefix');
    return !!tokens && tokens.length > 0 && tokens.every(t => t.type !== 'other');
  };

  while (parts.length > 1) {
    let matchFound = false;

    // Try matching multi-word prefixes (up to 5 words)
    // We check longer matches first to avoid greedy matching of single words
    // We must leave at least one part for the actual name (parts.length - 1)
    for (let len = Math.min(parts.length - 1, 5); len >= 1; len--) {
      const candidate = parts.slice(0, len).join(' ');
      if (looksLikePrefix(candidate)) {
        prefixesFound.push(candidate);
        parts.splice(0, len);
        matchFound = true;
        break;
      }
    }

    if (!matchFound) {
      break;
    }
  }

  if (prefixesFound.length > 0) {
    result.prefix = prefixesFound.join(' ');
  }

  return parts;
}

/**
 * Determine surname boundary using the "Golden Rule" algorithm and assign name parts
 */
function assignNameParts(parts: string[], result: ParsedName): void {
  if (parts.length === 0) return;

  if (parts.length === 1) {
    result.first = parts[0];
    return;
  }

  // Default: last word is surname
  let surnameStartIndex = parts.length - 1;

  // Scan backward from second-to-last word to find the boundary
  for (let i = parts.length - 2; i >= 0; i--) {
    const word = parts[i];

    // Case A: Particle (van, von, de, da, af, y, etc.)
    if (isParticle(word)) {
      surnameStartIndex = i;
      continue; // Keep going left for multi-word particles
    }

    // Case B: Compound Surname Heuristic
    if (isCommonSurname(word) && !isCommonFirstName(word) && i > 0) {
      surnameStartIndex = i;
      continue;
    }

    break;
  }

  // Assign parts
  if (surnameStartIndex === 0) {
    // If it starts at 0 and we have multiple parts, it's likely just a last name (e.g. "van Gogh")
    result.last = parts.join(' ');
  } else {
    // Normal case: everything before surnameStartIndex is first/middle
    result.first = parts[0];
    if (surnameStartIndex > 1) {
      result.middle = parts.slice(1, surnameStartIndex).join(' ');
    }
    result.last = parts.slice(surnameStartIndex).join(' ');
  }
}

const FAMILY_PARTICLE_PHRASES = [
  // multi-word (check first)
  'de la',
  'de los',
  'de las',
  'van der',
  'van den',
  'van de',
  // single-word
  'de',
  'del',
  'da',
  'dos',
  'di',
  'van',
  'von',
  'al',
  'el',
  'bin',
  'ibn',
] as const;

function deriveFamilyParticle(result: ParsedName): void {
  const last = result.last?.trim();
  if (!last) return;

  const words = last.split(/\s+/).filter(Boolean);
  if (words.length < 2) return;

  const lowerWords = words.map(w => w.toLowerCase());

  // Try longest particle phrases first
  const candidates = [...FAMILY_PARTICLE_PHRASES].sort((a, b) => b.split(' ').length - a.split(' ').length);
  for (const phrase of candidates) {
    const pWords = phrase.split(' ');
    if (pWords.length >= words.length) continue;

    const matches = pWords.every((pw, idx) => lowerWords[idx] === pw);
    if (!matches) continue;

    const particleOriginal = words.slice(0, pWords.length).join(' ');
    const remainderWords = words.slice(pWords.length);
    if (remainderWords.length === 0) return;

    result.familyParticle = particleOriginal;
    result.familyParts = remainderWords;
    result.familyParticleBehavior = 'localeDefault';
    return;
  }
}

function derivePreferredGiven(result: ParsedName): void {
  if (result.preferredGiven) return;
  const nick = result.nickname?.trim();
  if (!nick) return;
  result.preferredGiven = nick.replace(/^[\"'\(\[]+/, '').replace(/[\"'\)\]]+$/, '').trim() || undefined;
}

function deriveSortHelpers(result: ParsedName): void {
  const last = result.last?.trim();
  const first = result.first?.trim();
  const middle = result.middle?.trim();

  let display = '';
  if (last && first) {
    display = `${last}, ${first}${middle ? ` ${middle}` : ''}`;
  } else if (last) {
    display = last;
  } else if (first) {
    display = `${first}${middle ? ` ${middle}` : ''}`;
  }

  // Include generational/dynastic suffixes (identity-like) in sort display, exclude credentials by default.
  const identitySuffix = result.suffixTokens
    ?.filter(t => t.type === 'generational' || t.type === 'dynasticNumber')
    .map(t => t.value)
    .filter(Boolean)
    .join(', ');
  if (display && identitySuffix) {
    display = `${display}, ${identitySuffix}`;
  }

  if (!display) return;

  const key = display
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  result.sort = { display, key };
}

/**
 * Extract first name from a full name
 */
export function getFirstName(fullName: string): string | undefined {
  return parseName(fullName).first;
}

/**
 * Extract last name from a full name
 */
export function getLastName(fullName: string): string | undefined {
  return parseName(fullName).last;
}

/**
 * Extract nickname from a full name
 */
export function getNickname(fullName: string): string | undefined {
  return parseName(fullName).nickname;
}
