import { isPrefix } from './data/prefixes';
import { isSuffix } from './data/suffixes';

export interface ParsedName {
  prefix?: string;
  first: string;
  middle?: string;
  last: string;
  suffix?: string;
}

/**
 * Parse a full name string into its component parts
 * @param fullName - The full name to parse
 * @returns Object containing parsed name components
 */
export function parseName(fullName: string): ParsedName {
  if (!fullName || typeof fullName !== 'string') {
    throw new Error('Invalid name: expected non-empty string');
  }

  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 0) {
    throw new Error('Invalid name: no parts found');
  }

  const result: ParsedName = {
    first: '',
    last: '',
  };

  let startIndex = 0;
  let endIndex = parts.length - 1;

  // Check for prefix
  if (parts.length > 1 && isPrefix(parts[0])) {
    result.prefix = parts[0];
    startIndex = 1;
  }

  // Check for suffix
  if (startIndex < endIndex && isSuffix(parts[endIndex])) {
    result.suffix = parts[endIndex];
    endIndex--;
  }

  // Handle remaining parts
  const remainingParts = parts.slice(startIndex, endIndex + 1);

  if (remainingParts.length === 0) {
    throw new Error('Invalid name: no name parts found after parsing prefix/suffix');
  }

  if (remainingParts.length === 1) {
    // Only one name part - treat as last name
    result.first = remainingParts[0];
    result.last = remainingParts[0];
  } else if (remainingParts.length === 2) {
    // Two parts - first and last
    result.first = remainingParts[0];
    result.last = remainingParts[1];
  } else {
    // Three or more parts - first, middle(s), last
    result.first = remainingParts[0];
    result.last = remainingParts[remainingParts.length - 1];
    result.middle = remainingParts.slice(1, -1).join(' ');
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
 * Extract initials from a full name
 */
export function getInitials(fullName: string): string {
  const parsed = parseName(fullName);
  let initials = parsed.first.charAt(0).toUpperCase();

  if (parsed.middle) {
    initials += parsed.middle.split(' ').map(m => m.charAt(0).toUpperCase()).join('');
  }

  initials += parsed.last.charAt(0).toUpperCase();

  return initials;
}
