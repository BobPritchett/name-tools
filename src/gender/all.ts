/**
 * Full gender probability dataset (100% of names meeting minimum threshold).
 *
 * This is the largest dataset with all names that have at least 10 occurrences
 * across all years in the SSA database.
 *
 * Import this for maximum coverage at the cost of larger bundle size.
 *
 * Usage:
 * ```typescript
 * import { createGenderDB } from 'name-tools/gender/all';
 * const db = createGenderDB();
 * const prob = db.getMaleProbability('Ashley');
 * ```
 */

import { GenderDB } from './GenderDB';
import { decodeGenderData } from './data/all';

// Re-export types for convenience
export { GenderDB, type GenderResult, type GenderNotFound, type GenderLookupResult } from './GenderDB';

/** Singleton instance for shared use */
let instance: GenderDB | null = null;

/**
 * Create a GenderDB instance with the full dataset.
 *
 * @param options.shared - If true (default), returns a shared singleton instance.
 *                        If false, creates a new instance each time.
 * @returns GenderDB instance
 */
export function createGenderDB(options?: { shared?: boolean }): GenderDB {
  const shared = options?.shared ?? true;

  if (shared && instance) {
    return instance;
  }

  const db = new GenderDB(decodeGenderData());

  if (shared) {
    instance = db;
  }

  return db;
}
