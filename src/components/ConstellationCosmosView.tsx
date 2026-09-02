import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  Volume2,
  VolumeX,
  RotateCcw,
  LayoutGrid,
  Heart,
  X,
  Feather,
  Palette,
  PenTool,
  ImageIcon,
  Film,
  Compass,
  Layers
} from 'lucide-react';
import { Artwork, ArtCategory } from '../types';

interface ConstellationCosmosViewProps {
  artworks: Artwork[];
  onSelectArtwork: (artwork: Artwork) => void;
  onOpenUpload: (category?: ArtCategory) => void;
  onSwitchToGallery: () => void;
}

interface StarNode3D {
  artwork: Artwork;
  // Current interpolated 3D coordinates
  x: number;
  y: number;
  z: number;
  // Target 3D coordinates for smooth transitions
  tx: number;
  ty: number;
  tz: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  hasRing: boolean;
  ringRadius: number;
  ringTilt: number;
  twinkleOffset: number;
  pulseSpeed: number;
}

type CosmosLayout = 'galaxy' | 'sphere' | 'clusters' | 'solar';

const MEDIUM_METRICS: Record<
  string,
  { label: string; color: string; glow: string; icon: React.ReactNode }
> = {
  all: {
    label: 'All Mediums',
    color: '#dfbd87',
    glow: 'rgba(223, 189, 135, 0.4)',
    icon: <Layers className="w-3 h-3" />
  },
  painting: {
    label: 'Painting',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.5)',
    icon: <Palette className="w-3 h-3" />
  },
  poetry: {
    label: 'Poetry',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.5)',
    icon: <Feather className="w-3 h-3" />
  },
  digital: {
    label: 'Digital',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.5)',
    icon: <ImageIcon className="w-3 h-3" />
  },
  drawing: {
    label: 'Drawing',
    color: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.5)',
    icon: <PenTool className="w-3 h-3" />
  },
  video: {
    label: 'Video',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.5)',
    icon: <Film className="w-3 h-3" />
  }
};

export const ConstellationCosmosView: React.FC<ConstellationCosmosViewProps> = ({
  artworks,
  onSelectArtwork,
  onOpenUpload,
  onSwitchToGallery
}) => {
  const [activeLayout, setActiveLayout] = useState<CosmosLayout>('galaxy');
  const [selectedMedium, setSelectedMedium] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOrbitActive, setIsOrbitActive] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [showHintBanner, setShowHintBanner] = useState(true);

  // Hovered Star & Screen Position for Tooltip
  const [hoveredNode, setHoveredNode] = useState<{
    artwork: Artwork;
    screenX: number;
    screenY: number;
    color: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const nodesRef = useRef<StarNode3D[]>([]);

  // Camera State
  const cameraRef = useRef({
    rotX: 0.25,
    rotY: 0.4,
    zoom: 1.0,
    panX: 0,
    panY: 0,
    targetZoom: 1.0
  });

  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  // Filter artworks by search query
  const filteredArtworks = useMemo(() => {
    if (!artworks) return [];
    if (!searchQuery.trim()) return artworks;
    const q = searchQuery.toLowerCase().trim();
    return artworks.filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        a.artist?.name?.toLowerCase().includes(q) ||
        a.artist?.handle?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q) ||
        a.medium?.toLowerCase().includes(q) ||
        (a.tags && a.tags.some((t) => t.toLowerCase().includes(q))) ||
        (a.poetryContent?.stanzas && a.poetryContent.stanzas.some((s) => s.toLowerCase().includes(q)))
    );
  }, [artworks, searchQuery]);

  // Medium Counts
  const mediumCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: artworks.length,
      painting: 0,
      poetry: 0,
      digital: 0,
      drawing: 0,
      video: 0
    };
    artworks.forEach((art) => {
      const cat = art.category || 'digital';
      if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts[cat] = 1;
      }
    });
    return counts;
  }, [artworks]);

  // Generate target coordinates for each layout preset
  const calculateLayoutCoordinates = useCallback(
    (index: number, total: number, artwork: Artwork, layout: CosmosLayout) => {
      switch (layout) {
        case 'galaxy': {
          // Logarithmic spiral with multiple arms
          const numArms = 3;
          const armIndex = index % numArms;
          const armOffset = (armIndex * (2 * Math.PI)) / numArms;
          const distanceFraction = (index + 1) / Math.max(1, total);
          const radius = 100 + distanceFraction * 360;
          const spiralAngle = armOffset + distanceFraction * Math.PI * 2.8;

          const x = Math.cos(spiralAngle) * radius + Math.sin(index * 3.7) * 28;
          const z = Math.sin(spiralAngle) * radius + Math.cos(index * 2.3) * 28;
          const y = Math.sin(index * 1.5 + distanceFraction * 4) * 45;
          return { x, y, z };
        }

        case 'sphere': {
          // Fibonacci 3D celestial sphere distribution
          const phi = Math.acos(-1 + (2 * index) / Math.max(1, total));
          const theta = Math.sqrt(total * Math.PI) * phi;
          const radius = 280 + (index % 4) * 35;

          const x = radius * Math.cos(theta) * Math.sin(phi);
          const y = radius * Math.sin(theta) * Math.sin(phi);
          const z = radius * Math.cos(phi);
          return { x, y, z };
        }

        case 'clusters': {
          // 5 Distinct spatial nebular clusters by medium
          const clusterCenters: Record<string, { x: number; y: number; z: number }> = {
            painting: { x: 200, y: 80, z: -80 },
            poetry: { x: -220, y: 100, z: 70 },
            digital: { x: 160, y: -130, z: 120 },
            drawing: { x: -180, y: -100, z: -90 },
            video: { x: 0, y: 190, z: 140 }
          };
          const center = clusterCenters[artwork.category] || { x: 0, y: 0, z: 0 };
          const clusterAngle = (index * 1.37) % (2 * Math.PI);
          const clusterDist = 30 + ((index * 31) % 110);
          const clusterElevation = (index * 17) % 80 - 40;

          const x = center.x + Math.cos(clusterAngle) * clusterDist;
          const y = center.y + clusterElevation;
          const z = center.z + Math.sin(clusterAngle) * clusterDist;
          return { x, y, z };
        }

        case 'solar': {
          // Highest liked artwork is the central Sun at (0, 0, 0)
          if (index === 0) {
            return { x: 0, y: 0, z: 0 };
          }
          // Other artworks orbit around on planetary orbital rings
          const orbitIndex = index;
          const orbitalRadius = 110 + orbitIndex * 34;
          const orbitAngle = (orbitIndex * 1.618) % (2 * Math.PI);
          const inclination = ((orbitIndex % 3) - 1) * 0.22;

          const x = Math.cos(orbitAngle) * orbitalRadius;
          const z = Math.sin(orbitAngle) * orbitalRadius;
          const y = Math.sin(orbitAngle) * orbitalRadius * inclination;
          return { x, y, z };
        }

        default:
          return { x: 0, y: 0, z: 0 };
      }
    },
    []
  );

  // Synchronize 3D Star Nodes when artworks or active layout changes
  useEffect(() => {
    if (!artworks || artworks.length === 0) {
      nodesRef.current = [];
      return;
    }

    // Sort by likes for solar layout priority
    const sortedArtworks = [...artworks].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));

    const existingMap = new Map<string, StarNode3D>();
    nodesRef.current.forEach((n) => existingMap.set(n.artwork.id, n));

    const updatedNodes: StarNode3D[] = sortedArtworks.map((art, idx) => {
      const { x: tx, y: ty, z: tz } = calculateLayoutCoordinates(
        idx,
        sortedArtworks.length,
        art,
        activeLayout
      );

      const metric = MEDIUM_METRICS[art.category] || MEDIUM_METRICS.digital;
      const existing = existingMap.get(art.id);

      // Standout artworks get glowing Saturn-like planetary rings
      const hasRing = art.featured || art.likesCount > 2 || idx % 3 === 0;
      const baseRadius = Math.max(5, Math.min(13, 5 + (art.likesCount || 0) * 0.9));

      return {
        artwork: art,
        // Start from existing coords if already in cosmos, else initial target
        x: existing ? existing.x : tx,
        y: existing ? existing.y : ty,
        z: existing ? existing.z : tz,
        tx,
        ty,
        tz,
        baseRadius,
        color: metric.color,
        glowColor: metric.glow,
        hasRing,
        ringRadius: baseRadius * 2.4,
        ringTilt: 0.35 + (idx % 3) * 0.15,
        twinkleOffset: (idx * 0.73) % (Math.PI * 2),
        pulseSpeed: 0.02 + (idx % 4) * 0.008
      };
    });

    nodesRef.current = updatedNodes;
  }, [artworks, activeLayout, calculateLayoutCoordinates]);

  // Web Audio Synthesizer for Ethereal Celestial Ambience
  const initWebAudio = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0.12, ctx.currentTime, 0.4);
        return;
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
      masterGain.gain.setTargetAtTime(0.12, ctx.currentTime, 1.2);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(480, ctx.currentTime);

      masterGain.connect(filter);
      filter.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Harmonic Celestial Drone (A2, E3, A3, C#4)
      const frequencies = [110, 164.81, 220, 277.18];
      oscillatorsRef.current = frequencies.map((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.25 / frequencies.length, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        return osc;
      });
    } catch (e) {
      console.warn('Web Audio note:', e);
    }
  }, []);

  const stopWebAudio = useCallback(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(0.0001, audioCtxRef.current.currentTime, 0.4);
    }
  }, []);

  // Play gentle starlight resonance tone on hover
  const playStarlightChime = useCallback((frequency: number) => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      noteGain.gain.setValueAtTime(0.06, ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

      osc.connect(noteGain);
      noteGain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // Ignored
    }
  }, []);

  const toggleSound = () => {
    if (!isSoundOn) {
      initWebAudio();
      setIsSoundOn(true);
    } else {
      stopWebAudio();
      setIsSoundOn(false);
    }
  };

  useEffect(() => {
    return () => {
      stopWebAudio();
      oscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          // Ignored
        }
      });
    };
  }, [stopWebAudio]);

  // Main 3D WebGL / Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    // Background Twinkling Dust Particles
    const dustStars: { x: number; y: number; size: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < 180; i++) {
      dustStars.push({
        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        size: Math.random() * 1.6 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.02 + 0.01
      });
    }

    const render = () => {
      animFrameIdRef.current = requestAnimationFrame(render);
      time += 0.016;

      const dpr = window.devicePixelRatio || 1;
      const width = (canvas.width = canvas.offsetWidth * dpr || 1200);
      const height = (canvas.height = canvas.offsetHeight * dpr || 800);

      ctx.clearRect(0, 0, width, height);

      // Deep Void Cosmic Nebula Background
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        50 * dpr,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      bgGrad.addColorStop(0, '#0a0d18');
      bgGrad.addColorStop(0.5, '#05060b');
      bgGrad.addColorStop(1, '#020306');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw cosmic background dust particles
      dustStars.forEach((star) => {
        const twinkle = Math.sin(time * star.speed * 25 + star.x) * 0.35 + 0.65;
        const px = width / 2 + star.x * dpr * 0.8;
        const py = height / 2 + star.y * dpr * 0.8;
        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.fillStyle = `rgba(223, 235, 255, ${star.alpha * twinkle * 0.7})`;
          ctx.beginPath();
          ctx.arc(px, py, star.size * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Camera auto-orbit rotation
      if (isOrbitActive && !isDraggingRef.current) {
        cameraRef.current.rotY += 0.0025;
      }

      // Smooth zoom dampening
      cameraRef.current.zoom +=
        (cameraRef.current.targetZoom - cameraRef.current.zoom) * 0.1;

      const rotX = cameraRef.current.rotX;
      const rotY = cameraRef.current.rotY;
      const zoom = cameraRef.current.zoom;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const cx = width / 2 + cameraRef.current.panX * dpr;
      const cy = height / 2 + cameraRef.current.panY * dpr;
      const fov = 520 * zoom;

      // Interpolate star nodes towards targets (tx, ty, tz)
      nodesRef.current.forEach((node) => {
        node.x += (node.tx - node.x) * 0.08;
        node.y += (node.ty - node.y) * 0.08;
        node.z += (node.tz - node.z) * 0.08;
      });

      interface ProjectedStar {
        node: StarNode3D;
        px: number;
        py: number;
        pz: number;
        scale: number;
        isMatch: boolean;
        isMediumSelected: boolean;
        isHovered: boolean;
      }

      const projectedStars: ProjectedStar[] = [];

      nodesRef.current.forEach((node) => {
        // 3D rotation matrix
        const x1 = node.x * cosY - node.z * sinY;
        const z1 = node.z * cosY + node.x * sinY;

        const y2 = node.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + node.y * sinX;

        const distance = fov + z2;
        if (distance <= 10) return;

        const scale = fov / distance;
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;

        const isMediumSelected =
          selectedMedium === 'all' || node.artwork.category === selectedMedium;

        // Search match condition
        const isMatch =
          !searchQuery.trim() ||
          node.artwork.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.artwork.artist?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.artwork.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (node.artwork.tags &&
            node.artwork.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

        const isHovered = hoveredNode?.artwork.id === node.artwork.id;

        projectedStars.push({
          node,
          px,
          py,
          pz: z2,
          scale,
          isMatch,
          isMediumSelected,
          isHovered
        });
      });

      // Depth sorting from far to near (Painter's Algorithm)
      projectedStars.sort((a, b) => a.pz - b.pz);

      // Draw Constellation Connective Laser Lines
      if (showLines && projectedStars.length > 1) {
        ctx.lineWidth = 1 * dpr;
        for (let i = 0; i < projectedStars.length; i++) {
          for (let j = i + 1; j < projectedStars.length; j++) {
            const a = projectedStars[i];
            const b = projectedStars[j];

            if (!a.isMediumSelected || !b.isMediumSelected) continue;

            // Connect stars sharing medium or author or nearby in space
            const isSameCategory = a.node.artwork.category === b.node.artwork.category;
            const isSameArtist = a.node.artwork.artist?.id === b.node.artwork.artist?.id;

            const dx = a.px - b.px;
            const dy = a.py - b.py;
            const dist2D = Math.sqrt(dx * dx + dy * dy);
            const maxLinkDist = (isSameCategory ? 260 : 160) * dpr * zoom;

            if (dist2D < maxLinkDist && (isSameCategory || isSameArtist || dist2D < 110 * dpr)) {
              const alphaRatio = Math.max(0, 1 - dist2D / maxLinkDist);
              const lineAlpha = (isSameCategory ? 0.38 : 0.16) * alphaRatio * (a.isMatch && b.isMatch ? 1 : 0.2);

              const strokeGrad = ctx.createLinearGradient(a.px, a.py, b.px, b.py);
              strokeGrad.addColorStop(0, a.node.color);
              strokeGrad.addColorStop(1, b.node.color);

              ctx.strokeStyle = strokeGrad;
              ctx.globalAlpha = lineAlpha;
              ctx.beginPath();
              ctx.moveTo(a.px, a.py);
              ctx.lineTo(b.px, b.py);
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }
        }
      }

      // Render 3D Celestial Stars & Planetary Rings
      projectedStars.forEach((star) => {
        const { node, px, py, scale, isMatch, isMediumSelected, isHovered } = star;

        // Visual dimming for filtered or non-matching stars
        let alpha = isMediumSelected ? (isMatch ? 1.0 : 0.22) : 0.12;
        if (isHovered) alpha = 1.0;

        ctx.globalAlpha = alpha;

        const pulse = Math.sin(time * 3 + node.twinkleOffset) * 0.18 + 0.92;
        const currentRadius =
          Math.max(
            3.5,
            node.baseRadius * scale * (isHovered ? 1.7 : isMatch && searchQuery ? 1.35 : 1.0) * dpr
          ) * pulse;

        // 1. Radiant Outer Coronal Glow
        const glowRadius = currentRadius * (isHovered ? 3.8 : 2.5);
        const glowGrad = ctx.createRadialGradient(px, py, currentRadius * 0.2, px, py, glowRadius);
        glowGrad.addColorStop(0, node.color);
        glowGrad.addColorStop(0.4, node.glowColor);
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Saturn-style Planetary Rings (Rendered tilted in 3D)
        if (node.hasRing) {
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(node.ringTilt + rotY * 0.3);

          const ringRx = currentRadius * 2.8;
          const ringRy = currentRadius * 0.85;

          // Back half of ring
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 1.5 * dpr;
          ctx.beginPath();
          ctx.ellipse(0, 0, ringRx, ringRy, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Outer faint planetary dust belt
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * alpha})`;
          ctx.lineWidth = 0.8 * dpr;
          ctx.beginPath();
          ctx.ellipse(0, 0, ringRx * 1.25, ringRy * 1.25, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();
        }

        // 3. Dense Spherical Star Core
        const coreGrad = ctx.createRadialGradient(
          px - currentRadius * 0.25,
          py - currentRadius * 0.25,
          currentRadius * 0.1,
          px,
          py,
          currentRadius
        );
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.35, node.color);
        coreGrad.addColorStop(1, '#05070e');

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(px, py, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // 4. Subtle Outer Star Rim
        ctx.strokeStyle = isHovered ? '#ffffff' : node.color;
        ctx.lineWidth = (isHovered ? 2.0 : 1.0) * dpr;
        ctx.beginPath();
        ctx.arc(px, py, currentRadius, 0, Math.PI * 2);
        ctx.stroke();

        // 5. Title Tag for standout stars, hovered star, or when searching
        if (isHovered || (isMatch && searchQuery.trim().length > 0) || scale > 1.4) {
          ctx.font = `600 ${Math.max(10, 11 * dpr)}px 'Cinzel', serif, sans-serif`;
          ctx.fillStyle = isHovered ? '#ffffff' : '#f3e5cb';
          ctx.textAlign = 'center';
          ctx.fillText(node.artwork.title, px, py + currentRadius + 14 * dpr);

          ctx.font = `400 ${Math.max(8, 9 * dpr)}px 'JetBrains Mono', monospace`;
          ctx.fillStyle = node.color;
          ctx.fillText(
            node.artwork.artist?.handle || node.artwork.artist?.name || 'Artist',
            px,
            py + currentRadius + 26 * dpr
          );
        }

        ctx.globalAlpha = 1;
      });
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [
    isOrbitActive,
    showLines,
    selectedMedium,
    searchQuery,
    hoveredNode
  ]);

  // Handle Mouse Hover to Detect Star Under Cursor
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDraggingRef.current) {
      const dx = mouseX - lastMousePosRef.current.x;
      const dy = mouseY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: mouseX, y: mouseY };

      cameraRef.current.rotY += dx * 0.007;
      cameraRef.current.rotX = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, cameraRef.current.rotX + dy * 0.007)
      );
      return;
    }

    // Hit Testing Star Nodes
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.offsetWidth * dpr;
    const height = canvas.offsetHeight * dpr;
    const cx = width / 2 + cameraRef.current.panX * dpr;
    const cy = height / 2 + cameraRef.current.panY * dpr;
    const fov = 520 * cameraRef.current.zoom;

    const rotX = cameraRef.current.rotX;
    const rotY = cameraRef.current.rotY;
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    let detected: StarNode3D | null = null;
    let detectedScreenX = 0;
    let detectedScreenY = 0;
    let minDistance = 24; // Hit radius tolerance in CSS px

    nodesRef.current.forEach((node) => {
      const x1 = node.x * cosY - node.z * sinY;
      const z1 = node.z * cosY + node.x * sinY;

      const y2 = node.y * cosX - z1 * sinX;
      const z2 = z1 * cosX + node.y * sinX;

      const distance = fov + z2;
      if (distance <= 10) return;

      const scale = fov / distance;
      const px = (cx + x1 * scale) / dpr;
      const py = (cy + y2 * scale) / dpr;

      const dist = Math.hypot(mouseX - px, mouseY - py);
      if (dist < minDistance) {
        minDistance = dist;
        detected = node;
        detectedScreenX = px;
        detectedScreenY = py;
      }
    });

    if (detected) {
      const star = detected as StarNode3D;
      if (hoveredNode?.artwork.id !== star.artwork.id) {
        setHoveredNode({
          artwork: star.artwork,
          screenX: detectedScreenX,
          screenY: detectedScreenY,
          color: star.color
        });
        if (isSoundOn) {
          playStarlightChime(320 + (star.artwork.likesCount || 0) * 45);
        }
      }
    } else {
      if (hoveredNode) {
        setHoveredNode(null);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    isDraggingRef.current = true;
    lastMousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Canvas Click to Inspect Artwork
  const handleCanvasClick = () => {
    if (hoveredNode) {
      onSelectArtwork(hoveredNode.artwork);
    }
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.0012;
    cameraRef.current.targetZoom = Math.max(
      0.55,
      Math.min(2.4, cameraRef.current.targetZoom + zoomDelta)
    );
  };

  // Touch Controls
  const touchStartRef = useRef<{ x: number; y: number; dist: number }>({ x: 0, y: 0, dist: 0 });

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        dist: 0
      };
    } else if (e.touches.length === 2) {
      isDraggingRef.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current.dist = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDraggingRef.current) {
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      touchStartRef.current.x = e.touches[0].clientX;
      touchStartRef.current.y = e.touches[0].clientY;

      cameraRef.current.rotY += dx * 0.008;
      cameraRef.current.rotX = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, cameraRef.current.rotX + dy * 0.008)
      );
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (touchStartRef.current.dist > 0) {
        const pinchDelta = (dist - touchStartRef.current.dist) * 0.005;
        cameraRef.current.targetZoom = Math.max(
          0.55,
          Math.min(2.4, cameraRef.current.targetZoom + pinchDelta)
        );
      }
      touchStartRef.current.dist = dist;
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    touchStartRef.current.dist = 0;
  };

  // Reset Camera View
  const handleResetCamera = () => {
    cameraRef.current = {
      rotX: 0.25,
      rotY: 0.4,
      zoom: 1.0,
      panX: 0,
      panY: 0,
      targetZoom: 1.0
    };
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      {/* ─────────────────────────────────────────────────────────────
          Top Section Title & Grid Toggle (Matches User Screenshot)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-display font-medium tracking-[0.06em] text-white flex items-center gap-3">
            <span className="text-[#c9a875]">✨</span>
            <span>3D Constellation Cosmos &amp; Interactive Starmap</span>
          </h1>
          <p className="text-xs text-neutral-400 font-mono-code mt-1.5 flex items-center gap-2 flex-wrap">
            <span>every artwork in the atelier shines as a celestial star linked by auteurism</span>
            <span className="text-[#c9a875]">•</span>
            <span className="text-amber-300/90">3D WebGL Realtime Engine</span>
          </p>
        </div>

        {/* Switch to Gallery Grid Button */}
        <button
          id="cosmos-switch-grid-btn"
          onClick={onSwitchToGallery}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-white/15 hover:border-[#c9a875]/50 transition-all duration-200 shadow-lg cursor-pointer shrink-0"
          title="Return to Standard Gallery Grid"
        >
          <LayoutGrid className="w-4 h-4 text-[#c9a875]" />
          <span>Switch to Gallery Grid</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          Main Cosmos Viewport Canvas Card
         ───────────────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative w-full h-[620px] sm:h-[720px] lg:h-[780px] rounded-2xl overflow-hidden bg-[#05060b] border border-[#c9a875]/30 shadow-[0_0_50px_rgba(0,0,0,0.85)] select-none"
      >
        {/* ── TOP OVERLAY BAR ── */}
        <div className="absolute top-0 inset-x-0 z-20 p-3 sm:p-4 bg-gradient-to-b from-[#06080e]/95 via-[#06080e]/75 to-transparent flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          
          {/* Left: Star Nodes Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/80 border border-white/10 backdrop-blur-md">
            <span className="text-[#c9a875] text-xs">✦</span>
            <span className="text-xs font-mono-code tracking-wider text-white uppercase font-bold">
              3D Constellation Cosmos
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-xs font-mono-code text-[#c9a875] font-semibold">
              {filteredArtworks.length} Star Nodes
            </span>
          </div>

          {/* Center: Search Starmap Input */}
          <div className="relative flex-1 max-w-sm sm:max-w-md mx-auto hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              id="cosmos-search-input"
              type="text"
              placeholder="Search star, artist, poem, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-neutral-950/85 border border-white/15 focus:border-[#c9a875] focus:outline-none text-xs text-white placeholder-neutral-500 font-sans shadow-inner backdrop-blur-md transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Right Action Suite: Add Star & Sound Toggle */}
          <div className="flex items-center gap-2">
            <button
              id="cosmos-add-star-btn"
              onClick={() => onOpenUpload()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono-code uppercase tracking-wider bg-gradient-to-r from-[#c9a875] to-[#e4ca9c] hover:from-[#dfbd87] hover:to-[#f3e3cb] text-black shadow-[0_0_16px_rgba(201,168,117,0.4)] transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Add a New Artwork Star into the 3D Cosmos"
            >
              <Plus className="w-3.5 h-3.5 text-black stroke-[3]" />
              <span>Add Star to Cosmos</span>
            </button>

            <button
              id="cosmos-sound-btn"
              onClick={toggleSound}
              className={`p-2 rounded-lg border transition-all cursor-pointer backdrop-blur-md ${
                isSoundOn
                  ? 'bg-[#c9a875]/20 border-[#c9a875] text-[#c9a875] shadow-[0_0_12px_rgba(201,168,117,0.3)]'
                  : 'bg-neutral-900/80 border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
              }`}
              title={isSoundOn ? 'Mute Cosmic Ambience' : 'Play Celestial Ambience Drone'}
            >
              {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dismissible Interaction Hint Sub-bar */}
        {showHintBanner && (
          <div className="absolute top-16 inset-x-0 z-20 flex justify-center px-4 pointer-events-auto">
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-neutral-950/80 border border-white/10 backdrop-blur-md text-[11px] font-mono-code text-neutral-300 shadow-xl">
              <span className="text-[#c9a875]">✦</span>
              <span>Drag to rotate 3D cosmos • Scroll to zoom • Click star to inspect</span>
              <button
                onClick={() => setShowHintBanner(false)}
                className="text-neutral-500 hover:text-white p-0.5 ml-1"
                title="Dismiss hint"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* ── FLOATING LEFT PANEL: MEDIUM FILTER ── */}
        <div className="absolute top-24 sm:top-28 left-4 z-20 w-44 sm:w-48 p-3 rounded-xl bg-[#090b12]/90 border border-white/10 backdrop-blur-xl shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/10 text-[10px] font-mono-code uppercase tracking-wider text-neutral-400 font-bold">
            <Compass className="w-3 h-3 text-[#c9a875]" />
            <span>Medium Filter</span>
          </div>

          <div className="space-y-1">
            {Object.entries(MEDIUM_METRICS).map(([catKey, metric]) => {
              const count = mediumCounts[catKey] || 0;
              const isSelected = selectedMedium === catKey;

              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedMedium(catKey)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono-code transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 text-white font-bold shadow-inner border border-white/15'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: metric.color,
                        boxShadow: isSelected ? `0 0 8px ${metric.color}` : 'none'
                      }}
                    />
                    <span className="capitalize">{metric.label}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3D CANVAS VIEWPORT ── */}
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full h-full cursor-grab active:cursor-grabbing block"
        />

        {/* ── HOVERED STAR HUD INSPECTOR TOOLTIP CARD ── */}
        {hoveredNode && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-[120%] transition-all duration-150"
            style={{
              left: `${hoveredNode.screenX}px`,
              top: `${hoveredNode.screenY}px`
            }}
          >
            <div className="w-64 p-3 rounded-xl bg-[#090b14]/95 border border-[#c9a875]/50 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.85)] flex gap-3 items-center">
              {/* Thumbnail Image */}
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-neutral-900 border border-white/15 relative">
                <img
                  src={hoveredNode.artwork.thumbnailUrl || hoveredNode.artwork.mediaUrl}
                  alt={hoveredNode.artwork.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Star Information */}
              <div className="flex-1 min-w-0">
                <span
                  className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono-code uppercase font-bold tracking-wider mb-1"
                  style={{
                    backgroundColor: `${hoveredNode.color}22`,
                    color: hoveredNode.color,
                    border: `1px solid ${hoveredNode.color}55`
                  }}
                >
                  {hoveredNode.artwork.category}
                </span>

                <h4 className="text-xs font-serif-display font-medium text-white truncate">
                  {hoveredNode.artwork.title}
                </h4>

                <p className="text-[10px] font-mono-code text-neutral-400 truncate">
                  {hoveredNode.artwork.artist?.handle || hoveredNode.artwork.artist?.name}
                </p>

                <div className="flex items-center justify-between mt-1 text-[10px] font-mono-code text-neutral-400">
                  <span className="flex items-center gap-1 text-rose-400">
                    <Heart className="w-2.5 h-2.5 fill-rose-400" />
                    <span>{hoveredNode.artwork.likesCount || 0}</span>
                  </span>
                  <span className="text-[#dfbd87] text-[9px]">Click to inspect →</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BOTTOM CONTROLS BAR (Matches User Screenshot) ── */}
        <div className="absolute bottom-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          
          {/* Left: Layout Presets Strip */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090b14]/90 border border-white/10 backdrop-blur-xl shadow-xl overflow-x-auto no-scrollbar">
            <button
              id="layout-galaxy-btn"
              onClick={() => setActiveLayout('galaxy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-code tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                activeLayout === 'galaxy'
                  ? 'bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-bold shadow-[0_0_12px_rgba(201,168,117,0.4)]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Galaxy Spiral
            </button>

            <button
              id="layout-sphere-btn"
              onClick={() => setActiveLayout('sphere')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-code tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                activeLayout === 'sphere'
                  ? 'bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-bold shadow-[0_0_12px_rgba(201,168,117,0.4)]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Celestial Sphere
            </button>

            <button
              id="layout-clusters-btn"
              onClick={() => setActiveLayout('clusters')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-code tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                activeLayout === 'clusters'
                  ? 'bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-bold shadow-[0_0_12px_rgba(201,168,117,0.4)]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Medium Clusters
            </button>

            <button
              id="layout-solar-btn"
              onClick={() => setActiveLayout('solar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-code tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                activeLayout === 'solar'
                  ? 'bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-bold shadow-[0_0_12px_rgba(201,168,117,0.4)]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Solar Masterpiece
            </button>
          </div>

          {/* Right: Orbit, Lines & Reset Toggles */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090b14]/90 border border-white/10 backdrop-blur-xl shadow-xl">
            <button
              id="cosmos-orbit-toggle-btn"
              onClick={() => setIsOrbitActive(!isOrbitActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-code transition-all cursor-pointer ${
                isOrbitActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              title="Toggle Slow Orbit Rotation"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOrbitActive ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'
                }`}
              />
              <span>{isOrbitActive ? 'Orbit Active' : 'Orbit Paused'}</span>
            </button>

            <button
              id="cosmos-lines-toggle-btn"
              onClick={() => setShowLines(!showLines)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-code transition-all cursor-pointer ${
                showLines
                  ? 'bg-[#c9a875]/20 text-[#c9a875] border border-[#c9a875]/40'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              title="Toggle Constellation Laser Lines"
            >
              <span>{showLines ? 'Lines On' : 'Lines Off'}</span>
            </button>

            <button
              id="cosmos-reset-camera-btn"
              onClick={handleResetCamera}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Reset 3D Camera"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
