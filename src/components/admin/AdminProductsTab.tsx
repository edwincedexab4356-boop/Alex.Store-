import React, { useState } from 'react';
import { Product, Category } from '../../types';
import { productsService } from '../../services/productsService';
import { useToast } from '../common/Toast';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Search,
  Sparkles,
  Check,
  X,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface AdminProductsTabProps {
  products: Product[];
  categories: Category[];
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  products,
  categories,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [description, setDescription] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [material, setMaterial] = useState('100% Poliéster reciclado / Dri-FIT');
  const [type, setType] = useState('Versión Fan / Match');
  const [availability, setAvailability] = useState('Disponible');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isOffer, setIsOffer] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Stock per size
  const [stockS, setStockS] = useState(5);
  const [stockM, setStockM] = useState(8);
  const [stockL, setStockL] = useState(6);
  const [stockXL, setStockXL] = useState(4);
  const [stockXXL, setStockXXL] = useState(2);

  // Confirmation Modal for single delete
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory(categories[0]?.name || 'Jerseys de fútbol');
    setPrice('48.00');
    setOriginalPrice('65.00');
    setDiscount('26');
    setDescription(
      'Camiseta de fútbol oficial con tecnología transpirable de secado rápido, escudo bordado de alta fidelidad y detalles conmemorativos de temporada.'
    );
    setImagesText(
      'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1000&auto=format&fit=crop'
    );
    setMaterial('100% Poliéster técnico transpirable');
    setType('Versión Fan');
    setAvailability('Disponible');
    setIsFeatured(false);
    setIsOffer(false);
    setIsActive(true);
    setStockS(5);
    setStockM(8);
    setStockL(6);
    setStockXL(4);
    setStockXXL(2);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setPrice(prod.price.toString());
    setOriginalPrice(
      prod.originalPrice ? prod.originalPrice.toString() : prod.previousPrice ? prod.previousPrice.toString() : ''
    );
    setDiscount(prod.discount ? prod.discount.toString() : '');
    setDescription(prod.description);
    setImagesText(prod.images.join('\n'));
    setMaterial(prod.details?.material || '100% Poliéster técnico transpirable');
    setType(prod.details?.type || 'Versión Fan');
    setAvailability(prod.details?.availability || 'Disponible');
    setIsFeatured(Boolean(prod.isFeatured ?? prod.featured));
    setIsOffer(Boolean(prod.isOffer));
    setIsActive(prod.isActive ?? prod.available ?? true);

    setStockS(prod.stockPerSize?.['S'] ?? 0);
    setStockM(prod.stockPerSize?.['M'] ?? 0);
    setStockL(prod.stockPerSize?.['L'] ?? 0);
    setStockXL(prod.stockPerSize?.['XL'] ?? 0);
    setStockXXL(prod.stockPerSize?.['XXL'] ?? 0);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Ingresa el nombre del producto', 'error');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showToast('Ingresa un precio válido mayor a 0', 'error');
      return;
    }

    const images = imagesText
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (images.length === 0) {
      images.push(
        'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1000&auto=format&fit=crop'
      );
    }

    const stockPerSize: Record<string, number> = {
      S: Math.max(0, Number(stockS) || 0),
      M: Math.max(0, Number(stockM) || 0),
      L: Math.max(0, Number(stockL) || 0),
      XL: Math.max(0, Number(stockXL) || 0),
      XXL: Math.max(0, Number(stockXXL) || 0),
    };

    const totalStock = Object.values(stockPerSize).reduce((a, b) => a + b, 0);
    const parsedOrig = originalPrice ? parseFloat(originalPrice) : undefined;
    const parsedDisc = discount ? parseInt(discount) : undefined;

    setIsSaving(true);
    try {
      if (editingProduct) {
        // updateDoc(doc(db, "products", productId), updatedData)
        await productsService.update(editingProduct.id, {
          name: name.trim(),
          category,
          price: parsedPrice,
          originalPrice: parsedOrig,
          previousPrice: parsedOrig,
          discount: parsedDisc,
          description: description.trim(),
          images,
          details: {
            material,
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            type,
            availability: totalStock > 0 ? availability : 'Agotado',
          },
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          stockPerSize,
          stock: totalStock,
          isFeatured,
          featured: isFeatured,
          isOffer,
          isActive,
          available: isActive && totalStock > 0,
        });
        showToast(`Producto "${name}" actualizado con éxito en Firestore`, 'success');
      } else {
        // addDoc(collection(db, "products"), productData)
        await productsService.create({
          name: name.trim(),
          category,
          price: parsedPrice,
          originalPrice: parsedOrig,
          previousPrice: parsedOrig,
          discount: parsedDisc,
          description: description.trim(),
          images,
          details: {
            material,
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            type,
            availability: totalStock > 0 ? availability : 'Agotado',
          },
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          stockPerSize,
          stock: totalStock,
          isFeatured,
          featured: isFeatured,
          isOffer,
          isActive,
          available: isActive && totalStock > 0,
        });
        showToast(`Nuevo producto "${name}" guardado exitosamente en Firestore`, 'success');
      }

      // Only close modal after confirmed Firestore success
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving product in Firestore:', err);
      showToast(`Error al guardar en Firestore: ${err.message || 'Error de conexión'}`, 'error');
      // Do NOT close modal so user can correct and retry
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      // deleteDoc(doc(db, "products", productId))
      await productsService.delete(deletingProduct.id);
      showToast(`Producto "${deletingProduct.name}" eliminado de Firestore`, 'info');
      setDeletingProduct(null);
    } catch (err: any) {
      console.error('Error deleting product from Firestore:', err);
      showToast(`Error al eliminar producto: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllProducts = async () => {
    if (products.length === 0) {
      showToast('No hay productos para eliminar', 'info');
      return;
    }
    if (
      !window.confirm(
        `¿ATENCIÓN: Deseas eliminar permanentemente los ${products.length} productos de la base de datos Firestore?`
      )
    )
      return;
    if (
      !window.confirm(
        'Por favor confirma por segunda vez: el catálogo quedará completamente vacío en la tienda.'
      )
    )
      return;

    try {
      await productsService.deleteAll();
      showToast('Todos los productos han sido eliminados de Firestore', 'info');
    } catch (err: any) {
      showToast(`Error al eliminar productos: ${err.message || 'Error'}`, 'error');
    }
  };

  const handleToggleActive = async (prod: Product) => {
    const currentStatus = prod.isActive ?? prod.available ?? true;
    try {
      await productsService.toggleActive(prod.id, currentStatus);
      showToast(
        `Producto ${!currentStatus ? 'activado' : 'desactivado'} en tienda`,
        'success'
      );
    } catch (err: any) {
      showToast(`Error al cambiar estado: ${err.message || 'Error'}`, 'error');
    }
  };

  const handleToggleFeatured = async (prod: Product) => {
    const currentStatus = Boolean(prod.isFeatured ?? prod.featured);
    try {
      await productsService.toggleFeatured(prod.id, currentStatus);
      showToast(
        `Producto ${!currentStatus ? 'marcado como destacado' : 'retirado de destacados'}`,
        'success'
      );
    } catch (err: any) {
      showToast(`Error al actualizar destacado: ${err.message || 'Error'}`, 'error');
    }
  };

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = selectedCat === 'all' || p.category.toLowerCase() === selectedCat.toLowerCase();

    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Cinzel'] text-2xl font-black text-white flex items-center gap-2">
            <span>PRODUCTOS</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-sans font-bold">
              {products.length}
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Persistencia directa en Cloud Firestore. Creación, edición y eliminación sincronizada en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {products.length > 0 && (
            <button
              onClick={handleDeleteAllProducts}
              className="px-3.5 py-2.5 rounded-xl border border-red-900/60 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Todos</span>
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="gold-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Producto</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, equipo o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121217] text-xs text-white pl-10 pr-4 py-3 rounded-2xl border border-neutral-800 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="bg-[#121217] text-xs text-white px-4 py-3 rounded-2xl border border-neutral-800 focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#121217] rounded-3xl border border-neutral-800 p-12 text-center text-neutral-400">
          <p className="text-sm font-semibold">No se encontraron productos</p>
          <p className="text-xs text-neutral-500 mt-1">Prueba cambiando los filtros o crea un nuevo producto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((prod) => {
            const isActiveState = prod.isActive ?? prod.available ?? true;
            const isFeaturedState = Boolean(prod.isFeatured ?? prod.featured);
            const totalStock = Object.values(prod.stockPerSize || {}).reduce((a, b) => a + b, 0);

            return (
              <div
                key={prod.id}
                className={`bg-[#121217] rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                  isActiveState ? 'border-neutral-800 hover:border-neutral-700' : 'border-red-950/60 opacity-60'
                }`}
              >
                <div>
                  {/* Thumbnail & Badges */}
                  <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                    <img
                      src={prod.images?.[0] || prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {/* Overlay Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {isFeaturedState && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#D4AF37] text-black flex items-center gap-1 shadow">
                          <Star className="w-2.5 h-2.5 fill-black" />
                          <span>Destacado</span>
                        </span>
                      )}
                      {!isActiveState && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-600 text-white shadow">
                          Inactivo
                        </span>
                      )}
                      {totalStock <= 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-neutral-800 text-neutral-300 shadow">
                          Agotado
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button
                        onClick={() => handleToggleFeatured(prod)}
                        title={isFeaturedState ? 'Quitar de destacados' : 'Marcar como destacado'}
                        className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                          isFeaturedState ? 'bg-amber-400 text-black' : 'bg-black/60 text-white hover:text-amber-400'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(prod)}
                        title={isActiveState ? 'Desactivar producto' : 'Activar producto'}
                        className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                          isActiveState ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                        }`}
                      >
                        {isActiveState ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#ECC86A] tracking-wider">
                      {prod.category}
                    </span>
                    <h3 className="text-xs font-bold text-white line-clamp-1">{prod.name}</h3>

                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-black text-white">${Number(prod.price).toFixed(2)}</span>
                      {(prod.originalPrice || prod.previousPrice) && (
                        <span className="text-[11px] text-neutral-500 line-through">
                          ${Number(prod.originalPrice || prod.previousPrice).toFixed(2)}
                        </span>
                      )}
                      {prod.discount && prod.discount > 0 && (
                        <span className="text-[10px] font-bold text-red-400">-{prod.discount}%</span>
                      )}
                    </div>

                    {/* Stock Per Size Summary */}
                    <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400">Stock total:</span>
                      <span
                        className={`font-mono font-bold ${
                          totalStock === 0 ? 'text-red-400' : totalStock <= 5 ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {totalStock} unid.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-3 bg-[#0e0e13] border-t border-neutral-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openEditModal(prod)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3 h-3 text-[#ECC86A]" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => setDeletingProduct(prod)}
                    className="p-1.5 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear / Editar Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121217] rounded-3xl border border-neutral-800 max-w-2xl w-full p-6 my-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 sticky top-0 bg-[#121217] z-10">
              <h3 className="font-['Cinzel'] text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <span>{editingProduct ? 'EDITAR PRODUCTO' : 'CREAR PRODUCTO'}</span>
              </h3>
              <button
                onClick={() => !isSaving && setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Jersey Real Madrid Local 2024/25"
                  className="w-full bg-[#181824] text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Category & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Categoría *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#181824] text-white px-3 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Precio Regular ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="45.00"
                    className="w-full bg-[#181824] text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Promotional Price & Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Precio Anterior / Original ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="Opcional: 60.00"
                    className="w-full bg-[#181824] text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Descuento (%)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="Opcional: 25"
                    className="w-full bg-[#181824] text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Stock por Talla */}
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
                <label className="block font-bold text-white">Stock por Talla (Unidades disponibles)</label>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <span className="block text-center font-bold text-neutral-400 mb-1">S</span>
                    <input
                      type="number"
                      min="0"
                      value={stockS}
                      onChange={(e) => setStockS(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#181824] text-white text-center py-1.5 rounded-lg border border-neutral-700"
                    />
                  </div>
                  <div>
                    <span className="block text-center font-bold text-neutral-400 mb-1">M</span>
                    <input
                      type="number"
                      min="0"
                      value={stockM}
                      onChange={(e) => setStockM(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#181824] text-white text-center py-1.5 rounded-lg border border-neutral-700"
                    />
                  </div>
                  <div>
                    <span className="block text-center font-bold text-neutral-400 mb-1">L</span>
                    <input
                      type="number"
                      min="0"
                      value={stockL}
                      onChange={(e) => setStockL(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#181824] text-white text-center py-1.5 rounded-lg border border-neutral-700"
                    />
                  </div>
                  <div>
                    <span className="block text-center font-bold text-neutral-400 mb-1">XL</span>
                    <input
                      type="number"
                      min="0"
                      value={stockXL}
                      onChange={(e) => setStockXL(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#181824] text-white text-center py-1.5 rounded-lg border border-neutral-700"
                    />
                  </div>
                  <div>
                    <span className="block text-center font-bold text-neutral-400 mb-1">XXL</span>
                    <input
                      type="number"
                      min="0"
                      value={stockXXL}
                      onChange={(e) => setStockXXL(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#181824] text-white text-center py-1.5 rounded-lg border border-neutral-700"
                    />
                  </div>
                </div>
              </div>

              {/* Images Textarea */}
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  URLs de Imágenes (Una por línea)
                </label>
                <textarea
                  rows={3}
                  value={imagesText}
                  onChange={(e) => setImagesText(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#181824] text-white px-3.5 py-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37] font-mono text-[11px]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Descripción del Producto</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles sobre tela, ajuste, bordados..."
                  className="w-full bg-[#181824] text-white px-3.5 py-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Checkboxes: Active & Featured */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded bg-[#181824] border-neutral-700 text-[#D4AF37] focus:ring-0"
                  />
                  <span className="text-white font-medium">Producto Activo en Tienda</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded bg-[#181824] border-neutral-700 text-[#D4AF37] focus:ring-0"
                  />
                  <span className="text-white font-medium">Destacar en Inicio</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="gold-gradient-btn px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>Guardando en Firestore...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121217] rounded-3xl border border-neutral-800 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">¿Eliminar producto?</h3>
            </div>
            <p className="text-xs text-neutral-300">
              ¿Estás seguro de que quieres eliminar <strong className="text-white">{deletingProduct.name}</strong>?
            </p>
            <p className="text-[11px] text-neutral-500">
              Esta acción ejecutará <code className="text-red-400">deleteDoc(doc(db, "products", productId))</code> y
              lo borrará permanentemente de Cloud Firestore.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-xl border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
