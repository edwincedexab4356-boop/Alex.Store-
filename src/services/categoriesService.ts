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
import { INITIAL_CATEGORIES } from '../data/seedData';
import { Category } from '../types';

const COLLECTION_NAME = 'categories';
const ADMIN_KEY = 'alexpty2026';

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      return INITIAL_CATEGORIES;
    }

    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      if (!snap.empty) {
        const list: Category[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            name: data.name || '',
            slug: data.slug || (data.name ? data.name.toLowerCase().replace(/\s+/g, '-') : ''),
            description: data.description || '',
            icon: data.icon || 'Tag',
            active: data.active !== undefined ? Boolean(data.active) : true,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        return list;
      }

      // Seed initial categories to Firestore if empty in a single atomic batch
      const batch = writeBatch(db);
      const seeded: Category[] = [];
      for (const cat of INITIAL_CATEGORIES) {
        const newDocRef = doc(collection(db, COLLECTION_NAME));
        const payload = {
          name: cat.name,
          slug: cat.slug,
          description: cat.description || '',
          icon: cat.icon || 'Tag',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _adminKey: ADMIN_KEY,
          isAdminAction: true,
        };
        batch.set(newDocRef, payload);
        seeded.push({ ...cat, id: newDocRef.id, active: true });
      }
      await batch.commit();
      return seeded;
    } catch (err) {
      console.error('Error fetching categories from Firestore:', err);
      throw err;
    }
  },

  async create(name: string, description?: string): Promise<Category> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      throw new Error('Firebase Firestore no está disponible');
    }

    const payload = {
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: (description || '').trim(),
      icon: 'Tag',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _adminKey: ADMIN_KEY,
      isAdminAction: true,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);

    return {
      id: docRef.id,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      icon: payload.icon,
      active: payload.active,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    };
  },

  async add(category: Partial<Category>): Promise<Category> {
    return this.create(category.name || '', category.description);
  },

  async update(id: string, updates: Partial<Category>): Promise<void> {
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

    if (updates.name) {
      payload.slug = updates.name.toLowerCase().replace(/\s+/g, '-');
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

  subscribe(callback: (categories: Category[]) => void): () => void {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      callback(INITIAL_CATEGORIES);
      return () => {};
    }

    const unsub = onSnapshot(
      collection(db, COLLECTION_NAME),
      (snapshot) => {
        const list: Category[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            name: data.name || '',
            slug: data.slug || (data.name ? data.name.toLowerCase().replace(/\s+/g, '-') : ''),
            description: data.description || '',
            icon: data.icon || 'Tag',
            active: data.active !== undefined ? Boolean(data.active) : true,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        callback(list);
      },
      (err) => {
        console.error('Firestore categories onSnapshot error:', err);
      }
    );

    return unsub;
  },
};
