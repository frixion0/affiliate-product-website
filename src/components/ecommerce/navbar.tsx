'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Search, ShoppingBag, Menu, X, Heart, User, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const navLinks = [
  { label: 'New Arrivals', href: '#new' },
  { label: 'Featured', href: '#featured' },
  { label: 'Categories', href: '#categories' },
  { label: 'Trending', href: '#trending' },
];

export function Navbar({ onCartOpen }: { onCartOpen: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const totalItems = useCartStore((s) => s.totalItems());
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 20);
  });

  useEffect(() => {
    if (isSearchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <>
      {/* Announcement Bar - Marquee */}
      <motion.div
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-primary text-primary-foreground py-2 text-xs tracking-widest uppercase overflow-hidden"
      >
        <div className="animate-marquee whitespace-nowrap flex">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="mx-8 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" />
              Free Shipping on Orders Over $150
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" />
              New Collection Now Live
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" />
              30-Day Easy Returns
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" />
              Members Get 15% Off
            </span>
          ))}
        </div>
      </motion.div>

      {/* Main Navbar */}
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-background/80 backdrop-blur-xl shadow-sm border-b border-border/50'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <motion.a
              href="#"
              className="text-2xl md:text-3xl font-bold tracking-tighter"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-gradient">LUXE</span>
            </motion.a>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {link.label}
                  <motion.span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gold rounded-full"
                    initial={{ width: 0 }}
                    whileHover={{ width: '60%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Search Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 hover:bg-muted rounded-full transition-colors"
                aria-label="Search"
              >
                <AnimatePresence mode="wait">
                  {isSearchOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="search"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Search className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Wishlist */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex p-2.5 hover:bg-muted rounded-full transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </motion.button>

              {/* Cart Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCartOpen}
                className="relative p-2.5 hover:bg-muted rounded-full transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gold text-gold-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Account */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex p-2.5 hover:bg-muted rounded-full transition-colors"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden pb-4"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, categories, brands..."
                    className="pl-11 h-12 bg-surface rounded-xl border-0 text-base"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-80 bg-background z-[70] shadow-2xl"
            >
              <div className="flex items-center justify-between p-6">
                <span className="text-2xl font-bold text-gradient">LUXE</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 text-lg font-medium rounded-xl hover:bg-surface transition-colors"
                  >
                    {link.label}
                    <ChevronDown className="w-4 h-4 rotate-[-90deg] text-muted-foreground" />
                  </motion.a>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
                <p className="text-sm text-muted-foreground">Need help?</p>
                <p className="font-medium">Contact Support</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
