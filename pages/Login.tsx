
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
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Sfondo con bagliori dorati */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-gold rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-gold rounded-full animate-pulse [animation-delay:2s]"></div>
      </div>

      <div className="relative w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-1000">
        <div className="flex flex-col items-center mb-10">
          <Logo size="lg" className="mb-6" />
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-gold-primary/30"></div>
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.5em]">Knowledge Portal</p>
            <div className="h-[1px] w-8 bg-gold-primary/30"></div>
          </div>
        </div>

        <div className="glass-card border-2 border-gold-primary/20 p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 gold-gradient"></div>
          
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-white">Accesso <span className="gold-text-gradient">Riservato</span></h1>
            <p className="text-xs text-gray-500 mt-2 font-medium">Inserisci le credenziali AIXUM per continuare</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gold-primary">ID Account / Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold-primary transition-colors" size={16} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 text-sm rounded-2xl bg-white/[0.03] border-2 border-white/5 text-white placeholder:text-gray-700 focus:border-gold-primary/50 focus:bg-gold-primary/5 outline-none transition-all"
                  placeholder="nome@azienda.it"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gold-primary">Chiave di Accesso</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-gold-primary transition-colors" size={16} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 text-sm rounded-2xl bg-white/[0.03] border-2 border-white/5 text-white placeholder:text-gray-700 focus:border-gold-primary/50 focus:bg-gold-primary/5 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gold-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer text-[11px] text-gray-500 hover:text-gray-300 transition-colors">
                <input type="checkbox" className="w-4 h-4 accent-gold-primary bg-white/5 border-white/10 rounded-lg" />
                Ricordami
              </label>
              <button type="button" className="text-[11px] text-gold-primary hover:text-gold-secondary font-black uppercase tracking-widest transition-colors">
                Hai dimenticato la chiave?
              </button>
            </div>

            {error && (
              <div className="text-[11px] text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 font-bold animate-shake">
                Credenziali errate o account non autorizzato.
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full py-4 gold-gradient text-black rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(212,175,55,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : 'Entra nel Portale'}
              {!loading && <ChevronRight size={18} />}
            </button>
          </form>
        </div>
        
        <p className="mt-10 text-center text-[10px] text-gray-600 uppercase tracking-[0.4em] font-black">
          © 2026 <span className="text-gold-primary">AIXUM Italian AI Solution</span>. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
