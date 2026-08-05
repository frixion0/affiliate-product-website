'client';

import { motion } from 'framer-motion';
import { ArrowRight, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Newsletter() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=600&fit=crop)',
            }}
          />
          <div className="absolute inset-0 bg-primary/85 backdrop-blur-sm" />

          <div className="relative z-10 py-16 md:py-20 px-6 md:px-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3"
            >
              Join the LUXE Club
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-primary-foreground/70 mb-8 max-w-md mx-auto"
            >
              Get 15% off your first order plus early access to new arrivals and exclusive offers.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex gap-3 max-w-md mx-auto"
            >
              <Input
                placeholder="Enter your email"
                className="h-12 bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/50 rounded-xl focus:ring-gold"
              />
              <Button className="h-12 px-6 bg-gold text-gold-foreground hover:bg-gold/90 rounded-xl font-semibold flex-shrink-0">
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  const links = {
    Shop: ['New Arrivals', 'Featured', 'Bestsellers', 'Sale', 'Gift Cards'],
    Company: ['About Us', 'Careers', 'Press', 'Sustainability', 'Affiliates'],
    Support: ['Help Center', 'Shipping Info', 'Returns', 'Size Guide', 'Contact Us'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl font-bold">LUXE</span>
            <p className="text-primary-foreground/60 text-sm mt-3 leading-relaxed">
              Curated premium products for the modern lifestyle.
            </p>
            <div className="flex gap-3 mt-6">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  aria-label="Social media"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-primary-foreground/60 text-sm hover:text-primary-foreground transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/50 text-sm">
            &copy; 2025 LUXE. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Visa', 'Mastercard', 'Amex', 'PayPal'].map((p) => (
              <span
                key={p}
                className="text-[10px] font-semibold px-2 py-1 bg-primary-foreground/10 rounded text-primary-foreground/60"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}