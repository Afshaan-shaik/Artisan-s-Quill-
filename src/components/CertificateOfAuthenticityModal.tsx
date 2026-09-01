import React, { useRef, useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  Download,
  Printer,
  Copy,
  Check,
  Award,
  Feather
} from 'lucide-react';
import { Artwork } from '../types';
import confetti from 'canvas-confetti';

interface CertificateOfAuthenticityModalProps {
  isOpen: boolean;
  artwork: Artwork | null;
  onClose: () => void;
}

export const CertificateOfAuthenticityModal: React.FC<CertificateOfAuthenticityModalProps> = ({
  isOpen,
  artwork,
  onClose
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !artwork) return null;

  // Generate deterministic verifiable hash based on artwork ID and year
  const certId = `COA-ATELIER-${artwork.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase()}-${artwork.year || 2026}`;
  const creationDate = artwork.createdAt
    ? new Date(artwork.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Permanent Atelier Archive';

  const handleCopyVerification = () => {
    navigator.clipboard.writeText(`${window.location.origin}/?artwork=${encodeURIComponent(artwork.id)}&coa=${certId}`);
    setCopiedHash(true);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#c9a875', '#ffffff', '#dfbd87']
    });
    setTimeout(() => setCopiedHash(false), 2200);
  };

  const handlePrint = () => {
    window.print();
  };

  // High-Resolution 1600x2000px Digital Certificate Canvas Generator
  const handleDownloadCertificate = () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 2000;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Parchment Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1600, 2000);
      bgGrad.addColorStop(0, '#fdfbf7');
      bgGrad.addColorStop(0.5, '#fbf9f4');
      bgGrad.addColorStop(1, '#f6f0e2');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1600, 2000);

      // 2. Outer & Inner Gold Borders
      ctx.strokeStyle = '#9e7d44';
      ctx.lineWidth = 14;
      ctx.strokeRect(45, 45, 1510, 1910);

      ctx.lineWidth = 4;
      ctx.strokeRect(68, 68, 1464, 1864);

      // Corner Filigree Accents
      const cornerSize = 55;
      ctx.lineWidth = 5;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(85, 85 + cornerSize);
      ctx.lineTo(85, 85);
      ctx.lineTo(85 + cornerSize, 85);
      ctx.stroke();

      // Top-right
      ctx.beginPath();
      ctx.moveTo(1515 - cornerSize, 85);
      ctx.lineTo(1515, 85);
      ctx.lineTo(1515, 85 + cornerSize);
      ctx.stroke();

      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(85, 1915 - cornerSize);
      ctx.lineTo(85, 1915);
      ctx.lineTo(85 + cornerSize, 1915);
      ctx.stroke();

      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(1515 - cornerSize, 1915);
      ctx.lineTo(1515, 1915);
      ctx.lineTo(1515, 1915 - cornerSize);
      ctx.stroke();

      // 3. Vault Header Badge
      ctx.fillStyle = '#f3ede1';
      ctx.strokeStyle = '#9e7d44';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(470, 150, 660, 50, 25);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#7d5f2a';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("🛡  THE ARTISAN'S QUILL SANCTUARY VAULT", 800, 182);

      // 4. Main Titles
      ctx.fillStyle = '#1a1c24';
      ctx.font = 'bold 50px "Cinzel", "Playfair Display", "Times New Roman", serif';
      ctx.fillText("CERTIFICATE OF AUTHENTICITY", 800, 280);

      ctx.fillStyle = '#7d5f2a';
      ctx.font = 'bold 19px sans-serif';
      ctx.fillText("OFFICIAL PROVENANCE & ARCHIVAL REGISTRY RECORD", 800, 325);

      // 5. Verification Text
      ctx.fillStyle = '#363a45';
      ctx.font = 'italic 23px "Times New Roman", Georgia, serif';
      ctx.fillText("This document certifies that the artwork identified herein is an authentic, verified", 800, 400);
      ctx.fillText("original creation registered within the permanent Atelier Sanctuary collection.", 800, 438);

      // 6. Specification Box
      ctx.fillStyle = '#f2ece0';
      ctx.strokeStyle = '#9e7d44';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(160, 490, 1280, 840, 12);
      ctx.fill();
      ctx.stroke();

      // Data inside Spec Box
      const leftColX = 220;
      const rightColX = 840;

      // Row 1: Title & Artist
      ctx.textAlign = 'left';
      ctx.fillStyle = '#7d5f2a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText("ARTWORK TITLE", leftColX, 560);
      ctx.fillStyle = '#1a1c24';
      ctx.font = 'bold 27px "Playfair Display", serif';
      ctx.fillText(artwork.title.length > 34 ? artwork.title.slice(0, 32) + '...' : artwork.title, leftColX, 600);

      ctx.fillStyle = '#7d5f2a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText("ATTRIBUTED ARTIST / AUTHOR", rightColX, 560);
      ctx.fillStyle = '#1a1c24';
      ctx.font = 'bold 27px "Playfair Display", serif';
      ctx.fillText(`${artwork.artist.name} (${artwork.artist.handle})`, rightColX, 600);

      // Row 2: Medium & Dimensions
      ctx.fillStyle = '#7d5f2a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText("MEDIUM & DISCIPLINE", leftColX, 690);
      ctx.fillStyle = '#2b2e38';
      ctx.font = '22px sans-serif';
      ctx.fillText(artwork.medium || artwork.category.toUpperCase(), leftColX, 725);

      ctx.fillStyle = '#7d5f2a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText("DIMENSIONS / ASPECT", rightColX, 690);
      ctx.fillStyle = '#2b2e38';
      ctx.font = '22px sans-serif';
      ctx.fillText(`${artwork.dimensions || 'Dynamic Master Canvas'} (${artwork.aspectRatio})`, rightColX, 725);

      // Row 3: Year & Registration Date
      ctx.fillStyle = '#7d5f2a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText("YEAR OF COMPLETION", leftColX, 815);
      ctx.fillStyle = '#2b2e38';
      ctx.font = '22px sans-serif';
      ctx.fillText(`Circa ${artwork.year || 2026}`, leftColX, 850);

      ctx.fillStyle = '#7d5f2a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText("VAULT REGISTRATION DATE", rightColX, 815);
      ctx.fillStyle = '#2b2e38';
      ctx.font = '22px sans-serif';
      ctx.fillText(creationDate, rightColX, 850);

      // Row 4: Provenance Hash divider & hash
      ctx.strokeStyle = '#9e7d44';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(200, 915);
      ctx.lineTo(1400, 915);
      ctx.stroke();

      ctx.fillStyle = '#7d5f2a';
      ctx.font = 'bold 17px monospace';
      ctx.fillText("CRYPTOGRAPHIC PROVENANCE ID:", leftColX, 965);
      ctx.fillStyle = '#1a1c24';
      ctx.font = 'bold 19px monospace';
      ctx.fillText(certId, 600, 965);

      // Row 5: Permanent Museum Registry Note
      ctx.fillStyle = '#5c5f6e';
      ctx.font = 'italic 16px serif';
      ctx.fillText("Master piece securely cataloged in The Artisan's Quill Permanent Digital Archive.", leftColX, 1025);

      // 7. Divider before signatures
      ctx.strokeStyle = '#9e7d44';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(160, 1420);
      ctx.lineTo(1440, 1420);
      ctx.stroke();

      // 8. Signatures & Gold Wax Seal
      // Artist signature
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1a1c24';
      ctx.font = 'italic bold 32px "Brush Script MT", "Caveat", cursive, serif';
      ctx.fillText(artwork.artist.name, 380, 1540);
      ctx.strokeStyle = '#9e7d44';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(240, 1560);
      ctx.lineTo(520, 1560);
      ctx.stroke();
      ctx.fillStyle = '#7d5f2a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText("AUTHOR SIGNATURE", 380, 1590);

      // Gold Seal in Center
      ctx.save();
      ctx.beginPath();
      ctx.arc(800, 1550, 75, 0, Math.PI * 2);
      const sealGrad = ctx.createLinearGradient(725, 1475, 875, 1625);
      sealGrad.addColorStop(0, '#dfbd87');
      sealGrad.addColorStop(0.5, '#9e7d44');
      sealGrad.addColorStop(1, '#63481f');
      ctx.fillStyle = sealGrad;
      ctx.fill();
      ctx.strokeStyle = '#fef3d6';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Inner dashed seal circle
      ctx.beginPath();
      ctx.arc(800, 1550, 62, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff2d2';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText("VERIFIED", 800, 1540);
      ctx.fillText("ATELIER", 800, 1562);
      ctx.font = '9px monospace';
      ctx.fillText("SANCTUARY", 800, 1580);
      ctx.restore();

      // Curator signature
      ctx.fillStyle = '#1a1c24';
      ctx.font = 'italic bold 32px "Brush Script MT", "Caveat", cursive, serif';
      ctx.fillText("Afshaan Shaikh", 1220, 1540);
      ctx.strokeStyle = '#9e7d44';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(1080, 1560);
      ctx.lineTo(1360, 1560);
      ctx.stroke();
      ctx.fillStyle = '#7d5f2a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText("FOUNDER & CURATOR", 1220, 1590);

      // 9. Bottom Archival Watermark text
      ctx.fillStyle = '#7d5f2a';
      ctx.font = '12px monospace';
      ctx.fillText(`VERIFIED CRYPTOGRAPHIC DIGITAL COPY • ${certId} • THE ARTISAN'S QUILL`, 800, 1840);

      // Download Trigger
      const link = document.createElement('a');
      const safeTitle = artwork.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `Certificate-of-Authenticity-${safeTitle}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsDownloaded(true);
      confetti({
        particleCount: 45,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#c9a875', '#dfbd87', '#ffffff', '#ffd700']
      });
      setTimeout(() => setIsDownloaded(false), 3200);
    } catch (err) {
      console.error('Failed to generate certificate download', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/95 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-[#090b10] border border-[#c9a875]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Top Control Bar */}
        <div className="px-4 sm:px-8 py-3.5 border-b border-white/10 bg-[#07080c]/95 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#c9a875]/20 border border-[#c9a875]/60 text-[#dfbd87]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-serif-display font-medium text-white tracking-wide uppercase">
                Certificate of Provenance & Authenticity
              </h2>
              <p className="text-[10px] text-[#c9a875] font-mono-code">
                Permanent Cryptographic Registry • {certId}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Download Certificate Digital Copy (PNG) */}
            <button
              id="download-certificate-btn"
              onClick={handleDownloadCertificate}
              disabled={isDownloading}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-mono-code font-bold transition-all cursor-pointer shadow-md ${
                isDownloaded
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : 'bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black hover:from-[#dfbd87] hover:to-white border-[#f5dfb8] hover:shadow-[0_0_20px_rgba(201,168,117,0.6)]'
              }`}
              title="Download High-Resolution Certificate (PNG)"
            >
              {isDownloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black" />
                  <span>Saved to Files!</span>
                </>
              ) : isDownloading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-black" />
                  <span>Rendering...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-black" />
                  <span>Download Digital Copy</span>
                </>
              )}
            </button>

            {/* Print Certificate */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/15 text-xs text-neutral-300 hover:text-white font-mono-code transition-all cursor-pointer"
              title="Print Certificate on Paper"
            >
              <Printer className="w-3.5 h-3.5 text-[#c9a875]" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Copy Hash Link */}
            <button
              onClick={handleCopyVerification}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/15 text-xs text-neutral-300 hover:text-white font-mono-code transition-all cursor-pointer"
              title="Copy Cryptographic Verification Link"
            >
              {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#c9a875]" />}
              <span>{copiedHash ? 'Verified' : 'Copy Hash'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-neutral-900 border border-white/15 text-neutral-400 hover:text-white hover:border-[#c9a875] transition-colors cursor-pointer ml-1"
              title="Close Certificate"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Display Area (Shows Entire Certificate Seamlessly) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 bg-[#050608] flex justify-center items-start">
          
          {/* Physical Certificate Parchment */}
          <div
            ref={certRef}
            className="w-full max-w-3xl bg-[#fbf9f4] text-[#12141a] p-6 sm:p-9 md:p-11 rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.85)] border-8 border-double border-[#9e7d44] relative overflow-hidden font-serif my-1 print:border-4 print:shadow-none"
          >
            {/* Corner Filigree Borders */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#9e7d44]" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#9e7d44]" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#9e7d44]" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#9e7d44]" />

            {/* Subtle Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
              <Feather className="w-96 h-96 text-[#9e7d44]" />
            </div>

            {/* Header */}
            <div className="text-center space-y-1.5 mb-5 sm:mb-7 relative z-10 pt-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#f3ede1] rounded-full border border-[#9e7d44]/40 text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-[#7d5f2a]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>The Artisan's Quill Sanctuary Vault</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif-display tracking-[0.12em] text-[#1a1c24] uppercase font-bold mt-2 leading-tight">
                Certificate of Authenticity
              </h1>
              <p className="text-xs font-sans uppercase tracking-[0.25em] text-[#7d5f2a] font-medium">
                Official Provenance & Archival Registry Record
              </p>
            </div>

            {/* Verification Statement */}
            <div className="space-y-5 text-center max-w-xl mx-auto my-4 relative z-10">
              <p className="text-sm sm:text-base font-light italic leading-relaxed text-[#363a45]">
                This document certifies that the artwork identified herein is an authentic, verified original creation registered within the permanent Atelier Sanctuary collection.
              </p>

              {/* Master Artwork Specifications Grid */}
              <div className="bg-[#f2ece0] border border-[#9e7d44]/30 rounded-sm p-4 sm:p-5 space-y-3 text-left font-sans shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#7d5f2a] font-bold block mb-0.5">
                      Artwork Title
                    </span>
                    <span className="text-sm font-serif font-bold text-[#1a1c24] block">
                      {artwork.title}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#7d5f2a] font-bold block mb-0.5">
                      Attributed Artist / Author
                    </span>
                    <span className="text-sm font-serif font-bold text-[#1a1c24] block">
                      {artwork.artist.name} ({artwork.artist.handle})
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#7d5f2a] font-bold block mb-0.5">
                      Medium & Discipline
                    </span>
                    <span className="text-xs text-[#2b2e38] font-medium block">
                      {artwork.medium || artwork.category.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#7d5f2a] font-bold block mb-0.5">
                      Dimensions / Aspect
                    </span>
                    <span className="text-xs text-[#2b2e38] font-medium block">
                      {artwork.dimensions || 'Dynamic Master Canvas'} ({artwork.aspectRatio})
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#7d5f2a] font-bold block mb-0.5">
                      Year of Completion
                    </span>
                    <span className="text-xs text-[#2b2e38] font-medium block">
                      Circa {artwork.year || 2026}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#7d5f2a] font-bold block mb-0.5">
                      Vault Registration Date
                    </span>
                    <span className="text-xs text-[#2b2e38] font-medium block">
                      {creationDate}
                    </span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#9e7d44]/20 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                  <span className="text-[#7d5f2a] font-bold">Cryptographic Provenance ID:</span>
                  <span className="text-[#1a1c24] font-semibold">{certId}</span>
                </div>
              </div>
            </div>

            {/* Footer Signatures & Gold Wax Seal */}
            <div className="mt-6 pt-5 border-t-2 border-[#9e7d44]/30 grid grid-cols-3 items-end gap-3 sm:gap-4 relative z-10 font-sans">
              
              {/* Left Signature: Artist */}
              <div className="text-center space-y-1">
                <div className="font-signature text-xl sm:text-2xl text-[#1a1c24] h-7 flex items-center justify-center">
                  {artwork.artist.name}
                </div>
                <div className="w-full h-[1px] bg-[#9e7d44]/50" />
                <span className="text-[9px] uppercase tracking-widest text-[#7d5f2a] font-bold block">
                  Author Signature
                </span>
              </div>

              {/* Center: Gold Holographic Wax Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#dfbd87] via-[#9e7d44] to-[#63481f] p-1 shadow-lg flex items-center justify-center border-2 border-[#fef3d6] ring-2 ring-[#9e7d44]">
                  <div className="w-full h-full rounded-full border border-dashed border-[#fff2d2] flex flex-col items-center justify-center text-center p-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-white drop-shadow" />
                    <span className="text-[6px] uppercase font-bold tracking-widest text-white leading-tight mt-0.5">
                      VERIFIED ATELIER
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Signature: Curatorial Board */}
              <div className="text-center space-y-1">
                <div className="font-signature text-xl sm:text-2xl text-[#1a1c24] h-7 flex items-center justify-center">
                  Afshaan Shaikh
                </div>
                <div className="w-full h-[1px] bg-[#9e7d44]/50" />
                <span className="text-[9px] uppercase tracking-widest text-[#7d5f2a] font-bold block">
                  Founder & Curator
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
