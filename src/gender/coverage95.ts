/**
 * 95% population coverage gender probability dataset.
 *
 * This dataset includes the most common names that cover approximately 95%
 * of the US population. The smallest bundle size option.
 *
 * Usage:
 * ```typescript
 * import { createGenderDB } from 'name-tools/gender/coverage95';
 * const db = createGenderDB();
 * const prob = db.getMaleProbability('Ashley');
 * ```
 */

import { GenderDB } from './GenderDB';
import { decodeGenderData } from './data/coverage95';

// Re-export types for convenience
export { GenderDB, type GenderResult, type GenderNotFound, type GenderLookupResult } from './GenderDB';

/** Singleton instance for shared use */
let instance: GenderDB | null = null;

/**
 * Create a GenderDB instance with 95% population coverage.
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
