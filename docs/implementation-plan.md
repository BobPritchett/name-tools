# Implementation Plan: Entity Classification Extension

## Overview

Extend name-tools from a person-name-only parser to a full entity classification system that handles:
- **People** (individual names, including reversed format)
- **Organizations** (companies, trusts, foundations, institutions)
- **Families/Households** (The Smith Family, The Smiths)
- **Compounds** (Bob & Mary Smith, Mr. & Mrs. Jones)
- **Email recipient lists** (To/CC line parsing)

**Breaking Changes:** Yes, `parseName` will return the new `ParsedNameEntity` union type.

---

## Phase 1: Types & Core Infrastructure

### New Files
- `src/types.ts` - All TypeScript type definitions

### Type Definitions
```ts
// Entity kinds
type NameKind = "person" | "family" | "household" | "compound" | "organization" | "unknown" | "rejected"

// Confidence scoring
type Confidence = 0 | 0.25 | 0.5 | 0.75 | 1

// Reason codes (machine-readable classification explanations)
type ReasonCode = "ORG_LEGAL_SUFFIX" | "ORG_INSTITUTION_PHRASE" | "COMPOUND_CONNECTOR" | ...

// Entity interfaces
interface PersonName { kind: "person"; honorific?; given?; middle?; family?; suffix?; nickname?; ... }
interface OrganizationName { kind: "organization"; baseName; legalForm?; legalSuffixRaw?; ... }
interface FamilyName { kind: "family" | "household"; familyName; style; ... }
interface CompoundName { kind: "compound"; connector; members[]; sharedFamily?; ... }
interface UnknownName { kind: "unknown"; text; guess?; ... }
interface RejectedName { kind: "rejected"; rejectedAs; ... }

// Union type
type ParsedNameEntity = PersonName | OrganizationName | FamilyName | CompoundName | UnknownName | RejectedName

// Recipient (for list parsing)
interface ParsedRecipient { raw; display?; email?; meta; }
```

### Backward Compatibility
- Keep existing `ParsedName` type as an alias or for internal use
- `PersonName` maps to current fields: prefix→honorific, first→given, last→family

---

## Phase 2: Classification System

### New Files
- `src/classifier.ts` - Main classification logic
- `src/detectors/organization.ts` - Organization detection
- `src/detectors/compound.ts` - Compound (multi-person) detection
- `src/detectors/family.ts` - Family/household detection
- `src/detectors/person.ts` - Person detection (forward + reversed)
- `src/normalize.ts` - Input normalization utilities

### Classification Priority (Strict Order)
1. **Organization** - Legal suffixes, institution phrases override everything
2. **Compound** - Connectors (&, and, +) with name-like tokens on both sides
3. **Family/Household** - "Family" word, "The" + plural surname
4. **Person** - Standard and reversed formats
5. **Unknown** - Fallback for ambiguous input

### Organization Detection Patterns
- Legal suffixes: `Inc`, `LLC`, `Ltd`, `Corp`, `GmbH`, `PLC`, `Trust`, `Foundation`, etc.
- Comma-legal: `Acme, Inc.`
- Institution phrases: `Bank of`, `Trust Company`, `Credit Union`, `University`, `Hospital`, `Church`, `Department of`, `City of`
- d/b/a and c/o patterns

### Compound Detection
- Connectors: `&`, `and`, `+`, `et`
- Must have name-like tokens on both sides
- Shared family name inference (Bob & Mary Smith → sharedFamily: "Smith")

### Family Detection
- Strong: ends with `Family` or `Household`
- Medium: starts with `The` + plural surname (`The Smiths`, `The Joneses`)
- Suppress if given-name tokens present (unless "Family" word exists)

### Person Detection (Including Reversed)
- Forward: `John Smith`, `Dr. Jane Q. Public`
- Reversed: `Smith, John`, `Smith, John, Jr.`, `van Helsing, Abraham`
- Suffix allow-list: `Jr`, `Sr`, `II`, `III`, `IV`, `PhD`, `MD`, `DDS`, `Esq`

---

## Phase 3: Email & List Parsing

### New Files
- `src/list-parser.ts` - Recipient list splitting
- `src/email-extractor.ts` - Email address extraction

### `parseNameList(input: string, options?): ParsedRecipient[]`
- Splits To/CC lines and bulk input
- Handles separators: `;` (strong), `,` (weak, context-aware), newlines
- Respects quotes and angle brackets

### Email Extraction Formats
- `John Doe <john@example.com>`
- `"Doe, John" <john@example.com>`
- `john@example.com (John Doe)`
- `John Doe [mailto:john@example.com]`
- `<SMTP:john@example.com>`
- Exchange X.500 paths

### Comma Handling (Critical)
- Commas inside quotes/angles don't split
- Reversed names (`Smith, John`) don't split on internal comma

---

## Phase 4: Update Existing Code

### Modified Files
- `src/parsers.ts` - Update `parseName` to use classifier
- `src/formatters.ts` - Ensure `formatName` handles new entity types
- `src/index.ts` - Export new types and functions

### API Changes
```ts
// Before
parseName(fullName: string): ParsedName

// After
parseName(input: string, options?: ParseOptions): ParsedNameEntity

// New function
parseNameList(input: string, options?: ParseListOptions): ParsedRecipient[]
```

### Options
```ts
interface ParseOptions {
  locale?: string;           // default "en"
  strictKind?: "person";     // reject non-person entities
}

interface ParseListOptions extends ParseOptions {
  // List-specific options if needed
}
```

---

## Phase 5: Tests

### New Test Files
- `tests/classifier.test.ts` - Classification tests
- `tests/organization.test.ts` - Organization detection
- `tests/compound.test.ts` - Compound detection
- `tests/family.test.ts` - Family detection
- `tests/person-reversed.test.ts` - Reversed name handling
- `tests/list-parser.test.ts` - Recipient list parsing
- `tests/email-extractor.test.ts` - Email extraction

### Test Fixtures
Implement all 90 test cases from the spec:
- 15 family/household cases
- 9 compound cases
- 30+ organization cases
- 15+ person cases
- 20+ edge cases and ambiguous inputs

---

## Phase 6: Documentation

### Update README.md
- New API documentation for `parseName` return types
- Add `parseNameList` documentation
- Entity type examples
- Migration notes for breaking changes

### Update Demo Page (docs/)
- Show entity classification results
- Add organization/family/compound examples to test table
- Display confidence and reason codes

### Update Examples
- Add examples for each entity type
- Show email list parsing examples

---

## File Structure (Final)

```
src/
├── index.ts              # Main exports
├── types.ts              # All type definitions
├── normalize.ts          # Input normalization
├── classifier.ts         # Main classification orchestrator
├── parsers.ts            # Person name parsing (enhanced)
├── formatters.ts         # Formatting functions
├── list-parser.ts        # Recipient list parsing
├── email-extractor.ts    # Email extraction
├── detectors/
│   ├── organization.ts   # Org detection
│   ├── compound.ts       # Compound detection
│   ├── family.ts         # Family detection
│   └── person.ts         # Person detection
└── data/
    ├── prefixes.ts       # (existing)
    ├── suffixes.ts       # (existing)
    ├── particles.ts      # (existing)
    ├── legal-forms.ts    # NEW: LLC, Inc, etc.
    └── institutions.ts   # NEW: Bank, University, etc.
```

---

## Implementation Order

1. **Types** - Define all interfaces and types
2. **Data files** - Add legal forms and institution keywords
3. **Normalization** - Input cleanup utilities
4. **Detectors** - Organization → Compound → Family → Person
5. **Classifier** - Orchestrate detection with priority
6. **Update parseName** - Use classifier, return new types
7. **List parser** - Email extraction and list splitting
8. **Tests** - Comprehensive test suite
9. **Documentation** - README, demo page, examples

---

## Estimated Scope

- ~10 new/modified source files
- ~500-800 lines of new code
- 90+ test cases
- Documentation updates

---

## Questions Resolved

- ✅ Breaking changes allowed to `parseName`
- ✅ Implement all entity types together
- ✅ Include `parseNameList` for email parsing