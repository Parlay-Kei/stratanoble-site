'use client';

import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
  webpSupport?: boolean;
}

export default function OptimizedImage({
  src,
  fallbackSrc,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  // Generate WebP path by replacing the extension
  const getWebpSrc = (originalSrc: string) => {
    const pathParts = originalSrc.split('.');
    if (pathParts.length > 1) {
      pathParts[pathParts.length - 1] = 'webp';
      return pathParts.join('.');
    }
    return `${originalSrc}.webp`;
  };

  const webpSrc = getWebpSrc(src);

  return (
    <picture>
      {/* WebP version for modern browsers */}
      <source srcSet={webpSrc} type="image/webp" />

      {/* Fallback to original format */}
      <Image
        src={src}
        alt={alt}
        className={className}
        {...props}
      />
    </picture>
  );
}