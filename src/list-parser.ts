/**
 * Recipient list parsing for To/CC lines and bulk input
 */

import type { ParsedRecipient, ParseListOptions, ReasonCode } from './types';
import { classifyName } from './classifier';
import { extractEmail, hasEmail } from './email-extractor';

/**
 * Split a recipient list into individual recipients
 *
 * Supports:
 * - Semicolon separator (Outlook default, strong)
 * - Comma separator (weak, context-aware)
 * - Newline separator
 *
 * Respects:
 * - Quoted strings (don't split inside quotes)
 * - Angle brackets (don't split inside <>)
 * - Reversed names (don't split "Smith, John" on comma)
 */
function splitRecipients(input: string): string[] {
  const results: string[] = [];
  let current = '';
  let inQuotes = false;
  let inAngleBrackets = false;
  let quoteChar = '';

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const nextChar = input[i + 1];

    // Track quote state
    if ((char === '"' || char === "'") && !inAngleBrackets) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      }
    }

    // Track angle bracket state
    if (char === '<' && !inQuotes) {
      inAngleBrackets = true;
    } else if (char === '>' && !inQuotes) {
      inAngleBrackets = false;
    }

    // Check for separators
    if (!inQuotes && !inAngleBrackets) {
      // Semicolon is always a separator
      if (char === ';') {
        const trimmed = current.trim();
        if (trimmed) {
          results.push(trimmed);
        }
        current = '';
        continue;
      }

      // Newline is always a separator
      if (char === '\n') {
        const trimmed = current.trim();
        if (trimmed) {
          results.push(trimmed);
        }
        current = '';
        continue;
      }

      // Comma is a separator UNLESS it looks like a reversed name
      if (char === ',') {
        // Look ahead to see if this is a reversed name pattern
        if (!isReversedNameComma(current, input.slice(i + 1))) {
          const trimmed = current.trim();
          if (trimmed) {
            results.push(trimmed);
          }
          current = '';
          continue;
        }
      }
    }

    current += char;
  }

  // Don't forget the last segment
  const trimmed = current.trim();
  if (trimmed) {
    results.push(trimmed);
  }

  // Remove common prefixes like "To:", "Cc:", "Bcc:"
  return results.map(r => {
    return r.replace(/^(To|Cc|Bcc|From):\s*/i, '').trim();
  }).filter(Boolean);
}

/**
 * Check if a comma is part of a reversed name (not a list separator)
 * "Smith, John" -> true (reversed name, don't split)
 * "John Smith, Jane Doe" -> false at the comma (list separator)
 */
function isReversedNameComma(before: string, after: string): boolean {
  const beforeTrimmed = before.trim();
  const afterTrimmed = after.trim();

  // If before is empty, it's not a reversed name
  if (!beforeTrimmed) return false;

  // If after starts with what looks like a given name (capitalized word)
  // and before looks like a surname (single capitalized word or particle+name)
  // then this might be a reversed name

  // Count tokens before comma
  const beforeTokens = beforeTrimmed.split(/\s+/).filter(Boolean);
  const afterTokens = afterTrimmed.split(/[\s,;]+/).filter(Boolean);

  // Typical reversed name: "Smith, John" (1-2 tokens before, name after)
  // Not reversed: "John Smith, Jane Doe" (2+ tokens before, name after)

  // If there's an email in the after part, it's probably a new recipient
  if (hasEmail(afterTrimmed.split(/[,;]/)[0])) {
    return false;
  }

  // If before has 1-2 tokens and after starts with a name-like word, assume reversed
  if (beforeTokens.length <= 2) {
    const firstAfter = afterTokens[0];
    if (firstAfter && /^[A-Z][a-z]+$/.test(firstAfter)) {
      // Could be reversed name
      // But check if there's another comma soon (which would indicate a list)
      const commaIdx = afterTrimmed.indexOf(',');
      if (commaIdx > 0 && commaIdx < 30) {
        // There's another comma nearby - check if it's a suffix
        const betweenCommas = afterTrimmed.slice(0, commaIdx).trim();
        const suffixPattern = /^[A-Z][a-z]+(\s+[A-Z]\.?)?$/; // "John" or "John Q."
        if (suffixPattern.test(betweenCommas)) {
          // Looks like "Smith, John, Jr." pattern
          return true;
        }
      }
      return true;
    }
  }

  return false;
}

/**
 * Parse a recipient list (To/CC line or bulk input)
 *
 * @param input - The recipient list string
 * @param options - Parsing options
 * @returns Array of parsed recipients
 */
export function parseNameList(
  input: string,
  options: ParseListOptions = {}
): ParsedRecipient[] {
  if (!input || typeof input !== 'string') {
    return [];
  }

  const recipients = splitRecipients(input);
  const results: ParsedRecipient[] = [];

  for (const recipientRaw of recipients) {
    const reasons: ReasonCode[] = [];

    // Try to extract email
    const emailResult = extractEmail(recipientRaw);

    if (emailResult) {
      // Has email - parse the display name
      const displayName = emailResult.displayName;
      reasons.push('HAS_EMAIL_OR_HANDLE');

      if (displayName) {
        const entity = classifyName(displayName, options);
        results.push({
          raw: recipientRaw,
          display: entity,
          email: emailResult.email,
          addressRaw: emailResult.addressRaw,
          meta: {
            confidence: entity.meta.confidence,
            reasons: [...reasons, ...entity.meta.reasons],
            warnings: entity.meta.warnings,
          },
        });
      } else {
        // Email only, no display name
        results.push({
          raw: recipientRaw,
          email: emailResult.email,
          addressRaw: emailResult.addressRaw,
          meta: {
            confidence: 0.5,
            reasons,
          },
        });
      }
    } else {
      // No email - parse as name
      const entity = classifyName(recipientRaw, options);
      results.push({
        raw: recipientRaw,
        display: entity,
        meta: {
          confidence: entity.meta.confidence,
          reasons: entity.meta.reasons,
          warnings: entity.meta.warnings,
        },
      });
    }
  }

  return results;
}
