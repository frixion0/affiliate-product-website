'use client';

import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { ExternalLink, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ProductMedia {
  id: string;
  url: string;
  type: string;
  source: string;
  sortOrder: number;
}

export interface ProductCategory {
  name: string;
  slug: string;
}

export interface ProductCardData {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice: number | null;
  affiliateLink: string;
  media: ProductMedia[];
  category: ProductCategory | null;
  clickCount: number;
}

interface ProductCardProps {
  product: ProductCardData;
  index: number;
  onSelect: (id: string) => void;
}

function getDiscount(price: number, comparePrice: number): number {
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

function formatINR(usd: number): string {
  const inr = usd * 83.5;
  return '₹' + inr.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function ImageCarousel({ images, productName }: { images: ProductMedia[]; productName: string }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(next, 500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length, next]);

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        <ExternalLink className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Crossfade: stack all images, only current visible */}
      {images.map((img, i) => (
        <img
          key={img.id}
          src={img.url}
          alt={`${productName} - ${i + 1}`}
          loading={i === 0 ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        />
      ))}
      {/* Dot indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {images.map((_, i) => (
            <span
              key={i}
              className="block w-1.5 h-1.5 rounded-full transition-all duration-150"
              style={{ backgroundColor: i === current ? 'white' : 'rgba(255,255,255,0.4)', width: i === current ? 10 : 6 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const ProductCard = memo(function ProductCard({ product, index, onSelect }: ProductCardProps) {
  const images = (product.media || [])
    .filter((m) => m.type === 'image')
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discount = hasDiscount ? getDiscount(product.price, product.comparePrice!) : 0;

  return (
    <div
      className="group relative animate-[fadeInUp_0.3s_ease-out_both]"
      style={{ animationDelay: `${Math.min(index * 30, 150)}ms` }}
    >
      <button
        onClick={() => onSelect(product.id)}
        className="w-full text-left bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] transition-transform"
        style={{ touchAction: 'manipulation' }}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <ImageCarousel images={images} productName={product.name} />

          {hasDiscount && (
            <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-destructive text-white hover:bg-destructive/90 text-[10px] sm:text-xs font-semibold z-10">
              -{discount}%
            </Badge>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-foreground shadow-sm">
                <Eye className="h-3.5 w-3.5" />
                View Details
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          {product.category && (
            <Badge
              variant="secondary"
              className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-normal"
            >
              {product.category.name}
            </Badge>
          )}

          <h3 className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2 mb-1.5 sm:mb-2 group-hover:text-primary transition-colors duration-150">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              {formatINR(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                ${product.comparePrice!.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </button>
    </div>
  );
});
