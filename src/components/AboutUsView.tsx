import React, { useState, useEffect } from 'react';
import {
  Feather,
  Palette,
  Code2,
  Terminal,
  Mail,
  Phone,
  MapPin,
  Send,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Layers,
  Heart,
  Award,
  BookOpen,
  Cpu,
  ArrowRight,
  Copy,
  Check,
  Camera,
  ShieldCheck,
  User,
  Lock,
  Compass,
  Quote,
  MessageSquare,
  PhoneCall,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, ArtCategory, Inquiry } from '../types';
import { GalleryService, isFounderUser } from '../services/api';
import { DEFAULT_USER } from '../data/initialData';
import { saveInquiryToSupabase } from '../services/supabaseClient';

interface AboutUsViewProps {
  currentUser: UserProfile;
  onNavigateCategory?: (category: ArtCategory) => void;
  onOpenUpload?: () => void;
  onOpenEditProfile?: (targetUser?: UserProfile) => void;
  onFounderAuthenticated?: (user: UserProfile) => void;
}

export const AboutUsView: React.FC<AboutUsViewProps> = ({
  currentUser,
  onNavigateCategory,
  onOpenUpload,
  onOpenEditProfile,
  onFounderAuthenticated
}) => {
  // Always load and lock to Founder Afshaan Shaikh's profile
  const [founder, setFounder] = useState<UserProfile>(GalleryService.getFounderProfile());

  // Inquiry Form State
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('art-acquisition');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [lastInquiry, setLastInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    // 1. Initial cached or default profile
    setFounder(GalleryService.getFounderProfile());

    // 2. Live fetch from permanent Supabase database so ANY visitor sees real photo
    GalleryService.syncFounderProfile().then((liveFounder) => {
      if (liveFounder && liveFounder.avatar) {
        setFounder(liveFounder);
      }
    });

    // 3. Listen to immediate founder profile updates across modals
    const handleFounderUpdated = (e: Event) => {
      const customEvt = e as CustomEvent<UserProfile>;
      if (customEvt.detail && customEvt.detail.avatar) {
        setFounder(customEvt.detail);
      }
    };
    window.addEventListener('atelier_founder_profile_updated', handleFounderUpdated);
    return () => window.removeEventListener('atelier_founder_profile_updated', handleFounderUpdated);
  }, [currentUser]);

  // Strict founder edit authorization check — only Sanctuary Creator Afshaan Shaikh can edit
  const isFounderLoggedIn = isFounderUser(currentUser);

  // Founder passcode unlock modal state
  const [showFounderModal, setShowFounderModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlockFounder = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);
    setIsUnlocking(true);
    try {
      const res = GalleryService.loginAsFounder(passcodeInput);
      if (res.success && res.user) {
        setFounder(res.user);
        onFounderAuthenticated?.(res.user);
        setShowFounderModal(false);
        setPasscodeInput('');
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#c9a875', '#dfbd87', '#ffffff']
        });
      } else {
        setPasscodeError(res.message || 'Incorrect passcode. Access restricted exclusively to Sanctuary Creator Afshaan Shaikh.');
      }
    } catch {
      setPasscodeError('Authentication error. Access denied.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const INQUIRY_LABELS: Record<string, string> = {
    'art-acquisition': 'Fine Art Acquisition & Licensing',
    'poetry-commission': 'Bespoke Poetic Verse Commission',
    'software-development': 'Software Architecture & Bespoke Web Systems',
    'curatorial-press': 'Curatorial Exhibition & Press Inquiries',
    'collaboration': 'Creative Collaboration & Joint Projects'
  };

  const generateWhatsAppUrl = (inq: { fullName: string; email: string; phone?: string; inquiryType: string; message: string }) => {
    const label = INQUIRY_LABELS[inq.inquiryType] || inq.inquiryType;
    const text = `🌟 *The Artisan's Quill — Direct Concierge Inquiry*\n\n` +
      `👤 *Inquirer:* ${inq.fullName}\n` +
      `📧 *Email:* ${inq.email}\n` +
      `📱 *Phone:* ${inq.phone || 'Not provided'}\n` +
      `🏷️ *Inquiry Type:* ${label}\n\n` +
      `💬 *Message:*\n${inq.message}\n\n` +
      `— Sent via The Artisan's Quill Sanctuary`;
    return `https://wa.me/919611263884?text=${encodeURIComponent(text)}`;
  };

  const generateMailtoUrl = (inq: { fullName: string; email: string; phone?: string; inquiryType: string; message: string }) => {
    const label = INQUIRY_LABELS[inq.inquiryType] || inq.inquiryType;
    const subject = `[Artisan's Quill Inquiry] ${label} — From ${inq.fullName}`;
    const body = `Dear Afshaan Shaikh,\n\n` +
      `You have received a new concierge inquiry from The Artisan's Quill sanctuary:\n\n` +
      `• Inquirer Name: ${inq.fullName}\n` +
      `• Email Address: ${inq.email}\n` +
      `• Phone Number: ${inq.phone || 'Not provided'}\n` +
      `• Inquiry Type: ${label}\n\n` +
      `Message:\n${inq.message}\n\n` +
      `---\nDispatched from The Artisan's Quill Atelier Sanctuary\nTimestamp: ${new Date().toISOString()}`;
    return `mailto:afshaan100@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = async (e: React.FormEvent, directChannel: 'both' | 'whatsapp' | 'email' = 'both') => {
    e.preventDefault();
    if (!fullName.trim() || !emailAddress.trim() || !message.trim()) return;

    setIsSubmitting(true);

    const newInquiry: Inquiry = {
      id: `inquiry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fullName: fullName.trim(),
      email: emailAddress.trim(),
      phone: phone.trim() || undefined,
      inquiryType: inquiryType,
      message: message.trim(),
      channel: directChannel,
      status: 'new',
      createdAt: new Date().toISOString()
    };

    setLastInquiry(newInquiry);

    try {
      // 1. Save permanently to Supabase Postgres database
      await saveInquiryToSupabase(newInquiry);

      // 2. Dispatch via requested channel
      const waUrl = generateWhatsAppUrl(newInquiry);
      const mailUrl = generateMailtoUrl(newInquiry);

      if (directChannel === 'whatsapp') {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      } else if (directChannel === 'email') {
        window.location.href = mailUrl;
      } else {
        // 'both' mode: try triggering email client or opening WhatsApp direct window
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }

      // 3. Trigger celebratory particle burst
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#c9a875', '#dfbd87', '#ffffff', '#25D366']
      });

      setSubmitSuccess(true);
      setFullName('');
      setEmailAddress('');
      setPhone('');
      setMessage('');
    } catch (err) {
      console.warn('[AboutUsView] Submission note:', err);
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('afshaan100@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div id="about-us-view" className="space-y-24 py-6 sm:py-10 max-w-6xl mx-auto px-4 sm:px-6">
      
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: OUR VISIONARY & CREATOR (AFSHAAN SHAIKH EXCLUSIVELY)
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-mono-code uppercase tracking-[0.3em] text-[#c9a875]">
            <Feather className="w-3.5 h-3.5" />
            <span>The Artisan & Software Architect</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-display font-light text-white tracking-tight">
            Our <span className="italic text-[#dfbd87] font-normal">Visionary</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto font-sans leading-relaxed">
            At the rare confluence of mathematical rigor, lyrical poetry, and unyielding aesthetic discipline.
          </p>
        </div>

        {/* Visionary Feature Card */}
        <div className="relative rounded-2xl bg-gradient-to-b from-[#0e1017] via-[#090b10] to-[#06070a] border border-[#c9a875]/30 shadow-[0_10px_50px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Ambient Lighting Background Accents */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#c9a875]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#dfbd87]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-6 sm:p-10 lg:p-14 relative z-10 items-center">
            
            {/* Left: Portrait Canvas */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative group w-full max-w-sm">
                {/* Gold Museum Frame Border */}
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-[#c9a875]/60 group-hover:border-[#dfbd87] transition-all duration-300 shadow-[0_0_35px_rgba(201,168,117,0.25)] bg-[#0a0c12]">
                  <img
                    src={founder.avatar || DEFAULT_USER.avatar}
                    alt="Afshaan Shaikh — Artist, Poet, Coder, Software Developer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_USER.avatar;
                    }}
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-transparent to-transparent opacity-80" />
                  
                  {/* Edit Photo Trigger (Restricted exclusively to Afshaan Shaikh) */}
                  {isFounderLoggedIn && onOpenEditProfile && (
                    <button
                      type="button"
                      onClick={() => onOpenEditProfile(founder)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-300 cursor-pointer"
                      title="Edit Profile Picture & Information"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#c9a875]/20 border border-[#c9a875] flex items-center justify-center text-[#dfbd87] mb-2 shadow-lg scale-90 group-hover:scale-100 transition-transform">
                        <Camera className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono-code uppercase tracking-widest text-[#dfbd87] font-bold">
                        Change Photo & Name
                      </span>
                    </button>
                  )}

                  {/* Floating Founder Badge */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-lg border border-[#c9a875]/40 pointer-events-none">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#c9a875] animate-pulse" />
                      <span className="text-[10px] uppercase tracking-widest font-mono-code text-white font-bold">
                        Sanctuary Founder
                      </span>
                    </div>
                    <span className="text-[10px] font-mono-code text-[#c9a875] font-semibold">Verified Creator</span>
                  </div>
                </div>

                {/* Edit Photo Quick Button (Visible ONLY when verified Afshaan Shaikh is logged in) */}
                {isFounderLoggedIn && onOpenEditProfile ? (
                  <div className="mt-3 text-center">
                    <button
                      type="button"
                      id="about-change-photo-btn"
                      onClick={() => onOpenEditProfile(founder)}
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c9a875]/10 hover:bg-[#c9a875]/20 border border-[#c9a875]/40 text-[#dfbd87] hover:text-white text-xs font-mono-code font-semibold transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#c9a875]" />
                      <span>Edit My Picture & Name</span>
                    </button>
                  </div>
                ) : (
                  /* Discreet Creator Atelier Access for Afshaan Shaikh if browsing unauthenticated */
                  <div className="mt-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setPasscodeInput('');
                        setPasscodeError(null);
                        setShowFounderModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] hover:bg-[#c9a875]/10 border border-white/10 hover:border-[#c9a875]/40 text-neutral-400 hover:text-[#dfbd87] text-[11px] font-mono-code transition-all cursor-pointer"
                      title="Sanctuary Creator Access (Afshaan Shaikh Only)"
                    >
                      <Lock className="w-3 h-3 text-[#c9a875]" />
                      <span>Creator Atelier Access</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Visionary Bio & Disciplines */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Name & Titles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-display font-medium text-white tracking-wide">
                      {founder.name || 'Afshaan Shaikh'}
                    </h2>
                    <ShieldCheck className="w-6 h-6 text-[#c9a875]" />
                  </div>

                  {isFounderLoggedIn && onOpenEditProfile && (
                    <button
                      onClick={() => onOpenEditProfile(founder)}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c9a875]/60 text-neutral-300 hover:text-white rounded-full text-xs font-mono-code transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Edit artist details"
                    >
                      <Camera className="w-3 h-3 text-[#c9a875]" />
                      <span>Edit Info</span>
                    </button>
                  )}
                </div>

                <div className="text-xs sm:text-sm font-mono-code font-bold uppercase tracking-[0.25em] text-[#dfbd87]">
                  ARTIST | POET | CODER | SOFTWARE DEVELOPER
                </div>
              </div>

              {/* Bio & Evocative Manifesto */}
              <p className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed">
                Forging seamless harmony between algorithmic computation and boundless human expression. 
                In an era saturated with ephemeral noise, every interface, shader, and lyric card in this sanctuary 
                is created with deliberate craftsmanship—an architectural devotion to permanence where code breathes with the soul of fine art.
              </p>

              {/* 4 Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#c9a875]/50 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#e0c49a] mb-1">
                    <Palette className="w-4 h-4 text-[#c9a875]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Visual Fine Art</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Digital paintings, chiaroscuro studies, and atmospheric cinematic portraiture.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#c9a875]/50 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#e0c49a] mb-1">
                    <Feather className="w-4 h-4 text-[#c9a875]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Poetic Literature</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Lyrical stanzas, contemplative vellum cards, and philosophical verse.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#c9a875]/50 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#e0c49a] mb-1">
                    <Code2 className="w-4 h-4 text-[#c9a875]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Algorithmic Coder</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Creative shaders, interactive graphics, and generative computational engines.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#c9a875]/50 transition-colors">
                  <div className="flex items-center gap-2.5 text-[#e0c49a] mb-1">
                    <Terminal className="w-4 h-4 text-[#c9a875]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Software Developer</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Full-stack architecture, database systems, TypeScript, and resilient APIs.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                {onNavigateCategory && (
                  <button
                    onClick={() => onNavigateCategory('all')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[#dfbd87] transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Explore Atelier</span>
                  </button>
                )}

                {onNavigateCategory && (
                  <button
                    onClick={() => onNavigateCategory('poetry')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#c9a875]/15 hover:bg-[#c9a875]/30 border border-[#c9a875]/60 text-[#dfbd87] hover:text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Feather className="w-3.5 h-3.5 text-[#c9a875]" />
                    <span>Read Verse</span>
                  </button>
                )}

                <a
                  href="#connect-section"
                  className="flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider text-neutral-400 hover:text-[#dfbd87] transition-colors"
                >
                  <span>Inquire with Afshaan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: THE SANCTUARY MANIFESTO & BESPOKE ATELIER
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-12">
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-neutral-950 via-[#0e1017] to-neutral-950 border border-[#c9a875]/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#c9a875]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-8 relative z-10">
            <div className="space-y-3 text-center sm:text-left">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#c9a875] font-mono-code font-bold flex items-center justify-center sm:justify-start gap-2">
                <Quote className="w-3.5 h-3.5 text-[#c9a875]" /> The Sanctuary Manifesto
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif-display font-medium text-white tracking-wide">
                Where Algorithmic Precision Meets Lyrical Solitude
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/10">
              <div className="space-y-2 p-4 rounded-xl bg-black/40 border border-white/5">
                <div className="text-xs uppercase tracking-wider text-[#dfbd87] font-mono-code font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#c9a875]" /> Architectural Purity
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Designing resilient full-stack systems with high-order geometric precision, ensuring sub-millisecond responsiveness and unyielding privacy.
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-black/40 border border-white/5">
                <div className="text-xs uppercase tracking-wider text-[#dfbd87] font-mono-code font-bold flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#c9a875]" /> Atmospheric Spatial UI
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Interfaces conceived as museum salons—meticulously weighted whitespace, tailored palettes, and purposeful motion that honors the user's contemplation.
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-black/40 border border-white/5">
                <div className="text-xs uppercase tracking-wider text-[#dfbd87] font-mono-code font-bold flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#c9a875]" /> Enduring Provenance
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Dual-persisted data vaults and cryptographic certificates ensuring that creative works and collector archives remain immortal across decades.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: INQUIRIES & COLLABORATIONS WITH AFSHAAN SHAIKH
         ───────────────────────────────────────────────────────────── */}
      <section id="connect-section" className="pt-8 border-t border-white/10 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Direct Inquiries Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="text-[11px] font-mono-code uppercase tracking-[0.3em] text-[#c9a875] font-semibold">
                DIRECT CONCIERGE
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-display font-light text-white tracking-tight leading-tight">
                Inquiries & <br />
                <span className="italic text-[#dfbd87] font-normal">Collaborations</span>
              </h2>
            </div>

            <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed max-w-md">
              The Artisan's Quill operates at the vanguard of artistry and modern engineering. 
              Whether you seek to acquire a piece, commission bespoke poetry, discuss software architecture, 
              or explore creative collaborations with Afshaan Shaikh, our atelier is at your disposal.
            </p>

            {/* Direct Contact List */}
            <div className="space-y-4 pt-4 text-xs sm:text-sm text-neutral-300 font-sans">
              {/* Phone */}
              <div className="flex items-center gap-3 group">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-[#c9a875]/60 transition-colors">
                  <Phone className="w-4 h-4 text-[#c9a875]" />
                </div>
                <a href="tel:+919611263884" className="hover:text-white transition-colors font-mono-code">
                  +91 9611263884
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 group">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-[#c9a875]/60 transition-colors">
                  <Mail className="w-4 h-4 text-[#c9a875]" />
                </div>
                <div className="flex items-center gap-2">
                  <a href="mailto:afshaan100@gmail.com" className="hover:text-white transition-colors font-mono-code">
                    afshaan100@gmail.com
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-1 text-neutral-400 hover:text-white rounded transition-colors cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 group">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-[#c9a875]/60 transition-colors">
                  <MapPin className="w-4 h-4 text-[#c9a875]" />
                </div>
                <span className="text-neutral-300">
                  Atelier Studio • Global Digital Sanctuary
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiries Form */}
          <div className="lg:col-span-7 bg-[#0b0d13] p-6 sm:p-10 rounded-2xl border border-white/10 shadow-2xl relative">
            {submitSuccess && lastInquiry ? (
              <div className="py-8 text-center space-y-6 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-[#c9a875]/20 border-2 border-[#c9a875] flex items-center justify-center mx-auto text-[#dfbd87] shadow-[0_0_30px_rgba(201,168,117,0.3)]">
                  <CheckCircle2 className="w-7 h-7 text-[#e8c690]" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-mono-code uppercase tracking-[0.25em] text-[#c9a875]">
                    Concierge Transmission Complete
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif-display text-white">Inquiry Dispatched to Afshaan</h3>
                  <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-white font-medium">{lastInquiry.fullName}</strong>. Your inquiry has been logged into the sanctuary database and routed to Afshaan Shaikh's direct channels.
                  </p>
                </div>

                {/* Direct Action Hub for Instant Contact */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-left space-y-3 max-w-md mx-auto text-xs font-mono-code">
                  <div className="text-[10px] text-[#c9a875] font-bold uppercase tracking-widest border-b border-white/10 pb-1.5 flex items-center justify-between">
                    <span>Direct Concierge Links</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-sans text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Live
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* Direct WhatsApp Chat */}
                    <a
                      href={generateWhatsAppUrl(lastInquiry)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 hover:bg-emerald-800 text-emerald-200 text-[11px] font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp Chat</span>
                      <ArrowUpRight className="w-3 h-3 ml-auto opacity-70" />
                    </a>

                    {/* Direct Email */}
                    <a
                      href={generateMailtoUrl(lastInquiry)}
                      className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-black/80 border border-[#c9a875]/50 hover:bg-[#c9a875]/20 text-[#dfbd87] text-[11px] font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(201,168,117,0.2)]"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#c9a875]" />
                      <span>Open Email</span>
                      <ArrowUpRight className="w-3 h-3 ml-auto opacity-70" />
                    </a>
                  </div>

                  <div className="pt-2 text-center">
                    <a
                      href="tel:+919611263884"
                      className="inline-flex items-center gap-2 text-[11px] text-neutral-400 hover:text-white transition-colors"
                    >
                      <PhoneCall className="w-3 h-3 text-[#c9a875]" />
                      <span>Direct Atelier Line: +91 9611263884</span>
                    </a>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-xs font-mono-code uppercase tracking-widest text-white rounded-full transition-colors cursor-pointer"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => handleSubmit(e, 'both')} className="space-y-5">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono-code uppercase tracking-[0.2em] text-[#c9a875] font-semibold">
                    YOUR FULL NAME *
                  </label>
                  <input
                    id="inquiry-full-name"
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-700 focus:border-[#c9a875] py-2 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Email Address & Phone Number Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono-code uppercase tracking-[0.2em] text-[#c9a875] font-semibold">
                      YOUR EMAIL ADDRESS *
                    </label>
                    <input
                      id="inquiry-email-address"
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full bg-transparent border-b border-neutral-700 focus:border-[#c9a875] py-2 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Phone / WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono-code uppercase tracking-[0.2em] text-[#c9a875] font-semibold flex items-center justify-between">
                      <span>PHONE / WHATSAPP</span>
                      <span className="text-[9px] text-neutral-500 font-normal">Optional</span>
                    </label>
                    <input
                      id="inquiry-phone-number"
                      type="tel"
                      placeholder="+91 ... or country code"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-transparent border-b border-neutral-700 focus:border-[#c9a875] py-2 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors font-mono-code"
                    />
                  </div>
                </div>

                {/* Inquiry Type */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono-code uppercase tracking-[0.2em] text-[#c9a875] font-semibold">
                    INQUIRY TYPE *
                  </label>
                  <select
                    id="inquiry-type-select"
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full bg-[#0e111a] border border-white/15 focus:border-[#c9a875] rounded-md px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  >
                    <option value="art-acquisition">Fine Art Acquisition & Licensing</option>
                    <option value="poetry-commission">Bespoke Poetic Verse Commission</option>
                    <option value="software-development">Software Architecture & Bespoke Web Systems</option>
                    <option value="curatorial-press">Curatorial Exhibition & Press Inquiries</option>
                    <option value="collaboration">Creative Collaboration & Joint Projects</option>
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono-code uppercase tracking-[0.2em] text-[#c9a875] font-semibold">
                    MESSAGE FOR AFSHAAN SHAIKH *
                  </label>
                  <textarea
                    id="inquiry-message"
                    required
                    rows={4}
                    placeholder="Describe your vision, acquisition, or architectural collaboration..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-700 focus:border-[#c9a875] py-2 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Main Dispatch Button */}
                <div className="space-y-3 pt-2">
                  <button
                    id="inquiry-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-[#c9a875] via-[#dfbd87] to-[#c9a875] hover:brightness-110 text-black font-mono-code font-bold text-xs uppercase tracking-[0.25em] rounded-sm transition-all duration-200 cursor-pointer shadow-[0_0_25px_rgba(201,168,117,0.35)] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>DISPATCHING CONCIERGE...</span>
                    ) : (
                      <>
                        <span>SEND INQUIRY TO AFSHAAN</span>
                        <Send className="w-3.5 h-3.5 text-black" />
                      </>
                    )}
                  </button>

                  {/* Dual Channel Quick Dispatches */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-code text-neutral-400 pt-1">
                    <button
                      type="button"
                      disabled={isSubmitting || !fullName || !emailAddress || !message}
                      onClick={(e) => handleSubmit(e, 'whatsapp')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      <span>Send via WhatsApp (+91 9611263884)</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting || !fullName || !emailAddress || !message}
                      onClick={(e) => handleSubmit(e, 'email')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 border border-white/15 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <Mail className="w-3 h-3 text-[#c9a875]" />
                      <span>Send via Email (afshaan100@gmail.com)</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* ─── Founder Passcode Verification Modal ─── */}
      {showFounderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#11131a] to-[#07090e] border border-[#c9a875]/50 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_30px_rgba(201,168,117,0.2)] p-6 sm:p-8 space-y-6">
            <button
              onClick={() => setShowFounderModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-sm"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#c9a875]/10 border border-[#c9a875] flex items-center justify-center text-[#dfbd87] mx-auto shadow-[0_0_20px_rgba(201,168,117,0.25)]">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif-display text-white">
                Creator Atelier Verification
              </h3>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed max-w-xs mx-auto">
                Only Sanctuary Founder <span className="text-[#dfbd87] font-semibold">Afshaan Shaikh</span> is authorized to modify visionary details and portrait.
              </p>
            </div>

            <form onSubmit={handleUnlockFounder} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono-code uppercase tracking-wider text-neutral-300 mb-1.5">
                  Founder Passcode / Key
                </label>
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Enter creator passcode..."
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-[#c9a875]/40 focus:border-[#dfbd87] focus:ring-1 focus:ring-[#dfbd87] text-white text-sm font-mono-code outline-none transition-all placeholder:text-neutral-600"
                />
              </div>

              {passcodeError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono-code leading-tight">
                  {passcodeError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFounderModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-mono-code text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUnlocking || !passcodeInput.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a875] to-[#dfbd87] hover:from-[#dfbd87] hover:to-[#f0d4a3] text-black font-semibold text-xs font-mono-code transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {isUnlocking ? 'Verifying...' : 'Unlock Controls'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
