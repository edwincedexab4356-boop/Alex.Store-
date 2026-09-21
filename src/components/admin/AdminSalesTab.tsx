import React, { useState, useEffect } from 'react';
import { Sale, Product } from '../../types';
import { salesService } from '../../services/salesService';
import { useToast } from '../common/Toast';
import {
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  CreditCard,
  User,
  ShoppingBag,
  TrendingUp,
  Clock,
  Filter,
  AlertTriangle,
  X,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface AdminSalesTabProps {
  products: Product[];
  orders?: any[];
}

export const AdminSalesTab: React.FC<AdminSalesTabProps> = ({ products }) => {
  const { showToast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | 'day' | 'week' | 'month'>('all');

  // Modal State for New Sale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Yappy');
  const [notes, setNotes] = useState('');
  const [selectedItems, setSelectedItems] = useState<
    Array<{ productId: string; name: string; size: string; quantity: number; price: number }>
  >([]);

  // Temp selector in modal
  const [tempProductId, setTempProductId] = useState(products[0]?.id || '');
  const [tempSize, setTempSize] = useState('M');
  const [tempQty, setTempQty] = useState(1);

  // Delete Confirmation Modal
  const [deletingSale, setDeletingSale] = useState<Sale | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Initial fetch from Firestore
    salesService
      .getAll()
      .then((data) => {
        setSales(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading sales:', err);
        setLoading(false);
      });

    // Real-time synchronization with Firestore
    const unsubscribe = salesService.subscribe((updatedSales) => {
      setSales(updatedSales);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredSales = salesService.filterSales(sales, period);

  // Metrics
  const totalAmount = filteredSales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const dailySales = salesService.filterSales(sales, 'day');
  const dailyTotal = dailySales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const weeklySales = salesService.filterSales(sales, 'week');
  const weeklyTotal = weeklySales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const monthlySales = salesService.filterSales(sales, 'month');
  const monthlyTotal = monthlySales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);

  // Chart Data: Group by Date
  const chartDataMap = filteredSales.reduce((acc, sale) => {
    const d = new Date(sale.createdAt).toLocaleDateString('es-PA', { month: 'short', day: 'numeric' });
    acc[d] = (acc[d] || 0) + (Number(sale.total) || 0);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(chartDataMap).map(([date, total]) => ({
    date,
    total: Math.round(total * 100) / 100,
  })).slice(-10);

  const handleAddItemToSale = () => {
    const prod = products.find((p) => p.id === tempProductId);
    if (!prod) return;

    setSelectedItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        name: prod.name,
        size: tempSize,
        quantity: Number(tempQty),
        price: prod.price,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const currentSubtotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      showToast('Ingresa el nombre del cliente', 'error');
      return;
    }
    if (selectedItems.length === 0) {
      showToast('Agrega al menos un producto a la venta', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await salesService.create({
        customerName: customerName.trim(),
        paymentMethod,
        products: selectedItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
        })),
        subtotal: currentSubtotal,
        total: currentSubtotal,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
      });

      showToast('Venta guardada correctamente en Firestore', 'success');
      // Reset form only after successful Firestore write
      setCustomerName('');
      setSelectedItems([]);
      setNotes('');
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving sale to Firestore:', err);
      showToast(`Error al guardar la venta: ${err.message || 'Error de conexión'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSale) return;
    setIsDeleting(true);
    try {
      await salesService.delete(deletingSale.id);
      showToast('Venta eliminada correctamente de Firestore', 'info');
      setDeletingSale(null);
    } catch (err: any) {
      console.error('Error deleting sale:', err);
      showToast(`Error al eliminar venta: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllSales = async () => {
    if (sales.length === 0) {
      showToast('No hay ventas registradas para eliminar', 'info');
      return;
    }
    if (!window.confirm(`¿Deseas eliminar permanentemente las ${sales.length} ventas de Firestore?`)) return;
    if (!window.confirm('Confirma nuevamente: se eliminarán permanentemente de la base de datos.')) return;

    try {
      await salesService.deleteAll();
      showToast('Todas las ventas han sido eliminadas de Firestore', 'info');
    } catch (err: any) {
      showToast(`Error al eliminar ventas: ${err.message || 'Error'}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Cinzel'] text-2xl font-black text-white flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-[#D4AF37]" />
            <span>VENTAS Y REGISTRO FINANCIERO</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Persistencia en tiempo real en la colección <code className="text-[#ECC86A]">sales</code> de Firestore.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {sales.length > 0 && (
            <button
              onClick={handleDeleteAllSales}
              className="px-3 py-2.5 rounded-xl border border-red-900/60 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Todas</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="gold-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Venta</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121217] p-5 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Ventas de Hoy</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">${dailyTotal.toFixed(2)}</p>
          <p className="text-[11px] text-neutral-500 mt-1">{dailySales.length} transacciones hoy</p>
        </div>

        <div className="bg-[#121217] p-5 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Esta Semana</span>
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="text-2xl font-black text-white mt-2">${weeklyTotal.toFixed(2)}</p>
          <p className="text-[11px] text-neutral-500 mt-1">{weeklySales.length} transacciones últimos 7 días</p>
        </div>

        <div className="bg-[#121217] p-5 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Este Mes</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">${monthlyTotal.toFixed(2)}</p>
          <p className="text-[11px] text-neutral-500 mt-1">{monthlySales.length} transacciones este mes</p>
        </div>

        <div className="bg-[#121217] p-5 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Histórico</span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">
            ${sales.reduce((sum, s) => sum + (Number(s.total) || 0), 0).toFixed(2)}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">{sales.length} ventas registradas en total</p>
        </div>
      </div>

      {/* Chart Section */}
      {chartData.length > 0 && (
        <div className="bg-[#121217] p-6 rounded-3xl border border-neutral-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
            <span>Tendencia de Ingresos por Ventas ($)</span>
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" stroke="#777" fontSize={11} />
                <YAxis stroke="#777" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181820', borderColor: '#333', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  formatter={(value: any) => [`$${value}`, 'Total']}
                />
                <Bar dataKey="total" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Period Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121217] p-3 rounded-2xl border border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-neutral-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Periodo:</span>
          </span>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              period === 'all' ? 'bg-[#D4AF37] text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Todas ({sales.length})
          </button>
          <button
            onClick={() => setPeriod('day')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              period === 'day' ? 'bg-[#D4AF37] text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Del Día ({dailySales.length})
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              period === 'week' ? 'bg-[#D4AF37] text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            De la Semana ({weeklySales.length})
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              period === 'month' ? 'bg-[#D4AF37] text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Del Mes ({monthlySales.length})
          </button>
        </div>

        <div className="text-xs text-neutral-400">
          Total periodo seleccionado:{' '}
          <strong className="text-white">${totalAmount.toFixed(2)}</strong>
        </div>
      </div>

      {/* Sales Table / Cards */}
      <div className="bg-[#121217] rounded-3xl border border-neutral-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-400">
            <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Cargando ventas desde Firestore...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#D4AF37]" />
            <p className="text-sm font-bold text-neutral-400">No hay ventas en este periodo</p>
            <p className="text-xs mt-1">Registra una nueva venta con el botón "Crear Venta" arriba.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-[#181820] text-neutral-400 uppercase text-[10px] font-bold border-b border-neutral-800">
                <tr>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-4 py-3.5">Fecha</th>
                  <th className="px-4 py-3.5">Productos</th>
                  <th className="px-4 py-3.5">Método de Pago</th>
                  <th className="px-4 py-3.5 text-right">Total</th>
                  <th className="px-5 py-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#D4AF37]" />
                        <span>{sale.customerName}</span>
                      </div>
                      {sale.notes && (
                        <p className="text-[10px] text-neutral-400 font-normal mt-0.5">{sale.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-neutral-400 whitespace-nowrap">
                      {new Date(sale.createdAt).toLocaleDateString('es-PA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {sale.products.map((p, idx) => (
                          <div key={idx} className="text-[11px] text-neutral-300 flex items-center gap-1.5">
                            <span className="font-semibold text-white">{p.quantity}x</span>
                            <span>{p.name}</span>
                            {p.size && (
                              <span className="px-1.5 py-0.2 bg-neutral-800 text-neutral-400 rounded text-[9px]">
                                {p.size}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#D4AF37]/10 text-[#ECC86A] border border-[#D4AF37]/30">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-black text-white text-sm whitespace-nowrap">
                      ${Number(sale.total).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => setDeletingSale(sale)}
                        title="Eliminar venta de Firestore"
                        className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Crear Nueva Venta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121217] rounded-3xl border border-neutral-800 max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="font-['Cinzel'] text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#D4AF37]" />
                <span>REGISTRAR NUEVA VENTA</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej: Juan Pérez / Venta mostrador"
                  className="w-full bg-[#181824] text-xs text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Método de Pago
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#181824] text-xs text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Yappy">Yappy</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta de Crédito / Débito">Tarjeta de Crédito / Débito</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                </select>
              </div>

              {/* Items Selector */}
              <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                <label className="block text-xs font-bold text-neutral-200">
                  Agregar Productos a la Venta
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={tempProductId}
                    onChange={(e) => setTempProductId(e.target.value)}
                    className="sm:col-span-2 bg-[#181824] text-xs text-white px-2.5 py-2 rounded-xl border border-neutral-700"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ${p.price}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <select
                      value={tempSize}
                      onChange={(e) => setTempSize(e.target.value)}
                      className="w-1/2 bg-[#181824] text-xs text-white px-2 py-2 rounded-xl border border-neutral-700"
                    >
                      {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={tempQty}
                      onChange={(e) => setTempQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-1/2 bg-[#181824] text-xs text-white px-2 py-2 rounded-xl border border-neutral-700 text-center"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddItemToSale}
                  className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-[#ECC86A] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir a la lista de venta</span>
                </button>

                {/* Selected Items List */}
                {selectedItems.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                    {selectedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs bg-[#181824] px-3 py-2 rounded-lg"
                      >
                        <div>
                          <span className="font-bold text-white">{item.quantity}x {item.name}</span>{' '}
                          <span className="text-neutral-400">({item.size})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#ECC86A]">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Notas / Observaciones
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Retiró en tienda física"
                  className="w-full bg-[#181824] text-xs text-white px-3.5 py-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Total Display */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-neutral-400">Total a Cobrar:</span>
                <span className="text-lg font-black text-[#ECC86A]">
                  ${currentSubtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="gold-gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>Guardando en Firestore...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Guardar Venta</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {deletingSale && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121217] rounded-3xl border border-neutral-800 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">¿Eliminar venta?</h3>
            </div>
            <p className="text-xs text-neutral-300">
              ¿Estás seguro de que quieres eliminar esta venta de{' '}
              <strong className="text-white">{deletingSale.customerName}</strong> por un total de{' '}
              <strong className="text-[#ECC86A]">${Number(deletingSale.total).toFixed(2)}</strong>?
            </p>
            <p className="text-[11px] text-neutral-500">
              Esta acción ejecutará <code className="text-red-400">deleteDoc(doc(db, "sales", saleId))</code> y la borrará permanentemente de Cloud Firestore.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingSale(null)}
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
