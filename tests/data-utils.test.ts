import { describe, it, expect } from 'vitest';
import {
  PARTICLES,
  MULTI_WORD_PARTICLES,
  isParticle,
  isMultiWordParticle,
} from '../src/data/particles';
import {
  COMMON_SURNAMES,
  COMMON_FIRST_NAMES,
  isCommonSurname,
  isCommonFirstName,
} from '../src/data/surnames';

// =============================================================================
// Particle utilities
// =============================================================================

describe('isParticle', () => {
  it('should recognize lowercase particles', () => {
    expect(isParticle('von')).toBe(true);
    expect(isParticle('van')).toBe(true);
    expect(isParticle('de')).toBe(true);
    expect(isParticle('la')).toBe(true);
    expect(isParticle('du')).toBe(true);
  });

  it('should be case-insensitive', () => {
    expect(isParticle('Von')).toBe(true);
    expect(isParticle('VAN')).toBe(true);
    expect(isParticle('De')).toBe(true);
  });

  it('should reject non-particles', () => {
    expect(isParticle('Smith')).toBe(false);
    expect(isParticle('John')).toBe(false);
    expect(isParticle('')).toBe(false);
  });

  it('should recognize Celtic particles', () => {
    expect(isParticle('mac')).toBe(true);
    expect(isParticle('mc')).toBe(true);
  });
});

describe('isMultiWordParticle', () => {
  it('should detect multi-word particles', () => {
    expect(isMultiWordParticle(['de', 'la', 'Cruz'])).toBe('de la');
    expect(isMultiWordParticle(['van', 'der', 'Berg'])).toBe('van der');
    expect(isMultiWordParticle(['van', 'den', 'Heuvel'])).toBe('van den');
  });

  it('should return null for non-particles', () => {
    expect(isMultiWordParticle(['Smith', 'Jones'])).toBeNull();
    expect(isMultiWordParticle(['John'])).toBeNull();
  });

  it('should match exact multi-word particles', () => {
    expect(isMultiWordParticle(['de', 'la'])).toBe('de la');
    expect(isMultiWordParticle(['de', 'los'])).toBe('de los');
  });
});

describe('PARTICLES', () => {
  it('should be a non-empty array', () => {
    expect(PARTICLES.length).toBeGreaterThan(0);
  });
});

describe('MULTI_WORD_PARTICLES', () => {
  it('should be a non-empty array', () => {
    expect(MULTI_WORD_PARTICLES.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// Surname/first name utilities
// =============================================================================

describe('isCommonSurname', () => {
  it('should recognize common surnames', () => {
    expect(isCommonSurname('garcia')).toBe(true);
    expect(isCommonSurname('silva')).toBe(true);
    expect(isCommonSurname('rossi')).toBe(true);
    expect(isCommonSurname('martin')).toBe(true);
  });

  it('should be case-insensitive', () => {
    expect(isCommonSurname('García')).toBe(true);
    expect(isCommonSurname('SILVA')).toBe(true);
  });

  it('should reject non-common surnames', () => {
    expect(isCommonSurname('Xyzzy')).toBe(false);
    expect(isCommonSurname('')).toBe(false);
  });
});

describe('isCommonFirstName', () => {
  it('should recognize common first names', () => {
    expect(isCommonFirstName('john')).toBe(true);
    expect(isCommonFirstName('mary')).toBe(true);
    expect(isCommonFirstName('william')).toBe(true);
  });

  it('should be case-insensitive', () => {
    expect(isCommonFirstName('John')).toBe(true);
    expect(isCommonFirstName('MARY')).toBe(true);
  });

  it('should reject non-common first names', () => {
    expect(isCommonFirstName('Xyzzy')).toBe(false);
    expect(isCommonFirstName('')).toBe(false);
  });
});

describe('COMMON_SURNAMES', () => {
  it('should be a non-empty array', () => {
    expect(COMMON_SURNAMES.length).toBeGreaterThan(0);
  });
});

describe('COMMON_FIRST_NAMES', () => {
  it('should be a non-empty array', () => {
    expect(COMMON_FIRST_NAMES.length).toBeGreaterThan(0);
  });
});
