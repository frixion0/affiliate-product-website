'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ProductCard, ProductData } from './product-card';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const sortOptions = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

interface ProductGridProps {
  title?: string;
  subtitle?: string;
  initialCategory?: string;
  featured?: boolean;
  trending?: boolean;
  limit?: number;
  onSelectProduct: (slug: string) => void;
}

export function ProductGrid({
  title,
  subtitle,
  initialCategory,
  featured,
  trending,
  limit = 50,
  onSelectProduct,
}: ProductGridProps) {
  const [sort, setSort] = useState('createdAt');
  const [category, setCategory] = useState(initialCategory || 'all');

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', category, featured, trending, sort, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.set('category', category);
      if (featured) params.set('featured', 'true');
      if (trending) params.set('trending', 'true');
      params.set('sort', sort);
      params.set('limit', String(limit));
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<ProductData[]>;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  return (
    <section id={featured ? 'featured' : trending ? 'trending' : 'products'} className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
          >
            <div>
              {title && (
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-muted-foreground mt-2 text-base">
                  {subtitle}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Filters */}
        {!featured && !trending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center gap-3 mb-8"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={category === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategory('all')}
                className="rounded-lg text-xs"
              >
                All
              </Button>
              {categories?.map((cat: { name: string; slug: string }) => (
                <Button
                  key={cat.slug}
                  variant={category === cat.slug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategory(cat.slug)}
                  className="rounded-lg text-xs"
                >
                  {cat.name}
                </Button>
              ))}
            </div>
            <div className="ml-auto">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[180px] h-9 text-xs rounded-lg">
                  <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-surface rounded-2xl animate-pulse" />
                <div className="h-3 w-16 bg-surface rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-surface rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-surface rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {products && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}

        {products && products.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No products found</p>
          </div>
        )}
      </div>
    </section>
  );
}
