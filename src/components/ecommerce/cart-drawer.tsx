'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Gift,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, CartItem } from '@/store/cart-store';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart, totalPrice, totalSavings } =
    useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-[90] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" />
                <h2 className="text-lg font-bold">Your Cart</h2>
                <span className="text-sm text-muted-foreground">({items.length})</span>
              </div>
              <button
                onClick={closeCart}
                className="w-9 h-9 rounded-full hover:bg-surface flex items-center justify-center transition-colors"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Free shipping progress */}
            {totalPrice() < 150 && items.length > 0 && (
              <div className="px-6 py-3 bg-gold/5 border-b border-gold/10">
                <p className="text-xs font-medium text-center">
                  Add <span className="font-bold text-gold-foreground">${(150 - totalPrice()).toFixed(2)}</span> more
                  for free shipping!
                </p>
                <div className="mt-2 h-1.5 bg-gold/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (totalPrice() / 150) * 100)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gold rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">Your cart is empty</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Discover something you love
                  </p>
                  <Button onClick={closeCart} variant="outline" className="rounded-xl">
                    Continue Shopping
                  </Button>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <CartLineItem
                      key={item.id}
                      item={item}
                      onUpdate={(qty) => updateQuantity(item.id, qty)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border/50 p-6 space-y-4">
                {totalSavings() > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-success font-medium flex items-center gap-1.5">
                      <Gift className="w-4 h-4" />
                      You save
                    </span>
                    <span className="text-success font-bold">
                      ${totalSavings().toFixed(2)}
                    </span>
                  </motion.div>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">Total</span>
                  <span className="text-2xl font-bold">${totalPrice().toFixed(2)}</span>
                </div>
                <Button
                  className="w-full h-12 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    toast.success('Order placed successfully!');
                    clearCart();
                  }}
                >
                  Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <button
                  onClick={closeCart}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CartLineItem({
  item,
  onUpdate,
  onRemove,
}: {
  item: CartItem;
  onUpdate: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-4 p-3 rounded-xl bg-surface/50"
    >
      <div className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold line-clamp-1">{item.name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-sm">${item.price.toFixed(2)}</span>
          {item.comparePrice && (
            <span className="text-xs text-muted-foreground line-through">
              ${item.comparePrice.toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => onUpdate(item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors text-xs"
              aria-label="Decrease"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-xs font-semibold">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdate(item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors text-xs"
              aria-label="Increase"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={onRemove}
            className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
