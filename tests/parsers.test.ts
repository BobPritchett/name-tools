import { describe, it, expect } from 'vitest';
import { parseName, getFirstName, getLastName } from '../src/parsers';
import examples from '../src/data/examples.json';

describe('parseName', () => {
  // Data-driven tests using example data
  examples.parseExamples.forEach(({ input, expected, description }) => {
    it(`should parse: ${description}`, () => {
      const result = parseName(input);
      // `ParsedName` may gain additive fields over time; keep fixtures focused on core fields.
      expect(result).toMatchObject(expected);
    });
  });

  // Edge case tests
  it('should throw error for empty string', () => {
    expect(() => parseName('')).toThrow('Invalid name');
  });

  it('should throw error for non-string input', () => {
    expect(() => parseName(null as any)).toThrow('Invalid name');
  });

  it('should add typed prefix/suffix tokens + sort helpers', () => {
    const result = parseName('Dr. John Smith Jr., Esq.');
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
    const result = parseName('Ludwig van Beethoven');
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
