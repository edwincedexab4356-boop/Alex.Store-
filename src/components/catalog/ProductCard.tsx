import React, { useState } from 'react';
import { ShoppingBag, Eye, Check, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../common/Toast';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // Find first available size by default
  const availableSize = product.sizes.find(
    (size) => (product.stockPerSize[size] ?? 0) > 0
  ) || product.sizes[0] || 'M';

  const [selectedSize, setSelectedSize] = useState<string>(availableSize);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const isSoldOut = Object.values(product.stockPerSize).every((qty) => qty <= 0);
  const currentSizeStock = product.stockPerSize[selectedSize] ?? 0;
  const isSelectedSizeSoldOut = currentSizeStock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isSoldOut || isSelectedSizeSoldOut) {
      showToast(`La talla ${selectedSize} se encuentra agotada.`, 'error');
      return;
    }

    const success = addToCart(product, selectedSize, 1);
    if (success) {
      showToast(`¡${product.name} (Talla ${selectedSize}) agregado al carrito!`, 'success');
    } else {
      showToast('No hay suficiente inventario disponible para esta talla.', 'error');
    }
  };

  const discountPercent =
    product.discount ||
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null);

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative flex flex-col bg-[#121217] rounded-2xl overflow-hidden border border-neutral-800/80 hover:border-[#D4AF37]/60 transition-all duration-300 hover:shadow-[0_10px_30px_-5px_rgba(212,175,55,0.15)] cursor-pointer"
    >
      {/* Top Image Container */}
      <div className="relative aspect-[4/5] bg-neutral-900/90 overflow-hidden">
        {/* Placeholder skeleton while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
        )}

        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Dark Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-transparent to-black/30 pointer-events-none" />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent && discountPercent > 0 && (
            <span className="px-2.5 py-1 rounded-md bg-gradient-to-r from-red-600 to-amber-600 text-white font-['Montserrat'] font-extrabold text-[11px] shadow-lg tracking-wider">
              -{discountPercent}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2.5 py-1 rounded-md bg-black/80 border border-[#D4AF37]/60 text-[#ECC86A] font-semibold text-[10px] uppercase tracking-wider backdrop-blur-md">
              Destacado
            </span>
          )}
        </div>

        {/* Availability Badge */}
        <div className="absolute top-3 right-3 z-10">
          {isSoldOut ? (
            <span className="px-2 py-1 rounded-md bg-neutral-900/90 border border-red-500/50 text-red-400 font-bold text-[10px] uppercase tracking-wider">
              Agotado
            </span>
          ) : (
            <span className="px-2 py-1 rounded-md bg-neutral-900/80 border border-emerald-500/40 text-emerald-400 font-semibold text-[10px] tracking-wider">
              {product.details.availability || 'Disponible'}
            </span>
          )}
        </div>

        {/* Quick View Button on Image Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="px-4 py-2 rounded-xl bg-black/80 border border-[#D4AF37] text-white text-xs font-semibold flex items-center gap-2 backdrop-blur-md shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-4 h-4 text-[#ECC86A]" />
            Ver detalles
          </span>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-3">
        <div>
          {/* Category Tag */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-[#ECC86A] uppercase tracking-wider font-['Montserrat']">
              {product.category}
            </span>
            <span className="text-[10px] text-neutral-400">
              {product.details.type}
            </span>
          </div>

          {/* Product Name */}
          <h2 className="font-['Montserrat'] font-bold text-base text-white line-clamp-2 leading-snug group-hover:text-[#ECC86A] transition-colors">
            {product.name}
          </h2>
        </div>

        {/* Sizes Pill Selector */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
            <span>Tallas disponibles:</span>
            {isSelectedSizeSoldOut ? (
              <span className="text-red-400 font-medium">Agotada</span>
            ) : (
              <span className="text-neutral-300">
                {currentSizeStock <= 3 ? `Últimas ${currentSizeStock} unid.` : `${currentSizeStock} en stock`}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.map((size) => {
              const stock = product.stockPerSize[size] ?? 0;
              const isSelected = selectedSize === size;
              const sizeEmpty = stock <= 0;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  disabled={sizeEmpty}
                  className={`min-w-[32px] h-7 px-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center ${
                    sizeEmpty
                      ? 'bg-neutral-900/60 text-neutral-600 line-through cursor-not-allowed border border-neutral-800'
                      : isSelected
                      ? 'bg-gradient-to-r from-amber-300 to-[#D4AF37] text-black font-extrabold shadow-[0_0_8px_rgba(212,175,55,0.4)]'
                      : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700/60'
                  }`}
                  title={sizeEmpty ? `${size}: Agotado` : `${size}: ${stock} disponibles`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Row and Actions */}
        <div className="pt-3 border-t border-neutral-800/80 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-['Cinzel'] text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-500">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs sm:text-sm text-neutral-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {discountPercent && discountPercent > 0 && (
              <span className="text-[11px] font-bold text-amber-400">
                Ahorras ${(product.originalPrice! - product.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isSoldOut || isSelectedSizeSoldOut}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                isSoldOut || isSelectedSizeSoldOut
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/40'
                  : 'gold-gradient-btn'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isSoldOut || isSelectedSizeSoldOut ? 'Agotado' : 'Al Carrito'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product);
              }}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/60 hover:border-neutral-500 transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-[#ECC86A]" />
              <span>Detalles</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
