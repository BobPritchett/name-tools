import { parseName } from './parsers';
import { extractIdentitySuffixFromTokens } from './affixes';
import type { NameFormatOptions, NamePreset, ParsedName } from './types';

type ResolvedOptions = Required<
  Pick<
    NameFormatOptions,
    | 'preset'
    | 'output'
    | 'typography'
    | 'noBreak'
    | 'join'
    | 'conjunction'
    | 'oxfordComma'
    | 'shareLastName'
    | 'sharePrefix'
    | 'shareSuffix'
    | 'prefer'
    | 'middle'
    | 'prefix'
    | 'suffix'
    | 'order'
  >
>;

type SpaceToken = {
  SP: string;
  NBSP: string;
  NNBSP: string;
};

type RenderedPersonParts = {
  prefixText?: string;
  givenText?: string;
  lastText?: string;
  suffixText?: string;
  fullText: string;
};

const DEFAULTS: Required<Pick<NameFormatOptions, 'preset' | 'output' | 'typography' | 'noBreak' | 'join' | 'conjunction' | 'oxfordComma' | 'shareLastName' | 'sharePrefix' | 'shareSuffix'>> =
  {
    preset: 'display',
    output: 'text',
    typography: 'ui',
    noBreak: 'smart',
    join: 'none',
    conjunction: 'and',
    oxfordComma: true,
    shareLastName: 'whenSame',
    sharePrefix: 'auto',
    shareSuffix: 'auto',
  };

const PRESET_DEFAULTS: Record<
  NamePreset,
  Required<Pick<NameFormatOptions, 'prefix' | 'prefer' | 'middle' | 'suffix' | 'order'>>
> = {
  display: { prefix: 'omit', prefer: 'auto', middle: 'none', suffix: 'auto', order: 'given-family' },
  preferredDisplay: { prefix: 'omit', prefer: 'nickname', middle: 'none', suffix: 'auto', order: 'given-family' },
  informal: { prefix: 'omit', prefer: 'first', middle: 'none', suffix: 'omit', order: 'given-family' },
  firstOnly: { prefix: 'omit', prefer: 'first', middle: 'none', suffix: 'omit', order: 'given-family' },
  preferredFirst: { prefix: 'omit', prefer: 'nickname', middle: 'none', suffix: 'omit', order: 'given-family' },
  formalFull: { prefix: 'include', prefer: 'first', middle: 'full', suffix: 'include', order: 'given-family' },
  formalShort: { prefix: 'include', prefer: 'first', middle: 'none', suffix: 'omit', order: 'given-family' },
  alphabetical: { prefix: 'omit', prefer: 'first', middle: 'initial', suffix: 'auto', order: 'family-given' },
  initialed: { prefix: 'omit', prefer: 'first', middle: 'initial', suffix: 'omit', order: 'given-family' },
};

function normalizeCollapseSpaces(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeTrim(value: string): string {
  return value.trim();
}

function getSpaceTokens(output: ResolvedOptions['output']): SpaceToken {
  return output === 'html'
    ? { SP: ' ', NBSP: '&nbsp;', NNBSP: '&#8239;' }
    : { SP: ' ', NBSP: '\u00A0', NNBSP: '\u202F' };
}

function resolveOptions(options?: NameFormatOptions): ResolvedOptions {
  const preset = options?.preset ?? DEFAULTS.preset;
  const base = PRESET_DEFAULTS[preset];
  return {
    preset,
    output: options?.output ?? DEFAULTS.output,
    typography: options?.typography ?? DEFAULTS.typography,
    noBreak: options?.noBreak ?? DEFAULTS.noBreak,
    join: options?.join ?? DEFAULTS.join,
    conjunction: options?.conjunction ?? DEFAULTS.conjunction,
    oxfordComma: options?.oxfordComma ?? DEFAULTS.oxfordComma,
    shareLastName: options?.shareLastName ?? DEFAULTS.shareLastName,
    sharePrefix: options?.sharePrefix ?? DEFAULTS.sharePrefix,
    shareSuffix: options?.shareSuffix ?? DEFAULTS.shareSuffix,
    prefer: options?.prefer ?? base.prefer,
    middle: options?.middle ?? base.middle,
    prefix: options?.prefix ?? base.prefix,
    suffix: options?.suffix ?? base.suffix,
    order: options?.order ?? base.order,
  };
}

function ensureParsed(name: string | ParsedName): ParsedName {
  return typeof name === 'string' ? parseName(name) : name;
}

function toWords(value: string): string[] {
  return value.split(/\s+/).map(w => w.trim()).filter(Boolean);
}

function toInitial(word: string): string | undefined {
  const w = word.trim();
  if (!w) return undefined;
  return w.charAt(0).toUpperCase() + '.';
}

function isIdentitySuffixToken(token: string): boolean {
  const t = token.trim().replace(/[.,]/g, '');
  if (!t) return false;
  if (/^(jr|sr)$/i.test(t)) return true;
  if (/^(ii|iii|iv|v|vi|vii|viii|ix|x)$/i.test(t)) return true;
  return false;
}

function extractIdentitySuffix(suffix: string): string | undefined {
  const rawTokens = suffix
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const identityParts: string[] = [];
  for (const chunk of rawTokens) {
    // chunk may be multi-word (rare); take first "wordish" token for identity detection
    const firstWord = chunk.split(/\s+/)[0] ?? '';
    if (isIdentitySuffixToken(firstWord)) {
      identityParts.push(chunk);
    }
  }

  return identityParts.length > 0 ? identityParts.join(', ') : undefined;
}

function resolveGiven(parsed: ParsedName, prefer: ResolvedOptions['prefer']): string | undefined {
  const first = parsed.first ? normalizeTrim(parsed.first) : undefined;
  const nickname = parsed.nickname ? normalizeTrim(parsed.nickname) : undefined;
  const preferredGiven = parsed.preferredGiven ? normalizeTrim(parsed.preferredGiven) : undefined;

  if (prefer === 'nickname') return preferredGiven ?? nickname ?? first;
  if (prefer === 'first') return first ?? nickname;

  // prefer === 'auto'
  return first ?? nickname;
}

function resolvePrefix(parsed: ParsedName, prefixMode: ResolvedOptions['prefix']): string | undefined {
  const prefix = parsed.prefix ? normalizeCollapseSpaces(parsed.prefix) : undefined;
  if (!prefix) return undefined;
  if (prefixMode === 'omit') return undefined;
  if (prefixMode === 'include') return prefix;
  // auto: treat as include only for presets that requested it via defaults (resolved already)
  return prefix;
}

function resolveLast(parsed: ParsedName): string | undefined {
  if (parsed.last == null) return undefined;
  const last = normalizeTrim(parsed.last);
  return last.length > 0 ? last : undefined;
}

function resolveSuffix(parsed: ParsedName, suffixMode: ResolvedOptions['suffix']): string | undefined {
  const suffix = parsed.suffix ? normalizeCollapseSpaces(parsed.suffix) : undefined;
  if (suffixMode === 'omit') return undefined;

  if (suffixMode === 'include') return suffix;
  // auto: include identity-like only
  const identityFromTokens = extractIdentitySuffixFromTokens(parsed.suffixTokens);
  if (identityFromTokens) return identityFromTokens;
  if (!suffix) return undefined;
  return extractIdentitySuffix(suffix);
}

type Boundary =
  | 'space'
  | 'prefixToNext'
  | 'givenToLast'
  | 'initialTight'
  | 'initialToWord'
  | 'commaSpace'
  | 'commaToGiven';

function boundarySpace(boundary: Boundary, o: ResolvedOptions, t: SpaceToken): string {
  const noBreak = o.noBreak;
  const typography = o.typography;

  if (noBreak === 'none' || typography === 'plain') {
    // In plain/none mode, everything is breakable (except "all")
    return t.SP;
  }

  if (noBreak === 'all') {
    return t.NBSP;
  }

  // smart
  switch (boundary) {
    case 'initialTight':
      return typography === 'ui' || typography === 'fine' ? t.NNBSP : t.NBSP;
    case 'prefixToNext':
    case 'givenToLast':
    case 'initialToWord':
    case 'commaSpace':
    case 'commaToGiven':
      return t.NBSP;
    case 'space':
    default:
      return t.SP;
  }
}

function joinInitials(initials: string[], o: ResolvedOptions, t: SpaceToken): string {
  if (initials.length === 0) return '';
  if (initials.length === 1) return initials[0];

  const sep = boundarySpace('initialTight', o, t);
  return initials.join(sep);
}

function renderMiddle(parsed: ParsedName, middleMode: ResolvedOptions['middle'], o: ResolvedOptions, t: SpaceToken): string | undefined {
  if (!parsed.middle) return undefined;
  const middle = normalizeTrim(parsed.middle);
  if (!middle) return undefined;

  if (middleMode === 'none') return undefined;
  if (middleMode === 'full') return middle;

  // initial
  const initials = toWords(middle).map(toInitial).filter(Boolean) as string[];
  if (initials.length === 0) return undefined;
  return joinInitials(initials, o, t);
}

function renderGivenPlusMiddle(
  parsed: ParsedName,
  o: ResolvedOptions,
  t: SpaceToken
): { givenLikeText?: string; finalGivenToken?: string } {
  const given = resolveGiven(parsed, o.prefer);
  if (!given) return { givenLikeText: undefined, finalGivenToken: undefined };

  if (o.preset === 'initialed') {
    const firstInitial = toInitial(given);
    const middleInitials = parsed.middle ? toWords(normalizeTrim(parsed.middle)).map(toInitial).filter(Boolean) as string[] : [];
    const all = [firstInitial, ...middleInitials].filter(Boolean) as string[];
    const initialsText = joinInitials(all, o, t);
    const finalToken = all.length > 0 ? all[all.length - 1] : given;
    return { givenLikeText: initialsText, finalGivenToken: finalToken };
  }

  const middleText = renderMiddle(parsed, o.middle, o, t);
  if (!middleText) return { givenLikeText: given, finalGivenToken: given };

  const sep = boundarySpace('space', o, t);
  // final given-like token is the last thing before last name (middleText if present, else given)
  return { givenLikeText: given + sep + middleText, finalGivenToken: middleText };
}

function renderSingle(parsed: ParsedName, o: ResolvedOptions): RenderedPersonParts {
  const t = getSpaceTokens(o.output);

  const prefixText = resolvePrefix(parsed, o.prefix);
  const lastText = resolveLast(parsed);
  const suffixText = resolveSuffix(parsed, o.suffix);

  const { givenLikeText } = renderGivenPlusMiddle(parsed, o, t);

  // Preset formalShort: prefix + last (omit given/middle)
  if (o.preset === 'formalShort') {
    const pieces: string[] = [];
    if (prefixText) pieces.push(prefixText);
    if (lastText) pieces.push(lastText);

    let base = '';
    if (pieces.length === 0) base = '';
    else if (pieces.length === 1) base = pieces[0];
    else base = `${pieces[0]}${boundarySpace('prefixToNext', o, t)}${pieces[1]}`;

    // Suffix is normally omitted for this preset, but allow explicit override to include/auto.
    if (suffixText) {
      base += `,${boundarySpace('commaSpace', o, t)}${suffixText}`;
    }

    return { prefixText, givenText: undefined, lastText, suffixText, fullText: base };
  }

  // Preset firstOnly / preferredFirst
  if (o.preset === 'firstOnly' || o.preset === 'preferredFirst') {
    const onlyGiven = resolveGiven(parsed, o.prefer);
    const normalizedOnlyGiven = onlyGiven ? normalizeTrim(onlyGiven) : undefined;
    const effectivePrefix = prefixText;
    if (!normalizedOnlyGiven) {
      return { prefixText: effectivePrefix, givenText: undefined, lastText, suffixText, fullText: '' };
    }

    if (effectivePrefix) {
      const sep = boundarySpace('prefixToNext', o, t);
      return { prefixText: effectivePrefix, givenText: normalizedOnlyGiven, lastText, suffixText, fullText: effectivePrefix + sep + normalizedOnlyGiven };
    }
    return { prefixText: undefined, givenText: normalizedOnlyGiven, lastText, suffixText, fullText: normalizedOnlyGiven };
  }

  // Build based on order
  if (o.order === 'family-given') {
    // "Last, Given Middle, Suffix" (suffix optional)
    const pieces: string[] = [];
    if (lastText) pieces.push(lastText);

    if (givenLikeText) {
      const comma = ',';
      const afterComma = boundarySpace('commaToGiven', o, t);
      pieces.push(comma + afterComma + givenLikeText);
    }

    let base = pieces.join('');

    if (suffixText) {
      const comma = ',';
      const afterComma = boundarySpace('commaSpace', o, t);
      base += comma + afterComma + suffixText;
    }

    return {
      prefixText: undefined,
      givenText: givenLikeText,
      lastText,
      suffixText,
      fullText: base,
    };
  }

  // Default: given-family
  const parts: string[] = [];
  if (prefixText) {
    parts.push(prefixText);
  }
  if (givenLikeText) {
    parts.push(givenLikeText);
  }
  if (lastText) {
    parts.push(lastText);
  }

  // Apply smart glue by selecting separators explicitly for key boundaries
  let base = '';
  const emitted: string[] = [];
  if (prefixText) emitted.push(prefixText);
  if (givenLikeText) emitted.push(givenLikeText);
  if (lastText) emitted.push(lastText);

  if (emitted.length === 0) {
    base = '';
  } else if (emitted.length === 1) {
    base = emitted[0];
  } else {
    // prefix -> given (smart: NBSP)
    if (prefixText && givenLikeText) {
      base = prefixText + boundarySpace('prefixToNext', o, t) + givenLikeText;
      if (lastText) {
        base += boundarySpace('givenToLast', o, t) + lastText;
      }
    } else if (givenLikeText && lastText) {
      base = givenLikeText + boundarySpace('givenToLast', o, t) + lastText;
    } else {
      // fallback join (rare)
      base = emitted.join(boundarySpace('space', o, t));
    }
  }

  if (suffixText) {
    const comma = ',';
    const afterComma = boundarySpace('commaSpace', o, t);
    base += comma + afterComma + suffixText;
  }

  return { prefixText, givenText: givenLikeText, lastText, suffixText, fullText: base };
}

function normalizeCompareKey(value?: string): string | undefined {
  if (!value) return undefined;
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function joinList(items: string[], o: ResolvedOptions): string {
  const n = items.length;
  if (n === 0) return '';
  if (n === 1) return items[0];
  if (n === 2) return `${items[0]} ${o.conjunction} ${items[1]}`;

  const head = items.slice(0, -1).join(', ');
  const tail = items[n - 1];
  const comma = o.oxfordComma ? ',' : '';
  return `${head}${comma} ${o.conjunction} ${tail}`;
}

function shouldShare(mode: ResolvedOptions['shareLastName' | 'sharePrefix' | 'shareSuffix'], same: boolean): boolean {
  if (mode === 'never') return false;
  if (mode === 'whenSame') return same;
  // auto (MVP): behave like whenSame
  return same;
}

function joinCouple(a: RenderedPersonParts, b: RenderedPersonParts, o: ResolvedOptions): string {
  const t = getSpaceTokens(o.output);
  const sameLast = normalizeCompareKey(a.lastText) != null && normalizeCompareKey(a.lastText) === normalizeCompareKey(b.lastText);
  const samePrefix = normalizeCompareKey(a.prefixText) != null && normalizeCompareKey(a.prefixText) === normalizeCompareKey(b.prefixText);
  const sameSuffix = normalizeCompareKey(a.suffixText) != null && normalizeCompareKey(a.suffixText) === normalizeCompareKey(b.suffixText);

  // Only apply couple compression patterns for given-family order.
  if (o.order !== 'given-family') {
    return `${a.fullText} ${o.conjunction} ${b.fullText}`;
  }

  const shareLast = shouldShare(o.shareLastName, sameLast);
  const sharePrefix = shouldShare(o.sharePrefix, samePrefix);
  const shareSuffix = shouldShare(o.shareSuffix, sameSuffix);

  // Pattern A — shared last, prefixes omitted
  if (shareLast && !a.prefixText && !b.prefixText && a.givenText && b.givenText && a.lastText) {
    const glue = boundarySpace('givenToLast', o, t);
    let result = `${a.givenText} ${o.conjunction} ${b.givenText}${glue}${a.lastText}`;
    if (shareSuffix && a.suffixText) {
      result += `,${boundarySpace('commaSpace', o, t)}${a.suffixText}`;
    }
    return result;
  }

  // Pattern B — shared last, prefixes included
  if (shareLast && a.lastText && a.givenText && b.givenText && a.prefixText && b.prefixText) {
    if (sharePrefix && samePrefix) {
      const prefixGlue = boundarySpace('prefixToNext', o, t);
      const lastGlue = boundarySpace('givenToLast', o, t);
      let result = `${a.prefixText}${prefixGlue}${a.givenText} ${o.conjunction} ${b.givenText}${lastGlue}${a.lastText}`;
      if (shareSuffix && a.suffixText) {
        result += `,${boundarySpace('commaSpace', o, t)}${a.suffixText}`;
      }
      return result;
    }

    // classic-style deterministic output for differing prefixes
    const lastGlue = boundarySpace('givenToLast', o, t);
    const prefix2Glue = boundarySpace('prefixToNext', o, t);
    // Deterministic “Mr. and Mrs. John and Mary Smith” ordering as specified.
    // Note: prefix1 is NOT glued to the conjunction; prefix2 is glued to given1.
    let result = `${a.prefixText} ${o.conjunction} ${b.prefixText}${prefix2Glue}${a.givenText} ${o.conjunction} ${b.givenText}${lastGlue}${a.lastText}`;
    if (shareSuffix && a.suffixText) {
      result += `,${boundarySpace('commaSpace', o, t)}${a.suffixText}`;
    }
    return result;
  }

  // Pattern C — fallback to full names
  return `${a.fullText} ${o.conjunction} ${b.fullText}`;
}

/**
 * Public formatting entry point (single name or array of names).
 */
export function formatName(
  input: string | ParsedName | Array<string | ParsedName>,
  options?: NameFormatOptions
): string {
  const o = resolveOptions(options);

  if (Array.isArray(input)) {
    if (o.join === 'none') {
      throw new Error('formatName: array input requires options.join !== "none"');
    }

    const parsedPeople = input.map(ensureParsed);
    if (o.join === 'list' || parsedPeople.length !== 2) {
      const rendered = parsedPeople.map(p => renderSingle(p, { ...o, join: 'none' }).fullText);
      return joinList(rendered, o);
    }

    // couple (length === 2)
    const [p1, p2] = parsedPeople;
    const r1 = renderSingle(p1, { ...o, join: 'none' });
    const r2 = renderSingle(p2, { ...o, join: 'none' });
    return joinCouple(r1, r2, o);
  }

  const parsed = ensureParsed(input);
  return renderSingle(parsed, o).fullText;
}
