import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Search, ShieldCheck, Phone, Sparkles } from 'lucide-react';
import { LogoBadge } from '../common/LogoBadge';
import { useCart } from '../../context/CartContext';
import { StoreSettings } from '../../types';

interface NavbarProps {
  settings: StoreSettings;
  activeSection: string;
  onNavigate: (section: string) => void;
  onOpenAdmin: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeSection,
  onNavigate,
  onOpenAdmin,
  onOpenSearch,
}) => {
  const { totalItems, setIsOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'jerseys', label: 'Jerseys' },
    { id: 'categorias', label: 'Categorías' },
    { id: 'ofertas', label: 'Ofertas' },
    { id: 'nosotros', label: 'Nosotros' },
    { id: 'contacto', label: 'Contacto' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#08080a]/95 backdrop-blur-md border-b border-[#D4AF37]/20 shadow-[0_4px_30px_rgba(0,0,0,0.8)] py-2.5'
          : 'bg-gradient-to-b from-black/90 via-[#0a0a0d]/80 to-transparent py-4'
      }`}
    >
      {/* Top Banner ticker */}
      {settings.bannerNotice && !isScrolled && (
        <div className="bg-[#121115] border-b border-[#D4AF37]/15 py-1 px-4 text-center text-[11px] text-[#ECC86A] font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
          <span>{settings.bannerNotice}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <LogoBadge
              size="sm"
              variant="horizontal"
              onClick={() => handleLinkClick('inicio')}
              className="hover:opacity-95"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all relative ${
                    isActive
                      ? 'text-black bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-400 font-semibold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  {link.label}
                  {link.id === 'ofertas' && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-red-500 text-white rounded-full font-bold uppercase tracking-wider">
                      Hot
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              aria-label="Buscar jerseys"
              className="p-2 text-neutral-300 hover:text-[#ECC86A] hover:bg-neutral-800/70 rounded-full transition-colors"
              title="Buscar en la tienda"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Ver carrito"
              className="relative p-2.5 bg-neutral-900/90 hover:bg-neutral-800 text-[#ECC86A] border border-[#D4AF37]/40 rounded-full transition-all duration-200 hover:scale-105 shadow-[0_0_12px_rgba(212,175,55,0.2)]"
              title="Carrito de compras"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-br from-amber-300 via-[#D4AF37] to-amber-600 text-black font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Hidden / Discreet Admin Access */}
            <button
              onClick={onOpenAdmin}
              aria-label="Acceso administrativo"
              className="p-2 text-neutral-500 hover:text-[#D4AF37] hover:bg-neutral-900/80 rounded-full transition-colors"
              title="Panel de Administración"
            >
              <ShieldCheck className="w-4 h-4 opacity-60 hover:opacity-100" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-300 hover:text-white rounded-lg"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#D4AF37]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[60px] bg-[#0c0c10]/98 backdrop-blur-xl border-b border-[#D4AF37]/30 shadow-2xl p-6 transition-all animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-300 via-[#D4AF37] to-amber-500 text-black'
                      : 'text-neutral-200 hover:bg-neutral-800/80 hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.id === 'ofertas' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-600 text-white font-bold">
                      OFERTAS
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-4 border-t border-neutral-800 mt-2 flex flex-col gap-3">
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 text-sm font-semibold"
              >
                <Phone className="w-4 h-4" />
                <span>Atención WhatsApp: {settings.phone}</span>
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="flex items-center justify-center gap-2 py-2 text-xs text-neutral-400 hover:text-[#D4AF37]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Acceso Administración</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
