/**
 * Common name suffixes
 */
export const SUFFIXES = [
  'Jr',
  'Jr.',
  'Sr',
  'Sr.',
  'II',
  'III',
  'IV',
  'V',
  'PhD',
  'Ph.D.',
  'MD',
  'M.D.',
  'Esq',
  'Esq.',
  'DDS',
  'D.D.S.',
  'JD',
  'J.D.',
  'MBA',
  'M.B.A.',
  'CPA',
  'RN',
  'DVM',
];

/**
 * Check if a string is a known suffix
 */
export function isSuffix(str: string): boolean {
  return SUFFIXES.some(suffix => suffix.toLowerCase() === str.toLowerCase());
}
