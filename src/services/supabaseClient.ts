import { createClient, SupabaseClient, User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';
import { Artwork, Comment, MarginReflection, UserProfile, Exhibition, Collection, Inquiry } from '../types';
import { INITIAL_ARTWORKS, DEFAULT_USER, INITIAL_ARTIST_PROFILES, INITIAL_COMMENTS, INITIAL_MARGIN_REFLECTIONS, INITIAL_EXHIBITIONS } from '../data/initialData';

// Environment variable resolution supporting browser Vite and Node/Serverless runtimes
const getEnvVar = (viteKey: string, processKey: string, fallback = ''): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[viteKey]) {
    return (import.meta as any).env[viteKey];
  }
  if (typeof process !== 'undefined' && process.env && process.env[processKey]) {
    return process.env[processKey] || '';
  }
  return fallback;
};

export const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL', 'SUPABASE_URL', 'https://uskuzbtvbhfqlxvbbrvw.supabase.co');
export const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY', 'sb_publishable_MDfNiAFnJdPM4qunb4FhrQ_2DK0UB_H');

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('xyzcompany') &&
    !SUPABASE_ANON_KEY.includes('mock')
  );
};

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'artisans_quill_supabase_auth_token_v1'
      },
      realtime: {
        params: {
          eventsPerSecond: 20
        }
      }
    });
  }
  return supabaseInstance;
}

// Canonical singleton export for direct imports: import { supabase } from './supabaseClient'
export const supabase: SupabaseClient =
  getSupabaseClient() ||
  createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'artisans_quill_supabase_auth_token_v1'
    }
  });

// ==============================================================================
// 1. SUPABASE STORAGE (Permanent CDN Media Ingestion)
// ==============================================================================

/**
 * Helper to convert Data URL (base64) to Blob
 */
function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

/**
 * Uploads raw media files (paintings, digital art, videos, avatars, audio) directly to Supabase Storage bucket.
 * Returns the permanent public CDN URL to store in Postgres.
 */
export async function uploadMediaToSupabase(
  fileOrDataUrl: File | Blob | string,
  bucket: 'artworks' | 'avatars' = 'artworks',
  folder = 'uploads'
): Promise<string> {
  const client = getSupabaseClient() || supabase;
  if (client) {
    try {
      let fileToUpload: File | Blob;
      let contentType = 'image/jpeg';
      let fileExt = 'jpg';

      if (typeof fileOrDataUrl === 'string') {
        if (fileOrDataUrl.startsWith('data:')) {
          fileToUpload = dataURItoBlob(fileOrDataUrl);
          contentType = fileToUpload.type || 'image/png';
          fileExt = contentType.split('/')[1] || 'png';
        } else if (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://')) {
          // Already hosted URL
          return fileOrDataUrl;
        } else {
          fileToUpload = new Blob([fileOrDataUrl], { type: 'text/plain' });
        }
      } else {
        fileToUpload = fileOrDataUrl;
        if (fileOrDataUrl instanceof File) {
          const nameParts = fileOrDataUrl.name.split('.');
          if (nameParts.length > 1) {
            fileExt = nameParts.pop()!.toLowerCase();
          }
          contentType = fileOrDataUrl.type || (fileExt === 'png' ? 'image/png' : fileExt === 'webp' ? 'image/webp' : fileExt === 'mp4' ? 'video/mp4' : 'image/jpeg');
        } else {
          contentType = fileOrDataUrl.type || 'image/png';
          fileExt = contentType.split('/')[1] || 'png';
        }
      }

      // Ensure content type matches allowed storage MIME types
      if (!contentType || contentType === 'application/octet-stream') {
        contentType = bucket === 'avatars' ? 'image/png' : 'image/jpeg';
      }

      const cleanFileName = `${bucket}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `${folder}/${cleanFileName}`;

      const { data, error } = await client.storage
        .from(bucket)
        .upload(filePath, fileToUpload, {
          cacheControl: '31536000', // 1 year CDN cache
          upsert: true,
          contentType: contentType
        });

      if (!error && data) {
        const { data: publicData } = client.storage
          .from(bucket)
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          return publicData.publicUrl;
        }
      } else if (error) {
        console.warn(`[Supabase Storage] Upload error to bucket "${bucket}":`, error.message);
      }
    } catch (err) {
      console.warn('[Supabase Storage] Upload exception:', err);
    }
  }

  // Graceful fallback: return a permanent placeholder or data URI if offline
  if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('/curatorial-masterpiece.svg');
      reader.readAsDataURL(fileOrDataUrl);
    });
  }
  if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.length > 0) {
    return fileOrDataUrl;
  }
  return '/curatorial-masterpiece.svg';
}

// Backward-compatible alias for existing imports
export const uploadArtworkMediaToStorage = (file: File | Blob | string) => uploadMediaToSupabase(file, 'artworks', 'uploads');

// ==============================================================================
// 2. SUPABASE POSTGRES DATA LAYER (Artworks, Comments, Margins, Profiles)
// ==============================================================================

export interface CloudArtworkRow {
  id: string;
  user_id?: string;
  artist_name: string;
  artist_handle: string;
  artist_avatar?: string;
  title: string;
  category: string;
  media_url: string;
  thumbnail_url?: string;
  dimensions?: string;
  medium?: string;
  year?: number;
  description?: string;
  curator_note?: string;
  tags?: string[];
  likes_count?: number;
  views_count?: number;
  saves_count?: number;
  aspect_ratio?: string;
  color_palette?: string[];
  featured?: boolean;
  poetry_content?: any;
  video_data?: any;
  exhibition_id?: string;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export function mapRowToArtwork(row: CloudArtworkRow): Artwork {
  return {
    id: row.id,
    title: row.title || 'Untitled Masterpiece',
    artist: {
      id: row.user_id || `artist-${row.id}`,
      name: row.artist_name || 'Guest Artist',
      handle: row.artist_handle || '@guest',
      avatar: row.artist_avatar || '/curatorial-masterpiece.svg',
      verified: row.artist_name?.toLowerCase().includes('afshaan') || false
    },
    category: (row.category as any) || 'digital',
    mediaUrl: row.media_url || '/curatorial-masterpiece.svg',
    thumbnailUrl: row.thumbnail_url || row.media_url || '/curatorial-masterpiece.svg',
    dimensions: row.dimensions || 'Original Canvas',
    medium: row.medium || 'Fine Art',
    year: row.year || new Date().getFullYear(),
    description: row.description || '',
    curatorNote: row.curator_note,
    tags: Array.isArray(row.tags) && row.tags.length > 0 ? row.tags : ['Atelier Submission'],
    likesCount: row.likes_count || 0,
    viewsCount: row.views_count || 1,
    savesCount: row.saves_count || 0,
    createdAt: row.created_at || new Date().toISOString(),
    aspectRatio: (row.aspect_ratio as any) || 'tall',
    colorPalette: Array.isArray(row.color_palette) ? row.color_palette : ['#12141c', '#c9a875', '#333b4d', '#f0f3fa'],
    isLiked: false,
    isSaved: false,
    featured: row.featured ?? false,
    poetryContent: row.poetry_content,
    videoData: row.video_data,
    exhibitionId: row.exhibition_id,
    isDeleted: row.is_deleted ?? false
  };
}

export function mapArtworkToRow(artwork: Artwork): CloudArtworkRow {
  const isGuest = !artwork.artist?.id || 
                  artwork.artist.id.startsWith('guest') || 
                  artwork.artist.id.startsWith('artist-') || 
                  artwork.artist.id === 'guest';

  return {
    id: artwork.id,
    user_id: isGuest ? undefined : artwork.artist.id,
    artist_name: artwork.artist?.name || 'Guest Artist',
    artist_handle: artwork.artist?.handle || '@guest',
    artist_avatar: artwork.artist?.avatar || '/curatorial-masterpiece.svg',
    title: artwork.title || 'Untitled Masterpiece',
    category: artwork.category || 'digital',
    media_url: artwork.mediaUrl || '/curatorial-masterpiece.svg',
    thumbnail_url: artwork.thumbnailUrl || artwork.mediaUrl || '/curatorial-masterpiece.svg',
    dimensions: artwork.dimensions || 'Original Canvas',
    medium: artwork.medium || 'Fine Art',
    year: typeof artwork.year === 'number' ? artwork.year : parseInt(String(artwork.year)) || new Date().getFullYear(),
    description: artwork.description || '',
    curator_note: artwork.curatorNote || undefined,
    tags: Array.isArray(artwork.tags) && artwork.tags.length > 0 ? artwork.tags : ['Atelier Submission'],
    likes_count: artwork.likesCount || 0,
    views_count: artwork.viewsCount || 1,
    saves_count: artwork.savesCount || 0,
    aspect_ratio: artwork.aspectRatio || 'tall',
    color_palette: Array.isArray(artwork.colorPalette) && artwork.colorPalette.length > 0 ? artwork.colorPalette : ['#12141c', '#c9a875', '#333b4d', '#f0f3fa'],
    featured: artwork.featured ?? false,
    poetry_content: artwork.poetryContent || undefined,
    video_data: artwork.videoData || undefined,
    exhibition_id: artwork.exhibitionId || undefined,
    is_deleted: artwork.isDeleted ?? false,
    created_at: artwork.createdAt || new Date().toISOString()
  };
}

/**
 * Fetches all artworks from Supabase Postgres with sorting and filtering.
 */
export async function fetchArtworksFromSupabase(): Promise<Artwork[]> {
  const client = getSupabaseClient() || supabase;
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('artworks')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase Artworks Query Error]:', error.message);
      return [];
    }

    if (data && Array.isArray(data)) {
      return data.map((row: CloudArtworkRow) => mapRowToArtwork(row));
    }
  } catch (err) {
    console.warn('[Supabase Artworks Fetch Exception]:', err);
  }
  return [];
}

/**
 * Persists an artwork to Supabase Postgres.
 */
export async function saveArtworkToSupabase(artwork: Artwork): Promise<boolean> {
  const client = getSupabaseClient() || supabase;
  if (!client) return false;

  try {
    const row = mapArtworkToRow(artwork);
    const { data, error } = await client
      .from('artworks')
      .upsert(row, { onConflict: 'id' })
      .select();

    if (error) {
      console.warn('[Supabase Artwork Save Warning]:', error.message);
      // Foreign key error recovery: If user_id wasn't in profiles table, retry with user_id = null
      if (error.code === '23503' || error.message?.includes('violates foreign key')) {
        const retryRow = { ...row, user_id: null };
        const { error: retryError } = await client.from('artworks').upsert(retryRow, { onConflict: 'id' });
        if (!retryError) {
          console.log('[Supabase Artwork Save] Successfully persisted with null user_id:', artwork.id);
          return true;
        }
      }
      return false;
    }
    console.log('[Supabase Artwork Save Success]:', artwork.id, data);
    return true;
  } catch (err) {
    console.warn('[Supabase Artwork Save Exception]:', err);
    return false;
  }
}

/**
 * Updates an artwork in Supabase Postgres.
 */
export async function updateArtworkInSupabase(id: string, updates: Partial<Artwork>): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const rowUpdates: Record<string, any> = {};
    if (updates.title !== undefined) rowUpdates.title = updates.title;
    if (updates.description !== undefined) rowUpdates.description = updates.description;
    if (updates.medium !== undefined) rowUpdates.medium = updates.medium;
    if (updates.category !== undefined) rowUpdates.category = updates.category;
    if (updates.mediaUrl !== undefined) rowUpdates.media_url = updates.mediaUrl;
    if (updates.likesCount !== undefined) rowUpdates.likes_count = updates.likesCount;
    if (updates.viewsCount !== undefined) rowUpdates.views_count = updates.viewsCount;
    if (updates.savesCount !== undefined) rowUpdates.saves_count = updates.savesCount;
    if (updates.isDeleted !== undefined) rowUpdates.is_deleted = updates.isDeleted;
    if (updates.poetryContent !== undefined) rowUpdates.poetry_content = updates.poetryContent;
    if (updates.tags !== undefined) rowUpdates.tags = updates.tags;
    rowUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('artworks')
      .update(rowUpdates)
      .eq('id', id);

    if (error) {
      console.warn('[Supabase Artwork Update Error]:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Artwork Update Exception]:', err);
    return false;
  }
}

/**
 * Soft deletes an artwork from Supabase Postgres.
 */
export async function deleteArtworkFromSupabase(id: string): Promise<boolean> {
  return updateArtworkInSupabase(id, { isDeleted: true });
}

export const deleteArtworkInSupabase = deleteArtworkFromSupabase;

// ==============================================================================
// 3. COMMENTS & MARGIN REFLECTIONS
// ==============================================================================

export async function fetchCommentsFromSupabase(artworkId?: string): Promise<Comment[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    let query = supabase.from('comments').select('*');
    if (artworkId) {
      query = query.eq('artwork_id', artworkId);
    }
    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) return [];

    return (data || []).map((row) => ({
      id: row.id,
      artworkId: row.artwork_id,
      user: {
        id: row.user_id || 'guest',
        name: row.user_name || 'Guest Critic',
        handle: row.user_handle || '@guest',
        avatar: row.user_avatar || '/curatorial-masterpiece.svg',
        verified: row.user_verified ?? false
      },
      text: row.text,
      createdAt: row.created_at,
      likesCount: row.likes_count || 0,
      isLiked: false
    }));
  } catch {
    return [];
  }
}

export async function addCommentToSupabase(comment: Comment): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('comments').insert({
      id: comment.id,
      artwork_id: comment.artworkId,
      user_id: comment.user.id,
      user_name: comment.user.name,
      user_handle: comment.user.handle,
      user_avatar: comment.user.avatar,
      user_verified: comment.user.verified ?? false,
      text: comment.text,
      likes_count: comment.likesCount || 0,
      created_at: comment.createdAt || new Date().toISOString()
    });
    return !error;
  } catch {
    return false;
  }
}

export async function fetchMarginReflectionsFromSupabase(artworkId: string): Promise<MarginReflection[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('margin_reflections')
      .select('*')
      .eq('artwork_id', artworkId)
      .order('created_at', { ascending: true });

    if (error) return [];

    return (data || []).map((row) => ({
      id: row.id,
      artworkId: row.artwork_id,
      stanzaIndex: row.stanza_index || 0,
      lineIndex: row.line_index,
      verseSnippet: row.verse_snippet,
      author: {
        id: row.user_id || 'poet',
        name: row.author_name || 'Sanctuary Poet',
        handle: row.author_handle || '@poet',
        avatar: row.author_avatar || '/curatorial-masterpiece.svg',
        verified: row.author_verified ?? false
      },
      text: row.text,
      inkColor: row.ink_color || 'gold',
      createdAt: row.created_at,
      upvotes: row.upvotes || 1,
      isUpvoted: false,
      isCuratorPick: row.is_curator_pick ?? false
    }));
  } catch {
    return [];
  }
}

export async function addMarginReflectionToSupabase(reflection: MarginReflection): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('margin_reflections').insert({
      id: reflection.id,
      artwork_id: reflection.artworkId,
      stanza_index: reflection.stanzaIndex,
      line_index: reflection.lineIndex,
      verse_snippet: reflection.verseSnippet,
      user_id: reflection.author.id,
      author_name: reflection.author.name,
      author_handle: reflection.author.handle,
      author_avatar: reflection.author.avatar,
      author_verified: reflection.author.verified ?? false,
      text: reflection.text,
      ink_color: reflection.inkColor,
      upvotes: reflection.upvotes,
      is_curator_pick: reflection.isCuratorPick ?? false,
      created_at: reflection.createdAt
    });
    return !error;
  } catch {
    return false;
  }
}

// ==============================================================================
// 4. USER PROFILES & AUTHENTICATION
// ==============================================================================

export async function fetchProfilesFromSupabase(): Promise<UserProfile[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      handle: row.handle,
      avatar: row.avatar_url || '/curatorial-masterpiece.svg',
      coverImage: row.cover_url,
      bio: row.bio || '',
      discipline: row.discipline || 'Visual Artist & Poet',
      location: row.location || 'Global Atelier',
      favoriteQuote: row.quote_text ? { text: row.quote_text, author: row.quote_author || row.name } : undefined,
      website: row.website,
      instagram: row.instagram,
      twitter: row.twitter,
      email: row.email,
      phone: row.phone,
      verified: row.verified ?? false,
      artworksCount: row.artworks_count || 0,
      followersCount: row.followers_count || 0,
      followingCount: row.following_count || 0,
      badges: Array.isArray(row.badges) ? row.badges : ['Verified Artist']
    }));
  } catch {
    return [];
  }
}

export async function upsertProfileToSupabase(profile: UserProfile): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const quoteText = typeof profile.favoriteQuote === 'object' ? profile.favoriteQuote?.text : profile.favoriteQuote;
    const quoteAuthor = typeof profile.favoriteQuote === 'object' ? profile.favoriteQuote?.author : profile.name;

    const { error } = await supabase.from('profiles').upsert({
      id: profile.id,
      name: profile.name,
      handle: profile.handle,
      avatar_url: profile.avatar,
      cover_url: profile.coverImage,
      bio: profile.bio,
      discipline: profile.discipline,
      location: profile.location,
      quote_text: quoteText,
      quote_author: quoteAuthor,
      website: profile.website,
      instagram: profile.instagram,
      twitter: profile.twitter,
      email: profile.email,
      phone: profile.phone,
      verified: profile.verified ?? false,
      artworks_count: profile.artworksCount || 0,
      followers_count: profile.followersCount || 0,
      following_count: profile.followingCount || 0,
      badges: profile.badges || ['Verified Artist'],
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    return !error;
  } catch {
    return false;
  }
}

export async function fetchExhibitionsFromSupabase(): Promise<Exhibition[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return INITIAL_EXHIBITIONS;

  try {
    const { data, error } = await supabase.from('exhibitions').select('*');
    if (error || !data || data.length === 0) return INITIAL_EXHIBITIONS;

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle || '',
      curator: row.curator || 'Curatorial Board',
      coverImage: row.cover_image,
      description: row.description || '',
      dates: row.dates || '',
      theme: row.theme || '',
      artworkIds: row.artwork_ids || [],
      location: row.location || 'Grand Atelier Gallery'
    }));
  } catch {
    return INITIAL_EXHIBITIONS;
  }
}

export async function saveExhibitionToSupabase(exhibition: Exhibition): Promise<boolean> {
  const client = getSupabaseClient() || supabase;
  if (!client) return false;

  try {
    const { error } = await client.from('exhibitions').upsert({
      id: exhibition.id,
      title: exhibition.title,
      subtitle: exhibition.subtitle || '',
      curator: exhibition.curator || 'Curatorial Board',
      cover_image: exhibition.coverImage,
      description: exhibition.description || '',
      dates: exhibition.dates || '',
      theme: exhibition.theme || '',
      artwork_ids: exhibition.artworkIds || [],
      location: exhibition.location || 'Grand Atelier Gallery'
    }, { onConflict: 'id' });

    return !error;
  } catch {
    return false;
  }
}

export async function deleteExhibitionFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient() || supabase;
  if (!client) return false;

  try {
    const { error } = await client.from('exhibitions').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchCollectionsFromSupabase(userId: string): Promise<Collection[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      userId: row.user_id,
      artworkIds: row.artwork_ids || [],
      createdAt: row.created_at
    }));
  } catch {
    return [];
  }
}

// ==============================================================================
// 5. SUPABASE AUTH UTILITIES
// ==============================================================================

export async function signInWithSupabaseEmail(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { success: false, error: error?.message || 'Invalid email or password.' };
    }

    const supaUser = data.user;
    const isFounder = email.toLowerCase() === 'afshaan100@gmail.com' || supaUser.user_metadata?.handle === '@afshaanshaikh';

    const profile: UserProfile = {
      id: isFounder ? DEFAULT_USER.id : supaUser.id,
      name: supaUser.user_metadata?.name || (isFounder ? DEFAULT_USER.name : email.split('@')[0]),
      handle: supaUser.user_metadata?.handle || (isFounder ? DEFAULT_USER.handle : `@${email.split('@')[0]}`),
      avatar: supaUser.user_metadata?.avatar_url || (isFounder ? DEFAULT_USER.avatar : '/curatorial-masterpiece.svg'),
      bio: supaUser.user_metadata?.bio || (isFounder ? DEFAULT_USER.bio : 'Artist & curator on The Artisan’s Quill.'),
      discipline: supaUser.user_metadata?.discipline || (isFounder ? DEFAULT_USER.discipline : 'Visual Artist & Poet'),
      location: supaUser.user_metadata?.location || 'Global Atelier',
      email: supaUser.email || email,
      verified: isFounder ? true : (supaUser.user_metadata?.verified ?? true),
      artworksCount: 0,
      followersCount: 0,
      followingCount: 0,
      badges: isFounder ? DEFAULT_USER.badges : ['Verified Artist', 'Supabase Authenticated']
    };

    await upsertProfileToSupabase(profile);
    return { success: true, user: profile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Authentication error.' };
  }
}

export async function signUpWithSupabaseEmail(
  email: string,
  password: string,
  meta: { name: string; handle: string; discipline?: string; avatar?: string; bio?: string; location?: string }
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
  }

  try {
    const cleanHandle = meta.handle.startsWith('@') ? meta.handle : `@${meta.handle}`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: meta.name,
          handle: cleanHandle,
          discipline: meta.discipline || 'Visual Artist & Poet',
          avatar_url: meta.avatar || '/curatorial-masterpiece.svg',
          bio: meta.bio || '',
          location: meta.location || 'Global Atelier'
        }
      }
    });

    if (error || !data.user) {
      return { success: false, error: error?.message || 'Signup failed.' };
    }

    const supaUser = data.user;
    const isFounder = email.toLowerCase() === 'afshaan100@gmail.com' || cleanHandle === '@afshaanshaikh';

    const profile: UserProfile = {
      id: isFounder ? DEFAULT_USER.id : supaUser.id,
      name: meta.name,
      handle: cleanHandle,
      avatar: meta.avatar || '/curatorial-masterpiece.svg',
      bio: meta.bio || (isFounder ? DEFAULT_USER.bio : 'Artist on The Artisan’s Quill.'),
      discipline: meta.discipline || 'Visual Artist & Poet',
      location: meta.location || 'Global Atelier',
      email: email,
      verified: isFounder ? true : true,
      artworksCount: 0,
      followersCount: 0,
      followingCount: 0,
      badges: isFounder ? DEFAULT_USER.badges : ['Verified Artist']
    };

    await upsertProfileToSupabase(profile);
    return { success: true, user: profile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Signup error.' };
  }
}

export async function signOutSupabase(): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {}
  }
}

export async function getActiveSupabaseUser(): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const supaUser = session.user;
    const email = supaUser.email || '';
    const isFounder = email.toLowerCase() === 'afshaan100@gmail.com' || supaUser.user_metadata?.handle === '@afshaanshaikh';

    return {
      id: isFounder ? DEFAULT_USER.id : supaUser.id,
      name: supaUser.user_metadata?.name || (isFounder ? DEFAULT_USER.name : email.split('@')[0]),
      handle: supaUser.user_metadata?.handle || (isFounder ? DEFAULT_USER.handle : `@${email.split('@')[0]}`),
      avatar: supaUser.user_metadata?.avatar_url || (isFounder ? DEFAULT_USER.avatar : '/curatorial-masterpiece.svg'),
      bio: supaUser.user_metadata?.bio || (isFounder ? DEFAULT_USER.bio : 'Artist & curator on The Artisan’s Quill.'),
      discipline: supaUser.user_metadata?.discipline || (isFounder ? DEFAULT_USER.discipline : 'Visual Artist & Poet'),
      location: supaUser.user_metadata?.location || 'Global Atelier',
      email: email,
      verified: isFounder ? true : (supaUser.user_metadata?.verified ?? true),
      artworksCount: 0,
      followersCount: 0,
      followingCount: 0,
      badges: isFounder ? DEFAULT_USER.badges : ['Verified Artist', 'Supabase Authenticated']
    };
  } catch {
    return null;
  }
}

/**
 * Subscribes to Supabase Auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED).
 * Returns an unsubscribe function.
 */
export function onSupabaseAuthStateChange(
  callback: (event: string, session: SupabaseSession | null, user: UserProfile | null) => void
): () => void {
  const client = getSupabaseClient() || supabase;
  if (!client) return () => {};

  const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
    let userProfile: UserProfile | null = null;
    if (session?.user) {
      userProfile = await getActiveSupabaseUser();
    }
    callback(event, session, userProfile);
  });

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Persists an Inquiry into Supabase Postgres database.
 */
export async function saveInquiryToSupabase(inquiry: Inquiry): Promise<{ success: boolean; id: string }> {
  const client = getSupabaseClient() || supabase;
  if (!client) return { success: true, id: inquiry.id };

  try {
    const row = {
      id: inquiry.id,
      full_name: inquiry.fullName,
      email: inquiry.email,
      phone: inquiry.phone || null,
      inquiry_type: inquiry.inquiryType,
      message: inquiry.message,
      channel: inquiry.channel || 'both',
      status: inquiry.status || 'new',
      created_at: inquiry.createdAt || new Date().toISOString()
    };

    const { error } = await client.from('inquiries').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('[supabaseClient] Inquiries table upsert note:', error.message);
      // Fallback attempt with standard insert
      const { error: insertErr } = await client.from('inquiries').insert(row);
      if (insertErr) {
        console.warn('[supabaseClient] Inquiries insert fallback note:', insertErr.message);
      }
    }
    return { success: true, id: inquiry.id };
  } catch (err) {
    console.warn('[supabaseClient] saveInquiryToSupabase note:', err);
    return { success: true, id: inquiry.id };
  }
}


