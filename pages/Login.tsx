
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
    <div className="min-h-screen bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-gold rounded-full opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-gold rounded-full opacity-50"></div>

      <div className="relative w-full max-w-md">
        {/* Logo AIXUM */}
        <div className="flex flex-col items-center mb-12">
          <img 
            src="logo.png" 
            alt="AIXUM Italian AI Solutions" 
            className="h-24 md:h-32 w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]" 
          />
          <div className="h-px w-12 gold-gradient mt-4 opacity-50"></div>
          <p className="text-gray-400 mt-4 tracking-[0.3em] uppercase text-[10px] font-bold">Premium Knowledge Portal</p>
        </div>

        <div className="glass-card gold-border p-8 md:p-12 rounded-[32px] gold-glow">
          <h2 className="text-2xl font-bold mb-8">Bentornato</h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-primary">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-gold-primary focus:outline-none transition-all"
                  placeholder="La tua email..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-primary">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-gold-primary focus:outline-none transition-all"
                  placeholder="La tua password..."
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white transition-colors">
                <input type="checkbox" className="accent-gold-primary bg-white/5 border-white/10" />
                Ricordami
              </label>
              <button type="button" className="text-gold-primary hover:text-gold-secondary font-semibold">
                Password dimenticata?
              </button>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

            <button 
              disabled={loading}
              className="w-full py-4 gold-gradient text-black rounded-xl font-bold gold-glow transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
            >
              {loading ? 'Accesso in corso...' : (
                <>Accedi <ChevronRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-sm">
              Non hai un account? <span className="text-gold-primary font-bold cursor-pointer">Contattaci</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
