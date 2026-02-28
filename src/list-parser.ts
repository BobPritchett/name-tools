/**
 * Recipient list parsing for To/CC lines and bulk input
 */

import type { ParsedRecipient, ParseListOptions, ReasonCode } from './types';
import { classifyName } from './classifier';
import { extractEmail, hasEmail } from './email-extractor';
import { isNameLikeToken } from './normalize';
import { COMMA_LEGAL_RE, matchLegalForm } from './data/legal-forms';

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
        // Or if it's a comma before a legal suffix (e.g., "Microsoft, Inc.")
        if (!isReversedNameComma(current, input.slice(i + 1))) {
          // It's a separator!
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
 * Common suffix patterns that appear after comma in reversed names
 */
const SUFFIX_PATTERN = /^(Jr\.?|Sr\.?|II|III|IV|V|VI|VII|VIII|Esq\.?|Ph\.?D\.?|M\.?D\.?|D\.?D\.?S\.?|D\.?O\.?|R\.?N\.?|CPA|MBA|JD|LLD|DDS|DO|RN)$/i;

/**
 * Check if a comma is part of a reversed name (not a list separator)
 * "Smith, John" -> true (reversed name, don't split)
 * "Smith, John, Jr." -> true at both commas (reversed name with suffix)
 * "John Smith, Jane Doe" -> false at the comma (list separator)
 */
function isReversedNameComma(before: string, after: string): boolean {
  const beforeTrimmed = before.trim();
  const afterTrimmed = after.trim();

  // If before is empty, it's not a reversed name
  if (!beforeTrimmed) return false;

  // Count tokens before comma (excluding commas from count)
  const beforeTokens = beforeTrimmed.split(/[\s,]+/).filter(Boolean);

  // If there's an email in the after part, it's probably a new recipient
  if (hasEmail(afterTrimmed.split(/[,;\r\n]/)[0])) {
    return false;
  }

  // Get the first word after the current comma (might be "Inc." in "Microsoft, Inc.")
  const exactNextChunk = afterTrimmed.split(/[,;\r\n]/)[0].trim();
  
  // Note: matchLegalForm returns a truthy LegalFormEntry if it matches any pattern for a legal suffix
  if (matchLegalForm(exactNextChunk)) {
    // We only want to join it if `beforeTokens` isn't entirely empty
    if (beforeTokens.length > 0) {
      // Because `isReversedNameComma` returning TRUE means the comma is NOT a separator.
      // Let's ensure the `exactNextChunk` strictly maps to a legal form.
      const isExactlyLegalForm = matchLegalForm(exactNextChunk);
      if (isExactlyLegalForm) {
        const normalizedChunk = exactNextChunk.toUpperCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();
        // `isReversedNameComma` returns true if we should NOT split at this comma.
        if (isExactlyLegalForm.patterns.includes(normalizedChunk)) {
          return true;
        }
      }
    }
  }

  // Get the first word after the comma
  const afterTokens = afterTrimmed.split(/[\s,;\r\n]+/).filter(Boolean);
  const firstAfter = afterTokens[0];
  if (!firstAfter) return false;

  // Check if after is a suffix (Jr., Sr., III, etc.)
  // This handles "Smith, John, Jr." - the comma before Jr.
  if (SUFFIX_PATTERN.test(firstAfter)) {
    return true;
  }

  // If before has 1-3 tokens (could be "Smith" or "Smith, John" or "van der Berg, Jan")
  // and after starts with a name-like word, assume reversed
  if (beforeTokens.length <= 3) {
    // Wait, what if the string before the comma explicitly looks like a company name that ended in a legal suffix?
    // We shouldn't treat this comma as a reversed name comma. E.g. "Microsoft, Inc., Bob" -> Split here!
    const lastBeforeToken = beforeTokens[beforeTokens.length - 1];
    if (lastBeforeToken && matchLegalForm(lastBeforeToken)) {
      return false; // Force split if the thing immediately before the comma is a legal suffix!
    }

    // Check if after looks like a given name or suffix
    if (isNameLikeToken(firstAfter)) {
      // Could be reversed name - check for subsequent commas
      const commaIdx = afterTrimmed.indexOf(',');
      
      // Let's ensure the `before` string isn't explicitly an organization that we just matched.
      // We already have a check for this on line 169 (lastBeforeToken), but let's make sure
      // we aren't bypassing it if someone puts a newline there.
      
      if (commaIdx > 0 && commaIdx < 30) {
        // There's another comma nearby - check if what follows is a suffix
        const afterComma = afterTrimmed.slice(commaIdx + 1).trim();
        const nextWord = afterComma.split(/[\s,;\r\n]+/)[0];
        if (nextWord && SUFFIX_PATTERN.test(nextWord)) {
          // Looks like "Smith, John, Jr." pattern
          return true;
        }
        // Check if between commas looks like a name
        const betweenCommas = afterTrimmed.slice(0, commaIdx).trim();
        const namePattern = /^[A-Z][a-z]+(\s+[A-Z]\.?)?$/; // "John" or "John Q."
        if (namePattern.test(betweenCommas)) {
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
