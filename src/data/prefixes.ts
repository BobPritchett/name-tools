/**
 * Common name prefixes/titles
 */
export const PREFIXES = [
  'Mr',
  'Mr.',
  'Mrs',
  'Mrs.',
  'Ms',
  'Ms.',
  'Miss',
  'Dr',
  'Dr.',
  'Prof',
  'Prof.',
  'Rev',
  'Rev.',
  'Hon',
  'Hon.',
  'Sir',
  'Lady',
  'Lord',
];

/**
 * Check if a string is a known prefix
 */
export function isPrefix(str: string): boolean {
  return PREFIXES.some(prefix => prefix.toLowerCase() === str.toLowerCase());
}
