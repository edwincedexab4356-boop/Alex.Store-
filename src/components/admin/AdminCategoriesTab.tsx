import React, { useState } from 'react';
import { Category, Product } from '../../types';
import { categoriesService } from '../../services/categoriesService';
import { useToast } from '../common/Toast';
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  Layers,
  Check,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface AdminCategoriesTabProps {
  categories: Category[];
  products: Product[];
}

export const AdminCategoriesTab: React.FC<AdminCategoriesTabProps> = ({
  categories,
  products,
}) => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  // Delete modal state
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setActive(cat.active !== undefined ? Boolean(cat.active) : true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Ingresa un nombre para la categoría', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        // updateDoc(doc(db, "categories", categoryId), updatedData)
        await categoriesService.update(editingCategory.id, {
          name: name.trim(),
          description: description.trim(),
          active,
        });
        showToast(`Categoría "${name}" actualizada en Firestore`, 'success');
      } else {
        // addDoc(collection(db, "categories"), categoryData)
        await categoriesService.create(name.trim(), description.trim());
        showToast(`Categoría "${name}" creada y guardada en Firestore`, 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving category:', err);
      showToast(`Error al guardar en Firestore: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    const currentActive = cat.active !== undefined ? Boolean(cat.active) : true;
    try {
      await categoriesService.toggleActive(cat.id, currentActive);
      showToast(`Categoría "${cat.name}" ${!currentActive ? 'activada' : 'desactivada'}`, 'success');
    } catch (err: any) {
      showToast(`Error al cambiar estado: ${err.message || 'Error'}`, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCat) return;
    setIsDeleting(true);
    try {
      // deleteDoc(doc(db, "categories", categoryId))
      await categoriesService.delete(deletingCat.id);
      showToast(`Categoría "${deletingCat.name}" eliminada de Firestore`, 'info');
      setDeletingCat(null);
    } catch (err: any) {
      console.error('Error deleting category:', err);
      showToast(`Error al eliminar categoría: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllCategories = async () => {
    if (categories.length === 0) {
      showToast('No hay categorías para eliminar', 'info');
      return;
    }
    if (!window.confirm(`¿Deseas eliminar permanentemente las ${categories.length} categorías de Firestore?`)) return;
    if (!window.confirm('Confirma nuevamente: las categorías se borrarán permanentemente de la base de datos.')) return;
    try {
      await categoriesService.deleteAll();
      showToast('Todas las categorías han sido eliminadas de Firestore', 'info');
    } catch (err: any) {
      showToast(`Error al eliminar categorías: ${err.message || 'Error'}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Cinzel'] text-2xl font-black text-white flex items-center gap-2">
            <span>CATEGORÍAS</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-sans font-bold">
              {categories.length}
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Persistencia en tiempo real en la colección <code className="text-[#ECC86A]">categories</code> de Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {categories.length > 0 && (
            <button
              onClick={handleDeleteAllCategories}
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
            <span>Nueva Categoría</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = products.filter(
            (p) => p.category.toLowerCase() === cat.name.toLowerCase()
          ).length;
          const isActive = cat.active !== undefined ? Boolean(cat.active) : true;

          return (
            <div
              key={cat.id}
              className={`bg-[#121217] p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isActive ? 'border-neutral-800 hover:border-neutral-700' : 'border-red-950/50 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#D4AF37]">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{cat.name}</h3>
                      <span className="text-[10px] text-neutral-500 font-mono">/{cat.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleActive(cat)}
                      title={isActive ? 'Desactivar categoría' : 'Activar categoría'}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        isActive ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-red-950/40 text-red-400 border border-red-800/40'
                      }`}
                    >
                      {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 line-clamp-2">
                  {cat.description || 'Sin descripción asignada.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-medium">
                  {count} {count === 1 ? 'producto' : 'productos'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                    title="Editar categoría"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingCat(cat)}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 transition-colors"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Crear / Editar Categoría */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121217] rounded-3xl border border-neutral-800 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-['Cinzel'] text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#D4AF37]" />
                <span>{editingCategory ? 'EDITAR CATEGORÍA' : 'NUEVA CATEGORÍA'}</span>
              </h3>
              <button
                onClick={() => !isSaving && setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1.5">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Jerseys Retro, Balones, Shorts..."
                  className="w-full bg-[#181824] text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1.5">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descripción para ayudar al cliente a navegar..."
                  className="w-full bg-[#181824] text-white px-3.5 py-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cat-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded bg-[#181824] border-neutral-700 text-[#D4AF37] focus:ring-0"
                />
                <label htmlFor="cat-active" className="text-white font-medium cursor-pointer">
                  Categoría Activa y visible en la tienda
                </label>
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
                      <span>{editingCategory ? 'Actualizar' : 'Guardar'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {deletingCat && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121217] rounded-3xl border border-neutral-800 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">¿Eliminar categoría?</h3>
            </div>
            <p className="text-xs text-neutral-300">
              ¿Estás seguro de que quieres eliminar la categoría <strong className="text-white">{deletingCat.name}</strong>?
            </p>
            <p className="text-[11px] text-neutral-500">
              Esta acción ejecutará <code className="text-red-400">deleteDoc(doc(db, "categories", categoryId))</code> y la borrará permanentemente de Cloud Firestore.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingCat(null)}
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
