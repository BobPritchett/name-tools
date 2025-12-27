import { describe, it, expect } from 'vitest';
import {
  formatLastFirst,
  formatFirstLast,
  formatWithMiddleInitial,
  formatFormal,
} from '../src/formatters';

describe('formatLastFirst', () => {
  it('should format simple name', () => {
    expect(formatLastFirst('Bob Pritchett')).toBe('Pritchett, Bob');
  });

  it('should format name with middle name', () => {
    expect(formatLastFirst('Bob William Pritchett')).toBe('Pritchett, Bob William');
  });

  it('should format name with suffix', () => {
    expect(formatLastFirst('Bob Pritchett Jr.')).toBe('Pritchett, Bob, Jr.');
  });

  it('should format full name', () => {
    expect(formatLastFirst('Dr. Bob William Pritchett Jr.')).toBe('Pritchett, Bob William, Jr.');
  });
});

describe('formatFirstLast', () => {
  it('should format simple name', () => {
    expect(formatFirstLast('Bob Pritchett')).toBe('Bob Pritchett');
  });

  it('should format full name with all components', () => {
    expect(formatFirstLast('Dr. Bob William Pritchett Jr.')).toBe('Dr. Bob William Pritchett Jr.');
  });
});

describe('formatWithMiddleInitial', () => {
  it('should format name with middle initial', () => {
    expect(formatWithMiddleInitial('Bob William Pritchett')).toBe('Bob W. Pritchett');
  });

  it('should format name with multiple middle initials', () => {
    expect(formatWithMiddleInitial('John Robert Michael Smith')).toBe('John R. M. Smith');
  });

  it('should format full name with prefix and suffix', () => {
    expect(formatWithMiddleInitial('Dr. Bob William Pritchett Jr.')).toBe('Dr. Bob W. Pritchett Jr.');
  });

  it('should handle name without middle name', () => {
    expect(formatWithMiddleInitial('Bob Pritchett')).toBe('Bob Pritchett');
  });
});

describe('formatFormal', () => {
  it('should format name with existing prefix', () => {
    expect(formatFormal('Dr. Bob Pritchett')).toBe('Dr. Pritchett');
  });

  it('should format name without prefix', () => {
    expect(formatFormal('Bob Pritchett')).toBe('Mr/Ms Pritchett');
  });
});
