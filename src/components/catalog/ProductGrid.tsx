import React, { useState, useMemo } from 'react';
import { Product, Category } from '../../types';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, Sparkles, Filter, X } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [onlyOffers, setOnlyOffers] = useState(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (!product.isActive) return false;

        // Category filter
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'ofertas') {
            if (!product.isOffer && !(product.discount && product.discount > 0)) return false;
          } else if (product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        // Only offers toggle
        if (onlyOffers && !product.isOffer && !(product.discount && product.discount > 0)) {
          return false;
        }

        // Search filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = product.name.toLowerCase().includes(term);
          const matchCat = product.category.toLowerCase().includes(term);
          const matchDesc = product.description.toLowerCase().includes(term);
          const matchSku = product.sku?.toLowerCase().includes(term);
          if (!matchName && !matchCat && !matchDesc && !matchSku) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'discount') {
          const discA = a.discount || 0;
          const discB = b.discount || 0;
          return discB - discA;
        }
        // Default: featured first, then newest
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
  }, [products, selectedCategory, onlyOffers, searchTerm, sortBy]);

  return (
    <section id="catalogo-seccion" className="py-16 bg-[#08080a] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900 border border-[#D4AF37]/30 text-[#ECC86A] text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            Colección Oficial
          </div>

          <h2 className="font-['Cinzel'] text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
            NUESTROS{' '}
            <span className="gold-gradient-text">PRODUCTOS</span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base max-w-xl">
            Explora las mejores camisetas de fútbol de la temporada, ediciones conmemorativas, retro y conjuntos deportivos.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col gap-4 mb-8 bg-[#101016] p-4 rounded-2xl border border-neutral-800">
          {/* Top row: search & sorting */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar jersey, equipo, jugador o accesorio..."
                className="w-full bg-[#181822] text-sm text-white placeholder-neutral-500 pl-10 pr-10 py-2.5 rounded-xl border border-neutral-700/60 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort & Offer Toggle */}
            <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-start">
              {/* Offers filter toggle pill */}
              <button
                type="button"
                onClick={() => setOnlyOffers(!onlyOffers)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  onlyOffers
                    ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]'
                    : 'bg-[#181822] text-neutral-300 border border-neutral-700 hover:border-neutral-500'
                }`}
              >
                <span>🔥 Solo Ofertas</span>
              </button>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-[#181822] border border-neutral-700/60 rounded-xl px-3 py-1.5">
                <SlidersHorizontal className="w-4 h-4 text-[#ECC86A]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs text-neutral-200 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="featured" className="bg-neutral-900 text-white">Destacados</option>
                  <option value="price-asc" className="bg-neutral-900 text-white">Precio: Menor a Mayor</option>
                  <option value="price-desc" className="bg-neutral-900 text-white">Precio: Mayor a Menor</option>
                  <option value="discount" className="bg-neutral-900 text-white">Mayor Descuento</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Chips Scroller */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-amber-300 via-[#D4AF37] to-amber-500 text-black shadow-md'
                  : 'bg-[#181822] text-neutral-300 hover:bg-neutral-700/60 hover:text-white border border-neutral-800'
              }`}
            >
              Todos ({products.filter((p) => p.isActive).length})
            </button>

            {categories.map((cat) => {
              const count = products.filter(
                (p) => p.isActive && p.category.toLowerCase() === cat.name.toLowerCase()
              ).length;
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
                                (cat.slug === 'ofertas' && selectedCategory === 'ofertas');

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug === 'ofertas' ? 'ofertas' : cat.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-300 via-[#D4AF37] to-amber-500 text-black shadow-md'
                      : 'bg-[#181822] text-neutral-300 hover:bg-neutral-700/60 hover:text-white border border-neutral-800'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                    {cat.slug === 'ofertas'
                      ? products.filter((p) => p.isActive && (p.isOffer || (p.discount && p.discount > 0))).length
                      : count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-6 px-1">
          <span>
            Mostrando <strong className="text-white font-semibold">{filteredProducts.length}</strong> de {products.length} productos
          </span>
          {(searchTerm || selectedCategory !== 'all' || onlyOffers) && (
            <button
              onClick={() => {
                setSearchTerm('');
                onSelectCategory('all');
                setOnlyOffers(false);
              }}
              className="text-[#ECC86A] hover:underline flex items-center gap-1 font-medium"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Grid of Product Cards */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center bg-[#111117] rounded-2xl border border-neutral-800 p-8">
            <Filter className="w-12 h-12 text-neutral-600 mb-4" />
            <h3 className="font-['Cinzel'] text-xl font-bold text-white mb-2">
              No se encontraron productos
            </h3>
            <p className="text-neutral-400 text-sm max-w-md mb-6">
              No encontramos jerseys con los filtros seleccionados. Prueba buscando con otros términos o seleccionando otra categoría.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                onSelectCategory('all');
                setOnlyOffers(false);
              }}
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider"
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
