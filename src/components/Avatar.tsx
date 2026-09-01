import React, { useState, useEffect } from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  textSize?: string;
  alt?: string;
  shape?: 'square' | 'circle' | 'rounded';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'Artist',
  size,
  className = '',
  imageClassName = '',
  fallbackClassName = '',
  textSize,
  alt,
  shape
}) => {
  const [hasError, setHasError] = useState(false);
  const cleanSrc = src?.trim();
  const hasValidSrc = Boolean(cleanSrc && cleanSrc.length > 0 && !hasError);

  // Size mapping if size prop is explicitly provided
  const sizeClass = size === 'xs' 
    ? 'w-6 h-6' 
    : size === 'sm' 
    ? 'w-8 h-8' 
    : size === 'md' 
    ? 'w-10 h-10' 
    : size === 'lg' 
    ? 'w-14 h-14' 
    : size === 'xl' 
    ? 'w-20 h-20' 
    : typeof size === 'string' && size.length > 0 
    ? size 
    : (className.includes('w-') ? '' : 'w-12 h-12');

  // Reset error when src prop changes
  useEffect(() => {
    setHasError(false);
  }, [cleanSrc]);

  // Extract first letter initial
  const cleanName = (name || '').trim();
  const initial = cleanName.length > 0 ? cleanName.charAt(0).toUpperCase() : 'A';

  // Apply optional shape modifier
  const shapeClass =
    shape === 'circle' ? 'rounded-full' : shape === 'rounded' ? 'rounded-sm' : shape === 'square' ? 'rounded-none' : '';

  return (
    <div
      className={`relative overflow-hidden shrink-0 select-none transition-all duration-300 ${shapeClass || 'rounded-full'} ${sizeClass} ${className}`}
    >
      {/* 1. Image Render (When valid src is present and hasn't failed) */}
      {hasValidSrc ? (
        <img
          src={cleanSrc}
          alt={alt || name || 'Artist Avatar'}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-200 ${imageClassName}`}
          loading="eager"
        />
      ) : (
        /* 2. Sleek Dark-Themed Premium Initial Placeholder */
        <div
          className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-[#c9a875]/30 text-[#c9a875] font-serif shadow-inner select-none ${fallbackClassName}`}
        >
          <span
            className={`font-serif tracking-wider font-light drop-shadow-sm select-none ${
              textSize || 'text-base sm:text-lg md:text-xl'
            }`}
          >
            {initial}
          </span>
        </div>
      )}
    </div>
  );
};
