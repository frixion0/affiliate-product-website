'use client';

import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string;
  rating: number;
  reviewCount: number;
  stock: number;
  tags?: string;
  category?: { name: string; slug: string };
}

interface ProductCardProps {
  product: ProductData;
  index: number;
  onSelect: (slug: string) => void;
}

export function ProductCard({ product, index, onSelect }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const images = JSON.parse(product.images) as string[];
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      comparePrice: product.comparePrice,
      image: images[0],
      slug: product.slug,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group cursor-pointer"
      onClick={() => onSelect(product.slug)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-surface aspect-[3/4] mb-4">
        {/* Image */}
        <motion.img
          src={images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <motion.span
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="px-2.5 py-1 bg-destructive text-white text-[10px] font-bold tracking-wider uppercase rounded-lg"
            >
              -{discount}%
            </motion.span>
          )}
          {product.tags?.includes('bestseller') && (
            <motion.span
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="px-2.5 py-1 bg-gold text-gold-foreground text-[10px] font-bold tracking-wider uppercase rounded-lg"
            >
              Bestseller
            </motion.span>
          )}
          {product.tags?.includes('new') && (
            <motion.span
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="px-2.5 py-1 bg-foreground text-background text-[10px] font-bold tracking-wider uppercase rounded-lg"
            >
              New
            </motion.span>
          )}
        </div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              toast.success('Added to wishlist');
            }}
            className="w-11 h-11 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white transition-colors shadow-lg"
          >
            <Heart className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product.slug);
            }}
            className="w-11 h-11 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white transition-colors shadow-lg"
          >
            <Eye className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>

      {/* Info */}
      <div className="space-y-1.5 px-1">
        {product.category && (
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            {product.category.name}
          </p>
        )}
        <h3 className="font-semibold text-sm leading-snug group-hover:text-gold-foreground transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            <Star className="w-3.5 h-3.5 text-gold fill-gold" />
            <span className="text-xs font-medium">{product.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-base">${product.price.toFixed(2)}</span>
          {product.comparePrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.comparePrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
