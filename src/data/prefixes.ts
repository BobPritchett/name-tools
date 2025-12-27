import { isInList } from './utils';

/**
 * Common name prefixes/titles including short and long forms.
 * Short forms include comments with their expanded versions.
 */
export const PREFIXES = [
  // Standard Academic/Professional
  'Dr', // Doctor
  'Dr.',
  'Prof', // Professor
  'Prof.',
  'Professor',
  'Rev', // Reverend
  'Rev.',
  'Reverend',
  'Hon', // Honourable
  'Hon.',
  'Honourable',
  'Right Honourable',
  'The Right Honourable',
  'The Hon',
  'The Hon Dr',
  'The Hon Lady',
  'The Hon Lord',
  'The Hon Mrs',
  'The Hon Sir',
  'The Honourable',
  'The Rt Hon', // The Right Honourable
  'The Rt Hon Dr',
  'The Rt Hon Lord',
  'The Rt Hon Sir',
  'The Rt Hon Visc', // The Right Honourable Viscount
  'Justice',
  'Judge',
  'The Learned Judge',

  // Common/Social
  'Mr',
  'Mr.',
  'Mrs',
  'Mrs.',
  'Ms',
  'Ms.',
  'Miss',
  'Master',
  'Mx',
  'M', // Monsieur
  'Mme', // Madame
  'Madam',
  'Madame',

  // Religious
  'Archbishop',
  'Archbishop Emeritus',
  'Archdeacon',
  'Bishop',
  'Bishop Emeritus',
  'Brother',
  'Brother Superior',
  'Canon',
  'Cardinal',
  'Chaplain',
  'Chaplain General',
  'Chaplain-in-Chief',
  'Dom',
  'Elder',
  'Father',
  'Monsignor',
  'Most Reverend',
  'The Most Reverend',
  'Pastor',
  'Provincial',
  'Rabbi',
  'Rector',
  'Rector Magnificus',
  'Rev Canon',
  'Rev Dr',
  'The Reverend Canon',
  'Right Reverend',
  'Sister',
  'Suffragan Bishop',
  'The Venerable',
  'Very Reverend',

  // Military
  'Admiral',
  'Rear Admiral',
  'Vice Admiral',
  'Air Chief Marshal',
  'Air Commodore',
  'Air Marshal',
  'Air Vice Marshal',
  'Brigadier',
  'Brig Gen', // Brigadier General
  'Capt', // Captain
  'Captain',
  'Col', // Colonel
  'Colonel',
  'Colour Sergeant',
  'Commander',
  'Commodore',
  'Cpl', // Corporal
  'Field Marshal',
  'Flight Lieutenant',
  'General',
  'Major General',
  'Lieutenant General',
  'Lance Corporal',
  'Lance Sergeant',
  'Lt', // Lieutenant
  'Lt Col', // Lieutenant Colonel
  'Lt Commander',
  'Lt Cpl', // Lance Corporal
  'Lt General',
  'Major',
  'Marshal of the RAF', // Marshal of the Royal Air Force
  'Petty Officer',
  'Pipe Major',
  'Pvt', // Private
  'Regimental Corporal Major',
  'Regimental Sergeant Major',
  'Second Lieutenant',
  'Senior Aircraftman',
  'Senior Aircraftwoman',
  'Sgt', // Sergeant
  'Squadron Leader',
  'Staff Corporal',
  'Staff Sergeant',
  'Warrant Officer',
  'Warrant Officer Class 1',
  'Warrant Officer Class 2',

  // Nobility/Royalty
  'Archduke',
  'Baron',
  'Baron of Parliament',
  'Baroness',
  'Baronet',
  'Baronial Lord',
  'Count',
  'Count Palatine',
  'Countess',
  'Countess of',
  'Dowager Countess',
  'Dame',
  'Dame Commander',
  'Dame Grand Cross',
  'Duchess',
  'Duke',
  'Earl',
  'The Earl of',
  'Her Grace',
  'Her Majesty',
  'His Majesty',
  'Her Majesty\'s Counsel',
  'Hereditary Lord',
  'His Excellency',
  'HE', // His/Her Excellency
  'Knight Bachelor',
  'Knight Commander',
  'Knight Grand Cross',
  'Knight Marshal',
  'Lady',
  'Lord',
  'Lord Advocate',
  'Lord Chancellor',
  'Lord Chief Justice',
  'Lord High Admiral',
  'Lord High Commissioner',
  'Lord Justice',
  'Lord Lieutenant',
  'Lord Mayor',
  'Lord of the Manor',
  'Lord President of the Council',
  'Marcher Lord',
  'Marchioness',
  'Marquess',
  'Marquis',
  'Premier Duke',
  'Prince',
  'Prince Consort',
  'Princess',
  'Princess Royal',
  'Sir',
  'The Hon Lady',
  'The Hon Lord',
  'Viscount',
  'Viscountess',

  // Political/Legal/Ambassadorial
  'Alderman',
  'Ambassador',
  'Ambassador-at-Large',
  'Chancellor',
  'Chancellor of the Exchequer',
  'Chief Constable',
  'Chief Justice',
  'Cllr', // Councillor
  'Constable of the Tower',
  'Consul',
  'Consul General',
  'Deputy',
  'Deputy High Commissioner',
  'Envoy Extraordinary',
  'HMA', // His/Her Majesty's Ambassador
  'High Steward',
  'KC', // King's Counsel
  'Keeper of the Privy Seal',
  'Minister',
  'Minister of State',
  'Premier',
  'Senator',
  'Sheriff',
  'Speaker of the House',
  'Vice Chancellor',

  // Academic/Fellowship
  'Archchancellor',
  'Dean',
  'Dean Emeritus',
  'Fellow',
  'Headmaster',
  'Headmistress',
  'Lic', // Licentiate
  'Master of Arts',
  'Master of the Rolls',
  'Provost',
  'Provost (academic)',
  'Warden',

  // Combined/Multi-person
  'Brig & Mrs',
  'Commander & Mrs',
  'Lord & Lady',
  'Prof & Dr',
  'Prof & Mrs',
  'Prof & Rev',
  'Prof Dame',
  'Prof Dr',
  'Rev & Mrs',
  'Sir & Lady',
  'The Hon Mrs',
  'The Hon Sir',

  // Others
  'Churchwarden',
  'Freeman of the City',
  'Llc', // Limited Liability Company (rare as prefix)
  'Yeoman Warder',
] as const;

/**
 * Check if a string is a known prefix
 */
export function isPrefix(str: string): boolean {
  return isInList(PREFIXES, str);
}
