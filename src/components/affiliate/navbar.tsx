'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });

  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src="/logo.png" alt="DealsHub" className="h-8 w-8 rounded-lg object-cover" />
          <span className="text-xl font-bold tracking-tight text-primary">DealsHub</span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => handleNavClick('deals')}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Deals
          </button>
          <button
            onClick={() => handleNavClick('categories')}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Categories
          </button>
          <button
            onClick={() => handleNavClick('featured')}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Featured
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-48 lg:w-64 h-9 text-sm bg-muted/50 border-0 focus-visible:ring-1"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="sm:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle search"
          >
            {mobileSearchOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      <motion.div
        initial={false}
        animate={{ height: mobileSearchOpen ? 'auto' : 0, opacity: mobileSearchOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden sm:hidden"
      >
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10 text-sm bg-muted/50 border-0 focus-visible:ring-1"
              autoFocus={mobileSearchOpen}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
}
