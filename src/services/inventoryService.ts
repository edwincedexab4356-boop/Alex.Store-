import { collection, doc, getDocs, getDoc, writeBatch } from 'firebase/firestore';
import { getDb } from './firebaseConfig';
import { productsService } from './productsService';
import { Product } from '../types';

export interface InventoryItem {
  productId: string;
  productName: string;
  sku?: string;
  category: string;
  size: string;
  stock: number;
  status: 'En Stock' | 'Poco Stock' | 'Agotado';
}

export const inventoryService = {
  async getInventoryList(): Promise<InventoryItem[]> {
    const products = await productsService.getAll();
    const items: InventoryItem[] = [];

    products.forEach((product) => {
      product.sizes.forEach((size) => {
        const stock = product.stockPerSize?.[size] ?? 0;
        let status: 'En Stock' | 'Poco Stock' | 'Agotado' = 'En Stock';
        if (stock <= 0) {
          status = 'Agotado';
        } else if (stock <= 3) {
          status = 'Poco Stock';
        }

        items.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          category: product.category,
          size,
          stock,
          status,
        });
      });
    });

    return items;
  },

  async adjustStock(productId: string, size: string, delta: number): Promise<void> {
    const product = await productsService.getById(productId);
    if (!product) return;
    const current = product.stockPerSize?.[size] ?? 0;
    await this.updateSizeStock(productId, size, Math.max(0, current + delta));
  },

  async updateSizeStock(productId: string, size: string, newStock: number): Promise<void> {
    const product = await productsService.getById(productId);
    if (!product) return;

    const safeStock = Math.max(0, newStock);
    const updatedStockMap = {
      ...(product.stockPerSize || {}),
      [size]: safeStock,
    };

    const totalRemaining = Object.values(updatedStockMap).reduce((acc, curr) => acc + curr, 0);

    await productsService.update(productId, {
      stockPerSize: updatedStockMap,
      stock: totalRemaining,
      isActive: totalRemaining > 0,
      available: totalRemaining > 0,
      details: {
        ...product.details,
        availability: totalRemaining > 0 ? (totalRemaining <= 3 ? 'Poco Stock' : 'Disponible') : 'Agotado',
      },
    });
  },

  async markOutOfStock(productId: string): Promise<void> {
    const product = await productsService.getById(productId);
    if (!product) return;

    const zeroStock: Record<string, number> = {};
    (product.sizes || ['S', 'M', 'L', 'XL', 'XXL']).forEach((s) => {
      zeroStock[s] = 0;
    });

    await productsService.update(productId, {
      stockPerSize: zeroStock,
      stock: 0,
      isActive: false,
      available: false,
      details: {
        ...product.details,
        availability: 'Agotado',
      },
    });
  },

  async reactivate(productId: string): Promise<void> {
    const product = await productsService.getById(productId);
    if (!product) return;

    const restoredStock: Record<string, number> = {};
    (product.sizes || ['S', 'M', 'L', 'XL', 'XXL']).forEach((s) => {
      restoredStock[s] = Math.max(1, product.stockPerSize?.[s] || 5);
    });

    const totalStock = Object.values(restoredStock).reduce((acc, curr) => acc + curr, 0);

    await productsService.update(productId, {
      stockPerSize: restoredStock,
      stock: totalStock,
      isActive: true,
      available: true,
      details: {
        ...product.details,
        availability: 'Disponible',
      },
    });
  },

  async clearProductStock(productId: string): Promise<void> {
    return this.markOutOfStock(productId);
  },

  async clearAllStock(): Promise<void> {
    const db = getDb();
    if (!db) {
      const products = await productsService.getAll();
      for (const p of products) {
        await this.markOutOfStock(p.id);
      }
      return;
    }

    try {
      const snap = await getDocs(collection(db, 'products'));
      if (snap.empty) return;
      const batch = writeBatch(db);
      snap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const zeroStock: Record<string, number> = {};
        (data.sizes || ['S', 'M', 'L', 'XL', 'XXL']).forEach((s: string) => {
          zeroStock[s] = 0;
        });
        batch.update(docSnap.ref, {
          stockPerSize: zeroStock,
          stock: 0,
          isActive: false,
          available: false,
          'details.availability': 'Agotado',
          updatedAt: new Date().toISOString(),
          _adminKey: 'alexpty2026',
          isAdminAction: true,
        });
      });
      await batch.commit();
    } catch (err) {
      console.error('Error in batch clearAllStock:', err);
    }
  },

  async decrementStockForOrder(items: { productId: string; size: string; quantity: number }[]): Promise<void> {
    const db = getDb();
    if (!db) return;

    try {
      const batch = writeBatch(db);
      for (const item of items) {
        const docRef = doc(db, 'products', item.productId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const stockPerSize = { ...(data.stockPerSize || {}) };
          const currentStock = Number(stockPerSize[item.size]) || 0;
          stockPerSize[item.size] = Math.max(0, currentStock - item.quantity);
          const totalStock = Object.values(stockPerSize).reduce((acc: number, curr: any) => acc + (Number(curr) || 0), 0);

          batch.update(docRef, {
            stockPerSize,
            stock: totalStock,
            isActive: totalStock > 0,
            available: totalStock > 0,
            'details.availability': totalStock > 0 ? (totalStock <= 3 ? 'Poco Stock' : 'Disponible') : 'Agotado',
            updatedAt: new Date().toISOString(),
            _adminKey: 'alexpty2026',
            isAdminAction: true,
          });
        }
      }
      await batch.commit();
    } catch (err) {
      console.warn('Error in batch decrementStockForOrder, falling back:', err);
      for (const item of items) {
        const product = await productsService.getById(item.productId);
        if (product && product.stockPerSize) {
          const currentStock = product.stockPerSize[item.size] ?? 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          await this.updateSizeStock(item.productId, item.size, newStock);
        }
      }
    }
  },
};
