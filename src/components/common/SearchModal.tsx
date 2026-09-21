import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { Product } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  products,
  onClose,
  onSelectProduct,
}) => {
  const [term, setTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = term.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(term.toLowerCase()) ||
          p.category.toLowerCase().includes(term.toLowerCase()) ||
          p.description.toLowerCase().includes(term.toLowerCase())
      )
    : [];

  const popularSearches = ['Real Madrid', 'Barcelona', 'Messi', 'Argentina', 'Retro', 'Zidane', 'Shorts', 'Conjunto'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md pt-20">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          className="relative w-full max-w-2xl bg-[#111116] rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden"
        >
          {/* Top Search Field */}
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center gap-3 bg-[#16161f]">
            <Search className="w-5 h-5 text-[#ECC86A]" />
            <input
              ref={inputRef}
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar por equipo, jugador, club o categoría..."
              className="w-full bg-transparent text-base text-white placeholder-neutral-500 focus:outline-none"
            />
            {term && (
              <button
                onClick={() => setTerm('')}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white"
            >
              ESC
            </button>
          </div>

          {/* Body */}
          <div className="p-5 max-h-[60vh] overflow-y-auto">
            {term.trim() ? (
              results.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-2">
                    Resultados encontrados ({results.length})
                  </p>
                  {results.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-[#D4AF37]/50 flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-neutral-850"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-14 object-cover rounded-xl bg-neutral-800 border border-neutral-700/50"
                        />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#ECC86A]">
                            {product.category}
                          </span>
                          <h4 className="text-sm font-bold text-white line-clamp-1">
                            {product.name}
                          </h4>
                          <span className="text-xs font-['Cinzel'] font-black text-white">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-neutral-400 text-sm">
                    No encontramos ningún producto para "{term}".
                  </p>
                </div>
              )
            ) : (
              <div>
                <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-3">
                  Búsquedas populares
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => setTerm(s)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#D4AF37]/40 text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Tag className="w-3 h-3 text-[#ECC86A]" />
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
