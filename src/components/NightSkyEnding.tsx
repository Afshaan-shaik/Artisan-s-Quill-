import React, { useEffect, useRef, useMemo, useCallback } from 'react';

export const NightSkyEnding: React.FC = () => {
  const secRef = useRef<HTMLElement | null>(null);
  const lineARef = useRef<HTMLSpanElement | null>(null);
  const lineBRef = useRef<HTMLSpanElement | null>(null);
  const lineCRef = useRef<HTMLSpanElement | null>(null);
  const runIdRef = useRef(0);
  const startedRef = useRef(false);

  // 46 deterministic twinkling stars
  const stars = useMemo(() => {
    return Array.from({ length: 46 }, (_, i) => {
      // Deterministic spread across the sky
      const left = ((i * 17.3 + 7.9) % 100).toFixed(2);
      const top = ((i * 31.7 + 13.1) % 94).toFixed(2);
      const size = (1 + ((i * 7) % 20) / 10).toFixed(2);
      const delay = (((i * 13) % 30) / 10).toFixed(2);
      return {
        id: i,
        left: `${left}%`,
        top: `${top}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${delay}s`
      };
    });
  }, []);

  const play = useCallback(async () => {
    const sec = secRef.current;
    if (!sec) return;

    const lineA = lineARef.current;
    const lineB = lineBRef.current;
    const lineC = lineCRef.current;
    if (!lineA || !lineB || !lineC) return;

    const lines = [lineA, lineB, lineC];
    const id = ++runIdRef.current;
    sec.classList.remove('done');

    // Check prefers-reduced-motion
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reset lines
    lines.forEach((l) => {
      l.innerHTML = '';
    });

    if (reduce) {
      // Instant render for reduced motion
      lineA.textContent = 'Build with love';
      lineB.textContent = 'for all the creative artists out there,';
      lineC.textContent = 'be creative, be you.';
      const st = document.createElement('span');
      st.className = 'st';
      st.textContent = '⭐';
      lineC.appendChild(st);
      sec.classList.add('done');
      return;
    }

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const caret = document.createElement('span');
    caret.className = 'caret';

    for (let li = 0; li < lines.length; li++) {
      const l = lines[li];
      const textAttr = l.getAttribute('data-t') || '';
      const words = textAttr.split(' ');

      for (let wi = 0; wi < words.length; wi++) {
        if (id !== runIdRef.current) return;
        const w = document.createElement('span');
        l.appendChild(w);
        if (wi < words.length - 1) {
          l.appendChild(document.createTextNode(' '));
        }
        w.after(caret);

        for (let ci = 0; ci < words[wi].length; ci++) {
          if (id !== runIdRef.current) return;
          w.textContent += words[wi][ci];
          await sleep(50 + Math.random() * 70);
        }

        if (id !== runIdRef.current) return;
        await sleep(/[,.]$/.test(words[wi]) ? 380 : 110);
      }

      caret.remove();
      const sticker = l.getAttribute('data-s');
      if (sticker) {
        const st = document.createElement('span');
        st.className = 'st';
        st.textContent = sticker;
        l.appendChild(st);
      }
      await sleep(350);
    }

    if (id === runIdRef.current) {
      sec.classList.add('done');
    }
  }, []);

  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            play();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(sec);

    return () => {
      observer.disconnect();
      runIdRef.current++;
    };
  }, [play]);

  return (
    <section
      ref={secRef}
      className="nsk"
      id="night-sky-ending"
      data-stars="46"
      aria-label="Closing note from the maker"
    >
      {/* 46 Starry Night Twinkling Stars */}
      {stars.map((star) => (
        <span
          key={star.id}
          className="star"
          aria-hidden="true"
          style={{
            left: star.left,
            top: star.top,
            width: star.width,
            height: star.height,
            animationDelay: star.animationDelay
          }}
        />
      ))}

      {/* Floating Moon & Shooting Star */}
      <span className="moon" aria-hidden="true">
        🌙
      </span>
      <span className="shoot" aria-hidden="true" />

      {/* Typed Quote */}
      <p
        className="q"
        aria-label="Build with love for all the creative artists out there, be creative, be you."
      >
        <span ref={lineARef} className="ln a" data-t="Build with love" />
        <span
          ref={lineBRef}
          className="ln b"
          data-t="for all the creative artists out there,"
        />
        <span
          ref={lineCRef}
          className="ln c"
          data-t="be creative, be you."
          data-s="⭐"
        />
      </p>

      {/* Replay Button */}
      <button
        className="rep"
        type="button"
        onClick={() => play()}
        aria-label="Replay closing animation"
      >
        ↻ replay
      </button>
    </section>
  );
};
export default NightSkyEnding;
