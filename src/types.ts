export type ArtCategory = 'all' | 'painting' | 'drawing' | 'digital' | 'video' | 'poetry';

export type PoetryTheme = 'obsidian' | 'vellum' | 'midnight' | 'emerald' | 'crimson';
export type PoetryFont = 'cormorant' | 'newsreader' | 'playfair';
export type AspectRatioType = 'tall' | 'wide' | 'square' | 'portrait' | 'ultrawide';

export type AtmosphereMode = 'dawn' | 'golden-hour' | 'midnight-rain' | 'candlelight';
export type CanvasTexturePreset = 'parchment' | 'velvet' | 'washi' | 'crimson';
export type StoryExportFormat = 'story' | 'square';
export type WallFrameStyle = 'gilded' | 'walnut' | 'obsidian' | 'floating-glass';
export type WallColorPreset = 'obsidian' | 'alabaster' | 'taupe' | 'sage' | 'slate';

export interface Collection {
  id: string;
  title: string;
  description: string;
  userId: string;
  artworkIds: string[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  discipline: string;
  location: string;
  favoriteQuote?: {
    text: string;
    author?: string;
  } | string;
  website?: string;
  instagram?: string;
  twitter?: string;
  email?: string;
  phone?: string;
  verified: boolean;
  artworksCount: number;
  followersCount: number;
  followingCount: number;
  badges: string[];
  collections?: Collection[];
}

export interface PoetryData {
  stanzas: string[];
  theme: PoetryTheme;
  fontStyle: PoetryFont;
  alignment: 'left' | 'center';
  audioRecitationUrl?: string;
  audioRecitationTitle?: string;
  readingTimeMinutes: number;
  authorSignature?: string;
  dedicatedCardAccent?: string;
  subtitle?: string;
}

export interface VideoData {
  duration: string;
  isLoop: boolean;
  resolution: string;
  hasAudio: boolean;
  frameRate?: string;
}

export interface Artwork {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    bio?: string;
    verified: boolean;
    location?: string;
  };
  category: 'painting' | 'drawing' | 'digital' | 'video' | 'poetry';
  mediaUrl: string;
  thumbnailUrl?: string;
  dimensions?: string;
  medium?: string;
  year: number | string;
  description: string;
  curatorNote?: string;
  tags: string[];
  likesCount: number;
  viewsCount: number;
  savesCount: number;
  createdAt: string;
  isDeleted?: boolean;
  aspectRatio: AspectRatioType;
  colorPalette?: string[];
  isLiked?: boolean;
  isSaved?: boolean;
  featured?: boolean;
  poetryContent?: PoetryData;
  videoData?: VideoData;
  exhibitionId?: string;
  exhibitionName?: string;
}

export interface Comment {
  id: string;
  artworkId: string;
  user: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
  };
  text: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface MarginReflection {
  id: string;
  artworkId: string;
  stanzaIndex: number;
  lineIndex?: number;
  verseSnippet?: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
  };
  text: string;
  inkColor: 'gold' | 'charcoal' | 'sepia' | 'crimson';
  createdAt: string;
  upvotes: number;
  isUpvoted?: boolean;
  isCuratorPick?: boolean;
}

export interface Exhibition {
  id: string;
  title: string;
  subtitle: string;
  curator: string;
  coverImage: string;
  description: string;
  dates: string;
  theme: string;
  artworkIds: string[];
  location: string;
}

export interface DatabaseTableSchema {
  tableName: string;
  description: string;
  columns: {
    name: string;
    type: string;
    isPrimary?: boolean;
    isForeign?: boolean;
    foreignTable?: string;
    nullable: boolean;
    description: string;
  }[];
}

export interface Inquiry {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  inquiryType: string;
  message: string;
  channel?: 'email' | 'whatsapp' | 'both';
  status?: 'new' | 'contacted' | 'resolved';
  createdAt: string;
}

