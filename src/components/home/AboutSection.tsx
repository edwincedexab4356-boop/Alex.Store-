import React from 'react';
import { ShieldCheck, Trophy, Sparkles, Heart } from 'lucide-react';
import { LogoBadge } from '../common/LogoBadge';
import { StoreSettings } from '../../types';

interface AboutSectionProps {
  settings: StoreSettings;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings }) => {
  return (
    <section id="nosotros" className="py-20 bg-[#0b0b0f] border-t border-neutral-900 relative overflow-hidden">
      {/* Subtle gold glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Brand Story */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-[#D4AF37]/30 text-[#ECC86A] text-xs font-bold uppercase tracking-widest">
              <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
              Nuestra Esencia Deportiva
            </div>

            <h2 className="font-['Cinzel'] text-3xl sm:text-5xl font-black text-white leading-tight">
              PASIÓN PURA POR EL FÚTBOL EN{' '}
              <span className="gold-gradient-text">PANAMÁ</span>
            </h2>

            <p className="text-neutral-300 text-base leading-relaxed font-normal">
              En <strong className="text-white font-semibold">{settings.storeName}</strong>, nacimos con una misión clara: acercar a los verdaderos fanáticos del deporte rey las camisetas más icónicas, equipaciones de temporada de los mejores clubes del mundo y ediciones conmemorativas legendarias.
            </p>

            <p className="text-neutral-400 text-sm leading-relaxed">
              Cada prenda que ofrecemos pasa por una rigurosa selección de calidad: tejidos técnicos respirables, escudos bordados de alta precisión y acabados de primera clase tanto en versión Fan como en versión Jugador (Match Issue).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-[#14141c] border border-neutral-800 flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-neutral-900 border border-[#D4AF37]/30 text-[#ECC86A] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">100% Compromiso</h4>
                  <p className="text-xs text-neutral-400">Atención transparente antes, durante y después de tu entrega.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#14141c] border border-neutral-800 flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-neutral-900 border border-[#D4AF37]/30 text-[#ECC86A] shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Fanáticos como tú</h4>
                  <p className="text-xs text-neutral-400">Cuidamos cada detalle porque amamos el fútbol con la misma intensidad.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase Badge */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative p-8 rounded-3xl bg-gradient-to-b from-[#16161f] to-[#0c0c10] border border-[#D4AF37]/30 shadow-2xl flex flex-col items-center text-center max-w-sm w-full">
              <div className="mb-4">
                <LogoBadge size="lg" variant="badge-only" />
              </div>
              <h3 className="font-['Cinzel'] text-xl font-bold text-white mb-1">
                {settings.storeName}
              </h3>
              <p className="text-xs font-semibold text-[#ECC86A] uppercase tracking-widest mb-3">
                "{settings.slogan}"
              </p>
              <p className="text-xs text-neutral-400 italic">
                "{settings.secondarySlogan}"
              </p>
              <div className="w-full mt-6 pt-6 border-t border-neutral-800 flex justify-around text-center">
                <div>
                  <span className="block font-['Cinzel'] font-bold text-lg text-white">+1,500</span>
                  <span className="text-[10px] text-neutral-400 uppercase">Jerseys Entregados</span>
                </div>
                <div className="w-px bg-neutral-800" />
                <div>
                  <span className="block font-['Cinzel'] font-bold text-lg text-[#ECC86A]">100%</span>
                  <span className="text-[10px] text-neutral-400 uppercase">Clientes Felices</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
