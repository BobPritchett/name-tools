import { describe, it, expect } from 'vitest';
import { parseName, parsePersonName, getFirstName, getLastName } from '../src/parsers';
import examples from '../src/data/examples.json';

// =============================================================================
// LEGACY parsePersonName tests (for formatName compatibility)
// =============================================================================

describe('parsePersonName (legacy)', () => {
  // Data-driven tests using example data
  examples.parseExamples.forEach(({ input, expected, description }) => {
    it(`should parse: ${description}`, () => {
      const result = parsePersonName(input);
      // `ParsedName` may gain additive fields over time; keep fixtures focused on core fields.
      expect(result).toMatchObject(expected);
    });
  });

  // Edge case tests
  it('should throw error for empty string', () => {
    expect(() => parsePersonName('')).toThrow('Invalid name');
  });

  it('should throw error for non-string input', () => {
    expect(() => parsePersonName(null as any)).toThrow('Invalid name');
  });

  it('should add typed prefix/suffix tokens + sort helpers', () => {
    const result = parsePersonName('Dr. John Smith Jr., Esq.');
    expect(result).toMatchObject({
      prefix: 'Dr.',
      first: 'John',
      last: 'Smith',
      suffix: 'Jr., Esq.',
    });

    expect(result.prefixTokens?.map(t => t.type)).toEqual(['honorific']);
    expect(result.suffixTokens?.map(t => t.type)).toEqual(['generational', 'professional']);
    expect(result.sort?.display).toBe('Smith, John, Jr.');
    expect(result.sort?.key).toBe('smith john jr');
  });

  it('should derive family particle metadata from last name', () => {
    const result = parsePersonName('Ludwig van Beethoven');
    expect(result).toMatchObject({
      first: 'Ludwig',
      last: 'van Beethoven',
      familyParticle: 'van',
      familyParts: ['Beethoven'],
      familyParticleBehavior: 'localeDefault',
    });
    expect(result.sort?.display).toBe('van Beethoven, Ludwig');
  });
});

// =============================================================================
// NEW parseName (entity classification) tests
// =============================================================================

describe('parseName (entity classification)', () => {
  describe('person detection', () => {
    it('should classify simple names as person', () => {
      const result = parseName('John Smith');
      expect(result.kind).toBe('person');
      if (result.kind === 'person') {
        expect(result.given).toBe('John');
        expect(result.family).toBe('Smith');
      }
    });

    it('should handle names with honorifics', () => {
      const result = parseName('Dr. Jane Doe');
      expect(result.kind).toBe('person');
      if (result.kind === 'person') {
        expect(result.honorific).toBe('Dr.');
        expect(result.given).toBe('Jane');
        expect(result.family).toBe('Doe');
      }
    });

    it('should handle names with suffixes', () => {
      const result = parseName('John Smith Jr.');
      expect(result.kind).toBe('person');
      if (result.kind === 'person') {
        expect(result.given).toBe('John');
        expect(result.family).toBe('Smith');
        expect(result.suffix).toBe('Jr.');
      }
    });

    it('should handle reversed names', () => {
      const result = parseName('Smith, John');
      expect(result.kind).toBe('person');
      if (result.kind === 'person') {
        expect(result.given).toBe('John');
        expect(result.family).toBe('Smith');
        expect(result.reversed).toBe(true);
      }
    });

    it('should handle reversed names with suffix', () => {
      const result = parseName('Smith, John, Jr.');
      expect(result.kind).toBe('person');
      if (result.kind === 'person') {
        expect(result.given).toBe('John');
        expect(result.family).toBe('Smith');
        expect(result.suffix).toBe('Jr.');
        expect(result.reversed).toBe(true);
      }
    });
  });

  describe('organization detection', () => {
    it('should classify names with legal suffixes as organization', () => {
      const result = parseName('Acme Inc.');
      expect(result.kind).toBe('organization');
      if (result.kind === 'organization') {
        expect(result.baseName).toBe('Acme');
        expect(result.legalForm).toBe('Inc');
      }
    });

    it('should handle comma-legal format', () => {
      const result = parseName('Acme, LLC');
      expect(result.kind).toBe('organization');
      if (result.kind === 'organization') {
        expect(result.legalForm).toBe('LLC');
      }
    });

    it('should detect trusts', () => {
      const result = parseName('Smith Family Trust');
      expect(result.kind).toBe('organization');
      if (result.kind === 'organization') {
        expect(result.legalForm).toBe('Trust');
      }
    });

    it('should detect foundations', () => {
      const result = parseName('Johnson Charitable Foundation');
      expect(result.kind).toBe('organization');
    });

    it('should detect banks', () => {
      const result = parseName('Bank of Springfield');
      expect(result.kind).toBe('organization');
      if (result.kind === 'organization') {
        expect(result.legalForm).toBe('Bank');
      }
    });

    it('should detect universities', () => {
      const result = parseName('University of Arizona');
      expect(result.kind).toBe('organization');
    });
  });

  describe('family detection', () => {
    it('should classify "Family" suffix as family', () => {
      const result = parseName('The Smith Family');
      expect(result.kind).toBe('family');
      if (result.kind === 'family') {
        expect(result.familyName).toBe('Smith');
        expect(result.article).toBe('The');
        expect(result.familyWord).toBe('Family');
      }
    });

    it('should classify "Household" suffix as household', () => {
      const result = parseName('The Garcia Household');
      expect(result.kind).toBe('household');
      if (result.kind === 'household') {
        expect(result.familyName).toBe('Garcia');
        expect(result.familyWord).toBe('Household');
      }
    });

    it('should handle plural surnames', () => {
      const result = parseName('The Smiths');
      expect(result.kind).toBe('family');
      if (result.kind === 'family') {
        expect(result.familyName).toBe('Smith');
        expect(result.style).toBe('pluralSurname');
      }
    });
  });

  describe('compound detection', () => {
    it('should detect compound names with &', () => {
      const result = parseName('Bob & Mary Smith');
      expect(result.kind).toBe('compound');
      if (result.kind === 'compound') {
        expect(result.connector).toBe('&');
        expect(result.sharedFamily).toBe('Smith');
        expect(result.members.length).toBe(2);
      }
    });

    it('should detect compound names with "and"', () => {
      const result = parseName('John and Jane Doe');
      expect(result.kind).toBe('compound');
      if (result.kind === 'compound') {
        expect(result.connector).toBe('and');
      }
    });

    it('should not classify org-like connectors as compound', () => {
      const result = parseName('Research & Development LLC');
      expect(result.kind).toBe('organization');
    });
  });

  describe('unknown handling', () => {
    it('should return unknown for empty string', () => {
      const result = parseName('');
      expect(result.kind).toBe('unknown');
    });

    it('should classify single tokens as person (given name)', () => {
      const result = parseName('Apple');
      expect(result.kind).toBe('person'); // Single token treated as given name
    });
  });

  describe('strict mode', () => {
    it('should reject non-person entities in strict mode', () => {
      const result = parseName('Acme LLC', { strictKind: 'person' });
      expect(result.kind).toBe('rejected');
      if (result.kind === 'rejected') {
        expect(result.rejectedAs).toBe('organization');
      }
    });

    it('should allow person entities in strict mode', () => {
      const result = parseName('John Smith', { strictKind: 'person' });
      expect(result.kind).toBe('person');
    });
  });

  describe('metadata', () => {
    it('should include meta information', () => {
      const result = parseName('John Smith');
      expect(result.meta).toBeDefined();
      expect(result.meta.raw).toBe('John Smith');
      expect(result.meta.confidence).toBeGreaterThan(0);
      expect(result.meta.reasons).toBeInstanceOf(Array);
    });
  });
});

describe('getFirstName', () => {
  // Data-driven tests
  examples.extractionExamples.forEach(({ input, firstName }) => {
    it(`should extract first name from "${input}"`, () => {
      expect(getFirstName(input)).toBe(firstName);
    });
  });
});

describe('getLastName', () => {
  // Data-driven tests
  examples.extractionExamples.forEach(({ input, lastName }) => {
    it(`should extract last name from "${input}"`, () => {
      expect(getLastName(input)).toBe(lastName);
    });
  });
});
