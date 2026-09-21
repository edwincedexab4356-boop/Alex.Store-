import React, { useState } from 'react';
import { Order, OrderStatus, Product } from '../../types';
import { ordersService } from '../../services/ordersService';
import { useToast } from '../common/Toast';
import { Search, Eye, MessageCircle, MapPin, Calendar, Clock, Filter, Trash2, X, CheckCircle, Package, Plus, DollarSign, User, Phone, Check } from 'lucide-react';

interface AdminOrdersTabProps {
  orders: Order[];
  products?: Product[];
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({ orders, products = [] }) => {
  const { showToast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Manual Order Creation Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'domicilio' | 'interior' | 'retiro'>('domicilio');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(products[0]?.price || 45);
  const [shippingCost, setShippingCost] = useState<number>(4.50);
  const [initialStatus, setInitialStatus] = useState<OrderStatus>('Pendiente');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation modal state
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const statuses: { id: string; label: string; count?: number }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'pendiente', label: 'Pendientes' },
    { id: 'confirmado', label: 'Confirmados' },
    { id: 'preparando', label: 'Preparando' },
    { id: 'listo', label: 'Listos' },
    { id: 'enviado', label: 'Enviados' },
    { id: 'entregado', label: 'Entregados' },
    { id: 'cancelado', label: 'Cancelados' },
  ];

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setItemPrice(prod.price);
      if (prod.sizes && prod.sizes.length > 0) {
        setSelectedSize(prod.sizes[0]);
      }
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await ordersService.updateStatus(orderId, newStatus);
      showToast(`Estado del pedido actualizado a "${newStatus}"`, 'success');
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err: any) {
      showToast(`Error al actualizar estado: ${err.message || 'Error'}`, 'error');
    }
  };

  const handleConfirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      // deleteDoc(doc(db, "orders", orderId))
      await ordersService.delete(orderToDelete.id);
      showToast(`Pedido ${orderToDelete.orderNumber} eliminado permanentemente de Firestore`, 'info');
      if (selectedOrder?.id === orderToDelete.id) setSelectedOrder(null);
      setOrderToDelete(null);
    } catch (err: any) {
      console.error('Error deleting order:', err);
      showToast(`Error al eliminar pedido de Firestore: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteOrder = (orderId: string, orderNumber: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setOrderToDelete(order);
    }
  };

  const handleDeleteAllOrders = async () => {
    if (orders.length === 0) {
      showToast('No hay pedidos para eliminar', 'info');
      return;
    }
    if (!window.confirm(`¿Deseas eliminar permanentemente las ${orders.length} ventas y pedidos de la base de datos Firestore?`)) return;
    if (!window.confirm('Por favor confirma por segunda vez: esta acción borrará todas las órdenes registradas en la base de datos.')) return;
    try {
      await ordersService.deleteAll();
      showToast('Todas las ventas y pedidos han sido eliminados de Firestore', 'info');
      setSelectedOrder(null);
    } catch (err) {
      showToast('Error al eliminar pedidos de la base de datos', 'error');
    }
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      showToast('Por favor completa el nombre y teléfono del cliente', 'error');
      return;
    }

    const prod = products.find((p) => p.id === selectedProductId);
    const productName = prod ? prod.name : 'Jersey Personalizado / Especial';
    const productImage = prod?.images?.[0] || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=400&auto=format&fit=crop&q=80';

    const subtotal = itemPrice * itemQuantity;
    const total = subtotal + shippingCost;

    setIsSubmitting(true);
    try {
      const created = await ordersService.create({
        customer: {
          fullName: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim() || undefined,
        },
        deliveryMethod,
        deliveryAddress: deliveryAddress.trim() || (deliveryMethod === 'retiro' ? 'Retiro en punto de encuentro acordado' : 'Dirección por coordinar'),
        notes: orderNotes.trim() || undefined,
        items: [
          {
            productId: selectedProductId || `custom-${Date.now()}`,
            name: productName,
            size: selectedSize,
            quantity: itemQuantity,
            price: itemPrice,
            image: productImage,
          },
        ],
        subtotal,
        shippingCost,
        total,
        status: initialStatus,
      });

      showToast(`Pedido ${created.orderNumber} creado y guardado en Firestore`, 'success');
      setIsCreateModalOpen(false);
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setDeliveryAddress('');
      setOrderNotes('');
      setItemQuantity(1);
    } catch (err) {
      showToast('Error al guardar el nuevo pedido', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'todos' && o.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(term);
      const matchName = o.customer.fullName.toLowerCase().includes(term);
      const matchPhone = o.customer.phone.toLowerCase().includes(term);
      if (!matchNum && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'pendiente':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'confirmado':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      case 'preparando':
        return 'bg-purple-950/80 text-purple-300 border-purple-800';
      case 'listo':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800';
      case 'enviado':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
      case 'entregado':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'cancelado':
        return 'bg-red-950/80 text-red-300 border-red-800';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Cinzel'] text-2xl font-black text-white">
            GESTIÓN DE PEDIDOS
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Administra, agrega y elimina pedidos sincronizados en tiempo real con Firebase Firestore.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por # pedido, cliente o teléfono..."
              className="w-full bg-[#181824] text-xs text-white placeholder-neutral-500 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {orders.length > 0 && (
              <button
                onClick={handleDeleteAllOrders}
                className="px-3.5 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/80 text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
                title="Eliminar todas las ventas y pedidos de Firestore"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ELIMINAR VENTAS</span>
              </button>
            )}

            {/* Add Order Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="gold-gradient-btn px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap shadow-lg w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>NUEVO PEDIDO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Chips Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {statuses.map((st) => {
          const count = st.id === 'todos' ? orders.length : orders.filter((o) => o.status.toLowerCase() === st.id.toLowerCase()).length;
          const isSelected = filterStatus === st.id;

          return (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-300 via-[#D4AF37] to-amber-500 text-black shadow-md'
                  : 'bg-[#14141c] text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <span>{st.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/25 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-[#121217] rounded-3xl border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#16161f] text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="p-4">Pedido</th>
                <th className="p-4">Fecha & Hora</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4">Productos</th>
                <th className="p-4">Total</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-neutral-500">
                    No se encontraron pedidos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-850/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#ECC86A]">
                      {order.orderNumber}
                    </td>
                    <td className="p-4 text-neutral-400 whitespace-nowrap">
                      {order.date} <span className="text-[10px] text-neutral-500">({order.time})</span>
                    </td>
                    <td className="p-4 font-semibold text-white">
                      {order.customer.fullName}
                    </td>
                    <td className="p-4 text-neutral-300 whitespace-nowrap">
                      <a
                        href={`https://wa.me/${order.customer.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1"
                        title="Abrir chat en WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{order.customer.phone}</span>
                      </a>
                    </td>
                    <td className="p-4 text-neutral-300">
                      <span className="font-semibold">{order.items.length} ítems</span>
                      <span className="text-[11px] text-neutral-500 block truncate max-w-[180px]">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </span>
                    </td>
                    <td className="p-4 font-['Cinzel'] font-bold text-white text-sm whitespace-nowrap">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`text-[11px] font-bold uppercase rounded-lg px-2.5 py-1 border focus:outline-none cursor-pointer ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        <option value="Pendiente" className="bg-neutral-900 text-white">Pendiente</option>
                        <option value="Confirmado" className="bg-neutral-900 text-white">Confirmado</option>
                        <option value="Preparando" className="bg-neutral-900 text-white">Preparando</option>
                        <option value="Listo" className="bg-neutral-900 text-white">Listo</option>
                        <option value="Enviado" className="bg-neutral-900 text-white">Enviado</option>
                        <option value="Entregado" className="bg-neutral-900 text-white">Entregado</option>
                        <option value="Cancelado" className="bg-neutral-900 text-white">Cancelado</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700"
                          title="Ver detalle del pedido"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                          className="p-1.5 rounded-lg bg-neutral-800 text-neutral-500 hover:text-red-400 hover:bg-neutral-700"
                          title="Eliminar pedido de la base de datos"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Pedido Manual */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#111116] rounded-3xl border border-neutral-800 shadow-2xl p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-neutral-800 pb-4 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ECC86A]">
                REGISTRO MANUAL
              </span>
              <h3 className="font-['Cinzel'] text-xl font-black text-white mt-1">
                AGREGAR NUEVO PEDIDO
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                El pedido se guardará automáticamente en Firebase Firestore.
              </p>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-[#181822] text-white p-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+507 6000-0000"
                    className="w-full bg-[#181822] text-white p-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    className="w-full bg-[#181822] text-white p-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Método de Entrega
                  </label>
                  <select
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value as any)}
                    className="w-full bg-[#181822] text-white p-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="domicilio">Domicilio (Ciudad de Panamá)</option>
                    <option value="interior">Interior (Servientrega / Uno Express)</option>
                    <option value="retiro">Retiro Personal / Albrook</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Dirección o Punto de Entrega
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Ej. San Francisco, Calle 74, Edificio X / Sucursal Chitré"
                  className="w-full bg-[#181822] text-white p-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Producto del pedido */}
              <div className="p-4 rounded-2xl bg-[#181824] border border-neutral-800 space-y-3">
                <span className="font-bold text-neutral-300 block">Producto a Ordenar</span>
                
                {products.length > 0 && (
                  <div>
                    <label className="block text-neutral-400 mb-1 text-[11px]">Seleccionar Jersey / Producto:</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      className="w-full bg-[#101016] text-white p-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - ${p.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1 text-[11px]">Talla:</label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full bg-[#101016] text-white p-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                      <option value="Talla Única">Talla Única</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 text-[11px]">Cantidad:</label>
                    <input
                      type="number"
                      min={1}
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#101016] text-white p-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 text-[11px]">Precio c/u ($):</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={itemPrice}
                      onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#101016] text-white p-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Costo de Envío ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={shippingCost}
                    onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#181822] text-white p-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={initialStatus}
                    onChange={(e) => setInitialStatus(e.target.value as any)}
                    className="w-full bg-[#181822] text-white p-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Preparando">Preparando</option>
                    <option value="Listo">Listo</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Notas / Observaciones
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ej. Personalización con dorsal #10, entrega antes de las 5pm..."
                  className="w-full bg-[#181822] text-white p-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Total Summary */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-sm font-bold">
                <span className="text-neutral-400">Total a Cobrar:</span>
                <span className="font-['Cinzel'] text-base text-[#ECC86A]">
                  ${((itemPrice * itemQuantity) + shippingCost).toFixed(2)} USD
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold shadow-lg flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Guardando...' : 'GUARDAR PEDIDO EN FIRESTORE'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#111116] rounded-3xl border border-neutral-800 shadow-2xl p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#ECC86A]">
                  DETALLE DEL PEDIDO
                </span>
                <h3 className="font-mono text-2xl font-black text-white mt-0.5">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2 pr-8 sm:pr-0">
                <span
                  className={`text-xs font-bold uppercase rounded-lg px-3 py-1 border ${getStatusBadge(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-6 text-xs">
              {/* Customer Info */}
              <div className="bg-[#171722] p-4 rounded-2xl border border-neutral-800 space-y-2">
                <h4 className="font-['Cinzel'] font-bold text-white text-sm">
                  Datos del Cliente
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-300">
                  <p>
                    <span className="text-neutral-500">Nombre:</span>{' '}
                    <span className="font-bold text-white">{selectedOrder.customer.fullName}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-neutral-500">Teléfono:</span>{' '}
                    <a
                      href={`https://wa.me/${selectedOrder.customer.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      {selectedOrder.customer.phone}
                    </a>
                  </p>
                  {selectedOrder.customer.email && (
                    <p>
                      <span className="text-neutral-500">Email:</span> {selectedOrder.customer.email}
                    </p>
                  )}
                  <p>
                    <span className="text-neutral-500">Fecha:</span> {selectedOrder.date} ({selectedOrder.time})
                  </p>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-[#171722] p-4 rounded-2xl border border-neutral-800 space-y-2">
                <h4 className="font-['Cinzel'] font-bold text-white text-sm">
                  Entrega & Dirección
                </h4>
                <p className="text-neutral-300">
                  <span className="text-neutral-500">Método:</span>{' '}
                  <span className="font-bold text-white capitalize">{selectedOrder.deliveryMethod}</span>
                </p>
                <p className="text-neutral-300">
                  <span className="text-neutral-500">Dirección:</span>{' '}
                  <span className="text-white">{selectedOrder.deliveryAddress}</span>
                </p>
                {selectedOrder.notes && (
                  <p className="text-neutral-300 bg-black/40 p-2.5 rounded-xl border border-neutral-800 mt-2">
                    <span className="text-[#ECC86A] font-semibold">Notas:</span> {selectedOrder.notes}
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="bg-[#171722] p-4 rounded-2xl border border-neutral-800 space-y-3">
                <h4 className="font-['Cinzel'] font-bold text-white text-sm">
                  Jerseys y Productos ({selectedOrder.items.length})
                </h4>
                <div className="divide-y divide-neutral-800">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.image}
                          alt={it.name}
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-800"
                        />
                        <div>
                          <p className="font-bold text-white">{it.name}</p>
                          <p className="text-neutral-400 text-[11px]">
                            Talla: <span className="font-bold text-[#ECC86A]">{it.size}</span> | Cant: {it.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">${(it.price * it.quantity).toFixed(2)}</p>
                        <p className="text-[10px] text-neutral-500">${it.price.toFixed(2)} c/u</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="bg-[#151520] p-4 rounded-2xl border border-neutral-800 space-y-2">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Costo de Envío</span>
                  <span>{selectedOrder.shippingCost === 0 ? 'Gratis' : `$${selectedOrder.shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white border-t border-neutral-800 pt-2">
                  <span className="font-['Cinzel'] text-[#ECC86A]">Total del Pedido</span>
                  <span className="font-['Cinzel'] text-[#ECC86A]">${selectedOrder.total.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Change Status & Actions in Modal */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-neutral-400 font-semibold">Cambiar Estado:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                    className={`text-xs font-bold uppercase rounded-xl px-3 py-2 border focus:outline-none cursor-pointer ${getStatusBadge(
                      selectedOrder.status
                    )}`}
                  >
                    <option value="Pendiente" className="bg-neutral-900 text-white">Pendiente</option>
                    <option value="Confirmado" className="bg-neutral-900 text-white">Confirmado</option>
                    <option value="Preparando" className="bg-neutral-900 text-white">Preparando</option>
                    <option value="Listo" className="bg-neutral-900 text-white">Listo</option>
                    <option value="Enviado" className="bg-neutral-900 text-white">Enviado</option>
                    <option value="Entregado" className="bg-neutral-900 text-white">Entregado</option>
                    <option value="Cancelado" className="bg-neutral-900 text-white">Cancelado</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <a
                    href={`https://wa.me/${selectedOrder.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hola ${selectedOrder.customer.fullName}, te contactamos de ALEX.STOREPTY con respecto a tu pedido #${selectedOrder.orderNumber}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => handleDeleteOrder(selectedOrder.id, selectedOrder.orderNumber)}
                    className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/80 font-bold flex items-center gap-1.5"
                    title="Eliminar pedido de la base de datos"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Modal for Delete Order */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121217] rounded-3xl border border-neutral-800 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">¿Estás seguro de que quieres eliminar este pedido?</h3>
            </div>
            <p className="text-xs text-neutral-300">
              Pedido <strong className="text-white">#{orderToDelete.orderNumber}</strong> de{' '}
              <strong className="text-white">{orderToDelete.customer?.fullName || orderToDelete.customerName}</strong> por un total de{' '}
              <strong className="text-[#ECC86A]">${Number(orderToDelete.total).toFixed(2)}</strong>.
            </p>
            <p className="text-[11px] text-neutral-500">
              Esta acción ejecutará <code className="text-red-400">deleteDoc(doc(db, "orders", orderId))</code> y lo eliminará permanentemente de Cloud Firestore.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-xl border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteOrder}
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
