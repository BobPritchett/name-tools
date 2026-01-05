import { parsePersonName } from './parsers';
import type {
  NameFormatOptions,
  NamePreset,
  ParsedName,
  ParsedNameEntity,
  PersonName as PersonNameEntity,
  OrganizationName,
  FamilyName,
  CompoundName,
  UnknownName,
  RejectedName,
} from './types';

// Type for any input that formatName can accept
type FormatInput = string | ParsedName | ParsedNameEntity;

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
    | 'prefixForm'
    | 'suffixForm'
    | 'capitalization'
    | 'punctuation'
    | 'apostrophes'
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

    prefixForm: options?.prefixForm ?? 'short',
    suffixForm: options?.suffixForm ?? 'short',
    capitalization: options?.capitalization ?? 'canonical',
    punctuation: options?.punctuation ?? 'canonical',
    apostrophes: options?.apostrophes ?? 'canonical',
  };
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

function resolvePrefix(parsed: ParsedName, prefixMode: ResolvedOptions['prefix'], o: ResolvedOptions): string | undefined {
  if (prefixMode === 'omit') return undefined;
  const renderedFromTokens = renderAffixTokens(parsed.prefixTokens, 'prefix', o);
  if (renderedFromTokens) return renderedFromTokens;

  const prefix = parsed.prefix ? normalizeCollapseSpaces(parsed.prefix) : undefined;
  if (!prefix) return undefined;
  if (prefixMode === 'include') return prefix;
  // auto: treat as include only for presets that requested it via defaults (resolved already)
  return prefix;
}

function resolveLast(parsed: ParsedName): string | undefined {
  if (parsed.last == null) return undefined;
  const last = normalizeTrim(parsed.last);
  return last.length > 0 ? last : undefined;
}

function resolveSuffix(parsed: ParsedName, suffixMode: ResolvedOptions['suffix'], o: ResolvedOptions): string | undefined {
  const suffix = parsed.suffix ? normalizeCollapseSpaces(parsed.suffix) : undefined;
  if (suffixMode === 'omit') return undefined;

  if (suffixMode === 'include') {
    return renderAffixTokens(parsed.suffixTokens, 'suffix', o) ?? suffix;
  }

  // auto: preserve full suffix tail (credentials/degrees included), while still allowing canonical rendering.
  if (parsed.suffixTokens && parsed.suffixTokens.length > 0) {
    return renderAffixTokens(parsed.suffixTokens, 'suffix', o) ?? suffix;
  }
  return suffix;
}

function applyPunctuation(value: string, mode: ResolvedOptions['punctuation']): string {
  if (mode === 'strip') return value.replace(/\./g, '');
  return value;
}

function applyApostrophes(value: string, mode: ResolvedOptions['apostrophes']): string {
  if (mode === 'ascii') return value.replace(/[\u2019\u2018\u02BC]/g, "'");
  // canonical/preserve: canonical data may already contain ’; preserve handled upstream by choosing input
  return value;
}

function applyCapitalization(value: string, mode: ResolvedOptions['capitalization']): string {
  if (mode === 'lower') return value.toLowerCase();
  if (mode === 'upper') return value.toUpperCase();
  return value;
}

function renderAffixTokens(tokens: ParsedName['prefixTokens'], ctx: 'prefix', o: ResolvedOptions): string | undefined;
function renderAffixTokens(tokens: ParsedName['suffixTokens'], ctx: 'suffix', o: ResolvedOptions): string | undefined;
function renderAffixTokens(tokens: any, ctx: 'prefix' | 'suffix', o: ResolvedOptions): string | undefined {
  if (!tokens || tokens.length === 0) return undefined;

  const t = getSpaceTokens(o.output);
  const form = ctx === 'prefix' ? o.prefixForm : o.suffixForm;

  const rendered = tokens.map((t: any) => {
    // Preserve modes override the whole source token (we don't try to reconstruct dimensions).
    if (o.capitalization === 'preserve' || o.punctuation === 'preserve' || o.apostrophes === 'preserve') {
      return String(t.value ?? '').trim();
    }

    let base = String(t.value ?? '').trim();
    if (form !== 'asInput') {
      const canonical = form === 'long' ? t.canonicalLong : t.canonicalShort;
      if (canonical) base = canonical;
    }

    base = applyApostrophes(base, o.apostrophes);
    base = applyPunctuation(base, o.punctuation);
    base = applyCapitalization(base, o.capitalization);
    return base.trim();
  }).filter((s: string) => s.length > 0);

  if (rendered.length === 0) return undefined;
  if (ctx === 'suffix') {
    const commaSep = ',' + boundarySpace('commaSpace', o, t);
    return rendered.join(commaSep);
  }
  return rendered.join(' ');
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

  const prefixText = resolvePrefix(parsed, o.prefix, o);
  const lastText = resolveLast(parsed);
  const suffixText = resolveSuffix(parsed, o.suffix, o);

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

// =============================================================================
// ENTITY TYPE DETECTION AND FORMATTING
// =============================================================================

/**
 * Check if input is a ParsedNameEntity (has 'kind' property)
 */
function isParsedNameEntity(input: unknown): input is ParsedNameEntity {
  return (
    typeof input === 'object' &&
    input !== null &&
    'kind' in input &&
    typeof (input as ParsedNameEntity).kind === 'string'
  );
}

/**
 * Convert a PersonNameEntity to legacy ParsedName format
 */
function personEntityToLegacy(entity: PersonNameEntity): ParsedName {
  const result: ParsedName = {};
  if (entity.honorific) result.prefix = entity.honorific;
  if (entity.given) result.first = entity.given;
  if (entity.middle) result.middle = entity.middle;
  if (entity.family) result.last = entity.family;
  if (entity.suffix) result.suffix = entity.suffix;
  if (entity.nickname) result.nickname = entity.nickname;
  return result;
}

/**
 * Format an organization name based on preset
 */
function formatOrganization(org: OrganizationName, o: ResolvedOptions): string {
  const t = getSpaceTokens(o.output);

  // Get the full name from meta.raw or construct from parts
  const fullName = org.meta.raw.trim();
  const baseName = org.baseName;
  const legalSuffix = org.legalSuffixRaw;

  switch (o.preset) {
    case 'informal':
    case 'firstOnly':
    case 'preferredFirst':
      // Short/informal: just the base name without legal suffix
      return baseName;

    case 'formalShort':
      // Short formal: base name only
      return baseName;

    case 'alphabetical':
      // For sorting: base name, then legal suffix
      if (legalSuffix) {
        return `${baseName},${boundarySpace('commaSpace', o, t)}${legalSuffix}`;
      }
      return baseName;

    case 'initialed':
      // Initials don't make sense for orgs, return base name
      return baseName;

    case 'display':
    case 'preferredDisplay':
    case 'formalFull':
    default:
      // Full name as written
      return fullName;
  }
}

/**
 * Format a family/household name based on preset
 */
function formatFamily(family: FamilyName, o: ResolvedOptions): string {
  const t = getSpaceTokens(o.output);
  const familyName = family.familyName;
  const article = family.article;
  const familyWord = family.familyWord;
  const style = family.style;

  switch (o.preset) {
    case 'informal':
    case 'firstOnly':
    case 'preferredFirst':
      // Just the family name
      if (style === 'pluralSurname') {
        return `The${boundarySpace('prefixToNext', o, t)}${familyName}`;
      }
      return familyName;

    case 'formalShort':
      // Short: The Smiths or Smith Family
      if (style === 'pluralSurname') {
        return `The${boundarySpace('prefixToNext', o, t)}${familyName}`;
      }
      return `${familyName}${boundarySpace('givenToLast', o, t)}${familyWord || 'Family'}`;

    case 'alphabetical':
      // For sorting: family name first
      if (familyWord) {
        return `${familyName}${boundarySpace('givenToLast', o, t)}${familyWord}`;
      }
      return familyName;

    case 'initialed':
      // Initials don't make sense for families
      return familyName;

    case 'display':
    case 'preferredDisplay':
    case 'formalFull':
    default:
      // Full form: "The Smith Family" or "The Smiths"
      if (article && familyWord) {
        return `${article}${boundarySpace('prefixToNext', o, t)}${familyName}${boundarySpace('givenToLast', o, t)}${familyWord}`;
      }
      if (article) {
        return `${article}${boundarySpace('prefixToNext', o, t)}${familyName}`;
      }
      if (familyWord) {
        return `${familyName}${boundarySpace('givenToLast', o, t)}${familyWord}`;
      }
      return familyName;
  }
}

/**
 * Format a compound name (multiple people) based on preset
 */
function formatCompound(compound: CompoundName, o: ResolvedOptions): string {
  const t = getSpaceTokens(o.output);
  const connector = compound.connector === '&' ? '&' :
                    compound.connector === '+' ? '+' :
                    compound.connector === 'et' ? 'et' : 'and';
  const sharedFamily = compound.sharedFamily;

  // Format each member
  const formattedMembers = compound.members.map(member => {
    if (member.kind === 'person') {
      const parsed = personEntityToLegacy(member);
      // For compound with shared family, omit family from individual rendering
      if (sharedFamily && o.preset !== 'alphabetical') {
        const withoutFamily = { ...parsed, last: undefined };
        return renderSingle(withoutFamily, o).fullText;
      }
      return renderSingle(parsed, o).fullText;
    }
    // Unknown member
    return (member as UnknownName).text || '';
  }).filter(Boolean);

  if (formattedMembers.length === 0) {
    return compound.meta.raw;
  }

  // Join members
  const joined = formattedMembers.join(` ${connector} `);

  // Append shared family if present and not alphabetical
  if (sharedFamily && o.preset !== 'alphabetical') {
    return `${joined}${boundarySpace('givenToLast', o, t)}${sharedFamily}`;
  }

  return joined;
}

/**
 * Format an unknown entity
 */
function formatUnknown(unknown: UnknownName, _o: ResolvedOptions): string {
  return unknown.text || unknown.meta.raw || '';
}

/**
 * Format a rejected entity (return raw input)
 */
function formatRejected(rejected: RejectedName, _o: ResolvedOptions): string {
  return rejected.meta.raw || '';
}

/**
 * Format any ParsedNameEntity based on its kind
 */
function formatEntity(entity: ParsedNameEntity, o: ResolvedOptions): string {
  switch (entity.kind) {
    case 'person':
      return renderSingle(personEntityToLegacy(entity as PersonNameEntity), o).fullText;
    case 'organization':
      return formatOrganization(entity as OrganizationName, o);
    case 'family':
    case 'household':
      return formatFamily(entity as FamilyName, o);
    case 'compound':
      return formatCompound(entity as CompoundName, o);
    case 'unknown':
      return formatUnknown(entity as UnknownName, o);
    case 'rejected':
      return formatRejected(entity as RejectedName, o);
    default:
      return (entity as any).meta?.raw || '';
  }
}

/**
 * Ensure input is converted to ParsedName (legacy format) for person rendering
 */
function ensureParsedLegacy(input: FormatInput): ParsedName {
  if (typeof input === 'string') {
    return parsePersonName(input);
  }
  if (isParsedNameEntity(input)) {
    if (input.kind === 'person') {
      return personEntityToLegacy(input as PersonNameEntity);
    }
    // For non-person entities, try to parse the raw string
    return parsePersonName(input.meta.raw);
  }
  return input as ParsedName;
}

/**
 * Public formatting entry point (single name or array of names).
 *
 * Accepts:
 * - string: Will be parsed as a person name
 * - ParsedName: Legacy parsed name object
 * - ParsedNameEntity: Entity from parseName() (person, organization, family, compound, etc.)
 * - Array of any of the above
 */
export function formatName(
  input: FormatInput | Array<FormatInput>,
  options?: NameFormatOptions
): string {
  const o = resolveOptions(options);

  if (Array.isArray(input)) {
    if (o.join === 'none') {
      throw new Error('formatName: array input requires options.join !== "none"');
    }

    // Format each item, respecting entity types
    const formatItem = (item: FormatInput): string => {
      if (isParsedNameEntity(item)) {
        return formatEntity(item, o);
      }
      return renderSingle(ensureParsedLegacy(item), o).fullText;
    };

    if (o.join === 'list' || input.length !== 2) {
      const rendered = input.map(formatItem);
      return joinList(rendered, o);
    }

    // couple (length === 2) - use legacy rendering for couple compression
    const parsedPeople = input.map(ensureParsedLegacy);
    const [p1, p2] = parsedPeople;
    const r1 = renderSingle(p1, { ...o, join: 'none' });
    const r2 = renderSingle(p2, { ...o, join: 'none' });
    return joinCouple(r1, r2, o);
  }

  // Single input - check if it's a ParsedNameEntity
  if (isParsedNameEntity(input)) {
    return formatEntity(input, o);
  }

  // Legacy ParsedName or string
  const parsed = ensureParsedLegacy(input);
  return renderSingle(parsed, o).fullText;
}
