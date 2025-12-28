import { describe, it, expect } from 'vitest';
import { parseName, getFirstName, getLastName } from '../src/parsers';
import examples from '../src/data/examples.json';

describe('parseName', () => {
  // Data-driven tests using example data
  examples.parseExamples.forEach(({ input, expected, description }) => {
    it(`should parse: ${description}`, () => {
      const result = parseName(input);
      expect(result).toEqual(expected);
    });
  });

  // Edge case tests
  it('should throw error for empty string', () => {
    expect(() => parseName('')).toThrow('Invalid name');
  });

  it('should throw error for non-string input', () => {
    expect(() => parseName(null as any)).toThrow('Invalid name');
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
