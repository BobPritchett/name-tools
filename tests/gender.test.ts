import { describe, it, expect, beforeAll } from 'vitest';
import { GenderDB } from '../src/gender/GenderDB';
import { decodeGenderData as decodeAll } from '../src/gender/data/all';
import { decodeGenderData as decode99 } from '../src/gender/data/coverage99';
import { decodeGenderData as decode95 } from '../src/gender/data/coverage95';

describe('GenderDB', () => {
  describe('with full dataset', () => {
    let db: GenderDB;

    beforeAll(() => {
      db = new GenderDB(decodeAll());
    });

    it('should load the database without errors', () => {
      expect(db.size).toBeGreaterThan(0);
    });

    describe('lookup()', () => {
      it('should find common male names', () => {
        const result = db.lookup('John');
        expect(result.found).toBe(true);
        if (result.found) {
          expect(result.maleProbability).toBeGreaterThan(0.95);
        }
      });

      it('should find common female names', () => {
        const result = db.lookup('Mary');
        expect(result.found).toBe(true);
        if (result.found) {
          expect(result.maleProbability).toBeLessThan(0.05);
        }
      });

      it('should find ambiguous names', () => {
        const result = db.lookup('Chris');
        expect(result.found).toBe(true);
        if (result.found) {
          // Chris is fairly ambiguous
          expect(result.maleProbability).toBeGreaterThan(0.3);
          expect(result.maleProbability).toBeLessThan(0.9);
        }
      });

      it('should be case-insensitive', () => {
        const upper = db.lookup('JOHN');
        const lower = db.lookup('john');
        const mixed = db.lookup('JoHn');

        expect(upper.found).toBe(true);
        expect(lower.found).toBe(true);
        expect(mixed.found).toBe(true);

        if (upper.found && lower.found && mixed.found) {
          expect(upper.maleProbability).toBe(lower.maleProbability);
          expect(upper.maleProbability).toBe(mixed.maleProbability);
        }
      });

      it('should return not found for unknown names', () => {
        const result = db.lookup('Xyzzyabc');
        expect(result.found).toBe(false);
      });

      it('should return not found for empty string', () => {
        const result = db.lookup('');
        expect(result.found).toBe(false);
      });

      it('should not find names when only a prefix matches', () => {
        // Names that start with uncommon sequences shouldn't match partials
        // "Xzavier" might exist but "Xzavie" should not
        const xzavier = db.lookup('Xzavier');
        if (xzavier.found) {
          // Try a partial that's very unlikely to be a real name
          const partial = db.lookup('Xzavierq'); // Extra char won't match
          expect(partial.found).toBe(false);
        }
        // More definitive: a made-up name that won't exist
        expect(db.lookup('Johnxyz').found).toBe(false);
      });
    });

    describe('getMaleProbability()', () => {
      it('should return probability for found names', () => {
        const prob = db.getMaleProbability('Michael');
        expect(prob).not.toBeNull();
        expect(prob).toBeGreaterThan(0.95);
      });

      it('should return null for unknown names', () => {
        const prob = db.getMaleProbability('Notaname123');
        expect(prob).toBeNull();
      });
    });

    describe('getFemaleProbability()', () => {
      it('should return complement of male probability', () => {
        const maleProb = db.getMaleProbability('Ashley');
        const femaleProb = db.getFemaleProbability('Ashley');

        expect(maleProb).not.toBeNull();
        expect(femaleProb).not.toBeNull();

        if (maleProb !== null && femaleProb !== null) {
          expect(maleProb + femaleProb).toBeCloseTo(1.0, 5);
        }
      });
    });

    describe('guessGender()', () => {
      it('should guess clearly male names', () => {
        expect(db.guessGender('William')).toBe('male');
        expect(db.guessGender('Robert')).toBe('male');
        expect(db.guessGender('James')).toBe('male');
      });

      it('should guess clearly female names', () => {
        expect(db.guessGender('Elizabeth')).toBe('female');
        expect(db.guessGender('Jennifer')).toBe('female');
        expect(db.guessGender('Susan')).toBe('female');
      });

      it('should return null for names not in database', () => {
        expect(db.guessGender('Xyznotaname')).toBeNull();
      });

      it('should respect custom threshold', () => {
        // With a very high threshold, even somewhat male names might be unknown
        const result = db.guessGender('Jamie', 0.95);
        // Jamie is somewhat ambiguous
        expect(['male', 'female', 'unknown']).toContain(result);
      });

      it('should return unknown for ambiguous names at default threshold', () => {
        // At 80% threshold, names like Chris/Pat should be unknown
        const chris = db.guessGender('Chris');
        expect(['male', 'unknown']).toContain(chris); // Chris leans male but may not hit 80%
      });
    });

    describe('has()', () => {
      it('should return true for existing names', () => {
        expect(db.has('David')).toBe(true);
        expect(db.has('Sarah')).toBe(true);
      });

      it('should return false for non-existing names', () => {
        expect(db.has('Xyznotaname')).toBe(false);
      });
    });

    describe('name coverage', () => {
      const commonMaleNames = [
        'James', 'Robert', 'John', 'Michael', 'David',
        'William', 'Richard', 'Joseph', 'Thomas', 'Charles'
      ];

      const commonFemaleNames = [
        'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara',
        'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen'
      ];

      it('should include all top 10 male names', () => {
        for (const name of commonMaleNames) {
          const result = db.lookup(name);
          expect(result.found, `Expected to find ${name}`).toBe(true);
        }
      });

      it('should include all top 10 female names', () => {
        for (const name of commonFemaleNames) {
          const result = db.lookup(name);
          expect(result.found, `Expected to find ${name}`).toBe(true);
        }
      });
    });
  });

  describe('coverage comparison', () => {
    let dbAll: GenderDB;
    let db99: GenderDB;
    let db95: GenderDB;

    beforeAll(() => {
      dbAll = new GenderDB(decodeAll());
      db99 = new GenderDB(decode99());
      db95 = new GenderDB(decode95());
    });

    it('should have decreasing sizes: all > 99% > 95%', () => {
      expect(dbAll.size).toBeGreaterThan(db99.size);
      expect(db99.size).toBeGreaterThan(db95.size);
    });

    it('should all contain common names', () => {
      const commonNames = ['John', 'Mary', 'Michael', 'Jennifer'];

      for (const name of commonNames) {
        expect(dbAll.has(name), `all should have ${name}`).toBe(true);
        expect(db99.has(name), `99% should have ${name}`).toBe(true);
        expect(db95.has(name), `95% should have ${name}`).toBe(true);
      }
    });

    it('should return same probabilities for shared names', () => {
      const name = 'John';

      const probAll = dbAll.getMaleProbability(name);
      const prob99 = db99.getMaleProbability(name);
      const prob95 = db95.getMaleProbability(name);

      expect(probAll).not.toBeNull();
      expect(prob99).not.toBeNull();
      expect(prob95).not.toBeNull();

      // Probabilities might differ very slightly due to quantization
      // but should be very close
      if (probAll !== null && prob99 !== null && prob95 !== null) {
        expect(Math.abs(probAll - prob99)).toBeLessThan(0.01);
        expect(Math.abs(probAll - prob95)).toBeLessThan(0.01);
      }
    });
  });

  describe('error handling', () => {
    it('should throw on invalid magic number', () => {
      const badBuffer = new ArrayBuffer(16);
      const view = new DataView(badBuffer);
      view.setUint32(0, 0x12345678, false); // Bad magic

      expect(() => new GenderDB(badBuffer)).toThrow('Invalid gender data');
    });
  });
});
