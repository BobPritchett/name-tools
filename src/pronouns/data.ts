import type { PronounSet } from './types';

/**
 * Built-in pronoun sets commonly in use.
 *
 * Includes standard pronouns (he, she, they, it), common neopronouns,
 * and special pseudo-sets for "any pronouns" and "use name only".
 */
export const BUILT_IN_PRONOUNS: Record<string, PronounSet> = {
  // Standard pronouns
  he: {
    id: 'he',
    label: 'he/him',
    subject: 'he',
    object: 'him',
    possessiveDeterminer: 'his',
    possessivePronoun: 'his',
    reflexive: 'himself',
    notes: 'Masculine pronouns',
  },
  she: {
    id: 'she',
    label: 'she/her',
    subject: 'she',
    object: 'her',
    possessiveDeterminer: 'her',
    possessivePronoun: 'hers',
    reflexive: 'herself',
    notes: 'Feminine pronouns',
  },
  they: {
    id: 'they',
    label: 'they/them',
    subject: 'they',
    object: 'them',
    possessiveDeterminer: 'their',
    possessivePronoun: 'theirs',
    reflexive: 'themselves',
    notes: 'Singular they/them pronouns',
  },
  it: {
    id: 'it',
    label: 'it/its',
    subject: 'it',
    object: 'it',
    possessiveDeterminer: 'its',
    possessivePronoun: 'its',
    reflexive: 'itself',
    notes: 'Neutral/inanimate pronouns',
  },

  // Neopronouns
  'ze-hir': {
    id: 'ze-hir',
    label: 'ze/hir',
    subject: 'ze',
    object: 'hir',
    possessiveDeterminer: 'hir',
    possessivePronoun: 'hirs',
    reflexive: 'hirself',
    notes: 'Neopronouns ze/hir',
  },
  'ze-zir': {
    id: 'ze-zir',
    label: 'ze/zir',
    subject: 'ze',
    object: 'zir',
    possessiveDeterminer: 'zir',
    possessivePronoun: 'zirs',
    reflexive: 'zirself',
    notes: 'Neopronouns ze/zir',
  },
  'xe-xem': {
    id: 'xe-xem',
    label: 'xe/xem',
    subject: 'xe',
    object: 'xem',
    possessiveDeterminer: 'xyr',
    possessivePronoun: 'xyrs',
    reflexive: 'xemself',
    notes: 'Neopronouns xe/xem',
  },
  'fae-faer': {
    id: 'fae-faer',
    label: 'fae/faer',
    subject: 'fae',
    object: 'faer',
    possessiveDeterminer: 'faer',
    possessivePronoun: 'faers',
    reflexive: 'faerself',
    notes: 'Neopronouns fae/faer',
  },
  'ey-em': {
    id: 'ey-em',
    label: 'ey/em',
    subject: 'ey',
    object: 'em',
    possessiveDeterminer: 'eir',
    possessivePronoun: 'eirs',
    reflexive: 'emself',
    notes: 'Neopronouns ey/em (Spivak)',
  },

  // Special pseudo-sets
  any: {
    id: 'any',
    label: 'any pronouns',
    subject: 'they',
    object: 'them',
    possessiveDeterminer: 'their',
    possessivePronoun: 'theirs',
    reflexive: 'themselves',
    notes: 'User accepts any pronouns; defaults to they/them for text generation',
  },
  'name-only': {
    id: 'name-only',
    label: 'use name only',
    subject: '',
    object: '',
    possessiveDeterminer: '',
    possessivePronoun: '',
    reflexive: '',
    notes: 'User prefers name instead of pronouns; consumer must handle empty strings',
  },
};

/**
 * Alias map for common shorthand specs.
 *
 * Maps normalized input strings to built-in pronoun set IDs.
 * Handles variations like "He/Him", "he/his", "she/hers", etc.
 */
export const SPEC_ALIASES: Record<string, string> = {
  // he/him family
  'he/him': 'he',
  'he/his': 'he',
  'he/him/his': 'he',
  'he/him/his/his': 'he',
  'he/him/his/his/himself': 'he',

  // she/her family
  'she/her': 'she',
  'she/hers': 'she',
  'she/her/hers': 'she',
  'she/her/her/hers': 'she',
  'she/her/her/hers/herself': 'she',

  // they/them family
  'they/them': 'they',
  'they/their': 'they',
  'they/theirs': 'they',
  'they/them/their': 'they',
  'they/them/their/theirs': 'they',
  'they/them/their/theirs/themselves': 'they',
  'they/them/their/theirs/themself': 'they',

  // it/its family
  'it/its': 'it',
  'it/it/its': 'it',
  'it/it/its/its/itself': 'it',

  // Neopronouns - common short forms
  'ze/hir': 'ze-hir',
  'ze/hir/hirs': 'ze-hir',
  'ze/zir': 'ze-zir',
  'ze/zir/zirs': 'ze-zir',
  'xe/xem': 'xe-xem',
  'xe/xem/xyr': 'xe-xem',
  'fae/faer': 'fae-faer',
  'fae/faer/faers': 'fae-faer',
  'ey/em': 'ey-em',
  'ey/em/eir': 'ey-em',

  // Special sets
  any: 'any',
  'any pronouns': 'any',
  'all pronouns': 'any',
  'no pronouns': 'name-only',
  'name-only': 'name-only',
  'use name': 'name-only',
  'use name only': 'name-only',
  'name only': 'name-only',
};
