import { create } from 'zustand';
import { Artwork, ArtCategory, Comment } from '../types';
import { INITIAL_ARTWORKS, INITIAL_COMMENTS } from '../data/initialData';
import { fetchArtworksFromSupabase } from '../services/supabaseClient';

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
  artworks: INITIAL_ARTWORKS,
  comments: initialCommentsMap,
  selectedCategory: 'all',
  searchQuery: '',
  isRealtimeConnected: true,
  isLoading: false,

  setArtworks: (newArtworks) => {
    // Non-destructive merge: Remote Supabase artworks are placed at the front, preserving default pieces
    const existing = get().artworks;
    const mergedMap = new Map<string, Artwork>();
    
    // 1. Put fresh/remote artworks from Supabase Postgres first
    for (const a of newArtworks) {
      if (a?.id) mergedMap.set(a.id, a);
    }
    // 2. Append foundational artworks that are not yet in Supabase
    for (const a of existing) {
      if (a?.id && !mergedMap.has(a.id)) {
        mergedMap.set(a.id, a);
      }
    }
    
    set({ artworks: Array.from(mergedMap.values()) });
  },

  prependArtwork: (artwork) => {
    set((state) => {
      // Avoid duplicate inserts
      if (state.artworks.some((a) => a.id === artwork.id)) {
        return {
          artworks: state.artworks.map((a) => (a.id === artwork.id ? { ...a, ...artwork } : a))
        };
      }
      return {
        artworks: [artwork, ...state.artworks]
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
    set((state) => ({
      artworks: state.artworks.map((a) => {
        if (a.id === id) {
          const isLiked = !a.isLiked;
          return {
            ...a,
            isLiked,
            likesCount: Math.max(0, a.likesCount + (isLiked ? 1 : -1))
          };
        }
        return a;
      })
    }));
  },

  setLikesCount: (id, count) => {
    set((state) => ({
      artworks: state.artworks.map((a) => (a.id === id ? { ...a, likesCount: count } : a))
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
