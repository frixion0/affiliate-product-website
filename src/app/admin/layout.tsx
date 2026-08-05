'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 10 * 1000, refetchOnWindowFocus: false },
    },
  }));

  useEffect(() => {
    fetch('/api/setup').catch(() => {});
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}