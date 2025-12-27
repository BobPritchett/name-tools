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
  "Mr",
  "Mr.",
  "Mrs",
  "Mrs.",
  "Ms",
  "Ms.",
  "Miss",
  "Dr",
  "Dr.",
  "Prof",
  "Prof.",
  "Rev",
  "Rev.",
  "Hon",
  "Hon.",
  "Sir",
  "Lady",
  "Lord"
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
  const result = { first: "", last: "" };
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
  const commaParts = workingText.split(",");
  if (commaParts.length > 1) {
    const lastPart = commaParts[commaParts.length - 1].trim();
    const firstWordOfLast = lastPart.split(/\s+/)[0];
    if (isSuffix(firstWordOfLast) || /queen|king|consort/i.test(lastPart)) {
      result.suffix = lastPart;
      commaParts.pop();
    }
    workingText = commaParts.join(" ").trim();
  }
  const parts = workingText.split(/\s+/);
  const suffixesFound = [];
  while (parts.length > 1) {
    const lastWord = parts[parts.length - 1];
    if (isSuffix(lastWord) && !(result.suffix && result.suffix.includes(lastWord))) {
      suffixesFound.unshift(lastWord);
      parts.pop();
    } else {
      break;
    }
  }
  if (suffixesFound.length > 0) {
    result.suffix = result.suffix ? result.suffix + ", " + suffixesFound.join(", ") : suffixesFound.join(", ");
  }
  return parts.join(" ");
}
function extractPrefixes(parts, result) {
  const prefixesFound = [];
  while (parts.length > 1) {
    const firstWord = parts[0];
    if (isPrefix(firstWord)) {
      prefixesFound.push(firstWord);
      parts.shift();
    } else {
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
  let surnameStartIndex = parts.length - 1;
  if (parts.length > 1) {
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
  }
  if (surnameStartIndex === 0) {
    if (parts.length === 1) {
      result.first = parts[0];
      result.last = parts[0];
    } else {
      result.last = parts.join(" ");
      result.first = parts[0];
    }
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
  let initials = parsed.first.charAt(0).toUpperCase();
  if (parsed.middle) {
    const middleParts = parsed.middle.split(" ");
    for (const part of middleParts) {
      if (!isParticle(part) && part.length > 0) {
        initials += part.charAt(0).toUpperCase();
      }
    }
  }
  const lastParts = parsed.last.split(" ");
  for (const part of lastParts) {
    if (!isParticle(part) && part.length > 0) {
      initials += part.charAt(0).toUpperCase();
      break;
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
