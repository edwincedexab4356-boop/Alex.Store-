import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebaseConfig';
import { INITIAL_SETTINGS } from '../data/seedData';
import { StoreSettings } from '../types';

const COLLECTION_NAME = 'settings';
const DOC_ID = 'store';
const ADMIN_KEY = 'alexpty2026';

export const settingsService = {
  get(): StoreSettings {
    return INITIAL_SETTINGS;
  },

  async getSettings(): Promise<StoreSettings> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      return INITIAL_SETTINGS;
    }

    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, DOC_ID));
      if (snap.exists()) {
        return normalizeSettings(snap.data());
      }

      // Check legacy doc id 'store_config'
      const legacySnap = await getDoc(doc(db, COLLECTION_NAME, 'store_config'));
      if (legacySnap.exists()) {
        const data = normalizeSettings(legacySnap.data());
        await setDoc(doc(db, COLLECTION_NAME, DOC_ID), {
          ...data,
          _adminKey: ADMIN_KEY,
          isAdminAction: true,
        });
        return data;
      }

      // Initialize default settings in Firestore
      await setDoc(doc(db, COLLECTION_NAME, DOC_ID), {
        ...INITIAL_SETTINGS,
        _adminKey: ADMIN_KEY,
        isAdminAction: true,
      });
      return INITIAL_SETTINGS;
    } catch (err) {
      console.error('Error getting settings from Firestore:', err);
      return INITIAL_SETTINGS;
    }
  },

  async update(newSettings: Partial<StoreSettings>): Promise<StoreSettings> {
    return this.updateSettings(newSettings);
  },

  async updateSettings(newSettings: Partial<StoreSettings>): Promise<StoreSettings> {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      throw new Error('Firebase Firestore no está disponible');
    }

    const current = await this.getSettings();
    const updated = { ...current, ...newSettings };

    const payload = {
      ...updated,
      _adminKey: ADMIN_KEY,
      isAdminAction: true,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, COLLECTION_NAME, DOC_ID), payload, { merge: true });

    return updated;
  },

  subscribe(callback: (settings: StoreSettings) => void): () => void {
    const db = getDb();
    if (!db || !isFirebaseConfigured()) {
      callback(INITIAL_SETTINGS);
      return () => {};
    }

    const unsub = onSnapshot(
      doc(db, COLLECTION_NAME, DOC_ID),
      (snapshot) => {
        if (snapshot.exists()) {
          callback(normalizeSettings(snapshot.data()));
        } else {
          // Try legacy doc if 'store' doesn't exist yet
          this.getSettings().then(callback).catch(() => callback(INITIAL_SETTINGS));
        }
      },
      (err) => {
        console.error('Firestore settings onSnapshot error:', err);
      }
    );

    return unsub;
  },
};

function normalizeSettings(data: any): StoreSettings {
  return {
    storeName: data.storeName || INITIAL_SETTINGS.storeName,
    logo: data.logo || '',
    slogan: data.slogan || INITIAL_SETTINGS.slogan,
    secondarySlogan: data.secondarySlogan || INITIAL_SETTINGS.secondarySlogan,
    phone: data.phone || INITIAL_SETTINGS.phone,
    whatsapp: data.whatsapp || INITIAL_SETTINGS.whatsapp,
    instagram: data.instagram || INITIAL_SETTINGS.instagram,
    facebook: data.facebook || INITIAL_SETTINGS.facebook,
    email: data.email || INITIAL_SETTINGS.email,
    address: data.address || INITIAL_SETTINGS.address,
    hours: data.hours || INITIAL_SETTINGS.hours,
    deliveryMethods: Array.isArray(data.deliveryMethods) && data.deliveryMethods.length > 0
      ? data.deliveryMethods
      : INITIAL_SETTINGS.deliveryMethods,
    currencySymbol: data.currencySymbol || '$',
    bannerNotice: data.bannerNotice || INITIAL_SETTINGS.bannerNotice,
  };
}
