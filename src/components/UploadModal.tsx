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

const STYLES = ['Painting', 'Drawing', 'Digital', 'Video'] as const;

const RATIOS = ['Square (1:1)', 'Tall (3:4)', 'Wide (4:3)', 'Cinematic (16:9)', 'Story (9:16)'];
const AR = ['1/1', '3/4', '4/3', '16/9', '9/16'];
const TAGS = ['Nocturne', 'Texture', 'Portrait', 'Abstract', 'Gold', 'Ink'];
const IDEAS = ['I made this because…', 'I created it using…', 'I hope you feel…'];

// Curated Masterpiece Demo Assets
const PRESET_ART_IMAGES = [
  {
    name: 'Nocturnal Metamorphosis',
    src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    category: 'painting' as const,
    medium: 'Oil on Belgian Canvas',
    palette: ['#0f0f14', '#c9a875', '#382f25', '#e9dfd0', '#635340']
  },
  {
    name: 'Graphite Resonance',
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

// Color utilities matching the provided design
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
  // Modal Card Ref for custom events and shake animations
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const musicAudioInputRef = useRef<HTMLInputElement>(null);
  const musicCoverInputRef = useRef<HTMLInputElement>(null);
  const musicAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
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
  const [styleIndex, setStyleIndex] = useState<number>(2); // 0: Painting, 1: Drawing, 2: Digital, 3: Video
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

  // Poetry Specific Fields
  const [poetrySubtitle, setPoetrySubtitle] = useState<string>('From the Nocturne Fragments');
  const [authorSignature, setAuthorSignature] = useState<string>('— Atelier Member');

  // Initialize from props when opened
  useEffect(() => {
    if (isOpen) {
      // Remember previously focused element to return focus on close
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;

      // Lock scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Set category / format if provided
      if (initialCategory === 'music' || initialFormat?.includes('music') || initialFormat?.includes('song')) {
        setTypeIndex(0);
        setRatioIndex(0); // Square 1:1
      } else if (initialCategory === 'poetry' || initialFormat?.includes('poetry')) {
        setTypeIndex(1);
        setRatioIndex(1); // Tall 3:4
      } else if (initialFormat === 'integer art') {
        setTypeIndex(3);
        setMedium('Algorithmic Integer Canvas & Shader Code');
      } else if (initialCategory === 'video' || initialFormat?.includes('video') || initialFormat?.includes('motion')) {
        setTypeIndex(4);
        setStyleIndex(3);
        setRatioIndex(2); // Wide 4:3
      } else if (initialCategory === 'painting') {
        setTypeIndex(2);
        setStyleIndex(0);
      } else if (initialCategory === 'drawing') {
        setTypeIndex(2);
        setStyleIndex(1);
      } else {
        setTypeIndex(2);
        setStyleIndex(2);
      }

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, initialCategory, initialFormat]);

  // Clean up object URLs on close or unmount
  const revokeObjectUrls = useCallback(() => {
    createdObjectUrlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // ignore
      }
    });
    createdObjectUrlsRef.current = [];
  }, []);

  const handleClose = useCallback(() => {
    if (musicAudioPlayerRef.current) {
      musicAudioPlayerRef.current.pause();
    }
    revokeObjectUrls();
    onClose();

    // Return keyboard focus to the opening element
    setTimeout(() => {
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus();
      }
    }, 50);
  }, [onClose, revokeObjectUrls]);

  // Keyboard navigation & Esc key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Set media source safely
  const updateMediaSource = useCallback(
    (src: string, isVideoMedia: boolean, file?: File) => {
      setMediaSrc(src);
      setMediaFile(file || null);
      setIsVideo(isVideoMedia);
      if (file) {
        if (!title) {
          const autoTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setTitle(autoTitle);
        }
      }
      if (isVideoMedia) {
        setPalette(randPalette());
      } else {
        extractColors(src).then((p) => setPalette(p));
      }
    },
    [title]
  );

  // File upload handler
  const processUploadedFile = useCallback(
    (f: File) => {
      if (!f) return;
      if (f.size > 50 * 1024 * 1024) {
        showToast('That file is over 50 MB. Try a smaller one.');
        return;
      }
      if (!/^(image|video)\//.test(f.type) && !/\.(mp4|webm|mov|m4v|gif|jpg|jpeg|png|webp)$/i.test(f.name)) {
        showToast('Please choose an image, GIF or MP4.');
        return;
      }
      const isVid = f.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(f.name);
      const objUrl = URL.createObjectURL(f);
      createdObjectUrlsRef.current.push(objUrl);
      updateMediaSource(objUrl, isVid, f);
    },
    [showToast, updateMediaSource]
  );

  // Audio file upload handler (for music kind)
  const processAudioFile = useCallback(
    (f: File) => {
      if (!f) return;
      if (f.size > 50 * 1024 * 1024) {
        showToast('That audio file is over 50 MB. Try a smaller one.');
        return;
      }
      const objUrl = URL.createObjectURL(f);
      createdObjectUrlsRef.current.push(objUrl);
      setMusicAudioSrc(objUrl);
      if (!title) {
        setTitle(f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
      if (musicAudioPlayerRef.current) {
        musicAudioPlayerRef.current.src = objUrl;
        musicAudioPlayerRef.current.load();
      }
    },
    [showToast, title]
  );

  // Cover file upload handler (for music kind)
  const processCoverFile = useCallback(
    (f: File) => {
      if (!f) return;
      const objUrl = URL.createObjectURL(f);
      createdObjectUrlsRef.current.push(objUrl);
      setMusicCoverSrc(objUrl);
      extractColors(objUrl).then((p) => setPalette(p));
    },
    []
  );

  // Completeness percentage
  const readyPct = useMemo(() => {
    const hasMedia = typeIndex === 0 ? !!musicAudioSrc : !!mediaSrc;
    const hasTitle = !!title.trim();
    const hasMedium = !!medium.trim();
    const hasStory = story.trim().length > 10;
    const hasTags = tags.length > 0;
    return Math.round((100 * ((hasMedia ? 1 : 0) + (hasTitle ? 1 : 0) + (hasMedium ? 1 : 0) + (hasStory ? 1 : 0) + (hasTags ? 1 : 0))) / 5);
  }, [typeIndex, musicAudioSrc, mediaSrc, title, medium, story, tags]);

  // Validation before advancing steps
  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (typeIndex === 0 && !musicAudioSrc) {
        showToast('Add your music track first.');
        return false;
      }
      if (typeIndex !== 0 && !mediaSrc) {
        showToast('Add your artwork first. Try a sample if you like.');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!title.trim()) {
        showToast('Please give your piece a title.');
        setHasTitleError(true);
        if (modalRef.current) {
          modalRef.current.classList.remove('shake');
          void modalRef.current.offsetWidth;
          modalRef.current.classList.add('shake');
        }
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
    setIsVideo(false);
    setTitle('');
    setStory('');
    setTags([]);
    setUrlInput('');
    setHasTitleError(false);
    setIsSuccess(false);
    revokeObjectUrls();
    showToast('Cleared. Start fresh whenever you like.');
  };

  // Submit & Inaugurate to Sanctuary
  const handlePublish = async () => {
    const activeKind = TYPES[typeIndex][1];
    const activeStyle = STYLES[styleIndex];

    const isMusicTrack = typeIndex === 0;
    const hasMedia = isMusicTrack ? !!musicAudioSrc : !!mediaSrc;

    if (!hasMedia) {
      showToast('Add your artwork to publish.');
      if (modalRef.current) {
        modalRef.current.classList.remove('shake');
        void modalRef.current.offsetWidth;
        modalRef.current.classList.add('shake');
      }
      setStep(1);
      return;
    }

    if (!title.trim()) {
      showToast('Please give your piece a title.');
      setHasTitleError(true);
      if (modalRef.current) {
        modalRef.current.classList.remove('shake');
        void modalRef.current.offsetWidth;
        modalRef.current.classList.add('shake');
      }
      setStep(2);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Dispatch custom event per Requirement 3
      const publishDetail = {
        kind: activeKind,
        style: activeStyle,
        file: mediaFile,
        url: mediaFile ? '' : mediaSrc,
        title: title.trim(),
        medium: medium.trim(),
        dimensions: dims.trim(),
        year: year,
        aspect: RATIOS[ratioIndex],
        statement: story.trim(),
        palette: palette,
        tags: tags
      };

      if (modalRef.current) {
        modalRef.current.dispatchEvent(
          new CustomEvent('sanctuary:publish', {
            bubbles: true,
            detail: publishDetail
          })
        );
      }

      // 2. Upload file to Supabase if present
      let resolvedMediaUrl = mediaSrc.trim() || '/curatorial-masterpiece.svg';
      if (mediaFile) {
        try {
          const uploadedUrl = await uploadArtworkMediaToStorage(mediaFile);
          if (uploadedUrl) resolvedMediaUrl = uploadedUrl;
        } catch (storageErr) {
          console.warn('[UploadModal] Cloud storage upload fallback to local URL:', storageErr);
        }
      }

      // 3. Prepare Artist Object
      const artistObj = isGuest
        ? {
            id: `guest-${Date.now()}`,
            name: guestName.trim() || 'Guest Artist',
            handle: guestHandle.startsWith('@') ? guestHandle.trim() : `@${guestHandle.trim() || 'guest'}`,
            avatar: '/curatorial-masterpiece.svg',
            verified: false
          }
        : {
            id: currentUser.id,
            name: currentUser.name,
            handle: currentUser.handle,
            avatar: currentUser.avatar || '/curatorial-masterpiece.svg',
            verified: currentUser.verified ?? true
          };

      const newArtId = `art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const mappedAspect: AspectRatioType = ratioIndex === 0 ? 'square' : ratioIndex === 2 || ratioIndex === 3 ? 'wide' : 'tall';

      // 4. Build Artwork Object matching database schema
      let createdArtwork: Artwork;

      if (isMusicTrack) {
        const resolvedAudio = musicAudioSrc || '/audio/wsKhe5rTKw8.mp4';
        const resolvedCover = musicCoverSrc || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80';
        const trackTitle = title.trim();

        createdArtwork = {
          id: newArtId,
          title: trackTitle,
          category: 'music',
          artist: artistObj,
          mediaUrl: resolvedAudio,
          thumbnailUrl: resolvedCover,
          medium: `Original Master • ${musicGenre}`,
          dimensions: 'Master Vinyl Studio Recording',
          year: year,
          description: story.trim() || `Original musical composition "${trackTitle}" published in The Artisan's Quill sanctuary.`,
          tags: tags.length > 0 ? tags : ['Music', 'Original Song', musicGenre, 'Sanctuary Audio'],
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
            coverArtUrl: resolvedCover,
            album: musicAlbum.trim() || 'Atelier Master Sessions',
            durationSeconds: musicDurationSeconds || 215,
            duration: `${Math.floor((musicDurationSeconds || 215) / 60)}:${String((musicDurationSeconds || 215) % 60).padStart(2, '0')}`,
            genre: musicGenre.trim() || 'Original Composition',
            isOriginalComposition: true,
            composer: artistObj.name,
            key: musicKey.trim(),
            bpm: musicBpm.trim(),
            lyrics: musicLyrics.trim() || story.trim()
          }
        };

        // Automatically register to the floating sanctuary background ambience player queue
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
        // Poetry Card
        const stanzas = story
          .split(/\n\s*\n/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        createdArtwork = {
          id: newArtId,
          title: title.trim(),
          category: 'poetry',
          artist: artistObj,
          mediaUrl: resolvedMediaUrl,
          thumbnailUrl: resolvedMediaUrl,
          medium: medium.trim() || 'Poetic Lyric & Typography Card',
          dimensions: dims.trim() || 'Aesthetic Card',
          year: year,
          description: story.trim() || 'Curated poetry card crafted in The Artisan\'s Quill.',
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
            stanzas: stanzas.length > 0 ? stanzas : [story || 'Silence speaks in verse.'],
            theme: 'obsidian' as PoetryTheme,
            fontStyle: 'cormorant' as PoetryFont,
            alignment: 'center',
            readingTimeMinutes: Math.max(1, Math.ceil((story || '').split(/\s+/).length / 70)),
            authorSignature: authorSignature.trim() || (isGuest ? `— ${guestName.trim()}` : '— Atelier Poet'),
            subtitle: poetrySubtitle.trim()
          }
        };
      } else {
        // Visual Arts: Digital Art, Integer Art, Motion Loop, Painting, Drawing
        const isMotionVideo = typeIndex === 4 || styleIndex === 3 || isVideo || resolvedMediaUrl.match(/\.(mp4|webm|mov|m4v|ogv)/i) != null;
        const resolvedCategory: ArtCategory = isMotionVideo
          ? 'video'
          : styleIndex === 0
          ? 'painting'
          : styleIndex === 1
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
              : 'Artist piece published in the sanctuary.'),
          tags: tags.length > 0 ? tags : [isMotionVideo ? 'VIDEO' : resolvedCategory.toUpperCase(), 'Atelier Collection'],
          likesCount: 0,
          viewsCount: 1,
          savesCount: 0,
          createdAt: new Date().toISOString(),
          aspectRatio: mappedAspect,
          colorPalette: palette,
          isLiked: false,
          isSaved: false,
          featured: false,
          videoData: isMotionVideo
            ? {
                duration: '0:30 (Loop)',
                isLoop: true,
                resolution: '4K Cinema',
                hasAudio: true
              }
            : undefined
        };
      }

      // Execute parent callback
      onSuccess(createdArtwork);

      // Trigger success view
      setIsSuccess(true);
    } catch (err: any) {
      console.error('[UploadModal] Inauguration failed:', err);
      showToast('Inauguration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentDisplayMedia = typeIndex === 0 ? musicCoverSrc : mediaSrc;
  const currentMediaIsVideo = typeIndex === 0 ? false : isVideo;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      {/* Toast Notification */}
      <div id="qu-toast" className={isToastActive ? 'on' : ''} role="status">
        {toastMessage}
      </div>

      {/* Hidden Audio Player for In-Modal Preview */}
      <audio
        ref={musicAudioPlayerRef}
        src={musicAudioSrc}
        onEnded={() => setIsAudioPlaying(false)}
        onLoadedMetadata={() => {
          if (musicAudioPlayerRef.current?.duration) {
            setMusicDurationSeconds(Math.round(musicAudioPlayerRef.current.duration));
          }
        }}
      />

      {/* Modal Card */}
      <div ref={modalRef} className="qu my-auto">
        {/* Success Overlay */}
        {isSuccess && (
          <div className="ok" role="status">
            <div>
              <b>✦</b>
              <h2>Welcome to the Sanctuary</h2>
              <p>
                <i>{title}</i> is now live for the world to see.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={handleClose}
                >
                  Explore Sanctuary
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={handleReset}
                >
                  Share another piece
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Header */}
        <header className="mh">
          <div className="ic">🎨</div>
          <div>
            <h2 id="upload-modal-title">Share your work</h2>
            <p>Four calm steps. No technical knowledge needed.</p>
          </div>
          <button
            type="button"
            className="x"
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        {/* Modal Body & Step Navigation */}
        <div className="mb">
          <nav className="stp">
            {['Choose', 'Artwork', 'Story', 'Finish'].map((stName, idx) => (
              <button
                key={stName}
                type="button"
                className={`${idx === step ? 'on' : ''} ${idx < step ? 'dn' : ''}`}
                onClick={() => {
                  if (idx <= step) setStep(idx);
                }}
              >
                {idx + 1}. {stName}
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
                      if (idx === 0) setRatioIndex(0); // Square 1:1
                      if (idx === 4) {
                        setStyleIndex(3); // Video
                        setIsVideo(true);
                        setRatioIndex(2); // Wide
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
                      if (idx === 3) setIsVideo(true);
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
                        placeholder="e.g. @elena.art"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* STEP 1: ARTWORK */}
          <div hidden={step !== 1}>
            <section className="blk">
              <h3>Add your artwork</h3>
              <p className="hint">
                {typeIndex === 0
                  ? 'Add your master audio composition and album cover artwork.'
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
                                musicAudioInputRef.current?.click();
                              }}
                            >
                              Replace Audio
                            </button>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  <div>
                    <h4 style={{ margin: '12px 0 8px' }}>Album Cover Art (1:1 Square)</h4>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '90px',
                          height: '90px',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          border: '2px solid var(--line)',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                        onClick={() => musicCoverInputRef.current?.click()}
                      >
                        <img
                          src={musicCoverSrc}
                          alt="Cover Art"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
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
              ) : (
                /* Visual / Video / Poetry Artwork Upload */
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
                      if (e.dataTransfer.files[0]) processUploadedFile(e.dataTransfer.files[0]);
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept="image/*,video/mp4"
                      onChange={(e) => {
                        if (e.target.files?.[0]) processUploadedFile(e.target.files[0]);
                      }}
                    />
                    <div className="dzin">
                      <i>⤒</i>
                      <b>Drop your file here</b>
                      <span>or click to browse your device</span>
                    </div>
                    <div className="pv">
                      {mediaSrc && (
                        <>
                          {isVideo ? (
                            <video src={mediaSrc} autoPlay loop muted playsInline />
                          ) : (
                            <img src={mediaSrc} alt="Artwork preview" />
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
                          const isVid = preset.category === 'video';
                          updateMediaSource(preset.src, isVid);
                          setTitle(preset.name);
                          setMedium(preset.medium);
                          setPalette(preset.palette);
                          if (preset.category === 'painting') setStyleIndex(0);
                          else if (preset.category === 'drawing') setStyleIndex(1);
                          else if (preset.category === 'digital') setStyleIndex(2);
                          else if (preset.category === 'video') setStyleIndex(3);
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
              <h3>Name your piece</h3>
              <p className="hint">Only the title is required. The rest helps people understand your work.</p>

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
                  <label>Made with</label>
                  <input
                    placeholder="e.g. Oil on canvas, Procreate"
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                  />
                </div>
                <div className="fld">
                  <label>Size</label>
                  <input
                    placeholder="e.g. 120 × 160 cm"
                    value={dims}
                    onChange={(e) => setDims(e.target.value)}
                  />
                </div>
                <div className="fld">
                  <label>Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || 2026)}
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

              {/* Music specific details */}
              {typeIndex === 0 && (
                <div className="g2" style={{ marginBottom: '18px' }}>
                  <div className="fld" style={{ marginBottom: 0 }}>
                    <label>Album / Anthology</label>
                    <input
                      placeholder="e.g. Sanctuary Nocturnes Vol. I"
                      value={musicAlbum}
                      onChange={(e) => setMusicAlbum(e.target.value)}
                    />
                  </div>
                  <div className="fld" style={{ marginBottom: 0 }}>
                    <label>Genre / Style</label>
                    <input
                      placeholder="e.g. Neo-Classical / Ambient Piano"
                      value={musicGenre}
                      onChange={(e) => setMusicGenre(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Poetry specific subtitle */}
              {typeIndex === 1 && (
                <div className="g2" style={{ marginBottom: '18px' }}>
                  <div className="fld" style={{ marginBottom: 0 }}>
                    <label>Collection / Subtitle</label>
                    <input
                      placeholder="e.g. From 'Monasteries of the Rain'"
                      value={poetrySubtitle}
                      onChange={(e) => setPoetrySubtitle(e.target.value)}
                    />
                  </div>
                  <div className="fld" style={{ marginBottom: 0 }}>
                    <label>Author Signature</label>
                    <input
                      placeholder="— Elena Vance, 2026"
                      value={authorSignature}
                      onChange={(e) => setAuthorSignature(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </section>

            <section className="blk">
              <h3>Tell its story</h3>
              <p className="hint">
                {typeIndex === 1
                  ? 'Enter your poetry stanzas or creative reflection.'
                  : 'A few honest sentences are perfect. Not sure where to start? Tap an idea.'}
              </p>
              <textarea
                maxLength={600}
                placeholder={
                  typeIndex === 1
                    ? 'Enter your lines here...\n\nSeparate each stanza with a blank line.'
                    : 'What did you feel, or want others to feel, when making this?'
                }
                value={story}
                onChange={(e) => setStory(e.target.value)}
              />
              <span className="cnt">{story.length} / 600</span>
              <div className="chips sm">
                {IDEAS.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    className="chip"
                    onClick={() => {
                      const suffix = story && !/\s$/.test(story) ? ' ' : '';
                      setStory((prev) => prev + suffix + idea + ' ');
                    }}
                  >
                    + {idea}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* STEP 3: FINISH & MUSEUM FRAME */}
          <div hidden={step !== 3}>
            <div className="fin">
              {/* Museum Frame Preview */}
              <aside className="gal">
                <div className="frame">
                  <div className="mat">
                    <div className="art" style={{ aspectRatio: AR[ratioIndex] }}>
                      {currentDisplayMedia ? (
                        currentMediaIsVideo ? (
                          <video src={currentDisplayMedia} autoPlay loop muted playsInline />
                        ) : (
                          <img src={currentDisplayMedia} alt={title || 'Artwork'} />
                        )
                      ) : (
                        <span>Your artwork<br />appears here</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="plate">
                  <b>{title || 'Untitled piece'}</b>
                  <span>
                    {[TYPES[typeIndex][1], STYLES[styleIndex], medium, year].filter(Boolean).join(' · ')}
                  </span>
                  <div className="pdots">
                    {palette.map((h, i) => (
                      <i key={i} style={{ background: h }} />
                    ))}
                  </div>
                  <div className="pbar">
                    <i style={{ width: `${readyPct}%` }} />
                  </div>
                  <span style={{ display: 'block', marginTop: '6px' }}>{readyPct}% complete</span>
                </div>
              </aside>

              {/* Final Touches: Colors & Tags */}
              <section className="blk">
                <h3>Final touches</h3>
                <p className="hint">This is how your piece will hang in the Sanctuary.</p>

                <h4>Colors found in your work (picked for you)</h4>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div className="pal">
                    {palette.length > 0 ? (
                      palette.map((h) => (
                        <button
                          key={h}
                          type="button"
                          className="sw"
                          title={`${h} (tap to copy)`}
                          style={{ background: h }}
                          onClick={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(h);
                              showToast(`${h} copied`);
                            }
                          }}
                        />
                      ))
                    ) : (
                      <span className="hint" style={{ margin: 0 }}>
                        Colors appear after you add artwork.
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="ref"
                    title="Find new colors"
                    onClick={() => {
                      if (!currentDisplayMedia) {
                        showToast('Add your artwork first.');
                        return;
                      }
                      if (currentMediaIsVideo) {
                        setPalette(randPalette());
                      } else {
                        extractColors(currentDisplayMedia, true).then((p) => setPalette(p));
                      }
                    }}
                  >
                    ↻
                  </button>
                </div>

                <h4>Tags help people discover your work</h4>
                <div className="tgbox">
                  {tags.map((t, i) => (
                    <span
                      key={t + i}
                      className="tg"
                      onClick={() => setTags((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      {t} ✕
                    </span>
                  ))}
                  <input
                    placeholder="Type a tag, press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        const v = tagInput.trim().replace(/,/g, '');
                        if (v && !tags.includes(v)) {
                          setTags((prev) => [...prev, v]);
                        }
                        setTagInput('');
                      }
                    }}
                  />
                </div>
                <div className="chips sm">
                  {TAGS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className="chip"
                      onClick={() => {
                        if (!tags.includes(t)) {
                          setTags((prev) => [...prev, t]);
                        }
                      }}
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </section>
            </div>
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
      </div>
    </div>
  );
};
