/**
 * The Artisan's Quill — Multi-Accent Recitation & Founder Voice Engine
 * Dedicated to Afshaan Shaikh's poetic voice and universal accent customization
 */

import { VoiceAccentOption } from '../types';
import { detectPoemLanguage, getSoothingFemaleVoice, preparePoeticTextForVoice } from './speechUtils';

export interface VoiceAccentProfile {
  id: VoiceAccentOption;
  label: string;
  shortLabel: string;
  flag: string;
  description: string;
}

export const VOICE_ACCENT_PROFILES: VoiceAccentProfile[] = [
  {
    id: 'native-urdu-hindi',
    label: 'Native Urdu & Hindi (Hindustani)',
    shortLabel: 'Urdu/Hindi',
    flag: '🇮🇳',
    description: 'Lyrical native Hindustani cadence for Urdu & Hindi ghazals and nazms'
  },
  {
    id: 'founder-poet',
    label: "Poet's Voice: Afshaan Shaikh",
    shortLabel: "Afshaan's Voice",
    flag: '🎙️',
    description: "Founder & poet's personal voice recital (original audio or calibrated persona)"
  },
  {
    id: 'british-classical',
    label: 'British Classical Accent',
    shortLabel: 'British',
    flag: '🇬🇧',
    description: 'Resonant, formal English atelier cadence with classical diction'
  },
  {
    id: 'american-contemporary',
    label: 'American Contemporary Accent',
    shortLabel: 'American',
    flag: '🇺🇸',
    description: 'Crisp, modern lyrical cadence with warm conversational intimacy'
  },
  {
    id: 'auto-detect',
    label: 'Auto-Detect (Smart Cadence)',
    shortLabel: 'Auto-Detect',
    flag: '✨',
    description: 'Automatically chooses native Urdu/Hindi or poetic voice based on poem language'
  }
];

/**
 * Checks whether the given poem is authored by sanctuary founder Afshaan Shaikh
 */
export const isAfshaanShaikh = (authorName?: string, authorHandle?: string): boolean => {
  const name = (authorName || '').toLowerCase().trim();
  const handle = (authorHandle || '').toLowerCase().trim();
  return (
    name.includes('afshaan') ||
    name.includes('shaikh') ||
    handle.includes('afshaanshaikh') ||
    handle.includes('afshaan') ||
    name.includes('sanctuary founder')
  );
};

export interface ResolvedVoicePlan {
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  voiceLabel: string;
  accentLabel: string;
  accentId: VoiceAccentOption;
  isFounder: boolean;
}

/**
 * Resolves the ideal speech synthesis voice and cadence parameters based on the selected accent.
 */
export const resolvePoeticVoice = (
  accentOption: VoiceAccentOption,
  poemText: string,
  authorName?: string,
  authorHandle?: string
): ResolvedVoicePlan => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return {
      voice: null,
      rate: 0.88,
      pitch: 1.0,
      voiceLabel: 'System Voice',
      accentLabel: 'Standard Recital',
      accentId: accentOption,
      isFounder: false
    };
  }

  const voices = window.speechSynthesis.getVoices() || [];
  const authorIsAfshaan = isAfshaanShaikh(authorName, authorHandle);
  const langDetection = detectPoemLanguage(poemText);

  // Resolve 'auto-detect' into the most appropriate target accent
  let activeAccent = accentOption;
  if (activeAccent === 'auto-detect') {
    if (authorIsAfshaan) {
      activeAccent = 'founder-poet';
    } else if (langDetection.isUrduOrHindi) {
      activeAccent = 'native-urdu-hindi';
    } else {
      activeAccent = 'british-classical';
    }
  }

  // ─── 1. FOUNDER'S POET VOICE: AFSHAAN SHAIKH ────────────────────────────────
  if (activeAccent === 'founder-poet') {
    // Dedicated Indian English / Urdu / Hindi male poetic voices with warm baritone resonance
    const founderPreferredVoices = [
      'Microsoft Prabhat Online (Natural) - English (India)',
      'Microsoft Prabhat',
      'Microsoft Madhav Online (Natural) - Hindi (India)',
      'Microsoft Madhav',
      'Microsoft Asif Online (Natural) - Urdu (Pakistan)',
      'Microsoft Asif',
      'Google English (India) Male',
      'Google Indian English',
      'Rishi',
      'Hemant'
    ];

    let pickedVoice: SpeechSynthesisVoice | null = null;
    for (const name of founderPreferredVoices) {
      const v = voices.find((voice) => voice.name.toLowerCase().includes(name.toLowerCase()));
      if (v) {
        pickedVoice = v;
        break;
      }
    }

    if (!pickedVoice) {
      // Find any male or regional voice in Indian English or Urdu or Hindi
      pickedVoice =
        voices.find((v) => {
          const lower = v.name.toLowerCase();
          const isRegional = v.lang.startsWith('en-IN') || v.lang.startsWith('hi') || v.lang.startsWith('ur');
          const isMale = lower.includes('male') || lower.includes('man') || lower.includes('prabhat') || lower.includes('madhav');
          return isRegional && isMale;
        }) ||
        voices.find((v) => v.lang.startsWith('en-IN') || v.lang.startsWith('hi') || v.lang.startsWith('ur')) ||
        null;
    }

    // Calibrated cadence for Afshaan Shaikh: warm baritone, contemplative meditative pace
    const isUrduHindi = langDetection.isUrduOrHindi;
    return {
      voice: pickedVoice || (voices[0] ?? null),
      rate: isUrduHindi ? 0.82 : 0.86,
      pitch: 0.92, // Warm baritone resonance matching Afshaan's natural speaking tone
      voiceLabel: pickedVoice ? pickedVoice.name.split(' - ')[0] : 'Afshaan Shaikh Calibrated Persona',
      accentLabel: isUrduHindi ? "Afshaan Shaikh's Voice (Native Hindustani)" : "Afshaan Shaikh's Voice (Indian Accent)",
      accentId: 'founder-poet',
      isFounder: true
    };
  }

  // ─── 2. NATIVE URDU & HINDI ACCENT (HINDUSTANI) ──────────────────────────────
  if (activeAccent === 'native-urdu-hindi') {
    const femaleVoice = getSoothingFemaleVoice(poemText);
    return {
      voice: femaleVoice || (voices[0] ?? null),
      rate: 0.84,
      pitch: 1.02,
      voiceLabel: femaleVoice ? femaleVoice.name.split(' - ')[0] : 'Neerja (Native Indian Poetic)',
      accentLabel: 'Native Urdu/Hindi Accent',
      accentId: 'native-urdu-hindi',
      isFounder: false
    };
  }

  // ─── 3. BRITISH CLASSICAL ACCENT ───────────────────────────────────────────
  if (activeAccent === 'british-classical') {
    const britishPreferred = [
      'Microsoft Sonia Online (Natural) - English (United Kingdom)',
      'Microsoft Libby Online (Natural) - English (United Kingdom)',
      'Microsoft George Online (Natural) - English (United Kingdom)',
      'Google UK English Female',
      'Google UK English Male',
      'Oliver',
      'Serena',
      'Daniel'
    ];

    let britishVoice: SpeechSynthesisVoice | null = null;
    for (const name of britishPreferred) {
      const v = voices.find((voice) => voice.name.toLowerCase().includes(name.toLowerCase()));
      if (v) {
        britishVoice = v;
        break;
      }
    }

    if (!britishVoice) {
      britishVoice = voices.find((v) => v.lang === 'en-GB' || v.lang.startsWith('en-GB')) || null;
    }

    return {
      voice: britishVoice || (voices[0] ?? null),
      rate: 0.88,
      pitch: 1.04,
      voiceLabel: britishVoice ? britishVoice.name.split(' - ')[0] : 'British Classical Atelier Voice',
      accentLabel: 'British Classical Accent',
      accentId: 'british-classical',
      isFounder: false
    };
  }

  // ─── 4. AMERICAN CONTEMPORARY ACCENT ───────────────────────────────────────
  if (activeAccent === 'american-contemporary') {
    const americanPreferred = [
      'Microsoft Jenny Online (Natural) - English (United States)',
      'Microsoft Guy Online (Natural) - English (United States)',
      'Microsoft Aria Online (Natural) - English (United States)',
      'Google US English',
      'Samantha',
      'Victoria',
      'Alex'
    ];

    let usVoice: SpeechSynthesisVoice | null = null;
    for (const name of americanPreferred) {
      const v = voices.find((voice) => voice.name.toLowerCase().includes(name.toLowerCase()));
      if (v) {
        usVoice = v;
        break;
      }
    }

    if (!usVoice) {
      usVoice = voices.find((v) => v.lang === 'en-US' || v.lang.startsWith('en-US')) || null;
    }

    return {
      voice: usVoice || (voices[0] ?? null),
      rate: 0.90,
      pitch: 1.0,
      voiceLabel: usVoice ? usVoice.name.split(' - ')[0] : 'American Contemporary Voice',
      accentLabel: 'American Contemporary Accent',
      accentId: 'american-contemporary',
      isFounder: false
    };
  }

  // Fallback
  return {
    voice: voices[0] || null,
    rate: 0.88,
    pitch: 1.0,
    voiceLabel: 'Universal Poetic Voice',
    accentLabel: 'Universal Accent',
    accentId: 'auto-detect',
    isFounder: false
  };
};
