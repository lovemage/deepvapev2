import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn,
  Dot
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';
import { getImageUrl } from '@/lib/utils';

interface ProductImageCarouselProps {
  images?: Array<{ image_url: string; is_primary?: boolean }>;
  productName: string;
  fallbackImage?: string;
  className?: string;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({
  images = [],
  productName,
  fallbackImage,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // 如果沒有圖片，使用fallback圖片
  const displayImages = images.length > 0 
    ? images 
    : fallbackImage 
      ? [{ image_url: fallbackImage, is_primary: true }] 
      : [];

  // 如果完全沒有圖片，顯示佔位符
  if (displayImages.length === 0) {
    return (
      <Card className={`overflow-hidden bg-gray-100 ${className}`}>
        <div className="aspect-square flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">暫無圖片</p>
          </div>
        </div>
      </Card>
    );
  }

  // 單張圖片時的簡化顯示
  if (displayImages.length === 1) {
    return (
      <>
        <Card className={`overflow-hidden cursor-pointer group ${className}`}>
          <div 
            className="relative bg-gray-100"
            onClick={() => setIsZoomOpen(true)}
          >
            <OptimizedImage
              src={getImageUrl(displayImages[0].image_url)}
              alt={productName}
              className="w-full aspect-square"
              width={640}
              height={640}
              objectFit="cover"
              priority
            />
            
            {/* Zoom Icon Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3 shadow-lg">
                <ZoomIn className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </div>
        </Card>

        {/* Zoom Dialog */}
        <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 overflow-hidden flex items-center justify-center">
            <DialogTitle className="sr-only">{productName} - 圖片放大檢視</DialogTitle>
            <DialogDescription className="sr-only">點擊關閉按鈕或按ESC鍵關閉圖片放大檢視</DialogDescription>
            <DialogClose className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-6 w-6 text-white drop-shadow-lg" />
              <span className="sr-only">Close</span>
            </DialogClose>
            <div className="relative bg-gray-100 flex items-center justify-center w-full h-full min-h-[60vh] max-h-[90vh]">
              <OptimizedImage
                src={getImageUrl(displayImages[0].image_url)}
                alt={productName}
                className="max-w-full max-h-full w-auto h-auto"
                objectFit="contain"
                width={1200}
                height={800}
                sizes="90vw"
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // 多張圖片時的輪播顯示
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* 主圖片 */}
        <Card className="overflow-hidden cursor-pointer group relative">
          <div 
            className="relative bg-gray-100"
            onClick={() => setIsZoomOpen(true)}
          >
            <OptimizedImage
              src={getImageUrl(displayImages[currentIndex].image_url)}
              alt={`${productName} - 圖片 ${currentIndex + 1}`}
              className="w-full aspect-square"
              width={640}
              height={640}
              objectFit="cover"
              priority={currentIndex === 0}
            />
            
            {/* 圖片數量指示器 */}
            <Badge className="absolute top-3 right-3 bg-black/70 text-white">
              {currentIndex + 1} / {displayImages.length}
            </Badge>

            {/* 導航按鈕 */}
            {displayImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Zoom Icon Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3 shadow-lg">
                <ZoomIn className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </div>
        </Card>

        {/* 縮圖導航 */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {displayImages.map((image, index) => (
              <button
                key={index}
                className={`flex-shrink-0 relative overflow-hidden rounded-md border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => goToImage(index)}
              >
                <OptimizedImage
                  src={getImageUrl(image.image_url)}
                  alt={`${productName} - 縮圖 ${index + 1}`}
                  className="w-16 h-16"
                  width={64}
                  height={64}
                  objectFit="cover"
                />
                {image.is_primary && (
                  <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1 py-0 h-4">
                    主
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}

        {/* 圓點指示器 */}
        {displayImages.length > 1 && displayImages.length <= 5 && (
          <div className="flex justify-center gap-1">
            {displayImages.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => goToImage(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Zoom Dialog */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 overflow-hidden flex items-center justify-center">
          <DialogTitle className="sr-only">{productName} - 圖片放大檢視</DialogTitle>
          <DialogDescription className="sr-only">點擊關閉按鈕或按ESC鍵關閉圖片放大檢視</DialogDescription>
          <DialogClose className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-6 w-6 text-white drop-shadow-lg" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="relative bg-gray-100 flex items-center justify-center w-full h-full min-h-[60vh] max-h-[90vh]">
            <OptimizedImage
              src={getImageUrl(displayImages[currentIndex].image_url)}
              alt={`${productName} - 圖片 ${currentIndex + 1}`}
              className="max-w-full max-h-full w-auto h-auto"
              objectFit="contain"
              width={1200}
              height={800}
              sizes="90vw"
            />
          </div>
          
          {/* Dialog 中的導航 */}
          {displayImages.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-12 w-12"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-16 top-1/2 transform -translate-y-1/2 h-12 w-12"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              <Badge className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white">
                {currentIndex + 1} / {displayImages.length}
              </Badge>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductImageCarousel; 