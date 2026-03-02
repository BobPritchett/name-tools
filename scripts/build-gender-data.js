/**
 * Build script for generating gender probability binary data from SSA name files.
 *
 * Usage: node scripts/build-gender-data.js
 *
 * This script reads yobYYYY.txt files from ./data/, aggregates male/female counts,
 * and outputs optimized binary trie data for gender probability lookup.
 *
 * CONFIGURATION PARAMETERS (adjust these to experiment with different sizes):
 */

const fs = require("fs");
const path = require("path");

// ============================================================================
// CONFIGURATION - Adjust these parameters to experiment with different sizes
// ============================================================================

const CONFIG = {
  // Directory containing yobYYYY.txt files
  DATA_DIR: path.join(__dirname, "..", "data"),

  // Output directory for generated TypeScript files
  OUTPUT_DIR: path.join(__dirname, "..", "src", "gender", "data"),

  // Minimum total occurrences to include a name (reduces noise from rare names)
  // Higher = smaller file, fewer obscure names
  MIN_OCCURRENCES: 1,

  // Coverage levels to generate (as percentages of total population)
  // Each creates a separate file for tree-shaking
  COVERAGE_LEVELS: {
    all: 1.0, // 100% - all names meeting MIN_OCCURRENCES threshold
    coverage99: 0.99, // 99% of population covered
    coverage95: 0.95, // 95% of population covered
  },

  // Line endings in source files (SSA files use \r\n on Windows)
  LINE_SEPARATOR: /\r?\n/,
};

// ============================================================================
// DATA STRUCTURES
// ============================================================================

class TrieNode {
  constructor(char) {
    this.char = char; // Character code (or empty for root)
    this.prob = 0; // Male probability 0-255 (0=female, 255=male)
    this.isTerminal = false; // Does this node mark end of a valid name?
    this.children = new Map(); // char code -> TrieNode
    this.totalCount = 0; // Total occurrences (for sorting by coverage)
  }
}

// ============================================================================
// STEP 1: Read and aggregate SSA data
// ============================================================================

function readSSAData(dataDir) {
  const stats = new Map(); // Name (uppercase) -> { M: count, F: count }

  const files = fs
    .readdirSync(dataDir)
    .filter((f) => f.match(/^yob\d{4}\.txt$/));
  console.log(`Found ${files.length} year files in ${dataDir}`);

  for (const file of files) {
    const content = fs.readFileSync(path.join(dataDir, file), "utf-8");
    for (const line of content.split(CONFIG.LINE_SEPARATOR)) {
      if (!line.trim()) continue;
      const [name, sex, countStr] = line.split(",");
      if (!name || !sex || !countStr) continue;

      const count = parseInt(countStr, 10);
      const upperName = name.toUpperCase();

      if (!stats.has(upperName)) {
        stats.set(upperName, { M: 0, F: 0 });
      }
      stats.get(upperName)[sex] += count;
    }
  }

  return stats;
}

// ============================================================================
// STEP 2: Calculate probabilities and sort by coverage
// ============================================================================

function processNames(stats, minOccurrences) {
  const processed = [];
  const discarded = []; // Names filtered out by MIN_OCCURRENCES
  let totalPopulation = 0;

  for (const [name, counts] of stats) {
    const total = counts.M + counts.F;
    if (total < minOccurrences) {
      discarded.push({ name, total });
      continue;
    }

    // Male probability: 0 = 100% female, 255 = 100% male
    // We use 1-255 range (0 reserved for "not found" in lookups)
    const malePct = counts.M / total;
    const prob = Math.round(malePct * 254) + 1; // 1 = 100% female, 255 = 100% male

    processed.push({
      name,
      prob,
      total,
    });
    totalPopulation += total;
  }

  // Sort by total occurrences (descending) for coverage calculation
  processed.sort((a, b) => b.total - a.total);

  // Sort discarded by total occurrences (descending) for readability
  discarded.sort((a, b) => b.total - a.total);

  return { processed, totalPopulation, discarded };
}

// ============================================================================
// STEP 3: Filter names by population coverage
// ============================================================================

function filterByCoverage(processed, totalPopulation, coverageTarget) {
  if (coverageTarget >= 1.0) {
    return processed;
  }

  const targetCount = totalPopulation * coverageTarget;
  let cumulative = 0;
  const result = [];

  for (const item of processed) {
    result.push(item);
    cumulative += item.total;
    if (cumulative >= targetCount) break;
  }

  return result;
}

// ============================================================================
// STEP 4: Build trie structure
// ============================================================================

function buildTrie(names) {
  const root = new TrieNode("");

  for (const { name, prob, total } of names) {
    let node = root;
    for (let i = 0; i < name.length; i++) {
      const charCode = name.charCodeAt(i);
      if (!node.children.has(charCode)) {
        node.children.set(charCode, new TrieNode(charCode));
      }
      node = node.children.get(charCode);
    }
    node.isTerminal = true;
    node.prob = prob;
    node.totalCount = total;
  }

  return root;
}

// ============================================================================
// STEP 5: Flatten trie to binary format
// ============================================================================

/**
 * Binary format (per node):
 * - 4 bytes (Uint32): Packed node data
 *   - Bits 0-7:   Character code (ASCII)
 *   - Bit 8:      IsTerminal flag
 *   - Bit 9:      HasChild flag (child is always next index if true)
 *   - Bits 10-31: NextSibling index (22 bits, max ~4 million nodes)
 * - 1 byte (Uint8): Probability value (1-255, 0 = unused)
 *
 * Total: 5 bytes per node
 *
 * Header:
 * - 4 bytes: Magic number 'GNDR' (0x47_4E_44_52)
 * - 4 bytes: Node count
 */

function flattenTrie(root) {
  const nodesBuffer = []; // Uint32 values
  const probsBuffer = []; // Uint8 values

  function flatten(node) {
    // Sort children by character code for deterministic output
    const keys = Array.from(node.children.keys()).sort((a, b) => a - b);
    let prevSiblingIndex = -1;

    for (let i = 0; i < keys.length; i++) {
      const charCode = keys[i];
      const child = node.children.get(charCode);
      const hasChildren = child.children.size > 0;

      const myIndex = nodesBuffer.length;

      // Pack: char(8) | terminal(1) | hasChild(1) | sibling(22)
      let packed = charCode & 0xff;
      if (child.isTerminal) packed |= 1 << 8;
      if (hasChildren) packed |= 1 << 9;
      // Sibling bits (10-31) start as 0, will be back-patched

      nodesBuffer.push(packed);
      probsBuffer.push(child.prob);

      // Back-patch previous sibling to point to this node
      if (prevSiblingIndex !== -1) {
        if (myIndex > 0x3fffff) {
          throw new Error(`Index overflow: ${myIndex} exceeds 22-bit limit`);
        }
        nodesBuffer[prevSiblingIndex] |= myIndex << 10;
      }

      prevSiblingIndex = myIndex;

      // Recurse for children (implicit child rule: children follow parent)
      if (hasChildren) {
        flatten(child);
      }
    }
  }

  flatten(root);

  return { nodesBuffer, probsBuffer };
}

// ============================================================================
// STEP 6: Create binary buffer
// ============================================================================

function createBinaryBuffer(nodesBuffer, probsBuffer) {
  // Header: Magic (4) + Count (4) = 8 bytes
  // Nodes: count * 4 bytes
  // Probs: count * 1 byte
  const nodeCount = nodesBuffer.length;
  const totalSize = 8 + nodeCount * 4 + nodeCount;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // Header - use little-endian for compatibility with Uint32Array
  view.setUint32(0, 0x474e4452, true); // 'GNDR' magic (little-endian)
  view.setUint32(4, nodeCount, true);

  // Nodes (Uint32) - use little-endian to match Uint32Array native read
  let offset = 8;
  for (let i = 0; i < nodeCount; i++) {
    view.setUint32(offset, nodesBuffer[i], true);
    offset += 4;
  }

  // Probabilities (Uint8)
  for (let i = 0; i < nodeCount; i++) {
    view.setUint8(offset, probsBuffer[i]);
    offset += 1;
  }

  return buffer;
}

// ============================================================================
// STEP 7: Generate TypeScript module
// ============================================================================

function generateTypeScriptModule(buffer, coverageLabel, stats) {
  const base64 = Buffer.from(buffer).toString("base64");

  return `/**
 * Gender probability data - ${coverageLabel}
 *
 * Auto-generated by scripts/build-gender-data.js
 * DO NOT EDIT MANUALLY
 *
 * Statistics:
 * - Names included: ${stats.nameCount.toLocaleString()}
 * - Population coverage: ${(stats.populationCoverage * 100).toFixed(2)}%
 * - Binary size: ${(buffer.byteLength / 1024).toFixed(1)} KB
 * - Generated: ${new Date().toISOString()}
 */

/** Base64-encoded binary trie data */
export const GENDER_DATA_BASE64 = '${base64}';

/** Decode base64 to ArrayBuffer */
export function decodeGenderData(): ArrayBuffer {
  if (typeof atob === 'function') {
    // Browser environment
    const binary = atob(GENDER_DATA_BASE64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  } else {
    // Node.js environment
    return Buffer.from(GENDER_DATA_BASE64, 'base64').buffer;
  }
}
`;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log("=".repeat(60));
  console.log("Gender Data Builder");
  console.log("=".repeat(60));
  console.log();

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }

  // Step 1: Read SSA data
  console.log("Step 1: Reading SSA data files...");
  const stats = readSSAData(CONFIG.DATA_DIR);
  const totalUniqueNames = stats.size;
  console.log(`  Found ${totalUniqueNames.toLocaleString()} unique names`);
  console.log();

  // Step 2: Process names
  console.log(
    `Step 2: Processing names (min occurrences: ${CONFIG.MIN_OCCURRENCES})...`
  );
  const { processed, totalPopulation, discarded } = processNames(
    stats,
    CONFIG.MIN_OCCURRENCES
  );
  console.log(`  Retained ${processed.length.toLocaleString()} names`);
  console.log(
    `  Discarded ${discarded.length.toLocaleString()} names (below MIN_OCCURRENCES)`
  );
  console.log(`  Total population: ${totalPopulation.toLocaleString()}`);
  console.log();

  // Generate each coverage level
  const results = [];

  for (const [label, coverage] of Object.entries(CONFIG.COVERAGE_LEVELS)) {
    console.log(
      `Step 3-6: Building "${label}" (${(coverage * 100).toFixed(
        0
      )}% coverage)...`
    );

    // Step 3: Filter by coverage
    const filtered = filterByCoverage(processed, totalPopulation, coverage);
    const actualCoverage =
      filtered.reduce((sum, n) => sum + n.total, 0) / totalPopulation;
    console.log(`  Names: ${filtered.length.toLocaleString()}`);

    // Step 4: Build trie
    const trie = buildTrie(filtered);

    // Step 5: Flatten to binary
    const { nodesBuffer, probsBuffer } = flattenTrie(trie);
    console.log(`  Nodes: ${nodesBuffer.length.toLocaleString()}`);

    // Step 6: Create buffer
    const buffer = createBinaryBuffer(nodesBuffer, probsBuffer);
    console.log(`  Size: ${(buffer.byteLength / 1024).toFixed(1)} KB`);

    // Step 7: Generate TypeScript
    const tsCode = generateTypeScriptModule(buffer, label, {
      nameCount: filtered.length,
      populationCoverage: actualCoverage,
    });

    const filename = `${label}.ts`;
    fs.writeFileSync(path.join(CONFIG.OUTPUT_DIR, filename), tsCode);
    console.log(`  Output: ${filename}`);
    console.log();

    results.push({
      label,
      coverage: actualCoverage,
      nameCount: filtered.length,
      nodeCount: nodesBuffer.length,
      sizeKB: buffer.byteLength / 1024,
    });
  }

  // Summary
  console.log("=".repeat(60));
  console.log("Summary");
  console.log("=".repeat(60));
  console.log();
  console.log(
    `Total unique names in source data: ${totalUniqueNames.toLocaleString()}`
  );
  console.log();
  console.log("| Coverage     | Names      | Nodes      | Size (KB) |");
  console.log("|--------------|------------|------------|-----------|");
  for (const r of results) {
    console.log(
      `| ${r.label.padEnd(12)} | ${r.nameCount
        .toLocaleString()
        .padStart(10)} | ${r.nodeCount
        .toLocaleString()
        .padStart(10)} | ${r.sizeKB.toFixed(1).padStart(9)} |`
    );
  }
  console.log();

  // Report total binary size
  const totalSizeKB = results.reduce((sum, r) => sum + r.sizeKB, 0);
  console.log(`Total binary data size: ${totalSizeKB.toFixed(1)} KB`);
  console.log();

  // Report discarded names (top 20 by occurrence count)
  if (discarded.length > 0) {
    const top20 = discarded.slice(0, 20);
    console.log(
      `Discarded names (${discarded.length} total below MIN_OCCURRENCES=${CONFIG.MIN_OCCURRENCES}, top 20 by occurrences):`
    );
    console.log(top20.map((d) => d.name).join(", "));
    console.log();
  }

  console.log("Done! Generated files in:", CONFIG.OUTPUT_DIR);
}

main();
