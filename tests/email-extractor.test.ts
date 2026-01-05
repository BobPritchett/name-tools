import { describe, it, expect } from 'vitest';
import { extractEmail, hasEmail } from '../src/email-extractor';

describe('extractEmail', () => {
  describe('angle bracket format', () => {
    it('should extract email from "Name <email>" format', () => {
      const result = extractEmail('John Doe <john@example.com>');
      expect(result).toEqual({
        displayName: 'John Doe',
        email: 'john@example.com',
        addressRaw: 'john@example.com',
      });
    });

    it('should handle quoted display names', () => {
      const result = extractEmail('"Doe, John" <john@example.com>');
      expect(result).toEqual({
        displayName: 'Doe, John',
        email: 'john@example.com',
        addressRaw: 'john@example.com',
      });
    });

    it('should handle single-quoted display names', () => {
      const result = extractEmail("'John Doe' <john@example.com>");
      expect(result).toEqual({
        displayName: 'John Doe',
        email: 'john@example.com',
        addressRaw: 'john@example.com',
      });
    });

    it('should handle SMTP prefix in angle brackets', () => {
      const result = extractEmail('John Doe <SMTP:john@example.com>');
      expect(result).toEqual({
        displayName: 'John Doe',
        email: 'john@example.com',
        addressRaw: 'SMTP:john@example.com',
      });
    });

    it('should handle email-only in angle brackets', () => {
      const result = extractEmail('<john@example.com>');
      expect(result).toEqual({
        displayName: '',
        email: 'john@example.com',
        addressRaw: 'john@example.com',
      });
    });
  });

  describe('mailto format', () => {
    it('should extract email from mailto link', () => {
      const result = extractEmail('John Doe [mailto:john@example.com]');
      expect(result).toEqual({
        displayName: 'John Doe',
        email: 'john@example.com',
        addressRaw: '[mailto:john@example.com]',
      });
    });

    it('should handle mailto without display name', () => {
      const result = extractEmail('[mailto:john@example.com]');
      expect(result).toEqual({
        displayName: '',
        email: 'john@example.com',
        addressRaw: '[mailto:john@example.com]',
      });
    });
  });

  describe('SMTP format', () => {
    it('should extract email from SMTP format', () => {
      const result = extractEmail('<SMTP:john@example.com>');
      expect(result).toEqual({
        displayName: '',
        email: 'john@example.com',
        addressRaw: 'SMTP:john@example.com',
      });
    });
  });

  describe('parenthetical format', () => {
    it('should extract email from "email (Name)" format', () => {
      const result = extractEmail('john@example.com (John Doe)');
      expect(result).toEqual({
        displayName: 'John Doe',
        email: 'john@example.com',
        addressRaw: 'john@example.com',
      });
    });
  });

  describe('bare email', () => {
    it('should extract bare email address', () => {
      const result = extractEmail('john@example.com');
      expect(result).toEqual({
        displayName: '',
        email: 'john@example.com',
        addressRaw: 'john@example.com',
      });
    });

    it('should handle email with surrounding text', () => {
      const result = extractEmail('Contact: john@example.com');
      expect(result).toEqual({
        displayName: 'Contact:',
        email: 'john@example.com',
        addressRaw: 'john@example.com',
      });
    });
  });

  describe('normalization', () => {
    it('should lowercase email addresses', () => {
      const result = extractEmail('John Doe <John.Doe@Example.COM>');
      expect(result?.email).toBe('john.doe@example.com');
    });

    it('should strip mailto: prefix', () => {
      const result = extractEmail('[mailto:JOHN@EXAMPLE.COM]');
      expect(result?.email).toBe('john@example.com');
    });
  });

  describe('edge cases', () => {
    it('should return null for empty string', () => {
      expect(extractEmail('')).toBeNull();
    });

    it('should return null for whitespace only', () => {
      expect(extractEmail('   ')).toBeNull();
    });

    it('should return null for string without email', () => {
      expect(extractEmail('John Doe')).toBeNull();
    });

    it('should handle complex email addresses', () => {
      const result = extractEmail('john.doe+tag@sub.example.co.uk');
      expect(result?.email).toBe('john.doe+tag@sub.example.co.uk');
    });
  });
});

describe('hasEmail', () => {
  it('should return true for string with email', () => {
    expect(hasEmail('john@example.com')).toBe(true);
    expect(hasEmail('John Doe <john@example.com>')).toBe(true);
    expect(hasEmail('Contact john@example.com for info')).toBe(true);
  });

  it('should return false for string without email', () => {
    expect(hasEmail('John Doe')).toBe(false);
    expect(hasEmail('john at example dot com')).toBe(false);
    expect(hasEmail('')).toBe(false);
  });
});
