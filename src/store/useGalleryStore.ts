import { create } from 'zustand';
import { Artwork, ArtCategory, Comment } from '../types';
import { INITIAL_ARTWORKS, INITIAL_COMMENTS } from '../data/initialData';
import { fetchArtworksFromSupabase, updateArtworkInSupabase } from '../services/supabaseClient';
import { realtimeBroker } from '../services/realtimeBroker';

const LIKED_STORAGE_KEY = 'atelier_user_liked_artwork_ids_v2';
const SAVED_STORAGE_KEY = 'atelier_user_saved_artwork_ids_v2';

export function getStoredLikedIds(): Set<string> {
  try {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(LIKED_STORAGE_KEY);
      if (data) return new Set(JSON.parse(data));
    }
  } catch {
    // Ignore error
  }
  return new Set();
}

export function saveStoredLikedIds(setIds: Set<string>): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(Array.from(setIds)));
    }
  } catch {
    // Ignore error
  }
}

export function getStoredSavedIds(): Set<string> {
  try {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(SAVED_STORAGE_KEY);
      if (data) return new Set(JSON.parse(data));
    }
  } catch {
    // Ignore error
  }
  return new Set();
}

export function saveStoredSavedIds(setIds: Set<string>): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(Array.from(setIds)));
    }
  } catch {
    // Ignore error
  }
}

function initializeArtworks(): Artwork[] {
  const liked = getStoredLikedIds();
  const saved = getStoredSavedIds();
  return INITIAL_ARTWORKS.map((a) => ({
    ...a,
    isLiked: liked.has(a.id),
    isSaved: saved.has(a.id)
  }));
}

interface GalleryStoreState {
  artworks: Artwork[];
  comments: Record<string, Comment[]>;
  selectedCategory: ArtCategory;
  searchQuery: string;
  isRealtimeConnected: boolean;
  isLoading: boolean;

  // Actions
  setArtworks: (artworks: Artwork[]) => void;
  prependArtwork: (artwork: Artwork) => void;
  updateArtwork: (id: string, updates: Partial<Artwork>) => void;
  removeArtwork: (id: string) => void;
  setSelectedCategory: (category: ArtCategory) => void;
  setSearchQuery: (query: string) => void;
  setRealtimeConnected: (connected: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  toggleLike: (id: string) => void;
  setLikesCount: (id: string, count: number) => void;
  toggleSave: (id: string) => void;
  setSavesCount: (id: string, count: number) => void;
  setCommentsForArtwork: (artworkId: string, comments: Comment[]) => void;
  addCommentToArtwork: (artworkId: string, comment: Comment) => void;
  getCommentsForArtwork: (artworkId: string) => Comment[];
  loadArtworksFromDatabase: () => Promise<void>;
}

// Pre-populate initial comments indexed by artworkId
const initialCommentsMap: Record<string, Comment[]> = {};
INITIAL_COMMENTS.forEach((c) => {
  if (!initialCommentsMap[c.artworkId]) {
    initialCommentsMap[c.artworkId] = [];
  }
  initialCommentsMap[c.artworkId].push(c);
});

export const useGalleryStore = create<GalleryStoreState>((set, get) => ({
  artworks: initializeArtworks(),
  comments: initialCommentsMap,
  selectedCategory: 'all',
  searchQuery: '',
  isRealtimeConnected: true,
  isLoading: false,

  setArtworks: (newArtworks) => {
    const existing = get().artworks;
    const mergedMap = new Map<string, Artwork>();
    const likedIds = getStoredLikedIds();
    const savedIds = getStoredSavedIds();

    // Deduplication signature: title + artist_handle + mediaUrl
    const seenSignatures = new Set<string>();
    const getSignature = (a: Artwork) => {
      const t = (a.title || '').trim().toLowerCase();
      const h = (a.artist?.handle || '').trim().toLowerCase();
      const m = (a.mediaUrl || '').trim();
      return `${t}::${h}::${m}`;
    };

    // 1. Put fresh/remote artworks from Supabase Postgres first
    for (const a of newArtworks) {
      if (!a?.id) continue;
      const sig = getSignature(a);
      if (a.title && a.mediaUrl && seenSignatures.has(sig)) {
        continue; // Skip duplicate upload in gallery
      }
      if (a.title && a.mediaUrl) seenSignatures.add(sig);

      mergedMap.set(a.id, {
        ...a,
        isLiked: likedIds.has(a.id),
        isSaved: savedIds.has(a.id)
      });
    }

    // 2. Append foundational artworks that are not yet in Supabase
    for (const a of existing) {
      if (!a?.id) continue;
      const sig = getSignature(a);
      if (a.title && a.mediaUrl && seenSignatures.has(sig)) {
        continue;
      }
      if (!mergedMap.has(a.id)) {
        if (a.title && a.mediaUrl) seenSignatures.add(sig);
        mergedMap.set(a.id, {
          ...a,
          isLiked: likedIds.has(a.id),
          isSaved: savedIds.has(a.id)
        });
      }
    }

    set({ artworks: Array.from(mergedMap.values()) });
  },

  prependArtwork: (artwork) => {
    set((state) => {
      const likedIds = getStoredLikedIds();
      const savedIds = getStoredSavedIds();
      const enriched: Artwork = {
        ...artwork,
        isLiked: likedIds.has(artwork.id),
        isSaved: savedIds.has(artwork.id)
      };

      // Avoid duplicate inserts
      if (state.artworks.some((a) => a.id === artwork.id)) {
        return {
          artworks: state.artworks.map((a) => (a.id === artwork.id ? { ...a, ...enriched } : a))
        };
      }
      return {
        artworks: [enriched, ...state.artworks]
      };
    });
  },

  updateArtwork: (id, updates) => {
    set((state) => ({
      artworks: state.artworks.map((a) => (a.id === id ? { ...a, ...updates } : a))
    }));
  },

  removeArtwork: (id) => {
    set((state) => ({
      artworks: state.artworks.filter((a) => a.id !== id)
    }));
  },

  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setRealtimeConnected: (isRealtimeConnected) => set({ isRealtimeConnected }),
  setIsLoading: (isLoading) => set({ isLoading }),

  toggleLike: (id) => {
    const likedIds = getStoredLikedIds();
    const isCurrentlyLiked = likedIds.has(id);
    const nextLiked = !isCurrentlyLiked;

    if (nextLiked) {
      likedIds.add(id);
    } else {
      likedIds.delete(id);
    }
    saveStoredLikedIds(likedIds);

    let finalCount = 0;
    set((state) => ({
      artworks: state.artworks.map((a) => {
        if (a.id === id) {
          finalCount = Math.max(0, a.likesCount + (nextLiked ? 1 : -1));
          return {
            ...a,
            isLiked: nextLiked,
            likesCount: finalCount
          };
        }
        return a;
      })
    }));

    realtimeBroker.broadcastLike(id, finalCount);
  },

  setLikesCount: (id, count) => {
    set((state) => ({
      artworks: state.artworks.map((a) => (a.id === id ? { ...a, likesCount: Math.max(0, count) } : a))
    }));
  },

  toggleSave: (id) => {
    const savedIds = getStoredSavedIds();
    const isCurrentlySaved = savedIds.has(id);
    const nextSaved = !isCurrentlySaved;

    if (nextSaved) {
      savedIds.add(id);
    } else {
      savedIds.delete(id);
    }
    saveStoredSavedIds(savedIds);

    let finalCount = 0;
    set((state) => ({
      artworks: state.artworks.map((a) => {
        if (a.id === id) {
          finalCount = Math.max(0, a.savesCount + (nextSaved ? 1 : -1));
          return {
            ...a,
            isSaved: nextSaved,
            savesCount: finalCount
          };
        }
        return a;
      })
    }));

    realtimeBroker.broadcastSave(id, finalCount);
  },

  setSavesCount: (id, count) => {
    set((state) => ({
      artworks: state.artworks.map((a) => (a.id === id ? { ...a, savesCount: Math.max(0, count) } : a))
    }));
  },

  setCommentsForArtwork: (artworkId, comments) => {
    set((state) => ({
      comments: {
        ...state.comments,
        [artworkId]: comments
      }
    }));
  },

  addCommentToArtwork: (artworkId, comment) => {
    set((state) => {
      const existing = state.comments[artworkId] || [];
      if (existing.some((c) => c.id === comment.id)) {
        return state;
      }
      return {
        comments: {
          ...state.comments,
          [artworkId]: [comment, ...existing]
        }
      };
    });
  },

  getCommentsForArtwork: (artworkId) => {
    return get().comments[artworkId] || [];
  },

  loadArtworksFromDatabase: async () => {
    try {
      set({ isLoading: true });
      const remoteArtworks = await fetchArtworksFromSupabase();
      if (remoteArtworks && remoteArtworks.length > 0) {
        get().setArtworks(remoteArtworks);
      }
    } catch (e) {
      console.warn('[useGalleryStore] Supabase initial load note:', e);
    } finally {
      set({ isLoading: false });
    }
  }
}));
