/**
 * GenderDB - Efficient gender probability lookup using a binary trie structure.
 *
 * This class provides O(k) name lookup where k is the length of the name.
 * It uses a compact binary format with implicit child pointers for minimal memory usage.
 *
 * Binary format:
 * - Header: 8 bytes (Magic 'GNDR' + node count)
 * - Nodes: 4 bytes each (packed char, flags, sibling pointer)
 * - Probs: 1 byte each (gender probability 1-255)
 */

export interface GenderResult {
  /** Probability that the name is male (0.0 = female, 1.0 = male) */
  maleProbability: number;
  /** Raw probability value from database (1-255) */
  rawValue: number;
  /** Whether the name was found in the database */
  found: true;
}

export interface GenderNotFound {
  found: false;
}

export type GenderLookupResult = GenderResult | GenderNotFound;

/**
 * Gender probability database using optimized binary trie storage.
 */
export class GenderDB {
  private nodes: Uint32Array;
  private probs: Uint8Array;
  private readonly nodeCount: number;

  /**
   * Create a GenderDB instance from a binary ArrayBuffer.
   * @param buffer - ArrayBuffer containing the binary trie data
   */
  constructor(buffer: ArrayBuffer) {
    // Validate header (little-endian format)
    const header = new DataView(buffer, 0, 8);
    const magic = header.getUint32(0, true); // little-endian
    if (magic !== 0x474E4452) { // 'GNDR'
      throw new Error('Invalid gender data: bad magic number');
    }

    this.nodeCount = header.getUint32(4, true); // little-endian

    // Nodes start at byte 8
    const nodesByteSize = this.nodeCount * 4;
    this.nodes = new Uint32Array(buffer, 8, this.nodeCount);

    // Probs start after nodes
    this.probs = new Uint8Array(buffer, 8 + nodesByteSize, this.nodeCount);
  }

  /**
   * Get the number of nodes in the trie.
   */
  get size(): number {
    return this.nodeCount;
  }

  /**
   * Look up the male probability for a given name.
   *
   * @param name - The first name to look up (case-insensitive)
   * @returns GenderLookupResult with probability if found, or { found: false }
   */
  lookup(name: string): GenderLookupResult {
    if (!name || name.length === 0) {
      return { found: false };
    }

    const upper = name.toUpperCase();
    let nodeIdx = 0;

    for (let i = 0; i < upper.length; i++) {
      const charCode = upper.charCodeAt(i);
      let found = false;

      // Sibling loop: scan current level for matching character
      while (true) {
        if (nodeIdx >= this.nodeCount) {
          return { found: false };
        }

        const data = this.nodes[nodeIdx];

        // Extract character (bits 0-7)
        const nodeChar = data & 0xFF;

        if (nodeChar === charCode) {
          found = true;

          // Check if we're at the end of the name
          if (i === upper.length - 1) {
            // Check terminal flag (bit 8)
            if ((data & 0x100) !== 0) {
              const rawValue = this.probs[nodeIdx];
              // Convert 1-255 range to 0.0-1.0
              // 1 = 0% male (100% female), 255 = 100% male
              const maleProbability = (rawValue - 1) / 254;
              return {
                maleProbability,
                rawValue,
                found: true,
              };
            }
            // Prefix match only (e.g., "JUSTI" when "JUSTIN" exists)
            return { found: false };
          }

          // Check hasChild flag (bit 9)
          if ((data & 0x200) !== 0) {
            // Implicit child rule: child is always next index
            nodeIdx++;
            break; // Break sibling loop, continue character loop
          } else {
            // Matched character but no children, and more characters to match
            return { found: false };
          }
        }

        // Move to next sibling (bits 10-31)
        const nextSibling = data >>> 10;
        if (nextSibling === 0) {
          // No more siblings
          break;
        }
        nodeIdx = nextSibling;
      }

      if (!found) {
        return { found: false };
      }
    }

    return { found: false };
  }

  /**
   * Convenience method to get male probability as a number.
   * Returns null if name not found.
   *
   * @param name - The first name to look up
   * @returns Male probability (0.0-1.0) or null if not found
   */
  getMaleProbability(name: string): number | null {
    const result = this.lookup(name);
    return result.found ? result.maleProbability : null;
  }

  /**
   * Convenience method to get female probability as a number.
   * Returns null if name not found.
   *
   * @param name - The first name to look up
   * @returns Female probability (0.0-1.0) or null if not found
   */
  getFemaleProbability(name: string): number | null {
    const result = this.lookup(name);
    return result.found ? 1 - result.maleProbability : null;
  }

  /**
   * Make an informed guess about the likely gender based on probability threshold.
   *
   * @param name - The first name to look up
   * @param threshold - Confidence threshold for guessing (default 0.8, meaning 80% confidence required)
   * @returns 'male', 'female', 'unknown', or null if name not found in database
   */
  guessGender(
    name: string,
    threshold: number = 0.8
  ): 'male' | 'female' | 'unknown' | null {
    const result = this.lookup(name);
    if (!result.found) {
      return null;
    }

    const { maleProbability } = result;
    if (maleProbability >= threshold) {
      return 'male';
    } else if (maleProbability <= 1 - threshold) {
      return 'female';
    }
    return 'unknown';
  }

  /**
   * Check if a name exists in the database.
   *
   * @param name - The first name to check
   * @returns true if the name exists in the database
   */
  has(name: string): boolean {
    return this.lookup(name).found;
  }
}
