/**
 * Speech Synthesis Utilities for Soothing Poetic AI Voice Recitation
 * The Artisan's Quill — Native Urdu, Hindi, and Indian Accent Recitation Engine
 */

export interface PoemLanguageDetection {
  isUrduOrHindi: boolean;
  type: 'urdu-script' | 'hindi-script' | 'roman-urdu-hindi' | 'english-other';
  label: string;
  accentLabel: string;
  suggestedLangCode: 'ur-PK' | 'hi-IN' | 'en-IN' | 'en-US';
  confidence: number;
}

// ─── Linguistic Vocabulary for Roman Urdu & Roman Hindi Detection ─────────────
const ROMAN_URDU_HINDI_WORDS = new Set([
  // Pronouns, auxiliaries & particles
  'hai', 'hain', 'mein', 'kya', 'kyun', 'kyon', 'tera', 'teri', 'tere', 'mera',
  'meri', 'mere', 'tum', 'tumhara', 'tumhari', 'tumhare', 'aap', 'apka', 'apki',
  'apkep', 'hum', 'hamara', 'hamari', 'hamare', 'apne', 'apna', 'apni', 'ye', 'yeh',
  'woh', 'wo', 'ke', 'ki', 'ko', 'se', 'par', 'pe', 'aur', 'bhi', 'toh', 'to',
  'ne', 'tha', 'thi', 'the', 'gaya', 'gayi', 'gaye', 'raha', 'rahi', 'rahe',
  'karte', 'karti', 'karein', 'kare', 'hona', 'hoga', 'hogi', 'hoge', 'kaash',
  'agar', 'jab', 'tab', 'ab', 'sab', 'koi', 'kuch', 'kisi', 'jaise', 'waise',
  'aise', 'waqt', 'roz', 'sirf', 'lekin', 'magar', 'kyunki', 'isliye',

  // Poetic, ghazal, and emotional vocabulary
  'ishq', 'mohabbat', 'muhabbat', 'dard', 'zindagi', 'khuda', 'shair', 'shayari',
  'shairi', 'aankh', 'aankhen', 'aankhon', 'hawa', 'raat', 'chaand', 'chand',
  'khwaab', 'khwab', 'rooh', 'wafa', 'bewafa', 'judai', 'judaai', 'fiza',
  'sukoon', 'intezar', 'intezaar', 'duniya', 'deewana', 'deewani', 'deewangi',
  'yaar', 'dost', 'baat', 'baatein', 'kabhi', 'hamesha', 'aaina', 'aaine',
  'tasveer', 'gulzar', 'ghazal', 'nazm', 'gham', 'ashq', 'ashkon', 'sanam',
  'paas', 'door', 'chup', 'khamosh', 'khamoshi', 'aawaaz', 'awaz', 'roshni',
  'zulf', 'zulfein', 'chehra', 'nazar', 'nazrein', 'kasak', 'saans', 'saansein',
  'dhadkan', 'arzoo', 'arzu', 'hasrat', 'fursat', 'mehfil', 'jaam', 'saki',
  'saqi', 'qalb', 'shab', 'subah', 'shaam', 'chahat', 'ulfat', 'afsaana',
  'afsana', 'fasaana', 'junoon', 'khushi', 'muskurahat', 'ehsaas', 'tasavvur',
  'hayaat', 'fana', 'noor', 'falak', 'zameen', 'aasmaan', 'asman', 'barish',
  'baarishein', 'jazbaat', 'khabar', 'lamha', 'lamhe', 'manzil', 'safar',
  'rasta', 'raasta', 'dilbar', 'jahaan', 'watan', 'pyar', 'pyaar', 'prem',
  'sapna', 'sapne', 'kavita', 'saath', 'akela', 'tanhai', 'tanhaai', 'dhoondhta',
  'dhoondhte', 'dhoondti', 'chaha', 'chahiye', 'mila', 'mili', 'mile', 'dekha',
  'dekhi', 'dekhe', 'suna', 'suni', 'sune', 'kaha', 'kahi', 'kahe', 'tamanna',
  'sitam', 'qismat', 'kismat', 'naseeb', 'parwana', 'shama', 'diya', 'jalte',
  'aag', 'ashk', 'tasalli', 'marham', 'zakhm', 'dil', 'dilon'
]);

/**
 * Detects whether poem text is written in Urdu (script or Roman), Hindi (script or Roman), or English.
 */
export const detectPoemLanguage = (text: string): PoemLanguageDetection => {
  if (!text || text.trim().length === 0) {
    return {
      isUrduOrHindi: false,
      type: 'english-other',
      label: 'English',
      accentLabel: 'Universal Poetic Voice',
      suggestedLangCode: 'en-US',
      confidence: 0
    };
  }

  // 1. Check for Arabic / Urdu Nastaliq Unicode range
  const urduScriptRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  if (urduScriptRegex.test(text)) {
    return {
      isUrduOrHindi: true,
      type: 'urdu-script',
      label: 'Urdu (اردو)',
      accentLabel: 'Native Urdu Poetic Voice',
      suggestedLangCode: 'ur-PK',
      confidence: 0.99
    };
  }

  // 2. Check for Devanagari Hindi Unicode range
  const devanagariRegex = /[\u0900-\u097F]/;
  if (devanagariRegex.test(text)) {
    return {
      isUrduOrHindi: true,
      type: 'hindi-script',
      label: 'Hindi (हिन्दी)',
      accentLabel: 'Native Hindi Poetic Voice',
      suggestedLangCode: 'hi-IN',
      confidence: 0.99
    };
  }

  // 3. Check for Roman Urdu / Roman Hindi by tokenizing Latin words
  const cleanText = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  const tokens = cleanText.split(/\s+/).filter((t) => t.length > 1);

  if (tokens.length > 0) {
    let matchCount = 0;
    for (const token of tokens) {
      if (ROMAN_URDU_HINDI_WORDS.has(token)) {
        matchCount++;
      } else if (token.includes('-')) {
        // e.g. dard-e-dil, shair-o-shairi
        const subParts = token.split('-');
        if (subParts.some((p) => ROMAN_URDU_HINDI_WORDS.has(p))) {
          matchCount += 1.5;
        }
      }
    }

    const ratio = matchCount / tokens.length;
    // If at least 2 distinct tokens match or ratio > 0.08, it's unmistakably Roman Urdu/Hindi
    if (matchCount >= 2 || ratio >= 0.08) {
      return {
        isUrduOrHindi: true,
        type: 'roman-urdu-hindi',
        label: 'Roman Urdu & Hindi (Hindustani)',
        accentLabel: 'Native Urdu/Hindi Accent',
        suggestedLangCode: 'en-IN',
        confidence: Math.min(1, ratio * 2.5)
      };
    }
  }

  return {
    isUrduOrHindi: false,
    type: 'english-other',
    label: 'English Verse',
    accentLabel: 'Soothing Poetic Voice',
    suggestedLangCode: 'en-US',
    confidence: 0.9
  };
};

/**
 * Returns the best-matching beautiful female voice.
 * When Urdu or Hindi (including Roman Urdu/Hindi) is detected, prioritizes native Indian/Urdu female voices
 * (e.g. Microsoft Neerja, Swara, Uzma, Google Hindi/Urdu, Apple Lekha/Veena) over British or American voices.
 */
export const getSoothingFemaleVoice = (targetText?: string): SpeechSynthesisVoice | null => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const detection = targetText ? detectPoemLanguage(targetText) : null;
  const isUrduHindi = detection ? detection.isUrduOrHindi : false;

  // ─── STRATEGY A: Urdu / Hindi Detected ───────────────────────────────────────
  if (isUrduHindi) {
    const isRomanized = detection?.type === 'roman-urdu-hindi';

    // 1. High-fidelity Natural Indian English Female Voices
    // (Especially celebrated for reading Roman Urdu/Hindi with authentic, lyrical native Indian accent without British/American distortion)
    const indianEnglishFemaleVoices = [
      'Microsoft Neerja Online (Natural) - English (India)',
      'Microsoft Neerja',
      'Microsoft Ananya Online (Natural) - English (India)',
      'Microsoft Ananya',
      'Google Indian English Female',
      'Google English (India)',
      'Veena',
      'Kavya',
      'Sangeeta',
      'Heera'
    ];

    // 2. High-fidelity Natural Urdu Female Voices
    const urduFemaleVoices = [
      'Microsoft Uzma Online (Natural) - Urdu (Pakistan)',
      'Microsoft Uzma',
      'Google اردو',
      'Google Urdu'
    ];

    // 3. High-fidelity Natural Hindi Female Voices
    const hindiFemaleVoices = [
      'Microsoft Swara Online (Natural) - Hindi (India)',
      'Microsoft Swara',
      'Google हिन्दी',
      'Google Hindi',
      'Lekha',
      'Kalpana'
    ];

    // When text is Romanized (Latin letters), voices like Microsoft Neerja (English India)
    // or Google Hindi that parse Roman Hindustani excel at native pronunciation.
    const priorityList = isRomanized
      ? [...indianEnglishFemaleVoices, ...hindiFemaleVoices, ...urduFemaleVoices]
      : detection?.type === 'urdu-script'
      ? [...urduFemaleVoices, ...hindiFemaleVoices, ...indianEnglishFemaleVoices]
      : [...hindiFemaleVoices, ...urduFemaleVoices, ...indianEnglishFemaleVoices];

    for (const name of priorityList) {
      const found = voices.find(
        (v) => v.name.toLowerCase().includes(name.toLowerCase()) || v.name === name
      );
      if (found) return found;
    }

    // Fallback search within Indian / Urdu / Hindi locales
    // Look for female voice in en-IN, hi-IN, ur-PK, ur-IN
    const regionalFemale = voices.find((v) => {
      const lowerName = v.name.toLowerCase();
      const isRegionalLang =
        v.lang === 'en-IN' ||
        v.lang.startsWith('en-IN') ||
        v.lang.startsWith('hi') ||
        v.lang.startsWith('ur');
      const isFemale =
        lowerName.includes('female') ||
        lowerName.includes('woman') ||
        lowerName.includes('neerja') ||
        lowerName.includes('ananya') ||
        lowerName.includes('swara') ||
        lowerName.includes('uzma') ||
        lowerName.includes('veena') ||
        lowerName.includes('lekha');
      return isRegionalLang && isFemale;
    });
    if (regionalFemale) return regionalFemale;

    // Any voice matching Indian English or Hindi or Urdu (even if not explicitly tagged female)
    const anyRegional = voices.find(
      (v) =>
        v.lang === 'en-IN' ||
        v.lang.startsWith('en-IN') ||
        v.lang.startsWith('hi') ||
        v.lang.startsWith('ur')
    );
    if (anyRegional) return anyRegional;
  }

  // ─── STRATEGY B: English / Default Soothing Female Voices ────────────────────
  const preferredGeneralFemale = [
    'Microsoft Neerja Online (Natural) - English (India)',
    'Google UK English Female',
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Microsoft Aria Online (Natural) - English (United States)',
    'Microsoft Sonia Online (Natural) - English (United Kingdom)',
    'Microsoft Libby Online (Natural) - English (United Kingdom)',
    'Microsoft Zira - English (United States)',
    'Samantha',
    'Victoria',
    'Karen',
    'Moira',
    'Tessa',
    'Serena',
    'Fiona'
  ];

  for (const name of preferredGeneralFemale) {
    const found = voices.find((v) => v.name.includes(name) || v.name === name);
    if (found) return found;
  }

  // Fallback: any voice labeled with female keywords
  const femaleVoice = voices.find((v) => {
    const lowerName = v.name.toLowerCase();
    return (
      (v.lang.startsWith('en') || v.lang.startsWith('hi') || v.lang.startsWith('ur')) &&
      (lowerName.includes('female') ||
        lowerName.includes('woman') ||
        lowerName.includes('neerja') ||
        lowerName.includes('swara') ||
        lowerName.includes('uzma') ||
        lowerName.includes('zira') ||
        lowerName.includes('samantha') ||
        lowerName.includes('jenny'))
    );
  });
  if (femaleVoice) return femaleVoice;

  return voices[0] || null;
};

/**
 * Prepares poetic text for speech synthesis, optimizing cadence, breaths,
 * and syllable pacing for Urdu & Hindi ghazals and nazms.
 */
export const preparePoeticTextForVoice = (
  text: string,
  isUrduOrHindi: boolean
): string => {
  if (!text) return '';

  let clean = text.trim();

  // If Urdu or Hindi, expand hyphenated compounds (e.g. "dard-e-dil" -> "dard e dil", "shair-o-shairi" -> "shair o shairi")
  // so the speech synthesis pronounces each word with authentic Hindustani inflection rather than an awkward compound.
  if (isUrduOrHindi) {
    clean = clean
      .replace(/(\w+)-e-(\w+)/gi, '$1 e $2')
      .replace(/(\w+)-o-(\w+)/gi, '$1 o $2')
      .replace(/(\w+)-i-(\w+)/gi, '$1 i $2');
  }

  return clean;
};

/**
 * Human-readable voice description for UI badges.
 */
export const getVoiceIdentityLabel = (voice: SpeechSynthesisVoice | null): string => {
  if (!voice) return 'Default Voice';
  const name = voice.name;
  if (name.includes('Neerja')) return 'Neerja (Native Indian Poetic)';
  if (name.includes('Swara')) return 'Swara (Native Hindi)';
  if (name.includes('Uzma')) return 'Uzma (Native Urdu)';
  if (name.includes('Ananya')) return 'Ananya (Indian English)';
  if (name.includes('Veena')) return 'Veena (Indian Poetic)';
  if (name.includes('Lekha')) return 'Lekha (Hindi)';
  if (voice.lang === 'en-IN' || voice.lang.startsWith('en-IN')) return 'Indian Accent (Poetic)';
  if (voice.lang.startsWith('hi')) return 'Hindi Accent (Poetic)';
  if (voice.lang.startsWith('ur')) return 'Urdu Accent (Poetic)';
  return voice.name.split(' - ')[0] || voice.name;
};
