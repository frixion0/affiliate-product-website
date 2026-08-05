'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { ProductData } from './product-card';

export function TrendingMarquee({ onSelect }: { onSelect: (slug: string) => void }) {
  const { data: products } = useQuery({
    queryKey: ['products', 'trending'],
    queryFn: async () => {
      const res = await fetch('/api/products?trending=true&limit=10');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<ProductData[]>;
    },
  });

  if (!products?.length) return null;

  const doubled = [...products, ...products];

  return (
    <section id="trending" className="py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Trending Now</h2>
            <p className="text-muted-foreground mt-2">What everyone is buying this week</p>
          </div>
        </motion.div>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex gap-4 animate-marquee w-max">
          {doubled.map((product, i) => {
            const images = JSON.parse(product.images) as string[];
            const discount = product.comparePrice
              ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
              : 0;

            return (
              <motion.div
                key={`${product.id}-${i}`}
                whileHover={{ y: -4 }}
                onClick={() => onSelect(product.slug)}
                className="flex-shrink-0 w-72 bg-card rounded-2xl overflow-hidden border border-border/50 cursor-pointer group"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-destructive text-white text-[10px] font-bold rounded-md">
                      -{discount}%
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    {product.category?.name}
                  </p>
                  <h4 className="font-semibold text-sm line-clamp-1 mb-2">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">${product.price.toFixed(2)}</span>
                      {product.comparePrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          ${product.comparePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-gold fill-gold" />
                      <span className="text-xs font-medium">{product.rating}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
