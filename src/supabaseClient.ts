/**
 * The Artisan's Quill — Supabase Client Entrypoint
 * Re-exports the initialized Supabase client and storage/database helpers.
 */
export {
  supabase,
  getSupabaseClient,
  isSupabaseConfigured,
  uploadMediaToSupabase,
  uploadArtworkMediaToStorage,
  fetchArtworksFromSupabase,
  saveArtworkToSupabase,
  updateArtworkInSupabase,
  deleteArtworkFromSupabase,
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
  signInWithSupabaseEmail,
  signUpWithSupabaseEmail,
  signOutSupabase,
  getActiveSupabaseUser,
  onSupabaseAuthStateChange,
  mapRowToArtwork,
  mapArtworkToRow
} from './services/supabaseClient';

export type { CloudArtworkRow } from './services/supabaseClient';
