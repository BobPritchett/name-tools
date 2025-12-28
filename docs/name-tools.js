// src/data/utils.ts
function isInList(list, value) {
  if (!value) return false;
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
    if (e.ctx !== "both" && e.ctx !== ctx) continue;
    const candidates = [];
    if (e.short) candidates.push(e.short);
    if (e.long) candidates.push(e.long);
    if (e.variants) candidates.push(...e.variants);
    for (const v of candidates) {
      const k = normalizeAffixVariantForMatch(v);
      if (!k) continue;
      if (!map.has(k)) map.set(k, e);
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
  // Multi-person combined prefixes (UK)
  // ---------------------------------------------------------------------------
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
  if (entry.short) candidates.push(entry.short);
  if (entry.long) candidates.push(entry.long);
  if (entry.variants) candidates.push(...entry.variants);
  for (const c of candidates) {
    const k = normalizeAffixVariantForMatch(c);
    if (k && !k.includes(" ")) SPLITTABLE_WORDS.add(k);
  }
}
var MULTIWORD_PREFIX_PHRASES = (() => {
  const phrases = [];
  const add = (s) => {
    const k = normalizeAffixVariantForMatch(s);
    if (!k || !k.includes(" ")) return;
    const words = k.split(" ").filter(Boolean);
    if (words.length >= 2) phrases.push({ words, len: words.length });
  };
  for (const entry of PREFIX_AFFIX_ENTRIES) {
    if (entry.short) add(entry.short);
    if (entry.long) add(entry.long);
    if (entry.variants) entry.variants.forEach(add);
  }
  phrases.sort((a, b) => b.len - a.len);
  const seen = /* @__PURE__ */ new Set();
  return phrases.filter((p) => {
    const key = p.words.join(" ");
    if (seen.has(key)) return false;
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
  if (/[.]/.test(value)) return true;
  if (normalizedKey.includes(" ")) return false;
  return /^[A-Z]{2,5}$/.test(normalizedKey);
}
function classifyType(normalizedKey, ctx) {
  if (ROMAN_NUMERALS.has(normalizedKey) && ctx === "suffix") return "dynasticNumber";
  if (/^(JR|SR)$/.test(normalizedKey)) return "generational";
  if (NOBILITY_AND_ROYALTY.has(normalizedKey)) return "style";
  if (EDUCATION.has(normalizedKey)) return "education";
  if (PROFESSIONAL.has(normalizedKey)) return "professional";
  if (POSTNOMINAL_HONOR.has(normalizedKey)) return "postnominalHonor";
  if (MILITARY.has(normalizedKey)) return "military";
  if (JUDICIAL.has(normalizedKey)) return "judicial";
  if (normalizedKey === "SR" && ctx === "prefix") return "religious";
  if (RELIGIOUS.has(normalizedKey)) return "religious";
  if (HONORIFIC.has(normalizedKey)) return "honorific";
  if (STYLE_PHRASES.has(normalizedKey)) return "style";
  if (ctx === "prefix" && normalizedKey.includes(" ")) {
    const k = normalizedKey;
    if (k.includes("EXCELLENCY") || k.includes("HONOURABLE") || k.includes("HON")) return "style";
    if (k.includes("JUDGE") || k.includes("JUSTICE")) return "judicial";
    if (k.includes("RABBI") || k.includes("IMAM") || k.includes("REVEREND") || k.includes("SISTER") || k.includes("BROTHER") || k.includes("FATHER")) return "religious";
    if (k.includes("ADMIRAL") || k.includes("MARSHAL") || k.includes("GENERAL") || k.includes("COLONEL") || k.includes("CAPTAIN") || k.includes("LIEUTENANT") || k.includes("SERGEANT")) {
      return "military";
    }
  }
  if (ctx === "suffix" && normalizedKey.includes(" ")) {
    const k = normalizedKey;
    if (k.includes("PHD") || k.includes("MBA") || k.includes("MD") || k.includes("JD")) return "education";
    if (k.includes("ESQ") || k.includes("CPA") || k.includes("RN") || k.includes("PE")) return "professional";
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
    if (remaining.length < p.len) continue;
    const slice = remaining.slice(0, p.len).join(" ");
    if (slice === p.words.join(" ")) return p.len;
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
    if (remaining.length < c.len) continue;
    const slice = remaining.slice(0, c.len).join(" ");
    if (slice === c.phrase.join(" ")) return c.len;
  }
  return 0;
}
function splitAffixToAtomicParts(value, ctx) {
  const raw = collapseSpaces(value);
  if (!raw) return [];
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
  if (!displayValue) return void 0;
  const parts = splitAffixToAtomicParts(displayValue, ctx);
  if (parts.length === 0) return void 0;
  return parts.map((p) => classifyAffixToken(p, ctx));
}

// src/parsers.ts
function parseName(fullName) {
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
    if (!v) return false;
    if (v.length > 18) return false;
    if (/\d/.test(v)) return false;
    if (/[^\p{L}.\-\s]/u.test(v)) return false;
    if (!/[.]/.test(v) && !/[A-Z]/.test(v)) return false;
    const lettersOnly = v.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[.\-\s]/g, "");
    if (!/^[A-Za-z]+$/.test(lettersOnly)) return false;
    if (lettersOnly.length < 2 || lettersOnly.length > 10) return false;
    const upperCount = (lettersOnly.match(/[A-Z]/g) ?? []).length;
    if (!/[.]/.test(v) && upperCount / lettersOnly.length < 0.7) return false;
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
  if (parts.length === 0) return;
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
  if (!last) return;
  const words = last.split(/\s+/).filter(Boolean);
  if (words.length < 2) return;
  const lowerWords = words.map((w) => w.toLowerCase());
  const candidates = [...FAMILY_PARTICLE_PHRASES].sort((a, b) => b.split(" ").length - a.split(" ").length);
  for (const phrase of candidates) {
    const pWords = phrase.split(" ");
    if (pWords.length >= words.length) continue;
    const matches = pWords.every((pw, idx) => lowerWords[idx] === pw);
    if (!matches) continue;
    const particleOriginal = words.slice(0, pWords.length).join(" ");
    const remainderWords = words.slice(pWords.length);
    if (remainderWords.length === 0) return;
    result.familyParticle = particleOriginal;
    result.familyParts = remainderWords;
    result.familyParticleBehavior = "localeDefault";
    return;
  }
}
function derivePreferredGiven(result) {
  if (result.preferredGiven) return;
  const nick = result.nickname?.trim();
  if (!nick) return;
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
  if (!display) return;
  const key = display.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  result.sort = { display, key };
}
function getFirstName(fullName) {
  return parseName(fullName).first;
}
function getLastName(fullName) {
  return parseName(fullName).last;
}
function getNickname(fullName) {
  return parseName(fullName).nickname;
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
function ensureParsed(name) {
  return typeof name === "string" ? parseName(name) : name;
}
function toWords(value) {
  return value.split(/\s+/).map((w) => w.trim()).filter(Boolean);
}
function toInitial(word) {
  const w = word.trim();
  if (!w) return void 0;
  return w.charAt(0).toUpperCase() + ".";
}
function resolveGiven(parsed, prefer) {
  const first = parsed.first ? normalizeTrim(parsed.first) : void 0;
  const nickname = parsed.nickname ? normalizeTrim(parsed.nickname) : void 0;
  const preferredGiven = parsed.preferredGiven ? normalizeTrim(parsed.preferredGiven) : void 0;
  if (prefer === "nickname") return preferredGiven ?? nickname ?? first;
  if (prefer === "first") return first ?? nickname;
  return first ?? nickname;
}
function resolvePrefix(parsed, prefixMode, o) {
  if (prefixMode === "omit") return void 0;
  const renderedFromTokens = renderAffixTokens(parsed.prefixTokens, "prefix", o);
  if (renderedFromTokens) return renderedFromTokens;
  const prefix = parsed.prefix ? normalizeCollapseSpaces(parsed.prefix) : void 0;
  if (!prefix) return void 0;
  if (prefixMode === "include") return prefix;
  return prefix;
}
function resolveLast(parsed) {
  if (parsed.last == null) return void 0;
  const last = normalizeTrim(parsed.last);
  return last.length > 0 ? last : void 0;
}
function resolveSuffix(parsed, suffixMode, o) {
  const suffix = parsed.suffix ? normalizeCollapseSpaces(parsed.suffix) : void 0;
  if (suffixMode === "omit") return void 0;
  if (suffixMode === "include") {
    return renderAffixTokens(parsed.suffixTokens, "suffix", o) ?? suffix;
  }
  if (parsed.suffixTokens && parsed.suffixTokens.length > 0) {
    return renderAffixTokens(parsed.suffixTokens, "suffix", o) ?? suffix;
  }
  return suffix;
}
function applyPunctuation(value, mode) {
  if (mode === "strip") return value.replace(/\./g, "");
  return value;
}
function applyApostrophes(value, mode) {
  if (mode === "ascii") return value.replace(/[\u2019\u2018\u02BC]/g, "'");
  return value;
}
function applyCapitalization(value, mode) {
  if (mode === "lower") return value.toLowerCase();
  if (mode === "upper") return value.toUpperCase();
  return value;
}
function renderAffixTokens(tokens, ctx, o) {
  if (!tokens || tokens.length === 0) return void 0;
  const t = getSpaceTokens(o.output);
  const form = ctx === "prefix" ? o.prefixForm : o.suffixForm;
  const rendered = tokens.map((t2) => {
    if (o.capitalization === "preserve" || o.punctuation === "preserve" || o.apostrophes === "preserve") {
      return String(t2.value ?? "").trim();
    }
    let base = String(t2.value ?? "").trim();
    if (form !== "asInput") {
      const canonical = form === "long" ? t2.canonicalLong : t2.canonicalShort;
      if (canonical) base = canonical;
    }
    base = applyApostrophes(base, o.apostrophes);
    base = applyPunctuation(base, o.punctuation);
    base = applyCapitalization(base, o.capitalization);
    return base.trim();
  }).filter((s) => s.length > 0);
  if (rendered.length === 0) return void 0;
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
  if (initials.length === 0) return "";
  if (initials.length === 1) return initials[0];
  const sep = boundarySpace("initialTight", o, t);
  return initials.join(sep);
}
function renderMiddle(parsed, middleMode, o, t) {
  if (!parsed.middle) return void 0;
  const middle = normalizeTrim(parsed.middle);
  if (!middle) return void 0;
  if (middleMode === "none") return void 0;
  if (middleMode === "full") return middle;
  const initials = toWords(middle).map(toInitial).filter(Boolean);
  if (initials.length === 0) return void 0;
  return joinInitials(initials, o, t);
}
function renderGivenPlusMiddle(parsed, o, t) {
  const given = resolveGiven(parsed, o.prefer);
  if (!given) return { givenLikeText: void 0, finalGivenToken: void 0 };
  if (o.preset === "initialed") {
    const firstInitial = toInitial(given);
    const middleInitials = parsed.middle ? toWords(normalizeTrim(parsed.middle)).map(toInitial).filter(Boolean) : [];
    const all = [firstInitial, ...middleInitials].filter(Boolean);
    const initialsText = joinInitials(all, o, t);
    const finalToken = all.length > 0 ? all[all.length - 1] : given;
    return { givenLikeText: initialsText, finalGivenToken: finalToken };
  }
  const middleText = renderMiddle(parsed, o.middle, o, t);
  if (!middleText) return { givenLikeText: given, finalGivenToken: given };
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
    if (prefixText) pieces.push(prefixText);
    if (lastText) pieces.push(lastText);
    let base2 = "";
    if (pieces.length === 0) base2 = "";
    else if (pieces.length === 1) base2 = pieces[0];
    else base2 = `${pieces[0]}${boundarySpace("prefixToNext", o, t)}${pieces[1]}`;
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
    if (lastText) pieces.push(lastText);
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
  if (prefixText) emitted.push(prefixText);
  if (givenLikeText) emitted.push(givenLikeText);
  if (lastText) emitted.push(lastText);
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
  if (!value) return void 0;
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
function joinList(items, o) {
  const n = items.length;
  if (n === 0) return "";
  if (n === 1) return items[0];
  if (n === 2) return `${items[0]} ${o.conjunction} ${items[1]}`;
  const head = items.slice(0, -1).join(", ");
  const tail = items[n - 1];
  const comma = o.oxfordComma ? "," : "";
  return `${head}${comma} ${o.conjunction} ${tail}`;
}
function shouldShare(mode, same) {
  if (mode === "never") return false;
  if (mode === "whenSame") return same;
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
function formatName(input, options) {
  const o = resolveOptions(options);
  if (Array.isArray(input)) {
    if (o.join === "none") {
      throw new Error('formatName: array input requires options.join !== "none"');
    }
    const parsedPeople = input.map(ensureParsed);
    if (o.join === "list" || parsedPeople.length !== 2) {
      const rendered = parsedPeople.map((p) => renderSingle(p, { ...o, join: "none" }).fullText);
      return joinList(rendered, o);
    }
    const [p1, p2] = parsedPeople;
    const r1 = renderSingle(p1, { ...o, join: "none" });
    const r2 = renderSingle(p2, { ...o, join: "none" });
    return joinCouple(r1, r2, o);
  }
  const parsed = ensureParsed(input);
  return renderSingle(parsed, o).fullText;
}
export {
  COMMON_FIRST_NAMES,
  COMMON_SURNAMES,
  MULTI_WORD_PARTICLES,
  PARTICLES,
  formatName,
  getFirstName,
  getLastName,
  getNickname,
  isCommonFirstName,
  isCommonSurname,
  isMultiWordParticle,
  isParticle,
  parseName
};
