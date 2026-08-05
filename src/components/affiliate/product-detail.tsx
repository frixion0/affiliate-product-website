'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
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
  return '\u20b9' + inr.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const touchRef = useRef<number | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = product ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  useEffect(() => {
    setSelectedIndex(0);
    setShowVideo(false);
  }, [product?.id]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const images = (product?.media || []).filter(m => m.type === 'image').sort((a, b) => a.sortOrder - b.sortOrder);
  const videos = (product?.media || []).filter(m => m.type === 'video').sort((a, b) => a.sortOrder - b.sortOrder);
  const hasDiscount = product ? (product.comparePrice != null && product.comparePrice > product.price) : false;
  const discountPct = hasDiscount ? Math.round(((product!.comparePrice! - product!.price) / product!.comparePrice!) * 100) : 0;

  const goPrev = useCallback(() => { setShowVideo(false); setSelectedIndex(i => (i - 1 + images.length) % images.length); }, [images.length]);
  const goNext = useCallback(() => { setShowVideo(false); setSelectedIndex(i => (i + 1) % images.length); }, [images.length]);
  const pickThumb = useCallback((i: number) => { setSelectedIndex(i); setShowVideo(false); }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => { touchRef.current = e.touches[0].clientX; }, []);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchRef.current == null || images.length <= 1) return;
    const diff = touchRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 30) { diff > 0 ? goNext() : goPrev(); }
    touchRef.current = null;
  }, [images.length, goNext, goPrev]);

  const buyNow = useCallback(() => {
    if (product?.affiliateLink) window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
  }, [product?.affiliateLink]);

  const currentVideo = showVideo && videos.length > 0 ? videos[0] : null;
  const isYT = currentVideo && (currentVideo.source === 'YouTube' || currentVideo.url.includes('youtube.com') || currentVideo.url.includes('youtu.be'));
  const embedUrl = isYT && currentVideo ? `https://www.youtube.com/embed/${extractYouTubeId(currentVideo.url)}` : null;

  if (!product || !mounted) return null;

  const modal = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal container - scrollable on mobile, centered on desktop */}
      <div
        className="absolute inset-0 flex items-start sm:items-center justify-center overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="relative w-full sm:max-w-3xl lg:max-w-4xl bg-background sm:rounded-2xl sm:shadow-2xl sm:border sm:border-border overflow-hidden my-0 sm:my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close X */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            style={{ touchAction: 'manipulation' }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Image / Video area */}
          <div
            className="relative w-full aspect-[4/3] sm:aspect-video bg-muted"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{ touchAction: 'pan-y pinch-zoom' }}
          >
            {showVideo && currentVideo ? (
              <div className="w-full h-full">
                {isYT && embedUrl ? (
                  <iframe
                    src={`${embedUrl}?autoplay=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Product video"
                  />
                ) : (
                  <video src={currentVideo.url} controls autoPlay className="w-full h-full object-contain" />
                )}
              </div>
            ) : images.length > 0 ? (
              <AnimatePresence mode="wait">
                <img
                  key={selectedIndex}
                  src={images[selectedIndex]?.url}
                  alt={`${product.name} - ${selectedIndex + 1}`}
                  className="w-full h-full object-contain bg-black/5"
                  draggable={false}
                />
              </AnimatePresence>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ExternalLink className="h-12 w-12" />
              </div>
            )}

            {/* Left / Right arrows */}
            {!showVideo && images.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                  style={{ touchAction: 'manipulation' }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                  style={{ touchAction: 'manipulation' }}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Dot indicators */}
            {!showVideo && images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => pickThumb(i)}
                    className={`h-2 rounded-full transition-all duration-150 ${
                      selectedIndex === i ? 'bg-white w-5' : 'bg-white/40 hover:bg-white/60'
                    }`}
                    style={{ touchAction: 'manipulation' }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {(images.length > 1 || videos.length > 0) && (
            <div className="flex gap-2 px-4 py-3 bg-muted/30 overflow-x-auto scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => pickThumb(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors duration-150 ${
                    !showVideo && selectedIndex === i
                      ? 'border-primary'
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <img src={img.url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
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

          {/* Product info + Buy button */}
          <div className="p-4 sm:p-6">
            {product.category && (
              <span className="text-sm text-muted-foreground mb-1 block">{product.category.name}</span>
            )}

            <h2 className="text-xl sm:text-2xl font-bold mb-3">{product.name}</h2>

            <div className="mb-4">
              <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-bold text-primary">${product.price.toFixed(2)}</span>
                <span className="text-base sm:text-lg font-semibold text-muted-foreground">{formatINR(product.price)}</span>
              </div>
              {hasDiscount && (
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm text-muted-foreground line-through">${product.comparePrice!.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground line-through">{formatINR(product.comparePrice!)}</span>
                  <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-sm font-semibold rounded-md">-{discountPct}%</span>
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed mb-6 text-sm sm:text-base">{product.description}</p>
            )}

            <Button
              size="lg"
              onClick={buyNow}
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
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
