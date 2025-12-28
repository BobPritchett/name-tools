/**
 * name-tools - A utility library for parsing, formatting, and manipulating person names
 * Supports international names with particles, compound surnames, and nicknames
 * @packageDocumentation
 */

// Export data sets
export { PARTICLES, MULTI_WORD_PARTICLES, isParticle, isMultiWordParticle } from './data/particles';
export { COMMON_SURNAMES, COMMON_FIRST_NAMES, isCommonSurname, isCommonFirstName } from './data/surnames';

// Export parsers
export {
  parseName,
  getFirstName,
  getLastName,
  getNickname,
} from './parsers';

export type { ParsedName, NameAffixToken, NameAffixTokenType, NameToken, NameTokenType } from './types';

// Export formatters
export {
  formatName,
} from './formatters';

export type { NameFormatOptions, NamePreset } from './types';
