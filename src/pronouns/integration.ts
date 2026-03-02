import type { PronounSet } from './types';
import type { ParsedNameEntity, PersonName } from '../types';
import type { GenderDB } from '../gender/GenderDB';
import { getPronounSet } from './parser';
import { BUILT_IN_PRONOUNS } from './data';

/**
 * Get default pronouns based on a gender guess result.
 *
 * Maps the output of `GenderDB.guessGender()` to appropriate pronouns:
 * - 'male' → he/him
 * - 'female' → she/her
 * - 'unknown' or null → they/them (safe default)
 *
 * @param gender - Result from guessGender()
 * @returns The appropriate PronounSet
 *
 * @example
 * ```typescript
 * const db = createGenderDB();
 * const gender = db.guessGender('John'); // 'male'
 * const pronouns = getDefaultPronouns(gender); // he/him
 * ```
 */
export function getDefaultPronouns(
  gender: 'male' | 'female' | 'unknown' | null
): PronounSet {
  switch (gender) {
    case 'male':
      return { ...BUILT_IN_PRONOUNS['he'] };
    case 'female':
      return { ...BUILT_IN_PRONOUNS['she'] };
    case 'unknown':
    case null:
    default:
      return { ...BUILT_IN_PRONOUNS['they'] };
  }
}

/**
 * Get default pronouns for any parsed entity.
 *
 * Entity kind determines pronouns:
 * - `person` → they/them (use getPronounsForPerson for gender-aware lookup)
 * - `organization` → they/them
 * - `family` / `household` → they/them
 * - `compound` → they/them
 * - `unknown` / `rejected` → they/them
 *
 * For person entities, this returns they/them as a safe default.
 * Use `getPronounsForPerson()` with a GenderDB for gender-aware pronouns.
 *
 * @param entity - The parsed name entity
 * @returns The appropriate PronounSet
 *
 * @example
 * ```typescript
 * const org = classifyName('Acme Inc.');
 * getPronounsForEntity(org); // they/them
 *
 * const family = classifyName('The Smiths');
 * getPronounsForEntity(family); // they/them
 * ```
 */
export function getPronounsForEntity(entity: ParsedNameEntity): PronounSet {
  // All non-person entities use they/them
  // Person entities also default to they/them without gender context
  return { ...BUILT_IN_PRONOUNS['they'] };
}

/**
 * Options for getting pronouns for a person entity
 */
export interface GetPronounsForPersonOptions {
  /** Optional gender database for name-based gender lookup */
  genderDB?: GenderDB;
  /** Explicit pronouns override (user-specified, takes priority) */
  explicitPronouns?: string | PronounSet;
  /** Custom default when gender is unknown (default: they/them) */
  defaultOnUnknown?: PronounSet;
  /** Threshold for gender guessing (default: 0.8) */
  genderThreshold?: number;
}

/**
 * Get pronouns for a person entity with optional gender lookup.
 *
 * Priority order:
 * 1. Explicit pronouns (if provided)
 * 2. Gender-based pronouns (if genderDB provided and given name exists)
 * 3. Custom default or they/them
 *
 * @param entity - The person entity
 * @param options - Options including optional GenderDB
 * @returns The appropriate PronounSet
 *
 * @example
 * ```typescript
 * const genderDB = createGenderDB();
 * const person = parseName('John Smith') as PersonName;
 *
 * // With gender lookup
 * getPronounsForPerson(person, { genderDB });
 * // Returns he/him (John is typically male)
 *
 * // With explicit override
 * getPronounsForPerson(person, { explicitPronouns: 'they/them' });
 * // Returns they/them regardless of name
 *
 * // Without gender lookup
 * getPronounsForPerson(person);
 * // Returns they/them (safe default)
 * ```
 */
export function getPronounsForPerson(
  entity: PersonName,
  options: GetPronounsForPersonOptions = {}
): PronounSet {
  const {
    genderDB,
    explicitPronouns,
    defaultOnUnknown,
    genderThreshold = 0.8,
  } = options;

  // Priority 1: Explicit pronouns override everything
  if (explicitPronouns) {
    return getPronounSet(explicitPronouns);
  }

  // Priority 2: Gender-based lookup if database and given name available
  if (genderDB && entity.given) {
    const gender = genderDB.guessGender(entity.given, genderThreshold);
    if (gender === 'male') {
      return { ...BUILT_IN_PRONOUNS['he'] };
    }
    if (gender === 'female') {
      return { ...BUILT_IN_PRONOUNS['she'] };
    }
    // gender is 'unknown' or null - fall through to default
  }

  // Priority 3: Custom default or they/them
  return defaultOnUnknown ? { ...defaultOnUnknown } : { ...BUILT_IN_PRONOUNS['they'] };
}

/**
 * Get pronouns for any entity with full integration.
 *
 * This is a convenience function that handles all entity types:
 * - For person entities, uses gender lookup if genderDB is provided
 * - For all other entities, returns they/them
 *
 * @param entity - Any parsed name entity
 * @param options - Options for person entity handling
 * @returns The appropriate PronounSet
 *
 * @example
 * ```typescript
 * const genderDB = createGenderDB();
 *
 * const person = classifyName('Jane Smith');
 * getPronouns(person, { genderDB }); // she/her
 *
 * const org = classifyName('Acme Inc.');
 * getPronouns(org, { genderDB }); // they/them (ignores genderDB)
 * ```
 */
export function getPronouns(
  entity: ParsedNameEntity,
  options: GetPronounsForPersonOptions = {}
): PronounSet {
  if (entity.kind === 'person') {
    return getPronounsForPerson(entity as PersonName, options);
  }

  // All non-person entities use they/them
  return { ...BUILT_IN_PRONOUNS['they'] };
}
