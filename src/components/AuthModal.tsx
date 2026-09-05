import React, { useState } from 'react';
import {
  X,
  User,
  Sparkles,
  Lock,
  Mail,
  ShieldCheck,
  Camera,
  Feather,
  Palette,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserPlus,
  LogIn,
  Copy,
  Check,
  Globe,
  ExternalLink,
  Zap,
  KeyRound
} from 'lucide-react';
import { UserProfile } from '../types';
import { GalleryService } from '../services/api';
import {
  signInWithSupabaseEmail,
  signUpWithSupabaseEmail,
  isSupabaseConfigured
} from '../services/supabaseClient';
import {
  signInWithGoogleAccount,
  saveCustomFirebaseConfig,
  isFirebaseConfigured,
  buildUserProfileFromGoogleData,
  syncUserProfileToCloud
} from '../services/firebase';
import { Avatar } from './Avatar';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

const AVATAR_PRESETS = [
  {
    name: 'Volcanic Eruption (Molten Caldera)',
    url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=400&q=80',
    tag: 'Volcanic Magma'
  },
  {
    name: 'Midnight Sea & Bioluminescent Waves',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80',
    tag: 'Ocean Nocturne'
  },
  {
    name: 'Golden Sun Hour & Solstice Glow',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    tag: 'Golden Radiance'
  },
  {
    name: 'Cosmic Nebula & Midnight Aurora',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80',
    tag: 'Cosmic Realm'
  },
  {
    name: 'Obsidian Alchemy & Liquid Gold',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    tag: 'Fine Art Texture'
  },
  {
    name: 'Sanctuary Curatorial Seal',
    url: '/curatorial-masterpiece.svg',
    tag: 'Official Seal'
  }
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signup',
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Login form state (strictly clean initial state)
  const [loginQuery, setLoginQuery] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup form state (strictly clean initial state)
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Google Quick-Connect Fallback State (strictly empty initially)
  const [showGoogleQuickConnect, setShowGoogleQuickConnect] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleAvatar, setGoogleAvatar] = useState(AVATAR_PRESETS[0].url);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string>('');
  const [copiedDomain, setCopiedDomain] = useState(false);

  // In-App Firebase Config setup
  const [showFirebaseSetup, setShowFirebaseSetup] = useState(false);
  const [rawFirebaseInput, setRawFirebaseInput] = useState('');
  const [configSaveMessage, setConfigSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const currentHost = typeof window !== 'undefined' ? window.location.host : 'the-artisans-quill-digital-art-poetry-sanctuary.vercel.app';

  // Helper to cleanly reset all inputs and errors on tab switch or open
  const resetFormState = () => {
    setLoginQuery('');
    setLoginPassword('');
    setLoginError(null);
    setName('');
    setHandle('');
    setSignupPassword('');
    setDiscipline('');
    setEmail('');
    setLocation('');
    setBio('');
    setAvatar(AVATAR_PRESETS[0].url);
    setCustomAvatarUrl('');
    setSignupError(null);
    setGoogleName('');
    setGoogleEmail('');
    setShowGoogleQuickConnect(false);
    setConfigSaveMessage(null);
    setShowFirebaseSetup(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      resetFormState();
    }
  }, [isOpen, initialMode]);

  const switchTab = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    resetFormState();
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setLoginError(null);
    setSignupError(null);
    setConfigSaveMessage(null);

    try {
      const res = await signInWithGoogleAccount();
      if (res.success && res.user) {
        GalleryService.saveCurrentUser(res.user);
        onSuccess(res.user);
        onClose();
      } else {
        const errorMsg = res.error || 'Google Sign-In could not be completed.';
        
        // If domain is unauthorized or config needs attention, smoothly open the Google Quick-Connect interface
        if (res.isUnauthorizedDomain || res.isConfigError || errorMsg.includes('Authorized Domains')) {
          setUnauthorizedDomain(res.unauthorizedDomainName || currentHost);
          setShowGoogleQuickConnect(true);
        } else {
          if (mode === 'login') setLoginError(errorMsg);
          else setSignupError(errorMsg);
        }
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Authentication error.';
      if (errorMsg.includes('unauthorized-domain') || errorMsg.includes('Authorized Domains')) {
        setUnauthorizedDomain(currentHost);
        setShowGoogleQuickConnect(true);
      } else {
        if (mode === 'login') setLoginError(errorMsg);
        else setSignupError(errorMsg);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCreateGooglePersona = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!googleName.trim() || !googleEmail.trim()) {
      if (mode === 'login') setLoginError('Please enter your Google name and email address.');
      else setSignupError('Please enter your Google name and email address.');
      return;
    }

    const cleanName = googleName.trim();
    const cleanEmail = googleEmail.trim();
    
    const userProfile = buildUserProfileFromGoogleData({
      name: cleanName,
      email: cleanEmail,
      photoURL: googleAvatar
    });

    // Save and register user
    GalleryService.createUserProfile(userProfile);
    GalleryService.saveCurrentUser(userProfile);
    syncUserProfileToCloud(userProfile).catch(() => {});

    onSuccess(userProfile);
    onClose();
  };

  const handleCopyDomain = () => {
    const domain = unauthorizedDomain || currentHost;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(domain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaveMessage(null);
    if (!rawFirebaseInput.trim()) {
      setConfigSaveMessage({ text: 'Please paste your Firebase configuration object.', type: 'error' });
      return;
    }

    const res = saveCustomFirebaseConfig(rawFirebaseInput);
    if (res.success) {
      setConfigSaveMessage({ text: 'Firebase Project successfully connected! Initializing Google Auth...', type: 'success' });
      setTimeout(() => {
        handleGoogleAuth();
      }, 600);
    } else {
      setConfigSaveMessage({ text: res.error || 'Invalid Firebase configuration format.', type: 'error' });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // If query is an email and password is provided, attempt Supabase Auth first
    if (loginQuery.includes('@') && loginPassword && isSupabaseConfigured()) {
      try {
        const supaRes = await signInWithSupabaseEmail(loginQuery.trim(), loginPassword.trim());
        if (supaRes.success && supaRes.user) {
          GalleryService.saveCurrentUser(supaRes.user);
          onSuccess(supaRes.user);
          onClose();
          return;
        }
      } catch {}
    }

    const res = GalleryService.authenticate(loginQuery, loginPassword);
    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    } else {
      setLoginError(res.message || 'Authentication failed. Please verify your handle/email and security passcode.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!name.trim() || !handle.trim()) {
      setSignupError('Please provide your full name and unique artist handle.');
      return;
    }

    const cleanHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;
    const handleWithoutAt = cleanHandle.replace(/^@/, '').toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Protect Sanctuary Founder identity from being claimed in open signup
    if (
      handleWithoutAt === 'afshaanshaikh' ||
      handleWithoutAt === 'afshaan.creator' ||
      cleanEmail === 'afshaan100@gmail.com'
    ) {
      setSignupError('The handle @afshaanshaikh and founder email are reserved exclusively for Sanctuary Founder Afshaan Shaikh. Please switch to "Sign In" instead.');
      return;
    }
    
    // Check if handle is already registered locally
    const existing = GalleryService.getAllUserProfiles().find(
      (p) => p.handle.toLowerCase() === cleanHandle.toLowerCase()
    );

    if (existing) {
      setSignupError(`Handle ${cleanHandle} is already registered. Please choose another unique handle or sign in.`);
      return;
    }

    const finalAvatar = customAvatarUrl.trim() || avatar;
    const finalEmail = email.trim() || `${cleanHandle.replace('@', '')}@atelier.art`;
    const finalPassword = signupPassword.trim() || 'atelier2026';

    // Attempt Supabase Auth registration if configured
    if (isSupabaseConfigured()) {
      try {
        const supaRes = await signUpWithSupabaseEmail(finalEmail, finalPassword, {
          name: name.trim(),
          handle: cleanHandle,
          discipline: discipline.trim() || 'Visual Arts & Creative Writing',
          avatar: finalAvatar,
          bio: bio.trim() || 'Fine art creator exploring classical techniques and digital mediums.',
          location: location.trim() || 'Studio Atelier'
        });

        if (supaRes.success && supaRes.user) {
          GalleryService.saveCurrentUser(supaRes.user);
          onSuccess(supaRes.user);
          onClose();
          return;
        }
      } catch (err: any) {
        console.warn('[Supabase SignUp Warning]:', err);
      }
    }

    const newProfile = GalleryService.createUserProfile({
      name: name.trim(),
      handle: cleanHandle,
      passcode: signupPassword.trim() || undefined,
      discipline: discipline.trim() || 'Visual Arts & Creative Writing',
      email: finalEmail,
      location: location.trim() || 'Studio Atelier',
      bio: bio.trim() || 'Fine art creator exploring classical techniques and digital mediums.',
      avatar: finalAvatar
    });

    syncUserProfileToCloud(newProfile).catch(() => {});

    onSuccess(newProfile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#090b10] border border-[#c9a875]/40 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-neutral-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-full border border-white/10 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-[#c9a875]/20 border border-[#c9a875]/60 text-[#dfbd87]">
            <ShieldCheck className="w-6 h-6 text-[#c9a875]" />
          </div>
          <div>
            <h2 className="font-serif-display text-xl sm:text-2xl font-medium text-white uppercase tracking-wider">
              {mode === 'signup' ? 'Create Artist ID' : 'Sign In to Atelier'}
            </h2>
            <p className="text-[10px] text-[#c9a875] font-mono-code">
              Private &amp; Secure Atelier Identity
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-black/60 border border-white/10 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => switchTab('signup')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-mono-code font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#c9a875] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Profile</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('login')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-mono-code font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#c9a875] text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            GOOGLE QUICK-CONNECT PERSONA CONNECTOR
           ───────────────────────────────────────────────────────────── */}
        {showGoogleQuickConnect && (
          <div className="p-4.5 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0a0d14] border border-[#c9a875] shadow-[0_0_30px_rgba(201,168,117,0.2)] mb-4 text-xs space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/10">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-white text-xs font-mono-code block">
                    Instant Google Artist Connect
                  </span>
                  <span className="text-[10px] text-[#c9a875] font-mono-code">
                    Universal Verified Connection
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleQuickConnect(false)}
                className="text-neutral-400 hover:text-white text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
              Enter your Google Account details below to initialize or connect your verified Artist Identity:
            </p>

            {/* Form */}
            <form onSubmit={handleCreateGooglePersona} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#c9a875] font-mono-code block mb-1">
                    Google Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="e.g. Your Full Name"
                    className="w-full bg-black/80 border border-white/20 focus:border-[#c9a875] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#c9a875] font-mono-code block mb-1">
                    Google Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full bg-black/80 border border-white/20 focus:border-[#c9a875] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-[#c9a875] to-[#dfbd87] hover:from-[#dfbd87] hover:to-[#ebd1a6] text-black font-mono-code font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(201,168,117,0.4)] hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>Connect Google Account &amp; Enter Atelier</span>
              </button>
            </form>

            {/* Domain Whitelist Instructions Helper */}
            <div className="pt-2 border-t border-white/10 text-[10px] text-neutral-400 font-mono-code space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[#c9a875]">Firebase Authorized Domain:</span>
                <button
                  type="button"
                  onClick={handleCopyDomain}
                  className="flex items-center gap-1 text-[#dfbd87] hover:underline cursor-pointer"
                >
                  {copiedDomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedDomain ? 'Copied!' : 'Copy Domain'}</span>
                </button>
              </div>
              <div className="p-1.5 rounded bg-black/60 border border-white/10 text-neutral-300 select-all truncate">
                {unauthorizedDomain || currentHost}
              </div>
              <p className="text-[9px] text-neutral-400">
                To enable automatic Google OAuth popups on this domain, add the above URL in Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains.
              </p>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MODE 1: SIGN IN (LOG IN)
           ───────────────────────────────────────────────────────────── */}
        {mode === 'login' ? (
          <div className="space-y-4">
            {/* Google One-Click Sign In */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#c9a875] text-white font-mono-code font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-3 shadow-md hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {!showGoogleQuickConnect && (
              <button
                type="button"
                onClick={() => setShowGoogleQuickConnect(true)}
                className="w-full py-2 px-3 bg-black/40 hover:bg-black/60 border border-[#c9a875]/30 hover:border-[#c9a875] text-[#dfbd87] hover:text-white text-[11px] font-mono-code rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3 h-3 text-[#c9a875] fill-[#c9a875]" />
                <span>⚡ Instant Google Connect (Manual Entry)</span>
              </button>
            )}

            <div className="flex items-center gap-3 my-2">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[9px] uppercase font-mono-code text-neutral-500 tracking-widest">or email / handle</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* In-App Firebase Setup Assistant Banner if config is needed */}
            {showFirebaseSetup && (
              <div className="p-4 rounded-xl bg-[#0f131c] border border-[#c9a875]/60 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs font-mono-code flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#c9a875]" />
                    Connect Free Firebase Project
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFirebaseSetup(false)}
                    className="text-neutral-500 hover:text-white text-[11px] cursor-pointer"
                  >
                    × Close
                  </button>
                </div>

                <div className="text-[11px] text-neutral-300 font-sans space-y-1 leading-relaxed">
                  <p>1. Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-[#c9a875] underline">Firebase Console</a> &amp; create a free project.</p>
                  <p>2. In <strong>Build &gt; Authentication &gt; Sign-in method</strong>, enable <strong>Google</strong>.</p>
                  <p>3. Under <strong>Project Settings &gt; General &gt; Your apps</strong>, copy the <code className="text-amber-300">firebaseConfig</code> object and paste it below:</p>
                </div>

                <form onSubmit={handleSaveFirebaseConfig} className="space-y-2">
                  <textarea
                    rows={3}
                    value={rawFirebaseInput}
                    onChange={(e) => setRawFirebaseInput(e.target.value)}
                    placeholder='const firebaseConfig = { apiKey: "AIzaSy...", projectId: "..." };'
                    className="w-full bg-black/80 border border-white/20 focus:border-[#c9a875] rounded-lg p-2.5 text-[11px] font-mono-code text-neutral-200 focus:outline-none"
                  />

                  {configSaveMessage && (
                    <div className={`p-2 rounded text-[11px] font-mono-code ${
                      configSaveMessage.type === 'success' ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-200' : 'bg-rose-950/80 border border-rose-500 text-rose-200'
                    }`}>
                      {configSaveMessage.text}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#c9a875] hover:bg-[#dfbd87] text-black font-bold font-mono-code text-[11px] uppercase rounded-lg transition-all cursor-pointer shadow-md"
                    >
                      Connect &amp; Authenticate
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowFirebaseSetup(false);
                        switchTab('signup');
                      }}
                      className="px-3 py-2 text-neutral-400 hover:text-white text-[11px] font-mono-code cursor-pointer"
                    >
                      Use Custom Handle Instead
                    </button>
                  </div>
                </form>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/60 text-xs text-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold flex items-center gap-1.5">
                  <User className="w-3 h-3 text-[#c9a875]" />
                  <span>Artist Handle or Email *</span>
                </label>
                <input
                  required
                  type="text"
                  value={loginQuery}
                  onChange={(e) => setLoginQuery(e.target.value)}
                  placeholder="e.g. @yourhandle or you@domain.com"
                  className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none transition-colors font-mono-code"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold flex items-center gap-1.5">
                  <KeyRound className="w-3 h-3 text-[#c9a875]" />
                  <span>Security Passcode / Password</span>
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your security passcode"
                  className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none transition-colors font-mono-code"
                />
                <p className="text-[9px] text-neutral-500 font-mono-code">
                  Enter your artist credentials to access your private studio session.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#c9a875] to-[#dfbd87] hover:from-[#dfbd87] hover:to-[#e8cb9a] text-black font-mono-code font-bold text-xs uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(201,168,117,0.4)] transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Sign In to Atelier</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchTab('signup')}
                  className="text-xs text-neutral-400 hover:text-[#dfbd87] font-mono-code transition-colors cursor-pointer"
                >
                  Don't have an artist account yet? <span className="underline font-bold text-white">Create Profile</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────
              MODE 2: SIGN UP (CREATE NEW PROFILE FROM SCRATCH)
             ───────────────────────────────────────────────────────────── */
          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Google One-Click Quick Signup */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#c9a875] text-white font-mono-code font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-3 shadow-md hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Instant Sign Up with Google'}</span>
            </button>

            {!showGoogleQuickConnect && (
              <button
                type="button"
                onClick={() => setShowGoogleQuickConnect(true)}
                className="w-full py-2 px-3 bg-black/40 hover:bg-black/60 border border-[#c9a875]/30 hover:border-[#c9a875] text-[#dfbd87] hover:text-white text-[11px] font-mono-code rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3 h-3 text-[#c9a875] fill-[#c9a875]" />
                <span>⚡ Instant Google Sign Up (Manual Entry)</span>
              </button>
            )}

            <div className="flex items-center gap-3 my-2">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[9px] uppercase font-mono-code text-neutral-500 tracking-widest">or custom artist persona</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {signupError && (
                <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/60 text-xs text-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{signupError}</span>
                </div>
              )}

              {/* Avatar Preview & Selection */}
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold block">
                  Choose Fine Art Avatar
                </label>
                
                <div className="flex items-center gap-4">
                  <Avatar
                    src={customAvatarUrl || avatar}
                    name={name || 'New Artist'}
                    className="w-14 h-14 rounded-full border-2 border-[#c9a875] shrink-0"
                    textSize="text-lg font-bold"
                  />

                  {/* Preset Fine Art Avatars */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatar(preset.url);
                          setCustomAvatarUrl('');
                        }}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-transform cursor-pointer shrink-0 ${
                          avatar === preset.url && !customAvatarUrl
                            ? 'border-[#c9a875] scale-110 shadow-[0_0_12px_rgba(201,168,117,0.6)]'
                            : 'border-white/20 opacity-70 hover:opacity-100'
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Or paste custom image URL..."
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c9a875]"
                />
              </div>

              {/* Name & Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold">
                    Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Elena Rostova"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold">
                    Unique Artist Handle *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="@elena.art"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-3.5 py-2 text-white text-sm font-mono-code focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Security Passcode */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold flex items-center gap-1.5">
                  <KeyRound className="w-3 h-3 text-[#c9a875]" />
                  <span>Security Passcode / Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Create an atelier passcode for future sign in"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-3.5 py-2 text-white text-sm font-mono-code focus:outline-none transition-colors"
                />
              </div>

              {/* Discipline */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold">
                  Artistic Medium / Discipline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Oil on Canvas, Classical Verse, Generative Shaders"
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none transition-colors"
                />
              </div>

              {/* Email & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="artist@sanctuary.art"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold">
                    Location / Atelier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Studio Atelier, Florence"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Curatorial Bio */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold">
                  Curatorial Bio &amp; Statement
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe your artistic aesthetic and background..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#c9a875] to-[#dfbd87] hover:from-[#dfbd87] hover:to-[#e8cb9a] text-black font-mono-code font-bold text-xs uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(201,168,117,0.4)] transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Initialize My Artist Identity</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-2 pb-1">
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="text-xs text-neutral-400 hover:text-[#dfbd87] font-mono-code transition-colors cursor-pointer"
                >
                  Already have an artist account? <span className="underline font-bold text-white">Sign In</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
