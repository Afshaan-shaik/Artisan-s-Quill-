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
  Info
} from 'lucide-react';
import { UserProfile } from '../types';
import { GalleryService } from '../services/api';
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

  // ── Login form state ─────────────────────────────────────────────────
  const [loginQuery, setLoginQuery] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  // ── Signup form state ────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [discipline, setDiscipline] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);

  // Reset all form state on mode switch or modal open
  const resetFormState = () => {
    setLoginQuery('');
    setLoginPassword('');
    setShowLoginPassword(false);
    setLoginError(null);
    setIsLoginSubmitting(false);

    setName('');
    setHandle('');
    setSignupPassword('');
    setConfirmPassword('');
    setShowSignupPassword(false);
    setShowConfirmPassword(false);
    setDiscipline('');
    setEmail('');
    setLocation('');
    setBio('');
    setAvatar(AVATAR_PRESETS[0].url);
    setCustomAvatarUrl('');
    setSignupError(null);
    setIsSignupSubmitting(false);
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
  };

  // ── Sign In Handler ──────────────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoginSubmitting(true);

    try {
      // 1. Try serverless login endpoint (Supabase Auth + HTTP-only session cookie)
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
            // Try local fallback before displaying error
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
        // Network / offline — fall through to local
      }

      // 2. Client-side local auth fallback (founder passcodes, localStorage credentials)
      const res = GalleryService.authenticate(loginQuery, loginPassword);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setLoginError(
          res.message ||
            'Authentication failed. Please check your email / handle and password.'
        );
      }
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  // ── Create Account Handler ───────────────────────────────────────────
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    // Required field validation
    if (!name.trim() || !handle.trim() || !email.trim()) {
      setSignupError('Please provide your full name, artist handle, and email address.');
      return;
    }

    // Password minimum length
    if (signupPassword.trim().length < 6) {
      setSignupError('Your password must be at least 6 characters long.');
      return;
    }

    // Confirm password match
    if (signupPassword.trim() !== confirmPassword.trim()) {
      setSignupError('Passwords do not match. Please ensure both passwords are identical.');
      return;
    }

    const cleanHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;
    const handleWithoutAt = cleanHandle.replace(/^@/, '').toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Protect Sanctuary Founder identity
    if (
      handleWithoutAt === 'afshaanshaikh' ||
      handleWithoutAt === 'afshaan.creator' ||
      cleanEmail === 'afshaan100@gmail.com'
    ) {
      setSignupError(
        'The handle @afshaanshaikh and founder email are reserved exclusively for Sanctuary Founder Afshaan Shaikh. Please switch to "Sign In" instead.'
      );
      return;
    }

    // Check if handle is already taken locally
    const existing = GalleryService.getAllUserProfiles().find(
      (p) => p.handle.toLowerCase() === cleanHandle.toLowerCase()
    );
    if (existing) {
      setSignupError(
        `Handle ${cleanHandle} is already registered. Please choose another handle or sign in.`
      );
      return;
    }

    const finalAvatar = customAvatarUrl.trim() || avatar;
    const finalPassword = signupPassword.trim();

    setIsSignupSubmitting(true);

    try {
      // 1. Try serverless registration endpoint (Supabase Auth with auto-confirmed email)
      try {
        const resp = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            handle: cleanHandle,
            email: cleanEmail,
            password: finalPassword,
            discipline: discipline.trim() || 'Visual Arts & Creative Writing',
            bio: bio.trim() || 'Fine art creator on The Artisan\'s Quill.',
            location: location.trim() || 'Studio Atelier',
            avatar: finalAvatar
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data.success && data.user) {
            GalleryService.saveCredential(cleanHandle, finalPassword);
            if (cleanEmail) GalleryService.saveCredential(cleanEmail, finalPassword);
            GalleryService.saveCurrentUser(data.user);
            onSuccess(data.user);
            onClose();
            return;
          }
        }
      } catch {
        // Network / offline — fall through to local profile creation
      }

      // 2. Client-side local profile creation fallback
      const newProfile = GalleryService.createUserProfile({
        name: name.trim(),
        handle: cleanHandle,
        passcode: finalPassword,
        discipline: discipline.trim() || 'Visual Arts & Creative Writing',
        email: cleanEmail,
        location: location.trim() || 'Studio Atelier',
        bio: bio.trim() || 'Fine art creator on The Artisan\'s Quill.',
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
              {mode === 'signup' ? 'Create Artist Account' : 'Sign In to Atelier'}
            </h2>
            <p className="text-[10px] text-[#c9a875] font-mono-code">
              Verified & Secure Atelier Identity
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
            <span>Create Account</span>
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
            MODE 1: SIGN IN
           ───────────────────────────────────────────────────────────── */}
        {mode === 'login' ? (
          <form
            onSubmit={handleLoginSubmit}
            className="space-y-4"
            autoComplete="on"
          >
            {/* Browser password tip */}
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#c9a875]/10 border border-[#c9a875]/25">
              <Info className="w-3.5 h-3.5 text-[#c9a875] mt-0.5 shrink-0" />
              <p className="text-[10px] text-[#c9a875]/80 font-mono-code">
                Your browser can autofill saved passwords below. Use the browser's key icon or password manager to sign in instantly.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/60 text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="login-username"
                className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold flex items-center gap-1.5"
              >
                <User className="w-3 h-3 text-[#c9a875]" />
                <span>Artist Handle or Email *</span>
              </label>
              <input
                required
                id="login-username"
                name="username"
                type="text"
                autoComplete="username"
                value={loginQuery}
                onChange={(e) => setLoginQuery(e.target.value)}
                placeholder="e.g. @yourhandle or you@domain.com"
                className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none transition-colors font-mono-code"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold flex items-center gap-1.5"
              >
                <KeyRound className="w-3 h-3 text-[#c9a875]" />
                <span>Password *</span>
              </label>
              <div className="relative">
                <input
                  required
                  id="login-password"
                  name="password"
                  type={showLoginPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-4 py-2.5 pr-10 text-white text-sm focus:outline-none transition-colors font-mono-code"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
                Don't have an artist account yet?{' '}
                <span className="underline font-bold text-white">Create Account</span>
              </button>
            </div>
          </form>
        ) : (
          /* ─────────────────────────────────────────────────────────────
              MODE 2: CREATE ACCOUNT
             ───────────────────────────────────────────────────────────── */
          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Browser password tip */}
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#c9a875]/10 border border-[#c9a875]/25">
              <Info className="w-3.5 h-3.5 text-[#c9a875] mt-0.5 shrink-0" />
              <p className="text-[10px] text-[#c9a875]/80 font-mono-code">
                After creating your account, your browser will offer to securely save your password for 1-click future sign-ins.
              </p>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-4" autoComplete="on">
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
                  type="url"
                  placeholder="Or paste custom image URL..."
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c9a875]"
                />
              </div>

              {/* Name & Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="signup-name"
                    className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold"
                  >
                    Full Name *
                  </label>
                  <input
                    required
                    id="signup-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Elena Rostova"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="signup-handle"
                    className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold"
                  >
                    Artist Handle *
                  </label>
                  <input
                    required
                    id="signup-handle"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="@elena.art"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-3.5 py-2 text-white text-sm font-mono-code focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label
                  htmlFor="signup-email"
                  className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold"
                >
                  Email Address *
                </label>
                <input
                  required
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="artist@sanctuary.art"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none transition-colors"
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="signup-password"
                    className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3 h-3 text-[#c9a875]" />
                    Create Password *
                  </label>
                  <div className="relative">
                    <input
                      required
                      id="signup-password"
                      name="new-password"
                      type={showSignupPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      minLength={6}
                      placeholder="Min. 6 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-3.5 py-2 pr-9 text-white text-sm font-mono-code focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="signup-confirm-password"
                    className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3 h-3 text-[#c9a875]" />
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      required
                      id="signup-confirm-password"
                      name="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      minLength={6}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full bg-black/60 border rounded-lg px-3.5 py-2 pr-9 text-white text-sm font-mono-code focus:outline-none transition-colors ${
                        confirmPassword && confirmPassword !== signupPassword
                          ? 'border-rose-500/70 focus:border-rose-400'
                          : confirmPassword && confirmPassword === signupPassword
                          ? 'border-emerald-500/70 focus:border-emerald-400'
                          : 'border-white/15 focus:border-[#c9a875]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {/* Live match feedback */}
                  {confirmPassword && (
                    <p className={`text-[9px] font-mono-code mt-0.5 ${
                      confirmPassword === signupPassword ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {confirmPassword === signupPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>
              </div>

              {/* Artistic Discipline */}
              <div className="space-y-1">
                <label
                  htmlFor="signup-discipline"
                  className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold"
                >
                  Artistic Medium / Discipline
                </label>
                <input
                  id="signup-discipline"
                  type="text"
                  placeholder="e.g. Oil on Canvas, Classical Verse, Generative Shaders"
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none transition-colors"
                />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label
                  htmlFor="signup-location"
                  className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold"
                >
                  Location / Atelier
                </label>
                <input
                  id="signup-location"
                  type="text"
                  placeholder="e.g. Studio Atelier, Florence"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none transition-colors"
                />
              </div>

              {/* Curatorial Bio */}
              <div className="space-y-1">
                <label
                  htmlFor="signup-bio"
                  className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold"
                >
                  Curatorial Bio &amp; Statement
                </label>
                <textarea
                  id="signup-bio"
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
                      <span>Create My Artist Account</span>
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
                  Already have an artist account?{' '}
                  <span className="underline font-bold text-white">Sign In</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
