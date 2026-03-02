/**
 * Gender probability lookup module.
 *
 * This module provides efficient gender probability lookup using US Social Security
 * Administration birth name data. Names are stored in an optimized binary trie
 * structure for minimal memory usage and fast O(k) lookups.
 *
 * Usage:
 * ```typescript
 * // Import the data size you need (tree-shakeable)
 * import { createGenderDB } from 'name-tools/gender/all';        // Full dataset
 * import { createGenderDB } from 'name-tools/gender/coverage99'; // 99% coverage
 * import { createGenderDB } from 'name-tools/gender/coverage95'; // 95% coverage
 *
 * const db = createGenderDB();
 *
 * // Look up male probability (0.0 = female, 1.0 = male)
 * const prob = db.getMaleProbability('Alex');  // ~0.5 (ambiguous)
 * const prob2 = db.getMaleProbability('John'); // ~0.99 (male)
 * const prob3 = db.getMaleProbability('Mary'); // ~0.01 (female)
 *
 * // Guess gender (default 80% confidence threshold)
 * const gender = db.guessGender('Chris'); // 'unknown' (below 80% threshold)
 * const gender2 = db.guessGender('John'); // 'male'
 * ```
 */

// Re-export the GenderDB class and types
export { GenderDB, type GenderResult, type GenderNotFound, type GenderLookupResult } from './GenderDB';
