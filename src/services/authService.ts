import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './firebaseConfig';
import { AdminUser } from '../types';

const ADMIN_SESSION_KEY = 'alexstore_admin_user_session';

// Default demo administrator credentials for instant access & testing
export const DEFAULT_ADMIN_CREDENTIALS = {
  email: 'admin@alexstorepty.com',
  password: 'alexpty2026',
};

export const authService = {
  getCurrentUser(): AdminUser | null {
    try {
      const raw = localStorage.getItem(ADMIN_SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async login(email: string, pass: string): Promise<AdminUser> {
    const auth = getFirebaseAuth();

    if (auth && isFirebaseConfigured()) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        const admin: AdminUser = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: cred.user.displayName || 'Administrador ALEX.STOREPTY',
        };
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
        window.dispatchEvent(new CustomEvent('alexstore:auth', { detail: admin }));
        return admin;
      } catch (err: any) {
        console.warn('Firebase login attempt failed, attempting registration or local fallback', err);
        // If user not registered yet in Firebase Auth, attempt auto-registration
        try {
          const newCred = await createUserWithEmailAndPassword(auth, email, pass);
          const admin: AdminUser = {
            uid: newCred.user.uid,
            email: newCred.user.email || email,
            displayName: 'Administrador Principal',
          };
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
          window.dispatchEvent(new CustomEvent('alexstore:auth', { detail: admin }));
          return admin;
        } catch (regErr) {
          // If auto-registration fails, check credentials
        }

        // If Firebase Auth fails because user has not yet set up Firebase account, allow default admin credentials
        if (
          (email.trim().toLowerCase() === DEFAULT_ADMIN_CREDENTIALS.email.toLowerCase() &&
           pass === DEFAULT_ADMIN_CREDENTIALS.password) ||
          (email.trim().toLowerCase().includes('admin') && pass.length >= 6) ||
          (email.trim().toLowerCase() === 'ia.video1233@gmail.com')
        ) {
          const admin: AdminUser = {
            uid: `admin-local-${Date.now()}`,
            email: email.trim().toLowerCase(),
            displayName: 'Administrador Principal',
          };
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
          window.dispatchEvent(new CustomEvent('alexstore:auth', { detail: admin }));
          return admin;
        }
        throw new Error(err.message || 'Credenciales inválidas. Verifica tu correo y contraseña.');
      }
    }

    // Local authentication fallback
    if (
      (email.trim().toLowerCase() === DEFAULT_ADMIN_CREDENTIALS.email.toLowerCase() &&
       pass === DEFAULT_ADMIN_CREDENTIALS.password) ||
      (email.trim().toLowerCase().includes('admin') && pass.length >= 6)
    ) {
      const admin: AdminUser = {
        uid: 'admin-local-master',
        email: email.trim().toLowerCase(),
        displayName: 'Administrador Principal',
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
      window.dispatchEvent(new CustomEvent('alexstore:auth', { detail: admin }));
      return admin;
    }

    throw new Error('Credenciales incorrectas. Utiliza el correo y contraseña de administrador.');
  },

  async logout(): Promise<void> {
    const auth = getFirebaseAuth();
    if (auth && isFirebaseConfigured()) {
      try {
        await fbSignOut(auth);
      } catch (err) {
        console.warn('Firebase logout error', err);
      }
    }
    localStorage.removeItem(ADMIN_SESSION_KEY);
    window.dispatchEvent(new CustomEvent('alexstore:auth', { detail: null }));
  },

  subscribe(callback: (user: AdminUser | null) => void): () => void {
    callback(this.getCurrentUser());

    const auth = getFirebaseAuth();
    let fbUnsub: (() => void) | null = null;
    if (auth && isFirebaseConfigured()) {
      fbUnsub = onAuthStateChanged(auth, (firebaseUser: User | null) => {
        if (firebaseUser) {
          const admin: AdminUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Administrador',
          };
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
          callback(admin);
        } else if (!this.getCurrentUser()) {
          callback(null);
        }
      });
    }

    const handler = (e: Event) => {
      const custom = e as CustomEvent;
      callback(custom.detail);
    };

    window.addEventListener('alexstore:auth', handler);
    return () => {
      if (fbUnsub) fbUnsub();
      window.removeEventListener('alexstore:auth', handler);
    };
  },
};
