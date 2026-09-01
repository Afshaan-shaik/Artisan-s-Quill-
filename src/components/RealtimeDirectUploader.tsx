import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import { useRealtimeGallery } from '../hooks/useRealtimeGallery';
import { ArtCategory } from '../types';

interface RealtimeDirectUploaderProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export const RealtimeDirectUploader: React.FC<RealtimeDirectUploaderProps> = ({ onSuccess, onClose }) => {
  const { uploadArtwork } = useRealtimeGallery();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('Guest Artist');
  const [artistHandle, setArtistHandle] = useState('@guest');
  const [category, setCategory] = useState<ArtCategory>('painting');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      await uploadArtwork(selectedFile, {
        title: title.trim() || 'Untitled Creation',
        artistName: artistName.trim() || 'Guest Artist',
        artistHandle: artistHandle.trim().startsWith('@') ? artistHandle.trim() : `@${artistHandle.trim()}`,
        category
      });

      setUploadComplete(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-[#0a0d14] border border-[#c9a875]/40 rounded-2xl p-6 shadow-2xl max-w-lg w-full text-neutral-200">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#c9a875]" />
          <h3 className="font-serif-display text-lg text-white">Instant Cloud Art Uploader</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#c9a875]/40 hover:border-[#c9a875] rounded-xl p-6 text-center cursor-pointer bg-black/30 transition-all flex flex-col items-center justify-center min-h-[160px]"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {previewUrl ? (
            <div className="relative w-full h-36 rounded-lg overflow-hidden">
              <img src={previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="space-y-2 text-center">
              <UploadCloud className="w-10 h-10 text-[#c9a875] mx-auto opacity-80" />
              <p className="text-xs text-neutral-300 font-mono-code">Drag & drop raw artwork media or click to browse</p>
              <p className="text-[10px] text-neutral-500 font-mono-code">Direct-to-Cloud Storage • No Login Required</p>
            </div>
          )}
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-mono-code uppercase text-[#c9a875] mb-1">Artwork Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Symphony of the Nocturne"
              className="w-full px-3 py-2 bg-neutral-900 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#c9a875]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono-code uppercase text-neutral-400 mb-1">Artist Name</label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Guest Artist"
                className="w-full px-3 py-2 bg-neutral-900 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#c9a875]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono-code uppercase text-neutral-400 mb-1">Handle</label>
              <input
                type="text"
                value={artistHandle}
                onChange={(e) => setArtistHandle(e.target.value)}
                placeholder="@guest"
                className="w-full px-3 py-2 bg-neutral-900 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#c9a875]"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!selectedFile || isUploading}
          className="w-full py-3 rounded-xl bg-[#c9a875] hover:bg-[#dfba88] text-black font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#c9a875]/20 flex items-center justify-center gap-2"
        >
          {uploadComplete ? (
            <>
              <CheckCircle className="w-4 h-4 text-black" />
              <span>Broadcasted to Global Realtime Feed!</span>
            </>
          ) : isUploading ? (
            <span>Uploading Direct to Cloud...</span>
          ) : (
            <span>Inaugurate to Sanctuary</span>
          )}
        </button>
      </form>
    </div>
  );
};
