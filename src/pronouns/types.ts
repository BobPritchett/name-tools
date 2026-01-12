/**
 * Pronoun role - the grammatical function of the pronoun
 */
export type PronounRole =
  | 'subject'
  | 'object'
  | 'possessiveDeterminer'
  | 'possessivePronoun'
  | 'reflexive';

/**
 * A complete set of pronouns for all grammatical roles.
 *
 * Fields are intentionally explicit for legal document and template generation.
 */
export interface PronounSet {
  /** Stable identifier (e.g., "he", "she", "they", "ze-hir") */
  id: string;
  /** Short human-readable label (e.g., "he/him", "she/her", "they/them") */
  label: string;
  /** Subjective case: he, she, they, ze */
  subject: string;
  /** Objective case: him, her, them, zir */
  object: string;
  /** Possessive determiner: his, her, their (as in "their book") */
  possessiveDeterminer: string;
  /** Possessive pronoun: his, hers, theirs (as in "the book is theirs") */
  possessivePronoun: string;
  /** Reflexive: himself, herself, themselves */
  reflexive: string;
  /** Optional notes about usage */
  notes?: string;
}

/**
 * Capitalization options for formatting pronouns
 */
export type Capitalization = 'lower' | 'title' | 'upper';

/**
 * Options for formatting pronouns
 */
export interface FormatOptions {
  /** How to capitalize the pronoun (default: 'lower') */
  capitalization?: Capitalization;
}

/**
 * Result of extracting pronouns from a name string
 */
export interface PronounExtractionResult {
  /** The name with pronouns removed */
  name: string;
  /** Extracted pronoun set, if found */
  pronouns?: PronounSet;
  /** Raw pronoun spec as written (e.g., "they/them") */
  rawPronounSpec?: string;
}
