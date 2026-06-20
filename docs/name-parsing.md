# Name Parsing Guide

This document provides detailed instructions on how the name parsing algorithm works in `name-tools`, including handling of complex name formats, edge cases, and international naming conventions.

## Overview

The `parseName()` function uses a multi-step algorithm to break down a full name string into its component parts: `prefix`, `first`, `middle`, `last`, `suffix`, and `nickname`. The parser processes names from both ends (prefixes from the left, suffixes from the right) and uses heuristics to determine where the surname boundary lies.

For global names, the parser is conservative: ambiguous tokens are preserved and surfaced with warning metadata rather than silently discarded. Consumers should inspect `meta.warningCodes`, `meta.warningDetails`, `meta.confidenceDetail`, and `alternatives` when human review or overrides may be needed.

In addition to the core display strings, the parser also attaches **typed affix tokens**:

- `prefixTokens`: tokenized + classified prefix parts
- `suffixTokens`: tokenized + classified suffix parts

These tokens preserve the parsed substring as written (`value`) while also carrying a normalized matching key (`normalized`) and, when recognized, canonical display forms (`canonicalShort` / `canonicalLong`).

## Optional Given-Name Evidence

Raw strings cannot always distinguish a real middle/additional given name from the first element of a compound family name. `parseName()` accepts an optional evidence hook:

```ts
type GivenNameEvidenceProvider = (
  token: string,
  context: { raw: string; tokens: string[]; index: number }
) => { found: boolean; score?: number; source?: string } | undefined;
```

`undefined` means no opinion. `{ found: false }` means the provider checked and did not find the token. This is evidence, not proof. Absence from a US first-name database is only a weak review signal for global names.

The parser asks for evidence only on tokens whose role is ambiguous, such as `Garcia` in `Gabriel Garcia Lopez`. It does not ask about the given name or the final token that is already acting as the family-name anchor.

The existing gender datasets can be adapted:

```ts
import { createGenderDB, createGivenNameEvidenceProvider } from "name-tools/gender/coverage95";

const db = createGenderDB();
const evidence = createGivenNameEvidenceProvider(db);

parseName("Gabriel Garcia Lopez", {
  givenNameEvidence: evidence,
});
```

With no evidence, ambiguous names keep alternatives and warnings. With evidence, the provider may conservatively tip the selected parse, while warnings remain when the decision is still weak.

## Parsing Algorithm Steps

### Step 1: Extract Nicknames

Nicknames are identified by being enclosed in quotes or parentheses:
- Single quotes: `'Bob'`
- Double quotes: `"Bob"`
- Parentheses: `(Bob)`
- Square brackets: `[Bob]`

**Examples:**
```
"Robert 'Bob' Smith" → { first: "Robert", nickname: "Bob", last: "Smith" }
"Mary (Molly) Johnson" → { first: "Mary", nickname: "Molly", last: "Johnson" }
```

The nickname is extracted first and removed from the text before further processing.

### Step 2: Extract Suffixes

Suffixes are extracted from the **right side** of the name, working backward. The parser handles:

1. **Comma-separated suffixes** (processed first):
   - `"John Smith, Jr."` → suffix: `"Jr."`
   - `"Dr. Jane Doe, PhD, MD"` → suffix: `"PhD, MD"` *(display string preserved; canonical forms available via `suffixTokens`)*

2. **Space-separated suffixes** (processed after commas):
   - `"John Smith Jr."` → suffix: `"Jr."`
   - `"Robert Williams III"` → suffix: `"III"`

3. **Special cases**:
   - Royal titles: `"queen"`, `"king"`, `"consort"` (case-insensitive)
   - Multiple suffixes can be combined: `"PhD, MD"`, `"Jr., Esq."`

4. **Unanticipated post-nominals (degrees/certifications)**:
   - If the parser sees a **trailing comma suffix tail** and the comma-separated chunk looks like a short, credential-like abbreviation (e.g., `"PMP"`, `"CISSP"`, `"M.S."`), it is preserved as part of the suffix even if it is not in the built-in canonical list.
   - These tokens are classified as `type: "other"` in `suffixTokens` unless they match a known canonical entry.

**Examples:**
```
"John Smith Jr." → { first: "John", last: "Smith", suffix: "Jr." }
"Dr. Jane Doe, PhD" → { prefix: "Dr.", first: "Jane", last: "Doe", suffix: "PhD" }
"Robert Williams III, Esq." → { first: "Robert", last: "Williams", suffix: "III, Esq." }
"John Smith, PMP" → { first: "John", last: "Smith", suffix: "PMP" }
```

### Step 3: Extract Prefixes

Prefixes are extracted from the **left side** of the name, working forward. The parser:

1. Checks for multi-word prefixes (up to 5 words) before single-word prefixes
2. Continues extracting prefixes until no more matches are found
3. Must leave at least one word for the actual name

Prefix recognition is driven by the canonical affix dataset (plus heuristics for a few patterns), and the original display string is preserved in `prefix`. Canonical render-ready forms are available via `prefixTokens`.

**Examples:**
```
"Dr. John Smith" → { prefix: "Dr.", first: "John", last: "Smith" }
"Mr. Robert Williams" → { prefix: "Mr.", first: "Robert", last: "Williams" }
"Prof. Dr. Jane Doe" → { prefix: "Prof. Dr.", first: "Jane", last: "Doe" }
```

### Step 4: Determine Surname Boundary (The "Golden Rule")

After extracting prefixes and suffixes, the remaining words are analyzed to determine where the surname begins. This uses a backward-scanning algorithm:

#### Default Assumption
The **last word** is assumed to be the surname.

#### Boundary Detection Rules

The parser scans backward from the second-to-last word, looking for indicators that the surname starts earlier:

**Case A: Surname Particles**
If a word is a known particle (van, von, de, da, af, y, etc.), the surname starts at that particle:

```
"Vincent van Gogh" → { first: "Vincent", last: "van Gogh" }
"Leonardo da Vinci" → { first: "Leonardo", last: "da Vinci" }
"Johann Wolfgang von Goethe" → { first: "Johann", middle: "Wolfgang", last: "von Goethe" }
```

**Case B: Ambiguous Middle or Compound Surnames**
If the parser cannot determine whether an interior token is an additional given name or part of the family phrase, it keeps alternatives and emits warning metadata:

```
"Gabriel Garcia Lopez" → possible "Gabriel" + "Garcia" + "Lopez"
                       → possible "Gabriel" + "Garcia Lopez"
```

Compact display and generated sorting should not silently drop these ambiguous tokens. Optional given-name evidence can help choose a primary parse, but consumers should still treat warnings as review signals.

**Case C: Comma-Inverted Names**
If a person name contains a comma, the parser treats everything before the first comma as the family phrase unless organization parsing has already handled the input:

```
"Muñoz, Carlos" → { first: "Carlos", last: "Muñoz", reversed: true }
"García Márquez, Gabriel" → { first: "Gabriel", last: "García Márquez", reversed: true }
```

**Case D: Single Word**
If only one word remains after prefix/suffix extraction, it's treated as the first name:

```
"Madonna" → { first: "Madonna" }
"Cher" → { first: "Cher" }
```

**Case E: All Particles**
If all remaining words are particles (e.g., "van Gogh"), the entire string becomes the last name:

```
"van Gogh" → { last: "van Gogh" }
```

## Complex Examples

### International Names

```
"José María García López" → { first: "José", middle: "María", last: "García López" }
"Jean-Pierre de la Fontaine" → { first: "Jean-Pierre", last: "de la Fontaine" }
"Mary O'Brien" → { first: "Mary", last: "O'Brien" }
```

### Names with Titles and Suffixes

```
"Dr. Robert William Smith Jr., PhD" → {
  prefix: "Dr.",
  first: "Robert",
  middle: "William",
  last: "Smith",
  suffix: "Jr., PhD"
}
```

### Names with Nicknames

```
"Robert 'Bob' William Pritchett Jr." → {
  first: "Robert",
  nickname: "Bob",
  middle: "William",
  last: "Pritchett",
  suffix: "Jr."
}
```

### Compound Names

```
"Mary Jane Watson" → { first: "Mary", middle: "Jane", last: "Watson" }
"John Paul Jones" → { first: "John", middle: "Paul", last: "Jones" }
```

## Edge Cases and Limitations

### Ambiguous Cases

Some names are inherently ambiguous and may be parsed differently than expected:

1. **Middle names vs. compound surnames**: 
   - `"Mary Jane Watson"` could be interpreted as first+middle+last or first+compound-surname
   - The parser preserves alternatives and emits warning metadata instead of relying on bundled surname databases

2. **Single names**:
   - `"Madonna"` → treated as first name only
   - `"Cher"` → treated as first name only

3. **Names with only particles**:
   - `"van Gogh"` → treated as last name only

### Known Limitations

1. **Cultural variations**: The parser is optimized for Western naming conventions. Names from cultures with different structures (e.g., some Asian naming conventions where family name comes first) may not parse correctly.

2. **Hyphenated names**: Currently, hyphenated names are treated as single words:
   - `"Jean-Pierre"` → single first name
   - `"Mary-Jane"` → single first name

3. **Multiple middle names**: All middle names are combined into a single `middle` field:
   - `"John Robert Michael Smith"` → `{ first: "John", middle: "Robert Michael", last: "Smith" }`

4. **No validation**: The parser doesn't validate that extracted parts are "real" names. It will parse any string according to the rules.

## Error Handling

The parser throws errors in the following cases:

1. **Empty or invalid input**:
   ```javascript
   parseName("") // Error: Invalid name: expected non-empty string
   parseName(null) // Error: Invalid name: expected non-empty string
   ```

2. **No name parts found**:
   ```javascript
   parseName("Dr. Jr.") // Error: Invalid name: no name parts found after parsing
   ```

## Best Practices

1. **Trim input**: Always trim user input before parsing:
   ```javascript
   parseName(userInput.trim())
   ```

2. **Handle errors**: Wrap parsing in try-catch for user-provided input:
   ```javascript
   try {
     const parsed = parseName(userInput);
   } catch (error) {
     // Handle invalid input
   }
   ```

3. **Validate results**: Check that essential fields exist:
   ```javascript
   const parsed = parseName(name);
   if (!parsed.first || !parsed.last) {
     // Handle incomplete name
   }
   ```

4. **Consider context**: For ambiguous cases, consider the context of your application. You may want to provide users with the ability to correct parsed results.

## Integration with Formatting

The parsed name object can be directly passed to `formatName()` for formatting:

```javascript
const parsed = parseName("Dr. Robert 'Bob' Smith Jr.");
const formatted = formatName(parsed, { preset: "display" });
// "Bob Smith, Jr."
```

This allows you to parse once and format multiple times with different options.

### Canonical affix rendering

Because the parser emits `prefixTokens` / `suffixTokens`, `formatName()` can render affixes in canonical forms even if the input casing/punctuation is inconsistent.

For example, with `suffix: "auto"` (the default behavior for most presets), `formatName()` preserves the full suffix tail and will render known entries canonically:

```javascript
formatName("John Smith, phd") // "John Smith, Ph.D."
formatName("John Smith, PMP") // "John Smith, PMP" (unknown credential preserved)
```

### Plain spaces and no-break typography

By default, `formatName()` returns plain strings with normal spaces:

```javascript
formatName("Dr. John Smith Jr.") // "John Smith, Jr."
```

For display typography that uses non-breaking spaces, opt in explicitly:

```javascript
formatName("Dr. John Smith Jr.", {
  typography: "ui",
  noBreak: "smart",
});
```

### Particle filing for index names

Particles are always preserved in display and formal names. `particleFiling` only controls generated index/sort forms:

```javascript
formatName("Vincent van Gogh", { preset: "indexName" });
// "van Gogh, Vincent"

formatName("Vincent van Gogh", {
  preset: "indexName",
  particleFiling: "ignoreLeading",
});
// "Gogh, Vincent van"
```

## Organization Nouns

Organization detection recognizes legal suffixes and terminal institution nouns such as `Company`, `Co.`, `Laboratory`, `Laboratories`, `Institution`, `Institute`, `University`, `College`, `School`, `Museum`, `Library`, `Archive`, `Archives`, `Foundation`, `Association`, `Society`, `Department`, `Agency`, `Commission`, `Church`, `Hospital`, `Bank`, `Railroad`, `Railway`, `Press`, `Studio`, and `Gallery`.

Examples:

```javascript
parseName("Eastman Kodak Company").kind // "organization"
parseName("Bell Telephone Laboratories").kind // "organization"
parseName("Smithsonian Institution").kind // "organization"
```

These terms are recorded separately from legal forms as `organizationTermRaw` / `organizationTermKind` where available.

## Data Sources

The parser relies on several data sets:

- **Affixes (prefixes + suffixes)**: Canonical affix entries with matching variants and render-ready short/long forms (see `src/data/affixes.ts`)
- **Particles**: Surname particles (van, von, de, da, etc.)
- **Compatibility name lists**: Common-name utility exports remain available for legacy helpers, but the safer parser path does not use bundled surname databases to resolve global middle-vs-family ambiguity
- **Optional first-name evidence**: Existing gender datasets can be adapted with `createGivenNameEvidenceProvider(db)` when consumers explicitly opt in

These data sets are extensible and can be customized for specific use cases.

