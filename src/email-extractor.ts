/**
 * Email address extraction from recipient strings
 */

export interface ExtractedEmail {
  /** The display name portion */
  displayName: string;
  /** The email address (normalized) */
  email: string;
  /** The raw email/address string before normalization */
  addressRaw: string;
}

/**
 * Email regex pattern
 */
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

/**
 * Angle bracket pattern: "Name <email@example.com>"
 */
const ANGLE_BRACKET_RE = /^(.*?)\s*<([^>]+)>\s*$/;

/**
 * Parenthetical email: "email@example.com (Name)"
 */
const PAREN_EMAIL_RE = /^([^(]+)\s*\(([^)]+)\)\s*$/;

/**
 * Mailto pattern: "[mailto:email@example.com]"
 */
const MAILTO_RE = /\[mailto:([^\]]+)\]/i;

/**
 * SMTP pattern: "<SMTP:email@example.com>"
 */
const SMTP_RE = /<SMTP:([^>]+)>/i;

/**
 * Exchange X.500 pattern (simplified)
 */
const X500_RE = /\/O=[^/]+\/.*\/CN=([^/\s]+)/i;

/**
 * Normalize an email address
 */
function normalizeEmail(email: string): string {
  return email
    .toLowerCase()
    .replace(/^mailto:/i, '')
    .replace(/^smtp:/i, '')
    .trim();
}

/**
 * Extract email and display name from a recipient string
 *
 * Supported formats:
 * - "John Doe <john@example.com>"
 * - '"Doe, John" <john@example.com>'
 * - "john@example.com (John Doe)"
 * - "John Doe [mailto:john@example.com]"
 * - "<SMTP:john@example.com>"
 * - "john@example.com"
 */
export function extractEmail(text: string): ExtractedEmail | null {
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  // 1. Try angle bracket format: "Name <email>"
  const angleMatch = trimmed.match(ANGLE_BRACKET_RE);
  if (angleMatch) {
    const display = angleMatch[1].trim();
    const bracket = angleMatch[2].trim();

    // Check if bracket content is email or SMTP
    if (EMAIL_RE.test(bracket)) {
      return {
        displayName: unquoteDisplay(display),
        email: normalizeEmail(bracket),
        addressRaw: bracket,
      };
    }

    // Check for SMTP: prefix
    const smtpMatch = bracket.match(/^SMTP:(.+)$/i);
    if (smtpMatch) {
      return {
        displayName: unquoteDisplay(display),
        email: normalizeEmail(smtpMatch[1]),
        addressRaw: bracket,
      };
    }

    // Bracket might contain X.500 path
    const x500Match = bracket.match(X500_RE);
    if (x500Match) {
      return {
        displayName: unquoteDisplay(display),
        email: normalizeEmail(x500Match[1]),
        addressRaw: bracket,
      };
    }
  }

  // 2. Try mailto pattern: "[mailto:email]"
  const mailtoMatch = trimmed.match(MAILTO_RE);
  if (mailtoMatch) {
    const email = normalizeEmail(mailtoMatch[1]);
    const display = trimmed.replace(MAILTO_RE, '').trim();
    return {
      displayName: unquoteDisplay(display),
      email,
      addressRaw: mailtoMatch[0],
    };
  }

  // 3. Try SMTP pattern: "<SMTP:email>"
  const smtpMatch = trimmed.match(SMTP_RE);
  if (smtpMatch) {
    const email = normalizeEmail(smtpMatch[1]);
    const display = trimmed.replace(SMTP_RE, '').trim();
    return {
      displayName: unquoteDisplay(display),
      email,
      addressRaw: smtpMatch[0],
    };
  }

  // 4. Try parenthetical format: "email (Name)"
  const parenMatch = trimmed.match(PAREN_EMAIL_RE);
  if (parenMatch) {
    const beforeParen = parenMatch[1].trim();
    const inParen = parenMatch[2].trim();

    if (EMAIL_RE.test(beforeParen)) {
      return {
        displayName: inParen,
        email: normalizeEmail(beforeParen),
        addressRaw: beforeParen,
      };
    }
  }

  // 5. Try bare email
  const bareEmailMatch = trimmed.match(EMAIL_RE);
  if (bareEmailMatch) {
    const email = normalizeEmail(bareEmailMatch[0]);
    const display = trimmed.replace(EMAIL_RE, '').trim();
    return {
      displayName: display,
      email,
      addressRaw: bareEmailMatch[0],
    };
  }

  // 6. No email found
  return null;
}

/**
 * Remove surrounding quotes from display name
 */
function unquoteDisplay(display: string): string {
  let result = display.trim();

  // Remove surrounding double quotes
  if (result.startsWith('"') && result.endsWith('"')) {
    result = result.slice(1, -1);
  }

  // Remove surrounding single quotes
  if (result.startsWith("'") && result.endsWith("'")) {
    result = result.slice(1, -1);
  }

  return result.trim();
}

/**
 * Check if a string contains an email address
 */
export function hasEmail(text: string): boolean {
  return EMAIL_RE.test(text);
}
