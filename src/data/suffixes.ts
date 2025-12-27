import { isInList } from './utils';

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
] as const;

/**
 * Check if a string is a known suffix
 */
export function isSuffix(str: string): boolean {
  return isInList(SUFFIXES, str);
}
