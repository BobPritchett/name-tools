# name-tools

[![npm version](https://img.shields.io/npm/v/name-tools.svg)](https://www.npmjs.com/package/name-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A lightweight, zero-dependency utility library for parsing, formatting, and manipulating person names.

**[Interactive Demo](https://bobpritchett.github.io/name-tools/)**

## Features

- Parse full names into components (prefix, first, middle, last, suffix)
- Multiple formatting options (Last-First, First-Last, with initials, formal)
- Extract specific parts (first name, last name, initials)
- Comprehensive data sets of common prefixes and suffixes
- Full TypeScript support with type definitions
- Zero dependencies
- Lightweight and fast

## Installation

```bash
npm install name-tools
```

## Quick Start

```javascript
import { parseName, formatLastFirst, getInitials } from 'name-tools';

// Parse a full name
const parsed = parseName("Dr. Bob William Pritchett Jr.");
console.log(parsed);
// {
//   prefix: 'Dr.',
//   first: 'Bob',
//   middle: 'William',
//   last: 'Pritchett',
//   suffix: 'Jr.'
// }

// Format names
const formatted = formatLastFirst("Bob Pritchett");
console.log(formatted); // "Pritchett, Bob"

// Get initials
const initials = getInitials("John Robert Smith");
console.log(initials); // "JRS"
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
getFirstName("Bob William Pritchett"); // "Bob"
```

#### `getLastName(fullName: string): string`

Extract just the last name from a full name.

```javascript
getLastName("Bob William Pritchett"); // "Pritchett"
```

#### `getInitials(fullName: string): string`

Get the initials from a full name.

```javascript
getInitials("John Robert Smith"); // "JRS"
getInitials("Bob Pritchett");      // "BP"
```

### Formatting Functions

All formatting functions accept either a string (full name) or a `ParsedName` object.

#### `formatFirstLast(name: string | ParsedName): string`

Format a name in standard "First Last" order.

```javascript
formatFirstLast("Dr. Bob Pritchett Jr.");
// "Dr. Bob Pritchett Jr."
```

#### `formatLastFirst(name: string | ParsedName): string`

Format a name in "Last, First" order (common for alphabetical sorting).

```javascript
formatLastFirst("Bob William Pritchett");
// "Pritchett, Bob William"

formatLastFirst("Dr. Bob Pritchett Jr.");
// "Pritchett, Bob, Jr."
```

#### `formatWithMiddleInitial(name: string | ParsedName): string`

Format a name with abbreviated middle name(s).

```javascript
formatWithMiddleInitial("Bob William Pritchett");
// "Bob W. Pritchett"

formatWithMiddleInitial("John Robert Michael Smith");
// "John R. M. Smith"
```

#### `formatFormal(name: string | ParsedName): string`

Format a name in formal style (Title + Last name).

```javascript
formatFormal("Dr. Bob Pritchett");
// "Dr. Pritchett"

formatFormal("Bob Pritchett");
// "Mr/Ms Pritchett"
```

### Data Sets & Utilities

#### `PREFIXES: string[]`

Array of common name prefixes/titles:
`Mr`, `Mr.`, `Mrs`, `Mrs.`, `Ms`, `Ms.`, `Miss`, `Dr`, `Dr.`, `Prof`, `Prof.`, `Rev`, `Rev.`, `Hon`, `Hon.`, `Sir`, `Lady`, `Lord`

#### `SUFFIXES: string[]`

Array of common name suffixes:
`Jr`, `Jr.`, `Sr`, `Sr.`, `II`, `III`, `IV`, `V`, `PhD`, `Ph.D.`, `MD`, `M.D.`, `Esq`, `Esq.`, `DDS`, `D.D.S.`, `JD`, `J.D.`, `MBA`, `M.B.A.`, `CPA`, `RN`, `DVM`

#### `isPrefix(str: string): boolean`

Check if a string is a known prefix.

```javascript
isPrefix("Dr."); // true
isPrefix("Mr");  // true
isPrefix("Bob"); // false
```

#### `isSuffix(str: string): boolean`

Check if a string is a known suffix.

```javascript
isSuffix("Jr.");  // true
isSuffix("PhD");  // true
isSuffix("Bob");  // false
```

## TypeScript Support

This library is written in TypeScript and includes full type definitions.

```typescript
import { parseName, ParsedName, formatLastFirst } from 'name-tools';

const parsed: ParsedName = parseName("Bob Pritchett");
const formatted: string = formatLastFirst(parsed);
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
import { getFirstName, getLastName } from 'name-tools';

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
import { parseName, formatWithMiddleInitial } from 'name-tools';

function displayName(fullName) {
  const parsed = parseName(fullName);

  // Use full name for VIPs with titles
  if (parsed.prefix) {
    return formatWithMiddleInitial(parsed);
  }

  // Otherwise just first and last
  return `${parsed.first} ${parsed.last}`;
}

displayName("Dr. Bob William Pritchett");
// "Dr. Bob W. Pritchett"

displayName("Bob William Pritchett");
// "Bob Pritchett"
```

### Sorting Names

```javascript
import { formatLastFirst } from 'name-tools';

const names = [
  "Bob Pritchett",
  "Alice Johnson",
  "Dr. Charlie Brown"
];

const sorted = names
  .map(name => ({ original: name, sortKey: formatLastFirst(name) }))
  .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  .map(item => item.original);

// ["Dr. Charlie Brown", "Alice Johnson", "Bob Pritchett"]
```

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/BobPritchett/name-tools.git
cd name-tools

# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Development mode (watch for changes)
npm run dev
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
