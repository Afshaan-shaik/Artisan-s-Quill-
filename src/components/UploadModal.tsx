import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ArtCategory, Artwork, AspectRatioType, PoetryTheme, PoetryFont } from '../types';
import { GalleryService } from '../services/api';
import { uploadArtworkMediaToStorage } from '../services/supabaseClient';
import { registerCommunityTrack } from '../services/musicEngine';

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newArtwork: Artwork) => void;
  initialCategory?: ArtCategory;
  initialFormat?: string;
}

const TYPES: [string, string][] = [
  ['🎵', 'Original song'],
  ['🪶', 'Poetry card'],
  ['🖼️', 'Digital art'],
  ['✴️', 'Integer art'],
  ['🎞️', 'Motion loop']
];

const STYLES = ['Poetry Cards', 'Painting', 'Drawing', 'Digital', 'Video'] as const;

const RATIOS = ['Square (1:1)', 'Tall (3:4)', 'Wide (4:3)', 'Cinematic (16:9)', 'Story (9:16)'];
const AR = ['1/1', '3/4', '4/3', '16/9', '9/16'];
const TAGS = ['Nocturne', 'Texture', 'Portrait', 'Abstract', 'Gold', 'Ink'];
const POETRY_TAGS = ['Free Verse', 'Ghazal', 'Solitude', 'Nocturne', 'Melancholy', 'Epiphany', 'Atelier'];
const IDEAS = ['I made this because…', 'I created it using…', 'I hope you feel…'];
const POETRY_IDEAS = [
  'Written at dusk as the shadows lengthened…',
  'A study in longing and solitary reflection…',
  'Inspired by the sound of rain upon the glass…',
  'In memory of a moment kept exactly as it was…',
  'Dedicated to the moon and sleepless wanderers…',
  'Written in one quiet, unbroken breath…'
];

interface PoetryThemeOption {
  id: PoetryTheme;
  label: string;
  desc: string;
  bg: string;
  ink: string;
  acc: string;
  sub: string;
  border: string;
  medium: string;
  palette: string[];
}

const POETRY_THEMES: PoetryThemeOption[] = [
  {
    id: 'obsidian',
    label: 'Obsidian Night',
    desc: 'Deep velvet charcoal & golden starlight',
    bg: '#12141d',
    ink: '#f3ead3',
    acc: '#e3c27a',
    sub: '#a29e94',
    border: 'rgba(227, 194, 122, 0.35)',
    medium: 'Golden Ink on Obsidian Vellum',
    palette: ['#12141d', '#e3c27a', '#342918', '#f3ead3', '#08090d']
  },
  {
    id: 'vellum',
    label: 'Antique Vellum',
    desc: 'Aged parchment with warm amber deckle',
    bg: '#221c15',
    ink: '#f5ebd7',
    acc: '#d4af37',
    sub: '#b4a693',
    border: 'rgba(212, 175, 55, 0.35)',
    medium: 'Iron Gall Ink on Antique Vellum',
    palette: ['#221c15', '#d4af37', '#6e5124', '#f5ebd7', '#120e0a']
  },
  {
    id: 'midnight',
    label: 'Midnight Celestial',
    desc: 'Indigo night sky with ice-blue typography',
    bg: '#0e1628',
    ink: '#dbe7f5',
    acc: '#89b4e8',
    sub: '#899fb8',
    border: 'rgba(137, 180, 232, 0.35)',
    medium: 'Celestial Typography on Starlit Linen',
    palette: ['#0e1628', '#89b4e8', '#2a4269', '#dbe7f5', '#060a14']
  },
  {
    id: 'emerald',
    label: 'Emerald Silk',
    desc: 'Deep botanical forest jade & sage gold',
    bg: '#0b1c14',
    ink: '#d4f5e3',
    acc: '#52b788',
    sub: '#7ba892',
    border: 'rgba(82, 183, 136, 0.35)',
    medium: 'Herbal Ink on Emerald Botanical Silk',
    palette: ['#0b1c14', '#52b788', '#1a4731', '#d4f5e3', '#050f0a']
  },
  {
    id: 'crimson',
    label: 'Crimson Velvet',
    desc: 'Passionate burgundy wine & crushed rose',
    bg: '#240f15',
    ink: '#fce7f3',
    acc: '#e0536c',
    sub: '#b87c88',
    border: 'rgba(224, 83, 108, 0.35)',
    medium: 'Madder Lake Pigment on Crimson Velvet Paper',
    palette: ['#240f15', '#e0536c', '#5e1e2d', '#fce7f3', '#14060b']
  },
  {
    id: 'parchment',
    label: 'Handmade Cotton Rag',
    desc: 'Archival warm ivory deckle paper',
    bg: '#f7f2e7',
    ink: '#1e1913',
    acc: '#8c6721',
    sub: '#5c5245',
    border: 'rgba(140, 103, 33, 0.4)',
    medium: 'Fountain Pen Ink on Handmade Cotton Rag',
    palette: ['#f7f2e7', '#8c6721', '#c7bca7', '#1e1913', '#ded6c1']
  }
];

interface PoetryFontOption {
  id: PoetryFont;
  label: string;
  fontFamily: string;
  category: string;
}

const POETRY_FONTS: PoetryFontOption[] = [
  {
    id: 'cormorant',
    label: 'Cormorant Garamond',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    category: 'Classic Atelier Serif'
  },
  {
    id: 'playfair',
    label: 'Playfair Display',
    fontFamily: "'Playfair Display', Georgia, serif",
    category: 'Dramatic & Lyrical'
  },
  {
    id: 'newsreader',
    label: 'Newsreader',
    fontFamily: "'Newsreader', 'EB Garamond', Georgia, serif",
    category: 'Refined Literary'
  },
  {
    id: 'handcrafted',
    label: 'Caveat Script',
    fontFamily: "'Caveat', cursive, sans-serif",
    category: 'Organic Handwriting'
  },
  {
    id: 'cinzel',
    label: 'Cinzel Classical',
    fontFamily: "'Cinzel', serif",
    category: 'Archaic Royal'
  },
  {
    id: 'nastaliq',
    label: 'Noto Nastaliq (Ghazal)',
    fontFamily: "'Noto Nastaliq Urdu', 'Amiri', serif, system-ui",
    category: 'Urdu & Calligraphy'
  }
];

const PRESET_POETRY_SAMPLES = [
  {
    title: 'Marginalia',
    subtitle: 'From "Nocturne Fragments"',
    author: 'Afshaan Shaikh',
    theme: 'obsidian' as PoetryTheme,
    font: 'cormorant' as PoetryFont,
    alignment: 'center' as const,
    stanzas: [
      'I have always written in the margins,\nthat narrow corridor between the printed thought\nand the silence of the page.',
      'Here the ink dries slower;\nhere the night is kept exactly as it fell,\nneither remembered nor forgotten.',
      'We build with love for all the creative souls;\nlet every whisper find its sanctuary.'
    ],
    medium: 'Golden Ink on Obsidian Vellum',
    palette: ['#12141d', '#e3c27a', '#342918', '#f3ead3', '#08090d']
  },
  {
    title: 'Dard Aur Khamoshi (درد اور خاموشی)',
    subtitle: 'Ghazal Collection · دفترِ غزل',
    author: 'Afshaan Shaikh',
    theme: 'vellum' as PoetryTheme,
    font: 'nastaliq' as PoetryFont,
    alignment: 'right' as const,
    stanzas: [
      'ہر ایک بات پہ کہتے ہو تم کہ تو کیا ہے\nتمہیں کہو کہ یہ اندازِ گفتگو کیا ہے',
      'چپکے چپکے رات دن آنسو بہانا یاد ہے\nہم کو اب تک عاشقی کا وہ زمانہ یاد ہے',
      'بنا کر فقیروں کا ہم بھیس غالبؔ\nتماشائے اہلِ کرم دیکھتے ہیں'
    ],
    medium: 'Calligraphic Nastaliq on Antique Parchment',
    palette: ['#241e17', '#e3c27a', '#785628', '#f5ebd7', '#120e0a']
  },
  {
    title: 'Anatomy of the Night Wind',
    subtitle: 'From "Monasteries of the Rain"',
    author: 'Elena Vance',
    theme: 'midnight' as PoetryTheme,
    font: 'playfair' as PoetryFont,
    alignment: 'center' as const,
    stanzas: [
      'The wind carries no message other than its own cold velocity,\nparting the pine needles like rosary beads in an old cathedral.',
      'To write at midnight is to believe that someone, somewhere,\nis awake and listening to the breathing of the dark.'
    ],
    medium: 'Letterpress Typography on Midnight Silk Paper',
    palette: ['#0e1628', '#89b4e8', '#2a4269', '#dbe7f5', '#060a14']
  }
];

const PRESET_HANDWRITTEN_SAMPLES = [
  {
    title: 'Autumn Journal Fragment',
    src: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    medium: 'Vintage Fountain Pen & Ink on Moleskine Journal',
    palette: ['#26231e', '#e3c27a', '#94836f', '#f4ecd8', '#14120f']
  },
  {
    title: 'Calligraphic Stanza in Urfa Ink',
    src: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1200&q=80',
    medium: 'Dip Pen & Sepia Pigment on Handmade Deckle Paper',
    palette: ['#1c1a17', '#d9b878', '#6b5842', '#ebe1cd', '#100e0c']
  },
  {
    title: 'Midnight Poetry Draft',
    src: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=1200&q=80',
    medium: 'Graphite & Walnut Ink on Heavy Cotton Rag',
    palette: ['#181a1d', '#c9a875', '#4a4d52', '#d5d7db', '#0f1012']
  }
];

// Curated Masterpiece Demo Assets for Visual Arts
const PRESET_ART_IMAGES = [
  {
    name: 'Nocturnal Metamorphosis',
    src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    category: 'painting' as const,
    medium: 'Oil on Belgian Linen',
    palette: ['#161214', '#e2c277', '#875d31', '#f0e6d2', '#2f241a']
  },
  {
    name: 'Anatomy of Solitude',
    src: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1200&q=80',
    category: 'drawing' as const,
    medium: 'Compressed Charcoal & Graphite',
    palette: ['#121317', '#8b8e99', '#3b3d45', '#d4d6dc', '#222329']
  },
  {
    name: 'Cybernetic Monolith',
    src: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
    category: 'digital' as const,
    medium: 'Generative Neural Shader',
    palette: ['#0c0d1c', '#a855f7', '#ec4899', '#312e81', '#fbcfe8']
  },
  {
    name: 'Fluid Obsidian',
    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    category: 'video' as const,
    medium: '4K Volumetric Fluid Simulation',
    palette: ['#090a0f', '#eab308', '#262626', '#ca8a04', '#fafafa']
  }
];

const PRESET_MUSIC_TRACKS = [
  {
    title: 'Nocturne in C-sharp Minor',
    artist: 'Afshaan Shaikh',
    audioUrl: '/audio/wsKhe5rTKw8.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    album: 'Sanctuary Nocturnes Vol. I',
    genre: 'Neo-Classical / Ambient Piano',
    durationSeconds: 215,
    key: 'C# Minor',
    bpm: '72 BPM',
    lyrics: 'Soft falls the lantern glow upon the keys,\nA wandering cadence adrift upon the breeze.'
  },
  {
    title: 'Starboy Midnight Reverie',
    artist: 'The Weeknd & Daft Punk',
    audioUrl: '/audio/Rif-RTvmmss.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    album: 'Starboy Studio Masters',
    genre: 'Electropop / Midnight R&B',
    durationSeconds: 231,
    key: 'G Minor',
    bpm: '186 BPM',
    lyrics: ''
  }
];

function escapeXml(unsafe: string) {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function generatePoemCardDataUrl(
  title: string,
  subtitle: string,
  stanzas: string[],
  signature: string,
  theme: PoetryTheme,
  font: PoetryFont,
  alignment: 'left' | 'center' | 'right'
): string {
  const currentTheme = POETRY_THEMES.find((t) => t.id === theme) || POETRY_THEMES[0];
  const currentFont = POETRY_FONTS.find((f) => f.id === font) || POETRY_FONTS[0];

  const textAnchor = alignment === 'center' ? 'middle' : alignment === 'right' ? 'end' : 'start';
  const textX = alignment === 'center' ? 400 : alignment === 'right' ? 720 : 80;

  const stanzaSvg = (stanzas.length > 0 ? stanzas : ['Silence speaks in verse.'])
    .slice(0, 4)
    .map((st, sIdx) => {
      const lines = st.split('\n');
      return lines
        .map(
          (l, lIdx) =>
            `<tspan x="${textX}" dy="${lIdx === 0 && sIdx > 0 ? '36' : '26'}">${escapeXml(l)}</tspan>`
        )
        .join('');
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
    <rect width="800" height="1000" fill="${currentTheme.bg}"/>
    <rect x="24" y="24" width="752" height="952" fill="none" stroke="${currentTheme.border}" stroke-width="1.5" rx="10"/>
    <rect x="32" y="32" width="736" height="936" fill="none" stroke="${currentTheme.border}" stroke-width="0.75" stroke-dasharray="4 4" rx="6"/>
    <text x="400" y="85" text-anchor="middle" fill="${currentTheme.acc}" font-family="'Space Mono', monospace" font-size="11" letter-spacing="4">✦ ATELIER POETIC ARCHIVE ✦</text>
    ${subtitle ? `<text x="400" y="130" text-anchor="middle" fill="${currentTheme.sub}" font-family="${currentFont.fontFamily}" font-size="16" font-style="italic">${escapeXml(subtitle)}</text>` : ''}
    <text x="400" y="195" text-anchor="middle" fill="${currentTheme.ink}" font-family="${currentFont.fontFamily}" font-size="34" font-weight="600">${escapeXml(title || 'Untitled Verse')}</text>
    <line x1="300" y1="225" x2="500" y2="225" stroke="${currentTheme.acc}" stroke-width="1" opacity="0.6"/>
    <text y="280" fill="${currentTheme.ink}" font-family="${currentFont.fontFamily}" font-size="20" text-anchor="${textAnchor}">
      ${stanzaSvg}
    </text>
    <text x="400" y="915" text-anchor="middle" fill="${currentTheme.sub}" font-family="${currentFont.fontFamily}" font-size="15" font-style="italic">${escapeXml(signature || '— Atelier Poet, 2026')}</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Color utilities
function hex(c: string): string {
  const x = document.createElement('canvas').getContext('2d');
  if (!x) return '#c9a875';
  x.fillStyle = c;
  return x.fillStyle;
}

function randPalette(): string[] {
  const h = Math.random() * 360;
  return [0, 1, 2, 3, 4].map((i) =>
    hex(`hsl(${(h + i * 28) % 360} ${30 + Math.random() * 30}% ${14 + i * 17}%)`)
  );
}

function extractColors(src: string, jit = false): Promise<string[]> {
  return new Promise((res) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onerror = () => res(randPalette());
    im.onload = () => {
      try {
        const k = document.createElement('canvas');
        k.width = k.height = 48;
        const x = k.getContext('2d');
        if (!x) return res(randPalette());
        x.drawImage(im, 0, 0, 48, 48);
        const d = x.getImageData(0, 0, 48, 48).data;
        const m: Record<string, number[]> = {};
        for (let i = 0; i < d.length; i += 4) {
          const key = (d[i] >> 5) + ',' + (d[i + 1] >> 5) + ',' + (d[i + 2] >> 5);
          const e = (m[key] = m[key] || [0, 0, 0, 0]);
          e[0]++;
          e[1] += d[i];
          e[2] += d[i + 1];
          e[3] += d[i + 2];
        }
        let arr = Object.values(m)
          .sort((a, b) => b[0] - a[0])
          .map((e) => [e[1] / e[0], e[2] / e[0], e[3] / e[0]]);
        if (jit) arr = arr.slice(0, 16).sort(() => Math.random() - 0.5);
        const out: number[][] = [];
        for (const c of arr) {
          if (out.every((o) => Math.hypot(o[0] - c[0], o[1] - c[1], o[2] - c[2]) > 55)) {
            out.push(c);
          }
          if (out.length === 5) break;
        }
        res(out.map((c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')));
      } catch (e) {
        res(randPalette());
      }
    };
    im.src = src;
  });
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialCategory,
  initialFormat
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const musicAudioInputRef = useRef<HTMLInputElement>(null);
  const musicCoverInputRef = useRef<HTMLInputElement>(null);
  const musicAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const handwrittenInputRef = useRef<HTMLInputElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const createdObjectUrlsRef = useRef<string[]>([]);

  // Toast management
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isToastActive, setIsToastActive] = useState<boolean>(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setIsToastActive(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setIsToastActive(false);
    }, 2800);
  }, []);

  // Form State
  const [step, setStep] = useState<number>(0);
  const [typeIndex, setTypeIndex] = useState<number>(2); // 0: Song, 1: Poetry, 2: Digital, 3: Integer, 4: Motion Loop
  const [styleIndex, setStyleIndex] = useState<number>(3); // 0: Poetry Cards, 1: Painting, 2: Drawing, 3: Digital, 4: Video
  const [mediaSrc, setMediaSrc] = useState<string>('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [medium, setMedium] = useState<string>('Generative Shader & 3D Render');
  const [dims, setDims] = useState<string>('120 × 160 cm');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [ratioIndex, setRatioIndex] = useState<number>(1); // Default: Tall (3:4)
  const [story, setStory] = useState<string>('');
  const [palette, setPalette] = useState<string[]>(['#111218', '#c9a875', '#4b3c2d', '#ded7ca', '#705f4c']);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [hasTitleError, setHasTitleError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Guest Attribution Fields
  const currentUser = useMemo(() => GalleryService.getCurrentUser(), []);
  const isGuest = currentUser.id === 'guest';
  const [guestName, setGuestName] = useState<string>('Guest Artist');
  const [guestHandle, setGuestHandle] = useState<string>('@guest_artist');

  // Music Studio Fields
  const [musicAudioSrc, setMusicAudioSrc] = useState<string>('/audio/wsKhe5rTKw8.mp4');
  const [musicCoverSrc, setMusicCoverSrc] = useState<string>(
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80'
  );
  const [musicAlbum, setMusicAlbum] = useState<string>('Sanctuary Nocturnes Vol. I');
  const [musicGenre, setMusicGenre] = useState<string>('Neo-Classical / Ambient Piano');
  const [musicDurationSeconds, setMusicDurationSeconds] = useState<number>(215);
  const [musicBpm, setMusicBpm] = useState<string>('72 BPM');
  const [musicKey, setMusicKey] = useState<string>('C# Minor');
  const [musicLyrics, setMusicLyrics] = useState<string>('');
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Dedicated Poetry Studio Fields
  const [poetryMode, setPoetryMode] = useState<'compose' | 'upload'>('compose');
  const [poetryRawText, setPoetryRawText] = useState<string>(
    'I have always written in the margins,\nthat narrow corridor between the printed thought\nand the silence of the page.\n\nHere the ink dries slower;\nhere the night is kept exactly as it fell,\nneither remembered nor forgotten.\n\nWe build with love for all the creative souls;\nlet every whisper find its sanctuary.'
  );
  const [poetrySubtitle, setPoetrySubtitle] = useState<string>('From the Nocturne Fragments');
  const [authorSignature, setAuthorSignature] = useState<string>('— Afshaan Shaikh, 2026');
  const [poetryTheme, setPoetryTheme] = useState<PoetryTheme>('obsidian');
  const [poetryFont, setPoetryFont] = useState<PoetryFont>('cormorant');
  const [poetryAlignment, setPoetryAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [handwrittenSrc, setHandwrittenSrc] = useState<string>('');
  const [handwrittenFile, setHandwrittenFile] = useState<File | null>(null);

  // Active theme and font objects
  const currentTheme = useMemo(
    () => POETRY_THEMES.find((t) => t.id === poetryTheme) || POETRY_THEMES[0],
    [poetryTheme]
  );
  const currentFont = useMemo(
    () => POETRY_FONTS.find((f) => f.id === poetryFont) || POETRY_FONTS[0],
    [poetryFont]
  );

  // Parsed stanzas
  const parsedStanzas = useMemo(() => {
    return poetryRawText
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [poetryRawText]);

  // Initialize from props when opened
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';

      if (initialCategory === 'music' || initialFormat?.includes('music') || initialFormat?.includes('song')) {
        setTypeIndex(0);
        setStyleIndex(3); // Digital / audio
        setRatioIndex(0); // Square 1:1
      } else if (initialCategory === 'poetry' || initialFormat?.includes('poetry')) {
        setTypeIndex(1);
        setStyleIndex(0); // Poetry Cards
        setRatioIndex(1); // Tall 3:4
        setTitle('Marginalia');
        setMedium('Golden Ink on Obsidian Vellum · Cormorant Garamond');
        setPalette(POETRY_THEMES[0].palette);
      } else if (initialFormat === 'integer art') {
        setTypeIndex(3);
        setStyleIndex(3);
        setMedium('Algorithmic Integer Canvas & Shader Code');
      } else if (initialCategory === 'video' || initialFormat?.includes('video') || initialFormat?.includes('motion')) {
        setTypeIndex(4);
        setStyleIndex(4); // Video
        setRatioIndex(2); // Wide
      } else if (initialCategory === 'painting') {
        setTypeIndex(2);
        setStyleIndex(1);
      } else if (initialCategory === 'drawing') {
        setTypeIndex(2);
        setStyleIndex(2);
      } else {
        setTypeIndex(2);
        setStyleIndex(3);
      }
    } else {
      document.body.style.overflow = '';
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialCategory, initialFormat]);

  // Clean up Object URLs on unmount
  useEffect(() => {
    const urls = createdObjectUrlsRef.current;
    return () => {
      urls.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {
          // ignore
        }
      });
      if (musicAudioPlayerRef.current) {
        musicAudioPlayerRef.current.pause();
      }
    };
  }, []);

  // Keyboard navigation & Focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Readiness Calculation
  const readyPct = useMemo(() => {
    let p = 0;
    if (typeIndex === 0) {
      if (musicAudioSrc) p += 30;
      if (musicCoverSrc) p += 25;
    } else if (typeIndex === 1) {
      if (poetryMode === 'compose') {
        if (poetryRawText.trim().length > 10) p += 35;
        if (poetryTheme) p += 20;
      } else {
        if (handwrittenSrc) p += 55;
      }
    } else {
      if (mediaSrc) p += 55;
    }
    if (title.trim()) p += 25;
    if (story.trim() || (typeIndex === 1 && poetryRawText.trim())) p += 10;
    if (tags.length) p += 10;
    return Math.min(100, p);
  }, [typeIndex, musicAudioSrc, musicCoverSrc, poetryMode, poetryRawText, poetryTheme, handwrittenSrc, mediaSrc, title, story, tags.length]);

  // Media Source Handler
  const updateMediaSource = (src: string, isVid = false, fileObj?: File) => {
    setMediaSrc(src);
    setIsVideo(isVid);
    if (fileObj) setMediaFile(fileObj);
    extractColors(src).then((p) => setPalette(p));
  };

  const processFile = (file: File) => {
    if (file.size > 52428800) {
      showToast('File is over 50 MB limit.');
      return;
    }
    const isVid = file.type.startsWith('video/');
    const url = URL.createObjectURL(file);
    createdObjectUrlsRef.current.push(url);
    updateMediaSource(url, isVid, file);
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const processAudioFile = (file: File) => {
    if (file.size > 52428800) {
      showToast('Audio file exceeds 50 MB limit.');
      return;
    }
    const url = URL.createObjectURL(file);
    createdObjectUrlsRef.current.push(url);
    setMusicAudioSrc(url);
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
    showToast('Master audio loaded.');
  };

  const processCoverFile = (file: File) => {
    if (file.size > 52428800) {
      showToast('Cover image exceeds 50 MB limit.');
      return;
    }
    const url = URL.createObjectURL(file);
    createdObjectUrlsRef.current.push(url);
    setMusicCoverSrc(url);
    extractColors(url).then((p) => setPalette(p));
  };

  const processHandwrittenFile = (file: File) => {
    if (file.size > 52428800) {
      showToast('Manuscript file exceeds 50 MB limit.');
      return;
    }
    const url = URL.createObjectURL(file);
    createdObjectUrlsRef.current.push(url);
    setHandwrittenSrc(url);
    setHandwrittenFile(file);
    setMediaSrc(url);
    extractColors(url).then((p) => setPalette(p));
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
    showToast('Handwritten manuscript loaded.');
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (typeIndex === 0 && !musicAudioSrc) {
        showToast('Please add a master audio composition first.');
        return false;
      }
      if (typeIndex === 1 && poetryMode === 'upload' && !handwrittenSrc) {
        showToast('Please upload your handwritten poetry manuscript first.');
        return false;
      }
      if (typeIndex !== 0 && typeIndex !== 1 && !mediaSrc) {
        showToast('Please add your artwork file, link, or choose a sample.');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!title.trim()) {
        setHasTitleError(true);
        if (modalRef.current) {
          modalRef.current.classList.add('shake');
          setTimeout(() => modalRef.current?.classList.remove('shake'), 450);
        }
        showToast('Please give your piece a title.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setStep(0);
    setMediaSrc('');
    setMediaFile(null);
    setTitle('');
    setStory('');
    setTags([]);
    setHandwrittenSrc('');
    setHandwrittenFile(null);
    setIsSuccess(false);
    onClose();
  };

  // Tag Manager
  const addTag = (text: string) => {
    const clean = text.trim().replace(/^#/, '');
    if (!clean) return;
    if (tags.length >= 6) {
      showToast('Maximum 6 tags permitted.');
      return;
    }
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((x) => x !== t));
  };

  // Publish to Sanctuary
  const handlePublish = async () => {
    if (!title.trim()) {
      setHasTitleError(true);
      setStep(2);
      showToast('Title is required to inaugurate.');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeStyle = STYLES[styleIndex];
      const newArtId = `aq-sanctuary-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const artistObj = isGuest
        ? {
            id: 'guest',
            name: guestName.trim() || 'Guest Artist',
            handle: guestHandle.trim().startsWith('@') ? guestHandle.trim() : `@${guestHandle.trim() || 'guest_artist'}`,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
            verified: false
          }
        : currentUser;

      let resolvedMediaUrl = mediaSrc;
      if (mediaFile) {
        try {
          const uploadedUrl = await uploadArtworkMediaToStorage(mediaFile);
          if (uploadedUrl) resolvedMediaUrl = uploadedUrl;
        } catch (err) {
          console.warn('Storage upload fallback to object URL:', err);
        }
      }

      let createdArtwork: Artwork;

      if (typeIndex === 0) {
        // Original Music
        let resolvedAudio = musicAudioSrc;
        let resolvedCover = musicCoverSrc;

        const trackTitle = title.trim();

        createdArtwork = {
          id: newArtId,
          title: trackTitle,
          category: 'music',
          artist: artistObj,
          mediaUrl: resolvedCover,
          thumbnailUrl: resolvedCover,
          dimensions: 'Master Acoustic Audio (Lossless)',
          medium: `${musicGenre.trim() || 'Acoustic Master'} · 44.1kHz`,
          year: year,
          description: story.trim() || `${trackTitle} — An evocative original composition recorded for The Artisan's Quill sanctuary.`,
          tags: tags.length > 0 ? tags : ['Original Music', 'Acoustic', 'Sanctuary Master'],
          likesCount: 0,
          viewsCount: 1,
          savesCount: 0,
          createdAt: new Date().toISOString(),
          aspectRatio: 'square',
          isLiked: false,
          isSaved: false,
          featured: false,
          colorPalette: palette,
          musicData: {
            audioUrl: resolvedAudio,
            coverUrl: resolvedCover,
            album: musicAlbum.trim() || 'Atelier Master Sessions',
            duration: `${Math.floor((musicDurationSeconds || 215) / 60)}:${String((musicDurationSeconds || 215) % 60).padStart(2, '0')}`,
            genre: musicGenre.trim() || 'Original Composition',
            isOriginalComposition: true,
            composer: artistObj.name,
            key: musicKey.trim(),
            bpm: musicBpm.trim(),
            lyrics: musicLyrics.trim() || story.trim()
          }
        };

        registerCommunityTrack({
          id: newArtId,
          title: trackTitle,
          artistName: artistObj.name,
          audioUrl: resolvedAudio,
          coverUrl: resolvedCover,
          album: musicAlbum.trim() || 'Atelier Master Sessions',
          genre: musicGenre.trim() || 'Original Composition',
          durationSeconds: musicDurationSeconds || 215
        });
      } else if (typeIndex === 1) {
        // Poetry Card: Composed on Aesthetic Paper OR Uploaded Handwritten Manuscript
        let poetryMedia = resolvedMediaUrl;

        if (poetryMode === 'compose') {
          // Generate a high-resolution SVG Data URL representing the exact aesthetic paper card
          poetryMedia = generatePoemCardDataUrl(
            title.trim(),
            poetrySubtitle.trim(),
            parsedStanzas,
            authorSignature.trim() || (isGuest ? `— ${guestName.trim()}` : `— ${artistObj.name}`),
            poetryTheme,
            poetryFont,
            poetryAlignment
          );
        } else if (handwrittenFile) {
          try {
            const uploadedUrl = await uploadArtworkMediaToStorage(handwrittenFile);
            if (uploadedUrl) poetryMedia = uploadedUrl;
          } catch (err) {
            console.warn('Storage upload fallback:', err);
          }
        }

        const readingTime = Math.max(1, Math.ceil((poetryRawText || story).split(/\s+/).filter(Boolean).length / 70));

        createdArtwork = {
          id: newArtId,
          title: title.trim(),
          category: 'poetry',
          artist: artistObj,
          mediaUrl: poetryMedia,
          thumbnailUrl: poetryMedia,
          medium:
            poetryMode === 'compose'
              ? `${currentTheme.medium} · ${currentFont.label}`
              : medium.trim() || 'Handwritten Manuscript on Archival Paper',
          dimensions: dims.trim() || 'Archival Folio (1200 × 1600 px)',
          year: year,
          description: story.trim() || (poetrySubtitle ? `${title} (${poetrySubtitle})` : 'Curated poetry card crafted in The Artisan\'s Quill.'),
          tags: tags.length > 0 ? tags : ['Poetry', 'Lyric Verse', 'Atelier'],
          likesCount: 0,
          viewsCount: 1,
          savesCount: 0,
          createdAt: new Date().toISOString(),
          aspectRatio: 'portrait',
          isLiked: false,
          isSaved: false,
          featured: false,
          colorPalette: palette,
          poetryContent: {
            stanzas: parsedStanzas.length > 0 ? parsedStanzas : [poetryRawText.trim() || story.trim() || 'Silence speaks in verse.'],
            theme: poetryTheme,
            fontStyle: poetryFont,
            alignment: poetryAlignment === 'right' ? 'center' : poetryAlignment,
            readingTimeMinutes: readingTime,
            authorSignature: authorSignature.trim() || (isGuest ? `— ${guestName.trim()}` : `— ${artistObj.name}`),
            subtitle: poetrySubtitle.trim()
          }
        };
      } else {
        // Visual Arts: Digital Art, Integer Art, Motion Loop, Painting, Drawing
        const isMotionVideo = typeIndex === 4 || styleIndex === 4 || isVideo || resolvedMediaUrl.match(/\.(mp4|webm|mov|m4v|ogv)/i) != null;
        const resolvedCategory: ArtCategory = isMotionVideo
          ? 'video'
          : styleIndex === 1
          ? 'painting'
          : styleIndex === 2
          ? 'drawing'
          : 'digital';

        createdArtwork = {
          id: newArtId,
          title: title.trim(),
          category: resolvedCategory,
          artist: artistObj,
          mediaUrl: resolvedMediaUrl,
          thumbnailUrl: resolvedMediaUrl,
          dimensions: dims.trim() || (isMotionVideo ? '4K Cinema (3840 x 2160)' : 'Original Canvas'),
          medium:
            medium.trim() ||
            (isMotionVideo
              ? '4K Volumetric Fluid Dynamics & Motion Loop'
              : typeIndex === 3
              ? 'Algorithmic Integer Canvas & Shader Code'
              : 'Generative Shader & 3D Render'),
          year: year,
          description:
            story.trim() ||
            (isMotionVideo
              ? "A curated motion cinema loop in The Artisan's Quill sanctuary."
              : 'Fine digital artwork inaugurated to the sanctuary collection.'),
          tags: tags.length > 0 ? tags : ['Atelier Masterpiece', activeStyle, 'Sanctuary Archive'],
          likesCount: 0,
          viewsCount: 1,
          savesCount: 0,
          createdAt: new Date().toISOString(),
          aspectRatio: (AR[ratioIndex] === '1/1'
            ? 'square'
            : AR[ratioIndex] === '3/4'
            ? 'tall'
            : AR[ratioIndex] === '4/3'
            ? 'wide'
            : AR[ratioIndex] === '16/9'
            ? 'ultrawide'
            : 'portrait') as AspectRatioType,
          isLiked: false,
          isSaved: false,
          featured: false,
          colorPalette: palette,
          videoData: isMotionVideo
            ? {
                videoUrl: resolvedMediaUrl,
                posterUrl: resolvedMediaUrl,
                loopDurationSeconds: 16,
                fps: 60,
                resolution: '4K Volumetric Cinema',
                codec: 'H.264 / AAC High-Fidelity',
                audioTrackUrl: '/audio/wsKhe5rTKw8.mp4',
                colorProfile: 'DCI-P3 Wide Gamut'
              }
            : undefined
        };
      }

      // Dispatch custom event for system compatibility
      const publishEvent = new CustomEvent('sanctuary:publish', {
        bubbles: true,
        detail: { artwork: createdArtwork, timestamp: Date.now() }
      });
      window.dispatchEvent(publishEvent);

      // Execute parent callback
      onSuccess(createdArtwork);
      setIsSuccess(true);
    } catch (err) {
      console.error('Inauguration error:', err);
      showToast('Could not complete inauguration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Upload Artwork, Poem or Music to Sanctuary"
    >
      {/* Toast Notification Container */}
      <div id="qu-toast" className={isToastActive ? 'on' : ''}>
        {toastMessage}
      </div>

      <div ref={modalRef} className="qu">
        {/* Header */}
        <header className="mh">
          <div className="ic">
            {typeIndex === 0 ? '🎵' : typeIndex === 1 ? '🪶' : typeIndex === 4 ? '🎞️' : '🎨'}
          </div>
          <div>
            <h2>Share your work</h2>
            <p>Four calm steps. No technical knowledge needed.</p>
          </div>
          <button type="button" className="x" aria-label="Close dialog" onClick={onClose}>
            ✕
          </button>
        </header>

        {/* Modal Body & Step Navigation */}
        <div className="mb">
          <nav className="stp" aria-label="Upload steps">
            {['1. Choose', '2. Artwork', '3. Story', '4. Finish'].map((label, idx) => (
              <button
                key={label}
                type="button"
                className={`${idx === step ? 'on' : ''} ${idx < step ? 'dn' : ''}`}
                onClick={() => {
                  if (idx <= step) setStep(idx);
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* STEP 0: CHOOSE */}
          <div hidden={step !== 0}>
            <section className="blk">
              <h3>What are you sharing today?</h3>
              <p className="hint">Choose one. You can change it anytime.</p>
              <div className="types">
                {TYPES.map(([icon, label], idx) => (
                  <button
                    key={label}
                    type="button"
                    className={`tc ${idx === typeIndex ? 'on' : ''}`}
                    onClick={() => {
                      setTypeIndex(idx);
                      if (idx === 0) {
                        setStyleIndex(3);
                        setRatioIndex(0); // Square 1:1
                      } else if (idx === 1) {
                        setStyleIndex(0); // Poetry Cards
                        setRatioIndex(1); // Tall 3:4
                        setMedium('Golden Ink on Obsidian Vellum · Cormorant Garamond');
                        if (!title) setTitle('Marginalia');
                      } else if (idx === 4) {
                        setStyleIndex(4); // Video
                        setIsVideo(true);
                        setRatioIndex(2); // Wide
                      } else {
                        setStyleIndex(3); // Digital
                      }
                    }}
                  >
                    <b>{icon}</b>
                    {label}
                  </button>
                ))}
              </div>

              <h4>Which style fits best?</h4>
              <div className="chips">
                {STYLES.map((st, idx) => (
                  <button
                    key={st}
                    type="button"
                    className={`chip ${idx === styleIndex ? 'on' : ''}`}
                    onClick={() => {
                      setStyleIndex(idx);
                      if (st === 'Poetry Cards') {
                        setTypeIndex(1);
                        setRatioIndex(1);
                      } else if (st === 'Video') {
                        setIsVideo(true);
                      }
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Guest Creator Attribution */}
              {isGuest && (
                <div style={{ marginTop: '24px', padding: '16px', background: 'var(--fld)', border: '1px solid var(--line)', borderRadius: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--acc)', marginBottom: '12px' }}>
                    <span>✦ Broadcasting as Guest Creator</span>
                  </div>
                  <div className="g2">
                    <div className="fld" style={{ marginBottom: 0 }}>
                      <label>Artist Display Name</label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Elena Vance"
                      />
                    </div>
                    <div className="fld" style={{ marginBottom: 0 }}>
                      <label>Artist Handle</label>
                      <input
                        type="text"
                        value={guestHandle}
                        onChange={(e) => setGuestHandle(e.target.value)}
                        placeholder="e.g. @elenavance"
                      />
                    </div>
                  </div>
                  <small style={{ color: 'var(--mute)', display: 'block', marginTop: '8px' }}>
                    Your public creations are preserved across the sanctuary live feed.
                  </small>
                </div>
              )}
            </section>
          </div>

          {/* STEP 1: ARTWORK */}
          <div hidden={step !== 1}>
            <section className="blk">
              <h3>
                {typeIndex === 0
                  ? 'Add your master music'
                  : typeIndex === 1
                  ? 'Compose or upload poetry'
                  : 'Add your artwork'}
              </h3>
              <p className="hint">
                {typeIndex === 0
                  ? 'Add your master audio composition and album cover artwork.'
                  : typeIndex === 1
                  ? 'Compose on aesthetic papers with artistic fonts, or upload a handwritten manuscript.'
                  : 'Drag a file in, or tap the box. PNG, JPG, WebP, GIF or MP4 · up to 50 MB.'}
              </p>

              {typeIndex === 0 ? (
                /* Music Upload View */
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px' }}>Master Audio Track (MP3, WAV, FLAC, M4A, MP4)</h4>
                    <label
                      className={`dz ${musicAudioSrc ? 'has' : ''}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('over');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('over');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('over');
                        if (e.dataTransfer.files[0]) processAudioFile(e.dataTransfer.files[0]);
                      }}
                    >
                      <input
                        ref={musicAudioInputRef}
                        type="file"
                        hidden
                        accept="audio/*,video/mp4"
                        onChange={(e) => {
                          if (e.target.files?.[0]) processAudioFile(e.target.files[0]);
                        }}
                      />
                      <div className="dzin">
                        <i>🎵</i>
                        <b>Drop your master audio here</b>
                        <span>or click to browse your recording files</span>
                      </div>
                      <div className="pv">
                        {musicAudioSrc && (
                          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--acc)' }}>
                              🎵 Audio Track Loaded
                            </div>
                            <button
                              type="button"
                              className="btn ghost"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!musicAudioPlayerRef.current) return;
                                if (isAudioPlaying) {
                                  musicAudioPlayerRef.current.pause();
                                  setIsAudioPlaying(false);
                                } else {
                                  musicAudioPlayerRef.current.play();
                                  setIsAudioPlaying(true);
                                }
                              }}
                            >
                              {isAudioPlaying ? '⏸ Pause Studio Preview' : '▶ Play Studio Preview'}
                            </button>
                            <button
                              type="button"
                              className="rm"
                              onClick={(e) => {
                                e.preventDefault();
                                setMusicAudioSrc('');
                                setIsAudioPlaying(false);
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </label>
                    <audio
                      ref={musicAudioPlayerRef}
                      src={musicAudioSrc}
                      onEnded={() => setIsAudioPlaying(false)}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 8px' }}>Album Sleeve Cover Artwork</h4>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <img
                        src={musicCoverSrc}
                        alt="Album Cover"
                        style={{ width: '84px', height: '84px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--line)' }}
                      />
                      <input
                        ref={musicCoverInputRef}
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) processCoverFile(e.target.files[0]);
                        }}
                      />
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => musicCoverInputRef.current?.click()}
                      >
                        Upload Custom Cover
                      </button>
                    </div>
                  </div>

                  <div className="or">or select a sanctuary master track demo</div>
                  <div className="smps">
                    {PRESET_MUSIC_TRACKS.map((t, idx) => (
                      <button
                        key={idx}
                        type="button"
                        title={t.title}
                        onClick={() => {
                          setMusicAudioSrc(t.audioUrl);
                          setMusicCoverSrc(t.coverUrl);
                          setTitle(t.title);
                          setMusicAlbum(t.album);
                          setMusicGenre(t.genre);
                          setMusicDurationSeconds(t.durationSeconds);
                          setMusicKey(t.key);
                          setMusicBpm(t.bpm);
                          if (t.lyrics) setMusicLyrics(t.lyrics);
                          extractColors(t.coverUrl).then((p) => setPalette(p));
                        }}
                      >
                        <img src={t.coverUrl} alt={t.title} />
                      </button>
                    ))}
                  </div>
                </div>
              ) : typeIndex === 1 ? (
                /* DEDICATED POETRY STUDIO & FORMATTER */
                <div style={{ display: 'grid', gap: '20px' }}>
                  {/* Mode Selector */}
                  <div className="po-mode-row">
                    <button
                      type="button"
                      className={`po-mode-btn ${poetryMode === 'compose' ? 'on' : ''}`}
                      onClick={() => setPoetryMode('compose')}
                    >
                      <i>✍️</i>
                      <div>
                        <b>Compose on Aesthetic Paper</b>
                        <span>Write live with luxury paper textures & artistic typefaces</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`po-mode-btn ${poetryMode === 'upload' ? 'on' : ''}`}
                      onClick={() => setPoetryMode('upload')}
                    >
                      <i>📜</i>
                      <div>
                        <b>Upload Handwritten Manuscript</b>
                        <span>Fountain pen, calligraphy scan, sketchbook or typed verse</span>
                      </div>
                    </button>
                  </div>

                  {poetryMode === 'compose' ? (
                    <>
                      {/* Paper Tone Selector */}
                      <div className="po-section">
                        <div className="po-section-header">
                          <h4>1. Choose Aesthetic Paper Tone</h4>
                          <span className="po-badge">{currentTheme.label}</span>
                        </div>
                        <div className="po-paper-grid">
                          {POETRY_THEMES.map((th) => (
                            <button
                              key={th.id}
                              type="button"
                              className={`po-paper-card ${poetryTheme === th.id ? 'on' : ''}`}
                              onClick={() => {
                                setPoetryTheme(th.id);
                                setPalette(th.palette);
                                setMedium(`${th.medium} · ${currentFont.label}`);
                              }}
                            >
                              <div className="po-paper-swatch" style={{ background: th.bg, borderColor: th.border }}>
                                <span style={{ color: th.acc }}>✦</span>
                              </div>
                              <div className="po-paper-info">
                                <b>{th.label}</b>
                                <span>{th.desc}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Typography & Alignment Selector */}
                      <div className="po-section">
                        <div className="po-section-header">
                          <h4>2. Artistic Typography & Alignment</h4>
                          <div className="po-align-group">
                            <button
                              type="button"
                              className={`po-align-btn ${poetryAlignment === 'center' ? 'on' : ''}`}
                              onClick={() => setPoetryAlignment('center')}
                            >
                              ≡ Center
                            </button>
                            <button
                              type="button"
                              className={`po-align-btn ${poetryAlignment === 'left' ? 'on' : ''}`}
                              onClick={() => setPoetryAlignment('left')}
                            >
                              ⇤ Left
                            </button>
                            <button
                              type="button"
                              className={`po-align-btn ${poetryAlignment === 'right' ? 'on' : ''}`}
                              onClick={() => setPoetryAlignment('right')}
                            >
                              ⇥ Right (Nastaliq)
                            </button>
                          </div>
                        </div>
                        <div className="po-font-chips">
                          {POETRY_FONTS.map((font) => (
                            <button
                              key={font.id}
                              type="button"
                              className={`po-font-chip ${poetryFont === font.id ? 'on' : ''}`}
                              style={{ fontFamily: font.fontFamily }}
                              onClick={() => {
                                setPoetryFont(font.id);
                                if (font.id === 'nastaliq') setPoetryAlignment('right');
                                setMedium(`${currentTheme.medium} · ${font.label}`);
                              }}
                            >
                              {font.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* The Aesthetic Paper Writing Canvas */}
                      <div
                        className="po-canvas"
                        style={{
                          background: currentTheme.bg,
                          color: currentTheme.ink,
                          borderColor: currentTheme.border
                        }}
                      >
                        <div className="po-canvas-header">
                          <span className="po-canvas-eyebrow" style={{ color: currentTheme.acc }}>
                            ✦ THE ARTISAN'S ARCHIVE · POETRY CANVAS ✦
                          </span>
                          <div className="po-canvas-inputs">
                            <input
                              type="text"
                              className="po-canvas-title"
                              placeholder="Title of Verse (e.g. Marginalia, Night Wind)"
                              value={title}
                              style={{
                                color: currentTheme.ink,
                                fontFamily: currentFont.fontFamily,
                                textAlign: poetryAlignment
                              }}
                              onChange={(e) => {
                                setTitle(e.target.value);
                                if (e.target.value.trim()) setHasTitleError(false);
                              }}
                            />
                            <input
                              type="text"
                              className="po-canvas-subtitle"
                              placeholder="Collection / Subtitle (e.g. From 'Nocturne Fragments')"
                              value={poetrySubtitle}
                              style={{
                                color: currentTheme.sub,
                                fontFamily: currentFont.fontFamily,
                                textAlign: poetryAlignment
                              }}
                              onChange={(e) => setPoetrySubtitle(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="po-canvas-body">
                          <textarea
                            rows={8}
                            className="po-canvas-stanzas"
                            placeholder={`Write your poetic lines here...\n\nSeparate stanzas with a double line break.\nThe paper conforms directly to your chosen font and paper theme.`}
                            value={poetryRawText}
                            style={{
                              color: currentTheme.ink,
                              fontFamily: currentFont.fontFamily,
                              textAlign: poetryAlignment
                            }}
                            onChange={(e) => {
                              setPoetryRawText(e.target.value);
                              setStory(e.target.value);
                            }}
                          />
                        </div>

                        <div className="po-canvas-footer">
                          <input
                            type="text"
                            className="po-canvas-signature"
                            placeholder="Poet Signature (e.g. — Afshaan Shaikh, 2026)"
                            value={authorSignature}
                            style={{
                              color: currentTheme.sub,
                              fontFamily: currentFont.fontFamily,
                              textAlign: poetryAlignment
                            }}
                            onChange={(e) => setAuthorSignature(e.target.value)}
                          />
                          <div className="po-canvas-stats" style={{ color: currentTheme.sub }}>
                            <span>{parsedStanzas.length} Stanza{parsedStanzas.length !== 1 ? 's' : ''}</span>
                            <span>·</span>
                            <span>{poetryRawText.split('\n').filter(Boolean).length} Lines</span>
                            <span>·</span>
                            <span>~{Math.max(1, Math.ceil(poetryRawText.split(/\s+/).filter(Boolean).length / 70))} min read</span>
                          </div>
                        </div>
                      </div>

                      {/* Curated Sanctuary Samples */}
                      <div className="or">or try a curated sanctuary masterpiece verse</div>
                      <div className="po-preset-row">
                        {PRESET_POETRY_SAMPLES.map((sample, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="po-preset-pill"
                            onClick={() => {
                              setTitle(sample.title);
                              setPoetrySubtitle(sample.subtitle);
                              setAuthorSignature(`— ${sample.author}, 2026`);
                              setPoetryTheme(sample.theme);
                              setPoetryFont(sample.font);
                              setPoetryAlignment(sample.alignment);
                              setPoetryRawText(sample.stanzas.join('\n\n'));
                              setStory(sample.stanzas.join('\n\n'));
                              setPalette(sample.palette);
                              setMedium(sample.medium);
                              setHasTitleError(false);
                            }}
                          >
                            <i>📜</i>
                            <div>
                              <b>{sample.title}</b>
                              <span>{sample.author} · {sample.subtitle}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    /* Upload Handwritten Manuscript Mode */
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <label
                        className={`dz ${handwrittenSrc ? 'has' : ''}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('over');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('over');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('over');
                          if (e.dataTransfer.files[0]) processHandwrittenFile(e.dataTransfer.files[0]);
                        }}
                      >
                        <input
                          ref={handwrittenInputRef}
                          type="file"
                          hidden
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            if (e.target.files?.[0]) processHandwrittenFile(e.target.files[0]);
                          }}
                        />
                        <div className="dzin">
                          <i>📜</i>
                          <b>Drop your handwritten poetry or calligraphy scan here</b>
                          <span>Supports all formats: PNG, JPG, WebP, GIF, SVG · up to 50 MB</span>
                        </div>
                        {handwrittenSrc && (
                          <div className="pv">
                            <img src={handwrittenSrc} alt="Handwritten Poetry Preview" />
                            <button
                              type="button"
                              className="rm"
                              onClick={(e) => {
                                e.preventDefault();
                                setHandwrittenSrc('');
                                setHandwrittenFile(null);
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </label>

                      <div className="or">or try a sample handwritten manuscript scan</div>
                      <div className="smps">
                        {PRESET_HANDWRITTEN_SAMPLES.map((sample, idx) => (
                          <button
                            key={idx}
                            type="button"
                            title={sample.title}
                            onClick={() => {
                              setHandwrittenSrc(sample.src);
                              setMediaSrc(sample.src);
                              setTitle(sample.title);
                              setMedium(sample.medium);
                              setPalette(sample.palette);
                              setHasTitleError(false);
                            }}
                          >
                            <img src={sample.src} alt={sample.title} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Visual / Video Artwork Upload */
                <>
                  <label
                    className={`dz ${mediaSrc ? 'has' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('over');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('over');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('over');
                      if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept="image/*,video/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) processFile(e.target.files[0]);
                      }}
                    />
                    <div className="dzin">
                      <i>{typeIndex === 4 || isVideo ? '🎞️' : '🖼️'}</i>
                      <b>Drop your piece here</b>
                      <span>or click to browse from your device</span>
                    </div>
                    <div className="pv">
                      {mediaSrc && (
                        <>
                          {isVideo ? (
                            <video src={mediaSrc} controls autoPlay loop muted />
                          ) : (
                            <img src={mediaSrc} alt="Artwork Preview" />
                          )}
                          <button
                            type="button"
                            className="rm"
                            onClick={(e) => {
                              e.preventDefault();
                              fileInputRef.current?.click();
                            }}
                          >
                            Replace
                          </button>
                        </>
                      )}
                    </div>
                  </label>

                  <div className="or">or paste a link</div>
                  <div className="urlrow">
                    <input
                      placeholder="https://… link to an image or video"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => {
                        const u = urlInput.trim();
                        if (!u) {
                          showToast('Paste a link first.');
                          return;
                        }
                        const isVid = /\.(mp4|webm|mov)(\?|$)/i.test(u);
                        updateMediaSource(u, isVid);
                      }}
                    >
                      Use link
                    </button>
                  </div>

                  <div className="or">or try a curated sanctuary sample</div>
                  <div className="smps">
                    {PRESET_ART_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        title={preset.name}
                        onClick={() => {
                          updateMediaSource(preset.src, preset.category === 'video');
                          setTitle(preset.name);
                          setMedium(preset.medium);
                          setPalette(preset.palette);
                          if (preset.category === 'painting') setStyleIndex(1);
                          else if (preset.category === 'drawing') setStyleIndex(2);
                          else if (preset.category === 'digital') setStyleIndex(3);
                          else if (preset.category === 'video') setStyleIndex(4);
                        }}
                      >
                        <img src={preset.src} alt={preset.name} />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>

          {/* STEP 2: STORY */}
          <div hidden={step !== 2}>
            <section className="blk">
              <h3>{typeIndex === 1 ? 'Title & poetic notes' : 'Name your piece'}</h3>
              <p className="hint">
                {typeIndex === 1
                  ? 'Only the title is required. Add collection notes or inspiration behind your verse.'
                  : 'Only the title is required. The rest helps people understand your work.'}
              </p>

              <div className={`fld ${hasTitleError && !title.trim() ? 'bad' : ''}`}>
                <label>Title *</label>
                <input
                  placeholder="e.g. Echoes of Gold and Rust"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value.trim()) setHasTitleError(false);
                  }}
                />
                <small>A name people will remember.</small>
              </div>

              <div className="g2">
                <div className="fld">
                  <label>{typeIndex === 1 ? 'Paper & Typographic Medium' : 'Made with'}</label>
                  <input
                    placeholder="e.g. Oil on canvas, Procreate"
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                  />
                </div>
                <div className="fld">
                  <label>Size / Resolution</label>
                  <input
                    placeholder="e.g. 120 × 160 cm, 4K"
                    value={dims}
                    onChange={(e) => setDims(e.target.value)}
                  />
                </div>
              </div>

              <div className="g2">
                <div className="fld">
                  <label>Year created</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                  />
                </div>
                <div className="fld">
                  <label>Shape</label>
                  <select
                    value={ratioIndex}
                    onChange={(e) => setRatioIndex(parseInt(e.target.value))}
                  >
                    {RATIOS.map((r, i) => (
                      <option key={r} value={i}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="fld">
                <label>{typeIndex === 1 ? 'Poetic Inspiration & Liner Notes' : 'Story behind it'}</label>
                <textarea
                  rows={4}
                  maxLength={600}
                  placeholder={
                    typeIndex === 1
                      ? 'Share the emotional moment, rain outside the window, or thoughts that sparked this poem...'
                      : 'What inspired you? What does it mean? What should people look for?'
                  }
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                />
                <div className="cnt">{story.length} / 600</div>
              </div>

              <div className="chips sm">
                {(typeIndex === 1 ? POETRY_IDEAS : IDEAS).map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    className="chip"
                    onClick={() => setStory((prev) => (prev ? prev + ' ' + idea : idea))}
                  >
                    + {idea}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* STEP 3: FINISH & MUSEUM FRAME */}
          <div hidden={step !== 3}>
            <section className="blk">
              <div className="fin">
                {/* Museum Frame Preview */}
                <div className="gal">
                  <div className="frame">
                    <div className="mat">
                      <div className="art" style={{ aspectRatio: AR[ratioIndex] }}>
                        {typeIndex === 1 && poetryMode === 'compose' ? (
                          <div
                            className="po-frame-preview"
                            style={{
                              background: currentTheme.bg,
                              color: currentTheme.ink,
                              borderColor: currentTheme.border,
                              fontFamily: currentFont.fontFamily,
                              textAlign: poetryAlignment
                            }}
                          >
                            <div className="po-frame-badge" style={{ color: currentTheme.acc }}>
                              ✦ POETRY CARD ✦
                            </div>
                            <h4 style={{ color: currentTheme.ink, margin: '4px 0 2px', fontSize: '15px', fontWeight: 600 }}>
                              {title || 'Untitled Verse'}
                            </h4>
                            {poetrySubtitle && (
                              <div style={{ fontSize: '10px', color: currentTheme.sub, fontStyle: 'italic', marginBottom: '8px' }}>
                                {poetrySubtitle}
                              </div>
                            )}
                            <div className="po-frame-stanzas">
                              {(parsedStanzas.length > 0 ? parsedStanzas : ['Silence speaks in verse.']).slice(0, 3).map((st, i) => (
                                <p key={i} style={{ margin: '0 0 6px', fontSize: '11px', lineHeight: 1.6 }}>
                                  {st}
                                </p>
                              ))}
                            </div>
                            <div style={{ marginTop: 'auto', paddingTop: '6px', fontSize: '10px', color: currentTheme.sub, fontStyle: 'italic' }}>
                              {authorSignature || '— Atelier Poet'}
                            </div>
                          </div>
                        ) : typeIndex === 1 && poetryMode === 'upload' && handwrittenSrc ? (
                          <img src={handwrittenSrc} alt="Handwritten Manuscript" />
                        ) : typeIndex === 0 && musicCoverSrc ? (
                          <img src={musicCoverSrc} alt="Album Cover" />
                        ) : isVideo && mediaSrc ? (
                          <video src={mediaSrc} autoPlay loop muted playsInline />
                        ) : mediaSrc ? (
                          <img src={mediaSrc} alt="Artwork" />
                        ) : (
                          <span>Your piece will hang here</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Brass Placard */}
                  <div className="plate">
                    <b>{title || 'Untitled Piece'}</b>
                    <span>
                      {[
                        typeIndex === 1
                          ? poetryMode === 'compose'
                            ? `Poetry Card · ${currentTheme.label} · ${currentFont.label}`
                            : 'Handwritten Poetry Manuscript'
                          : TYPES[typeIndex][1],
                        STYLES[styleIndex],
                        medium,
                        year
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    <div className="pdots">
                      {palette.map((c, i) => (
                        <i key={i} style={{ background: c }} />
                      ))}
                    </div>
                    <div className="pbar">
                      <i style={{ width: `${readyPct}%` }} />
                    </div>
                    <small style={{ fontSize: '10px', opacity: 0.8, display: 'block', marginTop: '4px' }}>
                      {readyPct}% complete
                    </small>
                  </div>
                </div>

                {/* Tags & Colors Panel */}
                <div>
                  <h3>Final touches</h3>
                  <p className="hint">This is how your piece will hang in the Sanctuary.</p>

                  <h4 style={{ margin: '0 0 10px' }}>Colors found in your work (picked for you)</h4>
                  <div className="pal">
                    {palette.map((c, i) => (
                      <input
                        key={i}
                        type="color"
                        value={c}
                        onChange={(e) => {
                          const copy = [...palette];
                          copy[i] = e.target.value;
                          setPalette(copy);
                        }}
                        className="sw"
                        style={{ background: c }}
                      />
                    ))}
                    <button
                      type="button"
                      className="ref"
                      title="Shuffle colors"
                      onClick={() => {
                        const target = typeIndex === 0 ? musicCoverSrc : mediaSrc;
                        if (target) extractColors(target, true).then((p) => setPalette(p));
                        else setPalette(randPalette());
                      }}
                    >
                      ↻
                    </button>
                  </div>

                  <h4 style={{ margin: '22px 0 10px' }}>Tags help people discover your work</h4>
                  <div className="tgbox">
                    {tags.map((t) => (
                      <button key={t} type="button" className="tg" onClick={() => removeTag(t)}>
                        {t} ×
                      </button>
                    ))}
                    <input
                      placeholder="Type a tag, press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                    />
                  </div>

                  <div className="chips sm">
                    {(typeIndex === 1 ? POETRY_TAGS : TAGS).map((t) => (
                      <button key={t} type="button" className="chip" onClick={() => addTag(t)}>
                        + {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Modal Footer */}
        <footer className="mf">
          <button type="button" className="btn ghost" onClick={handleReset}>
            Cancel
          </button>
          <span className="rd">{readyPct}% ready</span>
          <div className="fa">
            {step > 0 && (
              <button type="button" className="btn ghost" onClick={handleBack}>
                Back
              </button>
            )}
            {step < 3 && (
              <button type="button" className="btn" onClick={handleNext}>
                Continue
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                className="btn"
                disabled={isSubmitting}
                onClick={handlePublish}
              >
                {isSubmitting ? 'Inaugurating…' : '✓ Inaugurate to Sanctuary'}
              </button>
            )}
          </div>
        </footer>

        {/* Success Overlay: "Welcome to the Sanctuary" */}
        {isSuccess && (
          <div className="ok">
            <div>
              <b>✦</b>
              <h2>Welcome to the Sanctuary</h2>
              <p style={{ fontStyle: 'italic', color: 'var(--mute)', margin: '10px 0 24px', fontSize: '16px' }}>
                <span style={{ color: 'var(--ink)' }}>{title}</span> is now live for the world to see.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setIsSuccess(false);
                    onClose();
                  }}
                >
                  Explore Sanctuary
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setIsSuccess(false);
                    setStep(0);
                    setTitle('');
                    setMediaSrc('');
                    setHandwrittenSrc('');
                    setStory('');
                    setTags([]);
                  }}
                >
                  Share another piece
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default UploadModal;
