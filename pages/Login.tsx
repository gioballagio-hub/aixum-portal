
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Lock, Mail, ChevronRight } from 'lucide-react';

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
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-gold rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-gold rounded-full"></div>
      </div>

      <div className="relative w-full max-w-[380px] animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center mb-8">
          <img src="logo.png" alt="AIXUM" className="h-12 w-auto mb-4" />
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">Knowledge Portal</p>
        </div>

        <div className="glass-card border border-white/10 p-8 rounded-xl shadow-2xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white">Accesso Riservato</h1>
            <p className="text-xs text-gray-500 mt-1">Inserisci le tue credenziali aziendali</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gold-primary opacity-80">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-700 focus:border-gold-primary outline-none transition-all"
                  placeholder="nome@azienda.it"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gold-primary opacity-80">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-700 focus:border-gold-primary outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gold-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-gray-500 hover:text-gray-300 transition-colors">
                <input type="checkbox" className="w-3 h-3 accent-gold-primary bg-white/5 border-white/10 rounded" />
                Mantieni accesso
              </label>
              <button type="button" className="text-[11px] text-gold-primary hover:text-gold-secondary font-medium">
                Reset password
              </button>
            </div>

            {error && (
              <div className="text-[11px] text-red-400 bg-red-500/5 p-2.5 rounded border border-red-500/10">
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full py-2.5 gold-gradient text-black rounded-lg font-bold text-sm shadow-lg shadow-gold-primary/10 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Verifica...' : 'Accedi al Portale'}
              {!loading && <ChevronRight size={14} />}
            </button>
          </form>
        </div>
        
        <p className="mt-6 text-center text-[11px] text-gray-600 uppercase tracking-widest font-medium">
          Powered by <span className="text-gold-primary">AIXUM Solution</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
