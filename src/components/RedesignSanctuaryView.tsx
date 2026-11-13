import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Artwork, ArtCategory } from '../types';

interface RedesignSanctuaryViewProps {
  artworks: Artwork[];
  dailyMasterpiece?: Artwork | null;
  onSelectArtwork: (artwork: Artwork) => void;
  onOpenUpload: () => void;
  onSelectArtist?: (artist: any) => void;
  onOpenPoetryStudio?: () => void;
  onOpenMusicSanctuary?: () => void;
  onOpenAbout?: () => void;
  onExploreFullAtelier?: () => void;
}

export const RedesignSanctuaryView: React.FC<RedesignSanctuaryViewProps> = ({
  artworks,
  dailyMasterpiece,
  onSelectArtwork,
  onOpenUpload,
  onSelectArtist,
  onOpenPoetryStudio,
  onOpenMusicSanctuary,
  onOpenAbout,
  onExploreFullAtelier
}) => {
  const [selectedChip, setSelectedChip] = useState<string>('all');
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(38); // percentage
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);
  const glowRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter artworks for the bento grid based on the active chip
  const filteredArtworks = useMemo(() => {
    if (selectedChip === 'all') return artworks;
    if (selectedChip === 'poetry') return artworks.filter(a => a.category === 'poetry');
    if (selectedChip === 'motion') return artworks.filter(a => a.category === 'video');
    if (selectedChip === 'paintings') return artworks.filter(a => a.category === 'painting');
    if (selectedChip === 'ink') return artworks.filter(a => a.category === 'drawing');
    if (selectedChip === 'music') return artworks.filter(a => a.category === 'music');
    return artworks;
  }, [artworks, selectedChip]);

  // Spotlight artwork: Masterpiece of the day or first featured artwork
  const spotlightArtwork = useMemo(() => {
    if (dailyMasterpiece) return dailyMasterpiece;
    if (artworks.length > 0) return artworks[spotlightIndex % artworks.length];
    return null;
  }, [dailyMasterpiece, artworks, spotlightIndex]);

  // Featured Poem
  const featuredPoem = useMemo(() => {
    const poem = artworks.find(a => a.category === 'poetry' && a.poetryContent?.stanzas?.length);
    if (poem) return poem;
    return null;
  }, [artworks]);

  // Featured Music track
  const featuredMusic = useMemo(() => {
    const music = artworks.find(a => a.category === 'music' && a.musicData?.audioUrl);
    if (music) return music;
    return null;
  }, [artworks]);

  // Mouse interactive radial glow tracker
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // IntersectionObserver for reveal on scroll (.rv.in)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.rv');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [filteredArtworks]);

  // Audio play/pause toggle
  const togglePlayAudio = () => {
    if (!audioRef.current && featuredMusic?.musicData?.audioUrl) {
      audioRef.current = new Audio(featuredMusic.musicData.audioUrl);
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current && audioRef.current.duration) {
          setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      };
      audioRef.current.onended = () => setIsPlayingMusic(false);
    }

    if (audioRef.current) {
      if (isPlayingMusic) {
        audioRef.current.pause();
        setIsPlayingMusic(false);
      } else {
        audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
      }
    } else {
      setIsPlayingMusic(!isPlayingMusic);
    }
  };

  // Helper to get fallback gradient colors for cards without images
  const getCardGradient = (index: number) => {
    const gradients = [
      'radial-gradient(circle at 70% 25%, #f6e3b4, transparent 25%), linear-gradient(135deg, #a8742f, #2a1608 70%)',
      'radial-gradient(circle at 30% 30%, #8a5ed0, transparent 50%), linear-gradient(135deg, #2b1747, #07060c)',
      'linear-gradient(135deg, #1d4a52, #06090c)',
      'radial-gradient(circle at 50% 70%, #d8b779, transparent 40%), linear-gradient(180deg, #15161b, #050507)',
      'linear-gradient(120deg, #3a1a1f, #c47a4a 60%, #1a0e12)'
    ];
    return gradients[index % gradients.length];
  };

  // Map category to display badge name
  const getMediumLabel = (cat: string) => {
    switch (cat) {
      case 'poetry': return 'Poetry Card';
      case 'video': return 'Motion Loop';
      case 'painting': return 'Painting';
      case 'drawing': return 'Drawing & Ink';
      case 'digital': return 'Digital Media';
      case 'music': return 'Original Music';
      default: return 'Fine Art';
    }
  };

  return (
    <div className="redesign-preview-root relative min-h-screen bg-[#050507] text-[#f4efe6] font-[300] selection:bg-[#d8b779]/30 selection:text-[#f6e3b4] overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────
          1. SCOPED STYLES FROM UPLOADED REDESIGN PREVIEW
         ───────────────────────────────────────────────────────────── */}
      <style>{`
        .redesign-preview-root {
          --bg: #050507;
          --panel: #0b0c10;
          --line: rgba(236, 214, 170, 0.12);
          --ink: #f4efe6;
          --mute: #8d897f;
          --gold: #d8b779;
          --gold2: #f6e3b4;
          font-family: 'Inter', system-ui, sans-serif;
          color: var(--ink);
          background-color: var(--bg);
        }

        .redesign-preview-root::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: 50;
          pointer-events: none;
          opacity: 0.07;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        #redesign-glow {
          position: fixed;
          width: 640px;
          height: 640px;
          left: 0;
          top: 0;
          margin: -320px 0 0 -320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(216, 183, 121, 0.13), transparent 65%);
          pointer-events: none;
          z-index: 0;
          transition: transform 0.25s ease-out;
        }

        .redesign-preview-root .serif {
          font-family: "Cormorant Garamond", Georgia, serif;
          font-weight: 300;
        }

        .redesign-preview-root .mono {
          font-family: "JetBrains Mono", monospace;
          font-size: 10.5px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--gold);
        }

        .redesign-preview-root .gt {
          background: linear-gradient(120deg, var(--gold2), var(--gold) 45%, #b68b45);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .redesign-preview-root .wrap {
          width: min(1200px, 90%);
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .redesign-preview-root nav.redesign-nav {
          position: fixed;
          top: calc(18px + env(safe-area-inset-top, 0px));
          left: 50%;
          transform: translateX(-50%);
          z-index: 40;
          width: min(1000px, 92%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 10px 10px 28px;
          border-radius: 999px;
          background: rgba(10, 11, 15, 0.65);
          backdrop-filter: blur(24px) saturate(1.4);
          box-shadow: 0 0 0 1px var(--line), 0 20px 60px -20px #000;
        }

        .redesign-preview-root .logo {
          font-size: 23px;
          letter-spacing: 0.02em;
        }

        .redesign-preview-root .links {
          display: flex;
          gap: 34px;
        }
        .redesign-preview-root .links a {
          color: var(--mute);
          text-decoration: none;
          font-size: 12px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          transition: 0.4s;
          cursor: pointer;
        }
        .redesign-preview-root .links a:hover {
          color: var(--gold2);
        }

        .redesign-preview-root .btn {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink);
          background: none;
          border: 0;
          box-shadow: inset 0 0 0 1px var(--line);
          padding: 14px 28px;
          border-radius: 999px;
          cursor: pointer;
          transition: 0.5s;
        }
        .redesign-preview-root .btn:hover {
          box-shadow: inset 0 0 0 1px var(--gold);
          color: var(--gold2);
        }
        .redesign-preview-root .btn.gold {
          background: linear-gradient(135deg, var(--gold2), var(--gold) 55%, #b68b45);
          color: #171007;
          font-weight: 500;
          box-shadow: 0 12px 40px -10px rgba(216, 183, 121, 0.5);
        }
        .redesign-preview-root .btn.gold:hover {
          color: #171007;
          transform: translateY(-2px);
          box-shadow: 0 18px 50px -10px rgba(216, 183, 121, 0.7);
        }

        .redesign-preview-root .hero {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 90px;
          align-items: center;
          padding: 150px 0 100px;
        }

        .redesign-preview-root h1 {
          font-size: clamp(54px, 8.4vw, 126px);
          line-height: 0.92;
          letter-spacing: -0.02em;
          margin: 30px 0 34px;
        }
        .redesign-preview-root h1 em {
          font-style: italic;
        }

        .redesign-preview-root .lead {
          color: var(--mute);
          max-width: 44ch;
          font-size: 17px;
          line-height: 1.7;
        }

        .redesign-preview-root .cta {
          display: flex;
          gap: 16px;
          margin-top: 46px;
          flex-wrap: wrap;
        }

        .redesign-preview-root .stats {
          display: flex;
          gap: 48px;
          margin-top: 70px;
        }
        .redesign-preview-root .stats b {
          display: block;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 40px;
          font-weight: 300;
          color: var(--ink);
          line-height: 1;
          margin-bottom: 4px;
        }

        .redesign-preview-root .frame {
          position: relative;
          aspect-ratio: 3/4;
          padding: 16px;
          border-radius: 200px 200px 24px 24px;
          background: linear-gradient(170deg, rgba(246, 227, 180, 0.35), rgba(216, 183, 121, 0.04) 40%, rgba(216, 183, 121, 0.2));
          animation: floatArch 9s ease-in-out infinite;
          cursor: pointer;
        }
        @keyframes floatArch {
          50% { transform: translateY(-14px); }
        }

        .redesign-preview-root .art {
          height: 100%;
          border-radius: 184px 184px 12px 12px;
          position: relative;
          overflow: hidden;
          background: radial-gradient(circle at 50% 28%, #f6e3b4 0, #d8b779 7%, transparent 22%), radial-gradient(ellipse at 20% 80%, #4a2a7a, transparent 55%), radial-gradient(ellipse at 85% 60%, #1d4a52, transparent 50%), linear-gradient(190deg, #140c1c, #050507);
        }
        .redesign-preview-root .art::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(transparent 55%, rgba(5, 5, 7, 0.9));
        }

        .redesign-preview-root .cap {
          position: absolute;
          z-index: 2;
          left: 28px;
          right: 28px;
          bottom: 26px;
        }
        .redesign-preview-root .cap h3 {
          font-size: 46px;
          line-height: 1.1;
          margin-top: 6px;
        }

        .redesign-preview-root .tag {
          position: absolute;
          right: -18px;
          top: 18%;
          z-index: 3;
          padding: 14px 20px;
          border-radius: 16px;
          background: rgba(10, 11, 15, 0.7);
          backdrop-filter: blur(16px);
          box-shadow: 0 0 0 1px var(--line);
        }

        .redesign-preview-root .marq {
          overflow: hidden;
          border-block: 1px solid var(--line);
          padding: 26px 0;
          position: relative;
          z-index: 1;
        }
        .redesign-preview-root .marq div {
          display: flex;
          gap: 60px;
          width: max-content;
          animation: marqAnim 40s linear infinite;
          font-size: 34px;
          color: var(--mute);
        }
        .redesign-preview-root .marq span::after {
          content: "✦";
          color: var(--gold);
          margin-left: 60px;
          font-size: 14px;
        }
        @keyframes marqAnim {
          to { transform: translateX(-50%); }
        }

        .redesign-preview-root .sect {
          padding: 140px 0;
        }

        .redesign-preview-root .head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 30px;
          margin-bottom: 64px;
        }

        .redesign-preview-root h2 {
          font-size: clamp(42px, 5.6vw, 80px);
          line-height: 1;
          margin-top: 14px;
        }

        .redesign-preview-root .chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .redesign-preview-root .chip {
          padding: 10px 20px;
          border-radius: 999px;
          border: 0;
          box-shadow: inset 0 0 0 1px var(--line);
          background: none;
          color: var(--mute);
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: 0.4s;
        }
        .redesign-preview-root .chip.on,
        .redesign-preview-root .chip:hover {
          background: var(--gold);
          color: #171007;
          font-weight: 500;
        }

        .redesign-preview-root .bento {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: 150px;
          gap: 24px;
        }

        .redesign-preview-root .card {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 0 0 1px var(--line);
          transition: 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
        }
        .redesign-preview-root .card:hover {
          transform: translateY(-10px);
          box-shadow: 0 0 0 1px rgba(216, 183, 121, 0.5), 0 40px 80px -30px rgba(216, 183, 121, 0.25);
        }
        .redesign-preview-root .card i {
          position: absolute;
          inset: 0;
          transition: 1.2s cubic-bezier(0.2, 0.7, 0.2, 1);
          background-size: cover;
          background-position: center;
        }
        .redesign-preview-root .card:hover i {
          transform: scale(1.08);
        }
        .redesign-preview-root .card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(transparent 45%, rgba(5, 5, 7, 0.88));
        }
        .redesign-preview-root .card div {
          position: absolute;
          z-index: 2;
          left: 26px;
          bottom: 22px;
        }
        .redesign-preview-root .card h4 {
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 30px;
          font-weight: 300;
          line-height: 1.1;
          margin-top: 4px;
        }

        .redesign-preview-root .card.a { grid-column: span 7; grid-row: span 3; }
        .redesign-preview-root .card.b { grid-column: span 5; grid-row: span 2; }
        .redesign-preview-root .card.c { grid-column: span 5; grid-row: span 1; }
        .redesign-preview-root .card.d { grid-column: span 4; grid-row: span 2; }
        .redesign-preview-root .card.e { grid-column: span 8; grid-row: span 2; }

        .redesign-preview-root .poem {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-radius: 40px;
          overflow: hidden;
          box-shadow: 0 0 0 1px var(--line);
          background: linear-gradient(135deg, #0d0e13, #07080b);
        }
        .redesign-preview-root .poem > div {
          padding: 90px 72px;
        }
        .redesign-preview-root .poem blockquote {
          font-family: "Cormorant Garamond", Georgia, serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(30px, 3.4vw, 46px);
          line-height: 1.4;
          margin: 36px 0 44px;
          position: relative;
        }
        .redesign-preview-root .poem blockquote::before {
          content: "“";
          position: absolute;
          left: -0.55em;
          top: -0.25em;
          font-size: 2.4em;
          color: var(--gold);
          opacity: 0.5;
        }

        .redesign-preview-root .vis {
          background: radial-gradient(circle at 50% 50%, rgba(216, 183, 121, 0.22), transparent 55%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .redesign-preview-root .ring {
          width: min(320px, 70%);
          aspect-ratio: 1;
          border-radius: 50%;
          box-shadow: 0 0 0 1px var(--line), 0 0 0 40px rgba(216, 183, 121, 0.03), 0 0 0 41px var(--line), 0 0 120px rgba(216, 183, 121, 0.2);
          display: grid;
          place-items: center;
        }

        .redesign-preview-root .player {
          display: flex;
          align-items: center;
          gap: 28px;
          padding: 22px 32px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.025);
          box-shadow: inset 0 0 0 1px var(--line);
        }
        .redesign-preview-root .play {
          width: 62px;
          height: 62px;
          border-radius: 50%;
          border: 0;
          background: linear-gradient(135deg, var(--gold2), var(--gold));
          color: #171007;
          font-size: 18px;
          cursor: pointer;
          flex: none;
          transition: 0.4s;
          display: grid;
          place-items: center;
        }
        .redesign-preview-root .play:hover {
          transform: scale(1.08);
        }
        .redesign-preview-root .bar {
          flex: 1;
          height: 2px;
          background: var(--line);
          position: relative;
        }
        .redesign-preview-root .bar i {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: var(--gold);
        }
        .redesign-preview-root .bar i::after {
          content: "";
          position: absolute;
          right: -5px;
          top: -4px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--gold2);
          box-shadow: 0 0 16px var(--gold);
        }

        .redesign-preview-root footer {
          padding: 140px 0 70px;
          text-align: center;
          color: var(--mute);
          font-size: 13px;
          letter-spacing: 0.08em;
        }
        .redesign-preview-root footer .serif {
          font-size: clamp(40px, 6vw, 88px);
          line-height: 1.05;
          color: var(--ink);
          margin: 24px 0 44px;
        }

        .redesign-preview-root .rv {
          opacity: 0;
          transform: translateY(40px);
          transition: 1.1s cubic-bezier(0.2, 0.7, 0.2, 1);
        }
        .redesign-preview-root .rv.in {
          opacity: 1;
          transform: none;
        }

        @media (max-width: 860px) {
          .redesign-preview-root .hero,
          .redesign-preview-root .poem {
            grid-template-columns: 1fr;
          }
          .redesign-preview-root .hero {
            gap: 60px;
            padding-top: 120px;
          }
          .redesign-preview-root .links {
            display: none;
          }
          .redesign-preview-root .poem > div {
            padding: 48px 30px;
          }
          .redesign-preview-root .bento {
            grid-template-columns: 1fr;
            grid-auto-rows: 240px;
          }
          .redesign-preview-root .card.a,
          .redesign-preview-root .card.b,
          .redesign-preview-root .card.c,
          .redesign-preview-root .card.d,
          .redesign-preview-root .card.e {
            grid-column: auto;
            grid-row: auto;
          }
          .redesign-preview-root .tag {
            right: 8px;
          }
          .redesign-preview-root .player {
            border-radius: 28px;
            flex-wrap: wrap;
          }
          .redesign-preview-root .stats {
            gap: 28px;
          }
        }
      `}</style>

      {/* 2. Interactive Cursor Glow */}
      <div id="redesign-glow" ref={glowRef} />

      {/* 3. Floating Pill Navigation */}
      <nav className="redesign-nav">
        <div className="logo serif">
          The Artisan’s <span className="gt">Quill</span>
        </div>
        <div className="links">
          <a
            onClick={() => {
              const el = document.getElementById('works');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Works
          </a>
          <a
            onClick={() => {
              const el = document.getElementById('poetry');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Poetry
          </a>
          <a
            onClick={() => {
              const el = document.getElementById('music');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Music
          </a>
          <a
            onClick={() => {
              if (onOpenAbout) onOpenAbout();
              else {
                const el = document.getElementById('about');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            About
          </a>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn gold" onClick={onOpenUpload}>
            Upload
          </button>
        </div>
      </nav>

      {/* 4. Hero Section */}
      <header className="wrap hero">
        <div className="rv in">
          <span className="mono">Digital Fine Art &amp; Poetry Gallery</span>
          <h1 className="serif">
            Where every work <em className="gt">breathes.</em>
          </h1>
          <p className="lead">
            A candle-lit sanctuary for paintings, poetry, motion and sound. Wander slowly, and keep what moves you.
          </p>
          <p className="gt serif" style={{ fontStyle: 'italic', fontSize: '34px', lineHeight: 1.3, margin: '12px 0 24px', filter: 'drop-shadow(0 2px 20px rgba(216, 183, 121, 0.4))' }}>
            Share your art , get connected
          </p>
          <div className="cta">
            <button
              className="btn gold"
              onClick={() => {
                const el = document.getElementById('works');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Enter the Gallery
            </button>
            <button
              className="btn"
              onClick={() => {
                if (spotlightArtwork) onSelectArtwork(spotlightArtwork);
              }}
            >
              Today’s Spotlight
            </button>
          </div>
          <div className="stats">
            <div>
              <b>{artworks.length || 16}</b>
              <span className="mono">Masterpieces</span>
            </div>
            <div>
              <b>6</b>
              <span className="mono">Mediums</span>
            </div>
            <div>
              <b>24h</b>
              <span className="mono">Fresh Curation</span>
            </div>
          </div>
        </div>

        {/* Arch Frame with Spotlight Artwork */}
        <div
          className="frame rv in"
          onClick={() => {
            if (spotlightArtwork) onSelectArtwork(spotlightArtwork);
          }}
          title={spotlightArtwork ? `View Spotlight: ${spotlightArtwork.title}` : 'Curatorial Spotlight'}
        >
          <div className="tag">
            <span className="mono">
              Vernissage · {spotlightIndex + 1 < 10 ? `0${spotlightIndex + 1}` : spotlightIndex + 1}/{artworks.length || 16}
            </span>
          </div>
          <div className="art">
            {spotlightArtwork?.mediaUrl && (
              <img
                src={spotlightArtwork.thumbnailUrl || spotlightArtwork.mediaUrl}
                alt={spotlightArtwork.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
            )}
            <div className="cap">
              <span className="mono">
                Spotlight · {spotlightArtwork ? getMediumLabel(spotlightArtwork.category) : 'Music'}
              </span>
              <h3 className="serif">
                {spotlightArtwork ? spotlightArtwork.title : 'Hum'}
              </h3>
            </div>
          </div>
        </div>
      </header>

      {/* 5. Infinite Marquee Ticker */}
      <div className="marq">
        <div className="serif">
          <span>Poetry Cards</span>
          <span>Motion Loops</span>
          <span>Digital Media</span>
          <span>Paintings</span>
          <span>Drawings &amp; Ink</span>
          <span>Original Music</span>
          <span>Poetry Cards</span>
          <span>Motion Loops</span>
          <span>Digital Media</span>
          <span>Paintings</span>
          <span>Drawings &amp; Ink</span>
          <span>Original Music</span>
        </div>
      </div>

      {/* 6. Curated Works Section (#works) */}
      <section className="wrap sect" id="works">
        <div className="head rv in">
          <div>
            <span className="mono">The Vault</span>
            <h2 className="serif">
              Curated <em className="gt">works</em>
            </h2>
          </div>
          <div className="chips">
            <button
              className={`chip ${selectedChip === 'all' ? 'on' : ''}`}
              onClick={() => setSelectedChip('all')}
            >
              All
            </button>
            <button
              className={`chip ${selectedChip === 'poetry' ? 'on' : ''}`}
              onClick={() => setSelectedChip('poetry')}
            >
              Poetry
            </button>
            <button
              className={`chip ${selectedChip === 'motion' ? 'on' : ''}`}
              onClick={() => setSelectedChip('motion')}
            >
              Motion
            </button>
            <button
              className={`chip ${selectedChip === 'paintings' ? 'on' : ''}`}
              onClick={() => setSelectedChip('paintings')}
            >
              Paintings
            </button>
            <button
              className={`chip ${selectedChip === 'ink' ? 'on' : ''}`}
              onClick={() => setSelectedChip('ink')}
            >
              Ink
            </button>
            <button
              className={`chip ${selectedChip === 'music' ? 'on' : ''}`}
              onClick={() => setSelectedChip('music')}
            >
              Music
            </button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="bento rv in">
          {/* Card A: Large Masterpiece (span 7 col, span 3 row) */}
          {(() => {
            const artA = filteredArtworks[0];
            return (
              <article
                className="card a"
                onClick={() => artA && onSelectArtwork(artA)}
                title={artA?.title || 'Amber Hour'}
              >
                <i
                  style={{
                    backgroundImage: artA?.mediaUrl ? `url(${artA.thumbnailUrl || artA.mediaUrl})` : undefined,
                    background: !artA?.mediaUrl ? getCardGradient(0) : undefined
                  }}
                />
                <div>
                  <span className="mono">{artA ? getMediumLabel(artA.category) : 'Painting'}</span>
                  <h4>{artA ? artA.title : 'Amber Hour'}</h4>
                </div>
              </article>
            );
          })()}

          {/* Card B: Motion Loop (span 5 col, span 2 row) */}
          {(() => {
            const artB = filteredArtworks[1];
            return (
              <article
                className="card b"
                onClick={() => artB && onSelectArtwork(artB)}
                title={artB?.title || 'Violet Drift'}
              >
                <i
                  style={{
                    backgroundImage: artB?.mediaUrl ? `url(${artB.thumbnailUrl || artB.mediaUrl})` : undefined,
                    background: !artB?.mediaUrl ? getCardGradient(1) : undefined
                  }}
                />
                <div>
                  <span className="mono">{artB ? getMediumLabel(artB.category) : 'Motion Loop'}</span>
                  <h4>{artB ? artB.title : 'Violet Drift'}</h4>
                </div>
              </article>
            );
          })()}

          {/* Card C: Ink / Drawing (span 5 col, span 1 row) */}
          {(() => {
            const artC = filteredArtworks[2];
            return (
              <article
                className="card c"
                onClick={() => artC && onSelectArtwork(artC)}
                title={artC?.title || 'Tidewater'}
              >
                <i
                  style={{
                    backgroundImage: artC?.mediaUrl ? `url(${artC.thumbnailUrl || artC.mediaUrl})` : undefined,
                    background: !artC?.mediaUrl ? getCardGradient(2) : undefined
                  }}
                />
                <div>
                  <span className="mono">{artC ? getMediumLabel(artC.category) : 'Ink'}</span>
                  <h4>{artC ? artC.title : 'Tidewater'}</h4>
                </div>
              </article>
            );
          })()}

          {/* Card D: Digital Media (span 4 col, span 2 row) */}
          {(() => {
            const artD = filteredArtworks[3];
            return (
              <article
                className="card d"
                onClick={() => artD && onSelectArtwork(artD)}
                title={artD?.title || 'Gilded Static'}
              >
                <i
                  style={{
                    backgroundImage: artD?.mediaUrl ? `url(${artD.thumbnailUrl || artD.mediaUrl})` : undefined,
                    background: !artD?.mediaUrl ? getCardGradient(3) : undefined
                  }}
                />
                <div>
                  <span className="mono">{artD ? getMediumLabel(artD.category) : 'Digital Media'}</span>
                  <h4>{artD ? artD.title : 'Gilded Static'}</h4>
                </div>
              </article>
            );
          })()}

          {/* Card E: Wide Painting (span 8 col, span 2 row) */}
          {(() => {
            const artE = filteredArtworks[4];
            return (
              <article
                className="card e"
                onClick={() => artE && onSelectArtwork(artE)}
                title={artE?.title || 'Ember Field'}
              >
                <i
                  style={{
                    backgroundImage: artE?.mediaUrl ? `url(${artE.thumbnailUrl || artE.mediaUrl})` : undefined,
                    background: !artE?.mediaUrl ? getCardGradient(4) : undefined
                  }}
                />
                <div>
                  <span className="mono">{artE ? getMediumLabel(artE.category) : 'Painting'}</span>
                  <h4>{artE ? artE.title : 'Ember Field'}</h4>
                </div>
              </article>
            );
          })()}
        </div>

        {/* View full indexed artworks atelier button */}
        {artworks.length > 5 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => {
                if (onExploreFullAtelier) onExploreFullAtelier();
              }}
              className="btn gold"
            >
              Explore All {artworks.length} Indexed Works in Living Stream →
            </button>
          </div>
        )}
      </section>

      {/* 7. Poetic Sanctuary Section (#poetry) */}
      <section className="wrap sect" id="poetry">
        <div className="poem rv in">
          <div>
            <span className="mono">Poetry Card · Lyrical Free Verse</span>
            <h2 className="serif">
              {featuredPoem?.title || 'Late Kettle'}
            </h2>
            <blockquote>
              {featuredPoem?.poetryContent?.stanzas?.[0] ? (
                <>
                  {featuredPoem.poetryContent.stanzas[0].split('\n').slice(0, 3).map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <>
                  The kettle boils for no one now,
                  <br />
                  a thin white column, patient, spent.
                </>
              )}
            </blockquote>
            <button
              className="btn"
              onClick={() => {
                if (featuredPoem) onSelectArtwork(featuredPoem);
                else if (onOpenPoetryStudio) onOpenPoetryStudio();
              }}
            >
              Read the full poem
            </button>
          </div>
          <div className="vis">
            <div className="ring">
              <span className="mono">{featuredPoem?.year || '2026'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Music Sanctuary Section (#music) */}
      <section className="wrap sect" id="music" style={{ paddingTop: '40px' }}>
        <div className="head rv in">
          <div>
            <span className="mono">Music Sanctuary</span>
            <h2 className="serif">
              Now <em className="gt">playing</em>
            </h2>
          </div>
          {onOpenMusicSanctuary && (
            <button
              className="btn"
              onClick={onOpenMusicSanctuary}
            >
              Open Studio Lounge +
            </button>
          )}
        </div>
        <div className="player rv in">
          <button
            className="play"
            id="pl"
            aria-label="Play"
            onClick={togglePlayAudio}
          >
            {isPlayingMusic ? '❚❚' : '▶'}
          </button>
          <div className="min-w-0">
            <div className="serif truncate" style={{ fontSize: '30px', lineHeight: 1.1 }}>
              {featuredMusic?.title || 'Hum'}
            </div>
            <div className="mono truncate" style={{ color: 'var(--mute)' }}>
              {featuredMusic?.musicData?.genre || 'Indie Soul · Acoustic'}
            </div>
          </div>
          <div className="bar">
            <i style={{ width: `${audioProgress}%` }} />
          </div>
          <span className="mono">1:24</span>
        </div>
      </section>

      {/* 9. Footer (#about) */}
      <footer className="wrap" id="sanctuary-footer">
        <span className="mono">The Artisan’s Quill</span>
        <div className="serif">
          Make something slowly.
          <br />
          <em className="gt">Share it beautifully.</em>
        </div>
        <button className="btn gold" onClick={onOpenUpload}>
          Begin Your Collection
        </button>
        <p style={{ marginTop: '80px' }}>
          Original works belong to their artists · © 2026
        </p>
      </footer>
    </div>
  );
};
