import { describe, it, expect } from 'vitest';
import {
  formatLastFirst,
  formatFirstLast,
  formatWithMiddleInitial,
  formatFormal,
} from '../src/formatters';
import { getInitials } from '../src/parsers';
import examples from '../src/data/examples.json';

describe('formatLastFirst', () => {
  // Data-driven tests
  examples.formatExamples.forEach(({ input, formats, description }) => {
    it(`should format: ${description}`, () => {
      expect(formatLastFirst(input)).toBe(formats.lastFirst);
    });
  });
});

describe('formatFirstLast', () => {
  // Data-driven tests
  examples.formatExamples.forEach(({ input, formats, description }) => {
    it(`should format: ${description}`, () => {
      expect(formatFirstLast(input)).toBe(formats.firstLast);
    });
  });
});

describe('formatWithMiddleInitial', () => {
  // Data-driven tests
  examples.formatExamples.forEach(({ input, formats, description }) => {
    it(`should format: ${description}`, () => {
      expect(formatWithMiddleInitial(input)).toBe(formats.withMiddleInitial);
    });
  });
});

describe('formatFormal', () => {
  // Data-driven tests
  examples.formatExamples.forEach(({ input, formats, description }) => {
    it(`should format: ${description}`, () => {
      expect(formatFormal(input)).toBe(formats.formal);
    });
  });
});

describe('getInitials (formatting context)', () => {
  // Data-driven tests
  examples.formatExamples.forEach(({ input, formats, description }) => {
    it(`should get initials: ${description}`, () => {
      expect(getInitials(input)).toBe(formats.initials);
    });
  });
});
