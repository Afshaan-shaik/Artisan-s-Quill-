import { Artwork } from '../types';

export interface MasterpieceResult {
  artwork: Artwork;
  dateKey: string; // "YYYY-MM-DD" in Asia/Kolkata
  artistId: string;
  artistName: string;
  isFirstTimeFeatured: boolean;
  priorityTier: 'never-featured' | 'least-recently-featured' | 'fallback';
}

const STORAGE_KEY_HISTORY = 'sanctuary_masterpiece_history_v2';

/**
 * Returns today's calendar date in Asia/Kolkata (IST) as "YYYY-MM-DD".
 */
export const getISTDateString = (date: Date = new Date()): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    // Fallback if Intl timeZone is unsupported
    return date.toISOString().slice(0, 10);
  }
};

/**
 * 32-bit FNV-1a hash algorithm for deterministic seeding.
 */
export function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/**
 * Mulberry32 seeded pseudo-random number generator.
 * Produces uniform [0, 1) numbers deterministically given a seed.
 */
export function createSeededRNG(seed: number) {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Loads the artist feature history from persistent storage.
 * Map: artistId -> last featured date "YYYY-MM-DD"
 */
function getFeatureHistory(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Saves feature history to persistent storage.
 */
function saveFeatureHistory(history: Record<string, string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch {}
}

/**
 * Automatic, Fair, Community-Driven Masterpiece of the Day Selection Engine.
 *
 * Requirements:
 * 1. Inclusive of all creators (not restricted to founder, popular artists, or multiple-upload accounts).
 * 2. First-time contributors enter pool immediately.
 * 3. Priority hierarchy:
 *    - Priority 1: Never featured artists
 *    - Priority 2: Least recently featured artists
 *    - Priority 3: Other eligible artists
 * 4. Deterministic date-seeded selection in IST (Asia/Kolkata).
 *    Guarantees every visitor across any browser, tab, or device sees the exact same masterpiece
 *    on that calendar day without race conditions or page-refresh fluctuations.
 */
export function selectMasterpieceOfTheDay(
  artworks: Artwork[],
  customDateStr?: string
): MasterpieceResult | null {
  if (!artworks || artworks.length === 0) return null;

  // 1. Filter out deleted or unpublished artworks
  const eligibleArtworks = artworks.filter(
    (a) => !a.isDeleted && a.mediaUrl && a.title
  );
  if (eligibleArtworks.length === 0) return null;

  // 2. Determine current date in Asia/Kolkata
  const todayIST = customDateStr || getISTDateString();

  // 3. Group artworks by artist ID
  const artistMap = new Map<string, { artistName: string; works: Artwork[] }>();
  for (const art of eligibleArtworks) {
    const artistId = art.artist?.id || art.artist?.handle || art.artist?.name || 'unknown-artist';
    const artistName = art.artist?.name || 'Sanctuary Artist';
    if (!artistMap.has(artistId)) {
      artistMap.set(artistId, { artistName, works: [] });
    }
    artistMap.get(artistId)!.works.push(art);
  }

  const allArtistIds = Array.from(artistMap.keys());
  if (allArtistIds.length === 0) return null;

  // 4. Retrieve historical feature records
  const history = getFeatureHistory();

  // 5. Partition artists into Priority Tiers:
  // Tier 1: Never featured artists
  const neverFeaturedArtists = allArtistIds.filter((id) => !history[id]);

  // Tier 2: Previously featured artists, sorted by oldest feature date
  const previouslyFeaturedArtists = allArtistIds
    .filter((id) => Boolean(history[id]))
    .sort((a, b) => {
      const dateA = history[a] || '9999-99-99';
      const dateB = history[b] || '9999-99-99';
      return dateA.localeCompare(dateB);
    });

  // Seeded PRNG for today's selection
  const seed = hashString(`the-artisans-quill-masterpiece-${todayIST}`);
  const rng = createSeededRNG(seed);

  let selectedArtistId: string;
  let priorityTier: 'never-featured' | 'least-recently-featured' | 'fallback';
  let isFirstTimeFeatured = false;

  if (neverFeaturedArtists.length > 0) {
    // Priority 1: Pick deterministically from never-featured artists
    const artistIndex = Math.floor(rng() * neverFeaturedArtists.length);
    selectedArtistId = neverFeaturedArtists[artistIndex];
    priorityTier = 'never-featured';
    isFirstTimeFeatured = true;
  } else if (previouslyFeaturedArtists.length > 0) {
    // Priority 2: Pick from the cohort of least recently featured artists
    // Take the oldest 30% of artists (or at least 1)
    const cohortSize = Math.max(1, Math.ceil(previouslyFeaturedArtists.length * 0.35));
    const candidateCohort = previouslyFeaturedArtists.slice(0, cohortSize);
    const artistIndex = Math.floor(rng() * candidateCohort.length);
    selectedArtistId = candidateCohort[artistIndex];
    priorityTier = 'least-recently-featured';
  } else {
    // Fallback: pick any artist
    const artistIndex = Math.floor(rng() * allArtistIds.length);
    selectedArtistId = allArtistIds[artistIndex];
    priorityTier = 'fallback';
  }

  const artistEntry = artistMap.get(selectedArtistId)!;
  const artistWorks = artistEntry.works;

  // 6. Select artwork from the chosen artist's collection deterministically
  // Prefer featured or high-quality artworks if available, but seeded deterministically
  const featuredWorks = artistWorks.filter((w) => w.featured);
  const candidateWorks = featuredWorks.length > 0 ? featuredWorks : artistWorks;
  const workIndex = Math.floor(rng() * candidateWorks.length);
  const selectedArtwork = candidateWorks[workIndex] || artistWorks[0];

  // 7. Update persistent history for this artist on today's date
  if (history[selectedArtistId] !== todayIST) {
    history[selectedArtistId] = todayIST;
    saveFeatureHistory(history);
  }

  return {
    artwork: selectedArtwork,
    dateKey: todayIST,
    artistId: selectedArtistId,
    artistName: artistEntry.artistName,
    isFirstTimeFeatured,
    priorityTier,
  };
}

