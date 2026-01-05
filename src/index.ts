/**
 * name-tools - A utility library for parsing, formatting, and manipulating person names
 * Supports international names with particles, compound surnames, and nicknames
 * Now with entity classification for organizations, families, and compound names.
 * @packageDocumentation
 */

// =============================================================================
// DATA SETS
// =============================================================================
export { PARTICLES, MULTI_WORD_PARTICLES, isParticle, isMultiWordParticle } from './data/particles';
export { COMMON_SURNAMES, COMMON_FIRST_NAMES, isCommonSurname, isCommonFirstName } from './data/surnames';

// =============================================================================
// PARSING
// =============================================================================
export {
  parseName,
  parsePersonName,
  getFirstName,
  getLastName,
  getNickname,
  entityToLegacy,
} from './parsers';

export { parseNameList } from './list-parser';

// =============================================================================
// CLASSIFICATION
// =============================================================================
export {
  classifyName,
  isPerson,
  isOrganization,
  isFamily,
  isCompound,
  isUnknown,
  isRejected,
} from './classifier';

// =============================================================================
// FORMATTING
// =============================================================================
export { formatName } from './formatters';

// =============================================================================
// TYPES - Entity Classification
// =============================================================================
export type {
  // Entity kinds
  NameKind,
  Confidence,
  ReasonCode,
  ParseMeta,
  BaseEntity,
  LegalForm,
  FamilyStyle,
  CompoundConnector,

  // Entity types
  ParsedNameEntity,
  PersonName,
  OrganizationName,
  FamilyName,
  CompoundName,
  UnknownName,
  RejectedName,

  // Options
  ParseOptions,
  ParseListOptions,

  // Recipient parsing
  ParsedRecipient,
} from './types';

// =============================================================================
// TYPES - Legacy (for formatName compatibility)
// =============================================================================
export type {
  ParsedName,
  NameAffixToken,
  NameAffixTokenType,
  NameToken,
  NameTokenType,
  NameFormatOptions,
  NamePreset,
} from './types';
