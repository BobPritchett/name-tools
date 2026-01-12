import type { PronounSet } from './types';
import { BUILT_IN_PRONOUNS, SPEC_ALIASES } from './data';

/**
 * Normalize a pronoun spec string for lookup.
 * Lowercases, trims, and removes extra whitespace.
 */
function normalizeSpec(spec: string): string {
  return spec.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Derive a reflexive pronoun from a subject pronoun.
 * Used as fallback for custom pronoun specs.
 */
function deriveReflexive(subject: string): string {
  const s = subject.toLowerCase();
  if (s === 'he') return 'himself';
  if (s === 'she') return 'herself';
  if (s === 'it') return 'itself';
  if (s === 'they') return 'themselves';
  // Generic fallback: subject + "self"
  return subject + 'self';
}

/**
 * Parse a slash-separated pronoun spec into a PronounSet.
 *
 * Supports various formats:
 * - 2 tokens: "he/him" → subject, object (others derived)
 * - 3 tokens: "she/her/hers" → subject, object, possessive
 * - 4 tokens: "they/them/their/theirs" → full set minus reflexive
 * - 5 tokens: "ze/zir/zir/zirs/zirself" → fully specified
 *
 * @param spec - The pronoun specification string
 * @returns A complete PronounSet
 * @throws Error if the spec is invalid (empty or no tokens)
 */
export function parsePronounSpec(spec: string): PronounSet {
  const norm = normalizeSpec(spec);

  // 1) Check alias map first
  const aliasId = SPEC_ALIASES[norm];
  if (aliasId && BUILT_IN_PRONOUNS[aliasId]) {
    return { ...BUILT_IN_PRONOUNS[aliasId] };
  }

  // 2) Check if it's directly a built-in ID
  if (BUILT_IN_PRONOUNS[norm]) {
    return { ...BUILT_IN_PRONOUNS[norm] };
  }

  // 3) Parse as slash-separated tokens
  const rawTokens = spec
    .split('/')
    .map((t) => t.trim())
    .filter(Boolean);

  if (rawTokens.length < 1) {
    throw new Error(`Invalid pronoun spec: "${spec}". Expected at least one token.`);
  }

  const [subject, second, third, fourth, fifth] = rawTokens;
  let object = '';
  let possDet = '';
  let possPron = '';
  let reflexive = '';

  if (rawTokens.length === 1) {
    // Single token - try looking it up as ID
    const maybeId = subject.toLowerCase();
    if (BUILT_IN_PRONOUNS[maybeId]) {
      return { ...BUILT_IN_PRONOUNS[maybeId] };
    }
    // Derive minimal set from single pronoun
    object = subject;
    possDet = subject + "'s";
    possPron = possDet;
    reflexive = deriveReflexive(subject);
  } else if (rawTokens.length === 2) {
    // Subject + object (most common: "he/him", "she/her")
    const subjLower = subject.toLowerCase();
    const secondLower = second.toLowerCase();

    // Check for common patterns that map to built-ins
    if (subjLower === 'he' && (secondLower === 'him' || secondLower === 'his')) {
      return { ...BUILT_IN_PRONOUNS['he'] };
    }
    if (subjLower === 'she' && secondLower.startsWith('her')) {
      return { ...BUILT_IN_PRONOUNS['she'] };
    }
    if (
      subjLower === 'they' &&
      (secondLower === 'them' || secondLower.startsWith('their'))
    ) {
      return { ...BUILT_IN_PRONOUNS['they'] };
    }

    object = second;
    // For 2-token specs, possessive forms default to object
    possDet = second;
    possPron = second;
    reflexive = deriveReflexive(subject);
  } else if (rawTokens.length === 3) {
    // subject / object / possessive (determiner = pronoun)
    object = second;
    possDet = third;
    possPron = third;
    reflexive = deriveReflexive(subject);
  } else if (rawTokens.length === 4) {
    // subject / object / possessiveDeterminer / possessivePronoun
    object = second;
    possDet = third;
    possPron = fourth;
    reflexive = deriveReflexive(subject);
  } else {
    // 5+ tokens: subject / object / possDet / possPron / reflexive
    object = second;
    possDet = third;
    possPron = fourth;
    reflexive = fifth || deriveReflexive(subject);
  }

  return {
    id: norm.replace(/\s+/g, ''),
    label: rawTokens.join('/'),
    subject,
    object,
    possessiveDeterminer: possDet,
    possessivePronoun: possPron,
    reflexive,
    notes: 'Custom pronoun set',
  };
}

/**
 * Get a PronounSet by ID or shorthand specification.
 *
 * This is the main entry point for pronoun lookup. Accepts:
 * - Built-in IDs: "he", "she", "they", "ze-hir", etc.
 * - Common specs: "he/him", "she/her", "they/them", etc.
 * - Custom specs: "ey/em/eir/eirs/emself"
 * - An existing PronounSet (returns a copy)
 *
 * @param input - A pronoun ID, spec string, or existing PronounSet
 * @returns A complete PronounSet
 * @throws Error if input is empty or invalid
 *
 * @example
 * ```typescript
 * const hePronouns = getPronounSet('he');
 * const shePronouns = getPronounSet('she/her');
 * const theyPronouns = getPronounSet('they/them');
 * const customPronouns = getPronounSet('xe/xem/xyr/xyrs/xemself');
 * ```
 */
export function getPronounSet(input: string | PronounSet): PronounSet {
  if (!input) {
    throw new Error('getPronounSet: input is required');
  }

  // If already a PronounSet, return a copy
  if (typeof input === 'object') {
    return { ...input };
  }

  return parsePronounSpec(input);
}
