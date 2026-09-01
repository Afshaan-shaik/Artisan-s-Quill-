/**
 * Speech Synthesis Utilities for Soothing Poetic AI Voice Recitation
 */

export const getSoothingFemaleVoice = (): SpeechSynthesisVoice | null => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Preferred high-quality soothing female voices across Windows, macOS, iOS, Android, and Chrome/Edge
  const preferredNames = [
    'Google UK English Female',
    'Google US English',
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

  for (const name of preferredNames) {
    const found = voices.find((v) => v.name.includes(name) || v.name === name);
    if (found) return found;
  }

  // Fallback: search for any voice labeled with female keywords
  const femaleVoice = voices.find((v) => {
    const lowerName = v.name.toLowerCase();
    return (
      v.lang.startsWith('en') &&
      (lowerName.includes('female') ||
        lowerName.includes('woman') ||
        lowerName.includes('zira') ||
        lowerName.includes('samantha') ||
        lowerName.includes('jenny') ||
        lowerName.includes('aria') ||
        lowerName.includes('sonia'))
    );
  });
  if (femaleVoice) return femaleVoice;

  // Fallback: any British or US English voice
  const englishVoice = voices.find(
    (v) => v.lang === 'en-GB' || v.lang === 'en-US' || v.lang.startsWith('en')
  );
  return englishVoice || voices[0] || null;
};
