// src/data/utils.ts
function isInList(list, value) {
  if (!value)
    return false;
  const cleanedValue = value.toLowerCase().replace(/\./g, "").trim();
  return list.some((item) => {
    const cleanedItem = item.toLowerCase().replace(/\./g, "").trim();
    return cleanedItem === cleanedValue;
  });
}

// src/data/particles.ts
var DUTCH_GERMAN = [
  "van",
  "von",
  "der",
  "den",
  "de",
  "het",
  "'t",
  "t",
  "ten",
  "ter",
  "te",
  "zu",
  "und",
  "vom",
  "am",
  "im",
  "von und zu"
  // Complex German nobility particle
];
var ROMANCE = [
  "la",
  "le",
  "lo",
  "li",
  "il",
  "el",
  "al",
  "d'",
  "de",
  "de'",
  "del",
  "della",
  "dello",
  "degli",
  "dei",
  "do",
  "du",
  "des",
  "dos",
  "das",
  "da",
  "di",
  "e",
  "y",
  "i"
  // Conjunctions (Spanish/Italian)
];
var CELTIC = [
  "mac",
  "mc",
  "mhic",
  "mic",
  "o'",
  "ua"
];
var SCANDINAVIAN = [
  "af",
  "av",
  "von"
];
var PARTICLES = [
  ...DUTCH_GERMAN,
  ...ROMANCE,
  ...CELTIC,
  ...SCANDINAVIAN
];
var MULTI_WORD_PARTICLES = [
  "von und zu",
  "de la",
  "de los",
  "de las",
  "van der",
  "van den",
  "van de",
  "de le",
  "da la"
];
function isParticle(str) {
  return isInList(PARTICLES, str);
}
function isMultiWordParticle(words) {
  const combined = words.join(" ").toLowerCase();
  for (const particle of MULTI_WORD_PARTICLES) {
    if (combined === particle) {
      return particle;
    }
    if (combined.startsWith(particle + " ")) {
      return particle;
    }
  }
  return null;
}

// src/data/surnames.ts
var SPANISH = [
  "garc\xEDa",
  "gonzalez",
  "gonz\xE1lez",
  "rodriguez",
  "rodr\xEDguez",
  "fernandez",
  "fern\xE1ndez",
  "lopez",
  "l\xF3pez",
  "martinez",
  "mart\xEDnez",
  "sanchez",
  "s\xE1nchez",
  "perez",
  "p\xE9rez",
  "gomez",
  "g\xF3mez",
  "martin",
  "mart\xEDn",
  "jimenez",
  "jim\xE9nez",
  "ruiz",
  "hernandez",
  "hern\xE1ndez",
  "diaz",
  "d\xEDaz",
  "moreno",
  "alvarez",
  "\xE1lvarez",
  "mu\xF1oz",
  "romero",
  "alonso",
  "gutierrez",
  "guti\xE9rrez",
  "navarro",
  "torres",
  "dominguez",
  "dom\xEDnguez",
  "vazquez",
  "v\xE1zquez",
  "ramos",
  "gil",
  "ramirez",
  "ram\xEDrez",
  "serrano",
  "blanco",
  "molina",
  "castro",
  "ortiz",
  "rubio",
  "nu\xF1ez",
  "m\xE1rquez",
  "marquez"
];
var PORTUGUESE = [
  "silva",
  "santos",
  "ferreira",
  "pereira",
  "oliveira",
  "costa",
  "rodrigues",
  "martins",
  "jesus",
  "sousa",
  "souza",
  "fernandes",
  "goncalves",
  "gon\xE7alves",
  "gomes",
  "lopes",
  "marques",
  "alves",
  "almeida",
  "ribeiro",
  "pinto",
  "carvalho",
  "teixeira",
  "moreira",
  "correia",
  "queir\xF3s",
  "queiros",
  "e\xE7a"
];
var ITALIAN = [
  "rossi",
  "russo",
  "ferrari",
  "esposito",
  "bianchi",
  "romano",
  "colombo",
  "ricci",
  "marino",
  "greco",
  "bruno",
  "gallo",
  "conti",
  "de luca",
  "costa",
  "giordano",
  "mancini",
  "rizzo",
  "lombardi",
  "moretti"
];
var FRENCH = [
  "martin",
  "bernard",
  "dubois",
  "thomas",
  "robert",
  "richard",
  "petit",
  "durand",
  "leroy",
  "moreau",
  "simon",
  "laurent",
  "lefebvre",
  "michel",
  "garcia",
  "david",
  "bertrand",
  "roux",
  "vincent",
  "fournier",
  "fontaine",
  "rousseau",
  "dumas"
];
var COMMON_SURNAMES = [
  ...SPANISH,
  ...PORTUGUESE,
  ...ITALIAN,
  ...FRENCH
];
var COMMON_FIRST_NAMES = [
  "mary",
  "john",
  "william",
  "james",
  "anne",
  "sarah",
  "marie",
  "jean",
  "george",
  "paul",
  "lee",
  "billy",
  "bob",
  "thomas",
  "robert",
  "michael",
  "david",
  "martin",
  "pierre",
  "maria",
  "jose",
  "jos\xE9"
];
function isCommonSurname(str) {
  return isInList(COMMON_SURNAMES, str);
}
function isCommonFirstName(str) {
  return isInList(COMMON_FIRST_NAMES, str);
}

// src/data/affixes.ts
function normalizeAffixVariantForMatch(value) {
  return value.trim().replace(/^[,;:\s]+/, "").replace(/[,;:\s]+$/, "").replace(/\s+/g, " ").replace(/[\u2019\u2018\u02BC]/g, "'").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/\./g, "").toUpperCase().trim();
}
function buildAffixVariantIndex(entries, ctx) {
  const map = /* @__PURE__ */ new Map();
  for (const e of entries) {
    if (e.ctx !== "both" && e.ctx !== ctx)
      continue;
    const candidates = [];
    if (e.short)
      candidates.push(e.short);
    if (e.long)
      candidates.push(e.long);
    if (e.variants)
      candidates.push(...e.variants);
    for (const v of candidates) {
      const k = normalizeAffixVariantForMatch(v);
      if (!k)
        continue;
      if (!map.has(k))
        map.set(k, e);
    }
  }
  return map;
}
var PREFIX_AFFIX_ENTRIES = [
  // ---------------------------------------------------------------------------
  // English-speaking countries (US/UK/CA/AU/NZ/IE) — common honorifics
  // ---------------------------------------------------------------------------
  { id: "mr", type: "honorific", ctx: "prefix", short: "Mr.", long: "Mister", variants: ["mr", "mr."] },
  { id: "mrs", type: "honorific", ctx: "prefix", short: "Mrs.", variants: ["mrs", "mrs."] },
  { id: "ms", type: "honorific", ctx: "prefix", short: "Ms.", variants: ["ms", "ms."] },
  { id: "miss", type: "honorific", ctx: "prefix", short: "Miss", variants: ["miss"] },
  { id: "mx", type: "honorific", ctx: "prefix", short: "Mx", variants: ["mx", "mx."] },
  { id: "madam", type: "honorific", ctx: "prefix", short: "Madam", variants: ["madam"] },
  // ---------------------------------------------------------------------------
  // Plural honorifics (for couples/groups)
  // ---------------------------------------------------------------------------
  { id: "messrs", type: "honorific", ctx: "prefix", short: "Messrs.", long: "Messieurs", variants: ["messrs", "messrs.", "messieurs"] },
  { id: "mmes", type: "honorific", ctx: "prefix", short: "Mmes.", long: "Mesdames", variants: ["mmes", "mmes.", "mesdames"] },
  { id: "drs", type: "honorific", ctx: "prefix", short: "Drs.", long: "Doctors", variants: ["drs", "drs.", "doctors"] },
  { id: "profs", type: "honorific", ctx: "prefix", short: "Profs.", long: "Professors", variants: ["profs", "profs.", "professors"] },
  { id: "revs", type: "honorific", ctx: "prefix", short: "Revs.", long: "Reverends", variants: ["revs", "revs.", "reverends"] },
  { id: "dr", type: "honorific", ctx: "prefix", short: "Dr.", long: "Doctor", variants: ["dr", "dr."] },
  { id: "prof", type: "honorific", ctx: "prefix", short: "Prof.", long: "Professor", variants: ["prof", "prof.", "professor"] },
  // Legal/professional (prefix usage varies; keep as tolerant input)
  { id: "atty", type: "professional", ctx: "prefix", short: "Atty.", long: "Attorney", variants: ["atty", "atty.", "attorney"] },
  { id: "lic", type: "professional", ctx: "prefix", short: "Lic.", long: "Licentiate", variants: ["lic", "lic.", "licentiate"] },
  // Corporate designator; uncommon as a true name prefix, but supported for tolerance.
  { id: "llc", type: "professional", ctx: "prefix", short: "LLC", variants: ["llc", "l.l.c."] },
  // ---------------------------------------------------------------------------
  // Clergy / religious (common in English + EU contexts)
  // ---------------------------------------------------------------------------
  { id: "rev", type: "religious", ctx: "prefix", short: "Rev.", long: "Reverend", variants: ["rev", "rev.", "reverend"] },
  { id: "revd", type: "religious", ctx: "prefix", short: "Revd", long: "Reverend", variants: ["revd", "revd.", "rev d", "rev. d."] },
  { id: "fr", type: "religious", ctx: "prefix", short: "Fr.", long: "Father", variants: ["fr", "fr.", "father"] },
  { id: "sr_sister", type: "religious", ctx: "prefix", short: "Sr.", long: "Sister", variants: ["sr", "sr.", "sister"] },
  { id: "br", type: "religious", ctx: "prefix", short: "Br.", long: "Brother", variants: ["br", "br.", "brother"] },
  { id: "rabbi", type: "religious", ctx: "prefix", short: "Rabbi", variants: ["rabbi"] },
  { id: "imam", type: "religious", ctx: "prefix", short: "Imam", variants: ["imam"] },
  { id: "pastor", type: "religious", ctx: "prefix", short: "Pastor", variants: ["pastor"] },
  { id: "monsignor", type: "religious", ctx: "prefix", short: "Monsignor", variants: ["monsignor", "msgr", "msgr."] },
  // Higher clergy + Christian honor styles (UK/EU common)
  { id: "canon", type: "religious", ctx: "prefix", short: "Canon", variants: ["canon"] },
  { id: "cardinal", type: "religious", ctx: "prefix", short: "Cardinal", variants: ["cardinal"] },
  { id: "archdeacon", type: "religious", ctx: "prefix", short: "Archdeacon", variants: ["archdeacon"] },
  { id: "archbishop", type: "religious", ctx: "prefix", short: "Archbishop", variants: ["archbishop"] },
  { id: "archbishop_emeritus", type: "religious", ctx: "prefix", short: "Archbishop Emeritus", variants: ["archbishop emeritus"] },
  { id: "bishop", type: "religious", ctx: "prefix", short: "Bishop", variants: ["bishop"] },
  { id: "bishop_emeritus", type: "religious", ctx: "prefix", short: "Bishop Emeritus", variants: ["bishop emeritus"] },
  { id: "suffragan_bishop", type: "religious", ctx: "prefix", short: "Suffragan Bishop", variants: ["suffragan bishop"] },
  { id: "dom", type: "religious", ctx: "prefix", short: "Dom", variants: ["dom"] },
  { id: "elder", type: "religious", ctx: "prefix", short: "Elder", variants: ["elder"] },
  { id: "brother_superior", type: "religious", ctx: "prefix", short: "Brother Superior", variants: ["brother superior"] },
  { id: "provincial", type: "religious", ctx: "prefix", short: "Provincial", variants: ["provincial"] },
  { id: "chaplain", type: "religious", ctx: "prefix", short: "Chaplain", variants: ["chaplain"] },
  { id: "chaplain_general", type: "religious", ctx: "prefix", short: "Chaplain General", variants: ["chaplain general"] },
  { id: "chaplain_in_chief", type: "religious", ctx: "prefix", short: "Chaplain-in-Chief", variants: ["chaplain-in-chief", "chaplain in chief"] },
  { id: "most_reverend", type: "religious", ctx: "prefix", short: "Most Reverend", variants: ["most reverend"] },
  { id: "the_most_reverend", type: "religious", ctx: "prefix", short: "The Most Reverend", variants: ["the most reverend"] },
  { id: "right_reverend", type: "religious", ctx: "prefix", short: "Right Reverend", variants: ["right reverend"] },
  { id: "very_reverend", type: "religious", ctx: "prefix", short: "Very Reverend", variants: ["very reverend"] },
  { id: "the_venerable", type: "religious", ctx: "prefix", short: "The Venerable", variants: ["the venerable"] },
  // Combined honorifics (common in fixtures and UK usage)
  { id: "rev_canon", type: "religious", ctx: "prefix", short: "Rev. Canon", long: "Reverend Canon", variants: ["rev canon", "rev. canon", "the reverend canon"] },
  { id: "rev_dr", type: "religious", ctx: "prefix", short: "Rev. Dr.", variants: ["rev dr", "rev. dr", "rev. dr."] },
  // ---------------------------------------------------------------------------
  // Military / police ranks (primarily English canonical forms; EU input variants included)
  // ---------------------------------------------------------------------------
  { id: "pvt", type: "military", ctx: "prefix", short: "Pvt.", long: "Private", variants: ["pvt", "pvt.", "private"] },
  { id: "cpl", type: "military", ctx: "prefix", short: "Cpl.", long: "Corporal", variants: ["cpl", "cpl.", "corporal"] },
  { id: "sgt", type: "military", ctx: "prefix", short: "Sgt.", long: "Sergeant", variants: ["sgt", "sgt.", "sergeant"] },
  { id: "lt", type: "military", ctx: "prefix", short: "Lt.", long: "Lieutenant", variants: ["lt", "lt.", "lieutenant"] },
  { id: "capt", type: "military", ctx: "prefix", short: "Capt.", long: "Captain", variants: ["capt", "capt.", "cpt", "cpt.", "captain"] },
  { id: "maj", type: "military", ctx: "prefix", short: "Maj.", long: "Major", variants: ["maj", "maj.", "major"] },
  { id: "col", type: "military", ctx: "prefix", short: "Col.", long: "Colonel", variants: ["col", "col.", "colonel"] },
  { id: "gen", type: "military", ctx: "prefix", short: "Gen.", long: "General", variants: ["gen", "gen.", "general"] },
  { id: "adm", type: "military", ctx: "prefix", short: "Adm.", long: "Admiral", variants: ["adm", "adm.", "admiral"] },
  { id: "air_chief_marshal", type: "military", ctx: "prefix", short: "Air Chief Marshal", variants: ["air chief marshal"] },
  // Expanded ranks (common UK/US and some Commonwealth usage)
  { id: "rear_admiral", type: "military", ctx: "prefix", short: "Rear Admiral", variants: ["rear admiral"] },
  { id: "vice_admiral", type: "military", ctx: "prefix", short: "Vice Admiral", variants: ["vice admiral"] },
  { id: "air_commodore", type: "military", ctx: "prefix", short: "Air Commodore", variants: ["air commodore"] },
  { id: "air_marshal", type: "military", ctx: "prefix", short: "Air Marshal", variants: ["air marshal"] },
  { id: "air_vice_marshal", type: "military", ctx: "prefix", short: "Air Vice Marshal", variants: ["air vice marshal"] },
  { id: "field_marshal", type: "military", ctx: "prefix", short: "Field Marshal", variants: ["field marshal"] },
  { id: "marshal_of_the_raf", type: "military", ctx: "prefix", short: "Marshal of the RAF", long: "Marshal of the Royal Air Force", variants: ["marshal of the raf", "marshal of the r.a.f."] },
  { id: "flight_lieutenant", type: "military", ctx: "prefix", short: "Flight Lieutenant", variants: ["flight lieutenant"] },
  { id: "squadron_leader", type: "military", ctx: "prefix", short: "Squadron Leader", variants: ["squadron leader"] },
  { id: "petty_officer", type: "military", ctx: "prefix", short: "Petty Officer", variants: ["petty officer"] },
  { id: "pipe_major", type: "military", ctx: "prefix", short: "Pipe Major", variants: ["pipe major"] },
  { id: "lance_corporal", type: "military", ctx: "prefix", short: "Lance Corporal", variants: ["lance corporal"] },
  { id: "lance_sergeant", type: "military", ctx: "prefix", short: "Lance Sergeant", variants: ["lance sergeant"] },
  { id: "second_lieutenant", type: "military", ctx: "prefix", short: "Second Lieutenant", variants: ["second lieutenant"] },
  { id: "senior_aircraftman", type: "military", ctx: "prefix", short: "Senior Aircraftman", variants: ["senior aircraftman"] },
  { id: "senior_aircraftwoman", type: "military", ctx: "prefix", short: "Senior Aircraftwoman", variants: ["senior aircraftwoman"] },
  { id: "staff_corporal", type: "military", ctx: "prefix", short: "Staff Corporal", variants: ["staff corporal"] },
  { id: "staff_sergeant", type: "military", ctx: "prefix", short: "Staff Sergeant", variants: ["staff sergeant"] },
  { id: "warrant_officer", type: "military", ctx: "prefix", short: "Warrant Officer", variants: ["warrant officer"] },
  { id: "warrant_officer_class_1", type: "military", ctx: "prefix", short: "Warrant Officer Class 1", variants: ["warrant officer class 1", "warrant officer class i"] },
  { id: "warrant_officer_class_2", type: "military", ctx: "prefix", short: "Warrant Officer Class 2", variants: ["warrant officer class 2", "warrant officer class ii"] },
  { id: "brigadier", type: "military", ctx: "prefix", short: "Brigadier", variants: ["brigadier"] },
  { id: "brig_gen", type: "military", ctx: "prefix", short: "Brig Gen", long: "Brigadier General", variants: ["brig gen", "brig. gen.", "brigadier general"] },
  { id: "regimental_corporal_major", type: "military", ctx: "prefix", short: "Regimental Corporal Major", variants: ["regimental corporal major"] },
  { id: "regimental_sergeant_major", type: "military", ctx: "prefix", short: "Regimental Sergeant Major", variants: ["regimental sergeant major"] },
  { id: "colour_sergeant", type: "military", ctx: "prefix", short: "Colour Sergeant", variants: ["colour sergeant", "color sergeant"] },
  { id: "commander_rank", type: "military", ctx: "prefix", short: "Commander", variants: ["commander"] },
  { id: "commodore", type: "military", ctx: "prefix", short: "Commodore", variants: ["commodore"] },
  { id: "lt_col", type: "military", ctx: "prefix", short: "Lt Col", long: "Lieutenant Colonel", variants: ["lt col", "lt. col.", "lieutenant colonel"] },
  { id: "lt_commander", type: "military", ctx: "prefix", short: "Lt Commander", variants: ["lt commander", "lt. commander", "lieutenant commander"] },
  { id: "lt_cpl", type: "military", ctx: "prefix", short: "Lt Cpl", variants: ["lt cpl", "lt. cpl."] },
  { id: "lt_general", type: "military", ctx: "prefix", short: "Lt General", long: "Lieutenant General", variants: ["lt general", "lt. general", "lieutenant general"] },
  { id: "major_general", type: "military", ctx: "prefix", short: "Major General", variants: ["major general"] },
  // ---------------------------------------------------------------------------
  // UK/IE/CA/AU/NZ styles, nobility, and honorific styles (treated as "style")
  // ---------------------------------------------------------------------------
  { id: "sir", type: "honorific", ctx: "prefix", short: "Sir", variants: ["sir"] },
  { id: "dame", type: "honorific", ctx: "prefix", short: "Dame", variants: ["dame"] },
  { id: "dame_commander", type: "honorific", ctx: "prefix", short: "Dame Commander", variants: ["dame commander"] },
  { id: "dame_grand_cross", type: "honorific", ctx: "prefix", short: "Dame Grand Cross", variants: ["dame grand cross"] },
  { id: "lord", type: "style", ctx: "prefix", short: "Lord", variants: ["lord"] },
  { id: "lady", type: "style", ctx: "prefix", short: "Lady", variants: ["lady"] },
  { id: "lord_lieutenant", type: "style", ctx: "prefix", short: "Lord Lieutenant", variants: ["lord lieutenant"] },
  { id: "lord_mayor", type: "style", ctx: "prefix", short: "Lord Mayor", variants: ["lord mayor"] },
  { id: "lord_high_admiral", type: "style", ctx: "prefix", short: "Lord High Admiral", variants: ["lord high admiral"] },
  { id: "lord_high_commissioner", type: "style", ctx: "prefix", short: "Lord High Commissioner", variants: ["lord high commissioner"] },
  { id: "lord_of_the_manor", type: "style", ctx: "prefix", short: "Lord of the Manor", variants: ["lord of the manor"] },
  { id: "lord_president_of_the_council", type: "style", ctx: "prefix", short: "Lord President of the Council", variants: ["lord president of the council"] },
  { id: "duke", type: "style", ctx: "prefix", short: "Duke", variants: ["duke"] },
  { id: "duchess", type: "style", ctx: "prefix", short: "Duchess", variants: ["duchess"] },
  { id: "earl", type: "style", ctx: "prefix", short: "Earl", variants: ["earl"] },
  { id: "baron", type: "style", ctx: "prefix", short: "Baron", variants: ["baron"] },
  { id: "baroness", type: "style", ctx: "prefix", short: "Baroness", variants: ["baroness"] },
  { id: "count", type: "style", ctx: "prefix", short: "Count", variants: ["count"] },
  { id: "countess", type: "style", ctx: "prefix", short: "Countess", variants: ["countess"] },
  { id: "marquess", type: "style", ctx: "prefix", short: "Marquess", variants: ["marquess"] },
  { id: "marquis", type: "style", ctx: "prefix", short: "Marquis", variants: ["marquis"] },
  { id: "viscount", type: "style", ctx: "prefix", short: "Viscount", variants: ["viscount"] },
  { id: "viscountess", type: "style", ctx: "prefix", short: "Viscountess", variants: ["viscountess"] },
  { id: "visc", type: "style", ctx: "prefix", short: "Visc", long: "Viscount", variants: ["visc"] },
  // Additional nobility/courtesy styles seen in UK-oriented datasets
  { id: "archduke", type: "style", ctx: "prefix", short: "Archduke", variants: ["archduke"] },
  { id: "archchancellor", type: "style", ctx: "prefix", short: "Archchancellor", variants: ["archchancellor"] },
  { id: "baronet", type: "style", ctx: "prefix", short: "Baronet", variants: ["baronet"] },
  { id: "baron_of_parliament", type: "style", ctx: "prefix", short: "Baron of Parliament", variants: ["baron of parliament"] },
  { id: "baronial_lord", type: "style", ctx: "prefix", short: "Baronial Lord", variants: ["baronial lord"] },
  { id: "count_palatine", type: "style", ctx: "prefix", short: "Count Palatine", variants: ["count palatine"] },
  { id: "countess_of", type: "style", ctx: "prefix", short: "Countess of", variants: ["countess of"] },
  { id: "dowager_countess", type: "style", ctx: "prefix", short: "Dowager Countess", variants: ["dowager countess"] },
  { id: "premier_duke", type: "style", ctx: "prefix", short: "Premier Duke", variants: ["premier duke"] },
  { id: "marchioness", type: "style", ctx: "prefix", short: "Marchioness", variants: ["marchioness"] },
  { id: "marcher_lord", type: "style", ctx: "prefix", short: "Marcher Lord", variants: ["marcher lord"] },
  { id: "hereditary_lord", type: "style", ctx: "prefix", short: "Hereditary Lord", variants: ["hereditary lord"] },
  { id: "high_steward", type: "style", ctx: "prefix", short: "High Steward", variants: ["high steward"] },
  { id: "keeper_of_the_privy_seal", type: "style", ctx: "prefix", short: "Keeper of the Privy Seal", variants: ["keeper of the privy seal"] },
  { id: "constable_of_the_tower", type: "style", ctx: "prefix", short: "Constable of the Tower", variants: ["constable of the tower"] },
  { id: "freeman_of_the_city", type: "style", ctx: "prefix", short: "Freeman of the City", variants: ["freeman of the city"] },
  { id: "yeoman_warder", type: "style", ctx: "prefix", short: "Yeoman Warder", variants: ["yeoman warder"] },
  { id: "the_earl_of", type: "style", ctx: "prefix", short: "The Earl of", variants: ["the earl of", "earl of"] },
  // UK parliament/legal courtesy
  {
    id: "the_honourable",
    type: "style",
    ctx: "prefix",
    short: "The Hon.",
    long: "The Honourable",
    variants: ["the hon", "the hon.", "the honourable", "the honorable"]
  },
  {
    id: "the_right_honourable",
    type: "style",
    ctx: "prefix",
    short: "The Rt Hon",
    long: "The Right Honourable",
    variants: ["the rt hon", "the rt. hon.", "the right honourable", "right honourable", "right honorable"]
  },
  { id: "his_excellency", type: "style", ctx: "prefix", short: "His Excellency", variants: ["his excellency"] },
  { id: "her_excellency", type: "style", ctx: "prefix", short: "Her Excellency", variants: ["her excellency"] },
  { id: "he_abbrev", type: "style", ctx: "prefix", short: "HE", long: "His/Her Excellency", variants: ["he", "h.e.", "h.e"] },
  { id: "hma", type: "style", ctx: "prefix", short: "HMA", long: "His/Her Majesty\u2019s Ambassador", variants: ["hma"] },
  { id: "kc_prefix", type: "professional", ctx: "prefix", short: "KC", long: "King\u2019s Counsel", variants: ["kc", "king's counsel", "kings counsel"] },
  // Royalty (canonical apostrophe used in some titles)
  { id: "her_majesty", type: "style", ctx: "prefix", short: "Her Majesty", variants: ["her majesty"] },
  { id: "his_majesty", type: "style", ctx: "prefix", short: "His Majesty", variants: ["his majesty"] },
  { id: "her_grace", type: "style", ctx: "prefix", short: "Her Grace", variants: ["her grace"] },
  { id: "his_grace", type: "style", ctx: "prefix", short: "His Grace", variants: ["his grace"] },
  { id: "prince", type: "style", ctx: "prefix", short: "Prince", variants: ["prince"] },
  { id: "princess", type: "style", ctx: "prefix", short: "Princess", variants: ["princess"] },
  { id: "prince_consort", type: "style", ctx: "prefix", short: "Prince Consort", variants: ["prince consort"] },
  { id: "princess_royal", type: "style", ctx: "prefix", short: "Princess Royal", variants: ["princess royal"] },
  {
    id: "her_majestys_counsel",
    type: "style",
    ctx: "prefix",
    short: "Her Majesty\u2019s Counsel",
    variants: ["her majesty's counsel", "her majesty\u2019s counsel", "hma counsel"]
  },
  {
    id: "his_majestys_counsel",
    type: "style",
    ctx: "prefix",
    short: "His Majesty\u2019s Counsel",
    variants: ["his majesty's counsel", "his majesty\u2019s counsel", "hma counsel"]
  },
  // ---------------------------------------------------------------------------
  // Civic / diplomatic / political / academic / institutional (English-speaking)
  // ---------------------------------------------------------------------------
  { id: "alderman", type: "style", ctx: "prefix", short: "Alderman", variants: ["alderman"] },
  { id: "ambassador", type: "style", ctx: "prefix", short: "Ambassador", variants: ["ambassador"] },
  { id: "ambassador_at_large", type: "style", ctx: "prefix", short: "Ambassador-at-Large", variants: ["ambassador-at-large", "ambassador at large"] },
  { id: "consul", type: "style", ctx: "prefix", short: "Consul", variants: ["consul"] },
  { id: "consul_general", type: "style", ctx: "prefix", short: "Consul General", variants: ["consul general"] },
  { id: "envoy_extraordinary", type: "style", ctx: "prefix", short: "Envoy Extraordinary", variants: ["envoy extraordinary"] },
  { id: "deputy", type: "style", ctx: "prefix", short: "Deputy", variants: ["deputy"] },
  { id: "deputy_high_commissioner", type: "style", ctx: "prefix", short: "Deputy High Commissioner", variants: ["deputy high commissioner"] },
  { id: "chancellor", type: "style", ctx: "prefix", short: "Chancellor", variants: ["chancellor"] },
  { id: "vice_chancellor", type: "style", ctx: "prefix", short: "Vice Chancellor", variants: ["vice chancellor"] },
  { id: "chancellor_of_the_exchequer", type: "style", ctx: "prefix", short: "Chancellor of the Exchequer", variants: ["chancellor of the exchequer"] },
  { id: "minister", type: "style", ctx: "prefix", short: "Minister", variants: ["minister"] },
  { id: "minister_of_state", type: "style", ctx: "prefix", short: "Minister of State", variants: ["minister of state"] },
  { id: "senator", type: "style", ctx: "prefix", short: "Senator", variants: ["senator"] },
  { id: "chief", type: "style", ctx: "prefix", short: "Chief", variants: ["chief"] },
  { id: "chief_constable", type: "style", ctx: "prefix", short: "Chief Constable", variants: ["chief constable"] },
  { id: "speaker_of_the_house", type: "style", ctx: "prefix", short: "Speaker of the House", variants: ["speaker of the house"] },
  { id: "sheriff", type: "style", ctx: "prefix", short: "Sheriff", variants: ["sheriff"] },
  { id: "cllr", type: "style", ctx: "prefix", short: "Cllr", long: "Councillor", variants: ["cllr", "councillor", "councilor"] },
  { id: "churchwarden", type: "style", ctx: "prefix", short: "Churchwarden", variants: ["churchwarden"] },
  { id: "headmaster", type: "style", ctx: "prefix", short: "Headmaster", variants: ["headmaster"] },
  { id: "headmistress", type: "style", ctx: "prefix", short: "Headmistress", variants: ["headmistress"] },
  { id: "dean", type: "style", ctx: "prefix", short: "Dean", variants: ["dean"] },
  { id: "dean_emeritus", type: "style", ctx: "prefix", short: "Dean Emeritus", variants: ["dean emeritus"] },
  { id: "fellow", type: "style", ctx: "prefix", short: "Fellow", variants: ["fellow"] },
  { id: "provost", type: "style", ctx: "prefix", short: "Provost", variants: ["provost"] },
  { id: "provost_academic", type: "style", ctx: "prefix", short: "Provost (academic)", variants: ["provost (academic)", "provost academic"] },
  { id: "warden", type: "style", ctx: "prefix", short: "Warden", variants: ["warden"] },
  { id: "master", type: "style", ctx: "prefix", short: "Master", variants: ["master"] },
  { id: "master_of_arts", type: "style", ctx: "prefix", short: "Master of Arts", variants: ["master of arts"] },
  { id: "master_of_the_rolls", type: "style", ctx: "prefix", short: "Master of the Rolls", variants: ["master of the rolls"] },
  { id: "rector", type: "style", ctx: "prefix", short: "Rector", variants: ["rector"] },
  { id: "rector_magnificus", type: "style", ctx: "prefix", short: "Rector Magnificus", variants: ["rector magnificus"] },
  // ---------------------------------------------------------------------------
  // Chivalric / orders (UK)
  // ---------------------------------------------------------------------------
  { id: "knight_bachelor", type: "style", ctx: "prefix", short: "Knight Bachelor", variants: ["knight bachelor"] },
  { id: "knight_commander", type: "style", ctx: "prefix", short: "Knight Commander", variants: ["knight commander"] },
  { id: "knight_grand_cross", type: "style", ctx: "prefix", short: "Knight Grand Cross", variants: ["knight grand cross"] },
  { id: "knight_marshal", type: "style", ctx: "prefix", short: "Knight Marshal", variants: ["knight marshal"] },
  // ---------------------------------------------------------------------------
  // Judicial (UK/IE/US common)
  // ---------------------------------------------------------------------------
  { id: "judge", type: "judicial", ctx: "prefix", short: "Judge", variants: ["judge"] },
  { id: "justice", type: "judicial", ctx: "prefix", short: "Justice", variants: ["justice"] },
  { id: "chief_justice", type: "judicial", ctx: "prefix", short: "Chief Justice", variants: ["chief justice"] },
  { id: "lord_chief_justice", type: "judicial", ctx: "prefix", short: "Lord Chief Justice", variants: ["lord chief justice"] },
  { id: "lord_justice", type: "judicial", ctx: "prefix", short: "Lord Justice", variants: ["lord justice"] },
  { id: "lord_chancellor", type: "judicial", ctx: "prefix", short: "Lord Chancellor", variants: ["lord chancellor"] },
  { id: "lord_advocate", type: "judicial", ctx: "prefix", short: "Lord Advocate", variants: ["lord advocate"] },
  { id: "the_learned_judge", type: "judicial", ctx: "prefix", short: "The Learned Judge", variants: ["the learned judge"] },
  // ---------------------------------------------------------------------------
  // Multi-person combined prefixes (common couple/pair honorifics)
  // ---------------------------------------------------------------------------
  // Common paired honorifics (Mr. & Mrs., etc.)
  { id: "mr_and_mrs", type: "honorific", ctx: "prefix", short: "Mr. & Mrs.", variants: ["mr & mrs", "mr and mrs", "mr. & mrs.", "mr. and mrs.", "mr.&mrs.", "mr&mrs"] },
  { id: "mr_and_ms", type: "honorific", ctx: "prefix", short: "Mr. & Ms.", variants: ["mr & ms", "mr and ms", "mr. & ms.", "mr. and ms."] },
  { id: "mr_and_mr", type: "honorific", ctx: "prefix", short: "Mr. & Mr.", variants: ["mr & mr", "mr and mr", "mr. & mr.", "mr. and mr."] },
  { id: "mrs_and_mrs", type: "honorific", ctx: "prefix", short: "Mrs. & Mrs.", variants: ["mrs & mrs", "mrs and mrs", "mrs. & mrs.", "mrs. and mrs."] },
  { id: "ms_and_ms", type: "honorific", ctx: "prefix", short: "Ms. & Ms.", variants: ["ms & ms", "ms and ms", "ms. & ms.", "ms. and ms."] },
  { id: "dr_and_mrs", type: "honorific", ctx: "prefix", short: "Dr. & Mrs.", variants: ["dr & mrs", "dr and mrs", "dr. & mrs.", "dr. and mrs."] },
  { id: "dr_and_mr", type: "honorific", ctx: "prefix", short: "Dr. & Mr.", variants: ["dr & mr", "dr and mr", "dr. & mr.", "dr. and mr."] },
  { id: "dr_and_ms", type: "honorific", ctx: "prefix", short: "Dr. & Ms.", variants: ["dr & ms", "dr and ms", "dr. & ms.", "dr. and ms."] },
  { id: "dr_and_dr", type: "honorific", ctx: "prefix", short: "Dr. & Dr.", variants: ["dr & dr", "dr and dr", "dr. & dr.", "dr. and dr."] },
  // UK/formal paired prefixes
  { id: "brig_and_mrs", type: "style", ctx: "prefix", short: "Brig & Mrs", variants: ["brig & mrs", "brig and mrs"] },
  { id: "commander_and_mrs", type: "style", ctx: "prefix", short: "Commander & Mrs", variants: ["commander & mrs", "commander and mrs"] },
  { id: "lord_and_lady", type: "style", ctx: "prefix", short: "Lord & Lady", variants: ["lord & lady", "lord and lady"] },
  { id: "prof_and_dr", type: "style", ctx: "prefix", short: "Prof & Dr", variants: ["prof & dr", "prof and dr"] },
  { id: "prof_and_mrs", type: "style", ctx: "prefix", short: "Prof & Mrs", variants: ["prof & mrs", "prof and mrs"] },
  { id: "prof_and_rev", type: "style", ctx: "prefix", short: "Prof & Rev", variants: ["prof & rev", "prof and rev"] },
  { id: "prof_dame", type: "style", ctx: "prefix", short: "Prof Dame", variants: ["prof dame"] },
  { id: "prof_dr", type: "style", ctx: "prefix", short: "Prof Dr", variants: ["prof dr"] },
  { id: "rev_and_mrs", type: "style", ctx: "prefix", short: "Rev & Mrs", variants: ["rev & mrs", "rev and mrs"] },
  { id: "sir_and_lady", type: "style", ctx: "prefix", short: "Sir & Lady", variants: ["sir & lady", "sir and lady"] },
  { id: "capt_and_mrs", type: "style", ctx: "prefix", short: "Capt. & Mrs.", variants: ["capt & mrs", "capt and mrs", "capt. & mrs.", "capt. and mrs."] },
  { id: "col_and_mrs", type: "style", ctx: "prefix", short: "Col. & Mrs.", variants: ["col & mrs", "col and mrs", "col. & mrs.", "col. and mrs."] },
  { id: "gen_and_mrs", type: "style", ctx: "prefix", short: "Gen. & Mrs.", variants: ["gen & mrs", "gen and mrs", "gen. & mrs.", "gen. and mrs."] },
  { id: "maj_and_mrs", type: "style", ctx: "prefix", short: "Maj. & Mrs.", variants: ["maj & mrs", "maj and mrs", "maj. & mrs.", "maj. and mrs."] },
  // ---------------------------------------------------------------------------
  // European Union — common civil honorifics (local-language)
  // NOTE: canonical forms are local-language display forms. Matching folds diacritics.
  // ---------------------------------------------------------------------------
  // French (FR/BE/LU)
  { id: "fr_monsieur", type: "honorific", ctx: "prefix", short: "M.", long: "Monsieur", variants: ["m", "m.", "monsieur"] },
  { id: "fr_madame", type: "honorific", ctx: "prefix", short: "Mme", long: "Madame", variants: ["mme", "mme.", "madame"] },
  { id: "fr_mademoiselle", type: "honorific", ctx: "prefix", short: "Mlle", long: "Mademoiselle", variants: ["mlle", "mlle.", "mademoiselle"] },
  // German (DE/AT)
  { id: "de_herr", type: "honorific", ctx: "prefix", short: "Herr", variants: ["herr"] },
  { id: "de_frau", type: "honorific", ctx: "prefix", short: "Frau", variants: ["frau"] },
  { id: "de_dr", type: "honorific", ctx: "prefix", short: "Dr.", long: "Doktor", variants: ["dr", "dr.", "doktor"] },
  { id: "de_prof", type: "honorific", ctx: "prefix", short: "Prof.", long: "Professor", variants: ["prof", "prof.", "professor"] },
  { id: "de_ing", type: "professional", ctx: "prefix", short: "Ing.", long: "Ingenieur", variants: ["ing", "ing.", "ingenieur", "ingenieurin"] },
  // Spanish (ES)
  { id: "es_senor", type: "honorific", ctx: "prefix", short: "Sr.", long: "Se\xF1or", variants: ["sr", "sr.", "senor", "se\xF1or"] },
  { id: "es_senora", type: "honorific", ctx: "prefix", short: "Sra.", long: "Se\xF1ora", variants: ["sra", "sra.", "senora", "se\xF1ora"] },
  { id: "es_senorita", type: "honorific", ctx: "prefix", short: "Srta.", long: "Se\xF1orita", variants: ["srta", "srta.", "senorita", "se\xF1orita"] },
  { id: "es_don", type: "style", ctx: "prefix", short: "Don", variants: ["don"] },
  { id: "es_dona", type: "style", ctx: "prefix", short: "Do\xF1a", variants: ["dona", "do\xF1a"] },
  // Portuguese (PT)
  { id: "pt_senhor", type: "honorific", ctx: "prefix", short: "Sr.", long: "Senhor", variants: ["sr", "sr.", "senhor"] },
  { id: "pt_senhora", type: "honorific", ctx: "prefix", short: "Sra.", long: "Senhora", variants: ["sra", "sra.", "senhora"] },
  { id: "pt_doutor", type: "honorific", ctx: "prefix", short: "Dr.", long: "Doutor", variants: ["dr", "dr.", "doutor", "doutora"] },
  // Italian (IT)
  { id: "it_signore", type: "honorific", ctx: "prefix", short: "Sig.", long: "Signore", variants: ["sig", "sig.", "signore"] },
  { id: "it_signora", type: "honorific", ctx: "prefix", short: "Sig.ra", long: "Signora", variants: ["sig.ra", "sigra", "signora"] },
  { id: "it_signorina", type: "honorific", ctx: "prefix", short: "Sig.na", long: "Signorina", variants: ["sig.na", "signorina"] },
  { id: "it_dottore", type: "honorific", ctx: "prefix", short: "Dott.", long: "Dottore", variants: ["dott", "dott.", "dottore"] },
  { id: "it_dottoressa", type: "honorific", ctx: "prefix", short: "Dott.ssa", long: "Dottoressa", variants: ["dott.ssa", "dottsa", "dottoressa"] },
  { id: "it_professore", type: "honorific", ctx: "prefix", short: "Prof.", long: "Professore", variants: ["prof", "prof.", "professore"] },
  { id: "it_professoressa", type: "honorific", ctx: "prefix", short: "Prof.ssa", long: "Professoressa", variants: ["prof.ssa", "profssa", "professoressa"] },
  // Dutch (NL/BE)
  { id: "nl_de_heer", type: "honorific", ctx: "prefix", short: "Dhr.", long: "De heer", variants: ["dhr", "dhr.", "de heer"] },
  { id: "nl_mevrouw", type: "honorific", ctx: "prefix", short: "Mevr.", long: "Mevrouw", variants: ["mevr", "mevr.", "mevrouw"] },
  { id: "nl_juffrouw", type: "honorific", ctx: "prefix", short: "Juf.", long: "Juffrouw", variants: ["juf", "juf.", "juffrouw"] },
  // Swedish (SE)
  { id: "se_herr", type: "honorific", ctx: "prefix", short: "Herr", variants: ["herr"] },
  { id: "se_fru", type: "honorific", ctx: "prefix", short: "Fru", variants: ["fru"] },
  { id: "se_fr\xF6ken", type: "honorific", ctx: "prefix", short: "Fr\xF6ken", variants: ["froken", "fr\xF6ken"] },
  // Danish (DK) / Norwegian (NO)
  { id: "dk_hr", type: "honorific", ctx: "prefix", short: "Hr.", long: "Herr", variants: ["hr", "hr.", "herr"] },
  { id: "dk_fru", type: "honorific", ctx: "prefix", short: "Fru", variants: ["fru"] },
  { id: "no_hr", type: "honorific", ctx: "prefix", short: "Hr.", variants: ["hr", "hr."] },
  { id: "no_fru", type: "honorific", ctx: "prefix", short: "Fru", variants: ["fru"] },
  // Polish (PL)
  { id: "pl_pan", type: "honorific", ctx: "prefix", short: "Pan", variants: ["pan"] },
  { id: "pl_pani", type: "honorific", ctx: "prefix", short: "Pani", variants: ["pani"] },
  // Czech (CZ) / Slovak (SK)
  { id: "cz_pan", type: "honorific", ctx: "prefix", short: "Pan", variants: ["pan"] },
  { id: "cz_pani", type: "honorific", ctx: "prefix", short: "Pan\xED", variants: ["pani", "pan\xED"] },
  // Greek (GR) — common abbreviations (ASCII-friendly variants included)
  { id: "gr_kyr", type: "honorific", ctx: "prefix", short: "\u03BA.", long: "\u039A\u03CD\u03C1\u03B9\u03BF\u03C2", variants: ["k", "k.", "\u03BA", "\u03BA.", "\u03BA\u03C5\u03C1\u03B9\u03BF\u03C2", "\u03BA\u03CD\u03C1\u03B9\u03BF\u03C2"] },
  { id: "gr_kyria", type: "honorific", ctx: "prefix", short: "\u03BA\u03B1.", long: "\u039A\u03C5\u03C1\u03AF\u03B1", variants: ["ka", "ka.", "\u03BA\u03B1", "\u03BA\u03B1.", "\u03BA\u03C5\u03C1\u03B9\u03B1", "\u03BA\u03C5\u03C1\u03AF\u03B1"] }
];
var SUFFIX_AFFIX_ENTRIES = [
  { id: "jr", type: "generational", ctx: "suffix", short: "Jr.", variants: ["jr", "jr."] },
  { id: "sr", type: "generational", ctx: "suffix", short: "Sr.", variants: ["sr", "sr."] },
  { id: "ii", type: "dynasticNumber", ctx: "suffix", short: "II", variants: ["ii"] },
  { id: "iii", type: "dynasticNumber", ctx: "suffix", short: "III", variants: ["iii"] },
  { id: "iv", type: "dynasticNumber", ctx: "suffix", short: "IV", variants: ["iv"] },
  { id: "v", type: "dynasticNumber", ctx: "suffix", short: "V", variants: ["v"] },
  // ---------------------------------------------------------------------------
  // English-speaking + broadly EU-used postnominals (degrees, credentials)
  // Canonical punctuation is stored; matching tolerates stripped dots.
  // ---------------------------------------------------------------------------
  // Associate's
  { id: "aa", type: "education", ctx: "suffix", short: "A.A.", long: "Associate of Arts", variants: ["aa", "a.a."] },
  { id: "as", type: "education", ctx: "suffix", short: "A.S.", long: "Associate of Science", variants: ["as", "a.s."] },
  { id: "aas", type: "education", ctx: "suffix", short: "A.A.S.", long: "Associate of Applied Science", variants: ["aas", "a.a.s."] },
  // Bachelor's
  { id: "ba", type: "education", ctx: "suffix", short: "B.A.", long: "Bachelor of Arts", variants: ["ba", "b.a."] },
  { id: "bs", type: "education", ctx: "suffix", short: "B.S.", long: "Bachelor of Science", variants: ["bs", "b.s."] },
  { id: "bba", type: "education", ctx: "suffix", short: "B.B.A.", long: "Bachelor of Business Administration", variants: ["bba", "b.b.a."] },
  // Master's
  { id: "ma", type: "education", ctx: "suffix", short: "M.A.", long: "Master of Arts", variants: ["ma", "m.a."] },
  { id: "ms", type: "education", ctx: "suffix", short: "M.S.", long: "Master of Science", variants: ["ms", "m.s."] },
  { id: "phd", type: "education", ctx: "suffix", short: "Ph.D.", variants: ["phd", "ph.d."] },
  { id: "dphil", type: "education", ctx: "suffix", short: "D.Phil.", variants: ["dphil", "d.phil."] },
  { id: "md", type: "education", ctx: "suffix", short: "M.D.", variants: ["md", "m.d."] },
  { id: "do", type: "education", ctx: "suffix", short: "D.O.", variants: ["do", "d.o."] },
  { id: "dds", type: "education", ctx: "suffix", short: "D.D.S.", variants: ["dds", "d.d.s."] },
  { id: "dmd", type: "education", ctx: "suffix", short: "D.M.D.", variants: ["dmd", "d.m.d."] },
  { id: "dvm", type: "education", ctx: "suffix", short: "D.V.M.", variants: ["dvm", "d.v.m."] },
  { id: "jd", type: "education", ctx: "suffix", short: "J.D.", variants: ["jd", "j.d."] },
  { id: "edd", type: "education", ctx: "suffix", short: "Ed.D.", variants: ["edd", "ed.d."] },
  { id: "pharmd", type: "education", ctx: "suffix", short: "Pharm.D.", variants: ["pharmd", "pharm.d."] },
  { id: "psyd", type: "education", ctx: "suffix", short: "Psy.D.", variants: ["psyd", "psy.d."] },
  { id: "dpt", type: "education", ctx: "suffix", short: "D.P.T.", variants: ["dpt", "d.p.t."] },
  { id: "od", type: "education", ctx: "suffix", short: "O.D.", variants: ["od", "o.d."] },
  { id: "llb", type: "education", ctx: "suffix", short: "LL.B.", variants: ["llb", "ll.b."] },
  { id: "llm", type: "education", ctx: "suffix", short: "LL.M.", variants: ["llm", "ll.m."] },
  { id: "mba", type: "education", ctx: "suffix", short: "M.B.A.", variants: ["mba", "m.b.a."] },
  { id: "med", type: "education", ctx: "suffix", short: "M.Ed.", variants: ["med", "m.ed."] },
  { id: "mat", type: "education", ctx: "suffix", short: "M.A.T.", variants: ["mat", "m.a.t."] },
  { id: "msc", type: "education", ctx: "suffix", short: "M.Sc.", variants: ["msc", "m.sc."] },
  { id: "bsc", type: "education", ctx: "suffix", short: "B.Sc.", variants: ["bsc", "b.sc."] },
  { id: "mpa", type: "education", ctx: "suffix", short: "M.P.A.", variants: ["mpa", "m.p.a."] },
  { id: "msw", type: "education", ctx: "suffix", short: "M.S.W.", variants: ["msw", "m.s.w."] },
  { id: "meng", type: "education", ctx: "suffix", short: "M.Eng.", variants: ["meng", "m.eng."] },
  { id: "beng", type: "education", ctx: "suffix", short: "B.Eng.", variants: ["beng", "b.eng."] },
  // Nursing/medical
  { id: "rn", type: "professional", ctx: "suffix", short: "RN", variants: ["rn"] },
  { id: "np", type: "professional", ctx: "suffix", short: "NP", variants: ["np"] },
  { id: "pa_c", type: "professional", ctx: "suffix", short: "PA-C", variants: ["pa-c", "pac", "pa c"] },
  // Accounting/finance
  { id: "cpa", type: "professional", ctx: "suffix", short: "CPA", variants: ["cpa"] },
  { id: "cfa", type: "professional", ctx: "suffix", short: "CFA", variants: ["cfa"] },
  // Legal
  { id: "esq", type: "professional", ctx: "suffix", short: "Esq.", variants: ["esq", "esq."] },
  { id: "kc", type: "professional", ctx: "suffix", short: "KC", variants: ["kc"] },
  { id: "qc", type: "professional", ctx: "suffix", short: "QC", variants: ["qc"] },
  // ---------------------------------------------------------------------------
  // UK/IE honours (postnominals) — stored canonically
  // ---------------------------------------------------------------------------
  { id: "obe", type: "postnominalHonor", ctx: "suffix", short: "OBE", variants: ["obe"] },
  { id: "mbe", type: "postnominalHonor", ctx: "suffix", short: "MBE", variants: ["mbe"] },
  { id: "cbe", type: "postnominalHonor", ctx: "suffix", short: "CBE", variants: ["cbe"] },
  { id: "kbe", type: "postnominalHonor", ctx: "suffix", short: "KBE", variants: ["kbe"] },
  { id: "dbe", type: "postnominalHonor", ctx: "suffix", short: "DBE", variants: ["dbe"] },
  { id: "cmg", type: "postnominalHonor", ctx: "suffix", short: "CMG", variants: ["cmg"] },
  { id: "cvo", type: "postnominalHonor", ctx: "suffix", short: "CVO", variants: ["cvo"] },
  { id: "mvo", type: "postnominalHonor", ctx: "suffix", short: "MVO", variants: ["mvo"] }
];

// src/affixes.ts
var ROMAN_NUMERALS = /* @__PURE__ */ new Set(["II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]);
var PREFIX_INDEX = buildAffixVariantIndex(PREFIX_AFFIX_ENTRIES, "prefix");
var SUFFIX_INDEX = buildAffixVariantIndex(SUFFIX_AFFIX_ENTRIES, "suffix");
var HONORIFIC = /* @__PURE__ */ new Set(["MR", "MRS", "MS", "MISS", "MX", "DR", "PROF", "SIR", "DAME"]);
var STYLE_PHRASES = /* @__PURE__ */ new Set([
  "THE HON",
  "THE HONOURABLE",
  "THE RIGHT HONOURABLE",
  "RIGHT HONOURABLE",
  "THE RT HON",
  "HIS EXCELLENCY",
  "HER EXCELLENCY"
]);
var NOBILITY_AND_ROYALTY = /* @__PURE__ */ new Set([
  "HER MAJESTY",
  "HIS MAJESTY",
  "HER GRACE",
  "HIS GRACE",
  "PRINCE",
  "PRINCESS",
  "DUKE",
  "DUCHESS",
  "EARL",
  "LORD",
  "LADY",
  "BARON",
  "BARONESS",
  "COUNT",
  "COUNTESS",
  "MARQUESS",
  "MARQUIS",
  "VISCOUNT",
  "VISCOUNTESS",
  "VISC"
  // common abbreviation used in "The Rt Hon Visc"
]);
var RELIGIOUS = /* @__PURE__ */ new Set(["REV", "REVEREND", "FR", "FATHER", "RABBI", "IMAM", "PASTOR", "SISTER", "SR", "BR", "BROTHER"]);
var MILITARY = /* @__PURE__ */ new Set(["PVT", "CPL", "SGT", "LT", "CPT", "CAPT", "MAJ", "COL", "GEN", "ADM"]);
var JUDICIAL = /* @__PURE__ */ new Set(["JUDGE", "JUSTICE"]);
var PROFESSIONAL = /* @__PURE__ */ new Set(["ESQ", "CPA", "CFA", "PE", "RN", "DDS"]);
var EDUCATION = /* @__PURE__ */ new Set(["PHD", "MD", "JD", "MBA", "MS", "MA", "BS", "BA", "DVM"]);
var POSTNOMINAL_HONOR = /* @__PURE__ */ new Set(["OBE", "MBE", "CBE", "KBE", "DBE"]);
var SPLITTABLE_WORDS = /* @__PURE__ */ new Set([
  ...HONORIFIC,
  ...NOBILITY_AND_ROYALTY,
  ...RELIGIOUS,
  ...MILITARY,
  ...JUDICIAL,
  ...PROFESSIONAL,
  ...EDUCATION,
  ...POSTNOMINAL_HONOR,
  "JR",
  "SR",
  ...ROMAN_NUMERALS,
  "HON"
  // allow splitting "The Hon Dr" once style phrase is handled
]);
for (const entry of [...PREFIX_AFFIX_ENTRIES, ...SUFFIX_AFFIX_ENTRIES]) {
  const candidates = [];
  if (entry.short)
    candidates.push(entry.short);
  if (entry.long)
    candidates.push(entry.long);
  if (entry.variants)
    candidates.push(...entry.variants);
  for (const c of candidates) {
    const k = normalizeAffixVariantForMatch(c);
    if (k && !k.includes(" "))
      SPLITTABLE_WORDS.add(k);
  }
}
var MULTIWORD_PREFIX_PHRASES = (() => {
  const phrases = [];
  const add = (s) => {
    const k = normalizeAffixVariantForMatch(s);
    if (!k || !k.includes(" "))
      return;
    const words = k.split(" ").filter(Boolean);
    if (words.length >= 2)
      phrases.push({ words, len: words.length });
  };
  for (const entry of PREFIX_AFFIX_ENTRIES) {
    if (entry.short)
      add(entry.short);
    if (entry.long)
      add(entry.long);
    if (entry.variants)
      entry.variants.forEach(add);
  }
  phrases.sort((a, b) => b.len - a.len);
  const seen = /* @__PURE__ */ new Set();
  return phrases.filter((p) => {
    const key = p.words.join(" ");
    if (seen.has(key))
      return false;
    seen.add(key);
    return true;
  });
})();
function collapseSpaces(value) {
  return value.trim().replace(/\s+/g, " ");
}
function stripEdgePunctuation(value) {
  return value.trim().replace(/^[,;:\s]+/, "").replace(/[,;:\s]+$/, "");
}
function normalizeAffix(value) {
  const raw = collapseSpaces(stripEdgePunctuation(value));
  const normalized = raw.replace(/^[.]+/, "").replace(/[.]+$/, "").replace(/\s+/g, " ").replace(/[\u2019\u2018\u02BC]/g, "'").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const normalizedKey = normalized.replace(/\./g, "").replace(/\s+/g, " ").trim();
  return { normalized, normalizedKey };
}
function looksAbbreviated(value, normalizedKey) {
  if (/[.]/.test(value))
    return true;
  if (normalizedKey.includes(" "))
    return false;
  return /^[A-Z]{2,5}$/.test(normalizedKey);
}
function classifyType(normalizedKey, ctx) {
  if (ROMAN_NUMERALS.has(normalizedKey) && ctx === "suffix")
    return "dynasticNumber";
  if (/^(JR|SR)$/.test(normalizedKey))
    return "generational";
  if (NOBILITY_AND_ROYALTY.has(normalizedKey))
    return "style";
  if (EDUCATION.has(normalizedKey))
    return "education";
  if (PROFESSIONAL.has(normalizedKey))
    return "professional";
  if (POSTNOMINAL_HONOR.has(normalizedKey))
    return "postnominalHonor";
  if (MILITARY.has(normalizedKey))
    return "military";
  if (JUDICIAL.has(normalizedKey))
    return "judicial";
  if (normalizedKey === "SR" && ctx === "prefix")
    return "religious";
  if (RELIGIOUS.has(normalizedKey))
    return "religious";
  if (HONORIFIC.has(normalizedKey))
    return "honorific";
  if (STYLE_PHRASES.has(normalizedKey))
    return "style";
  if (ctx === "prefix" && normalizedKey.includes(" ")) {
    const k = normalizedKey;
    if (k.includes("EXCELLENCY") || k.includes("HONOURABLE") || k.includes("HON"))
      return "style";
    if (k.includes("JUDGE") || k.includes("JUSTICE"))
      return "judicial";
    if (k.includes("RABBI") || k.includes("IMAM") || k.includes("REVEREND") || k.includes("SISTER") || k.includes("BROTHER") || k.includes("FATHER"))
      return "religious";
    if (k.includes("ADMIRAL") || k.includes("MARSHAL") || k.includes("GENERAL") || k.includes("COLONEL") || k.includes("CAPTAIN") || k.includes("LIEUTENANT") || k.includes("SERGEANT")) {
      return "military";
    }
  }
  if (ctx === "suffix" && normalizedKey.includes(" ")) {
    const k = normalizedKey;
    if (k.includes("PHD") || k.includes("MBA") || k.includes("MD") || k.includes("JD"))
      return "education";
    if (k.includes("ESQ") || k.includes("CPA") || k.includes("RN") || k.includes("PE"))
      return "professional";
  }
  return "other";
}
function classifyAffixToken(value, ctx) {
  const v = collapseSpaces(stripEdgePunctuation(value));
  const { normalizedKey } = normalizeAffix(v);
  const entry = (ctx === "prefix" ? PREFIX_INDEX : SUFFIX_INDEX).get(normalizedKey);
  const type = entry ? entry.type : classifyType(normalizedKey, ctx);
  const isAbbrev = looksAbbreviated(v, normalizedKey);
  const requiresCommaBefore = ctx === "suffix" && (type === "generational" || type === "professional" || type === "education" || type === "postnominalHonor" || normalizedKey === "ESQ");
  return {
    type,
    value: v,
    normalized: normalizedKey,
    entryId: entry?.id,
    canonicalShort: entry?.short,
    canonicalLong: entry?.long,
    isAbbrev: isAbbrev || void 0,
    requiresCommaBefore: requiresCommaBefore || void 0
  };
}
function matchKnownPrefixPhraseAt(words, startIdx) {
  const remaining = words.slice(startIdx);
  for (const p of MULTIWORD_PREFIX_PHRASES) {
    if (remaining.length < p.len)
      continue;
    const slice = remaining.slice(0, p.len).join(" ");
    if (slice === p.words.join(" "))
      return p.len;
  }
  return 0;
}
function matchStylePhraseAt(words, startIdx) {
  const remaining = words.slice(startIdx);
  const candidates = [
    { phrase: ["THE", "RIGHT", "HONOURABLE"], len: 3 },
    { phrase: ["RIGHT", "HONOURABLE"], len: 2 },
    { phrase: ["THE", "HONOURABLE"], len: 2 },
    { phrase: ["THE", "RT", "HON"], len: 3 },
    { phrase: ["THE", "HON"], len: 2 },
    { phrase: ["HIS", "EXCELLENCY"], len: 2 },
    { phrase: ["HER", "EXCELLENCY"], len: 2 },
    { phrase: ["HIS", "MAJESTY"], len: 2 },
    { phrase: ["HER", "MAJESTY"], len: 2 },
    { phrase: ["HIS", "GRACE"], len: 2 },
    { phrase: ["HER", "GRACE"], len: 2 }
  ];
  for (const c of candidates) {
    if (remaining.length < c.len)
      continue;
    const slice = remaining.slice(0, c.len).join(" ");
    if (slice === c.phrase.join(" "))
      return c.len;
  }
  return 0;
}
function splitAffixToAtomicParts(value, ctx) {
  const raw = collapseSpaces(value);
  if (!raw)
    return [];
  const delimiterSplit = raw.split(/[;,/]+/g).map((s) => s.trim()).filter(Boolean).flatMap((chunk) => {
    if (ctx === "suffix") {
      return chunk.split(/\band\b/gi).map((s) => s.trim()).filter(Boolean);
    }
    return [chunk];
  });
  const out = [];
  for (const chunk of delimiterSplit) {
    const words = chunk.split(/\s+/).filter(Boolean);
    if (words.length <= 1) {
      out.push(chunk);
      continue;
    }
    const normalizedWords = words.map((w) => normalizeAffix(w).normalizedKey.replace(/\s+/g, " "));
    const allSplittable = normalizedWords.every((w) => SPLITTABLE_WORDS.has(w));
    if (allSplittable) {
      out.push(...words);
      continue;
    }
    let i = 0;
    while (i < words.length) {
      if (ctx === "prefix") {
        const knownLen = matchKnownPrefixPhraseAt(normalizedWords, i);
        if (knownLen > 0) {
          out.push(words.slice(i, i + knownLen).join(" "));
          i += knownLen;
          continue;
        }
      }
      const styleLen = matchStylePhraseAt(normalizedWords, i);
      if (styleLen > 0) {
        out.push(words.slice(i, i + styleLen).join(" "));
        i += styleLen;
        continue;
      }
      if (SPLITTABLE_WORDS.has(normalizedWords[i])) {
        out.push(words[i]);
        i += 1;
        continue;
      }
      const nextSplittableIdx = normalizedWords.findIndex((w, idx) => idx > i && SPLITTABLE_WORDS.has(w));
      if (nextSplittableIdx > i) {
        out.push(words.slice(i, nextSplittableIdx).join(" "));
        i = nextSplittableIdx;
        continue;
      }
      out.push(words.slice(i).join(" "));
      break;
    }
  }
  return out.map(stripEdgePunctuation).map(collapseSpaces).filter(Boolean);
}
function buildAffixTokens(displayValue, ctx) {
  if (!displayValue)
    return void 0;
  const parts = splitAffixToAtomicParts(displayValue, ctx);
  if (parts.length === 0)
    return void 0;
  return parts.map((p) => classifyAffixToken(p, ctx));
}

// src/normalize.ts
function normalizeInput(raw) {
  if (!raw)
    return "";
  let s = raw.trim();
  s = s.replace(/\s+/g, " ");
  s = s.replace(/[""]/g, '"');
  s = s.replace(/['']/g, "'");
  s = s.replace(/\s*&\s*/g, " & ");
  s = s.replace(/\s*\+\s*/g, " + ");
  s = s.replace(/[,\s]+$/g, "");
  return s;
}
function tokenize(text) {
  return text.split(/\s+/).filter(Boolean);
}
function isNameLikeToken(token) {
  if (/^([A-Z]\.?)+$/.test(token))
    return true;
  return /^[A-Z][a-zA-Z]*(?:['-][A-zA-Z]+)*$/.test(token);
}
function extractParenContent(text) {
  const match = text.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (match) {
    return { main: match[1].trim(), paren: match[2].trim() };
  }
  return null;
}
function isAllCaps(text) {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  return letters.length > 0 && letters === letters.toUpperCase();
}
function hasAtSymbol(text) {
  return text.includes("@");
}
function extractAngleBrackets(text) {
  const match = text.match(/^(.*?)\s*<([^>]+)>\s*$/);
  if (match) {
    return { display: match[1].trim(), bracket: match[2].trim() };
  }
  return null;
}
function startsWithThe(text) {
  return /^the\s+/i.test(text);
}
function stripLeadingThe(text) {
  return text.replace(/^the\s+/i, "");
}
function hasPluralSurnameEnding(text) {
  return /\b[A-Z][a-z]+(s|es)\s*$/i.test(text);
}

// src/data/legal-forms.ts
var LEGAL_FORM_ENTRIES = [
  // US corporate forms (strong)
  { id: "Inc", patterns: ["INC", "INCORPORATED"], strong: true },
  { id: "Corp", patterns: ["CORP", "CORPORATION"], strong: true },
  { id: "LLC", patterns: ["LLC", "L L C", "L.L.C."], strong: true },
  { id: "LLP", patterns: ["LLP", "L L P", "L.L.P."], strong: true },
  { id: "LP", patterns: ["LP", "L P", "L.P."], strong: true },
  // UK/Commonwealth forms (strong)
  { id: "Ltd", patterns: ["LTD", "LIMITED"], strong: true },
  { id: "PLC", patterns: ["PLC", "P L C", "P.L.C."], strong: true },
  // European forms (strong)
  { id: "GmbH", patterns: ["GMBH", "G M B H"], strong: true },
  { id: "AG", patterns: ["AG", "A G"], strong: true },
  { id: "SA", patterns: ["SA", "S A", "S.A."], strong: true },
  { id: "SAS", patterns: ["SAS", "S A S"], strong: true },
  { id: "BV", patterns: ["BV", "B V", "B.V."], strong: true },
  { id: "Oy", patterns: ["OY"], strong: true },
  { id: "SRL", patterns: ["SRL", "S R L"], strong: true },
  { id: "SpA", patterns: ["SPA", "S P A"], strong: true },
  // Institutional forms (strong)
  { id: "Trust", patterns: ["TRUST"], strong: true },
  { id: "Foundation", patterns: ["FOUNDATION"], strong: true },
  // Weaker signals (need context)
  { id: "Company", patterns: ["COMPANY"], strong: false },
  { id: "Co", patterns: ["CO"], strong: false }
];
function buildLegalFormIndex() {
  const map = /* @__PURE__ */ new Map();
  for (const entry of LEGAL_FORM_ENTRIES) {
    for (const pattern of entry.patterns) {
      const key = normalizeForMatch(pattern);
      if (!map.has(key)) {
        map.set(key, entry);
      }
    }
  }
  return map;
}
function normalizeForMatch(value) {
  return value.toUpperCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
}
var LEGAL_FORM_INDEX = buildLegalFormIndex();
function matchLegalForm(token) {
  const normalized = normalizeForMatch(token);
  return LEGAL_FORM_INDEX.get(normalized);
}
var LEGAL_SUFFIX_END_RE = new RegExp(
  "(?:^|[\\s,])(inc\\.?|incorporated|corp\\.?|corporation|llc|l\\.l\\.c\\.|llp|l\\.l\\.p\\.|lp|l\\.p\\.|ltd\\.?|limited|plc|p\\.l\\.c\\.|gmbh|ag|s\\.?a\\.?|sas|bv|b\\.v\\.|oy|srl|spa|trust|foundation)\\.?$",
  "i"
);
var COMMA_LEGAL_RE = /,\s*(inc\.?|llc|l\.l\.c\.|corp\.?|ltd\.?|plc|gmbh|s\.a\.)\.?$/i;
function extractLegalSuffix(text) {
  const commaMatch = text.match(COMMA_LEGAL_RE);
  if (commaMatch) {
    const suffix = commaMatch[1];
    const baseName = text.slice(0, commaMatch.index).trim();
    const entry = matchLegalForm(suffix);
    return {
      baseName,
      suffix: commaMatch[0].trim(),
      legalForm: entry?.id ?? "UnknownLegalForm"
    };
  }
  const endMatch = text.match(LEGAL_SUFFIX_END_RE);
  if (endMatch) {
    const suffix = endMatch[1];
    const fullMatch = endMatch[0];
    const baseName = text.slice(0, text.length - fullMatch.length).trim();
    const entry = matchLegalForm(suffix);
    return {
      baseName: baseName || text.replace(new RegExp(suffix + "\\.?$", "i"), "").trim(),
      suffix,
      legalForm: entry?.id ?? "UnknownLegalForm"
    };
  }
  return null;
}

// src/data/institutions.ts
var INSTITUTION_PHRASES = [
  // Banking/Financial (strong)
  { pattern: /\bbank\s+of\b/i, legalForm: "Bank", strong: true },
  { pattern: /\bfirst\s+national\s+bank\b/i, legalForm: "Bank", strong: true },
  { pattern: /\btrust\s+company\b/i, legalForm: "TrustCompany", strong: true },
  { pattern: /\bcredit\s+union\b/i, legalForm: "CreditUnion", strong: true },
  { pattern: /\bsavings\s+(?:and\s+)?loan\b/i, legalForm: "Bank", strong: true },
  { pattern: /\b(?:national|federal)\s+bank\b/i, legalForm: "Bank", strong: true },
  // Educational (strong)
  { pattern: /\buniversity\s+of\b/i, legalForm: "University", strong: true },
  { pattern: /\buniversity$/i, legalForm: "University", strong: true },
  { pattern: /\bcollege\s+of\b/i, legalForm: "University", strong: true },
  { pattern: /\binstitute\s+of\b/i, legalForm: "University", strong: true },
  // Healthcare (strong)
  { pattern: /\bhospital\b/i, legalForm: "Hospital", strong: true },
  { pattern: /\bmedical\s+center\b/i, legalForm: "Hospital", strong: true },
  { pattern: /\bclinic\b/i, legalForm: "Hospital", strong: false },
  // Religious (strong)
  { pattern: /\bchurch\s+of\b/i, legalForm: "Church", strong: true },
  { pattern: /\bchurch$/i, legalForm: "Church", strong: true },
  { pattern: /\bministry\b/i, legalForm: "Church", strong: true },
  { pattern: /\bsynagogue\b/i, legalForm: "Church", strong: true },
  { pattern: /\bmosque\b/i, legalForm: "Church", strong: true },
  { pattern: /\btemple\b/i, legalForm: "Church", strong: false },
  // Government (strong)
  { pattern: /\bcity\s+of\b/i, legalForm: "Government", strong: true },
  { pattern: /\bcounty\s+of\b/i, legalForm: "Government", strong: true },
  { pattern: /\bstate\s+of\b/i, legalForm: "Government", strong: true },
  { pattern: /\bdepartment\s+of\b/i, legalForm: "Government", strong: true },
  { pattern: /\bgovernment\s+of\b/i, legalForm: "Government", strong: true },
  { pattern: /\boffice\s+of\b/i, legalForm: "Government", strong: false }
];
var ORG_WEAK_KEYWORDS_RE = /\b(bank|trust|holdings|partners|group|company|co\.|associates|enterprises|services|solutions|consulting)\b/i;
var DBA_RE = /\b(d\/b\/a|doing\s+business\s+as|dba|aka|a\/k\/a)\b/i;
var CARE_OF_RE = /\b(c\/o|care\s+of|attn:?|attention:?)\b/i;
function matchInstitutionPhrase(text) {
  for (const phrase of INSTITUTION_PHRASES) {
    if (phrase.pattern.test(text)) {
      return phrase;
    }
  }
  return null;
}
function hasWeakOrgKeyword(text) {
  return ORG_WEAK_KEYWORDS_RE.test(text);
}
function hasDbaPattern(text) {
  return DBA_RE.test(text);
}
function hasCareOfPattern(text) {
  return CARE_OF_RE.test(text);
}
function extractDba(text) {
  const match = text.match(DBA_RE);
  if (!match)
    return null;
  const idx = match.index;
  const primary = text.slice(0, idx).trim();
  const aka = text.slice(idx + match[0].length).trim();
  if (primary && aka) {
    return { primary, aka };
  }
  return null;
}

// src/detectors/organization.ts
function detectOrganization(normalized, raw) {
  const reasons = [];
  let confidence = 0.5;
  let baseName = normalized;
  let legalSuffixRaw;
  let legalForm;
  let aka;
  const legalSuffixResult = extractLegalSuffix(normalized);
  if (legalSuffixResult) {
    reasons.push("ORG_LEGAL_SUFFIX");
    confidence = 1;
    baseName = legalSuffixResult.baseName;
    legalSuffixRaw = legalSuffixResult.suffix;
    legalForm = legalSuffixResult.legalForm;
    if (COMMA_LEGAL_RE.test(normalized)) {
      reasons.push("ORG_COMMA_LEGAL");
    }
  }
  const institutionMatch = matchInstitutionPhrase(normalized);
  if (institutionMatch) {
    reasons.push("ORG_INSTITUTION_PHRASE");
    if (institutionMatch.strong) {
      confidence = Math.max(confidence, 0.75);
    } else {
      confidence = Math.max(confidence, 0.5);
    }
    if (!legalForm) {
      legalForm = institutionMatch.legalForm;
    }
  }
  if (hasDbaPattern(normalized)) {
    reasons.push("ORG_DBA");
    confidence = Math.max(confidence, 0.75);
    const dbaResult = extractDba(normalized);
    if (dbaResult) {
      baseName = dbaResult.primary;
      aka = [dbaResult.aka];
    }
  }
  if (hasCareOfPattern(normalized)) {
    reasons.push("ORG_CARE_OF");
    if (reasons.length > 1) {
      confidence = Math.max(confidence, 0.5);
    }
  }
  if (reasons.length === 0 && hasWeakOrgKeyword(normalized)) {
    reasons.push("ORG_WEAK_KEYWORD");
    confidence = 0.5;
  }
  const isOrg = reasons.some(
    (r) => r === "ORG_LEGAL_SUFFIX" || r === "ORG_INSTITUTION_PHRASE" || r === "ORG_DBA"
  );
  if (!isOrg) {
    return { isOrg: false, confidence: 0, reasons: [] };
  }
  return {
    isOrg: true,
    confidence,
    reasons,
    entity: {
      kind: "organization",
      baseName: baseName || normalized,
      legalForm,
      legalSuffixRaw,
      aka
    }
  };
}
function buildOrganizationEntity(result, raw, normalized, locale = "en") {
  const meta = {
    raw,
    normalized,
    confidence: result.confidence,
    reasons: result.reasons,
    locale
  };
  return {
    kind: "organization",
    baseName: result.entity?.baseName || normalized,
    legalForm: result.entity?.legalForm,
    legalSuffixRaw: result.entity?.legalSuffixRaw,
    aka: result.entity?.aka,
    meta
  };
}

// src/detectors/compound.ts
var COMPOUND_CONNECTOR_RE = /(?:^|\s)(&|and|\+|et|;|\|)(?:\s|$)|(?:\s)(\/)\s/i;
var PAIRED_HONORIFIC_PATTERNS = [
  { pattern: /^mr\.?\s*[&+]\s*mrs\.?/i, first: "Mr.", second: "Mrs." },
  { pattern: /^mr\.?\s+and\s+mrs\.?/i, first: "Mr.", second: "Mrs." },
  { pattern: /^mr\.?\s*[&+]\s*ms\.?/i, first: "Mr.", second: "Ms." },
  { pattern: /^mr\.?\s+and\s+ms\.?/i, first: "Mr.", second: "Ms." },
  { pattern: /^mr\.?\s*[&+]\s*mr\.?/i, first: "Mr.", second: "Mr." },
  { pattern: /^mr\.?\s+and\s+mr\.?/i, first: "Mr.", second: "Mr." },
  { pattern: /^mrs\.?\s*[&+]\s*mrs\.?/i, first: "Mrs.", second: "Mrs." },
  { pattern: /^mrs\.?\s+and\s+mrs\.?/i, first: "Mrs.", second: "Mrs." },
  { pattern: /^ms\.?\s*[&+]\s*ms\.?/i, first: "Ms.", second: "Ms." },
  { pattern: /^ms\.?\s+and\s+ms\.?/i, first: "Ms.", second: "Ms." },
  { pattern: /^dr\.?\s*[&+]\s*mrs\.?/i, first: "Dr.", second: "Mrs." },
  { pattern: /^dr\.?\s+and\s+mrs\.?/i, first: "Dr.", second: "Mrs." },
  { pattern: /^dr\.?\s*[&+]\s*mr\.?/i, first: "Dr.", second: "Mr." },
  { pattern: /^dr\.?\s+and\s+mr\.?/i, first: "Dr.", second: "Mr." },
  { pattern: /^dr\.?\s*[&+]\s*ms\.?/i, first: "Dr.", second: "Ms." },
  { pattern: /^dr\.?\s+and\s+ms\.?/i, first: "Dr.", second: "Ms." },
  { pattern: /^dr\.?\s*[&+]\s*dr\.?/i, first: "Dr.", second: "Dr." },
  { pattern: /^dr\.?\s+and\s+dr\.?/i, first: "Dr.", second: "Dr." }
];
var PLURAL_HONORIFICS = {
  "drs": "Dr.",
  "drs.": "Dr.",
  "doctors": "Dr.",
  "messrs": "Mr.",
  "messrs.": "Mr.",
  "messieurs": "Mr.",
  "mmes": "Mrs.",
  "mmes.": "Mrs.",
  "mesdames": "Mrs.",
  "profs": "Prof.",
  "profs.": "Prof.",
  "professors": "Prof.",
  "revs": "Rev.",
  "revs.": "Rev.",
  "reverends": "Rev."
};
var SINGLE_HONORIFIC_RE = /^(mr|mrs|ms|miss|mx|dr|prof|sir|dame|rev|fr|rabbi|imam|pastor|judge|justice|capt|maj|col|gen|adm|sgt|lt)\.?\s+/i;
var SUFFIX_SET = /* @__PURE__ */ new Set([
  "jr",
  "jr.",
  "sr",
  "sr.",
  "ii",
  "iii",
  "iv",
  "v",
  "vi",
  "vii",
  "viii",
  "ix",
  "x",
  "phd",
  "ph.d.",
  "ph.d",
  "md",
  "m.d.",
  "dds",
  "d.d.s.",
  "dmd",
  "d.m.d.",
  "esq",
  "esq.",
  "jd",
  "j.d.",
  "mba",
  "m.b.a.",
  "cpa",
  "cfa",
  "rn",
  "np",
  "pa-c",
  "obe",
  "mbe",
  "cbe",
  "kbe",
  "dbe"
]);
function isSuffixToken(token) {
  return SUFFIX_SET.has(token.toLowerCase().replace(/\.$/, ""));
}
function getConnectorType(connector) {
  const lower = connector.toLowerCase().trim();
  if (lower === "&")
    return "&";
  if (lower === "and")
    return "and";
  if (lower === "+")
    return "+";
  if (lower === "et")
    return "et";
  return "unknown";
}
function detectPairedHonorifics(text) {
  for (const pair of PAIRED_HONORIFIC_PATTERNS) {
    if (pair.pattern.test(text)) {
      return pair;
    }
  }
  return null;
}
function detectPluralHonorific(text) {
  const tokens = tokenize(text);
  if (tokens.length === 0)
    return null;
  const firstToken = tokens[0].toLowerCase();
  const singular = PLURAL_HONORIFICS[firstToken];
  if (singular) {
    const remainder = tokens.slice(1).join(" ");
    return { plural: tokens[0], singular, remainder };
  }
  return null;
}
function parseMemberTokens(text) {
  let workingText = text.trim();
  let honorific;
  let suffix;
  const honorificMatch = workingText.match(SINGLE_HONORIFIC_RE);
  if (honorificMatch) {
    honorific = honorificMatch[0].trim();
    workingText = workingText.slice(honorificMatch[0].length).trim();
  }
  const commaIdx = workingText.lastIndexOf(",");
  if (commaIdx > 0) {
    const afterComma = workingText.slice(commaIdx + 1).trim();
    const suffixTokens = tokenize(afterComma);
    if (suffixTokens.length > 0 && isSuffixToken(suffixTokens[0])) {
      suffix = afterComma;
      workingText = workingText.slice(0, commaIdx).trim();
    }
  }
  const tokens = tokenize(workingText);
  while (tokens.length > 1 && isSuffixToken(tokens[tokens.length - 1])) {
    const suffixToken = tokens.pop();
    suffix = suffix ? `${suffixToken}, ${suffix}` : suffixToken;
  }
  workingText = tokens.join(" ");
  const nameTokens = tokenize(workingText);
  let given;
  let middle;
  let family;
  if (nameTokens.length === 0) {
  } else if (nameTokens.length === 1) {
    given = nameTokens[0];
  } else {
    given = nameTokens[0];
    family = nameTokens[nameTokens.length - 1];
    if (nameTokens.length > 2) {
      middle = nameTokens.slice(1, -1).join(" ");
    }
  }
  return { honorific, given, middle, family, suffix, raw: text };
}
function detectCompound(normalized) {
  const reasons = [];
  const pairedMatch = detectPairedHonorifics(normalized);
  if (pairedMatch) {
    const remainder = normalized.replace(pairedMatch.pattern, "").trim();
    const tokens = tokenize(remainder);
    reasons.push("COMPOUND_CONNECTOR");
    reasons.push("COMPOUND_PAIRED_HONORIFIC");
    if (tokens.length === 1 && isNameLikeToken(tokens[0])) {
      reasons.push("COMPOUND_SHARED_FAMILY");
      return {
        isCompound: true,
        confidence: 0.75,
        reasons,
        connector: "&",
        leftPart: pairedMatch.first,
        rightPart: pairedMatch.second,
        sharedFamily: tokens[0],
        pairedHonorifics: { first: pairedMatch.first, second: pairedMatch.second }
      };
    }
    if (tokens.length === 2 && isNameLikeToken(tokens[0]) && isNameLikeToken(tokens[1])) {
      reasons.push("COMPOUND_SHARED_FAMILY");
      return {
        isCompound: true,
        confidence: 1,
        reasons,
        connector: "&",
        leftPart: `${pairedMatch.first} ${tokens[0]}`,
        rightPart: pairedMatch.second,
        sharedFamily: tokens[1],
        pairedHonorifics: { first: pairedMatch.first, second: pairedMatch.second }
      };
    }
    const innerConnectorMatch = remainder.match(COMPOUND_CONNECTOR_RE);
    if (innerConnectorMatch) {
      const connectorIdx2 = innerConnectorMatch.index;
      const fullMatch2 = innerConnectorMatch[0];
      const connector2 = innerConnectorMatch[1] || innerConnectorMatch[2];
      const leftName = remainder.slice(0, connectorIdx2).trim();
      const rightName = remainder.slice(connectorIdx2 + fullMatch2.length).trim();
      if (leftName && rightName) {
        const rightTokens2 = tokenize(rightName);
        let sharedFamily2;
        if (rightTokens2.length >= 2) {
          const lastToken = rightTokens2[rightTokens2.length - 1];
          if (isNameLikeToken(lastToken) && !isSuffixToken(lastToken)) {
            sharedFamily2 = lastToken;
            reasons.push("COMPOUND_SHARED_FAMILY");
          }
        }
        return {
          isCompound: true,
          confidence: sharedFamily2 ? 1 : 0.75,
          reasons,
          connector: getConnectorType(connector2),
          leftPart: `${pairedMatch.first} ${leftName}`.trim(),
          rightPart: `${pairedMatch.second} ${rightName}`.trim(),
          sharedFamily: sharedFamily2,
          pairedHonorifics: { first: pairedMatch.first, second: pairedMatch.second }
        };
      }
    }
    if (remainder) {
      reasons.push("COMPOUND_SHARED_FAMILY");
      return {
        isCompound: true,
        confidence: 0.75,
        reasons,
        connector: "&",
        leftPart: pairedMatch.first,
        rightPart: pairedMatch.second,
        sharedFamily: remainder,
        pairedHonorifics: { first: pairedMatch.first, second: pairedMatch.second }
      };
    }
  }
  const pluralMatch = detectPluralHonorific(normalized);
  if (pluralMatch) {
    const connectorMatch2 = pluralMatch.remainder.match(COMPOUND_CONNECTOR_RE);
    if (connectorMatch2) {
      const connectorIdx2 = connectorMatch2.index;
      const fullMatch2 = connectorMatch2[0];
      const connector2 = connectorMatch2[1] || connectorMatch2[2];
      const leftName = pluralMatch.remainder.slice(0, connectorIdx2).trim();
      const rightName = pluralMatch.remainder.slice(connectorIdx2 + fullMatch2.length).trim();
      if (leftName && rightName) {
        reasons.push("COMPOUND_CONNECTOR");
        reasons.push("COMPOUND_PLURAL_HONORIFIC");
        const leftPart2 = `${pluralMatch.singular} ${leftName}`.trim();
        const rightPart2 = `${pluralMatch.singular} ${rightName}`.trim();
        const rightTokens2 = tokenize(rightName);
        let sharedFamily2;
        if (rightTokens2.length >= 2) {
          const lastToken = rightTokens2[rightTokens2.length - 1];
          if (isNameLikeToken(lastToken) && !isSuffixToken(lastToken)) {
            sharedFamily2 = lastToken;
            reasons.push("COMPOUND_SHARED_FAMILY");
          }
        }
        return {
          isCompound: true,
          confidence: sharedFamily2 ? 1 : 0.75,
          reasons,
          connector: getConnectorType(connector2),
          leftPart: leftPart2,
          rightPart: rightPart2,
          sharedFamily: sharedFamily2,
          pluralHonorific: pluralMatch.plural,
          singularHonorific: pluralMatch.singular
        };
      }
    }
  }
  const connectorMatch = normalized.match(COMPOUND_CONNECTOR_RE);
  if (!connectorMatch) {
    return { isCompound: false, confidence: 0, reasons: [] };
  }
  const connectorIdx = connectorMatch.index;
  const fullMatch = connectorMatch[0];
  const connector = connectorMatch[1] || connectorMatch[2];
  const connectorType = getConnectorType(connector);
  const leftPart = normalized.slice(0, connectorIdx).trim();
  const rightPart = normalized.slice(connectorIdx + fullMatch.length).trim();
  if (!leftPart || !rightPart) {
    return { isCompound: false, confidence: 0, reasons: [] };
  }
  const leftTokens = tokenize(leftPart);
  const rightTokens = tokenize(rightPart);
  const leftHasName = leftTokens.some(isNameLikeToken);
  const rightHasName = rightTokens.some(isNameLikeToken);
  if (!leftHasName || !rightHasName) {
    return { isCompound: false, confidence: 0, reasons: [] };
  }
  reasons.push("COMPOUND_CONNECTOR");
  let confidence = 0.5;
  if (leftHasName && rightHasName) {
    confidence = 0.75;
  }
  let sharedFamily;
  if (rightTokens.length >= 2) {
    let familyIdx = rightTokens.length - 1;
    while (familyIdx >= 0 && isSuffixToken(rightTokens[familyIdx])) {
      familyIdx--;
    }
    if (familyIdx >= 1) {
      const potentialShared = rightTokens[familyIdx];
      if (isNameLikeToken(potentialShared)) {
        const leftParsed = parseMemberTokens(leftPart);
        if (!leftParsed.family || leftParsed.given === leftParsed.family) {
          sharedFamily = potentialShared;
          reasons.push("COMPOUND_SHARED_FAMILY");
          confidence = 1;
        }
      }
    }
  }
  if (!sharedFamily && rightTokens.length === 1 && isNameLikeToken(rightTokens[0])) {
    const leftLower = leftPart.toLowerCase();
    if (/^(mr|mrs|ms|dr|rev)\.?\s*/i.test(leftLower)) {
      sharedFamily = rightTokens[0];
      reasons.push("COMPOUND_SHARED_FAMILY");
      confidence = 0.75;
    }
  }
  if (!sharedFamily && leftPart.includes(",")) {
    const commaParts = leftPart.split(",").map((p) => p.trim());
    if (commaParts.length >= 2 && isNameLikeToken(commaParts[0])) {
      sharedFamily = commaParts[0];
      reasons.push("COMPOUND_SHARED_FAMILY");
      confidence = 0.75;
    }
  }
  return {
    isCompound: true,
    confidence,
    reasons,
    connector: connectorType,
    leftPart,
    rightPart,
    sharedFamily
  };
}
function parseCompoundMember(text, raw, sharedFamily, inheritedHonorific, locale = "en") {
  const meta = {
    raw,
    normalized: text,
    confidence: 0.5,
    reasons: [],
    locale
  };
  if (!text.trim()) {
    return {
      kind: "unknown",
      text,
      meta
    };
  }
  const parsed = parseMemberTokens(text);
  const honorific = parsed.honorific || inheritedHonorific;
  let family = parsed.family;
  if (!family && sharedFamily) {
    family = sharedFamily;
  }
  if (parsed.family && sharedFamily && parsed.family.toLowerCase() === sharedFamily.toLowerCase()) {
  } else if (parsed.family && sharedFamily) {
    family = parsed.family;
  }
  return {
    kind: "person",
    honorific,
    given: parsed.given,
    middle: parsed.middle,
    family,
    suffix: parsed.suffix,
    meta
  };
}
function buildCompoundEntity(result, raw, normalized, locale = "en") {
  const meta = {
    raw,
    normalized,
    confidence: result.confidence,
    reasons: result.reasons,
    locale
  };
  const members = [];
  if (result.leftPart) {
    const inheritedHonorific = result.pairedHonorifics?.first || result.singularHonorific;
    const leftText = result.leftPart;
    const isJustHonorific = inheritedHonorific && leftText.toLowerCase().replace(/\./g, "") === inheritedHonorific.toLowerCase().replace(/\./g, "");
    const hasOwnHonorific = SINGLE_HONORIFIC_RE.test(leftText);
    if (isJustHonorific) {
      members.push({
        kind: "person",
        honorific: inheritedHonorific,
        family: result.sharedFamily,
        meta: {
          raw: leftText,
          normalized: leftText,
          confidence: 0.5,
          reasons: [],
          locale
        }
      });
    } else {
      members.push(parseCompoundMember(
        leftText,
        leftText,
        result.sharedFamily,
        hasOwnHonorific ? void 0 : inheritedHonorific,
        locale
      ));
    }
  }
  if (result.rightPart) {
    let rightText = result.rightPart;
    if (result.sharedFamily) {
      const familyRegex = new RegExp(`\\s+${escapeRegex(result.sharedFamily)}\\s*$`, "i");
      rightText = rightText.replace(familyRegex, "").trim() || result.rightPart;
    }
    const inheritedHonorific = result.pairedHonorifics?.second || result.singularHonorific;
    const isJustHonorific = inheritedHonorific && rightText.toLowerCase().replace(/\./g, "") === inheritedHonorific.toLowerCase().replace(/\./g, "");
    const hasOwnHonorific = SINGLE_HONORIFIC_RE.test(rightText);
    if (isJustHonorific) {
      members.push({
        kind: "person",
        honorific: inheritedHonorific,
        family: result.sharedFamily,
        meta: {
          raw: result.rightPart,
          normalized: rightText,
          confidence: 0.5,
          reasons: [],
          locale
        }
      });
    } else {
      members.push(parseCompoundMember(
        rightText || result.rightPart,
        result.rightPart,
        result.sharedFamily,
        hasOwnHonorific ? void 0 : inheritedHonorific,
        locale
      ));
    }
  }
  return {
    kind: "compound",
    connector: result.connector || "unknown",
    members,
    sharedFamily: result.sharedFamily,
    meta
  };
}
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// src/detectors/family.ts
var FAMILY_WORD_END_RE = /\b(family|household)\s*$/i;
var FAMILY_WORD_RE = /\b(family|household)\b/i;
function hasGivenNameTokens(text) {
  const tokens = tokenize(text);
  const familyWordIdx = tokens.findIndex((t) => /^(family|household)$/i.test(t));
  if (familyWordIdx > 0) {
    const beforeFamily = tokens.slice(0, familyWordIdx);
    return beforeFamily.length > 2 && beforeFamily.every(isNameLikeToken);
  }
  return false;
}
function detectFamily(normalized) {
  const reasons = [];
  let confidence = 0.5;
  let kind = "family";
  let style = "familyWord";
  let familyName = normalized;
  let article;
  let familyWord;
  const hasThe = startsWithThe(normalized);
  if (hasThe) {
    reasons.push("FAMILY_STARTS_WITH_THE");
    article = "The";
  }
  const withoutThe = hasThe ? stripLeadingThe(normalized) : normalized;
  const familyWordMatch = withoutThe.match(FAMILY_WORD_END_RE);
  if (familyWordMatch) {
    reasons.push("FAMILY_ENDS_WITH_FAMILY");
    reasons.push("FAMILY_HAS_FAMILY_WORD");
    confidence = 1;
    const word = familyWordMatch[1].toLowerCase();
    kind = word === "household" ? "household" : "family";
    familyWord = word === "household" ? "Household" : "Family";
    style = "familyWord";
    familyName = withoutThe.slice(0, familyWordMatch.index).trim();
    if (hasGivenNameTokens(withoutThe)) {
      confidence = 0.75;
    }
    return {
      isFamily: true,
      confidence,
      reasons,
      entity: {
        kind,
        article,
        familyName,
        style,
        familyWord
      }
    };
  }
  if (hasThe && hasPluralSurnameEnding(withoutThe)) {
    reasons.push("FAMILY_PLURAL_SURNAME");
    style = "pluralSurname";
    familyName = withoutThe.trim();
    confidence = 0.75;
    if (!FAMILY_WORD_RE.test(normalized)) {
      reasons.push("AMBIGUOUS_THE_PLURAL");
      confidence = 0.5;
    }
    return {
      isFamily: true,
      confidence,
      reasons,
      entity: {
        kind,
        article,
        familyName,
        style
      }
    };
  }
  if (hasThe) {
    return { isFamily: false, confidence: 0, reasons: [] };
  }
  return { isFamily: false, confidence: 0, reasons: [] };
}
function buildFamilyEntity(result, raw, normalized, locale = "en") {
  const meta = {
    raw,
    normalized,
    confidence: result.confidence,
    reasons: result.reasons,
    locale
  };
  return {
    kind: result.entity?.kind || "family",
    article: result.entity?.article,
    familyName: result.entity?.familyName || normalized,
    style: result.entity?.style || "familyWord",
    familyWord: result.entity?.familyWord,
    meta
  };
}

// src/detectors/person.ts
var SUFFIX_ALLOW_LIST = /* @__PURE__ */ new Set([
  "jr",
  "jr.",
  "sr",
  "sr.",
  "ii",
  "iii",
  "iv",
  "v",
  "vi",
  "vii",
  "viii",
  "ix",
  "x",
  "phd",
  "ph.d.",
  "ph.d",
  "md",
  "m.d.",
  "dds",
  "d.d.s.",
  "esq",
  "esq.",
  "jd",
  "j.d.",
  "mba",
  "m.b.a.",
  "cpa"
]);
var HONORIFIC_RE = /^(mr|mrs|ms|miss|mx|dr|prof|sir|dame|rev|fr|rabbi|imam|pastor|judge|justice|capt|maj|col|gen|adm|sgt|lt)\.?\s*/i;
function isKnownSuffix(token) {
  return SUFFIX_ALLOW_LIST.has(token.toLowerCase().replace(/\.$/, ""));
}
function tryParseReversed(normalized) {
  let text = normalized;
  let nickname;
  const quoteMatch = text.match(/[""']([^""']+)[""']/);
  if (quoteMatch) {
    nickname = quoteMatch[1].trim();
    text = text.replace(quoteMatch[0], " ").replace(/\s+/g, " ").trim();
  } else {
    const parenMatch = text.match(/\s*\(([^)]+)\)\s*/);
    if (parenMatch) {
      nickname = parenMatch[1].trim();
      text = text.replace(parenMatch[0], " ").trim();
    }
  }
  const parts = text.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2 || parts.length > 4) {
    return null;
  }
  const reasons = [];
  const familyPart = parts[0];
  if (!familyPart || !isNameLikeToken(familyPart.split(/\s+/)[0])) {
    return null;
  }
  const givenPart = parts[1];
  const givenTokens = tokenize(givenPart);
  if (givenTokens.length === 0 || !isNameLikeToken(givenTokens[0])) {
    return null;
  }
  let suffix;
  const remainingParts = parts.slice(2);
  for (const part of remainingParts) {
    const firstWord = part.split(/\s+/)[0];
    if (isKnownSuffix(firstWord)) {
      suffix = suffix ? `${suffix}, ${part}` : part;
      reasons.push("PERSON_HAS_SUFFIX");
    } else {
      return null;
    }
  }
  reasons.push("PERSON_REVERSED_FORMAT");
  const given = givenTokens[0];
  const middle = givenTokens.length > 1 ? givenTokens.slice(1).join(" ") : void 0;
  const familyTokens = tokenize(familyPart);
  const family = familyPart;
  const confidence = suffix ? 1 : 0.75;
  return {
    isPerson: true,
    confidence,
    reasons,
    entity: {
      kind: "person",
      given,
      middle,
      family,
      suffix,
      nickname,
      reversed: true
    }
  };
}
function parseStandardFormat(normalized) {
  const reasons = [];
  let confidence = 0.5;
  let text = normalized;
  let honorific;
  let nickname;
  let suffix;
  const honorificMatch = text.match(HONORIFIC_RE);
  if (honorificMatch) {
    honorific = honorificMatch[0].trim();
    text = text.slice(honorificMatch[0].length).trim();
    reasons.push("PERSON_HAS_HONORIFIC");
    confidence = 0.75;
  }
  const parenResult = extractParenContent(text);
  if (parenResult) {
    nickname = parenResult.paren;
    text = parenResult.main;
    reasons.push("HAS_PAREN_ANNOTATION");
  } else {
    const quoteMatch = text.match(/[""']([^""']+)[""']/);
    if (quoteMatch) {
      nickname = quoteMatch[1].trim();
      text = text.replace(quoteMatch[0], " ").replace(/\s+/g, " ").trim();
    }
  }
  const commaIdx = text.lastIndexOf(",");
  if (commaIdx > 0) {
    const afterComma = text.slice(commaIdx + 1).trim();
    const firstWord = afterComma.split(/\s+/)[0];
    if (isKnownSuffix(firstWord)) {
      suffix = afterComma;
      text = text.slice(0, commaIdx).trim();
      reasons.push("PERSON_HAS_SUFFIX");
      confidence = Math.max(confidence, 0.75);
    }
  }
  const tokens = tokenize(text);
  while (tokens.length > 1) {
    const lastToken = tokens[tokens.length - 1];
    if (isKnownSuffix(lastToken)) {
      suffix = suffix ? `${lastToken}, ${suffix}` : lastToken;
      tokens.pop();
      if (!reasons.includes("PERSON_HAS_SUFFIX")) {
        reasons.push("PERSON_HAS_SUFFIX");
      }
    } else {
      break;
    }
  }
  if (tokens.length === 0) {
    return { isPerson: false, confidence: 0, reasons: [] };
  }
  reasons.push("PERSON_STANDARD_FORMAT");
  let given;
  let middle;
  let family;
  if (tokens.length === 1) {
    given = tokens[0];
    reasons.push("AMBIGUOUS_SHORT_NAME");
  } else {
    given = tokens[0];
    family = tokens[tokens.length - 1];
    if (tokens.length > 2) {
      middle = tokens.slice(1, -1).join(" ");
    }
    confidence = Math.max(confidence, 0.75);
  }
  return {
    isPerson: true,
    confidence,
    reasons,
    entity: {
      kind: "person",
      honorific,
      given,
      middle,
      family,
      suffix,
      nickname,
      reversed: false
    }
  };
}
function detectPerson(normalized) {
  const reversedResult = tryParseReversed(normalized);
  if (reversedResult) {
    return reversedResult;
  }
  return parseStandardFormat(normalized);
}
function buildPersonEntity(result, raw, normalized, locale = "en") {
  const meta = {
    raw,
    normalized,
    confidence: result.confidence,
    reasons: result.reasons,
    locale
  };
  return {
    kind: "person",
    honorific: result.entity?.honorific,
    given: result.entity?.given,
    middle: result.entity?.middle,
    family: result.entity?.family,
    suffix: result.entity?.suffix,
    nickname: result.entity?.nickname,
    reversed: result.entity?.reversed,
    meta
  };
}

// src/classifier.ts
function classifyName(input, options = {}) {
  const raw = input;
  const locale = options.locale ?? "en";
  if (!input || typeof input !== "string" || !input.trim()) {
    return buildUnknown("", "", locale, [], "person");
  }
  let normalized = normalizeInput(input);
  const reasons = [];
  const angleBracketResult = extractAngleBrackets(normalized);
  if (angleBracketResult) {
    normalized = angleBracketResult.display || normalized;
    if (hasAtSymbol(angleBracketResult.bracket)) {
      reasons.push("HAS_EMAIL_OR_HANDLE");
    }
  }
  if (hasAtSymbol(normalized)) {
    reasons.push("HAS_EMAIL_OR_HANDLE");
    return applyStrict(buildUnknown(raw, normalized, locale, reasons), options);
  }
  if (isAllCaps(normalized)) {
    reasons.push("HAS_ALLCAPS");
  }
  const orgResult = detectOrganization(normalized, raw);
  if (orgResult.isOrg) {
    const entity = buildOrganizationEntity(orgResult, raw, normalized, locale);
    return applyStrict(entity, options);
  }
  const compoundResult = detectCompound(normalized);
  if (compoundResult.isCompound) {
    const entity = buildCompoundEntity(compoundResult, raw, normalized, locale);
    return applyStrict(entity, options);
  }
  const familyResult = detectFamily(normalized);
  if (familyResult.isFamily) {
    const entity = buildFamilyEntity(familyResult, raw, normalized, locale);
    return applyStrict(entity, options);
  }
  const personResult = detectPerson(normalized);
  if (personResult.isPerson) {
    const entity = buildPersonEntity(personResult, raw, normalized, locale);
    return applyStrict(entity, options);
  }
  return applyStrict(buildUnknown(raw, normalized, locale, reasons, guessType(normalized)), options);
}
function guessType(text) {
  if (text.length < 20 && /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(text)) {
    return "person";
  }
  if (/\b(corp|company|group|holdings|services|consulting)\b/i.test(text)) {
    return "organization";
  }
  return void 0;
}
function buildUnknown(raw, normalized, locale, reasons, guess) {
  const meta = {
    raw,
    normalized,
    confidence: 0.25,
    reasons,
    locale
  };
  return {
    kind: "unknown",
    text: normalized || raw,
    guess,
    meta
  };
}
function applyStrict(entity, options) {
  if (options.strictKind === "person" && entity.kind !== "person") {
    const meta = {
      ...entity.meta,
      confidence: 1,
      reasons: [...entity.meta.reasons]
    };
    const rejected = {
      kind: "rejected",
      rejectedAs: entity.kind === "rejected" ? "unknown" : entity.kind,
      meta
    };
    return rejected;
  }
  return entity;
}
function isPerson(entity) {
  return entity.kind === "person";
}
function isOrganization(entity) {
  return entity.kind === "organization";
}
function isFamily(entity) {
  return entity.kind === "family" || entity.kind === "household";
}
function isCompound(entity) {
  return entity.kind === "compound";
}
function isUnknown(entity) {
  return entity.kind === "unknown";
}
function isRejected(entity) {
  return entity.kind === "rejected";
}

// src/parsers.ts
function parseName(input, options) {
  return classifyName(input, options);
}
function parsePersonName(fullName) {
  if (!fullName || typeof fullName !== "string") {
    throw new Error("Invalid name: expected non-empty string");
  }
  let text = fullName.trim();
  const result = {};
  text = extractNickname(text, result);
  text = extractSuffixes(text, result);
  let parts = text.split(/\s+/);
  parts = extractPrefixes(parts, result);
  assignNameParts(parts, result);
  if (!result.first && !result.last) {
    throw new Error("Invalid name: no name parts found after parsing");
  }
  result.prefixTokens = buildAffixTokens(result.prefix, "prefix");
  result.suffixTokens = buildAffixTokens(result.suffix, "suffix");
  deriveFamilyParticle(result);
  derivePreferredGiven(result);
  deriveSortHelpers(result);
  return result;
}
function extractNickname(text, result) {
  const nickMatch = text.match(/([\"\'\(\[\"\'])(.*?)([\"\'\)\]\"\'])/);
  if (nickMatch) {
    result.nickname = nickMatch[2].trim();
    return text.replace(nickMatch[0], " ").replace(/\s+/g, " ").trim();
  }
  return text;
}
function extractSuffixes(text, result) {
  let workingText = text;
  const suffixesFound = [];
  const looksLikeKnownOrHeuristicSuffix = (value) => {
    const tokens = buildAffixTokens(value, "suffix");
    return !!tokens && tokens.length > 0 && tokens.some((t) => t.type !== "other");
  };
  const looksLikeUnknownPostNominalChunk = (value) => {
    const v = value.trim().replace(/^[,;:\s]+/, "").replace(/[,;:\s]+$/, "");
    if (!v)
      return false;
    if (v.length > 18)
      return false;
    if (/\d/.test(v))
      return false;
    if (/[^\p{L}.\-\s]/u.test(v))
      return false;
    if (!/[.]/.test(v) && !/[A-Z]/.test(v))
      return false;
    const lettersOnly = v.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[.\-\s]/g, "");
    if (!/^[A-Za-z]+$/.test(lettersOnly))
      return false;
    if (lettersOnly.length < 2 || lettersOnly.length > 10)
      return false;
    const upperCount = (lettersOnly.match(/[A-Z]/g) ?? []).length;
    if (!/[.]/.test(v) && upperCount / lettersOnly.length < 0.7)
      return false;
    return true;
  };
  const parts = workingText.split(",");
  while (parts.length > 1) {
    const lastPart = parts[parts.length - 1].trim();
    const firstWordOfLast = lastPart.split(/\s+/)[0];
    if (looksLikeKnownOrHeuristicSuffix(firstWordOfLast) || looksLikeKnownOrHeuristicSuffix(lastPart) || looksLikeUnknownPostNominalChunk(lastPart) || /queen|king|consort/i.test(lastPart)) {
      suffixesFound.unshift(lastPart);
      parts.pop();
    } else {
      break;
    }
  }
  workingText = parts.join(",").trim();
  const spaceParts = workingText.split(/\s+/);
  const spaceSuffixes = [];
  while (spaceParts.length > 1) {
    const lastWord = spaceParts[spaceParts.length - 1];
    const cleanWord = lastWord.replace(/[,]$/, "");
    if (looksLikeKnownOrHeuristicSuffix(cleanWord)) {
      spaceSuffixes.unshift(lastWord);
      spaceParts.pop();
    } else {
      break;
    }
  }
  const allSuffixes = [...spaceSuffixes, ...suffixesFound];
  if (allSuffixes.length > 0) {
    result.suffix = allSuffixes.join(", ");
    workingText = spaceParts.join(" ").trim();
  }
  return workingText;
}
function extractPrefixes(parts, result) {
  const prefixesFound = [];
  const looksLikePrefix = (value) => {
    const tokens = buildAffixTokens(value, "prefix");
    return !!tokens && tokens.length > 0 && tokens.every((t) => t.type !== "other");
  };
  while (parts.length > 1) {
    let matchFound = false;
    for (let len = Math.min(parts.length - 1, 5); len >= 1; len--) {
      const candidate = parts.slice(0, len).join(" ");
      if (looksLikePrefix(candidate)) {
        prefixesFound.push(candidate);
        parts.splice(0, len);
        matchFound = true;
        break;
      }
    }
    if (!matchFound) {
      break;
    }
  }
  if (prefixesFound.length > 0) {
    result.prefix = prefixesFound.join(" ");
  }
  return parts;
}
function assignNameParts(parts, result) {
  if (parts.length === 0)
    return;
  if (parts.length === 1) {
    result.first = parts[0];
    return;
  }
  let surnameStartIndex = parts.length - 1;
  for (let i = parts.length - 2; i >= 0; i--) {
    const word = parts[i];
    if (isParticle(word)) {
      surnameStartIndex = i;
      continue;
    }
    if (isCommonSurname(word) && !isCommonFirstName(word) && i > 0) {
      surnameStartIndex = i;
      continue;
    }
    break;
  }
  if (surnameStartIndex === 0) {
    result.last = parts.join(" ");
  } else {
    result.first = parts[0];
    if (surnameStartIndex > 1) {
      result.middle = parts.slice(1, surnameStartIndex).join(" ");
    }
    result.last = parts.slice(surnameStartIndex).join(" ");
  }
}
var FAMILY_PARTICLE_PHRASES = [
  // multi-word (check first)
  "de la",
  "de los",
  "de las",
  "van der",
  "van den",
  "van de",
  // single-word
  "de",
  "del",
  "da",
  "dos",
  "di",
  "van",
  "von",
  "al",
  "el",
  "bin",
  "ibn"
];
function deriveFamilyParticle(result) {
  const last = result.last?.trim();
  if (!last)
    return;
  const words = last.split(/\s+/).filter(Boolean);
  if (words.length < 2)
    return;
  const lowerWords = words.map((w) => w.toLowerCase());
  const candidates = [...FAMILY_PARTICLE_PHRASES].sort((a, b) => b.split(" ").length - a.split(" ").length);
  for (const phrase of candidates) {
    const pWords = phrase.split(" ");
    if (pWords.length >= words.length)
      continue;
    const matches = pWords.every((pw, idx) => lowerWords[idx] === pw);
    if (!matches)
      continue;
    const particleOriginal = words.slice(0, pWords.length).join(" ");
    const remainderWords = words.slice(pWords.length);
    if (remainderWords.length === 0)
      return;
    result.familyParticle = particleOriginal;
    result.familyParts = remainderWords;
    result.familyParticleBehavior = "localeDefault";
    return;
  }
}
function derivePreferredGiven(result) {
  if (result.preferredGiven)
    return;
  const nick = result.nickname?.trim();
  if (!nick)
    return;
  result.preferredGiven = nick.replace(/^[\"'\(\[]+/, "").replace(/[\"'\)\]]+$/, "").trim() || void 0;
}
function deriveSortHelpers(result) {
  const last = result.last?.trim();
  const first = result.first?.trim();
  const middle = result.middle?.trim();
  let display = "";
  if (last && first) {
    display = `${last}, ${first}${middle ? ` ${middle}` : ""}`;
  } else if (last) {
    display = last;
  } else if (first) {
    display = `${first}${middle ? ` ${middle}` : ""}`;
  }
  const identitySuffix = result.suffixTokens?.filter((t) => t.type === "generational" || t.type === "dynasticNumber").map((t) => t.value).filter(Boolean).join(", ");
  if (display && identitySuffix) {
    display = `${display}, ${identitySuffix}`;
  }
  if (!display)
    return;
  const key = display.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  result.sort = { display, key };
}
function getFirstName(fullName) {
  return parsePersonName(fullName).first;
}
function getLastName(fullName) {
  return parsePersonName(fullName).last;
}
function getNickname(fullName) {
  return parsePersonName(fullName).nickname;
}
function entityToLegacy(entity) {
  if (entity.kind !== "person") {
    return null;
  }
  const person = entity;
  const result = {};
  if (person.honorific)
    result.prefix = person.honorific;
  if (person.given)
    result.first = person.given;
  if (person.middle)
    result.middle = person.middle;
  if (person.family)
    result.last = person.family;
  if (person.suffix)
    result.suffix = person.suffix;
  if (person.nickname)
    result.nickname = person.nickname;
  result.prefixTokens = buildAffixTokens(result.prefix, "prefix");
  result.suffixTokens = buildAffixTokens(result.suffix, "suffix");
  return result;
}

// src/email-extractor.ts
var EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
var ANGLE_BRACKET_RE = /^(.*?)\s*<([^>]+)>\s*$/;
var PAREN_EMAIL_RE = /^([^(]+)\s*\(([^)]+)\)\s*$/;
var MAILTO_RE = /\[mailto:([^\]]+)\]/i;
var SMTP_RE = /<SMTP:([^>]+)>/i;
var X500_RE = /\/O=[^/]+\/.*\/CN=([^/\s]+)/i;
function normalizeEmail(email) {
  return email.toLowerCase().replace(/^mailto:/i, "").replace(/^smtp:/i, "").trim();
}
function extractEmail(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }
  const angleMatch = trimmed.match(ANGLE_BRACKET_RE);
  if (angleMatch) {
    const display = angleMatch[1].trim();
    const bracket = angleMatch[2].trim();
    if (EMAIL_RE.test(bracket)) {
      return {
        displayName: unquoteDisplay(display),
        email: normalizeEmail(bracket),
        addressRaw: bracket
      };
    }
    const smtpMatch2 = bracket.match(/^SMTP:(.+)$/i);
    if (smtpMatch2) {
      return {
        displayName: unquoteDisplay(display),
        email: normalizeEmail(smtpMatch2[1]),
        addressRaw: bracket
      };
    }
    const x500Match = bracket.match(X500_RE);
    if (x500Match) {
      return {
        displayName: unquoteDisplay(display),
        email: normalizeEmail(x500Match[1]),
        addressRaw: bracket
      };
    }
  }
  const mailtoMatch = trimmed.match(MAILTO_RE);
  if (mailtoMatch) {
    const email = normalizeEmail(mailtoMatch[1]);
    const display = trimmed.replace(MAILTO_RE, "").trim();
    return {
      displayName: unquoteDisplay(display),
      email,
      addressRaw: mailtoMatch[0]
    };
  }
  const smtpMatch = trimmed.match(SMTP_RE);
  if (smtpMatch) {
    const email = normalizeEmail(smtpMatch[1]);
    const display = trimmed.replace(SMTP_RE, "").trim();
    return {
      displayName: unquoteDisplay(display),
      email,
      addressRaw: smtpMatch[0]
    };
  }
  const parenMatch = trimmed.match(PAREN_EMAIL_RE);
  if (parenMatch) {
    const beforeParen = parenMatch[1].trim();
    const inParen = parenMatch[2].trim();
    if (EMAIL_RE.test(beforeParen)) {
      return {
        displayName: inParen,
        email: normalizeEmail(beforeParen),
        addressRaw: beforeParen
      };
    }
  }
  const bareEmailMatch = trimmed.match(EMAIL_RE);
  if (bareEmailMatch) {
    const email = normalizeEmail(bareEmailMatch[0]);
    const display = trimmed.replace(EMAIL_RE, "").trim();
    return {
      displayName: display,
      email,
      addressRaw: bareEmailMatch[0]
    };
  }
  return null;
}
function unquoteDisplay(display) {
  let result = display.trim();
  if (result.startsWith('"') && result.endsWith('"')) {
    result = result.slice(1, -1);
  }
  if (result.startsWith("'") && result.endsWith("'")) {
    result = result.slice(1, -1);
  }
  return result.trim();
}
function hasEmail(text) {
  return EMAIL_RE.test(text);
}

// src/list-parser.ts
function splitRecipients(input) {
  const results = [];
  let current = "";
  let inQuotes = false;
  let inAngleBrackets = false;
  let quoteChar = "";
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const nextChar = input[i + 1];
    if ((char === '"' || char === "'") && !inAngleBrackets) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
        quoteChar = "";
      }
    }
    if (char === "<" && !inQuotes) {
      inAngleBrackets = true;
    } else if (char === ">" && !inQuotes) {
      inAngleBrackets = false;
    }
    if (!inQuotes && !inAngleBrackets) {
      if (char === ";") {
        const trimmed2 = current.trim();
        if (trimmed2) {
          results.push(trimmed2);
        }
        current = "";
        continue;
      }
      if (char === "\n") {
        const trimmed2 = current.trim();
        if (trimmed2) {
          results.push(trimmed2);
        }
        current = "";
        continue;
      }
      if (char === ",") {
        if (!isReversedNameComma(current, input.slice(i + 1))) {
          const trimmed2 = current.trim();
          if (trimmed2) {
            results.push(trimmed2);
          }
          current = "";
          continue;
        }
      }
    }
    current += char;
  }
  const trimmed = current.trim();
  if (trimmed) {
    results.push(trimmed);
  }
  return results.map((r) => {
    return r.replace(/^(To|Cc|Bcc|From):\s*/i, "").trim();
  }).filter(Boolean);
}
var SUFFIX_PATTERN = /^(Jr\.?|Sr\.?|II|III|IV|V|VI|VII|VIII|Esq\.?|Ph\.?D\.?|M\.?D\.?|D\.?D\.?S\.?|D\.?O\.?|R\.?N\.?|CPA|MBA|JD|LLD|DDS|DO|RN)$/i;
function isReversedNameComma(before, after) {
  const beforeTrimmed = before.trim();
  const afterTrimmed = after.trim();
  if (!beforeTrimmed)
    return false;
  if (hasEmail(afterTrimmed.split(/[,;]/)[0])) {
    return false;
  }
  const afterTokens = afterTrimmed.split(/[\s,;]+/).filter(Boolean);
  const firstAfter = afterTokens[0];
  if (!firstAfter)
    return false;
  if (SUFFIX_PATTERN.test(firstAfter)) {
    return true;
  }
  const beforeTokens = beforeTrimmed.split(/[\s,]+/).filter(Boolean);
  if (beforeTokens.length <= 3) {
    if (isNameLikeToken(firstAfter)) {
      const commaIdx = afterTrimmed.indexOf(",");
      if (commaIdx > 0 && commaIdx < 30) {
        const afterComma = afterTrimmed.slice(commaIdx + 1).trim();
        const nextWord = afterComma.split(/[\s,;]+/)[0];
        if (nextWord && SUFFIX_PATTERN.test(nextWord)) {
          return true;
        }
        const betweenCommas = afterTrimmed.slice(0, commaIdx).trim();
        const namePattern = /^[A-Z][a-z]+(\s+[A-Z]\.?)?$/;
        if (namePattern.test(betweenCommas)) {
          return true;
        }
      }
      return true;
    }
  }
  return false;
}
function parseNameList(input, options = {}) {
  if (!input || typeof input !== "string") {
    return [];
  }
  const recipients = splitRecipients(input);
  const results = [];
  for (const recipientRaw of recipients) {
    const reasons = [];
    const emailResult = extractEmail(recipientRaw);
    if (emailResult) {
      const displayName = emailResult.displayName;
      reasons.push("HAS_EMAIL_OR_HANDLE");
      if (displayName) {
        const entity = classifyName(displayName, options);
        results.push({
          raw: recipientRaw,
          display: entity,
          email: emailResult.email,
          addressRaw: emailResult.addressRaw,
          meta: {
            confidence: entity.meta.confidence,
            reasons: [...reasons, ...entity.meta.reasons],
            warnings: entity.meta.warnings
          }
        });
      } else {
        results.push({
          raw: recipientRaw,
          email: emailResult.email,
          addressRaw: emailResult.addressRaw,
          meta: {
            confidence: 0.5,
            reasons
          }
        });
      }
    } else {
      const entity = classifyName(recipientRaw, options);
      results.push({
        raw: recipientRaw,
        display: entity,
        meta: {
          confidence: entity.meta.confidence,
          reasons: entity.meta.reasons,
          warnings: entity.meta.warnings
        }
      });
    }
  }
  return results;
}

// src/formatters.ts
var DEFAULTS = {
  preset: "display",
  output: "text",
  typography: "ui",
  noBreak: "smart",
  join: "none",
  conjunction: "and",
  oxfordComma: true,
  shareLastName: "whenSame",
  sharePrefix: "auto",
  shareSuffix: "auto"
};
var PRESET_DEFAULTS = {
  display: { prefix: "omit", prefer: "auto", middle: "none", suffix: "auto", order: "given-family" },
  preferredDisplay: { prefix: "omit", prefer: "nickname", middle: "none", suffix: "auto", order: "given-family" },
  informal: { prefix: "omit", prefer: "first", middle: "none", suffix: "omit", order: "given-family" },
  firstOnly: { prefix: "omit", prefer: "first", middle: "none", suffix: "omit", order: "given-family" },
  preferredFirst: { prefix: "omit", prefer: "nickname", middle: "none", suffix: "omit", order: "given-family" },
  formalFull: { prefix: "include", prefer: "first", middle: "full", suffix: "include", order: "given-family" },
  formalShort: { prefix: "include", prefer: "first", middle: "none", suffix: "omit", order: "given-family" },
  alphabetical: { prefix: "omit", prefer: "first", middle: "initial", suffix: "auto", order: "family-given" },
  initialed: { prefix: "omit", prefer: "first", middle: "initial", suffix: "omit", order: "given-family" }
};
function normalizeCollapseSpaces(value) {
  return value.trim().replace(/\s+/g, " ");
}
function normalizeTrim(value) {
  return value.trim();
}
function getSpaceTokens(output) {
  return output === "html" ? { SP: " ", NBSP: "&nbsp;", NNBSP: "&#8239;" } : { SP: " ", NBSP: "\xA0", NNBSP: "\u202F" };
}
function resolveOptions(options) {
  const preset = options?.preset ?? DEFAULTS.preset;
  const base = PRESET_DEFAULTS[preset];
  return {
    preset,
    output: options?.output ?? DEFAULTS.output,
    typography: options?.typography ?? DEFAULTS.typography,
    noBreak: options?.noBreak ?? DEFAULTS.noBreak,
    join: options?.join ?? DEFAULTS.join,
    conjunction: options?.conjunction ?? DEFAULTS.conjunction,
    oxfordComma: options?.oxfordComma ?? DEFAULTS.oxfordComma,
    shareLastName: options?.shareLastName ?? DEFAULTS.shareLastName,
    sharePrefix: options?.sharePrefix ?? DEFAULTS.sharePrefix,
    shareSuffix: options?.shareSuffix ?? DEFAULTS.shareSuffix,
    prefer: options?.prefer ?? base.prefer,
    middle: options?.middle ?? base.middle,
    prefix: options?.prefix ?? base.prefix,
    suffix: options?.suffix ?? base.suffix,
    order: options?.order ?? base.order,
    prefixForm: options?.prefixForm ?? "short",
    suffixForm: options?.suffixForm ?? "short",
    capitalization: options?.capitalization ?? "canonical",
    punctuation: options?.punctuation ?? "canonical",
    apostrophes: options?.apostrophes ?? "canonical"
  };
}
function toWords(value) {
  return value.split(/\s+/).map((w) => w.trim()).filter(Boolean);
}
function toInitial(word) {
  const w = word.trim();
  if (!w)
    return void 0;
  return w.charAt(0).toUpperCase() + ".";
}
function resolveGiven(parsed, prefer) {
  const first = parsed.first ? normalizeTrim(parsed.first) : void 0;
  const nickname = parsed.nickname ? normalizeTrim(parsed.nickname) : void 0;
  const preferredGiven = parsed.preferredGiven ? normalizeTrim(parsed.preferredGiven) : void 0;
  if (prefer === "nickname")
    return preferredGiven ?? nickname ?? first;
  if (prefer === "first")
    return first ?? nickname;
  return first ?? nickname;
}
function resolvePrefix(parsed, prefixMode, o) {
  if (prefixMode === "omit")
    return void 0;
  const renderedFromTokens = renderAffixTokens(parsed.prefixTokens, "prefix", o);
  if (renderedFromTokens)
    return renderedFromTokens;
  const prefix = parsed.prefix ? normalizeCollapseSpaces(parsed.prefix) : void 0;
  if (!prefix)
    return void 0;
  if (prefixMode === "include")
    return prefix;
  return prefix;
}
function resolveLast(parsed) {
  if (parsed.last == null)
    return void 0;
  const last = normalizeTrim(parsed.last);
  return last.length > 0 ? last : void 0;
}
function resolveSuffix(parsed, suffixMode, o) {
  const suffix = parsed.suffix ? normalizeCollapseSpaces(parsed.suffix) : void 0;
  if (suffixMode === "omit")
    return void 0;
  if (suffixMode === "include") {
    return renderAffixTokens(parsed.suffixTokens, "suffix", o) ?? suffix;
  }
  if (parsed.suffixTokens && parsed.suffixTokens.length > 0) {
    return renderAffixTokens(parsed.suffixTokens, "suffix", o) ?? suffix;
  }
  return suffix;
}
function applyPunctuation(value, mode) {
  if (mode === "strip")
    return value.replace(/\./g, "");
  return value;
}
function applyApostrophes(value, mode) {
  if (mode === "ascii")
    return value.replace(/[\u2019\u2018\u02BC]/g, "'");
  return value;
}
function applyCapitalization(value, mode) {
  if (mode === "lower")
    return value.toLowerCase();
  if (mode === "upper")
    return value.toUpperCase();
  return value;
}
function renderAffixTokens(tokens, ctx, o) {
  if (!tokens || tokens.length === 0)
    return void 0;
  const t = getSpaceTokens(o.output);
  const form = ctx === "prefix" ? o.prefixForm : o.suffixForm;
  const rendered = tokens.map((t2) => {
    if (o.capitalization === "preserve" || o.punctuation === "preserve" || o.apostrophes === "preserve") {
      return String(t2.value ?? "").trim();
    }
    let base = String(t2.value ?? "").trim();
    if (form !== "asInput") {
      const canonical = form === "long" ? t2.canonicalLong : t2.canonicalShort;
      if (canonical)
        base = canonical;
    }
    base = applyApostrophes(base, o.apostrophes);
    base = applyPunctuation(base, o.punctuation);
    base = applyCapitalization(base, o.capitalization);
    return base.trim();
  }).filter((s) => s.length > 0);
  if (rendered.length === 0)
    return void 0;
  if (ctx === "suffix") {
    const commaSep = "," + boundarySpace("commaSpace", o, t);
    return rendered.join(commaSep);
  }
  return rendered.join(" ");
}
function boundarySpace(boundary, o, t) {
  const noBreak = o.noBreak;
  const typography = o.typography;
  if (noBreak === "none" || typography === "plain") {
    return t.SP;
  }
  if (noBreak === "all") {
    return t.NBSP;
  }
  switch (boundary) {
    case "initialTight":
      return typography === "ui" || typography === "fine" ? t.NNBSP : t.NBSP;
    case "prefixToNext":
    case "givenToLast":
    case "initialToWord":
    case "commaSpace":
    case "commaToGiven":
      return t.NBSP;
    case "space":
    default:
      return t.SP;
  }
}
function joinInitials(initials, o, t) {
  if (initials.length === 0)
    return "";
  if (initials.length === 1)
    return initials[0];
  const sep = boundarySpace("initialTight", o, t);
  return initials.join(sep);
}
function renderMiddle(parsed, middleMode, o, t) {
  if (!parsed.middle)
    return void 0;
  const middle = normalizeTrim(parsed.middle);
  if (!middle)
    return void 0;
  if (middleMode === "none")
    return void 0;
  if (middleMode === "full")
    return middle;
  const initials = toWords(middle).map(toInitial).filter(Boolean);
  if (initials.length === 0)
    return void 0;
  return joinInitials(initials, o, t);
}
function renderGivenPlusMiddle(parsed, o, t) {
  const given = resolveGiven(parsed, o.prefer);
  if (!given)
    return { givenLikeText: void 0, finalGivenToken: void 0 };
  if (o.preset === "initialed") {
    const firstInitial = toInitial(given);
    const middleInitials = parsed.middle ? toWords(normalizeTrim(parsed.middle)).map(toInitial).filter(Boolean) : [];
    const all = [firstInitial, ...middleInitials].filter(Boolean);
    const initialsText = joinInitials(all, o, t);
    const finalToken = all.length > 0 ? all[all.length - 1] : given;
    return { givenLikeText: initialsText, finalGivenToken: finalToken };
  }
  let effectiveMiddleMode = o.middle;
  if (o.preset === "display" && effectiveMiddleMode === "none") {
    if (/^[A-Za-z]\.?$/.test(given.trim())) {
      effectiveMiddleMode = "initial";
    }
  }
  const middleText = renderMiddle(parsed, effectiveMiddleMode, o, t);
  if (!middleText)
    return { givenLikeText: given, finalGivenToken: given };
  const sep = boundarySpace("space", o, t);
  return { givenLikeText: given + sep + middleText, finalGivenToken: middleText };
}
function renderSingle(parsed, o) {
  const t = getSpaceTokens(o.output);
  const prefixText = resolvePrefix(parsed, o.prefix, o);
  const lastText = resolveLast(parsed);
  const suffixText = resolveSuffix(parsed, o.suffix, o);
  const { givenLikeText } = renderGivenPlusMiddle(parsed, o, t);
  if (o.preset === "formalShort") {
    const pieces = [];
    if (prefixText)
      pieces.push(prefixText);
    if (lastText)
      pieces.push(lastText);
    let base2 = "";
    if (pieces.length === 0)
      base2 = "";
    else if (pieces.length === 1)
      base2 = pieces[0];
    else
      base2 = `${pieces[0]}${boundarySpace("prefixToNext", o, t)}${pieces[1]}`;
    if (suffixText) {
      base2 += `,${boundarySpace("commaSpace", o, t)}${suffixText}`;
    }
    return { prefixText, givenText: void 0, lastText, suffixText, fullText: base2 };
  }
  if (o.preset === "firstOnly" || o.preset === "preferredFirst") {
    const onlyGiven = resolveGiven(parsed, o.prefer);
    const normalizedOnlyGiven = onlyGiven ? normalizeTrim(onlyGiven) : void 0;
    const effectivePrefix = prefixText;
    if (!normalizedOnlyGiven) {
      return { prefixText: effectivePrefix, givenText: void 0, lastText, suffixText, fullText: "" };
    }
    if (effectivePrefix) {
      const sep = boundarySpace("prefixToNext", o, t);
      return { prefixText: effectivePrefix, givenText: normalizedOnlyGiven, lastText, suffixText, fullText: effectivePrefix + sep + normalizedOnlyGiven };
    }
    return { prefixText: void 0, givenText: normalizedOnlyGiven, lastText, suffixText, fullText: normalizedOnlyGiven };
  }
  if (o.order === "family-given") {
    const pieces = [];
    if (lastText)
      pieces.push(lastText);
    if (givenLikeText) {
      const comma = ",";
      const afterComma = boundarySpace("commaToGiven", o, t);
      pieces.push(comma + afterComma + givenLikeText);
    }
    let base2 = pieces.join("");
    if (suffixText) {
      const comma = ",";
      const afterComma = boundarySpace("commaSpace", o, t);
      base2 += comma + afterComma + suffixText;
    }
    return {
      prefixText: void 0,
      givenText: givenLikeText,
      lastText,
      suffixText,
      fullText: base2
    };
  }
  const parts = [];
  if (prefixText) {
    parts.push(prefixText);
  }
  if (givenLikeText) {
    parts.push(givenLikeText);
  }
  if (lastText) {
    parts.push(lastText);
  }
  let base = "";
  const emitted = [];
  if (prefixText)
    emitted.push(prefixText);
  if (givenLikeText)
    emitted.push(givenLikeText);
  if (lastText)
    emitted.push(lastText);
  if (emitted.length === 0) {
    base = "";
  } else if (emitted.length === 1) {
    base = emitted[0];
  } else {
    if (prefixText && givenLikeText) {
      base = prefixText + boundarySpace("prefixToNext", o, t) + givenLikeText;
      if (lastText) {
        base += boundarySpace("givenToLast", o, t) + lastText;
      }
    } else if (givenLikeText && lastText) {
      base = givenLikeText + boundarySpace("givenToLast", o, t) + lastText;
    } else {
      base = emitted.join(boundarySpace("space", o, t));
    }
  }
  if (suffixText) {
    const comma = ",";
    const afterComma = boundarySpace("commaSpace", o, t);
    base += comma + afterComma + suffixText;
  }
  return { prefixText, givenText: givenLikeText, lastText, suffixText, fullText: base };
}
function normalizeCompareKey(value) {
  if (!value)
    return void 0;
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
function joinList(items, o) {
  const n = items.length;
  if (n === 0)
    return "";
  if (n === 1)
    return items[0];
  if (n === 2)
    return `${items[0]} ${o.conjunction} ${items[1]}`;
  const head = items.slice(0, -1).join(", ");
  const tail = items[n - 1];
  const comma = o.oxfordComma ? "," : "";
  return `${head}${comma} ${o.conjunction} ${tail}`;
}
function shouldShare(mode, same) {
  if (mode === "never")
    return false;
  if (mode === "whenSame")
    return same;
  return same;
}
function joinCouple(a, b, o) {
  const t = getSpaceTokens(o.output);
  const sameLast = normalizeCompareKey(a.lastText) != null && normalizeCompareKey(a.lastText) === normalizeCompareKey(b.lastText);
  const samePrefix = normalizeCompareKey(a.prefixText) != null && normalizeCompareKey(a.prefixText) === normalizeCompareKey(b.prefixText);
  const sameSuffix = normalizeCompareKey(a.suffixText) != null && normalizeCompareKey(a.suffixText) === normalizeCompareKey(b.suffixText);
  if (o.order !== "given-family") {
    return `${a.fullText} ${o.conjunction} ${b.fullText}`;
  }
  const shareLast = shouldShare(o.shareLastName, sameLast);
  const sharePrefix = shouldShare(o.sharePrefix, samePrefix);
  const shareSuffix = shouldShare(o.shareSuffix, sameSuffix);
  if (shareLast && !a.prefixText && !b.prefixText && a.givenText && b.givenText && a.lastText) {
    const glue = boundarySpace("givenToLast", o, t);
    let result = `${a.givenText} ${o.conjunction} ${b.givenText}${glue}${a.lastText}`;
    if (shareSuffix && a.suffixText) {
      result += `,${boundarySpace("commaSpace", o, t)}${a.suffixText}`;
    }
    return result;
  }
  if (shareLast && a.lastText && a.givenText && b.givenText && a.prefixText && b.prefixText) {
    if (sharePrefix && samePrefix) {
      const prefixGlue = boundarySpace("prefixToNext", o, t);
      const lastGlue2 = boundarySpace("givenToLast", o, t);
      let result2 = `${a.prefixText}${prefixGlue}${a.givenText} ${o.conjunction} ${b.givenText}${lastGlue2}${a.lastText}`;
      if (shareSuffix && a.suffixText) {
        result2 += `,${boundarySpace("commaSpace", o, t)}${a.suffixText}`;
      }
      return result2;
    }
    const lastGlue = boundarySpace("givenToLast", o, t);
    const prefix2Glue = boundarySpace("prefixToNext", o, t);
    let result = `${a.prefixText} ${o.conjunction} ${b.prefixText}${prefix2Glue}${a.givenText} ${o.conjunction} ${b.givenText}${lastGlue}${a.lastText}`;
    if (shareSuffix && a.suffixText) {
      result += `,${boundarySpace("commaSpace", o, t)}${a.suffixText}`;
    }
    return result;
  }
  return `${a.fullText} ${o.conjunction} ${b.fullText}`;
}
function isParsedNameEntity(input) {
  return typeof input === "object" && input !== null && "kind" in input && typeof input.kind === "string";
}
function personEntityToLegacy(entity) {
  const result = {};
  if (entity.honorific)
    result.prefix = entity.honorific;
  if (entity.given)
    result.first = entity.given;
  if (entity.middle)
    result.middle = entity.middle;
  if (entity.family)
    result.last = entity.family;
  if (entity.suffix)
    result.suffix = entity.suffix;
  if (entity.nickname)
    result.nickname = entity.nickname;
  return result;
}
function formatOrganization(org, o) {
  const t = getSpaceTokens(o.output);
  const fullName = org.meta.raw.trim();
  const baseName = org.baseName;
  const legalSuffix = org.legalSuffixRaw;
  switch (o.preset) {
    case "informal":
    case "firstOnly":
    case "preferredFirst":
      return baseName;
    case "formalShort":
      return baseName;
    case "alphabetical":
      if (legalSuffix) {
        return `${baseName},${boundarySpace("commaSpace", o, t)}${legalSuffix}`;
      }
      return baseName;
    case "initialed":
      return baseName;
    case "display":
    case "preferredDisplay":
    case "formalFull":
    default:
      return fullName;
  }
}
function formatFamily(family, o) {
  const t = getSpaceTokens(o.output);
  const familyName = family.familyName;
  const article = family.article;
  const familyWord = family.familyWord;
  const style = family.style;
  switch (o.preset) {
    case "informal":
    case "firstOnly":
    case "preferredFirst":
      if (style === "pluralSurname") {
        return `The${boundarySpace("prefixToNext", o, t)}${familyName}`;
      }
      return familyName;
    case "formalShort":
      if (style === "pluralSurname") {
        return `The${boundarySpace("prefixToNext", o, t)}${familyName}`;
      }
      return `${familyName}${boundarySpace("givenToLast", o, t)}${familyWord || "Family"}`;
    case "alphabetical":
      if (familyWord) {
        return `${familyName}${boundarySpace("givenToLast", o, t)}${familyWord}`;
      }
      return familyName;
    case "initialed":
      return familyName;
    case "display":
    case "preferredDisplay":
    case "formalFull":
    default:
      if (article && familyWord) {
        return `${article}${boundarySpace("prefixToNext", o, t)}${familyName}${boundarySpace("givenToLast", o, t)}${familyWord}`;
      }
      if (article) {
        return `${article}${boundarySpace("prefixToNext", o, t)}${familyName}`;
      }
      if (familyWord) {
        return `${familyName}${boundarySpace("givenToLast", o, t)}${familyWord}`;
      }
      return familyName;
  }
}
function formatCompound(compound, o) {
  const t = getSpaceTokens(o.output);
  const connector = compound.connector === "&" ? "&" : compound.connector === "+" ? "+" : compound.connector === "et" ? "et" : "and";
  const sharedFamily = compound.sharedFamily;
  const formattedMembers = compound.members.map((member) => {
    if (member.kind === "person") {
      const parsed = personEntityToLegacy(member);
      if (sharedFamily && o.preset !== "alphabetical") {
        const withoutFamily = { ...parsed, last: void 0 };
        return renderSingle(withoutFamily, o).fullText;
      }
      return renderSingle(parsed, o).fullText;
    }
    return member.text || "";
  }).filter(Boolean);
  if (formattedMembers.length === 0) {
    return compound.meta.raw;
  }
  const joined = formattedMembers.join(` ${connector} `);
  if (sharedFamily && o.preset !== "alphabetical") {
    return `${joined}${boundarySpace("givenToLast", o, t)}${sharedFamily}`;
  }
  return joined;
}
function formatUnknown(unknown, _o) {
  return unknown.text || unknown.meta.raw || "";
}
function formatRejected(rejected, _o) {
  return rejected.meta.raw || "";
}
function formatEntity(entity, o) {
  switch (entity.kind) {
    case "person":
      return renderSingle(personEntityToLegacy(entity), o).fullText;
    case "organization":
      return formatOrganization(entity, o);
    case "family":
    case "household":
      return formatFamily(entity, o);
    case "compound":
      return formatCompound(entity, o);
    case "unknown":
      return formatUnknown(entity, o);
    case "rejected":
      return formatRejected(entity, o);
    default:
      return entity.meta?.raw || "";
  }
}
function ensureParsedLegacy(input) {
  if (typeof input === "string") {
    return parsePersonName(input);
  }
  if (isParsedNameEntity(input)) {
    if (input.kind === "person") {
      return personEntityToLegacy(input);
    }
    return parsePersonName(input.meta.raw);
  }
  return input;
}
function formatName(input, options) {
  const o = resolveOptions(options);
  if (Array.isArray(input)) {
    if (o.join === "none") {
      throw new Error('formatName: array input requires options.join !== "none"');
    }
    const formatItem = (item) => {
      if (isParsedNameEntity(item)) {
        return formatEntity(item, o);
      }
      return renderSingle(ensureParsedLegacy(item), o).fullText;
    };
    if (o.join === "list" || input.length !== 2) {
      const rendered = input.map(formatItem);
      return joinList(rendered, o);
    }
    const parsedPeople = input.map(ensureParsedLegacy);
    const [p1, p2] = parsedPeople;
    const r1 = renderSingle(p1, { ...o, join: "none" });
    const r2 = renderSingle(p2, { ...o, join: "none" });
    return joinCouple(r1, r2, o);
  }
  if (isParsedNameEntity(input)) {
    return formatEntity(input, o);
  }
  const parsed = ensureParsedLegacy(input);
  return renderSingle(parsed, o).fullText;
}

// src/pronouns/data.ts
var BUILT_IN_PRONOUNS = {
  // Standard pronouns
  he: {
    id: "he",
    label: "he/him",
    subject: "he",
    object: "him",
    possessiveDeterminer: "his",
    possessivePronoun: "his",
    reflexive: "himself",
    notes: "Masculine pronouns"
  },
  she: {
    id: "she",
    label: "she/her",
    subject: "she",
    object: "her",
    possessiveDeterminer: "her",
    possessivePronoun: "hers",
    reflexive: "herself",
    notes: "Feminine pronouns"
  },
  they: {
    id: "they",
    label: "they/them",
    subject: "they",
    object: "them",
    possessiveDeterminer: "their",
    possessivePronoun: "theirs",
    reflexive: "themselves",
    notes: "Singular they/them pronouns"
  },
  it: {
    id: "it",
    label: "it/its",
    subject: "it",
    object: "it",
    possessiveDeterminer: "its",
    possessivePronoun: "its",
    reflexive: "itself",
    notes: "Neutral/inanimate pronouns"
  },
  // Neopronouns
  "ze-hir": {
    id: "ze-hir",
    label: "ze/hir",
    subject: "ze",
    object: "hir",
    possessiveDeterminer: "hir",
    possessivePronoun: "hirs",
    reflexive: "hirself",
    notes: "Neopronouns ze/hir"
  },
  "ze-zir": {
    id: "ze-zir",
    label: "ze/zir",
    subject: "ze",
    object: "zir",
    possessiveDeterminer: "zir",
    possessivePronoun: "zirs",
    reflexive: "zirself",
    notes: "Neopronouns ze/zir"
  },
  "xe-xem": {
    id: "xe-xem",
    label: "xe/xem",
    subject: "xe",
    object: "xem",
    possessiveDeterminer: "xyr",
    possessivePronoun: "xyrs",
    reflexive: "xemself",
    notes: "Neopronouns xe/xem"
  },
  "fae-faer": {
    id: "fae-faer",
    label: "fae/faer",
    subject: "fae",
    object: "faer",
    possessiveDeterminer: "faer",
    possessivePronoun: "faers",
    reflexive: "faerself",
    notes: "Neopronouns fae/faer"
  },
  "ey-em": {
    id: "ey-em",
    label: "ey/em",
    subject: "ey",
    object: "em",
    possessiveDeterminer: "eir",
    possessivePronoun: "eirs",
    reflexive: "emself",
    notes: "Neopronouns ey/em (Spivak)"
  },
  // Special pseudo-sets
  any: {
    id: "any",
    label: "any pronouns",
    subject: "they",
    object: "them",
    possessiveDeterminer: "their",
    possessivePronoun: "theirs",
    reflexive: "themselves",
    notes: "User accepts any pronouns; defaults to they/them for text generation"
  },
  "name-only": {
    id: "name-only",
    label: "use name only",
    subject: "",
    object: "",
    possessiveDeterminer: "",
    possessivePronoun: "",
    reflexive: "",
    notes: "User prefers name instead of pronouns; consumer must handle empty strings"
  }
};
var SPEC_ALIASES = {
  // he/him family
  "he/him": "he",
  "he/his": "he",
  "he/him/his": "he",
  "he/him/his/his": "he",
  "he/him/his/his/himself": "he",
  // she/her family
  "she/her": "she",
  "she/hers": "she",
  "she/her/hers": "she",
  "she/her/her/hers": "she",
  "she/her/her/hers/herself": "she",
  // they/them family
  "they/them": "they",
  "they/their": "they",
  "they/theirs": "they",
  "they/them/their": "they",
  "they/them/their/theirs": "they",
  "they/them/their/theirs/themselves": "they",
  "they/them/their/theirs/themself": "they",
  // it/its family
  "it/its": "it",
  "it/it/its": "it",
  "it/it/its/its/itself": "it",
  // Neopronouns - common short forms
  "ze/hir": "ze-hir",
  "ze/hir/hirs": "ze-hir",
  "ze/zir": "ze-zir",
  "ze/zir/zirs": "ze-zir",
  "xe/xem": "xe-xem",
  "xe/xem/xyr": "xe-xem",
  "fae/faer": "fae-faer",
  "fae/faer/faers": "fae-faer",
  "ey/em": "ey-em",
  "ey/em/eir": "ey-em",
  // Special sets
  any: "any",
  "any pronouns": "any",
  "all pronouns": "any",
  "no pronouns": "name-only",
  "name-only": "name-only",
  "use name": "name-only",
  "use name only": "name-only",
  "name only": "name-only"
};

// src/pronouns/parser.ts
function normalizeSpec(spec) {
  return spec.trim().toLowerCase().replace(/\s+/g, " ");
}
function deriveReflexive(subject) {
  const s = subject.toLowerCase();
  if (s === "he")
    return "himself";
  if (s === "she")
    return "herself";
  if (s === "it")
    return "itself";
  if (s === "they")
    return "themselves";
  return subject + "self";
}
function parsePronounSpec(spec) {
  const norm = normalizeSpec(spec);
  const aliasId = SPEC_ALIASES[norm];
  if (aliasId && BUILT_IN_PRONOUNS[aliasId]) {
    return { ...BUILT_IN_PRONOUNS[aliasId] };
  }
  if (BUILT_IN_PRONOUNS[norm]) {
    return { ...BUILT_IN_PRONOUNS[norm] };
  }
  const rawTokens = spec.split("/").map((t) => t.trim()).filter(Boolean);
  if (rawTokens.length < 1) {
    throw new Error(`Invalid pronoun spec: "${spec}". Expected at least one token.`);
  }
  const [subject, second, third, fourth, fifth] = rawTokens;
  let object = "";
  let possDet = "";
  let possPron = "";
  let reflexive = "";
  if (rawTokens.length === 1) {
    const maybeId = subject.toLowerCase();
    if (BUILT_IN_PRONOUNS[maybeId]) {
      return { ...BUILT_IN_PRONOUNS[maybeId] };
    }
    object = subject;
    possDet = subject + "'s";
    possPron = possDet;
    reflexive = deriveReflexive(subject);
  } else if (rawTokens.length === 2) {
    const subjLower = subject.toLowerCase();
    const secondLower = second.toLowerCase();
    if (subjLower === "he" && (secondLower === "him" || secondLower === "his")) {
      return { ...BUILT_IN_PRONOUNS["he"] };
    }
    if (subjLower === "she" && secondLower.startsWith("her")) {
      return { ...BUILT_IN_PRONOUNS["she"] };
    }
    if (subjLower === "they" && (secondLower === "them" || secondLower.startsWith("their"))) {
      return { ...BUILT_IN_PRONOUNS["they"] };
    }
    object = second;
    possDet = second;
    possPron = second;
    reflexive = deriveReflexive(subject);
  } else if (rawTokens.length === 3) {
    object = second;
    possDet = third;
    possPron = third;
    reflexive = deriveReflexive(subject);
  } else if (rawTokens.length === 4) {
    object = second;
    possDet = third;
    possPron = fourth;
    reflexive = deriveReflexive(subject);
  } else {
    object = second;
    possDet = third;
    possPron = fourth;
    reflexive = fifth || deriveReflexive(subject);
  }
  return {
    id: norm.replace(/\s+/g, ""),
    label: rawTokens.join("/"),
    subject,
    object,
    possessiveDeterminer: possDet,
    possessivePronoun: possPron,
    reflexive,
    notes: "Custom pronoun set"
  };
}
function getPronounSet(input) {
  if (!input) {
    throw new Error("getPronounSet: input is required");
  }
  if (typeof input === "object") {
    return { ...input };
  }
  return parsePronounSpec(input);
}

// src/pronouns/formatter.ts
function applyCapitalization2(s, mode) {
  if (!s)
    return s;
  switch (mode) {
    case "upper":
      return s.toUpperCase();
    case "title":
      return s.charAt(0).toUpperCase() + s.slice(1);
    case "lower":
    default:
      return s.toLowerCase();
  }
}
function formatPronoun(set, role, options = {}) {
  const { capitalization = "lower" } = options;
  const value = set[role] || "";
  if (!value)
    return "";
  return applyCapitalization2(value, capitalization);
}
var TEMPLATE_PLACEHOLDERS = {
  "{{subject}}": "subject",
  "{{object}}": "object",
  "{{possDet}}": "possessiveDeterminer",
  "{{possessiveDeterminer}}": "possessiveDeterminer",
  "{{possPron}}": "possessivePronoun",
  "{{possessivePronoun}}": "possessivePronoun",
  "{{reflexive}}": "reflexive"
};
function fillPronounTemplate(template, set, options = {}) {
  const { capitalization = "lower" } = options;
  let result = template;
  for (const [placeholder, role] of Object.entries(TEMPLATE_PLACEHOLDERS)) {
    const value = set[role] || "";
    const formatted = applyCapitalization2(value, capitalization);
    result = result.split(placeholder).join(formatted);
  }
  return result;
}
function fillPronounTemplateSmart(template, set) {
  let result = template;
  for (const [placeholder, role] of Object.entries(TEMPLATE_PLACEHOLDERS)) {
    const value = set[role] || "";
    if (!value) {
      result = result.split(placeholder).join("");
      continue;
    }
    const marker = `\0PRONOUN_${role}\0`;
    result = result.split(placeholder).join(marker);
  }
  const sentenceStartRe = /(^|[.!?]\s+)(\x00PRONOUN_\w+\x00)/g;
  result = result.replace(sentenceStartRe, (_, prefix, marker) => {
    const roleMatch = marker.match(/PRONOUN_(\w+)/);
    if (!roleMatch)
      return prefix + marker;
    const role = roleMatch[1];
    const value = set[role] || "";
    return prefix + applyCapitalization2(value, "title");
  });
  const remainingRe = /\x00PRONOUN_(\w+)\x00/g;
  result = result.replace(remainingRe, (_, role) => {
    const value = set[role] || "";
    return applyCapitalization2(value, "lower");
  });
  return result;
}

// src/pronouns/integration.ts
function getDefaultPronouns(gender) {
  switch (gender) {
    case "male":
      return { ...BUILT_IN_PRONOUNS["he"] };
    case "female":
      return { ...BUILT_IN_PRONOUNS["she"] };
    case "unknown":
    case null:
    default:
      return { ...BUILT_IN_PRONOUNS["they"] };
  }
}
function getPronounsForEntity(entity) {
  return { ...BUILT_IN_PRONOUNS["they"] };
}
function getPronounsForPerson(entity, options = {}) {
  const {
    genderDB,
    explicitPronouns,
    defaultOnUnknown,
    genderThreshold = 0.8
  } = options;
  if (explicitPronouns) {
    return getPronounSet(explicitPronouns);
  }
  if (genderDB && entity.given) {
    const gender = genderDB.guessGender(entity.given, genderThreshold);
    if (gender === "male") {
      return { ...BUILT_IN_PRONOUNS["he"] };
    }
    if (gender === "female") {
      return { ...BUILT_IN_PRONOUNS["she"] };
    }
  }
  return defaultOnUnknown ? { ...defaultOnUnknown } : { ...BUILT_IN_PRONOUNS["they"] };
}
function getPronouns(entity, options = {}) {
  if (entity.kind === "person") {
    return getPronounsForPerson(entity, options);
  }
  return { ...BUILT_IN_PRONOUNS["they"] };
}

// src/pronouns/extractor.ts
var PRONOUN_SUFFIX_RE = /\s*\(([^)]+)\)\s*$/;
var LOOKS_LIKE_PRONOUNS_RE = /^[a-z]+\/[a-z]+/i;
var NON_PRONOUN_WORDS = /* @__PURE__ */ new Set([
  "billing",
  "shipping",
  "home",
  "work",
  "office",
  "mobile",
  "cell",
  "primary",
  "secondary",
  "main",
  "alt",
  "alternative",
  "personal",
  "business",
  "emergency",
  "contact",
  "other",
  "preferred",
  "cabin",
  "vacation",
  "rental",
  "legal",
  "maiden",
  "former",
  "deceased",
  "retired",
  "inactive",
  "accounts",
  "payable",
  "receivable",
  "department",
  "dept",
  "div",
  "division"
]);
function looksLikePronouns(spec) {
  const trimmed = spec.trim().toLowerCase();
  if (!LOOKS_LIKE_PRONOUNS_RE.test(trimmed)) {
    return false;
  }
  const firstWord = trimmed.split(/[\/\s]/)[0];
  if (NON_PRONOUN_WORDS.has(firstWord)) {
    return false;
  }
  const normalized = trimmed.replace(/\s+/g, "");
  if (SPEC_ALIASES[normalized]) {
    return true;
  }
  if (firstWord.length <= 5 && /^[a-z]+$/i.test(firstWord)) {
    return true;
  }
  return false;
}
function extractPronouns(nameWithPronouns) {
  if (!nameWithPronouns) {
    return { name: "" };
  }
  const match = nameWithPronouns.match(PRONOUN_SUFFIX_RE);
  if (!match) {
    return { name: nameWithPronouns };
  }
  const rawSpec = match[1].trim();
  const potentialName = nameWithPronouns.slice(0, match.index).trim();
  if (!looksLikePronouns(rawSpec)) {
    return { name: nameWithPronouns };
  }
  try {
    const pronouns = parsePronounSpec(rawSpec);
    return {
      name: potentialName,
      pronouns,
      rawPronounSpec: rawSpec
    };
  } catch {
    return { name: nameWithPronouns };
  }
}
function hasPronouns(name) {
  if (!name)
    return false;
  const match = name.match(PRONOUN_SUFFIX_RE);
  if (!match)
    return false;
  return looksLikePronouns(match[1]);
}
function pronounsToGenderHint(rawSpec) {
  const norm = rawSpec.trim().toLowerCase().replace(/\s+/g, "");
  if (norm.startsWith("he/") || norm === "he" || norm.includes("/him")) {
    return "male";
  }
  if (norm.startsWith("she/") || norm === "she" || norm.includes("/her")) {
    return "female";
  }
  return "unknown";
}

// src/gender/GenderDB.ts
var GenderDB = class {
  /**
   * Create a GenderDB instance from a binary ArrayBuffer.
   * @param buffer - ArrayBuffer containing the binary trie data
   */
  constructor(buffer) {
    const header = new DataView(buffer, 0, 8);
    const magic = header.getUint32(0, true);
    if (magic !== 1196311634) {
      throw new Error("Invalid gender data: bad magic number");
    }
    this.nodeCount = header.getUint32(4, true);
    const nodesByteSize = this.nodeCount * 4;
    this.nodes = new Uint32Array(buffer, 8, this.nodeCount);
    this.probs = new Uint8Array(buffer, 8 + nodesByteSize, this.nodeCount);
  }
  /**
   * Get the number of nodes in the trie.
   */
  get size() {
    return this.nodeCount;
  }
  /**
   * Look up the male probability for a given name.
   *
   * @param name - The first name to look up (case-insensitive)
   * @returns GenderLookupResult with probability if found, or { found: false }
   */
  lookup(name) {
    if (!name || name.length === 0) {
      return { found: false };
    }
    const upper = name.toUpperCase();
    let nodeIdx = 0;
    for (let i = 0; i < upper.length; i++) {
      const charCode = upper.charCodeAt(i);
      let found = false;
      while (true) {
        if (nodeIdx >= this.nodeCount) {
          return { found: false };
        }
        const data = this.nodes[nodeIdx];
        const nodeChar = data & 255;
        if (nodeChar === charCode) {
          found = true;
          if (i === upper.length - 1) {
            if ((data & 256) !== 0) {
              const rawValue = this.probs[nodeIdx];
              const maleProbability = (rawValue - 1) / 254;
              return {
                maleProbability,
                rawValue,
                found: true
              };
            }
            return { found: false };
          }
          if ((data & 512) !== 0) {
            nodeIdx++;
            break;
          } else {
            return { found: false };
          }
        }
        const nextSibling = data >>> 10;
        if (nextSibling === 0) {
          break;
        }
        nodeIdx = nextSibling;
      }
      if (!found) {
        return { found: false };
      }
    }
    return { found: false };
  }
  /**
   * Convenience method to get male probability as a number.
   * Returns null if name not found.
   *
   * @param name - The first name to look up
   * @returns Male probability (0.0-1.0) or null if not found
   */
  getMaleProbability(name) {
    const result = this.lookup(name);
    return result.found ? result.maleProbability : null;
  }
  /**
   * Convenience method to get female probability as a number.
   * Returns null if name not found.
   *
   * @param name - The first name to look up
   * @returns Female probability (0.0-1.0) or null if not found
   */
  getFemaleProbability(name) {
    const result = this.lookup(name);
    return result.found ? 1 - result.maleProbability : null;
  }
  /**
   * Make an informed guess about the likely gender based on probability threshold.
   *
   * @param name - The first name to look up
   * @param threshold - Confidence threshold for guessing (default 0.8, meaning 80% confidence required)
   * @returns 'male', 'female', 'unknown', or null if name not found in database
   */
  guessGender(name, threshold = 0.8) {
    const result = this.lookup(name);
    if (!result.found) {
      return null;
    }
    const { maleProbability } = result;
    if (maleProbability >= threshold) {
      return "male";
    } else if (maleProbability <= 1 - threshold) {
      return "female";
    }
    return "unknown";
  }
  /**
   * Check if a name exists in the database.
   *
   * @param name - The first name to check
   * @returns true if the name exists in the database
   */
  has(name) {
    return this.lookup(name).found;
  }
};

// src/gender/data/coverage95.ts
var GENDER_DATA_BASE64 = "UkROR3g8AABBthcAQYoAAEQiAABFFgAATgEAAEgCAABZAgAAQQEAAEw2AABJAgAAWQIAAEECAABIAQAATUIAAEkCAABSAQAATk4AAFkCAABBAQAAUn4AAEFaAABWAQAATmIAAEEBAABPagAATgEAAFV2AABTAgAASAEAAFkCAABBAQAAWQIAAEECAABOAQAAQroBAEGiAABHAgAAQQIAAEkCAABMAQAAQtoAAEWuAABZAQAAScYAAEW1AABHAgAAQQIAAEkCAABMAQAAWQMAAEcCAABBAgAASQIAAEwBAABEFgEASeoAAEUCAABMAQAAVQIAAEwDAABM/gAAQQIAAEgBAABSAgAAQQIAAEgCAABNAgAAQQIAAE4BAABFLwEATAMAAEECAABSAgAARAIAAE8BAABJVgEARwIAAEECAABJQgEATAEAAExKAQBFAQAAWQIAAEwCAABFAQAATmIBAEUCAABSAQAAUqYBAEF6AQBIdgEAQQIAAE0BAABNAQAASQIAAEGSAQBOAgAAQYkBAE4CAABBAQAARaIBAEwCAABMAgAARQEAAEwBAABZAgAARwIAAEECAABJAgAATAEAAEPqAQBBzgEAQwIAAEkCAABBAQAARdEBAEgCAABJAgAATAIAAEwCAABFAgAAUwEAAEQSBABBXwIASPUBAEn+AQBSAQAATD4CAEIWAgBFAgAAUgIAAFQCAABPAQAARR4CAEUBAABJMgIAQSUCAEUpAgBOAgAARQEAAFkCAABOAwAATgEAAE1TAgBBAgAAUgIAAEkCAABTAQAATlUCAFICAABBAQAARL4CAEFyAgBMAgAAWQIAAE4BAABFggIATAIAAFkCAABOAQAASa4CAEWJAgBMmgIAWQIAAE4DAABOAQAAUwIAAE+mAgBOAQAAWQIAAE4BAABZAgAAUwIAAE8CAABOAQAARR4DAEwbAwBB2wIASQIAAEQCAABB1QIARQEAAELqAgBFAgAAUgIAAFQBAABF7QIASQIDAEH1AgBOAgAAQf0CAEUBAABMDwMAQQkDAEUBAABZAgAATgMAAE4BAABOAQAASW4DAEElAwBFLgMATAEAAExKAwBFPgMATgIAAEUBAABZAgAATgMAAE4BAABOUwMAQQEAAFNeAwBPAgAATgEAAFQCAABJZQMAWQIAAEEBAABMfgMARQIAAFJ5AwBZAQAATooDAEECAABOAQAAT7YDAEyqAwBGmgMATwEAAFACAABIAwAAVQIAAFMBAABOAgAASQIAAFMBAABSAgQAQcYDAEkCAABOAQAASQIAAEHrAwBOAwAAQdUDAEXZAwBO5gMAQeEDAEUBAABPAQAARQIAAEzxAwBOAwAARfkDAE4CAABFAQAAWQIAAFMCAABPAgAATgEAAEUiBABEAgAAQQIAAE4BAABGMgQAVAIAAE8CAABOAQAAR2YEAEFGBABUAgAASAIAAEEBAABOUgQARQIAAFMBAABVAgAAUwIAAFQCAABJAgAATgEAAEiWBABBegQAUgIAAE8CAABOAQAATQIAAEGGBABEAQAARY4EAEQBAABJAgAAUgEAAElOBQBEtgQAQacEAE4BAABFrgQATgEAAFkCAABOAQAATN4EAEHLBABOAgAAScUEAFkBAABF1gQARQIAAE4BAABZAgAATgEAAE3qBABFAwAARQEAAE7+BABTAgAATAIAAEUCAABZAQAAUyYFAEgKBQBBAQAATAIAAEkaBQBOAgAATgEAAFkCAABOAgAATgEAAFQ2BQBBAgAATgIAAEEBAABZAgAAQQIAAE4CAABBRQUATgIAAEEBAABKYwUAQQMAAE5eBQBJAQAAWQEAAEuqBQBBcgUAUwIAAEgBAABFfgUARQIAAE0BAABJngUATI4FAEECAABIAQAAUpYFAEEBAABWAgAAQQEAAFMCAABFAgAATAEAAEyjCgBBFgYAScoFAEG5BQBOwwUAQQEAAFkCAABBAQAATusFAEHXBQBIAQAASd8FAFMBAABOAgAAQQMAAEgBAABS9gUASQIAAEMBAABZAgAAQQMGAEgBAABOCgYAQQEAAFMCAABJAgAAQQEAAEJGBgBBHQYARToGAFICAABUAwAAQS0GAEg2BgBBAQAATwEAAEkCAABOAwAAQQEAAERaBgBBTQYARVYGAE4BAABPAQAARd4HAEFnBgBIAQAAQ3MGAEkCAABBAQAARX4GAE4DAABBAQAASZ4GAEGFBgBHkgYASAIAAEEBAABTAgAASAIAAEEBAABKugYAQQIAAE4CAABEAgAAUgIAAEG1BgBPAQAAS98GAFMCAABBAgAATgIAAEQCAABF1gYAUgEAAFICAABBAQAATusGAEHlBgBFAQAAUyoHAEj+BgBB9QYASQIAAEEBAABJBgcAQQEAAFMCAABBIwcATgIAAEQCAABSAgAAQR0HAE8BAABJAgAAQQEAAFRKBwBBMQcASAIAAEE5BwBFQgcAQQEAAEkCAABBAQAAWMsHAEF/BwBOAgAARAIAAEViBwBSAQAAUgIAAEFpBwBFcwcAQQEAAEl6BwBBAQAATwEAAEmLBwBBhQcAUwEAAFOiBwBBAgAATgIAAEQCAABSAgAAQQEAAFWqBwBTAQAAWbIHAFMBAABaAgAAQQIAAE4CAABEAgAARQIAAFIBAABZAgAAQdYHAEgBAABOAgAAQQEAAEYWCABPAggATvoHAFPyBwBPAQAAWgIAAE8BAABSAgAARAEAAFICAABFAgAARAMAAEERCABPAQAASd8IAEEzCABIIQgATgIAAEEpCABOAgAAQQEAAENCCABFOQgASQIAAEEBAABESggAQQEAAEpWCABBAgAASAEAAE5iCABBXQgARQEAAFOuCABBaQgARW0IAEh+CABBdQgASQIAAEEBAABJhggAQQEAAE+OCABOAQAAU54IAEGVCABPAgAATgEAAFQCAABBAgAASQIAAFIBAABUtggAQQEAAFbCCABJAgAAQQEAAFjFCABZ0ggAQQMAAEgBAABaAgAAQdkIAEUBAABMUgkAQe4IAE4DAABBAQAARQYJAEf+CABSAgAAQQEAAE4DAABFAQAASTMJAEUNCQBTJgkATxoJAE4BAABTAgAATwIAAE4BAABZAgAAQQIAAEgBAABZAwAATjkJAFMCAABBQQkAT0oJAE4BAABTAgAAQQEAAE1mCQBBWQkARQIAAEQCAABBAQAAT74JAElyCQBTAQAATqIJAEF5CQBEhgkAUgIAAEEBAABOjgkAQQEAAFOWCQBPAQAAWgIAAEGdCQBPAQAAUqoJAEEBAABZAgAAUwIAAEkCAABVAgAAUwEAAFDeCQBIAgAAQckJAE8CAABOAgAAUwIAAEXZCQBPAQAAU+4JAFQCAABPAgAATgEAAFQOCgBB9QkASAYKAEH9CQBFAgAAQQEAAE8CAABOAQAAVkYKAEEfCgBSAgAATwEAAEUyCgBSAgAAQSkKAFQCAABBAQAASQIAAEU5CgBOQwoAQQEAAFMBAABZAgAAQ1oKAEVRCgBJAgAAQQEAAE5iCgBBAQAAU5YKAEFpCgBFbQoASHYKAEEBAABJfgoAQQEAAE+GCgBOAQAAUwIAAEGNCgBJAgAAQQEAAFYCAABJAgAAQQEAAE1KDABBIgsARLoKAEGxCgBPAwAAUgEAAEnCCgBBAQAATM8KAEkCAABBAQAATt8KAETaCgBBAQAASQEAAFILCwBB6woASAEAAEXtCgBJAwAAQfsKAEgBAABF/QoATwYLAE4BAABTAQAAVRYLAFICAABJAQAAWQIAAEEDAABIAQAAQk4LAEEuCwBSAQAART4LAFIDAABMAgAAWQEAAFICAABPAgAAUwIAAEUBAABFngsARWILAFIDAABBAwAASAEAAExyCwBJAgAAQW0LAEUBAABSigsASQIAAEOGCwBBgQsATwEAAEUBAABUAgAASAIAAFkCAABTAgAAVAEAAEnrCwBBrwsASKkLAFMBAABFsQsATL4LAEkCAABBAQAATssLAEEDAABIAQAAUtsLAEHXCwBIAQAASQEAAFTdCwBZAgAAQQMAAEgBAABNBgwAQfYLAFIBAABJ/gsARQEAAE8CAABOAQAATyYMAE4NDABSFwwAQQEAAFMZDABVAgAAUgIAAEEBAABQNgwAQQIAAFICAABPAQAAWQMAAEFDDABIAQAAUgIAAEEBAABOZxAAQQcNAEJqDABFAgAATAMAAEwCAABBZQwARQEAAEhyDABJAQAASYIMAEF+DABIAQAAUwEAAEuODABJAgAATgEAAEymDABJAgAAQZkMAFMCAABBoQwARQEAAE26DABBAgAAUgIAAEkCAABBAQAATsYMAFkCAABBAQAAU+8MAFQCAABBAgAAQ+IMAEkCAABB3QwATwEAAFMCAABJAgAAQQEAAFkCAABB+wwASAEAAEUCAABMAgAASQEAAERaDQBFHg0AUgMAAFMDAABPAgAATgEAAEknDQBFAQAAUlYNAEEtDQBFTw0AQTsNAFMBAABFPQ0ASUENAFNFDQBXSQ0AWQEAAEkCAABBAQAAWQEAAEV2DQBTag0AUwIAAEEBAABUAgAAVAIAAEUBAABH8g0AReINAEwDAABBhQ0ARZYNAE6SDQBBAQAAUwEAAEnODQBBnQ0AQ6cNAEEBAABLrg0AQQEAAE66DQBBtQ0ARQEAAFHGDQBVAgAARQEAAFQCAABBAQAATNYNAEEBAABP2Q0AWQMAAE4BAABJ6g0ARQEAAFUCAABTAQAASVMOAEH/DQBIAQAAQgoOAEECAABMAQAASxIOAEEBAABTNg4AQRkOAEgjDgBBAQAAUyoOAEEBAABUAgAATwIAAE4BAABURg4AQT0OAFICAABBAQAAWQIAAEEDAABIAQAASooOAEF3DgBMYg4ASQEAAE4CAABFAgAAVAIAAFQCAABFAQAARQIAAEwCAABJAgAAQwIAAEEBAABOew8AQQMPAEKyDgBFAgAATKsOAEwDAABBpQ4ARQEAAFQCAABIAQAATOYOAEXKDgBFvQ4ASQIAAEcCAABIAQAASQIAAEXaDgBTAgAARQEAAFMCAABB4Q4ARQEAAE0CAABBAgAARfEOAFICAABJAgAAQf0OAEUBAABFRw8ATCIPAEkCAABFGg8AUwIAAEUBAABTAgAARQEAAE02DwBBAgAAUgIAAEkCAABFAQAAVAIAAFQCAABBQQ8ARQEAAElmDwBFTQ8AS1YPAEEBAABTAwAAVAIAAE8CAABOAQAATQIAAEECAABSAgAASQIAAEUBAABTog8ARY4PAEwDAABNAgAATwEAAEyaDwBFAgAAWQEAAE8CAABOAQAAVEoQAEi+DwBPAgAATgIAAEW6DwBZAQAAWQEAAEnaDwBPAgAATgIAAEUDAABUAgAAVAIAAEUBAABPLhAASfYPAE4CAABFAwAAVAIAAFQCAABFAQAATgMAAEUXEABMChAATAIAAEEBAABUAgAAVAIAAEUBAABJKhAAQR0QAE4mEABBAQAATwEAAFkBAABXAgAAQUIQAEk+EABOAQAATgEAAE8CAABOAQAAV1YQAEECAABSAQAAWQIAAEFdEABMAgAAQQEAAFCOEABPehAATAIAAEwCAABPAQAAUgIAAEmGEABMAQAAWQIAAEwBAABSkhMAQd8QAEKqEABFAgAATAIAAEwCAABBAQAAQ74QAEUCAABMAgAASbkQAFkBAABNyxAASQIAAFMBAABO1hAAWgIAAEEBAABZAgAAQQEAAEMGEQBIAwAARe4QAFIBAABJAgAAQgIRAEECAABMAgAARAEAAEUBAABELhEARR4RAEwaEQBMAwAAQQEAAE4BAABJAgAAUyURAFQCAABIAQAARVIRAEw+EQBJOREAWQEAAE5BEQBTRREAVAIAAEgCAABBAQAASf8RAEGHEQBEahEATgIAAEFlEQBFAQAASG0RAE4DAABBdREARXkRAE4CAABBgREARQEAAEOPEQBBAQAARasRAEynEQBBmREATAIAAEGhEQBFAQAAUwEAAEuzEQBBAQAATrURAE/GEQBOAwAATgIAAEEBAABT0xEAUwIAAEEBAABZ7hEAQQMAAEjdEQBOAgAAQeURAE4CAABBAQAAWgIAAE8CAABOAgAAQQEAAEoKEgBVAgAATgEAAExmEgBBFxIATgEAAEVGEgBFIhIATgEAAE4vEgBBKRIARQEAAFRDEgBINRIAVAIAAEE9EgBFAQAAWQEAAElaEgBFTRIATlcSAEUBAABTAQAAT10SAFkCAABOAQAATaYSAEGGEgBBdhIATgEAAE4DAABEgxIATwEAAEkBAABJlhIARJISAEEBAABOAQAATwIAAE4DAABEoRIASQEAAE7qEgBBshIAVgEAAEXDEgBUAgAAVAIAAEEBAABJyhIARQEAAE/aEgBMAgAARAMAAE8BAABVAgAATAIAAEYCAABPAQAAT/ISAE4BAABSAhMATwIAAE79EgBXAQAAVEcTAEUaEwBNAgAASQIAAE8VEwBTAQAASC4TAEUmEwBSAQAAVQIAAFIBAABJOhMARTUTAFMBAABVAgAAUgIAAE8BAABWYhMASQIAAERREwBMXxMATAIAAEEBAABOAQAAV24TAEUCAABOAQAAWQIAAEGHEwBOAwAAQX0TAE4CAABBAQAARY4TAEgBAABOAQAAU3IUAEGZEwBIKxQAQa8TAE4CAABUAgAASQEAAEK2EwBZAQAARcYTAEzCEwBZAQAAUgEAAEnOEwBBAQAATAYUAEXuEwBB2RMARd0TAEnqEwBHAgAASAEAAFkBAABJ+xMARfUTAE4BAABZAwAATgMAAE4BAABUAgAARRIUAE4BAABJGhQATgEAAE8iFABOAQAAWQIAAE4BAABJPhQAQTcUAEgBAABZAgAAQQEAAE1GFABBAQAAUFoUAEVSFABOAQAAWQIAAE4BAABUAgAAT2YUAE4BAABSAgAASQIAAEQBAABUvhQASIYUAEUCAABOAgAAQQEAAEySFABBAgAAUwEAAFKqFABFAgAAVaIUAFMBAABZAgAAVQEAAFQCAABJAgAAQwIAAFUCAABTAQAAVf4VAEIGFQBSAgAARdYUAEXRFABZAQAASQMVAEHuFABOAgAAQeUUAE4CAABBAQAARQMAAEwCAABMAgAAQf0UAEUBAABZAQAARFYVAEUSFQBOAQAASRoVAEUBAABSAgAAQSEVAEUuFQBFKRUAWQEAAElSFQBBRhUATgIAAEE9FQBOAgAAQQEAAEVJFQBOAgAAQQEAAFkBAABHfhUAVQIAAFMCAABUAwAAQWkVAEl2FQBOAwAARQEAAFUCAABTAQAATpIVAEQCAABSAgAARQIAAEEBAABSuhUAQZkVAEWuFQBMAgAASQIAAEGpFQBPAQAATwIAAFICAABBAQAAU+IVAFQCAABFyhUATgEAAEnSFQBOAQAAT9oVAE4BAABZAgAATgEAAFQCAABI8hUARQIAAFIBAABVAgAATQMAAE4BAABWohYAQSsWAEgJFgBMIhYATxYWAE4BAABZAgAATgMAAE4BAABOAgAASQEAAEVCFgBOMRYAUgIAAEk/FgBFAQAAWQEAAElvFgBBWhYATgIAAEFRFgBOAgAAQQEAAE9iFgBOAQAAU2UWAFYCAABBAQAAT3YWAE4BAABSAgAAQYoWAEgCAABBAgAATQEAAEmSFgBMAQAATwIAAEgCAABPAgAATQEAAFi+FgBFrhYATAEAAEyxFgBUAgAATwIAAE4BAABZShcAQeMWAEHOFgBOAQAASNEWAE4DAABB2RYATgIAAEEBAABE/hYAQe4WAE4BAABF9hYATgEAAEkCAABOAQAARQ4XAFMCAABIAgAAQQEAAEwqFwBBFRcARSIXAEUCAABOAQAASQIAAE4BAABNNhcAQQIAAE4BAABTQhcASAIAAEEBAABWAgAAQQEAAFoCAABBdhcARVoXAEwBAABMZhcARQIAAEEBAABSAgAASQMAAEEDAABIAQAASYIXAEUCAABMAQAAUp4XAEGSFwBFAgAATAEAAEkCAABFAgAATAEAAFUCAABDshcARQIAAE4CAABBAQAATAEAAEJqIwBBFhkAQtYXAEXSFwBUAgAAVAIAAEUBAABZAQAASfoXAEwCAABB4RcARQIAAEXpFwBJ9hcARwIAAEgBAABZAQAASwYYAEUCAABSAQAATB4YAFQCAABBAgAAWgIAAEECAABSAQAATSoYAEICAABJAQAATjYYAEsCAABTAQAAUroYAEJbGABBShgAUgIAAEEBAABJUhgARQEAAFICAABBAQAATmYYAEUCAABZAQAAT24YAE4BAABSkhgARX4YAFQCAABUAQAASYYYAEUBAABPjhgATgEAAFkBAABUAwAASLIYAE8CAABMAgAATwIAAE0CAABFAgAAVwEAAE8CAABOAQAAU9YYAEnGGABMAQAAVAIAAEkCAABBAgAATgEAAFjmGABUAgAARQIAAFIBAABZAgAATAIAAEUGGQBF9RgASQIZAEcCAABIAQAAWQEAAEkOGQBFAQAATwIAAFIBAABFAhwAQUYZAFIhGQBUPhkAUgIAAEkCAABDNhkARQEAAFg5GQBaAQAAVQMAAFgBAABDehkAQ1IZAEEBAABLAwAARWIZAFQCAABUAQAASG4ZAEECAABNAQAASXcZAEUBAABZAQAATLIZAEWGGQBOAQAASZYZAE4CAABEAgAAQQEAAEyrGQBBpxkATQIAAFkBAABFAQAAVgIAAEEBAABOWxoARcoZAEQCAABJAgAAQwIAAFQBAABJ5hkAQ9oZAEkCAABPAQAAVAIAAEHhGQBPAQAAShIaAEECGgBNAgAARfoZAE4BAABJAgAATgEAAEkCAABNAgAAQQIAAE4BAABOLhoARSIaAFQCAABUAQAASSoaAEUBAABZAQAAUzoaAE8CAABOAQAAVAIAAExSGgBFThoARUkaAFkBAABZAQAATwIAAE4BAABSXhsARXIaAE4CAABJAgAAQwIAAEUBAABLkhoARYYaAEwCAABFAgAAWQEAAEwCAABFAgAAWQEAAEyeGgBJAgAATgEAAE4iGwBB3hoARMYaAEW6GgBUAgAAVAIAAEUBAABJAgAATgIAAEUBAABSAgAARAMAAEnaGgBOAgAARQEAAE8BAABFAhsASe4aAEMCAABFAQAATPYaAEwBAABUAgAAVAIAAEEBAABJAgAAQw4bAEUBAABFGxsAQwIAAEUBAABUAgAAQQEAAFIqGwBZAQAAVFcbAEExGwBIOhsAQQEAAElCGwBFAQAAUgIAAEECAABNTRsATgIAAEQBAABZAgAATAEAAFNuGwBTAwAASQIAAEUBAABUxhsASJcbAEGOGwBOAgAASYYbAEUBAABOiRsAWQEAAEUCAABMAQAAU6YbAEWiGwBZAQAAWQEAAFQCAABFrRsASb4bAEW1GwBOAgAAQQEAAFkDAABFAQAAVdYbAEwCAABBAgAASAEAAFbyGwBFAgAAUgIAAEwCAABF7hsAWQEAAFkBAABYAgAATAIAAEUCAABZAQAASV4cAEEeHABOAgAAQxYcAEEBAABLAgAAQQEAAEw+HABBKhwATAEAAEwDAABJNhwARQEAAFkDAABFAQAAUk4cAEQCAABJAgAARQEAAFMCAABIAgAATwIAAFABAABKbhwATwIAAFICAABOAQAATBYdAEHaHABJkhwAToIcAEUBAABSixwARQEAAFMCAABFAQAAS6IcAEUDAABMAgAAWQEAAE66HABDthwAQa0cAEgDAABFAQAARQEAAFO9HABZ0hwAS8ocAEUBAABOAgAARQEAAFoCAABFAQAARfIcAFMCAABTAgAASQIAAE4CAABHAQAATwYdAFMCAABTAgAATwIAAE0BAABZAgAAVAIAAEgCAABFAQAAT88dAEEiHQBaAQAAQjsdAEICAABJMx0ARQEAAFkDAABFAQAARFYdAEVHHQBOAQAASE4dAEkBAABJAgAARQEAAE52HQBJZh0AVAIAAEEBAABOAgAASXIdAEUBAABZAQAAT44dAEuGHQBFAgAAUgEAAE4CAABFAQAAUpodAEkCAABTAQAAU6odAFQCAABPAgAATgEAAFe+HQBFth0ATgEAAEkCAABFAQAAWQIAAEPKHQBFAQAARAEAAFLCIgBBUh8AQ+IdAEgCAABBAQAARBseAEXuHQBOAQAARv4dAE8CAABSAgAARAEAAEwSHgBFDh4ARQkeAFkBAABZAQAAWQMAAE4BAABFSh4ARDoeAEUqHgBOAQAATzIeAE4BAABZAgAATgEAAEwCAABZAgAATgMAAE4BAABJXh4ARFoeAEUCAABOAQAATgEAAE7GHgBEmh4AQW4eAE4BAABFeh4ARXUeAE4BAABJhx4ARYEeAE4BAABPjh4ATgEAAFSRHgBZAwAATgEAAE6mHgBPAgAATgEAAFOyHgBPAgAATgEAAFQDAABMAgAARQIAAEXBHgBZAQAAVdYeAEwCAABJAgAATwEAAFjuHgBUAgAAT+YeAE4BAABZAgAATgEAAFkCAABB+h4ATgEAAEQOHwBFBh8ATgEAAE8CAABOAQAATDofAEUqHwBFGR8ASSYfAEcCAABIAQAATgEAAEkyHwBOAQAATwIAAE4BAABTRh8ATwIAAE4BAABUAgAATwIAAE4BAABF/h8AQW8fAE4CAABBYR8ATgMAAEFpHwBFAQAAQ34fAEsDAABFAgAATgEAAEWTHwBBAgAATgIAAE4CAABBAQAATuYfAESyHwBBox8ATgEAAEWqHwBOAQAATwIAAE4BAABOzh8AQb8fAE4BAABFxh8ATgEAAE8CAABOAQAAVAMAAEzeHwBFAgAAWQEAAE8CAABOAQAAT/YfAE4DAABOAgAAQQEAAFQDAABUAQAASYIhAEEfIABOGyAAQQ0gAE4CAABBFSAARQEAAFIBAABDJiAARQEAAERCIABHAgAARQIAAFI1IABUAwAAVAMAAEUBAABFayAAQVYgAE4CAABOAgAAQQEAAExmIABMAgAAQWEgAEUBAABOAQAAR7IgAEV+IABUAgAAVAIAAEUBAABHhiAAUwEAAEieIABBkiAATQEAAFQCAABPAgAATgEAAEkCAABEpSAAVAIAAFQCAABFAQAATL4gAEUCAABZAQAATtIgAEwCAABFAgAARc0gAFkBAABP4iAATgMAAE4CAABBAQAAUw4hAEHpIABF+iAASQIAAEQCAABBAQAAUwIhAEEBAABUAgAATwIAAEwBAABUciEAQR4hAE4CAABZAQAATi4hAEUqIQBZAQAASQEAAFQDAABBTyEATgIAAEVCIQBZAQAASUshAEUBAABZAQAATmohAEVeIQBFWSEAWQEAAElnIQBFAQAAWQEAAE8CAABOAQAAWAIAAFQCAABPAgAATgEAAE8OIgBDjyEASwEAAESyIQBFpiEAUgIAAEkCAABDAgAASwEAAEmuIQBFAQAAWQEAAEe+IQBBAgAATgEAAE7eIQBTziEATwIAAE4BAABX2iEAWQIAAE4BAABYAQAATwIAAEsDAABF+yEATAIAAFkCAABOAwAATgEAAEwKIgBZAgAATgMAAE4BAABTAQAAVSIiAEMaIgBFAQAATgIAAE8BAABZAgAAQUIiAE4/IgBBMSIATjoiAEEBAABUAQAAUgEAAENOIgBFAwAATgEAAEVWIgBSAQAATG4iAEUCAABFYSIASQIAAEcCAABIAQAATpsiAEyOIgBFAgAARX0iAEmKIgBHAgAASAEAAFkBAABOAwAAQZUiAEUBAABPoiIATgEAAFO2IgBFriIATgEAAE8CAABOAQAAVAIAAE8CAABOAQAAVVojAEPOIgBLAQAARNsiAEQCAABZAQAARvIiAEbmIgBZAQAATwIAAFICAABEAQAATP4iAEECAABIAQAAUj4jAEsKIwBFAQAATBcjAEUCAABZAQAATjIjAEUmIwBMAgAATAEAAEkCAABDAgAARQEAAFQDAABPAgAATgEAAFNOIwBUAgAARQIAAFIBAABUAgAAQwIAAEgBAABZAgAAUgIAAE8CAABOAQAAQzY1AEGaKQBEiiMARYcjAE4DAABDAgAARQEAAFkBAABFriMATKMjAEGaIwBOAQAAWQIAAE4BAABTAgAAQQIAAFIBAABJAiQARL4jAEUCAABOAQAATNojAEXKIwBZAQAASdIjAE4BAABZAgAATgEAAE7dIwBS5iMATwEAAFQCAABMAgAASfYjAE4BAABZAgAATgMAAE4BAABMjyQARSMkAEINJABJGiQARwIAAEgBAABOHSQAWQEAAEkzJABTAgAAVAIAAEEBAABMeiQAQUskAEhGJABBAgAATgEAAE4BAABFUiQATgEAAElzJABFWSQAT2YkAFACAABFAQAAUwIAAFQCAABBAQAAVQIAAE0BAABVgiQATQEAAFYCAABJAgAATgEAAE1LJQBBniQAUgIAAEkBAABCriQAUgIAAEkCAABBAQAARMIkAEW6JABOAQAAWQIAAE4BAABF8iQATN4kAEnSJABBAQAATAIAAEkCAABBAQAAUgIAAE/qJABOAQAAWQIAAE4BAABJDyUATAIAAEH9JABMCiUAQQUlAEUBAABPAQAATRolAEkCAABFAQAAUC4lAEICAABFAgAATAIAAEwBAABSAgAARTolAE4BAABPQiUATgEAAFkCAABOAQAATs4lAEFaJQBBAgAATgEAAESuJQBBaiUAQwIAAEUBAABFhiUATAIAAEECAABSAgAASQIAAEGBJQBPAQAASaMlAEOSJQBFAQAARJolAEEBAABFnSUAUwEAAFkDAABDAgAARQEAAE66JQBPAgAATgEAAE/CJQBOAQAAWQIAAE8CAABOAQAAUOIlAFICAABJAwAAQwIAAEUBAABSwicAQeklAET6JQBFAgAATAIAAEwBAABFBiYATgEmAFkBAABJJyYARQ0mAE4XJgBBAQAAUwIAAEEdJgBTAgAAQQEAAEynJgBBLSYARWYmAEU7JgBOAQAASUYmAEcCAABIAQAATk4mAEUBAABUYiYAT1omAE4BAABUAgAAQQEAAFkBAABJcyYARW0mAE4BAABPiyYAU3kmAFQCAABBgSYAVAIAAEEBAABUliYATwIAAE4BAABZAwAATKImAEUBAABOAQAATe4mAEGzJgBOAQAARdomAEzXJgBBvSYAScomAFQCAABBAQAATNImAEEBAABPAQAATgEAAEnmJgBOAgAARQEAAE8CAABOAQAATv4mAEUCAABMAgAATAEAAE8+JwBMOycAQRInAE4CAABOAQAARRsnAEUBAABJKicATgIAAEElJwBFAQAAWQIAAE4DAABFNScATgEAAE4BAABSaicASV8nAEVJJwBOAgAARwIAAFQCAABPAgAATgEAAE8CAABMAwAATAEAAFOSJwBFdicATgEAAE9+JwBOAQAAVIonAEUCAABOAQAAWQIAAE4BAABUqicARZ4nAFIBAABJAgAARQIAAFIBAABWticARQIAAFIBAABZAwAATL0nAE4BAABTkigAQdonAE4CAABEAgAAUgIAAEEBAABF5ycATuEnAFkBAABI9ycAVAIAAE8CAABOAQAASQooAEX9JwBNAgAASQIAAFIBAABPEigATgEAAFAqKABFHigAUgEAAEkCAABBAgAATgEAAFOCKABBVigATkIoAEQCAABSAgAAQQEAAFUCAABOAgAARAIAAFICAABBAQAASW8oAERiKABZAQAARWUoAFUCAABTAQAATwIAAE4CAABEAgAAUgIAAEEBAABUAgAASQIAAEUCAABMAQAAVFYpAEHGKABMtigARaooAFkCAABBAQAASQIAAE4CAABBAQAAUgIAAEkCAABOAgAAQQEAAEXaKABSAgAASQIAAE4CAABBAQAASDopAEHyKABSAgAASQIAAE4CAABFAQAARQYpAFICAABJAgAATgIAAEUBAABJDykARQEAAEweKQBFAgAARQIAAE4BAABSNikASS4pAE4CAABFAQAAWQIAAE4BAABZAQAASUYpAE4CAABBAQAAUgIAAEkCAABOAgAAQQEAAFkCAABEbikARQIAAE4DAABDAgAARQEAAEyGKQBBdSkARX4pAEUBAABJAgAATgEAAFMCAABFkikATgEAAE8CAABOAQAARVIqAEGuKQBTAgAAQQIAAFIBAABD3ikARcIpAEwCAABJAgAAQQEAAEkCAABMAwAARc0pAEnaKQBB1SkATwEAAFkBAABE+ikAQeopAFIBAABSAgAASQIAAEMDAABLAQAATEYqAEUqKgBOCioAQQEAAFMCAABUAgAARRUqAEkCAABOAgAAQSEqAEUlKgBPAQAAST4qAEExKgBOAgAAQTkqAEUBAABTAgAATwEAAFMCAABBAgAAUgEAAEhCLgBBSiwAQ2IqAEUBAABEiyoARGkqAFJ6KgBJAgAAQwIAAEsBAABXAgAASQIAAEMCAABLAQAASZIqAE0BAABOCisAQZkqAEOyKgBFAwAATAIAAEwCAABPAgAAUgEAAETOKgBBuSoATMYqAEUCAABSAQAAUgIAAEEBAABF3ioATAMAAEwDAABFAQAATu4qAEkCAABOAgAARwEAAFQCAABB+ioATAEAAEUDAABMAwAATAMAAEUBAABS3isASTIrAFMrKwBNHisAQQEAAFMCAABBJSsARQEAAFQCAABZAQAATLIrAEE5KwBFeisARUcrAE4BAABJUisARwIAAEgBAABOWisARQEAAFNrKwBUAgAATwIAAE4BAABUdisAVAIAAEUBAABZAQAASZMrAEWBKwBOiisARQEAAFoCAABFAQAAT6IrAFQCAABUAgAARQEAAFSuKwBPAgAATgEAAFkBAABNxisAQQIAAEkCAABOAgAARQEAAE8CAABMAgAARQIAAFQCAABUAgAARQEAAFMTLABF5SsASfIrAFQCAABZAQAAUwIsAEkCAABEAgAAWQEAAFQCAABJAgAAVAIAAFkBAABVJiwATgIAAEMCAABFAgAAWQEAAFYuLABBAQAAWUYsAEE1LABDPiwARQEAAFMCAABFAQAAWgEAAEUrLQBMbiwAUwIAAEViLABBXSwAWQEAAElrLABFAQAAWQEAAFLCLABJkywARXksAEyGLABZAgAATgEAAFMCAABFjSwASAEAAE+iLABLAgAARQIAAEUBAABSsiwASa8sAEUBAABZAQAAWQIAAEwDAABFvSwATAEAAFPqLABM0iwARQIAAFkBAABO3iwARQIAAFkBAABUAgAARQIAAFIBAABU7SwAVgYtAEUCLQBMAgAATAIAAEUBAABZAQAAWQIAAEEaLQBOAgAATgIAAEUBAABFAgAATgIAAE4CAABFAQAASVotAEE6LQBSAgAAQQEAAE5CLQBBAQAAUEUtAFECAABVAgAASQIAAFQCAABBAQAATGYtAE8CAABFAQAAUhouAEkGLgBTAwAAU3otAFkBAABUAwAAQZMtAEmKLQBOAQAATI0tAE4BAABFri0ARZ4tAE4BAABMoS0ATgMAAEGpLQBFAQAASdctAEHGLQBOAwAAQb0tAE4CAABBAQAARcktAE4DAABB0S0ARQEAAE8CLgBG5i0ARQIAAFIBAABQ/i0ARfItAFIBAABIAgAARQMAAFIBAABTAQAAWQEAAFkCAABTAgAAVAIAAEECAABMAQAAVSYuAEMCAABLAQAAWQIAAEE6LgBOAgAATgIAAEUBAABOAgAAQQEAAEkCLwBBai4ATlsuAEFRLgBOAgAAQQEAAFICAABBYS4AUgIAAEEBAABDei4ARQIAAEwCAABZAQAARaIuAEyGLgBPAQAATpIuAE4CAABBAQAAUgIAAEGZLgBSAgAAQQEAAEy2LgBMAgAASQIAAEECAABOAQAATtouAETKLgBBwS4AScUuAFkBAABUAgAASAIAAEkCAABBAQAAUuIuAE8BAABUAgAATAIAAEECAABMAgAASfUuAEz+LgBJAQAAWQEAAEyOMABBri8ASRovAFIDAABBFS8ARQEAAFJuLwBBLy8ATgIAAEMCAABFAQAART8vAE4CAABDAgAARQEAAElmLwBCTi8ARQIAAEwBAABDVi8ARQEAAFMCAABBXS8AUwIAAEEBAABLAwAARQEAAFWeLwBEAwAARYcvAFQCAABUAgAARQEAAEkCAABBjS8ARZEvAE6aLwBFAQAATwEAAFkDAABUAgAATwIAAE4BAABFIjAATd8vAEXSLwBOAgAAVAMAAEXFLwBJAgAATgIAAEUBAABNAgAASQIAAEUBAABP+y8ATuUvAFACAABBAgAAVAIAAFICAABBAQAAVAowAEEBMABVAgAAUwEAAFYCAABFAwAATAIAAEECAABOAgAARAEAAEleMABGRjAARjswAE8CAABSAgAARAEAAFQCAABPAgAATgEAAE5WMABUAwAATwIAAE4BAABWAgAARQEAAE+CMABFZTAAVnowAEVyMABSAQAASQIAAFMBAABZAgAARAEAAFkCAABEAgAARQEAAE/SMwBCmjAAWQEAAESyMABFpjAAWQEAAEmvMABFAQAAWQEAAEW6MABOAQAASMYwAEUCAABOAQAATIoxAELaMABJ1jAARQEAAFkBAABFGzEAReYwAE4BAABN8jAAQQIAAE4BAABT/jAATwIAAE4BAABUFjEATwoxAE4BAABUAgAAQRExAEUBAABZAQAASSIxAE4BAABMSjEART4xAEUyMQBOAQAAVAIAAFQCAABFAQAASQIAAE4DAABTAQAAU1YxAE8CAABOAQAAVHcxAEVmMQBOYTEAUgEAAEluMQBOAQAATwIAAE4BAABVAgAATQIAAEICAABVAgAAUwEAAE4+MgBBljEATgEAAEO+MQBFAgAAULIxAEMCAABJAgAATwIAAE4BAABUAgAAVAIAAEEBAABMyjEARQIAAFkBAABO5jEARdYxAFIBAABJ3jEARQEAAE8CAABSAQAAT+4xAFIBAABS+jEAQQIAAEQBAABTMjIAVCIyAEECAABOAgAAQxIyAEUBAABUAgAASQIAAE4CAABFAQAAVQIAAEUCAABMAgAATwEAAFcCAABBAgAAWQEAAE9OMgBQAgAARQIAAFIBAABSgjMAQXMyAEwDAABFYjIARQEAAEkCAABFaTIATgIAAEUBAABCmjIAQX4yAE4BAABFijIAVAIAAFQBAABJkjIATgEAAFkCAABOAQAARLIyAEUCAABMAgAASa4yAEEBAABMAQAARdYyAEW+MgBOAQAATsYyAEUBAABU0jIAVAIAAEEBAABZAQAASfcyAEXdMgBOAwAAQeUyAEXpMgBOAgAAQfEyAEUBAABMBjMASQIAAFMCAABTAQAATRIzAEECAABDAQAATj4zAEUCAABMAgAASTozAEElMwBPMjMAVQIAAFMBAABVAgAAUwEAAEwBAABSWjMASVYzAEVJMwBOAgAAQVEzAEUBAABZAQAAVHIzAEVmMwBaAQAATgIAAEUCAABZAQAAV34zAEkCAABOAQAAWQEAAFOeMwBFljMAVAIAAFQCAABFAQAATQIAAE8BAABUpjMAWQEAAFXOMwBSAgAAVAIAAEzCMwBBAgAATgIAAEQBAABOAgAARQIAAFkBAABZAQAAUr40AEH2MwBJ4jMARwEAAFcCAABGAgAATwIAAFICAABEAQAARR40AEUCNABEAQAASRo0AEcCAABIAgAAVAIAAE8CAABOAQAAVwEAAEmONABTAwAAUy40AFkBAABUAgAAQTs0AEwBAABFQjQATgEAAElfNABBUjQATgMAAE8BAABOAwAAQVk0AEUBAABPijQAQm40AEECAABMAQAARno0AEUCAABSAQAAUAIAAEgCAABFAgAAUgEAAFkBAABPnjQAUwIAAEICAABZAQAAVao0AEWlNABaAQAAWQIAAFMCAABUAgAAQQIAAEwBAABV8jQATNI0AEwCAABFAgAATgEAAFICAABM4jQARQIAAFkBAABUAwAASQIAAFMDAABTAQAAWQMAAEQGNQBOAgAARQIAAFkBAABOIjUARBI1AEkBAABUAgAASAIAAEkCAABBAQAAUgIAAEkuNQBMAQAAVQIAAFMBAABEFkQAQdo5AENKNQBJAgAAQQEAAEVaNQBMAgAAWQIAAE4BAABGZjUATgIAAEUBAABIdjUATAIAAEkCAABBAQAASaY1AEqGNQBBAwAASAEAAE6ONQBBAQAAUwIAAEWaNQBZAQAASKI1AEEBAABZAQAASro1AEGtNQBVAgAAQQIAAE4BAABL4jUAQco1AFICAABJAQAATwIAAETWNQBBAQAAVAIAAEEDAABIAQAATDY2AEHyNQBSAgAAWQEAAEUDNgBZAgAAWgIAAEEBAABJFjYAQQk2AEwCAABBAwAASAEAAEwqNgBBIjYAUwEAAEkCAABOAQAAVAIAAE8CAABOAQAATZ42AEFmNgBORjYASQEAAFICAABDVjYAVQIAAFMBAABJAwAAT2I2AE4BAABTAQAARXY2AE5tNgBPAgAATgEAAEmWNgBBgjYATgEAAEWKNgBOAQAAT5I2AE4BAABSAQAATwIAAE4BAABOdzcAQas2AEUBAABEtjYAUgIAAEUBAABF0zYATMY2AEwCAABFAQAAVAIAAFQCAABFAQAAR+I2AEUCAABMAgAATwEAAEk3NwBB7zYATAEAAEP2NgBBAQAARRI3AEwDAABBATcARQU3AEwDAABBDTcARQEAAEsaNwBBAQAATCI3AE8BAABTLjcASAIAAEEBAABUAgAAQQEAAE5WNwBBPTcASVM3AEUDAABMAwAATAIAAEUBAABZAQAAVF43AEUBAABZAgAAQWU3AEUCAABMAwAATAMAAEUBAABQhjcASAIAAE4CAABFAQAAUZY3AFUCAABBAgAATgEAAFK6OABBnTcAQqY3AFkBAABDtjcASbM3AEUBAABZAQAARcY3AEzCNwBMAQAATgEAAEn2NwBB1zcATgMAAEEBAABF4jcATN03AE4BAABO5TcAT+83AE4BAABVAgAAUwEAAEweOABB/TcARRI4AEUKOABOAQAATgIAAEUBAABJAgAATgIAAEUBAABOLjgARQIAAEwCAABMAQAATz44AEw6OABEAQAATgEAAFKSOABFUjgATE84AEwBAABOAQAASYI4AEFeOABOAQAAQ2Y4AEsBAABFbjgATgEAAE5xOABPejgATgEAAFUCAABTAQAAT4o4AE4BAABZAgAATAEAAFaeOABJAgAATgEAAFeqOABJAgAATgEAAFkCAABMtzgARQEAAE4BAABT7jgASOc4AEHXOABVzjgATgEAAFcCAABOAQAASQIAAEUCAABMAgAATAEAAEkCAABBAQAAVkY5AEUHOQBO+TgATwI5AE4BAABZAQAASTM5AEESOQBOAQAARBs5AEEBAABFHTkATic5AEEBAABPLjkATgEAAFMBAABPQjkATgMAAFQCAABFAQAAWQEAAFdiOQBOVzkAQVE5AEUBAABTAgAATwIAAE4BAABYczkAVAIAAE8CAABOAQAAWQIAAEGSOQBOAgAAQYs5AFICAABBAQAATgIAAEEBAABMtjkAQZ45AE4BAABFpzkATgEAAEmuOQBOAQAATwIAAE4BAABOwjkAQb05AEUBAABTzjkASAIAAEEBAABUAgAATwIAAE4BAABFQj8AQU46AEPuOQBPAgAATgEAAE5DOgBB9TkARAo6AFICAABBAToARQMAAEEBAABFDToARx46AEUCAABMAgAATwEAAE4rOgBBJToARQEAAFQCAABFMToASAIAAE8CAABOAgAAWQEAAFMCAABJAgAAQQEAAEKKOgBCajoASV86AEUBAABSZjoAQQEAAFkBAABJbToAT346AFICAABBAwAASAEAAFICAABBAwAASAEAAEOmOgBLmjoARQIAAFIBAABMAgAAQQIAAE4BAABEvjoAUgIAAEGxOgBJAgAAQwIAAEsBAABF7zoAQc46AE4CAABOAQAARNo6AEUCAABFAQAAR+Y6AEECAABOAQAATgIAAEEBAABJIjsARAI7AFICAABB/ToARQEAAE8KOwBOAQAAUho7AEQCAABSAgAARQEAAFMCAABZAQAASkI7AEEvOwBIAQAATzY7AE4BAABVAgAAQQIAAE4BAABLUjsATAIAAEECAABOAQAATEM8AEGCOwBJZjsATgIAAEUBAABOAgAAQW07AEV2OwBZAQAASX47AEUBAABPAQAAQpI7AEUCAABSAgAAVAEAAEamOwBJAgAATgIAAEGhOwBPAQAASc47AEGtOwBDujsASQIAAEEBAABMxjsAQQMAAEgBAABTAgAAQQEAAEzXOwBBAQAATeo7AEHjOwBSAQAARQIAAFIBAABPDjwASfY7AFMBAABSAgAAQf07AEUGPABTAQAASQIAAFMBAABQJjwASAIAAEkCAABBHTwATgIAAEUBAABUNjwAQS08AE8CAABOAQAAVgIAAEkCAABOAQAATcY8AEFqPABSAgAAQ148AE9VPABVAgAAUwEAAEkDAABPAwAATgEAAEWePABUAgAAUgIAAEF5PABJAwAAQYE8AEOLPABFAQAAT5M8AFMBAABTlTwAVQIAAFMBAABJoTwAT7Y8AE4CAABErTwAVAIAAEUBAABQAgAAUwIAAEUCAABZAQAATl49AEHbPABF0TwATAIAAEkBAABF5jwARQIAAE4BAABJFj0AQ/I8AEUBAABN9TwAUw89AEX9PABIBj0AQQEAAFMCAABFAQAAVAIAAEEBAABOMj0AQR09AEkuPQBFJT0AUwMAAEUBAABZAQAAVD49AE8CAABOAQAAVko9AEUCAABSAQAAWgIAAEVWPQBMAQAASQIAAEwBAABPij0ATgMAAERyPQBSAgAARQEAAE56PQBBAQAAVAIAAEGHPQBFAQAARQEAAFGaPQBVAgAAQQIAAE4BAABS8j0ARa49AEOqPQBLAQAASwEAAEm+PQBDuz0ASwEAAEsBAABPxj0ATgEAAFLmPQBF2j0AS9E9AEwCAABMAQAASQIAAEMCAABLAQAAVwIAAEkCAABOAQAAU4Y+AEUCPgBBAgAATgEAAEgiPgBBGj4AVRI+AE4BAABXAgAATgEAAE8CAABOAQAASTs+AFICAABBMj4ARQEAAEUDAABFAQAATUo+AE8CAABOAgAARAEAAFNWPgBJAgAARQEAAFQCAABBZj4ATgIAAFkBAABJAgAATgMAAEV6PgBFdT4AWQEAAEmDPgBFAQAAWQEAAFb3PgBBqj4ATps+AFQCAABFAQAAVQIAAEcCAABIAgAATgEAAEWyPgBOAQAASbo+AE4BAABMxj4ASQIAAE4BAABP7j4ATuM+AEHRPgBUAgAAQd8+AEUBAABFAQAAUgIAAEEDAABIAQAAWQIAAE4BAABXHj8AQQo/AFkCAABOAgAARQEAAEUSPwBZAQAASQIAAFQCAABUAQAAWC4/AFQCAABFAgAAUgEAAFoCAABNAgAATwIAAE4CAABEAQAASFI/AFICAABVAgAAVgEAAElqQABBgz8ATWo/AE8CAABOAgAARAEAAE4DAABBcT8ARXU/AE4DAABBfT8ARQEAAEOSPwBLAwAASQIAAEUBAABFnj8ARwIAAE8BAABM0j8AQao/AE4BAABMAgAAQb4/AE61PwBSAgAARAEAAEnKPwBPAgAATgEAAE8CAABOAQAATfo/AEnuPwBUAgAAUgIAAEkDAABPAgAAUwEAAFACAABMAgAARQEAAE4KQABBB0AASAEAAE8BAABPLkAATitAAEUVQABOIkAAQR1AAEUBAABUAgAARQEAAFIBAABSNkAASwEAAFZOQABJRkAATgIAAEUBAABZAgAAQQEAAFhiQABJWkAARQEAAE8CAABOAQAAWQIAAEEBAABPrkIAQ3ZAAEsBAABMmkAATIpAAEmGQABFAQAAWQEAAE8CAABSAgAARQIAAFMBAABNFkEARbpAAE4CAABJAgAAQwMAAEGxQABLtUAATwEAAEn6QABOAgAAR85AAEHJQABPAQAASe5AAEPfQABB2UAASwEAAEvhQABRAgAAVQIAAEUBAABRAgAAVQIAAEUBAABPAgAATgIAAEkCAABDCUEAUQIAAFUCAABFAQAATr9BAEFLQQBMJ0EARAEAAFQuQQBPAQAAVgIAAEE6QQBOAQAASUJBAE4BAABPAgAATgEAAEVWQQBMAgAATAEAAEliQQBUAgAAQQEAAE6DQQBBaUEARXZBAEwCAABMAQAASX5BAEUBAABZAQAAT5JBAFYCAABBAgAATgEAAFS2QQBBo0EARZ1BAFkBAABFpUEAUgIAAEUCAABMAgAATAEAAFkCAABBAQAAUmpCAEHLQQBOAQAAQ9ZBAEECAABTAQAARf5BAEXiQQBOAQAATupBAEUBAABUAgAASPZBAEEBAABUAgAAQQEAAEkfQgBBCkIATgEAAE4aQgBEFkIAQQEAAEUBAABTAQAATzpCAFQCAABIAgAAQS1CAEU2QgBBAQAAWQEAAFJGQgBJAgAAUwEAAFNSQgBFAgAAWQEAAFQCAABIAgAAQV1CAEVmQgBBAQAAWQEAAFR6QgBUAgAASQIAAEUBAABVkkIARwMAAEwCAABBAgAAUwMAAFMBAABWo0IASQIAAESdQgBFAQAAWQIAAEwCAABFAQAAUhZDAEHKQgBLvkIARQEAAFYCAABFAgAATgEAAEXmQgBB2kIATQMAAEEBAABN4kIAQQEAAFcBAABVAwAAQ/5CAEkCAABMAgAATAIAAEEBAABFAUMAUwIAAEkCAABMAgAATAIAAEEBAABVpkMAQSZDAE4CAABFAQAARDZDAEwCAABFAgAAWQEAAEs+QwBFAQAATEpDAEMCAABFAQAATlpDAEMCAABBAgAATgEAAFJ6QwBXAgAAQW5DAFICAABEAQAATwIAAE8CAABEAQAAU5JDAFQCAABJikMATgEAAFkDAABOAQAAVwIAAEECAABZAgAATgIAAEUBAABX3kMAQc5DAEm6QwBOAwAARQEAAE7CQwBFAQAAWQIAAE4CAABFAQAASQIAAEcCAABIAgAAVAEAAFkCAABMAkQAQe5DAE4BAABM+kMAQQIAAE4BAABPAgAATgEAAE4CAABBAgAAUwIAAFQCAABZAQAARTpPAEGmRABNKkQATwIAAE4BAABOLUQAUoZEAExfRABFS0QAQUJEAE4BAABOAgAARQEAAElaRABFUUQATgIAAEUBAABZAQAATnpEAEUCAABTAgAAVAMAAEkCAABOAgAARQEAAFQCAABIAgAAQQEAAFMCAABPkkQATgEAAFQCAABFnkQAUgEAAE8CAABOAQAAQsZEAEWyRABOAQAATwIAAE4CAABJw0QARQEAAFkBAABD0kQASAIAAE8BAABEp0UAQdlEAETrRABJ5kQARQEAAFkBAABF9kQATvFEAFIBAABHCkUAQQIAAFIDAABEAgAATwEAAEkmRQBFEUUAUx5FAE8CAABOAQAAVAIAAEgBAABNRkUATzZFAE4CAABEAQAAVQIAAE4CAABEAwAATwEAAE5ORQBBAQAAU2JFAEVaRQBMAQAATwIAAE4BAABVdkUAQQIAAFICAABEAgAATwEAAFeWRQBBikUAUgIAAEQDAABPAQAASQIAAE4DAABBAQAAWQIAAFQCAABIAgAARQEAAEbORQBGtkUASQIAAEUBAABSAgAAQcZFAEkCAABOAQAARQIAAE4BAABH3kUAWQIAAFACAABUAQAASRpGAEzyRQBFAgAARQIAAE4BAABTAkYATAIAAEUCAABZAQAAVAIAAEEORgBOAQAASAIAAEECAABOAQAATIZJAEFPRgBJMkYATgIAAEEtRgBFAQAATTVGAE4/RgBBAQAAWQIAAE4CAABBSUYARQEAAEJiRgBBVUYARQIAAFICAABUAQAARJ5GAEFpRgBFckYATgEAAE+CRgBOeUYAUgIAAEEBAABSAgAARY5GAEQBAABJAgAARAIAAEcCAABFAQAARfJGAEHORgBOukYATwIAAFIDAABBtUYARQEAAFPCRgBFAQAAWgIAAEECAABSAQAATuZGAEHVRgBJ2UYATwIAAFICAABBAQAAWAIAAEkCAABTAQAAR/5GAEkCAABOAQAASedHAEEfRwBNCUcAThtHAEERRwBOAgAAQQEAAFMBAABDKkcASQIAAEEBAABEMkcAQQEAAEVHRwBMOUcAWgIAAEUCAABSAQAASlJHAEECAABIAQAATmdHAEFZRwBPAgAAUgMAAEUBAABPb0cAVAEAAFOqRwBBh0cAQgIAAEUCAABUAgAASAEAAEWPRwBPAQAASKJHAEGVRwBFAgAAVgIAAEEBAABTAgAAQQEAAFm6RwBBAgAASAIAAFUBAABaAgAAQdNHAEICAABFAgAAVAIAAEgBAABFAgAAQgIAAEUCAABUAgAASAEAAExWSABB7UcARQNIAE77RwBBAQAAUgIAAFkBAABJN0gAQRpIAE4CAABBEUgATgIAAEEBAABFHUgATypIAFQDAABUAQAAUwMAAE8CAABOAQAAU05IAFcCAABPAgAAUgIAAFQCAABIAQAAWQMAAE4BAABNfkgAQV1IAEVmSABSAQAASXJIAFICAABBAQAATwMAAFICAABFAQAATpJIAEGFSABPAgAAUgIAAEEBAABP3kgARKJIAEkCAABFAQAASbJIAFMDAABBrUgARQEAAE61SABSvkgAQQEAAFXOSABJAgAAUwIAAEUBAABX2kgAWQIAAE4BAABZAQAAUupIAE8CAABZAQAAU/pIAEHxSABJAgAARQEAAFQGSQBPAgAATgEAAFY6SQBBDUkARRpJAFICAABBAQAASQIAAEEhSQBFJUkATi9JAEEBAABSNkkAQQEAAFMBAABXWkkASUZJAE4BAABPUkkATwIAAEQBAABZAgAATgEAAFl3SQBTAgAARWVJAEluSQBBAQAAUwIAAEEBAABaAgAAQX1JAEkCAABFAQAATRJLAEGvSQBMmkkARQIAAEUBAABOAwAASaFJAFUCAABFAgAATAEAAELKSQBFAgAAUgMAAEwCAABZAwAATgIAAE4BAABFHkoATO5JAEnmSQBB2UkARd1JAE4CAABFAQAAWQMAAE4BAABSAgAAQf5JAEwCAABEAQAASQdKAEUBAABTGkoATxJKAE4BAABZAgAATgEAAFkBAABJU0oATE9KAEUvSgBFAQAASUpKAEFDSgBOAgAAQT1KAE8BAABFRUoATwEAAFkBAABSAQAATeZKAEGnSgBMikoARXJKAEVlSgBJAgAARwIAAEgBAABJfkoATgIAAEUBAABZAgAATgMAAE4BAABOmkoAVQIAAEUCAABMAQAAUgIAAEkCAABFAQAARdNKAEy6SgBJAgAATgIAAEUBAABSykoAUwIAAE8CAABOAQAAVAMAAFQBAABJ4koARdlKAFQDAABUAQAAWQEAAE8KSwBH+koARQIAAE4CAABFAQAATgJLAEkBAABSAgAAWQEAAFICAABZAQAATo5LAEEZSwBFLksARAIAAEkCAABOAgAAQQEAAEk2SwBEAQAATkJLAEkCAABTAQAAT1pLAENOSwBIAQAATFZLAEEBAABTAQAAUnZLAEkCAABDaksATwEAAFECAABVAgAARQEAAFOGSwBMAgAARQIAAFkBAABaAgAATwEAAFCmSwBIAgAAUgIAAEECAABJAgAATQEAAFKKTABBu0sAUwIAAE0CAABPAQAASf5LAELSSwBFAgAAUgIAAFQCAABPAQAAQ+dLAEHZSwBI3UsASwMAAEEBAABF6UsAS/NLAEEBAABO+0sATgEAAFMBAABMHkwARQ5MAE4CAABFAQAASQIAAE4CAABEAgAAQQEAAE0mTABBAQAATl5MAEEtTABFTkwAUwIAAFQDAABJSkwATgIAAEFFTABFAQAATwEAAElWTABFAQAAUwIAAFQBAABSakwATwIAAEwBAABWdkwASQIAAE4BAABXgkwASQIAAE4BAABZAgAATgEAAFN6TQBBmkwASZVMAFUBAABFskwAUQIAAFUCAABJAgAARQIAAEwBAABNzkwARQMAAFICAABBAgAATAIAAEQCAABBAQAAUOpMAEUCAABSAgAAQQIAAE4CAABaAgAAQQEAAFMGTQBF/kwATgIAAEMCAABFAQAASQIAAEUBAABUAgAAQQ1NAEVaTQBCHk0AQQIAAE4BAABGNk0AQQIAAE4CAABJM00AQQEAAFkBAABMS00AQT1NAEwDAABBRU0ARQEAAFJNTQBWAgAAQQIAAE4BAABIZk0ARQIAAFIBAABSAgAARQIAAEwCAABMAgAAQQEAAFSuTQBIpk0AQYpNAE4BAABFnk0ATJtNAFkCAABOAQAATgEAAFkCAABMAQAAVAIAAEEBAABVCk4AR9JNAEUCAABOAgAARcFNAEkCAABByU0ARc1NAE8BAABM5k0AQQMAAEwCAABJAgAAQQEAAE72TQBJAgAAQwIAAEUBAABTAgAARQIAAEICAABJAgAATwEAAFbuTgBBU04ATCJOAFkCAABOAwAATgEAAE4DAABEMk4ARQIAAFIBAABHTk4ARQIAAEwCAABJAgAATgIAAEFJTgBFAQAAUwEAAEXTTgBMek4ASWpOAE4DAABBZU4ARQEAAFkCAABOAwAARXVOAE4BAABSx04AQY5OAFICAABEAgAATwEAAEWmTgBTmk4AVAEAAFQCAABUAwAARQEAAEzCTgBFvk4ARbFOAEkCAABHAgAASAEAAFkBAABUAQAAVAIAAFQCAABFAQAASd5OAEXZTgBOAQAATwIAAE4DAABOAgAARQEAAFf6TgBBAgAATgEAAFoCAABFLk8ASxJPAEkCAABFAgAATAEAAEwaTwBMAQAAUQIAAFUCAABJAgAARQIAAEwBAABSAgAAQQMAAEgBAABG+lMAQUZQAEJeTwBJAgAAQVJPAE4BAABPAwAATAIAAEEBAABFYU8ASX5PAEduTwBZAQAAUnZPAFkBAABUAgAASAEAAEyOTwBMAgAATwIAAE4BAABOok8ATgIAAEmeTwBFAQAAWQEAAFLeTwBBrk8ASAEAAEm2TwBTAQAAT75PAE4BAABSAgAAQcpPAEgBAABF1k8ATAIAAEwBAABJAgAAUwEAAFQKUABJ8k8ATQIAAEEDAABIAQAATwIAAFUCAABNAgAAQQIAAFQCAABBAQAAVSZQAFMCAABUAgAASSJQAE4CAABPAQAATwEAAFY2UABJAgAAQQIAAE4BAABXPlAATgEAAFkDAABFAQAARQZRAERiUABFAgAAUgIAAEkCAABDAgAATwEAAEy2UABFdlAAQwIAAEkCAABBAQAASapQAEOSUABFgVAASQIAAEGJUABUAgAAWQEAAFCaUABFAQAAU6ZQAEgCAABBAQAAWAEAAFQCAABPAgAATgEAAFICAABE0lAASQIAAE4CAABBAgAATgIAAEQBAABN3lAASQIAAE4BAABO+1AAQfZQAE4CAABEAgAAQfFQAE8BAABFAQAAUgIAAEkCAABTAQAASaJRAEQWUQBFAgAATAEAAExKUQBJNlEAQjJRAEUCAABSAgAAVAIAAE8BAABQAQAATwIAAE0CAABFAgAATgIAAEEBAABOhlEATFpRAEUCAABZAQAATgMAAEVuUQBHAgAAQQIAAE4BAABJelEAQQIAAE4BAABMAgAARQIAAFkBAABPklEATgIAAEEBAABTAgAASAIAAEUCAABSAQAATFJSAEG2UQBWAgAASQIAAE8BAABFzlEAVAIAAEMCAABIAgAARQIAAFIBAABJ2lEATgIAAFQBAABPRlIAUi9SAEHlUQBFElIATgIAAEP+UQBF9VEASQIAAE8BAABFAVIAVAIAAEkCAABOAgAATwEAAEkCAABBHlIATgEAAEQmUgBBAQAATgIAAEUBAABTPlIAUwIAAEkCAABFAQAAWQMAAEQBAABZAgAATgIAAE4BAABPnlIATmJSAEQCAABBAQAAUoZSAERpUgBFdlIAUwIAAFQBAABSAgAARQIAAFMCAABUAQAAU5ZSAFQCAABFAgAAUgEAAFiZUgBZAQAAUtZTAEEyUwBOAwAAQ/ZSAEXCUgBTAwAAQwIAAEG9UgBPAQAASNZSAEUCAABTAgAAQwIAAEEBAABJ8lIATuJSAEUBAABTAwAAQwIAAEHtUgBPAQAATwEAAEsbUwBJAlMARQEAAEwWUwBJDlMATgEAAFkCAABOAQAAWQEAAFMuUwBJAgAAUwIAAEMCAABPAQAAWgEAAEW2UwBEg1MAQT1TAEROUwBJSlMARQEAAFkBAABFZlMAUgIAAEkCAABDAwAAQWFTAEsBAABJblMAQQEAAFJ+UwBJAgAAQwMAAEsBAABZAQAARZpTAESOUwBBAQAATQIAAEECAABOAQAASaZTAEQCAABBAQAAWQIAAEGtUwBKAgAAQQEAAEkCAABEwlMAQQEAAEXOUwBEAgAAQQEAAFQCAABaAQAAVQIAAEzqUwBUAgAATwIAAE4BAABSAgAATQIAAEECAABOAQAAR15cAEHWVQBCOlQARQlUAEkWVABOAgAATwEAAFICAABJAgAARQIAAEwDAABBKVQARS1UAEwCAABBNVQARQEAAERKVABJAgAARQIAAEwBAABFYlQATFFUAFQCAABBAgAATgIAAE8BAABHalQARQEAAEl6VABHdlQARQEAAEwBAABMllQARYdUAE4BAABJAgAATAIAAEUCAABBAQAATqZUAE4CAABPAgAATgEAAFJSVQBEulQATgIAAEUCAABSAQAARcpUAFQCAABIxVQAVAEAAEbeVABJAgAARQIAAEwCAABEAQAATO5UAEECAABOAgAARAEAAE4CVQBFAgAAUvlUAFQDAABUAQAATw5VAEwCAABEAQAAUjpVAEUeVQBUAwAAVAEAAEk2VQBDKlUASwEAAFMCAABPAgAATgEAAFkBAABUQlUASAEAAFZOVQBJAgAATgEAAFkBAABTYlUAVAIAAE8CAABOAQAAVHJVAEwCAABJAgAATgEAAFV+VQBHAgAARQEAAFaaVQBFilUATgEAAEmSVQBOAQAAWQIAAE4BAABZAwAARaFVAEzGVQBBqVUARbdVAE4DAABFAQAATwIAAE69VQBSAgAARAEAAE4CAABFAgAATAIAAEwBAABFylcAQfpVAFICAABM9lUARAMAAEkCAABOAgAARQEAAFkBAABNClYAQQFWAE0CAABBAQAATo5WAEEbVgBSAgAATwEAAEVPVgBSKlYAQQIAAEwBAABTNlYASQIAAFMBAABWAgAAQT1WAEkCAABFAgAAVgIAAEUBAABJVlYARQEAAE5uVgBBZ1YAUgIAAE8BAABJAgAARQEAAE+DVgBWAgAARQIAAFYCAABBAQAAVAIAAFICAABZAQAATxZXAEamVgBGAgAAUgIAAEUCAABZAQAAUv5WAEcCAABF11YAQb5WAE4CAABOAQAATsZWAEUBAABUAgAAVAIAAEHRVgBFAQAASQIAAEHvVgBOAgAAQeVWAE4CAABBAQAARfFWAE4CAABB+VYARQEAAFYCAABBAgAATgIAAE4CAABJEVcAWQEAAFICAABBSlcATD5XAEQ3VwBJMlcATgIAAEUBAABPAQAAWQIAAE4BAABSAgAARAMAAE8BAABIWlcAQQIAAFICAABEAQAASV1XAE12VwBBAgAASXJXAE4CAABFAQAATgEAAE+SVwBMglcARAEAAE4CAABJAgAATQIAAE8BAABSolcASZ9XAFQBAABZAQAAU65XAE8CAABOAQAAVAIAAEm6VwBFAQAAUgIAAFUCAABEAgAARQEAAElGWQBBJ1gARNpXAEEBAABOE1gAQeFXAEP2VwBBAgAAUgIAAEwCAABPAQAATAZYAFUCAABDAgAAQQEAAE4CAABBDVgASQEAAFYCAABBAgAATgIAAE4CAABBAQAAQjZYAFMCAABPAgAATgEAAERGWABFAgAATwIAAE4BAABHTlgASQEAAEyHWABCZlgARQIAAFICAABUAwAATwEAAERuWABBAQAARXZYAFMBAABMAgAASQIAAEECAABOAQAATqZYAEGNWABHmlgARQIAAFIBAABOolgAWQEAAE8BAABPylgAVgIAAEECAABOAgAASblYAE4CAABBwVgAScVYAFkBAABT+lgAReZYAEwCAABB2VgARd1YAEwCAABFAQAAUwIAAEUCAABMAwAATAIAAEUBAABUBlkAVAIAAFkBAABVMlkATB5ZAEkCAABBAwAATgIAAEEBAABTAgAARQIAAFACAABQAgAARQEAAFoCAABFAgAATAIAAEwCAABFAQAATMpZAEFiWQBEAgAASVpZAFMBAABZAgAAUwEAAEWSWQBOAwAARIJZAEFxWQBPAgAATnlZAFICAABBAQAATgMAAEGJWQBJAgAAUwEAAEmiWQBOAgAARAIAAEEBAABPtlkAUgIAAEmyWQBBAQAAWQEAAFkCAABOAgAARMZZAEEBAABOAQAATypaAETiWQBGAgAAUgIAAEUCAABZAQAATP5ZAEQCAABB7VkARfZZAE4BAABJAgAARQEAAE4SWgBaAgAAQQIAAEwCAABPAQAAUgIAAEQiWgBPAgAATgEAAEcCAABFAQAAUoJbAEHSWgBDaloARVNaAExKWgBZAgAATgMAAE4BAABOTVoAWQEAAEliWgBFAwAATAIAAEEBAABZAgAATgEAAERyWgBZAQAARX5aAE0CAABFAQAASIpaAEECAABNAQAATqZaAFSRWgBWAgAASQIAAEwCAABMAgAARQEAAFkDAABDsloARQEAAES+WgBPAgAATgEAAFMCAABFyloATgEAAE8CAABOAQAARUpbAEPiWgBJAgAAQQEAAEXqWgBSAQAARxNbAEf/WgBPAgAAUgIAAFkBAABPAgAAUgIAAEkOWwBPAQAAWQEAAFQyWwBBGVsAQypbAEgCAABFAgAATgEAAFQCAABBAQAAWQMAAFMCAABFQlsATgEAAE8CAABOAQAASXJbAEZeWwBGAgAASQIAAE4BAABTAgAARQIAAEwCAABEAgAAQQEAAE8CAABWAgAARQIAAFIBAABVHlwAQaJbAEQCAABBAgAATAIAAFUCAABQAgAARQEAAEneWwBErlsATwEAAEzGWwBMAgAARQIAAFICAABNAgAATwEAAE4CAABFAgAAVgIAAEUCAABSAgAARQEAAE72WwBOAgAAQe5bAFIBAABFAgAAUgEAAFMbXABTBlwASQIAAEUBAABUAgAAQQIAAFYDAABFFVwATwEAAFkBAABXAgAARUpcAE4DAABEPlwATwIAAEwCAABZAgAATgEAAFkCAABUAgAASAEAAFkCAABOAwAARQIAAFQCAABIAQAASCZjAEEuXwBEplwAQX5cAFMCAABTAgAAQQIAAEgBAABFhlwATgEAAEmJXABMAgAARQIAAEWVXABJolwARwIAAEgBAABZAQAARrJcAFMCAABBAQAAR75cAEUCAABOAQAASQJdAETWXABFzlwATgEAAFkCAABOAQAATPJcAEXmXABF4VwAWQEAAEnuXABFAQAAWQEAAFMCAABMAgAARQIAAFkBAABLGl0ARRJdAEUCAABNAQAASQIAAE0BAABMV10ARTZdAEUlXQBJMl0ARwIAAEgBAABZAQAAST9dAEUBAABMUl0ARUtdAFkBAABJAgAARQEAAE8BAABNhl0ASW5dAEwCAABUAgAATwIAAE4BAABQfl0AVAIAAE8CAABOAQAAWgIAAEEBAABOql0AQY1dAEuRXQBOnl0AQQMAAEgBAABTAwAARQIAAEwBAABSdl4ARLZdAFkBAABM9l0AQcZdAE4DAABEAQAAReZdAEXNXQBJ2l0ARwIAAEgBAABN3V0ATuFdAFkBAABJ7l0ARQEAAE8CAABXAQAATQ5eAE8CAABOAwAASQteAEUBAABZAQAATxpeAEwCAABEAQAAUCZeAEUCAABSAQAAUlpeAEU2XgBMAgAATAEAAElWXgBFSl4AVAMAAFQDAABFAQAAUwMAAE8CAABOAQAAWQEAAFRqXgBMAgAARQIAAFkBAABWAgAARQIAAFkBAABTnl4AQYJeAE4BAABLkl4ARQIAAEwCAABMAQAAUwIAAEECAABOAQAAVK5eAFQCAABJAgAARQEAAFa6XgBFAgAATgEAAFkWXwBEzl4ARQIAAEXJXgBOAQAARdZeAFMBAABM+l4ARfJeAEXhXgBJ7l4ARwIAAEgBAABZAQAASQIAAEUBAABXAgAAQQpfAFICAABEAQAATwIAAE8CAABEAQAAWgIAAEUmXwBMIV8ATgEAAEwCAABFAQAARdZgAEFaXwBURl8ASAMAAEUCAABSAQAAVgIAAEUCAABOAwAATAIAAFkBAABCZl8ARQIAAFIBAABDdl8AVAIAAE8CAABSAQAARIpfAFeGXwBJAgAARwEAAFkBAABJml8ARAIAAEmVXwBZAQAATLpfAEWuXwBOAwAAQalfAEUBAABMAgAARQIAAE4BAABODmAAROJfAEXWXwBSAgAAUwIAAE8CAABOAQAAUgIAAEkCAABYAQAATO5fAEUCAABZAQAAUgIAAEkLYABFBmAAVAIAAFQCAABBAQAASwEAAFkBAABSnmAAQiJgAEUCAABSAgAAVAEAAEk6YABCAgAARQIAAFICAABUAgAATwEAAExOYABJAgAATgIAAEQCAABBAQAATXJgAEFaYABOAQAASWpgAE4CAABJAgAAQQEAAE8CAABOAQAATn5gAEECAABOAQAAUwIAAEOSYABIAgAARQIAAEwBAABIAgAARQIAAEwBAABTrmAAVAIAAEUCAABSAQAAVL5gAFQCAABJAgAARQEAAFoCAABFAgAASwIAAEkCAABBAgAASAEAAElSYQBMRmEAQfJgAFICAABJ7mAATwEAAFkBAABEHmEAQflgAEUSYQBHAgAAQQIAAFICAABEAgAARQEAAFICAABFAgAARAEAAEwyYQBBAgAAUgIAAEQtYQBZAQAATTphAEEBAABUAgAATwIAAE4BAABSAgAAQQIAAE0BAABPXmIAQnJhAEFmYQBSAgAAVAEAAEUCAABSAgAAVAEAAEyqYQBEgmEARQIAAE4BAABMAgAAQZJhAE4CAABEAQAARZphAFkBAABJp2EARaFhAFMBAABZAQAATbphAEUCAABSAwAATwEAAE7aYQBF0mEAU85hAFQCAABZAQAAWQEAAE8CAABSAQAAUOJhAEUBAABSGmIAQfphAEMCAABF8WEASQIAAE8BAABUAgAARQIAAE4CAABDEmIASQIAAEEBAABTAgAARQEAAFMmYgBFAgAAQQEAAFU6YgBTAgAAVAIAAE8CAABOAQAAV1ZiAEFKYgBSAgAARAEAAEUCAABMAgAATAEAAFkCAABUAQAAVQpjAEJyYgBFAgAAUgIAAFQBAABEgmIAUwIAAE8CAABOAQAARYpiAFkBAABHlmIASJFiAE8BAABMomIARAIAAEEBAABNumIAQgIAAEUCAABSAgAAVAIAAE8BAABOymIAVAIAAEUCAABSAQAAUtpiAEwCAABFAgAAWQEAAFP6YgBT7mIARQIAAEkCAABOAQAAVAIAAE8CAABOAQAAWAIAAEwCAABFAgAAWQEAAFkCAABNGmMAQQIAAE4BAABSAgAAVQIAAE0BAABJcmcAQTpjAEk2YwBOAQAATgEAAEJSYwBSAgAAQQIAAEgCAABJAgAATQEAAESCYwBBZ2MATAIAAEkCAABBAQAARXZjAEwCAABMAwAAQQEAAFICAABJAgAAUwEAAEWSYwBTAgAASAIAAEEBAABHumMATgIAAEECAABDqmMASQIAAE8BAABUAgAASQIAAFUCAABTAQAAS8ZjAEUDAABSAQAATBJkAEHXYwBOAwAAQQEAAEXuYwBB5mMATgIAAEEBAABOAgAARQEAAEn+YwBBAgAATgIAAEEBAABPCmQATgIAAEEBAABTAgAARQEAAE1yZABBK2QATiNkAEkBAABSAgAASQEAAEU6ZABMAgAARAIAAEEBAABNUmQAQQIAAE4CAABVAgAARQIAAEwBAABPZmQARwIAAEUCAABOAwAARQEAAFICAABBAgAATgEAAE7mZABBi2QAUoJkAEEBAABZAgAAQQEAAES2ZABJsmQAQZ9kAE4CAABBAQAARaFkAEeqZABPAQAAUgIAAEEBAABZAQAARcJkAFO9ZABaAQAARtJkAEECAABOAgAAVAEAAEcCAABB2WQAUgIAAEkCAABEAQAAT/5kAEzyZABBAQAATgIAAEH5ZABFAQAAUlJlAEEFZQBFImUATBplAEECAABOAgAARAEAAE4CAABFAQAASS5lAEUpZQBTAQAATTZlAEEBAABWRmUASQIAAE4DAABHAQAAVwIAAEkCAABOAQAAU25mAEG/ZQBBZmUAQ2FlAEsBAABCgmUARQIAAEwDAABBdWUATAMAAEF9ZQBFAQAAQ4VlAESaZQBPAgAAUgIAAEGVZQBFAQAARaJlAEwBAABJs2UAQQIAAEitZQBTAQAATQIAAEECAABSAQAARcplAEwCAABBAQAASO5lAEHfZQBB2mUATgEAAE4BAABNAgAAQQIAAEUCAABMAQAASRZmAEH6ZQBIAQAARBJmAE8KZgBSAgAARQEAAFICAABPAQAAUwEAAEweZgBBAQAATTZmAEECAABFLmYATAEAAEkCAABMAQAAT0ZmAEICAABFAgAATAEAAFJiZgBBVmYARQIAAEwBAABFAgAAQQIAAEwBAABTAgAAQQMAAEMBAABUomYAQYJmAEwCAABJAgAAQQEAAFoCAABBmmYAWQIAAEECAABOAgAAQQEAAEUCAABMAQAAVvJmAEG7ZgBOAwAAQbFmAE4CAABBAQAARc5mAFTKZgBUAgAARQEAAFkBAABJ1mYARQEAAE/uZgBO5mYATgIAAEUBAABSAgAAWQEAAFkBAABZEmcAQQpnAE4CAABBAWcATgIAAEEBAABMAgAAQQEAAFoCAABBVmcAQSZnAEMhZwBLAQAAQj5nAEUCAABMAwAATAIAAEE5ZwBFAQAASUpnAEECAABIAQAAWQIAAEECAABIAQAAWgIAAEECAABCAgAARQIAAEwCAABMAgAAQQEAAErydwBBqm4AQopnAEECAABSAgAASQEAAEOqaABBpmcATJ5nAFkCAABOAQAAUgIAAEkBAABFv2cATLZnAFkCAABOAQAATrlnAFkBAABJ32cARcVnAE4CAABE0mcAQQEAAFQCAABB2WcATwEAAEsnaABF/mcATAIAAEn2ZwBOAgAARQEAAFkCAABOAQAASQdoAEUBAABMFmgAWQIAAE4DAABOAQAAUyJoAE8CAABOAQAAWQEAAEw2aABZAgAATgMAAE4BAABPSmgAQgMAAElBaABPRWgAWQEAAFGmaABVAgAAQWZoAEwCAABJAgAATgIAAEUBAABFj2gATIpoAEl6aABOAwAARQEAAFkCAABOAwAARYVoAE4BAABTAQAATAIAAEmeaABOAgAARQEAAFkCAABOAQAAWQEAAETXaABBsWgARbtoAE4BAABJxmgARQIAAEwBAABPzmgATgEAAFkCAABOAQAARQdpAETyaABB4WgARepoAE4BAABZAgAATgEAAEwDAABB+WgAWQIAAE4DAABOAQAARxZpAEcCAABFAgAAUgEAAEhGaQBFJmkASQIAAE0BAABJLmkAUgEAAEw6aQBJAgAATAEAAE0CAABJAgAAUgEAAEmnaQBEYmkAQVFpAEVaaQBOAQAAWQIAAE4BAABMgmkAQWlpAEV2aQBOAgAARQEAAFkCAABOAwAATgEAAE2WaQBFj2kARQEAAEkCAABFAQAAUgMAAE+daQBVAgAAUwEAAEq2aQBVAgAAQQIAAE4BAABL8mkAQdZpAEnBaQBSymkASQEAAFkCAABMAgAAQQEAAEXZaQBP6mkAQgMAAEXlaQBJAQAAVQIAAEIBAABMTmoARRZqAEECagBIAQAARRJqAEwJagBTAgAAQQEAAE4BAABJOmoATB1qAFMuagBBJWoAUwIAAEEBAABZAgAAQQIAAEgBAABPQmoATgEAAFkCAABOAwAATgEAAE32agBBfmoAQV5qAEwBAABMYWoAUgMAAENyagBVAgAAUwEAAEkDAABPAgAATgEAAEWfagBFi2oATAEAAEyNagBTm2oATwIAAE4BAABZAQAASdtqAEGragBIAQAARa1qAEy7agBBAwAASAEAAE69agBSwWoAU85qAE8CAABOAQAAWQIAAEEDAABIAQAATeZqAEkCAABFAQAAT+5qAE4BAABZAgAAQQEAAE7LawBBD2sARQFrAEkFawBZAwAAQQEAAEVXawBFG2sATgEAAEwrawBMAwAARSVrAFkBAABOMmsARQEAAFM+awBTAgAAQQEAAFRTawBIRWsAVAMAAEFNawBFAQAAWQEAAEmSawBBY2sASAEAAENqawBFAQAARXdrAEMCAABFAQAAToJrAEF9awBFAQAAU4VrAFkCAABBAwAASAEAAE62awBBn2sASAEAAEWuawBUAwAAVAIAAEUBAABJAgAARQEAAFPCawBFAgAATgEAAFkCAABBAQAAUfZrAFUCAABB2msATgEAAEUCAABMAgAASe5rAE4DAABFAQAAWQIAAE4BAABSUmwARRZsAEQBbABMCmwATAEAAE4NbABUAwAAVAEAAE8ibABEHWwATgEAAFJGbABFPmwARC1sAEw2bABMAQAAVAMAAFQBAABPAgAARAEAAFYCAABJAgAAUwEAAFPKbABFX2wATgEAAEhubABBAgAAVwIAAE4BAABJgmwAQXpsAEgBAABFAgAATAEAAEyabABFkmwATgIAAEUBAABZAgAATgEAAE22bABJqmwATgMAAEUBAABZAgAATgMAAEUBAABPvmwATgEAAFACAABFAgAAUgEAAFXebABOAgAASQIAAFQCAABBAQAAViJtAEHqbABOAQAARfJsAE4BAABJEm0AQf5sAE4BAABFBm0AUgEAAE4JbQBPAgAATgEAAE8CAABOAwAAVAIAAEUBAABYW20ARS5tAE4BAABPNm0ATgEAAFNCbQBPAgAATgEAAFRObQBPAgAATgEAAFgDAABPAgAATgEAAFk/bgBBYW0AQ4ZtAEV3bQBFbW0ATwIAAE4BAABJfm0ARQEAAE8CAABCAQAARKptAEGTbQBOAQAARZttAE4BAABJom0ATgEAAE8CAABOAQAARa1tAEzybQBBw20ASLltAE4DAABJAQAARdZtAEXPbQBOAQAATgMAAEUBAABJ3m0ATgEAAE/mbQBOAQAAWQIAAE4DAABOAQAATQZuAEX/bQBTAQAASQIAAEUBAABOEm4AQQ1uAEUBAABTJm4ARR5uAE4BAABPAgAATgEAAFYCAABJNm4ATwIAAE4BAABPAgAATgEAAFoCAABFUm4ATAIAAEwCAABFAQAASV5uAEUCAABMAQAATG5uAFkCAABOAwAATgEAAE2KbgBJfm4ATgMAAEUBAABZAgAATgMAAEUBAABaAgAATJpuAFkCAABOAQAATQIAAEkCAABOAgAARQEAAEVKcgBBIm8ATgMAAEG5bgBF124ATsZuAEUBAABUAgAAVAIAAEHRbgBFAQAASeZuAEXdbgBOAgAARQEAAE36bgBBAgAAUgIAAEkCAABFAQAATgIAAEEBbwBFE28AVAIAAFQCAABFAQAASQIAAEUZbwBOAgAARQEAAEIlbwBEU28ART5vAEQCAABJAgAAQQIAAEgBAABJAgAARAIAAEkCAABBAgAASAEAAEaKbwBGAwAARXpvAFICAABFam8AWQEAAFN2bwBPAgAATgEAAFkBAABSAgAARYZvAFkBAABZAQAATJpvAEECAABOAgAASQEAAE2mbwBNAgAAQQEAAE5acABBs28ARQEAAEXWbwBMwm8ATAMAAEUBAABTAgAASc5vAFMBAABTAgAAQQEAAEn7bwBG8m8AReZvAFIBAABGAgAARQIAAFIBAABTAgAARQEAAE5GcABBB3AASAEAAEUWcABUAgAAVAIAAEUBAABJQ3AARR1wAEY2cABFKnAAUgEAAEYCAABFAgAAUgEAAE4CAABHAgAAUwEAAFkBAABTAwAARVJwAE4BAABPAgAATgEAAFKCcQBBknAARGVwAEx6cABEAwAASQIAAE4CAABFAQAATQIAAEmOcABBinAASAEAAEUBAABZAQAARcNwAESZcABMnXAATQIAAEWqcABZAQAASb5wAEG6cABItXAAUwEAAEUBAABZAQAASftwAEHOcABIAQAAQ95wAEHVcABIAgAATwEAAEzqcABZAgAATgEAAE0CAABJAgAAQQIAAEgBAABNInEAQQ5xAEkCAABOAgAARQEAAEUWcQBZAQAASQIAAEECAABIAQAAT0JxAEQpcQBMMnEARAEAAE0+cQBFOXEAWQEAAE4BAABSdnEARVJxAEwDAABMAQAASWNxAENecQBBAQAARQEAAE9ycQBEaXEATAIAAEQBAABZAQAAUwIAAEUCAABZAQAAUxJyAEWWcQBOAgAASQIAAEEBAABIonEAVQIAAEEBAABJtnEAQa5xAEgBAABDAgAAQQEAAFMLcgBBy3EATAIAAFkCAABOAQAARdtxAE4CAABJAgAAQQEAAEn7cQBB5nEASAEAAEPucQBBAQAARfFxAEsCAABBAQAATAZyAFkCAABOAQAAWQEAAFUCAABTAQAAVC9yAEgicgBSAgAATwEAAFQDAABJAgAARQEAAFY6cgBPAgAATgEAAFcCAABFAgAATAMAAEwBAABIVnIATwIAAE4BAABJ1nIAQWpyAE4CAABOAgAAQQEAAEx+cgBMAwAASQIAAEECAABOAQAATZ9yAEWOcgBOAgAAQQEAAE0CAABJmnIARQEAAFkBAABPtnIAVgIAAEECAABOAgAATgIAAEkBAABSwnIARQIAAEgBAABTAgAARQIAAEwCAABMAgAARQEAAE8/dgBBCnMATvtyAEHlcgBJ7nIARQEAAE4DAABB9XIARQEAAFECAABVAgAASQIAAE4BAABCDXMAQzJzAEUCAABMAgAASSJzAE4BAABZAgAATgMAAEUtcwBOAQAAREpzAEU+cwBFAQAASUdzAEUBAABZAQAARYtzAExjcwBMAgAAQVlzAEUDAABOAQAAU3pzAEVycwBQAgAASAEAAFACAABIAQAAVIZzAFQCAABBAQAAWQEAAEgSdABBpnMATgMAAEGZcwBOAwAAQQMAAEgBAABOAwAAQcdzAFQCAABIAgAAQb5zAE4BAABPAgAATgEAAEXWcwBUAgAAVAIAAEEBAABJ3nMARQEAAE7ycwBB5XMASe5zAEUBAABZAQAAUAJ0AEECAABVAgAATAEAAFMOdABPAgAATgEAAFkBAABJG3QARQEAAExGdABFMnQARSt0AE4BAABOAgAARQEAAEk6dABFAQAAWQIAAE4CAABOAQAATqN0AEF2dABIUXQAU1V0AFQCAABBYnQATgEAAEgCAABBbnQATgEAAE8CAABOAQAARYp0AEyGdABMAwAARQEAAFMBAABJjXQATgIAAEGVdABJnnQARQEAAFkBAABS8nQARNp0AEG2dABOAwAAQQEAAEW+dABOAQAAScd0AE4BAABPznQATgEAAFkDAABOAwAATgEAAEfidABFAQAASeV0AErudABBAQAAWQEAAFOqdQBFW3UARg91AEEBdQBJAgAATgIAAEEBAABMMnUASR51AE4DAABFAQAAVSp1AEkCAABTAQAAWQIAAE4BAABQSnUASAMAAEkCAABOAgAAQUV1AEUBAABUVnUAVAIAAEUBAABZAQAASGt1AFUCAABBAwAASAEAAEl+dQBBenUASHV1AFMBAABFAQAATI51AFkCAABOAwAATgEAAFOidQBFAgAATAIAAFkCAABOAQAAVQIAAEUBAABV1nUAUgIAAES+dQBBAgAATgEAAE4CAABFznUARcl1AFkBAABJAwAARQEAAFYSdgBB+nUATgMAAEnldQBO9nUAQe11AEnxdQBZAQAAWQEAAEkLdgBFAXYAVAIAAEEBAABPAgAATgEAAFkvdgBDKnYARQMAAEwCAABZAgAATgEAAEUBAABaAgAASQIAAEECAABIAQAAUk52AEUCAABBAgAATQEAAFUCAABBgnYATgMAAEFddgBDdnYAQQIAAFICAABMAgAATwIAAFMBAABJAgAAVAIAAEEBAABClnYASQIAAEwCAABFAgAARQEAAETSdgBBonYASAEAAESldgBFqXYAR7J2AEUBAABJw3YARbl2AFQCAABIAQAAU852AE8CAABOAQAAWQEAAEXedgBMAgAAWgEAAExmdwBF73YARel2AFMBAABJV3cAQQt3AE4DAABB/XYATgMAAEEFdwBFAQAARTt3AEEadwBOAgAATgEAAE4ndwBOAgAARQEAAFQDAABBLXcAVAIAAEE1dwBFAQAATz13AFNOdwBBRXcAUwIAAEEBAABVAgAAUwEAAEwCAABJAgAAQQIAAE4BAABOjncARW13AEkCAABPencAUgEAAFCGdwBFAgAAUgEAAFUCAABTAQAAUp53AE4CAABFAgAARQEAAFPmdwBUAgAARa53AE4BAABJxncAQ7p3AEUBAABOAwAAQcF3AEUBAABPzncATgEAAFXWdwBTAQAAWQIAAEPidwBFAQAATgEAAFcCAABBAgAATgEAAEtGiABBjn4AQgZ4AEkCAABSAQAAQyJ4AEUXeABFEXgAWQEAAEkfeABFAQAAWQEAAERSeABFP3gARTJ4AE0BAABOAwAAQwIAAEUBAABJSngARUV4AE4BAABZAwAATgEAAEV+eABEYngARQIAAE4BAABMAwAAQWl4AElzeABOAQAAWQIAAE4DAABOAQAASI54AEwCAABJAgAATAEAAElTeQBBlXgARLJ4AEWqeABOAwAAQwIAAEUBAABZAgAATgEAAEzqeABBw3gATgIAAEkBAABF2ngARcl4AEnWeABHAgAASAEAAFkBAABJ3XgAWQMAAE4DAABOAQAATvt4AEXxeABPAgAAQQEAAFIKeQBBAXkASQV5AE8BAABTLnkARRp5AE4VeQBSAQAATCZ5AEUCAABZAQAATwIAAE4BAABUSnkATAIAAEk+eQBOAQAAWQIAAE4DAABOAQAAWQIAAEEBAABM7nkAQWN5AE4CAABJAQAARZN5AEFveQBIAQAAQnF5AEV1eQBJgnkARwIAAEgBAABMhXkATo95AEEBAABZAQAAScN5AEGfeQBIAQAARaF5AE6reQBBAQAAU7Z5AFQCAABBAQAAWQIAAEECAABIAQAATNZ5AEXOeQBOAQAASQMAAEUBAABW4nkASQIAAE4BAABZAgAATgMAAE4BAABNmnoAQQ56AEz5eQBSAgAASQMAAEEFegBPAgAATgEAAEQiegBFGnoATgEAAFkCAABOAQAARTp6AFICAABPMnoATgEAAFkCAABOAQAASWN6AExXegBBS3oASAEAAEwCAABBUXoARQEAAFkCAABBAwAASAEAAE9uegBSAgAAQQEAAFKSegBBenoATgEAAEWCegBOAQAAT4p6AE4BAABZAgAATgEAAFkCAABBAQAATu56AETCegBBrnoAQwIAAEUBAABJv3oAQ7p6AEUBAABTAQAAWQEAAEXFegBJ4noAU9Z6AEgCAABBAQAAWQIAAEEDAABIAQAATgIAAE8CAABOAQAAUv57AEH/egBI+XoATgEAAEUeewBFCnsATQEAAEwSewBZAQAATht7AEEBAABZAQAASUd7AEUlewBNL3sARQEAAE43ewBBAQAAUwMAAEE9ewBTAgAAQQEAAEyDewBBTXsARXJ7AEVbewBOAQAASWZ7AEcCAABIAQAATm57AEUBAABZAQAASXt7AEUBAABZAwAATgEAAE2SewBBiXsARQIAAE4BAABPtnsATLN7AEmqewBOAgAAQaV7AEUBAABZAgAATgEAAE4BAABSwnsASQMAAEUBAABT6nsARc57AE4BAABP1nsATgEAAFTiewBFAgAATgEAAFkCAABOAQAAVPZ7AEUCAABSAQAAWQMAAE4BAABTanwAQRZ8AE4CAABEAgAAUgIAAEEBAABFI3wATh18AFkBAABIM3wAVAIAAE8CAABOAQAASTt8AEUBAABPQnwATgEAAFMCAABBWnwATgIAAEQCAABSAgAAQQEAAEkCAABEZnwAWQEAAEUBAABUtn0AQZ58AEyOfABFgnwAWQIAAEEBAABJAgAATgIAAEEBAABSAgAASQIAAE4CAABBAQAARc98AEy6fABJrnwATgEAAFkCAABOAwAATgEAAFLKfABJAwAATgIAAEEBAABZAQAASGZ9AEH2fABM5nwARQIAAEUCAABOAQAAUgIAAEkCAABOAgAARQEAAEUWfQBSAgAASQp9AE4DAABFAQAATg19AFkCAABOAQAASR99AEUBAABMPn0ARTZ9AEUufQBOAQAATgIAAEUBAABZAgAATgEAAFJafQBJTn0ATgIAAEUBAABZAgAATgMAAEUBAABZAwAAUgIAAE4BAABJe30AQW19AEVxfQBOAgAAQQEAAEySfQBJhn0ATgEAAFkCAABOAwAATgEAAFKifQBJAgAATgIAAEEBAABUrn0ASQIAAEUBAABZAwAAQQEAAFbKfQBJwn0ATgEAAE8CAABOAQAAWQMAAEHRfQBD5n0ARd99AEUBAABJAgAARQEAAET+fQBFAgAARfF9AE4DAABDAgAARQEAAEUBfgBMWn4AQRd+AEgNfgBOAwAASQEAAEVDfgBBHX4AQiF+AEUrfgBOAQAASTZ+AEcCAABIAQAATj9+AEUBAABZAQAASU9+AEVJfgBOAQAAWQIAAE4DAABOAQAATmJ+AEUBAABTdn4ARW5+AE4BAABPAgAATgEAAFQCAABMAgAASYZ+AE4BAABZAgAATgEAAEORfgBFWoIAQdp+AEemfgBBAgAATgEAAE7GfgBBrX4ARLp+AFICAABFAQAATsJ+AEEBAABVAQAAUs5+AEEBAABUAgAATwIAAE4BAABD5n4ASQIAAEEBAABFJn8AR/Z+AEECAABOAQAATA5/AEECfwBOAQAARQp/AFkBAABZAQAAThp/AEEDAABOAQAAUwIAAEgCAABBAQAARzJ/AEECAABOAQAASEZ/AEwCAABBAgAATgIAAEkBAABJgn8ATF5/AEFbfwBOAgAASQEAAFkBAABPZn8ATgEAAFJufwBBAQAAU3p/AEgCAABBAQAAVAIAAEgBAABMDoAAQo5/AFkBAABDon8ARZp/AFkBAABJAwAARQEAAEmrfwBTAQAATNp/AEG2fwBOAQAARct/AEW9fwBOwX8AUsV/AFkBAABJ038ARQEAAFkDAABFAQAAU/Z/AEXqfwBB5X8AWQEAAEnzfwBFAQAAWQEAAFQCgABPAgAATgEAAFYCAABJAgAATgEAAE43gQBBGoAATgEAAERSgABBK4AATAMAAEwBAABFNoAATAIAAEwBAABSSoAAQT2AAEkCAABDAwAASwEAAFkCAABMAQAASWaAAEFZgABTAgAASAIAAEEBAABKboAASQEAAEx6gABFAgAAWQEAAE62gABBi4AAUgIAAEQBAABFpoAARJqAAEmVgABZAQAAVKKAAEgBAABZAQAASbKAAFQCAABIAQAAWQEAAFPegABJ0oAATgIAAEcCAABUAgAATwIAAE4BAABMAgAARQIAAFkBAABU+4AAT+qAAE4BAABSAgAARQIAAEwCAABMAQAAWSaBAEEPgQBUAgAAVAIAAEEBAABFHoEAVAIAAFQCAABBAQAATwIAAE4BAABaAgAASTOBAEUBAABPAQAAT0aBAE4DAABBQYEASQEAAFKegQBBTYEARVaBAE4BAABJWYEATWaBAEkCAABUAQAAUoKBAEl/gQBFcYEARwIAAEECAABOAQAAWQEAAFOSgQBUAgAASQIAAE4BAABXAgAASQIAAE4BAABTwoEASAIAAEG7gQBVsoEATgEAAFcCAABOAQAASQIAAEEBAABU1oEAVQIAAFICAABBAgAASAEAAFYCggBB4oEATgEAAEXqgQBOAQAASfKBAE4BAABP+oEATgEAAFkCAABOAQAAWUqCAEEaggBOAgAAQRGCAE4CAABBAQAATCKCAEEBAABPNoIATgMAAEEtggBOAgAAQQEAAFMCAABIAgAAQQIAAFcCAABOAQAAWgIAAEkCAABBAwAASAEAAEgCgwBBxoIARHaCAEkCAABKAgAAQQMAAEgBAABJeYIATK6CAEGKggBOAgAASQEAAEWeggBEkYIARQIAAFMCAABJAQAASQIAAEGlggBEqYIATAEAAE2+ggBBAgAAUgIAAEkBAABSAgAASQEAAEzSggBPAgAARQEAAFICAABJAgAAUwIAAFQCAABJ7oIAQQIAAE4BAABPAgAAUAIAAEgCAABFAgAAUgEAAEkChQBBN4MAQRKDAE4BAABIFYMATieDAEEdgwBOAgAAQQEAAFICAABBLYMAUgIAAEEBAABFkoMATD2DAFJ+gwBBS4MATgEAAE5WgwBBAgAATgEAAFJegwBBAQAAUwIAAFQCAABFboMATgEAAEl2gwBOAQAAWQIAAE4BAABTioMASAIAAEEBAABUAgAASAEAAEy6gwBFnoMAWQEAAEmqgwBBAgAATgEAAEwCAABJAgAAQQIAAE4BAABND4QAQcqDAE4CAABJAQAAQgKEAEUCAABSAwAAReKDAEwCAABZAQAATAIAAEXygwBF7YMAWQEAAEn7gwBFAQAAWQMAAE4BAABPAgAAUgIAAEEBAABOeoQARB6EAFICAABBAQAARz+EAFMCAABMMoQARQIAAFkBAABUAgAATwIAAE4BAABMToQARQIAAEVJhABZAQAAU2qEAEVahABZAQAATAIAAEUCAABFZYQAWQEAAFoCAABMAgAARQIAAFkBAABQg4QAUAEAAFLKhABBj4QATgEAAEKWhABZAQAAS5mEAFKihABBAQAAU8aEAFQCAABFsoQATgEAAEm+hABFuYQATgEAAFkCAABOAQAAVAEAAFPWhABIAgAAQQEAAFTrhABUAgAASeaEAEUBAABZAQAAWfaEAEEDAABIAQAAWgIAAFoCAABZAQAATDqFAEEyhQBSIoUAQRGFAEkCAABTAgAAUwIAAEEBAABZAgAAVAIAAE8CAABOAQAATwIAAEUBAABOXoUATwIAAFdahQBMAgAARQIAAEQCAABHAgAARQEAAFgBAABPYoYAQWWFAEJ2hQBFbYUASXGFAFkBAABEioUAQX2FAEmHhQBFAQAAWQEAAEWShQBOAQAASJ6FAEUCAABOAQAATM6FAEKqhQBZAQAARa2FAEy6hQBJAgAATgEAAFQDAABFxoUATgEAAE8CAABOAQAATvKFAE7mhQBF3oUAUgEAAE8CAABSAQAAUgIAAEECAABEAQAATwKGAFACAABFAgAAUgEAAFJKhgBBCYYAQh6GAEkWhgBOAQAAWQIAAE4BAABFJoYAWQEAAEk3hgBFLYYATgIAAEEBAABURoYATgIAAEUCAABZAQAAWQEAAFUCAABSAgAAVAIAAE4CAABFAgAAWQEAAFI6hwBBcoYASQIAAEcBAABFeoYAVwEAAEkChwBTAwAASJOGAEGJhgBOAgAAQQEAAFQCAABBo4YATJ2GAE4BAABFroYATKmGAE4BAABJz4YAQb6GAE4DAABBAQAARcGGAE4DAABByYYARQEAAE/6hgBG6oYARd6GAFIBAABGAgAARQIAAFIBAABQAgAASAIAAEUCAABSAQAAWQMAAE4BAABVCocAWgEAAFkCAABTAgAAVAIAAEEfhwBMAQAARSaHAE4BAABJMocATgMAAEEBAABMAgAARQEAAFVOhwBSAgAAVAMAAEkCAABTAQAAV16HAEECAABNAgAARQEAAFkCAABBd4cASGmHAE5thwBSAgAAQQEAAEV5hwBMwocAQY+HAEiFhwBOiYcAUgEAAEWrhwBFlYcASaKHAEcCAABIAQAATqWHAFIBAABJvocAQbaHAE4BAABFuYcATgEAAE8BAABN5ocAQdKHAE4CAABJAQAAQgIAAEUCAABSAgAATAIAAFkBAABODogARAKIAEH6hwBMAwAATAEAAFICAABBAQAATAIAAEUCAABFAQAAUjqIAEEfiABIGYgATgEAAEUqiABFJYgATgEAAEkyiABFAQAATwMAAE4BAABTAgAATwIAAE4BAABMVpcAQYaNAEOKiABFXogARVmIAFkBAABIfogARXKIAEwCAABMAgAARQEAAEwCAABBAgAATgEAAEmHiABFAQAAWQEAAESyiABBoogAUgIAAEkCAABVAgAAUwEAAE8CAABOAgAATgIAAEEBAABFuogATAEAAEbWiABBAgAAWQIAAEUCAABUAgAAVAIAAEUBAABJHokAS+aIAEUCAABOAQAATPqIAEEDAABI8YgATgIAAEkBAABOCokAQQGJAEUDAABZAQAAUxaJAEgCAABBAQAAVAIAAEgBAABLhokARVuJAEk2iQBTAgAASAIAAEEBAABMQokAWQIAAE4BAABORYkAUwIAAEgCAABBUYkASQIAAEEBAABJcokAQWGJAE5liQBTAgAASAIAAEEBAABPfokAVAIAAEEBAABZAgAATgEAAE3CiQBBookAUgMAAEOeiQBVAgAAUwEAAFIBAABCsokARQIAAFICAABUAQAATwIAAE4CAABUAwAARQEAAE5qigBBz4kARQEAAEPWiQBFAQAARA6KAEHiiQBOAQAAReqJAE4BAABJ9okATvGJAFMBAABP/okATgEAAFIGigBZAQAAWQIAAE4BAABFK4oATBqKAEwBAABUJooAVAIAAEUBAABZAQAARz6KAFMCAABUAgAATwIAAE4BAABJW4oARUWKAFROigBBAQAAWQIAAEEDAABIAQAATgIAAElmigBFAQAAWQEAAFGSigBVAgAAQXqKAE4BAABJAgAAU4qKAEgCAABBAQAAVAIAAEEBAABSBosAQbeKAEWdigBJqooATgIAAEUBAABNAgAASQIAAEUBAABIyooATwIAAE4CAABEAgAAQQEAAEneigBTAgAAQdWKAFMCAABBAQAAS+qKAEkCAABOAQAAT/KKAE4BAABS+ooAWQEAAFP9igBVAgAARQEAAFM6iwBIAgAAQSqLAE4eiwBEAgAAQQEAAFcmiwBOAQAAWQEAAE8CAABOAgAARAIAAEEBAABUBowAQWaLAE5OiwBZAgAAQQEAAFNaiwBIAgAAQQEAAFYCAABJAgAAQQEAAEV2iwBTAgAASAIAAEEBAABIgosAQQIAAE4BAABJoosAQYmLAEOWiwBJAgAAQQEAAFMCAABIAgAAQQEAAE/aiwBOuosASbKLAEEBAABZAgAAQQEAAFLGiwBJAgAAQQEAAFPSiwBIAgAAQQEAAFkCAABBAQAAUgIAAEXqiwBMAgAATAEAAEkCAABD/osARfWLAEkCAABBAQAATgIAAEEBAABVYowAThKMAEEBAABSAgAAQRmMAEVKjABFJowATgEAAEwpjABOO4wAQzaMAEUBAABFAQAAVAIAAFQCAABBRYwARQEAAElbjABFUYwATgIAAEUBAABZAgAATgEAAFbCjABBcowARAIAAEEBAABFlowATIKMAEwDAABFAQAAUgIAAEGJjABOAwAAQZGMAEUBAABJqowATgIAAEGhjABJAgAAQQEAAE8CAABOAwAARLqMAEEBAABOAgAARQEAAFc2jQBB4owATgIAAEHRjABE2owAQQEAAE4CAABBAQAARfqMAFICAABFAgAATgIAAEMCAABFAQAAUh6NAEEOjQBOAgAAQwIAAEUBAABFAgAATgIAAEMCAABFAQAAUyqNAE8CAABOAQAAVAIAAE8CAABOAQAAWW6NAEFCjQBOAQAATFaNAEEDAABITY0ATgIAAEkBAABOYo0AQV2NAEUBAABUAgAATwIAAE4BAABaAgAAQQIAAFICAABPfY0AVQIAAFMBAABFtpAAQeeNAEiRjQBNno0ATwIAAE4BAABOyo0AQaWNAES+jQBFso0AUgEAAFICAABBuY0ATwEAAE4DAABBxY0ARQEAAFQCAABI1o0AQQEAAFICAABJAgAAQwIAAEUBAABE+o0AQe2NAEcCAABFAgAAUgEAAEU/jgBBEo4ATgIAAE4DAABBDY4ARQEAAEwijgBBAwAATgIAAEQBAABOKo4AQQEAAFI2jgBPAgAAWQEAAFMCAABBAQAAR1qOAEFOjgBDAgAAWQEAAEUCAABOAgAARAEAAEmmjgBBYY4ARmWOAEeGjgBIAwAAQXuOAE4CAABOAQAAVAIAAE8CAABOAQAATJ6OAEEDAABIkY4ATgIAAEmZjgBZAQAAUwIAAEEBAABMvo4AQbeOAE4CAABEAQAASQIAAEEBAABNzo4AVQIAAEUCAABMAQAATiOPAEHfjgBSAgAARAEAAE7+jgBB5Y4ASe6OAEUBAABP+o4ATvWOAFgBAABZAQAATxKPAFIOjwBBCY8ARQEAAFgBAABXAgAATwIAAE8CAABEAQAAT6OPAEI6jwBBAgAAUgIAAEQCAABPAQAATEKPAEEBAABOf48AQVePAFICAABEAwAATwEAAEVfjwBMAQAASW6PAEQCAABBAgAAUwEAAE8CAABSAwAAQXmPAEUBAABQko8ATwIAAEwCAABEAwAATwEAAFKajwBBAQAAVAIAAEEBAABSso8AQamPAE8CAABZAQAAU/uPAEG5jwBJwo8AQQEAAEzijwBF0o8ARc2PAFkBAABJ248ARQEAAFkDAABFAQAAU+6PAEkCAABFAQAAVAIAAEUCAABSAQAAVDaQAEEBkABICpAAQQEAAEkmkABDGpAASQIAAEEBAABUAgAASQIAAEEBAABUAgAASTKQAEUBAABZAQAAVkuQAEk9kABPRpAATgEAAFkBAABXVpAASQIAAFMBAABYh5AASXuQAEVhkABOdpAARwIAAFQCAABPAgAATgEAAFMBAABVgpAAUwEAAFkBAABZppAATJqQAEEDAABOAgAASQEAAFQCAABPAgAATgEAAFoCAABMAgAASQIAAEUBAABJ8pIAQd+QAEjBkABNxZAATgMAAEHNkABF0ZAATgIAAEHZkABFAQAAQgKRAELykABJ7pAARQEAAFkBAABFAgAAUgIAAFQCAABZAQAARBKRAEEJkQBJAgAAQQEAAEySkQBBH5EASAEAAEk/kQBBN5EATgMAAEEtkQBOAgAAQQEAAFQCAABIAQAATHqRAEFFkQBJY5EAQV+RAE4DAABBVZEATgIAAEEBAABFAQAAWQMAAEECAABOAwAAQXGRAE4DAABBAQAAWQMAAEECAABOAwAAQYmRAE4DAABBAQAATjaSAEGZkQBDqpEATwIAAEwCAABOAQAARNqRAEGxkQBFwpEATL6RAEwBAABOAQAAU9aRAEHOkQBZAQAARQIAAFkBAABZAQAAReqRAFQCAABUAgAARQEAAEvtkQBOApIARfqRAEEBAABJAgAARQEAAE8FkgBTEpIARQIAAFkBAABUHpIATwIAAE4BAABVJpIAUwEAAFcCAABPAgAATwIAAEQBAABPRpIATgIAAEUCAABMAQAAU46SAEFNkgBCXpIARQIAAFQCAABIAQAARW+SAFQCAABUAgAARQEAAEh2kgBBAQAAUwIAAEF9kgBFAgAAVAIAAFQCAABFAQAAVJ6SAEGVkgBaAgAAWQEAAFarkgBJAgAAQQEAAFoDAABBw5IAQgIAAEUCAABUAgAASAEAAELSkgBFAgAAVAIAAEgBAABF5pIAVAMAAEjdkgBUAgAARQEAAFoCAABJAgAARQEAAEwukwBFEpMAVwIAAEUCAABMAgAATAIAAFkCAABOAQAATx6TAFkCAABEAQAAVQIAAFYCAABJAgAAQQEAAE8ylQBDRpMASAIAAEwCAABBAgAATgEAAEdSkwBBAgAATgEAAElakwBTAQAATG6TAEFhkwBJAgAAVAIAAEEBAABOs5MAQXWTAESOkwBPgpMATgEAAFkCAABOAwAATgEAAEmXkwBFAQAATqqTAEGdkwBJppMARQEAAFkBAABaAgAATwEAAFJulABBy5MAScaTAE4CAABFAQAATgEAAEUOlABF15MATgEAAEzqkwBB4pMASQEAAEUCAABJAQAATgOUAEHxkwBF9ZMAWgIAAEH9kwBPAQAAVAIAAFQCAABBAQAASTOUAEEelABOAgAATgEAAEUhlABOAwAARC6UAEEBAABFAQAATj6UAEE5lABFAQAAUmqUAEFSlABJAgAATgIAAEUBAABFYpQAVAIAAFQCAABBAQAASQMAAEUBAABZAQAAVIaUAFR+lABJAgAARQEAAFUCAABTAQAAVd+UAEGWlABOAgAATgEAAEWmlABMAgAATAIAAEEBAABJupQARa2UAFMDAABBtZQARQEAAFLKlABEAgAARQIAAFMBAABWAgAARQIAAE4CAABJAgAAQQEAAFYClQBF85QATAIAAEztlABZAQAASQIAAEX5lABOAgAAQQEAAFcSlQBFAgAATAIAAEwBAABZAwAAQSaVAEwDAABUAgAAWQEAAEMulQBFAQAARAEAAFWHlgBBSpUATgIAAEFBlQBOAwAARQEAAEPblQBBV5UAUwEAAENelQBBAQAARWqVAFICAABPAQAASbuVAEF/lQBOAwAAQXmVAE8BAABFh5UATgEAAEyalQBBjZUARZGVAEwCAABFAQAATqaVAEQCAABBAQAAT7OVAFUCAABTAQAAVQIAAFMBAABLwpUAWQEAAFLWlQBFAgAAVAIAAEkCAABBAQAAWQEAAETylQBJ5pUARQEAAFcCAABJAgAARwEAAEUDlgBMAgAATAIAAEEBAABJGpYARw6WAEkBAABTF5YAQQEAAFoBAABLKpYAQSeWAFMBAABFAQAATDaWAEExlgBVAQAATj6WAEEBAABQUpYARUWWAEkCAABUAgAAQQEAAFJalgBBAQAAVGqWAEgCAABFAgAAUgEAAFZ+lgBFAgAATgIAAEkCAABBAQAAWIGWAFoBAABZAgAAQZqWAE4CAABOAgAAQQEAAESqlgBBoZYASQIAAEEBAABMupYAQbeWAEgBAABFAQAATcaWAEECAABOAQAATkeXAET6lgBB0ZYARd6WAEwCAABMAQAAT+aWAE4BAABTAgAAQfKWAFkBAABFAgAAWQEAAEUWlwBMCpcATAMAAEUBAABUAgAAVAIAAEUBAABOK5cARQMAAFQCAABUAgAARQEAAFM2lwBFAgAAWQEAAFcCAABPAgAATwIAAEQBAABSAgAAQU2XAEkCAABDAQAATRKrAEFqogBCepcARXKXAEwDAABMAgAARQEAAEwCAABFAQAAQ++XAEGOlwBSAgAASQIAAE8BAABFmpcAT5WXAFkBAABIrpcARQIAAEwCAABMAgAARQEAAEm3lwBFAQAAS+OXAEXWlwBOAgAATsqXAEEBAABaAgAASQIAAEUBAABMAgAASQIAAE4BAABP6pcATgEAAFkBAABEApkAQRKYAEwCAABJBpgATgIAAEUBAABZAgAATgMAAE4BAABERpgARR6YAE4BAABJNpgARSWYAFMymABPAgAATgEAAFgBAABPPpgAWAEAAFUCAABYAQAARZKYAEwCAABBXpgASQIAAE4CAABFAQAARXaYAElumABOAgAARQEAAE4CAABFAQAASYKYAE4DAABFAQAAWQIAAE4DAABFjZgATgEAAEeamABFAQAASc6YAEWhmABMspgAWQIAAE4DAABOAQAAUwIAAEW+mABOAQAAT8aYAE4BAABZAgAATgEAAEzamABZAgAATgEAAE/qmABOAgAATgIAAEEBAABZAgAAUwIAAEX6mABOAQAATwIAAE4BAABFK5kARxKZAEECAABOAQAATCKZAFkCAABOAwAATgEAAFYCAABFAQAAR46ZAEFCmQBMPpkASTmZAFkBAABOAQAARF6ZAEEDAABMAgAARQIAAE4DAABBWZkARQEAAEVmmQBOAQAAR3KZAEkCAABFAQAATgIAAE+GmQBMAgAASQIAAEEBAABVAgAAUwEAAEjWmQBBppkATAIAAEGdmQBJAgAAQQEAAEyymQBPAgAATgEAAE3CmQBPAgAAVQIAAEQBAABPAgAARwIAAEECAABOAgAAWQEAAEkrmgBB3ZkAROaZAEEBAABM7pkARQEAAFL2mQBBAQAAUw6aAEkCmgBFAQAATwqaAE4BAABZAQAAVBaaAEUBAABZHpoAQQEAAFoCAABJAgAARQEAAEpGmgBFPpoAUwIAAFQCAABZAQAATwIAAFIBAABL1poAQX6aAEVamgBMAgAAQQEAAElnmgBMAgAAQQEAAExumgBBAQAAWQIAAEwCAABBAwAASAEAAEWemgBOAgAAQYmaAE6SmgBBAQAAWgIAAEkDAABFAQAASKaaAEkBAABJvpoAQbKaAEgBAABZAgAAQQMAAEgBAABTypoASQIAAE0BAABZAgAATAIAAEEBAABM4psAQS6bAEPqmgBIAgAASQEAAEn2mgBLAgAAQQEAAEsPmwBBApsASQEAAEgKmwBJAQAASQEAAE4WmwBJAQAAWQIAAEEjmwBIAQAAUwIAAEkCAABBAQAAQ0KbAE8CAABMPpsATQEAAE0BAABFWpsAQU+bAEgBAABLUZsATgIAAEEBAABJmpsAQWebAEgBAABLb5sAQQEAAE5+mwBBdZsARAIAAEEBAABTjpsAQYWbAFMCAABBAQAAWQIAAEEDAABIAQAAS6abAEGhmwBZAQAATMabAEmymwBFAQAATwIAAFICAABJwpsARQEAAFkBAABP1psAUgIAAEkCAABFAQAAVgIAAEkCAABOAQAATfqbAEnumwBFAQAATQIAAEkCAABFAQAATiqcAEQSnABBBZwASQ+cAEUBAABZAQAAThqcAFkBAABVAgAARQIAAEwDAABBAQAAUDacAEwCAABFAQAAUlKgAEFPnABIQZwATgIAAEQCAABBAQAAQmKcAEUCAABMAgAATAIAAEEBAABDw5wARaKcAEwDAABBcZwASYacAE4CAABBfZwARYGcAE8BAABMn5wAQY2cAEWRnABPlZwAVQIAAFMBAABPAQAASa+cAEGpnABFAQAAT7ecAFMBAABVvpwAUwEAAFkBAABF1pwAS8mcAEzSnABZAQAATgEAAEdSnQBBEp0AUgqdAEX6nABUAwAARe2cAFQDAABB9ZwARQEAAEkCAABUAgAAQQWdAE8BAABVAgAAWAEAAEUfnQBSAgAAWQEAAEkmnQBFAQAATy+dAFQBAABSOp0ARQIAAFQBAABVAgAARQIAAFICAABJAgAAVAIAAEUBAABJZ54AQYudAEhdnQBKbp0ATwIAAFMCAABFAQAATXGdAE4DAABBeZ0AToedAEGBnQBFAQAATwEAAEKenQBFAgAATJWdAFQCAABIAQAAQ7qdAEWunQBMAgAAQQEAAFICAABVAgAAWgEAAEXfnQBM050AQcWdAEwCAABBzZ0ARQEAAFQCAABUAgAAQQEAAEfunQBPAgAATAIAAEQBAABMDp4ARfqdAEUBAABPAp4AVQEAAFkCAABOAwAATgEAAE4XngBBAQAATx+eAE4BAABTQ54AQSWeAEUyngBMAgAAQQEAAE86ngBMAQAAUwIAAEEBAABUUp4AQUmeAFoCAABBAQAAVVqeAFMBAABZAgAAQQMAAEgBAABKfp4ATwIAAFICAABJep4ARQEAAFkBAABLp54ARY6eAEwDAABMAQAASZqeAFQCAABBAQAAT52eAFUCAABTAQAATAafAEG3ngBOAgAAQQEAAEXengBFw54ATgEAAEnOngBHAgAASAEAAE7bngBB1Z4ARQEAAFkBAABJ654AReWeAE4BAABP+54ATvGeAFcDAABFAQAAWQIAAE4BnwBTAQAAThafAEENnwBJAwAARQEAAFFCnwBVAgAARS6fAEwlnwBTKZ8AWgEAAEkCAABTO58ARQEAAFQCAABBAQAAU16fAEgCAABBAwAATFefAEwBAABXAgAATgEAAFSSnwBBZZ8ARXafAExynwBMAQAAWgEAAEh+nwBBAQAASY+fAE4DAABBiZ8ARQEAAFkBAABWrp8AQZmfAEWinwBMAQAASQIAAE6pnwBTAQAAV7afAEEBAABZAwAAQeKfAEzOnwBJAgAAQwIAAEUBAABN0Z8ATgIAAE4DAABB3Z8ARQEAAELynwBFAgAAVAIAAEgBAABFBqAATAIAAEwCAABFAgAATgEAAEoaoABBFqAATgIAAEUBAABPAQAATD6gAEUmoABFAQAASS6gAE4BAABPNqAAVQEAAFkCAABOAQAATkGgAFICAABPAgAAUwIAAEUBAABTdqAARV6gAE4BAABPZqAATgEAAFMCAABJAgAATQIAAE8BAABUCqEARYKgAE8BAABIrqAARY6gAFcBAABJAgAAQZqgAFMBAABFoqAAVQEAAEwCAABEAgAAQQEAAEnKoABBuqAAUwEAAEwCAABEAgAAQcWgAEUBAABUAwAARdagAE8BAABI7qAAReKgAFcBAABJAgAAQQIAAFMBAABJAgAAQfqgAFMBAABF/aAAUwIAAE8CAABOAQAAVVahAEQfoQBFFaEASQIAAEUBAABSAgAAQSWhAEUyoQBFAgAATgEAAElOoQBDRqEART2hAEkCAABPAQAATgIAAEUBAABPUaEAWQEAAFZ2oQBFbqEAUgIAAEkCAABDAgAASwEAAEkCAABTAQAAWOOhAEnCoQBFgaEATbuhAEmuoQBMAgAASZ6hAEECAABOAwAATwEAAEwCAABJAgAAQQIAAE4BAABPsaEAVQIAAFMBAABOAgAARQEAAFTOoQBPAgAATgEAAFfeoQBFAgAATAIAAEwBAABYAQAAWV+iAEHvoQBIAQAAQgKiAEUCAABMAgAATAIAAEUBAABDDqIARQIAAEUBAABFFqIAUgEAAEwqogBFIqIARQEAAEkCAABOAQAATTKiAEUBAABOQqIAQQIAAFICAABEAQAAUkqiAEEBAABTVqIATwIAAE4BAABUAgAARQEAAFoCAABJAgAARQEAAEO+ogBDeqIATwIAAFkBAABLAgAAQY6iAFkDAABMAgAAQQEAAEWqogBOAgAATp6iAEEBAABaAgAASQIAAEUBAABJAgAATgIAAEwCAABFAgAAWQEAAEV6pQBB6qIARNKiAE8CAABXAQAARwIAAEHeogBOAQAASAIAAEECAABOAQAAQwqjAEP2ogBBAQAASAIAAEUCAABMAgAATAIAAEUBAABFFqMAUgIAAEEBAABHP6MAQSKjAE4BAABHLqMAQQIAAE4BAABIAgAAQQIAAE4DAABOAQAASVajAExSowBBAgAATgIAAEkBAABSAQAAS2KjAEgCAABJAQAATDekAEGKowBJdqMATgIAAEUBAABOAgAASYejAEGBowBFAQAAWQEAAEKSowBBAQAASbqjAEGZowBOqqMAQaGjAEQCAABBAQAAUwIAAEGxowBTAgAAQQEAAEzSowBJAgAAUwIAAEHJowBTAgAAQQEAAE/+owBE7qMAReKjAEUBAABJ6qMARQEAAFkBAABOAgAASfqjAEUBAABZAQAAVAqkAE8CAABOAQAAViakAEERpABJHqQATgMAAEEBAABZAgAATgEAAFkCAABOAgAARAIAAEEBAABNSqQAUAIAAEgCAABJAgAAUwEAAE5ypABBYqQAQwIAAEgCAABFAgAATQEAAEQCAABFbqQATAEAAFkBAABSUqUAQYakAE4CAABEAgAAQQEAAEOipABFnqQARAIAAEUCAABTmaQAWgEAAFkBAABFtqQARAIAAEkCAABUAgAASAEAAEnjpABEyqQASQIAAFQCAABIAQAATNakAFkCAABOAQAAUwIAAFMCAABBAQAATAOlAEXzpABOAgAARQEAAEn6pABOAQAAWQIAAE4BAABOCqUAQQEAAFIypQBJL6UAQxqlAEsBAABFHaUATCalAEwBAABUAgAAVAEAAFkBAABUPqUATwIAAE4BAABWSqUASQIAAE4BAABZAgAATAEAAFNmpQBTAgAASQIAAEECAABIAQAAVG6lAEEBAABZAgAARQIAAFIBAABJTqgAQYelAEgBAABDBqYAQbelAEWapQBMAgAAQQEAAEidpQBJqqUAQQIAAEgBAABZAgAATAIAAEEBAABI7qUAQdOlAEXKpQBMAwAAQQEAAEwDAABFAQAARQIAAEHepQBMAQAATAMAAEXlpQBMAwAARQEAAEsDAABF+qUAWQEAAEkDpgBFAQAAWQEAAEUWpgBTAgAASAIAAEEBAABHTqYARC6mAEECAABMAgAASQIAAEEBAABVAgAARQIAAEwDAABBAgAATgIAAEcCAABFAgAATAEAAEumpgBBh6YARWKmAEwDAABBAQAASGWmAElypgBMAgAAQQEAAEx7pgBBAQAAWQIAAEwCAABBAQAARZemAEGSpgBMAQAATAEAAEgCAABBAgAASQIAAEwBAABMWqcAQdOmAEe+pgBSAgAATwIAAFMBAABIwaYATgMAAEHJpgBJAwAAQQEAAETipgBSAgAARQIAAEQBAABF9qYATu6mAEEBAABT8aYAWQEAAEYGpwBPAgAAUgIAAEQBAABJFqcAUwIAAFMCAABBAQAATEqnAEEmpwBSAgAARAEAAEUupwBSAQAASUanAENCpwBFAgAATgIAAFQBAABFAQAAWQEAAE9NpwBUAgAATwIAAE4BAABNYqcASQEAAE6apwBBaacARHanAElxpwBZAQAARYanAFICAABWAgAAQQEAAEiJpwBOAgAAQZGnAEkCAABFAQAAUuqnAEG7pwBDrqcATAIAAEUBAABOAgAARAIAAEEBAABF0qcATMqnAEwCAABBAQAAWQIAAEEBAABJ4qcAQQIAAE3dpwBOAQAATgIAAEEBAABTFqgAQfqnAEUCAABMAQAASAKoAEEBAABTCqgAWQEAAFQCAABJEagAWQEAAFRCqABDLqgASAMAAEUCAABMAwAATAEAAFQ6qABJAgAARQEAAFoCAABJAQAAWQIAAEEDAABIAQAAT/apAERmqABFAgAAUwIAAFQCAABPAQAASJaoAEECAABNAgAAQXqoAEQBAABFgqgARAEAAE0CAABBjqgARAEAAEUCAABEAQAASa6oAFKiqABBAQAAUwIAAEUCAABTAQAATMKoAEwCAABJvqgARQEAAFkBAABOeqkAQcmoAEXSqABUAQAASfKoAEPeqABBAQAAS+aoAEEBAABRAgAAVQIAAEUBAABS/qgATwIAAEUBAABTFqkARQIAAFICAABSAgAAQQIAAFQBAABUAgAAQSapAE4CAABBAQAARS+pAFoBAABHRqkATwIAAE0CAABFAgAAUgIAAFkBAABJTqkARQEAAFJeqQBFAgAATAIAAEwBAABTdqkARQIAAFICAABSAgAAQQIAAFQBAABZAQAAUs6pAESWqQBFAgAAQwIAAEgCAABBAgAASQEAAEeqqQBBoqkATgEAAEUCAABOAQAASbapAEECAABIAQAAUsKpAEkCAABTAQAAVAIAAE8CAABOAQAAU+KpAEXbqQBTAQAASAIAAEUBAABaAgAARQIAAEwCAABMAwAARQEAAFViqgBIGqoAQQIAAE0CAABNAgAAQRKqAEQBAABFAgAARAEAAFJKqgBJKqoARQIAAEwBAABMLaoAUDqqAEgCAABZAQAAUgIAAEFGqgBZAQAAWQEAAFMCAABBUaoAVAIAAEECAABGAgAAQQEAAFkCAABBb6oASAEAAEV+qgBTAgAASAIAAEEBAABLnqoAQZeqAEiJqgBZAgAATAIAAEEBAABFAgAATAEAAEy6qgBBq6oASAEAAEW2qgBFsaoAUwEAAE8BAABSAgAAQc+qAE4CAABEAgAAQQEAAEnaqgBBAgAATQEAAEzjqgBFAQAATuqqAEEBAABP8qoATgEAAFQCAABJCqsAQwKrAEUBAABFBasAUwEAAEwCAABFAQAATmaxAEEqrQBEOqsAQSGrAEkyqwBBKasATgIAAEUBAABZAgAAQQEAAEhGqwBMAgAAQQEAAEleqwBMVqsAQQMAAEgBAABNAwAAQQEAAEpqqwBFAgAARQEAAEuKqwBJAgAAQXWrAFOCqwBIAgAAQQEAAFQCAABBAQAATKqrAEGbqwBOAgAASQEAAEwCAABFAgAATAIAAFkBAABO76sAQbGrAEPCqwBJv6sARQEAAFkBAABF0qsAVAIAAFQCAABFAQAATgIAAEXmqwBUAgAAVAIAAEUBAABJAgAARQEAAE/+qwBNAgAAQfmrAEkBAABQFqwATwIAAEwCAABFAgAATwIAAE4BAABSJqwASQIAAEECAABIAQAAUzasAEgtrABJAgAAUgEAAFT2rABBgqwATF6sAEVKrABFAQAASVesAEFRrABFAQAAWQMAAEEBAABObqwAQQIAAEUCAABMAQAAUwIAAEgCAABBeawASQIAAEEBAABFhawASM6sAEHGrABMoqwASZ6sAEGZrABFAQAAWQEAAE4DAABBsqwARQIAAEwBAABJAgAAQb6sAEwBAABFAgAATAEAAEUCAABOAQAASeasAFYCAABJAgAARAIAAEECAABEAQAATwIAAFMCAABIAgAAQQEAAFb+rABZAQAAWR6tAEEFrQBFFq0ATAIAAEkRrQBZAQAATAIAAEEBAABaAgAASQIAAFIBAABFhq4AQTatAEwBAABDSq0ASAIAAEECAABNAgAAQQEAAERXrQBSAgAAQQEAAEVirQBMAwAAWQEAAEZ2rQBUAgAAQQIAAEwCAABJAQAASJKtAEF9rQBFAgAATQIAAEkCAABBAgAASAEAAEmarQBMAQAATMqtAESmrQBBAQAATL+tAEGtrQBFsa0ASbqtAEUBAABZAQAAUwMAAE8CAABOAQAATtKtAEEBAABP360ATQIAAEEBAABS/q0ARfKtAEkCAABEAgAAQQEAAEkCAABBAgAASAEAAFMOrgBUAgAATwIAAFIBAABUIq4AQRWuAFQCAABJAgAARQEAAFZargBBO64ARDKuAEEBAABFAgAASAEAAEVGrgBBAgAASAEAAEkCAABMVq4ATAIAAEUBAABOAQAAV3auAEVqrgBMAgAATAEAAFQCAABPAgAATgEAAFkCAABNAgAAQQIAAFIBAABJ9q8AQY2uAEMirwBIwq4ARaauAEwCAABMAgAARQEAAE8CAABMAwAAQb6uAFO1rgBVAgAAUwEAAEUBAABL+64ASc+uAEUBAABM4q4AQQIAAFPZrgBVAgAAUwEAAE/2rgBMAgAAQfKuAFMBAABFAQAAWQEAAE8DAABMAgAAQQuvAFMBAABFG68AVAIAAFQCAABFAQAATAIAAEUBAABELq8ASQIAAEEBAABHOq8ARQIAAEwBAABLmq8AQUGvAEhOrwBJAgAATAEAAElfrwBBVa8AVAIAAEEBAABLaq8ASWWvAE8BAABMeq8AQQIAAFUCAABTAQAATwMAAEwCAABBl68ASYmvAFONrwBVAgAAUwEAAEUBAABMtq8AQaGvAESqrwBBAQAARbOvAFMBAABTAQAATsqvAEG9rwBGxq8AQQEAAE8BAABT1q8ASAIAAEEBAABU3q8AQQEAAFjqrwBPAgAATgEAAFkCAABBAwAASAEAAE8asQBBB7AASAGwAE0BAABCErAATAIAAEUBAABFQ7AATDuwAEEmsABOAgAASQEAAEkusABBAQAATAIAAEE1sABFAQAATQIAAEkBAABMVrAAQU+wAE4BAABFAgAATgEAAE5esABBAQAAT2awAFIBAABS6rAAQXOwAEgBAABChrAARQIAAFICAABUAwAATwEAAEWasABFkrAATgEAAE4CAABFAQAASaewAE4CAABFAQAATbawAEEDAABOAwAARAEAAFLCsABJAgAAUwEAAFTOsABPAgAATgEAAFbasABBAgAATAEAAFcCAABPAgAATwIAAEQBAABV8rAAUgEAAFYCAABBC7EASP2wAEwCAABFAgAARQEAAEUCAABMAgAATAIAAEEBAABVKrEAQgIAAEkCAABBAQAAWQIAAEFDsQBINbEAUwIAAEkCAABBAQAARE6xAEkCAABBAQAATFqxAEEDAABIAQAATwIAAE0CAABJAQAAT8a0AEGasQBLAgAATAIAAEWOsQBFfbEASYqxAEcCAABIAQAAWQEAAFkCAABOAwAATgEAAELCsQBBsrEARAIAAEkCAABBAgAASAEAAEW6sQBEAQAASQIAAEUBAABD+rEARdKxAEECAABOAQAASdqxAEUBAABUAgAAQQIAAFYCAABJAgAAQe2xAE/xsQBVAgAAUwEAAERSsgBBFrIATAIAAEkOsgBTAQAAWQIAAFMBAABFQrIATCqyAEkmsgBBAQAATAEAAFM2sgBTAgAAQQEAAFQCAABUAgAARQEAAEkCAABFSbIATk2yAFMBAABGZrIARQIAAEwCAABJAgAAQQEAAEzWsgBBd7IARnGyAE4BAABFhrIATn2yAFQCAABBAQAAR46yAEEBAABJqrIATpWyAFYCAABFo7IAUgEAAEkCAABBAQAATLayAEkCAABFAQAAWQIAAE3KsgBQAgAASQIAAEEBAABWAgAASQIAAEEBAABN/rIAQe+yAFIDAABJAwAATwIAAE4BAABFAgAAR/qyAEEBAABSAQAAThqzAEEFswBFErMAQQIAAEwBAABZAgAAWAEAAFA6swBBJrMATAEAAEgCAABFAgAATAIAAEkCAABBAQAAUsqzAEFTswBMT7MASQIAAEEBAABOAQAARVqzAE4BAABJdrMAQWqzAE4CAABBAQAATm2zAE8CAABOAQAATIqzAEECAABOAgAARAIAAE8BAABQlrMASAIAAEEBAABSorMASQIAAE4BAABTrrMATwIAAE4BAABWAgAAQbqzAEwBAABJAgAATAIAAEwCAABFAQAAU1K0AELiswBBAgAATAIAAEQCAABPAQAAQ+6zAEECAABSAQAASQa0AEX6swBMAQAAUgIAAEkCAABTAQAASxK0AEECAABSAQAATR60AEECAABOAQAAUyq0AEkCAABFAQAAVj60AEECAABMAgAARAIAAE8BAABXAgAAQQIAAEwCAABEAwAATwEAAFR6tABIYrQAQV20AE8BAABJarQAUwEAAFQCAABJdrQAUwEAAE8BAABVirQASQIAAEQCAABBAQAAV5a0AEUCAABOAQAAWgIAAEWqtABMAgAATAMAAEEBAABJtrQARQIAAEwBAABaAgAAScK0AEUBAABZAQAAUBq6AEGutgBC2rQATAIAAE8BAABH4rQARQEAAEkatQBH7rQARQEAAFMOtQBMAgAARQIAAEX9tABJCrUARwIAAEgBAABZAQAAVAIAAFkCAABOAQAATDq1AE0utQBBJbUARQIAAFIBAABPAgAATQIAAEEBAABNX7UAQUq1AEwCAABBAQAARQIAAEwCAABBVbUATAIAAEEBAABOerUARHK1AE8CAABSAgAAQQEAAFMCAABZAQAAT4q1AEwCAABBhbUATwEAAFKytQBJlrUAUwEAAEuitQBFAgAAUgEAAFICAABJAgAAUwMAAEgBAABT8rUAQ861AEHCtQBMAQAAVQIAAEECAABMAQAAUeK1AFUCAABBAgAATAIAAEUBAABTAgAASQIAAE8CAABOAQAAVEe2AEkKtgBFAgAATgIAAEMCAABFAQAAUi62AEkCAABDAwAAQRm2AEUdtgBJKrYAQSW2AE8BAABLAQAAUza2AFkBAABUAgAASUO2AEUBAABZAQAAVXq2AEwDAABBUbYARWa2AFQCAABUAgAAQWG2AEUBAABJdrYATgIAAEFxtgBFAQAATwEAAFiKtgBUAgAATwIAAE4BAABZAgAAU5q2AE8CAABOAQAAVAIAAEWmtgBOAQAATwIAAE4BAABFtrcAQdK2AFICAABMAwAARcG2AEkCAABFybYATgIAAEUBAABE3rYAUgIAAE8BAABH8rYARwIAAEnutgBFAQAAWQEAAEkKtwBHAgAASAIAAFQCAABPAgAATgEAAE4ytwBFIrcATAIAAE8CAABQAgAARQEAAE4CAABJL7cARQEAAFkBAABQQrcAUAIAAEUCAABSAQAAUpK3AENOtwBZAQAASVG3AExatwBBAQAATmq3AEUCAABMAgAATAEAAFJ2twBJcbcAWQEAAFMCAABFAgAAUAIAAEgCAABPAgAATgIAAEUBAABUprcARZ+3AFIBAABSAgAAQQEAAFkCAABUAgAATwIAAE4BAABIWrgARca3AEICAABFAQAASRK4AEwDuABJ3rcAUAMAAFACAABFAQAATO63AEkCAABQ6bcAUwEAAE8CAABNAgAARQIAAE4CAABBAQAATgIAAEUCAABBAgAAUwEAAE8uuABFAgAAQiK4AEUBAABOAgAASQIAAFgBAABZAgAATAIAAElOuABDRrgASQIAAEEBAABTAwAAUwEAAEwCAABJAgAAUwEAAEm6uABBYbgARZK4AFKGuABDcrgARQEAAFJ6uABFAQAAUwIAAE8CAABOAQAAVAIAAFICAABPAQAATJ64AEECAABSAQAATq64AEsCAABJAgAARQEAAFACAABFAgAAUgEAAE8OuQBMyrgATAIAAFkBAABQ1rgAUAIAAFkBAABSAgAARu64AEkCAABSAgAASQIAAE8BAABT+rgASAIAAEEBAABUAgAARQa5AFIBAABJAgAAQQEAAFIKugBBIrkATgIAAEECAABWAQAARXa5AEM6uQBJAgAATwIAAFUCAABTAQAATla5AFQCAABJAgAAQ065AEUBAABTAgAAUwEAAFMCAABMarkARQIAAEVluQBZAQAAVAIAAE8CAABOAQAASd65AEOSuQBFgbkASQIAAEwCAABMAgAAQQEAAE6yuQBDAgAARQMAAFOmuQBTAQAAVAIAAE8CAABOAQAAU9a5AEPOuQBJAgAATAIAAEHFuQBMAgAAQQEAAEgCAABBAQAAWQIAAEEBAABP8rkATQIAAEkCAABTAgAARQEAAFUCAABEAgAARQIAAE4CAABDAgAARQEAAFkCAABQAgAARQIAAFIBAABRrroASS66AEECAABOAgAAQQEAAFUCAABFXroARUa6AE4DAABJAgAARQEAAE4CAABUAgAASVa6AE4BAABPAgAATgEAAEkCAABBbroATgIAAEEBAABOAgAAQ4K6AEV+ugBZAQAAWQEAAEyOugBBAgAATgEAAE6RugBUAgAARZ66AE4BAABJproATgEAAE8CAABOAQAAUs7GAEGivQBD9roASOa6AEHKugBFAgAATAEAAEUCAABB1roATAEAAEwDAABF3boATAMAAEUBAABRAgAAVQIAAEUCAABMAQAARS+7AEEGuwBOAgAATgEAAEcSuwBBAgAATgEAAEwCAABFIrsATgIAAEUBAABZAgAATgMAAE4BAABGRrsAQUK7AEUCAABMAwAAQQEAAEUBAABIXrsARVa7AEUCAABNAQAAVQIAAEwBAABJhrsARG67AEUCAABOAQAATn+7AEF1uwBFAwAAWQEAAFoCAABZAQAATKK7AEWauwBJAgAARwIAAEgBAABQAgAASAEAAE3SuwBJs7sAUgIAAE8BAABPwrsATgMAAEG9uwBFAQAAUwIAAEUCAABTzbsAWQEAAE46vABB37sARQEAAEPmuwBFAQAARCe8AEH3uwBMAwAATAEAAEUGvABF/bsATAMAAEwBAABJCbwATBK8AEUBAABPIrwATAIAAFACAABIAQAAWQEAAEkuvABBAQAAUwIAAE8CAABNAQAAT0a8AFUCAABMAQAAUFq8AEgCAABBAgAARQIAAEwBAABRarwAVQIAAEUCAABMAQAAU7K8AEgCAABBmrwAQX68AEQBAABEgbwAUoq8AEQBAABVkrwATgEAAFcCAABOAQAARaa8AEUCAABEAQAASQIAAEQDAABBAQAAVbq8AEwBAABW0rwARca8AE4BAABJybwAWQIAAE4BAABZAwAAQd+8AE4BAABC7rwAVQIAAFICAABOAQAARPq8AEUCAABOAQAARf28AEYOvQBPAgAAUgIAAEQBAABMQr0AQRq9AE4BAABFNr0ARSG9AEkuvQBHAgAASAEAAE4CAABFAQAAWQIAAE4CAABOAQAATWK9AE9SvQBOAwAARAEAAFUCAABOAgAARAIAAE8BAABOdr0AQXO9AFICAABEAQAARQEAAFOKvQBIAgAAQQIAAFcCAABOAQAAVpa9AEUCAABOAQAAWQIAAEECAABOAQAARb6/AEHOvQBHtr0AQQIAAE4BAABOwr0ATgIAAEEBAABUAgAASAIAAEEBAABCFr4AQdW9AELqvQBFAgAAQwIAAEMCAABBAQAARQIAAEMGvgBB9b0AQ/69AEEBAABLAgAAQQEAAEsSvgBBAwAASAEAAEwBAABFMr4AQyK+AEUBAABEJb4ATSm+AFMCAABFAQAARka+AFUCAABHAgAASQIAAE8BAABHir4AQVK+AE4BAABFZr4ATgIAAEFdvgBJAgAAQQEAAEdyvgBJAgAARQEAAEkCAABOhr4AQQMAAEwDAABEAQAAUwEAAEm6vgBEkb4AR5q+AE4BAABMpr4ATAIAAFkBAABOAgAAQQMAAEwCAABEAgAATwEAAE3avgBJ174ATgIAAEcCAABUAgAATwIAAE4BAABZAQAATiu/AEEHvwBF5b4ATPK+AEQCAABPAQAAUvq+AEQBAABUAgAAQQG/AE8BAABFE78AQQ2/AEUBAABJHr8AVAIAAEEBAABPIb8AWgIAAE8BAABUQr8AQTG/AEg6vwBBAQAAVAIAAEEBAABVUr8AQgIAAEUCAABOAQAAVlq/AEEBAABYb78ARgIAAE8CAABSAgAARAEAAFkDAABBg78ATgIAAFMCAABIAQAARYq/AFMBAABNnr8AVQIAAE4CAABEAgAATwEAAE4CAABBs78ATAIAAEQCAABPAQAATwIAAEwCAABEAQAASCrAAEXSvwBByb8AVAIAAFQBAABJ7r8AQQIAAE4CAABOAgAAQeW/AE8CAABOAQAATw7AAEQCwABB+b8ARQIAAFMBAABOAgAARAIAAEEBAABZAgAAQRrAAE4BAABMJsAARQIAAEUBAABTAQAASZbBAEE/wABOAwAATgIAAEEBAABDpsAAQVLAAFICAABEAgAATwEAAEiLwABBYsAAUgIAAEQBAABFcsAATAIAAEwCAABFAQAASXrAAEUBAABNAgAATwIAAE4CAABEAQAAS6PAAEWWwABZAQAASZ/AAEUBAABZAQAATwEAAES+wABHssAARQEAAEwCAABFAgAAWQEAAEfiwABHysAAUwEAAE8CAABCAgAARQIAAFICAABUAgAATwEAAEj2wABBAgAATgIAAE4CAABBAQAASwLBAEsCAABJAQAATDLBAEUewQBFDcEASRrBAEcCAABIAQAAWQEAAEwmwQBBAQAAWQIAAE4CAABOAQAATjrBAEEBAABPPcEAUE7BAEwCAABFAgAAWQEAAFNewQBBVcEASAIAAEkBAABUdsEAQWXBAEMCAABIAgAASQIAAEUBAABWjsEARYbBAFIDAABTAQAASwIAAEEBAABZAgAAQQEAAE+axQBBosEATgEAAELrwQBCu8EASbbBAEWxwQBOAQAAWQEAAEXOwQBSAgAAVAMAAEHJwQBPAQAASeLBAE4DAABTAgAATwIAAE4BAABZAwAATgEAAEMawgBD9sEATwEAAEgKwgBFAgAATAMAAEwCAABFAQAASRLCAE8BAABLAwAAWQEAAER7wgBEJsIAWQEAAEU6wgBSAgAASQIAAEMDAABLAQAAR0bCAEUCAABSAQAATlLCAEUCAABZAQAAT2LCAEwCAABGAgAATwEAAFICAABJAgAAQ3LCAEsBAABHAgAATwEAAEWCwgBMAQAAR6bCAEGOwgBOAQAARQIAAEyewgBJAgAATwEAAFIDAABTAQAASLLCAEECAABOAQAASsbCAEUCAABMAgAASQIAAE8BAABM/sIAQd7CAE4CAABEAwAAQdnCAE8BAABG4cIATAIAAEHywgBOAgAARAEAAEkCAABF+cIATgEAAE1CwwBBF8MASRLDAE4CAABFAQAATgEAAEUjwwBMHcMATwEAAEkywwBFKcMATgIAAEEBAABPPsMATgIAAEEBAABZAQAATpfDAEFbwwBMVsMARAMAAE8BAABOAQAARG7DAEFhwwBFAgAATAIAAEwBAABJd8MATgEAAE4CAABBfcMARYrDAEwCAABMAQAASZPDAEUBAABZAQAAT7LDAFMCAABFAgAAVgIAAEUCAABMAgAAVAEAAFG+wwBVAgAARQEAAFLKwwBJxcMAWQEAAFMGxQBBU8QATBLEAELewwBBAQAARebDAEUBAABJBsQAQe3DAEXxwwBOAgAAQfnDAEQDxABBAQAARQEAAFkCAABOAwAATgEAAE0ixABPAgAATgIAAEQBAABONsQAQSnEAE4DAABBMcQARQEAAFJGxABJAgAAQUHEAE8BAABVAgAAUgIAAEEBAABDXsQATwIAAEUBAABFz8QAQXbEAE4CAABOAwAAQXHEAEUBAABMjsQATILEAEEBAABZAgAATgMAAE4BAABNpsQAQQIAAFICAABJosQARQEAAFkBAABOssQARAIAAE8BAABUvsQAVAIAAEEBAABWAgAARQIAAEwCAABUAQAASe7EAEHVxABF2cQATuLEAEEBAABP5cQAVAIAAEEBAABM+sQAWQIAAE4BAABTAwAASQIAAEUBAABXPsUAQRLFAE4BAABEGsUAWQEAAEUmxQBOAwAAQQEAAEw2xQBBAgAATgIAAEQBAABZAgAATgEAAFhqxQBBXsUATgIAAEFNxQBFUcUATgMAAEFZxQBFAQAASWbFAEUBAABZAQAAWYfFAEF+xQBMAwAAVAIAAFkBAABDAgAARQEAAFoCAABFAgAATAIAAEwCAABBAQAAVU7GAEK+xQBFqsUATgEAAEm3xQBFscUATgEAAFkDAABFAQAARNrFAE/WxQBMAgAARs3FAFACAABIAQAAWQEAAEXqxQBCAgAARQIAAE4BAABG9sUAVQIAAFMBAABQBsYARQIAAFICAABUAQAAUy7GAEgNxgBTH8YARQIAAEwDAABMAQAAVAIAAEkqxgBOAQAAWQEAAFQCAABIAwAAQUfGAE4CAABOAwAARQEAAEkCAABFAQAAWQIAAEFixgBOAwAATgMAAEUBAABEbsYARQIAAFIBAABFdsYATgEAAEuCxgBFAgAAUgEAAEzGxgBBksYATgMAAEQBAABFrsYARZnGAEmmxgBHAgAASAEAAE6pxgBZAQAASbrGAEW1xgBOAQAAWQIAAE4CAABOAQAATgIAAEUBAABTstYAQW7KAEHqxgBE3cYATgIAAFYCAABJAQAAQirHAEEGxwBTAgAAVAIAAEkCAABBAgAATgEAAEkWxwBOAgAAQRHHAEUBAABSAgAAQR3HAEkCAABOAgAAQQEAAEM2xwBIAgAAQQEAAERGxwBFPccASQIAAEUBAABGWscAQU3HAEkCAABZAgAAQQEAAEdixwBFAQAASILHAEF6xwBOcscAQQEAAFIDAABBAQAASQIAAEwBAABJsscARInHAEaNxwBHlscARQEAAEyixwBPAgAAUgEAAE6qxwBUAQAAUgIAAEEBAABMJ8gARcbHAE29xwBOAgAAQQEAAEnSxwBOAgAAQQEAAEzixwBJ3scARQEAAFkBAABN7scAQQMAAE4BAABPAsgATQIAAEX5xwBPAgAATgEAAFYCAABBAgAARBbIAE8CAABSAQAAVAIAAE8CAABSAgAARQEAAE3fyABBYsgATj7IAFQCAABIAgAAQQEAAFJOyABBRcgASQIAAEEBAABUWsgASAIAAEEBAABZAgAAQQEAAEVuyABFAgAAUgEAAEmLyABBdcgAUn/IAEEBAABZAgAAQQMAAEgBAABNpsgASZbIAEUBAABVosgARQIAAEwBAABZAQAAULbIAFMCAABPAgAATgEAAFPCyABPAgAATgEAAFXWyABBzsgATAEAAEUCAABMAQAAWQIAAEEBAABOi8kAQe/IAEHpyABJAQAARBLJAEX+yABSAgAAUwEAAEkHyQBFAQAAUg7JAEEBAABZAQAARiLJAE8CAABSAgAARAEAAEkyyQBZAgAAQQMAAEgBAABKVskAQT7JAFkBAABVAgAAQQIAAE4CAABJAgAAVAIAAEEBAABUAgAAQWfJAE4CAABBAQAASYLJAEF2yQBHAgAATwEAAE4CAABBfckATwEAAE8DAABTAQAAT57JAEkCAABSAgAAUwIAAEUBAABQtskAUAIAAEgCAABJAgAAUgIAAEUBAABS/skAQcvJAEjHyQBJAQAASQEAAEXWyQBOAgAAQQEAAEkDAABB4skASAEAAE7qyQBBAQAAVPLJAEEBAABZAgAAQQIAAEgBAABTCsoASAIAAEEBAABVIsoATBHKAE4CAABEAgAAUgIAAEEBAABWTsoAQULKAE4CAABBN8oASAEAAE4CAABBAwAASAEAAEkCAABPAgAATgEAAFdeygBZAgAARQIAAFIBAABZAgAATAIAAE8CAABSAQAAQ8bKAEGOygBSAgAATAIAAEUCAABUAwAAVAMAAEUBAABIpsoAVQIAAFkCAABMAgAARQIAAFIBAABPAgAAVL/KAFQDAABJusoARQEAAFkBAABVAgAAVAEAAEUSzABB5soATdrKAFUCAABTAQAATgMAAE4CAABBAQAAQgrLAEECAABTAgAAVAIAAEkCAABBAssATgEAAEUCAABOAQAARB7LAFICAABJAgAAQwIAAEsBAABMTssAQSrLAEgBAABFOssATgIAAEE1ywBFAQAASUbLAE4CAABBAQAATQIAAEEBAABNWssAQQIAAEoBAABObssAQWHLAEUCAABDAgAAQQEAAFGCywBVAgAATwIAAEkCAABBAQAAUuLLAEGuywBGmssASQIAAE4CAABBAQAAUAIAAEgCAABJAgAATgIAAEEBAABFyssATgIAAEG5ywBFvcsASQIAAFQCAABZAQAAR9bLAEkCAABPAQAASQIAAE4CAABBAQAAVOrLAEgBAABW/ssARfbLAE4BAABZAgAATgEAAFkCAABNAgAATwIAAFUCAABSAQAASLbQAEFuzgBBIswATgEAAEQlzABFN8wATAIAAFkCAABOAQAASUvMAExCzABBAQAATgIAAEEBAABLXswASQIAAEFVzABSAgAAQQEAAEx2zABPAgAATWnMAE4CAABEAgAAQQEAAE2azABBgswAUgEAAEWOzABLAgAAQQEAAEkCAABLAgAAQQEAAE5DzQBBr8wARaXMAFkCAABBAQAARL7MAEG1zABSAgAAQQEAAEXXzABLyswAQQEAAEwDAABMAwAARQEAAEkPzQBB3cwAQ+bMAEUBAABL7swAQQEAAFH6zABVAgAAQQEAAFQCzQBBAQAAWQIAAEEDAABIAQAATiLNAEEbzQBOAQAATwIAAE4BAABPKs0ATgEAAFQCAABBMc0ARQMAAEwDAABMAwAARQEAAFFqzQBVAgAAQVLNAE4BAABJAgAATGLNAEwCAABFAQAAVAIAAEEBAABS0s0AQXHNAEV+zQBFec0ATgEAAEmPzQBGhc0AVAIAAEEBAABMqs0AQZXNAEUCAABFos0ATgEAAE4CAABFAQAAT7rNAE4DAABEAgAAQQEAAFLGzQBPAgAATgEAAFkCAABMzc0ATgEAAFPezQBUAgAAQQEAAFXyzQBOAwAAQenNAE4CAABBAQAAVgbOAE8CAABOAwAATgIAAEUBAABXOs4AQRrOAE4CAABEAgAAQQEAAE4DAABBIc4ARCrOAEEBAABFMs4ARQEAAE4CAABBAQAAWQMAAEFBzgBFRc4ATGLOAEFNzgBFVs4ARQEAAFkCAABOAgAATgEAAE4CAABBac4ARQEAAEXSzwBBdc4ARIrOAFICAABJAgAAQwIAAEsBAABFls4ATgIAAEEBAABJos4ATAIAAEEBAABM7s4AQrbOAEmzzgBFAQAAWQEAAETCzgBPAgAATgEAAEnKzgBBAQAATOLOAEXWzgBZAQAASd/OAEUBAABZAQAAVAIAAE8CAABOAQAATfrOAEECAABSAQAATgLPAEEBAABQIs8AQRLPAFICAABEAQAASAIAAEUCAABSAgAARAEAAFLGzwBFLs8ARQEAAElXzwBEPs8AQQIAAE4BAABFQc8ATE7PAFkCAABOAQAAVAIAAEEBAABMYs8AWQIAAE4BAABNbs8AQQIAAE4BAABPds8ATgEAAFKmzwBFhs8ATAIAAEwBAABJl88ARY3PAEwCAABMAQAAT57PAE4BAABZAwAATAEAAFe+zwBJss8ATgEAAE8CAABPAgAARAEAAFkCAABMAQAAWQIAAEwCAABBAQAASTrQAEHnzwBOAgAATgIAAEUBAABF8s8ATAIAAEEBAABM/s8ATwMAAEgBAABNCtAATwIAAE4BAABSKtAAQRHQAEwCAABFAgAARR3QAE4m0ABFAQAAWQEAAFYCAABBAgAATgIAAEkBAABMStAATwIAAE0CAABPAQAATVrQAFUCAABFAgAATAEAAE+K0ABOd9AAQWXQAERu0ABBAQAATgIAAEEBAABTAgAASAIAAEECAABOAgAAQQEAAFKa0ABFAgAAWQIAAEEBAABZAgAAQa7QAE4CAABOAwAARQEAAEwCAABBAQAASfrRAEG90ABCytAAWQIAAEwBAABE89AARObQAEgCAABBAgAAUgIAAFQCAABIAQAATgIAAEUCAABZAQAARRbRAE4G0QBB/dAATgIAAEEBAABSAgAAQQ3RAFICAABBAQAARz7RAE0q0QBVAgAATgIAAEQBAABOMtEARQEAAFICAABJAgAARAEAAEx60QBBStEAUwEAAFYCAABBWtEATgIAAEEBAABFbtEAUwIAAFQCAABSAgAARQEAAEkCAABBddEATwEAAE2m0QBFitEATwIAAE4BAABPmtEATgMAAEGV0QBFAQAAUgIAAEECAABOAQAATsrRAEGy0QBJAQAAQ8LRAEUCAABSAgAARQEAAEQCAABZAQAAT97RAEICAABIAgAAQQIAAE4BAABS8tEARe7RAE4CAABBAQAASQEAAFkCAABBAQAASy7SAFkDAABFBdIATAIAAEEX0gBIEdIAUgEAAEUi0gBFHdIAUgEAAFkCAABOAgAATgEAAExO0gBBPtIARAIAAEUBAABPAgAAQQIAAE4DAABFAQAATV7SAEkCAABUAgAASAEAAE8q0wBDdtIATwIAAFICAABSAgAATwEAAEaG0gBJAgAAQYHSAEUBAABMv9IAQZbSAE4CAABBAQAARa7SAESm0gBBAgAARAEAAEkCAABMAQAATwIAAE0CAABPAgAATgEAAE3O0gBNAgAARQIAAFIBAABO/tIARN7SAFICAABBAQAASebSAEEBAABK7tIAQQEAAE720gBZAQAAWQIAAEEBAABQEtMASAIAAEkCAABBDdMARQEAAFICAABBI9MAWQIAAEEBAABFAgAATgEAAFBe0wBFTtMATgIAAENC0wBFAgAAUgEAAFMCAABFAgAAUgEAAFICAABJAgAATgIAAEcBAABU6tQAQdLTAEOC0wBFctMAWQEAAEl/0wBBedMARQEAAFkBAABGltMARgIAAE8CAABSAgAARAEAAE7D0wBGqtMATwIAAFICAABEAQAATLbTAEUCAABZAQAAVAIAAE8CAABOAQAAUgMAAEzO0wBBAQAAUgEAAEW21ABF4tMATAIAAEUBAABGFtQAQQLUAE4DAABJ+9MAQfXTAEUBAABP/dMAWQEAAEYCAABBAgAATgIAAEkCAABFAQAATCLUAEwCAABBAQAAUGbUAEgCAABBTtQASTrUAE4CAABFAQAATgMAAElL1ABBRdQARQEAAFkBAABFXtQATgMAAEkCAABFAQAATwIAAE4BAABSetQATAIAAEkCAABOAgAARwEAAFSK1ABTAgAATwIAAE4BAABWptQAQZbUAE4BAABFn9QATgEAAEkCAABFAQAAVwIAAEECAABSAgAAVAEAAE/a1ABOxtQARQMAAFkBAABSAgAATQMAAEnX1ABFAQAAWQEAAFUCAABBAgAAUgIAAFQBAABV6tUARPrUAEkCAABFAQAARQ/VAEwCAABMAgAARQIAAE4BAABMJtUATAIAAEkCAABWAgAAQQIAAE4BAABNQtUATTbVAEUCAABSAQAATgIAAEUCAABSAQAATnbVAERS1QBBAgAAWQEAAE5i1QBJX9UARQEAAFkBAABTAgAASAIAAEkCAABOAgAARQEAAFJ+1QBJAQAAU6bVAEGe1QBOAwAAQY3VAE4DAABBm9UASAEAAEUBAABJAgAARQEAAFS21QBUAgAATwIAAE4BAABaAgAAQc7VAE4DAABOAwAAQcnVAEUBAABF3tUAVAIAAFQCAABFAQAASebVAEUBAABZAQAAVvbVAEUCAABOAQAAWQIAAEIO1gBJBtYATAEAAEwCAABFAQAARCrWAE4CAABFItYARR3WAFkBAABJAwAARQEAAEUy1gBEAQAATGrWAEE+1gBTAQAAVgIAAEFK1gBOAQAARV7WAFMCAABUAgAARQIAAFIBAABJAgAAQWXWAEUBAABNjtYAT3rWAE4CAABFAQAAUAIAAEgCAABPAgAATgIAAFkBAABOAgAAQ6LWAEUCAABSAgAARQEAAFQCAABIAgAASQIAAEEBAABUAuIAQfrZAELu1gBBztYAVAIAAEgCAABBAQAARd7WAFQCAABIAgAAQQEAAEkCAABUAgAASAIAAEEBAABE+9YARQIAAE8BAABFEtcATAIAAE8K1wBSAQAAWQIAAE4BAABIKtcAQRnXAEod1wBMAgAASQIAAEEBAABJQ9cATjbXAEEBAABTAgAASAIAAEEBAABKRdcATMbXAEFT1wBOAQAARV7XAEECAABIAQAASY7XAEFr1wBIAQAAU3bXAEgCAABBAQAAVILXAEgCAABBAQAAWQIAAEECAABIAQAATKLXAFUCAABMAgAAQQIAAEgBAABNttcAQQIAAEQCAABHAgAARQEAAE++1wBOAQAAWQIAAEEBAABNTtgAQerXAEzW1wBBAQAAUt/XAEEBAABUAgAASAIAAEEBAABFBtgAS/bXAEEBAABM/tcAQQEAAFICAABBAQAASSPYAEEN2ABFEdgASx7YAEEZ2ABPAQAAUgEAAE0+2ABBMtgAUgIAAEEBAABJO9gARQEAAFkBAABSRtgAQQEAAFkCAABBAQAATr7YAEFV2ABFZtgAUwIAAEgCAABBAQAAR3bYAEUCAABMAgAAQQEAAEme2ABBfdgAS4bYAEEBAABTktgASAIAAEEBAABZAgAAQQMAAEgBAABKptgAQQEAAE622ABBrdgARQIAAFIBAABZAgAAQQEAAFL+2ABB19gASMnYAErS2ABJAQAATgEAAEnj2ABL3dgAUQEAAE/q2ABOAQAAU/bYAEgCAABBAQAAWQIAAE4BAABTGtkASBLZAEEJ2QBJAgAAQQEAAEkCAABBAQAAVFLZAEUh2QBJOtkAQQIAAE4CAABBMdkATgIAAEEBAABVQtkATQEAAFkCAABBAgAATgIAAEEBAABWhtkAQW7ZAFICAABFZtkAUwEAAEkCAABTAQAASX7ZAEF12QBPAgAATgEAAE8CAABOAQAAV7LZAEGm2QBOAgAAQZXZAESe2QBBAQAATgIAAEEBAABOAgAAWQMAAEEBAABZAgAAQbnZAETG2QBFAgAATgEAAEzu2QBB09kAUgEAAEXe2QBO2dkAUgEAAEnm2QBOAQAATwIAAFIBAABUAgAAVQIAAE0BAABFitsAQRvaAEcO2gBBAgAATgEAAE4CAABOAgAAQQEAAEQv2gBEAgAASSraAEUBAABZAQAARUbaAEc+2gBBAgAATgEAAE4CAABBAQAAR1LaAEECAABOAQAATXraAFACAABFctoAUgIAAEECAABOAgAAQwIAAEUBAABMAgAARQEAAE622gBBgdoASZLaAFMCAABIAgAAQQEAAEye2gBFAgAAWQEAAE6q2gBJAgAARQEAAFoCAABJAgAATgEAAE/L2gBEAgAATwIAAFICAABPAQAAUmLbAEHf2gBOAgAAQwIAAEUBAABFFtsATOraAEwBAABO9toAQwIAAEUBAABTAgAAQf3aAEUB2wBJDtsAVAIAAEEBAABTAgAAQQEAAEkZ2wBSAgAAQS/bAE4CAABDAgAARQEAAEVG2wBMO9sATAEAAE4CAABDAgAARQEAAElX2wBFTdsATAIAAEwBAABPXtsATgEAAFkBAABTftsATG7bAEEBAABTAwAAQXXbAEkCAABFAQAAVgIAAEkCAABOAQAASM7cAEHO2wBEp9sARAIAAEUCAABVAgAAUwEAAEyy2wBJAgAAQQEAAE662wBFAQAAVAIAAEMCAABIAgAARQIAAFIBAABFRtwAQefbAEQCAABPAgAAUgIAAEUBAABE7tsAQQEAAEz62wBNAgAAQQEAAE8r3ABEEtwATwIAAFICAABBDdwARQEAAFACAABIAgAASQIAAEwCAABVAgAAUwEAAFICAABFPtwAUwIAAEE53ABFAQAATwIAAE4BAABJVtwAQQIAAEcCAABPAQAAT5rcAE2C3ABBctwAUwMAAEkCAABOAgAAQQEAAFACAABTAgAATwIAAE4BAABSAwAAQYncAE4CAABUAgAATwIAAE4BAABSqtwARQIAAFMCAABBAQAAVQIAAFICAABNvtwAQQIAAE4BAABTAgAAVAIAAE8CAABOAQAASQreAEH/3ABH3twATwEAAE7u3ABB5dwATgIAAEEBAABSAgAAQfXcAFICAABBAQAARSrdAFIe3QBBCd0AThbdAEUCAABZAQAAUgIAAEEBAABTAgAASAIAAEEBAABGUt0ARgIAAEFG3QBOAgAASUPdAEUBAABZAQAASQIAAE4CAABZAQAATHLdAEwCAABJYt0ARQEAAE1u3QBBAgAATgEAAFkBAABNs90AQoLdAEUCAABSAQAATaLdAEmO3QBFAQAAT57dAFQCAABIAgAAWQEAAFkBAABPAgAAVAIAAEgCAABZAQAATtbdAEG53QBMxt0ARQIAAFkBAABTAgAATAIAAEUCAABZAQAAT+bdAE4CAABOAgAAQQEAAFPy3QBIAgAAQQEAAFQCAABB/t0ATgEAAE8B3gBVAgAAUwEAAE8K3wBCMt4ARRreAFkBAABJL94AQSbeAFMBAABFKd4ATgEAAFkBAABEO94ARAEAAE1z3gBBSt4AUwMAAEEBAABFVt4ASwIAAEEBAABJY94ASwIAAEEBAABNAgAASW7eAEUBAABZAQAATqLeAER+3gBBAQAARYbeAFkBAABJk94AQY3eAEUBAABKmt4AQQEAAFkDAABBAQAAUu7eAEWu3gBZAQAASbveAEW13gBOAQAAUureAEHO3gBOAgAAQwIAAEUBAABF4t4ATt7eAEMCAABFAQAAWQEAAEkDAABFAQAAWQEAAFP63gBIAgAAQQEAAFYC3wBBAQAAWQIAAEEBAABS6uAAQXLfAEMu3wBFI98ARR3fAFkBAABJK98ARQEAAFkBAABFMd8ATUbfAEECAABJAgAATgIAAEUBAABWYt8ASVrfAE9W3wBOAQAAUwEAAE8CAABOAQAAWQIAAFYCAABPAgAATgEAAEUn4ABBit8AUwIAAFUCAABSAgAARQEAAE2q3wBBAgAASZ7fAE4CAABFAQAAWQIAAE4CAABFAQAATsbfAEGx3wBUAwAARb7fAE4BAABPAgAATgEAAFPe3wBBzd8AUwIAAEHV3wBJAgAARQEAAFYK4ABB5d8ARe7fAFIBAABJ/t8ATvXfAE8CAABOAQAATwIAAE4F4ABSAQAAWQMAAFQa4ABPAgAATgEAAFYCAABPAgAATgEAAEmi4ABDNuAASQIAAEEBAABOWuAAQT3gAEkCAABETuAAQQIAAEQBAABUAgAASVXgAFkBAABQYuAAUAEAAFMCAABIb+AAQQEAAFQCAABBe+AATgEAAEWC4ABOAQAASZLgAEGO4ABOAQAATgEAAE+a4ABOAQAAWQIAAE4BAABPquAAWQEAAFXX4ABEvuAASbvgAEUBAABZAQAARcvgAFQCAABUAQAATQIAAEECAABOAQAAWQIAAFMCAABUAgAAQQIAAE4BAABVIuEAQ/7gAEsCAABFAgAAUgEAAEUS4QBTAgAARAIAAEECAABZAQAAUgIAAE4CAABFAgAAUgEAAFc+4QBJMuEATAIAAEEBAABZAgAATAIAAEEBAABZ9+EAQVbhAE4CAABBTeEATgIAAEEBAABDXuEARQEAAEVv4QBTAgAASAIAAEEBAABMjuEAQX/hAE554QBSAQAARYbhAFIBAABPAgAAUgEAAFGe4QBVAgAAQQIAAE4BAABS2uEAQavhAE4BAABFxuEARbfhAEsBAABMv+EATAEAAFMCAABFAQAAT9LhAE4DAABFAQAAVQIAAFMBAABTAgAASO7hAEECAABXAgAATgEAAE8CAABOAQAAWgIAAFYCAABJAQAAVbbiAEwu4gBJGuIAUwIAAEUCAABTAQAAWQIAAFMCAABTAgAARQIAAFMBAABNOuIAQQIAAFIBAABOZuIAQUHiAElS4gBRAgAAVQIAAEUBAABLAgAATgIAAE8CAABXAgAATgEAAFKm4gBCduIAQQIAAE4BAABJluIAQYLiAEgBAABFiuIATAEAAEoCAABBAgAASAEAAFMCAABVAgAATAIAAEEBAABaAgAASQIAAEUCAABMAQAAVrrmAEGq4wBExuIAQQEAAEw34wBB2uIAUgIAAEkCAABFAQAARRrjAE4G4wBD7uIASQIAAEEBAABUAgAASQIAAE4DAABB/eIARQHjAE8BAABSAgAASRbjAEER4wBFAQAAWQEAAEwm4wBJAgAARQEAAE8CAABSAgAASQIAAEUBAABOc+MAQ0LjAEUBAABFVuMAUwIAAEFN4wBTAgAAQQEAAEle4wBBAQAATgIAAEUCAABTAgAAUwIAAEEBAABSfuMAVQIAAE4BAABTjuMASAIAAFQCAABJAQAAVZ7jAEcCAABIAgAATgEAAFkCAABEAgAAQQEAAEXi5ABEtuMAQQEAAEW+4wBSAQAATOrjAETK4wBBAQAASdLjAEEBAABN2uMAQQEAAFYCAABB4eMARQIAAFQBAABOHuQAQfHjAEUC5ABTAgAAUwIAAEEBAABJFuQAQw7kAEUBAABUAgAAQQEAAFUCAABTAQAAUs7kAEEl5ABEQuQAQS3kAEU65ABMAgAATAEAAEkCAABFAQAAR07kAEkCAABFAQAATGPkAEFV5ABJAgAARV3kAE4BAABOo+QAQWnkAEWD5ABMduQATAEAAFQCAABUAgAAQQEAAEma5ABDjuQARQEAAEWR5ABUAgAAQQEAAE8CAABOAQAAT8LkAE4CAABBreQASQIAAEO65ABBAQAASwIAAEEBAABTAgAASQIAAEUBAABTAgAAVAIAAEHZ5ABFAgAAUgEAAEmC5gBBAuUATgIAAEX25ABZAQAATgIAAEUCAABZAQAAQ0blAEUW5QBOAgAAVAIAAEUBAABLLuUARSLlAFkBAABJK+UARQEAAFkBAABUAgAATwIAAFIDAABJQuUAQQEAAFkBAABEUuUAQQMAAEwBAABFYuUATgIAAE4CAABBAQAASHLlAEECAABBAgAATgEAAEuS5QBLfuUASQEAAFQCAABPAgAAUgMAAEkCAABBAQAATJ7lAE0CAABBAQAATt7lAEGl5QBDxuUARQMAAE4CAABUu+UARQEAAFoCAABBweUATwEAAE7S5QBJAgAARQEAAFMCAABPAgAATgEAAE8C5gBMAgAAQenlAEUCAABUAwAAQfXlAFQCAABB/eUARQEAAFI65gBHIuYASQIAAEUR5gBMFeYATgIAAEkCAABBAQAASQIAAEQCAABJAgAAQQIAAE4CAABBAQAAVEbmAEFB5gBPAQAAVgIAAEFX5gBBAgAATgEAAEkCAABBcuYATgMAAEFl5gBOAgAAQW3mAEUBAABFAgAATgMAAE4CAABFAQAATJ7mAEECAABEAgAASQIAAE0CAABJAgAAUgEAAE8CAABOAwAARK7mAEEBAABOAgAASQIAAEUBAABXCusAQd7nAETK5gBFAQAATArnAETW5gBPAQAAS+LmAEUCAABSAQAATPbmAEHy5gBDAgAARQEAAFkBAABUAwAARQLnAFIBAABPAgAATgEAAE4u5wBEFucAQQEAAEUi5wBUAgAAQQEAAEkCAABUAgAAQQEAAFJa5wBEQ+cARQIAAEwCAABMAQAATk7nAEUCAABSAQAAUgIAAEUCAABOAQAAU3rnAEgCAABJAgAATgIAAEcCAABUAgAATwIAAE4BAABUiucAUwIAAE8CAABOAQAAVp7nAEUCAABSAgAATAIAAFkBAABZAgAATMLnAEGy5wBOAgAARAEAAEW65wBOAQAATwIAAE4BAABN1ucAQc7nAE4BAABPAgAATgEAAE4CAABFAQAARa7oAEL25wBTAgAAVAIAAEUCAABSAQAATDLoAEQG6ABPAgAATgEAAEwm6ABJIugATgIAAEcCAABUAgAATwIAAE4BAABTAQAAVAIAAE8CAABOAQAATlroAEQCAABBRugATAIAAEwBAABFUugATAIAAEwBAABJVegAWQEAAFJq6ABOAgAARQIAAFIBAABTAwAATHroAEUCAABZAQAAU4boAE8CAABOAQAAVAMAAEmS6ABOAQAATJ7oAEUCAABZAQAAT6boAE4BAABZAgAATgEAAEjS6ABJAgAAVAIAAEzG6ABFAgAAWQEAAE4CAABFAgAAWQEAAElm6gBMvukAQvboAEXq6ABSAwAAVAEAAFUCAABSAwAATgEAAEQG6QBB/egARQIAAFIBAABFDukAWQEAAEYu6QBPHukAUgIAAEQBAABSAgAARQIAAEQDAABPAQAASErpAEUCAABMAgAATQIAAEkCAABOAgAAQQEAAEyX6QBBX+kATVXpAFICAABEAQAARW7pAE1l6QBOAgAARQEAAEmK6QBBg+kATX/pAFMBAABOAQAARYXpAFMBAABPkukAVwEAAFkBAABNpukAQZ3pAEUCAABSAQAAU7LpAE8CAABOAQAAVAIAAE8CAABOAQAATgIAAETW6QBF0ukATAIAAEwBAABZAQAARgLqAEnq6QBFAgAATAIAAEQBAABP9ukAUgIAAEQBAABSAgAARQIAAEQBAABJFuoARgIAAFICAABFAgAARAEAAE4y6gBJAgAARSHqAEYCAABSAgAARQIAAEQBAABPPuoATgIAAEEBAABTWuoATE7qAE8CAABXAQAAVAIAAE8CAABOAQAAVAIAAEUCAABSAQAATWnqAE+e6gBMhuoARgIAAEcCAABBAgAATgIAAEcBAABPAgAARAIAAFKa6gBPAgAAVwEAAFkBAABStuoARQIAAE4DAABMAgAARQIAAFkBAABZAgAAQcbqAFQCAABUAQAATN7qAETW6gBFAgAAUgEAAEkCAABFAQAATerqAEECAABOAQAATgIAAE7x6gBP/uoATgIAAEEBAABUAgAARQIAAFIBAABYuusAQTrrAE4i6wBEAgAARQIAAFIBAABWAgAASQMAAEUy6wBSAQAATwIAAE4BAABFTusATgIAAEFF6wBJAgAAQQEAAEmK6wBNYusARQIAAE4CAABBAQAAT3brAE0CAABBAgAAUgIAAEEBAABUAgAATAIAAEECAABMAgAASQEAAE+i6wBDAgAASAIAAEkCAABUAgAATAEAAFoCAABBAgAAVgIAAEkCAABFAgAAUgEAAFna7gBBEu0AQdLrAEsCAABPAgAAVgEAAETq6wBJAgAAReLrAEwBAABSAgAAQQEAAEXy6wBMAQAASBbsAEEG7ABJAgAAUgIAAEEBAABJDuwAUgEAAFkCAABBAQAASR7sAFIBAABKMuwAQQIAAEkCAABSAgAAQQEAAEs+7ABPAgAAVgEAAE1W7ABJAgAATAIAAEUCAABUAwAASAEAAE6K7ABBXewAQ2bsAFkBAABEcuwARQIAAEwBAABFfuwATAIAAEkBAABJAgAAUgIAAEEBAABSwuwAQZHsAEWy7ABMouwASZ3sAFkBAABUAgAAWgIAAEmt7ABZAQAASQIAAFQCAABaAgAAQQEAAFP+7ABF0uwARQIAAE4BAABI1ewASeLsAE7d7ABSAQAATQIAAEXy7ABFAgAATgEAAEkCAABOAwAARQEAAFoCAABNAgAASQIAAE4DAABFAQAARZLtAEg67QBPLu0AUwIAAEgCAABVAgAAQQEAAFUCAABEAgAAQQEAAFOG7QBFTu0ATgIAAEkCAABBAQAASFrtAFUCAABBAQAASWbtAEMCAABBAQAAUwIAAEV67QBOAgAASQIAAEEBAABJAgAAQwIAAEEBAABUAgAAVAIAAEEBAABJwu0AU6rtAFICAABPAgAARQIAAEwBAABUAgAAWgIAAEMCAABIAgAATwIAAEsBAABPWu4AQ97tAEgCAABFAgAAVgIAAEUCAABEAQAARebtAEwBAABMCu4AQfrtAE4CAABEAgAAQQEAAE8CAABOAgAARAIAAEEBAABOHu4AQQIAAFQCAABBAgAATgEAAFM27gBFAgAARinuAEwCAABJAgAATgEAAFUCAABOQu4ARwEAAFMCAABFTu4ARgEAAFMCAABFAgAARgEAAFW27gBMfu4ASQIAAEFy7gBOAgAAQQEAAFMCAABTAgAAQQEAAE6G7gBBAQAAUpruAEkDAABEAgAASQIAAEEBAABTAgAARabuAEYBAABSru4AQQEAAFUCAABGAQAAVgIAAEXK7gBUAgAAVAIAAEUBAABPAgAATgIAAE4CAABFAQAAWgIAAEFi8ABDKu8ASA/vAEEC7wBSAgAASf7uAEECAABIAQAAWQEAAEUCAABSAgAA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";
function decodeGenderData() {
  if (typeof atob === "function") {
    const binary = atob(GENDER_DATA_BASE64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  } else {
    return Buffer.from(GENDER_DATA_BASE64, "base64").buffer;
  }
}

// src/gender/coverage95.ts
var instance = null;
function createGenderDB(options) {
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
export {
  BUILT_IN_PRONOUNS,
  COMMON_FIRST_NAMES,
  COMMON_SURNAMES,
  GenderDB,
  MULTI_WORD_PARTICLES,
  PARTICLES,
  SPEC_ALIASES,
  classifyName,
  createGenderDB,
  entityToLegacy,
  extractPronouns,
  fillPronounTemplate,
  fillPronounTemplateSmart,
  formatName,
  formatPronoun,
  getDefaultPronouns,
  getFirstName,
  getLastName,
  getNickname,
  getPronounSet,
  getPronouns,
  getPronounsForEntity,
  getPronounsForPerson,
  hasPronouns,
  isCommonFirstName,
  isCommonSurname,
  isCompound,
  isFamily,
  isMultiWordParticle,
  isOrganization,
  isParticle,
  isPerson,
  isRejected,
  isUnknown,
  parseName,
  parseNameList,
  parsePersonName,
  parsePronounSpec,
  pronounsToGenderHint
};
