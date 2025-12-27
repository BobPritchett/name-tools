import { isInList } from './utils';

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
] as const;

/**
 * Check if a string is a known prefix
 */
export function isPrefix(str: string): boolean {
  return isInList(PREFIXES, str);
}
