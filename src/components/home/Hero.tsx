import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Flame, Trophy } from 'lucide-react';
import { LogoBadge } from '../common/LogoBadge';
import { StoreSettings } from '../../types';

interface HeroProps {
  settings: StoreSettings;
  onExploreJerseys: () => void;
  onExploreOffers: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onExploreJerseys,
  onExploreOffers,
}) => {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden bg-[#08080a]">
      {/* Stadium Light & Ambient Glow Background Layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-center golden halo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-[#D4AF37]/15 via-[#ECC86A]/5 to-transparent rounded-full blur-[120px] opacity-70" />
        {/* Left floodlight beam */}
        <div className="absolute -top-10 -left-20 w-96 h-[600px] bg-gradient-to-br from-[#D4AF37]/10 to-transparent rotate-12 blur-[100px] opacity-40" />
        {/* Right floodlight beam */}
        <div className="absolute -top-10 -right-20 w-96 h-[600px] bg-gradient-to-bl from-[#D4AF37]/10 to-transparent -rotate-12 blur-[100px] opacity-40" />
        {/* Pitch stadium line mesh effect */}
        <div className="absolute inset-0 bg-[radial-gradient(#272733_1px,transparent_1px)] [background-size:28px_28px] opacity-25" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start"
          >
            {/* Top Brand Badge Capsule */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-neutral-900/90 border border-[#D4AF37]/40 mb-6 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
              <span className="font-['Cinzel'] text-xs uppercase tracking-widest text-[#ECC86A] font-bold">
                {settings.storeName}
              </span>
              <span className="text-neutral-500 text-xs">•</span>
              <span className="text-neutral-300 text-xs font-medium tracking-wide">
                {settings.slogan}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-['Cinzel'] text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] mb-5 text-white">
              VISTE TU{' '}
              <span className="gold-gradient-text drop-shadow-[0_4px_24px_rgba(212,175,55,0.3)]">
                PASIÓN
              </span>
            </h1>

            {/* Secondary Text */}
            <p className="font-['Montserrat'] text-lg sm:text-xl text-neutral-300 font-normal leading-relaxed max-w-2xl mb-8">
              Jerseys, ropa deportiva y productos para verdaderos fanáticos.
              <span className="block text-sm sm:text-base text-[#ECC86A]/85 mt-2 font-medium">
                "{settings.secondarySlogan}"
              </span>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button
                onClick={onExploreJerseys}
                className="gold-gradient-btn w-full sm:w-auto px-8 py-4 rounded-xl flex items-center justify-center gap-3 text-base tracking-wider uppercase group"
              >
                <span>VER JERSEYS</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onExploreOffers}
                className="gold-outline-btn w-full sm:w-auto px-7 py-4 rounded-xl flex items-center justify-center gap-2.5 text-base tracking-wider uppercase group"
              >
                <Flame className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                <span>VER OFERTAS</span>
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-neutral-800/80 w-full max-w-lg">
              <div className="flex flex-col items-center lg:items-start">
                <span className="font-['Cinzel'] text-xl font-bold text-white flex items-center gap-1">
                  100%
                </span>
                <span className="text-xs text-neutral-400">Calidad Premium</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="font-['Cinzel'] text-xl font-bold text-[#ECC86A] flex items-center gap-1">
                  24/48h
                </span>
                <span className="text-xs text-neutral-400">Envíos Panamá</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="font-['Cinzel'] text-xl font-bold text-white flex items-center gap-1">
                  Player & Fan
                </span>
                <span className="text-xs text-neutral-400">Versiones Oficiales</span>
              </div>
            </div>
          </motion.div>

          {/* Right Visual Column (Floating Showcase with Badge & Jerseys) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative flex flex-col items-center justify-center"
          >
            {/* Ambient circular golden ring behind logo */}
            <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
              {/* Outer decorative glowing ring */}
              <div className="absolute inset-4 rounded-full border border-[#D4AF37]/30 animate-[spin_60s_linear_infinite] shadow-[0_0_50px_rgba(212,175,55,0.2)]" />
              <div className="absolute inset-10 rounded-full border border-[#D4AF37]/15" />
              
              {/* Central Big Logo Badge */}
              <div className="relative z-20 transform hover:scale-105 transition-transform duration-500 drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]">
                <LogoBadge size="xl" variant="badge-only" />
              </div>

              {/* Floating Top Mini Card: Champions / Clubes */}
              <div className="absolute -top-2 -left-2 z-30 bg-neutral-900/95 border border-[#D4AF37]/40 p-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center text-black font-black">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Equipaciones 24/25</p>
                  <p className="text-[11px] text-[#ECC86A]">Clubes & Selecciones</p>
                </div>
              </div>

              {/* Floating Bottom Mini Card: Satisfacción */}
              <div className="absolute -bottom-2 -right-2 z-30 bg-neutral-900/95 border border-[#D4AF37]/40 p-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Garantía ALEX</p>
                  <p className="text-[11px] text-neutral-400">Tejido antitranspirante</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
