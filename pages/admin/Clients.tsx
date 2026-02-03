
import React, { useEffect, useState } from 'react';
import { Users, Search, Mail, Building2, UserPlus, MoreVertical, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';

const AdminClients: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProfiles(data);
    setLoading(false);
  };

  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-gold-primary font-bold uppercase tracking-[0.3em] text-[10px]">User Governance</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold">Gestione <span className="gold-text-gradient italic">Clienti</span></h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Cerca cliente o azienda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all"
            />
          </div>
          <button className="px-8 py-4 gold-gradient text-black rounded-xl font-bold gold-glow transition-all hover:scale-105 flex items-center justify-center gap-2">
            <UserPlus size={18} /> Nuovo Account
          </button>
        </div>
      </header>

      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Caricamento profili...</div>
        ) : filteredProfiles.map((profile) => (
          <div key={profile.id} className="glass-card gold-border p-8 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-white/[0.03] transition-all">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center text-black font-black text-xl shadow-lg shadow-gold-primary/20">
                {profile.full_name?.[0] || profile.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white truncate">{profile.full_name || 'N/A'}</h3>
                  {profile.role === 'admin' && (
                    <span className="px-2 py-0.5 rounded-md bg-gold-primary/10 border border-gold-primary/20 text-gold-primary text-[10px] font-bold uppercase">Admin</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <Mail size={14} className="text-gold-primary" /> {profile.email}
                  </p>
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <Building2 size={14} className="text-gold-primary" /> {profile.company_name || 'Nessuna Azienda'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-10">
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-600">Membro dal</p>
                <p className="text-sm font-bold text-gray-400 mt-1">{new Date(profile.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="px-6 py-3 rounded-xl glass-card border border-white/10 hover:border-gold-primary font-bold text-xs uppercase tracking-widest transition-all">
                  Dettagli
                </button>
                <button className="p-3 rounded-xl glass-card border border-white/10 text-gray-500 hover:text-white transition-all">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!loading && filteredProfiles.length === 0 && (
          <div className="py-20 text-center glass-card rounded-[40px] border border-white/5">
            <Users size={64} className="mx-auto text-gray-800 mb-6" />
            <h2 className="text-2xl font-bold text-gray-600">Nessun cliente trovato</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClients;
