import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  Layers,
  Feather,
  Palette,
  Bookmark,
  BookMarked,
  Plus,
  RefreshCw,
  Compass,
  Database,
  Eye,
  Trash2,
  Heart,
  Clock,
  Award,
  Film,
  ArrowRight,
  Disc3,
  Music,
  Play,
  Pause
} from 'lucide-react';
import { Artwork, ArtCategory, UserProfile, Exhibition } from './types';
import { DEFAULT_USER } from './data/initialData';
import { GalleryService, isFounderUser } from './services/api';
import { resolveAudioUrl, isDerryArtwork } from './utils/audioResolver';
import { useRealtimeGallery } from './hooks/useRealtimeGallery';
import { useGalleryStore } from './store/useGalleryStore';
import { Navbar } from './components/Navbar';
import { MagnifyingDockNavbar } from './components/MagnifyingDockNavbar';
import { GallerySpineNavbar } from './components/GallerySpineNavbar';
import { DynamicIslandNavbar } from './components/DynamicIslandNavbar';
import { MasonryGrid } from './components/MasonryGrid';
import { UploadModal } from './components/UploadModal';
import { realtimeBroker } from './services/realtimeBroker';
import { ArtworkDetailModal } from './components/ArtworkDetailModal';
import { ExhibitionsView } from './components/ExhibitionsView';
import { ArtistProfileModal } from './components/ArtistProfileModal';
import { ExhibitionUploadModal } from './components/ExhibitionUploadModal';
import { FloatingGuestbook } from './components/FloatingGuestbook';
import { EditArtworkModal } from './components/EditArtworkModal';
import { CuratorialSpotlight } from './components/CuratorialSpotlight';
import { RedesignedHeroSection } from './components/RedesignedHeroSection';
import { RedesignedPoetrySection } from './components/RedesignedPoetrySection';
import { RedesignedMusicSection } from './components/RedesignedMusicSection';
import { RedesignedFooter } from './components/RedesignedFooter';
import { NightSkyEnding } from './components/NightSkyEnding';
import { selectMasterpieceOfTheDay } from './services/masterpieceEngine';
import { ArtisticCursor } from './components/ArtisticCursor';
import { ShareArtworkModal } from './components/ShareArtworkModal';
import { AboutUsView } from './components/AboutUsView';
import { ProfilePictureModal } from './components/ProfilePictureModal';
import { AddProfileModal } from './components/AddProfileModal';
import { GalleryWallModal } from './components/GalleryWallModal';
import { CertificateOfAuthenticityModal } from './components/CertificateOfAuthenticityModal';
import { ColorStudioModal } from './components/ColorStudioModal';
import { FragmentInspectorModal } from './components/FragmentInspectorModal';
import { AuthModal } from './components/AuthModal';
import { MoodBoardsView } from './components/MoodBoardsView';
import { CommunityHubView } from './components/CommunityHubView';
import { AddToMoodBoardModal } from './components/AddToMoodBoardModal';
import { CinemaModePlayer } from './components/CinemaModePlayer';
import { ReadingQueueView } from './components/ReadingQueueView';
import { FluidInkPoetryStudioModal } from './components/FluidInkPoetryStudioModal';
import PoetrySanctuaryView from './components/PoetrySanctuaryView';
import CustomPoemModal, { type PoemFormData } from './components/CustomPoemModal';
import { AIPoeticBardModal } from './components/AIPoeticBardModal';
import { ConstellationStarMapModal } from './components/ConstellationStarMapModal';
import { ConstellationCosmosView } from './components/ConstellationCosmosView';
import { OriginalMusicSection } from './components/OriginalMusicSection';
import { Collector3DVaultModal } from './components/Collector3DVaultModal';
import { PoeticScrollModal } from './components/PoeticScrollModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import IntroWrapper from './components/IntroWrapper';
import { MeshDriftBackground } from './components/MeshDriftBackground';
import {
  subscribeToCloudArtworks,
  subscribeToCloudComments,
  signOutFirebaseUser
} from './services/firebase';
import { getActiveSupabaseUser, signOutSupabase, onSupabaseAuthStateChange } from './services/supabaseClient';
import {
  extractArtworkIdFromLocation,
  syncArtworkUrl
} from './utils/permalinkUtils';

export default function App() {
  const { artworks: realtimeArtworks, isRealtimeConnected, toggleLike: toggleRealtimeLike, toggleSave: toggleRealtimeSave } = useRealtimeGallery();
  const selectedCategory = useGalleryStore(state => state.selectedCategory);
  const setSelectedCategory = useGalleryStore(state => state.setSelectedCategory);
  const searchQuery = useGalleryStore(state => state.searchQuery);
  const setSearchQuery = useGalleryStore(state => state.setSearchQuery);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>(() => {
    try {
      return GalleryService.getExhibitions();
    } catch {
      return [];
    }
  });
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      return GalleryService.getCurrentUser();
    } catch {
      return DEFAULT_USER;
    }
  });
  const [headerVariant, setHeaderVariant] = useState<'dock' | 'classic' | 'spine' | 'island'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ui = params.get('ui') || params.get('concept');
      if (ui === 'island' || ui === 'dynamic-island' || ui === '10' || window.location.port === '5175' || window.location.port === '5176') return 'island';
      if (ui === 'spine' || ui === '2' || ui === 'gallery-spine' || window.location.port === '5174') return 'spine';
      if (ui === 'classic' || ui === '1') return 'classic';
      if (ui === 'dock' || ui === '3' || window.location.port === '5173') return 'dock';
    }
    return 'island';
  });

  useEffect(() => {
    const handleUrlCheck = () => {
      const params = new URLSearchParams(window.location.search);
      const ui = params.get('ui') || params.get('concept');
      if (ui === 'island' || ui === 'dynamic-island' || ui === '10' || window.location.port === '5175' || window.location.port === '5176') {
        setHeaderVariant('island');
      } else if (ui === 'spine' || ui === '2' || ui === 'gallery-spine' || window.location.port === '5174') {
        setHeaderVariant('spine');
      } else if (ui === 'dock' || ui === '3' || window.location.port === '5173') {
        setHeaderVariant('dock');
      } else if (ui === 'classic' || ui === '1') {
        setHeaderVariant('classic');
      }
    };
    window.addEventListener('popstate', handleUrlCheck);
    return () => window.removeEventListener('popstate', handleUrlCheck);
  }, []);

  // Navigation & Filtering State
  const getValidViewFromUrl = (): 'feed' | 'cosmos' | 'exhibitions' | 'saved' | 'about' | 'recycle-bin' | 'community' | 'vaults' => {
    if (typeof window === 'undefined') return 'feed';
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const paramView = params.get('view') || params.get('tab');
    const path = window.location.pathname.replace(/^\//, '').toLowerCase();

    const target = hash || paramView || path;
    if (target === 'stream' || target === 'feed' || target === 'works' || target === 'preview' || target === 'redesign') return 'feed';
    const validViews = ['feed', 'cosmos', 'exhibitions', 'saved', 'about', 'recycle-bin', 'community', 'vaults'];
    if (validViews.includes(target)) {
      return target as any;
    }
    if (['connect-section', 'inquire', 'inquiries', 'collabs', 'collaborations', 'inquiries-collabs'].includes(target)) {
      return 'about';
    }
    return 'feed';
  };

  const [activeView, setActiveView] = useState<'feed' | 'cosmos' | 'exhibitions' | 'saved' | 'about' | 'recycle-bin' | 'community' | 'vaults'>(() => {
    return getValidViewFromUrl();
  });

  const handleSelectView = (view: 'feed' | 'cosmos' | 'exhibitions' | 'saved' | 'about' | 'recycle-bin' | 'community' | 'vaults') => {
    setActiveView(view);
    if (view === 'saved') {
      useGalleryStore.getState().syncSavedArtworksFromSupabase(currentUser.id).catch(() => {});
    }
    if (typeof window !== 'undefined') {
      if (view === 'feed') {
        if (window.location.hash) {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } else {
        window.location.hash = view;
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  // Ensure any view change immediately starts from the top of that page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [activeView]);

  // Bidirectional URL sync: listen to hashchange, popstate, window focus, and tab visibility switching
  useEffect(() => {
    const handleLocationSync = () => {
      const target = getValidViewFromUrl();
      setActiveView(target);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    window.addEventListener('hashchange', handleLocationSync);
    window.addEventListener('popstate', handleLocationSync);
    window.addEventListener('focus', handleLocationSync);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleLocationSync();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('hashchange', handleLocationSync);
      window.removeEventListener('popstate', handleLocationSync);
      window.removeEventListener('focus', handleLocationSync);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Ambient gold candle-lit cursor glow tracker (Redesign Preview Engine)
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const glowEl = document.getElementById('glow');
      if (glowEl) {
        glowEl.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);
  const [feedFilter, setFeedFilter] = useState<'curated' | 'popular' | 'latest'>('curated');
  const [dateRangeFilter, setDateRangeFilter] = useState<{ start?: string; end?: string; }>({});

  // Modals
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(() => {
    const targetId = extractArtworkIdFromLocation();
    if (targetId) {
      return GalleryService.getArtworkById(targetId) || null;
    }
    return null;
  });
  const [isResolvingDeepLink, setIsResolvingDeepLink] = useState<boolean>(false);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isExhibitionModalOpen, setIsExhibitionModalOpen] = useState(false);
  const [uploadModalCategory, setUploadModalCategory] = useState<ArtCategory>('digital');
  const [uploadModalFormat, setUploadModalFormat] = useState<string>('digital art');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [artworkToEdit, setArtworkToEdit] = useState<Artwork | null>(null);
  const [artworkToShare, setArtworkToShare] = useState<Artwork | null>(null);
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<UserProfile | null>(null);
  const [isAddProfileModalOpen, setIsAddProfileModalOpen] = useState(false);
  const [addProfileModalInitialTab, setAddProfileModalInitialTab] = useState<'details' | 'avatar' | 'quote' | 'social'>('details');
  const [isAddProfileCreateMode, setIsAddProfileCreateMode] = useState(false);
  const [isColorStudioOpen, setIsColorStudioOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInkStudioOpen, setIsInkStudioOpen] = useState(false);
  const [isBardModalOpen, setIsBardModalOpen] = useState(false);
  const [activePoemForBard, setActivePoemForBard] = useState<{
    title: string;
    author: string;
    authorHandle?: string;
    content: string;
  } | null>(null);
  const [isConstellationOpen, setIsConstellationOpen] = useState(false);
  const [isCollectorVaultOpen, setIsCollectorVaultOpen] = useState(false);
  const [isScrollModalOpen, setIsScrollModalOpen] = useState(false);
  const [activePoemForScroll, setActivePoemForScroll] = useState<{
    title: string;
    author: string;
    authorHandle?: string;
    stanzas: string[];
    subtitle?: string;
  } | null>(null);

  // ── Poetry Sanctuary: Write / Edit modal state ──────────────────────
  const [isPoemModalOpen, setIsPoemModalOpen] = useState(false);
  const [poemToEdit, setPoemToEdit] = useState<Artwork | null>(null);

  const handleOpenBardWithPoem = (poem?: { title: string; author: string; authorHandle?: string; content: string }) => {
    if (poem) {
      setActivePoemForBard(poem);
    }
    setIsBardModalOpen(true);
  };

  const handleOpenScrollWithPoem = (poem: {
    title: string;
    author: string;
    authorHandle?: string;
    stanzas: string[];
    subtitle?: string;
  }) => {
    setActivePoemForScroll(poem);
    setIsScrollModalOpen(true);
  };
  const [artworkForMoodBoard, setArtworkForMoodBoard] = useState<Artwork | null>(null);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');

  // Immersive Deep Fragment & Gallery Features
  const [artworkForFragmentInspector, setArtworkForFragmentInspector] = useState<Artwork | null>(null);
  const [artworkForGalleryWall, setArtworkForGalleryWall] = useState<Artwork | null>(null);
  const [artworkForCertificate, setArtworkForCertificate] = useState<Artwork | null>(null);
  const [artworkForColorStudio, setArtworkForColorStudio] = useState<Artwork | null>(null);

  // Notification Banner
  const [statusNotification, setStatusNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Cinema Mode
  const [isCinemaModeOpen, setIsCinemaModeOpen] = useState(false);

  // Curatorial Grid Density ('grande' = 2 cols, 'curatorial' = 3 cols default, 'archive' = 4 cols)
  const [gridDensity, setGridDensity] = useState<'grande' | 'curatorial' | 'archive'>('curatorial');

  // Reading Queue (Saved View sub-tab)
  const [savedTab, setSavedTab] = useState<'works' | 'queue'>('works');

  const [selectedExhibitionId, setSelectedExhibitionId] = useState<string | null>(null);

  // Original Music Shelf Audio Preview State (for All Works view)
  const [shelfAudioPlayingId, setShelfAudioPlayingId] = useState<string | null>(null);
  const shelfAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggleShelfAudio = (track: Artwork, e: React.MouseEvent) => {
    e.stopPropagation();
    const audioUrl = resolveAudioUrl(track);
    if (!audioUrl) return;

    if (shelfAudioPlayingId === track.id) {
      if (shelfAudioRef.current) {
        shelfAudioRef.current.pause();
      }
      setShelfAudioPlayingId(null);
    } else {
      if (!shelfAudioRef.current) {
        shelfAudioRef.current = new Audio();
        shelfAudioRef.current.onended = () => setShelfAudioPlayingId(null);
        shelfAudioRef.current.onerror = () => setShelfAudioPlayingId(null);
      }
      shelfAudioRef.current.src = audioUrl;
      shelfAudioRef.current.play().catch(() => {});
      setShelfAudioPlayingId(track.id);
    }
  };

  useEffect(() => {
    return () => {
      if (shelfAudioRef.current) {
        shelfAudioRef.current.pause();
        shelfAudioRef.current = null;
      }
    };
  }, []);

  const triggerNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setStatusNotification({ message, type });
    setTimeout(() => setStatusNotification(null), 4500);
  };

  // Load artworks based on view and active artist
  const refreshArtworks = () => {
    const activeArtist = GalleryService.getCurrentUser();
    setCurrentUser(activeArtist);
    setExhibitions(GalleryService.getExhibitions());
  };

  const artworks = React.useMemo(() => {
    let list = [...realtimeArtworks].filter((a) => !isDerryArtwork(a));
    
    if (activeView === 'recycle-bin') {
      list = GalleryService.getDeletedArtworks(currentUser);
    } else {
      // Category filter
      if (activeView === 'saved') {
        list = list.filter(a => a.isSaved);
      } else {
        if (selectedCategory !== 'all') {
          list = list.filter(a => a.category === selectedCategory);
        }
      }

      // Comprehensive Multi-Field Search Filter (Title, Artist, Category, Medium, Tags, Description, Year, Poetry)
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        list = list.filter((a) => {
          const titleMatch = a.title?.toLowerCase().includes(q);
          const artistNameMatch =
            a.artist?.name?.toLowerCase().includes(q) || a.artist?.handle?.toLowerCase().includes(q);
          const categoryMatch = a.category?.toLowerCase().includes(q);
          const mediumMatch = a.medium?.toLowerCase().includes(q);
          const descMatch = a.description?.toLowerCase().includes(q);
          const yearMatch = a.year?.toString().includes(q);
          const tagsMatch = a.tags && a.tags.some((t) => t.toLowerCase().includes(q));
          const poetryMatch =
            a.poetryContent?.stanzas &&
            a.poetryContent.stanzas.some((s) => s.toLowerCase().includes(q));
          const musicMatch =
            a.musicData &&
            ((a.musicData.genre && a.musicData.genre.toLowerCase().includes(q)) ||
              (a.musicData.album && a.musicData.album.toLowerCase().includes(q)) ||
              (a.musicData.lyrics && a.musicData.lyrics.toLowerCase().includes(q)));
          const exhibitionMatch = a.exhibitionName?.toLowerCase().includes(q);

          return (
            titleMatch ||
            artistNameMatch ||
            categoryMatch ||
            mediumMatch ||
            descMatch ||
            yearMatch ||
            tagsMatch ||
            poetryMatch ||
            musicMatch ||
            exhibitionMatch
          );
        });
      }

      // Feed filter
      if (activeView !== 'saved') {
        if (feedFilter === 'popular') {
          list.sort((a, b) => b.likesCount - a.likesCount);
        } else if (feedFilter === 'latest') {
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (feedFilter === 'curated' && selectedCategory === 'all' && !searchQuery) {
          // Category-priority ordering: Digital Media → Motion Loops → Original Music → Paintings → Drawings → Poetry
          const CATEGORY_ORDER: Record<string, number> = {
            digital: 0,
            video: 1,
            music: 2,
            painting: 3,
            drawing: 4,
            poetry: 5,
          };
          list.sort((a, b) => {
            const aPriority = CATEGORY_ORDER[a.category] ?? 6;
            const bPriority = CATEGORY_ORDER[b.category] ?? 6;
            if (aPriority !== bPriority) return aPriority - bPriority;
            // Within same category: featured first, then by date descending
            if (a.featured !== b.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        }
      }

      // Date range filter
      if (dateRangeFilter.start) {
        list = list.filter(a => new Date(a.createdAt) >= new Date(dateRangeFilter.start!));
      }
      if (dateRangeFilter.end) {
        list = list.filter(a => new Date(a.createdAt) <= new Date(dateRangeFilter.end!));
      }
      
      // Exhibition filter
      if (selectedExhibitionId) {
        const exh = exhibitions.find(e => e.id === selectedExhibitionId);
        if (exh) {
          list = list.filter(a => exh.artworkIds.includes(a.id));
        }
      }
    }
    
    return list;
  }, [realtimeArtworks, selectedCategory, searchQuery, activeView, feedFilter, dateRangeFilter, currentUser]);

  // Module 2: Community-driven deterministic Masterpiece of the Day
  const dailyMasterpiece = useMemo(() => {
    return selectMasterpieceOfTheDay(realtimeArtworks);
  }, [realtimeArtworks]);

  // Check if any modal is currently open to pause stream rotation
  const isAnyModalOpen = Boolean(
    selectedArtwork ||
    isUploadModalOpen ||
    isExhibitionModalOpen ||
    isEditModalOpen ||
    isProfilePictureModalOpen ||
    isAddProfileModalOpen ||
    isAuthModalOpen ||
    isBardModalOpen ||
    isConstellationOpen ||
    isCollectorVaultOpen ||
    isCinemaModeOpen ||
    isPoemModalOpen ||
    isScrollModalOpen ||
    isColorStudioOpen ||
    isInkStudioOpen
  );

  // Open artwork and sync URL parameter for direct permalinks
  const handleOpenArtwork = (art: Artwork | null) => {
    setSelectedArtwork(art);
    syncArtworkUrl(art, 'push');
  };

  const handleCloseArtwork = () => {
    setSelectedArtwork(null);
    syncArtworkUrl(null, 'push');
  };

  /**
   * Centralized, bulletproof deep-link resolver.
   * Resolves ANY shared artwork across WhatsApp, Telegram, Instagram, Email, Google, or direct URL:
   * 1. Checks memory cache (0ms instant response)
   * 2. Direct query to Supabase Postgres database (authoritative cloud sync)
   * 3. Fallback to Cloud Firestore
   * Seamlessly injects the resolved artwork into the gallery stream so all controls work.
   */
  const resolveAndOpenArtwork = React.useCallback(
    async (artworkId: string, syncMode: 'push' | 'replace' = 'replace') => {
      if (!artworkId) {
        setSelectedArtwork(null);
        syncArtworkUrl(null, syncMode);
        return;
      }

      const cleanId = artworkId.trim();

      // 1. Immediate synchronous resolution from memory cache or store
      const synchronousArt =
        GalleryService.getArtworkById(cleanId) ||
        useGalleryStore.getState().artworks.find(
          (a) => a.id === cleanId || a.id.toLowerCase() === cleanId.toLowerCase()
        );

      if (synchronousArt) {
        setSelectedArtwork(synchronousArt);
        syncArtworkUrl(synchronousArt, syncMode);
        return;
      }

      // 2. High-speed asynchronous cloud resolution from Supabase Postgres database / Firestore
      try {
        setIsResolvingDeepLink(true);
        const cloudArt = await GalleryService.fetchArtworkById(cleanId);
        if (cloudArt) {
          // Non-destructively inject into store so it belongs to active gallery stream
          useGalleryStore.getState().prependArtwork(cloudArt);
          setSelectedArtwork(cloudArt);
          syncArtworkUrl(cloudArt, syncMode);
        } else {
          console.warn('[Sanctuary Deep-Link] Artwork not found for ID:', cleanId);
          triggerNotification('Requested artwork is unavailable or has been archived.', 'info');
          syncArtworkUrl(null, syncMode);
        }
      } catch (err) {
        console.error('[Sanctuary Deep-Link] Error fetching artwork:', err);
        syncArtworkUrl(null, syncMode);
      } finally {
        setIsResolvingDeepLink(false);
      }
    },
    []
  );

  useEffect(() => {
    // Cleanse any legacy cached Derry entries from local state
    try {
      const savedKey = 'atelier_user_saved_artwork_ids_v2';
      const rawSaved = localStorage.getItem(savedKey);
      if (rawSaved && /derry|qwTop2qs1tE/i.test(rawSaved)) {
        const parsed = JSON.parse(rawSaved) as string[];
        const cleansed = parsed.filter(id => !/derry|qwTop2qs1tE/i.test(id));
        localStorage.setItem(savedKey, JSON.stringify(cleansed));
      }
      const historyKey = 'atelier_music_history_v1';
      const rawHist = localStorage.getItem(historyKey);
      if (rawHist && /derry|qwTop2qs1tE/i.test(rawHist)) {
        const parsed = JSON.parse(rawHist) as any[];
        const cleansed = parsed.filter(t => !/derry|qwTop2qs1tE/i.test(t.id || '') && !/derry/i.test(t.title || ''));
        localStorage.setItem(historyKey, JSON.stringify(cleansed));
      }
    } catch {}

    GalleryService.init().then(() => {
      // Creator session preservation guard:
      const activeProfile = GalleryService.getCurrentUser();
      if (isFounderUser(activeProfile)) {
        setCurrentUser(activeProfile);
      } else if (GalleryService.isGuestSession()) {
        getActiveSupabaseUser().then((supaUser) => {
          if (supaUser) {
            GalleryService.saveCurrentUser(supaUser);
            setCurrentUser(supaUser);
            refreshArtworks();
          } else {
            fetch('/api/auth/me')
              .then((res) => res.json())
              .then((data) => {
                if (data?.authenticated && data?.user) {
                  GalleryService.saveCurrentUser(data.user);
                  setCurrentUser(data.user);
                  refreshArtworks();
                }
              })
              .catch(() => {});
          }
        }).catch(() => {});
      } else {
        setCurrentUser(activeProfile);
      }

      refreshArtworks();
      useGalleryStore.getState().loadArtworksFromDatabase(activeProfile?.id).catch(() => {});

      // Deep linking: Immediately open the requested artwork if shared via direct link / WhatsApp / social
      const targetArtworkId = extractArtworkIdFromLocation();
      if (targetArtworkId) {
        resolveAndOpenArtwork(targetArtworkId, 'replace');
      }
    });

    const unsubscribeSupabaseAuth = onSupabaseAuthStateChange((event, session, supaUser) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (supaUser) {
          GalleryService.saveCurrentUser(supaUser);
          setCurrentUser(supaUser);
          refreshArtworks();
          useGalleryStore.getState().loadArtworksFromDatabase(supaUser.id).catch(() => {});
        }
      } else if (event === 'SIGNED_OUT') {
        const current = GalleryService.getCurrentUser();
        // Strict preservation: NEVER demote or log out the sanctuary creator
        if (isFounderUser(current)) {
          return;
        }
        const guest = GalleryService.getCurrentUser();
        setCurrentUser(guest);
        refreshArtworks();
      }
    });

    const unsubscribeComments = subscribeToCloudComments((cloudComments) => {
      GalleryService.mergeCloudComments(cloudComments);
    });

    const handleAvatarsUpdated = () => {
      useGalleryStore.getState().setArtworks(GalleryService.getArtworks());
    };
    window.addEventListener('atelier_artworks_avatars_updated', handleAvatarsUpdated);

    const unsubscribeRealtime = realtimeBroker.subscribe((event) => {
      if (event.type === 'PROFILE_UPDATED') {
        const updatedProfile = event.payload;
        GalleryService.handleProfileUpdate(updatedProfile);

        const current = GalleryService.getCurrentUser();
        const isCurrentMatch =
          current.id === updatedProfile.id ||
          (current.handle && updatedProfile.handle && current.handle.toLowerCase() === updatedProfile.handle.toLowerCase()) ||
          (isFounderUser(current) && isFounderUser(updatedProfile));

        if (isCurrentMatch) {
          setCurrentUser(updatedProfile);
        }
        refreshArtworks();
        useGalleryStore.getState().setArtworks(GalleryService.getArtworks());
      }
    });

    return () => {
      window.removeEventListener('atelier_artworks_avatars_updated', handleAvatarsUpdated);
      unsubscribeComments();
      unsubscribeSupabaseAuth();
      unsubscribeRealtime();
    };
  }, [resolveAndOpenArtwork]);

  // Listen to browser Back/Forward (popstate) and hash navigation
  useEffect(() => {
    const handleLocationSync = () => {
      const targetArtworkId = extractArtworkIdFromLocation();
      if (targetArtworkId) {
        resolveAndOpenArtwork(targetArtworkId, 'replace');
      } else {
        setSelectedArtwork(null);
        syncArtworkUrl(null, 'replace');
      }
    };

    window.addEventListener('popstate', handleLocationSync);
    window.addEventListener('hashchange', handleLocationSync);
    return () => {
      window.removeEventListener('popstate', handleLocationSync);
      window.removeEventListener('hashchange', handleLocationSync);
    };
  }, [resolveAndOpenArtwork]);

  // Reactive synchronization: If a deep-linked artwork ID is in URL, ensure selectedArtwork is populated
  useEffect(() => {
    const activeUrlArtworkId = extractArtworkIdFromLocation();
    if (activeUrlArtworkId && (!selectedArtwork || selectedArtwork.id !== activeUrlArtworkId)) {
      const match = realtimeArtworks.find(
        (a) => a.id === activeUrlArtworkId || a.id.toLowerCase() === activeUrlArtworkId.toLowerCase()
      );
      if (match) {
        setSelectedArtwork(match);
        syncArtworkUrl(match, 'replace');
      }
    }
  }, [realtimeArtworks, selectedArtwork]);

  // Real-time synchronization: When the open artwork receives likes/saves/comments/edits from other users
  useEffect(() => {
    if (selectedArtwork) {
      const fresh = realtimeArtworks.find((a) => a.id === selectedArtwork.id);
      if (
        fresh &&
        (fresh.likesCount !== selectedArtwork.likesCount ||
          fresh.savesCount !== selectedArtwork.savesCount ||
          fresh.viewsCount !== selectedArtwork.viewsCount ||
          fresh.title !== selectedArtwork.title ||
          fresh.description !== selectedArtwork.description)
      ) {
        setSelectedArtwork((prev) => (prev ? { ...prev, ...fresh } : fresh));
      }
    }
  }, [realtimeArtworks, selectedArtwork]);

  useEffect(() => {
    refreshArtworks();
  }, [selectedCategory, searchQuery, activeView, feedFilter, dateRangeFilter, currentUser.id]);

  // Actions
  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleRealtimeLike(id);
    if (selectedArtwork && selectedArtwork.id === id) {
      setSelectedArtwork((prev) => {
        if (!prev) return null;
        const nextLiked = !prev.isLiked;
        return {
          ...prev,
          isLiked: nextLiked,
          likesCount: Math.max(0, prev.likesCount + (nextLiked ? 1 : -1))
        };
      });
    }
  };

  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleRealtimeSave(id, currentUser.id);
    GalleryService.toggleSaveArtwork(id, currentUser.id);
    if (selectedArtwork && selectedArtwork.id === id) {
      setSelectedArtwork((prev) => {
        if (!prev) return null;
        const nextSaved = !prev.isSaved;
        return {
          ...prev,
          isSaved: nextSaved,
          savesCount: Math.max(0, prev.savesCount + (nextSaved ? 1 : -1))
        };
      });
    }
  };

  const handleSelectArtist = (artistId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedArtistId(artistId);
  };


  const handleExhibitionUploadSuccess = (exhibition: Omit<Exhibition, 'id'>) => {
    GalleryService.createExhibition(exhibition);
    setIsExhibitionModalOpen(false);
    refreshArtworks();
    triggerNotification(`Exhibition "${exhibition.title}" inaugurated.`, 'success');
  };

  const handleDeleteExhibition = (id: string) => {
    GalleryService.deleteExhibition(id);
    refreshArtworks();
  };

  const handleOpenUpload = (category?: ArtCategory, format?: string) => {
    setUploadModalCategory(category || 'digital');
    if (format) setUploadModalFormat(format);
    setIsUploadModalOpen(true);
  };

  const handleUploadSuccess = (newArtwork: Artwork) => {
    realtimeBroker.broadcastArtwork(newArtwork);
    // Redesigned UploadModal shows the in-modal Welcome to the Sanctuary success state
    triggerNotification(`"${newArtwork.title}" successfully inaugurated into the sanctuary.`, 'success');
  };
  
  const handleSelectExhibition = (exhibitionId: string) => {
    setSelectedExhibitionId(exhibitionId);
    handleSelectView('feed');
    setSelectedCategory('all');
  };

  const handleEditArtwork = (artwork: Artwork) => {
    if (currentUser.id === 'guest') {
      triggerNotification('Guest visitors cannot edit artworks. Please sign in or create an artist profile to manage creations.', 'error');
      return;
    }
    if (!GalleryService.canUserManageArtwork(artwork, currentUser)) {
      triggerNotification(`Access Denied: "${artwork.title}" was created by ${artwork.artist.name}. Only the author can edit this artwork.`, 'error');
      return;
    }
    setArtworkToEdit(artwork);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedArtwork: Artwork) => {
    if (currentUser.id === 'guest') {
      triggerNotification('Guest visitors cannot edit artworks. Please sign in or create an artist profile.', 'error');
      return;
    }
    const res = GalleryService.updateArtwork(updatedArtwork.id, updatedArtwork, currentUser);
    if (res.error) {
      triggerNotification(res.error, 'error');
      return;
    }
    setIsEditModalOpen(false);
    setArtworkToEdit(null);
    refreshArtworks();
    if (res.artwork) {
      setSelectedArtwork(res.artwork);
      triggerNotification(`Changes to "${res.artwork.title}" saved successfully.`, 'success');
    }
  };

  const handleDeleteArtwork = (id: string) => {
    if (currentUser.id === 'guest') {
      triggerNotification('Guest visitors cannot delete artworks. Please sign in or create an artist profile to manage creations.', 'error');
      return;
    }
    const res = GalleryService.deleteArtwork(id, currentUser);
    if (!res.success) {
      triggerNotification(res.message, 'error');
      return;
    }
    setSelectedArtwork(null);
    syncArtworkUrl(null, 'replace');
    refreshArtworks();
    triggerNotification(res.message, 'success');
  };

  // ── Poetry Sanctuary handlers ─────────────────────────────────────────

  const handleWritePoem = () => {
    setPoemToEdit(null);
    setIsPoemModalOpen(true);
  };

  const handleEditPoem = (poem: Artwork) => {
    if (currentUser.id === 'guest') {
      triggerNotification('Guest visitors cannot edit poems. Please sign in or create an artist profile to manage creations.', 'error');
      return;
    }
    if (!GalleryService.canUserManageArtwork(poem, currentUser)) {
      triggerNotification(`Only the author can edit "${poem.title}".`, 'error');
      return;
    }
    setPoemToEdit(poem);
    setIsPoemModalOpen(true);
  };

  const handleDeletePoem = (poem: Artwork) => {
    if (currentUser.id === 'guest') {
      triggerNotification('Guest visitors cannot delete poems. Please sign in or create an artist profile to manage creations.', 'error');
      return;
    }
    const res = GalleryService.deleteArtwork(poem.id, currentUser);
    if (!res.success) {
      triggerNotification(res.message, 'error');
      return;
    }
    refreshArtworks();
    triggerNotification(`"${poem.title}" has been removed from the sanctuary.`, 'success');
  };

  const handlePoemSubmit = (data: PoemFormData) => {
    const stanzas = data.stanzasText.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    const authorName = data.authorName.trim() || currentUser.name || 'Anonymous Poet';
    const authorHandle = data.authorHandle.trim() || currentUser.handle || `@poet_${Date.now().toString(36).slice(-4)}`;

    if (poemToEdit) {
      // Edit existing poem
      const updated: Partial<Artwork> = {
        title: data.title,
        artist: { ...poemToEdit.artist, name: authorName, handle: authorHandle },
        poetryContent: {
          ...(poemToEdit.poetryContent as any),
          stanzas,
          alignment: data.alignment,
          dedication: data.dedication,
          poemNumber: data.poemNumber,
          stainVariant: data.stainVariant,
          paperTone: data.paperTone,
          preferredVoiceAccent: data.preferredVoiceAccent,
          audioRecitationUrl: data.audioRecitationUrl,
          audioRecitationDuration: data.audioRecitationDuration,
          excerpt: stanzas[0]?.slice(0, 120),
        },
      };
      const res = GalleryService.updateArtwork(poemToEdit.id, updated, currentUser);
      if (res.error) {
        triggerNotification(res.error, 'error');
        return;
      }
      triggerNotification(`"${data.title}" updated in the sanctuary.`, 'success');
    } else {
      // Create new poem
      GalleryService.createArtwork({
        title: data.title,
        category: 'poetry',
        mediaUrl: '',
        medium: 'Lyrical Free Verse',
        year: new Date().getFullYear(),
        description: '',
        tags: ['Poetry', 'Parchment'],
        artist: {
          id: currentUser.id !== 'guest' ? currentUser.id : `guest-${Date.now().toString(36)}`,
          name: authorName,
          handle: authorHandle,
          avatar: currentUser.avatar || '/curatorial-masterpiece.svg',
          verified: false,
          location: '',
        },
        poetryContent: {
          stanzas,
          theme: 'vellum',
          fontStyle: 'cormorant',
          alignment: data.alignment,
          readingTimeMinutes: Math.max(1, Math.ceil(stanzas.join(' ').split(' ').length / 160)),
          authorSignature: `— ${authorName}`,
          dedication: data.dedication,
          poemNumber: data.poemNumber,
          stainVariant: data.stainVariant,
          paperTone: data.paperTone,
          preferredVoiceAccent: data.preferredVoiceAccent,
          audioRecitationUrl: data.audioRecitationUrl,
          audioRecitationDuration: data.audioRecitationDuration,
          excerpt: stanzas[0]?.slice(0, 120),
        },
      });
      triggerNotification(`"${data.title}" has been published to the sanctuary.`, 'success');
    }

    setIsPoemModalOpen(false);
    setPoemToEdit(null);
    refreshArtworks();
  };

  const handleRestoreArtwork = (id: string) => {
    const res = GalleryService.restoreArtwork(id, currentUser);
    if (!res.success) {
      triggerNotification(res.message, 'error');
      return;
    }
    setSelectedArtwork(null);
    syncArtworkUrl(null, 'replace');
    refreshArtworks();
    triggerNotification(res.message, 'success');
  };

  const handlePermanentDeleteArtwork = (id: string) => {
    if (currentUser.id === 'guest') {
      triggerNotification('Guest visitors cannot purge artworks. Please sign in or create an artist profile.', 'error');
      return;
    }
    const res = GalleryService.permanentlyDeleteArtwork(id, currentUser);
    if (!res.success) {
      triggerNotification(res.message, 'error');
      return;
    }
    setSelectedArtwork(null);
    syncArtworkUrl(null, 'replace');
    refreshArtworks();
    triggerNotification(res.message, 'success');
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    refreshArtworks();
    triggerNotification(`Authenticated as ${user.name} (${user.handle}). Private studio session active.`, 'success');
  };

  const handleLogout = async () => {
    await signOutFirebaseUser();
    GalleryService.logout();
    const guest = GalleryService.getCurrentUser(); // returns GUEST_USER after logout
    setCurrentUser(guest);
    refreshArtworks();
    triggerNotification('You have signed out. Browsing as Guest.', 'info');
  };

  return (
    <IntroWrapper
      onOpenBard={() => handleOpenBardWithPoem()}
      onOpenInkStudio={() => setIsInkStudioOpen(true)}
    >
    <ErrorBoundary>
      <div className="min-h-screen w-full text-neutral-200 flex flex-col font-sans selection:bg-[#c9a875]/30 selection:text-[#f8f5eb] relative overflow-x-hidden">
      {/* Candle-lit Cursor Follower Light */}
      <div id="glow" />

      {/* Animated WebGL Shader Background — "Mesh drift" (blobs shader) */}
      <MeshDriftBackground />

      {/* Global Ambient Canvas Texture */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay bg-canvas-grain z-[45]"
      />

      {/* Custom Interactive Artistic Golden Cursor */}
      <ArtisticCursor />

      {/* Status Notification Toast */}
      {statusNotification && (
        <div className="fixed top-20 right-6 z-[80] animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-2xl shadow-2xl text-xs font-mono-code ${
              statusNotification.type === 'error'
                ? 'bg-rose-950/95 border-rose-500 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
                : statusNotification.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                : 'bg-neutral-900/95 border-[#c9a875] text-[#dfbd87] shadow-[0_0_25px_rgba(201,168,117,0.35)]'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-[#c9a875]" />
            <span>{statusNotification.message}</span>
            <button
              onClick={() => setStatusNotification(null)}
              className="p-1 hover:text-white rounded-full transition-colors ml-2 cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Navigation Suite: Dynamic Island (Concept 3), Gallery Spine (Concept 2), Magnifying Dock, or Classic */}
      {headerVariant === 'island' ? (
        <DynamicIslandNavbar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            handleSelectView('feed');
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (q && activeView !== 'feed' && activeView !== 'saved') {
              handleSelectView('feed');
            }
          }}
          dateRange={dateRangeFilter}
          onDateRangeChange={setDateRangeFilter}
          activeView={activeView}
          onSelectView={handleSelectView}
          onOpenUpload={handleOpenUpload}
          onOpenInkStudio={() => setIsInkStudioOpen(true)}
          onOpenBardModal={() => handleOpenBardWithPoem()}
          onOpenConstellationModal={() => setIsConstellationOpen(true)}
          onOpenCollectorVault={() => setIsCollectorVaultOpen(true)}
          onSelectCurrentUser={() => setSelectedArtistId(currentUser.id)}
          onOpenEditProfile={() => {
            setIsAddProfileCreateMode(false);
            setAddProfileModalInitialTab('details');
            setIsAddProfileModalOpen(true);
          }}
          onOpenCreateProfile={() => {
            setAuthModalMode('signup');
            setIsAuthModalOpen(true);
          }}
          onOpenLoginModal={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenCinemaMode={() => setIsCinemaModeOpen(true)}
        />
      ) : headerVariant === 'spine' ? (
        <GallerySpineNavbar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            handleSelectView('feed');
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (q && activeView !== 'feed' && activeView !== 'saved') {
              handleSelectView('feed');
            }
          }}
          dateRange={dateRangeFilter}
          onDateRangeChange={setDateRangeFilter}
          activeView={activeView}
          onSelectView={handleSelectView}
          onOpenUpload={handleOpenUpload}
          onOpenInkStudio={() => setIsInkStudioOpen(true)}
          onOpenBardModal={() => handleOpenBardWithPoem()}
          onOpenConstellationModal={() => setIsConstellationOpen(true)}
          onOpenCollectorVault={() => setIsCollectorVaultOpen(true)}
          onSelectCurrentUser={() => setSelectedArtistId(currentUser.id)}
          onOpenEditProfile={() => {
            setIsAddProfileCreateMode(false);
            setAddProfileModalInitialTab('details');
            setIsAddProfileModalOpen(true);
          }}
          onOpenCreateProfile={() => {
            setAuthModalMode('signup');
            setIsAuthModalOpen(true);
          }}
          onOpenLoginModal={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenCinemaMode={() => setIsCinemaModeOpen(true)}
        />
      ) : headerVariant === 'dock' ? (
        <MagnifyingDockNavbar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            handleSelectView('feed');
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (q && activeView !== 'feed' && activeView !== 'saved') {
              handleSelectView('feed');
            }
          }}
          dateRange={dateRangeFilter}
          onDateRangeChange={setDateRangeFilter}
          activeView={activeView}
          onSelectView={handleSelectView}
          onOpenUpload={handleOpenUpload}
          onOpenInkStudio={() => setIsInkStudioOpen(true)}
          onOpenBardModal={() => handleOpenBardWithPoem()}
          onOpenConstellationModal={() => setIsConstellationOpen(true)}
          onOpenCollectorVault={() => setIsCollectorVaultOpen(true)}
          onSelectCurrentUser={() => setSelectedArtistId(currentUser.id)}
          onOpenEditProfile={() => {
            setIsAddProfileCreateMode(false);
            setAddProfileModalInitialTab('details');
            setIsAddProfileModalOpen(true);
          }}
          onOpenCreateProfile={() => {
            setAuthModalMode('signup');
            setIsAuthModalOpen(true);
          }}
          onOpenLoginModal={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenCinemaMode={() => setIsCinemaModeOpen(true)}
        />
      ) : (
        <Navbar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            handleSelectView('feed');
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (q && activeView !== 'feed' && activeView !== 'saved') {
              handleSelectView('feed');
            }
          }}
          dateRange={dateRangeFilter}
          onDateRangeChange={setDateRangeFilter}
          activeView={activeView}
          onSelectView={handleSelectView}
          onOpenUpload={handleOpenUpload}
          onOpenInkStudio={() => setIsInkStudioOpen(true)}
          onOpenBardModal={() => handleOpenBardWithPoem()}
          onOpenConstellationModal={() => setIsConstellationOpen(true)}
          onOpenCollectorVault={() => setIsCollectorVaultOpen(true)}
          onSelectCurrentUser={() => setSelectedArtistId(currentUser.id)}
          onOpenEditProfile={() => {
            setIsAddProfileCreateMode(false);
            setAddProfileModalInitialTab('details');
            setIsAddProfileModalOpen(true);
          }}
          onOpenCreateProfile={() => {
            setAuthModalMode('signup');
            setIsAuthModalOpen(true);
          }}
          onOpenLoginModal={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenCinemaMode={() => setIsCinemaModeOpen(true)}
        />
      )}

      {/* Real-Time Deep Link Resolution Banner */}
      {isResolvingDeepLink && (
        <div
          id="deep-link-resolving-indicator"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[999999] flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/95 border border-[#c9a875]/80 shadow-[0_0_35px_rgba(201,168,117,0.45)] backdrop-blur-xl pointer-events-none select-none transition-all"
        >
          <Sparkles className="w-4 h-4 text-[#dfbd87] animate-spin" />
          <span className="text-xs font-mono-code text-[#f8f5eb] tracking-wide">
            Curating shared masterpiece from sanctuary vault...
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 w-full max-w-[1760px] mx-auto ${
        headerVariant === 'spine'
          ? 'pl-20 sm:pl-[96px] pr-3 sm:pr-6 lg:pr-8 pt-16 sm:pt-20 pb-10'
          : headerVariant === 'island'
          ? 'px-3 sm:px-6 lg:px-8 xl:px-10 pt-24 sm:pt-28 pb-8 md:pb-6'
          : headerVariant === 'dock'
          ? 'px-3 sm:px-6 lg:px-8 xl:px-10 pt-20 sm:pt-24 pb-16'
          : 'px-3 sm:px-6 lg:px-8 xl:px-10 pt-4 sm:pt-6 pb-12 md:pb-8'
      } space-y-6 sm:space-y-8 relative z-10`}>

        {activeView === 'about' && (
          <AboutUsView
            currentUser={currentUser}
            onNavigateCategory={(category) => {
              setSelectedCategory(category);
              handleSelectView('feed');
            }}
            onOpenUpload={() => handleOpenUpload('painting')}
            onFounderAuthenticated={(founder) => {
              setCurrentUser(founder);
              triggerNotification('Welcome back, Founder Afshaan Shaikh! Atelier controls unlocked.', 'success');
            }}
            onOpenEditProfile={(target) => {
              const isTargetFounder =
                !target ||
                target.id === DEFAULT_USER.id ||
                target.id === 'user-my-atelier' ||
                target.handle === DEFAULT_USER.handle ||
                target.handle === '@afshaanshaikh';

              if (isTargetFounder && !isFounderUser(currentUser)) {
                triggerNotification('Access Denied: Only Sanctuary Creator Afshaan Shaikh can edit visionary details.', 'error');
                return;
              }
              setProfileToEdit(target || GalleryService.getFounderProfile());
              setIsProfilePictureModalOpen(true);
            }}
          />
        )}

        {activeView === 'cosmos' && (
          <ConstellationCosmosView
            artworks={realtimeArtworks}
            onSelectArtwork={handleOpenArtwork}
            onOpenUpload={handleOpenUpload}
            onSwitchToGallery={(cat) => {
              if (cat) setSelectedCategory(cat);
              handleSelectView('feed');
            }}
          />
        )}

        {activeView === 'feed' && (
          <>
            {/* Redesigned Hero Section with Signature Floating Arch Spotlight */}
            <RedesignedHeroSection
              artworks={artworks.length > 0 ? artworks : realtimeArtworks}
              dailyMasterpiece={dailyMasterpiece}
              onSelectArtwork={handleOpenArtwork}
              onToggleLike={handleToggleLike}
              onToggleSave={handleToggleSave}
              onSelectArtist={handleSelectArtist}
              onShareArtwork={(art) => setArtworkToShare(art)}
              onEnterGallery={() => {
                const el = document.getElementById('curated-works-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Continuous Infinite Marquee Ribbon */}
            <div className="infinite-marquee-ribbon my-6 sm:my-10 border-y border-[rgba(236,214,170,0.12)] py-5 overflow-hidden select-none">
              <div>
                <span>Poetry Cards</span>
                <span>Motion Loops</span>
                <span>Digital Media</span>
                <span>Paintings</span>
                <span>Drawings &amp; Ink</span>
                <span>Original Music</span>
                <span>Poetry Cards</span>
                <span>Motion Loops</span>
                <span>Digital Media</span>
                <span>Paintings</span>
                <span>Drawings &amp; Ink</span>
                <span>Original Music</span>
              </div>
            </div>

            {/* The Vault — Redesigned Curated Works Suite */}
            <div id="curated-works-section" className="space-y-6 pt-2 sm:pt-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[rgba(236,214,170,0.12)]">
                <div>
                  <span className="mono-tag text-[10.5px] font-semibold text-[#d8b779] block mb-1">
                    ✦ The Vault · Curated Atelier Archive
                  </span>
                  <h2 className="font-serif-cormorant font-light text-4xl sm:text-6xl text-[#f4efe6] leading-none">
                    Curated <em className="gt italic">works</em>
                  </h2>
                  <p className="text-xs text-[#8d897f] font-mono-code mt-2 flex items-center gap-2">
                    <span>Displaying {artworks.length} indexed work{artworks.length !== 1 ? 's' : ''}</span>
                    <span className="text-[#d8b779]">•</span>
                    <span>Living Autonomous Stream Active</span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
                  {/* Category Chips */}
                  <div className="chips flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {[
                      { id: 'all', label: 'All Works' },
                      { id: 'poetry', label: 'Poetry Cards' },
                      { id: 'video', label: 'Motion Loops' },
                      { id: 'digital', label: 'Digital Media' },
                      { id: 'painting', label: 'Paintings' },
                      { id: 'drawing', label: 'Drawings & Ink' },
                      { id: 'music', label: 'Original Music' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id as ArtCategory)}
                        className={`redesign-chip cursor-pointer ${
                          selectedCategory === cat.id ? 'is-active' : ''
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Curated / Most Liked / Latest Filter Capsule */}
                  <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#0b0c10] border border-[rgba(236,214,170,0.15)] shadow-xl backdrop-blur-md">
                    <button
                      id="filter-curated-btn"
                      onClick={() => setFeedFilter('curated')}
                      className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        feedFilter === 'curated'
                          ? 'bg-[#d8b779] text-[#171007] shadow-[0_0_15px_rgba(216,183,121,0.4)]'
                          : 'text-[#8d897f] hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Curated</span>
                    </button>

                    <button
                      id="filter-popular-btn"
                      onClick={() => setFeedFilter('popular')}
                      className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        feedFilter === 'popular'
                          ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                          : 'text-[#8d897f] hover:text-white'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${feedFilter === 'popular' ? 'fill-white' : ''}`} />
                      <span>Most Liked</span>
                    </button>

                    <button
                      id="filter-latest-btn"
                      onClick={() => setFeedFilter('latest')}
                      className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        feedFilter === 'latest'
                          ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                          : 'text-[#8d897f] hover:text-white'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Latest</span>
                    </button>
                  </div>

                  {/* Cinema Mode Button */}
                  <button
                    id="cinema-mode-btn"
                    onClick={() => setIsCinemaModeOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0b0c10] border border-[rgba(236,214,170,0.15)] text-[#d8b779] hover:text-white hover:border-[#d8b779] transition-all cursor-pointer shadow-xl backdrop-blur-md"
                    title="View Gallery as Cinematic Slideshow"
                  >
                    <Film className="w-3.5 h-3.5 text-[#d8b779]" />
                    <span>Cinema</span>
                  </button>

                  {/* Curatorial Density Switcher */}
                  <div
                    id="curatorial-density-switcher"
                    className="flex items-center gap-1 p-1 rounded-full bg-[#0b0c10] border border-[rgba(236,214,170,0.15)] backdrop-blur-md shadow-xl shrink-0"
                    title="Curatorial Density Scale"
                  >
                    <button
                      id="density-grande-btn"
                      onClick={() => setGridDensity('grande')}
                      title="2-Column Grande Scale"
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono-code uppercase tracking-wider transition-all cursor-pointer ${
                        gridDensity === 'grande'
                          ? 'bg-[#d8b779] text-[#171007] font-bold shadow-[0_0_10px_rgba(216,183,121,0.35)]'
                          : 'text-[#8d897f] hover:text-white'
                      }`}
                    >
                      2-Col
                    </button>
                    <button
                      id="density-curatorial-btn"
                      onClick={() => setGridDensity('curatorial')}
                      title="3-Column Curatorial Salon (Default)"
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono-code uppercase tracking-wider transition-all cursor-pointer ${
                        gridDensity === 'curatorial'
                          ? 'bg-[#d8b779] text-[#171007] font-bold shadow-[0_0_10px_rgba(216,183,121,0.35)]'
                          : 'text-[#8d897f] hover:text-white'
                      }`}
                    >
                      3-Col
                    </button>
                    <button
                      id="density-archive-btn"
                      onClick={() => setGridDensity('archive')}
                      title="4-Column Archive View"
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono-code uppercase tracking-wider transition-all cursor-pointer ${
                        gridDensity === 'archive'
                          ? 'bg-[#d8b779] text-[#171007] font-bold shadow-[0_0_10px_rgba(216,183,121,0.35)]'
                          : 'text-[#8d897f] hover:text-white'
                      }`}
                    >
                      4-Col
                    </button>
                  </div>
                </div>
              </div>

            {/* Masonry Grid / Poetry Sanctuary / Dedicated Original Music Section */}
            {selectedCategory === 'poetry' ? (
              <PoetrySanctuaryView
                poems={artworks}
                onWritePoem={handleWritePoem}
                onEditPoem={handleEditPoem}
                onDeletePoem={handleDeletePoem}
                canManage={(poem) => GalleryService.canUserManageArtwork(poem, currentUser)}
              />
            ) : selectedCategory === 'music' ? (
              <OriginalMusicSection
                artworks={artworks.length > 0 ? artworks : realtimeArtworks}
                currentUser={currentUser}
                onSelectArtwork={handleOpenArtwork}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onSelectArtist={handleSelectArtist}
                onShareArtwork={(art) => setArtworkToShare(art)}
                onAddToMoodBoard={(art) => setArtworkForMoodBoard(art)}
                onOpenUpload={handleOpenUpload}
                onSwitchToCosmos={() => handleSelectView('cosmos')}
              />
            ) : (
              <MasonryGrid
                artworks={artworks}
                density={gridDensity}
                feedFilter={feedFilter}
                isModalOpen={isAnyModalOpen}
                masterpieceId={dailyMasterpiece?.artwork.id}
                onSelectArtwork={handleOpenArtwork}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onSelectArtist={handleSelectArtist}
                onShareArtwork={(art) => setArtworkToShare(art)}
                selectedCategory={selectedCategory}
                onOpenUpload={handleOpenUpload}
                onOpenBardModal={handleOpenBardWithPoem}
              />
            )}

            {/* Original Music & Soundscape Horizon Showcase Shelf (Anchored Below Artwork Feed) */}
            {selectedCategory === 'all' && (
              <div
                id="original-music-showcase-shelf"
                className="mt-12 relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-[#0b0c16]/95 via-[#131726]/90 to-[#0b0c16]/95 border border-[#c9a875]/40 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#c9a875]/20 border border-[#c9a875]/40 text-[#c9a875] shadow-[0_0_15px_rgba(201,168,117,0.3)]">
                      <Disc3 className="w-5 h-5 animate-[spin_6s_linear_infinite]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#c9a875]/20 border border-[#c9a875]/40 text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#dfbd87]">
                          ✦ Master Audiophile Vault
                        </span>
                        <span className="text-xs font-mono-code text-neutral-400">
                          • {realtimeArtworks.filter(a => a.category === 'music' || a.musicData).length} Original Tracks Active
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-serif-display font-medium text-white flex items-center gap-2 mt-0.5">
                        <span>Original Music &amp; Soundscape Horizon</span>
                      </h3>
                      <p className="text-xs font-mono-code text-neutral-300">
                        Acoustic reveries, founder Afshaan Shaikh's &ldquo;Musafir&rdquo;, and curated sonic atmospheres.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      id="shelf-upload-track-btn"
                      onClick={() => handleOpenUpload('music', 'original song')}
                      className="px-3 py-1.5 rounded-xl border border-white/20 hover:border-[#c9a875]/70 text-xs font-mono-code uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#c9a875]" />
                      <span className="hidden md:inline">Publish </span>Track
                    </button>

                    <button
                      id="shelf-view-all-music-btn"
                      onClick={() => {
                        setSelectedCategory('music');
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-mono-code text-xs font-bold uppercase tracking-wider hover:scale-105 hover:shadow-[0_0_18px_rgba(201,168,117,0.5)] transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Enter Music Lounge</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Horizontal Scrolling Music Track Rail */}
                <div className="mt-4 flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
                  {realtimeArtworks
                    .filter(a => (a.category === 'music' || a.musicData) && !isDerryArtwork(a))
                    .map((track) => {
                      const isPlaying = shelfAudioPlayingId === track.id;
                      const isFounderTrack = track.artist?.name?.toLowerCase().includes('afshaan') || track.artist?.handle?.toLowerCase().includes('afshaan');
                      const cover = track.musicData?.coverArtUrl || track.musicData?.coverUrl || track.thumbnailUrl || track.mediaUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';

                      return (
                        <div
                          key={`shelf-track-${track.id}`}
                          onClick={() => handleOpenArtwork(track)}
                          className={`group relative shrink-0 w-64 sm:w-72 p-3 rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-3 select-none ${
                            isPlaying
                              ? 'bg-[#151929]/95 border-[#c9a875] shadow-[0_0_20px_rgba(201,168,117,0.35)]'
                              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-[#c9a875]/50'
                          }`}
                        >
                          {/* Cover Thumbnail with Vinyl Edge & Play Button Overlay */}
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-white/15 bg-black/60">
                            <img
                              src={cover}
                              alt={track.title}
                              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                                isPlaying ? 'brightness-75' : ''
                              }`}
                            />
                            {/* Vinyl groove ring */}
                            <div className="absolute inset-0 rounded-lg border border-white/10 pointer-events-none" />

                            <button
                              type="button"
                              onClick={(e) => handleToggleShelfAudio(track, e)}
                              className={`absolute inset-0 m-auto w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                isPlaying
                                  ? 'bg-[#c9a875] text-black shadow-lg scale-100'
                                  : 'bg-black/70 hover:bg-[#c9a875] text-white hover:text-black opacity-90 group-hover:opacity-100 hover:scale-110'
                              }`}
                              title={isPlaying ? 'Pause preview' : 'Play preview'}
                            >
                              {isPlaying ? (
                                <Pause className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              )}
                            </button>
                          </div>

                          {/* Track Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              {isFounderTrack && (
                                <span className="px-1.5 py-0.2 rounded bg-[#c9a875]/25 border border-[#c9a875]/50 text-[9px] font-mono-code font-bold text-[#f3e3cb] uppercase tracking-wider">
                                  Founder
                                </span>
                              )}
                              <span className="text-[10px] font-mono-code text-[#c9a875] truncate">
                                {track.musicData?.genre || 'Original Audio'}
                              </span>
                            </div>

                            <h4 className="text-xs sm:text-sm font-medium text-white group-hover:text-[#f3e3cb] truncate mt-0.5 font-serif-display">
                              {track.title}
                            </h4>

                            <div className="flex items-center justify-between mt-1 text-[11px] font-mono-code text-neutral-400">
                              <span className="truncate max-w-[130px]">{track.artist?.name || 'Sanctuary Artist'}</span>
                              <span>
                                {track.musicData?.durationSeconds
                                  ? `${Math.floor(track.musicData.durationSeconds / 60)}:${(track.musicData.durationSeconds % 60).toString().padStart(2, '0')}`
                                  : 'Track'}
                              </span>
                            </div>
                          </div>

                          {/* Animated Sound Waveform Indicator */}
                          {isPlaying && (
                            <div className="shrink-0 flex items-end gap-0.5 h-4 pr-1">
                              <span className="w-0.5 bg-[#c9a875] animate-[bounce_0.6s_ease-in-out_infinite_alternate]" style={{ height: '80%' }} />
                              <span className="w-0.5 bg-[#c9a875] animate-[bounce_0.4s_ease-in-out_infinite_alternate_0.2s]" style={{ height: '100%' }} />
                              <span className="w-0.5 bg-[#c9a875] animate-[bounce_0.8s_ease-in-out_infinite_alternate_0.1s]" style={{ height: '50%' }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
            </div>

            {/* Redesigned Poetic Sanctuary Section */}
            <RedesignedPoetrySection
              artworks={artworks.length > 0 ? artworks : realtimeArtworks}
              onSelectArtwork={handleOpenArtwork}
              onOpenInkStudio={() => setIsInkStudioOpen(true)}
            />

            {/* Redesigned Music Sanctuary Horizon Section */}
            <RedesignedMusicSection
              artworks={artworks.length > 0 ? artworks : realtimeArtworks}
              onOpenMusicSanctuary={() => {
                const b = document.getElementById('toggle-ambience-music-btn');
                if (b) b.click();
              }}
            />

            {/* Redesigned Atelier Footer */}
            <RedesignedFooter
              onOpenUpload={() => handleOpenUpload('painting')}
              onOpenAbout={() => handleSelectView('about')}
            />
          </>
        )}

        {activeView === 'exhibitions' && (
          <ExhibitionsView
            exhibitions={exhibitions}
            artworks={realtimeArtworks}
            onSelectExhibition={handleSelectExhibition}
            onSelectArtwork={handleOpenArtwork}
            onAddExhibition={() => setIsExhibitionModalOpen(true)}
            onDeleteExhibition={handleDeleteExhibition}
          />
        )}

        {activeView === 'community' && (
          <CommunityHubView
            currentUser={currentUser}
            onSelectArtwork={handleOpenArtwork}
            onToggleLike={handleToggleLike}
            onToggleSave={handleToggleSave}
            onSelectArtist={handleSelectArtist}
            onShareArtwork={(art) => setArtworkToShare(art)}
            onOpenUpload={handleOpenUpload}
            onAddToMoodBoard={(art) => setArtworkForMoodBoard(art)}
          />
        )}

        {activeView === 'vaults' && (
          <MoodBoardsView
            currentUser={currentUser}
            onSelectArtwork={handleOpenArtwork}
            onToggleLike={handleToggleLike}
            onToggleSave={handleToggleSave}
            onSelectArtist={handleSelectArtist}
            onShareArtwork={(art) => setArtworkToShare(art)}
            onOpenUpload={handleOpenUpload}
          />
        )}

        {activeView === 'saved' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif-display tracking-[0.08em] text-white flex items-center gap-2.5">
                  <Bookmark className="w-5 h-5 text-[#c9a875]" />
                  Saved Works &amp; Bookmarked Masterpieces
                </h2>
                <p className="text-xs font-mono-code text-neutral-400 mt-1">
                  Your private collector sanctuary — {artworks.length} saved piece{artworks.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {artworks.length > 0 ? (
              <MasonryGrid
                artworks={artworks}
                onSelectArtwork={handleOpenArtwork}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onSelectArtist={handleSelectArtist}
                onShareArtwork={(art) => setArtworkToShare(art)}
                selectedCategory="all"
                onOpenUpload={handleOpenUpload}
                onOpenBardModal={handleOpenBardWithPoem}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 max-w-md mx-auto">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-[#c9a875]">
                  <Bookmark className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-serif-display text-white">No Saved Works Yet</h3>
                <p className="text-xs text-neutral-400 font-mono-code leading-relaxed">
                  Browse the sanctuary gallery and tap the bookmark icon on any painting, drawing, poem, or digital artwork to save it to your private sanctuary archive.
                </p>
                <button
                  onClick={() => handleSelectView('feed')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-bold text-xs uppercase tracking-wider transition-transform hover:scale-105 cursor-pointer shadow-lg shadow-[#c9a875]/20"
                >
                  Explore Sanctuary Gallery
                </button>
              </div>
            )}
          </div>
        )}

        {activeView === 'recycle-bin' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif-display tracking-[0.08em] text-white flex items-center gap-2.5">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  Your Recycle Bin & Archived Works
                </h2>
                <p className="text-xs font-mono-code text-neutral-400 mt-1">
                  Showing discarded artworks created by <span className="text-white font-bold">{currentUser.name}</span> ({artworks.length} item{artworks.length !== 1 ? 's' : ''}). Protected from other users.
                </p>
              </div>
            </div>

            <MasonryGrid
              artworks={artworks}
              onSelectArtwork={handleOpenArtwork}
              onToggleLike={handleToggleLike}
              onToggleSave={handleToggleSave}
              onSelectArtist={handleSelectArtist}
              onShareArtwork={(art) => setArtworkToShare(art)}
              selectedCategory="all"
              onOpenUpload={handleOpenUpload}
            />
          </div>
        )}
      </main>

      {/* Night Sky Ending - Closing note from the maker */}
      <NightSkyEnding />

      {/* Footer */}
      <footer className="relative z-20 py-10 px-4 sm:px-6 lg:px-8 xl:px-10 border-t border-white/10 bg-[#050608] text-neutral-400 shadow-2xl">
        <div className="w-full max-w-[1760px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-mono-code">
          <div className="flex flex-col text-center md:text-left space-y-1">
            <div className="text-neutral-300 font-medium">
              © 2026 THE ARTISAN'S QUILL.
            </div>
            <div className="text-neutral-500 text-[9px] tracking-[0.25em]">
              ALL RIGHTS RESERVED • SANCTUARY FOR ARTISTS & POETS.
            </div>
          </div>
          <div className="text-[#c9a875] tracking-[0.25em] font-semibold text-center">
            SUPPORTING ARTISTS & DIGITAL POETS SINCE 2026
          </div>
          <div className="flex items-center">
            <button
              id="footer-developed-by-btn"
              onClick={() => handleSelectView('about')}
              className="hover:text-white text-[#dfbd87] transition-colors cursor-pointer group flex items-center gap-1.5"
              title="About Developer & Artist Afshaan Shaikh"
            >
              <span>DEVELOPED BY:</span>
              <span className="font-bold text-white group-hover:text-[#dfbd87] underline decoration-[#c9a875]/40 underline-offset-4 tracking-[0.2em]">
                AFSHAAN SHAIKH
              </span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals Suite */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
        initialCategory={uploadModalCategory}
        initialFormat={uploadModalFormat}
      />

      <ExhibitionUploadModal
        isOpen={isExhibitionModalOpen}
        onClose={() => setIsExhibitionModalOpen(false)}
        onSuccess={handleExhibitionUploadSuccess}
      />

      <ArtworkDetailModal
        artwork={selectedArtwork}
        currentUser={currentUser}
        allArtworks={artworks}
        onNavigateArtwork={handleOpenArtwork}
        onClose={handleCloseArtwork}
        onToggleLike={handleToggleLike}
        onToggleSave={handleToggleSave}
        onSelectArtist={handleSelectArtist}
        onShare={(art) => setArtworkToShare(art)}
        onAddToMoodBoard={(art) => setArtworkForMoodBoard(art)}
        activeView={activeView}
        onEdit={handleEditArtwork}
        onDelete={handleDeleteArtwork}
        onRestore={handleRestoreArtwork}
        onPermanentDelete={handlePermanentDeleteArtwork}
        onOpenGalleryWall={(art) => setArtworkForGalleryWall(art)}
        onOpenCertificate={(art) => setArtworkForCertificate(art)}
        onOpenColorStudio={(art) => setArtworkForColorStudio(art)}
        onOpenFragmentInspector={(art) => {
          setArtworkForFragmentInspector(art);
        }}
        onOpenBardModal={handleOpenBardWithPoem}
        onOpenScrollModal={handleOpenScrollWithPoem}
      />

      {/* Deep Fragment Inspector Modal */}
      <FragmentInspectorModal
        isOpen={Boolean(artworkForFragmentInspector)}
        artwork={artworkForFragmentInspector}
        onClose={() => setArtworkForFragmentInspector(null)}
      />

      <ShareArtworkModal
        artwork={artworkToShare}
        onClose={() => setArtworkToShare(null)}
      />

      <EditArtworkModal
        isOpen={isEditModalOpen}
        artwork={artworkToEdit}
        currentUser={currentUser}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleSaveEdit}
      />

      <ArtistProfileModal
        artistId={selectedArtistId}
        artworks={realtimeArtworks}
        currentUser={currentUser}
        onClose={() => setSelectedArtistId(null)}
        onSelectArtwork={handleOpenArtwork}
        onToggleLike={handleToggleLike}
        onToggleSave={handleToggleSave}
        onUpdateProfile={(updated) => {
          setCurrentUser(updated);
          refreshArtworks();
        }}
        onOpenUpload={handleOpenUpload}
      />

      <ProfilePictureModal
        isOpen={isProfilePictureModalOpen}
        onClose={() => {
          setIsProfilePictureModalOpen(false);
          setProfileToEdit(null);
        }}
        currentUser={currentUser}
        targetUser={profileToEdit}
        onSuccess={async (updated) => {
          const isFounder = isFounderUser(updated) || isFounderUser(currentUser);

          if (isFounder) {
            await GalleryService.syncFounderProfile().catch(() => {});
            setCurrentUser(GalleryService.getCurrentUser());
          } else {
            setCurrentUser(updated);
          }
          setProfileToEdit(null);
          refreshArtworks();
          triggerNotification('Profile picture and details updated in Supabase.', 'success');
        }}
      />

      {/* Add / Edit Profile Dedicated Studio Modal */}
      <AddProfileModal
        isOpen={isAddProfileModalOpen}
        onClose={() => setIsAddProfileModalOpen(false)}
        currentUser={currentUser}
        onSuccess={(updated) => {
          setCurrentUser(updated);
          refreshArtworks();
          triggerNotification('Studio Profile details successfully updated.', 'success');
        }}
        isCreateMode={isAddProfileCreateMode}
        initialTab={addProfileModalInitialTab}
      />

      {/* Authentication & Profile Creation Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Virtual Exhibition Wall Modal */}
      <GalleryWallModal
        isOpen={Boolean(artworkForGalleryWall)}
        artwork={artworkForGalleryWall}
        onClose={() => setArtworkForGalleryWall(null)}
      />

      {/* Certificate of Authenticity Modal */}
      <CertificateOfAuthenticityModal
        isOpen={Boolean(artworkForCertificate)}
        artwork={artworkForCertificate}
        onClose={() => setArtworkForCertificate(null)}
      />

      {/* Color Studio Modal */}
      <ColorStudioModal
        isOpen={Boolean(artworkForColorStudio)}
        artwork={artworkForColorStudio}
        onClose={() => setArtworkForColorStudio(null)}
      />

      <AddToMoodBoardModal
        isOpen={!!artworkForMoodBoard}
        artwork={artworkForMoodBoard}
        currentUser={currentUser}
        onClose={() => setArtworkForMoodBoard(null)}
        onSuccess={() => {
          setArtworkForMoodBoard(null);
          // Optional: trigger a notification here if we had a global toast system
        }}
      />

      <FloatingGuestbook />

      {/* Fluid Ink & Gold-Leaf Poetry Studio Modal */}
      <FluidInkPoetryStudioModal
        isOpen={isInkStudioOpen}
        onClose={() => setIsInkStudioOpen(false)}
        currentUser={currentUser}
        onPublishSuccess={handleUploadSuccess}
        onOpenBardModal={handleOpenBardWithPoem}
      />

      {/* AI Poetic Reciter & Bard Symphony Studio Modal */}
      <AIPoeticBardModal
        isOpen={isBardModalOpen}
        onClose={() => setIsBardModalOpen(false)}
        initialPoem={activePoemForBard}
      />

      {/* 3D Constellation of Motifs Cosmos Modal */}
      <ConstellationStarMapModal
        isOpen={isConstellationOpen}
        onClose={() => setIsConstellationOpen(false)}
        artworks={realtimeArtworks.length > 0 ? realtimeArtworks : artworks}
        onSelectArtwork={handleOpenArtwork}
      />

      {/* Collector's 3D Trophy Sanctum & Provenance Vault Modal */}
      <Collector3DVaultModal
        isOpen={isCollectorVaultOpen}
        onClose={() => setIsCollectorVaultOpen(false)}
        currentUser={currentUser}
        userArtworks={artworks.filter(
          (a) =>
            (typeof a.artist === 'object' ? a.artist.id === currentUser.id : a.artist === currentUser.name) ||
            currentUser.id !== 'guest'
        )}
        onSelectArtwork={handleOpenArtwork}
      />

      {/* Ancient Illuminated Calligraphic Scroll Modal */}
      <PoeticScrollModal
        isOpen={isScrollModalOpen}
        onClose={() => setIsScrollModalOpen(false)}
        poem={activePoemForScroll}
      />

      {/* Cinema Mode Slideshow Player */}
      {isCinemaModeOpen && (
        <CinemaModePlayer
          artworks={realtimeArtworks}
          onClose={() => setIsCinemaModeOpen(false)}
        />
      )}

      {/* ── Poetry Sanctuary: Write / Edit Poem Modal ── */}
      <CustomPoemModal
        isOpen={isPoemModalOpen}
        onClose={() => { setIsPoemModalOpen(false); setPoemToEdit(null); }}
        onSubmit={handlePoemSubmit}
        isEditing={!!poemToEdit}
        initialData={poemToEdit ? {
          title: poemToEdit.title,
          authorName: poemToEdit.artist.name,
          authorHandle: poemToEdit.artist.handle,
          stanzasText: poemToEdit.poetryContent?.stanzas.join('\n\n') || '',
          dedication: poemToEdit.poetryContent?.dedication || '',
          poemNumber: poemToEdit.poetryContent?.poemNumber || '',
          stainVariant: poemToEdit.poetryContent?.stainVariant || 0,
          paperTone: poemToEdit.poetryContent?.paperTone || '#EDE0C8',
          alignment: poemToEdit.poetryContent?.alignment || 'left',
        } : undefined}
      />
    </div>
  </ErrorBoundary>
  </IntroWrapper>
);
}








