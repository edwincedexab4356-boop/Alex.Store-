import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, Truck, Phone, User, Mail, MapPin, FileText, ShoppingBag, ShieldCheck, MessageCircle, Copy, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { ordersService } from '../../services/ordersService';
import { inventoryService } from '../../services/inventoryService';
import { DeliveryMethodId, Order, StoreSettings } from '../../types';
import { useToast } from '../common/Toast';

interface CheckoutModalProps {
  isOpen: boolean;
  settings: StoreSettings;
  onClose: () => void;
  onOrderCompleted?: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  settings,
  onClose,
  onOrderCompleted,
}) => {
  const { items, subtotal, clearCart } = useCart();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodId>('domicilio');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Selected delivery cost
  const selectedDelivery = settings.deliveryMethods.find((d) => d.id === deliveryMethod) || settings.deliveryMethods[0];
  const shippingCost = selectedDelivery ? selectedDelivery.price : 0;
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast('Por favor ingresa tu nombre completo', 'error');
      return;
    }
    if (!phone.trim()) {
      showToast('Por favor ingresa tu número de teléfono', 'error');
      return;
    }
    if (deliveryMethod !== 'retiro' && !deliveryAddress.trim()) {
      showToast('Por favor ingresa tu dirección de entrega', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('El carrito está vacío', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Map cart items into OrderItem format
      const orderItems = items.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        size: item.size,
        quantity: item.quantity,
        price: item.unitPrice,
        image: item.product.images[0] || '',
      }));

      // Create order in Firestore & local store
      const order = await ordersService.create({
        customer: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
        },
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'retiro' ? 'Retiro en punto acordado' : deliveryAddress.trim(),
        notes: notes.trim() || undefined,
        items: orderItems,
        subtotal,
        shippingCost,
        total,
      });

      // Decrement inventory stock
      await inventoryService.decrementStockForOrder(
        items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity }))
      );

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#FFF2A1', '#B89218', '#FFFFFF'],
        });
      } catch (err) {
        // Safe confetti fallback
      }

      setCreatedOrder(order);
      clearCart();
      if (onOrderCompleted) {
        onOrderCompleted(order);
      }
      showToast(`¡Pedido ${order.orderNumber} registrado exitosamente!`, 'success');
    } catch (err: any) {
      console.error('Error placing order', err);
      showToast('Ocurrió un error al procesar tu pedido. Intenta nuevamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOrderCode = () => {
    if (createdOrder) {
      navigator.clipboard.writeText(createdOrder.orderNumber);
      showToast('Número de pedido copiado al portapapeles', 'info');
    }
  };

  // Generate WhatsApp message for instant confirmation
  const getWhatsAppConfirmationUrl = () => {
    if (!createdOrder) return '#';
    const waPhone = settings.whatsapp.replace(/\D/g, '');
    const itemsList = createdOrder.items
      .map((i) => `• ${i.quantity}x ${i.name} (Talla: ${i.size}) - $${(i.price * i.quantity).toFixed(2)}`)
      .join('\n');

    const msg = `👑 *NUEVO PEDIDO - ALEX.STOREPTY*\n` +
      `🔢 *Pedido:* ${createdOrder.orderNumber}\n` +
      `👤 *Cliente:* ${createdOrder.customer.fullName}\n` +
      `📱 *Teléfono:* ${createdOrder.customer.phone}\n` +
      `📍 *Entrega:* ${createdOrder.deliveryAddress}\n` +
      (createdOrder.notes ? `📝 *Notas:* ${createdOrder.notes}\n` : '') +
      `\n🛍️ *Productos:*\n${itemsList}\n\n` +
      `💵 *Subtotal:* $${createdOrder.subtotal.toFixed(2)}\n` +
      `🚚 *Envío:* $${createdOrder.shippingCost.toFixed(2)}\n` +
      `💰 *TOTAL:* $${createdOrder.total.toFixed(2)}\n\n` +
      `_Confirmando mi pedido desde la tienda online alexstorepty.com_`;

    return `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-[#111116] rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-5 border-b border-neutral-800 bg-[#14141a] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-neutral-900 border border-[#D4AF37]/40 text-[#ECC86A]">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-['Cinzel'] text-lg font-black text-white">
                  {createdOrder ? '¡PEDIDO CONFIRMADO!' : 'FINALIZAR PEDIDO'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {createdOrder
                    ? 'Tu solicitud ha sido guardada en nuestro sistema'
                    : 'Completa tus datos para coordinar el envío de tu ropa deportiva'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Screen View */}
          {createdOrder ? (
            <div className="p-6 sm:p-8 text-center flex flex-col items-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#997A15] via-[#D4AF37] to-[#FFF2A1] p-1 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-[#D4AF37]" />
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#ECC86A] block mb-1">
                  ALEX.STOREPTY - Jerseys y más
                </span>
                <h4 className="font-['Cinzel'] text-2xl sm:text-3xl font-black text-white">
                  ¡Gracias por tu compra, {createdOrder.customer.fullName}!
                </h4>
                <p className="text-sm text-neutral-400 mt-2 max-w-lg mx-auto">
                  Hemos registrado tu pedido en nuestra base de datos. Tu orden se encuentra en estado{' '}
                  <strong className="text-amber-400">Pendiente de confirmación</strong>.
                </p>
              </div>

              {/* Order Code Badge */}
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-neutral-900 border border-[#D4AF37]/50">
                <span className="text-xs text-neutral-400">Código de Pedido:</span>
                <span className="font-mono font-black text-lg text-[#ECC86A]">
                  {createdOrder.orderNumber}
                </span>
                <button
                  onClick={copyOrderCode}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                  title="Copiar código"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              {/* Summary of Order */}
              <div className="w-full max-w-md bg-neutral-900/80 rounded-2xl p-4 border border-neutral-800 text-left text-xs space-y-2">
                <div className="flex justify-between font-bold text-white border-b border-neutral-800 pb-2">
                  <span>Productos ({createdOrder.items.length})</span>
                  <span>Total: ${createdOrder.total.toFixed(2)}</span>
                </div>
                {createdOrder.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-neutral-300">
                    <span>{i.quantity}x {i.name} (Talla {i.size})</span>
                    <span className="font-semibold">${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-neutral-800 text-neutral-400 flex justify-between">
                  <span>Entrega:</span>
                  <span className="text-neutral-200">{createdOrder.deliveryAddress}</span>
                </div>
              </div>

              {/* WhatsApp Call to Action */}
              <div className="w-full max-w-md flex flex-col gap-3">
                <a
                  href={getWhatsAppConfirmationUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/30 transition-all hover:scale-[1.02]"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Enviar Confirmación a WhatsApp</span>
                </a>

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                >
                  Regresar a la tienda
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form View */
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Customer Personal Details */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#ECC86A] mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>1. Datos del Cliente</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1.5 font-medium">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej. Juan Carlos Pérez"
                      className="w-full bg-[#181822] text-sm text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1.5 font-medium">
                      Teléfono celular / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ej. +507 6123-4567"
                      className="w-full bg-[#181822] text-sm text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-neutral-300 mb-1.5 font-medium">
                      Correo electrónico (opcional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full bg-[#181822] text-sm text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Method Selection */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#ECC86A] mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>2. Método de Entrega</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {settings.deliveryMethods.map((dm) => (
                    <label
                      key={dm.id}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-2 ${
                        deliveryMethod === dm.id
                          ? 'bg-[#1e1c18] border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                          : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value={dm.id}
                          checked={deliveryMethod === dm.id}
                          onChange={() => setDeliveryMethod(dm.id)}
                          className="mt-1 text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">{dm.title}</p>
                          <p className="text-[11px] text-neutral-400 mt-0.5">{dm.description}</p>
                          <span className="inline-block mt-1 text-[10px] text-[#ECC86A] font-medium">
                            ⏱️ {dm.estimatedTime}
                          </span>
                        </div>
                      </div>
                      <span className="font-['Cinzel'] font-bold text-sm text-[#ECC86A] shrink-0">
                        {dm.price === 0 ? 'GRATIS' : `$${dm.price.toFixed(2)}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Notes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#ECC86A] mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>3. Dirección de Entrega y Notas</span>
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1.5 font-medium">
                      Dirección detallada o Punto de referencia *
                    </label>
                    <textarea
                      required={deliveryMethod !== 'retiro'}
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder={
                        deliveryMethod === 'retiro'
                          ? 'Indica en qué sucursal o centro comercial preferirías retirar'
                          : 'Ej. Calle 50, PH Bellagio, Apto 12B, Ciudad de Panamá. Punto de referencia: frente al banco.'
                      }
                      className="w-full bg-[#181822] text-sm text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-300 mb-1.5 font-medium">
                      Notas adicionales (ej. Estampado de dorsal o instrucciones especiales)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej. Quiero estampado #10 MESSI en la camiseta de Argentina"
                      className="w-full bg-[#181822] text-sm text-white px-3.5 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary Breakdown Table */}
              <div className="bg-[#15151c] rounded-2xl p-4 border border-neutral-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                  Resumen del Pedido
                </h4>
                <div className="divide-y divide-neutral-800/80 text-xs">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-10 h-12 rounded-lg object-cover bg-neutral-900 border border-neutral-800 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white line-clamp-1">{item.product.name}</p>
                          <span className="text-neutral-400 text-[11px]">
                            Cant: {item.quantity} | Talla: <strong className="text-[#ECC86A]">{item.size}</strong>
                          </span>
                        </div>
                      </div>
                      <span className="font-['Cinzel'] font-bold text-white text-sm shrink-0">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-neutral-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span className="text-white font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Costo de Envío ({selectedDelivery?.title || 'Estándar'})</span>
                    <span className="text-[#ECC86A] font-semibold">
                      {shippingCost === 0 ? 'GRATIS' : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-neutral-800 font-['Cinzel']">
                    <span>TOTAL A PAGAR</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-500 text-xl font-black">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="gold-gradient-btn w-full py-4 rounded-2xl text-base font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl"
                >
                  {isSubmitting ? (
                    <span>PROCESANDO PEDIDO...</span>
                  ) : (
                    <>
                      <span>CONFIRMAR PEDIDO</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-neutral-500 text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Tus datos se encuentran protegidos. Coordinamos el pago por Yappy, ACH o Efectivo contra entrega.</span>
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
