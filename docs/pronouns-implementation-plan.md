# Pronoun Support Implementation Plan

## Overview

This module adds pronoun support to name-tools, enabling complete mailing/addressing workflows where correct pronoun usage is essential. The module is designed to be:

1. **Tree-shakeable** - Separate file, importable independently
2. **Integrable** - Works with `guessGender()` and entity classification
3. **Extensible** - Supports custom pronoun sets and neopronouns
4. **Entity-aware** - Default pronouns for organizations, families, etc.

---

## 1. API Design

### 1.1 Core Data Structure: `PronounSet`

```typescript
interface PronounSet {
  id: string;                    // Stable key: "he", "she", "they", "ze-hir", etc.
  label: string;                 // Short display: "he/him", "she/her", "they/them"
  subject: string;               // "he", "she", "they"
  object: string;                // "him", "her", "them"
  possessiveDeterminer: string;  // "his", "her", "their" (as in "their book")
  possessivePronoun: string;     // "his", "hers", "theirs" (as in "the book is theirs")
  reflexive: string;             // "himself", "herself", "themselves"
}
```

### 1.2 Functions

```typescript
// Core lookup
getPronounSet(idOrSpec: string): PronounSet
parsePronounSpec(spec: string): PronounSet

// Formatting for templates/documents
formatPronoun(set: PronounSet, role: PronounRole, options?: FormatOptions): string
fillPronounTemplate(template: string, set: PronounSet, options?: FormatOptions): string

// Integration with gender/entity
getDefaultPronouns(gender: 'male' | 'female' | 'unknown' | null): PronounSet
getPronounsForEntity(entity: ParsedNameEntity): PronounSet

// Future: extraction from name strings
extractPronouns(nameWithPronouns: string): { name: string; pronouns?: PronounSet }
```

### 1.3 Built-in Pronoun Sets

| ID | Label | Subject | Object | Poss. Det. | Poss. Pron. | Reflexive |
|----|-------|---------|--------|------------|-------------|-----------|
| `he` | he/him | he | him | his | his | himself |
| `she` | she/her | she | her | her | hers | herself |
| `they` | they/them | they | them | their | theirs | themselves |
| `it` | it/its | it | it | its | its | itself |
| `ze-hir` | ze/hir | ze | hir | hir | hirs | hirself |
| `ze-zir` | ze/zir | ze | zir | zir | zirs | zirself |
| `xe-xem` | xe/xem | xe | xem | xyr | xyrs | xemself |

Special sets:
- `any` - Uses they/them as default, signals "any pronouns OK"
- `name-only` - Empty strings, signals "use name instead of pronouns" (requires consumer handling)

---

## 2. Integration Points

### 2.1 With `guessGender()`

```typescript
// Map gender result to default pronouns
function getDefaultPronouns(gender: 'male' | 'female' | 'unknown' | null): PronounSet {
  switch (gender) {
    case 'male': return getPronounSet('he');
    case 'female': return getPronounSet('she');
    case 'unknown':
    case null:
    default: return getPronounSet('they');  // Safe default
  }
}

// Usage
const db = createGenderDB();
const gender = db.guessGender('Alex');  // 'unknown'
const pronouns = getDefaultPronouns(gender);  // they/them
```

### 2.2 With Entity Classification

```typescript
function getPronounsForEntity(entity: ParsedNameEntity): PronounSet {
  switch (entity.kind) {
    case 'person':
      // Could integrate with gender lookup via given name
      return getPronounSet('they');  // Safe default for persons

    case 'organization':
    case 'family':
    case 'household':
    case 'compound':
      // Groups and orgs always use they/them
      return getPronounSet('they');

    case 'unknown':
    case 'rejected':
    default:
      return getPronounSet('they');
  }
}
```

### 2.3 Enhanced Integration with GenderDB

```typescript
interface GetPronounsOptions {
  genderDB?: GenderDB;           // Optional gender database for lookup
  explicitPronouns?: string;     // User-specified pronouns override
  defaultOnUnknown?: PronounSet; // Custom default for unknown/null
}

function getPronounsForPerson(
  entity: PersonName,
  options: GetPronounsOptions = {}
): PronounSet {
  // Priority:
  // 1. Explicit pronouns (from future extraction or user input)
  if (options.explicitPronouns) {
    return getPronounSet(options.explicitPronouns);
  }

  // 2. Gender-based default (if genderDB provided and given name exists)
  if (options.genderDB && entity.given) {
    const gender = options.genderDB.guessGender(entity.given);
    if (gender === 'male') return getPronounSet('he');
    if (gender === 'female') return getPronounSet('she');
  }

  // 3. Custom default or they/them
  return options.defaultOnUnknown ?? getPronounSet('they');
}
```

---

## 3. Future: Pronoun Extraction from Names

Many people include pronouns in their display names:
- `"Alex Johnson (they/them)"`
- `"Sam Smith (he/his)"`
- `"Jordan Lee (she/her/hers)"`

### 3.1 Extraction Pattern

```typescript
const PRONOUN_SUFFIX_RE = /\s*\(([^)]+)\)\s*$/;

function extractPronouns(nameWithPronouns: string): {
  name: string;
  pronouns?: PronounSet;
  rawPronounSpec?: string;
} {
  const match = nameWithPronouns.match(PRONOUN_SUFFIX_RE);

  if (!match) {
    return { name: nameWithPronouns };
  }

  const rawSpec = match[1].trim();
  const name = nameWithPronouns.slice(0, match.index!).trim();

  // Check if it looks like pronouns (contains /)
  if (rawSpec.includes('/')) {
    try {
      return {
        name,
        pronouns: parsePronounSpec(rawSpec),
        rawPronounSpec: rawSpec,
      };
    } catch {
      // Not valid pronouns, treat as annotation
      return { name: nameWithPronouns };
    }
  }

  return { name: nameWithPronouns };
}
```

### 3.2 Integration with Gender Hinting

Extracted pronouns can improve gender inference:
- `(he/him)` strongly suggests male
- `(she/her)` strongly suggests female
- `(they/them)` or neopronouns suggest non-binary

This could feed back into classification confidence.

---

## 4. File Structure

```
src/
├── pronouns/
│   ├── index.ts              # Main entry, exports, documentation
│   ├── types.ts              # PronounSet, PronounRole types
│   ├── data.ts               # BUILT_IN_PRONOUNS, SPEC_ALIASES
│   ├── parser.ts             # parsePronounSpec()
│   ├── formatter.ts          # formatPronoun(), fillPronounTemplate()
│   ├── integration.ts        # getDefaultPronouns(), getPronounsForEntity()
│   └── extractor.ts          # extractPronouns() (future)
```

### 4.1 Entry Point Pattern (following gender module)

```typescript
// src/pronouns/index.ts
export { getPronounSet, parsePronounSpec } from './parser';
export { formatPronoun, fillPronounTemplate } from './formatter';
export { getDefaultPronouns, getPronounsForEntity, getPronounsForPerson } from './integration';
export { extractPronouns } from './extractor';
export { BUILT_IN_PRONOUNS } from './data';
export type { PronounSet, PronounRole, FormatOptions } from './types';
```

### 4.2 Main Index Export

```typescript
// Add to src/index.ts
export {
  getPronounSet,
  parsePronounSpec,
  formatPronoun,
  fillPronounTemplate,
  getDefaultPronouns,
  getPronounsForEntity,
  getPronounsForPerson,
  extractPronouns,
  BUILT_IN_PRONOUNS,
  type PronounSet,
  type PronounRole,
} from './pronouns';
```

---

## 5. Test Plan

### 5.1 Unit Tests (`tests/pronouns.test.ts`)

```typescript
describe('pronouns', () => {
  describe('getPronounSet', () => {
    it('should return built-in sets by ID', () => {
      expect(getPronounSet('he').subject).toBe('he');
      expect(getPronounSet('she').object).toBe('her');
      expect(getPronounSet('they').possessivePronoun).toBe('theirs');
    });

    it('should parse shorthand specs', () => {
      expect(getPronounSet('he/him').reflexive).toBe('himself');
      expect(getPronounSet('she/hers').possessiveDeterminer).toBe('her');
    });

    it('should handle case variations', () => {
      expect(getPronounSet('He/Him').id).toBe('he');
      expect(getPronounSet('THEY/THEM').id).toBe('they');
    });

    it('should parse custom specs', () => {
      const custom = getPronounSet('ey/em/eir/eirs/emself');
      expect(custom.subject).toBe('ey');
      expect(custom.reflexive).toBe('emself');
    });
  });

  describe('formatPronoun', () => {
    it('should format with capitalization options', () => {
      const she = getPronounSet('she');
      expect(formatPronoun(she, 'subject', { capitalization: 'title' })).toBe('She');
      expect(formatPronoun(she, 'subject', { capitalization: 'upper' })).toBe('SHE');
    });
  });

  describe('getDefaultPronouns', () => {
    it('should map gender to pronouns', () => {
      expect(getDefaultPronouns('male').id).toBe('he');
      expect(getDefaultPronouns('female').id).toBe('she');
      expect(getDefaultPronouns('unknown').id).toBe('they');
      expect(getDefaultPronouns(null).id).toBe('they');
    });
  });

  describe('getPronounsForEntity', () => {
    it('should return they/them for organizations', () => {
      const org = classifyName('Acme Inc.');
      expect(getPronounsForEntity(org).id).toBe('they');
    });

    it('should return they/them for families', () => {
      const family = classifyName('The Smiths');
      expect(getPronounsForEntity(family).id).toBe('they');
    });
  });

  describe('extractPronouns', () => {
    it('should extract pronouns from name suffix', () => {
      const result = extractPronouns('Alex Johnson (they/them)');
      expect(result.name).toBe('Alex Johnson');
      expect(result.pronouns?.id).toBe('they');
    });

    it('should not extract non-pronoun parentheticals', () => {
      const result = extractPronouns('John Smith (billing)');
      expect(result.name).toBe('John Smith (billing)');
      expect(result.pronouns).toBeUndefined();
    });
  });
});
```

### 5.2 Integration Tests

```typescript
describe('pronouns + gender integration', () => {
  let genderDB: GenderDB;

  beforeAll(() => {
    genderDB = createGenderDB();
  });

  it('should derive pronouns from gender for known names', () => {
    const entity = parseName('John Smith') as PersonName;
    const pronouns = getPronounsForPerson(entity, { genderDB });
    expect(pronouns.id).toBe('he');
  });

  it('should use they/them for ambiguous names', () => {
    const entity = parseName('Alex Smith') as PersonName;
    const pronouns = getPronounsForPerson(entity, { genderDB });
    expect(pronouns.id).toBe('they');
  });
});
```

---

## 6. Documentation Updates

### 6.1 Update docs/index.html

Add a new section to the test page:

```html
<section id="pronouns">
  <h2>Pronoun Lookup</h2>
  <div class="input-group">
    <label for="pronounSpec">Pronoun Spec:</label>
    <input type="text" id="pronounSpec" placeholder="he/him, she/her, they/them...">
  </div>
  <div class="results">
    <h3>Pronoun Set</h3>
    <pre id="pronounResult"></pre>
  </div>
</section>

<section id="pronounsFromEntity">
  <h2>Pronouns for Entity</h2>
  <p>Uses gender lookup + entity type to suggest default pronouns</p>
  <div class="input-group">
    <label for="entityName">Name:</label>
    <input type="text" id="entityName" placeholder="John Smith, Acme Inc, The Smiths...">
  </div>
  <div class="results">
    <h3>Suggested Pronouns</h3>
    <pre id="entityPronounResult"></pre>
  </div>
</section>
```

### 6.2 Update docs/script.js

```javascript
// Pronoun spec lookup
const pronounInput = document.getElementById('pronounSpec');
const pronounResult = document.getElementById('pronounResult');

pronounInput.addEventListener('input', () => {
  try {
    const set = nameTools.getPronounSet(pronounInput.value);
    pronounResult.textContent = JSON.stringify(set, null, 2);
  } catch (e) {
    pronounResult.textContent = `Error: ${e.message}`;
  }
});

// Entity pronouns
const entityInput = document.getElementById('entityName');
const entityPronounResult = document.getElementById('entityPronounResult');

entityInput.addEventListener('input', () => {
  const entity = nameTools.classifyName(entityInput.value);
  let pronouns;

  if (entity.kind === 'person' && entity.given) {
    pronouns = nameTools.getPronounsForPerson(entity, { genderDB });
  } else {
    pronouns = nameTools.getPronounsForEntity(entity);
  }

  entityPronounResult.textContent = JSON.stringify({
    entity: { kind: entity.kind },
    pronouns: pronouns,
  }, null, 2);
});
```

---

## 7. Implementation Order

### Phase 1: Core Module
1. Create `src/pronouns/types.ts` with type definitions
2. Create `src/pronouns/data.ts` with built-in pronoun sets and aliases
3. Create `src/pronouns/parser.ts` with `getPronounSet()` and `parsePronounSpec()`
4. Create `src/pronouns/formatter.ts` with formatting functions
5. Create `src/pronouns/index.ts` with exports
6. Add exports to `src/index.ts`
7. Write `tests/pronouns.test.ts`

### Phase 2: Entity Integration
1. Create `src/pronouns/integration.ts` with entity-aware functions
2. Add integration with `GenderDB` for person entities
3. Write integration tests
4. Update `src/docs-entry.ts` to include pronouns

### Phase 3: Documentation
1. Update `docs/index.html` with pronoun demo sections
2. Update `docs/script.js` with pronoun interactions
3. Update this spec with any learnings

### Phase 4: Future Enhancement
1. Implement `extractPronouns()` for name suffix parsing
2. Consider using extracted pronouns as gender hints
3. Add support for pronoun extraction in `parseName()` options

---

## 8. Design Decisions

### Q: Why not use a binary database like gender?
**A:** Unlike gender data (100k+ names with probabilities), pronoun sets are a small, fixed vocabulary. A simple object map is more appropriate and keeps the module lightweight.

### Q: Why default to they/them?
**A:** When gender/pronouns are unknown, they/them is the safest grammatically correct default. It avoids misgendering and works for both individuals and groups.

### Q: Should pronouns be stored on ParsedNameEntity?
**A:** Not on the core type - this keeps the parser pure. Instead, pronouns are computed via helper functions that can optionally take additional context (genderDB, explicit preferences).

### Q: How to handle "use my name" preference?
**A:** The `name-only` set has empty strings for all pronoun forms. Formatters should detect this and substitute the person's name (passed separately) or handle gracefully.

---

## 9. Examples

### Mailing merge example

```typescript
const genderDB = createGenderDB();

function generateGreeting(name: string): string {
  const entity = classifyName(name);

  if (entity.kind !== 'person') {
    return `Dear ${name},`;
  }

  const pronouns = getPronounsForPerson(entity, { genderDB });
  const formal = formatPronoun(pronouns, 'possessiveDeterminer', { capitalization: 'title' });

  // "Dear Mr. Smith" or "Dear Ms. Smith" based on gender
  if (pronouns.id === 'he') {
    return `Dear Mr. ${entity.family},`;
  } else if (pronouns.id === 'she') {
    return `Dear Ms. ${entity.family},`;
  } else {
    return `Dear ${entity.given} ${entity.family},`;
  }
}
```

### Template filling example

```typescript
const borrower = getPronounSet('she');
const template = '{{Subject}} agrees that {{possDet}} obligations are binding upon {{object}}.';
const filled = fillPronounTemplate(template, borrower, { capitalization: 'lower' });
// "she agrees that her obligations are binding upon her."
```

---

## Approval Checklist

- [ ] API design matches project patterns
- [ ] Tree-shakeable module structure approved
- [ ] Integration with gender module approved
- [ ] Test plan coverage adequate
- [ ] Documentation approach approved
- [ ] Implementation order agreed

Ready for implementation upon approval.
