# BACKGROUND

National Data on the relative frequency of given names in the population of
U.S. births where the individual has a Social Security Number
(Tabulated based on Social Security records as of March 2, 2025)
For each year of birth YYYY after 1879, we created a comma-delimited file called yobYYYY.txt. Each
record in the individual annual files has the format "name,sex,number," where name is 2 to 15 characters,
sex is M (male) or F (female) and "number" is the number of occurrences of the name. Each file is sorted
first on sex and then on number of occurrences in descending order. When there is a tie on the number of
occurrences, names are listed in alphabetical order. This sorting makes it easy to determine a name's rank.
The first record for each sex has rank 1, the second record for each sex has rank 2, and so forth.
To safeguard privacy, we restrict our list of names to those with at least 5 occurrences.

The files are in name-tools\data.

# THE PLAN

The social Security administration publishes files with the list of first names and the number of people given that first name each year, and whether their male or female. By collecting this data for a century, it should be possible to do a statistic analysis of a first name to see if it’s more likely a male or female first name some names will be almost always be Male like SUSAN and others will be almost always Male like Jon and Sum will be ambiguous like Kim or Chris. But using this data, we can get a percentage likelihood mail. What’s the most efficient data storage algorithm for this data? I want to store it in type script, and I’m thinking a dag, but the pointer size could use a lot of memory. I don’t want to use a database, or have to make a server call, so I’m thinking maybe some kind of binary buffer or really streamlined data structure.

You have correctly identified that `DAGs` (specifically **DAWGs** or **Tries**) are the theoretically correct structure for dictionary lookups, but your concern about pointer overhead in JavaScript/TypeScript is valid. In a standard JS object graph, every "node" carries significant memory overhead (hidden classes, garbage collection headers).

The most efficient storage algorithm for this specific dataset—given your constraints of TypeScript, client-side usage, and no database—is a **Flattened Static Radix Tree (Patricia Trie) stored in Typed Arrays.**

Here is the breakdown of why this works and how to implement it.

### 1. The Data Strategy: Quantization

First, stop thinking in "Male/Female counts." You only need a single byte per name.
Instead of storing `Mary: { M: 12, F: 4000000 }`, calculate the "Maleness" probability () and map it to a `0-255` integer.

- `0` = 100% Female
- `255` = 100% Male
- `128` = Ambiguous

This allows you to store the "payload" for every name in a single `Uint8Array`.

### 2. The Structure: Flattened Radix Tree

A standard Trie stores `S -> u -> s -> a -> n`. This is wasteful.
A **Radix Tree** collapses the linear parts: `Susan` becomes a single node if it has no branching sub-names.

To avoid pointer overhead, we do not use JS Objects (`{ left: node, right: node }`). We use **Array Indices** as pointers.

#### The "Creative" Layout (SoA - Structure of Arrays)

You only need two binary buffers (Arrays) to store the entire Social Security dataset efficiently.

1. **`node_structure` (Uint32Array):** This handles the tree navigation.

- We can bit-pack the data. A 32-bit integer can hold:
- **Bits 0-7:** The length of the string segment (e.g., length of "usan").
- **Bits 8-31:** The index pointer to the _children_ or _next sibling_.

2. **`string_data` (Uint8Array):** A giant blob of characters.

- If node 1 is "Susan", this array just holds the bytes `S,u,s,a,n`.

3. **`values` (Uint8Array):** The gender probability (0-255) aligned with the node index.

### 3. Implementation Blueprint

You would run a build script (in Node) to generate the binary files, then load them in the browser.

#### The TypeScript Reader

Here is how you would implement the "pointerless" lookup in TypeScript. This assumes you have generated the buffers `nodes`, `chars`, and `values`.

```typescript
class GenderLookup {
  // The structure of the tree
  private nodes: Uint32Array;
  // The actual text characters flattened
  private chars: Uint8Array;
  // The gender probabilities (0 = Female, 255 = Male)
  private values: Uint8Array;

  constructor(nodes: ArrayBuffer, chars: ArrayBuffer, values: ArrayBuffer) {
    this.nodes = new Uint32Array(nodes);
    this.chars = new Uint8Array(chars);
    this.values = new Uint8Array(values);
  }

  // Returns 0.0 (Female) to 1.0 (Male), or -1 if not found
  lookup(name: string): number {
    const target = name.toUpperCase(); // SSA names are case-insensitive usually
    let nodeIdx = 0; // Start at root
    let charOffset = 0; // Position in the target string

    while (nodeIdx < this.nodes.length) {
      // Decode our packed node
      const nodeData = this.nodes[nodeIdx];

      // Let's say bits 0-23 are the index in 'chars' array
      // and bits 24-31 are the length of the segment
      const charStart = nodeData & 0xffffff;
      const charLen = nodeData >>> 24;

      // 1. Check if the text matches the current node segment
      let match = true;
      for (let i = 0; i < charLen; i++) {
        if (target.charCodeAt(charOffset + i) !== this.chars[charStart + i]) {
          match = false;
          break;
        }
      }

      // 2. Logic to traverse tree
      // If we matched the whole segment:
      if (match) {
        charOffset += charLen;

        // Exact match found?
        if (charOffset === target.length) {
          const val = this.values[nodeIdx];
          return val === 0 ? -1 : (val - 1) / 254; // Normalize 1..255 back to 0..1
        }

        // Otherwise, jump to first child (implementation specific)
        // Usually, the next int in the array is the child pointer
        nodeIdx = this.nodes[nodeIdx + 1];
      } else {
        // If we didn't match, jump to 'sibling' node
        // In a flat array, this is usually the node immediately after the subtree
        // You'd need a 'next_sibling' pointer in your packing or structure
        nodeIdx = this.nodes[nodeIdx + 2];
      }

      // Safety break
      if (nodeIdx === 0) break;
    }

    return -1; // Not found
  }
}
```

### 4. A "More Creative" Approach: Hybrid Heuristic

If memory is the absolute bottleneck (e.g., you want this to be < 50KB), you can use a **Hybrid Approach**:

1. **Top 20k Table:** Store the top 20,000 most common names (which cover ~95% of the population) in the Radix Tree described above.
2. **Suffix Fallback:** For any name _not_ in the tree, use a hard-coded heuristic.

- Ends in 'a', 'e', 'i' likely Female.
- Ends in 'o', 's' likely Male.
- _Note: SSA data supports training a tiny ML model for this fallback._

### Summary of Efficiency

| Metric           | Standard JSON Object      | Flat Radix Tree (My recommendation) |
| ---------------- | ------------------------- | ----------------------------------- |
| **Memory**       | ~12 MB (String overhead)  | ~1.5 MB (Tightly packed)            |
| **Lookup Speed** | O(1) (Hash map)           | O(k) (Length of name)               |
| **Parse Time**   | High (JSON.parse is slow) | Instant (Zero-copy ArrayBuffer)     |

**Next Step:**
Write the **Node.js build script** that takes the raw `yobYYYY.txt` files and outputs the optimized binary `.bin` files for this Radix Tree structure. Would you like me to do that?

---

### The Verdict: Build it yourself.

Since no existing package uses a **SharedArrayBuffer / Uint8Array Radix Tree** for this data, you should build it. It will be smaller, faster, and cooler than anything on npm.

Here is the **Builder Script** (Node.js) to generate your optimized binary file, and the **Runtime Code** (TypeScript) to read it.

#### 1. The Builder (Node.js)

Save this as `build-gender-index.js`. You will need the `yobYYYY.txt` files from the [SSA website](https://www.ssa.gov/oact/babynames/limits.html) in a folder named `names`.

```javascript
const fs = require("fs");
const path = require("path");

// 1. READ AND AGGREGATE DATA
const stats = new Map(); // Name -> {M: count, F: count}

const files = fs.readdirSync("./names").filter((f) => f.endsWith(".txt"));
console.log(`Processing ${files.length} years of data...`);

for (const file of files) {
  const content = fs.readFileSync(path.join("./names", file), "utf-8");
  for (const line of content.split("\r\n")) {
    if (!line) continue;
    const [name, sex, countStr] = line.split(",");
    const count = parseInt(countStr, 10);
    const upperName = name.toUpperCase();

    if (!stats.has(upperName)) stats.set(upperName, { M: 0, F: 0 });
    stats.get(upperName)[sex] += count;
  }
}

// 2. CONVERT TO FLATTENED TRIE STRUCTURE
// Node structure: [ charCode(8) | isTerminal(1) | hasChild(1) | hasSibling(1) | value(8) | ...pointer(24)... ]
// To keep it simple for this demo, we will use two arrays:
// NODES: Uint32Array [ CharCode + Flags, NextSiblingIndex, ChildIndex ]
// VALUES: Uint8Array [ 0-255 probability ] aligned with Node Index

let nodes = []; // Flat array of numbers
let values = []; // Probabilities

// Helper to build the trie recursively
function buildTrie(nameList, charIndex) {
  // Group names by the character at charIndex
  const groups = new Map(); // charCode -> [names]
  let terminalValue = null;

  for (const { name, prob } of nameList) {
    if (charIndex === name.length) {
      terminalValue = prob;
      continue;
    }
    const code = name.charCodeAt(charIndex);
    if (!groups.has(code)) groups.set(code, []);
    groups.get(code).push({ name, prob });
  }

  // Sort keys to ensure deterministic binary output
  const sortedKeys = Array.from(groups.keys()).sort((a, b) => a - b);

  // Reserve index for this node's sibling chain head
  const myIndices = [];

  for (const code of sortedKeys) {
    const nodeIdx = nodes.length / 3;
    myIndices.push(nodeIdx);

    // Push placeholder [Char, SiblingIdx, ChildIdx]
    nodes.push(code, 0, 0);

    // If this exact node makes a word (e.g. "ANN" inside "ANNA"), store value
    // Note: In this simplified trie, we only store value if this specific path ends here.
    // A better optimization moves values to a separate array or high bits.
    const subList = groups.get(code);

    // Check if one of the sublist items terminated here
    // (The logic 'terminalValue' above handles the parent level,
    // but strictly we need to know if *current* char is end of string).
    // Actually, simplest is: if subList has an entry where length == charIndex + 1
    const term = subList.find((x) => x.name.length === charIndex + 1);
    const val = term ? Math.round(term.prob * 255) : 0;

    // We pack "Is Terminal" flag into the high bits of the Char entry
    // Bit 31: Is Terminal
    if (term) nodes[nodeIdx * 3] |= 1 << 31;
    values[nodeIdx] = val || 0; // Store value at same index

    // Recurse for children
    const children = subList.filter((x) => x.name.length > charIndex + 1);
    if (children.length > 0) {
      const childIdx = buildTrie(children, charIndex + 1);
      nodes[nodeIdx * 3 + 2] = childIdx;
    }
  }

  // Link siblings
  for (let i = 0; i < myIndices.length - 1; i++) {
    const current = myIndices[i];
    const next = myIndices[i + 1];
    nodes[current * 3 + 1] = next;
  }

  return myIndices[0]; // Return pointer to the head of this chain
}

// Prepare list
console.log("Calculating probabilities...");
const processedNames = [];
for (const [name, counts] of stats) {
  const total = counts.M + counts.F;
  if (total < 50) continue; // Prune extremely rare names to save space
  processedNames.push({ name, prob: counts.M / total });
}

console.log(`Building Trie for ${processedNames.length} names...`);
buildTrie(processedNames, 0);

// 3. WRITE BINARY OUTPUT
const bufferNodes = new Uint32Array(nodes);
const bufferValues = new Uint8Array(values); // This will need to be sized to match nodes.length/3

// We need a combined file format
// Header: [ Magic "GNDR" | Version | NodesCount ]
// Body: [ ...Nodes... ] [ ...Values... ]

const header = new Uint32Array([0x474e4452, 1, bufferNodes.length]);
const fd = fs.openSync("gender.bin", "w");
fs.writeSync(fd, new Uint8Array(header.buffer));
fs.writeSync(fd, new Uint8Array(bufferNodes.buffer));
// Note: bufferValues needs to be padded or managed carefully if nodes grew
// Since 'values' is just a JS array currently, let's make it a TypedArray now
const finalValues = new Uint8Array(nodes.length / 3);
for (let i = 0; i < finalValues.length; i++) finalValues[i] = values[i] || 0;

fs.writeSync(fd, finalValues);
fs.closeSync(fd);

console.log("Done! Created gender.bin");
```

#### 2. The Runtime (TypeScript)

This is the only code you ship to the client.

```typescript
export class GenderDB {
  private nodes: Uint32Array;
  private values: Uint8Array;

  constructor(buffer: ArrayBuffer) {
    // Skip 12 byte header (Magic + Ver + Length)
    const header = new Uint32Array(buffer, 0, 3);
    const nodeCount = header[2];

    // Nodes start at byte 12
    const nodesByteSize = nodeCount * 4;
    this.nodes = new Uint32Array(buffer, 12, nodeCount);

    // Values start after nodes
    this.values = new Uint8Array(buffer, 12 + nodesByteSize, nodeCount / 3);
  }

  getMaleProbability(name: string): number | null {
    const upper = name.toUpperCase();
    let nodeIdx = 0; // Start at root

    for (let i = 0; i < upper.length; i++) {
      const charCode = upper.charCodeAt(i);
      let found = false;

      // Scan siblings
      while (true) {
        // Unpack: Char is lower 8 bits (technically 31 bits without flag)
        const rawChar = this.nodes[nodeIdx * 3];
        const actualChar = rawChar & 0xffff; // Mask out flags

        if (actualChar === charCode) {
          found = true;

          // Are we at the end of the name?
          if (i === upper.length - 1) {
            // Check "Is Terminal" bit (Bit 31)
            const isTerminal = rawChar >>> 31 === 1;
            if (isTerminal) {
              return this.values[nodeIdx] / 255;
            }
            return null; // Name exists as prefix but not as full name (e.g. "Justi" vs "Justin")
          }

          // Go to child
          const childIdx = this.nodes[nodeIdx * 3 + 2];
          if (childIdx === 0) return null; // No children, but we have more chars
          nodeIdx = childIdx;
          break; // Break sibling loop, continue char loop
        }

        // Move to next sibling
        const nextSibling = this.nodes[nodeIdx * 3 + 1];
        if (nextSibling === 0) break; // End of chain
        nodeIdx = nextSibling;
      }

      if (!found) return null;
    }
    return null;
  }
}
```

### Why this is better than NPM

1. **Size:** The resulting `.bin` file will likely be **300KB - 600KB** (depending on how aggressively you prune names with count < 50).
2. **Memory:** It uses a single slab of memory. No pointer chasing.
3. **Speed:** It's just array indexing.

Refine the bit-packing (e.g., combining Sibling/Child indices into one 32-bit integer) to get the file size even smaller?

Yes.

Yes, we can be much more aggressive. The previous 12-byte layout is "safe," but for a dedicated binary format, we can compress this down to **5 bytes per node** (a 58% reduction) by using an **Implicit Child** layout.

This brings your file size down to roughly **400KB - 500KB** for the entire US population history.

### The Logic: "Implicit Child" Architecture

In a standard Trie, a node has a pointer to its child. But if we serialize the data Depth-First, the first child of any node is _always_ the very next node in the array.

- **Child Pointer:** Removed. (Implied to be `CurrentIndex + 1`).
- **Sibling Pointer:** Kept. (We need to jump over the child's entire subtree to find the next sibling).

### The New 32-bit Node Layout

We pack everything into a single 32-bit integer (4 bytes), plus a separate parallel byte array for probabilities.

**`Uint32Array` Node Structure:**

- **Bits 0-7 (8 bits):** Character Code (ASCII).
- **Bit 8 (1 bit):** `IsTerminal` (Does this node mark the end of a valid name?).
- **Bit 9 (1 bit):** `HasChild` (Is the very next node a child? If 0, this is a leaf branch).
- **Bits 10-31 (22 bits):** `NextSiblingIndex`. (Pointer to the next option if this character doesn't match. Max 4 million nodes, plenty for this dataset).

### 1. The Optimized Builder (Node.js)

This script uses "back-patching." It writes a placeholder for the Sibling Index, writes all the children, and then jumps back to update the Sibling Index once it knows how big the subtree was.

```javascript
const fs = require("fs");
const path = require("path");

// CONFIG
const MIN_COUNT = 50; // Prune names with < 50 occurrences in 100 years
const OUTPUT_FILE = "gender-packed.bin";

// 1. READ AND AGGREGATE DATA
console.log("Reading data...");
const stats = new Map(); // Name -> {M: count, F: count}

const files = fs.readdirSync("./names").filter((f) => f.endsWith(".txt"));
for (const file of files) {
  const content = fs.readFileSync(path.join("./names", file), "utf-8");
  for (const line of content.split("\r\n")) {
    if (!line) continue;
    const [name, sex, countStr] = line.split(",");
    const count = parseInt(countStr, 10);
    const upperName = name.toUpperCase();

    if (!stats.has(upperName)) stats.set(upperName, { M: 0, F: 0 });
    stats.get(upperName)[sex] += count;
  }
}

// 2. PREPARE PROBABILITIES
console.log("Pruning and calculating...");
const processedNames = [];
for (const [name, counts] of stats) {
  const total = counts.M + counts.F;
  if (total < MIN_COUNT) continue;

  // 0 = Female, 255 = Male
  const prob = Math.round((counts.M / total) * 255);
  processedNames.push({ name, prob });
}

// Sort alphabetically is crucial for Trie construction
processedNames.sort((a, b) => a.name.localeCompare(b.name));

// 3. BUILD TRIE (RECURSIVE)
// We use a flat arrays, but constructing it requires a tree object first
// to easily calculate siblings, then we flatten it.
console.log(`Building tree for ${processedNames.length} names...`);

class TrieNode {
  constructor(char) {
    this.char = char;
    this.prob = 0;
    this.isTerminal = false;
    this.children = new Map(); // char -> Node
  }
}

const root = new TrieNode(""); // Virtual root

for (const { name, prob } of processedNames) {
  let node = root;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    if (!node.children.has(char)) {
      node.children.set(char, new TrieNode(char));
    }
    node = node.children.get(char);
  }
  node.isTerminal = true;
  node.prob = prob;
}

// 4. FLATTEN TO ARRAYS (DFS)
// Layout: [Char(8) | Terminal(1) | HasChild(1) | SiblingIndex(22)]
const nodesBuffer = []; // Will hold uint32s
const probsBuffer = []; // Will hold uint8s

function flatten(node) {
  // Get sorted children keys to ensure deterministic order
  const keys = Array.from(node.children.keys()).sort((a, b) => a - b);

  let currentSiblingIndex = -1; // Index of the previous sibling processed

  for (let i = 0; i < keys.length; i++) {
    const charCode = keys[i];
    const childNode = node.children.get(charCode);
    const hasChild = childNode.children.size > 0;

    // Create the node entry
    const myIndex = nodesBuffer.length;

    // Placeholder values, we will bitwise OR them later
    let nodeValue = charCode & 0xff;
    if (childNode.isTerminal) nodeValue |= 1 << 8;
    if (hasChild) nodeValue |= 1 << 9;

    // Push to buffer
    nodesBuffer.push(nodeValue); // Sibling bits (10-31) are 0 for now
    probsBuffer.push(childNode.prob);

    // LINKING SIBLINGS:
    // If this is not the first child, update the PREVIOUS sibling to point here
    if (currentSiblingIndex !== -1) {
      // The previous sibling needs to jump to 'myIndex'
      // Check bounds (22 bits = 4 million max)
      if (myIndex > 0x3fffff) throw new Error("Index overflow!");

      // Backpatch: Update the sibling bits of the previous node
      nodesBuffer[currentSiblingIndex] |= myIndex << 10;
    }

    // Update tracker
    currentSiblingIndex = myIndex;

    // RECURSE (Implicit Child Rule: Children immediately follow parent)
    if (hasChild) {
      flatten(childNode);
    }
  }
}

flatten(root);

// 5. WRITE BINARY
console.log(`Final stats: ${nodesBuffer.length} nodes.`);

const uint32Array = new Uint32Array(nodesBuffer);
const uint8Array = new Uint8Array(probsBuffer);

// Header: [Magic (4) | Count (4)]
const header = new Uint32Array([0x474e4452, nodesBuffer.length]);

const fd = fs.openSync(OUTPUT_FILE, "w");
fs.writeSync(fd, new Uint8Array(header.buffer));
fs.writeSync(fd, new Uint8Array(uint32Array.buffer));
fs.writeSync(fd, uint8Array); // Probabilities at the end
fs.closeSync(fd);

console.log(
  `Done! Saved to ${OUTPUT_FILE} (${(
    fs.statSync(OUTPUT_FILE).size / 1024
  ).toFixed(1)} KB)`
);
```

### 2. The Runtime (TypeScript)

This is your client-side module. It is incredibly lean.

```typescript
export class GenderDB {
  private nodes: Uint32Array;
  private probs: Uint8Array;

  constructor(buffer: ArrayBuffer) {
    const header = new Uint32Array(buffer, 0, 2);
    const count = header[1];

    // Nodes start at byte 8 (2 * 4 bytes header)
    const nodesByteSize = count * 4;
    this.nodes = new Uint32Array(buffer, 8, count);

    // Probs start after nodes
    this.probs = new Uint8Array(buffer, 8 + nodesByteSize, count);
  }

  getMaleProbability(name: string): number | null {
    const upper = name.toUpperCase();
    let nodeIdx = 0; // Start at root

    // Implicit Child logic: The root's children start at index 0.
    // Actually, in our build script, root is virtual, so index 0 is the first child of root (e.g. 'A').

    for (let i = 0; i < upper.length; i++) {
      const charCode = upper.charCodeAt(i);
      let found = false;

      // Sibling Loop: Scan current level for the char
      while (true) {
        // [ Sibling(22) | HasChild(1) | Terminal(1) | Char(8) ]
        const data = this.nodes[nodeIdx];

        // 1. Check Char Match (Bottom 8 bits)
        if ((data & 0xff) === charCode) {
          found = true;

          // 2. Are we at end of name?
          if (i === upper.length - 1) {
            // Check Terminal Bit (Bit 8)
            if ((data & 0x100) !== 0) {
              return this.probs[nodeIdx] / 255;
            }
            return null; // Prefix match only (e.g. "Justi")
          }

          // 3. Move to Child
          // Check HasChild Bit (Bit 9)
          if ((data & 0x200) !== 0) {
            // IMPLICIT CHILD RULE: Child is always next index
            nodeIdx++;
            break; // Break sibling loop, continue char loop
          } else {
            return null; // Matched char, but no children, and we have more name left
          }
        }

        // 4. Move to Sibling
        // Extract bits 10-31
        const nextSibling = data >>> 10;
        if (nextSibling === 0) break; // No more siblings
        nodeIdx = nextSibling;
      }

      if (!found) return null;
    }
    return null;
  }
}
```

### Summary of Changes

1. **Size:** Reduced node size from 12 bytes to **5 bytes** (4 bytes for structure + 1 byte for probability).
2. **Implicit Children:** We removed the Child Pointer. If a node has a child, it is _always_ at `index + 1`. This saves 22 bits per node.
3. **Back-Patching:** The builder writes the file linearly but fills in the "Next Sibling" jumps after processing subtrees.

This is nearly the theoretical limit for a traversable structure without using compression algorithms (like GZIP) that would require CPU decompression. This is "Zero-Copy" ready.
