import React, { useState } from 'react';
import {
  X,
  HardDrive,
  Download,
  Upload,
  Sparkles,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GalleryService } from '../services/api';
import { useGalleryStore } from '../store/useGalleryStore';
import { syncArtworkToCloud } from '../services/firebase';

interface StudioVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
}

export const StudioVaultModal: React.FC<StudioVaultModalProps> = ({
  isOpen,
  onClose,
  onDataRestored
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      GalleryService.exportStudioVault();
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#c9a875', '#dfbd87', '#f8f5eb', '#ffffff']
      });
      setImportStatus({
        type: 'success',
        message: 'Studio Vault Archive downloaded! You can now import this file on your live .com web app.'
      });
    } catch {
      setImportStatus({
        type: 'error',
        message: 'Failed to generate export archive.'
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        await processImport(content);
      }
    };
    reader.readAsText(file);
  };

  const processImport = async (jsonText: string) => {
    try {
      const result = await GalleryService.importStudioVault(jsonText);
      if (result.success) {
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#c9a875', '#dfbd87', '#10b981', '#ffffff']
        });
        setImportStatus({
          type: 'success',
          message: `Successfully restored ${result.importedCount} creations into this sanctuary!`
        });
        setJsonInput('');
        if (onDataRestored) {
          setTimeout(() => {
            onDataRestored();
          }, 800);
        }
      } else {
        setImportStatus({
          type: 'error',
          message: result.message || 'Invalid vault backup file.'
        });
      }
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: err?.message || 'Failed to parse vault archive JSON.'
      });
    }
  };

  const handleCopyCurrentVaultJson = () => {
    try {
      const artworks = useGalleryStore.getState().artworks;
      const profiles = GalleryService.getAllUserProfiles();
      const collections = GalleryService.getStoredCollections();
      const comments = GalleryService.getStoredComments();
      const payload = JSON.stringify(
        {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          app: "The Artisan's Quill Studio Gallery",
          artworks,
          profiles,
          collections,
          comments
        },
        null,
        2
      );
      navigator.clipboard.writeText(payload);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
      setImportStatus({
        type: 'success',
        message: 'Vault JSON copied to clipboard! Paste it on your live .com site to restore.'
      });
    } catch {
      setImportStatus({ type: 'error', message: 'Could not copy archive to clipboard.' });
    }
  };

  const handleSyncAllToCloud = async () => {
    setIsSyncingCloud(true);
    setImportStatus({ type: null, message: '' });
    try {
      const allArtworks = useGalleryStore.getState().artworks;
      let syncedCount = 0;
      for (const art of allArtworks) {
        const ok = await syncArtworkToCloud(art);
        if (ok) syncedCount++;
      }
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#c9a875', '#ffffff']
      });
      setImportStatus({
        type: 'success',
        message: `Pushed ${syncedCount} creations to Cloud Firestore. Live users will see them in real-time!`
      });
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: 'Cloud sync requires Firestore setup. Use JSON Export/Import for instant offline transfer.'
      });
    } finally {
      setIsSyncingCloud(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        id="studio-vault-modal"
        className="relative w-full max-w-2xl bg-[#0b0e14] border border-[#c9a875]/40 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(201,168,117,0.2)] overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#10131c]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#c9a875]/15 border border-[#c9a875]/40 text-[#c9a875]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif-display font-bold text-white flex items-center gap-2">
                Studio Vault • Backup & Sync
              </h2>
              <p className="text-xs text-[#c9a875] font-mono-code">
                Transfer all art, poems & profiles between Localhost & Live .com Site
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Notice Box */}
          <div className="p-4 rounded-2xl bg-[#c9a875]/10 border border-[#c9a875]/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#c9a875] shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-200 leading-relaxed space-y-1">
              <p className="font-semibold text-white">
                Why is Localhost data separate from the Live .com Web App?
              </p>
              <p className="text-neutral-300">
                Browsers isolate LocalStorage per domain. To move your creations from <span className="text-[#dfbd87] font-mono-code font-bold">localhost:3000</span> to your live <span className="text-[#dfbd87] font-mono-code font-bold">.firebaseapp.com</span> URL, use the 1-Click Export and Import below!
              </p>
            </div>
          </div>

          {/* Status Message */}
          {importStatus.type && (
            <div
              className={`p-3.5 rounded-xl flex items-center gap-3 text-xs font-mono-code ${
                importStatus.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Action Grid: Step 1 (Export from Localhost) & Step 2 (Import on Live Site) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Step 1: Export */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#c9a875]/50 transition-all space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-[#c9a875]/20 text-[#dfbd87] font-mono-code text-[10px] uppercase font-bold">
                    Step 1 (On Localhost)
                  </span>
                  <Download className="w-4 h-4 text-[#c9a875]" />
                </div>
                <h3 className="text-sm font-serif-display font-semibold text-white mt-2">
                  Export Studio Backup
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Downloads a complete JSON file with all your paintings, poems, drawings, and artist profiles.
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  id="vault-download-btn"
                  onClick={handleExport}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#c9a875] to-[#dfbd87] hover:from-[#dfbd87] hover:to-[#e8cb9a] text-black font-mono-code font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(201,168,117,0.3)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .JSON Backup</span>
                </button>
                <button
                  onClick={handleCopyCurrentVaultJson}
                  className="w-full py-2 px-3 rounded-xl border border-white/15 hover:border-[#c9a875]/50 text-neutral-300 hover:text-white text-[11px] font-mono-code transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#c9a875]" />}
                  <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Vault JSON to Clipboard'}</span>
                </button>
              </div>
            </div>

            {/* Step 2: Import */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#c9a875]/50 transition-all space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono-code text-[10px] uppercase font-bold">
                    Step 2 (On Live Site)
                  </span>
                  <Upload className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-sm font-serif-display font-semibold text-white mt-2">
                  Restore / Import Archive
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Upload your downloaded backup file on the live website to restore every single art piece immediately.
                </p>
              </div>
              <div className="pt-2">
                <label className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 hover:text-white font-mono-code font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .JSON File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Quick Paste JSON option */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <label className="text-[11px] font-mono-code text-[#dfbd87] uppercase font-bold block">
              Or Paste Backup JSON Directly:
            </label>
            <textarea
              rows={3}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your exported Studio Vault JSON here and click Restore..."
              className="w-full bg-[#07090e] border border-white/15 focus:border-[#c9a875] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 font-mono-code focus:outline-none resize-none"
            />
            {jsonInput.trim() && (
              <button
                onClick={() => processImport(jsonInput)}
                className="py-2 px-5 bg-[#c9a875] hover:bg-[#dfbd87] text-black font-mono-code font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(201,168,117,0.3)]"
              >
                Restore from Pasted JSON
              </button>
            )}
          </div>

          {/* Cloud Firestore Push */}
          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono-code">
              <Cloud className="w-4 h-4 text-[#c9a875]" />
              <span>Real-time Cloud Sync across all devices</span>
            </div>
            <button
              onClick={handleSyncAllToCloud}
              disabled={isSyncingCloud}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-[#dfbd87] font-mono-code transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
              <span>{isSyncingCloud ? 'Syncing to Cloud...' : 'Sync Local Art to Cloud'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

