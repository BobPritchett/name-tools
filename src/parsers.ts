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

  // First, identify all comma-separated parts from the end that are suffixes
  const parts = workingText.split(',');
  while (parts.length > 1) {
    const lastPart = parts[parts.length - 1].trim();
    const firstWordOfLast = lastPart.split(/\s+/)[0];

    if (isSuffix(firstWordOfLast) || /queen|king|consort/i.test(lastPart)) {
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
    if (isSuffix(cleanWord)) {
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

  while (parts.length > 1) {
    let matchFound = false;

    // Try matching multi-word prefixes (up to 5 words)
    // We check longer matches first to avoid greedy matching of single words
    // We must leave at least one part for the actual name (parts.length - 1)
    for (let len = Math.min(parts.length - 1, 5); len >= 1; len--) {
      const candidate = parts.slice(0, len).join(' ');
      if (isPrefix(candidate)) {
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
