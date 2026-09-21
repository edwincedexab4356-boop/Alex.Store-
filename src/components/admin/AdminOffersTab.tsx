import React, { useState, useEffect } from 'react';
import { Product, StoreSettings, Offer } from '../../types';
import { offersService } from '../../services/offersService';
import { settingsService } from '../../services/settingsService';
import { useToast } from '../common/Toast';
import {
  Flame,
  Percent,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  Check,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Save,
  Package,
} from 'lucide-react';

interface AdminOffersTabProps {
  products: Product[];
  settings: StoreSettings;
}

export const AdminOffersTab: React.FC<AdminOffersTabProps> = ({
  products,
  settings,
}) => {
  const { showToast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // Store Banner
  const [bannerNotice, setBannerNotice] = useState(settings.bannerNotice || '');
  const [isSavingBanner, setIsSavingBanner] = useState(false);

  // Offer Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState<number>(20);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [active, setActive] = useState(true);

  // Delete confirmation
  const [deletingOffer, setDeletingOffer] = useState<Offer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Initial fetch from Firestore
    offersService
      .getAll()
      .then((data) => {
        setOffers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching offers from Firestore:', err);
        setLoading(false);
      });

    // Real-time listener on Firestore offers collection
    const unsub = offersService.subscribe((updatedOffers) => {
      setOffers(updatedOffers);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const openCreateModal = () => {
    setEditingOffer(null);
    setName('');
    setDescription('');
    setDiscount(20);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setSelectedProductIds([]);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (off: Offer) => {
    setEditingOffer(off);
    setName(off.name);
    setDescription(off.description || '');
    setDiscount(off.discount);
    setStartDate(off.startDate || new Date().toISOString().split('T')[0]);
    setEndDate(off.endDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setSelectedProductIds(off.productIds || []);
    setActive(off.active !== undefined ? Boolean(off.active) : true);
    setIsModalOpen(true);
  };

  const handleToggleProductSelection = (prodId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Ingresa un título para la oferta', 'error');
      return;
    }
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      showToast('El descuento debe estar entre 1% y 100%', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingOffer) {
        // updateDoc(doc(db, "offers", offerId), updatedData)
        await offersService.update(editingOffer.id, {
          name: name.trim(),
          description: description.trim(),
          discount: Number(discount),
          startDate,
          endDate,
          productIds: selectedProductIds,
          active,
        });
        showToast(`Oferta "${name}" actualizada en Firestore`, 'success');
      } else {
        // addDoc(collection(db, "offers"), payload)
        await offersService.create({
          name: name.trim(),
          description: description.trim(),
          discount: Number(discount),
          startDate,
          endDate,
          productIds: selectedProductIds,
          active,
        });
        showToast(`Oferta "${name}" creada y guardada en Firestore`, 'success');
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving offer in Firestore:', err);
      showToast(`Error al guardar oferta: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (off: Offer) => {
    const currentActive = off.active !== undefined ? Boolean(off.active) : true;
    try {
      await offersService.toggleActive(off.id, currentActive);
      showToast(`Oferta "${off.name}" ${!currentActive ? 'activada' : 'desactivada'}`, 'success');
    } catch (err: any) {
      showToast(`Error al cambiar estado: ${err.message || 'Error'}`, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingOffer) return;
    setIsDeleting(true);
    try {
      // deleteDoc(doc(db, "offers", offerId))
      await offersService.delete(deletingOffer.id);
      showToast(`Oferta "${deletingOffer.name}" eliminada de Firestore`, 'info');
      setDeletingOffer(null);
    } catch (err: any) {
      console.error('Error deleting offer:', err);
      showToast(`Error al eliminar oferta: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllOffers = async () => {
    if (offers.length === 0) {
      showToast('No hay ofertas para eliminar', 'info');
      return;
    }
    if (!window.confirm(`¿Deseas eliminar permanentemente las ${offers.length} ofertas de Firestore?`)) return;
    if (!window.confirm('Confirma nuevamente: se borrarán permanentemente de la base de datos.')) return;

    try {
      await offersService.deleteAll();
      showToast('Todas las ofertas han sido eliminadas de Firestore', 'info');
    } catch (err: any) {
      showToast(`Error al eliminar ofertas: ${err.message || 'Error'}`, 'error');
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBanner(true);
    try {
      await settingsService.update({ bannerNotice: bannerNotice.trim() });
      showToast('Banner promocional actualizado en Firestore', 'success');
    } catch (err: any) {
      showToast(`Error al guardar banner: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsSavingBanner(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Cinzel'] text-2xl font-black text-white flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-red-400" />
            <span>OFERTAS Y PROMOCIONES</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-sans font-bold">
              {offers.length}
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Persistencia en tiempo real en la colección <code className="text-[#ECC86A]">offers</code> de Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {offers.length > 0 && (
            <button
              onClick={handleDeleteAllOffers}
              className="px-3.5 py-2.5 rounded-xl border border-red-900/60 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Todas</span>
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="gold-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Oferta</span>
          </button>
        </div>
      </div>

      {/* Banner Promocional de la Tienda */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-['Cinzel'] text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Banner de Anuncios Superior de la Tienda</span>
          </h3>
          <span className="text-[11px] text-neutral-400">Visible para todos los clientes</span>
        </div>

        <form onSubmit={handleSaveBanner} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={bannerNotice}
            onChange={(e) => setBannerNotice(e.target.value)}
            placeholder="Ej: ⚡ ENVÍO GRATIS en compras mayores a $80 | 🔥 20% OFF en jerseys retro"
            className="flex-1 bg-[#181824] text-xs text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
          />
          <button
            type="submit"
            disabled={isSavingBanner}
            className="gold-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingBanner ? 'Guardando...' : 'Guardar Banner'}</span>
          </button>
        </form>
      </div>

      {/* Offers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-neutral-400">
            <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Cargando ofertas desde Firestore...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="col-span-full p-12 text-center text-neutral-500 bg-[#121217] rounded-3xl border border-neutral-800">
            <Flame className="w-10 h-10 mx-auto mb-3 opacity-30 text-red-400" />
            <p className="text-sm font-bold text-neutral-400">No hay ofertas registradas</p>
            <p className="text-xs mt-1">Crea tu primera promoción con el botón "Nueva Oferta".</p>
          </div>
        ) : (
          offers.map((off) => {
            const isActive = off.active !== undefined ? Boolean(off.active) : true;
            const associatedCount = off.productIds?.length || 0;

            return (
              <div
                key={off.id}
                className={`bg-[#121217] p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isActive ? 'border-neutral-800 hover:border-neutral-700' : 'border-red-950/50 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-red-950/60 text-red-400 border border-red-800/40 inline-flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        <span>-{off.discount}% OFF</span>
                      </span>
                      <h3 className="font-bold text-white text-base mt-2">{off.name}</h3>
                    </div>

                    <button
                      onClick={() => handleToggleActive(off)}
                      title={isActive ? 'Desactivar oferta' : 'Activar oferta'}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        isActive ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-red-950/40 text-red-400 border border-red-800/40'
                      }`}
                    >
                      {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {off.description && (
                    <p className="text-xs text-neutral-400 line-clamp-2">{off.description}</p>
                  )}

                  <div className="pt-2 border-t border-neutral-800/60 text-[11px] text-neutral-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#ECC86A]" />
                      <span>
                        Vigencia: {off.startDate || 'Inmediato'} a {off.endDate || 'Indefinido'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#ECC86A]" />
                      <span>
                        {associatedCount === 0
                          ? 'Aplica a toda la tienda'
                          : `${associatedCount} ${associatedCount === 1 ? 'producto asociado' : 'productos asociados'}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-800/80 flex items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => openEditModal(off)}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                    title="Editar oferta"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingOffer(off)}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 transition-colors"
                    title="Eliminar oferta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Crear / Editar Oferta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121217] rounded-3xl border border-neutral-800 max-w-lg w-full p-6 my-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 sticky top-0 bg-[#121217] z-10">
              <h3 className="font-['Cinzel'] text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-400" />
                <span>{editingOffer ? 'EDITAR OFERTA' : 'CREAR NUEVA OFERTA'}</span>
              </h3>
              <button
                onClick={() => !isSaving && setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Título de la Oferta *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Promo Verano Fútbol / Descuento Fin de Temporada"
                  className="w-full bg-[#181824] text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Descuento (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={discount}
                    onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#181824] text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Estado</label>
                  <div className="flex items-center h-10">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="rounded bg-[#181824] border-neutral-700 text-[#D4AF37] focus:ring-0"
                      />
                      <span className="text-white font-medium">Oferta Activa</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Fechas de vigencia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Fecha de Inicio *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#181824] text-white px-3.5 py-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Fecha de Finalización *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#181824] text-white px-3.5 py-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Descripción / Condiciones</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles sobre aplicación de la oferta..."
                  className="w-full bg-[#181824] text-white px-3.5 py-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Asociar a Productos */}
              <div className="space-y-2 p-3.5 bg-neutral-900 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-white">
                    Asociar a Productos ({selectedProductIds.length} seleccionados)
                  </label>
                  <span className="text-[10px] text-neutral-400">Si dejas vacío, aplica a todo</span>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                  {products.map((p) => {
                    const isChecked = selectedProductIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30' : 'bg-[#181824] hover:bg-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleProductSelection(p.id)}
                            className="rounded bg-neutral-900 border-neutral-700 text-[#D4AF37] focus:ring-0"
                          />
                          <span className="text-white truncate">{p.name}</span>
                        </div>
                        <span className="text-neutral-400 font-mono ml-2">${p.price}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="gold-gradient-btn px-5 py-2 rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>Guardando en Firestore...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingOffer ? 'Actualizar Oferta' : 'Guardar Oferta'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {deletingOffer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121217] rounded-3xl border border-neutral-800 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">¿Eliminar oferta?</h3>
            </div>
            <p className="text-xs text-neutral-300">
              ¿Estás seguro de que quieres eliminar la oferta <strong className="text-white">{deletingOffer.name}</strong>?
            </p>
            <p className="text-[11px] text-neutral-500">
              Esta acción ejecutará <code className="text-red-400">deleteDoc(doc(db, "offers", offerId))</code> y la borrará permanentemente de Cloud Firestore.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingOffer(null)}
                className="px-4 py-2 rounded-xl border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
