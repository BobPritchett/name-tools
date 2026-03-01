/**
 * Input normalization utilities for name parsing
 */

/**
 * Normalize input string for classification
 * - Trim whitespace
 * - Collapse repeated whitespace
 * - Normalize quotes and apostrophes
 * - Normalize connector spacing
 * - Preserve case
 */
export function normalizeInput(raw: string): string {
  if (!raw) return '';

  let s = raw.trim();

  // Collapse whitespace
  s = s.replace(/\s+/g, ' ');

  // Normalize fancy quotes to standard
  s = s.replace(/[""]/g, '"');
  s = s.replace(/['']/g, "'");

  // Normalize connector spacing (& and +)
  s = s.replace(/\s*&\s*/g, ' & ');
  s = s.replace(/\s*\+\s*/g, ' + ');

  // Remove trailing commas/spaces
  s = s.replace(/[,\s]+$/g, '');

  return s;
}

/**
 * Tokenize a string into words
 */
export function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/**
 * Check if a token looks like a capitalized name token
 * Matches:
 * - Full names: "John", "Mary", "O'Brien", "Smith-Jones"
 * - Initials: "J", "J.", "M."
 */
export function isNameLikeToken(token: string): boolean {
  // Single letter initial (with optional period) or multiple initials (e.g. J.F. or J.F)
  if (/^([A-Z]\.?)+$/.test(token)) return true;
  // Name token starting with uppercase, allowing internal capitals (DeBartolo, MacDonald)
  // and hyphens/apostrophes (O'Brien, Smith-Jones)
  return /^[A-Z][a-zA-Z]*(?:['-][A-zA-Z]+)*$/.test(token);
}

/**
 * Normalize for case-insensitive comparison
 */
export function normalizeForCompare(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if text contains only ASCII characters
 */
export function isAsciiOnly(text: string): boolean {
  return /^[\x00-\x7F]*$/.test(text);
}

/**
 * Extract text within parentheses
 */
export function extractParenContent(text: string): { main: string; paren: string } | null {
  const match = text.match(/\s*\(([^)]+)\)\s*/);
  if (match) {
    return { 
      main: text.replace(match[0], ' ').replace(/\s+/g, ' ').trim(), 
      paren: match[1].trim() 
    };
  }
  return null;
}

/**
 * Remove parenthetical annotations
 */
export function stripParenAnnotation(text: string): string {
  return text.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
}

/**
 * Check if text is all uppercase
 */
export function isAllCaps(text: string): boolean {
  const letters = text.replace(/[^a-zA-Z]/g, '');
  return letters.length > 0 && letters === letters.toUpperCase();
}

/**
 * Title case a word (first letter uppercase, rest lowercase)
 */
export function titleCase(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Check if text contains an @ symbol (email/handle indicator)
 */
export function hasAtSymbol(text: string): boolean {
  return text.includes('@');
}

/**
 * Extract angle bracket content: "John Doe <john@example.com>" -> { display: "John Doe", bracket: "john@example.com" }
 */
export function extractAngleBrackets(text: string): { display: string; bracket: string } | null {
  const match = text.match(/^(.*?)\s*<([^>]+)>\s*$/);
  if (match) {
    return { display: match[1].trim(), bracket: match[2].trim() };
  }
  return null;
}

/**
 * Check if text starts with "The " (case-insensitive)
 */
export function startsWithThe(text: string): boolean {
  return /^the\s+/i.test(text);
}

/**
 * Remove leading "The " if present
 */
export function stripLeadingThe(text: string): string {
  return text.replace(/^the\s+/i, '');
}

/**
 * Check if text ends with a plural surname pattern (Smiths, Joneses, Foxes)
 */
export function hasPluralSurnameEnding(text: string): boolean {
  // Common plural endings after a capitalized word
  return /\b[A-Z][a-z]+(s|es)\s*$/i.test(text);
}

/**
 * Extract the base surname from a plural form
 * "Smiths" -> "Smith", "Joneses" -> "Jones", "Churches" -> "Church"
 */
export function extractBaseSurname(plural: string): string {
  const word = plural.trim();

  // Handle -es endings (Joneses -> Jones, Churches -> Church, Foxes -> Fox)
  if (/([sc]h|[sxz])es$/i.test(word)) {
    return word.slice(0, -2);
  }
  // Handle -ies -> -y (Murphies -> Murphy) - rare but possible
  if (/ies$/i.test(word)) {
    return word.slice(0, -3) + 'y';
  }
  // Handle simple -s (Smiths -> Smith)
  if (/s$/i.test(word)) {
    return word.slice(0, -1);
  }

  return word;
}
