/* eslint-disable no-console */
// Utility: check whether a list of affix phrases is recognized by parseName() as a prefix/suffix,
// and whether the recognition is backed by a canonical affix entry (entryId present) vs heuristics.

const { parseName } = require('../dist/index.js');

const RAW = `
Admiral
Air Chief Marshal
Air Commodore
Air Marshal
Air Vice Marshal
Alderman
Ambassador
Ambassador-at-Large
Archbishop
Archbishop Emeritus
Archchancellor
Archdeacon
Archduke
Baron
Baron of Parliament
Baroness
Baronet
Baronial Lord
Bishop
Bishop Emeritus
Brig & Mrs
Brig Gen
Brigadier
Brother
Brother Superior
Canon
Capt
Captain
Cardinal
Chancellor
Chancellor of the Exchequer
Chaplain
Chaplain General
Chaplain-in-Chief
Chief
Chief Constable
Chief Justice
Churchwarden
Cllr
Col
Colonel
Colour Sergeant
Commander
Commander & Mrs
Commodore
Constable of the Tower
Consul
Consul General
Count
Count Palatine
Countess
Countess of
Cpl
Dame
Dame Commander
Dame Grand Cross
Dean
Dean Emeritus
Deputy
Deputy High Commissioner
Dom
Dowager Countess
Dr
Duchess
Duke
Earl
Elder
Envoy Extraordinary
Father
Fellow
Field Marshal
Flight Lieutenant
Freeman of the City
General
HE
Headmaster
Headmistress
Her Grace
Her Majesty's Counsel
Hereditary Lord
High Steward
His Excellency
HMA
Judge
Justice
KC
Keeper of the Privy Seal
Knight Bachelor
Knight Commander
Knight Grand Cross
Knight Marshal
Lady
Lance Corporal
Lance Sergeant
Lic
Llc
Lord
Lord & Lady
Lord Advocate
Lord Chancellor
Lord Chief Justice
Lord High Admiral
Lord High Commissioner
Lord Justice
Lord Lieutenant
Lord Mayor
Lord of the Manor
Lord President of the Council
Lt
Lt Col
Lt Commander
Lt Cpl
Lt General
M
Madam
Madame
Major
Major General
Marcher Lord
Marchioness
Marquess
Marquis
Marshal of the RAF
Master
Master of Arts
Master of the Rolls
Minister
Minister of State
Miss
Mme
Monsignor
Most Reverend
Mr
Mrs
Ms
Mx
Pastor
Petty Officer
Pipe Major
Premier Duke
Prince
Prince Consort
Princess
Princess Royal
Prof
Prof & Dr
Prof & Mrs
Prof & Rev
Prof Dame
Prof Dr
Professor
Provincial
Provost
Provost (academic)
Pvt
Pvt
Rabbi
Rear Admiral
Rector
Rector Magnificus
Regimental Corporal Major
Regimental Sergeant Major
Rev
Rev & Mrs
Rev Canon
Rev Dr
Right Honourable
Right Reverend
Second Lieutenant
Senator
Senior Aircraftman
Senior Aircraftwoman
Sgt
Sheriff
Sir
Sir & Lady
Sister
Speaker of the House
Squadron Leader
Staff Corporal
Staff Sergeant
Suffragan Bishop
The Earl of
The Hon
The Hon Dr
The Hon Lady
The Hon Lord
The Hon Mrs
The Hon Sir
The Honourable
The Learned Judge
The Most Reverend
The Reverend Canon
The Rt Hon
The Rt Hon Dr
The Rt Hon Lord
The Rt Hon Sir
The Rt Hon Visc
The Venerable
Very Reverend
Vice Admiral
Vice Chancellor
Viscount
Viscountess
Warden
Warrant Officer
Warrant Officer Class 1
Warrant Officer Class 2
Yeoman Warder
`.trim();

const phrases = RAW.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

function classifyPrefix(phrase) {
  const input = `${phrase} John Smith`;
  const p = parseName(input);
  const ok = !!p.prefix && p.first === 'John' && p.last === 'Smith';
  if (!ok) return { status: 'missing', parsed: p };

  const toks = p.prefixTokens || [];
  const allHaveEntry = toks.length > 0 && toks.every(t => !!t.entryId);
  return { status: allHaveEntry ? 'canonical' : 'heuristic', parsed: p };
}

const out = { canonical: [], heuristic: [], missing: [] };
for (const ph of phrases) {
  const r = classifyPrefix(ph);
  out[r.status].push({ phrase: ph, prefix: r.parsed.prefix, tokens: r.parsed.prefixTokens });
}

console.log(JSON.stringify({
  total: phrases.length,
  canonical: out.canonical.length,
  heuristic: out.heuristic.length,
  missing: out.missing.length,
  heuristicSample: out.heuristic.slice(0, 25).map(x => x.phrase),
  missingSample: out.missing.slice(0, 25).map(x => x.phrase),
  missingAll: out.missing.map(x => x.phrase),
}, null, 2));


