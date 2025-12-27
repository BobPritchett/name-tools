import { isPrefix } from './data/prefixes';
import { isSuffix } from './data/suffixes';
import { isParticle } from './data/particles';
import { isCommonSurname, isCommonFirstName } from './data/surnames';
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
  const result: ParsedName = { first: '', last: '' };

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

  // First check for comma-separated suffixes/titles
  const commaParts = workingText.split(',');
  if (commaParts.length > 1) {
    const lastPart = commaParts[commaParts.length - 1].trim();
    const firstWordOfLast = lastPart.split(/\s+/)[0];

    // Check if it's a suffix or title
    if (isSuffix(firstWordOfLast) || /queen|king|consort/i.test(lastPart)) {
      result.suffix = lastPart;
      commaParts.pop();
    }
    workingText = commaParts.join(' ').trim();
  }

  // Then check for space-separated suffixes
  const parts = workingText.split(/\s+/);
  const suffixesFound: string[] = [];

  while (parts.length > 1) {
    const lastWord = parts[parts.length - 1];
    if (isSuffix(lastWord) && !(result.suffix && result.suffix.includes(lastWord))) {
      suffixesFound.unshift(lastWord);
      parts.pop();
    } else {
      break;
    }
  }

  if (suffixesFound.length > 0) {
    result.suffix = result.suffix
      ? result.suffix + ', ' + suffixesFound.join(', ')
      : suffixesFound.join(', ');
  }

  return parts.join(' ');
}

/**
 * Extract prefixes/salutations (left-to-right)
 */
function extractPrefixes(parts: string[], result: ParsedName): string[] {
  const prefixesFound: string[] = [];

  while (parts.length > 1) {
    const firstWord = parts[0];
    if (isPrefix(firstWord)) {
      prefixesFound.push(firstWord);
      parts.shift();
    } else {
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

  // Default: last word is surname
  let surnameStartIndex = parts.length - 1;

  // Scan backward from second-to-last word to find the boundary
  if (parts.length > 1) {
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
  }

  // Assign parts
  if (surnameStartIndex === 0) {
    // Edge case: entire name is surname
    if (parts.length === 1) {
      result.first = parts[0];
      result.last = parts[0];
    } else {
      result.last = parts.join(' ');
      result.first = parts[0];
    }
  } else {
    // Normal case
    result.first = parts[0];
    if (surnameStartIndex > 1) {
      result.middle = parts.slice(1, surnameStartIndex).join(' ');
    }
    result.last = parts.slice(surnameStartIndex).join(' ');
  }
}

/**
 * Extract first name from a full name
 */
export function getFirstName(fullName: string): string {
  return parseName(fullName).first;
}

/**
 * Extract last name from a full name
 */
export function getLastName(fullName: string): string {
  return parseName(fullName).last;
}

/**
 * Extract nickname from a full name
 */
export function getNickname(fullName: string): string | undefined {
  return parseName(fullName).nickname;
}
