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
import { Offer } from '../types';

const COLLECTION_NAME = 'offers';
const ADMIN_KEY = 'alexpty2026';

export const offersService = {
  async getAll(): Promise<Offer[]> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) return [];

    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      const list: Offer[] = [];
      snap.forEach((d) => {
        list.push(normalizeOffer(d.id, d.data()));
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    } catch (err) {
      console.error('Error fetching offers from Firestore:', err);
      throw err;
    }
  },

  async create(offerInput: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Offer> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      throw new Error('Firebase Firestore no está disponible');
    }

    const payload = {
      name: offerInput.name.trim(),
      description: offerInput.description.trim(),
      discount: Number(offerInput.discount) || 0,
      productIds: Array.isArray(offerInput.productIds) ? offerInput.productIds : [],
      startDate: offerInput.startDate || new Date().toISOString().split('T')[0],
      endDate: offerInput.endDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      active: offerInput.active !== undefined ? Boolean(offerInput.active) : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _adminKey: ADMIN_KEY,
      isAdminAction: true,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);

    return normalizeOffer(docRef.id, payload);
  },

  async update(id: string, updates: Partial<Offer>): Promise<void> {
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

    if (updates.discount !== undefined) {
      payload.discount = Number(updates.discount);
    }

    await updateDoc(doc(db, COLLECTION_NAME, id), payload);
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

  async toggleActive(id: string, currentStatus: boolean): Promise<void> {
    await this.update(id, { active: !currentStatus });
  },

  subscribe(callback: (offers: Offer[]) => void): () => void {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      callback([]);
      return () => {};
    }

    const unsub = onSnapshot(
      collection(db, COLLECTION_NAME),
      (snapshot) => {
        const list: Offer[] = [];
        snapshot.forEach((d) => {
          list.push(normalizeOffer(d.id, d.data()));
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(list);
      },
      (err) => {
        console.error('Firestore offers onSnapshot error:', err);
      }
    );

    return unsub;
  },
};

function normalizeOffer(id: string, data: any): Offer {
  return {
    id,
    name: data.name || 'Oferta sin nombre',
    description: data.description || '',
    discount: Number(data.discount) || 0,
    productIds: Array.isArray(data.productIds) ? data.productIds : [],
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    active: data.active !== undefined ? Boolean(data.active) : true,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}
