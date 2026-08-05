'client';

import { motion } from 'framer-motion';
import { Truck, Shield, RotateCcw, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    desc: 'On all orders over $150',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    desc: '256-bit SSL encryption',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    desc: '30-day return policy',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    desc: 'Dedicated help center',
  },
];

export function FeaturesBanner() {
  return (
    <section className="py-12 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}