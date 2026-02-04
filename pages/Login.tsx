
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Lock, Mail, ChevronRight } from 'lucide-react';
import Logo from '../components/Logo';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 select-none">
      {/* Brand Identity */}
      <div className="mb-12 flex flex-col items-center animate-in fade-in duration-1000">
        <Logo size="md" withGlow={false} className="mb-3" />
        <p className="text-[10px] font-black text-dark-muted uppercase tracking-[0.5em] opacity-60">
          Knowledge Portal
        </p>
      </div>

      {/* Login Container */}
      <div className="w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-500">
        <div className="business-card rounded-[24px] p-8 md:p-10 shadow-2xl border-white/5">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">
              Accesso <span className="gold-text-gradient">Riservato</span>
            </h1>
            <p className="text-[12px] text-dark-muted mt-2 font-medium">
              Autenticazione richiesta per accedere alle risorse enterprise.
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-dark-muted ml-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={16} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-dark-lighter border border-dark-border text-sm text-white placeholder:text-dark-muted/40 focus:border-gold-primary/50 outline-none transition-all"
                  placeholder="nome@azienda.it"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-dark-muted ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={16} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-dark-lighter border border-dark-border text-sm text-white placeholder:text-dark-muted/40 focus:border-gold-primary/50 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 bg-dark-lighter border border-dark-border rounded accent-gold-primary cursor-pointer" />
                <span className="text-[11px] text-dark-muted group-hover:text-gray-300 transition-colors">Ricordami</span>
              </label>
              <button type="button" className="text-[10px] text-gold-primary hover:text-gold-secondary font-black uppercase tracking-widest transition-colors">
                Reset Password
              </button>
            </div>

            {error && (
              <div className="text-[10px] text-red-400 bg-red-500/5 p-4 rounded-xl border border-red-500/20 font-bold">
                Accesso negato. Verifica le tue credenziali.
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full py-4 gold-gradient text-black rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : 'Entra nel Portale'}
              {!loading && <ChevronRight size={16} />}
            </button>
          </form>
        </div>
      </div>
      
      {/* Footer System Info */}
      <footer className="mt-20">
        <p className="text-[9px] text-dark-muted uppercase tracking-[0.4em] font-bold text-center">
          © 2026 AIXUM Italian AI Solution <span className="mx-2 opacity-20">|</span> <span className="opacity-50">Secure Access v2.4</span>
        </p>
      </footer>
    </div>
  );
};

export default Login;
