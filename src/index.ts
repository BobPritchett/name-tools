/**
 * name-tools - A utility library for parsing, formatting, and manipulating person names
 * @packageDocumentation
 */

// Export data sets
export { PREFIXES, isPrefix } from './data/prefixes';
export { SUFFIXES, isSuffix } from './data/suffixes';

// Export parsers
export {
  parseName,
  getFirstName,
  getLastName,
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
