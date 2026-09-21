import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Check, ShieldCheck, Truck, RefreshCw, MessageCircle, Ruler, Sparkles } from 'lucide-react';
import { Product, StoreSettings } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../common/Toast';

interface ProductDetailModalProps {
  product: Product | null;
  settings: StoreSettings;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  settings,
  onClose,
}) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    const firstAvailable = product.sizes.find((s) => (product.stockPerSize[s] ?? 0) > 0);
    return firstAvailable || product.sizes[0] || 'M';
  });
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'sizing' | 'shipping'>('details');

  const currentStock = product.stockPerSize[selectedSize] ?? 0;
  const isSizeSoldOut = currentStock <= 0;
  const isEntirelySoldOut = Object.values(product.stockPerSize).every((q) => q <= 0);

  const handleAddToCart = () => {
    if (isSizeSoldOut) {
      showToast(`La talla ${selectedSize} se encuentra agotada`, 'error');
      return;
    }
    const success = addToCart(product, selectedSize, quantity);
    if (success) {
      showToast(`¡${quantity}x ${product.name} (Talla ${selectedSize}) agregado al carrito!`, 'success');
      onClose();
    } else {
      showToast('No hay suficiente inventario disponible', 'error');
    }
  };

  const discountPercent =
    product.discount ||
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null);

  // WhatsApp pre-filled consultation link
  const waNumber = settings.whatsapp.replace(/\D/g, '');
  const waMessage = encodeURIComponent(
    `Hola ALEX.STOREPTY! Estoy interesado en el "${product.name}" (Talla: ${selectedSize}) que vi en su tienda online. ¿Tienen disponibilidad inmediata para coordinar mi pedido?`
  );
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-black/80">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#111116] rounded-3xl border border-neutral-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden my-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
            {/* Left: Gallery Column (5 cols) */}
            <div className="md:col-span-6 p-6 bg-[#0c0c10] flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-800">
              {/* Main Display Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 mb-4 group">
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {discountPercent && discountPercent > 0 && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs font-black px-3 py-1 rounded-md shadow-lg">
                    -{discountPercent}% DESCUENTO
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIndex === idx
                          ? 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                          : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Vista" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Guarantees Box */}
              <div className="mt-4 p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 text-xs text-neutral-300 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#ECC86A]" />
                  <span className="font-semibold text-white">Garantía oficial ALEX.STOREPTY</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <Truck className="w-4 h-4 text-neutral-400" />
                  <span>Envíos a domicilio en Panamá y encomiendas al Interior</span>
                </div>
              </div>
            </div>

            {/* Right: Info & Controls Column (7 cols) */}
            <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-[#111116]">
              <div>
                {/* Category & Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#ECC86A]">
                    {product.category}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      isEntirelySoldOut
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {isEntirelySoldOut ? 'Agotado' : product.details.availability}
                  </span>
                </div>

                {/* Title */}
                <h1 className="font-['Cinzel'] text-xl sm:text-2xl font-black text-white mb-3 leading-snug">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mb-5 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <span className="font-['Cinzel'] text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-500">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-base text-neutral-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  {discountPercent && discountPercent > 0 && (
                    <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/30">
                      Ahorras ${(product.originalPrice! - product.price).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Size Selector */}
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className="text-neutral-300">Selecciona tu talla:</span>
                    <span className={isSizeSoldOut ? 'text-red-400 font-bold' : 'text-[#ECC86A]'}>
                      {isSizeSoldOut ? 'AGOTADO' : `${currentStock} unidades disponibles`}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {product.sizes.map((size) => {
                      const stock = product.stockPerSize[size] ?? 0;
                      const isSold = stock <= 0;
                      const isSelected = selectedSize === size;

                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setSelectedSize(size);
                            setQuantity(1);
                          }}
                          disabled={isSold}
                          className={`py-2.5 rounded-xl text-xs font-extrabold transition-all border flex flex-col items-center justify-center ${
                            isSold
                              ? 'bg-neutral-900/60 border-neutral-800 text-neutral-600 line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-gradient-to-r from-amber-300 to-[#D4AF37] text-black border-[#FFF2A1] shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:border-neutral-600'
                          }`}
                        >
                          <span>{size}</span>
                          <span className="text-[9px] font-normal opacity-75">
                            {isSold ? '0' : `${stock}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-300">Cantidad:</span>
                    <div className="flex items-center rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1 || isSizeSoldOut}
                        className="px-3 py-1.5 text-neutral-400 hover:text-white disabled:opacity-30 text-base font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 text-sm font-bold text-white min-w-[2.5rem] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                        disabled={quantity >= currentStock || isSizeSoldOut}
                        className="px-3 py-1.5 text-neutral-400 hover:text-white disabled:opacity-30 text-base font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal preview */}
                  <div className="text-right">
                    <span className="text-[11px] text-neutral-400 block">Subtotal</span>
                    <span className="text-lg font-bold text-white font-['Cinzel']">
                      ${(product.price * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Add to cart & WhatsApp Direct */}
                <div className="flex flex-col gap-2.5 mb-6">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isEntirelySoldOut || isSizeSoldOut}
                    className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                      isEntirelySoldOut || isSizeSoldOut
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50'
                        : 'gold-gradient-btn'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>{isSizeSoldOut ? 'Talla Agotada' : 'Agregar al Carrito'}</span>
                  </button>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Pedir / Consultar por WhatsApp</span>
                  </a>
                </div>

                {/* Tabs: Specifications & Details */}
                <div className="border-t border-neutral-800 pt-4">
                  <div className="flex border-b border-neutral-800 mb-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('details')}
                      className={`pb-2 px-3 text-xs font-bold transition-colors border-b-2 ${
                        activeTab === 'details'
                          ? 'border-[#D4AF37] text-[#ECC86A]'
                          : 'border-transparent text-neutral-400 hover:text-white'
                      }`}
                    >
                      Información del Producto
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('sizing')}
                      className={`pb-2 px-3 text-xs font-bold transition-colors border-b-2 ${
                        activeTab === 'sizing'
                          ? 'border-[#D4AF37] text-[#ECC86A]'
                          : 'border-transparent text-neutral-400 hover:text-white'
                      }`}
                    >
                      Guía de Tallas
                    </button>
                  </div>

                  {activeTab === 'details' && (
                    <div className="text-xs text-neutral-300 space-y-2 leading-relaxed">
                      <p className="text-neutral-400">{product.description}</p>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/60">
                        <div>
                          <strong className="text-white block">Material:</strong>
                          <span className="text-neutral-400">{product.details.material}</span>
                        </div>
                        <div>
                          <strong className="text-white block">Tipo:</strong>
                          <span className="text-neutral-400">{product.details.type}</span>
                        </div>
                        <div>
                          <strong className="text-white block">Tallas:</strong>
                          <span className="text-neutral-400">{product.sizes.join(', ')}</span>
                        </div>
                        <div>
                          <strong className="text-white block">SKU / Referencia:</strong>
                          <span className="text-neutral-400">{product.sku || 'ALX-SPORT'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'sizing' && (
                    <div className="text-xs text-neutral-300">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] border border-neutral-800 rounded-lg">
                          <thead className="bg-neutral-900 text-neutral-400">
                            <tr>
                              <th className="p-2">Talla</th>
                              <th className="p-2">Pecho (cm)</th>
                              <th className="p-2">Largo (cm)</th>
                              <th className="p-2">Estatura rec.</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800">
                            <tr><td className="p-2 font-bold text-white">S</td><td className="p-2">96 - 100</td><td className="p-2">70</td><td className="p-2">165 - 172 cm</td></tr>
                            <tr><td className="p-2 font-bold text-white">M</td><td className="p-2">100 - 104</td><td className="p-2">72</td><td className="p-2">170 - 178 cm</td></tr>
                            <tr><td className="p-2 font-bold text-white">L</td><td className="p-2">104 - 108</td><td className="p-2">74</td><td className="p-2">176 - 184 cm</td></tr>
                            <tr><td className="p-2 font-bold text-white">XL</td><td className="p-2">108 - 114</td><td className="p-2">77</td><td className="p-2">182 - 190 cm</td></tr>
                            <tr><td className="p-2 font-bold text-white">XXL</td><td className="p-2">114 - 120</td><td className="p-2">80</td><td className="p-2">188 - 198 cm</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-2">
                        * Medidas aproximadas estándar para corte deportivo.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
