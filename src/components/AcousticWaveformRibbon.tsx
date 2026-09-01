import React, { useEffect, useRef } from 'react';
import { bardSymphony } from '../utils/bardSymphonyEngine';

interface AcousticWaveformRibbonProps {
  isPlaying: boolean;
  className?: string;
}

export const AcousticWaveformRibbon: React.FC<AcousticWaveformRibbonProps> = ({
  isPlaying,
  className = 'w-full h-28'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      animFrameIdRef.current = requestAnimationFrame(render);

      const width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio || 600);
      const height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio || 120);

      ctx.clearRect(0, 0, width, height);

      const analyser = bardSymphony.getAnalyser();
      const bufferLength = analyser ? analyser.frequencyBinCount : 64;
      const dataArray = new Uint8Array(bufferLength);

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      }

      // Compute average energy
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avgEnergy = isPlaying ? sum / bufferLength : 8;
      const waveAmplitude = Math.max(8, (avgEnergy / 255) * (height * 0.42));

      phase += isPlaying ? 0.04 : 0.01;

      // Draw 3 layers of harmonic golden ribbons
      const ribbons = [
        { color: 'rgba(201, 168, 117, 0.85)', glow: 'rgba(223, 189, 135, 0.6)', freqMult: 1.0, speed: 1.0, width: 2.5 },
        { color: 'rgba(223, 189, 135, 0.45)', glow: 'rgba(248, 235, 213, 0.3)', freqMult: 1.4, speed: -0.7, width: 1.8 },
        { color: 'rgba(168, 130, 80, 0.35)', glow: 'transparent', freqMult: 0.7, speed: 0.5, width: 1.2 }
      ];

      const centerY = height / 2;

      ribbons.forEach((ribbon) => {
        ctx.beginPath();
        ctx.strokeStyle = ribbon.color;
        ctx.lineWidth = ribbon.width * window.devicePixelRatio;
        if (ribbon.glow !== 'transparent') {
          ctx.shadowColor = ribbon.glow;
          ctx.shadowBlur = 12 * window.devicePixelRatio;
        } else {
          ctx.shadowBlur = 0;
        }

        const segments = 40;
        const step = width / segments;

        for (let i = 0; i <= segments; i++) {
          const x = i * step;
          const normalizedX = (i / segments) * Math.PI * 4;

          // Multi-frequency harmonic wave with frequency data modulation
          const dataIndex = Math.floor((i / segments) * (bufferLength / 2));
          const freqBump = isPlaying ? (dataArray[dataIndex] / 255) * waveAmplitude * 0.8 : 0;

          const envelope = Math.sin((i / segments) * Math.PI); // Pin edges to zero
          const yOffset =
            (Math.sin(normalizedX * ribbon.freqMult + phase * ribbon.speed) * waveAmplitude + freqBump) * envelope;

          const y = centerY + yOffset;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Ambient golden stardust particles
      if (isPlaying) {
        ctx.shadowBlur = 0;
        for (let p = 0; p < 8; p++) {
          const px = ((Math.sin(phase * 0.5 + p * 1.8) + 1) / 2) * width;
          const py = centerY + Math.sin(phase + p * 2.3) * (waveAmplitude * 0.9);
          const pSize = (Math.sin(phase * 2 + p) + 1.5) * window.devicePixelRatio;

          ctx.fillStyle = `rgba(248, 235, 213, ${0.4 + Math.sin(phase + p) * 0.3})`;
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-b from-black/40 to-black/80 border border-[#c9a875]/20 backdrop-blur-md ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
