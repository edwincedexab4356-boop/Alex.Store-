import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebaseConfig';
import { INITIAL_PRODUCTS } from '../data/seedData';
import { Product } from '../types';

const COLLECTION_NAME = 'products';
const ADMIN_KEY = 'alexpty2026';

export const productsService = {
  /**
   * Fetch all products directly from Firestore
   * If database is completely empty on first launch, seeds initial products to Firestore
   */
  async getAll(): Promise<Product[]> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      return INITIAL_PRODUCTS;
    }

    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      if (!snap.empty) {
        const list: Product[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push(normalizeProduct(d.id, data));
        });
        return list;
      }

      // If completely empty on first boot, seed the initial catalog into Cloud Firestore in a single fast atomic batch
      const batch = writeBatch(db);
      const seededList: Product[] = [];
      for (const item of INITIAL_PRODUCTS) {
        const newDocRef = doc(collection(db, COLLECTION_NAME));
        const payload = prepareProductForFirestore(item);
        batch.set(newDocRef, payload);
        seededList.push({ ...item, id: newDocRef.id });
      }
      await batch.commit();
      return seededList;
    } catch (err) {
      console.error('Error fetching products from Firestore:', err);
      throw err;
    }
  },

  async getById(id: string): Promise<Product | null> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) return null;

    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, id));
      if (snap.exists()) {
        return normalizeProduct(snap.id, snap.data());
      }
      return null;
    } catch (err) {
      console.error(`Error fetching product ${id} from Firestore:`, err);
      return null;
    }
  },

  /**
   * Create product using addDoc with Firestore-generated ID
   */
  async create(productData: Partial<Product>): Promise<Product> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      throw new Error('Firebase Firestore no está disponible');
    }

    const payload = prepareProductForFirestore(productData);
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);

    return normalizeProduct(docRef.id, payload);
  },

  /**
   * Backward-compatible alias for create
   */
  async add(productData: Partial<Product>): Promise<Product> {
    return this.create(productData);
  },

  /**
   * Update product using updateDoc in Firestore
   */
  async update(id: string, updates: Partial<Product>): Promise<void> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      throw new Error('Firebase Firestore no está disponible');
    }

    const payload: Record<string, any> = {
      ...updates,
      _adminKey: ADMIN_KEY,
      isAdminAction: true,
      updatedAt: new Date().toISOString(),
    };

    // Keep fields synchronized
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.price !== undefined) payload.price = Number(updates.price);
    if (updates.originalPrice !== undefined) {
      payload.originalPrice = Number(updates.originalPrice);
      payload.previousPrice = Number(updates.originalPrice);
    }
    if (updates.previousPrice !== undefined) {
      payload.previousPrice = Number(updates.previousPrice);
      payload.originalPrice = Number(updates.previousPrice);
    }
    if (updates.discount !== undefined) payload.discount = Number(updates.discount);
    if (updates.category !== undefined) {
      payload.category = updates.category;
      payload.categoryName = updates.category;
    }
    if (updates.images !== undefined && updates.images.length > 0) {
      payload.imageUrl = updates.images[0];
    }
    if (updates.isFeatured !== undefined) {
      payload.isFeatured = Boolean(updates.isFeatured);
      payload.featured = Boolean(updates.isFeatured);
    }
    if (updates.featured !== undefined) {
      payload.featured = Boolean(updates.featured);
      payload.isFeatured = Boolean(updates.featured);
    }
    if (updates.isActive !== undefined) {
      payload.isActive = Boolean(updates.isActive);
      payload.available = Boolean(updates.isActive);
    }
    if (updates.available !== undefined) {
      payload.available = Boolean(updates.available);
      payload.isActive = Boolean(updates.available);
    }
    if (updates.stockPerSize !== undefined) {
      payload.stock = Object.values(updates.stockPerSize).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
    }

    await updateDoc(doc(db, COLLECTION_NAME, id), payload);
  },

  /**
   * Delete product using deleteDoc in Firestore
   */
  async delete(id: string): Promise<void> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      throw new Error('Firebase Firestore no está disponible');
    }

    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },

  /**
   * Delete all products from Firestore
   */
  async deleteAll(): Promise<void> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      throw new Error('Firebase Firestore no está disponible');
    }

    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  },

  /**
   * Toggle active/available status
   */
  async toggleActive(id: string, currentStatus: boolean): Promise<void> {
    await this.update(id, {
      isActive: !currentStatus,
      available: !currentStatus,
    });
  },

  /**
   * Toggle featured status
   */
  async toggleFeatured(id: string, currentStatus: boolean): Promise<void> {
    await this.update(id, {
      isFeatured: !currentStatus,
      featured: !currentStatus,
    });
  },

  /**
   * Real-time subscription to Firestore products collection
   */
  subscribe(callback: (products: Product[]) => void): () => void {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      callback(INITIAL_PRODUCTS);
      return () => {};
    }

    const unsub = onSnapshot(
      collection(db, COLLECTION_NAME),
      (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach((d) => {
          list.push(normalizeProduct(d.id, d.data()));
        });
        callback(list);
      },
      (err) => {
        console.error('Firestore products onSnapshot error:', err);
      }
    );

    return unsub;
  },
};

/**
 * Normalizes Firestore document data into strongly-typed Product object
 */
function normalizeProduct(id: string, data: any): Product {
  const images = Array.isArray(data.images) && data.images.length > 0
    ? data.images
    : data.imageUrl
    ? [data.imageUrl]
    : ['https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1000&auto=format&fit=crop'];

  const sizes = Array.isArray(data.sizes) && data.sizes.length > 0
    ? data.sizes
    : ['S', 'M', 'L', 'XL', 'XXL'];

  const stockPerSize = data.stockPerSize || {
    S: 5,
    M: 5,
    L: 5,
    XL: 5,
    XXL: 2,
  };

  const calculatedStock = typeof data.stock === 'number'
    ? data.stock
    : Object.values(stockPerSize).reduce((acc: number, curr: any) => acc + (Number(curr) || 0), 0);

  const isActive = data.isActive !== undefined ? Boolean(data.isActive) : data.available !== undefined ? Boolean(data.available) : true;
  const isFeatured = data.isFeatured !== undefined ? Boolean(data.isFeatured) : Boolean(data.featured);

  return {
    id,
    name: data.name || 'Jersey Sin Nombre',
    category: data.category || data.categoryName || 'Jerseys de fútbol',
    categoryId: data.categoryId || '',
    categoryName: data.categoryName || data.category || 'Jerseys de fútbol',
    price: Number(data.price) || 0,
    previousPrice: data.previousPrice ? Number(data.previousPrice) : data.originalPrice ? Number(data.originalPrice) : undefined,
    originalPrice: data.originalPrice ? Number(data.originalPrice) : data.previousPrice ? Number(data.previousPrice) : undefined,
    discount: data.discount ? Number(data.discount) : undefined,
    isOffer: Boolean(data.isOffer || (data.discount && data.discount > 0)),
    featured: isFeatured,
    isFeatured: isFeatured,
    available: isActive,
    isActive: isActive,
    imageUrl: images[0] || '',
    images,
    description: data.description || '',
    sku: data.sku || '',
    details: {
      material: data.details?.material || '100% Poliéster transpirable',
      type: data.details?.type || 'Versión Fan',
      availability: data.details?.availability || (isActive ? 'Disponible' : 'Agotado'),
      fit: data.details?.fit || 'Regular Fit',
      sizes,
    },
    sizes,
    stock: calculatedStock,
    stockPerSize,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt,
  };
}

/**
 * Prepares payload for Firestore insertion
 */
function prepareProductForFirestore(product: Partial<Product>): Record<string, any> {
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.imageUrl
    ? [product.imageUrl]
    : ['https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1000&auto=format&fit=crop'];

  const sizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : ['S', 'M', 'L', 'XL', 'XXL'];

  const stockPerSize = product.stockPerSize || {
    S: 5,
    M: 5,
    L: 5,
    XL: 5,
    XXL: 2,
  };

  const totalStock = typeof product.stock === 'number'
    ? product.stock
    : Object.values(stockPerSize).reduce((acc: number, curr: any) => acc + (Number(curr) || 0), 0);

  const isActive = product.isActive !== undefined ? Boolean(product.isActive) : product.available !== undefined ? Boolean(product.available) : true;
  const isFeatured = product.isFeatured !== undefined ? Boolean(product.isFeatured) : Boolean(product.featured);

  return {
    name: product.name || '',
    category: product.category || product.categoryName || 'Jerseys de fútbol',
    categoryName: product.categoryName || product.category || 'Jerseys de fútbol',
    categoryId: product.categoryId || '',
    price: Number(product.price) || 0,
    previousPrice: product.previousPrice ? Number(product.previousPrice) : product.originalPrice ? Number(product.originalPrice) : null,
    originalPrice: product.originalPrice ? Number(product.originalPrice) : product.previousPrice ? Number(product.previousPrice) : null,
    discount: product.discount ? Number(product.discount) : 0,
    isOffer: Boolean(product.isOffer || (product.discount && product.discount > 0)),
    featured: isFeatured,
    isFeatured: isFeatured,
    available: isActive,
    isActive: isActive,
    imageUrl: images[0] || '',
    images,
    description: product.description || '',
    sku: product.sku || '',
    details: {
      material: product.details?.material || '100% Poliéster transpirable',
      type: product.details?.type || 'Versión Fan',
      availability: isActive ? 'Disponible' : 'Agotado',
      sizes,
    },
    sizes,
    stock: totalStock,
    stockPerSize,
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _adminKey: ADMIN_KEY,
    isAdminAction: true,
  };
}
