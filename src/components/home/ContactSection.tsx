import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, Clock, Instagram, Facebook, Send, Mail, CheckCircle2 } from 'lucide-react';
import { StoreSettings } from '../../types';
import { useToast } from '../common/Toast';

interface ContactSectionProps {
  settings: StoreSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      showToast('Por favor completa tu nombre y mensaje.', 'error');
      return;
    }

    const waPhone = settings.whatsapp.replace(/\D/g, '');
    const fullMsg = `Hola ALEX.STOREPTY! Mi nombre es ${name.trim()} (${phone.trim() || 'Sin teléfono'}). Consulta: ${message.trim()}`;
    const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(fullMsg)}`;
    window.open(url, '_blank');

    setSent(true);
    showToast('Redirigiendo a WhatsApp...', 'success');
  };

  return (
    <section id="contacto" className="py-20 bg-[#08080a] border-t border-neutral-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#ECC86A] block mb-2">
            Estamos para servirte
          </span>
          <h2 className="font-['Cinzel'] text-3xl sm:text-5xl font-black text-white">
            CONTÁCTANOS Y <span className="gold-gradient-text">PEDIDOS</span>
          </h2>
          <p className="text-neutral-400 text-sm mt-3">
            ¿Buscas un jersey específico o necesitas asesoría con las tallas? Escríbenos directamente o visítanos en nuestras redes sociales.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* WhatsApp Direct */}
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-[#121218] border border-neutral-800 hover:border-emerald-500/60 transition-all flex items-start gap-4 group"
            >
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 uppercase font-semibold">Atención Rápida WhatsApp</span>
                <p className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {settings.whatsapp}
                </p>
                <span className="text-xs text-emerald-400/90 font-medium mt-0.5 inline-block">
                  Haz clic para chatear en tiempo real →
                </span>
              </div>
            </a>

            {/* Address */}
            <div className="p-5 rounded-2xl bg-[#121218] border border-neutral-800 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-neutral-900 border border-[#D4AF37]/30 text-[#ECC86A]">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 uppercase font-semibold">Ubicación y Cobertura</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  {settings.address}
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Envíos a todo el territorio nacional de Panamá.
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="p-5 rounded-2xl bg-[#121218] border border-neutral-800 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-neutral-900 border border-[#D4AF37]/30 text-[#ECC86A]">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 uppercase font-semibold">Horario de Atención</span>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {settings.hours}
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="p-5 rounded-2xl bg-[#121218] border border-neutral-800 flex items-center justify-around">
              <a
                href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-[#ECC86A] transition-colors"
              >
                <Instagram className="w-5 h-5 text-pink-500" />
                <span>{settings.instagram}</span>
              </a>

              <div className="w-px h-6 bg-neutral-800" />

              <span className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                <Facebook className="w-5 h-5 text-blue-500" />
                <span>{settings.facebook}</span>
              </span>
            </div>
          </div>

          {/* Quick Consultation Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#121218] rounded-3xl border border-neutral-800 p-6 sm:p-8">
            <h3 className="font-['Cinzel'] text-xl font-bold text-white mb-2">
              Envíanos un mensaje
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              Te responderemos en minutos directamente a tu WhatsApp.
            </p>

            {sent ? (
              <div className="py-12 text-center flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
                <h4 className="text-base font-bold text-white mb-1">¡Mensaje preparado!</h4>
                <p className="text-xs text-neutral-400 max-w-sm mb-4">
                  Se ha generado tu consulta para enviarla por WhatsApp.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="text-xs text-[#ECC86A] underline"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Tu nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Alexis González"
                      className="w-full bg-[#181824] text-sm text-white px-3.5 py-2.5 rounded-xl border border-neutral-700/80 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Tu WhatsApp / Teléfono
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ej. +507 6000-0000"
                      className="w-full bg-[#181824] text-sm text-white px-3.5 py-2.5 rounded-xl border border-neutral-700/80 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    ¿Qué producto o talla te interesa consultar? *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ej. Hola, estoy buscando la camiseta de Real Madrid en talla L con estampado de Vinicius Jr. ¿La tienen disponible?"
                    className="w-full bg-[#181824] text-sm text-white px-3.5 py-2.5 rounded-xl border border-neutral-700/80 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <button
                  type="submit"
                  className="gold-gradient-btn w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar por WhatsApp</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
