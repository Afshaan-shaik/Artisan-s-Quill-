import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sliders,
  Sun,
  CloudRain,
  Flame,
  Sunrise,
  Check,
  ChevronDown
} from 'lucide-react';
import { AtmosphereMode } from '../types';
import { sanctuaryAtmosphere, ATMOSPHERE_MODES, AtmosphereConfig } from '../services/atmosphereEngine';

interface AtmosphereSwitcherProps {
  compact?: boolean;
}

export const AtmosphereSwitcher: React.FC<AtmosphereSwitcherProps> = ({ compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<AtmosphereMode>(sanctuaryAtmosphere.getMode());
  const [isPlaying, setIsPlaying] = useState<boolean>(sanctuaryAtmosphere.getIsPlaying());
  const [isMuted, setIsMuted] = useState<boolean>(sanctuaryAtmosphere.getIsMuted());
  const [volume, setVolume] = useState<number>(sanctuaryAtmosphere.getVolume());

  useEffect(() => {
    const unsubscribe = sanctuaryAtmosphere.subscribe(() => {
      setCurrentMode(sanctuaryAtmosphere.getMode());
      setIsPlaying(sanctuaryAtmosphere.getIsPlaying());
      setIsMuted(sanctuaryAtmosphere.getIsMuted());
      setVolume(sanctuaryAtmosphere.getVolume());
    });
    return () => unsubscribe();
  }, []);

  const activeConfig = ATMOSPHERE_MODES[currentMode];

  const handleSelectMode = (mode: AtmosphereMode) => {
    sanctuaryAtmosphere.setMode(mode);
  };

  const handleToggleSound = () => {
    sanctuaryAtmosphere.togglePlayback();
  };

  const getAtmosphereIcon = (mode: AtmosphereMode) => {
    switch (mode) {
      case 'dawn':
        return <Sunrise className="w-3.5 h-3.5 text-[#9cb6db]" />;
      case 'golden-hour':
        return <Sun className="w-3.5 h-3.5 text-[#e8be78]" />;
      case 'midnight-rain':
        return <CloudRain className="w-3.5 h-3.5 text-[#7fa6db]" />;
      case 'candlelight':
        return <Flame className="w-3.5 h-3.5 text-[#df9c53]" />;
    }
  };

  if (compact) {
    return (
      <div className="relative inline-block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/85 border border-[#c9a875]/35 hover:border-[#dfbd87] text-[#e8c690] text-xs font-mono-code transition-all shadow-[0_0_15px_rgba(201,168,117,0.15)] cursor-pointer group"
          title={`Atmosphere: ${activeConfig.name}`}
        >
          <span className="flex items-center gap-1.5">
            {getAtmosphereIcon(currentMode)}
            <span className="hidden sm:inline font-bold tracking-wider">{activeConfig.name}</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#c9a875] animate-pulse" />
          <ChevronDown className="w-3 h-3 text-[#c9a875] opacity-70 group-hover:opacity-100 transition-opacity" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0b0d13]/98 border border-[#c9a875]/40 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(201,168,117,0.2)] backdrop-blur-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#c9a875]" />
                  <span className="text-xs uppercase font-serif-display font-bold text-[#f2dec4] tracking-widest">
                    Sanctuary Atmosphere
                  </span>
                </div>
                <button
                  onClick={handleToggleSound}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-mono-code font-bold transition-all ${
                    isPlaying
                      ? 'bg-[#c9a875] text-black shadow-[0_0_15px_rgba(201,168,117,0.4)]'
                      : 'bg-white/5 border border-white/15 text-neutral-300 hover:text-white'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isPlaying ? 'Live Audio' : 'Play Sound'}</span>
                </button>
              </div>

              {/* Theme Grid */}
              <div className="grid grid-cols-2 gap-2.5 my-4">
                {(Object.keys(ATMOSPHERE_MODES) as AtmosphereMode[]).map((modeKey) => {
                  const cfg = ATMOSPHERE_MODES[modeKey];
                  const isSelected = modeKey === currentMode;
                  return (
                    <button
                      key={modeKey}
                      onClick={() => handleSelectMode(modeKey)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? 'bg-[#c9a875]/20 border-[#c9a875] shadow-[0_0_20px_rgba(201,168,117,0.25)] ring-1 ring-[#c9a875]'
                          : 'bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-lg">{cfg.icon}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#dfbd87]" />}
                      </div>
                      <div className="font-serif-display font-medium text-xs text-white group-hover:text-[#dfbd87] transition-colors">
                        {cfg.name}
                      </div>
                      <div className="text-[9px] text-neutral-400 font-mono-code mt-0.5 line-clamp-1">
                        {cfg.ambientTrackTitle}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sound Controls */}
              <div className="pt-3 border-t border-white/10 space-y-3 bg-black/40 p-3 rounded-xl">
                <div className="flex items-center justify-between text-xs font-mono-code text-neutral-300">
                  <span className="flex items-center gap-1.5 text-[10px] uppercase text-[#c9a875]">
                    <Sliders className="w-3 h-3" /> Soundscape Density
                  </span>
                  <button
                    onClick={() => sanctuaryAtmosphere.toggleMute()}
                    className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#c9a875]" />}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => sanctuaryAtmosphere.setVolume(parseFloat(e.target.value))}
                    className="w-full accent-[#c9a875] bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] font-mono-code text-neutral-400 w-8 text-right">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-[#0e1017]/95 via-[#0a0c10]/95 to-[#06070a]/95 border border-[#c9a875]/30 p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#c9a875]/20 border border-[#c9a875]/50 text-[#dfbd87]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-display text-base font-bold text-white uppercase tracking-wider">
              Dynamic Sanctuary Atmosphere
            </h3>
            <p className="text-xs text-[#c9a875] font-mono-code">
              Active: {activeConfig.name} • {activeConfig.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleSound}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs uppercase font-mono-code font-bold transition-all cursor-pointer shadow-lg ${
            isPlaying
              ? 'bg-[#c9a875] text-black shadow-[0_0_20px_rgba(201,168,117,0.4)]'
              : 'bg-black/60 border border-[#c9a875]/50 text-[#dfbd87] hover:bg-[#c9a875] hover:text-black'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isPlaying ? 'Soundscape Active' : 'Engage Soundscape'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(ATMOSPHERE_MODES) as AtmosphereMode[]).map((modeKey) => {
          const cfg = ATMOSPHERE_MODES[modeKey];
          const isSelected = modeKey === currentMode;
          return (
            <div
              key={modeKey}
              onClick={() => handleSelectMode(modeKey)}
              className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-[#c9a875]/25 to-black/80 border-[#c9a875] shadow-xl ring-1 ring-[#c9a875]'
                  : 'bg-black/40 border-white/10 hover:border-[#c9a875]/40 hover:bg-white/[0.04]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{cfg.icon}</span>
                  {isSelected && <span className="px-2 py-0.5 rounded-full bg-[#c9a875] text-black text-[9px] font-bold font-mono-code">ACTIVE</span>}
                </div>
                <h4 className="font-serif-display font-medium text-sm text-white group-hover:text-[#dfbd87] transition-colors">
                  {cfg.name}
                </h4>
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                  {cfg.description}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-white/10 text-[9px] font-mono-code text-[#c9a875]">
                {cfg.ambientTrackTitle}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
