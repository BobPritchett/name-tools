import type { NameAffixTokenType } from '../types';

export type AffixContext = 'prefix' | 'suffix';

export type AffixEntry = {
  /**
   * Stable identifier for the entry (for formatting + future locale rules).
   */
  id: string;

  /**
   * Token type (parsing/formatting metadata).
   */
  type: NameAffixTokenType;

  /**
   * Where the affix can appear.
   */
  ctx: AffixContext | 'both';

  /**
   * Canonical, display-ready forms. These are authoritative:
   * correct casing, punctuation, spacing, apostrophes, hyphenation, etc.
   */
  short?: string;
  long?: string;

  /**
   * Additional acceptable inputs. These are NOT used for rendering.
   * They will be normalized for matching.
   */
  variants?: readonly string[];
};

export function normalizeAffixVariantForMatch(value: string): string {
  // Matching layer only: tolerate chaos.
  // - collapse whitespace
  // - unify apostrophes (’ → ')
  // - fold diacritics (Señor → SENOR)
  // - remove periods
  // - case-fold to upper
  // - trim edge punctuation commonly seen around affixes
  return value
    .trim()
    .replace(/^[,;:\s]+/, '')
    .replace(/[,;:\s]+$/, '')
    .replace(/\s+/g, ' ')
    .replace(/[\u2019\u2018\u02BC]/g, "'")
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\./g, '')
    .toUpperCase()
    .trim();
}

export function buildAffixVariantIndex(entries: readonly AffixEntry[], ctx: AffixContext): Map<string, AffixEntry> {
  const map = new Map<string, AffixEntry>();

  for (const e of entries) {
    if (e.ctx !== 'both' && e.ctx !== ctx) continue;

    const candidates: string[] = [];
    if (e.short) candidates.push(e.short);
    if (e.long) candidates.push(e.long);
    if (e.variants) candidates.push(...e.variants);

    for (const v of candidates) {
      const k = normalizeAffixVariantForMatch(v);
      if (!k) continue;
      // First writer wins for determinism; keep dataset ordered.
      if (!map.has(k)) map.set(k, e);
    }
  }

  return map;
}

/**
 * Canonical prefixes/titles (MVP set; expandable).
 */
export const PREFIX_AFFIX_ENTRIES: readonly AffixEntry[] = [
  // ---------------------------------------------------------------------------
  // English-speaking countries (US/UK/CA/AU/NZ/IE) — common honorifics
  // ---------------------------------------------------------------------------
  { id: 'mr', type: 'honorific', ctx: 'prefix', short: 'Mr.', long: 'Mister', variants: ['mr', 'mr.'] },
  { id: 'mrs', type: 'honorific', ctx: 'prefix', short: 'Mrs.', variants: ['mrs', 'mrs.'] },
  { id: 'ms', type: 'honorific', ctx: 'prefix', short: 'Ms.', variants: ['ms', 'ms.'] },
  { id: 'miss', type: 'honorific', ctx: 'prefix', short: 'Miss', variants: ['miss'] },
  { id: 'mx', type: 'honorific', ctx: 'prefix', short: 'Mx', variants: ['mx', 'mx.'] },
  { id: 'madam', type: 'honorific', ctx: 'prefix', short: 'Madam', variants: ['madam'] },

  { id: 'dr', type: 'honorific', ctx: 'prefix', short: 'Dr.', long: 'Doctor', variants: ['dr', 'dr.'] },
  { id: 'prof', type: 'honorific', ctx: 'prefix', short: 'Prof.', long: 'Professor', variants: ['prof', 'prof.', 'professor'] },

  // Legal/professional (prefix usage varies; keep as tolerant input)
  { id: 'atty', type: 'professional', ctx: 'prefix', short: 'Atty.', long: 'Attorney', variants: ['atty', 'atty.', 'attorney'] },
  { id: 'lic', type: 'professional', ctx: 'prefix', short: 'Lic.', long: 'Licentiate', variants: ['lic', 'lic.', 'licentiate'] },
  // Corporate designator; uncommon as a true name prefix, but supported for tolerance.
  { id: 'llc', type: 'professional', ctx: 'prefix', short: 'LLC', variants: ['llc', 'l.l.c.'] },

  // ---------------------------------------------------------------------------
  // Clergy / religious (common in English + EU contexts)
  // ---------------------------------------------------------------------------
  { id: 'rev', type: 'religious', ctx: 'prefix', short: 'Rev.', long: 'Reverend', variants: ['rev', 'rev.', 'reverend'] },
  { id: 'revd', type: 'religious', ctx: 'prefix', short: 'Revd', long: 'Reverend', variants: ['revd', 'revd.', 'rev d', 'rev. d.'] },
  { id: 'fr', type: 'religious', ctx: 'prefix', short: 'Fr.', long: 'Father', variants: ['fr', 'fr.', 'father'] },
  { id: 'sr_sister', type: 'religious', ctx: 'prefix', short: 'Sr.', long: 'Sister', variants: ['sr', 'sr.', 'sister'] },
  { id: 'br', type: 'religious', ctx: 'prefix', short: 'Br.', long: 'Brother', variants: ['br', 'br.', 'brother'] },
  { id: 'rabbi', type: 'religious', ctx: 'prefix', short: 'Rabbi', variants: ['rabbi'] },
  { id: 'imam', type: 'religious', ctx: 'prefix', short: 'Imam', variants: ['imam'] },
  { id: 'pastor', type: 'religious', ctx: 'prefix', short: 'Pastor', variants: ['pastor'] },
  { id: 'monsignor', type: 'religious', ctx: 'prefix', short: 'Monsignor', variants: ['monsignor', 'msgr', 'msgr.'] },

  // Higher clergy + Christian honor styles (UK/EU common)
  { id: 'canon', type: 'religious', ctx: 'prefix', short: 'Canon', variants: ['canon'] },
  { id: 'cardinal', type: 'religious', ctx: 'prefix', short: 'Cardinal', variants: ['cardinal'] },
  { id: 'archdeacon', type: 'religious', ctx: 'prefix', short: 'Archdeacon', variants: ['archdeacon'] },
  { id: 'archbishop', type: 'religious', ctx: 'prefix', short: 'Archbishop', variants: ['archbishop'] },
  { id: 'archbishop_emeritus', type: 'religious', ctx: 'prefix', short: 'Archbishop Emeritus', variants: ['archbishop emeritus'] },
  { id: 'bishop', type: 'religious', ctx: 'prefix', short: 'Bishop', variants: ['bishop'] },
  { id: 'bishop_emeritus', type: 'religious', ctx: 'prefix', short: 'Bishop Emeritus', variants: ['bishop emeritus'] },
  { id: 'suffragan_bishop', type: 'religious', ctx: 'prefix', short: 'Suffragan Bishop', variants: ['suffragan bishop'] },
  { id: 'dom', type: 'religious', ctx: 'prefix', short: 'Dom', variants: ['dom'] },
  { id: 'elder', type: 'religious', ctx: 'prefix', short: 'Elder', variants: ['elder'] },
  { id: 'brother_superior', type: 'religious', ctx: 'prefix', short: 'Brother Superior', variants: ['brother superior'] },
  { id: 'provincial', type: 'religious', ctx: 'prefix', short: 'Provincial', variants: ['provincial'] },

  { id: 'chaplain', type: 'religious', ctx: 'prefix', short: 'Chaplain', variants: ['chaplain'] },
  { id: 'chaplain_general', type: 'religious', ctx: 'prefix', short: 'Chaplain General', variants: ['chaplain general'] },
  { id: 'chaplain_in_chief', type: 'religious', ctx: 'prefix', short: 'Chaplain-in-Chief', variants: ['chaplain-in-chief', 'chaplain in chief'] },

  { id: 'most_reverend', type: 'religious', ctx: 'prefix', short: 'Most Reverend', variants: ['most reverend'] },
  { id: 'the_most_reverend', type: 'religious', ctx: 'prefix', short: 'The Most Reverend', variants: ['the most reverend'] },
  { id: 'right_reverend', type: 'religious', ctx: 'prefix', short: 'Right Reverend', variants: ['right reverend'] },
  { id: 'very_reverend', type: 'religious', ctx: 'prefix', short: 'Very Reverend', variants: ['very reverend'] },
  { id: 'the_venerable', type: 'religious', ctx: 'prefix', short: 'The Venerable', variants: ['the venerable'] },

  // Combined honorifics (common in fixtures and UK usage)
  { id: 'rev_canon', type: 'religious', ctx: 'prefix', short: 'Rev. Canon', long: 'Reverend Canon', variants: ['rev canon', 'rev. canon', 'the reverend canon'] },
  { id: 'rev_dr', type: 'religious', ctx: 'prefix', short: 'Rev. Dr.', variants: ['rev dr', 'rev. dr', 'rev. dr.'] },

  // ---------------------------------------------------------------------------
  // Military / police ranks (primarily English canonical forms; EU input variants included)
  // ---------------------------------------------------------------------------
  { id: 'pvt', type: 'military', ctx: 'prefix', short: 'Pvt.', long: 'Private', variants: ['pvt', 'pvt.', 'private'] },
  { id: 'cpl', type: 'military', ctx: 'prefix', short: 'Cpl.', long: 'Corporal', variants: ['cpl', 'cpl.', 'corporal'] },
  { id: 'sgt', type: 'military', ctx: 'prefix', short: 'Sgt.', long: 'Sergeant', variants: ['sgt', 'sgt.', 'sergeant'] },
  { id: 'lt', type: 'military', ctx: 'prefix', short: 'Lt.', long: 'Lieutenant', variants: ['lt', 'lt.', 'lieutenant'] },
  { id: 'capt', type: 'military', ctx: 'prefix', short: 'Capt.', long: 'Captain', variants: ['capt', 'capt.', 'cpt', 'cpt.', 'captain'] },
  { id: 'maj', type: 'military', ctx: 'prefix', short: 'Maj.', long: 'Major', variants: ['maj', 'maj.', 'major'] },
  { id: 'col', type: 'military', ctx: 'prefix', short: 'Col.', long: 'Colonel', variants: ['col', 'col.', 'colonel'] },
  { id: 'gen', type: 'military', ctx: 'prefix', short: 'Gen.', long: 'General', variants: ['gen', 'gen.', 'general'] },
  { id: 'adm', type: 'military', ctx: 'prefix', short: 'Adm.', long: 'Admiral', variants: ['adm', 'adm.', 'admiral'] },
  { id: 'air_chief_marshal', type: 'military', ctx: 'prefix', short: 'Air Chief Marshal', variants: ['air chief marshal'] },

  // Expanded ranks (common UK/US and some Commonwealth usage)
  { id: 'rear_admiral', type: 'military', ctx: 'prefix', short: 'Rear Admiral', variants: ['rear admiral'] },
  { id: 'vice_admiral', type: 'military', ctx: 'prefix', short: 'Vice Admiral', variants: ['vice admiral'] },
  { id: 'air_commodore', type: 'military', ctx: 'prefix', short: 'Air Commodore', variants: ['air commodore'] },
  { id: 'air_marshal', type: 'military', ctx: 'prefix', short: 'Air Marshal', variants: ['air marshal'] },
  { id: 'air_vice_marshal', type: 'military', ctx: 'prefix', short: 'Air Vice Marshal', variants: ['air vice marshal'] },
  { id: 'field_marshal', type: 'military', ctx: 'prefix', short: 'Field Marshal', variants: ['field marshal'] },
  { id: 'marshal_of_the_raf', type: 'military', ctx: 'prefix', short: 'Marshal of the RAF', long: 'Marshal of the Royal Air Force', variants: ['marshal of the raf', 'marshal of the r.a.f.'] },
  { id: 'flight_lieutenant', type: 'military', ctx: 'prefix', short: 'Flight Lieutenant', variants: ['flight lieutenant'] },
  { id: 'squadron_leader', type: 'military', ctx: 'prefix', short: 'Squadron Leader', variants: ['squadron leader'] },
  { id: 'petty_officer', type: 'military', ctx: 'prefix', short: 'Petty Officer', variants: ['petty officer'] },
  { id: 'pipe_major', type: 'military', ctx: 'prefix', short: 'Pipe Major', variants: ['pipe major'] },
  { id: 'lance_corporal', type: 'military', ctx: 'prefix', short: 'Lance Corporal', variants: ['lance corporal'] },
  { id: 'lance_sergeant', type: 'military', ctx: 'prefix', short: 'Lance Sergeant', variants: ['lance sergeant'] },
  { id: 'second_lieutenant', type: 'military', ctx: 'prefix', short: 'Second Lieutenant', variants: ['second lieutenant'] },
  { id: 'senior_aircraftman', type: 'military', ctx: 'prefix', short: 'Senior Aircraftman', variants: ['senior aircraftman'] },
  { id: 'senior_aircraftwoman', type: 'military', ctx: 'prefix', short: 'Senior Aircraftwoman', variants: ['senior aircraftwoman'] },
  { id: 'staff_corporal', type: 'military', ctx: 'prefix', short: 'Staff Corporal', variants: ['staff corporal'] },
  { id: 'staff_sergeant', type: 'military', ctx: 'prefix', short: 'Staff Sergeant', variants: ['staff sergeant'] },
  { id: 'warrant_officer', type: 'military', ctx: 'prefix', short: 'Warrant Officer', variants: ['warrant officer'] },
  { id: 'warrant_officer_class_1', type: 'military', ctx: 'prefix', short: 'Warrant Officer Class 1', variants: ['warrant officer class 1', 'warrant officer class i'] },
  { id: 'warrant_officer_class_2', type: 'military', ctx: 'prefix', short: 'Warrant Officer Class 2', variants: ['warrant officer class 2', 'warrant officer class ii'] },
  { id: 'brigadier', type: 'military', ctx: 'prefix', short: 'Brigadier', variants: ['brigadier'] },
  { id: 'brig_gen', type: 'military', ctx: 'prefix', short: 'Brig Gen', long: 'Brigadier General', variants: ['brig gen', 'brig. gen.', 'brigadier general'] },
  { id: 'regimental_corporal_major', type: 'military', ctx: 'prefix', short: 'Regimental Corporal Major', variants: ['regimental corporal major'] },
  { id: 'regimental_sergeant_major', type: 'military', ctx: 'prefix', short: 'Regimental Sergeant Major', variants: ['regimental sergeant major'] },
  { id: 'colour_sergeant', type: 'military', ctx: 'prefix', short: 'Colour Sergeant', variants: ['colour sergeant', 'color sergeant'] },
  { id: 'commander_rank', type: 'military', ctx: 'prefix', short: 'Commander', variants: ['commander'] },
  { id: 'commodore', type: 'military', ctx: 'prefix', short: 'Commodore', variants: ['commodore'] },
  { id: 'lt_col', type: 'military', ctx: 'prefix', short: 'Lt Col', long: 'Lieutenant Colonel', variants: ['lt col', 'lt. col.', 'lieutenant colonel'] },
  { id: 'lt_commander', type: 'military', ctx: 'prefix', short: 'Lt Commander', variants: ['lt commander', 'lt. commander', 'lieutenant commander'] },
  { id: 'lt_cpl', type: 'military', ctx: 'prefix', short: 'Lt Cpl', variants: ['lt cpl', 'lt. cpl.'] },
  { id: 'lt_general', type: 'military', ctx: 'prefix', short: 'Lt General', long: 'Lieutenant General', variants: ['lt general', 'lt. general', 'lieutenant general'] },
  { id: 'major_general', type: 'military', ctx: 'prefix', short: 'Major General', variants: ['major general'] },

  // ---------------------------------------------------------------------------
  // UK/IE/CA/AU/NZ styles, nobility, and honorific styles (treated as "style")
  // ---------------------------------------------------------------------------
  { id: 'sir', type: 'honorific', ctx: 'prefix', short: 'Sir', variants: ['sir'] },
  { id: 'dame', type: 'honorific', ctx: 'prefix', short: 'Dame', variants: ['dame'] },
  { id: 'dame_commander', type: 'honorific', ctx: 'prefix', short: 'Dame Commander', variants: ['dame commander'] },
  { id: 'dame_grand_cross', type: 'honorific', ctx: 'prefix', short: 'Dame Grand Cross', variants: ['dame grand cross'] },

  { id: 'lord', type: 'style', ctx: 'prefix', short: 'Lord', variants: ['lord'] },
  { id: 'lady', type: 'style', ctx: 'prefix', short: 'Lady', variants: ['lady'] },
  { id: 'lord_lieutenant', type: 'style', ctx: 'prefix', short: 'Lord Lieutenant', variants: ['lord lieutenant'] },
  { id: 'lord_mayor', type: 'style', ctx: 'prefix', short: 'Lord Mayor', variants: ['lord mayor'] },
  { id: 'lord_high_admiral', type: 'style', ctx: 'prefix', short: 'Lord High Admiral', variants: ['lord high admiral'] },
  { id: 'lord_high_commissioner', type: 'style', ctx: 'prefix', short: 'Lord High Commissioner', variants: ['lord high commissioner'] },
  { id: 'lord_of_the_manor', type: 'style', ctx: 'prefix', short: 'Lord of the Manor', variants: ['lord of the manor'] },
  { id: 'lord_president_of_the_council', type: 'style', ctx: 'prefix', short: 'Lord President of the Council', variants: ['lord president of the council'] },
  { id: 'duke', type: 'style', ctx: 'prefix', short: 'Duke', variants: ['duke'] },
  { id: 'duchess', type: 'style', ctx: 'prefix', short: 'Duchess', variants: ['duchess'] },
  { id: 'earl', type: 'style', ctx: 'prefix', short: 'Earl', variants: ['earl'] },
  { id: 'baron', type: 'style', ctx: 'prefix', short: 'Baron', variants: ['baron'] },
  { id: 'baroness', type: 'style', ctx: 'prefix', short: 'Baroness', variants: ['baroness'] },
  { id: 'count', type: 'style', ctx: 'prefix', short: 'Count', variants: ['count'] },
  { id: 'countess', type: 'style', ctx: 'prefix', short: 'Countess', variants: ['countess'] },
  { id: 'marquess', type: 'style', ctx: 'prefix', short: 'Marquess', variants: ['marquess'] },
  { id: 'marquis', type: 'style', ctx: 'prefix', short: 'Marquis', variants: ['marquis'] },
  { id: 'viscount', type: 'style', ctx: 'prefix', short: 'Viscount', variants: ['viscount'] },
  { id: 'viscountess', type: 'style', ctx: 'prefix', short: 'Viscountess', variants: ['viscountess'] },
  { id: 'visc', type: 'style', ctx: 'prefix', short: 'Visc', long: 'Viscount', variants: ['visc'] },

  // Additional nobility/courtesy styles seen in UK-oriented datasets
  { id: 'archduke', type: 'style', ctx: 'prefix', short: 'Archduke', variants: ['archduke'] },
  { id: 'archchancellor', type: 'style', ctx: 'prefix', short: 'Archchancellor', variants: ['archchancellor'] },
  { id: 'baronet', type: 'style', ctx: 'prefix', short: 'Baronet', variants: ['baronet'] },
  { id: 'baron_of_parliament', type: 'style', ctx: 'prefix', short: 'Baron of Parliament', variants: ['baron of parliament'] },
  { id: 'baronial_lord', type: 'style', ctx: 'prefix', short: 'Baronial Lord', variants: ['baronial lord'] },
  { id: 'count_palatine', type: 'style', ctx: 'prefix', short: 'Count Palatine', variants: ['count palatine'] },
  { id: 'countess_of', type: 'style', ctx: 'prefix', short: 'Countess of', variants: ['countess of'] },
  { id: 'dowager_countess', type: 'style', ctx: 'prefix', short: 'Dowager Countess', variants: ['dowager countess'] },
  { id: 'premier_duke', type: 'style', ctx: 'prefix', short: 'Premier Duke', variants: ['premier duke'] },
  { id: 'marchioness', type: 'style', ctx: 'prefix', short: 'Marchioness', variants: ['marchioness'] },
  { id: 'marcher_lord', type: 'style', ctx: 'prefix', short: 'Marcher Lord', variants: ['marcher lord'] },
  { id: 'hereditary_lord', type: 'style', ctx: 'prefix', short: 'Hereditary Lord', variants: ['hereditary lord'] },
  { id: 'high_steward', type: 'style', ctx: 'prefix', short: 'High Steward', variants: ['high steward'] },
  { id: 'keeper_of_the_privy_seal', type: 'style', ctx: 'prefix', short: 'Keeper of the Privy Seal', variants: ['keeper of the privy seal'] },
  { id: 'constable_of_the_tower', type: 'style', ctx: 'prefix', short: 'Constable of the Tower', variants: ['constable of the tower'] },
  { id: 'freeman_of_the_city', type: 'style', ctx: 'prefix', short: 'Freeman of the City', variants: ['freeman of the city'] },
  { id: 'yeoman_warder', type: 'style', ctx: 'prefix', short: 'Yeoman Warder', variants: ['yeoman warder'] },
  { id: 'the_earl_of', type: 'style', ctx: 'prefix', short: 'The Earl of', variants: ['the earl of', 'earl of'] },

  // UK parliament/legal courtesy
  {
    id: 'the_honourable',
    type: 'style',
    ctx: 'prefix',
    short: 'The Hon.',
    long: 'The Honourable',
    variants: ['the hon', 'the hon.', 'the honourable', 'the honorable'],
  },
  {
    id: 'the_right_honourable',
    type: 'style',
    ctx: 'prefix',
    short: 'The Rt Hon',
    long: 'The Right Honourable',
    variants: ['the rt hon', 'the rt. hon.', 'the right honourable', 'right honourable', 'right honorable'],
  },
  { id: 'his_excellency', type: 'style', ctx: 'prefix', short: 'His Excellency', variants: ['his excellency'] },
  { id: 'her_excellency', type: 'style', ctx: 'prefix', short: 'Her Excellency', variants: ['her excellency'] },
  { id: 'he_abbrev', type: 'style', ctx: 'prefix', short: 'HE', long: 'His/Her Excellency', variants: ['he', 'h.e.', 'h.e'] },
  { id: 'hma', type: 'style', ctx: 'prefix', short: 'HMA', long: "His/Her Majesty’s Ambassador", variants: ['hma'] },
  { id: 'kc_prefix', type: 'professional', ctx: 'prefix', short: 'KC', long: "King’s Counsel", variants: ['kc', 'king\'s counsel', 'kings counsel'] },

  // Royalty (canonical apostrophe used in some titles)
  { id: 'her_majesty', type: 'style', ctx: 'prefix', short: 'Her Majesty', variants: ['her majesty'] },
  { id: 'his_majesty', type: 'style', ctx: 'prefix', short: 'His Majesty', variants: ['his majesty'] },
  { id: 'her_grace', type: 'style', ctx: 'prefix', short: 'Her Grace', variants: ['her grace'] },
  { id: 'his_grace', type: 'style', ctx: 'prefix', short: 'His Grace', variants: ['his grace'] },
  { id: 'prince', type: 'style', ctx: 'prefix', short: 'Prince', variants: ['prince'] },
  { id: 'princess', type: 'style', ctx: 'prefix', short: 'Princess', variants: ['princess'] },
  { id: 'prince_consort', type: 'style', ctx: 'prefix', short: 'Prince Consort', variants: ['prince consort'] },
  { id: 'princess_royal', type: 'style', ctx: 'prefix', short: 'Princess Royal', variants: ['princess royal'] },
  {
    id: 'her_majestys_counsel',
    type: 'style',
    ctx: 'prefix',
    short: 'Her Majesty’s Counsel',
    variants: ["her majesty's counsel", 'her majesty’s counsel', 'hma counsel'],
  },
  {
    id: 'his_majestys_counsel',
    type: 'style',
    ctx: 'prefix',
    short: 'His Majesty’s Counsel',
    variants: ["his majesty's counsel", 'his majesty’s counsel', 'hma counsel'],
  },

  // ---------------------------------------------------------------------------
  // Civic / diplomatic / political / academic / institutional (English-speaking)
  // ---------------------------------------------------------------------------
  { id: 'alderman', type: 'style', ctx: 'prefix', short: 'Alderman', variants: ['alderman'] },
  { id: 'ambassador', type: 'style', ctx: 'prefix', short: 'Ambassador', variants: ['ambassador'] },
  { id: 'ambassador_at_large', type: 'style', ctx: 'prefix', short: 'Ambassador-at-Large', variants: ['ambassador-at-large', 'ambassador at large'] },
  { id: 'consul', type: 'style', ctx: 'prefix', short: 'Consul', variants: ['consul'] },
  { id: 'consul_general', type: 'style', ctx: 'prefix', short: 'Consul General', variants: ['consul general'] },
  { id: 'envoy_extraordinary', type: 'style', ctx: 'prefix', short: 'Envoy Extraordinary', variants: ['envoy extraordinary'] },
  { id: 'deputy', type: 'style', ctx: 'prefix', short: 'Deputy', variants: ['deputy'] },
  { id: 'deputy_high_commissioner', type: 'style', ctx: 'prefix', short: 'Deputy High Commissioner', variants: ['deputy high commissioner'] },
  { id: 'chancellor', type: 'style', ctx: 'prefix', short: 'Chancellor', variants: ['chancellor'] },
  { id: 'vice_chancellor', type: 'style', ctx: 'prefix', short: 'Vice Chancellor', variants: ['vice chancellor'] },
  { id: 'chancellor_of_the_exchequer', type: 'style', ctx: 'prefix', short: 'Chancellor of the Exchequer', variants: ['chancellor of the exchequer'] },
  { id: 'minister', type: 'style', ctx: 'prefix', short: 'Minister', variants: ['minister'] },
  { id: 'minister_of_state', type: 'style', ctx: 'prefix', short: 'Minister of State', variants: ['minister of state'] },
  { id: 'senator', type: 'style', ctx: 'prefix', short: 'Senator', variants: ['senator'] },
  { id: 'chief', type: 'style', ctx: 'prefix', short: 'Chief', variants: ['chief'] },
  { id: 'chief_constable', type: 'style', ctx: 'prefix', short: 'Chief Constable', variants: ['chief constable'] },
  { id: 'speaker_of_the_house', type: 'style', ctx: 'prefix', short: 'Speaker of the House', variants: ['speaker of the house'] },
  { id: 'sheriff', type: 'style', ctx: 'prefix', short: 'Sheriff', variants: ['sheriff'] },
  { id: 'cllr', type: 'style', ctx: 'prefix', short: 'Cllr', long: 'Councillor', variants: ['cllr', 'councillor', 'councilor'] },
  { id: 'churchwarden', type: 'style', ctx: 'prefix', short: 'Churchwarden', variants: ['churchwarden'] },
  { id: 'headmaster', type: 'style', ctx: 'prefix', short: 'Headmaster', variants: ['headmaster'] },
  { id: 'headmistress', type: 'style', ctx: 'prefix', short: 'Headmistress', variants: ['headmistress'] },
  { id: 'dean', type: 'style', ctx: 'prefix', short: 'Dean', variants: ['dean'] },
  { id: 'dean_emeritus', type: 'style', ctx: 'prefix', short: 'Dean Emeritus', variants: ['dean emeritus'] },
  { id: 'fellow', type: 'style', ctx: 'prefix', short: 'Fellow', variants: ['fellow'] },
  { id: 'provost', type: 'style', ctx: 'prefix', short: 'Provost', variants: ['provost'] },
  { id: 'provost_academic', type: 'style', ctx: 'prefix', short: 'Provost (academic)', variants: ['provost (academic)', 'provost academic'] },
  { id: 'warden', type: 'style', ctx: 'prefix', short: 'Warden', variants: ['warden'] },
  { id: 'master', type: 'style', ctx: 'prefix', short: 'Master', variants: ['master'] },
  { id: 'master_of_arts', type: 'style', ctx: 'prefix', short: 'Master of Arts', variants: ['master of arts'] },
  { id: 'master_of_the_rolls', type: 'style', ctx: 'prefix', short: 'Master of the Rolls', variants: ['master of the rolls'] },
  { id: 'rector', type: 'style', ctx: 'prefix', short: 'Rector', variants: ['rector'] },
  { id: 'rector_magnificus', type: 'style', ctx: 'prefix', short: 'Rector Magnificus', variants: ['rector magnificus'] },

  // ---------------------------------------------------------------------------
  // Chivalric / orders (UK)
  // ---------------------------------------------------------------------------
  { id: 'knight_bachelor', type: 'style', ctx: 'prefix', short: 'Knight Bachelor', variants: ['knight bachelor'] },
  { id: 'knight_commander', type: 'style', ctx: 'prefix', short: 'Knight Commander', variants: ['knight commander'] },
  { id: 'knight_grand_cross', type: 'style', ctx: 'prefix', short: 'Knight Grand Cross', variants: ['knight grand cross'] },
  { id: 'knight_marshal', type: 'style', ctx: 'prefix', short: 'Knight Marshal', variants: ['knight marshal'] },

  // ---------------------------------------------------------------------------
  // Judicial (UK/IE/US common)
  // ---------------------------------------------------------------------------
  { id: 'judge', type: 'judicial', ctx: 'prefix', short: 'Judge', variants: ['judge'] },
  { id: 'justice', type: 'judicial', ctx: 'prefix', short: 'Justice', variants: ['justice'] },
  { id: 'chief_justice', type: 'judicial', ctx: 'prefix', short: 'Chief Justice', variants: ['chief justice'] },
  { id: 'lord_chief_justice', type: 'judicial', ctx: 'prefix', short: 'Lord Chief Justice', variants: ['lord chief justice'] },
  { id: 'lord_justice', type: 'judicial', ctx: 'prefix', short: 'Lord Justice', variants: ['lord justice'] },
  { id: 'lord_chancellor', type: 'judicial', ctx: 'prefix', short: 'Lord Chancellor', variants: ['lord chancellor'] },
  { id: 'lord_advocate', type: 'judicial', ctx: 'prefix', short: 'Lord Advocate', variants: ['lord advocate'] },
  { id: 'the_learned_judge', type: 'judicial', ctx: 'prefix', short: 'The Learned Judge', variants: ['the learned judge'] },

  // ---------------------------------------------------------------------------
  // Multi-person combined prefixes (UK)
  // ---------------------------------------------------------------------------
  { id: 'brig_and_mrs', type: 'style', ctx: 'prefix', short: 'Brig & Mrs', variants: ['brig & mrs', 'brig and mrs'] },
  { id: 'commander_and_mrs', type: 'style', ctx: 'prefix', short: 'Commander & Mrs', variants: ['commander & mrs', 'commander and mrs'] },
  { id: 'lord_and_lady', type: 'style', ctx: 'prefix', short: 'Lord & Lady', variants: ['lord & lady', 'lord and lady'] },
  { id: 'prof_and_dr', type: 'style', ctx: 'prefix', short: 'Prof & Dr', variants: ['prof & dr', 'prof and dr'] },
  { id: 'prof_and_mrs', type: 'style', ctx: 'prefix', short: 'Prof & Mrs', variants: ['prof & mrs', 'prof and mrs'] },
  { id: 'prof_and_rev', type: 'style', ctx: 'prefix', short: 'Prof & Rev', variants: ['prof & rev', 'prof and rev'] },
  { id: 'prof_dame', type: 'style', ctx: 'prefix', short: 'Prof Dame', variants: ['prof dame'] },
  { id: 'prof_dr', type: 'style', ctx: 'prefix', short: 'Prof Dr', variants: ['prof dr'] },
  { id: 'rev_and_mrs', type: 'style', ctx: 'prefix', short: 'Rev & Mrs', variants: ['rev & mrs', 'rev and mrs'] },
  { id: 'sir_and_lady', type: 'style', ctx: 'prefix', short: 'Sir & Lady', variants: ['sir & lady', 'sir and lady'] },

  // ---------------------------------------------------------------------------
  // European Union — common civil honorifics (local-language)
  // NOTE: canonical forms are local-language display forms. Matching folds diacritics.
  // ---------------------------------------------------------------------------
  // French (FR/BE/LU)
  { id: 'fr_monsieur', type: 'honorific', ctx: 'prefix', short: 'M.', long: 'Monsieur', variants: ['m', 'm.', 'monsieur'] },
  { id: 'fr_madame', type: 'honorific', ctx: 'prefix', short: 'Mme', long: 'Madame', variants: ['mme', 'mme.', 'madame'] },
  { id: 'fr_mademoiselle', type: 'honorific', ctx: 'prefix', short: 'Mlle', long: 'Mademoiselle', variants: ['mlle', 'mlle.', 'mademoiselle'] },

  // German (DE/AT)
  { id: 'de_herr', type: 'honorific', ctx: 'prefix', short: 'Herr', variants: ['herr'] },
  { id: 'de_frau', type: 'honorific', ctx: 'prefix', short: 'Frau', variants: ['frau'] },
  { id: 'de_dr', type: 'honorific', ctx: 'prefix', short: 'Dr.', long: 'Doktor', variants: ['dr', 'dr.', 'doktor'] },
  { id: 'de_prof', type: 'honorific', ctx: 'prefix', short: 'Prof.', long: 'Professor', variants: ['prof', 'prof.', 'professor'] },
  { id: 'de_ing', type: 'professional', ctx: 'prefix', short: 'Ing.', long: 'Ingenieur', variants: ['ing', 'ing.', 'ingenieur', 'ingenieurin'] },

  // Spanish (ES)
  { id: 'es_senor', type: 'honorific', ctx: 'prefix', short: 'Sr.', long: 'Señor', variants: ['sr', 'sr.', 'senor', 'señor'] },
  { id: 'es_senora', type: 'honorific', ctx: 'prefix', short: 'Sra.', long: 'Señora', variants: ['sra', 'sra.', 'senora', 'señora'] },
  { id: 'es_senorita', type: 'honorific', ctx: 'prefix', short: 'Srta.', long: 'Señorita', variants: ['srta', 'srta.', 'senorita', 'señorita'] },
  { id: 'es_don', type: 'style', ctx: 'prefix', short: 'Don', variants: ['don'] },
  { id: 'es_dona', type: 'style', ctx: 'prefix', short: 'Doña', variants: ['dona', 'doña'] },

  // Portuguese (PT)
  { id: 'pt_senhor', type: 'honorific', ctx: 'prefix', short: 'Sr.', long: 'Senhor', variants: ['sr', 'sr.', 'senhor'] },
  { id: 'pt_senhora', type: 'honorific', ctx: 'prefix', short: 'Sra.', long: 'Senhora', variants: ['sra', 'sra.', 'senhora'] },
  { id: 'pt_doutor', type: 'honorific', ctx: 'prefix', short: 'Dr.', long: 'Doutor', variants: ['dr', 'dr.', 'doutor', 'doutora'] },

  // Italian (IT)
  { id: 'it_signore', type: 'honorific', ctx: 'prefix', short: 'Sig.', long: 'Signore', variants: ['sig', 'sig.', 'signore'] },
  { id: 'it_signora', type: 'honorific', ctx: 'prefix', short: 'Sig.ra', long: 'Signora', variants: ['sig.ra', 'sigra', 'signora'] },
  { id: 'it_signorina', type: 'honorific', ctx: 'prefix', short: 'Sig.na', long: 'Signorina', variants: ['sig.na', 'signorina'] },
  { id: 'it_dottore', type: 'honorific', ctx: 'prefix', short: 'Dott.', long: 'Dottore', variants: ['dott', 'dott.', 'dottore'] },
  { id: 'it_dottoressa', type: 'honorific', ctx: 'prefix', short: 'Dott.ssa', long: 'Dottoressa', variants: ['dott.ssa', 'dottsa', 'dottoressa'] },
  { id: 'it_professore', type: 'honorific', ctx: 'prefix', short: 'Prof.', long: 'Professore', variants: ['prof', 'prof.', 'professore'] },
  { id: 'it_professoressa', type: 'honorific', ctx: 'prefix', short: 'Prof.ssa', long: 'Professoressa', variants: ['prof.ssa', 'profssa', 'professoressa'] },

  // Dutch (NL/BE)
  { id: 'nl_de_heer', type: 'honorific', ctx: 'prefix', short: 'Dhr.', long: 'De heer', variants: ['dhr', 'dhr.', 'de heer'] },
  { id: 'nl_mevrouw', type: 'honorific', ctx: 'prefix', short: 'Mevr.', long: 'Mevrouw', variants: ['mevr', 'mevr.', 'mevrouw'] },
  { id: 'nl_juffrouw', type: 'honorific', ctx: 'prefix', short: 'Juf.', long: 'Juffrouw', variants: ['juf', 'juf.', 'juffrouw'] },

  // Swedish (SE)
  { id: 'se_herr', type: 'honorific', ctx: 'prefix', short: 'Herr', variants: ['herr'] },
  { id: 'se_fru', type: 'honorific', ctx: 'prefix', short: 'Fru', variants: ['fru'] },
  { id: 'se_fröken', type: 'honorific', ctx: 'prefix', short: 'Fröken', variants: ['froken', 'fröken'] },

  // Danish (DK) / Norwegian (NO)
  { id: 'dk_hr', type: 'honorific', ctx: 'prefix', short: 'Hr.', long: 'Herr', variants: ['hr', 'hr.', 'herr'] },
  { id: 'dk_fru', type: 'honorific', ctx: 'prefix', short: 'Fru', variants: ['fru'] },
  { id: 'no_hr', type: 'honorific', ctx: 'prefix', short: 'Hr.', variants: ['hr', 'hr.'] },
  { id: 'no_fru', type: 'honorific', ctx: 'prefix', short: 'Fru', variants: ['fru'] },

  // Polish (PL)
  { id: 'pl_pan', type: 'honorific', ctx: 'prefix', short: 'Pan', variants: ['pan'] },
  { id: 'pl_pani', type: 'honorific', ctx: 'prefix', short: 'Pani', variants: ['pani'] },

  // Czech (CZ) / Slovak (SK)
  { id: 'cz_pan', type: 'honorific', ctx: 'prefix', short: 'Pan', variants: ['pan'] },
  { id: 'cz_pani', type: 'honorific', ctx: 'prefix', short: 'Paní', variants: ['pani', 'paní'] },

  // Greek (GR) — common abbreviations (ASCII-friendly variants included)
  { id: 'gr_kyr', type: 'honorific', ctx: 'prefix', short: 'κ.', long: 'Κύριος', variants: ['k', 'k.', 'κ', 'κ.', 'κυριος', 'κύριος'] },
  { id: 'gr_kyria', type: 'honorific', ctx: 'prefix', short: 'κα.', long: 'Κυρία', variants: ['ka', 'ka.', 'κα', 'κα.', 'κυρια', 'κυρία'] },
] as const;

/**
 * Canonical suffixes/postnominals (MVP set; expandable).
 */
export const SUFFIX_AFFIX_ENTRIES: readonly AffixEntry[] = [
  { id: 'jr', type: 'generational', ctx: 'suffix', short: 'Jr.', variants: ['jr', 'jr.'] },
  { id: 'sr', type: 'generational', ctx: 'suffix', short: 'Sr.', variants: ['sr', 'sr.'] },
  { id: 'ii', type: 'dynasticNumber', ctx: 'suffix', short: 'II', variants: ['ii'] },
  { id: 'iii', type: 'dynasticNumber', ctx: 'suffix', short: 'III', variants: ['iii'] },
  { id: 'iv', type: 'dynasticNumber', ctx: 'suffix', short: 'IV', variants: ['iv'] },
  { id: 'v', type: 'dynasticNumber', ctx: 'suffix', short: 'V', variants: ['v'] },

  // ---------------------------------------------------------------------------
  // English-speaking + broadly EU-used postnominals (degrees, credentials)
  // Canonical punctuation is stored; matching tolerates stripped dots.
  // ---------------------------------------------------------------------------
  { id: 'phd', type: 'education', ctx: 'suffix', short: 'Ph.D.', variants: ['phd', 'ph.d.'] },
  { id: 'dphil', type: 'education', ctx: 'suffix', short: 'D.Phil.', variants: ['dphil', 'd.phil.'] },
  { id: 'md', type: 'education', ctx: 'suffix', short: 'M.D.', variants: ['md', 'm.d.'] },
  { id: 'do', type: 'education', ctx: 'suffix', short: 'D.O.', variants: ['do', 'd.o.'] },
  { id: 'dds', type: 'education', ctx: 'suffix', short: 'D.D.S.', variants: ['dds', 'd.d.s.'] },
  { id: 'dmd', type: 'education', ctx: 'suffix', short: 'D.M.D.', variants: ['dmd', 'd.m.d.'] },
  { id: 'dvm', type: 'education', ctx: 'suffix', short: 'D.V.M.', variants: ['dvm', 'd.v.m.'] },
  { id: 'jd', type: 'education', ctx: 'suffix', short: 'J.D.', variants: ['jd', 'j.d.'] },
  { id: 'llb', type: 'education', ctx: 'suffix', short: 'LL.B.', variants: ['llb', 'll.b.'] },
  { id: 'llm', type: 'education', ctx: 'suffix', short: 'LL.M.', variants: ['llm', 'll.m.'] },
  { id: 'mba', type: 'education', ctx: 'suffix', short: 'M.B.A.', variants: ['mba', 'm.b.a.'] },
  { id: 'msc', type: 'education', ctx: 'suffix', short: 'M.Sc.', variants: ['msc', 'm.sc.'] },
  { id: 'bsc', type: 'education', ctx: 'suffix', short: 'B.Sc.', variants: ['bsc', 'b.sc.'] },
  { id: 'ma', type: 'education', ctx: 'suffix', short: 'M.A.', variants: ['ma', 'm.a.'] },
  { id: 'ba', type: 'education', ctx: 'suffix', short: 'B.A.', variants: ['ba', 'b.a.'] },
  { id: 'meng', type: 'education', ctx: 'suffix', short: 'M.Eng.', variants: ['meng', 'm.eng.'] },
  { id: 'beng', type: 'education', ctx: 'suffix', short: 'B.Eng.', variants: ['beng', 'b.eng.'] },

  // Nursing/medical
  { id: 'rn', type: 'professional', ctx: 'suffix', short: 'RN', variants: ['rn'] },
  { id: 'np', type: 'professional', ctx: 'suffix', short: 'NP', variants: ['np'] },
  { id: 'pa_c', type: 'professional', ctx: 'suffix', short: 'PA-C', variants: ['pa-c', 'pac', 'pa c'] },

  // Accounting/finance
  { id: 'cpa', type: 'professional', ctx: 'suffix', short: 'CPA', variants: ['cpa'] },
  { id: 'cfa', type: 'professional', ctx: 'suffix', short: 'CFA', variants: ['cfa'] },

  // Legal
  { id: 'esq', type: 'professional', ctx: 'suffix', short: 'Esq.', variants: ['esq', 'esq.'] },
  { id: 'kc', type: 'professional', ctx: 'suffix', short: 'KC', variants: ['kc'] },
  { id: 'qc', type: 'professional', ctx: 'suffix', short: 'QC', variants: ['qc'] },

  // ---------------------------------------------------------------------------
  // UK/IE honours (postnominals) — stored canonically
  // ---------------------------------------------------------------------------
  { id: 'obe', type: 'postnominalHonor', ctx: 'suffix', short: 'OBE', variants: ['obe'] },
  { id: 'mbe', type: 'postnominalHonor', ctx: 'suffix', short: 'MBE', variants: ['mbe'] },
  { id: 'cbe', type: 'postnominalHonor', ctx: 'suffix', short: 'CBE', variants: ['cbe'] },
  { id: 'kbe', type: 'postnominalHonor', ctx: 'suffix', short: 'KBE', variants: ['kbe'] },
  { id: 'dbe', type: 'postnominalHonor', ctx: 'suffix', short: 'DBE', variants: ['dbe'] },
  { id: 'cmg', type: 'postnominalHonor', ctx: 'suffix', short: 'CMG', variants: ['cmg'] },
  { id: 'cvo', type: 'postnominalHonor', ctx: 'suffix', short: 'CVO', variants: ['cvo'] },
  { id: 'mvo', type: 'postnominalHonor', ctx: 'suffix', short: 'MVO', variants: ['mvo'] },
] as const;


