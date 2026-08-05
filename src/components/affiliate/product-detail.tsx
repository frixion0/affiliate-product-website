'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProductCardData } from './product-card';

interface ProductDetailProps {
  product: ProductCardData;
  isExpanded: boolean;
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

export function ProductDetail({ product, isExpanded, onClose }: ProductDetailProps) {
  const images = product.media.filter((m) => m.type === 'image').sort((a, b) => a.sortOrder - b.sortOrder);
  const videos = product.media.filter((m) => m.type === 'video').sort((a, b) => a.sortOrder - b.sortOrder);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discount = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;

  if (images.length > 0 && selectedImageIndex >= images.length) {
    setSelectedImageIndex(0);
  }

  const currentVideo = showVideo && videos.length > 0 ? videos[0] : null;
  const isYoutube = currentVideo && (currentVideo.source === 'YouTube' || currentVideo.url.includes('youtube.com') || currentVideo.url.includes('youtu.be'));
  const displayUrl = isYoutube && currentVideo
    ? `https://www.youtube.com/embed/${extractYouTubeId(currentVideo.url)}`
    : null;

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          layout
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="col-span-full overflow-hidden"
        >
          <div className="bg-card rounded-2xl border border-border shadow-lg mt-2 p-4 sm:p-6">
            <div className="flex justify-end mb-3">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Close details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* Media Gallery */}
              <div>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-3">
                  <AnimatePresence mode="wait">
                    {showVideo && currentVideo ? (
                      <motion.div
                        key="video"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ExternalLink className="h-10 w-10" />
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Thumbnails + Video toggle */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => { setSelectedImageIndex(i); setShowVideo(false); }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        !showVideo && selectedImageIndex === i
                          ? 'border-primary'
                          : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                  {videos.length > 0 && (
                    <button
                      onClick={() => setShowVideo(true)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 flex items-center justify-center bg-muted transition-colors ${
                        showVideo ? 'border-primary' : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                    >
                      <Play className="h-5 w-5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col">
                {product.category && (
                  <span className="text-sm text-muted-foreground mb-1">
                    {product.category.name}
                  </span>
                )}

                <h2 className="text-2xl font-bold mb-3">{product.name}</h2>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        ${product.comparePrice!.toFixed(2)}
                      </span>
                      <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-sm font-semibold rounded-md">
                        -{discount}%
                      </span>
                    </>
                  )}
                </div>

                {product.description && (
                  <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                    {product.description}
                  </p>
                )}

                <Button
                  size="lg"
                  onClick={() => window.open(product.affiliateLink, '_blank')}
                  className="w-full sm:w-auto text-base font-semibold h-12 rounded-xl"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="h-4.5 w-4.5" />
                    Buy Now
                  </span>
                </Button>

                <p className="text-xs text-muted-foreground mt-3">
                  Affiliate link will open in a new tab
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}