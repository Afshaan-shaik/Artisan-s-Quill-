/**
 * IntroWrapper.tsx
 * Renders the CosmosIntro once on every fresh page load.
 * No localStorage / cookie gating — every visit sees the intro.
 */

import { useState } from "react";
import CosmosIntro from "./CosmosIntro";

interface IntroWrapperProps {
  children: React.ReactNode;
  onOpenBard?: () => void;
  onOpenInkStudio?: () => void;
}

export default function IntroWrapper({
  children,
  onOpenBard,
  onOpenInkStudio,
}: IntroWrapperProps) {
  const [showIntro, setShowIntro] = useState(true);

  const handleEnter = () => {
    setShowIntro(false);
  };

  const handleAction = (action: "__bard__" | "__ink__") => {
    if (action === "__bard__") onOpenBard?.();
    if (action === "__ink__") onOpenInkStudio?.();
  };

  return (
    <>
      {showIntro && (
        <CosmosIntro onEnter={handleEnter} onAction={handleAction} />
      )}
      {/* Always render children so the app tree is mounted; intro sits on top */}
      <div className={showIntro ? "invisible pointer-events-none" : undefined}>
        {children}
      </div>
    </>
  );
}
