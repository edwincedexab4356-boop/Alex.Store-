import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebaseConfig';
import { Order, OrderStatus } from '../types';

const COLLECTION_NAME = 'orders';
const ADMIN_KEY = 'alexpty2026';

export const ordersService = {
  async getAll(): Promise<Order[]> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) return [];

    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      const list: Order[] = [];
      snap.forEach((d) => {
        list.push(normalizeOrder(d.id, d.data()));
      });
      // Sort newest first
      list.sort((a, b) => {
        const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
        const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
      return list;
    } catch (err) {
      console.error('Error fetching orders from Firestore:', err);
      throw err;
    }
  },

  async getById(id: string): Promise<Order | null> {
    const all = await this.getAll();
    return all.find((o) => o.id === id) || null;
  },

  /**
   * Save order to Cloud Firestore orders collection
   */
  async create(orderInput: Partial<Order>): Promise<Order> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      throw new Error('Firebase Firestore no está disponible para registrar el pedido');
    }

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = orderInput.orderNumber || `ALX-${randomCode}`;

    const customerName = orderInput.customerName || orderInput.customer?.fullName || 'Cliente';
    const phone = orderInput.phone || orderInput.customer?.phone || '';
    const email = orderInput.email || orderInput.customer?.email || '';
    const address = orderInput.address || orderInput.deliveryAddress || '';
    const products = orderInput.products || orderInput.items || [];

    const payload = {
      orderNumber,
      customerName,
      phone,
      email,
      customer: {
        fullName: customerName,
        phone,
        email,
      },
      products,
      items: products,
      subtotal: Number(orderInput.subtotal) || 0,
      shippingCost: Number(orderInput.shippingCost) || 0,
      total: Number(orderInput.total) || 0,
      deliveryMethod: orderInput.deliveryMethod || 'domicilio',
      address,
      deliveryAddress: address,
      notes: orderInput.notes || '',
      status: orderInput.status || 'Pendiente',
      date,
      time,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);

    return normalizeOrder(docRef.id, payload);
  },

  /**
   * Update order status in Firestore
   */
  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      throw new Error('Firebase Firestore no está disponible');
    }

    await updateDoc(doc(db, COLLECTION_NAME, id), {
      status,
      updatedAt: new Date().toISOString(),
      _adminKey: ADMIN_KEY,
      isAdminAction: true,
    });
  },

  /**
   * Delete order from Firestore: deleteDoc(doc(db, "orders", orderId))
   */
  async delete(id: string): Promise<void> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      throw new Error('Firebase Firestore no está disponible');
    }

    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },

  /**
   * Delete all orders from Firestore
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
   * Real-time subscription to orders using onSnapshot
   */
  subscribe(callback: (orders: Order[]) => void): () => void {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      callback([]);
      return () => {};
    }

    const unsub = onSnapshot(
      collection(db, COLLECTION_NAME),
      (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((d) => {
          list.push(normalizeOrder(d.id, d.data()));
        });
        // Sort newest first
        list.sort((a, b) => {
          const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
          const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
          return timeB - timeA;
        });
        callback(list);
      },
      (err) => {
        console.error('Firestore orders onSnapshot error:', err);
      }
    );

    return unsub;
  },
};

function normalizeOrder(id: string, data: any): Order {
  const items = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.products)
    ? data.products
    : [];

  const customerName = data.customerName || data.customer?.fullName || 'Cliente';
  const phone = data.phone || data.customer?.phone || '';
  const email = data.email || data.customer?.email || '';
  const address = data.address || data.deliveryAddress || '';

  return {
    id,
    orderNumber: data.orderNumber || `ALX-${id.slice(0, 4).toUpperCase()}`,
    customerName,
    phone,
    email,
    customer: {
      fullName: customerName,
      phone,
      email,
    },
    products: items,
    items,
    subtotal: Number(data.subtotal) || 0,
    shippingCost: Number(data.shippingCost) || 0,
    total: Number(data.total) || 0,
    deliveryMethod: data.deliveryMethod || 'domicilio',
    address,
    deliveryAddress: address,
    notes: data.notes || '',
    status: data.status || 'Pendiente',
    date: data.date || (data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : ''),
    time: data.time || '',
    createdAt: data.createdAt || Date.now(),
    updatedAt: data.updatedAt,
  };
}
