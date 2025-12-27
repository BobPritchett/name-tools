/**
 * Common surnames used for compound surname detection
 * Particularly important for Spanish and Portuguese naming conventions
 */

// Spanish surnames
const SPANISH = [
  'garcía', 'gonzalez', 'gonzález', 'rodriguez', 'rodríguez',
  'fernandez', 'fernández', 'lopez', 'lópez', 'martinez', 'martínez',
  'sanchez', 'sánchez', 'perez', 'pérez', 'gomez', 'gómez',
  'martin', 'martín', 'jimenez', 'jiménez', 'ruiz',
  'hernandez', 'hernández', 'diaz', 'díaz', 'moreno',
  'alvarez', 'álvarez', 'muñoz', 'romero', 'alonso',
  'gutierrez', 'gutiérrez', 'navarro', 'torres', 'dominguez',
  'domínguez', 'vazquez', 'vázquez', 'ramos', 'gil',
  'ramirez', 'ramírez', 'serrano', 'blanco', 'molina',
  'castro', 'ortiz', 'rubio', 'nuñez', 'márquez',
  'marquez'
];

// Portuguese surnames
const PORTUGUESE = [
  'silva', 'santos', 'ferreira', 'pereira', 'oliveira',
  'costa', 'rodrigues', 'martins', 'jesus', 'sousa',
  'souza', 'fernandes', 'goncalves', 'gonçalves', 'gomes',
  'lopes', 'marques', 'alves', 'almeida', 'ribeiro',
  'pinto', 'carvalho', 'teixeira', 'moreira', 'correia',
  'queirós', 'queiros', 'eça'
];

// Italian surnames
const ITALIAN = [
  'rossi', 'russo', 'ferrari', 'esposito', 'bianchi',
  'romano', 'colombo', 'ricci', 'marino', 'greco',
  'bruno', 'gallo', 'conti', 'de luca', 'costa',
  'giordano', 'mancini', 'rizzo', 'lombardi', 'moretti'
];

// French surnames
const FRENCH = [
  'martin', 'bernard', 'dubois', 'thomas', 'robert',
  'richard', 'petit', 'durand', 'leroy', 'moreau',
  'simon', 'laurent', 'lefebvre', 'michel', 'garcia',
  'david', 'bertrand', 'roux', 'vincent', 'fournier',
  'fontaine', 'rousseau', 'dumas'
];

/**
 * Combined list of common surnames
 */
export const COMMON_SURNAMES = [
  ...SPANISH,
  ...PORTUGUESE,
  ...ITALIAN,
  ...FRENCH
];

/**
 * Common first names to avoid false positives
 * (names that could be either first or last)
 */
export const COMMON_FIRST_NAMES = [
  'mary', 'john', 'william', 'james', 'anne', 'sarah',
  'marie', 'jean', 'george', 'paul', 'lee', 'billy',
  'bob', 'thomas', 'robert', 'michael', 'david',
  'martin', 'pierre', 'maria', 'jose', 'josé'
];

/**
 * Check if a string is a known common surname
 */
export function isCommonSurname(str: string): boolean {
  const cleaned = str.toLowerCase().replace(/\./g, '').trim();
  return COMMON_SURNAMES.includes(cleaned);
}

/**
 * Check if a string is a common first name
 */
export function isCommonFirstName(str: string): boolean {
  const cleaned = str.toLowerCase().replace(/\./g, '').trim();
  return COMMON_FIRST_NAMES.includes(cleaned);
}
