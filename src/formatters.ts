import { parseName, ParsedName } from './parsers';

/**
 * Format a name in "Last, First" format
 */
export function formatLastFirst(name: string | ParsedName): string {
  const parsed = typeof name === 'string' ? parseName(name) : name;

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
  const parsed = typeof name === 'string' ? parseName(name) : name;

  const parts: string[] = [];

  if (parsed.prefix) {
    parts.push(parsed.prefix);
  }

  if (parsed.first) {
    parts.push(parsed.first);
  }

  if (parsed.middle) {
    parts.push(parsed.middle);
  }

  if (parsed.last) {
    parts.push(parsed.last);
  }

  if (parsed.suffix) {
    parts.push(parsed.suffix);
  }

  return parts.join(' ');
}

/**
 * Format a name with abbreviated middle name/initial
 */
export function formatWithMiddleInitial(name: string | ParsedName): string {
  const parsed = typeof name === 'string' ? parseName(name) : name;

  const parts: string[] = [];

  if (parsed.prefix) {
    parts.push(parsed.prefix);
  }

  if (parsed.first) {
    parts.push(parsed.first);
  }

  if (parsed.middle) {
    // Take first letter of each middle name
    const initials = parsed.middle.split(' ')
      .map(m => m.charAt(0).toUpperCase() + '.')
      .join(' ');
    parts.push(initials);
  }

  if (parsed.last) {
    parts.push(parsed.last);
  }

  if (parsed.suffix) {
    parts.push(parsed.suffix);
  }

  return parts.join(' ');
}

/**
 * Format a name in formal style (Title Last)
 */
export function formatFormal(name: string | ParsedName): string {
  const parsed = typeof name === 'string' ? parseName(name) : name;

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
