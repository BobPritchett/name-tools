// src/data/utils.ts
function isInList(list, value) {
  if (!value) return false;
  const cleanedValue = value.toLowerCase().replace(/\./g, "").trim();
  return list.some((item) => {
    const cleanedItem = item.toLowerCase().replace(/\./g, "").trim();
    return cleanedItem === cleanedValue;
  });
}

// src/data/prefixes.ts
var PREFIXES = [
  // Standard Academic/Professional
  "Dr",
  // Doctor
  "Dr.",
  "Prof",
  // Professor
  "Prof.",
  "Professor",
  "Rev",
  // Reverend
  "Rev.",
  "Reverend",
  "Hon",
  // Honourable
  "Hon.",
  "Honourable",
  "Right Honourable",
  "The Right Honourable",
  "The Hon",
  "The Hon Dr",
  "The Hon Lady",
  "The Hon Lord",
  "The Hon Mrs",
  "The Hon Sir",
  "The Honourable",
  "The Rt Hon",
  // The Right Honourable
  "The Rt Hon Dr",
  "The Rt Hon Lord",
  "The Rt Hon Sir",
  "The Rt Hon Visc",
  // The Right Honourable Viscount
  "Justice",
  "Judge",
  "The Learned Judge",
  // Common/Social
  "Mr",
  "Mr.",
  "Mrs",
  "Mrs.",
  "Ms",
  "Ms.",
  "Miss",
  "Master",
  "Mx",
  "M",
  // Monsieur
  "Mme",
  // Madame
  "Madam",
  "Madame",
  // Religious
  "Archbishop",
  "Archbishop Emeritus",
  "Archdeacon",
  "Bishop",
  "Bishop Emeritus",
  "Brother",
  "Brother Superior",
  "Canon",
  "Cardinal",
  "Chaplain",
  "Chaplain General",
  "Chaplain-in-Chief",
  "Dom",
  "Elder",
  "Father",
  "Monsignor",
  "Most Reverend",
  "The Most Reverend",
  "Pastor",
  "Provincial",
  "Rabbi",
  "Rector",
  "Rector Magnificus",
  "Rev Canon",
  "Rev Dr",
  "The Reverend Canon",
  "Right Reverend",
  "Sister",
  "Suffragan Bishop",
  "The Venerable",
  "Very Reverend",
  // Military
  "Admiral",
  "Rear Admiral",
  "Vice Admiral",
  "Air Chief Marshal",
  "Air Commodore",
  "Air Marshal",
  "Air Vice Marshal",
  "Brigadier",
  "Brig Gen",
  // Brigadier General
  "Capt",
  // Captain
  "Captain",
  "Col",
  // Colonel
  "Colonel",
  "Colour Sergeant",
  "Commander",
  "Commodore",
  "Cpl",
  // Corporal
  "Field Marshal",
  "Flight Lieutenant",
  "General",
  "Major General",
  "Lieutenant General",
  "Lance Corporal",
  "Lance Sergeant",
  "Lt",
  // Lieutenant
  "Lt Col",
  // Lieutenant Colonel
  "Lt Commander",
  "Lt Cpl",
  // Lance Corporal
  "Lt General",
  "Major",
  "Marshal of the RAF",
  // Marshal of the Royal Air Force
  "Petty Officer",
  "Pipe Major",
  "Pvt",
  // Private
  "Regimental Corporal Major",
  "Regimental Sergeant Major",
  "Second Lieutenant",
  "Senior Aircraftman",
  "Senior Aircraftwoman",
  "Sgt",
  // Sergeant
  "Squadron Leader",
  "Staff Corporal",
  "Staff Sergeant",
  "Warrant Officer",
  "Warrant Officer Class 1",
  "Warrant Officer Class 2",
  // Nobility/Royalty
  "Archduke",
  "Baron",
  "Baron of Parliament",
  "Baroness",
  "Baronet",
  "Baronial Lord",
  "Count",
  "Count Palatine",
  "Countess",
  "Countess of",
  "Dowager Countess",
  "Dame",
  "Dame Commander",
  "Dame Grand Cross",
  "Duchess",
  "Duke",
  "Earl",
  "The Earl of",
  "Her Grace",
  "Her Majesty",
  "His Majesty",
  "Her Majesty's Counsel",
  "Hereditary Lord",
  "His Excellency",
  "HE",
  // His/Her Excellency
  "Knight Bachelor",
  "Knight Commander",
  "Knight Grand Cross",
  "Knight Marshal",
  "Lady",
  "Lord",
  "Lord Advocate",
  "Lord Chancellor",
  "Lord Chief Justice",
  "Lord High Admiral",
  "Lord High Commissioner",
  "Lord Justice",
  "Lord Lieutenant",
  "Lord Mayor",
  "Lord of the Manor",
  "Lord President of the Council",
  "Marcher Lord",
  "Marchioness",
  "Marquess",
  "Marquis",
  "Premier Duke",
  "Prince",
  "Prince Consort",
  "Princess",
  "Princess Royal",
  "Sir",
  "The Hon Lady",
  "The Hon Lord",
  "Viscount",
  "Viscountess",
  // Political/Legal/Ambassadorial
  "Alderman",
  "Ambassador",
  "Ambassador-at-Large",
  "Chancellor",
  "Chancellor of the Exchequer",
  "Chief Constable",
  "Chief Justice",
  "Cllr",
  // Councillor
  "Constable of the Tower",
  "Consul",
  "Consul General",
  "Deputy",
  "Deputy High Commissioner",
  "Envoy Extraordinary",
  "HMA",
  // His/Her Majesty's Ambassador
  "High Steward",
  "KC",
  // King's Counsel
  "Keeper of the Privy Seal",
  "Minister",
  "Minister of State",
  "Premier",
  "Senator",
  "Sheriff",
  "Speaker of the House",
  "Vice Chancellor",
  // Academic/Fellowship
  "Archchancellor",
  "Dean",
  "Dean Emeritus",
  "Fellow",
  "Headmaster",
  "Headmistress",
  "Lic",
  // Licentiate
  "Master of Arts",
  "Master of the Rolls",
  "Provost",
  "Provost (academic)",
  "Warden",
  // Combined/Multi-person
  "Brig & Mrs",
  "Commander & Mrs",
  "Lord & Lady",
  "Prof & Dr",
  "Prof & Mrs",
  "Prof & Rev",
  "Prof Dame",
  "Prof Dr",
  "Rev & Mrs",
  "Sir & Lady",
  "The Hon Mrs",
  "The Hon Sir",
  // Others
  "Churchwarden",
  "Freeman of the City",
  "Llc",
  // Limited Liability Company (rare as prefix)
  "Yeoman Warder"
];
function isPrefix(str) {
  return isInList(PREFIXES, str);
}

// src/data/suffixes.ts
var SUFFIXES = [
  "Jr",
  "Jr.",
  "Sr",
  "Sr.",
  "II",
  "III",
  "IV",
  "V",
  "PhD",
  "Ph.D.",
  "MD",
  "M.D.",
  "Esq",
  "Esq.",
  "DDS",
  "D.D.S.",
  "JD",
  "J.D.",
  "MBA",
  "M.B.A.",
  "CPA",
  "RN",
  "DVM"
];
function isSuffix(str) {
  return isInList(SUFFIXES, str);
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

// src/affixes.ts
var ROMAN_NUMERALS = /* @__PURE__ */ new Set(["II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]);
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
var RELIGIOUS = /* @__PURE__ */ new Set(["REV", "REVEREND", "FR", "FATHER", "RABBI", "IMAM", "PASTOR", "SISTER", "SR", "BR", "BROTHER"]);
var MILITARY = /* @__PURE__ */ new Set(["PVT", "CPL", "SGT", "LT", "CPT", "CAPT", "MAJ", "COL", "GEN", "ADM"]);
var JUDICIAL = /* @__PURE__ */ new Set(["JUDGE", "JUSTICE"]);
var PROFESSIONAL = /* @__PURE__ */ new Set(["ESQ", "CPA", "CFA", "PE", "RN", "DDS"]);
var EDUCATION = /* @__PURE__ */ new Set(["PHD", "MD", "JD", "MBA", "MS", "MA", "BS", "BA", "DVM"]);
var POSTNOMINAL_HONOR = /* @__PURE__ */ new Set(["OBE", "MBE", "CBE", "KBE", "DBE"]);
var SPLITTABLE_WORDS = /* @__PURE__ */ new Set([
  ...HONORIFIC,
  ...RELIGIOUS,
  ...MILITARY,
  ...JUDICIAL,
  ...PROFESSIONAL,
  ...EDUCATION,
  ...POSTNOMINAL_HONOR,
  "HON"
  // allow splitting "The Hon Dr" once style phrase is handled
]);
function collapseSpaces(value) {
  return value.trim().replace(/\s+/g, " ");
}
function stripEdgePunctuation(value) {
  return value.trim().replace(/^[,;:\s]+/, "").replace(/[,;:\s]+$/, "");
}
function normalizeAffix(value) {
  const raw = collapseSpaces(stripEdgePunctuation(value));
  const normalized = raw.replace(/^[.]+/, "").replace(/[.]+$/, "").replace(/\s+/g, " ").toUpperCase();
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
  const type = classifyType(normalizedKey, ctx);
  const isAbbrev = looksAbbreviated(v, normalizedKey);
  const requiresCommaBefore = ctx === "suffix" && (type === "generational" || type === "professional" || type === "education" || type === "postnominalHonor" || normalizedKey === "ESQ");
  return {
    type,
    value: v,
    normalized: normalizedKey,
    isAbbrev: isAbbrev || void 0,
    requiresCommaBefore: requiresCommaBefore || void 0
  };
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
    { phrase: ["HER", "EXCELLENCY"], len: 2 }
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
      const styleLen = matchStylePhraseAt(normalizedWords, i);
      if (styleLen > 0) {
        out.push(words.slice(i, i + styleLen).join(" "));
        i += styleLen;
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
function extractIdentitySuffixFromTokens(tokens) {
  if (!tokens || tokens.length === 0) return void 0;
  const identity = tokens.filter((t) => t.type === "generational" || t.type === "dynasticNumber").map((t) => t.value).filter(Boolean);
  return identity.length > 0 ? identity.join(", ") : void 0;
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
  const parts = workingText.split(",");
  while (parts.length > 1) {
    const lastPart = parts[parts.length - 1].trim();
    const firstWordOfLast = lastPart.split(/\s+/)[0];
    if (isSuffix(firstWordOfLast) || /queen|king|consort/i.test(lastPart)) {
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
    if (isSuffix(cleanWord)) {
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
  while (parts.length > 1) {
    let matchFound = false;
    for (let len = Math.min(parts.length - 1, 5); len >= 1; len--) {
      const candidate = parts.slice(0, len).join(" ");
      if (isPrefix(candidate)) {
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
    order: options?.order ?? base.order
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
function isIdentitySuffixToken(token) {
  const t = token.trim().replace(/[.,]/g, "");
  if (!t) return false;
  if (/^(jr|sr)$/i.test(t)) return true;
  if (/^(ii|iii|iv|v|vi|vii|viii|ix|x)$/i.test(t)) return true;
  return false;
}
function extractIdentitySuffix(suffix) {
  const rawTokens = suffix.split(",").map((s) => s.trim()).filter(Boolean);
  const identityParts = [];
  for (const chunk of rawTokens) {
    const firstWord = chunk.split(/\s+/)[0] ?? "";
    if (isIdentitySuffixToken(firstWord)) {
      identityParts.push(chunk);
    }
  }
  return identityParts.length > 0 ? identityParts.join(", ") : void 0;
}
function resolveGiven(parsed, prefer) {
  const first = parsed.first ? normalizeTrim(parsed.first) : void 0;
  const nickname = parsed.nickname ? normalizeTrim(parsed.nickname) : void 0;
  const preferredGiven = parsed.preferredGiven ? normalizeTrim(parsed.preferredGiven) : void 0;
  if (prefer === "nickname") return preferredGiven ?? nickname ?? first;
  if (prefer === "first") return first ?? nickname;
  return first ?? nickname;
}
function resolvePrefix(parsed, prefixMode) {
  const prefix = parsed.prefix ? normalizeCollapseSpaces(parsed.prefix) : void 0;
  if (!prefix) return void 0;
  if (prefixMode === "omit") return void 0;
  if (prefixMode === "include") return prefix;
  return prefix;
}
function resolveLast(parsed) {
  if (parsed.last == null) return void 0;
  const last = normalizeTrim(parsed.last);
  return last.length > 0 ? last : void 0;
}
function resolveSuffix(parsed, suffixMode) {
  const suffix = parsed.suffix ? normalizeCollapseSpaces(parsed.suffix) : void 0;
  if (suffixMode === "omit") return void 0;
  if (suffixMode === "include") return suffix;
  const identityFromTokens = extractIdentitySuffixFromTokens(parsed.suffixTokens);
  if (identityFromTokens) return identityFromTokens;
  if (!suffix) return void 0;
  return extractIdentitySuffix(suffix);
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
  const prefixText = resolvePrefix(parsed, o.prefix);
  const lastText = resolveLast(parsed);
  const suffixText = resolveSuffix(parsed, o.suffix);
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
  PREFIXES,
  SUFFIXES,
  formatName,
  getFirstName,
  getLastName,
  getNickname,
  isCommonFirstName,
  isCommonSurname,
  isMultiWordParticle,
  isParticle,
  isPrefix,
  isSuffix,
  parseName
};
