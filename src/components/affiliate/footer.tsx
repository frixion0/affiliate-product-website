'use client';

import { motion } from 'framer-motion';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-bold mb-2">DealsHub</h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Your go-to destination for the best curated deals across all categories.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/90">
              Browse
            </h4>
            <ul className="space-y-2.5">
              {['All Deals', 'Trending', 'New Arrivals', 'Best Sellers'].map((link) => (
                <li key={link}>
                  <button
                    onClick={() => {
                      const el = document.getElementById('deals');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/90">
              Categories
            </h4>
            <ul className="space-y-2.5">
              {['Electronics', 'Fashion', 'Home & Garden', 'Sports'].map((link) => (
                <li key={link}>
                  <button
                    onClick={() => {
                      const el = document.getElementById('categories');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/90">
              Company
            </h4>
            <ul className="space-y-2.5">
              {['About Us', 'Privacy Policy', 'Terms of Service', 'Contact'].map((link) => (
                <li key={link}>
                  <span className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors cursor-pointer">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <motion.div
          className="border-t border-primary-foreground/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm text-primary-foreground/60">
            &copy; {new Date().getFullYear()} DealsHub. All rights reserved.
          </p>
          <p className="text-xs text-primary-foreground/40">
            Prices are indicative and may vary at the time of purchase.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
