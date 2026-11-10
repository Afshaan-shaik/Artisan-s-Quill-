import { useState, useEffect, useCallback } from 'react';
import { soundEngine, MicroSoundType } from '../services/soundEngine';

export function useSoundEngine() {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => soundEngine.getSoundEnabled());

  useEffect(() => {
    return soundEngine.subscribe((enabled) => {
      setIsEnabled(enabled);
    });
  }, []);

  const play = useCallback((type: MicroSoundType, throttleMs?: number) => {
    soundEngine.play(type, throttleMs);
  }, []);

  const toggleSound = useCallback(() => {
    return soundEngine.toggleSound();
  }, []);

  return { isEnabled, play, toggleSound };
}

