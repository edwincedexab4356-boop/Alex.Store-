import React, { useState } from 'react';
import { Product } from '../../types';
import { inventoryService } from '../../services/inventoryService';
import { productsService } from '../../services/productsService';
import { useToast } from '../common/Toast';
import {
  Package,
  AlertTriangle,
  XCircle,
  Search,
  Plus,
  Minus,
  Check,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

interface AdminInventoryTabProps {
  products: Product[];
}

export const AdminInventoryTab: React.FC<AdminInventoryTabProps> = ({ products }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleAdjustStock = async (productId: string, size: string, delta: number) => {
    try {
      setUpdatingId(productId);
      await inventoryService.adjustStock(productId, size, delta);
      showToast(`Stock actualizado para talla ${size} en Firestore`, 'success');
    } catch (err: any) {
      showToast(`Error al actualizar stock: ${err.message || 'Error'}`, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSetDirectStock = async (productId: string, size: string, value: number) => {
    if (isNaN(value) || value < 0) return;
    try {
      setUpdatingId(productId);
      await inventoryService.updateSizeStock(productId, size, value);
      showToast(`Stock de talla ${size} fijado a ${value} en Firestore`, 'success');
    } catch (err: any) {
      showToast(`Error al actualizar stock: ${err.message || 'Error'}`, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeactivateOutOfStock = async (productId: string, productName: string) => {
    if (!window.confirm(`¿Desactivar y marcar como agotado el producto "${productName}" en Firestore?`)) return;
    try {
      setUpdatingId(productId);
      await inventoryService.markOutOfStock(productId);
      showToast(`Producto "${productName}" desactivado por falta de stock`, 'info');
    } catch (err: any) {
      showToast(`Error al desactivar producto: ${err.message || 'Error'}`, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReactivateProduct = async (productId: string, productName: string) => {
    try {
      setUpdatingId(productId);
      await inventoryService.reactivate(productId);
      showToast(`Producto "${productName}" reactivado con stock en Firestore`, 'success');
    } catch (err: any) {
      showToast(`Error al reactivar producto: ${err.message || 'Error'}`, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearAllStock = async () => {
    if (products.length === 0) {
      showToast('No hay productos en inventario', 'info');
      return;
    }
    if (!window.confirm('¿ATENCIÓN: Deseas poner a 0 el stock de TODOS los productos del inventario en Firestore?')) return;
    if (!window.confirm('Confirma de nuevo: Todos los artículos quedarán marcados como "Agotado".')) return;
    try {
      await inventoryService.clearAllStock();
      showToast('Todo el inventario ha sido vaciado a 0 unidades en Firestore', 'info');
    } catch (err: any) {
      showToast(`Error al vaciar inventario: ${err.message || 'Error'}`, 'error');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      if (!p.name.toLowerCase().includes(term) && !p.category.toLowerCase().includes(term)) {
        return false;
      }
    }

    const sizesStock = Object.values(p.stockPerSize || {});
    const totalUnits = sizesStock.reduce((acc, q) => acc + q, 0);

    if (stockFilter === 'out') {
      return totalUnits === 0;
    }
    if (stockFilter === 'low') {
      return totalUnits <= 5 || sizesStock.some((qty) => qty > 0 && qty <= 2);
    }
    return true;
  });

  const totalCatalogUnits = products.reduce((sum, p) => {
    return sum + Object.values(p.stockPerSize || {}).reduce((acc, q) => acc + q, 0);
  }, 0);

  const outOfStockCount = products.filter((p) => {
    const total = Object.values(p.stockPerSize || {}).reduce((acc, q) => acc + q, 0);
    return total === 0;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Cinzel'] text-2xl font-black text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-[#D4AF37]" />
            <span>CONTROL DE INVENTARIO</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Administra las unidades en tiempo real por cada talla (S, M, L, XL, XXL) con sincronización directa en Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {products.length > 0 && (
            <button
              onClick={handleClearAllStock}
              className="px-3.5 py-2.5 rounded-xl border border-red-900/60 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar Todo el Stock</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121217] p-5 rounded-2xl border border-neutral-800">
          <span className="text-xs text-neutral-400 font-semibold">Total Unidades en Almacén</span>
          <p className="text-2xl font-black text-white mt-1 font-mono">{totalCatalogUnits} unid.</p>
          <span className="text-[11px] text-neutral-500">Distribuidas en {products.length} modelos</span>
        </div>

        <div className="bg-[#121217] p-5 rounded-2xl border border-neutral-800">
          <span className="text-xs text-amber-400 font-semibold">Modelos con Poco Stock (&le;5)</span>
          <p className="text-2xl font-black text-amber-300 mt-1 font-mono">
            {products.filter((p) => {
              const total = Object.values(p.stockPerSize || {}).reduce((acc, q) => acc + q, 0);
              return total > 0 && total <= 5;
            }).length}
          </p>
          <span className="text-[11px] text-neutral-500">Requieren reabastecimiento pronto</span>
        </div>

        <div className="bg-[#121217] p-5 rounded-2xl border border-neutral-800">
          <span className="text-xs text-red-400 font-semibold">Modelos Agotados</span>
          <p className="text-2xl font-black text-red-400 mt-1 font-mono">{outOfStockCount}</p>
          <span className="text-[11px] text-neutral-500">Inactivos o sin existencias</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o categoría de jersey..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121217] text-xs text-white pl-10 pr-4 py-3 rounded-2xl border border-neutral-800 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#121217] p-1.5 rounded-2xl border border-neutral-800 text-xs">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              stockFilter === 'all' ? 'bg-[#D4AF37] text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Todos ({products.length})
          </button>
          <button
            onClick={() => setStockFilter('low')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              stockFilter === 'low' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Poco Stock
          </button>
          <button
            onClick={() => setStockFilter('out')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              stockFilter === 'out' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Agotados ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Products Stock Inventory List */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="bg-[#121217] rounded-3xl border border-neutral-800 p-12 text-center text-neutral-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#D4AF37]" />
            <p className="text-sm font-semibold">No se encontraron productos en el inventario</p>
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const sizesStock = prod.stockPerSize || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
            const totalStock = Object.values(sizesStock).reduce((acc, q) => acc + q, 0);
            const isOut = totalStock === 0;
            const isUpdating = updatingId === prod.id;

            return (
              <div
                key={prod.id}
                className={`bg-[#121217] rounded-2xl border p-5 transition-all space-y-4 ${
                  isOut ? 'border-red-950/60 bg-red-950/5' : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.images?.[0] || prod.imageUrl}
                      alt={prod.name}
                      className="w-12 h-12 rounded-xl object-cover border border-neutral-800 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#ECC86A]">
                        {prod.category}
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{prod.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <span className="font-bold text-neutral-300 font-mono">${prod.price}</span>
                        <span className="text-neutral-500">•</span>
                        <span
                          className={`font-semibold ${
                            isOut ? 'text-red-400' : totalStock <= 5 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {isOut ? 'Agotado (0 unidades)' : `${totalStock} unidades en total`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2">
                    {isOut ? (
                      <button
                        onClick={() => handleReactivateProduct(prod.id, prod.name)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                        <span>Reactivar Producto</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeactivateOutOfStock(prod.id, prod.name)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-xl border border-red-800/60 bg-red-950/30 hover:bg-red-950/60 text-red-300 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        title="Marcar como agotado y vaciar stock en Firestore"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Desactivar por Falta de Stock</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Sizes Stock Controls */}
                <div className="pt-3 border-t border-neutral-800/80">
                  <span className="block text-[11px] font-bold text-neutral-400 mb-2">
                    Modificar unidades por talla (guardado automático en Cloud Firestore):
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {['S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                      const qty = sizesStock[size] ?? 0;

                      return (
                        <div
                          key={size}
                          className="bg-[#181824] p-3 rounded-xl border border-neutral-800 flex flex-col items-center gap-2"
                        >
                          <span className="font-bold text-xs text-neutral-300">Talla {size}</span>

                          <div className="flex items-center gap-1 w-full justify-center">
                            <button
                              onClick={() => handleAdjustStock(prod.id, size, -1)}
                              disabled={qty <= 0 || isUpdating}
                              className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold flex items-center justify-center disabled:opacity-30"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <input
                              type="number"
                              min="0"
                              value={qty}
                              onChange={(e) =>
                                handleSetDirectStock(prod.id, size, parseInt(e.target.value) || 0)
                              }
                              disabled={isUpdating}
                              className="w-12 bg-neutral-900 text-white text-center font-bold text-xs py-1 rounded-md border border-neutral-700"
                            />

                            <button
                              onClick={() => handleAdjustStock(prod.id, size, 1)}
                              disabled={isUpdating}
                              className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold flex items-center justify-center disabled:opacity-30"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
