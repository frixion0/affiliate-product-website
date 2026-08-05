'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, SlidersHorizontal, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductCard, type ProductCardData } from './product-card';
import { ProductModal } from './product-detail';

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface ProductGridProps {
  searchQuery: string;
}

export function ProductGrid({ searchQuery }: ProductGridProps) {
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ProductCardData | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [category, searchQuery, sort, isFeatured]);

  // Close modal on filter/page change
  useEffect(() => {
    setSelectedProduct(null);
  }, [category, searchQuery, sort, page]);

  const { data: categoriesData } = useQuery<CategoryData[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading, isError } = useQuery<{
    products: ProductCardData[];
    pagination: { page: number; totalPages: number; total: number };
  }>({
    queryKey: ['products', { category, search: searchQuery, sort, page, featured: isFeatured }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (searchQuery) params.set('search', searchQuery);
      if (sort) params.set('sort', sort);
      if (page) params.set('page', String(page));
      if (isFeatured) params.set('featured', 'true');
      return fetch(`/api/products?${params.toString()}`).then((r) => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      });
    },
  });

  const products = data?.products ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const handleSelect = useCallback((id: string) => {
    const p = products.find((pr) => pr.id === id);
    if (p) setSelectedProduct(p);
  }, [products]);

  const handleClose = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const handleCategoryClick = useCallback((slug: string | null, featured: boolean) => {
    setCategory(slug);
    setIsFeatured(featured);
  }, []);

  return (
    <>
      <section id="deals" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Filter Bar */}
        <div id="categories" className="space-y-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryClick(null, false)}
              style={{ touchAction: 'manipulation' }}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150 ${
                !category && !isFeatured
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              All Deals
            </button>

            <button
              onClick={() => handleCategoryClick(null, true)}
              style={{ touchAction: 'manipulation' }}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150 ${
                isFeatured && !category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              Featured
            </button>

            {categoriesData?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug, false)}
                style={{ touchAction: 'manipulation' }}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150 ${
                  category === cat.slug
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${data?.pagination?.total ?? 0} products found`}
            </p>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[160px] h-9 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-5 w-24 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Failed to load products. Please try again.</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && products.length === 0 && (
          <div className="text-center py-16">
            <PackageOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">No products found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && !isError && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-9 w-9 p-0"
              style={{ touchAction: 'manipulation' }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={page === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(p)}
                className={`h-9 w-9 p-0 ${page === p ? 'font-semibold' : ''}`}
                style={{ touchAction: 'manipulation' }}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-9 w-9 p-0"
              style={{ touchAction: 'manipulation' }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>

      {/* Modal rendered OUTSIDE the section, portaled to body */}
      <ProductModal product={selectedProduct} onClose={handleClose} />
    </>
  );
}
