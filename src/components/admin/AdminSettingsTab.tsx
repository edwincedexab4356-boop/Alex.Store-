import React, { useState } from 'react';
import { StoreSettings, DeliveryMethod } from '../../types';
import { settingsService } from '../../services/settingsService';
import { productsService } from '../../services/productsService';
import { categoriesService } from '../../services/categoriesService';
import { ordersService } from '../../services/ordersService';
import { inventoryService } from '../../services/inventoryService';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../../data/seedData';
import { useToast } from '../common/Toast';
import {
  Save,
  Plus,
  Trash2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Building2,
  Phone,
  MapPin,
  Globe,
  Database,
  AlertTriangle,
  Layers,
  ShoppingBag,
  Package,
} from 'lucide-react';

interface AdminSettingsTabProps {
  settings: StoreSettings;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({ settings }) => {
  const { showToast } = useToast();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [slogan, setSlogan] = useState(settings.slogan);
  const [secondarySlogan, setSecondarySlogan] = useState(settings.secondarySlogan);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [instagram, setInstagram] = useState(settings.instagram);
  const [facebook, setFacebook] = useState(settings.facebook);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [hours, setHours] = useState(settings.hours);
  const [bannerNotice, setBannerNotice] = useState(settings.bannerNotice || '');
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>(settings.deliveryMethods);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await settingsService.update({
        storeName: storeName.trim(),
        slogan: slogan.trim(),
        secondarySlogan: secondarySlogan.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        instagram: instagram.trim(),
        facebook: facebook.trim(),
        email: email.trim(),
        address: address.trim(),
        hours: hours.trim(),
        bannerNotice: bannerNotice.trim() || undefined,
        deliveryMethods,
      });
      showToast('Configuración general de la tienda actualizada', 'success');
    } catch (err) {
      showToast('Error al guardar configuración', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeliveryChange = (index: number, field: keyof DeliveryMethod, value: any) => {
    const updated = [...deliveryMethods];
    updated[index] = { ...updated[index], [field]: value };
    setDeliveryMethods(updated);
  };

  const handleAddDeliveryMethod = () => {
    const newMethod: DeliveryMethod = {
      id: `delivery-${Date.now()}`,
      title: 'Nuevo Método de Envío',
      description: 'Detalle de cobertura y entrega.',
      price: 5.0,
      estimatedTime: '24-48 horas',
    };
    setDeliveryMethods([...deliveryMethods, newMethod]);
  };

  const handleDeleteDeliveryMethod = (index: number) => {
    if (deliveryMethods.length <= 1) {
      showToast('Debe haber al menos un método de entrega configurado', 'error');
      return;
    }
    const updated = deliveryMethods.filter((_, idx) => idx !== index);
    setDeliveryMethods(updated);
  };

  // Dedicated Deletion Handlers for User Requests
  const handleDeleteAllOrders = async () => {
    if (!window.confirm('¿Deseas eliminar permanentemente TODAS las ventas y pedidos de la base de datos Firestore?')) return;
    if (!window.confirm('Por favor confirma por segunda vez: esta acción borrará todo el historial de pedidos.')) return;
    try {
      await ordersService.deleteAll();
      showToast('Todas las ventas y pedidos han sido eliminados de Firestore', 'info');
    } catch (err) {
      showToast('Error al eliminar pedidos de la base de datos', 'error');
    }
  };

  const handleDeleteAllProducts = async () => {
    if (!window.confirm('¿Deseas eliminar permanentemente TODOS los productos de la base de datos Firestore?')) return;
    if (!window.confirm('Por favor confirma por segunda vez: el catálogo quedará completamente vacío.')) return;
    try {
      await productsService.deleteAll();
      showToast('Todos los productos han sido eliminados de Firestore', 'info');
    } catch (err) {
      showToast('Error al eliminar productos de la base de datos', 'error');
    }
  };

  const handleDeleteAllCategories = async () => {
    if (!window.confirm('¿Deseas eliminar permanentemente TODAS las categorías de la base de datos Firestore?')) return;
    if (!window.confirm('Por favor confirma por segunda vez: se borrarán todas las categorías registradas.')) return;
    try {
      await categoriesService.deleteAll();
      showToast('Todas las categorías han sido eliminadas de Firestore', 'info');
    } catch (err) {
      showToast('Error al eliminar categorías de la base de datos', 'error');
    }
  };

  const handleClearAllStock = async () => {
    if (!window.confirm('¿Deseas vaciar TODO el inventario (poner el stock de todos los productos en 0)?')) return;
    try {
      await inventoryService.clearAllStock();
      showToast('Todo el stock ha sido vaciado a 0 en Firestore', 'info');
    } catch (err) {
      showToast('Error al vaciar inventario', 'error');
    }
  };

  const handleDeleteAllOffers = async () => {
    if (!window.confirm('¿Deseas eliminar todas las ofertas y restaurar los precios regulares en Firestore?')) return;
    try {
      const allProds = await productsService.getAll();
      for (const p of allProds) {
        if (p.isOffer || (p.discount && p.discount > 0)) {
          await productsService.update(p.id, {
            isOffer: false,
            discount: undefined,
            price: p.originalPrice || p.price,
          });
        }
      }
      await settingsService.update({ bannerNotice: '' });
      setBannerNotice('');
      showToast('Todas las ofertas han sido eliminadas de Firestore', 'info');
    } catch (err) {
      showToast('Error al eliminar ofertas', 'error');
    }
  };

  const handleDeleteEverything = async () => {
    if (!window.confirm('⚠️ ALERTA CRÍTICA: ¿Estás seguro de eliminar TODO de la base de datos (pedidos, productos, categorías e inventario)?')) return;
    if (!window.confirm('🚨 Confirma por última vez: La base de datos quedará totalmente limpia en Firestore.')) return;
    try {
      await ordersService.deleteAll();
      await productsService.deleteAll();
      await categoriesService.deleteAll();
      showToast('Se ha eliminado todo de la base de datos Firestore', 'info');
    } catch (err) {
      showToast('Error al limpiar base de datos', 'error');
    }
  };

  const handleRestoreFactoryCatalog = async () => {
    if (!window.confirm('¿Deseas restablecer el catálogo oficial completo de ALEX.STOREPTY (jerseys, categorías y configuración original)?')) return;
    setIsResetting(true);
    try {
      // Clean previous documents first
      await productsService.deleteAll();
      await categoriesService.deleteAll();

      // Seed official initial catalog
      for (const cat of INITIAL_CATEGORIES) {
        await categoriesService.add(cat);
      }
      for (const prod of INITIAL_PRODUCTS) {
        await productsService.add(prod);
      }
      await settingsService.update(INITIAL_SETTINGS);

      setStoreName(INITIAL_SETTINGS.storeName);
      setSlogan(INITIAL_SETTINGS.slogan);
      setSecondarySlogan(INITIAL_SETTINGS.secondarySlogan);
      setPhone(INITIAL_SETTINGS.phone);
      setWhatsapp(INITIAL_SETTINGS.whatsapp);
      setInstagram(INITIAL_SETTINGS.instagram);
      setFacebook(INITIAL_SETTINGS.facebook);
      setEmail(INITIAL_SETTINGS.email);
      setAddress(INITIAL_SETTINGS.address);
      setHours(INITIAL_SETTINGS.hours);
      setBannerNotice(INITIAL_SETTINGS.bannerNotice || '');
      setDeliveryMethods(INITIAL_SETTINGS.deliveryMethods);

      showToast('Catálogo oficial de ALEX.STOREPTY restablecido y sincronizado con Firestore', 'success');
    } catch (err) {
      showToast('Error al restablecer catálogo de fábrica', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-neutral-800">
        <h2 className="font-['Cinzel'] text-2xl font-black text-white">
          CONFIGURACIÓN DE LA TIENDA & BASE DE DATOS
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Personaliza los datos de ALEX.STOREPTY, canales de atención, tarifas de envío y gestión directa de Firestore.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Section 1: Identity */}
        <div className="bg-[#121218] p-6 rounded-3xl border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Building2 className="w-5 h-5 text-[#ECC86A]" />
            <h3 className="font-['Cinzel'] text-base font-bold text-white">
              Identidad de Marca
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-neutral-400 text-xs mb-1 font-semibold">Nombre Comercial</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-[#181824] text-xs text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-xs mb-1 font-semibold">Slogan Principal</label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full bg-[#181824] text-xs text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-xs mb-1 font-semibold">Slogan Secundario</label>
              <input
                type="text"
                value={secondarySlogan}
                onChange={(e) => setSecondarySlogan(e.target.value)}
                className="w-full bg-[#181824] text-xs text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Info */}
        <div className="bg-[#121218] p-6 rounded-3xl border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Phone className="w-5 h-5 text-[#ECC86A]" />
            <h3 className="font-['Cinzel'] text-base font-bold text-white">
              Canales de Atención & Redes Sociales
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-neutral-400 text-xs mb-1 font-semibold">Teléfono</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#181824] text-xs text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-xs mb-1 font-semibold">WhatsApp (Directo para Pedidos)</label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-[#181824] text-xs text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37] font-bold text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-xs mb-1 font-semibold">Instagram</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full bg-[#181824] text-xs text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-xs mb-1 font-semibold">Facebook</label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="w-full bg-[#181824] text-xs text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-neutral-400 text-xs mb-1 font-semibold">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#181824] text-xs text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-neutral-400 text-xs mb-1 font-semibold">Horario de Atención</label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full bg-[#181824] text-xs text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-neutral-400 text-xs mb-1 font-semibold">Ubicación / Cobertura Física</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#181824] text-xs text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Delivery Methods */}
        <div className="bg-[#121218] p-6 rounded-3xl border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#ECC86A]" />
              <h3 className="font-['Cinzel'] text-base font-bold text-white">
                Métodos de Envío & Tarifas
              </h3>
            </div>

            <button
              type="button"
              onClick={handleAddDeliveryMethod}
              className="text-xs text-[#ECC86A] hover:underline flex items-center gap-1 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Método</span>
            </button>
          </div>

          <div className="space-y-3">
            {deliveryMethods.map((dm, idx) => (
              <div
                key={dm.id || idx}
                className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
              >
                <div>
                  <label className="block text-neutral-400 text-[10px] mb-1">Nombre del Método</label>
                  <input
                    type="text"
                    value={dm.title}
                    onChange={(e) => handleDeliveryChange(idx, 'title', e.target.value)}
                    className="w-full bg-[#181824] text-xs text-white px-3 py-1.5 rounded-lg border border-neutral-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-[10px] mb-1">Costo ($ USD)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={dm.price}
                    onChange={(e) => handleDeliveryChange(idx, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#181824] text-xs text-white px-3 py-1.5 rounded-lg border border-neutral-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-[10px] mb-1">Tiempo Estimado</label>
                  <input
                    type="text"
                    value={dm.estimatedTime}
                    onChange={(e) => handleDeliveryChange(idx, 'estimatedTime', e.target.value)}
                    className="w-full bg-[#181824] text-xs text-white px-3 py-1.5 rounded-lg border border-neutral-700"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-neutral-400 text-[10px] mb-1">Descripción</label>
                    <input
                      type="text"
                      value={dm.description}
                      onChange={(e) => handleDeliveryChange(idx, 'description', e.target.value)}
                      className="w-full bg-[#181824] text-xs text-white px-3 py-1.5 rounded-lg border border-neutral-700"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteDeliveryMethod(idx)}
                    className="p-2 mt-4 rounded-lg bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400 transition-colors"
                    title="Eliminar método de envío"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="gold-gradient-btn px-8 py-3.5 rounded-xl uppercase tracking-wider font-bold text-xs flex items-center gap-2 shadow-xl"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN DE TIENDA'}</span>
          </button>
        </div>
      </form>

      {/* SECTION 4: CENTRO DE CONTROL Y ELIMINACIÓN TOTAL (FIRESTORE & BASE DE DATOS) */}
      <div className="bg-red-950/20 p-6 sm:p-8 rounded-3xl border border-red-900/50 space-y-6">
        <div className="flex items-center gap-3 border-b border-red-900/40 pb-4">
          <Database className="w-6 h-6 text-red-400" />
          <div>
            <h3 className="font-['Cinzel'] text-lg font-black text-white">
              CENTRO DE CONTROL Y ELIMINACIÓN DE BASE DE DATOS (FIRESTORE)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Control administrativo total para eliminar pedidos, productos, categorías, inventario u ofertas de Firestore.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card: Eliminar Ventas */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-1">
                <ShoppingBag className="w-4 h-4" />
                <span>Ventas y Pedidos</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Borra permanentemente todo el historial de pedidos y órdenes registradas en Firestore.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDeleteAllOrders}
              className="w-full py-2 px-3 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Todas las Ventas</span>
            </button>
          </div>

          {/* Card: Eliminar Productos */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-1">
                <Package className="w-4 h-4" />
                <span>Productos del Catálogo</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Elimina todos los artículos y jerseys guardados en la colección de Firestore.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDeleteAllProducts}
              className="w-full py-2 px-3 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Todos los Productos</span>
            </button>
          </div>

          {/* Card: Eliminar Categorías */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-1">
                <Layers className="w-4 h-4" />
                <span>Categorías</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Elimina las categorías creadas en el menú de navegación y base de datos.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDeleteAllCategories}
              className="w-full py-2 px-3 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Todas las Categorías</span>
            </button>
          </div>

          {/* Card: Vaciar Inventario */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Inventario & Stock</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Pone en 0 el stock de todas las tallas de todos los productos (marca todo como agotado).
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearAllStock}
              className="w-full py-2 px-3 rounded-xl bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar Stock a 0</span>
            </button>
          </div>

          {/* Card: Eliminar Ofertas */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Ofertas y Descuentos</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Elimina los descuentos especiales activos y restaura precios normales en Firestore.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDeleteAllOffers}
              className="w-full py-2 px-3 rounded-xl bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Todas las Ofertas</span>
            </button>
          </div>

          {/* Card: Limpiar Todo */}
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-700/80 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-red-300 text-xs font-black mb-1">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Limpiar Todo (Base de Datos)</span>
              </div>
              <p className="text-[11px] text-neutral-300">
                Vacía por completo productos, ventas y categorías de la base de datos Firestore.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDeleteEverything}
              className="w-full py-2 px-3 rounded-xl bg-red-800 hover:bg-red-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ELIMINAR TODO DE FIRESTORE</span>
            </button>
          </div>
        </div>

        {/* Restore Factory Default Demo */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#ECC86A]" />
              Restablecer Catálogo Oficial de Fábrica (ALEX.STOREPTY)
            </h4>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Si eliminaste todo y deseas volver a cargar los jerseys oficiales, categorías y configuración inicial en Firestore.
            </p>
          </div>

          <button
            type="button"
            disabled={isResetting}
            onClick={handleRestoreFactoryCatalog}
            className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-[#ECC86A] border border-[#D4AF37]/50 text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'CARGANDO CATÁLOGO...' : 'Restablecer Catálogo Oficial'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
