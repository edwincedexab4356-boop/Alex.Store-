import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, ArrowRight, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { StoreSettings } from '../../types';

interface CartDrawerProps {
  settings: StoreSettings;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  settings,
  onProceedToCheckout,
}) => {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();

  const freeShippingThreshold = 80;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Slide-over panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-[#0e0e13] border-l border-neutral-800 shadow-2xl flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-neutral-800/80 bg-[#121217] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-neutral-900 border border-[#D4AF37]/30 text-[#ECC86A]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Cinzel'] text-lg font-black text-white">
                    TU CARRITO
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {totalItems} {totalItems === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            <div className="px-5 py-3 bg-[#16161f] border-b border-neutral-800/60">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-neutral-300">
                  {remainingForFreeShipping > 0 ? (
                    <>
                      Agrega <strong className="text-[#ECC86A]">${remainingForFreeShipping.toFixed(2)}</strong> más para <span className="text-white font-bold">ENVÍO GRATIS</span>
                    </>
                  ) : (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> ¡Calificas para Envío Gratis!
                    </span>
                  )}
                </span>
                <span className="text-neutral-400 font-bold text-[11px]">{Math.round(progressToFreeShipping)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-[#D4AF37] transition-all duration-300"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-neutral-800/60">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-['Cinzel'] text-lg font-bold text-white mb-2">
                    Tu carrito está vacío
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-xs mb-6">
                    Aún no has agregado jerseys ni ropa deportiva a tu bolsa de compra.
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider"
                  >
                    Explorar Colección
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const maxStock = item.product.stockPerSize[item.size] ?? 99;

                  return (
                    <div key={`${item.productId}-${item.size}`} className="pt-4 first:pt-0 flex gap-3.5 items-center">
                      {/* Thumbnail */}
                      <div className="w-20 h-24 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Data */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-white line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.productId, item.size)}
                            className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[#ECC86A] font-bold">
                            Talla: {item.size}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            ${item.unitPrice.toFixed(2)} c/u
                          </span>
                        </div>

                        {/* Quantity controls and price */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center rounded-lg bg-neutral-900 border border-neutral-800">
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                              className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white"
                            >
                              -
                            </button>
                            <span className="px-2 py-1 text-xs font-bold text-white min-w-[1.8rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                              disabled={item.quantity >= maxStock}
                              className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white disabled:opacity-30"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-['Cinzel'] font-black text-sm text-[#ECC86A]">
                            ${(item.unitPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer & Checkout Action */}
            {items.length > 0 && (
              <div className="p-5 bg-[#121217] border-t border-neutral-800/80 space-y-4">
                {/* Financial Summary */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Envío</span>
                    <span className="text-[#ECC86A]">
                      {subtotal >= freeShippingThreshold ? 'GRATIS' : 'Calculado en el checkout'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base font-black text-white pt-2 border-t border-neutral-800 font-['Cinzel']">
                    <span>TOTAL ESTIMADO</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-500 text-lg">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onProceedToCheckout();
                    }}
                    className="gold-gradient-btn w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl"
                  >
                    <span>FINALIZAR PEDIDO</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2.5 text-xs text-neutral-400 hover:text-white flex items-center justify-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Continuar comprando</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Compra 100% segura y verificada por ALEX.STOREPTY</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
