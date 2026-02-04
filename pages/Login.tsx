
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, ChevronRight, Eye, EyeOff, Monitor } from 'lucide-react';

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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gold-primary rounded-xl flex items-center justify-center shadow-lg">
            <Monitor size={24} className="text-black" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white tracking-tight">AIXUM Knowledge Portal</h1>
            <p className="text-sm text-dark-muted mt-1">Accedi alle risorse riservate</p>
          </div>
        </div>

        <div className="sb-card p-8 bg-dark-card shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-dark-muted uppercase tracking-widest ml-1">Email aziendale</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={14} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="sb-input pl-10"
                  placeholder="nome@azienda.it"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-dark-muted uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={14} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="sb-input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-white"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-400/5 p-3 rounded border border-red-400/20 font-medium">
                Invalid credentials. Please check your email or password.
              </div>
            )}

            <button disabled={loading} className="sb-button-primary w-full py-2.5">
              {loading ? 'Authenticating...' : 'Sign in'}
              {!loading && <ChevronRight size={16} />}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-dark-muted uppercase tracking-widest">
          Enterprise Security Enabled • 2026 AIXUM
        </p>
      </div>
    </div>
  );
};

export default Login;
