/**
 * Docs-specific entry point that includes all main exports plus the gender module.
 * Used for building the docs bundle with gender lookup functionality.
 */

// Re-export everything from main index
export * from './index';

// Re-export gender module (using coverage95 for smaller bundle size)
export { createGenderDB, GenderDB } from './gender/coverage95';
export type { GenderResult, GenderNotFound, GenderLookupResult } from './gender/coverage95';
