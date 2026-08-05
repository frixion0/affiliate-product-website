'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center overflow-hidden"
    >
      {/* Background with Parallax */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/10 text-gold-foreground text-xs font-semibold tracking-widest uppercase rounded-full mb-8 border border-gold/20">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              New Season 2025
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
          >
            Redefine Your{' '}
            <span className="text-gradient">Style</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg"
          >
            Curated collections of premium products designed for those who
            appreciate the extraordinary in everyday living.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              size="lg"
              className="h-13 px-8 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              asChild
            >
              <a href="#products">
                Shop Collection
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-13 px-8 text-base font-semibold rounded-xl group"
              asChild
            >
              <a href="#featured">
                <Play className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                Watch Lookbook
              </a>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex gap-10 mt-14 pt-8 border-t border-border/50"
          >
            {[
              { value: '50K+', label: 'Happy Customers' },
              { value: '500+', label: 'Premium Products' },
              { value: '4.9', label: 'Average Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-gradient">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.6,
          delay: 0.8,
          type: 'spring',
          stiffness: 200,
        }}
        className="hidden lg:block absolute right-12 top-1/3 z-10"
      >
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-border/50 w-56">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
              <span className="text-gold-foreground text-sm font-bold">LX</span>
            </div>
            <div>
              <p className="text-sm font-semibold">LUXE Verified</p>
              <p className="text-xs text-muted-foreground">Authentic Products</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4 text-gold fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              4.9/5 (2.3K)
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
