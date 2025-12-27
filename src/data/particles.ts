/**
 * Surname particles from various languages
 * These words typically indicate the start of a surname and should be kept with the last name
 */

// Dutch / Flemish / German
const DUTCH_GERMAN = [
  'van', 'von', 'der', 'den', 'de', 'het', "'t", 't',
  'ten', 'ter', 'te', 'zu', 'und', 'vom', 'am', 'im',
  'von und zu'  // Complex German nobility particle
];

// Romance (French, Italian, Spanish, Portuguese)
const ROMANCE = [
  'la', 'le', 'lo', 'li', 'il', 'el', 'al',
  "d'", 'de', "de'", 'del', 'della', 'dello', 'degli', 'dei',
  'do', 'du', 'des', 'dos', 'das', 'da', 'di',
  'e', 'y', 'i'  // Conjunctions (Spanish/Italian)
];

// Celtic (Irish, Scottish)
const CELTIC = [
  'mac', 'mc', 'mhic', 'mic', "o'", 'ua'
];

// Scandinavian
const SCANDINAVIAN = [
  'af', 'av', 'von'
];

/**
 * Combined list of all particles
 */
export const PARTICLES = [
  ...DUTCH_GERMAN,
  ...ROMANCE,
  ...CELTIC,
  ...SCANDINAVIAN
];

/**
 * Multi-word particles that should be kept together
 * These are checked before single-word particles
 */
export const MULTI_WORD_PARTICLES = [
  'von und zu',
  'de la',
  'de los',
  'de las',
  'van der',
  'van den',
  'van de',
  'de le',
  'da la'
];

/**
 * Check if a string is a known surname particle
 */
export function isParticle(str: string): boolean {
  const cleaned = str.toLowerCase().replace(/\./g, '').trim();
  return PARTICLES.includes(cleaned);
}

/**
 * Check if a sequence of words forms a multi-word particle
 */
export function isMultiWordParticle(words: string[]): string | null {
  const combined = words.join(' ').toLowerCase();

  for (const particle of MULTI_WORD_PARTICLES) {
    if (combined === particle) {
      return particle;
    }
    // Also check if it starts with the particle
    if (combined.startsWith(particle + ' ')) {
      return particle;
    }
  }

  return null;
}
