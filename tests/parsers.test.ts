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

    it('should handle standard names with nickname and suffix', () => {
      const result = parseName('John F. "Jack" Kennedy, Jr.');
      expect(result.kind).toBe('person');
      if (result.kind === 'person') {
        expect(result.given).toBe('John');
        expect(result.middle).toBe('F.');
        expect(result.family).toBe('Kennedy');
        expect(result.suffix).toBe('Jr.');
        expect(result.nickname).toBe('Jack');
        expect(result.reversed).toBe(false);
      }
    });

    it('should handle reversed names with nickname and suffix', () => {
      const result = parseName('Kennedy, John F. "Jack", Jr.');
      expect(result.kind).toBe('person');
      if (result.kind === 'person') {
        expect(result.given).toBe('John');
        expect(result.middle).toBe('F.');
        expect(result.family).toBe('Kennedy');
        expect(result.suffix).toBe('Jr.');
        expect(result.nickname).toBe('Jack');
        expect(result.reversed).toBe(true);
      }
    });

    it('should handle reversed names with initials, nickname and suffix', () => {
      const result = parseName('Kennedy, J. F. "Jack", Jr.');
      expect(result.kind).toBe('person');
      if (result.kind === 'person') {
        expect(result.given).toBe('J.');
        expect(result.middle).toBe('F.');
        expect(result.family).toBe('Kennedy');
        expect(result.suffix).toBe('Jr.');
        expect(result.nickname).toBe('Jack');
        expect(result.reversed).toBe(true);
      }
    });

    it('should handle reversed names with unspaced initials', () => {
      const result = parseName('Kennedy, J.F. "Jack", Jr.');
      expect(result.kind).toBe('person');
      if (result.kind === 'person') {
        expect(result.given).toBe('J.F.');
        expect(result.family).toBe('Kennedy');
        expect(result.suffix).toBe('Jr.');
        expect(result.nickname).toBe('Jack');
        expect(result.reversed).toBe(true);
      }
    });

    it('should handle reversed names with internal capitals', () => {
      const result = parseName('DeBartolo, Edward J., Jr.');
      expect(result.kind).toBe('person');
      if (result.kind === 'person') {
        expect(result.given).toBe('Edward');
        expect(result.middle).toBe('J.');
        expect(result.family).toBe('DeBartolo');
        expect(result.suffix).toBe('Jr.');
        expect(result.reversed).toBe(true);
      }
    });

    it('should handle standard names with internal capitals', () => {
      const result = parseName('Edward J. DeBartolo, Jr.');
      expect(result.kind).toBe('person');
      if (result.kind === 'person') {
        expect(result.given).toBe('Edward');
        expect(result.middle).toBe('J.');
        expect(result.family).toBe('DeBartolo');
        expect(result.suffix).toBe('Jr.');
        expect(result.reversed).toBe(false);
      }
    });

    it('should handle all-caps reversed names', () => {
      const result = parseName('DEBARTOLO, EDWARD J., JR.');
      expect(result.kind).toBe('person');
      if (result.kind === 'person') {
        expect(result.given).toBe('EDWARD');
        expect(result.middle).toBe('J.');
        expect(result.family).toBe('DEBARTOLO');
        expect(result.suffix).toBe('JR.');
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
        // Keep plural form as-is to avoid incorrectly singularizing
        // surnames that naturally end in 's' (Hicks, Williams, etc.)
        expect(result.familyName).toBe('Smiths');
        expect(result.style).toBe('pluralSurname');
      }
    });

    it('should preserve surnames that naturally end in s', () => {
      const result = parseName('The Hicks');
      expect(result.kind).toBe('family');
      if (result.kind === 'family') {
        expect(result.familyName).toBe('Hicks');
        expect(result.style).toBe('pluralSurname');
      }
    });
  });

  describe('compound detection', () => {
    // ==========================================================================
    // A1. Shared family at end (most common)
    // ==========================================================================
    describe('shared family patterns', () => {
      it('should detect compound names with & and shared family', () => {
        const result = parseName('Bob & Mary Smith');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.connector).toBe('&');
          expect(result.sharedFamily).toBe('Smith');
          expect(result.members.length).toBe(2);
          expect(result.members[0].kind).toBe('person');
          expect((result.members[0] as any).given).toBe('Bob');
          expect((result.members[0] as any).family).toBe('Smith');
          expect((result.members[1] as any).given).toBe('Mary');
          expect((result.members[1] as any).family).toBe('Smith');
        }
      });

      it('should detect compound names with "and" and shared family', () => {
        const result = parseName('John and Jane Doe');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.connector).toBe('and');
          expect(result.sharedFamily).toBe('Doe');
        }
      });

      it('should detect compound names with + connector', () => {
        const result = parseName('Alice + Bob Richardson');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.connector).toBe('+');
          expect(result.sharedFamily).toBe('Richardson');
        }
      });

      it('should handle honorific on first person only', () => {
        const result = parseName('Mr. Bill & Mary Smith');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.sharedFamily).toBe('Smith');
          expect((result.members[0] as any).honorific).toBe('Mr.');
          expect((result.members[0] as any).given).toBe('Bill');
          expect((result.members[1] as any).given).toBe('Mary');
          // Mary should NOT inherit Mr. honorific
          expect((result.members[1] as any).honorific).toBeUndefined();
        }
      });

      it('should handle honorific on second person only', () => {
        const result = parseName('Bill & Dr. Mary Smith');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.sharedFamily).toBe('Smith');
          expect((result.members[0] as any).given).toBe('Bill');
          expect((result.members[0] as any).honorific).toBeUndefined();
          expect((result.members[1] as any).honorific).toBe('Dr.');
          expect((result.members[1] as any).given).toBe('Mary');
        }
      });

      it('should handle both honorifics explicit', () => {
        const result = parseName('Mr. Bill & Mrs. Mary Smith');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.sharedFamily).toBe('Smith');
          expect((result.members[0] as any).honorific).toBe('Mr.');
          expect((result.members[1] as any).honorific).toBe('Mrs.');
        }
      });
    });

    // ==========================================================================
    // Paired honorific patterns (Mr. & Mrs., Dr. and Mrs., etc.)
    // ==========================================================================
    describe('paired honorific patterns', () => {
      it('should detect Mr. & Mrs. Smith', () => {
        const result = parseName('Mr. & Mrs. Smith');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.sharedFamily).toBe('Smith');
          expect(result.members.length).toBe(2);
          expect((result.members[0] as any).honorific).toBe('Mr.');
          expect((result.members[1] as any).honorific).toBe('Mrs.');
          expect(result.meta.reasons).toContain('COMPOUND_PAIRED_HONORIFIC');
        }
      });

      it('should detect Mr. and Mrs. Smith', () => {
        const result = parseName('Mr. and Mrs. Smith');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.sharedFamily).toBe('Smith');
        }
      });

      it('should detect Mr. & Mrs. Bill Smith (traditional format)', () => {
        const result = parseName('Mr. & Mrs. Bill Smith');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.sharedFamily).toBe('Smith');
          // Bill belongs to Mr., Mrs. given is unknown
          expect((result.members[0] as any).given).toBe('Bill');
          expect((result.members[0] as any).family).toBe('Smith');
        }
      });

      it('should detect Dr. and Mrs. Smith', () => {
        const result = parseName('Dr. and Mrs. Smith');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.sharedFamily).toBe('Smith');
          expect((result.members[0] as any).honorific).toBe('Dr.');
          expect((result.members[1] as any).honorific).toBe('Mrs.');
        }
      });

      it('should detect Dr. & Mr. Smith (same-sex couple)', () => {
        const result = parseName('Dr. & Mr. Smith');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.sharedFamily).toBe('Smith');
          expect((result.members[0] as any).honorific).toBe('Dr.');
          expect((result.members[1] as any).honorific).toBe('Mr.');
        }
      });

      it('should handle compact format Mr.&Mrs.', () => {
        const result = parseName('Mr.&Mrs. Johnson');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.sharedFamily).toBe('Johnson');
        }
      });
    });

    // ==========================================================================
    // Plural honorific patterns (Drs., Messrs., etc.)
    // ==========================================================================
    describe('plural honorific patterns', () => {
      it('should detect Drs. John and Jane Doe', () => {
        const result = parseName('Drs. John and Jane Doe');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.sharedFamily).toBe('Doe');
          expect((result.members[0] as any).honorific).toBe('Dr.');
          expect((result.members[0] as any).given).toBe('John');
          expect((result.members[1] as any).honorific).toBe('Dr.');
          expect((result.members[1] as any).given).toBe('Jane');
          expect(result.meta.reasons).toContain('COMPOUND_PLURAL_HONORIFIC');
        }
      });

      it('should detect Doctors John & Jane Doe', () => {
        const result = parseName('Doctors John & Jane Doe');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.sharedFamily).toBe('Doe');
          expect((result.members[0] as any).honorific).toBe('Dr.');
          expect((result.members[1] as any).honorific).toBe('Dr.');
        }
      });

      it('should detect Messrs. John and Bill Smith', () => {
        const result = parseName('Messrs. John and Bill Smith');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.sharedFamily).toBe('Smith');
          expect((result.members[0] as any).honorific).toBe('Mr.');
          expect((result.members[1] as any).honorific).toBe('Mr.');
        }
      });
    });

    // ==========================================================================
    // Suffix handling (suffixes should NOT be inherited)
    // ==========================================================================
    describe('suffix handling', () => {
      it('should not share suffix across members', () => {
        const result = parseName('John Jr. & Jane Smith');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect((result.members[0] as any).suffix).toBe('Jr.');
          // Jane should NOT inherit Jr.
          expect((result.members[1] as any).suffix).toBeUndefined();
        }
      });

      it('should handle suffix on second person only', () => {
        const result = parseName('John & Jane Smith Jr.');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          // Jr. should attach to Jane, not be inherited by John
          expect((result.members[0] as any).suffix).toBeUndefined();
        }
      });

      it('should handle credentials correctly', () => {
        const result = parseName('Dr. Bill Smith, MD & Mary Smith, RN');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.members.length).toBe(2);
        }
      });
    });

    // ==========================================================================
    // Reversed format patterns
    // ==========================================================================
    describe('reversed format patterns', () => {
      it('should detect Smith, Bill & Mary', () => {
        const result = parseName('Smith, Bill & Mary');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.sharedFamily).toBe('Smith');
        }
      });
    });

    // ==========================================================================
    // Edge cases and organization detection
    // ==========================================================================
    describe('edge cases', () => {
      it('should not classify org-like connectors as compound', () => {
        const result = parseName('Research & Development LLC');
        expect(result.kind).toBe('organization');
      });

      it('should handle single initial as given name', () => {
        const result = parseName('J. & Mary Smith');
        expect(result.kind).toBe('compound');
        if (result.kind === 'compound') {
          expect(result.sharedFamily).toBe('Smith');
        }
      });
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
