import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebaseConfig';
import { Sale } from '../types';

const COLLECTION_NAME = 'sales';
const ADMIN_KEY = 'alexpty2026';

export const salesService = {
  async getAll(): Promise<Sale[]> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) return [];

    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      const list: Sale[] = [];
      snap.forEach((d) => {
        list.push(normalizeSale(d.id, d.data()));
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    } catch (err) {
      console.error('Error fetching sales from Firestore:', err);
      throw err;
    }
  },

  async create(saleInput: Omit<Sale, 'id'>): Promise<Sale> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      throw new Error('Firebase Firestore no está disponible');
    }

    const payload = {
      orderId: saleInput.orderId || '',
      products: saleInput.products || [],
      subtotal: Number(saleInput.subtotal) || 0,
      total: Number(saleInput.total) || 0,
      paymentMethod: saleInput.paymentMethod || 'Efectivo',
      customerName: saleInput.customerName || 'Cliente General',
      createdAt: saleInput.createdAt || new Date().toISOString(),
      notes: saleInput.notes || '',
      _adminKey: ADMIN_KEY,
      isAdminAction: true,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);

    return normalizeSale(docRef.id, payload);
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      throw new Error('Firebase Firestore no está disponible');
    }

    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },

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

  subscribe(callback: (sales: Sale[]) => void): () => void {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      callback([]);
      return () => {};
    }

    const unsub = onSnapshot(
      collection(db, COLLECTION_NAME),
      (snapshot) => {
        const list: Sale[] = [];
        snapshot.forEach((d) => {
          list.push(normalizeSale(d.id, d.data()));
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(list);
      },
      (err) => {
        console.error('Firestore sales onSnapshot error:', err);
      }
    );

    return unsub;
  },

  /**
   * Filter sales by time periods
   */
  filterSales(sales: Sale[], period: 'all' | 'day' | 'week' | 'month'): Sale[] {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return sales.filter((s) => {
      const saleTime = new Date(s.createdAt).getTime();
      if (isNaN(saleTime)) return true;

      if (period === 'day') {
        return saleTime >= startOfToday;
      }
      if (period === 'week') {
        return saleTime >= startOfWeek;
      }
      if (period === 'month') {
        return saleTime >= startOfMonth;
      }
      return true;
    });
  },
};

function normalizeSale(id: string, data: any): Sale {
  return {
    id,
    orderId: data.orderId || '',
    products: Array.isArray(data.products) ? data.products : [],
    subtotal: Number(data.subtotal) || 0,
    total: Number(data.total) || 0,
    paymentMethod: data.paymentMethod || 'Efectivo',
    customerName: data.customerName || 'Cliente General',
    createdAt: data.createdAt || new Date().toISOString(),
    notes: data.notes || '',
  };
}
