import { describe, it, expect } from 'vitest';
import { parseName, getFirstName, getLastName, getInitials } from '../src/parsers';

describe('parseName', () => {
  it('should parse a simple two-part name', () => {
    const result = parseName('Bob Pritchett');
    expect(result).toEqual({
      first: 'Bob',
      last: 'Pritchett',
    });
  });

  it('should parse a name with prefix', () => {
    const result = parseName('Dr. Bob Pritchett');
    expect(result).toEqual({
      prefix: 'Dr.',
      first: 'Bob',
      last: 'Pritchett',
    });
  });

  it('should parse a name with suffix', () => {
    const result = parseName('Bob Pritchett Jr.');
    expect(result).toEqual({
      first: 'Bob',
      last: 'Pritchett',
      suffix: 'Jr.',
    });
  });

  it('should parse a name with middle name', () => {
    const result = parseName('Bob William Pritchett');
    expect(result).toEqual({
      first: 'Bob',
      middle: 'William',
      last: 'Pritchett',
    });
  });

  it('should parse a full name with all components', () => {
    const result = parseName('Dr. Bob William Pritchett Jr.');
    expect(result).toEqual({
      prefix: 'Dr.',
      first: 'Bob',
      middle: 'William',
      last: 'Pritchett',
      suffix: 'Jr.',
    });
  });

  it('should handle multiple middle names', () => {
    const result = parseName('John Robert Michael Smith');
    expect(result).toEqual({
      first: 'John',
      middle: 'Robert Michael',
      last: 'Smith',
    });
  });

  it('should throw error for empty string', () => {
    expect(() => parseName('')).toThrow('Invalid name');
  });

  it('should throw error for non-string input', () => {
    expect(() => parseName(null as any)).toThrow('Invalid name');
  });
});

describe('getFirstName', () => {
  it('should extract first name from full name', () => {
    expect(getFirstName('Bob Pritchett')).toBe('Bob');
    expect(getFirstName('Dr. Bob William Pritchett Jr.')).toBe('Bob');
  });
});

describe('getLastName', () => {
  it('should extract last name from full name', () => {
    expect(getLastName('Bob Pritchett')).toBe('Pritchett');
    expect(getLastName('Dr. Bob William Pritchett Jr.')).toBe('Pritchett');
  });
});

describe('getInitials', () => {
  it('should get initials from two-part name', () => {
    expect(getInitials('Bob Pritchett')).toBe('BP');
  });

  it('should get initials from name with middle name', () => {
    expect(getInitials('Bob William Pritchett')).toBe('BWP');
  });

  it('should get initials from name with multiple middle names', () => {
    expect(getInitials('John Robert Michael Smith')).toBe('JRMS');
  });

  it('should ignore prefix and suffix', () => {
    expect(getInitials('Dr. Bob William Pritchett Jr.')).toBe('BWP');
  });
});
