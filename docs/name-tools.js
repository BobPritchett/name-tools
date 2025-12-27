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
function ensureParsed(name) {
  return typeof name === "string" ? parseName(name) : name;
}
function formatLastFirst(name) {
  const parsed = ensureParsed(name);
  if (!parsed.last) {
    const parts = [];
    if (parsed.first) parts.push(parsed.first);
    if (parsed.middle) parts.push(parsed.middle);
    if (parsed.suffix) parts.push(parsed.suffix);
    return parts.join(" ");
  }
  let result = parsed.last;
  if (parsed.first) {
    result += ", " + parsed.first;
  }
  if (parsed.middle) {
    result += " " + parsed.middle;
  }
  if (parsed.suffix) {
    result += ", " + parsed.suffix;
  }
  return result;
}
function formatFirstLast(name) {
  const parsed = ensureParsed(name);
  const parts = [];
  if (parsed.prefix) parts.push(parsed.prefix);
  if (parsed.first) parts.push(parsed.first);
  if (parsed.middle) parts.push(parsed.middle);
  if (parsed.last) parts.push(parsed.last);
  if (parsed.suffix) parts.push(parsed.suffix);
  return parts.join(" ");
}
function formatWithMiddleInitial(name) {
  const parsed = ensureParsed(name);
  const parts = [];
  if (parsed.prefix) parts.push(parsed.prefix);
  if (parsed.first) parts.push(parsed.first);
  if (parsed.middle) {
    const initials = parsed.middle.split(" ").map((m) => m.charAt(0).toUpperCase() + ".").join(" ");
    parts.push(initials);
  }
  if (parsed.last) parts.push(parsed.last);
  if (parsed.suffix) parts.push(parsed.suffix);
  return parts.join(" ");
}
function formatFormal(name) {
  const parsed = ensureParsed(name);
  const parts = [];
  if (parsed.prefix) {
    parts.push(parsed.prefix);
  } else {
    parts.push("Mr/Ms");
  }
  if (parsed.last) {
    parts.push(parsed.last);
  }
  return parts.join(" ");
}
function getInitials(name) {
  const parsed = ensureParsed(name);
  let initials = "";
  if (parsed.first && parsed.first.length > 0) {
    initials += parsed.first.charAt(0).toUpperCase();
  }
  if (parsed.middle) {
    const middleParts = parsed.middle.split(" ");
    for (const part of middleParts) {
      if (!isParticle(part) && part.length > 0) {
        initials += part.charAt(0).toUpperCase();
      }
    }
  }
  if (parsed.last) {
    const lastParts = parsed.last.split(" ");
    for (const part of lastParts) {
      if (!isParticle(part) && part.length > 0) {
        initials += part.charAt(0).toUpperCase();
        break;
      }
    }
  }
  return initials;
}
export {
  COMMON_FIRST_NAMES,
  COMMON_SURNAMES,
  MULTI_WORD_PARTICLES,
  PARTICLES,
  PREFIXES,
  SUFFIXES,
  formatFirstLast,
  formatFormal,
  formatLastFirst,
  formatWithMiddleInitial,
  getFirstName,
  getInitials,
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
