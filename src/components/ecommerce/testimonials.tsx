'client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Fashion Designer',
    avatar: 'SM',
    rating: 5,
    text: 'LUXE has completely transformed how I shop online. The quality is unmatched, and every piece I have purchased feels premium. The attention to detail in packaging and delivery is remarkable.',
  },
  {
    name: 'David Chen',
    role: 'Tech Entrepreneur',
    avatar: 'DC',
    rating: 5,
    text: 'I have been a customer for two years now. The tech products are always genuine, prices are competitive, and the customer service team goes above and beyond every single time.',
  },
  {
    name: 'Amara Johnson',
    role: 'Interior Designer',
    avatar: 'AJ',
    rating: 5,
    text: 'The home collection is absolutely stunning. Every piece is thoughtfully curated. My clients always ask where I source from, and LUXE is my go-to recommendation without hesitation.',
  },
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Loved by Thousands
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Real reviews from real customers who love the LUXE experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="bg-card rounded-2xl p-6 md:p-8 border border-border/50 relative group"
            >
              <Quote className="w-10 h-10 text-gold/20 absolute top-6 right-6" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-gold fill-gold" />
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}