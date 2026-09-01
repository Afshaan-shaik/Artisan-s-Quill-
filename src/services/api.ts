import { Artwork, Comment, Exhibition, UserProfile, ArtCategory, Collection, MarginReflection } from '../types';
import { INITIAL_ARTWORKS, INITIAL_COMMENTS, INITIAL_EXHIBITIONS, CURRENT_USER, DEFAULT_USER, GUEST_USER, INITIAL_ARTIST_PROFILES, INITIAL_MARGIN_REFLECTIONS } from '../data/initialData';
import { VaultStorage } from './vaultStorage';
import {
  fetchArtworksFromSupabase,
  saveArtworkToSupabase,
  updateArtworkInSupabase,
  deleteArtworkInSupabase,
  fetchCommentsFromSupabase,
  addCommentToSupabase,
  fetchMarginReflectionsFromSupabase,
  addMarginReflectionToSupabase,
  fetchProfilesFromSupabase,
  upsertProfileToSupabase,
  fetchExhibitionsFromSupabase,
  saveExhibitionToSupabase,
  deleteExhibitionFromSupabase,
  fetchCollectionsFromSupabase,
  getActiveSupabaseUser
} from './supabaseClient';
import { syncArtworkToCloud, deleteArtworkFromCloud, syncUserProfileToCloud, syncArtworkLikeToCloud, syncCommentToCloud } from './firebase';
import { realtimeBroker } from './realtimeBroker';

const COMMENTS_STORAGE_KEY = 'atelier_noir_comments_v1';
const MARGINS_STORAGE_KEY = 'atelier_noir_margins_v1';
const USER_STORAGE_KEY = 'atelier_noir_user_v1';
const COLLECTIONS_STORAGE_KEY = 'atelier_noir_collections_v1';
const EXHIBITIONS_STORAGE_KEY = 'atelier_noir_exhibitions_v1';
const PROFILES_STORAGE_KEY = 'atelier_noir_profiles_v1';
const FOUNDER_STORAGE_KEY = 'atelier_founder_profile_v1';
const SESSION_KEY = 'atelier_session_authenticated_v1';
const SESSION_USER_KEY = 'atelier_tab_session_user_v1';
const SESSION_AUTH_KEY = 'atelier_tab_session_authenticated_v1';
const READING_QUEUE_KEY = 'atelier_reading_queue_v1';
const CREDENTIALS_STORAGE_KEY = 'atelier_noir_credentials_v1';

/** Email of the sanctuary founder — requires verified credentials or OAuth */
const FOUNDER_EMAIL = 'afshaan100@gmail.com';
const FOUNDER_PASSCODES = ['atelier2026', 'sanctuary2026', 'afshaan2026', 'sanctuary@2026', 'atelier@2026'];

function isDisallowed(text: string | undefined | null): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes('shamen') ||
    lower.includes('sahil') ||
    lower.includes('saheal') ||
    lower.includes('nedhal') ||
    lower.includes('nidhal') ||
    lower.includes('dammam') ||
    lower.includes('elena vance') ||
    lower.includes('elenavance')
  );
}

function isDisallowedProfile(p: UserProfile): boolean {
  if (!p) return true;
  const quoteText = typeof p.favoriteQuote === 'object' ? p.favoriteQuote?.text : p.favoriteQuote;
  return (
    isDisallowed(p.name) ||
    isDisallowed(p.handle) ||
    isDisallowed(p.bio) ||
    isDisallowed(p.location) ||
    isDisallowed(quoteText) ||
    (p.badges && p.badges.some((b) => isDisallowed(b)))
  );
}

export class GalleryService {
  // In-Memory Performance Cache initialized with foundational pieces for zero blank-screen flicker
  private static _artworksCache: Artwork[] = [...INITIAL_ARTWORKS];
  private static _collectionsCache: Collection[] | null = null;
  private static _profilesCache: UserProfile[] | null = null;
  private static _isInitialized = false;

  /**
   * Clears in-memory caches (useful on external sync/reset)
   */
  static clearMemoryCache(): void {
    this._artworksCache = [...INITIAL_ARTWORKS];
    this._collectionsCache = null;
    this._profilesCache = null;
  }

  /**
   * Initializes vault and synchronizes data with Supabase Postgres
   */
  static async init(): Promise<void> {
    if (this._isInitialized) return;
    this._isInitialized = true;

    this.cleanseStoredProfiles();
    await VaultStorage.initializeVault();

    // Async background sync with Supabase Postgres
    this.refreshArtworksFromCloud().catch(() => {});
  }

  /**
   * Queries Supabase Postgres for live cloud artworks and merges non-destructively
   */
  static async refreshArtworksFromCloud(): Promise<Artwork[]> {
    try {
      const cloudArtworks = await fetchArtworksFromSupabase();
      if (cloudArtworks && cloudArtworks.length > 0) {
        return this.mergeCloudArtworks(cloudArtworks);
      }
    } catch (e) {
      console.warn('[GalleryService] Background Supabase fetch note:', e);
    }
    return this._artworksCache;
  }

  private static cleanseStoredProfiles(): void {
    try {
      const userRaw = localStorage.getItem(USER_STORAGE_KEY);
      if (userRaw) {
        const parsed = JSON.parse(userRaw) as UserProfile;
        if (isDisallowedProfile(parsed)) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
        }
      }

      const profRaw = localStorage.getItem(PROFILES_STORAGE_KEY);
      if (profRaw) {
        let profiles = JSON.parse(profRaw) as UserProfile[];
        profiles = profiles.filter((p) => !isDisallowedProfile(p));
        if (profiles.length === 0) {
          profiles = [DEFAULT_USER];
        }
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
      }
    } catch {
      // ignore
    }
  }

  private static getStoredArtworks(): Artwork[] {
    return this._artworksCache;
  }

  private static saveArtworks(artworks: Artwork[]) {
    this._artworksCache = [...artworks];
  }

  /**
   * Merges real-time artworks streamed from Supabase Postgres into local gallery cache
   */
  static mergeCloudArtworks(cloudArtworks: Artwork[]): Artwork[] {
    const existing = this._artworksCache;
    const mergedMap = new Map<string, Artwork>();

    // 1. Add cloud artworks from Supabase Postgres first (ordered by newest created)
    for (const a of cloudArtworks) {
      if (a?.id) {
        mergedMap.set(a.id, a);
      }
    }

    // 2. Add foundational artworks if not present
    for (const a of existing) {
      if (a?.id && !mergedMap.has(a.id)) {
        mergedMap.set(a.id, a);
      }
    }

    const merged = Array.from(mergedMap.values());
    this._artworksCache = merged;
    return merged;
  }

  /**
   * Merges real-time comments streamed from cloud
   */
  static mergeCloudComments(cloudComments: Comment[]): Comment[] {
    const current = this.getStoredComments();
    const mergedMap = new Map<string, Comment>();

    for (const c of current) {
      mergedMap.set(c.id, c);
    }
    for (const c of cloudComments) {
      if (!c || !c.id) continue;
      mergedMap.set(c.id, c);
    }

    const merged = Array.from(mergedMap.values());
    this.saveComments(merged);
    return merged;
  }

  static getStoredComments(): Comment[] {
    try {
      const data = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    return INITIAL_COMMENTS;
  }

  private static saveComments(comments: Comment[]) {
    try {
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
    } catch {
      // Ignore
    }
  }

  static getStoredCollections(): Collection[] {
    if (this._collectionsCache) {
      return [...this._collectionsCache];
    }
    try {
      const data = localStorage.getItem(COLLECTIONS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this._collectionsCache = parsed;
        return [...parsed];
      }
    } catch {
      // Fallback
    }
    this._collectionsCache = [];
    return [];
  }

  private static saveCollections(collections: Collection[]) {
    this._collectionsCache = [...collections];
    try {
      localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
    } catch {
      // Ignore
    }
  }

  static getArtworks(options?: {
    category?: ArtCategory;
    searchQuery?: string;
    filter?: 'curated' | 'popular' | 'latest' | 'saved';
    exhibitionId?: string;
    artistId?: string;
    dateRange?: { start?: string; end?: string };
  }): Artwork[] {
    let list = this.getStoredArtworks().filter((a) => !a.isDeleted);

    if (options?.exhibitionId) {
      list = list.filter((a) => a.exhibitionId === options.exhibitionId);
    }

    if (options?.artistId) {
      list = list.filter((a) => a.artist.id === options.artistId);
    }

    if (options?.category && options.category !== 'all') {
      list = list.filter((a) => a.category === options.category);
    }

    if (options?.dateRange) {
      if (options.dateRange.start) {
        const start = new Date(options.dateRange.start).getTime();
        list = list.filter((a) => new Date(a.createdAt).getTime() >= start);
      }
      if (options.dateRange.end) {
        const end = new Date(options.dateRange.end).getTime();
        list = list.filter((a) => new Date(a.createdAt).getTime() <= end);
      }
    }

    if (options?.searchQuery?.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.artist.name.toLowerCase().includes(q) ||
          a.artist.handle.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          (a.medium && a.medium.toLowerCase().includes(q)) ||
          a.description.toLowerCase().includes(q) ||
          (a.year && a.year.toString().includes(q)) ||
          (a.exhibitionName && a.exhibitionName.toLowerCase().includes(q)) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          (a.poetryContent && a.poetryContent.stanzas.some((s) => s.toLowerCase().includes(q)))
      );
    }

    if (options?.filter === 'saved') {
      list = list.filter((a) => a.isSaved);
    } else if (options?.filter === 'popular') {
      list = [...list].sort((a, b) => b.likesCount - a.likesCount);
    } else if (options?.filter === 'latest') {
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // 'curated' / default exhibition ranking
      list = [...list].sort((a, b) => {
        // "I Suppose" video is always #1 Spotlight
        const aIsISuppose = a.id === 'art-1787665037985-nnxxg' || a.title.toLowerCase().includes('i suppose');
        const bIsISuppose = b.id === 'art-1787665037985-nnxxg' || b.title.toLowerCase().includes('i suppose');
        if (aIsISuppose) return -1;
        if (bIsISuppose) return 1;

        if (a.id === 'spotlight-masterpiece-1') return -1;
        if (b.id === 'spotlight-masterpiece-1') return 1;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
    }

    return list;
  }

  static canUserManageArtwork(artwork: Artwork | null | undefined, userOrId: UserProfile | string | null | undefined): boolean {
    if (!artwork || !userOrId) return false;
    const userId = typeof userOrId === 'string' ? userOrId : userOrId.id;
    const userHandle = typeof userOrId === 'string' ? userOrId : userOrId.handle;

    const isUserFounder =
      userId === DEFAULT_USER.id ||
      userId === 'user-my-atelier' ||
      userHandle === DEFAULT_USER.handle ||
      userHandle === '@afshaanshaikh' ||
      userHandle === '@afshaan.creator' ||
      userHandle === 'afshaanshaikh';

    const isArtFounder =
      artwork.artist.id === DEFAULT_USER.id ||
      artwork.artist.id === 'user-my-atelier' ||
      artwork.artist.handle === DEFAULT_USER.handle ||
      artwork.artist.handle === '@afshaanshaikh' ||
      artwork.artist.handle === '@afshaan.creator' ||
      artwork.artist.name?.toLowerCase().includes('afshaan');

    if (isUserFounder && isArtFounder) return true;

    return (
      artwork.artist.id === userId ||
      artwork.artist.handle === userHandle ||
      (userHandle && artwork.artist.handle?.toLowerCase() === userHandle.toLowerCase()) ||
      (userId && artwork.artist.id?.toLowerCase() === userId.toLowerCase())
    );
  }

  static getArtworkById(id: string): Artwork | undefined {
    const list = this.getStoredArtworks();
    return list.find((a) => a.id === id);
  }

  static getDeletedArtworks(userOrId?: UserProfile | string): Artwork[] {
    const list = this.getStoredArtworks().filter((a) => a.isDeleted);
    if (!userOrId) return list;
    return list.filter((a) => this.canUserManageArtwork(a, userOrId));
  }

  static deleteArtwork(id: string, requester?: UserProfile | string): { success: boolean; message: string } {
    const list = this.getStoredArtworks();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) {
      return { success: false, message: 'Artwork not found.' };
    }

    // Strict Curatorial Protection: foundational masterworks cannot be deleted
    if (INITIAL_ARTWORKS.some((init) => init.id === id) || id === 'spotlight-masterpiece-1' || id === 'afshaan-poetry-1') {
      return {
        success: false,
        message: 'Curatorial Sanctuary Protection: Foundational sanctuary masterworks are preserved and cannot be deleted.'
      };
    }

    const artwork = list[index];
    const currentRequester = requester || this.getCurrentUser();

    // Strict Ownership Check
    if (!this.canUserManageArtwork(artwork, currentRequester)) {
      return {
        success: false,
        message: `Unauthorized: You can only delete your own creations. This artwork is protected under ${artwork.artist.name}'s atelier provenance.`
      };
    }

    list[index].isDeleted = true;
    this.saveArtworks(list);

    // Persist deletion to Supabase Postgres
    deleteArtworkInSupabase(id).catch(() => {});
    deleteArtworkFromCloud(id).catch(() => {});

    return { success: true, message: 'Artwork moved to your Recycle Bin.' };
  }

  static restoreArtwork(id: string, requester?: UserProfile | string): { success: boolean; message: string } {
    const list = this.getStoredArtworks();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) {
      return { success: false, message: 'Artwork not found.' };
    }

    const artwork = list[index];
    const currentRequester = requester || this.getCurrentUser();

    if (!this.canUserManageArtwork(artwork, currentRequester)) {
      return {
        success: false,
        message: 'Unauthorized: You can only restore your own artworks.'
      };
    }

    list[index].isDeleted = false;
    this.saveArtworks(list);

    // Restore in Supabase Postgres
    updateArtworkInSupabase(id, { isDeleted: false }).catch(() => {});

    return { success: true, message: 'Artwork successfully restored to gallery.' };
  }

  static permanentlyDeleteArtwork(id: string, requester?: UserProfile | string): { success: boolean; message: string } {
    const list = this.getStoredArtworks();
    const target = list.find((a) => a.id === id);
    if (!target) {
      return { success: false, message: 'Artwork not found.' };
    }

    if (INITIAL_ARTWORKS.some((init) => init.id === id) || id === 'spotlight-masterpiece-1' || id === 'afshaan-poetry-1') {
      return {
        success: false,
        message: 'Curatorial Sanctuary Protection: Permanent collection masterworks are preserved and cannot be purged.'
      };
    }

    const currentRequester = requester || this.getCurrentUser();
    if (!this.canUserManageArtwork(target, currentRequester)) {
      return {
        success: false,
        message: `Unauthorized: You cannot delete another artist's work.`
      };
    }

    const filtered = list.filter((a) => a.id !== id);
    this.saveArtworks(filtered);

    // Permanently purge from Supabase Postgres & Cloud
    deleteArtworkInSupabase(id).catch(() => {});
    deleteArtworkFromCloud(id).catch(() => {});

    return { success: true, message: 'Artwork permanently purged.' };
  }

  static updateArtwork(
    id: string,
    updates: Partial<Artwork>,
    requester?: UserProfile | string
  ): { artwork?: Artwork; error?: string } {
    const list = this.getStoredArtworks();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) {
      return { error: 'Artwork not found.' };
    }

    const artwork = list[index];
    const currentRequester = requester || this.getCurrentUser();

    // Strict Ownership Guard
    if (!this.canUserManageArtwork(artwork, currentRequester)) {
      return {
        error: `Unauthorized: You can only edit your own artworks. "${artwork.title}" was created by ${artwork.artist.name}.`
      };
    }

    list[index] = { ...list[index], ...updates };
    this.saveArtworks(list);

    // Sync to Supabase Postgres & Cloud
    updateArtworkInSupabase(id, updates).catch(() => {});
    syncArtworkToCloud(list[index]).catch(() => {});

    return { artwork: list[index] };
  }

  static createArtwork(artworkData: Partial<Artwork>): Artwork {
    const list = this.getStoredArtworks();
    const currentUser = this.getCurrentUser();

    const isGuest = currentUser.id === 'guest';
    const artistName = artworkData.artist?.name || (isGuest ? 'Guest Artist' : currentUser.name);
    const artistHandle = artworkData.artist?.handle || (isGuest ? `@guest_${Date.now().toString(36).substring(2, 6)}` : currentUser.handle);
    const artistAvatar = artworkData.artist?.avatar || (isGuest ? '/curatorial-masterpiece.svg' : currentUser.avatar);

    const newArtwork: Artwork = {
      id: artworkData.id || `art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: artworkData.title || 'Untitled Creation',
      artist: {
        id: isGuest ? `guest-${Date.now()}` : currentUser.id,
        name: artistName,
        handle: artistHandle,
        avatar: artistAvatar,
        verified: isGuest ? false : (currentUser.verified ?? true),
        location: currentUser.location || 'Global Atelier',
        bio: currentUser.bio
      },
      category: artworkData.category || 'digital',
      mediaUrl: artworkData.mediaUrl || '/curatorial-masterpiece.svg',
      thumbnailUrl: artworkData.thumbnailUrl || artworkData.mediaUrl || '/curatorial-masterpiece.svg',
      dimensions: artworkData.dimensions || 'Original Canvas',
      medium: artworkData.medium || 'Mixed Media',
      year: artworkData.year || new Date().getFullYear(),
      description: artworkData.description || 'Curated creation on The Artisan’s Quill.',
      curatorNote: artworkData.curatorNote,
      tags: artworkData.tags && artworkData.tags.length > 0 ? artworkData.tags : ['Atelier Submission'],
      likesCount: 0,
      viewsCount: 1,
      savesCount: 0,
      createdAt: new Date().toISOString(),
      aspectRatio: artworkData.aspectRatio || 'tall',
      colorPalette: artworkData.colorPalette || ['#12141c', '#c9a875', '#333b4d', '#f0f3fa'],
      isLiked: false,
      isSaved: false,
      featured: false,
      poetryContent: artworkData.poetryContent,
      videoData: artworkData.videoData,
      exhibitionId: artworkData.exhibitionId
    };

    const updated = [newArtwork, ...list];
    this.saveArtworks(updated);

    // Save permanently to Supabase Postgres
    saveArtworkToSupabase(newArtwork).catch(() => {});
    syncArtworkToCloud(newArtwork).catch(() => {});

    // Broadcast globally across edge WebSocket channels
    realtimeBroker.broadcastArtwork(newArtwork);

    return newArtwork;
  }

  static toggleLike(id: string): { artwork?: Artwork; error?: string } {
    const list = this.getStoredArtworks();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) {
      return { error: 'Artwork not found.' };
    }

    const artwork = list[index];
    const isLiked = !artwork.isLiked;
    const likesCount = Math.max(0, artwork.likesCount + (isLiked ? 1 : -1));

    list[index] = { ...artwork, isLiked, likesCount };
    this.saveArtworks(list);

    // Sync to Supabase Postgres & Realtime
    updateArtworkInSupabase(id, { likesCount }).catch(() => {});
    syncArtworkLikeToCloud(id, likesCount).catch(() => {});
    realtimeBroker.broadcastLike(id, likesCount);

    return { artwork: list[index] };
  }

  static toggleSave(id: string): { artwork?: Artwork; error?: string } {
    const list = this.getStoredArtworks();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) {
      return { error: 'Artwork not found.' };
    }

    const artwork = list[index];
    const isSaved = !artwork.isSaved;
    const savesCount = Math.max(0, artwork.savesCount + (isSaved ? 1 : -1));

    list[index] = { ...artwork, isSaved, savesCount };
    this.saveArtworks(list);

    updateArtworkInSupabase(id, { savesCount }).catch(() => {});

    return { artwork: list[index] };
  }

  static toggleSaveArtwork(id: string): { artwork?: Artwork; error?: string } {
    return this.toggleSave(id);
  }

  static getComments(artworkId: string): Comment[] {
    const list = this.getStoredComments();
    return list.filter((c) => c.artworkId === artworkId);
  }

  static addComment(artworkId: string, text: string): Comment {
    const list = this.getStoredComments();
    const currentUser = this.getCurrentUser();
    const isGuest = currentUser.id === 'guest';

    const newComment: Comment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      artworkId,
      user: {
        id: isGuest ? `guest-${Date.now()}` : currentUser.id,
        name: isGuest ? 'Guest Critic' : currentUser.name,
        handle: isGuest ? '@guest' : currentUser.handle,
        avatar: isGuest ? '/curatorial-masterpiece.svg' : currentUser.avatar,
        verified: !isGuest && (currentUser.verified ?? true)
      },
      text: text.trim(),
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLiked: false
    };

    const updated = [newComment, ...list];
    this.saveComments(updated);

    // Save to Supabase Postgres
    addCommentToSupabase(newComment).catch(() => {});
    syncCommentToCloud(newComment).catch(() => {});

    // Broadcast comment across all channels
    realtimeBroker.broadcastComment(artworkId, newComment);

    return newComment;
  }

  // --- Margin Reflections (Marginalia System) ---
  private static getStoredMarginReflections(): MarginReflection[] {
    try {
      const data = localStorage.getItem(MARGINS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as MarginReflection[];
      }
    } catch {
      // Fallback
    }
    return [...INITIAL_MARGIN_REFLECTIONS];
  }

  private static saveMarginReflections(reflections: MarginReflection[]): void {
    try {
      localStorage.setItem(MARGINS_STORAGE_KEY, JSON.stringify(reflections));
    } catch {
      // Fallback
    }
  }

  static getMarginReflections(artworkId: string): MarginReflection[] {
    const list = this.getStoredMarginReflections();
    return list.filter((m) => m.artworkId === artworkId);
  }

  static addMarginReflection(
    reflection: Omit<MarginReflection, 'id' | 'createdAt' | 'upvotes' | 'isUpvoted'>
  ): MarginReflection {
    const list = this.getStoredMarginReflections();
    const newReflection: MarginReflection = {
      ...reflection,
      id: `margin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      upvotes: 1,
      isUpvoted: true
    };
    const updated = [newReflection, ...list];
    this.saveMarginReflections(updated);

    // Save to Supabase Postgres
    addMarginReflectionToSupabase(newReflection).catch(() => {});

    return newReflection;
  }

  static toggleUpvoteMarginReflection(id: string): MarginReflection | null {
    const list = this.getStoredMarginReflections();
    const item = list.find((m) => m.id === id);
    if (!item) return null;

    item.isUpvoted = !item.isUpvoted;
    item.upvotes += item.isUpvoted ? 1 : -1;
    if (item.upvotes < 0) item.upvotes = 0;

    this.saveMarginReflections(list);
    return { ...item };
  }

  static deleteMarginReflection(id: string): boolean {
    const list = this.getStoredMarginReflections();
    const filtered = list.filter((m) => m.id !== id);
    if (filtered.length === list.length) return false;
    this.saveMarginReflections(filtered);
    return true;
  }

  static getExhibitions(): Exhibition[] {
    try {
      const data = localStorage.getItem(EXHIBITIONS_STORAGE_KEY);
      if (data) {
        let stored = JSON.parse(data) as Exhibition[];
        stored = stored.filter(
          (s) => !(s.title + s.description + s.location).toLowerCase().includes('karnataka')
        );
        return stored.length > 0 ? stored : INITIAL_EXHIBITIONS;
      }
    } catch {
      // fallback
    }
    return INITIAL_EXHIBITIONS;
  }

  static createExhibition(exhibition: Omit<Exhibition, 'id'>): Exhibition {
    const list = this.getExhibitions();
    const newExhibition: Exhibition = {
      ...exhibition,
      id: `exh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    const updated = [newExhibition, ...list];
    localStorage.setItem(EXHIBITIONS_STORAGE_KEY, JSON.stringify(updated));
    saveExhibitionToSupabase(newExhibition).catch(() => {});
    return newExhibition;
  }

  static deleteExhibition(id: string): void {
    const list = this.getExhibitions();
    const filtered = list.filter((e) => e.id !== id);
    localStorage.setItem(EXHIBITIONS_STORAGE_KEY, JSON.stringify(filtered));
    deleteExhibitionFromSupabase(id).catch(() => {});
  }

  static getAllCollections(): Collection[] {
    return this.getStoredCollections();
  }

  static getUserCollections(userId: string): Collection[] {
    return this.getStoredCollections().filter((c) => c.userId === userId);
  }

  static getCollectionById(id: string): Collection | undefined {
    return this.getStoredCollections().find((c) => c.id === id);
  }

  static createCollection(userId: string, title: string, description: string): Collection {
    const list = this.getStoredCollections();
    const newCollection: Collection = {
      id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      description,
      userId,
      artworkIds: [],
      createdAt: new Date().toISOString()
    };
    this.saveCollections([newCollection, ...list]);
    return newCollection;
  }

  static updateCollection(collectionId: string, updates: Partial<Collection>): Collection {
    const list = this.getStoredCollections();
    const index = list.findIndex((c) => c.id === collectionId);
    if (index === -1) throw new Error('Collection not found');

    list[index] = { ...list[index], ...updates };
    this.saveCollections(list);
    return list[index];
  }

  static deleteCollection(collectionId: string): void {
    const list = this.getStoredCollections();
    this.saveCollections(list.filter((c) => c.id !== collectionId));
  }

  static getFounderProfile(): UserProfile {
    try {
      const data = localStorage.getItem(FOUNDER_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as UserProfile;
        if (!isDisallowedProfile(parsed)) {
          return {
            ...DEFAULT_USER,
            ...parsed,
            name: parsed.name || DEFAULT_USER.name,
            discipline: parsed.discipline || DEFAULT_USER.discipline,
            email: parsed.email || DEFAULT_USER.email,
            phone: parsed.phone || DEFAULT_USER.phone
          };
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_USER;
  }

  static isGuestSession(): boolean {
    try {
      if (typeof window === 'undefined') return true;
      return !sessionStorage.getItem(SESSION_AUTH_KEY) && !localStorage.getItem(SESSION_KEY);
    } catch {
      return true;
    }
  }

  static logout(): void {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(SESSION_AUTH_KEY);
        sessionStorage.removeItem(SESSION_USER_KEY);
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);

        // Invalidate HTTP-only cookie on serverless layer
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      }
    } catch {
      // Ignore
    }
  }

  static getCurrentUser(): UserProfile {
    try {
      if (typeof window !== 'undefined') {
        const isAuth = sessionStorage.getItem(SESSION_AUTH_KEY) || localStorage.getItem(SESSION_KEY);
        if (isAuth) {
          const sessionData = sessionStorage.getItem(SESSION_USER_KEY) || localStorage.getItem(USER_STORAGE_KEY);
          if (sessionData) {
            const parsed = JSON.parse(sessionData) as UserProfile;
            if (!isDisallowedProfile(parsed) && parsed.id !== 'guest') {
              return parsed;
            }
          }
        }
      }
    } catch {
      // Fallback
    }
    return GUEST_USER;
  }

  static saveCurrentUser(user: UserProfile) {
    try {
      if (isDisallowedProfile(user)) return;

      if (typeof window !== 'undefined') {
        if (user.id === 'guest') {
          sessionStorage.removeItem(SESSION_AUTH_KEY);
          sessionStorage.removeItem(SESSION_USER_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.removeItem(SESSION_KEY);
          fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        } else {
          sessionStorage.setItem(SESSION_AUTH_KEY, '1');
          sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
          localStorage.setItem(SESSION_KEY, '1');
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

          // Set secure HTTP-only cookie on serverless Edge API
          fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile: user })
          }).catch(() => {});
        }
      }

      if (user.id === DEFAULT_USER.id || user.handle === DEFAULT_USER.handle || user.handle === '@afshaanshaikh') {
        if (typeof window !== 'undefined') {
          localStorage.setItem(FOUNDER_STORAGE_KEY, JSON.stringify(user));
        }
      }

      if (user.id !== 'guest') {
        const profiles = this.getAllUserProfiles();
        const idx = profiles.findIndex((p) => p.id === user.id || (p.handle && p.handle.toLowerCase() === user.handle.toLowerCase()));
        if (idx >= 0) {
          profiles[idx] = user;
        } else {
          profiles.push(user);
        }
        this._profilesCache = [...profiles];
        if (typeof window !== 'undefined') {
          localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
        }
        VaultStorage.backupUserProfiles(profiles);

        // Sync to Supabase Postgres
        upsertProfileToSupabase(user).catch(() => {});
        syncUserProfileToCloud(user).catch(() => {});
      }
    } catch {
      // Ignore
    }
  }

  static getAllUserProfiles(): UserProfile[] {
    if (this._profilesCache) {
      return [...this._profilesCache];
    }
    try {
      const data = localStorage.getItem(PROFILES_STORAGE_KEY);
      let profiles: UserProfile[] = [];
      if (data) {
        profiles = JSON.parse(data) as UserProfile[];
        profiles = profiles.filter((p) => !isDisallowedProfile(p));
      }

      const missingProfiles = INITIAL_ARTIST_PROFILES.filter(
        (seed) => !profiles.some((p) => p.id === seed.id || p.handle === seed.handle)
      );

      if (missingProfiles.length > 0) {
        profiles = [...profiles, ...missingProfiles];
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
      }

      this._profilesCache = profiles;
      return [...profiles];
    } catch {
      // Fallback
    }
    this._profilesCache = INITIAL_ARTIST_PROFILES;
    return [...INITIAL_ARTIST_PROFILES];
  }

  static restoreDefaultProfile(): UserProfile {
    try {
      this._profilesCache = [...INITIAL_ARTIST_PROFILES];
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(INITIAL_ARTIST_PROFILES));
      VaultStorage.cleanseDisallowedData();
      VaultStorage.backupUserProfiles(INITIAL_ARTIST_PROFILES);
    } catch {
      // Fallback
    }
    return DEFAULT_USER;
  }

  static getStoredCredentials(): Record<string, string> {
    try {
      const data = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  static saveCredential(identifier: string, passcode: string): void {
    try {
      if (!identifier || !passcode) return;
      const creds = this.getStoredCredentials();
      creds[identifier.trim().toLowerCase()] = passcode.trim();
      localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(creds));
    } catch {
      // Ignore
    }
  }

  static createUserProfile(profileData: Partial<UserProfile> & { passcode?: string }): UserProfile {
    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const cleanHandle = profileData.handle?.startsWith('@') ? profileData.handle : `@${profileData.handle || 'creator'}`;
    const newProfile: UserProfile = {
      id,
      name: profileData.name || 'New Artist',
      handle: cleanHandle,
      avatar: profileData.avatar || '/curatorial-masterpiece.svg',
      coverImage: profileData.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
      bio: profileData.bio || 'Fine artist and poet on The Artisan’s Quill.',
      discipline: profileData.discipline || 'Visual Arts & Creative Writing',
      location: profileData.location || 'Studio Atelier',
      favoriteQuote: profileData.favoriteQuote || {
        text: 'Art washes away from the soul the dust of everyday life.',
        author: 'Pablo Picasso'
      },
      website: profileData.website || '',
      instagram: profileData.instagram || '',
      twitter: profileData.twitter || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      verified: true,
      artworksCount: 0,
      followersCount: 0,
      followingCount: 0,
      badges: profileData.badges && profileData.badges.length > 0 ? profileData.badges : ['Verified Artist']
    };

    if (profileData.passcode) {
      this.saveCredential(newProfile.handle, profileData.passcode);
      if (newProfile.email) {
        this.saveCredential(newProfile.email, profileData.passcode);
      }
    }

    const profiles = this.getAllUserProfiles();
    const updatedProfiles = [...profiles, newProfile];
    try {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updatedProfiles));
      VaultStorage.backupUserProfiles(updatedProfiles);
    } catch {
      // Ignore
    }

    this.saveCurrentUser(newProfile);

    // Persist to Supabase Postgres
    upsertProfileToSupabase(newProfile).catch(() => {});
    syncUserProfileToCloud(newProfile).catch(() => {});

    return newProfile;
  }

  static authenticate(identifier: string, passcode?: string): { success: boolean; user?: UserProfile; message?: string } {
    const query = (identifier || '').trim().toLowerCase();
    const cleanPass = (passcode || '').trim();

    if (!query) {
      return { success: false, message: 'Please enter your artist handle or email.' };
    }

    const isFounderQuery =
      query === FOUNDER_EMAIL ||
      query === '@afshaanshaikh' ||
      query === 'afshaanshaikh' ||
      query === '@afshaan' ||
      query === 'afshaan' ||
      query === '@afshaan.creator' ||
      query === 'afshaan.creator';

    if (isFounderQuery) {
      const creds = this.getStoredCredentials();
      const customFounderPass = creds[FOUNDER_EMAIL] || creds['@afshaanshaikh'];
      const isValid =
        (cleanPass && FOUNDER_PASSCODES.includes(cleanPass)) ||
        (customFounderPass && cleanPass === customFounderPass);

      if (isValid) {
        const founder = this.getFounderProfile();
        this.saveCurrentUser(founder);
        return { success: true, user: founder };
      }

      return {
        success: false,
        message: 'Invalid founder credentials. Explicit passcode is required for atelier founder access.'
      };
    }

    const profiles = this.getAllUserProfiles();
    const normalizedQuery = query.startsWith('@') ? query : `@${query}`;
    const found = profiles.find(
      (p) =>
        p.handle.toLowerCase() === query ||
        p.handle.toLowerCase() === normalizedQuery ||
        (p.email && p.email.toLowerCase() === query)
    );

    if (found) {
      const creds = this.getStoredCredentials();
      const requiredPasscode = creds[found.handle.toLowerCase()] || (found.email ? creds[found.email.toLowerCase()] : undefined);

      if (requiredPasscode) {
        if (!cleanPass || cleanPass !== requiredPasscode) {
          return { success: false, message: 'Incorrect passcode for this artist account. Please try again.' };
        }
      }

      this.saveCurrentUser(found);
      return { success: true, user: found };
    }

    return {
      success: false,
      message: `No registered artist account found for "${identifier}". Please verify your credentials or create a profile.`
    };
  }

  // ─── Reading Queue (Poem Playlist) ─────────────────────────────────────────

  static getReadingQueue(): Artwork[] {
    try {
      const data = localStorage.getItem(READING_QUEUE_KEY);
      if (data) {
        const ids: string[] = JSON.parse(data);
        return ids
          .map((id) => this.getArtworkById(id))
          .filter((a): a is Artwork => Boolean(a));
      }
    } catch {
      // Fallback
    }
    return [];
  }

  static isInReadingQueue(artworkId: string): boolean {
    try {
      const data = localStorage.getItem(READING_QUEUE_KEY);
      if (data) {
        const ids: string[] = JSON.parse(data);
        return ids.includes(artworkId);
      }
    } catch {
      // Fallback
    }
    return false;
  }

  static addToReadingQueue(artworkId: string): void {
    try {
      const data = localStorage.getItem(READING_QUEUE_KEY);
      const ids: string[] = data ? JSON.parse(data) : [];
      if (!ids.includes(artworkId)) {
        ids.push(artworkId);
        localStorage.setItem(READING_QUEUE_KEY, JSON.stringify(ids));
      }
    } catch {
      // Ignore
    }
  }

  static removeFromReadingQueue(artworkId: string): void {
    try {
      const data = localStorage.getItem(READING_QUEUE_KEY);
      if (data) {
        const ids: string[] = JSON.parse(data);
        localStorage.setItem(READING_QUEUE_KEY, JSON.stringify(ids.filter((id) => id !== artworkId)));
      }
    } catch {
      // Ignore
    }
  }

  static clearReadingQueue(): void {
    try {
      localStorage.removeItem(READING_QUEUE_KEY);
    } catch {
      // Ignore
    }
  }

  static reorderReadingQueue(newIds: string[]): void {
    try {
      localStorage.setItem(READING_QUEUE_KEY, JSON.stringify(newIds));
    } catch {
      // Ignore
    }
  }

  static switchUserProfile(profileId: string): UserProfile {
    const profiles = this.getAllUserProfiles();
    const target = profiles.find((p) => p.id === profileId);
    if (target) {
      this.saveCurrentUser(target);
      return target;
    }
    return this.getCurrentUser();
  }

  static deleteUserProfile(profileId: string): void {
    const profiles = this.getAllUserProfiles().filter((p) => p.id !== profileId);
    try {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
      VaultStorage.backupUserProfiles(profiles);
    } catch {
      // Ignore
    }
    const current = this.getCurrentUser();
    if (current.id === profileId) {
      if (profiles.length > 0) {
        this.saveCurrentUser(profiles[0]);
      } else {
        this.saveCurrentUser(CURRENT_USER);
      }
    }
  }

  static exportStudioVault(): void {
    const artworks = this.getArtworks();
    const profiles = this.getAllUserProfiles();
    const collections = this.getStoredCollections();
    const comments = this.getStoredComments();
    VaultStorage.exportStudioArchive(artworks, profiles, collections, comments);
  }

  static async importStudioVault(jsonString: string): Promise<{ success: boolean; importedCount: number; message: string }> {
    return await VaultStorage.importStudioArchive(jsonString);
  }
}
