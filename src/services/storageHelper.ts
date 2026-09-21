import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/seedData';
import { Category, Order, Product, StoreSettings } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'alexstore_products_v1',
  CATEGORIES: 'alexstore_categories_v1',
  ORDERS: 'alexstore_orders_v1',
  SETTINGS: 'alexstore_settings_v1',
  CART: 'alexstore_cart_v1',
  ADMIN_SESSION: 'alexstore_admin_session_v1',
  INITIALIZED_FLAG: 'alexstore_seeded_flag_v1',
};

// Event bus for instantaneous cross-component reactive updates
export const broadcastDataChange = (entity: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('alexstore:change', { detail: { entity, timestamp: Date.now() } }));
  }
};

export const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw !== null) {
      return JSON.parse(raw);
    }
    // Check if user already initialized and deleted everything
    const isSeeded = localStorage.getItem(STORAGE_KEYS.INITIALIZED_FLAG);
    if (isSeeded) {
      return [];
    }
    // First boot ever: seed initial demo
    localStorage.setItem(STORAGE_KEYS.INITIALIZED_FLAG, 'true');
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  } catch (e) {
    console.error('Error reading stored products', e);
    return [];
  }
};

export const saveStoredProducts = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.INITIALIZED_FLAG, 'true');
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    broadcastDataChange('products');
  } catch (e) {
    console.error('Error saving stored products', e);
  }
};

export const getStoredCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (raw !== null) {
      return JSON.parse(raw);
    }
    const isSeeded = localStorage.getItem(STORAGE_KEYS.INITIALIZED_FLAG);
    if (isSeeded) {
      return [];
    }
    localStorage.setItem(STORAGE_KEYS.INITIALIZED_FLAG, 'true');
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  } catch (e) {
    console.error('Error reading stored categories', e);
    return [];
  }
};

export const saveStoredCategories = (categories: Category[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.INITIALIZED_FLAG, 'true');
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    broadcastDataChange('categories');
  } catch (e) {
    console.error('Error saving stored categories', e);
  }
};

export const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (raw !== null) {
      return JSON.parse(raw);
    }
    const isSeeded = localStorage.getItem(STORAGE_KEYS.INITIALIZED_FLAG);
    if (isSeeded) {
      return [];
    }
    const initialOrders: Order[] = [
      {
        id: 'ord-101',
        orderNumber: 'ALX-7821',
        date: new Date(Date.now() - 3600000 * 2).toISOString().split('T')[0],
        time: '14:30',
        createdAt: Date.now() - 3600000 * 2,
        customer: {
          fullName: 'Carlos Mendoza',
          phone: '+507 6382-9011',
          email: 'carlos.mendoza@gmail.com',
        },
        deliveryMethod: 'domicilio',
        deliveryAddress: 'Condado del Rey, PH King’s Park, Torre 3, Apto 14B, Ciudad de Panamá',
        notes: 'Timbre no funciona, favor llamar al llegar.',
        items: [
          {
            productId: 'prod-1',
            name: 'Jersey Real Madrid Local 24/25 - Versión Jugador',
            size: 'L',
            quantity: 1,
            price: 48.00,
            image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=400&auto=format&fit=crop&q=80',
          },
        ],
        subtotal: 48.00,
        shippingCost: 4.50,
        total: 52.50,
        status: 'Pendiente',
      },
      {
        id: 'ord-102',
        orderNumber: 'ALX-7822',
        date: new Date(Date.now() - 3600000 * 18).toISOString().split('T')[0],
        time: '10:15',
        createdAt: Date.now() - 3600000 * 18,
        customer: {
          fullName: 'Valeria Rodríguez',
          phone: '+507 6890-4412',
          email: 'valeria.r@hotmail.com',
        },
        deliveryMethod: 'interior',
        deliveryAddress: 'Chitré, Herrera. Sucursal Uno Express Terminal de Chitré',
        notes: 'Retiro en agencia a nombre de Valeria Rodríguez.',
        items: [
          {
            productId: 'prod-3',
            name: 'Jersey Argentina Campeón del Mundo 3 Estrellas',
            size: 'M',
            quantity: 1,
            price: 52.00,
            image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=400&auto=format&fit=crop&q=80',
          },
          {
            productId: 'prod-10',
            name: 'Gorra ALEX.STOREPTY Classic Crown Black/Gold',
            size: 'Talla Única',
            quantity: 1,
            price: 18.00,
            image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&auto=format&fit=crop&q=80',
          },
        ],
        subtotal: 70.00,
        shippingCost: 6.50,
        total: 76.50,
        status: 'Confirmado',
      },
      {
        id: 'ord-103',
        orderNumber: 'ALX-7819',
        date: new Date(Date.now() - 3600000 * 48).toISOString().split('T')[0],
        time: '16:45',
        createdAt: Date.now() - 3600000 * 48,
        customer: {
          fullName: 'Roberto De Gracia',
          phone: '+507 6554-1188',
        },
        deliveryMethod: 'retiro',
        deliveryAddress: 'Punto de encuentro Mall Multiplaza',
        notes: 'Personalizar con número 7.',
        items: [
          {
            productId: 'prod-2',
            name: 'Jersey FC Barcelona 125 Aniversario 24/25',
            size: 'XL',
            quantity: 1,
            price: 45.00,
            image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&auto=format&fit=crop&q=80',
          },
        ],
        subtotal: 45.00,
        shippingCost: 0,
        total: 45.00,
        status: 'Entregado',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.INITIALIZED_FLAG, 'true');
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
    return initialOrders;
  } catch (e) {
    console.error('Error reading stored orders', e);
    return [];
  }
};

export const saveStoredOrders = (orders: Order[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.INITIALIZED_FLAG, 'true');
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    broadcastDataChange('orders');
  } catch (e) {
    console.error('Error saving stored orders', e);
  }
};

export const getStoredSettings = (): StoreSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return JSON.parse(raw);
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    return INITIAL_SETTINGS;
  } catch (e) {
    console.error('Error reading stored settings', e);
    return INITIAL_SETTINGS;
  }
};

export const saveStoredSettings = (settings: StoreSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    broadcastDataChange('settings');
  } catch (e) {
    console.error('Error saving stored settings', e);
  }
};

export const resetToDefaults = () => {
  localStorage.setItem(STORAGE_KEYS.INITIALIZED_FLAG, 'true');
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  broadcastDataChange('all');
};
