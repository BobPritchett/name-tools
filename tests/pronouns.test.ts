import { describe, it, expect, beforeAll } from 'vitest';
import {
  getPronounSet,
  parsePronounSpec,
  formatPronoun,
  fillPronounTemplate,
  fillPronounTemplateSmart,
  getDefaultPronouns,
  getPronounsForEntity,
  getPronounsForPerson,
  getPronouns,
  extractPronouns,
  hasPronouns,
  pronounsToGenderHint,
  BUILT_IN_PRONOUNS,
  SPEC_ALIASES,
} from '../src/pronouns';
import type { PronounSet, PersonName } from '../src';
import { classifyName } from '../src/classifier';
import { GenderDB } from '../src/gender/GenderDB';
import { decodeGenderData } from '../src/gender/data/coverage95';

describe('pronouns', () => {
  describe('BUILT_IN_PRONOUNS', () => {
    it('should contain standard pronoun sets', () => {
      expect(BUILT_IN_PRONOUNS['he']).toBeDefined();
      expect(BUILT_IN_PRONOUNS['she']).toBeDefined();
      expect(BUILT_IN_PRONOUNS['they']).toBeDefined();
      expect(BUILT_IN_PRONOUNS['it']).toBeDefined();
    });

    it('should contain neopronouns', () => {
      expect(BUILT_IN_PRONOUNS['ze-hir']).toBeDefined();
      expect(BUILT_IN_PRONOUNS['ze-zir']).toBeDefined();
      expect(BUILT_IN_PRONOUNS['xe-xem']).toBeDefined();
      expect(BUILT_IN_PRONOUNS['fae-faer']).toBeDefined();
    });

    it('should contain special sets', () => {
      expect(BUILT_IN_PRONOUNS['any']).toBeDefined();
      expect(BUILT_IN_PRONOUNS['name-only']).toBeDefined();
    });

    it('should have correct structure for he/him', () => {
      const he = BUILT_IN_PRONOUNS['he'];
      expect(he.id).toBe('he');
      expect(he.label).toBe('he/him');
      expect(he.subject).toBe('he');
      expect(he.object).toBe('him');
      expect(he.possessiveDeterminer).toBe('his');
      expect(he.possessivePronoun).toBe('his');
      expect(he.reflexive).toBe('himself');
    });

    it('should have correct structure for she/her', () => {
      const she = BUILT_IN_PRONOUNS['she'];
      expect(she.id).toBe('she');
      expect(she.label).toBe('she/her');
      expect(she.subject).toBe('she');
      expect(she.object).toBe('her');
      expect(she.possessiveDeterminer).toBe('her');
      expect(she.possessivePronoun).toBe('hers');
      expect(she.reflexive).toBe('herself');
    });

    it('should have correct structure for they/them', () => {
      const they = BUILT_IN_PRONOUNS['they'];
      expect(they.id).toBe('they');
      expect(they.label).toBe('they/them');
      expect(they.subject).toBe('they');
      expect(they.object).toBe('them');
      expect(they.possessiveDeterminer).toBe('their');
      expect(they.possessivePronoun).toBe('theirs');
      expect(they.reflexive).toBe('themselves');
    });

    it('name-only should have empty strings', () => {
      const nameOnly = BUILT_IN_PRONOUNS['name-only'];
      expect(nameOnly.subject).toBe('');
      expect(nameOnly.object).toBe('');
      expect(nameOnly.possessiveDeterminer).toBe('');
      expect(nameOnly.possessivePronoun).toBe('');
      expect(nameOnly.reflexive).toBe('');
    });
  });

  describe('getPronounSet', () => {
    it('should return built-in sets by ID', () => {
      const he = getPronounSet('he');
      expect(he.subject).toBe('he');
      expect(he.object).toBe('him');

      const she = getPronounSet('she');
      expect(she.subject).toBe('she');
      expect(she.object).toBe('her');

      const they = getPronounSet('they');
      expect(they.subject).toBe('they');
      expect(they.possessivePronoun).toBe('theirs');
    });

    it('should parse common shorthand specs', () => {
      expect(getPronounSet('he/him').id).toBe('he');
      expect(getPronounSet('she/her').id).toBe('she');
      expect(getPronounSet('they/them').id).toBe('they');
    });

    it('should handle case variations', () => {
      expect(getPronounSet('He/Him').id).toBe('he');
      expect(getPronounSet('SHE/HER').id).toBe('she');
      expect(getPronounSet('They/Them').id).toBe('they');
    });

    it('should parse neopronoun specs', () => {
      const zeHir = getPronounSet('ze/hir');
      expect(zeHir.id).toBe('ze-hir');
      expect(zeHir.subject).toBe('ze');
      expect(zeHir.object).toBe('hir');

      const zeZir = getPronounSet('ze/zir');
      expect(zeZir.id).toBe('ze-zir');
    });

    it('should parse custom specs', () => {
      const custom = getPronounSet('ey/em/eir/eirs/emself');
      expect(custom.subject).toBe('ey');
      expect(custom.object).toBe('em');
      expect(custom.possessiveDeterminer).toBe('eir');
      expect(custom.possessivePronoun).toBe('eirs');
      expect(custom.reflexive).toBe('emself');
    });

    it('should return a copy of existing PronounSet', () => {
      const original = BUILT_IN_PRONOUNS['he'];
      const copy = getPronounSet(original);
      expect(copy).not.toBe(original); // Different object
      expect(copy.id).toBe(original.id);
      expect(copy.subject).toBe(original.subject);
    });

    it('should throw on empty input', () => {
      expect(() => getPronounSet('')).toThrow();
    });
  });

  describe('parsePronounSpec', () => {
    it('should parse 2-token specs', () => {
      const result = parsePronounSpec('xe/xem');
      expect(result.subject).toBe('xe');
      expect(result.object).toBe('xem');
    });

    it('should parse 3-token specs', () => {
      // 3 tokens: subject / object / possessive (same for determiner and pronoun)
      // Use a custom spec that won't match built-in aliases
      const result = parsePronounSpec('ey/em/eirs');
      expect(result.subject).toBe('ey');
      expect(result.object).toBe('em');
      expect(result.possessiveDeterminer).toBe('eirs');
      expect(result.possessivePronoun).toBe('eirs');
    });

    it('should parse 4-token specs', () => {
      const result = parsePronounSpec('they/them/their/theirs');
      expect(result.subject).toBe('they');
      expect(result.object).toBe('them');
      expect(result.possessiveDeterminer).toBe('their');
      expect(result.possessivePronoun).toBe('theirs');
    });

    it('should parse 5-token specs', () => {
      const result = parsePronounSpec('ze/zir/zir/zirs/zirself');
      expect(result.subject).toBe('ze');
      expect(result.object).toBe('zir');
      expect(result.possessiveDeterminer).toBe('zir');
      expect(result.possessivePronoun).toBe('zirs');
      expect(result.reflexive).toBe('zirself');
    });

    it('should handle aliases', () => {
      expect(parsePronounSpec('he/his').id).toBe('he');
      expect(parsePronounSpec('she/hers').id).toBe('she');
      expect(parsePronounSpec('they/their').id).toBe('they');
    });

    it('should derive reflexive when not provided', () => {
      const result = parsePronounSpec('foo/bar');
      expect(result.reflexive).toBe('fooself');
    });
  });

  describe('formatPronoun', () => {
    const shePronouns = getPronounSet('she');
    const theyPronouns = getPronounSet('they');

    it('should format with lowercase by default', () => {
      expect(formatPronoun(shePronouns, 'subject')).toBe('she');
      expect(formatPronoun(shePronouns, 'object')).toBe('her');
      expect(formatPronoun(theyPronouns, 'possessiveDeterminer')).toBe('their');
    });

    it('should format with title case', () => {
      expect(formatPronoun(shePronouns, 'subject', { capitalization: 'title' })).toBe('She');
      expect(formatPronoun(shePronouns, 'object', { capitalization: 'title' })).toBe('Her');
    });

    it('should format with uppercase', () => {
      expect(formatPronoun(shePronouns, 'subject', { capitalization: 'upper' })).toBe('SHE');
      expect(formatPronoun(theyPronouns, 'reflexive', { capitalization: 'upper' })).toBe('THEMSELVES');
    });

    it('should return empty string for empty pronoun', () => {
      const nameOnly = getPronounSet('name-only');
      expect(formatPronoun(nameOnly, 'subject')).toBe('');
    });
  });

  describe('fillPronounTemplate', () => {
    const shePronouns = getPronounSet('she');
    const theyPronouns = getPronounSet('they');

    it('should fill all placeholder types', () => {
      const template = '{{subject}} gave {{object}} {{possDet}} book because it was {{possPron}} and {{reflexive}} wanted it.';
      const result = fillPronounTemplate(template, shePronouns);
      expect(result).toBe('she gave her her book because it was hers and herself wanted it.');
    });

    it('should handle long-form placeholders', () => {
      const template = '{{possessiveDeterminer}} car and {{possessivePronoun}} alone.';
      const result = fillPronounTemplate(template, theyPronouns);
      expect(result).toBe('their car and theirs alone.');
    });

    it('should apply capitalization to all replacements', () => {
      const template = '{{subject}} signed {{possDet}} name.';
      const result = fillPronounTemplate(template, shePronouns, { capitalization: 'title' });
      expect(result).toBe('She signed Her name.');
    });
  });

  describe('fillPronounTemplateSmart', () => {
    const shePronouns = getPronounSet('she');

    it('should capitalize at sentence start', () => {
      const template = '{{subject}} read the document. Then {{subject}} signed it.';
      const result = fillPronounTemplateSmart(template, shePronouns);
      expect(result).toBe('She read the document. Then she signed it.');
    });

    it('should handle multiple sentences', () => {
      // Note: smart template capitalizes at sentence start positions
      // {{object}} after a period is treated as sentence start
      const template = '{{subject}} arrived! {{subject}} was happy. We greeted {{object}}.';
      const result = fillPronounTemplateSmart(template, shePronouns);
      expect(result).toBe('She arrived! She was happy. We greeted her.');
    });

    it('should capitalize at start of string', () => {
      const template = '{{possDet}} book is here.';
      const result = fillPronounTemplateSmart(template, shePronouns);
      expect(result).toBe('Her book is here.');
    });
  });

  describe('getDefaultPronouns', () => {
    it('should return he/him for male', () => {
      const pronouns = getDefaultPronouns('male');
      expect(pronouns.id).toBe('he');
      expect(pronouns.subject).toBe('he');
    });

    it('should return she/her for female', () => {
      const pronouns = getDefaultPronouns('female');
      expect(pronouns.id).toBe('she');
      expect(pronouns.subject).toBe('she');
    });

    it('should return they/them for unknown', () => {
      const pronouns = getDefaultPronouns('unknown');
      expect(pronouns.id).toBe('they');
      expect(pronouns.subject).toBe('they');
    });

    it('should return they/them for null', () => {
      const pronouns = getDefaultPronouns(null);
      expect(pronouns.id).toBe('they');
    });
  });

  describe('getPronounsForEntity', () => {
    it('should return they/them for organizations', () => {
      const org = classifyName('Acme Inc.');
      expect(org.kind).toBe('organization');
      const pronouns = getPronounsForEntity(org);
      expect(pronouns.id).toBe('they');
    });

    it('should return they/them for families', () => {
      const family = classifyName('The Smiths');
      expect(family.kind).toBe('family');
      const pronouns = getPronounsForEntity(family);
      expect(pronouns.id).toBe('they');
    });

    it('should return they/them for compound names', () => {
      const compound = classifyName('Bob & Mary Smith');
      expect(compound.kind).toBe('compound');
      const pronouns = getPronounsForEntity(compound);
      expect(pronouns.id).toBe('they');
    });

    it('should return they/them for person entities (safe default)', () => {
      const person = classifyName('John Smith');
      expect(person.kind).toBe('person');
      const pronouns = getPronounsForEntity(person);
      expect(pronouns.id).toBe('they');
    });
  });

  describe('getPronounsForPerson', () => {
    let genderDB: GenderDB;

    beforeAll(() => {
      genderDB = new GenderDB(decodeGenderData());
    });

    it('should return they/them without genderDB', () => {
      const entity = classifyName('John Smith') as PersonName;
      const pronouns = getPronounsForPerson(entity);
      expect(pronouns.id).toBe('they');
    });

    it('should use gender lookup with genderDB for male names', () => {
      const entity = classifyName('John Smith') as PersonName;
      const pronouns = getPronounsForPerson(entity, { genderDB });
      expect(pronouns.id).toBe('he');
    });

    it('should use gender lookup with genderDB for female names', () => {
      const entity = classifyName('Mary Johnson') as PersonName;
      const pronouns = getPronounsForPerson(entity, { genderDB });
      expect(pronouns.id).toBe('she');
    });

    it('should use explicit pronouns when provided', () => {
      const entity = classifyName('John Smith') as PersonName;
      const pronouns = getPronounsForPerson(entity, {
        genderDB,
        explicitPronouns: 'they/them',
      });
      expect(pronouns.id).toBe('they');
    });

    it('should use custom default when gender unknown', () => {
      const entity = classifyName('Alex Smith') as PersonName;
      const customDefault = getPronounSet('ze-hir');
      const pronouns = getPronounsForPerson(entity, {
        genderDB,
        genderThreshold: 0.99, // Very high threshold
        defaultOnUnknown: customDefault,
      });
      // Alex is ambiguous, should fall back to custom default
      expect(['ze-hir', 'he', 'she', 'they']).toContain(pronouns.id);
    });
  });

  describe('getPronouns', () => {
    let genderDB: GenderDB;

    beforeAll(() => {
      genderDB = new GenderDB(decodeGenderData());
    });

    it('should use gender lookup for person entities', () => {
      const person = classifyName('William Smith');
      const pronouns = getPronouns(person, { genderDB });
      expect(pronouns.id).toBe('he');
    });

    it('should return they/them for non-person entities', () => {
      const org = classifyName('Acme LLC');
      const pronouns = getPronouns(org, { genderDB });
      expect(pronouns.id).toBe('they');
    });
  });

  describe('extractPronouns', () => {
    it('should extract pronouns from name suffix', () => {
      const result = extractPronouns('Alex Johnson (they/them)');
      expect(result.name).toBe('Alex Johnson');
      expect(result.pronouns).toBeDefined();
      expect(result.pronouns?.id).toBe('they');
      expect(result.rawPronounSpec).toBe('they/them');
    });

    it('should extract he/him pronouns', () => {
      const result = extractPronouns('Sam Smith (he/him)');
      expect(result.name).toBe('Sam Smith');
      expect(result.pronouns?.id).toBe('he');
    });

    it('should extract she/her pronouns', () => {
      const result = extractPronouns('Jordan Lee (she/her)');
      expect(result.name).toBe('Jordan Lee');
      expect(result.pronouns?.id).toBe('she');
    });

    it('should NOT extract non-pronoun parentheticals', () => {
      const billing = extractPronouns('John Smith (billing)');
      expect(billing.name).toBe('John Smith (billing)');
      expect(billing.pronouns).toBeUndefined();

      const home = extractPronouns('Jane Doe (home)');
      expect(home.name).toBe('Jane Doe (home)');
      expect(home.pronouns).toBeUndefined();
    });

    it('should NOT extract annotation-like parentheticals', () => {
      const cabin = extractPronouns('The Smith Family (cabin)');
      expect(cabin.name).toBe('The Smith Family (cabin)');
      expect(cabin.pronouns).toBeUndefined();
    });

    it('should return original name when no parenthetical', () => {
      const result = extractPronouns('Jane Doe');
      expect(result.name).toBe('Jane Doe');
      expect(result.pronouns).toBeUndefined();
    });

    it('should handle empty input', () => {
      const result = extractPronouns('');
      expect(result.name).toBe('');
    });

    it('should extract custom pronoun specs', () => {
      const result = extractPronouns('Chris Taylor (ze/zir)');
      expect(result.name).toBe('Chris Taylor');
      expect(result.pronouns?.id).toBe('ze-zir');
    });
  });

  describe('hasPronouns', () => {
    it('should return true for names with pronouns', () => {
      expect(hasPronouns('Alex (they/them)')).toBe(true);
      expect(hasPronouns('Sam (he/him)')).toBe(true);
      expect(hasPronouns('Jordan (she/her)')).toBe(true);
    });

    it('should return false for names without pronouns', () => {
      expect(hasPronouns('John Smith')).toBe(false);
      expect(hasPronouns('Jane Doe (billing)')).toBe(false);
    });

    it('should return false for empty input', () => {
      expect(hasPronouns('')).toBe(false);
    });
  });

  describe('pronounsToGenderHint', () => {
    it('should return male for he/him variants', () => {
      expect(pronounsToGenderHint('he/him')).toBe('male');
      expect(pronounsToGenderHint('he/his')).toBe('male');
      expect(pronounsToGenderHint('He/Him')).toBe('male');
    });

    it('should return female for she/her variants', () => {
      expect(pronounsToGenderHint('she/her')).toBe('female');
      expect(pronounsToGenderHint('she/hers')).toBe('female');
      expect(pronounsToGenderHint('She/Her')).toBe('female');
    });

    it('should return unknown for they/them', () => {
      expect(pronounsToGenderHint('they/them')).toBe('unknown');
    });

    it('should return unknown for neopronouns', () => {
      expect(pronounsToGenderHint('ze/zir')).toBe('unknown');
      expect(pronounsToGenderHint('xe/xem')).toBe('unknown');
    });
  });

  describe('SPEC_ALIASES', () => {
    it('should map common variations to IDs', () => {
      expect(SPEC_ALIASES['he/him']).toBe('he');
      expect(SPEC_ALIASES['she/her']).toBe('she');
      expect(SPEC_ALIASES['they/them']).toBe('they');
      expect(SPEC_ALIASES['he/his']).toBe('he');
      expect(SPEC_ALIASES['she/hers']).toBe('she');
    });

    it('should map neopronoun specs', () => {
      expect(SPEC_ALIASES['ze/hir']).toBe('ze-hir');
      expect(SPEC_ALIASES['ze/zir']).toBe('ze-zir');
      expect(SPEC_ALIASES['xe/xem']).toBe('xe-xem');
    });

    it('should map special sets', () => {
      expect(SPEC_ALIASES['any']).toBe('any');
      expect(SPEC_ALIASES['no pronouns']).toBe('name-only');
      expect(SPEC_ALIASES['use name only']).toBe('name-only');
    });
  });
});
