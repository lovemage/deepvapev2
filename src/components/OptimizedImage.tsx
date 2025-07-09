import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  width?: number;
  height?: number;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  sizes = '100vw',
  loading = 'lazy',
  priority = false,
  width,
  height,
  onError,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // 如果圖片載入失敗，顯示佔位符
  if (imageError) {
    return (
      <div className={cn(
        "bg-gray-200 dark:bg-gray-700 flex items-center justify-center",
        className
      )} style={{ width, height }}>
        <svg
          className="w-12 h-12 text-gray-400 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} style={{ width, height }}>
      {/* 載入中的骨架屏 */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover",
          isLoading && "opacity-0",
          !isLoading && "opacity-100 transition-opacity duration-300"
        )}
        loading={priority ? 'eager' : loading}
        onError={handleError}
        onLoad={handleLoad}
        width={width}
        height={height}
        decoding="async"
      />
    </div>
  );
};

export default OptimizedImage;