/**
 * name-tools - A utility library for parsing, formatting, and manipulating person names
 * Supports international names with particles, compound surnames, and nicknames
 * @packageDocumentation
 */

// Export data sets
export { PREFIXES, isPrefix } from './data/prefixes';
export { SUFFIXES, isSuffix } from './data/suffixes';
export { PARTICLES, MULTI_WORD_PARTICLES, isParticle, isMultiWordParticle } from './data/particles';
export { COMMON_SURNAMES, COMMON_FIRST_NAMES, isCommonSurname, isCommonFirstName } from './data/surnames';

// Export parsers
export {
  parseName,
  getFirstName,
  getLastName,
  getNickname,
  getInitials,
  type ParsedName,
} from './parsers';

// Export formatters
export {
  formatLastFirst,
  formatFirstLast,
  formatWithMiddleInitial,
  formatFormal,
} from './formatters';
