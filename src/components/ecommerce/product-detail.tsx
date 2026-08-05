'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';
import { ProductCard, ProductData } from './product-card';

interface ProductDetailProps {
  slug: string | null;
  onClose: () => void;
  onSelectProduct: (slug: string) => void;
}

export function ProductDetail({ slug, onClose, onSelectProduct }: ProductDetailProps) {
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<ProductData[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setProduct(data.product);
        setRelated(data.related || []);
        setSelectedImage(0);
        setQuantity(1);
        setActiveTab('description');
      });
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = slug ? 'hidden' : '';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [slug, onClose]);

  if (!product) return null;

  const images = JSON.parse(product.images) as string[];
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        comparePrice: product.comparePrice,
        image: images[0],
        slug: product.slug,
      });
    }
    toast.success(`${quantity}x ${product.name} added to cart`);
    openCart();
  };

  return (
    <AnimatePresence>
      {slug && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[80]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-4 md:inset-8 lg:inset-12 bg-background rounded-3xl z-[90] overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-surface flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex-1 overflow-y-auto">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Image Gallery */}
                <div className="p-6 md:p-10">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface mb-4">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={selectedImage}
                        src={images[selectedImage]}
                        alt={product.name}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImage((i) => (i - 1 + images.length) % images.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSelectedImage((i) => (i + 1) % images.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                            selectedImage === i
                              ? 'border-gold shadow-lg'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt='' className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6 md:p-10 lg:border-l border-border/50">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {product.category && (
                      <p className="text-xs font-semibold text-gold-foreground uppercase tracking-widest mb-3">
                        {product.category.name}
                      </p>
                    )}
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">
                      {product.name}
                    </h2>

                    {/* Rating */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? 'text-gold fill-gold'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviewCount} reviews)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-6">
                      <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
                      {product.comparePrice && (
                        <>
                          <span className="text-lg text-muted-foreground line-through">
                            ${product.comparePrice.toFixed(2)}
                          </span>
                          <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-sm font-semibold rounded-lg">
                            Save {discount}%
                          </span>
                        </>
                      )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 bg-surface rounded-xl p-1">
                      <button
                        onClick={() => setActiveTab('description')}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                          activeTab === 'description'
                            ? 'bg-background shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Description
                      </button>
                      <button
                        onClick={() => setActiveTab('reviews')}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                          activeTab === 'reviews'
                            ? 'bg-background shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Reviews ({product.reviewCount})
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {activeTab === 'description' ? (
                        <motion.p
                          key="desc"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-muted-foreground leading-relaxed mb-8"
                        >
                          {product.description}
                        </motion.p>
                      ) : (
                        <motion.div
                          key="reviews"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2"
                        >
                          {product.reviews && product.reviews.length > 0 ? (
                            product.reviews.map((r: any) => (
                              <div
                                key={r.id}
                                className="pb-4 border-b border-border/50 last:border-0"
                              >
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-xs font-bold">
                                    {r.author.charAt(0)}
                                  </div>
                                  <span className="text-sm font-medium">{r.author}</span>
                                  <div className="flex ml-auto">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < r.rating
                                            ? 'text-gold fill-gold'
                                            : 'text-muted-foreground/30'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{r.comment}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-6">
                              No reviews yet. Be the first to review!
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Quantity + Add to Cart */}
                    <div className="flex gap-3 mb-6">
                      <div className="flex items-center border border-border rounded-xl overflow-hidden">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-11 h-12 flex items-center justify-center hover:bg-surface transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold text-sm">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="w-11 h-12 flex items-center justify-center hover:bg-surface transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <Button
                        onClick={handleAddToCart}
                        className="flex-1 h-12 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Add to Cart — ${(product.price * quantity).toFixed(2)}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-12 h-12 rounded-xl flex-shrink-0"
                        onClick={() => toast.success('Added to wishlist')}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Trust badges */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: Truck, label: 'Free Shipping' },
                        { icon: Shield, label: '2yr Warranty' },
                        { icon: RotateCcw, label: '30d Returns' },
                      ].map(({ icon: Icon, label }) => (
                        <div
                          key={label}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface"
                        >
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-[10px] font-medium text-muted-foreground text-center">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Related Products */}
              {related.length > 0 && (
                <div className="px-6 md:px-10 pb-10 pt-6 border-t border-border/50">
                  <h3 className="text-lg font-semibold mb-6">You May Also Like</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {related.map((p, i) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        index={i}
                        onSelect={onSelectProduct}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
