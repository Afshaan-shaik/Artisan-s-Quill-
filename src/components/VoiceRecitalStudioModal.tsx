import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Check,
  X,
  Volume2,
  Sparkles,
  Layers,
  Clock,
  AudioWaveform as WaveformIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VoiceRecitalStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  poemTitle: string;
  authorName: string;
  stanzas: string[];
  existingAudioUrl?: string;
  onSaveAudioRecital: (audioUrl: string, duration: number) => void;
}

export const VoiceRecitalStudioModal: React.FC<VoiceRecitalStudioModalProps> = ({
  isOpen,
  onClose,
  poemTitle,
  authorName,
  stanzas,
  existingAudioUrl,
  onSaveAudioRecital
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(existingAudioUrl || null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync existing audio if changed
  useEffect(() => {
    if (existingAudioUrl) {
      setAudioBlobUrl(existingAudioUrl);
    }
  }, [existingAudioUrl]);

  // Clean up on modal close
  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      setIsPlayingPreview(false);
    }
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Start in-browser microphone recording
  const startRecording = useCallback(async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000
        }
      });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
        ? 'audio/ogg;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        // Convert to persistent base64 data URL so it survives across sessions
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setAudioBlobUrl(base64Audio);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setMicError(err.message || 'Microphone access was denied. Please allow microphone permissions.');
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, [isRecording]);

  // Handle direct file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setAudioBlobUrl(dataUrl);
      setRecordingTime(0);
    };
    reader.readAsDataURL(file);
  };

  // Preview Playback
  const togglePreviewPlay = () => {
    if (!audioBlobUrl) return;

    if (isPlayingPreview && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
      return;
    }

    if (!previewAudioRef.current || previewAudioRef.current.src !== audioBlobUrl) {
      previewAudioRef.current = new Audio(audioBlobUrl);
      previewAudioRef.current.onloadedmetadata = () => {
        if (previewAudioRef.current) {
          setPreviewDuration(previewAudioRef.current.duration);
        }
      };
      previewAudioRef.current.ontimeupdate = () => {
        if (previewAudioRef.current) {
          setPreviewProgress(previewAudioRef.current.currentTime);
        }
      };
      previewAudioRef.current.onended = () => {
        setIsPlayingPreview(false);
        setPreviewProgress(0);
      };
    }

    previewAudioRef.current.play();
    setIsPlayingPreview(true);
  };

  const handleRetake = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setIsPlayingPreview(false);
    setAudioBlobUrl(null);
    setRecordingTime(0);
    setPreviewProgress(0);
  };

  const handleSave = () => {
    if (!audioBlobUrl) return;
    const duration = previewDuration || recordingTime || 60;
    onSaveAudioRecital(audioBlobUrl, duration);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#c9a875', '#dfbd87', '#ffffff']
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl ultra-glass-elevated border border-[#c9a875]/50 shadow-[0_0_50px_rgba(201,168,117,0.3)] overflow-hidden">
        {/* Top Gold Accent Rim */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#dfbd87] to-transparent opacity-90" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c9a875]/20 border border-[#dfbd87]/50 flex items-center justify-center text-[#dfbd87]">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-serif-display font-bold text-white tracking-wide">
                Voice Recital Studio • Oral Archive
              </h3>
              <p className="text-[11px] font-mono-code text-[#c9a875] uppercase tracking-wider">
                Preserve Genuine Voice Recital for "{poemTitle}"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {micError && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono-code">
              ⚠️ {micError}
            </div>
          )}

          {/* Teleprompter Verse Display */}
          <div className="rounded-xl p-4 sm:p-5 bg-black/60 border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] uppercase font-mono-code tracking-[0.2em] text-[#c9a875] font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#dfbd87]" />
                Teleprompter (Recite Aloud)
              </span>
              <span className="text-[10px] font-mono-code text-neutral-400">— {authorName}</span>
            </div>

            <div className="max-h-[170px] overflow-y-auto space-y-4 font-serif text-sm sm:text-base text-neutral-200 leading-relaxed pr-2 select-text">
              {stanzas.map((stanza, sIdx) => (
                <p key={sIdx} className="whitespace-pre-line text-center italic">
                  {stanza}
                </p>
              ))}
            </div>
          </div>

          {/* Audio State & Recording Interface */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-white/[0.04] to-black/40 border border-[#c9a875]/30 text-center space-y-4">
            {isRecording ? (
              /* Active Recording View */
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(239,68,68,0.5)] animate-pulse">
                  <Mic className="w-8 h-8 text-red-400" />
                </div>

                <div>
                  <span className="text-2xl sm:text-3xl font-mono-code font-bold text-white tracking-widest">
                    {formatTime(recordingTime)}
                  </span>
                  <p className="text-xs font-mono-code text-red-400 uppercase tracking-widest mt-1 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    Recording in progress...
                  </p>
                </div>

                <button
                  onClick={stopRecording}
                  className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Recording</span>
                </button>
              </div>
            ) : audioBlobUrl ? (
              /* Recorded / Uploaded Audio Preview */
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#c9a875]/20 border-2 border-[#dfbd87] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(201,168,117,0.3)]">
                  <Volume2 className="w-7 h-7 text-[#dfbd87]" />
                </div>

                <div>
                  <span className="text-xs font-mono-code uppercase tracking-wider text-[#dfbd87] font-semibold">
                    Oral Recital Recorded Successfully
                  </span>
                  <div className="flex items-center justify-center gap-2 text-xs font-mono-code text-neutral-400 mt-1">
                    <Clock className="w-3.5 h-3.5 text-[#c9a875]" />
                    <span>
                      {formatTime(previewProgress)} / {formatTime(previewDuration || recordingTime)}
                    </span>
                  </div>
                </div>

                {/* Audio Progress Scrub Bar */}
                <div className="w-full max-w-md mx-auto bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#c9a875] to-[#dfbd87] h-full transition-all duration-150"
                    style={{
                      width: `${previewDuration > 0 ? (previewProgress / previewDuration) * 100 : 0}%`
                    }}
                  />
                </div>

                {/* Preview Actions */}
                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    onClick={togglePreviewPlay}
                    className="px-5 py-2 rounded-full bg-[#dfbd87] hover:bg-[#f8e7c9] text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-md hover:scale-105 active:scale-95"
                  >
                    {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isPlayingPreview ? 'Pause Preview' : 'Listen Preview'}</span>
                  </button>

                  <button
                    onClick={handleRetake}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white font-mono-code text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Idle Ready to Record View */
              <div className="space-y-4">
                <button
                  onClick={startRecording}
                  className="w-20 h-20 rounded-full bg-[#c9a875]/20 hover:bg-[#c9a875]/35 border-2 border-[#dfbd87] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(201,168,117,0.3)] transition-all cursor-pointer hover:scale-110 active:scale-95 text-[#dfbd87] hover:text-white group"
                  title="Click to start recording"
                >
                  <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
                </button>

                <div>
                  <h4 className="text-sm font-serif-display font-semibold text-white">
                    Record in Your Genuine Voice
                  </h4>
                  <p className="text-xs text-neutral-400 font-sans max-w-sm mx-auto mt-1">
                    Click the microphone to record your oral recitation. The recording will be attached to this poem and play whenever readers click "Listen Recital".
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <span className="text-[11px] font-mono-code text-neutral-500 uppercase">— or —</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white text-xs font-mono-code transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#c9a875]" />
                    <span>Upload Audio Track</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10 bg-black/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono-code text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={!audioBlobUrl}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a875] via-[#dfbd87] to-[#c9a875] hover:brightness-110 text-black font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_20px_rgba(201,168,117,0.4)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Save Oral Recital</span>
          </button>
        </div>
      </div>
    </div>
  );
};
