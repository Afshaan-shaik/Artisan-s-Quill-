import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Award,
  ShieldCheck,
  Sparkles,
  RotateCw,
  Download,
  Feather,
  Eye,
  CheckCircle,
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Artwork, UserProfile } from '../types';
import confetti from 'canvas-confetti';

interface Collector3DVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  userArtworks: Artwork[];
  onSelectArtwork: (artwork: Artwork) => void;
}

interface Medallion {
  id: string;
  title: string;
  tier: string;
  emoji: string;
  description: string;
  criteria: string;
  isUnlocked: boolean;
  color: string;
  metal: string;
}

export const Collector3DVaultModal: React.FC<Collector3DVaultModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userArtworks,
  onSelectArtwork
}) => {
  const [activeTab, setActiveTab] = useState<'medallions' | 'certificates' | 'pedestal'>('medallions');
  const [selectedMedallion, setSelectedMedallion] = useState<string>('calligrapher');
  const [selectedArtworkForCoA, setSelectedArtworkForCoA] = useState<Artwork | null>(
    userArtworks[0] || null
  );

  // 3D Pedestal Rotation States
  const [pedestalRotation, setPedestalRotation] = useState({ x: 15, y: 35 });
  const isDraggingPedestal = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const medallions: Medallion[] = [
    {
      id: 'calligrapher',
      title: 'Master Calligrapher',
      tier: '24k Imperial Gold',
      emoji: '🪶',
      description: 'Awarded for exceptional mastery of the fluid ink quill and lyric verse compositions.',
      criteria: 'Inaugurate 1 or more original calligraphy pieces into the sanctuary.',
      isUnlocked: userArtworks.some((a) => a.category === 'poetry') || currentUser.artworksCount > 0,
      color: '#c9a875',
      metal: 'from-[#c9a875] via-[#dfbd87] to-[#8a6b32]'
    },
    {
      id: 'curator',
      title: 'Curator Laureate',
      tier: 'Obsidian Platinum',
      emoji: '🏛️',
      description: 'Granted to guardians who curate, archive, and preserve sanctuary masterpieces.',
      criteria: 'Actively curate and evaluate 5+ fine art exhibitions.',
      isUnlocked: true,
      color: '#a5b4fc',
      metal: 'from-[#e0e7ff] via-[#818cf8] to-[#3730a3]'
    },
    {
      id: 'patron',
      title: 'Patron of the Arts',
      tier: 'Jade Emerald',
      emoji: '💎',
      description: 'Commemorating benefactors whose recognition fuels living artisans.',
      criteria: 'Bestow appreciation across the global real-time sanctuary feed.',
      isUnlocked: true,
      color: '#10b981',
      metal: 'from-[#6ee7b7] via-[#10b981] to-[#064e3b]'
    },
    {
      id: 'visionary',
      title: 'Grand Visionary',
      tier: 'Celestial Starlight',
      emoji: '✨',
      description: 'The highest sanctuary hallmark, honoring lifelong devotion to digital fine arts.',
      criteria: 'Verified sanctuary membership and cross-disciplinary creation.',
      isUnlocked: currentUser.verified || currentUser.id !== 'guest',
      color: '#f472b6',
      metal: 'from-[#fbcfe8] via-[#f472b6] to-[#831843]'
    }
  ];

  // Update selected CoA artwork if userArtworks change
  useEffect(() => {
    if (!selectedArtworkForCoA && userArtworks.length > 0) {
      setSelectedArtworkForCoA(userArtworks[0]);
    }
  }, [userArtworks, selectedArtworkForCoA]);

  if (!isOpen) return null;

  const handleMedallionClick = (medallion: Medallion) => {
    setSelectedMedallion(medallion.id);
    if (medallion.isUnlocked) {
      confetti({
        particleCount: 28,
        spread: 60,
        origin: { y: 0.6 },
        colors: [medallion.color, '#ffffff', '#dfbd87']
      });
    }
  };

  const handlePedestalMouseDown = (e: React.MouseEvent) => {
    isDraggingPedestal.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePedestalMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingPedestal.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setPedestalRotation((prev) => ({
      x: Math.max(-45, Math.min(45, prev.x - dy * 0.5)),
      y: prev.y + dx * 0.5
    }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePedestalMouseUp = () => {
    isDraggingPedestal.current = false;
  };

  const activeMedallionObj = medallions.find((m) => m.id === selectedMedallion) || medallions[0];

  return (
    <div
      id="collector-3d-vault-modal"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl ultra-glass-elevated border border-[#c9a875]/40 shadow-[0_0_60px_rgba(201,168,117,0.3)] overflow-hidden">
        {/* Top Gold Specular Rim */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#dfbd87] to-transparent opacity-90" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a875]/30 to-[#dfbd87]/10 border border-[#c9a875]/40 flex items-center justify-center shadow-inner">
              <Award className="w-5 h-5 text-[#dfbd87]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                  Collector's 3D Trophy Sanctum
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-mono-code font-bold bg-[#c9a875]/20 text-[#dfbd87] border border-[#c9a875]/40">
                  Verified Vault
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono-code">
                Provenance vault, 3D pedestals & minted hallmark medallions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Close Vault"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Strip */}
        <div className="px-5 py-2.5 bg-black/60 border-b border-white/10 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('medallions')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono-code font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'medallions'
                  ? 'bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black shadow-md shadow-[#c9a875]/20'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Hallmark Medallions</span>
            </button>

            <button
              onClick={() => setActiveTab('certificates')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono-code font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'certificates'
                  ? 'bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black shadow-md shadow-[#c9a875]/20'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certificates of Authenticity</span>
            </button>

            <button
              onClick={() => setActiveTab('pedestal')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono-code font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'pedestal'
                  ? 'bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black shadow-md shadow-[#c9a875]/20'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>3D Museum Pedestal</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] text-[#c9a875] font-mono-code">
            <Sparkles className="w-3 h-3" />
            <span>Vault Keeper: {currentUser.name}</span>
          </div>
        </div>

        {/* Modal Main Chamber Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-black/50 to-black/80">
          {/* TAB 1: HALLMARK MEDALLIONS */}
          {activeTab === 'medallions' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left: Interactive 3D Medallion Display */}
              <div className="md:col-span-6 flex flex-col items-center justify-center p-8 rounded-2xl bg-radial from-[#121624] via-[#080a0f] to-black border border-white/10 relative overflow-hidden min-h-[320px]">
                <div className="absolute inset-0 bg-radial from-[#c9a875]/10 via-transparent to-transparent pointer-events-none" />

                {/* 3D Floating Medallion Disc */}
                <div className="relative group cursor-pointer perspective-1000">
                  <div
                    className={`w-44 h-44 sm:w-52 sm:h-52 rounded-full p-2 bg-gradient-to-br ${activeMedallionObj.metal} shadow-[0_0_50px_rgba(201,168,117,0.35)] flex items-center justify-center transition-transform duration-700 ease-out hover:rotate-12`}
                  >
                    <div className="w-full h-full rounded-full bg-[#0d0e14] border-2 border-white/20 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden shadow-inner">
                      {/* Specular Sheen */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent opacity-60 pointer-events-none" />

                      <span className="text-4xl sm:text-5xl mb-2 filter drop-shadow-md">
                        {activeMedallionObj.emoji}
                      </span>
                      <span className="text-xs uppercase font-serif font-bold text-white tracking-widest px-2">
                        {activeMedallionObj.title}
                      </span>
                      <span className="text-[9px] uppercase font-mono-code text-[#dfbd87] mt-1 font-semibold">
                        {activeMedallionObj.tier}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono-code font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle className="w-3 h-3" />
                    <span>Minted on Atelier Ledger</span>
                  </span>
                </div>
              </div>

              {/* Right: Medallion Catalog & Details */}
              <div className="md:col-span-6 flex flex-col gap-3">
                <h3 className="text-sm font-mono-code uppercase tracking-wider text-[#c9a875]">
                  Select Hallmark Medallion:
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {medallions.map((medallion) => {
                    const isSelected = selectedMedallion === medallion.id;
                    return (
                      <button
                        key={medallion.id}
                        onClick={() => handleMedallionClick(medallion)}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#c9a875]/25 via-white/5 to-transparent border-[#dfbd87] shadow-[0_0_20px_rgba(201,168,117,0.2)]'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-neutral-300'
                        }`}
                      >
                        <span className="text-2xl shrink-0">{medallion.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-serif font-bold text-white">{medallion.title}</h4>
                            <span className="text-[9px] font-mono-code text-[#dfbd87] uppercase font-bold">
                              {medallion.tier}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                            {medallion.description}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-500 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CERTIFICATES OF AUTHENTICITY */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              {userArtworks.length === 0 ? (
                <div className="py-16 text-center rounded-xl bg-white/5 border border-white/10 p-6">
                  <ShieldCheck className="w-12 h-12 text-[#c9a875] mx-auto mb-3 opacity-60" />
                  <h3 className="text-base font-serif font-bold text-white mb-1">
                    No Registered Artworks in Vault
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono-code max-w-md mx-auto">
                    Inaugurate a painting, digital artwork, or calligraphy poem to automatically mint its cryptographic Certificate of Authenticity.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left: Artwork Selector */}
                  <div className="md:col-span-4 space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    <span className="text-[11px] font-mono-code uppercase text-[#c9a875] block mb-2">
                      Registered Masterpieces:
                    </span>
                    {userArtworks.map((art) => {
                      const isVideo = art.category === 'video' || art.mediaUrl?.match(/\.(mp4|webm|mov)(\?.*)?$/i);
                      const isPoetry = art.category === 'poetry';

                      return (
                        <button
                          key={art.id}
                          onClick={() => setSelectedArtworkForCoA(art)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                            selectedArtworkForCoA?.id === art.id
                              ? 'bg-[#c9a875]/25 border-[#dfbd87] text-white shadow-sm'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-neutral-300'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-[#1b1713] via-[#0d0e14] to-black border border-white/15 flex items-center justify-center">
                            {isVideo ? (
                              <video
                                src={art.mediaUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover pointer-events-none"
                              />
                            ) : isPoetry ? (
                              <Feather className="w-4 h-4 text-[#dfbd87]" />
                            ) : (
                              <img
                                src={art.thumbnailUrl || art.mediaUrl}
                                alt={art.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-serif font-bold truncate">{art.title}</h4>
                            <span className="text-[9px] uppercase font-mono-code text-[#dfbd87]">
                              {art.category} • {art.year}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right: Holographic Certificate Card */}
                  {selectedArtworkForCoA && (
                    <div className="md:col-span-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#14120f] via-[#090807] to-black border-2 border-[#c9a875]/60 shadow-[0_0_40px_rgba(201,168,117,0.25)] relative overflow-hidden">
                      {/* Gold Foil Accent Borders */}
                      <div className="absolute inset-2 border border-[#c9a875]/30 pointer-events-none rounded-xl" />

                      <div className="relative z-10 text-center space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.3em] font-mono-code text-[#dfbd87] font-bold block">
                          Sanctuary Provenance Protocol
                        </span>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide uppercase">
                          Certificate of Authenticity
                        </h3>
                        <p className="text-xs font-serif italic text-neutral-300 max-w-lg mx-auto">
                          This document certifies that the work titled <strong className="text-white">"{selectedArtworkForCoA.title}"</strong> is an authentic original creation registered in the sanctuary archive.
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-white/10 text-left">
                          <div>
                            <span className="text-[9px] font-mono-code uppercase text-[#c9a875] block">Artisan:</span>
                            <span className="text-xs font-bold text-white">{selectedArtworkForCoA.artist?.name || currentUser.name}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono-code uppercase text-[#c9a875] block">Medium:</span>
                            <span className="text-xs font-bold text-white uppercase">{selectedArtworkForCoA.medium || selectedArtworkForCoA.category}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono-code uppercase text-[#c9a875] block">Epoch:</span>
                            <span className="text-xs font-bold text-white">{selectedArtworkForCoA.year}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono-code uppercase text-[#c9a875] block">Ledger Hash:</span>
                            <span className="text-[10px] font-mono-code text-neutral-400 font-bold">SHA256-{selectedArtworkForCoA.id.slice(0, 8)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-[#c9a875] flex items-center justify-center font-serif text-black font-bold text-xs shadow-md">
                              AQ
                            </span>
                            <div className="text-left">
                              <span className="text-[10px] font-bold text-white block">Official Seal</span>
                              <span className="text-[8px] font-mono-code text-[#dfbd87]">The Artisan's Quill</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              confetti({ particleCount: 20, spread: 45, origin: { y: 0.7 } });
                              onSelectArtwork(selectedArtworkForCoA);
                              onClose();
                            }}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-110 cursor-pointer"
                          >
                            Inspect Artwork
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 3D MUSEUM PEDESTAL */}
          {activeTab === 'pedestal' && (
            <div
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-radial from-[#121726] via-[#090b12] to-black border border-white/10 relative overflow-hidden min-h-[380px] cursor-grab active:cursor-grabbing"
              onMouseDown={handlePedestalMouseDown}
              onMouseMove={handlePedestalMouseMove}
              onMouseUp={handlePedestalMouseUp}
            >
              <div className="text-center mb-6 pointer-events-none">
                <span className="text-[10px] uppercase font-mono-code text-[#c9a875] font-bold tracking-widest block">
                  3D Spatial Exhibition Pedestal
                </span>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Click and drag to rotate the pedestal 360°
                </p>
              </div>

              {/* 3D Pedestal & Artwork Cube */}
              <div
                className="perspective-1000 transition-transform duration-75"
                style={{
                  transform: `rotateX(${pedestalRotation.x}deg) rotateY(${pedestalRotation.y}deg)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="w-48 h-60 sm:w-56 sm:h-72 rounded-2xl ultra-glass-elevated border-2 border-[#dfbd87] p-4 shadow-[0_30px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(201,168,117,0.3)] flex flex-col items-center justify-between text-center relative overflow-hidden">
                  {/* Top Pedestal Specular Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/60 pointer-events-none" />

                  {/* Artwork Display on Pedestal with full Video & Poetry support & dark luxury background */}
                  <div className="w-full h-36 sm:h-44 rounded-xl overflow-hidden shadow-lg border border-white/20 relative bg-gradient-to-br from-[#1b1713] via-[#0e1118] to-black flex items-center justify-center">
                    {(() => {
                      const targetArt = selectedArtworkForCoA || userArtworks[0];
                      if (!targetArt) {
                        return <Feather className="w-10 h-10 text-[#c9a875]" />;
                      }

                      const isVideo = targetArt.category === 'video' || targetArt.mediaUrl?.match(/\.(mp4|webm|mov)(\?.*)?$/i);
                      const isPoetry = targetArt.category === 'poetry';

                      if (isVideo && targetArt.mediaUrl) {
                        return (
                          <video
                            src={targetArt.mediaUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover pointer-events-none"
                          />
                        );
                      }

                      if (isPoetry) {
                        return (
                          <div className="w-full h-full p-4 bg-gradient-to-b from-[#251d15] via-[#15120e] to-[#0a0806] flex flex-col items-center justify-center text-center">
                            <Feather className="w-8 h-8 text-[#dfbd87] mb-2 drop-shadow-sm" />
                            <h5 className="text-xs font-serif font-bold text-[#f5ecd7] line-clamp-1 mb-1">
                              {targetArt.title}
                            </h5>
                            <p className="text-[9px] font-serif italic text-[#dfbd87]/80 line-clamp-3 leading-relaxed">
                              {targetArt.poetryContent?.stanzas?.[0]?.split('\n')[0] || targetArt.description || 'Illuminated Verse'}
                            </p>
                          </div>
                        );
                      }

                      if (targetArt.mediaUrl || targetArt.thumbnailUrl) {
                        return (
                          <img
                            src={targetArt.thumbnailUrl || targetArt.mediaUrl}
                            alt={targetArt.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        );
                      }

                      return <Feather className="w-10 h-10 text-[#c9a875]" />;
                    })()}

                    {/* Category pill on pedestal */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-sm border border-[#c9a875]/40 text-[8px] font-mono-code uppercase text-[#dfbd87] shadow-sm">
                      {(selectedArtworkForCoA || userArtworks[0])?.category || 'Masterpiece'}
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h4 className="text-xs font-serif font-bold text-white truncate max-w-[180px]">
                      {selectedArtworkForCoA?.title || userArtworks[0]?.title || 'Sanctuary Masterpiece'}
                    </h4>
                    <span className="text-[9px] uppercase font-mono-code text-[#dfbd87] block mt-0.5">
                      {selectedArtworkForCoA?.artist?.name || currentUser.name}
                    </span>
                  </div>
                </div>

                {/* Pedestal Base Shadow */}
                <div
                  className="w-64 h-8 mx-auto -mt-4 bg-radial from-[#c9a875]/30 to-transparent blur-md rounded-full"
                  style={{ transform: 'rotateX(90deg) translateZ(-40px)' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
