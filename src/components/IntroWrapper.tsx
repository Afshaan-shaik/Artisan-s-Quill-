/**
 * IntroWrapper.tsx
 * Renders the CosmosIntro once on every fresh page load.
 * No localStorage / cookie gating — every visit sees the intro.
 */

import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import CosmosIntro from "./CosmosIntro";

interface IntroWrapperProps {
  children: React.ReactNode;
  onOpenBard?: () => void;
  onOpenInkStudio?: () => void;
}

function IntroWrapper({
  children,
  onOpenBard,
  onOpenInkStudio,
}: IntroWrapperProps) {
  const [showIntro, setShowIntro] = useState(true);
  const onOpenBardRef = useRef(onOpenBard);
  const onOpenInkStudioRef = useRef(onOpenInkStudio);

  useEffect(() => {
    onOpenBardRef.current = onOpenBard;
    onOpenInkStudioRef.current = onOpenInkStudio;
  });

  const handleEnter = useCallback(() => {
    setShowIntro(false);
  }, []);

  const handleAction = useCallback((action: "__bard__" | "__ink__") => {
    if (action === "__bard__") onOpenBardRef.current?.();
    if (action === "__ink__") onOpenInkStudioRef.current?.();
  }, []);

  return (
    <>
      {showIntro && (
        <CosmosIntro onEnter={handleEnter} onAction={handleAction} />
      )}
      {children}
    </>
  );
}

export default memo(IntroWrapper);
