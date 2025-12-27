import { parseName } from './parsers';
import { ParsedName } from './types';
import { isParticle } from './data/particles';

/**
 * Ensures we have a ParsedName object
 */
function ensureParsed(name: string | ParsedName): ParsedName {
  return typeof name === 'string' ? parseName(name) : name;
}

/**
 * Format a name in "Last, First" format
 */
export function formatLastFirst(name: string | ParsedName): string {
  const parsed = ensureParsed(name);

  if (!parsed.last) {
    const parts: string[] = [];
    if (parsed.first) parts.push(parsed.first);
    if (parsed.middle) parts.push(parsed.middle);
    if (parsed.suffix) parts.push(parsed.suffix);
    return parts.join(' ');
  }

  let result = parsed.last;

  if (parsed.first) {
    result += ', ' + parsed.first;
  }

  if (parsed.middle) {
    result += ' ' + parsed.middle;
  }

  if (parsed.suffix) {
    result += ', ' + parsed.suffix;
  }

  return result;
}

/**
 * Format a name in "First Last" format (standard)
 */
export function formatFirstLast(name: string | ParsedName): string {
  const parsed = ensureParsed(name);

  const parts: string[] = [];

  if (parsed.prefix) parts.push(parsed.prefix);
  if (parsed.first) parts.push(parsed.first);
  if (parsed.middle) parts.push(parsed.middle);
  if (parsed.last) parts.push(parsed.last);
  if (parsed.suffix) parts.push(parsed.suffix);

  return parts.join(' ');
}

/**
 * Format a name with abbreviated middle name/initial
 */
export function formatWithMiddleInitial(name: string | ParsedName): string {
  const parsed = ensureParsed(name);

  const parts: string[] = [];

  if (parsed.prefix) parts.push(parsed.prefix);
  if (parsed.first) parts.push(parsed.first);

  if (parsed.middle) {
    // Take first letter of each middle name
    const initials = parsed.middle.split(' ')
      .map(m => m.charAt(0).toUpperCase() + '.')
      .join(' ');
    parts.push(initials);
  }

  if (parsed.last) parts.push(parsed.last);
  if (parsed.suffix) parts.push(parsed.suffix);

  return parts.join(' ');
}

/**
 * Format a name in formal style (Title Last)
 */
export function formatFormal(name: string | ParsedName): string {
  const parsed = ensureParsed(name);

  const parts: string[] = [];

  if (parsed.prefix) {
    parts.push(parsed.prefix);
  } else {
    parts.push('Mr/Ms');
  }

  if (parsed.last) {
    parts.push(parsed.last);
  }

  return parts.join(' ');
}

/**
 * Extract initials from a name
 * Note: Particles and prefixes are excluded from initials
 */
export function getInitials(name: string | ParsedName): string {
  const parsed = ensureParsed(name);

  let initials = '';

  // Get first letter of first name
  if (parsed.first && parsed.first.length > 0) {
    initials += parsed.first.charAt(0).toUpperCase();
  }

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
  if (parsed.last) {
    const lastParts = parsed.last.split(' ');
    for (const part of lastParts) {
      // Skip particles, but take the first non-particle word
      if (!isParticle(part) && part.length > 0) {
        initials += part.charAt(0).toUpperCase();
        break; // Only take first non-particle word of surname
      }
    }
  }

  return initials;
}
