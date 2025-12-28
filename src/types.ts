/**
 * Represents a person's name broken down into its component parts
 */
export interface ParsedName {
  prefix?: string;
  first?: string;
  middle?: string;
  last?: string;
  suffix?: string;
  nickname?: string;
}

export type NamePreset =
  | 'display'
  | 'informal'
  | 'formalFull'
  | 'formalShort'
  | 'alphabetical'
  | 'initialed'
  | 'firstOnly'
  | 'preferredFirst'
  | 'preferredDisplay';

export type NameFormatOptions = {
  // High-level preset
  preset?: NamePreset; // default: "display"

  // Locale hint (reserved; not used yet)
  locale?: string | string[];

  // Output target
  output?: 'text' | 'html'; // default: "text"

  // Typography level (spaces + punctuation micro-rules)
  typography?: 'plain' | 'ui' | 'fine'; // default: "ui"

  // Line-break control
  noBreak?: 'none' | 'smart' | 'all'; // default: "smart"

  // Array rendering
  join?: 'none' | 'list' | 'couple'; // default: "none"
  conjunction?: 'and' | '&' | string; // default: "and"
  oxfordComma?: boolean; // default: true

  // Couple/list sharing/compression rules
  shareLastName?: 'auto' | 'never' | 'whenSame'; // default: "whenSame"
  sharePrefix?: 'auto' | 'never' | 'whenSame'; // default: "auto"
  shareSuffix?: 'auto' | 'never' | 'whenSame'; // default: "auto"

  // Explicit overrides for core parts
  prefer?: 'auto' | 'nickname' | 'first'; // default: "auto"
  middle?: 'full' | 'initial' | 'none'; // default varies by preset
  prefix?: 'include' | 'omit' | 'auto'; // default varies by preset
  suffix?: 'include' | 'omit' | 'auto'; // default varies by preset
  order?: 'given-family' | 'family-given' | 'auto'; // default: "given-family"
};

