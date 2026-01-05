# name-tools

[![npm version](https://img.shields.io/npm/v/name-tools.svg)](https://www.npmjs.com/package/name-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A lightweight, zero-dependency utility library for parsing, formatting, and manipulating person names.

**[Interactive Demo](https://bobpritchett.github.io/name-tools/)**

## Features

- Parse full names into components (prefix, first, middle, last, suffix, nickname)
- **Single** formatting entry point with presets + options (`formatName`)
- Smart no-break spacing for nicer UI rendering (NBSP/NNBSP, optional HTML entities output)
- Render lists/couples from arrays of names
- Extract specific parts (first name, last name, nickname)
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
import { parseName, formatName } from "name-tools";

// Parse a full name
const parsed = parseName("Dr. William Frederick Richardson Jr.");
console.log(parsed);
// {
//   prefix: 'Dr.',
//   first: 'William',
//   middle: 'Frederick',
//   last: 'Richardson',
//   suffix: 'Jr.'
// }

// Format a name (single entry point)
console.log(formatName("Dr. William Frederick Richardson Jr."));
// "William Richardson, Jr." (NBSP used in smart mode)

console.log(
  formatName("Dr. William Frederick Richardson Jr.", { preset: "formalFull" })
);
// "Dr. Bob William Pritchett, Jr."

// Render a list or couple
console.log(formatName(["John Smith", "Mary Jones"], { join: "list" }));
// "John Smith and Mary Jones"

console.log(formatName(["John Smith", "Mary Smith"], { join: "couple" }));
// "John and Mary Smith"
```

## API Reference

### Parsing Functions

#### `parseName(fullName: string): ParsedName`

Parse a full name string into its component parts.

```javascript
const result = parseName("Mr. John Robert Smith Jr.");
// Returns:
// {
//   prefix: 'Mr.',
//   first: 'John',
//   middle: 'Robert',
//   last: 'Smith',
//   suffix: 'Jr.'
// }
```

**Returns:** `ParsedName` object with the following properties:

- `prefix?`: string - Title or honorific (Mr., Dr., etc.)
- `first`: string - First name
- `middle?`: string - Middle name(s)
- `last`: string - Last name
- `suffix?`: string - Suffix (Jr., PhD, etc.)

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
// "John, Jr."

formatName("Dr. John Franklin Jr.", { preset: "alphabetical" });
// "Franklin, John, Jr."
```

#### Preset Matrix (quick pick)

Example input used below:

```javascript
const input = "Dr. William Frederick Richardson Jr.";
```

| preset              | intent                   | defaults (high level)                                     | output example                                                                                                         |
| ------------------- | ------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `display` (default) | best UI display name     | prefix omit, middle none, suffix auto, given-family       | `formatName(input)` → `William Richardson, Jr.`                                                                        |
| `preferredDisplay`  | nickname + family for UI | prefer nickname, middle none, suffix auto                 | `formatName(input, { preset: "preferredDisplay" })` → `William Richardson, Jr.` _(falls back to first if no nickname)_ |
| `informal`          | given + family           | prefix omit, middle none, suffix omit                     | `formatName(input, { preset: "informal" })` → `William Richardson`                                                     |
| `firstOnly`         | given only               | prefix omit, middle none, suffix omit                     | `formatName(input, { preset: "firstOnly" })` → `William`                                                               |
| `preferredFirst`    | nickname only            | prefer nickname, middle none, suffix omit                 | `formatName(input, { preset: "preferredFirst" })` → `William` _(falls back to first if no nickname)_                   |
| `formalFull`        | full formal name         | prefix include, middle full, suffix include, given-family | `formatName(input, { preset: "formalFull" })` → `Dr. Bob William Pritchett, Jr.`                                       |
| `formalShort`       | title + family           | prefix include, middle none, suffix omit                  | `formatName(input, { preset: "formalShort" })` → `Dr. Pritchett`                                                       |
| `alphabetical`      | sortable family-first    | family-given, middle initial, suffix auto                 | `formatName(input, { preset: "alphabetical" })` → `Pritchett, Bob W., Jr.`                                             |
| `initialed`         | initials + family        | middle initial, suffix omit                               | `formatName(input, { preset: "initialed" })` → `B. W. Pritchett`                                                       |

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
  ParsedName,
  formatName,
  NameFormatOptions,
} from "name-tools";

const parsed: ParsedName = parseName("Bob Pritchett");
const formatted: string = formatName(parsed, {
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

## Examples

### Building an Email Address

```javascript
import { getFirstName, getLastName } from "name-tools";

function createEmail(fullName, domain) {
  const first = getFirstName(fullName).toLowerCase();
  const last = getLastName(fullName).toLowerCase();
  return `${first}.${last}@${domain}`;
}

createEmail("Bob Pritchett", "example.com");
// "bob.pritchett@example.com"
```

### Formatting for Display

```javascript
import { parseName, formatName } from "name-tools";

function displayName(fullName) {
  const parsed = parseName(fullName);

  // Use a more formal preset for VIPs with titles
  if (parsed.prefix) return formatName(parsed, { preset: "formalFull" });

  // Otherwise the default display preset
  return formatName(parsed);
}

displayName("Dr. William Frederick Richardson Jr.");
// "Dr. William Frederick Richardson, Jr."

displayName("William Frederick Richardson Jr.");
// "William Richardson, Jr."
```

### Sorting Names

```javascript
import { formatName } from "name-tools";

const names = ["Bob Pritchett", "Alice Johnson", "Dr. Charlie Brown"];

const sorted = names
  .map((name) => ({
    original: name,
    sortKey: formatName(name, { preset: "alphabetical" }),
  }))
  .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  .map((item) => item.original);

// ["Dr. Charlie Brown", "Alice Johnson", "Bob Pritchett"]
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
├── src/              # Source code (TypeScript)
│   ├── data/         # Data sets (prefixes, suffixes)
│   ├── parsers.ts    # Parsing functions
│   ├── formatters.ts # Formatting functions
│   └── index.ts      # Main entry point
├── dist/             # Compiled output (generated)
├── docs/             # Demo site (GitHub Pages)
├── tests/            # Unit tests
└── package.json      # Package configuration
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
