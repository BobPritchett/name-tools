import type { PronounSet, PronounRole, FormatOptions, Capitalization } from './types';

/**
 * Apply capitalization to a string.
 */
function applyCapitalization(s: string, mode: Capitalization): string {
  if (!s) return s;

  switch (mode) {
    case 'upper':
      return s.toUpperCase();
    case 'title':
      return s.charAt(0).toUpperCase() + s.slice(1);
    case 'lower':
    default:
      return s.toLowerCase();
  }
}

/**
 * Get a single pronoun from a set, with optional capitalization.
 *
 * @param set - The pronoun set to extract from
 * @param role - Which grammatical role to get
 * @param options - Formatting options
 * @returns The formatted pronoun string
 *
 * @example
 * ```typescript
 * const pronouns = getPronounSet('she');
 * formatPronoun(pronouns, 'subject', { capitalization: 'title' }); // "She"
 * formatPronoun(pronouns, 'object');                               // "her"
 * formatPronoun(pronouns, 'reflexive', { capitalization: 'upper' }); // "HERSELF"
 * ```
 */
export function formatPronoun(
  set: PronounSet,
  role: PronounRole,
  options: FormatOptions = {}
): string {
  const { capitalization = 'lower' } = options;
  const value = set[role] || '';

  if (!value) return '';

  return applyCapitalization(value, capitalization);
}

/**
 * Placeholder tokens supported in templates
 */
const TEMPLATE_PLACEHOLDERS: Record<string, PronounRole> = {
  '{{subject}}': 'subject',
  '{{object}}': 'object',
  '{{possDet}}': 'possessiveDeterminer',
  '{{possessiveDeterminer}}': 'possessiveDeterminer',
  '{{possPron}}': 'possessivePronoun',
  '{{possessivePronoun}}': 'possessivePronoun',
  '{{reflexive}}': 'reflexive',
};

/**
 * Fill pronoun placeholders in a template string.
 *
 * Supported placeholders:
 * - `{{subject}}` - subjective pronoun (he, she, they)
 * - `{{object}}` - objective pronoun (him, her, them)
 * - `{{possDet}}` or `{{possessiveDeterminer}}` - possessive determiner (his, her, their)
 * - `{{possPron}}` or `{{possessivePronoun}}` - possessive pronoun (his, hers, theirs)
 * - `{{reflexive}}` - reflexive pronoun (himself, herself, themselves)
 *
 * @param template - The template string with placeholders
 * @param set - The pronoun set to use for replacements
 * @param options - Formatting options (capitalization applies to all replacements)
 * @returns The filled template string
 *
 * @example
 * ```typescript
 * const template = '{{subject}} signed {{possDet}} name and identified {{reflexive}}.';
 * const borrower = getPronounSet('she');
 *
 * fillPronounTemplate(template, borrower);
 * // "she signed her name and identified herself."
 *
 * fillPronounTemplate(template, borrower, { capitalization: 'title' });
 * // "She signed Her name and identified Herself."
 * ```
 */
export function fillPronounTemplate(
  template: string,
  set: PronounSet,
  options: FormatOptions = {}
): string {
  const { capitalization = 'lower' } = options;

  let result = template;
  for (const [placeholder, role] of Object.entries(TEMPLATE_PLACEHOLDERS)) {
    const value = set[role] || '';
    const formatted = applyCapitalization(value, capitalization);
    result = result.split(placeholder).join(formatted);
  }

  return result;
}

/**
 * Fill pronoun placeholders with smart capitalization.
 *
 * Unlike `fillPronounTemplate`, this version detects sentence-initial positions
 * and applies title case only there, keeping other occurrences lowercase.
 *
 * @param template - The template string with placeholders
 * @param set - The pronoun set to use
 * @returns The filled template with smart capitalization
 *
 * @example
 * ```typescript
 * const template = '{{subject}} read the document. Then {{subject}} signed it.';
 * const pronouns = getPronounSet('she');
 *
 * fillPronounTemplateSmart(template, pronouns);
 * // "She read the document. Then she signed it."
 * ```
 */
export function fillPronounTemplateSmart(template: string, set: PronounSet): string {
  let result = template;

  for (const [placeholder, role] of Object.entries(TEMPLATE_PLACEHOLDERS)) {
    const value = set[role] || '';
    if (!value) {
      result = result.split(placeholder).join('');
      continue;
    }

    // Replace with markers first, then process capitalization
    const marker = `\x00PRONOUN_${role}\x00`;
    result = result.split(placeholder).join(marker);
  }

  // Now apply smart capitalization
  // Pattern: start of string or after sentence-ending punctuation + space
  const sentenceStartRe = /(^|[.!?]\s+)(\x00PRONOUN_\w+\x00)/g;
  result = result.replace(sentenceStartRe, (_, prefix, marker) => {
    const roleMatch = marker.match(/PRONOUN_(\w+)/);
    if (!roleMatch) return prefix + marker;
    const role = roleMatch[1] as PronounRole;
    const value = set[role] || '';
    return prefix + applyCapitalization(value, 'title');
  });

  // Replace remaining markers with lowercase
  const remainingRe = /\x00PRONOUN_(\w+)\x00/g;
  result = result.replace(remainingRe, (_, role: PronounRole) => {
    const value = set[role] || '';
    return applyCapitalization(value, 'lower');
  });

  return result;
}
