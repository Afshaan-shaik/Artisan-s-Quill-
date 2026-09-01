import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sliders,
  Feather,
  Sparkles,
  Music,
  User,
  Edit3
} from 'lucide-react';
import { bardSymphony, BARD_VOICE_PRESETS, BardVoiceStyle } from '../utils/bardSymphonyEngine';
import { AcousticWaveformRibbon } from './AcousticWaveformRibbon';
import { PoetryData } from '../types';

interface AIPoeticBardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPoem?: {
    title: string;
    author: string;
    authorHandle?: string;
    content: string;
    stanzas?: string[];
  } | null;
}

const DEFAULT_SAMPLE_POEM = {
  title: 'Sanctuary of Whispering Ink',
  author: 'The Master Scribe',
  authorHandle: '@artisan',
  content: `In realms where shadows softly weep,
The golden quill begins to wake,
A sacred promise soul must keep,
For every dreaming heart at stake.

Through vellum pale and starry skies,
The ink descends in velvet grace,
A silent truth within your eyes,
Transcends the bounds of time and space.`
};

export const AIPoeticBardModal: React.FC<AIPoeticBardModalProps> = ({
  isOpen,
  onClose,
  initialPoem
}) => {
  const [poemTitle, setPoemTitle] = useState(initialPoem?.title || DEFAULT_SAMPLE_POEM.title);
  const [authorName, setAuthorName] = useState(initialPoem?.author || DEFAULT_SAMPLE_POEM.author);
  const [authorHandle, setAuthorHandle] = useState(initialPoem?.authorHandle || DEFAULT_SAMPLE_POEM.authorHandle);
  const [poemContent, setPoemContent] = useState(initialPoem?.content || DEFAULT_SAMPLE_POEM.content);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [selectedVoice, setSelectedVoice] = useState<BardVoiceStyle>('ancient-bard');
  const [showMixer, setShowMixer] = useState(false);
  const [isEditingCustom, setIsEditingCustom] = useState(false);

  // Acoustic Volume Levels
  const [voiceVol, setVoiceVol] = useState(1.0);
  const [harpsVol, setHarpsVol] = useState(0.35);
  const [celloVol, setCelloVol] = useState(0.3);
  const [rainVol, setRainVol] = useState(0.25);

  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const poemContainerRef = useRef<HTMLDivElement | null>(null);

  // When initial poem updates from external prop
  useEffect(() => {
    if (initialPoem) {
      setPoemTitle(initialPoem.title);
      setAuthorName(initialPoem.author);
      setAuthorHandle(initialPoem.authorHandle || '@artisan');
      setPoemContent(initialPoem.content);
      setIsEditingCustom(false);
      stopRecital();
    }
  }, [initialPoem]);

  // Clean up speech and symphony on unmount or close
  useEffect(() => {
    return () => {
      bardSymphony.stopRecitation();
    };
  }, []);

  // Update volumes in engine
  useEffect(() => {
    bardSymphony.setVolumes({
      voice: voiceVol,
      harp: harpsVol,
      cello: celloVol,
      rain: rainVol
    });
  }, [voiceVol, harpsVol, celloVol, rainVol]);

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineRef.current && poemContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentLineIndex]);

  if (!isOpen) return null;

  const lines = poemContent
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const handleVoiceChange = (voiceId: BardVoiceStyle) => {
    setSelectedVoice(voiceId);
    bardSymphony.setPreset(voiceId);
    if (isPlaying) {
      // Restart recital with new voice
      startRecital();
    }
  };

  const startRecital = () => {
    setIsPlaying(true);
    bardSymphony.setPreset(selectedVoice);
    bardSymphony.recitePoem(
      poemContent,
      (lineIdx) => {
        setCurrentLineIndex(lineIdx);
      },
      () => {
        setIsPlaying(false);
        setCurrentLineIndex(-1);
      }
    );
  };

  const pauseRecital = () => {
    setIsPlaying(false);
    bardSymphony.pauseRecitation();
  };

  const resumeRecital = () => {
    setIsPlaying(true);
    bardSymphony.resumeRecitation();
  };

  const stopRecital = () => {
    setIsPlaying(false);
    setCurrentLineIndex(-1);
    bardSymphony.stopRecitation();
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseRecital();
    } else if (currentLineIndex >= 0) {
      resumeRecital();
    } else {
      startRecital();
    }
  };

  return (
    <div
      id="ai-poetic-bard-modal"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl ultra-glass-elevated border border-[#c9a875]/40 shadow-[0_0_50px_rgba(201,168,117,0.25)] overflow-hidden">
        {/* Top Specular Rim & Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#c9a875] to-transparent opacity-80" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a875]/30 to-[#dfbd87]/10 border border-[#c9a875]/40 flex items-center justify-center shadow-inner">
              <Feather className="w-5 h-5 text-[#dfbd87]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                  AI Poetic Reciter & Bard Symphony
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-mono-code font-bold bg-[#c9a875]/20 text-[#dfbd87] border border-[#c9a875]/40">
                  Live Recital
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono-code">
                Harmonic acoustic orchestration with synchronized verse illumination
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingCustom(!isEditingCustom)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-code transition-all cursor-pointer ${
                isEditingCustom
                  ? 'bg-[#c9a875] text-black font-bold shadow-md shadow-[#c9a875]/30'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 hover:text-white'
              }`}
              title="Custom Verse Editor"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isEditingCustom ? 'View Recital' : 'Custom Verse'}</span>
            </button>

            <button
              onClick={() => {
                stopRecital();
                onClose();
              }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all cursor-pointer"
              title="Close Bard Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body (2 Columns on Desktop) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Column: Verse Staging / Custom Editor */}
          <div className="md:col-span-7 flex flex-col justify-between rounded-xl bg-black/40 border border-white/10 p-4 sm:p-5 relative overflow-hidden">
            {/* Parchment Atmosphere Vignette */}
            <div className="absolute inset-0 bg-radial from-[#c9a875]/5 via-transparent to-black/60 pointer-events-none" />

            <div className="relative z-10 flex-1 flex flex-col">
              {/* Poem Header */}
              <div className="border-b border-white/10 pb-3 mb-4">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#f8ebd5] tracking-wide">
                  {poemTitle}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-[#c9a875] font-mono-code">
                  <User className="w-3.5 h-3.5" />
                  <span>{authorName}</span>
                  {authorHandle && <span className="text-neutral-500">{authorHandle}</span>}
                </div>
              </div>

              {/* Recital Verse Display OR Custom Input */}
              {isEditingCustom ? (
                <div className="flex-1 flex flex-col gap-3">
                  <label className="text-[11px] font-mono-code uppercase tracking-wider text-[#c9a875]">
                    Compose or Paste Verse:
                  </label>
                  <input
                    type="text"
                    value={poemTitle}
                    onChange={(e) => setPoemTitle(e.target.value)}
                    placeholder="Poem Title"
                    className="w-full bg-neutral-900/90 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c9a875]"
                  />
                  <textarea
                    value={poemContent}
                    onChange={(e) => {
                      setPoemContent(e.target.value);
                      stopRecital();
                    }}
                    placeholder="Enter your poetic stanzas here..."
                    rows={8}
                    className="w-full flex-1 bg-neutral-900/90 border border-white/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c9a875] resize-none font-serif leading-relaxed"
                  />
                </div>
              ) : (
                <div
                  ref={poemContainerRef}
                  className="flex-1 overflow-y-auto max-h-[260px] sm:max-h-[300px] pr-2 space-y-2 font-serif text-sm sm:text-base leading-relaxed text-neutral-300 select-text"
                >
                  {lines.map((line, idx) => {
                    const isActive = currentLineIndex === idx;
                    return (
                      <div
                        key={idx}
                        ref={isActive ? activeLineRef : null}
                        className={`transition-all duration-300 py-1.5 px-3 rounded-lg ${
                          isActive
                            ? 'text-white font-bold bg-gradient-to-r from-[#c9a875]/35 via-[#c9a875]/15 to-transparent border-l-4 border-[#dfbd87] shadow-[0_0_20px_rgba(201,168,117,0.3)] scale-[1.01]'
                            : 'opacity-70 hover:opacity-100 hover:text-white'
                        }`}
                      >
                        {line}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Live Synchronized Waveform Ribbon */}
            <div className="mt-4 relative z-10">
              <AcousticWaveformRibbon isPlaying={isPlaying} className="w-full h-16 sm:h-20" />
            </div>
          </div>

          {/* Right Column: Bard Persona Presets & Acoustic Symphony Controls */}
          <div className="md:col-span-5 flex flex-col gap-4">
            {/* Bard Persona Voice Selection */}
            <div className="rounded-xl bg-black/40 border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#dfbd87]" />
                <h4 className="text-xs uppercase font-mono-code font-bold tracking-wider text-[#dfbd87]">
                  Bard Persona & Tone
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {BARD_VOICE_PRESETS.map((preset) => {
                  const isSelected = selectedVoice === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleVoiceChange(preset.id)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#c9a875]/25 to-white/5 border-[#dfbd87] shadow-[0_0_15px_rgba(201,168,117,0.2)]'
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-neutral-400'
                      }`}
                    >
                      <span className="text-xl shrink-0 mt-0.5">{preset.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold font-serif ${
                              isSelected ? 'text-white' : 'text-neutral-300'
                            }`}
                          >
                            {preset.label}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#dfbd87] shadow-[0_0_8px_#dfbd87]" />
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-2 leading-tight">
                          {preset.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Acoustic Symphony Mixer Toggle / Sliders */}
            <div className="rounded-xl bg-black/40 border border-white/10 p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-[#c9a875]" />
                    <h4 className="text-xs uppercase font-mono-code font-bold tracking-wider text-neutral-200">
                      Acoustic Symphony
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowMixer(!showMixer)}
                    className="text-[10px] uppercase font-mono-code text-[#c9a875] hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>{showMixer ? 'Hide Mixer' : 'Mixer'}</span>
                  </button>
                </div>

                {/* Instrument Mixers */}
                {showMixer ? (
                  <div className="space-y-2.5 text-xs font-mono-code text-neutral-300 animate-in fade-in">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>🎙️ Spoken Voice</span>
                        <span className="text-[#c9a875]">{Math.round(voiceVol * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={voiceVol}
                        onChange={(e) => setVoiceVol(parseFloat(e.target.value))}
                        className="w-full accent-[#c9a875]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>🪕 Celtic Harp Plucks</span>
                        <span className="text-[#c9a875]">{Math.round(harpsVol * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={harpsVol}
                        onChange={(e) => setHarpsVol(parseFloat(e.target.value))}
                        className="w-full accent-[#c9a875]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>🎻 Warm Cello Drone</span>
                        <span className="text-[#c9a875]">{Math.round(celloVol * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={celloVol}
                        onChange={(e) => setCelloVol(parseFloat(e.target.value))}
                        className="w-full accent-[#c9a875]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>🌧️ Rain Ambience</span>
                        <span className="text-[#c9a875]">{Math.round(rainVol * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={rainVol}
                        onChange={(e) => setRainVol(parseFloat(e.target.value))}
                        className="w-full accent-[#c9a875]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-neutral-400 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span>🪕 Celtic Harp:</span>
                      <span className="text-emerald-400 font-mono-code font-bold">Generative Modal</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>🎻 Cello Resonance:</span>
                      <span className="text-emerald-400 font-mono-code font-bold">Harmonic Drone</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>🌧️ Rain Textures:</span>
                      <span className="text-emerald-400 font-mono-code font-bold">Active</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Master Playback Controls */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={stopRecital}
                  disabled={!isPlaying && currentLineIndex === -1}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white disabled:opacity-40 transition-all cursor-pointer"
                  title="Restart / Reset Recital"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlay}
                  className="flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-[0.16em] text-xs transition-all cursor-pointer flex items-center justify-center gap-2 bg-gradient-to-r from-[#c9a875] via-[#dfbd87] to-[#c9a875] text-black shadow-[0_0_25px_rgba(201,168,117,0.4)] hover:scale-[1.02] active:scale-98"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-black" />
                      <span>Pause Recital</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-black ml-0.5" />
                      <span>{currentLineIndex >= 0 ? 'Resume Recital' : 'Begin Recital'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-black/60 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-400 font-mono-code">
          <span>Spacebar to Play/Pause • High-DPI Waveform Active</span>
          <span className="text-[#c9a875]">The Artisan's Quill Sanctuary Engine</span>
        </div>
      </div>
    </div>
  );
};
