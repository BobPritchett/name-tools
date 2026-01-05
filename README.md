# name-tools

[![npm version](https://img.shields.io/npm/v/name-tools.svg)](https://www.npmjs.com/package/name-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A lightweight, zero-dependency utility library for parsing, formatting, and manipulating person names. Now with **entity classification** to distinguish between people, organizations, families, and compound names.

**[Interactive Demo](https://bobpritchett.github.io/name-tools/)**

## Features

- **Entity Classification** - Automatically detect if input is a person, organization, family, or compound name
- Parse full names into components (prefix, first, middle, last, suffix, nickname)
- **Single** formatting entry point with presets + options (`formatName`)
- Smart no-break spacing for nicer UI rendering (NBSP/NNBSP, optional HTML entities output)
- Render lists/couples from arrays of names
- Extract specific parts (first name, last name, nickname)
- **Reversed name support** (e.g., "Smith, John, Jr.")
- **Email recipient list parsing** (`parseNameList` for To/CC lines)
- Comprehensive data sets of common prefixes and suffixes
- Full TypeScript support with type definitions
- Zero dependencies
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

### Parsing Functions

#### `parseName(input: string, options?: ParseOptions): ParsedNameEntity`

Parse and classify a name string into a typed entity.

```javascript
// Person
const person = parseName("Mr. John Robert Smith Jr.");
// {
//   kind: 'person',
//   honorific: 'Mr.',
//   given: 'John',
//   middle: 'Robert',
//   family: 'Smith',
//   suffix: 'Jr.',
//   meta: { confidence: 1, reasons: ['PERSON_STANDARD_FORMAT'], locale: 'en', ... }
// }

// Organization (detected by legal suffix)
const org = parseName("Smith Family Trust");
// {
//   kind: 'organization',
//   name: 'Smith Family Trust',
//   legalForm: 'Trust',
//   meta: { confidence: 1, reasons: ['ORG_LEGAL_SUFFIX'], ... }
// }

// Compound name (couple)
const couple = parseName("John and Mary Smith");
// {
//   kind: 'compound',
//   connector: 'and',
//   members: [...],
//   sharedFamily: 'Smith',
//   meta: { ... }
// }

// Reversed name format
const reversed = parseName("Smith, John, Jr.");
// {
//   kind: 'person',
//   given: 'John',
//   family: 'Smith',
//   suffix: 'Jr.',
//   meta: { reasons: ['PERSON_REVERSED_FORMAT'], ... }
// }
```

**Options:**

- `locale?: string` - Locale hint (default: 'en')
- `strictKind?: 'person'` - Reject non-person entities

#### `parseNameList(input: string, options?: ParseListOptions): ParsedRecipient[]`

Parse email recipient lists (To/CC lines) into individual recipients.

```javascript
const recipients = parseNameList(
  "John Smith <john@example.com>; Jane Doe <jane@example.com>, Bob"
);
// [
//   {
//     raw: 'John Smith <john@example.com>',
//     display: { kind: 'person', given: 'John', family: 'Smith', ... },
//     email: 'john@example.com',
//     meta: { confidence: 1, ... }
//   },
//   {
//     raw: 'Jane Doe <jane@example.com>',
//     display: { kind: 'person', given: 'Jane', family: 'Doe', ... },
//     email: 'jane@example.com',
//     meta: { ... }
//   },
//   {
//     raw: 'Bob',
//     display: { kind: 'person', given: 'Bob', ... },
//     meta: { ... }
//   }
// ]
```

**Supports:**

- Semicolon separator (Outlook default)
- Comma separator (context-aware, respects reversed names)
- Newline separator
- Email formats: `Name <email>`, `email (Name)`, bare emails
- Reversed names: `Smith, John` won't split on the comma

#### `getFirstName(fullName: string): string`

Extract just the first name from a full name.

```javascript
getFirstName("William Frederick Richardson"); // "William"
```

#### `getLastName(fullName: string): string`

Extract just the last name from a full name.

```javascript
getLastName("William Frederick Richardson"); // "Richardson"
```

### Type Guards

The library exports type guard functions for working with classified entities:

```typescript
import {
  parseName,
  isPerson,
  isOrganization,
  isFamily,
  isCompound,
  isUnknown,
  isRejected,
} from "name-tools";

const entity = parseName(input);

if (isPerson(entity)) {
  // entity is PersonName - access given, family, etc.
  console.log(entity.given, entity.family);
} else if (isOrganization(entity)) {
  // entity is OrganizationName - access name, legalForm, etc.
  console.log(entity.name, entity.legalForm);
} else if (isCompound(entity)) {
  // entity is CompoundName - access members, sharedFamily, etc.
  console.log(entity.members, entity.sharedFamily);
}
```

### Formatting Functions

All formatting uses a single entry point. Input can be a string, a `ParsedName`, or an array of either.

#### `formatName(input, options?) -> string`

```ts
formatName(
  input: string | ParsedName | Array<string | ParsedName>,
  options?: NameFormatOptions
): string
```

```javascript
formatName("Dr. John Franklin Jr.");
// "John Franklin, Jr."

formatName("Dr. John Franklin Jr.", { preset: "alphabetical" });
// "Franklin, John, Jr."
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

The library exports surname particle datasets and helpers:

- `PARTICLES`, `MULTI_WORD_PARTICLES`
- `COMMON_SURNAMES`, `COMMON_FIRST_NAMES`
- `isParticle()`, `isMultiWordParticle()`, `isCommonSurname()`, `isCommonFirstName()`

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
│   ├── classifier.ts     # Main classification orchestrator
│   ├── parsers.ts        # Parsing functions
│   ├── formatters.ts     # Formatting functions
│   ├── list-parser.ts    # Recipient list parsing
│   ├── types.ts          # TypeScript type definitions
│   └── index.ts          # Main entry point
├── dist/                 # Compiled output (generated)
├── docs/                 # Demo site (GitHub Pages)
├── tests/                # Unit tests
└── package.json          # Package configuration
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

MIT © Bob Pritchett

## Author

**Bob Pritchett**

- GitHub: [@BobPritchett](https://github.com/BobPritchett)

## Acknowledgments

Built with:

- [TypeScript](https://www.typescriptlang.org/)
- [tsup](https://github.com/egoist/tsup) - Zero-config TypeScript bundler
- [Vitest](https://vitest.dev/) - Unit testing framework
