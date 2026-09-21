import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Archive,
  Flame,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { LogoBadge } from '../common/LogoBadge';
import { AdminUser, Product, Order, Category, StoreSettings } from '../../types';
import { authService } from '../../services/authService';
import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminSalesTab } from './AdminSalesTab';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import { AdminInventoryTab } from './AdminInventoryTab';
import { AdminOffersTab } from './AdminOffersTab';
import { AdminSettingsTab } from './AdminSettingsTab';
import { useToast } from '../common/Toast';

interface AdminPanelProps {
  currentUser: AdminUser;
  products: Product[];
  orders: Order[];
  categories: Category[];
  settings: StoreSettings;
  onLogout: () => void;
  onReturnToStore: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  products,
  orders,
  categories,
  settings,
  onLogout,
  onReturnToStore,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'pedidos' | 'ventas' | 'productos' | 'categorias' | 'inventario' | 'ofertas' | 'configuracion'
  >('dashboard');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const pendingOrdersCount = orders.filter(
    (o) => (o.status || '').toLowerCase() === 'pendiente'
  ).length;

  const handleLogout = async () => {
    await authService.logout();
    showToast('Sesión de administrador cerrada', 'info');
    onLogout();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    { id: 'ventas', label: 'Ventas en Vivo', icon: <TrendingUp className="w-5 h-5 text-[#ECC86A]" /> },
    { id: 'productos', label: 'Productos', icon: <Package className="w-5 h-5" /> },
    { id: 'categorias', label: 'Categorías', icon: <Layers className="w-5 h-5" /> },
    { id: 'inventario', label: 'Inventario', icon: <Archive className="w-5 h-5" /> },
    { id: 'ofertas', label: 'Ofertas y Promociones', icon: <Flame className="w-5 h-5 text-red-400" /> },
    { id: 'configuracion', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleSelectTab = (tabId: any) => {
    setActiveTab(tabId);
    setMobileDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-neutral-200 flex flex-col md:flex-row">
      {/* Desktop Sidebar (Left) */}
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 bg-[#0c0c10] border-r border-neutral-800/80 p-6 shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div>
          {/* Top Brand Logo */}
          <div className="pb-6 border-b border-neutral-800/80 mb-6">
            <LogoBadge size="sm" variant="horizontal" />
            <div className="mt-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-semibold">
              <div className="flex items-center gap-1.5 text-[#ECC86A]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Panel Admin</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[10px]" title="Base de datos Firestore sincronizada">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Firestore</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-300 via-[#D4AF37] to-amber-500 text-black shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-black text-white'
                          : 'bg-amber-500 text-black animate-pulse'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User info & Quick Actions */}
        <div className="pt-6 border-t border-neutral-800/80 space-y-3">
          <button
            onClick={onReturnToStore}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-[#ECC86A]" />
            <span>Ver Tienda Pública</span>
          </button>

          <div className="flex items-center justify-between px-2 pt-2 text-xs">
            <div className="truncate">
              <p className="font-bold text-white truncate text-[11px]">{currentUser.email}</p>
              <p className="text-[10px] text-neutral-500">{(currentUser.role || 'Administrador').toUpperCase()}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-900 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navigation Header */}
      <div className="md:hidden sticky top-0 z-30 bg-[#0c0c10]/95 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <LogoBadge size="sm" variant="horizontal" />

        <div className="flex items-center gap-2">
          <button
            onClick={onReturnToStore}
            className="p-2 text-neutral-400 hover:text-white"
            title="Ir a la tienda"
          >
            <ExternalLink className="w-5 h-5 text-[#ECC86A]" />
          </button>

          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 text-neutral-300 hover:text-white"
            aria-label="Abrir menú de administración"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Drawer */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-xs bg-[#0c0c10] border-r border-neutral-800 p-6 flex flex-col justify-between h-full z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
                <LogoBadge size="sm" variant="horizontal" />
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-300 via-[#D4AF37] to-amber-500 text-black'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-black">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onReturnToStore();
                }}
                className="w-full py-2.5 rounded-xl bg-neutral-900 text-neutral-300 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-[#ECC86A]" />
                <span>Ver Tienda Pública</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-red-950/40 text-red-300 border border-red-900/60 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
        {activeTab === 'dashboard' && (
          <AdminDashboardTab
            orders={orders}
            products={products}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}
        {activeTab === 'pedidos' && <AdminOrdersTab orders={orders} products={products} />}
        {activeTab === 'ventas' && <AdminSalesTab orders={orders} products={products} />}
        {activeTab === 'productos' && (
          <AdminProductsTab products={products} categories={categories} />
        )}
        {activeTab === 'categorias' && (
          <AdminCategoriesTab categories={categories} products={products} />
        )}
        {activeTab === 'inventario' && <AdminInventoryTab products={products} />}
        {activeTab === 'ofertas' && (
          <AdminOffersTab products={products} settings={settings} />
        )}
        {activeTab === 'configuracion' && <AdminSettingsTab settings={settings} />}
      </main>
    </div>
  );
};
