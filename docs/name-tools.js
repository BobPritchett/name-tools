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
  if (/^[A-Z]\.?$/.test(token))
    return true;
  return /^[A-Z][a-z]+(?:['-][A-Z]?[a-z]+)*$/.test(token);
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
function extractBaseSurname(plural) {
  const word = plural.trim();
  if (/([sc]h|[sxz])es$/i.test(word)) {
    return word.slice(0, -2);
  }
  if (/ies$/i.test(word)) {
    return word.slice(0, -3) + "y";
  }
  if (/s$/i.test(word)) {
    return word.slice(0, -1);
  }
  return word;
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
    familyName = extractBaseSurname(withoutThe);
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
  const parts = normalized.split(",").map((p) => p.trim()).filter(Boolean);
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
    if (/^[A-Z][a-z]+\.?$/.test(firstAfter)) {
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
  const middleText = renderMiddle(parsed, o.middle, o, t);
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
export {
  COMMON_FIRST_NAMES,
  COMMON_SURNAMES,
  MULTI_WORD_PARTICLES,
  PARTICLES,
  classifyName,
  entityToLegacy,
  formatName,
  getFirstName,
  getLastName,
  getNickname,
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
  parsePersonName
};
