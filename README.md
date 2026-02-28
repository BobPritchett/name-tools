# name-tools

[![npm version](https://img.shields.io/npm/v/name-tools.svg)](https://www.npmjs.com/package/name-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A lightweight, zero-dependency utility library for parsing, formatting, and manipulating person names. Now with **entity classification** to distinguish between people, organizations, families, and compound names.

**[Interactive Demo](https://bobpritchett.github.io/name-tools/)**

## Features

- **Entity Classification** - Automatically detect if input is a person, organization, family, or compound name
- Parse full names into components (prefix, first, middle, last, suffix, nickname)
- **Single** formatting entry point with presets + options (`formatName`)
- **Gender guessing** from first names using US Social Security Administration birth data (140+ years of statistics)
- Smart no-break spacing for nicer UI rendering (NBSP/NNBSP, optional HTML entities output)
- Render lists/couples from arrays of names
- Extract specific parts (first name, last name, nickname)
- **Reversed name support** (e.g., "Smith, John, Jr.")
- **Email recipient list parsing** (`parseNameList` for To/CC lines)
- Comprehensive data sets of common prefixes and suffixes
- Full TypeScript support with type definitions
- Zero dependencies (gender data is tree-shakeable)
- Lightweight and fast

## Installation

```bash
pnpm add name-tools
```

## Quick Start

```javascript
import { parseName, formatName, parseNameList } from "name-tools";

// Parse and classify a name - returns a typed entity
const person = parseName("Dr. William Frederick Richardson Jr.");
console.log(person);
// {
//   kind: 'person',
//   given: 'William',
//   middle: 'Frederick',
//   family: 'Richardson',
//   honorific: 'Dr.',
//   suffix: 'Jr.',
//   meta: { confidence: 1, reasons: ['PERSON_STANDARD_FORMAT'], ... }
// }

// Detect organizations automatically
const org = parseName("Acme Corporation, Inc.");
console.log(org.kind); // 'organization'
console.log(org.legalForm); // 'Inc.'

// Detect compound names (couples)
const couple = parseName("Bob & Mary Smith");
console.log(couple.kind); // 'compound'
console.log(couple.sharedFamily); // 'Smith'

// Format a name (single entry point)
console.log(formatName("Dr. William Frederick Richardson Jr."));
// "William Richardson, Jr."

console.log(
  formatName("Dr. William Frederick Richardson Jr.", { preset: "formalFull" })
);
// "Dr. William Frederick Richardson, Jr."

// Parse email recipient lists (To/CC lines)
const recipients = parseNameList("John Smith <john@example.com>; Jane Doe");
// Returns array of parsed recipients with emails and classified names
```

## API Reference

### Entity Classification

The library classifies input into one of these entity types:

| Kind           | Description                                    | Example                          |
| -------------- | ---------------------------------------------- | -------------------------------- |
| `person`       | Individual human name                          | "Dr. John Smith Jr."             |
| `organization` | Company, institution, trust, foundation        | "Acme Corp, Inc.", "First Bank"  |
| `family`       | Family or household                            | "The Smith Family", "The Smiths" |
| `compound`     | Multiple people in one field                   | "Bob & Mary Smith"               |
| `unknown`      | Could not be classified                        | "@handle", ambiguous input       |
| `rejected`     | Strict mode rejection (not the requested type) | -                                |

### Entity Type Structures

Each entity type has specific fields. All types include a `meta` property with parsing metadata.

#### `PersonName`

| Field       | Type       | Description                                |
| ----------- | ---------- | ------------------------------------------ |
| `kind`      | `'person'` | Entity type discriminator                  |
| `honorific` | `string?`  | Title/honorific (Dr., Mr., etc.)           |
| `given`     | `string?`  | Given/first name                           |
| `middle`    | `string?`  | Middle name(s)                             |
| `family`    | `string?`  | Family/last name                           |
| `suffix`    | `string?`  | Suffix (Jr., PhD, etc.)                    |
| `nickname`  | `string?`  | Nickname                                   |
| `particles` | `string[]?`| Surname particles (von, de, etc.)          |
| `reversed`  | `boolean?` | Whether name was in reversed format        |
| `meta`      | `ParseMeta`| Parsing metadata                           |

#### `OrganizationName`

| Field           | Type             | Description                           |
| --------------- | ---------------- | ------------------------------------- |
| `kind`          | `'organization'` | Entity type discriminator             |
| `baseName`      | `string`         | Base name without legal suffix        |
| `legalForm`     | `LegalForm?`     | Detected legal form (Inc, LLC, etc.)  |
| `legalSuffixRaw`| `string?`        | Raw legal suffix as written           |
| `qualifiers`    | `string[]?`      | Additional qualifiers ("of", etc.)    |
| `aka`           | `string[]?`      | Alternate names (d/b/a)               |
| `meta`          | `ParseMeta`      | Parsing metadata                      |

#### `FamilyName`

| Field        | Type                          | Description                         |
| ------------ | ----------------------------- | ----------------------------------- |
| `kind`       | `'family'` \| `'household'`   | Entity type discriminator           |
| `article`    | `'The'?`                      | Leading article if present          |
| `familyName` | `string`                      | Core family/surname                 |
| `style`      | `'familyWord'` \| `'pluralSurname'` | How the family was expressed  |
| `familyWord` | `'Family'` \| `'Household'?`  | The word used (if style is familyWord) |
| `meta`       | `ParseMeta`                   | Parsing metadata                    |

#### `CompoundName`

| Field          | Type                              | Description                      |
| -------------- | --------------------------------- | -------------------------------- |
| `kind`         | `'compound'`                      | Entity type discriminator        |
| `connector`    | `'&'` \| `'and'` \| `'+'` \| `'et'` \| `'unknown'` | The connector detected |
| `members`      | `(PersonName \| UnknownName)[]`   | Parsed members                   |
| `sharedFamily` | `string?`                         | Shared family name if inferred   |
| `meta`         | `ParseMeta`                       | Parsing metadata                 |

#### `UnknownName`

| Field   | Type        | Description                              |
| ------- | ----------- | ---------------------------------------- |
| `kind`  | `'unknown'` | Entity type discriminator                |
| `text`  | `string`    | Best-effort normalized text              |
| `guess` | `NameKind?` | Best guess at what it might be           |
| `meta`  | `ParseMeta` | Parsing metadata                         |

#### `RejectedName`

| Field        | Type         | Description                              |
| ------------ | ------------ | ---------------------------------------- |
| `kind`       | `'rejected'` | Entity type discriminator                |
| `rejectedAs` | `NameKind`   | What kind it would have been classified as |
| `meta`       | `ParseMeta`  | Parsing metadata                         |

#### `ParseMeta` (included in all entities)

| Field        | Type           | Description                              |
| ------------ | -------------- | ---------------------------------------- |
| `raw`        | `string`       | Exact input string                       |
| `normalized` | `string`       | Normalized string used for parsing       |
| `confidence` | `0` \| `0.25` \| `0.5` \| `0.75` \| `1` | Overall confidence in classification |
| `reasons`    | `ReasonCode[]` | Reason codes explaining the classification |
| `warnings`   | `string[]?`    | Human-readable warnings                  |
| `locale`     | `string?`      | Locale hint (default: "en")              |

---

### Parsing Functions

#### `parseName(input, options?)`

```ts
parseName(input: string, options?: ParseOptions): ParsedNameEntity
```

Parse and classify a name string into a typed entity.

**Parameters:**

| Parameter          | Type     | Description                                  |
| ------------------ | -------- | -------------------------------------------- |
| `input`            | `string` | The name string to parse                     |
| `options.locale`   | `string` | Locale hint (default: `'en'`)                |
| `options.strictKind` | `'person'` | If set, reject non-person entities        |

**Returns:** `ParsedNameEntity` - One of `PersonName`, `OrganizationName`, `FamilyName`, `CompoundName`, `UnknownName`, or `RejectedName`

```javascript
// Person
const person = parseName("Mr. John Robert Smith Jr.");
// { kind: 'person', honorific: 'Mr.', given: 'John', middle: 'Robert', family: 'Smith', suffix: 'Jr.', meta: {...} }

// Organization
const org = parseName("Smith Family Trust");
// { kind: 'organization', baseName: 'Smith Family Trust', legalForm: 'Trust', meta: {...} }

// Compound name (couple)
const couple = parseName("John and Mary Smith");
// { kind: 'compound', connector: 'and', members: [...], sharedFamily: 'Smith', meta: {...} }

// Reversed format
const reversed = parseName("Smith, John, Jr.");
// { kind: 'person', given: 'John', family: 'Smith', suffix: 'Jr.', reversed: true, meta: {...} }
```

---

#### `parsePersonName(fullName)`

```ts
parsePersonName(fullName: string): ParsedName
```

Parse a name string into legacy `ParsedName` format (for use with `formatName`).

**Parameters:**

| Parameter  | Type     | Description              |
| ---------- | -------- | ------------------------ |
| `fullName` | `string` | The name string to parse |

**Returns:** `ParsedName` with `prefix`, `first`, `middle`, `last`, `suffix`, `nickname` fields

```javascript
const parsed = parsePersonName("Dr. John William Smith Jr.");
// { prefix: 'Dr.', first: 'John', middle: 'William', last: 'Smith', suffix: 'Jr.' }
```

---

#### `parseNameList(input, options?)`

```ts
parseNameList(input: string, options?: ParseListOptions): ParsedRecipient[]
```

Parse email recipient lists (To/CC lines) into individual recipients.

**Parameters:**

| Parameter          | Type     | Description                                  |
| ------------------ | -------- | -------------------------------------------- |
| `input`            | `string` | The recipient list string                    |
| `options.locale`   | `string` | Locale hint (default: `'en'`)                |
| `options.strictKind` | `'person'` | If set, reject non-person entities        |

**Returns:** `ParsedRecipient[]` - Array of recipients with `raw`, `display`, `email`, and `meta` fields

**Supports:**

- Semicolon separator (Outlook default)
- Comma separator (context-aware, respects reversed names)
- Newline separator
- Email formats: `Name <email>`, `email (Name)`, bare emails
- Reversed names: `Smith, John` won't split on the comma

```javascript
const recipients = parseNameList(
  "John Smith <john@example.com>; Jane Doe <jane@example.com>, Bob"
);
// [
//   { raw: 'John Smith <john@example.com>', display: { kind: 'person', ... }, email: 'john@example.com', meta: {...} },
//   { raw: 'Jane Doe <jane@example.com>', display: { kind: 'person', ... }, email: 'jane@example.com', meta: {...} },
//   { raw: 'Bob', display: { kind: 'person', given: 'Bob', ... }, meta: {...} }
// ]
```

---

#### `getFirstName(fullName)`

```ts
getFirstName(fullName: string): string | undefined
```

Extract just the first/given name from a full name string.

**Parameters:**

| Parameter  | Type     | Description              |
| ---------- | -------- | ------------------------ |
| `fullName` | `string` | The full name to extract from |

**Returns:** `string | undefined` - The first name, or `undefined` if not found

```javascript
getFirstName("William Frederick Richardson"); // "William"
getFirstName("Dr. John Smith Jr."); // "John"
```

---

#### `getLastName(fullName)`

```ts
getLastName(fullName: string): string | undefined
```

Extract just the last/family name from a full name string.

**Parameters:**

| Parameter  | Type     | Description              |
| ---------- | -------- | ------------------------ |
| `fullName` | `string` | The full name to extract from |

**Returns:** `string | undefined` - The last name, or `undefined` if not found

```javascript
getLastName("William Frederick Richardson"); // "Richardson"
getLastName("Dr. John van der Berg Jr."); // "van der Berg"
```

---

#### `getNickname(fullName)`

```ts
getNickname(fullName: string): string | undefined
```

Extract the nickname from a full name string (if present).

**Parameters:**

| Parameter  | Type     | Description              |
| ---------- | -------- | ------------------------ |
| `fullName` | `string` | The full name to extract from |

**Returns:** `string | undefined` - The nickname, or `undefined` if not found

```javascript
getNickname('William "Bill" Smith'); // "Bill"
getNickname("Robert (Bob) Jones"); // "Bob"
```

---

#### `entityToLegacy(entity)`

```ts
entityToLegacy(entity: ParsedNameEntity): ParsedName | null
```

Convert a `ParsedNameEntity` to legacy `ParsedName` format (for use with `formatName`).

**Parameters:**

| Parameter | Type               | Description                |
| --------- | ------------------ | -------------------------- |
| `entity`  | `ParsedNameEntity` | The entity to convert      |

**Returns:** `ParsedName | null` - Legacy format, or `null` if not a person

```javascript
const entity = parseName("Dr. John Smith Jr.");
const legacy = entityToLegacy(entity);
// { prefix: 'Dr.', first: 'John', last: 'Smith', suffix: 'Jr.' }
```

---

### Type Guards

Type guard functions for TypeScript type narrowing:

| Function           | Returns `true` when                |
| ------------------ | ---------------------------------- |
| `isPerson(entity)` | `entity.kind === 'person'`         |
| `isOrganization(entity)` | `entity.kind === 'organization'` |
| `isFamily(entity)` | `entity.kind === 'family'`         |
| `isCompound(entity)` | `entity.kind === 'compound'`     |
| `isUnknown(entity)` | `entity.kind === 'unknown'`       |
| `isRejected(entity)` | `entity.kind === 'rejected'`     |

```typescript
import { parseName, isPerson, isOrganization } from "name-tools";

const entity = parseName(input);

if (isPerson(entity)) {
  // TypeScript knows: entity is PersonName
  console.log(entity.given, entity.family);
} else if (isOrganization(entity)) {
  // TypeScript knows: entity is OrganizationName
  console.log(entity.baseName, entity.legalForm);
}
```

---

### Formatting Functions

#### `formatName(input, options?)`

```ts
formatName(
  input: string | ParsedName | Array<string | ParsedName>,
  options?: NameFormatOptions
): string
```

Format a name (or array of names) according to a preset or custom options.

**Parameters:**

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `input` | `string \| ParsedName \| Array` | Name(s) to format |
| `options` | `NameFormatOptions` | Formatting options (see below) |

**Returns:** `string` - The formatted name

**Key Options:**

| Option          | Type                                      | Default         | Description                              |
| --------------- | ----------------------------------------- | --------------- | ---------------------------------------- |
| `preset`        | `NamePreset`                              | `'display'`     | Preset format (see Preset Matrix below)  |
| `output`        | `'text' \| 'html'`                        | `'text'`        | Output format                            |
| `typography`    | `'plain' \| 'ui' \| 'fine'`               | `'ui'`          | Typography level for spacing/punctuation |
| `noBreak`       | `'none' \| 'smart' \| 'all'`              | `'smart'`       | Non-breaking space behavior              |
| `join`          | `'none' \| 'list' \| 'couple'`            | `'none'`        | Array rendering mode                     |
| `conjunction`   | `'and' \| '&' \| string`                  | `'and'`         | Word between last two names              |
| `oxfordComma`   | `boolean`                                 | `true`          | Use Oxford comma in lists                |
| `prefer`        | `'auto' \| 'nickname' \| 'first'`         | `'auto'`        | Which given name to prefer               |
| `middle`        | `'full' \| 'initial' \| 'none'`           | varies          | Middle name handling                     |
| `prefix`        | `'include' \| 'omit' \| 'auto'`           | varies          | Honorific handling                       |
| `suffix`        | `'include' \| 'omit' \| 'auto'`           | varies          | Suffix handling                          |
| `order`         | `'given-family' \| 'family-given' \| 'auto'` | `'given-family'` | Name order                            |

```javascript
formatName("Dr. John Franklin Jr.");
// "John Franklin, Jr."

formatName("Dr. John Franklin Jr.", { preset: "alphabetical" });
// "Franklin, John, Jr."

formatName(["John Smith", "Jane Doe"], { join: "list" });
// "John Smith and Jane Doe"
```

#### Preset Matrix (quick pick)

Example input used below:

```javascript
const input = "Dr. William Frederick Richardson Jr.";
```

| preset              | intent                   | defaults (high level)                                     | output example                                                                                                         |
| ------------------- | ------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `display` (default) | best UI display name     | prefix omit, middle none, suffix auto, given-family       | `formatName(input)` → `William Richardson, Jr.`                                                                        |
| `preferredDisplay`  | nickname + family for UI | prefer nickname, middle none, suffix auto                 | `formatName(input, { preset: "preferredDisplay" })` → `William Richardson, Jr.` _(falls back to first if no nickname)_ |
| `informal`          | given + family           | prefix omit, middle none, suffix omit                     | `formatName(input, { preset: "informal" })` → `William Richardson`                                                     |
| `firstOnly`         | given only               | prefix omit, middle none, suffix omit                     | `formatName(input, { preset: "firstOnly" })` → `William`                                                               |
| `preferredFirst`    | nickname only            | prefer nickname, middle none, suffix omit                 | `formatName(input, { preset: "preferredFirst" })` → `William` _(falls back to first if no nickname)_                   |
| `formalFull`        | full formal name         | prefix include, middle full, suffix include, given-family | `formatName(input, { preset: "formalFull" })` → `Dr. William Frederick Richardson, Jr.`                                |
| `formalShort`       | title + family           | prefix include, middle none, suffix omit                  | `formatName(input, { preset: "formalShort" })` → `Dr. Richardson`                                                      |
| `alphabetical`      | sortable family-first    | family-given, middle initial, suffix auto                 | `formatName(input, { preset: "alphabetical" })` → `Richardson, William F., Jr.`                                        |
| `initialed`         | initials + family        | middle initial, suffix omit                               | `formatName(input, { preset: "initialed" })` → `W. F. Richardson`                                                      |

See `NameFormatOptions` for presets, typography, no-break behavior, and array rendering.

### Data Sets & Utilities

#### Data Sets

| Export                  | Type                | Description                                      |
| ----------------------- | ------------------- | ------------------------------------------------ |
| `PARTICLES`             | `readonly string[]` | Surname particles: "von", "van", "de", "la", etc. |
| `MULTI_WORD_PARTICLES`  | `readonly string[]` | Multi-word particles: "de la", "van der", etc.   |
| `COMMON_SURNAMES`       | `readonly string[]` | ~1000 most common US surnames                    |
| `COMMON_FIRST_NAMES`    | `readonly string[]` | ~1000 most common US first names                 |

#### Utility Functions

```ts
isParticle(str: string): boolean
```

Check if a string is a surname particle (case-insensitive).

```javascript
isParticle("von"); // true
isParticle("Van"); // true
isParticle("Smith"); // false
```

---

```ts
isMultiWordParticle(words: string[]): string | null
```

Check if an array of words starts with a multi-word particle. Returns the matched particle or `null`.

```javascript
isMultiWordParticle(["de", "la", "Cruz"]); // "de la"
isMultiWordParticle(["van", "der", "Berg"]); // "van der"
isMultiWordParticle(["Smith", "Jones"]); // null
```

---

```ts
isCommonSurname(str: string): boolean
```

Check if a string is a common US surname (case-insensitive).

```javascript
isCommonSurname("Smith"); // true
isCommonSurname("Xyzzy"); // false
```

---

```ts
isCommonFirstName(str: string): boolean
```

Check if a string is a common US first name (case-insensitive).

```javascript
isCommonFirstName("John"); // true
isCommonFirstName("Xyzzy"); // false
```

## TypeScript Support

This library is written in TypeScript and includes full type definitions.

```typescript
import {
  parseName,
  formatName,
  parseNameList,
  ParsedNameEntity,
  PersonName,
  OrganizationName,
  CompoundName,
  ParsedRecipient,
  isPerson,
  NameFormatOptions,
} from "name-tools";

// Entity classification with type narrowing
const entity: ParsedNameEntity = parseName("John Franklin Jr.");

if (isPerson(entity)) {
  const person: PersonName = entity;
  console.log(person.given, person.family); // "John", "Franklin"
}

// Formatting
const formatted: string = formatName("John Franklin Jr.", {
  preset: "display",
} satisfies NameFormatOptions);
```

## Use Cases

- User registration and profile systems
- Contact management systems
- Email address generators
- Mailing list formatters
- Name-based sorting and indexing
- Form validation and processing
- Business card and document generation
- CRM data normalization
- Donor/customer record deduplication

## Examples

### Entity Classification

```javascript
import { parseName, isPerson, isOrganization } from "name-tools";

function processEntry(input) {
  const entity = parseName(input);

  switch (entity.kind) {
    case "person":
      return `Hello, ${entity.given}!`;
    case "organization":
      return `Business: ${entity.name}`;
    case "family":
      return `The ${entity.surname} household`;
    case "compound":
      return `${entity.members.length} people`;
    default:
      return input; // unknown/rejected
  }
}

processEntry("Dr. John Smith"); // "Hello, John!"
processEntry("Acme Corp, LLC"); // "Business: Acme Corp, LLC"
processEntry("The Smith Family"); // "The Smith household"
processEntry("Bob & Mary Smith"); // "2 people"
```

### Strict Mode (Person Only)

```javascript
import { parseName } from "name-tools";

// Reject non-person entities
const result = parseName("Acme Corp, Inc.", { strictKind: "person" });
console.log(result.kind); // 'rejected'
console.log(result.rejectedAs); // 'organization'
```

### Building an Email Address

```javascript
import { getFirstName, getLastName } from "name-tools";

function createEmail(fullName, domain) {
  const first = getFirstName(fullName).toLowerCase();
  const last = getLastName(fullName).toLowerCase();
  return `${first}.${last}@${domain}`;
}

createEmail("John Franklin Jr.", "example.com");
// "john.franklin@example.com"
```

### Formatting for Display

```javascript
import { parseName, formatName, isPerson } from "name-tools";

function displayName(fullName) {
  const entity = parseName(fullName);

  if (!isPerson(entity)) {
    return fullName; // Return as-is for non-persons
  }

  // Use a more formal preset for VIPs with titles
  if (entity.honorific) {
    return formatName(fullName, { preset: "formalFull" });
  }

  // Otherwise the default display preset
  return formatName(fullName);
}

displayName("Dr. William Frederick Richardson Jr.");
// "Dr. William Frederick Richardson, Jr."

displayName("William Frederick Richardson Jr.");
// "William Richardson, Jr."
```

### Sorting Names

```javascript
import { formatName } from "name-tools";

const names = ["John Franklin Jr.", "Alice Johnson", "Dr. Charlie Brown"];

const sorted = names
  .map((name) => ({
    original: name,
    sortKey: formatName(name, { preset: "alphabetical" }),
  }))
  .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  .map((item) => item.original);

// ["Dr. Charlie Brown", "Alice Johnson", "John Franklin Jr."]
```

### Processing Email Recipient Lists

```javascript
import { parseNameList, isPerson } from "name-tools";

const toLine =
  "John Smith <john@example.com>; Jane Doe; sales@company.com; The Smiths";

const recipients = parseNameList(toLine);

for (const r of recipients) {
  if (r.email) {
    console.log(`Email: ${r.email}`);
  }
  if (r.display && isPerson(r.display)) {
    console.log(`Name: ${r.display.given} ${r.display.family}`);
  }
}
```

## Running the Demo Locally & Troubleshooting

### Opening the Demo Page

To test your changes live in the demo page:

1. Build the library and copy the latest code to the demo:
   ```bash
   pnpm run build
   ```
2. Open `docs/index.html` in your browser.

#### CORS Error: "Access to script at ... has been blocked by CORS policy"

Modern browsers block JavaScript modules and some resource loading when opening an HTML file directly from disk (`file://`), due to security (CORS) restrictions. If you see errors like:

```
Access to script at 'file:///C:/.../script.js' from origin 'null' has been blocked by CORS policy
```

**Solution:** Serve the `docs/` folder with a local web server instead of opening the file directly.

##### Quick Start with a Local Server

From your project root, run one of the following:

- Using pnpm (if you have `serve`):
  ```bash
  pnpm dlx serve docs
  ```
- Using npx (npm):
  ```bash
  npx serve docs
  ```
- Using Python (if installed):
  ```bash
  python -m http.server 8000 --directory docs
  ```

Then open your browser to the address shown in the terminal (e.g., http://localhost:3000 or http://localhost:8000).

---

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/BobPritchett/name-tools.git
cd name-tools

# Install dependencies
pnpm install

# Build the library
pnpm run build

# Run tests
pnpm test

# Development mode (watch for changes)
pnpm run dev
```

### Project Structure

```
name-tools/
├── src/                  # Source code (TypeScript)
│   ├── data/             # Data sets (prefixes, suffixes, legal forms)
│   ├── detectors/        # Entity detection modules
│   │   ├── person.ts     # Person name detection
│   │   ├── organization.ts # Organization detection
│   │   ├── family.ts     # Family/household detection
│   │   └── compound.ts   # Compound name detection
│   ├── gender/           # Gender probability module
│   │   ├── GenderDB.ts   # Binary trie lookup class
│   │   ├── all.ts        # Full dataset entry point
│   │   ├── coverage99.ts # 99% coverage entry point
│   │   ├── coverage95.ts # 95% coverage entry point
│   │   └── data/         # Generated binary data (base64)
│   ├── classifier.ts     # Main classification orchestrator
│   ├── parsers.ts        # Parsing functions
│   ├── formatters.ts     # Formatting functions
│   ├── list-parser.ts    # Recipient list parsing
│   ├── types.ts          # TypeScript type definitions
│   └── index.ts          # Main entry point
├── scripts/              # Build scripts
│   └── build-gender-data.js  # Generates binary trie from SSA data
├── data/                 # SSA source data (yobYYYY.txt files)
├── dist/                 # Compiled output (generated)
├── docs/                 # Demo site (GitHub Pages)
├── tests/                # Unit tests
└── package.json          # Package configuration
```

### Rebuilding Gender Probability Data

The library includes gender probability data derived from US Social Security Administration birth name records. The data is pre-built and included in the source, but you can rebuild it if you need to update or customize it.

#### Step 1: Download SSA Data

1. Go to the [SSA Baby Names page](https://www.ssa.gov/oact/babynames/limits.html)
2. Click **"National data"** to download `names.zip` (~9 MB)
3. Extract the zip file contents into the `data/` folder in this project
4. You should now have files like `data/yob1880.txt`, `data/yob1881.txt`, ..., `data/yob2023.txt`

The zip contains ~145 files covering births from 1880 to present.

#### Step 2: Build the Data

```bash
pnpm build:gender
```

This generates three tree-shakeable data files with different coverage levels:

| File                            | Coverage | Names   | Size    |
| ------------------------------- | -------- | ------- | ------- |
| `src/gender/data/all.ts`        | 100%     | ~83,000 | ~757 KB |
| `src/gender/data/coverage99.ts` | 99%      | ~27,000 | ~257 KB |
| `src/gender/data/coverage95.ts` | 95%      | ~7,000  | ~75 KB  |

#### Configuration

Edit `scripts/build-gender-data.js` to customize:

```javascript
const CONFIG = {
  // Minimum occurrences to include a name (higher = smaller file)
  MIN_OCCURRENCES: 10,

  // Coverage levels to generate
  COVERAGE_LEVELS: {
    all: 1.0, // 100% - all names meeting threshold
    coverage99: 0.99, // 99% of population
    coverage95: 0.95, // 95% of population
  },
};
```

**How the filters interact:**

1. `MIN_OCCURRENCES` is applied **first** to all names - any name with fewer total occurrences across all years is discarded
2. `COVERAGE_LEVELS` then filters the remaining names by cumulative population coverage (sorted by popularity)

So `MIN_OCCURRENCES` affects **all** output files, not just the "all" dataset. Increasing it removes rare names from every coverage level, making all files smaller but potentially missing some valid obscure names.

#### Usage

Import the data size you need - tree-shaking drops the unused ones:

```typescript
// Smallest bundle (~75 KB)
import { createGenderDB } from "name-tools/gender/coverage95";

// Medium bundle (~257 KB)
import { createGenderDB } from "name-tools/gender/coverage99";

// Full dataset (~757 KB)
import { createGenderDB } from "name-tools/gender/all";

const db = createGenderDB();

db.getMaleProbability("John"); // ~0.996 (male)
db.getMaleProbability("Mary"); // ~0.004 (female)
db.getMaleProbability("Chris"); // ~0.7 (leans male)

// Guess gender with 80% confidence threshold (default)
db.guessGender("John"); // 'male' (>80% male probability)
db.guessGender("Mary"); // 'female' (<20% male probability)
db.guessGender("Chris"); // 'unknown' (found, but between 20-80%)
db.guessGender("Alex", 0.6); // custom threshold: 'male' | 'female' | 'unknown'
db.guessGender("Xyzzy"); // null (not found in database)

// Check if a name exists in the database (useful for first-name validation)
db.has("Chris"); // true
db.has("Xyzzy"); // false
```

### Building for NPM and GitHub Pages

This project uses a dual-output setup:

1. **NPM Package**: The `dist/` folder contains the compiled library code

   - Built with `tsup` in both CommonJS and ESM formats
   - Includes TypeScript type definitions

2. **GitHub Pages Demo**: The `docs/` folder contains a static demo site
   - Available at: https://bobpritchett.github.io/name-tools/

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © 2025-2026 Bob Pritchett

## Author

**Bob Pritchett**

- GitHub: [@BobPritchett](https://github.com/BobPritchett)

## Acknowledgments

Built with:

- [TypeScript](https://www.typescriptlang.org/)
- [tsup](https://github.com/egoist/tsup) - Zero-config TypeScript bundler
- [Vitest](https://vitest.dev/) - Unit testing framework
