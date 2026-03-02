import { describe, it, expect } from 'vitest';
import { parseNameList } from '../src/list-parser';

describe('parseNameList', () => {
  describe('basic splitting', () => {
    it('should split on semicolons', () => {
      const result = parseNameList('John Doe; Jane Smith');
      expect(result).toHaveLength(2);
      expect(result[0].raw).toBe('John Doe');
      expect(result[1].raw).toBe('Jane Smith');
    });

    it('should split on newlines', () => {
      const result = parseNameList('John Doe\nJane Smith');
      expect(result).toHaveLength(2);
      expect(result[0].raw).toBe('John Doe');
      expect(result[1].raw).toBe('Jane Smith');
    });

    it('should split on commas between distinct names', () => {
      const result = parseNameList('John Doe <john@example.com>, Jane Smith <jane@example.com>');
      expect(result).toHaveLength(2);
    });

    it('should handle mixed separators', () => {
      const result = parseNameList('John Doe; Jane Smith\nBob Jones');
      expect(result).toHaveLength(3);
    });
  });

  describe('reversed name handling', () => {
    it('should not split reversed names on comma', () => {
      const result = parseNameList('Smith, John');
      expect(result).toHaveLength(1);
      expect(result[0].raw).toBe('Smith, John');
    });

    it('should handle reversed names with suffix in email format', () => {
      // Email format protects internal commas with angle brackets
      const result = parseNameList('"Smith, John, Jr." <john@example.com>; "Doe, Jane" <jane@example.com>');
      expect(result).toHaveLength(2);
      expect(result[0].email).toBe('john@example.com');
      expect(result[1].email).toBe('jane@example.com');
    });

    it('should handle multiple reversed names with semicolons', () => {
      const result = parseNameList('Smith, John; Doe, Jane');
      expect(result).toHaveLength(2);
      expect(result[0].raw).toBe('Smith, John');
      expect(result[1].raw).toBe('Doe, Jane');
    });

    it('should not split reversed name with suffix on comma', () => {
      const result = parseNameList('Smith, John, Jr.');
      expect(result).toHaveLength(1);
      expect(result[0].raw).toBe('Smith, John, Jr.');
    });

    it('should handle reversed name with suffix followed by another name', () => {
      const result = parseNameList('Smith, John, Jr.; Doe, Jane');
      expect(result).toHaveLength(2);
      expect(result[0].raw).toBe('Smith, John, Jr.');
      expect(result[1].raw).toBe('Doe, Jane');
    });

    it('should not split reversed names with initials and suffixes', () => {
      const result = parseNameList('Kennedy, J. F. "Jack", Jr.');
      expect(result).toHaveLength(1);
      expect(result[0].raw).toBe('Kennedy, J. F. "Jack", Jr.');
      expect(result[0].display?.kind).toBe('person');
    });

    it('should not split reversed names with unspaced initials and suffixes', () => {
      const result = parseNameList('Kennedy, J.F. "Jack", Jr.');
      expect(result).toHaveLength(1);
      expect(result[0].raw).toBe('Kennedy, J.F. "Jack", Jr.');
      expect(result[0].display?.kind).toBe('person');
    });
  });

  describe('email extraction', () => {
    it('should extract email from angle bracket format', () => {
      const result = parseNameList('John Doe <john@example.com>');
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('john@example.com');
      expect(result[0].display?.kind).toBe('person');
    });

    it('should extract email from quoted reversed name', () => {
      const result = parseNameList('"Doe, John" <john@example.com>');
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('john@example.com');
    });

    it('should handle email-only entries', () => {
      const result = parseNameList('john@example.com');
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('john@example.com');
      expect(result[0].display).toBeUndefined();
    });

    it('should not split inside angle brackets', () => {
      const result = parseNameList('John Doe <john,special@example.com>; Jane');
      expect(result).toHaveLength(2);
    });
  });

  describe('quote handling', () => {
    it('should not split inside double quotes', () => {
      const result = parseNameList('"Smith, John" <john@example.com>; Jane Doe');
      expect(result).toHaveLength(2);
      expect(result[0].raw).toBe('"Smith, John" <john@example.com>');
    });

    it('should not split inside single quotes', () => {
      const result = parseNameList("'Last, First' <email@example.com>; Other");
      expect(result).toHaveLength(2);
    });
  });

  describe('prefix removal', () => {
    it('should remove To: prefix', () => {
      const result = parseNameList('To: John Doe');
      expect(result).toHaveLength(1);
      expect(result[0].raw).toBe('John Doe');
    });

    it('should remove Cc: prefix', () => {
      const result = parseNameList('Cc: John Doe');
      expect(result).toHaveLength(1);
      expect(result[0].raw).toBe('John Doe');
    });

    it('should remove Bcc: prefix', () => {
      const result = parseNameList('Bcc: John Doe');
      expect(result).toHaveLength(1);
      expect(result[0].raw).toBe('John Doe');
    });

    it('should be case-insensitive for prefixes', () => {
      const result = parseNameList('TO: John Doe');
      expect(result[0].raw).toBe('John Doe');
    });
  });

  describe('entity classification', () => {
    it('should classify person names', () => {
      const result = parseNameList('Dr. John Smith');
      expect(result).toHaveLength(1);
      expect(result[0].display?.kind).toBe('person');
    });

    it('should classify organization names', () => {
      // Test without comma
      let result = parseNameList('Acme Corporation LLC');
      expect(result).toHaveLength(1);
      expect(result[0].display?.kind).toBe('organization');

      // Test with comma-legal form
      result = parseNameList('Acme, LLC');
      expect(result).toHaveLength(1);
      expect(result[0].display?.kind).toBe('organization');
      expect((result[0].display as any).legalForm).toBe('LLC');

      // Test with comma-legal form inside list
      result = parseNameList('Microsoft, Inc.; Acme Corporation LLC');
      expect(result).toHaveLength(2);
      expect(result[0].display?.kind).toBe('organization');
      expect(result[0].raw).toBe('Microsoft, Inc.');
      expect(result[1].display?.kind).toBe('organization');

    // Test with comma separator instead of semicolon
    result = parseNameList('Microsoft, Inc., Acme Corporation LLC');
    expect(result).toHaveLength(2);
    expect(result[0].display?.kind).toBe('organization');
    expect(result[0].raw).toBe('Microsoft, Inc.');
    expect(result[1].display?.kind).toBe('organization');
    });

    it('should handle multiple organizations with semicolon separator', () => {
      const result = parseNameList('Acme Corporation LLC; Other Company Inc');
      expect(result).toHaveLength(2);
      expect(result[0].display?.kind).toBe('organization');
      expect(result[1].display?.kind).toBe('organization');
    });

    it('should include confidence in meta', () => {
      const result = parseNameList('John Smith');
      expect(result[0].meta.confidence).toBeGreaterThan(0);
    });

    it('should include reasons in meta', () => {
      const result = parseNameList('John Smith <john@example.com>');
      expect(result[0].meta.reasons).toContain('HAS_EMAIL_OR_HANDLE');
    });
  });

  describe('edge cases', () => {
    it('should return empty array for empty string', () => {
      expect(parseNameList('')).toEqual([]);
    });

    it('should return empty array for null input', () => {
      expect(parseNameList(null as any)).toEqual([]);
    });

    it('should return empty array for undefined input', () => {
      expect(parseNameList(undefined as any)).toEqual([]);
    });

    it('should handle whitespace-only input', () => {
      expect(parseNameList('   ')).toEqual([]);
    });

    it('should handle empty segments', () => {
      const result = parseNameList('John;;;Jane');
      expect(result).toHaveLength(2);
      expect(result[0].raw).toBe('John');
      expect(result[1].raw).toBe('Jane');
    });

    it('should trim whitespace from entries', () => {
      const result = parseNameList('  John Doe  ;  Jane Smith  ');
      expect(result[0].raw).toBe('John Doe');
      expect(result[1].raw).toBe('Jane Smith');
    });
  });

  describe('complex real-world examples', () => {
    it('should handle Outlook-style recipient list', () => {
      const input = 'John Doe <john@example.com>; Jane Smith <jane@example.com>; Bob Jones <bob@example.com>';
      const result = parseNameList(input);
      expect(result).toHaveLength(3);
      expect(result.every(r => r.email)).toBe(true);
    });

    it('should handle mixed format list', () => {
      const input = 'john@example.com; "Doe, Jane" <jane@example.com>; Bob Jones';
      const result = parseNameList(input);
      expect(result).toHaveLength(3);
      expect(result[0].email).toBe('john@example.com');
      expect(result[1].email).toBe('jane@example.com');
      expect(result[2].email).toBeUndefined();
    });

    it('should handle multiline recipient list', () => {
      const input = `John Doe <john@example.com>
Jane Smith <jane@example.com>
Bob Jones <bob@example.com>`;
      const result = parseNameList(input);
      expect(result).toHaveLength(3);
    });
  });
});
