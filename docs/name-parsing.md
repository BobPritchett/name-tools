# Name Parsing Guide

This document provides detailed instructions on how the name parsing algorithm works in `name-tools`, including handling of complex name formats, edge cases, and international naming conventions.

## Overview

The `parseName()` function uses a multi-step algorithm to break down a full name string into its component parts: `prefix`, `first`, `middle`, `last`, `suffix`, and `nickname`. The parser processes names from both ends (prefixes from the left, suffixes from the right) and uses heuristics to determine where the surname boundary lies.

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
   - `"Dr. Jane Doe, PhD, MD"` → suffix: `"PhD, MD"`

2. **Space-separated suffixes** (processed after commas):
   - `"John Smith Jr."` → suffix: `"Jr."`
   - `"Robert Williams III"` → suffix: `"III"`

3. **Special cases**:
   - Royal titles: `"queen"`, `"king"`, `"consort"` (case-insensitive)
   - Multiple suffixes can be combined: `"PhD, MD"`, `"Jr., Esq."`

**Examples:**
```
"John Smith Jr." → { first: "John", last: "Smith", suffix: "Jr." }
"Dr. Jane Doe, PhD" → { prefix: "Dr.", first: "Jane", last: "Doe", suffix: "PhD" }
"Robert Williams III, Esq." → { first: "Robert", last: "Williams", suffix: "III, Esq." }
```

### Step 3: Extract Prefixes

Prefixes are extracted from the **left side** of the name, working forward. The parser:

1. Checks for multi-word prefixes (up to 5 words) before single-word prefixes
2. Continues extracting prefixes until no more matches are found
3. Must leave at least one word for the actual name

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

**Case B: Compound Surnames**
If a word is a common surname (but not a common first name) and there are words before it, it may indicate a compound surname:

```
"Gabriel García Márquez" → { first: "Gabriel", last: "García Márquez" }
```

The parser uses surname databases to identify likely compound surnames.

**Case C: Single Word**
If only one word remains after prefix/suffix extraction, it's treated as the first name:

```
"Madonna" → { first: "Madonna" }
"Cher" → { first: "Cher" }
```

**Case D: All Particles**
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
   - The parser uses surname databases to make educated guesses

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

## Data Sources

The parser relies on several data sets:

- **Prefixes**: Common titles and honorifics (Mr., Dr., Prof., etc.)
- **Suffixes**: Common suffixes (Jr., Sr., PhD, MD, etc.)
- **Particles**: Surname particles (van, von, de, da, etc.)
- **Surnames**: Database of common surnames for compound surname detection
- **First Names**: Database of common first names to distinguish from surnames

These data sets are extensible and can be customized for specific use cases.

