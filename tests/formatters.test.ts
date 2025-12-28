import { describe, it, expect } from 'vitest';
import { formatName } from '../src/formatters';

const NBSP = '\u00A0';
const NNBSP = '\u202F';

describe('formatName (single)', () => {
  it('renders display (default) with smart glue and suffix:auto (identity-like)', () => {
    expect(formatName('Dr. Bob William Pritchett Jr.')).toBe(
      `Bob${NBSP}Pritchett,${NBSP}Jr.`
    );
  });

  it('renders informal (given + last, no suffix)', () => {
    expect(formatName('Dr. Bob William Pritchett Jr.', { preset: 'informal' })).toBe(
      `Bob${NBSP}Pritchett`
    );
  });

  it('renders formalFull (prefix + given + middle + last + suffix) with smart glue', () => {
    expect(formatName('Dr. Bob William Pritchett Jr.', { preset: 'formalFull' })).toBe(
      `Dr.${NBSP}Bob William${NBSP}Pritchett,${NBSP}Jr.`
    );
  });

  it('renders formalShort (prefix + last) with smart glue', () => {
    expect(formatName('Dr. Bob William Pritchett Jr.', { preset: 'formalShort' })).toBe(
      `Dr.${NBSP}Pritchett`
    );
  });

  it('renders alphabetical (family, given + middle initial, suffix:auto)', () => {
    expect(formatName('Dr. Bob William Pritchett Jr.', { preset: 'alphabetical' })).toBe(
      `Pritchett,${NBSP}Bob W.,${NBSP}Jr.`
    );
  });

  it('renders initialed (initials + family) using NNBSP between initials and NBSP before last', () => {
    expect(formatName('Bob William Pritchett', { preset: 'initialed' })).toBe(
      `B.${NNBSP}W.${NBSP}Pritchett`
    );
  });

  it('renders preferredDisplay (nickname + family) when nickname exists', () => {
    expect(formatName('William (Bill) Henry Gates III', { preset: 'preferredDisplay' })).toBe(
      `Bill${NBSP}Gates,${NBSP}III`
    );
  });

  it('supports output:"html" by emitting HTML entities for NBSP/NNBSP', () => {
    expect(formatName('Bob William Pritchett', { preset: 'initialed', output: 'html' })).toBe(
      `B.&#8239;W.&nbsp;Pritchett`
    );
  });
});

describe('formatName (arrays)', () => {
  it('renders lists (2)', () => {
    expect(formatName(['John Smith', 'Mary Jones'], { join: 'list' })).toBe(
      `John${NBSP}Smith and Mary${NBSP}Jones`
    );
  });

  it('renders lists (3) with Oxford comma', () => {
    expect(
      formatName(['John Smith', 'Mary Jones', 'Pat Lee'], { join: 'list', oxfordComma: true })
    ).toBe(`John${NBSP}Smith, Mary${NBSP}Jones, and Pat${NBSP}Lee`);
  });

  it('renders couples (shared last name, display) as "given1 and given2 last" with smart glue to last', () => {
    expect(formatName(['John Smith', 'Mary Smith'], { join: 'couple' })).toBe(
      `John and Mary${NBSP}Smith`
    );
  });

  it('renders couples (different last names) as two full names', () => {
    expect(formatName(['John Smith', 'Mary Jones'], { join: 'couple' })).toBe(
      `John${NBSP}Smith and Mary${NBSP}Jones`
    );
  });

  it('renders couples (formalFull, different prefixes, same last) in deterministic classic style', () => {
    expect(
      formatName(
        [
          { prefix: 'Mr.', first: 'John', last: 'Smith' },
          { prefix: 'Mrs.', first: 'Mary', last: 'Smith' },
        ],
        { join: 'couple', preset: 'formalFull' }
      )
    ).toBe(`Mr. and Mrs.${NBSP}John and Mary${NBSP}Smith`);
  });

  it('throws on array input when join:"none"', () => {
    expect(() => formatName(['John Smith', 'Mary Jones'] as any)).toThrow(
      'array input requires options.join'
    );
  });
});
