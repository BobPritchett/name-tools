Below is a complete “drop-in” package of:

1. **TypeScript types** (`ParsedNameEntity` union + supporting structs)
2. **Detection priority matrix** (org > compound > family > person > unknown) with confidence + reasons
3. **Regex + token heuristics** (normalization, classification, minimal parsing) aligned with “prefix/suffix” style approaches
4. **A 90-case test fixture list** (realistic junk, edge cases, ambiguity)

---

## 1) TypeScript types

```ts
// name-types.ts

export type NameKind =
  | "person"
  | "family"
  | "household"
  | "compound"
  | "organization"
  | "unknown"
  | "rejected";

export type Confidence = 0 | 0.25 | 0.5 | 0.75 | 1;

export interface ParseMeta {
  raw: string; // exact input
  normalized: string; // normalization output used for parsing
  confidence: Confidence; // overall confidence in classification
  reasons: string[]; // stable reason codes (see below)
  warnings?: string[]; // human-readable warnings
  locale?: string; // optional; default "en"
}

export interface BaseEntity {
  kind: NameKind;
  meta: ParseMeta;
}

/** PERSON (single individual) */
export interface PersonName extends BaseEntity {
  kind: "person";
  honorific?: string; // Dr., Mr., Ms., Rev., etc.
  given?: string; // first / given
  middle?: string; // middle(s)
  family?: string; // last / surname
  suffix?: string; // Jr., III, PhD (if you keep these here)
  nickname?: string; // quoted / parens e.g. Bob "Rocket"
  particles?: string[]; // von, de, van, etc. if you support
  rawTokens?: string[]; // tokenization debug
}

/** FAMILY / HOUSEHOLD */
export type FamilyStyle = "familyWord" | "pluralSurname";

export interface FamilyName extends BaseEntity {
  kind: "family" | "household";
  article?: "The"; // present if explicitly used
  familyName: string; // surname/root "Smith"
  style: FamilyStyle; // "Smith Family" vs "The Smiths"
  familyWord?: "Family" | "Household";
}

/** COMPOUND (multi-person in one field) */
export interface CompoundName extends BaseEntity {
  kind: "compound";
  connector: "&" | "and" | "+" | "et" | "unknown";
  members: Array<PersonName | UnknownName>; // parse members when possible
  sharedFamily?: string; // if inferred (e.g. Bob & Mary Smith)
}

/** ORGANIZATION / INSTITUTION */
export type LegalForm =
  | "Inc"
  | "Incorporated"
  | "Corp"
  | "Corporation"
  | "LLC"
  | "LLP"
  | "LP"
  | "Ltd"
  | "Limited"
  | "PLC"
  | "GmbH"
  | "S.A."
  | "SAS"
  | "BV"
  | "AG"
  | "Oy"
  | "SRL"
  | "SpA"
  | "Trust"
  | "TrustCompany"
  | "Bank"
  | "CreditUnion"
  | "Foundation"
  | "University"
  | "Hospital"
  | "Church"
  | "Government"
  | "Nonprofit"
  | "UnknownLegalForm";

export interface OrganizationName extends BaseEntity {
  kind: "organization";
  baseName: string; // without legal suffix when separable
  legalForm?: LegalForm;
  legalSuffixRaw?: string; // e.g. "L.L.C.", "Inc.", "N.A."
  qualifiers?: string[]; // "of", "for", "at", etc. or extra fragments
  aka?: string[]; // optional, if you detect d/b/a
}

/** UNKNOWN */
export interface UnknownName extends BaseEntity {
  kind: "unknown";
  text: string; // best-effort normalized string
  guess?: Exclude<NameKind, "unknown" | "rejected">;
}

/** STRICT MODE REJECTION (optional) */
export interface RejectedName extends BaseEntity {
  kind: "rejected";
  rejectedAs: Exclude<NameKind, "rejected">;
}

export type ParsedNameEntity =
  | PersonName
  | FamilyName
  | CompoundName
  | OrganizationName
  | UnknownName
  | RejectedName;

/** Stable reason codes (keep these machine-friendly) */
export type ReasonCode =
  | "ORG_LEGAL_SUFFIX"
  | "ORG_INSTITUTION_PHRASE"
  | "ORG_COMMA_LEGAL"
  | "ORG_DBA"
  | "ORG_CARE_OF"
  | "FAMILY_ENDS_WITH_FAMILY"
  | "FAMILY_STARTS_WITH_THE"
  | "FAMILY_PLURAL_SURNAME"
  | "FAMILY_HAS_FAMILY_WORD"
  | "COMPOUND_CONNECTOR"
  | "COMPOUND_MULTIPLE_GIVEN"
  | "PERSON_HAS_GIVEN_FAMILY_PATTERN"
  | "AMBIGUOUS_THE_PLURAL"
  | "AMBIGUOUS_SHORT_NAME"
  | "HAS_PUNCTUATION_SIGNALS"
  | "HAS_PAREN_ANNOTATION"
  | "HAS_ALLCAPS"
  | "HAS_EMAIL_OR_HANDLE"
  | "HAS_ROLE_OR_TITLE";
```

---

## 2) Detection priority matrix (and how to score)

This is the “classification first” approach. The key idea: **some signals should override others**.

### Priority order (recommended)

1. **Organization** (strong legal/institution signals)
2. **Compound** (multiple people in one string)
3. **Family/Household**
4. **Person**
5. **Unknown**

### Override rules

- If **legal suffix / institution phrase** present → classify as **organization**, even if it contains “Family” or plural surname.

  - `Smith Family Trust` → organization
  - `The Smiths, LLC` → organization

- If **compound connector** and at least one plausible given name → **compound**, unless legal/institution signals are present.

  - `Bob & Mary Smith` → compound
  - `Research & Development LLC` → organization (org beats compound)

- Family classification should require **strong cues** and **absence of given names**.

  - `The Smiths` can be ambiguous (band) → lower confidence unless context is “mailing label”-like.

### Suggested confidence scoring

Start at `0.5` then add/subtract:

**Organization**

- +0.5 if legal suffix (`LLC`, `Inc.`, `PLC`, etc.) near end
- +0.25 if comma-legal pattern (`Acme, Inc.`)
- +0.25 if institution phrase (`Bank of`, `Trust Company`, `Credit Union`)
- -0.25 if string looks like pure person format (`Given Family`) and no other org signals

**Compound**

- +0.5 if connector (`&`, `and`) between name-like tokens
- +0.25 if both sides start with capitalized tokens
- -0.5 if trailing legal suffix exists (then org)

**Family**

- +0.5 if ends with `Family`/`Household`
- +0.25 if starts with `The `
- +0.25 if plural-surname morphology (`Joneses`, `Foxes`) and no given name tokens
- -0.25 if could be famous “The Xs” band-like pattern (optional ambiguity rule)

**Person**

- +0.5 if matches typical `Given Family` or `Family, Given` formats
- -0.25 if contains organization keywords (`Foundation`, `Bank`, `University`) without person tokens

### Reason codes

Attach reason codes from the signals that fired (from the `ReasonCode` union). Those become your audit trail, and they’re great for tests.

---

## 3) Regex + token heuristics (normalization + classification)

This is a pragmatic classifier. It’s intentionally conservative and focuses on detection, not perfect parsing.

### 3.1 Normalization steps (recommended)

```ts
// normalize.ts (sketch)

export function normalizeNameInput(raw: string): string {
  let s = raw ?? "";
  s = s.trim();

  // Collapse whitespace
  s = s.replace(/\s+/g, " ");

  // Normalize common connector variants
  s = s.replace(/\s*&\s*/g, " & ");
  s = s.replace(/\s*\+\s*/g, " + ");

  // Normalize fancy apostrophes/quotes
  s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

  // Remove trailing commas/spaces
  s = s.replace(/[,\s]+$/g, "");

  return s;
}
```

### 3.2 Tokenization helpers

```ts
export function tokenize(s: string): string[] {
  // Keep words + some punctuation tokens that matter
  // You can refine this to match your library's tokenizer
  return s.split(/\s+/g).filter(Boolean);
}

export function hasAny(tokens: string[], set: Set<string>): boolean {
  return tokens.some((t) => set.has(t.toLowerCase()));
}
```

### 3.3 Organization detection

#### Legal suffix patterns (near end)

```ts
const ORG_SUFFIX_RE = new RegExp(
  String.raw`(?:^|[\s,])` +
    String.raw`(` +
    String.raw`inc\.?|incorporated|corp\.?|corporation|llc|l\.l\.c\.|llp|l\.l\.p\.|lp|l\.p\.|ltd\.?|limited|plc|gmbh|s\.a\.|sas|bv|ag|oy|srl|spa|` +
    String.raw`trust|foundation` +
    String.raw`)` +
    String.raw`\.?$`,
  "i"
);

// Comma-legal form: "Acme, Inc."
const ORG_COMMA_LEGAL_RE =
  /,\s*(inc\.?|llc|l\.l\.c\.|corp\.?|ltd\.?|plc|gmbh|s\.a\.)\.?$/i;
```

#### Institution phrase patterns

```ts
const ORG_PHRASE_RE = new RegExp(
  String.raw`\b(` +
    String.raw`bank of|trust company|credit union|university|hospital|church|ministry|department of|city of|county of|state of|government of` +
    String.raw`)\b`,
  "i"
);

// "Bank" or "Trust" alone is weaker (can be a person name in rare cases)
const ORG_WEAK_WORD_RE =
  /\b(bank|trust|holdings|partners|group|company|co\.|associates)\b/i;
```

#### d/b/a and c/o patterns (often org-ish but not always)

```ts
const DBA_RE = /\b(d\/b\/a|doing business as|aka)\b/i;
const CARE_OF_RE = /\b(c\/o|care of)\b/i;
```

**Classification rule (org):**

- If `ORG_SUFFIX_RE` or `ORG_COMMA_LEGAL_RE` matches → **organization** with high confidence.
- Else if `ORG_PHRASE_RE` matches → **organization** with medium-high confidence.
- Else if `ORG_WEAK_WORD_RE` matches → **organization** with medium confidence _unless person signals dominate_.

### 3.4 Compound detection

```ts
const COMPOUND_CONNECTOR_RE = /\b(&|and|\+|et)\b/i;

// Very rough: “looks like name token”
const NAMEISH_TOKEN_RE = /^[A-Z][a-z]+(?:['-][A-Z]?[a-z]+)*$/;

export function looksLikeCompound(tokens: string[]): boolean {
  const idx = tokens.findIndex((t) => COMPOUND_CONNECTOR_RE.test(t));
  if (idx <= 0 || idx >= tokens.length - 1) return false;

  // Ensure at least one name-ish token on both sides
  const left = tokens.slice(0, idx).some((t) => NAMEISH_TOKEN_RE.test(t));
  const right = tokens.slice(idx + 1).some((t) => NAMEISH_TOKEN_RE.test(t));
  return left && right;
}
```

**Override:** If org-strong signals exist, classify as org even if compound connector exists (`Research & Development, LLC`).

### 3.5 Family/Household detection

```ts
const FAMILY_WORD_RE = /\b(family|household)\b/i;

// Ends with "Family"/"Household"
const FAMILY_END_RE = /\b(family|household)\s*$/i;

// Starts with "The"
const THE_START_RE = /^the\s+/i;

// Plural surname heuristic at end: Smiths, Joneses, Foxes, Churches
const PLURAL_SURNAME_END_RE = /\b([A-Z][a-z]+)(s|es)\s*$/;

// Avoid family if obvious given name present (very conservative list)
const GIVENISH_RE = /^[A-Z][a-z]+$/;

// Optional “band ambiguity” heuristic for "The Xs" without family word
export function isAmbiguousThePlural(normalized: string): boolean {
  return (
    THE_START_RE.test(normalized) &&
    PLURAL_SURNAME_END_RE.test(normalized) &&
    !FAMILY_WORD_RE.test(normalized)
  );
}
```

**Family rule:**

- If `FAMILY_END_RE` matches and no strong org signals → family/household (strong).
- Else if starts with `The` and plural-surname end and **no given-name tokens** and no strong org → family (medium).
- Else unknown/person.

**Given name suppression for family:**

- If tokens contain 2+ `GIVENISH_RE` tokens (or common honorifics) → don’t classify as family unless `Family` word appears.

### 3.6 Person vs unknown (fallback)

Person detection is your existing name parser. Classification layer can do a simple “looks like a person” check before invoking full parsing:

- contains honorifics (`Mr`, `Mrs`, `Ms`, `Dr`, etc.)
- matches `Last, First` or `First Last`
- has suffix `Jr`, `III`, etc.

If none of the entity classifiers fire strongly, return `unknown` with `guess: "person"` if it looks like a person-ish two-token string.

---

## 4) Suggested classifier skeleton (ties it together)

```ts
// classify.ts (sketch)

import type {
  ParsedNameEntity,
  ParseMeta,
  ReasonCode,
  Confidence,
} from "./name-types";
import { normalizeNameInput, tokenize } from "./normalize";

export interface ClassifyOptions {
  locale?: string; // default "en"
  strictKind?: "person"; // if set, reject non-person
}

export function classifyName(
  raw: string,
  opts: ClassifyOptions = {}
): ParsedNameEntity {
  const normalized = normalizeNameInput(raw);
  const tokens = tokenize(normalized);
  const reasons: ReasonCode[] = [];

  const metaBase: Omit<ParseMeta, "confidence" | "reasons"> = {
    raw,
    normalized,
    locale: opts.locale ?? "en",
  };

  // 1) Organization strong
  const orgStrong =
    ORG_COMMA_LEGAL_RE.test(normalized) ||
    ORG_SUFFIX_RE.test(normalized) ||
    ORG_PHRASE_RE.test(normalized) ||
    DBA_RE.test(normalized);

  if (orgStrong) {
    if (ORG_COMMA_LEGAL_RE.test(normalized) || ORG_SUFFIX_RE.test(normalized))
      reasons.push("ORG_LEGAL_SUFFIX", "ORG_COMMA_LEGAL");
    if (ORG_PHRASE_RE.test(normalized)) reasons.push("ORG_INSTITUTION_PHRASE");
    if (DBA_RE.test(normalized)) reasons.push("ORG_DBA");
    if (CARE_OF_RE.test(normalized)) reasons.push("ORG_CARE_OF");

    const entity = makeOrganization(normalized, reasons, metaBase);
    return applyStrict(entity, opts);
  }

  // 2) Compound
  if (looksLikeCompound(tokens)) {
    reasons.push("COMPOUND_CONNECTOR");
    const entity = makeCompound(normalized, reasons, metaBase);
    return applyStrict(entity, opts);
  }

  // 3) Family/Household
  const familyStrong = FAMILY_END_RE.test(normalized);
  const familyMedium =
    THE_START_RE.test(normalized) &&
    PLURAL_SURNAME_END_RE.test(normalized) &&
    !FAMILY_WORD_RE.test(normalized);

  if (familyStrong || familyMedium) {
    if (familyStrong)
      reasons.push("FAMILY_ENDS_WITH_FAMILY", "FAMILY_HAS_FAMILY_WORD");
    if (THE_START_RE.test(normalized)) reasons.push("FAMILY_STARTS_WITH_THE");
    if (PLURAL_SURNAME_END_RE.test(normalized))
      reasons.push("FAMILY_PLURAL_SURNAME");
    if (isAmbiguousThePlural(normalized)) reasons.push("AMBIGUOUS_THE_PLURAL");

    const entity = makeFamily(normalized, reasons, metaBase);
    return applyStrict(entity, opts);
  }

  // 4) Person-ish fallback (you would call your existing person parser here)
  if (looksPersonish(normalized, tokens)) {
    reasons.push("PERSON_HAS_GIVEN_FAMILY_PATTERN");
    const entity = makePersonPlaceholder(normalized, reasons, metaBase); // replace w/ real parse
    return applyStrict(entity, opts);
  }

  // 5) Unknown
  const unknown: ParsedNameEntity = {
    kind: "unknown",
    text: normalized,
    guess: orgWeakGuess(normalized),
    meta: { ...metaBase, confidence: 0.25, reasons },
  };
  return applyStrict(unknown, opts);
}

function applyStrict(
  entity: ParsedNameEntity,
  opts: ClassifyOptions
): ParsedNameEntity {
  if (opts.strictKind === "person" && entity.kind !== "person") {
    return {
      kind: "rejected",
      rejectedAs: entity.kind === "rejected" ? "unknown" : (entity.kind as any),
      meta: {
        ...entity.meta,
        confidence: 1,
        reasons: [...entity.meta.reasons, "HAS_ROLE_OR_TITLE"],
      },
    };
  }
  return entity;
}
```

(Helpers `makeOrganization`, `makeFamily`, etc. just fill out the fields and compute confidence from reasons; keep them small and testable.)

---

## 5) Test fixture list (90 cases)

Format: `{ input, expectedKind, notes }`
You can also add `expectedReasons` once your reason codes are stable.

```ts
// fixtures.ts

export const NAME_FIXTURES: Array<{
  input: string;
  expectedKind:
    | "person"
    | "family"
    | "household"
    | "compound"
    | "organization"
    | "unknown";
  notes?: string;
}> = [
  // --- FAMILY / HOUSEHOLD (strong cues)
  { input: "The Smith Family", expectedKind: "family" },
  { input: "Smith Family", expectedKind: "family" },
  { input: "THE SMITH FAMILY", expectedKind: "family", notes: "all caps" },
  { input: "The Johnson Family", expectedKind: "family" },
  { input: "The Garcia Household", expectedKind: "household" },
  { input: "Garcia Household", expectedKind: "household" },
  { input: "The O'Neal Family", expectedKind: "family" },
  { input: "The Van Buren Family", expectedKind: "family" },
  { input: "The De la Cruz Family", expectedKind: "family" },
  {
    input: "The Smiths",
    expectedKind: "family",
    notes: "plural surname; potentially ambiguous band",
  },
  { input: "The Joneses", expectedKind: "family" },
  { input: "The Foxes", expectedKind: "family" },
  { input: "The Churches", expectedKind: "family" },
  {
    input: "Smiths",
    expectedKind: "unknown",
    notes: "plural surname without 'The' or family word; ambiguous",
  },
  {
    input: "Smith Family & Friends",
    expectedKind: "unknown",
    notes: "family-ish but extra; could be group label",
  },

  // --- COMPOUND (multi-person)
  { input: "Bob & Mary Smith", expectedKind: "compound" },
  { input: "Bob and Mary Smith", expectedKind: "compound" },
  { input: "John & Jane Doe", expectedKind: "compound" },
  {
    input: "Dr. and Mrs. John Smith",
    expectedKind: "compound",
    notes: "traditional couple format",
  },
  { input: "Mr & Mrs Smith", expectedKind: "compound" },
  { input: "Bob + Mary Smith", expectedKind: "compound" },
  {
    input: "John et Marie Dupont",
    expectedKind: "compound",
    notes: "connector 'et' (if supported)",
  },
  {
    input: "Bob & Mary",
    expectedKind: "compound",
    notes: "no shared family name",
  },
  { input: "Alice Smith & Bob Jones", expectedKind: "compound" },

  // --- ORGANIZATIONS (legal suffix: strong)
  { input: "Acme, Inc.", expectedKind: "organization" },
  { input: "Acme Inc", expectedKind: "organization" },
  { input: "Acme Incorporated", expectedKind: "organization" },
  { input: "Acme Corp.", expectedKind: "organization" },
  { input: "Acme Corporation", expectedKind: "organization" },
  { input: "Acme LLC", expectedKind: "organization" },
  { input: "Acme, LLC", expectedKind: "organization" },
  { input: "Acme L.L.C.", expectedKind: "organization" },
  { input: "Acme Ltd.", expectedKind: "organization" },
  { input: "Acme Limited", expectedKind: "organization" },
  { input: "Acme PLC", expectedKind: "organization" },
  { input: "Acme LLP", expectedKind: "organization" },
  { input: "Acme LP", expectedKind: "organization" },
  { input: "Müller GmbH", expectedKind: "organization" },
  { input: "Example S.A.", expectedKind: "organization" },

  // --- ORGANIZATIONS (institutions & phrases)
  { input: "Bank of Springfield", expectedKind: "organization" },
  { input: "First National Bank", expectedKind: "organization" },
  { input: "Springfield Trust Company", expectedKind: "organization" },
  { input: "Hometown Credit Union", expectedKind: "organization" },
  { input: "University of Arizona", expectedKind: "organization" },
  { input: "St. Mary's Hospital", expectedKind: "organization" },
  { input: "City of Phoenix", expectedKind: "organization" },
  { input: "Department of Revenue", expectedKind: "organization" },

  // --- ORGANIZATIONS (trust/foundation/nonprofit)
  { input: "Smith Family Trust", expectedKind: "organization" },
  { input: "The Smith Family Trust", expectedKind: "organization" },
  { input: "Johnson Charitable Foundation", expectedKind: "organization" },
  { input: "The Brown Foundation", expectedKind: "organization" },
  {
    input: "Smith Family Trust, LLC",
    expectedKind: "organization",
    notes: "org suffix beats family cues",
  },

  // --- ORGANIZATIONS (d/b/a, c/o)
  { input: "Acme d/b/a Rocket Rentals", expectedKind: "organization" },
  { input: "Rocket Rentals (d/b/a Acme LLC)", expectedKind: "organization" },
  { input: "Acme LLC c/o John Smith", expectedKind: "organization" },
  { input: "Smith Family Trust c/o Jane Doe", expectedKind: "organization" },

  // --- AMBIGUOUS / UNKNOWN (should not over-classify)
  { input: "The Cure", expectedKind: "unknown", notes: "band-like" },
  {
    input: "The Smiths",
    expectedKind: "family",
    notes: "could be band; classifier may mark ambiguous but still family",
  },
  { input: "Apple", expectedKind: "unknown", notes: "could be org or word" },
  { input: "Acme", expectedKind: "unknown", notes: "org-ish but no suffix" },
  {
    input: "Research & Development",
    expectedKind: "unknown",
    notes: "compound connector but not people",
  },
  {
    input: "Research & Development LLC",
    expectedKind: "organization",
    notes: "suffix beats connector",
  },
  {
    input: "Smith & Sons",
    expectedKind: "unknown",
    notes: "org-ish phrase; no legal suffix",
  },
  { input: "Smith & Sons, LLC", expectedKind: "organization" },

  // --- PERSON (simple)
  { input: "John Smith", expectedKind: "person" },
  { input: "Jane Q. Public", expectedKind: "person" },
  { input: "Smith, John", expectedKind: "person" },
  { input: "Dr. Jane Smith", expectedKind: "person" },
  { input: "Mr. John Smith Jr.", expectedKind: "person" },
  { input: "María-José Carreño Quiñones", expectedKind: "person" },
  { input: "O'Neil, Shaquille", expectedKind: "person" },
  { input: "van Helsing, Abraham", expectedKind: "person" },

  // --- PERSON vs ORG pitfalls
  {
    input: "John Smith Trust",
    expectedKind: "organization",
    notes: "trust word near end should override person-like start",
  },
  { input: "Jane Smith Foundation", expectedKind: "organization" },
  {
    input: "The Smith Company",
    expectedKind: "organization",
    notes: "company keyword",
  },
  {
    input: "Smith Company",
    expectedKind: "organization",
    notes: "keyword; can be medium confidence",
  },

  // --- Annotations / junk commonly seen in name fields
  {
    input: "John Smith (billing)",
    expectedKind: "person",
    notes: "paren annotation",
  },
  {
    input: "The Smith Family (cabin)",
    expectedKind: "family",
    notes: "paren annotation",
  },
  { input: "Acme LLC (Accounts Payable)", expectedKind: "organization" },
  {
    input: "Bob Smith - Maintenance",
    expectedKind: "person",
    notes: "role suffix; could also be unknown depending on your parser",
  },
  {
    input: "Accounting Department",
    expectedKind: "organization",
    notes: "department phrase",
  },

  // --- Emails/handles embedded (should usually degrade confidence)
  { input: "John Smith <john@example.com>", expectedKind: "person" },
  { input: "Acme LLC <ap@acme.com>", expectedKind: "organization" },
  { input: "@acme", expectedKind: "unknown" },

  // --- Edge cases
  {
    input: "The Smith's",
    expectedKind: "unknown",
    notes: "apostrophe plural misuse; could be family",
  },
  { input: "Smith Family, Inc.", expectedKind: "organization" },
  { input: "The Johnsons, LLC", expectedKind: "organization" },
  { input: "St. John's Church", expectedKind: "organization" },
  { input: "Trust", expectedKind: "unknown", notes: "single generic token" },
  { input: "Bank", expectedKind: "unknown", notes: "single generic token" },
];
```

If you want 100+ fixtures, it’s easy to extend this with more locales/forms (BV/AG/Oy variants, more “City of …” cases, more “c/o”, more punctuation).

---

## 6) Implementation notes you’ll be glad you wrote down

- **Always keep `raw`** and store `normalized` separately. Never “correct” user input destructively.
- Treat classification reasons as **API output**, not internal debug. They become:

  - unit test anchors,
  - UI explanation (“we think this is an organization because it ends with LLC”),
  - telemetry.

- Do not rely on a massive “given name dictionary.” Use simple structural cues; be conservative.
- When ambiguous, prefer `unknown` over confidently wrong classification—_except_ where legal suffixes exist, which are extremely strong.

---

Below is the **fully revised, single, authoritative specification**, rewritten end-to-end and **explicitly incorporating reversed-name handling** (`"Smith, John, Jr."`) while preserving all prior requirements. This version is internally consistent and suitable to hand directly to an implementation LLM or use as long-term project documentation.

---

# Human Name & Recipient Parsing Specification

**People · Families · Compounds · Organizations · Email Addresses · Recipient Lists**

---

## 0. Purpose & Design Principles

This system parses **real-world, messy name input** originating from:

- Form fields
- CRM imports
- Email To/CC lines
- Legal, donor, and institutional records

Inputs may include:

- Individuals (normal or reversed)
- Couples and multi-person compounds
- Families / households
- Organizations / institutions / trusts
- Email addresses and non-email address identifiers
- Entire recipient lists copied from email clients

### Core principles

1. **Classify intent before parsing structure**
2. **Never coerce non-person entities into people**
3. **Preserve raw input**
4. **Be conservative; prefer `unknown` to confidently wrong**
5. **Separate list parsing, address parsing, and name parsing**
6. **Explicitly support reversed personal names**

---

## 1. Public API

```ts
parseName(input: string, options?): ParsedNameEntity
parseNameList(input: string, options?): ParsedRecipient[]
```

### `parseName`

- For fields expected to contain **one logical entity**
- Returns a single typed entity
- Does **not** split lists
- May return `unknown` or `rejected`

### `parseNameList`

- For pasted To/CC lines or bulk input
- Splits recipients, extracts addresses, parses each display name
- Always returns an array

---

## 2. Output Types

### 2.1 Entity Union

```ts
type ParsedNameEntity =
  | PersonName
  | FamilyName
  | CompoundName
  | OrganizationName
  | UnknownName
  | RejectedName;
```

### 2.2 Parsed Recipient

```ts
interface ParsedRecipient {
  raw: string;
  display?: ParsedNameEntity;
  email?: string;
  addressRaw?: string;
  meta: {
    confidence: 0 | 0.25 | 0.5 | 0.75 | 1;
    reasons: string[];
    warnings?: string[];
  };
}
```

**Rule:** Email and addresses are metadata, not part of name entities.

---

## 3. Mandatory Processing Pipeline

### Order is strict and MUST NOT be altered

1. Normalize input
2. _(parseNameList only)_ split recipients
3. Extract email / address
4. Classify display name
5. Parse structure within classified type
6. Assign confidence and reason codes

---

## 4. Normalization

- Trim whitespace
- Collapse repeated whitespace
- Normalize quotes (`“” → "`, `‘’ → '`)
- Normalize connector spacing (`&`, `+`)
- Preserve case
- Remove trailing commas/spaces

---

## 5. Recipient List Splitting (`parseNameList` only)

### Supported separators

- `;` (strong separator – Outlook default)
- `,` (weak separator)
- Newlines

### Splitting rules

- Track:

  - `inQuotes`
  - `inAngleBrackets`

- Split on:

  - `;` when not in quotes or angles
  - `,` only when:

    - not in quotes or angles
    - AND reversed-name detection does NOT match

- Ignore leading labels (`To:`, `Cc:`)

**Critical rule:**

> Commas do NOT imply lists if the substring matches a reversed-person pattern.

---

## 6. Email & Address Extraction (per recipient)

### Supported formats

- `John Doe <john@x.com>`
- `"Doe, John" <john@x.com>`
- `john@x.com (John Doe)`
- `John Doe [mailto:john@x.com]`
- `<SMTP:john@x.com>`
- `/O=EXCH/.../CN=John.Doe`
- `Group Name <group@org.com>`

### Extraction priority

1. `<...>` containing `@`
2. `mailto:` / `SMTP:`
3. Bare email regex
4. Parenthetical email

Normalize email:

- Strip wrappers
- Lowercase
- Remove punctuation

Remove extracted address from display string.

---

## 7. Entity Classification (Display Name Only)

### Classification priority (mandatory)

1. **Organization**
2. **Compound**
3. **Family / Household**
4. **Person** _(including reversed forms)_
5. **Unknown**

---

## 8. Organization Detection (Highest Priority)

### Strong signals (override everything)

- Legal suffixes:

  - `Inc`, `LLC`, `Ltd`, `PLC`, `Corp`, `GmbH`, `S.A.`, etc.

- Comma-legal forms (`Acme, Inc.`)
- Trust / Foundation
- Institutional phrases:

  - `Bank of`
  - `Trust Company`
  - `Credit Union`
  - `University`
  - `Hospital`
  - `Church`
  - `Department of`
  - `City of`

If any present → **Organization**, even if:

- plural surname
- `Family`
- `&`

---

## 9. Compound (Multi-Person) Detection

Signals:

- Connectors: `&`, `and`, `+`, `et`
- Name-like tokens on both sides
- Optional shared surname at end

Rules:

- Must not conflict with organization signals
- `Research & Development LLC` → organization

---

## 10. Family / Household Detection

### Strong signals

- Ends with `Family` or `Household`
- `The Smith Family`

### Medium signals

- Starts with `The`
- Ends with pluralized surname (`Smiths`, `Joneses`)
- No given-name tokens present

### Ambiguity

- `The Smiths` → family with reduced confidence
- Never classify as family if org signals exist

---

## 11. Person Detection (Including Reversed Names)

Person detection runs **only if no org/compound/family match**.

### 11.1 Forward (standard) names

- `John Smith`
- `Dr. Jane Q. Public`
- `Smith Jr., John` _(treated as reversed)_

---

### 11.2 Reversed Name Detection (Mandatory Support)

#### Canonical form

```text
<Family>, <Given> [, <Middle>] [, <Suffix>]
```

#### Valid examples

- `Smith, John`
- `Smith, John, Jr.`
- `Smith, John Q.`
- `O'Neill, Shaquille R.`
- `van Helsing, Abraham`

#### Detection rules

1. Split on commas
2. If **1–3 commas**, attempt reversed-person parse
3. Interpret:

   - Segment 1 → family
   - Segment 2 → given (+ optional middle)
   - Remaining segments → suffix (filtered by allow-list)

#### Suffix allow-list

- `Jr`, `Sr`
- `II`, `III`, `IV`
- `PhD`, `MD`, `DDS`, `Esq`

Suffix presence increases confidence.

---

### 11.3 Reversed Name Guardrails

Do **not** treat as reversed person if:

- Legal/institutional signals present
- First segment contains organization keywords
- Comma count > 3
- Second segment does not look name-like

| Input                   | Result       |
| ----------------------- | ------------ |
| `Acme, Inc.`            | Organization |
| `Smith Family, Inc.`    | Organization |
| `Marketing, Sales, Ops` | Unknown      |
| `Bank of America, N.A.` | Organization |

---

## 12. Unknown & Rejected

### Unknown

Used when:

- Ambiguous (`Smiths`)
- Single token (`Apple`)
- Mixed intent (`Smith Family & Friends`)
- Junk or handles

### Rejected (Strict Mode)

If strict person parsing requested:

- Return `rejected`
- Include `rejectedAs` and reasons

---

## 13. Confidence & Reason Codes

Every result includes:

- Confidence score
- Machine-readable reason codes

Examples:

- `ORG_LEGAL_SUFFIX`
- `PERSON_REVERSED_ORDER`
- `PERSON_SUFFIX_DETECTED`
- `COMPOUND_CONNECTOR`
- `FAMILY_ENDS_WITH_FAMILY`
- `AMBIGUOUS_THE_PLURAL`
- `HAS_EMAIL_ADDRESS`
- `LIST_SEPARATOR_DETECTED`

---

## 14. Rendering Implications (Non-Parsing)

Typed entities enable:

- Correct salutations
- Proper plural pronouns
- Avoidance of broken personalization
- Legal vs informal naming distinctions

Rendering is **out of scope** for this spec but enabled by it.

---

## 15. Non-Goals

- No global given-name dictionaries
- No band vs family disambiguation
- No destructive normalization
- No locale-wide linguistic inference

---

## 16. Why This Works

This design:

- Matches actual CRM and email behavior
- Handles Outlook/Gmail exports correctly
- Prevents data corruption
- Scales from single fields to bulk imports
- Keeps APIs clean while embracing messy reality

---

- Return `rejected`
- Include `rejectedAs` and reasons

---

## 13. Confidence & Reason Codes

Every result includes:

- Confidence score
- Machine-readable reason codes

Examples:

- `ORG_LEGAL_SUFFIX`
- `PERSON_REVERSED_ORDER`
- `PERSON_SUFFIX_DETECTED`
- `COMPOUND_CONNECTOR`
- `FAMILY_ENDS_WITH_FAMILY`
- `AMBIGUOUS_THE_PLURAL`
- `HAS_EMAIL_ADDRESS`
- `LIST_SEPARATOR_DETECTED`

---

## 14. Rendering Implications (Non-Parsing)

Typed entities enable:

- Correct salutations
- Proper plural pronouns
- Avoidance of broken personalization
- Legal vs informal naming distinctions

Rendering is **out of scope** for this spec but enabled by it.

---

## 15. Non-Goals

- No global given-name dictionaries
- No band vs family disambiguation
- No destructive normalization
- No locale-wide linguistic inference

---

## 16. Why This Works

This design:

- Matches actual CRM and email behavior
- Handles Outlook/Gmail exports correctly
- Prevents data corruption
- Scales from single fields to bulk imports
- Keeps APIs clean while embracing messy reality

---
