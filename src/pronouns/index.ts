/**
 * Pronoun support module for name-tools.
 *
 * Provides pronoun lookup, formatting, and integration with entity classification
 * and gender guessing. Designed to be tree-shakeable - only import what you need.
 *
 * @example Basic usage
 * ```typescript
 * import { getPronounSet, formatPronoun } from 'name-tools/pronouns';
 *
 * const pronouns = getPronounSet('she/her');
 * console.log(pronouns.subject); // "she"
 *
 * const formatted = formatPronoun(pronouns, 'subject', { capitalization: 'title' });
 * console.log(formatted); // "She"
 * ```
 *
 * @example Integration with gender
 * ```typescript
 * import { createGenderDB } from 'name-tools/gender/coverage95';
 * import { getPronounsForPerson } from 'name-tools/pronouns';
 * import { parseName } from 'name-tools';
 *
 * const genderDB = createGenderDB();
 * const entity = parseName('John Smith');
 *
 * if (entity.kind === 'person') {
 *   const pronouns = getPronounsForPerson(entity, { genderDB });
 *   console.log(pronouns.label); // "he/him"
 * }
 * ```
 *
 * @example Template filling
 * ```typescript
 * import { getPronounSet, fillPronounTemplate } from 'name-tools/pronouns';
 *
 * const pronouns = getPronounSet('they/them');
 * const template = '{{subject}} signed {{possDet}} name.';
 * const filled = fillPronounTemplate(template, pronouns);
 * // "they signed their name."
 * ```
 *
 * @example Extracting pronouns from names
 * ```typescript
 * import { extractPronouns } from 'name-tools/pronouns';
 *
 * const result = extractPronouns('Alex Johnson (they/them)');
 * console.log(result.name);     // "Alex Johnson"
 * console.log(result.pronouns); // { id: 'they', subject: 'they', ... }
 * ```
 *
 * @packageDocumentation
 */

// Types
export type {
  PronounSet,
  PronounRole,
  Capitalization,
  FormatOptions,
  PronounExtractionResult,
} from './types';

// Data
export { BUILT_IN_PRONOUNS, SPEC_ALIASES } from './data';

// Parser
export { getPronounSet, parsePronounSpec } from './parser';

// Formatter
export {
  formatPronoun,
  fillPronounTemplate,
  fillPronounTemplateSmart,
} from './formatter';

// Integration
export {
  getDefaultPronouns,
  getPronounsForEntity,
  getPronounsForPerson,
  getPronouns,
  type GetPronounsForPersonOptions,
} from './integration';

// Extractor
export {
  extractPronouns,
  hasPronouns,
  pronounsToGenderHint,
} from './extractor';
