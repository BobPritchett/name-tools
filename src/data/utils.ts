/**
 * Common data-related utility functions
 */

/**
 * Checks if a string (case-insensitive) is present in a list of strings
 * @param list - The list of strings to check against
 * @param value - The value to search for
 * @returns True if value is in list (case-insensitive)
 */
export function isInList(list: readonly string[], value: string): boolean {
  if (!value) return false;
  const cleanedValue = value.toLowerCase().replace(/\./g, '').trim();
  return list.some(item => {
    const cleanedItem = item.toLowerCase().replace(/\./g, '').trim();
    return cleanedItem === cleanedValue;
  });
}

