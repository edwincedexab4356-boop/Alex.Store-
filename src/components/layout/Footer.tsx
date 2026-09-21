import React from 'react';
import { LogoBadge } from '../common/LogoBadge';
import { StoreSettings } from '../../types';
import { ShieldCheck, Phone, Mail, MapPin, Instagram, Heart, Lock } from 'lucide-react';

interface FooterProps {
  settings: StoreSettings;
  onNavigate: (section: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onNavigate,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-[#060608] border-t border-neutral-900 pt-16 pb-12 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-900">
          {/* Brand Col (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <LogoBadge
              size="md"
              variant="horizontal"
              onClick={() => onNavigate('inicio')}
            />
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              {settings.storeName} es la tienda deportiva especializada en jerseys de fútbol oficiales, camisetas retro legendarias, conjuntos y accesorios para los verdaderos aficionados en Panamá.
            </p>
            <p className="text-[#ECC86A] text-xs font-semibold italic">
              "{settings.secondarySlogan}"
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-['Cinzel'] text-sm font-bold text-white uppercase tracking-wider">
              Navegación
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('inicio')} className="hover:text-[#ECC86A] transition-colors">
                  Inicio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('jerseys')} className="hover:text-[#ECC86A] transition-colors">
                  Jerseys de Clubes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categorias')} className="hover:text-[#ECC86A] transition-colors">
                  Categorías Deportivas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ofertas')} className="hover:text-[#ECC86A] transition-colors">
                  Ofertas y Descuentos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('nosotros')} className="hover:text-[#ECC86A] transition-colors">
                  Sobre Nosotros
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contacto')} className="hover:text-[#ECC86A] transition-colors">
                  Contacto & Pedidos
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="font-['Cinzel'] text-sm font-bold text-white uppercase tracking-wider">
              Categorías
            </h4>
            <ul className="space-y-2">
              <li>Jerseys de fútbol</li>
              <li>Jerseys de selecciones</li>
              <li>Ediciones Retro</li>
              <li>Shorts y Conjuntos</li>
              <li>Gorras y Accesorios</li>
              <li>Ediciones de Jugador</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="font-['Cinzel'] text-sm font-bold text-white uppercase tracking-wider">
              Contacto Panamá
            </h4>
            <div className="space-y-2.5">
              <p className="flex items-center gap-2 text-neutral-300">
                <Phone className="w-4 h-4 text-[#ECC86A] shrink-0" />
                <span>{settings.phone}</span>
              </p>
              <p className="flex items-center gap-2 text-neutral-300">
                <Mail className="w-4 h-4 text-[#ECC86A] shrink-0" />
                <span>{settings.email}</span>
              </p>
              <p className="flex items-start gap-2 text-neutral-400">
                <MapPin className="w-4 h-4 text-[#ECC86A] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Admin Link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-[11px] text-center sm:text-left">
            © {new Date().getFullYear()} {settings.storeName} — Todos los derechos reservados.
            <span className="block sm:inline sm:ml-2 text-neutral-600">
              Jerseys y más | Tu pasión, nuestra tienda
            </span>
          </p>

          <div className="flex items-center gap-4">
            {/* Payment badges notice */}
            <span className="text-[11px] text-neutral-500">
              Pagos: Yappy, ACH & Efectivo
            </span>

            {/* Admin discrete access button */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-[#D4AF37]/50 text-neutral-500 hover:text-[#D4AF37] text-[11px] transition-colors"
              title="Acceso al panel administrativo"
            >
              <Lock className="w-3 h-3" />
              <span>Acceso Administrativo</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
