import React, { useEffect, useMemo, useState } from 'react';

const LINE_1 = 'Build with love';
const LINE_2 = 'for all the creative artists out there,';

// Smooth, fluid typing rhythm (within specified 35–50ms typing and 20–30ms deletion ranges)
const CHAR_TYPE_INTERVAL = 42; // ms per char
const CHAR_DELETE_INTERVAL = 24; // ms per char
const LINE_PAUSE_INTERVAL = 220; // ms pause between line 1 and line 2
const COMPLETED_HOLD_INTERVAL = 1450; // ms pause when both lines are fully rendered
const RESTART_PAUSE_INTERVAL = 380; // ms pause after erasing before re-typing

export const NightSkyEnding: React.FC = () => {
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [activeCursorLine, setActiveCursorLine] = useState<1 | 2>(1);
  const [isCompleted, setIsCompleted] = useState(false);

  // 46 deterministic twinkling stars across the dark night sky
  const stars = useMemo(() => {
    return Array.from({ length: 46 }, (_, i) => {
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

  useEffect(() => {
    let isCancelled = false;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
      });

    // Check user accessibility preference for reduced motion
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      setLine1(LINE_1);
      setLine2(LINE_2);
      setIsCompleted(true);
      return;
    }

    // Continuous automatic typewriter lifecycle
    const runTypewriterCycle = async () => {
      while (!isCancelled) {
        // 1. Reset text and begin with Line 1
        setActiveCursorLine(1);
        setIsCompleted(false);
        setLine1('');
        setLine2('');

        // 2. Type Line 1 character-by-character
        for (let i = 1; i <= LINE_1.length; i++) {
          if (isCancelled) return;
          setLine1(LINE_1.slice(0, i));
          await sleep(CHAR_TYPE_INTERVAL);
        }

        if (isCancelled) return;
        await sleep(LINE_PAUSE_INTERVAL);

        // 3. Move cursor to Line 2 and type character-by-character
        setActiveCursorLine(2);
        for (let i = 1; i <= LINE_2.length; i++) {
          if (isCancelled) return;
          setLine2(LINE_2.slice(0, i));
          await sleep(CHAR_TYPE_INTERVAL);
        }

        if (isCancelled) return;

        // 4. Both lines completely displayed: trigger hold & shooting star
        setIsCompleted(true);
        await sleep(COMPLETED_HOLD_INTERVAL);

        if (isCancelled) return;
        setIsCompleted(false);

        // 5. Smoothly erase Line 2 character-by-character
        setActiveCursorLine(2);
        for (let i = LINE_2.length - 1; i >= 0; i--) {
          if (isCancelled) return;
          setLine2(LINE_2.slice(0, i));
          await sleep(CHAR_DELETE_INTERVAL);
        }

        if (isCancelled) return;

        // 6. Smoothly erase Line 1 character-by-character
        setActiveCursorLine(1);
        for (let i = LINE_1.length - 1; i >= 0; i--) {
          if (isCancelled) return;
          setLine1(LINE_1.slice(0, i));
          await sleep(CHAR_DELETE_INTERVAL);
        }

        if (isCancelled) return;

        // 7. Brief calm breath before beginning the cycle again
        await sleep(RESTART_PAUSE_INTERVAL);
      }
    };

    runTypewriterCycle();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <section
      className={`nsk ${isCompleted ? 'done' : ''}`}
      id="night-sky-ending"
      data-stars="46"
      aria-label="Closing continuous signature from the maker"
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

      {/* Continuous Animated Quote */}
      <p
        className="q"
        aria-label="Build with love for all the creative artists out there,"
      >
        <span className="ln a">
          {line1}
          {activeCursorLine === 1 && !isCompleted && <span className="caret" />}
        </span>
        <span className="ln b">
          {line2}
          {(activeCursorLine === 2 || isCompleted) && <span className="caret" />}
        </span>
      </p>
    </section>
  );
};

export default NightSkyEnding;
