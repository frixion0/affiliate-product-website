'use client';

import { motion } from 'framer-motion';
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

export function ProductCard({ product, index, onSelect }: ProductCardProps) {
  const firstImage = product.media.find((m) => m.type === 'image');
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discount = hasDiscount ? getDiscount(product.price, product.comparePrice!) : 0;

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
    >
      <button
        onClick={() => onSelect(product.id)}
        className="w-full text-left bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {firstImage ? (
            <motion.img
              src={firstImage.url}
              alt={product.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ExternalLink className="h-8 w-8" />
            </div>
          )}

          {hasDiscount && (
            <Badge className="absolute top-3 left-3 bg-destructive text-white hover:bg-destructive/90 text-xs font-semibold">
              -{discount}%
            </Badge>
          )}

          <motion.div
            className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center"
          >
            <motion.div
              className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-foreground shadow-sm">
                <Eye className="h-3.5 w-3.5" />
                View Details
              </span>
            </motion.div>
          </motion.div>
        </div>

        <div className="p-4">
          {product.category && (
            <Badge
              variant="secondary"
              className="mb-2 text-xs font-normal"
            >
              {product.category.name}
            </Badge>
          )}

          <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.comparePrice!.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </button>
    </motion.div>
  );
}
