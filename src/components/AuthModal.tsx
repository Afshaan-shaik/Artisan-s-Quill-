import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserPlus,
  LogIn,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { UserProfile } from '../types';
import { GalleryService } from '../services/api';
import {
  signInWithGoogleAccount,
  signInWithGoogleRedirect
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

  // Login form state
  const [loginQuery, setLoginQuery] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  // Signup form state
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [discipline, setDiscipline] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);

  // Google OAuth State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);

  // Reset form state on mode switch or open
  const resetFormState = () => {
    setLoginQuery('');
    setLoginPassword('');
    setShowLoginPassword(false);
    setLoginError(null);
    setIsLoginSubmitting(false);

    setName('');
    setHandle('');
    setSignupPassword('');
    setShowSignupPassword(false);
    setDiscipline('');
    setEmail('');
    setLocation('');
    setBio('');
    setAvatar(AVATAR_PRESETS[0].url);
    setCustomAvatarUrl('');
    setSignupError(null);
    setIsSignupSubmitting(false);

    setIsGoogleLoading(false);
    setPopupBlocked(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      resetFormState();
    }
  }, [isOpen, initialMode]);

  const switchTab = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setLoginError(null);
    setSignupError(null);
    setPopupBlocked(false);
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setLoginError(null);
    setSignupError(null);
    setPopupBlocked(false);

    try {
      const res = await signInWithGoogleAccount();
      if (res.success && res.user) {
        GalleryService.saveCurrentUser(res.user);
        onSuccess(res.user);
        onClose();
      } else {
        if (res.isPopupBlocked) {
          setPopupBlocked(true);
        }
        const errorMsg = res.error || 'Google Sign-In could not be completed.';
        if (mode === 'login') setLoginError(errorMsg);
        else setSignupError(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Authentication error.';
      if (mode === 'login') setLoginError(errorMsg);
      else setSignupError(errorMsg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleRedirect = async () => {
    try {
      setIsGoogleLoading(true);
      await signInWithGoogleRedirect();
    } catch (err: any) {
      setIsGoogleLoading(false);
      const errorMsg = err?.message || 'Could not initiate redirect.';
      if (mode === 'login') setLoginError(errorMsg);
      else setSignupError(errorMsg);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoginSubmitting(true);

    try {
      // 1. Try serverless login endpoint first (handles Supabase Auth + cookies across devices)
      try {
        const resp = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: loginQuery.trim(),
            password: loginPassword.trim()
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data.success && data.user) {
            GalleryService.saveCurrentUser(data.user);
            onSuccess(data.user);
            onClose();
            return;
          }
        } else {
          const errData = await resp.json().catch(() => ({}));
          if (errData.error && !errData.error.includes('unavailable')) {
            // Check local fallback before showing error
            const localRes = GalleryService.authenticate(loginQuery, loginPassword);
            if (localRes.success && localRes.user) {
              GalleryService.saveCurrentUser(localRes.user);
              onSuccess(localRes.user);
              onClose();
              return;
            }
            setLoginError(errData.error);
            return;
          }
        }
      } catch {
        // Network or offline fallback
      }

      // 2. Client-side local authentication fallback (handles founder passcodes and local credentials)
      const res = GalleryService.authenticate(loginQuery, loginPassword);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setLoginError(res.message || 'Authentication failed. Please verify your handle/email and security passcode.');
      }
    } finally {
      setIsLoginSubmitting(false);
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

    // Check if handle is already registered
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

    setIsSignupSubmitting(true);

    try {
      // 1. Try serverless registration endpoint (auto-confirms email and stores in Supabase)
      try {
        const resp = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            handle: cleanHandle,
            email: finalEmail,
            password: finalPassword,
            discipline: discipline.trim() || 'Visual Arts & Creative Writing',
            bio: bio.trim() || 'Fine art creator on The Artisan’s Quill.',
            location: location.trim() || 'Studio Atelier',
            avatar: finalAvatar
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data.success && data.user) {
            GalleryService.saveCredential(cleanHandle, finalPassword);
            if (finalEmail) GalleryService.saveCredential(finalEmail, finalPassword);
            GalleryService.saveCurrentUser(data.user);
            onSuccess(data.user);
            onClose();
            return;
          }
        }
      } catch {
        // Fallback to local profile creation
      }

      // 2. Client-side local profile creation fallback
      const newProfile = GalleryService.createUserProfile({
        name: name.trim(),
        handle: cleanHandle,
        passcode: finalPassword,
        discipline: discipline.trim() || 'Visual Arts & Creative Writing',
        email: finalEmail,
        location: location.trim() || 'Studio Atelier',
        bio: bio.trim() || 'Fine art creator on The Artisan’s Quill.',
        avatar: finalAvatar
      });

      onSuccess(newProfile);
      onClose();
    } finally {
      setIsSignupSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#090b10] border border-[#c9a875]/40 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-neutral-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-full border border-white/10 transition-colors cursor-pointer z-10"
          title="Close Modal"
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
              Verified &amp; Secure Atelier Identity
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
            MODE 1: SIGN IN (LOG IN)
           ───────────────────────────────────────────────────────────── */}
        {mode === 'login' ? (
          <div className="space-y-4">
            {/* Real Google One-Click Sign In */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#c9a875] text-white font-mono-code font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-3 shadow-md hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#c9a875]" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              )}
              <span>{isGoogleLoading ? 'Authenticating with Google...' : 'Continue with Google'}</span>
            </button>

            {popupBlocked && (
              <button
                type="button"
                onClick={handleGoogleRedirect}
                className="w-full py-2 px-3 bg-[#c9a875]/15 hover:bg-[#c9a875]/25 border border-[#c9a875]/60 text-[#dfbd87] text-[11px] font-mono-code rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Popup blocked? Click to Sign In with Redirect</span>
              </button>
            )}

            <div className="flex items-center gap-3 my-2">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[9px] uppercase font-mono-code text-neutral-500 tracking-widest">or email / handle</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

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
                  <span>Security Passcode / Password *</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your security passcode"
                    className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-4 py-2.5 pr-10 text-white text-sm focus:outline-none transition-colors font-mono-code"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[9px] text-neutral-500 font-mono-code">
                  Enter your artist credentials to access your private studio session.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoginSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-[#c9a875] to-[#dfbd87] hover:from-[#dfbd87] hover:to-[#e8cb9a] text-black font-mono-code font-bold text-xs uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(201,168,117,0.4)] transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoginSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <>
                      <span>Sign In to Atelier</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
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
            {/* Real Google One-Click Sign Up */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#c9a875] text-white font-mono-code font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-3 shadow-md hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#c9a875]" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              )}
              <span>{isGoogleLoading ? 'Authenticating with Google...' : 'Instant Sign Up with Google'}</span>
            </button>

            {popupBlocked && (
              <button
                type="button"
                onClick={handleGoogleRedirect}
                className="w-full py-2 px-3 bg-[#c9a875]/15 hover:bg-[#c9a875]/25 border border-[#c9a875]/60 text-[#dfbd87] text-[11px] font-mono-code rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Popup blocked? Click to Sign Up with Redirect</span>
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
                  <span>Security Passcode / Password *</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type={showSignupPassword ? 'text' : 'password'}
                    placeholder="Create a password for your account"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-3.5 py-2 pr-10 text-white text-sm font-mono-code focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
                    Email Address *
                  </label>
                  <input
                    required
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
                  disabled={isSignupSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-[#c9a875] to-[#dfbd87] hover:from-[#dfbd87] hover:to-[#e8cb9a] text-black font-mono-code font-bold text-xs uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(201,168,117,0.4)] transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSignupSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <>
                      <span>Initialize My Artist Identity</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
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
