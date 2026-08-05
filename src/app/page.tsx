'use client';

import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from '@/components/ecommerce/navbar';
import { Hero } from '@/components/ecommerce/hero';
import { Categories } from '@/components/ecommerce/categories';
import { ProductGrid } from '@/components/ecommerce/product-grid';
import { TrendingMarquee } from '@/components/ecommerce/trending-marquee';
import { ProductDetail } from '@/components/ecommerce/product-detail';
import { CartDrawer } from '@/components/ecommerce/cart-drawer';
import { FeaturesBanner } from '@/components/ecommerce/features-banner';
import { Testimonials } from '@/components/ecommerce/testimonials';
import { Newsletter, Footer } from '@/components/ecommerce/newsletter-footer';
import { useCartStore } from '@/store/cart-store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const openCart = useCartStore((s) => s.openCart);

  const handleSelectProduct = useCallback((slug: string) => {
    setSelectedProduct(slug);
  }, []);

  const handleSelectCategory = useCallback((slug: string) => {
    setSelectedCategory(slug);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar onCartOpen={openCart} />

        <main className="flex-1">
          <Hero />
          <FeaturesBanner />
          <Categories onSelectCategory={handleSelectCategory} />
          <ProductGrid
            id="featured"
            title="Featured Collection"
            subtitle="Hand-picked favorites from our latest arrivals"
            featured
            limit={8}
            onSelectProduct={handleSelectProduct}
          />
          <TrendingMarquee onSelect={handleSelectProduct} />
          <ProductGrid
            id="products"
            title="All Products"
            subtitle="Browse our complete collection"
            initialCategory={selectedCategory}
            onSelectProduct={handleSelectProduct}
          />
          <Testimonials />
          <Newsletter />
        </main>

        <Footer />

        <CartDrawer />
        <ProductDetail
          slug={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSelectProduct={handleSelectProduct}
        />
      </div>
    </QueryClientProvider>
  );
}
