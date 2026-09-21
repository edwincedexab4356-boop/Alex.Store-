import React from 'react';
import { ShieldCheck, Truck, Headphones, Award } from 'lucide-react';

export const FeatureBar: React.FC = () => {
  const features = [
    {
      icon: <Award className="w-6 h-6 text-[#ECC86A]" />,
      title: 'Jerseys Calidad Premium',
      description: 'Versiones Fan y Match Player Issue con detalles oficiales.',
    },
    {
      icon: <Truck className="w-6 h-6 text-[#ECC86A]" />,
      title: 'Envíos a Todo Panamá',
      description: 'Entrega a domicilio y envíos seguros a provincias centrales y Chiriquí.',
    },
    {
      icon: <Headphones className="w-6 h-6 text-[#ECC86A]" />,
      title: 'Atención Personalizada',
      description: 'Consultas directas y confirmación vía WhatsApp 24/7.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#ECC86A]" />,
      title: 'Garantía ALEX.STOREPTY',
      description: 'Seguridad en cada pedido con seguimiento transparente.',
    },
  ];

  return (
    <section className="bg-[#0e0e13] border-y border-[#D4AF37]/20 py-8 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-[#D4AF37]/40 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-[#D4AF37]/25 shrink-0">
                {f.icon}
              </div>
              <div>
                <h2 className="text-sm font-bold text-white font-['Montserrat'] mb-1">
                  {f.title}
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
