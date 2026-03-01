// =============================================================================
// ENTITY CLASSIFICATION TYPES
// =============================================================================

/**
 * The kind of entity detected in a name field
 */
export type NameKind =
  | 'person'
  | 'family'
  | 'household'
  | 'compound'
  | 'organization'
  | 'unknown'
  | 'rejected';

/**
 * Confidence level in classification (0 = no confidence, 1 = certain)
 */
export type Confidence = 0 | 0.25 | 0.5 | 0.75 | 1;

/**
 * Machine-readable reason codes explaining classification decisions
 */
export type ReasonCode =
  | 'ORG_LEGAL_SUFFIX'
  | 'ORG_COMMA_LEGAL'
  | 'ORG_INSTITUTION_PHRASE'
  | 'ORG_DBA'
  | 'ORG_CARE_OF'
  | 'ORG_WEAK_KEYWORD'
  | 'FAMILY_ENDS_WITH_FAMILY'
  | 'FAMILY_STARTS_WITH_THE'
  | 'FAMILY_PLURAL_SURNAME'
  | 'FAMILY_HAS_FAMILY_WORD'
  | 'COMPOUND_CONNECTOR'
  | 'COMPOUND_SHARED_FAMILY'
  | 'COMPOUND_PAIRED_HONORIFIC'
  | 'COMPOUND_PLURAL_HONORIFIC'
  | 'PERSON_STANDARD_FORMAT'
  | 'PERSON_REVERSED_FORMAT'
  | 'PERSON_HAS_HONORIFIC'
  | 'PERSON_HAS_SUFFIX'
  | 'AMBIGUOUS_THE_PLURAL'
  | 'AMBIGUOUS_SHORT_NAME'
  | 'HAS_PUNCTUATION_SIGNALS'
  | 'HAS_PAREN_ANNOTATION'
  | 'HAS_ALLCAPS'
  | 'HAS_EMAIL_OR_HANDLE'
  | 'HAS_ROLE_OR_TITLE';

/**
 * Metadata about the parsing process
 */
export interface ParseMeta {
  /** Exact input string */
  raw: string;
  /** Normalized string used for parsing */
  normalized: string;
  /** Overall confidence in classification */
  confidence: Confidence;
  /** Reason codes explaining the classification */
  reasons: ReasonCode[];
  /** Human-readable warnings */
  warnings?: string[];
  /** Locale hint (default: "en") */
  locale?: string;
}

/**
 * Base interface for all entity types
 */
export interface BaseEntity {
  kind: NameKind;
  meta: ParseMeta;
}

/**
 * Legal form suffixes for organizations
 */
export type LegalForm =
  | 'Inc'
  | 'Incorporated'
  | 'Corp'
  | 'Corporation'
  | 'LLC'
  | 'LLP'
  | 'LP'
  | 'Ltd'
  | 'Limited'
  | 'PLC'
  | 'GmbH'
  | 'SA'
  | 'SAS'
  | 'BV'
  | 'AG'
  | 'Oy'
  | 'SRL'
  | 'SpA'
  | 'Trust'
  | 'TrustCompany'
  | 'Bank'
  | 'CreditUnion'
  | 'Foundation'
  | 'University'
  | 'Hospital'
  | 'Church'
  | 'Government'
  | 'Nonprofit'
  | 'Company'
  | 'Co'
  | 'UnknownLegalForm';

/**
 * Organization entity (company, institution, trust, etc.)
 */
export interface OrganizationName extends BaseEntity {
  kind: 'organization';
  /** Base name without legal suffix */
  baseName: string;
  /** Detected legal form */
  legalForm?: LegalForm;
  /** Raw legal suffix as written */
  legalSuffixRaw?: string;
  /** Additional qualifiers ("of", "for", etc.) */
  qualifiers?: string[];
  /** Alternate names (d/b/a) */
  aka?: string[];
}

/**
 * Style of family name
 */
export type FamilyStyle = 'familyWord' | 'pluralSurname';

/**
 * Family or household entity
 */
export interface FamilyName extends BaseEntity {
  kind: 'family' | 'household';
  /** Leading article if present */
  article?: 'The';
  /** Core family/surname */
  familyName: string;
  /** How the family was expressed */
  style: FamilyStyle;
  /** The word used (Family, Household) */
  familyWord?: 'Family' | 'Household';
}

/**
 * Connector used in compound names
 */
export type CompoundConnector = '&' | 'and' | '+' | 'et' | 'unknown';

/**
 * Compound entity (multiple people in one field)
 */
export interface CompoundName extends BaseEntity {
  kind: 'compound';
  /** The connector detected */
  connector: CompoundConnector;
  /** Parsed members (may be PersonName or UnknownName) */
  members: Array<PersonName | UnknownName>;
  /** Shared family name if inferred */
  sharedFamily?: string;
}

/**
 * Person entity (individual human)
 */
export interface PersonName extends BaseEntity {
  kind: 'person';
  /** Title/honorific (Dr., Mr., etc.) */
  honorific?: string;
  /** Given/first name */
  given?: string;
  /** Full given name if explicitly provided (e.g. from parenthetical: "Thomas A. (Thomas Alva) Edison") */
  fullGiven?: string;
  /** Middle name(s) */
  middle?: string;
  /** Family/last name */
  family?: string;
  /** Suffix (Jr., PhD, etc.) */
  suffix?: string;
  /** Nickname */
  nickname?: string;
  /** Surname particles (von, de, etc.) */
  particles?: string[];
  /** Whether name was in reversed format */
  reversed?: boolean;
}

/**
 * Unknown entity (could not be classified)
 */
export interface UnknownName extends BaseEntity {
  kind: 'unknown';
  /** Best-effort normalized text */
  text: string;
  /** Best guess at what it might be */
  guess?: Exclude<NameKind, 'unknown' | 'rejected'>;
}

/**
 * Rejected entity (strict mode rejection)
 */
export interface RejectedName extends BaseEntity {
  kind: 'rejected';
  /** What kind it would have been classified as */
  rejectedAs: Exclude<NameKind, 'rejected'>;
}

/**
 * Union of all entity types returned by parseName
 */
export type ParsedNameEntity =
  | PersonName
  | FamilyName
  | CompoundName
  | OrganizationName
  | UnknownName
  | RejectedName;

/**
 * Options for parseName
 */
export interface ParseOptions {
  /** Locale hint (default: "en") */
  locale?: string;
  /** If set, reject non-person entities */
  strictKind?: 'person';
}

/**
 * Parsed recipient from a list (email To/CC line)
 */
export interface ParsedRecipient {
  /** Original raw string */
  raw: string;
  /** Parsed display name */
  display?: ParsedNameEntity;
  /** Extracted email address */
  email?: string;
  /** Raw address string before normalization */
  addressRaw?: string;
  /** Metadata about parsing */
  meta: {
    confidence: Confidence;
    reasons: ReasonCode[];
    warnings?: string[];
  };
}

/**
 * Options for parseNameList
 */
export interface ParseListOptions extends ParseOptions {
  // Reserved for list-specific options
}

// =============================================================================
// LEGACY TYPES (maintained for compatibility with formatName)
// =============================================================================

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
  fullGiven?: string;
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
  | 'expandedFull'
  | 'alphabetical'
  | 'library'
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
  prefer?: 'auto' | 'nickname' | 'first' | 'fullGiven'; // default: "auto"
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

