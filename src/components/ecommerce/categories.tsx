'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export function Categories({ onSelectCategory }: { onSelectCategory: (slug: string) => void }) {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  if (!categories?.length) return null;

  return (
    <section id="categories" className="py-16 md:py-24 bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Shop by Category</h2>
            <p className="text-muted-foreground mt-2">Find exactly what you are looking for</p>
          </div>
        </motion.div>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
          {categories.map((cat: any, i: number) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              onClick={() => {
                const el = document.getElementById('products');
                el?.scrollIntoView({ behavior: 'smooth' });
                onSelectCategory(cat.slug);
              }}
              className="flex-shrink-0 w-56 md:w-64 group relative overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white font-bold text-lg mb-1">{cat.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-sm">{cat._count?.products || 0} products</span>
                  <ArrowRight className="w-4 h-4 text-gold translate-x-0 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
