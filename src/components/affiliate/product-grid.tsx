'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { ProductDetail } from './product-detail';

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface ProductGridProps {
  searchQuery: string;
  sessionId: string;
}

const COLUMNS = { mobile: 2, md: 3, lg: 4 };

function getColumns(): number {
  if (typeof window === 'undefined') return COLUMNS.mobile;
  if (window.innerWidth >= 1024) return COLUMNS.lg;
  if (window.innerWidth >= 768) return COLUMNS.md;
  return COLUMNS.mobile;
}

export function ProductGrid({ searchQuery, sessionId }: ProductGridProps) {
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [columns, setColumns] = useState(COLUMNS.mobile);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);

  // Responsive columns
  useEffect(() => {
    const updateColumns = () => setColumns(getColumns());
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [category, searchQuery, sort, isFeatured]);

  // Close detail when filters change
  useEffect(() => {
    setExpandedProductId(null);
  }, [category, searchQuery, sort, page]);

  const { data: categoriesData } = useQuery<CategoryData[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading, isError } = useQuery<{ products: ProductCardData[]; pagination: { page: number; totalPages: number; total: number } }>({
    queryKey: ['products', { category, search: searchQuery, sort, page, featured: isFeatured }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (searchQuery) params.set('search', searchQuery);
      if (sort) params.set('sort', sort);
      if (page) params.set('page', String(page));
      if (isFeatured) params.set('featured', 'true');
      return fetch(`/api/products?${params.toString()}`).then((r) => r.json());
    },
  });

  const products = data?.products ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  // Calculate which row index each product belongs to
  const getRowIndex = useCallback(
    (productIndex: number) => Math.floor(productIndex / columns),
    [columns]
  );

  const expandedIndex = useMemo(() => {
    if (!expandedProductId) return -1;
    return products.findIndex((p) => p.id === expandedProductId);
  }, [expandedProductId, products]);

  const expandedRow = expandedIndex >= 0 ? getRowIndex(expandedIndex) : -1;

  const handleSelect = useCallback((id: string) => {
    setExpandedProductId((prev) => (prev === id ? null : id));
  }, []);

  // Build rows for rendering
  const rows = useMemo(() => {
    const result: Array<{ type: 'products'; indices: number[] } | { type: 'detail' }> = [];
    for (let i = 0; i < products.length; i += columns) {
      const rowIndices = [];
      for (let j = i; j < Math.min(i + columns, products.length); j++) {
        rowIndices.push(j);
      }
      result.push({ type: 'products', indices: rowIndices });

      const currentRow = getRowIndex(i);
      if (currentRow === expandedRow && expandedProductId) {
        result.push({ type: 'detail' });
      }
    }
    return result;
  }, [products, columns, expandedRow, expandedProductId, getRowIndex]);

  const expandedProduct = expandedProductId
    ? products.find((p) => p.id === expandedProductId) ?? null
    : null;

  return (
    <section id="deals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filter Bar */}
      <div id="categories" className="space-y-4 mb-8">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setCategory(null); setIsFeatured(false); }}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              !category && !isFeatured
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
          >
            All Deals
          </button>

          <button
            onClick={() => { setCategory(null); setIsFeatured(true); }}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              isFeatured && !category
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
          >
            ✨ Featured
          </button>

          {categoriesData?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.slug); setIsFeatured(false); }}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                category === cat.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort + count */}
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

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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

      {/* Error State */}
      {isError && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Failed to load products. Please try again.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && products.length === 0 && (
        <div className="text-center py-16">
          <PackageOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No products found</h3>
          <p className="text-muted-foreground text-sm">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Product Grid with Expand-in-Place */}
      {!isLoading && !isError && products.length > 0 && (
        <div>
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {rows.map((row, rowIdx) => {
              if (row.type === 'products') {
                return (
                  <div
                    key={`row-${rowIdx}`}
                    className="contents"
                  >
                    {row.indices.map((prodIdx) => (
                      <ProductCard
                        key={products[prodIdx].id}
                        product={products[prodIdx]}
                        index={prodIdx}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                );
              }

              // Detail row - render as col-span-full within the grid
              return (
                <div
                  key={`detail-${rowIdx}`}
                  className="col-span-full"
                >
                  {expandedProduct && (
                    <ProductDetail
                      product={expandedProduct}
                      isExpanded={true}
                      onClose={() => setExpandedProductId(null)}
                      sessionId={sessionId}
                    />
                  )}
                </div>
              );
            })}
          </div>
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
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
}
