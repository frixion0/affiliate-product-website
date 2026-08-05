'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProductCardData } from './product-card';

interface ProductModalProps {
  product: ProductCardData | null;
  onClose: () => void;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function formatINR(usd: number): string {
  const inr = usd * 83.5;
  return '₹' + inr.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const touchStartRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  const productId = product?.id ?? '';

  // Reset state when product changes
  useEffect(() => {
    setSelectedImageIndex(0);
    setShowVideo(false);
  }, [productId]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!product) return null;

  const media = product.media || [];
  const images = media
    .filter((m) => m.type === 'image')
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const videos = media
    .filter((m) => m.type === 'video')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discount = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartRef.current === null || images.length <= 1) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 30) {
      setShowVideo(false);
      if (diff > 0) {
        setSelectedImageIndex((prev) => (prev + 1) % images.length);
      } else {
        setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
    touchStartRef.current = null;
  }, [images.length]);

  const handleThumbnailClick = useCallback((i: number) => {
    setSelectedImageIndex(i);
    setShowVideo(false);
  }, []);

  const handlePrev = useCallback(() => {
    setShowVideo(false);
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setShowVideo(false);
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handleBuyNow = useCallback(() => {
    if (product.affiliateLink) {
      window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
    }
  }, [product.affiliateLink]);

  const currentVideo = showVideo && videos.length > 0 ? videos[0] : null;
  const isYoutube =
    currentVideo &&
    (currentVideo.source === 'YouTube' ||
      currentVideo.url.includes('youtube.com') ||
      currentVideo.url.includes('youtu.be'));
  const displayUrl =
    isYoutube && currentVideo
      ? `https://www.youtube.com/embed/${extractYouTubeId(currentVideo.url)}`
      : null;

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
            onClick={onClose}
          >
            <div
              ref={scrollRef}
              className="relative w-full sm:max-w-3xl lg:max-w-4xl bg-background sm:rounded-2xl sm:shadow-2xl sm:border sm:border-border overflow-hidden my-0 sm:my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                style={{ touchAction: 'manipulation' }}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Image / Video Gallery */}
              <div
                className="relative w-full aspect-[4/3] sm:aspect-video bg-muted"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'pan-y pinch-zoom' }}
              >
                <AnimatePresence mode="wait">
                  {showVideo && currentVideo ? (
                    <motion.div
                      key="video"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="w-full h-full"
                    >
                      {isYoutube && displayUrl ? (
                        <iframe
                          src={`${displayUrl}?autoplay=1`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="Product video"
                        />
                      ) : (
                        <video
                          src={currentVideo.url}
                          controls
                          autoPlay
                          className="w-full h-full object-contain"
                        />
                      )}
                    </motion.div>
                  ) : images.length > 0 ? (
                    <motion.img
                      key={selectedImageIndex}
                      src={images[selectedImageIndex]?.url}
                      alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                      className="w-full h-full object-contain bg-black/5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ExternalLink className="h-12 w-12" />
                    </div>
                  )}
                </AnimatePresence>

                {/* Nav arrows */}
                {!showVideo && images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Dots */}
                {!showVideo && images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleThumbnailClick(i)}
                        className={`h-2 rounded-full transition-all duration-150 ${
                          selectedImageIndex === i
                            ? 'bg-white w-5'
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                        style={{ touchAction: 'manipulation' }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {(images.length > 1 || videos.length > 0) && (
                <div className="flex gap-2 px-4 py-3 bg-muted/30 overflow-x-auto scrollbar-hide">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => handleThumbnailClick(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors duration-150 ${
                        !showVideo && selectedImageIndex === i
                          ? 'border-primary'
                          : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                      style={{ touchAction: 'manipulation' }}
                    >
                      <img
                        src={img.url}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                  {videos.length > 0 && (
                    <button
                      onClick={() => setShowVideo(true)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 flex items-center justify-center bg-muted transition-colors duration-150 ${
                        showVideo ? 'border-primary' : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                      style={{ touchAction: 'manipulation' }}
                    >
                      <Play className="h-5 w-5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              )}

              {/* Product Info */}
              <div className="p-4 sm:p-6">
                {product.category && (
                  <span className="text-sm text-muted-foreground mb-1 block">
                    {product.category.name}
                  </span>
                )}

                <h2 className="text-xl sm:text-2xl font-bold mb-3">{product.name}</h2>

                {/* Pricing */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-base sm:text-lg font-semibold text-muted-foreground">
                      {formatINR(product.price)}
                    </span>
                  </div>
                  {hasDiscount && (
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.comparePrice!.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatINR(product.comparePrice!)}
                      </span>
                      <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-sm font-semibold rounded-md">
                        -{discount}%
                      </span>
                    </div>
                  )}
                </div>

                {product.description && (
                  <p className="text-muted-foreground leading-relaxed mb-6 text-sm sm:text-base">
                    {product.description}
                  </p>
                )}

                <Button
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={!product.affiliateLink}
                  className="w-full text-base font-semibold h-12 sm:h-14 rounded-xl active:scale-[0.97] transition-transform duration-100"
                  style={{ touchAction: 'manipulation' }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Buy Now
                  </span>
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
