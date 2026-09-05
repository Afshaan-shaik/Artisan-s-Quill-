import { useEffect, useCallback } from 'react';
import { useGalleryStore } from '../store/useGalleryStore';
import { Artwork, ArtCategory, Comment } from '../types';
import { realtimeBroker } from '../services/realtimeBroker';
import { uploadMediaToSupabase } from '../services/supabaseClient';

export function useRealtimeGallery() {
  const artworks = useGalleryStore((state) => state.artworks);
  const setArtworks = useGalleryStore((state) => state.setArtworks);
  const prependArtwork = useGalleryStore((state) => state.prependArtwork);
  const updateArtwork = useGalleryStore((state) => state.updateArtwork);
  const removeArtwork = useGalleryStore((state) => state.removeArtwork);
  const setLikesCount = useGalleryStore((state) => state.setLikesCount);
  const setSavesCount = useGalleryStore((state) => state.setSavesCount);
  const addCommentToArtwork = useGalleryStore((state) => state.addCommentToArtwork);
  const isRealtimeConnected = useGalleryStore((state) => state.isRealtimeConnected);
  const selectedCategory = useGalleryStore((state) => state.selectedCategory);
  const setSelectedCategory = useGalleryStore((state) => state.setSelectedCategory);
  const toggleStoreLike = useGalleryStore((state) => state.toggleLike);
  const toggleStoreSave = useGalleryStore((state) => state.toggleSave);
  const loadArtworksFromDatabase = useGalleryStore((state) => state.loadArtworksFromDatabase);

  // 1. Initial background fetch from Supabase Postgres
  useEffect(() => {
    loadArtworksFromDatabase();
  }, [loadArtworksFromDatabase]);

  // 2. Subscribe to RealtimeBroker for cross-tab, cross-device, and Supabase Postgres live events
  useEffect(() => {
    const unsubscribe = realtimeBroker.subscribe((event) => {
      switch (event.type) {
        case 'ARTWORK_ADDED':
          prependArtwork(event.payload);
          break;
        case 'ARTWORK_UPDATED':
          updateArtwork(event.payload.id, event.payload.updates);
          break;
        case 'ARTWORK_DELETED':
          removeArtwork(event.payload.id);
          break;
        case 'LIKE_UPDATED':
          setLikesCount(event.payload.artworkId, event.payload.likesCount);
          break;
        case 'SAVE_UPDATED':
          setSavesCount(event.payload.artworkId, event.payload.savesCount);
          break;
        case 'COMMENT_ADDED':
          addCommentToArtwork(event.payload.artworkId, event.payload.comment);
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [prependArtwork, updateArtwork, removeArtwork, setLikesCount, setSavesCount, addCommentToArtwork]);

  // 3. Direct Upload Pipeline with Supabase Storage and Live Broadcast
  const uploadArtwork = useCallback(
    async (
      fileOrUrl: File | string,
      meta: {
        title?: string;
        artistName?: string;
        artistHandle?: string;
        category?: ArtCategory;
        medium?: string;
        description?: string;
        poetryContent?: any;
      }
    ) => {
      let resolvedImageUrl = '';

      if (typeof fileOrUrl === 'string') {
        resolvedImageUrl = fileOrUrl;
      } else if (fileOrUrl instanceof File) {
        resolvedImageUrl = await uploadMediaToSupabase(fileOrUrl, 'artworks', 'gallery');
      }

      const newArtwork: Artwork = {
        id: `art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: meta.title?.trim() || 'Untitled Creation',
        artist: {
          id: `artist-${Date.now()}`,
          name: meta.artistName?.trim() || 'Guest Artist',
          handle: meta.artistHandle?.trim().startsWith('@')
            ? meta.artistHandle.trim()
            : `@${meta.artistHandle?.trim() || 'guest'}`,
          avatar: '/curatorial-masterpiece.svg',
          verified: false
        },
        category: (meta.category && meta.category !== 'all' ? meta.category : 'digital') as 'painting' | 'drawing' | 'digital' | 'video' | 'poetry',
        mediaUrl: resolvedImageUrl || '/curatorial-masterpiece.svg',
        thumbnailUrl: resolvedImageUrl || '/curatorial-masterpiece.svg',
        dimensions: 'Original Canvas',
        medium: meta.medium || (meta.category === 'digital' ? 'Generative Shader & 3D Render' : 'Mixed Media'),
        year: new Date().getFullYear(),
        description: meta.description || 'Curated sanctuary creation.',
        tags: ['Live Feed', 'Community Submission', meta.category || 'digital'],
        likesCount: 0,
        viewsCount: 1,
        savesCount: 0,
        createdAt: new Date().toISOString(),
        aspectRatio: 'tall',
        colorPalette: ['#12141c', '#c9a875', '#333b4d', '#f0f3fa'],
        isLiked: false,
        isSaved: false,
        featured: false,
        poetryContent: meta.poetryContent
      };

      // Broadcast globally (persists to Supabase Postgres + broadcasts to all tabs & clients)
      realtimeBroker.broadcastArtwork(newArtwork);

      return newArtwork;
    },
    []
  );

  // 4. Realtime Like & Save Actions with Instant Propagation
  const toggleLike = useCallback(
    (id: string) => {
      toggleStoreLike(id);
    },
    [toggleStoreLike]
  );

  const toggleSave = useCallback(
    (id: string) => {
      toggleStoreSave(id);
    },
    [toggleStoreSave]
  );

  // 5. Realtime Comment Action with Instant Propagation
  const postComment = useCallback(
    (artworkId: string, text: string, user?: { id?: string; name?: string; handle?: string; avatar?: string }) => {
      const comment: Comment = {
        id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        artworkId,
        user: {
          id: user?.id || `guest-${Date.now()}`,
          name: user?.name || 'Guest Critic',
          handle: user?.handle || '@guest',
          avatar: user?.avatar || '/curatorial-masterpiece.svg',
          verified: false
        },
        text: text.trim(),
        createdAt: new Date().toISOString(),
        likesCount: 0,
        isLiked: false
      };

      realtimeBroker.broadcastComment(artworkId, comment);
      return comment;
    },
    []
  );

  return {
    artworks,
    setArtworks,
    selectedCategory,
    setSelectedCategory,
    isRealtimeConnected,
    uploadArtwork,
    toggleLike,
    toggleSave,
    postComment
  };
}
