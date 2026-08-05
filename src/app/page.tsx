'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from '@/components/affiliate/navbar';
import { Hero } from '@/components/affiliate/hero';
import { ProductGrid } from '@/components/affiliate/product-grid';
import { Footer } from '@/components/affiliate/footer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <main className="flex-1">
          <Hero searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <ProductGrid searchQuery={searchQuery} />
        </main>

        <Footer />
      </div>
    </QueryClientProvider>
  );
}
