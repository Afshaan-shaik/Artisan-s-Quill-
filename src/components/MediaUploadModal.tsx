import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Feather,
  Palette,
  PenTool,
  Image as ImageIcon,
  Film,
  Sparkles,
  Check,
  RefreshCw,
  Music,
  Disc3,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  FileAudio
} from 'lucide-react';
import { ArtCategory, Artwork, PoetryTheme, PoetryFont, AspectRatioType } from '../types';
import { PoetryCard } from './PoetryCard';
import { GalleryService } from '../services/api';
import { uploadArtworkMediaToStorage } from '../services/supabaseClient';
import { YouTubeVideoPlayer } from './YouTubeVideoPlayer';
import { registerCommunityTrack } from '../services/musicEngine';
import { MusicArtworkCard } from './MusicArtworkCard';

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newArtwork: Artwork) => void;
  initialCategory?: ArtCategory;
  initialFormat?: string;
}

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
    lyrics: 'Soft falls the lantern glow upon the keys,\nA wandering cadence adrift upon the breeze.\nNo words required when the shadows speak in chord,\nA quiet reverie that time and silence hoard.'
  },
  {
    title: 'Elysian Pulse (M-Remix Edit)',
    artist: 'Kaelen Vance',
    audioUrl: '/audio/M-Remix.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    album: 'Analog Monoliths',
    genre: 'Electronic Ambient / Modular Lo-Fi',
    durationSeconds: 184,
    key: 'F Minor',
    bpm: '96 BPM',
    lyrics: 'Rhythms of obsidian, pulses of gold,\nStories in low frequencies untold.'
  },
  {
    title: 'Derry Solitude Theme',
    artist: 'Julian Thorne',
    audioUrl: '/audio/qwTop2qs1tE.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
    album: 'Highland Nocturnes',
    genre: 'Cinematic Orchestral',
    durationSeconds: 115,
    key: 'D Minor',
    bpm: '65 BPM',
    lyrics: 'Strings weep upon the desolate moor,\nA distant bell tolls by the mist-shrouded shore.'
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

const PRESET_ART_IMAGES = [
  {
    title: 'Nocturnal Metamorphosis in Oil',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    category: 'painting' as const,
    medium: 'Oil on Belgian Canvas',
    palette: ['#0f0f14', '#c9a875', '#382f25', '#e9dfd0', '#635340']
  },
  {
    title: 'Graphite Resonance No. IX',
    url: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1200&q=80',
    category: 'drawing' as const,
    medium: 'Compressed Charcoal & Graphite',
    palette: ['#121317', '#8b8e99', '#3b3d45', '#d4d6dc', '#222329']
  },
  {
    title: 'Cybernetic Monolith in Shader Code',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
    category: 'digital' as const,
    medium: 'Generative Neural Shader',
    palette: ['#0c0d1c', '#a855f7', '#ec4899', '#312e81', '#fbcfe8']
  },
  {
    title: 'Fluid Obsidian Suspension',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    category: 'video' as const,
    medium: '4K Volumetric Fluid Simulation',
    palette: ['#090a0f', '#eab308', '#262626', '#ca8a04', '#fafafa']
  }
];

export const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialCategory = 'poetry',
  initialFormat
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'poetry' | 'music'>(
    initialCategory === 'music' || initialFormat?.includes('music') || initialFormat?.includes('song')
      ? 'music'
      : initialFormat?.includes('poetry') || initialCategory === 'poetry'
      ? 'poetry'
      : 'visual'
  );
  const [activeFormat, setActiveFormat] = useState<string>(
    initialFormat ||
      (initialCategory === 'music'
        ? 'original song'
        : initialCategory === 'poetry'
        ? 'poetry card'
        : initialCategory === 'digital'
        ? 'digital art'
        : 'digital art')
  );

  // Common fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [tagsInput, setTagsInput] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(
    initialCategory === 'music' ? 'square' : 'tall'
  );

  // Visual art fields
  const [visualCategory, setVisualCategory] = useState<'painting' | 'drawing' | 'digital' | 'video'>(
    initialCategory === 'painting' || initialCategory === 'drawing' || initialCategory === 'video'
      ? initialCategory
      : 'digital'
  );
  const [medium, setMedium] = useState(
    initialCategory === 'music'
      ? 'Original Master • Neo-Classical / Ambient Piano'
      : initialFormat === 'integer art'
      ? 'Algorithmic Integer Canvas & Shader Code'
      : 'Generative Shader & 3D Render'
  );
  const [dimensions, setDimensions] = useState('120 x 160 cm');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [paletteHexes, setPaletteHexes] = useState<string[]>([
    '#111218',
    '#c9a875',
    '#4b3c2d',
    '#ded7ca',
    '#705f4c'
  ]);
  const [videoDuration, setVideoDuration] = useState('0:30 (Loop)');

  // Poetry specific fields
  const [poetryRawText, setPoetryRawText] = useState(
    'The night is a crucible of heavy water,\nslowly cooling into morning obsidian.\n\nWe count the heartbeats left upon the shore,\nbefore the tide reclaims the quiet stone.'
  );
  const [poetrySubtitle, setPoetrySubtitle] = useState('From the Nocturne Fragments');
  const [poetryTheme, setPoetryTheme] = useState<PoetryTheme>('obsidian');
  const [poetryFont, setPoetryFont] = useState<PoetryFont>('cormorant');
  const [poetryAlignment, setPoetryAlignment] = useState<'left' | 'center'>('center');
  const [authorSignature, setAuthorSignature] = useState('— Atelier Member');
  const [guestName, setGuestName] = useState('Guest Artist');
  const [guestHandle, setGuestHandle] = useState('@guest_artist');

  // Music Studio fields
  const [musicAudioUrl, setMusicAudioUrl] = useState('/audio/wsKhe5rTKw8.mp4');
  const [musicCoverUrl, setMusicCoverUrl] = useState(
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80'
  );
  const [musicAlbum, setMusicAlbum] = useState('Sanctuary Nocturnes Vol. I');
  const [musicGenre, setMusicGenre] = useState('Neo-Classical / Ambient Piano');
  const [musicLyrics, setMusicLyrics] = useState(
    'Soft falls the lantern glow upon the keys,\nA wandering cadence adrift upon the breeze.\nNo words required when the shadows speak in chord,\nA quiet reverie that time and silence hoard.'
  );
  const [musicBpm, setMusicBpm] = useState('72 BPM');
  const [musicKey, setMusicKey] = useState('C# Minor');
  const [musicDurationSeconds, setMusicDurationSeconds] = useState(215);
  const [musicAudioPlaying, setMusicAudioPlaying] = useState(false);
  const [musicAudioTime, setMusicAudioTime] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const musicAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const musicAudioInputRef = useRef<HTMLInputElement>(null);
  const musicCoverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFormat) {
      setActiveFormat(initialFormat);
      if (initialFormat === 'poetry session' || initialFormat === 'poetry card') {
        setActiveTab('poetry');
      } else if (initialFormat === 'original song' || initialFormat.includes('music')) {
        setActiveTab('music');
        setAspectRatio('square');
      } else {
        setActiveTab('visual');
        setVisualCategory('digital');
        if (initialFormat === 'integer art') {
          setMedium('Algorithmic Integer Canvas & Shader Code');
        } else {
          setMedium('Generative Shader & 3D Render');
        }
      }
    } else if (initialCategory === 'poetry') {
      setActiveTab('poetry');
      setActiveFormat('poetry card');
    } else if (initialCategory === 'music') {
      setActiveTab('music');
      setActiveFormat('original song');
      setAspectRatio('square');
      if (!title) setTitle('Nocturne in C-sharp Minor');
    } else if (initialCategory !== 'all') {
      setActiveTab('visual');
      setVisualCategory(initialCategory as 'painting' | 'drawing' | 'digital' | 'video');
      setActiveFormat(initialCategory === 'digital' ? 'digital art' : `${initialCategory} art`);
    }
  }, [initialCategory, initialFormat]);

  if (!isOpen) return null;

  // Auto-split poetry stanzas by blank line
  const parsedStanzas = poetryRawText
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingMedia(true);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
      // Auto-detect video files (MP4, WebM, MOV, etc.)
      if (file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|m4v|ogv)$/i)) {
        setVisualCategory('video');
        if (!medium) setMedium('4K Volumetric Fluid Dynamics & Motion Loop');
        setAspectRatio('wide');
      }
      const publicUrl = await uploadArtworkMediaToStorage(file);
      setMediaUrl(publicUrl);
    } catch (err) {
      console.warn('[MediaUploadModal] Upload error, using data URI fallback:', err);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_ART_IMAGES[0]) => {
    setMediaUrl(preset.url);
    setTitle(preset.title);
    setVisualCategory(preset.category);
    setMedium(preset.medium);
    setPaletteHexes(preset.palette);
  };

  const handleMusicAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingMedia(true);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
      const publicUrl = await uploadArtworkMediaToStorage(file);
      setMusicAudioUrl(publicUrl);
      if (musicAudioPlayerRef.current) {
        musicAudioPlayerRef.current.src = publicUrl;
        musicAudioPlayerRef.current.load();
      }
    } catch (err) {
      console.warn('[MediaUploadModal] Audio upload fallback to blob:', err);
      const blobUrl = URL.createObjectURL(file);
      setMusicAudioUrl(blobUrl);
      if (musicAudioPlayerRef.current) {
        musicAudioPlayerRef.current.src = blobUrl;
      }
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleMusicCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingMedia(true);
      const publicUrl = await uploadArtworkMediaToStorage(file);
      setMusicCoverUrl(publicUrl);
    } catch (err) {
      console.warn('[MediaUploadModal] Cover upload fallback to blob:', err);
      const blobUrl = URL.createObjectURL(file);
      setMusicCoverUrl(blobUrl);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleSelectMusicPreset = (preset: typeof PRESET_MUSIC_TRACKS[0]) => {
    setTitle(preset.title);
    setMusicAudioUrl(preset.audioUrl);
    setMusicCoverUrl(preset.coverUrl);
    setMusicAlbum(preset.album);
    setMusicGenre(preset.genre);
    setMusicDurationSeconds(preset.durationSeconds);
    setMusicKey(preset.key);
    setMusicBpm(preset.bpm);
    if (preset.lyrics) setMusicLyrics(preset.lyrics);
    if (musicAudioPlayerRef.current) {
      musicAudioPlayerRef.current.src = preset.audioUrl;
      setMusicAudioPlaying(false);
      setMusicAudioTime(0);
    }
  };

  const toggleMusicAudioPlayback = () => {
    if (!musicAudioPlayerRef.current) return;
    if (musicAudioPlaying) {
      musicAudioPlayerRef.current.pause();
      setMusicAudioPlaying(false);
    } else {
      musicAudioPlayerRef.current
        .play()
        .then(() => setMusicAudioPlaying(true))
        .catch((err) => console.warn('Audio playback error:', err));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const isGuest = activeUser.id === 'guest';
    const artistObj = isGuest
      ? {
          id: `guest-${Date.now()}`,
          name: guestName.trim() || 'Guest Artist',
          handle: guestHandle.startsWith('@') ? guestHandle.trim() : `@${guestHandle.trim() || 'guest'}`,
          avatar: '/curatorial-masterpiece.svg',
          verified: false
        }
      : {
          id: activeUser.id,
          name: activeUser.name,
          handle: activeUser.handle,
          avatar: activeUser.avatar || '/curatorial-masterpiece.svg',
          verified: activeUser.verified ?? true
        };

    const newArtId = `art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    if (activeTab === 'poetry') {
      const poetryArtwork: Artwork = {
        id: newArtId,
        title: title.trim(),
        category: 'poetry',
        artist: artistObj,
        mediaUrl: mediaUrl.trim() || '/curatorial-masterpiece.svg',
        thumbnailUrl: mediaUrl.trim() || '/curatorial-masterpiece.svg',
        medium: 'Poetic Lyric & Typography Card',
        dimensions: 'Aesthetic Card',
        year: year,
        description: description.trim() || 'Curated poetry card crafted in The Artisan\'s Quill.',
        tags: tags.length > 0 ? tags : ['Poetry', 'Lyric Verse', 'Atelier'],
        likesCount: 0,
        viewsCount: 1,
        savesCount: 0,
        createdAt: new Date().toISOString(),
        aspectRatio: 'portrait',
        isLiked: false,
        isSaved: false,
        featured: false,
        colorPalette:
          poetryTheme === 'vellum'
            ? ['#1c1813', '#cbb084', '#3d3121', '#f3ebd9']
            : poetryTheme === 'midnight'
            ? ['#0f121a', '#9bb4d0', '#25354e', '#e3ecf5']
            : poetryTheme === 'emerald'
            ? ['#0d1712', '#52b788', '#1b3b2c', '#d8f3dc']
            : poetryTheme === 'crimson'
            ? ['#1c0c10', '#df526b', '#481720', '#fad5dc']
            : ['#12141c', '#c9a875', '#333b4d', '#f0f3fa'],
        poetryContent: {
          stanzas: parsedStanzas.length > 0 ? parsedStanzas : ['Silence speaks in verse.'],
          theme: poetryTheme,
          fontStyle: poetryFont,
          alignment: poetryAlignment,
          readingTimeMinutes: Math.max(1, Math.ceil(poetryRawText.split(/\s+/).length / 70)),
          authorSignature: authorSignature.trim() || (isGuest ? `— ${guestName.trim() || 'Guest Poet'}` : '— Atelier Poet'),
          subtitle: poetrySubtitle.trim()
        }
      };
      onSuccess(poetryArtwork);
    } else if (activeTab === 'music') {
      const resolvedAudioUrl = musicAudioUrl.trim() || '/audio/wsKhe5rTKw8.mp4';
      const resolvedCoverUrl =
        musicCoverUrl.trim() ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80';
      const trackTitle = title.trim() || 'Untitled Original Master';

      const musicArtwork: Artwork = {
        id: newArtId,
        title: trackTitle,
        category: 'music',
        artist: artistObj,
        mediaUrl: resolvedAudioUrl,
        thumbnailUrl: resolvedCoverUrl,
        medium: `Original Master • ${musicGenre}`,
        dimensions: 'Master Vinyl Studio Recording',
        year: year,
        description:
          description.trim() ||
          `Original musical composition "${trackTitle}" published in The Artisan's Quill sanctuary.`,
        tags: tags.length > 0 ? tags : ['Music', 'Original Song', musicGenre, 'Sanctuary Audio'],
        likesCount: 0,
        viewsCount: 1,
        savesCount: 0,
        createdAt: new Date().toISOString(),
        aspectRatio: 'square',
        isLiked: false,
        isSaved: false,
        featured: false,
        colorPalette: paletteHexes,
        musicData: {
          audioUrl: resolvedAudioUrl,
          coverArtUrl: resolvedCoverUrl,
          album: musicAlbum.trim() || 'Atelier Master Sessions',
          durationSeconds: musicDurationSeconds || 215,
          duration: `${Math.floor((musicDurationSeconds || 215) / 60)}:${String(
            (musicDurationSeconds || 215) % 60
          ).padStart(2, '0')}`,
          genre: musicGenre.trim() || 'Original Composition',
          isOriginalComposition: true,
          composer: artistObj.name,
          key: musicKey.trim(),
          bpm: musicBpm.trim(),
          lyrics: musicLyrics.trim()
        }
      };

      // Automatically register to the floating sanctuary background ambience player queue!
      registerCommunityTrack({
        id: newArtId,
        title: trackTitle,
        artistName: artistObj.name,
        audioUrl: resolvedAudioUrl,
        coverUrl: resolvedCoverUrl,
        album: musicAlbum.trim() || 'Atelier Master Sessions',
        genre: musicGenre.trim() || 'Original Composition',
        durationSeconds: musicDurationSeconds || 215
      });

      onSuccess(musicArtwork);
      return;
    } else {
      const resolvedMediaUrl = mediaUrl.trim() || '/curatorial-masterpiece.svg';

      const isVideoFinal = visualCategory === 'video' || resolvedMediaUrl.match(/\.(mp4|webm|mov|m4v|ogv)/i) != null;

      const visualArtwork: Artwork = {
        id: newArtId,
        title: title.trim(),
        category: isVideoFinal ? 'video' : visualCategory,
        artist: artistObj,
        mediaUrl: resolvedMediaUrl,
        thumbnailUrl: resolvedMediaUrl,
        dimensions: dimensions.trim() || (isVideoFinal ? '4K Cinema (3840 x 2160)' : 'Original Canvas'),
        medium: medium.trim() || (isVideoFinal ? '4K Volumetric Fluid Dynamics & Motion Loop' : activeFormat === 'integer art' ? 'Algorithmic Integer Canvas & Shader Code' : 'Generative Shader & 3D Render'),
        year: year,
        description: description.trim() || (isVideoFinal ? 'A curated motion cinema loop in The Artisan\'s Quill sanctuary.' : 'Artist piece published in the sanctuary.'),
        tags: tags.length > 0 ? tags : [isVideoFinal ? 'VIDEO' : visualCategory.toUpperCase(), 'Atelier Collection'],
        likesCount: 0,
        viewsCount: 1,
        savesCount: 0,
        createdAt: new Date().toISOString(),
        aspectRatio: aspectRatio || (isVideoFinal ? 'wide' : 'tall'),
        colorPalette: paletteHexes,
        isLiked: false,
        isSaved: false,
        featured: false,
        videoData:
          isVideoFinal
            ? {
                duration: videoDuration || '0:30 (Loop)',
                isLoop: true,
                resolution: '4K Cinema',
                hasAudio: true
              }
            : undefined
      };
      onSuccess(visualArtwork);
    }
  };

  // Mock artwork object for live poetry preview
  const activeUser = GalleryService.getCurrentUser();
  const livePreviewArtwork: Artwork = {
    id: 'preview-artwork',
    title: title || 'Title of Your Verse',
    artist: {
      id: activeUser.id !== 'guest' ? activeUser.id : 'preview-artist',
      name: activeUser.id !== 'guest' ? activeUser.name : 'Atelier Poet',
      handle: activeUser.id !== 'guest' ? activeUser.handle : '@poet',
      avatar: activeUser.avatar || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      verified: true
    },
    category: 'poetry',
    mediaUrl: '',
    year,
    description: description || 'Live preview',
    tags: ['Preview'],
    likesCount: 0,
    viewsCount: 0,
    savesCount: 0,
    createdAt: new Date().toISOString(),
    aspectRatio: 'portrait',
    poetryContent: {
      stanzas: parsedStanzas.length > 0 ? parsedStanzas : ['Enter your poem lines in the composer to the left...'],
      theme: poetryTheme,
      fontStyle: poetryFont,
      alignment: poetryAlignment,
      readingTimeMinutes: Math.max(1, Math.ceil(poetryRawText.split(/\s+/).length / 70)),
      authorSignature: authorSignature || '— Elena Vance',
      subtitle: poetrySubtitle || 'Drafting Verse'
    }
  };

  const liveMusicPreviewArtwork: Artwork = {
    id: 'preview-music-artwork',
    title: title.trim() || 'Nocturne in C-sharp Minor',
    artist: {
      id: activeUser.id !== 'guest' ? activeUser.id : 'preview-artist',
      name: activeUser.id !== 'guest' ? activeUser.name : guestName || 'Atelier Musician',
      handle: activeUser.id !== 'guest' ? activeUser.handle : guestHandle || '@musician',
      avatar: activeUser.avatar || '/curatorial-masterpiece.svg',
      verified: true
    },
    category: 'music',
    mediaUrl: musicAudioUrl,
    thumbnailUrl: musicCoverUrl,
    year,
    description: description || 'Master recording preview',
    tags: ['Music', 'Original Song', musicGenre],
    likesCount: 0,
    viewsCount: 0,
    savesCount: 0,
    createdAt: new Date().toISOString(),
    aspectRatio: 'square',
    colorPalette: paletteHexes,
    musicData: {
      audioUrl: musicAudioUrl,
      coverArtUrl: musicCoverUrl,
      album: musicAlbum || 'Atelier Master Sessions',
      durationSeconds: musicDurationSeconds || 215,
      duration: `${Math.floor((musicDurationSeconds || 215) / 60)}:${String(
        (musicDurationSeconds || 215) % 60
      ).padStart(2, '0')}`,
      genre: musicGenre || 'Original Composition',
      isOriginalComposition: true,
      composer: activeUser.id !== 'guest' ? activeUser.name : guestName || 'Atelier Musician',
      key: musicKey,
      bpm: musicBpm,
      lyrics: musicLyrics
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      {/* Hidden Audio Player for In-Modal Preview */}
      <audio
        ref={musicAudioPlayerRef}
        src={musicAudioUrl}
        onTimeUpdate={() => {
          if (musicAudioPlayerRef.current) {
            setMusicAudioTime(musicAudioPlayerRef.current.currentTime);
          }
        }}
        onEnded={() => setMusicAudioPlaying(false)}
        onLoadedMetadata={() => {
          if (musicAudioPlayerRef.current && musicAudioPlayerRef.current.duration) {
            setMusicDurationSeconds(Math.round(musicAudioPlayerRef.current.duration));
          }
        }}
      />

      <div
        id="media-upload-modal"
        className="relative w-full max-w-5xl bg-[#11131a] border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[96vh] sm:max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3.5 sm:py-5 border-b border-white/10 bg-[#151822] gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-[#c9a875]/15 border border-[#c9a875]/30 text-[#c9a875] shrink-0">
              {activeTab === 'poetry' ? (
                <Feather className="w-5 h-5" />
              ) : activeTab === 'music' ? (
                <Disc3 className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
              ) : (
                <Palette className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-serif-display font-semibold text-white truncate">
                {activeTab === 'poetry'
                  ? 'Poetry Studio & Card Formatter'
                  : activeTab === 'music'
                  ? 'Original Music Studio & Vinyl Press'
                  : 'Exhibition Media Upload'}
              </h2>
              <p className="text-[11px] sm:text-xs text-white/50 font-mono-code truncate hidden sm:block">
                {activeTab === 'poetry'
                  ? 'Automatically format stanzas into high-end aesthetic presentation cards'
                  : activeTab === 'music'
                  ? 'Master, press, and broadcast original musical works to the sanctuary gallery'
                  : 'Submit paintings, fine charcoal drawings, digital renders, and video loops'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* 5 Format Switcher Buttons */}
            <div className="flex items-center overflow-x-auto no-scrollbar touch-scroll p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-mono-code gap-1 max-w-[calc(100%-48px)] sm:max-w-none">
              <button
                type="button"
                id="modal-tab-music-track"
                onClick={() => {
                  setActiveTab('music');
                  setActiveFormat('original song');
                  setAspectRatio('square');
                  if (!title) setTitle('Nocturne in C-sharp Minor');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'music'
                    ? 'bg-[#c9a875] text-[#0d0e12] font-semibold shadow-md shadow-[#c9a875]/20'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Disc3 className="w-3.5 h-3.5" />
                Original Song
              </button>
              <button
                type="button"
                id="modal-tab-poetry-session"
                onClick={() => {
                  setActiveTab('poetry');
                  setActiveFormat('poetry session');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'poetry' && activeFormat === 'poetry session'
                    ? 'bg-[#c9a875] text-[#0d0e12] font-semibold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Feather className="w-3.5 h-3.5" />
                Poetry Session
              </button>
              <button
                type="button"
                id="modal-tab-poetry-card"
                onClick={() => {
                  setActiveTab('poetry');
                  setActiveFormat('poetry card');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'poetry' && activeFormat === 'poetry card'
                    ? 'bg-[#c9a875] text-[#0d0e12] font-semibold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Feather className="w-3.5 h-3.5" />
                Poetry Card
              </button>
              <button
                type="button"
                id="modal-tab-digital-art"
                onClick={() => {
                  setActiveTab('visual');
                  setVisualCategory('digital');
                  setActiveFormat('digital art');
                  setMedium('Generative Shader & 3D Render');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'visual' && activeFormat === 'digital art'
                    ? 'bg-[#c9a875] text-[#0d0e12] font-semibold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Digital Art
              </button>
              <button
                type="button"
                id="modal-tab-integer-art"
                onClick={() => {
                  setActiveTab('visual');
                  setVisualCategory('digital');
                  setActiveFormat('integer art');
                  setMedium('Algorithmic Integer Canvas & Shader Code');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'visual' && activeFormat === 'integer art'
                    ? 'bg-[#c9a875] text-[#0d0e12] font-semibold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Integer Art
              </button>
            </div>

            <button
              id="close-upload-modal"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Close upload modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'visual' ? (
            /* Visual Art Form */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Media & File Upload */}
              <div className="lg:col-span-6 space-y-5">
                {activeUser.id === 'guest' && (
                  <div className="p-3.5 rounded-xl bg-[#c9a875]/10 border border-[#c9a875]/30 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono-code text-[#c9a875] uppercase tracking-wider font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Broadcasting to Global Live Feed (Guest Creator)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-white/70 mb-1">Your Artist Display Name</label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g. Elena Vance"
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-white/70 mb-1">Your Artist Handle</label>
                        <input
                          type="text"
                          value={guestHandle}
                          onChange={(e) => setGuestHandle(e.target.value)}
                          placeholder="e.g. @elena.art"
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-[#c9a875]/80 font-mono-code">
                      🔒 Curatorial Policy: Works published as a guest are preserved in the gallery. To edit or delete creations, sign in or create an artist profile.
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-2">
                    Discipline Category
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['painting', 'drawing', 'digital', 'video'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setVisualCategory(cat);
                          if (cat === 'painting') setMedium('Oil on Belgian Linen');
                          if (cat === 'drawing') setMedium('Charcoal & Graphite on Cotton Paper');
                          if (cat === 'digital') setMedium('Generative Shader & 3D Render');
                          if (cat === 'video') setMedium('4K Volumetric Fluid Loop');
                        }}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-mono-code capitalize transition-all cursor-pointer ${
                          visualCategory === cat
                            ? 'bg-[#c9a875]/15 border-[#c9a875] text-[#c9a875] font-semibold'
                            : 'bg-black/20 border-white/10 text-white/60 hover:border-white/30'
                        }`}
                      >
                        {cat === 'painting' && <Palette className="w-4 h-4" />}
                        {cat === 'drawing' && <PenTool className="w-4 h-4" />}
                        {cat === 'digital' && <ImageIcon className="w-4 h-4" />}
                        {cat === 'video' && <Film className="w-4 h-4" />}
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Box or Image URL */}
                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-2">
                    Artwork Media
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all overflow-hidden flex flex-col items-center justify-center min-h-[220px] ${
                      mediaUrl
                        ? 'border-[#c9a875]/50 bg-black/40'
                        : 'border-white/15 hover:border-[#c9a875]/40 bg-black/20'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {mediaUrl ? (
                      <div className="space-y-3 w-full" onClick={(e) => e.stopPropagation()}>
                        {visualCategory === 'video' || mediaUrl.match(/\.(mp4|webm|mov|m4v|ogv)/i) || mediaUrl.startsWith('data:video') ? (
                          <div className="rounded-xl overflow-hidden max-h-60 mx-auto border border-white/20">
                            <YouTubeVideoPlayer
                              src={mediaUrl}
                              title={title || 'Motion Cinema Preview'}
                              autoPlay={true}
                              loop={true}
                              initialMuted={false}
                            />
                          </div>
                        ) : (
                          <img
                            src={mediaUrl}
                            alt="Uploaded Preview"
                            className="max-h-48 rounded-xl mx-auto object-cover border border-white/20"
                          />
                        )}
                        <p
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs text-[#c9a875] font-mono-code cursor-pointer hover:underline text-center"
                        >
                          Click here to choose a different file
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-[#c9a875] mx-auto animate-bounce" />
                        <p className="text-sm font-medium text-white">
                          Drag & drop high-res artwork or click to browse
                        </p>
                        <p className="text-xs text-white/40 font-mono-code">
                          Supports PNG, JPG, WebP, GIF, MP4 (Up to 50MB)
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <label className="block text-[11px] font-mono-code text-white/50 mb-1">
                      Or paste an external Image / Video URL:
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/10 text-xs text-white placeholder-white/30 focus:border-[#c9a875] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Curated Studio Presets */}
                <div>
                  <label className="block text-xs font-mono-code text-white/50 mb-2">
                    Or select a curated masterpiece demo asset:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_ART_IMAGES.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectPreset(preset)}
                        className="group relative rounded-xl overflow-hidden aspect-square border border-white/15 cursor-pointer hover:border-[#c9a875]"
                      >
                        <img
                          src={preset.url}
                          alt={preset.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-mono-code text-center p-1">
                          Select
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Metadata */}
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                    Artwork Title *
                  </label>
                  <input
                    id="artwork-title-input"
                    type="text"
                    required
                    placeholder="e.g. Echoes of Gold and Rust"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/15 text-sm text-white focus:border-[#c9a875] focus:outline-none font-serif-display text-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Medium
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Oil on Belgian Linen"
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Dimensions / Resolution
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 140 x 180 cm"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Year Created
                    </label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value) || 2026)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Aspect Ratio
                    </label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value as AspectRatioType)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    >
                      <option value="tall" className="bg-[#11131a]">Tall (3:4)</option>
                      <option value="square" className="bg-[#11131a]">Square (1:1)</option>
                      <option value="wide" className="bg-[#11131a]">Wide (16:10)</option>
                      <option value="ultrawide" className="bg-[#11131a]">Ultra Wide (21:9)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                    Artist Statement & Philosophical Concept
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the aesthetic intention, textures, emotional narrative, or technical process..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Color Palette Picker */}
                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                    Harmonic Color Palette (Extracted HEX)
                  </label>
                  <div className="flex items-center gap-2">
                    {paletteHexes.map((hex, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <input
                          type="color"
                          value={hex}
                          onChange={(e) => {
                            const copy = [...paletteHexes];
                            copy[idx] = e.target.value;
                            setPaletteHexes(copy);
                          }}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setPaletteHexes([
                          '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
                          '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
                          '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
                          '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
                          '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
                        ])
                      }
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 text-xs font-mono-code flex items-center gap-1 cursor-pointer"
                      title="Randomize Palette"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Chiaroscuro, Oil Painting, Nocturne, Texture"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 'poetry' ? (
            /* Poetry Studio Form & Live Card Formatter */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Poetry Composer */}
              <div className="lg:col-span-6 space-y-4">
                {activeUser.id === 'guest' && (
                  <div className="p-3.5 rounded-xl bg-[#c9a875]/10 border border-[#c9a875]/30 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono-code text-[#c9a875] uppercase tracking-wider font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Broadcasting to Global Live Feed (Guest Poet)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-white/70 mb-1">Your Poet Name / Moniker</label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g. Aria Chen"
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-white/70 mb-1">Your Handle</label>
                        <input
                          type="text"
                          value={guestHandle}
                          onChange={(e) => setGuestHandle(e.target.value)}
                          placeholder="e.g. @ariachen.verse"
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-[#c9a875]/80 font-mono-code">
                      🔒 Curatorial Policy: Works published as a guest are preserved in the gallery. To edit or delete creations, sign in or create an artist profile.
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                    Poem Title *
                  </label>
                  <input
                    id="poem-title-input"
                    type="text"
                    required
                    placeholder="e.g. Anatomy of the Night Wind"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/15 text-sm text-white focus:border-[#c9a875] focus:outline-none font-serif-display text-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Collection / Subtitle
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. From 'Monasteries of the Rain'"
                      value={poetrySubtitle}
                      onChange={(e) => setPoetrySubtitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Author Signature
                    </label>
                    <input
                      type="text"
                      placeholder="— Elena Vance, 2026"
                      value={authorSignature}
                      onChange={(e) => setAuthorSignature(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    />
                  </div>
                </div>

                {/* Stanzas Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono-code uppercase tracking-wider text-white/70">
                      Poetic Stanzas (Separate stanzas with double Enter)
                    </label>
                    <span className="text-[11px] text-[#c9a875] font-mono-code">
                      {parsedStanzas.length} Stanza{parsedStanzas.length !== 1 ? 's' : ''} detected
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    required
                    placeholder="Enter your lines here...&#10;&#10;Separate each stanza with a blank line to format cleanly."
                    value={poetryRawText}
                    onChange={(e) => setPoetryRawText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:border-[#c9a875] focus:outline-none font-cormorant text-base leading-relaxed"
                  />
                </div>

                {/* Card Theme Picker */}
                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-2">
                    Aesthetic Card Theme & Texture
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['obsidian', 'vellum', 'midnight', 'emerald', 'crimson'] as PoetryTheme[]).map(
                      (theme) => (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => setPoetryTheme(theme)}
                          className={`p-2.5 rounded-xl border text-[11px] font-mono-code capitalize transition-all cursor-pointer text-center ${
                            poetryTheme === theme
                              ? 'border-[#c9a875] ring-2 ring-[#c9a875]/40 font-semibold'
                              : 'border-white/10 hover:border-white/30'
                          } ${
                            theme === 'obsidian'
                              ? 'bg-[#12141d] text-white'
                              : theme === 'vellum'
                              ? 'bg-[#201a14] text-[#f3ebd9]'
                              : theme === 'midnight'
                              ? 'bg-[#111a2e] text-[#9bb4d0]'
                              : theme === 'emerald'
                              ? 'bg-[#10241b] text-[#52b788]'
                              : 'bg-[#291216] text-[#df526b]'
                          }`}
                        >
                          {theme}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Typography & Alignment Controls */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Serif Typography
                    </label>
                    <select
                      value={poetryFont}
                      onChange={(e) => setPoetryFont(e.target.value as PoetryFont)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    >
                      <option value="cormorant" className="bg-[#11131a]">Cormorant Garamond (Classic)</option>
                      <option value="newsreader" className="bg-[#11131a]">Newsreader (Refined Book)</option>
                      <option value="playfair" className="bg-[#11131a]">Playfair Display (Dramatic)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Text Alignment
                    </label>
                    <div className="grid grid-cols-2 gap-1 p-1 bg-black/30 border border-white/15 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setPoetryAlignment('center')}
                        className={`py-1 rounded-lg text-xs font-mono-code transition-colors cursor-pointer ${
                          poetryAlignment === 'center'
                            ? 'bg-[#c9a875] text-[#0d0e12] font-semibold'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Center
                      </button>
                      <button
                        type="button"
                        onClick={() => setPoetryAlignment('left')}
                        className={`py-1 rounded-lg text-xs font-mono-code transition-colors cursor-pointer ${
                          poetryAlignment === 'left'
                            ? 'bg-[#c9a875] text-[#0d0e12] font-semibold'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Left
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Lyric Poetry, Free Verse, Philosophy, Night"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                  />
                </div>
              </div>

              {/* Right Column: Live Formatted Card Preview */}
              <div className="lg:col-span-6 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono-code uppercase tracking-wider text-[#c9a875] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Live Aesthetic Card Preview
                  </span>
                  <span className="text-[11px] text-white/40 font-mono-code">
                    Rendered in real-time
                  </span>
                </div>

                <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-center overflow-hidden">
                  <div className="w-full max-w-md">
                    <PoetryCard
                      artwork={livePreviewArtwork}
                      onSelect={() => {}}
                      onToggleLike={() => {}}
                      onToggleSave={() => {}}
                      onSelectArtist={() => {}}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Original Music Studio & Vinyl Press Form */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Audio Master & Sleeve Cover */}
              <div className="lg:col-span-6 space-y-5">
                {activeUser.id === 'guest' && (
                  <div className="p-3.5 rounded-xl bg-[#c9a875]/10 border border-[#c9a875]/30 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono-code text-[#c9a875] uppercase tracking-wider font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Broadcasting to Global Live Feed (Guest Musician)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-white/70 mb-1">Your Artist / Band Name</label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g. Elena Vance"
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-white/70 mb-1">Your Musician Handle</label>
                        <input
                          type="text"
                          value={guestHandle}
                          onChange={(e) => setGuestHandle(e.target.value)}
                          placeholder="e.g. @elena.music"
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-[#c9a875]/80 font-mono-code">
                      🎵 Sound Sanctuary Policy: Music tracks are automatically cued into the floating background ambience player for all active visitors worldwide.
                    </p>
                  </div>
                )}

                {/* Master Audio Track Upload */}
                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-[#c9a875]" />
                      Master Audio Track *
                    </span>
                    {isUploadingMedia && (
                      <span className="text-[11px] text-[#c9a875] animate-pulse">Uploading audio...</span>
                    )}
                  </label>

                  <div
                    onClick={() => musicAudioInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all overflow-hidden flex flex-col items-center justify-center min-h-[170px] ${
                      musicAudioUrl
                        ? 'border-[#c9a875]/50 bg-black/40'
                        : 'border-white/15 hover:border-[#c9a875]/40 bg-black/20'
                    }`}
                  >
                    <input
                      ref={musicAudioInputRef}
                      type="file"
                      accept="audio/*,video/*"
                      onChange={handleMusicAudioUpload}
                      className="hidden"
                    />

                    {musicAudioUrl ? (
                      <div className="w-full space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-white/15">
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={toggleMusicAudioPlayback}
                              className="w-10 h-10 rounded-full bg-[#c9a875] text-[#0d0e12] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                            >
                              {musicAudioPlaying ? (
                                <Pause className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              )}
                            </button>
                            <div className="text-left min-w-0">
                              <p className="text-xs font-semibold text-white truncate font-serif-display">
                                {title || 'Master Recording Audio'}
                              </p>
                              <p className="text-[10px] text-[#c9a875] font-mono-code truncate">
                                {musicAudioPlaying ? 'Playing in Studio Preview...' : 'Ready for mastering'} • {Math.floor(musicDurationSeconds / 60)}:{String(musicDurationSeconds % 60).padStart(2, '0')}
                              </p>
                            </div>
                          </div>

                          {/* Equalizer Frequency Bars */}
                          <div className="flex items-end gap-1 h-6 shrink-0 px-2">
                            {[0.4, 0.9, 0.6, 1.0, 0.7, 0.3, 0.8].map((h, i) => (
                              <div
                                key={i}
                                className={`w-1 rounded-full transition-all duration-200 ${
                                  musicAudioPlaying ? 'bg-[#c9a875] animate-pulse' : 'bg-white/20'
                                }`}
                                style={{
                                  height: musicAudioPlaying ? `${Math.max(25, h * 100)}%` : '30%',
                                  animationDelay: `${i * 120}ms`
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <p
                          onClick={() => musicAudioInputRef.current?.click()}
                          className="text-xs text-[#c9a875] font-mono-code cursor-pointer hover:underline text-center"
                        >
                          Click here to upload a different audio file
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileAudio className="w-8 h-8 text-[#c9a875] mx-auto animate-bounce" />
                        <p className="text-sm font-medium text-white">
                          Drag & drop master audio (MP3, WAV, FLAC, M4A) or click to browse
                        </p>
                        <p className="text-xs text-white/40 font-mono-code">
                          Supports high-resolution audio master files up to 50MB
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5">
                    <label className="block text-[11px] font-mono-code text-white/50 mb-1">
                      Or paste an audio stream / media URL:
                    </label>
                    <input
                      type="url"
                      placeholder="https://... or /audio/wsKhe5rTKw8.mp4"
                      value={musicAudioUrl}
                      onChange={(e) => {
                        setMusicAudioUrl(e.target.value);
                        if (musicAudioPlayerRef.current) {
                          musicAudioPlayerRef.current.src = e.target.value;
                        }
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/10 text-xs text-white placeholder-white/30 focus:border-[#c9a875] focus:outline-none font-mono-code"
                    />
                  </div>
                </div>

                {/* Album Cover Art / Vinyl Sleeve */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono-code uppercase tracking-wider text-white/70">
                      Album Cover & Vinyl Sleeve *
                    </label>
                    <button
                      type="button"
                      onClick={() => musicCoverInputRef.current?.click()}
                      className="text-[11px] text-[#c9a875] hover:underline font-mono-code cursor-pointer"
                    >
                      Upload custom cover
                    </button>
                    <input
                      ref={musicCoverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleMusicCoverUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 border border-white/10">
                    <div
                      className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-lg group cursor-pointer"
                      onClick={() => musicCoverInputRef.current?.click()}
                    >
                      <img
                        src={musicCoverUrl}
                        alt="Album Cover"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white truncate font-serif-display">
                        {musicAlbum || 'Atelier Master Sessions'}
                      </p>
                      <p className="text-[10px] text-white/50 font-mono-code truncate mt-0.5">
                        High-resolution 1:1 vinyl square art
                      </p>
                      <input
                        type="url"
                        placeholder="Or paste image URL: https://..."
                        value={musicCoverUrl}
                        onChange={(e) => setMusicCoverUrl(e.target.value)}
                        className="w-full mt-2 px-2.5 py-1 rounded-lg bg-black/50 border border-white/10 text-[11px] text-white placeholder-white/30 focus:border-[#c9a875] focus:outline-none font-mono-code"
                      />
                    </div>
                  </div>
                </div>

                {/* Curated Studio Master Presets */}
                <div>
                  <label className="block text-xs font-mono-code text-white/50 mb-2">
                    Or select a curated Sanctuary master track to test:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_MUSIC_TRACKS.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectMusicPreset(preset)}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                          musicAudioUrl === preset.audioUrl
                            ? 'bg-[#c9a875]/15 border-[#c9a875] text-white'
                            : 'bg-black/30 border-white/10 hover:border-white/30 text-white/70'
                        }`}
                      >
                        <img
                          src={preset.coverUrl}
                          alt={preset.title}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/10"
                        />
                        <div className="min-w-0 text-left">
                          <p className="text-xs font-medium text-white truncate">{preset.title}</p>
                          <p className="text-[10px] text-[#c9a875] font-mono-code truncate">{preset.genre}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Vinyl Record Preview & Metadata */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono-code uppercase tracking-wider text-[#c9a875] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Live Sanctuary Vinyl Preview
                  </span>
                  <span className="text-[11px] text-white/40 font-mono-code">
                    Interactive Gallery Card
                  </span>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-center overflow-hidden">
                  <div className="w-full max-w-sm">
                    <MusicArtworkCard
                      artwork={liveMusicPreviewArtwork}
                      index={0}
                      onSelectArtwork={() => {}}
                      onToggleLike={() => {}}
                      onToggleSave={() => {}}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                    Track Title *
                  </label>
                  <input
                    id="music-title-input"
                    type="text"
                    required
                    placeholder="e.g. Nocturne in C-sharp Minor"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-black/30 border border-white/15 text-sm text-white focus:border-[#c9a875] focus:outline-none font-serif-display text-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Album / Anthology
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sanctuary Nocturnes Vol. I"
                      value={musicAlbum}
                      onChange={(e) => setMusicAlbum(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Genre / Style
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Neo-Classical / Ambient Piano"
                      value={musicGenre}
                      onChange={(e) => setMusicGenre(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Key
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. C# Minor"
                      value={musicKey}
                      onChange={(e) => setMusicKey(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      BPM / Tempo
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 72 BPM"
                      value={musicBpm}
                      onChange={(e) => setMusicBpm(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Duration (Sec)
                    </label>
                    <input
                      type="number"
                      value={musicDurationSeconds}
                      onChange={(e) => setMusicDurationSeconds(parseInt(e.target.value) || 180)}
                      className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                    Liner Notes & Song Poetry / Lyrics
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide the lyrical poetry, musical inspiration, acoustic recording instruments, or mastering equipment..."
                    value={musicLyrics}
                    onChange={(e) => setMusicLyrics(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-serif leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Original Song, Piano, Ambient, Vinyl, Sanctuary"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer CTA */}
          <div className="flex items-center justify-between pt-5 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/5 text-xs font-mono-code transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="submit-artwork-btn"
              type="submit"
              className="flex items-center gap-2 px-7 py-3 rounded-full bg-[#c9a875] hover:bg-[#dfba88] text-[#0c0d10] font-semibold text-sm transition-all cursor-pointer shadow-xl shadow-[#c9a875]/20 hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              {activeTab === 'poetry'
                ? 'Publish Formatted Poetry Card'
                : activeTab === 'music'
                ? 'Press Vinyl & Broadcast Song'
                : 'Inaugurate to Sanctuary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
