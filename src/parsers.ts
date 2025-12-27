import { isPrefix } from './data/prefixes';
import { isSuffix } from './data/suffixes';
import { isParticle } from './data/particles';
import { isCommonSurname, isCommonFirstName } from './data/surnames';

export interface ParsedName {
  prefix?: string;
  first: string;
  middle?: string;
  last: string;
  suffix?: string;
  nickname?: string;
}

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

  const result: ParsedName = {
    first: '',
    last: '',
  };

  let text = fullName.trim();

  // Step 1: Extract nicknames (quoted or parenthesized text)
  const nickMatch = text.match(/([\"\'\(\[\"\'])(.*?)([\"\'\)\]\"\'])/);
  if (nickMatch) {
    result.nickname = nickMatch[2].trim();
    text = text.replace(nickMatch[0], ' ').replace(/\s+/g, ' ').trim();
  }

  // Step 2: Extract suffixes and titles (right-to-left)
  // First check for comma-separated suffixes/titles
  const commaParts = text.split(',');

  if (commaParts.length > 1) {
    const lastPart = commaParts[commaParts.length - 1].trim();
    const firstWordOfLast = lastPart.split(/\s+/)[0];

    // Check if it's a suffix or title
    if (isSuffix(firstWordOfLast) || lastPart.toLowerCase().includes('queen') ||
        lastPart.toLowerCase().includes('king') || lastPart.toLowerCase().includes('consort')) {
      result.suffix = lastPart;
      commaParts.pop();
    }

    text = commaParts.join(' ').trim();
  }

  // Then check for space-separated suffixes
  let parts = text.split(/\s+/);
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

  // Step 3: Extract prefixes/salutations (left-to-right)
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

  // Step 4: Determine surname boundary using the "Golden Rule" algorithm
  // Default: last word is surname
  let surnameStartIndex = parts.length - 1;

  // Scan backward from second-to-last word
  if (parts.length > 1) {
    for (let i = parts.length - 2; i >= 0; i--) {
      const word = parts[i];
      const nextWord = parts[i + 1];

      // Case A: Particle (van, von, de, da, af, y, etc.)
      if (isParticle(word)) {
        surnameStartIndex = i;
        continue; // Keep going left for multi-word particles
      }

      // Case B: Compound Surname Heuristic
      // If it's a known common surname AND not a common first name AND not the first word
      if (isCommonSurname(word) && !isCommonFirstName(word) && i > 0) {
        surnameStartIndex = i;
        continue; // Keep checking for more compound parts
      }

      // Found the boundary
      break;
    }
  }

  // Step 5: Assign first, middle, and last names
  if (parts.length > 0) {
    if (surnameStartIndex === 0) {
      // Edge case: entire name is surname (single word or all particles)
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

  if (!result.first && !result.last) {
    throw new Error('Invalid name: no name parts found after parsing');
  }

  return result;
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

/**
 * Extract initials from a full name
 * Note: Particles and prefixes are excluded from initials
 */
export function getInitials(fullName: string): string {
  const parsed = parseName(fullName);

  // Get first letter of first name
  let initials = parsed.first.charAt(0).toUpperCase();

  // Get first letters of middle names (excluding particles)
  if (parsed.middle) {
    const middleParts = parsed.middle.split(' ');
    for (const part of middleParts) {
      // Skip particles
      if (!isParticle(part) && part.length > 0) {
        initials += part.charAt(0).toUpperCase();
      }
    }
  }

  // Get first letter of last name (excluding particles)
  const lastParts = parsed.last.split(' ');
  for (const part of lastParts) {
    // Skip particles, but take the first non-particle word
    if (!isParticle(part) && part.length > 0) {
      initials += part.charAt(0).toUpperCase();
      break; // Only take first non-particle word of surname
    }
  }

  return initials;
}
