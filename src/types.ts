/**
 * Represents a person's name broken down into its component parts
 */
export type NameAffixTokenType =
  | 'honorific' // Mr, Mrs, Ms, Dr, Prof, Sir, Dame
  | 'style' // The Hon., His/Her Excellency, The Rt Hon
  | 'religious' // Rev, Fr, Rabbi, Imam, Sr (Sister), Br (Brother)
  | 'military' // Capt, Maj, Col, Gen, Sgt
  | 'judicial' // Judge, Justice
  | 'professional' // Esq, CPA, PE, RN
  | 'education' // PhD, Ph.D., MD, JD, MBA
  | 'generational' // Jr, Sr
  | 'dynasticNumber' // II, III, IV
  | 'postnominalHonor' // OBE, KBE etc (optional)
  | 'other';

export interface NameAffixToken {
  type: NameAffixTokenType;
  value: string; // exact substring as written (post-parsing whitespace/punctuation cleanup)
  normalized?: string; // optional: matching key (normalization layer output)
  entryId?: string; // optional: ID of matched canonical entry (for formatting)
  canonicalShort?: string; // optional: canonical short display form (data-driven)
  canonicalLong?: string; // optional: canonical long display form (data-driven)
  isAbbrev?: boolean;
  requiresCommaBefore?: boolean; // optional hint (US style often uses comma)
}

export type NameTokenType =
  | 'prefix'
  | 'given'
  | 'middle'
  | 'family'
  | 'particle'
  | 'suffix'
  | 'nickname'
  | 'literal';

export interface NameToken {
  type: NameTokenType;
  value: string;
  normalized?: string;
  noBreakAfter?: boolean;
  noBreakBefore?: boolean;
}

export interface ParsedName {
  prefix?: string;
  first?: string;
  middle?: string;
  last?: string;
  suffix?: string;
  nickname?: string;

  // typed affixes (additive; original strings remain display strings)
  prefixTokens?: NameAffixToken[];
  suffixTokens?: NameAffixToken[];

  // family particles (optional)
  familyParts?: string[]; // remaining family name parts excluding particle (recommended minimal)
  familyParticle?: string; // e.g., "van", "de", "de la", "al"
  familyParticleBehavior?: 'attach' | 'separate' | 'localeDefault';

  // preferred given name (optional; commonly derived from nickname)
  preferredGiven?: string;

  // sort helpers (optional, recommended)
  sort?: {
    key?: string; // normalized key for sorting/dedupe
    display?: string; // e.g., "Smith, John Q."
  };

  // optional full token stream (if supported by consumer)
  tokens?: NameToken[];
}

export type NamePreset =
  | 'display'
  | 'informal'
  | 'formalFull'
  | 'formalShort'
  | 'alphabetical'
  | 'initialed'
  | 'firstOnly'
  | 'preferredFirst'
  | 'preferredDisplay';

export type NameFormatOptions = {
  // High-level preset
  preset?: NamePreset; // default: "display"

  // Locale hint (reserved; not used yet)
  locale?: string | string[];

  // Output target
  output?: 'text' | 'html'; // default: "text"

  // Typography level (spaces + punctuation micro-rules)
  typography?: 'plain' | 'ui' | 'fine'; // default: "ui"

  // Line-break control
  noBreak?: 'none' | 'smart' | 'all'; // default: "smart"

  // Array rendering
  join?: 'none' | 'list' | 'couple'; // default: "none"
  conjunction?: 'and' | '&' | string; // default: "and"
  oxfordComma?: boolean; // default: true

  // Couple/list sharing/compression rules
  shareLastName?: 'auto' | 'never' | 'whenSame'; // default: "whenSame"
  sharePrefix?: 'auto' | 'never' | 'whenSame'; // default: "auto"
  shareSuffix?: 'auto' | 'never' | 'whenSame'; // default: "auto"

  // Explicit overrides for core parts
  prefer?: 'auto' | 'nickname' | 'first'; // default: "auto"
  middle?: 'full' | 'initial' | 'none'; // default varies by preset
  prefix?: 'include' | 'omit' | 'auto'; // default varies by preset
  suffix?: 'include' | 'omit' | 'auto'; // default varies by preset
  order?: 'given-family' | 'family-given' | 'auto'; // default: "given-family"

  // Affix rendering (formatting concern)
  prefixForm?: 'short' | 'long' | 'asInput'; // default: "short"
  suffixForm?: 'short' | 'long' | 'asInput'; // default: "short"
  capitalization?: 'canonical' | 'preserve' | 'lower' | 'upper'; // default: "canonical"
  punctuation?: 'canonical' | 'strip' | 'preserve'; // default: "canonical"
  apostrophes?: 'canonical' | 'ascii' | 'preserve'; // default: "canonical"
};

