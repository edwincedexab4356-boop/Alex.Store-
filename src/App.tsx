import React, { useState, useEffect } from 'react';
import { ToastProvider } from './components/common/Toast';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/home/Hero';
import { FeatureBar } from './components/home/FeatureBar';
import { ProductGrid } from './components/catalog/ProductGrid';
import { ProductDetailModal } from './components/catalog/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { SearchModal } from './components/common/SearchModal';
import { AboutSection } from './components/home/AboutSection';
import { ContactSection } from './components/home/ContactSection';
import { Footer } from './components/layout/Footer';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminLogin } from './components/admin/AdminLogin';

import { productsService } from './services/productsService';
import { categoriesService } from './services/categoriesService';
import { ordersService } from './services/ordersService';
import { settingsService } from './services/settingsService';
import { authService } from './services/authService';
import { Product, Category, Order, StoreSettings, AdminUser } from './types';

export default function App() {
  // Store Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(settingsService.get());
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);

  // View Navigation: 'store' | 'admin'
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');
  const [activeNavSection, setActiveNavSection] = useState<string>('inicio');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Interactive Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Initial Data Load & Event Listener for Real-Time Sync
  const loadStoreData = async () => {
    try {
      const [prods, cats, ords, setts] = await Promise.all([
        productsService.getAll(),
        categoriesService.getAll(),
        ordersService.getAll(),
        settingsService.get(),
      ]);

      setProducts(prods);
      setCategories(cats);
      setOrders(ords);
      setSettings(setts);
    } catch (err) {
      console.error('Error loading store data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();

    // Check hash for #admin routing
    if (window.location.hash === '#admin') {
      setCurrentView('admin');
    }

    // Subscribe to admin auth changes
    const unsubscribeAuth = authService.subscribe((user) => {
      setCurrentUser(user);
    });

    // Listen to custom event dispatched on any service update
    const handleStoreChange = () => {
      loadStoreData();
    };
    window.addEventListener('alexstore:change', handleStoreChange);

    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
      } else if (window.location.hash === '' || window.location.hash === '#') {
        setCurrentView('store');
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      unsubscribeAuth();
      window.removeEventListener('alexstore:change', handleStoreChange);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Smooth scroll handler for sections
  const handleNavigateSection = (sectionId: string) => {
    setActiveNavSection(sectionId);

    if (currentView !== 'store') {
      setCurrentView('store');
      window.location.hash = '';
    }

    if (sectionId === 'inicio') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (sectionId === 'jerseys') {
      setSelectedCategory('all');
      const el = document.getElementById('catalogo-seccion');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (sectionId === 'categorias') {
      const el = document.getElementById('catalogo-seccion');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (sectionId === 'ofertas') {
      setSelectedCategory('ofertas');
      const el = document.getElementById('catalogo-seccion');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (sectionId === 'nosotros') {
      const el = document.getElementById('nosotros');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (sectionId === 'contacto') {
      const el = document.getElementById('contacto');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
  };

  const handleOpenAdmin = () => {
    setCurrentView('admin');
    window.location.hash = 'admin';
  };

  const handleReturnToStore = () => {
    setCurrentView('store');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ToastProvider>
      <CartProvider>
        <div className="min-h-screen bg-[#08080a] text-neutral-100 selection:bg-[#D4AF37] selection:text-black font-['Montserrat']">
          {/* View Routing: Admin View or Public Storefront */}
          {currentView === 'admin' ? (
            currentUser ? (
              <AdminPanel
                currentUser={currentUser}
                products={products}
                orders={orders}
                categories={categories}
                settings={settings}
                onLogout={() => setCurrentUser(null)}
                onReturnToStore={handleReturnToStore}
              />
            ) : (
              <AdminLogin
                onLoginSuccess={(user) => setCurrentUser(user)}
                onBackToStore={handleReturnToStore}
              />
            )
          ) : (
            /* Public Storefront */
            <>
              <Navbar
                settings={settings}
                activeSection={activeNavSection}
                onNavigate={handleNavigateSection}
                onOpenAdmin={handleOpenAdmin}
                onOpenSearch={() => setIsSearchOpen(true)}
              />

              <main>
                <Hero
                  settings={settings}
                  onExploreJerseys={() => handleNavigateSection('jerseys')}
                  onExploreOffers={() => handleNavigateSection('ofertas')}
                />

                <FeatureBar />

                <ProductGrid
                  products={products}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => setSelectedCategory(cat)}
                  onSelectProduct={(product) => setSelectedProduct(product)}
                />

                <AboutSection settings={settings} />

                <ContactSection settings={settings} />
              </main>

              <Footer
                settings={settings}
                onNavigate={handleNavigateSection}
                onOpenAdmin={handleOpenAdmin}
              />

              {/* Modals & Overlays */}
              <ProductDetailModal
                product={selectedProduct}
                settings={settings}
                onClose={() => setSelectedProduct(null)}
              />

              <CartDrawer
                settings={settings}
                onProceedToCheckout={() => setIsCheckoutOpen(true)}
              />

              <CheckoutModal
                isOpen={isCheckoutOpen}
                settings={settings}
                onClose={() => setIsCheckoutOpen(false)}
                onOrderCompleted={(newOrder) => {
                  setOrders((prev) => [newOrder, ...prev]);
                }}
              />

              <SearchModal
                isOpen={isSearchOpen}
                products={products}
                onClose={() => setIsSearchOpen(false)}
                onSelectProduct={(p) => setSelectedProduct(p)}
              />
            </>
          )}
        </div>
      </CartProvider>
    </ToastProvider>
  );
}
