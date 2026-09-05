import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Feather,
  Bookmark,
  Trash2,
  Heart,
  Clock,
  Film,
  ArrowRight
} from 'lucide-react';
import { Artwork, ArtCategory, UserProfile, Exhibition } from './types';
import { DEFAULT_USER } from './data/initialData';
import { GalleryService, isFounderUser } from './services/api';
import { useRealtimeGallery } from './hooks/useRealtimeGallery';
import { useGalleryStore } from './store/useGalleryStore';
import { Navbar } from './components/Navbar';
import { MasonryGrid } from './components/MasonryGrid';
import { MediaUploadModal } from './components/MediaUploadModal';
import { realtimeBroker } from './services/realtimeBroker';
import { ArtworkDetailModal } from './components/ArtworkDetailModal';
import { ExhibitionsView } from './components/ExhibitionsView';
import { ArtistProfileModal } from './components/ArtistProfileModal';
import { BackendArchitectureModal } from './components/BackendArchitectureModal';
import { ExhibitionUploadModal } from './components/ExhibitionUploadModal';
import { FloatingGuestbook } from './components/FloatingGuestbook';
import { EditArtworkModal } from './components/EditArtworkModal';
import { CuratorialSpotlight } from './components/CuratorialSpotlight';
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
import { AIPoeticBardModal } from './components/AIPoeticBardModal';
import { ConstellationStarMapModal } from './components/ConstellationStarMapModal';
import { ConstellationCosmosView } from './components/ConstellationCosmosView';
import { Collector3DVaultModal } from './components/Collector3DVaultModal';
import { PoeticScrollModal } from './components/PoeticScrollModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FloatingAudioToggle } from './components/FloatingAudioToggle';
import { StudioFAB } from './components/StudioFAB';
import { EditorialPreloader } from './components/EditorialPreloader';
import { NotFoundView } from './components/NotFoundView';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeToCloudArtworks, subscribeToCloudComments, signOutFirebaseUser } from './services/firebase';
import { getActiveSupabaseUser, signOutSupabase, onSupabaseAuthStateChange } from './services/supabaseClient';

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
      return {
        id: 'guest',
        name: 'Guest Visitor',
        handle: '@visitor',
        avatar: '',
        coverImage: '',
        bio: '',
        discipline: 'Visitor',
        location: '',
        verified: false,
        artworksCount: 0,
        followersCount: 0,
        followingCount: 0,
        badges: []
      };
    }
  });

  // Navigation & Filtering State
  const getValidViewFromUrl = (): 'feed' | 'cosmos' | 'exhibitions' | 'saved' | 'about' | 'recycle-bin' | 'community' | 'vaults' => {
    if (typeof window === 'undefined') return 'feed';
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const paramView = params.get('view') || params.get('tab');
    const path = window.location.pathname.replace(/^\//, '').toLowerCase();

    const target = hash || paramView || path;
    const validViews = ['feed', 'cosmos', 'exhibitions', 'saved', 'about', 'recycle-bin', 'community', 'vaults'];
    if (validViews.includes(target)) {
      return target as any;
    }
    return 'feed';
  };

  const [activeView, setActiveView] = useState<'feed' | 'cosmos' | 'exhibitions' | 'saved' | 'about' | 'recycle-bin' | 'community' | 'vaults'>(() => {
    return getValidViewFromUrl();
  });

  const handleSelectView = (view: 'feed' | 'cosmos' | 'exhibitions' | 'saved' | 'about' | 'recycle-bin' | 'community' | 'vaults') => {
    setActiveView(view);
    if (typeof window !== 'undefined') {
      if (view === 'feed') {
        if (window.location.hash) {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } else {
        window.location.hash = view;
      }
    }
  };

  // Bidirectional URL sync: listen to hashchange, popstate, window focus, and tab visibility switching
  useEffect(() => {
    const handleLocationSync = () => {
      const target = getValidViewFromUrl();
      setActiveView(target);
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
  const [feedFilter, setFeedFilter] = useState<'curated' | 'popular' | 'latest'>('curated');
  const [dateRangeFilter, setDateRangeFilter] = useState<{ start?: string; end?: string; }>({});

  // Modals
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isExhibitionModalOpen, setIsExhibitionModalOpen] = useState(false);
  const [uploadModalCategory, setUploadModalCategory] = useState<ArtCategory>('digital');
  const [uploadModalFormat, setUploadModalFormat] = useState<string>('digital art');
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
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

  // Reading Queue (Saved View sub-tab)
  const [savedTab, setSavedTab] = useState<'works' | 'queue'>('works');

  const [selectedExhibitionId, setSelectedExhibitionId] = useState<string | null>(null);

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
    let list = [...realtimeArtworks];
    
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
      if (dateRangeFilter.end) {
        list = list.filter(a => new Date(a.createdAt) <= new Date(dateRangeFilter.end!));
      }
    }
    
    return list;
  }, [realtimeArtworks, selectedCategory, searchQuery, activeView, feedFilter, dateRangeFilter, currentUser]);

  // Open artwork and sync URL parameter for direct permalinks
  const handleOpenArtwork = (art: Artwork | null) => {
    setSelectedArtwork(art);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (art) {
          url.searchParams.set('artwork', art.id);
          window.history.pushState({ artworkId: art.id }, '', url.toString());
        } else {
          url.searchParams.delete('artwork');
          const cleanUrl = url.pathname + (url.search ? url.search : '');
          window.history.pushState({}, '', cleanUrl);
        }
      } catch {
        // Safe history fallback
      }
    }
  };

  const handleCloseArtwork = () => {
    handleOpenArtwork(null);
  };

  useEffect(() => {
    GalleryService.init().then(() => {
      // Check for valid HTTP-only serverless session cookie or active Supabase session
      if (GalleryService.isGuestSession()) {
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
      }

      refreshArtworks();

      // Deep linking: Immediately open the requested artwork if shared via direct link / WhatsApp / social
      try {
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          let artworkId = urlParams.get('artwork');
          if (!artworkId && window.location.hash.startsWith('#artwork-')) {
            artworkId = window.location.hash.replace('#artwork-', '');
          }
          if (artworkId) {
            const targetArt = GalleryService.getArtworkById(artworkId);
            if (targetArt) {
              setSelectedArtwork(targetArt);
            }
          }
        }
      } catch (err) {
        console.error('Error resolving direct artwork URL:', err);
      }
    });

    // Real-time Cloud Firestore Multi-User Sync
    // Allows 500+ users across phones, tablets, and laptops to see new creations instantly


    const unsubscribeSupabaseAuth = onSupabaseAuthStateChange((event, session, supaUser) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (supaUser) {
          GalleryService.saveCurrentUser(supaUser);
          setCurrentUser(supaUser);
          refreshArtworks();
        }
      } else if (event === 'SIGNED_OUT') {
        const guest = GalleryService.getCurrentUser();
        setCurrentUser(guest);
        refreshArtworks();
      }
    });

    const unsubscribeComments = subscribeToCloudComments((cloudComments) => {
      GalleryService.mergeCloudComments(cloudComments);
    });

    return () => {
      unsubscribeComments();
      unsubscribeSupabaseAuth();
    };
  }, []);

  // Listen to browser Back/Forward (popstate) navigation
  useEffect(() => {
    const handlePopState = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const artworkId = urlParams.get('artwork');
        if (artworkId) {
          const target = GalleryService.getArtworkById(artworkId);
          setSelectedArtwork(target || null);
        } else {
          setSelectedArtwork(null);
        }
      } catch {
        // Safe fallback
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
    toggleRealtimeSave(id);
    GalleryService.toggleSaveArtwork(id);
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
    setIsUploadModalOpen(false);
    triggerNotification(`"${newArtwork.title}" successfully inaugurated into the sanctuary.`, 'success');
  };
  
  const handleSelectExhibition = (exhibitionId: string) => {
    setSelectedExhibitionId(exhibitionId);
    handleSelectView('feed');
    setSelectedCategory('all');
  };

  const handleEditArtwork = (artwork: Artwork) => {
    if (!GalleryService.canUserManageArtwork(artwork, currentUser)) {
      triggerNotification(`Access Denied: "${artwork.title}" was created by ${artwork.artist.name}. Only the author can edit this artwork.`, 'error');
      return;
    }
    setArtworkToEdit(artwork);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedArtwork: Artwork) => {
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
    const res = GalleryService.deleteArtwork(id, currentUser);
    if (!res.success) {
      triggerNotification(res.message, 'error');
      return;
    }
    setSelectedArtwork(null);
    refreshArtworks();
    triggerNotification(res.message, 'success');
  };

  const handleRestoreArtwork = (id: string) => {
    const res = GalleryService.restoreArtwork(id, currentUser);
    if (!res.success) {
      triggerNotification(res.message, 'error');
      return;
    }
    setSelectedArtwork(null);
    refreshArtworks();
    triggerNotification(res.message, 'success');
  };

  const handlePermanentDeleteArtwork = (id: string) => {
    const res = GalleryService.permanentlyDeleteArtwork(id, currentUser);
    if (!res.success) {
      triggerNotification(res.message, 'error');
      return;
    }
    setSelectedArtwork(null);
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
    <ErrorBoundary>
      <div className="min-h-screen w-full bg-gradient-to-br from-[#050608] via-[#0f111a] to-[#050608] text-neutral-200 flex flex-col font-sans selection:bg-[#c9a875]/30 selection:text-[#f8f5eb] relative overflow-x-hidden">
      {/* Global Ambient Canvas Texture */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay bg-canvas-grain z-[45]"
      />

      {/* Editorial Sanctuary Preloader */}
      <EditorialPreloader />

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

      {/* Navbar Header */}
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
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
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
      />

      {/* Ambient music — floating bottom-right, visible to all */}
      <FloatingAudioToggle />

      {/* Studio FAB — owner-only, floating bottom-left */}
      {isFounderUser(currentUser) && (
        <StudioFAB
          onOpenUpload={handleOpenUpload}
          onSelectView={handleSelectView}
          onOpenBackendModal={() => setIsBackendModalOpen(true)}
          onOpenInkStudio={() => setIsInkStudioOpen(true)}
          onOpenEditProfile={() => {
            setIsAddProfileCreateMode(false);
            setAddProfileModalInitialTab('details');
            setIsAddProfileModalOpen(true);
          }}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1760px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 py-0 space-y-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
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
            onSwitchToGallery={() => handleSelectView('feed')}
          />
        )}

        {activeView === 'feed' && (
          <>
            {/* Curatorial Spotlight Hero Section */}
            <CuratorialSpotlight
              artworks={artworks.length > 0 ? artworks : realtimeArtworks}
              onSelectArtwork={handleOpenArtwork}
              onToggleLike={handleToggleLike}
              onToggleSave={handleToggleSave}
              onSelectArtist={handleSelectArtist}
              onShareArtwork={(art) => setArtworkToShare(art)}
            />

            {/* 3D Constellation Cosmos Gateway Banner */}
            <div
              id="feed-cosmos-banner-card"
              onClick={() => handleSelectView('cosmos')}
              className="relative overflow-hidden rounded-sm p-6 sm:p-8 bg-[#07090e] border border-[#c9a875]/20 hover:border-[#c9a875]/50 transition-all duration-300 cursor-pointer group select-none my-8"
              title="Enter the 3D Constellation Cosmos"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,117,0.08),transparent_70%)] pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono-code uppercase tracking-[0.3em] text-[#c9a875]/80">
                      WebGL Experience &middot; {realtimeArtworks.length} Star Nodes
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-editorial font-light text-white group-hover:text-[#dfbd87] transition-colors flex items-center gap-2">
                    <span>3D Constellation Cosmos &amp; Starmap</span>
                    <span className="text-xs text-[#c9a875] opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                  </h3>

                  <p className="font-editorial italic text-sm text-neutral-400 leading-relaxed">
                    Navigate our entire creative universe as an interactive celestial constellation. Every verse, canvas, drawing, and shader shines as an individual coordinate in space.
                  </p>
                </div>

                <div className="shrink-0 flex items-center">
                  <span className="btn-ghost-gold flex items-center gap-2">
                    <span>Enter 3D Cosmos</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>

            {/* Feed Subheader & Curatorial Filter Suite */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-8 pb-6 border-b border-white/6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-editorial font-light tracking-[0.04em] text-white">
                  {selectedCategory === 'all' && 'Curated Sanctuary Stream'}
                  {selectedCategory === 'painting' && 'Fine Oil & Pigment Paintings'}
                  {selectedCategory === 'drawing' && 'Charcoal, Graphite & Ink on Cotton Paper'}
                  {selectedCategory === 'digital' && 'Generative Shaders & 3D Digital Media'}
                  {selectedCategory === 'video' && 'Motion Loops & Cinema Fluid Dynamics'}
                  {selectedCategory === 'poetry' && 'The Poetic Archive & Lyric Verse Cards'}
                </h2>
                <p className="text-xs text-neutral-500 font-mono-code mt-1.5 uppercase tracking-[0.15em]">
                  {artworks.length} indexed work{artworks.length !== 1 ? 's' : ''} &middot; Curated Atelier Archive
                </p>
              </div>

              {/* Editorial Curated / Most Liked / Latest Filter Suite */}
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-1 border-b border-white/10 pb-0.5">
                  <button
                    id="filter-curated-btn"
                    onClick={() => setFeedFilter('curated')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-code uppercase tracking-[0.18em] transition-all duration-200 cursor-pointer ${
                      feedFilter === 'curated'
                        ? 'text-[#c9a875] border-b-2 border-[#c9a875] -mb-[3px] font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#c9a875]" />
                    <span>Curated</span>
                  </button>

                  <button
                    id="filter-popular-btn"
                    onClick={() => setFeedFilter('popular')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-code uppercase tracking-[0.18em] transition-all duration-200 cursor-pointer ${
                      feedFilter === 'popular'
                        ? 'text-rose-300 border-b-2 border-rose-400 -mb-[3px] font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${feedFilter === 'popular' ? 'text-rose-400 fill-rose-400' : 'text-neutral-400'}`} />
                    <span>Most Liked</span>
                  </button>

                  <button
                    id="filter-latest-btn"
                    onClick={() => setFeedFilter('latest')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-code uppercase tracking-[0.18em] transition-all duration-200 cursor-pointer ${
                      feedFilter === 'latest'
                        ? 'text-white border-b-2 border-white -mb-[3px] font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Latest</span>
                  </button>
                </div>

                {/* Cinema Mode Button */}
                <button
                  id="cinema-mode-btn"
                  onClick={() => setIsCinemaModeOpen(true)}
                  className="btn-ghost-gold flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-code uppercase tracking-[0.18em] cursor-pointer"
                  title="View Gallery as Cinematic Slideshow"
                >
                  <Film className="w-3.5 h-3.5 text-[#c9a875]" />
                  <span className="hidden sm:inline">Cinema</span>
                </button>
              </div>
            </div>

            {/* Masonry Grid */}
            <MasonryGrid
              artworks={artworks}
              onSelectArtwork={handleOpenArtwork}
              onToggleLike={handleToggleLike}
              onToggleSave={handleToggleSave}
              onSelectArtist={handleSelectArtist}
              onShareArtwork={(art) => setArtworkToShare(art)}
              selectedCategory={selectedCategory}
              onOpenUpload={handleOpenUpload}
              onOpenBardModal={handleOpenBardWithPoem}
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
                <h2 className="text-2xl sm:text-3xl font-editorial font-light tracking-[-0.01em] text-white flex items-center gap-2.5">
                  <Bookmark className="w-5 h-5 text-[#c9a875]" />
                  <span>Saved Works &amp; Collector Archive</span>
                </h2>
                <p className="text-xs font-mono-code text-neutral-400 mt-1 uppercase tracking-[0.15em]">
                  Your private collector sanctuary &mdash; {artworks.length} saved piece{artworks.length !== 1 ? 's' : ''}
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
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-full border border-[#c9a875]/30 flex items-center justify-center text-[#c9a875]">
                  <Bookmark className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-editorial font-light text-white">No Saved Works Yet</h3>
                <p className="text-xs text-neutral-400 font-editorial italic leading-relaxed">
                  Browse the sanctuary gallery and tap the bookmark icon on any painting, drawing, poem, or digital artwork to save it to your private sanctuary archive.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleSelectView('feed')}
                    className="btn-ghost-gold cursor-pointer"
                  >
                    Explore Atelier Sanctuary
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'recycle-bin' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-editorial font-light tracking-[-0.01em] text-white flex items-center gap-2.5">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                  <span>Your Recycle Bin &amp; Archived Works</span>
                </h2>
                <p className="text-xs font-mono-code text-neutral-400 mt-1 uppercase tracking-[0.15em]">
                  Discarded creations by <span className="text-white font-bold">{currentUser.name}</span> ({artworks.length} item{artworks.length !== 1 ? 's' : ''}) &middot; Protected
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

            {!['about', 'cosmos', 'feed', 'exhibitions', 'community', 'vaults', 'saved', 'recycle-bin'].includes(activeView) && (
              <NotFoundView onReturnToFeed={() => handleSelectView('feed')} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Editorial Footer ────────────────────────────────── */}
      <footer className="relative z-20 mt-24 border-t border-[#c9a875]/12 bg-[#050608]">
        {/* Gold hairline separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#c9a875]/25 to-transparent" />

        <div className="w-full max-w-[1760px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 pt-16 pb-10">
          {/* Large display headline */}
          <div className="mb-12">
            <p className="text-[10px] uppercase tracking-[0.4em] font-mono-code text-[#c9a875]/50 mb-3">
              Est. 2026 &mdash; Digital Atelier
            </p>
            <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-light text-white/90 tracking-[-0.01em] leading-[1.1]">
              The Artisan's Quill
            </h2>
            <p className="font-editorial italic text-lg sm:text-xl text-[#c9a875]/70 mt-2">
              Where the quill meets the brush
            </p>
          </div>

          {/* Three-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 border-t border-white/6 pt-10">
            {/* Col 1 — About */}
            <div className="space-y-3">
              <h3 className="text-[10px] uppercase tracking-[0.35em] text-[#c9a875]/60 font-mono-code">Atelier</h3>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
                A curated digital sanctuary for fine art, lyrical poetry, and algorithmic creation — by Afshaan Shaikh.
              </p>
            </div>

            {/* Col 2 — Navigation */}
            <div className="space-y-3">
              <h3 className="text-[10px] uppercase tracking-[0.35em] text-[#c9a875]/60 font-mono-code">Navigate</h3>
              <nav className="flex flex-col gap-2" aria-label="Footer navigation">
                {[
                  { label: 'Works', view: 'feed' as const },
                  { label: 'Exhibitions', view: 'exhibitions' as const },
                  { label: 'Saved Works', view: 'saved' as const },
                  { label: 'About Afshaan', view: 'about' as const },
                ].map((link) => (
                  <button
                    key={link.view}
                    onClick={() => handleSelectView(link.view)}
                    className="text-sm text-neutral-400 hover:text-white transition-colors text-left cursor-pointer w-fit"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Col 3 — Contact */}
            <div className="space-y-3">
              <h3 className="text-[10px] uppercase tracking-[0.35em] text-[#c9a875]/60 font-mono-code">Contact</h3>
              <div className="flex flex-col gap-2">
                <a
                  href="mailto:afshaan100@gmail.com"
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  afshaan100@gmail.com
                </a>
                <a
                  href="https://afshaanshaikh.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-400 hover:text-[#c9a875] transition-colors"
                >
                  afshaanshaikh.dev ↗
                </a>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-10 pt-6 border-t border-white/5">
            <p className="text-[10px] text-neutral-600 font-mono-code uppercase tracking-[0.25em]">
              &copy; 2026 The Artisan's Quill &mdash; All rights reserved
            </p>
            <button
              id="footer-developed-by-btn"
              onClick={() => handleSelectView('about')}
              className="text-[10px] text-neutral-500 hover:text-[#c9a875] transition-colors font-mono-code uppercase tracking-[0.2em] cursor-pointer"
            >
              Developed by Afshaan Shaikh
            </button>
          </div>
        </div>
      </footer>

      {/* Modals Suite */}
      {/* Modals Suite */}
      <MediaUploadModal
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

      <BackendArchitectureModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
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
    </div>
  </ErrorBoundary>
);
}








