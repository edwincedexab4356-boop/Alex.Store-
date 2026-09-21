import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { LogoBadge } from '../common/LogoBadge';
import { authService, DEFAULT_ADMIN_CREDENTIALS } from '../../services/authService';
import { AdminUser } from '../../types';
import { useToast } from '../common/Toast';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToStore,
}) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState(DEFAULT_ADMIN_CREDENTIALS.email);
  const [password, setPassword] = useState(DEFAULT_ADMIN_CREDENTIALS.password);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await authService.login(email, password);
      showToast('Sesión iniciada como Administrador', 'success');
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      showToast('Credenciales incorrectas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = () => {
    setEmail(DEFAULT_ADMIN_CREDENTIALS.email);
    setPassword(DEFAULT_ADMIN_CREDENTIALS.password);
    showToast('Credenciales de administrador cargadas', 'info');
  };

  return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Stadium glow beams */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#111116] rounded-3xl border border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-8 relative z-10"
      >
        {/* Top Back to store button */}
        <button
          onClick={onBackToStore}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la tienda</span>
        </button>

        {/* Brand Badge */}
        <div className="flex flex-col items-center text-center mb-8">
          <LogoBadge size="md" variant="badge-only" />
          <h2 className="font-['Cinzel'] text-2xl font-black text-white mt-3">
            PANEL ADMINISTRADOR
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            ALEX.STOREPTY - Gestión de Tienda & Pedidos
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@alexstorepty.com"
                className="w-full bg-[#181824] text-sm text-white pl-10 pr-4 py-3 rounded-xl border border-neutral-700/80 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#181824] text-sm text-white pl-10 pr-4 py-3 rounded-xl border border-neutral-700/80 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Quick Demo Credentials helper */}
          <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Credencial admin demo: <strong>admin@alexstorepty.com</strong></span>
            <button
              type="button"
              onClick={fillQuickCredentials}
              className="text-[#ECC86A] hover:underline font-bold"
            >
              Autocompletar
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gold-gradient-btn w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-4 shadow-xl"
          >
            {loading ? (
              <span>VERIFICANDO ACCESO...</span>
            ) : (
              <>
                <span>INGRESAR AL DASHBOARD</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-800/80 text-center">
          <p className="text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Acceso protegido con Firebase Authentication</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
