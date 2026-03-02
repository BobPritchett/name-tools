/**
 * 99% population coverage gender probability dataset.
 *
 * This dataset includes the most common names that cover approximately 99%
 * of the US population. A good balance between coverage and bundle size.
 *
 * Usage:
 * ```typescript
 * import { createGenderDB } from 'name-tools/gender/coverage99';
 * const db = createGenderDB();
 * const prob = db.getMaleProbability('Ashley');
 * ```
 */

import { GenderDB } from './GenderDB';
import { decodeGenderData } from './data/coverage99';

// Re-export types for convenience
export { GenderDB, type GenderResult, type GenderNotFound, type GenderLookupResult } from './GenderDB';

/** Singleton instance for shared use */
let instance: GenderDB | null = null;

/**
 * Create a GenderDB instance with 99% population coverage.
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
