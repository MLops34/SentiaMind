/**
 * SentiaMind — Client-Side Deterministic Crisis Safeguard Engine
 * 
 * In accordance with SentiaMind's Safety Architecture:
 * - 100% deterministic (zero ML inference)
 * - Evaluated locally BEFORE submitting to network (fails safe)
 * - Provides verified emergency hotlines for India, US, UK, Australia, and Global
 */

import type { CrisisResponse, HotlineInfo } from '../types';

export const CRISIS_LEXICON: string[] = [
  // Self-harm intent
  'kill myself', 'end my life', 'take my life', 'end it all',
  'want to die', 'want to be dead', 'better off dead',
  'wish i was dead', 'wish i were dead', "don't want to live",
  "don't want to be alive", 'no reason to live', 'nothing to live for',
  'ready to die', 'life is not worth living', "life isn't worth living",

  // Suicidal ideation
  'suicide', 'suicidal', 'commit suicide', 'attempting suicide',
  'planning to suicide', 'thinking about suicide', 'thoughts of suicide',
  'suicidal thoughts', 'suicidal ideation',

  // Method references
  'overdose on', 'slit my wrist', 'hang myself', 'jump off',
  'in front of a train', 'shoot myself', 'poison myself',

  // Non-suicidal self-harm
  'cutting myself', 'hurt myself', 'self harm', 'self-harm',
  'self injury', 'self-injury', 'burn myself', 'hurting myself',

  // Hopelessness / goodbye signals
  'goodbye forever', 'final goodbye', 'no one will miss me',
  'nobody would care', 'nobody cares if i die', 'world is better without me',
  'everyone is better off without me',

  // Crisis states
  'in crisis', 'mental breakdown', 'cannot go on',
  "can't go on anymore", "can't take it anymore", 'give up on life',
  'giving up on life',

  // Regional indicators
  'jeene ka mann nahi', 'zindagi khatam'
];

export const REGIONAL_HOTLINES: Record<string, HotlineInfo[]> = {
  IN: [
    { name: 'iCall Psychosocial Helpline (TISS)', number: '9152987821', available: 'Mon–Sat 8am–10pm' },
    { name: 'Vandrevala Foundation Helpline', number: '9999 666 555', available: '24/7 Free & Confidential' },
    { name: 'Tele-MANAS (Govt of India)', number: '14416', available: '24/7 Toll Free' },
    { name: 'Snehi Crisis Intervention', number: '044-24640050', available: '24/7 Dedicated' },
  ],
  US: [
    { name: '988 Suicide & Crisis Lifeline', number: '988', available: '24/7 Call or Text' },
    { name: 'Crisis Text Line', number: 'Text HOME to 741741', available: '24/7 Free SMS' },
    { name: 'The Trevor Project (LGBTQ youth)', number: '1-866-488-7386', available: '24/7 Support' },
  ],
  GB: [
    { name: 'Samaritans UK', number: '116 123', available: '24/7 Free Call' },
    { name: 'PAPYRUS Prevention of Young Suicide', number: '0800 068 4141', available: '24/7 Call/Text' },
    { name: 'Shout Crisis Text Line', number: 'Text SHOUT to 85258', available: '24/7 SMS' },
  ],
  AU: [
    { name: 'Lifeline Australia', number: '13 11 14', available: '24/7 Crisis Support' },
    { name: 'Beyond Blue Support Service', number: '1300 22 4636', available: '24/7 Advice' },
    { name: 'Kids Helpline (Under 25)', number: '1800 55 1800', available: '24/7 Free Call' },
  ],
  _DEFAULT: [
    { name: 'Befrienders Worldwide', number: 'https://www.befrienders.org', available: 'Global Directory' },
    { name: 'International Association for Suicide Prevention (IASP)', number: 'https://www.iasp.info/resources/Crisis_Centres', available: '24/7 Global Directory' },
    { name: 'Find A Helpline', number: 'https://findahelpline.com', available: 'Free, confidential support across 130+ countries' },
  ],
};

export function checkCrisis(text: string): { triggered: boolean; matchedTerms: string[] } {
  if (!text) return { triggered: false, matchedTerms: [] };
  const normalized = text.toLowerCase();
  const matchedTerms: string[] = [];

  for (const phrase of CRISIS_LEXICON) {
    if (normalized.includes(phrase)) {
      matchedTerms.push(phrase);
    }
  }

  return {
    triggered: matchedTerms.length > 0,
    matchedTerms,
  };
}

export function getCrisisResponse(countryCode: string = 'IN'): CrisisResponse {
  const normalizedCode = countryCode.toUpperCase();
  const hotlines = REGIONAL_HOTLINES[normalizedCode] || REGIONAL_HOTLINES['_DEFAULT'];

  return {
    crisis_detected: true,
    message: 'We noticed something in your journal entry that concerns us. You are not alone, and supportive help is available right now. Please reach out to one of these verified resources:',
    hotlines,
  };
}
