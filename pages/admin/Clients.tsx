
import React, { useEffect, useState } from 'react';
import { Users, Search, Mail, Building2, UserPlus, Loader2, CheckCircle2, Shield, UserX, UserCheck, Settings2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';

const AdminClients: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setProfiles(data);
    setLoading(false);
  };

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    
    if (!error) {
      showToast(currentStatus ? "Account disattivato" : "Account attivato con successo");
      fetchProfiles();
    }
  };

  const changeRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'client' : 'admin';
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', id);
    
    if (!error) {
      showToast(`Ruolo aggiornato a ${newRole.toUpperCase()}`);
      fetchProfiles();
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold-primary/10 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Anagrafica <span className="gold-text-gradient">Clienti</span></h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-1 font-bold">Gestione accessi Enterprise</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
            <input 
              type="text"
              placeholder="Filtra utenti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-lg bg-white/5 border border-gold-primary/20 text-white focus:border-gold-primary outline-none transition-all w-48 md:w-64"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 gold-gradient text-black rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2"
          >
            <UserPlus size={14} /> Guida Attivazione
          </button>
        </div>
      </header>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-gold-primary" size={32} /></div>
      ) : (
        <div className="grid gap-4">
          {filteredProfiles.map((profile) => (
            <div key={profile.id} className={`glass-card border ${profile.is_active ? 'border-gold-primary/20' : 'border-red-500/30 bg-red-500/[0.02]'} p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-gold-primary/40 transition-all shadow-lg`}>
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-lg ${profile.is_active ? 'bg-gold-primary/10 text-gold-primary border border-gold-primary/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'} flex items-center justify-center font-black uppercase shrink-0`}>
                  {profile.full_name?.[0] || profile.email[0]}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate">{profile.full_name || 'Account in attesa'}</p>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${profile.role === 'admin' ? 'bg-gold-primary/10 text-gold-primary border border-gold-primary/20' : 'bg-white/5 text-gray-500 border border-white/5'}`}>
                      {profile.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 truncate"><Mail size={10} className="text-gold-primary" /> {profile.email}</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1"><Building2 size={10} className="text-gold-primary" /> {profile.company_name || 'Individual'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 justify-end border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                <button 
                  onClick={() => changeRole(profile.id, profile.role)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-500 hover:text-gold-primary hover:border-gold-primary/30 transition-all flex items-center gap-2 text-[10px] font-bold uppercase"
                  title="Cambia Ruolo"
                >
                  <Shield size={14} /> <span className="hidden md:inline">Ruolo</span>
                </button>
                <button 
                  onClick={() => toggleActiveStatus(profile.id, profile.is_active)}
                  className={`p-2 px-4 rounded-lg border flex items-center gap-2 text-[10px] font-bold uppercase transition-all shadow-sm ${profile.is_active ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10' : 'bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10'}`}
                >
                  {profile.is_active ? <UserCheck size={14} /> : <UserX size={14} />}
                  <span>{profile.is_active ? 'Attivo' : 'Sospeso'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Guida Attivazione */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md glass-card gold-border rounded-xl p-8 animate-in zoom-in-95">
            <h2 className="text-xl font-display font-bold mb-2 text-white">Guida <span className="gold-text-gradient">Attivazione</span></h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-6 font-bold">Procedura di sicurezza Enterprise</p>
            
            <div className="space-y-6 text-xs text-gray-400">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-gold-primary/10 border border-gold-primary/30 flex items-center justify-center text-gold-primary font-bold shrink-0">1</div>
                <p>Accedi alla <a href="https://supabase.com/dashboard" target="_blank" className="text-gold-primary underline">Dashboard Supabase</a> del progetto.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-gold-primary/10 border border-gold-primary/30 flex items-center justify-center text-gold-primary font-bold shrink-0">2</div>
                <p>Vai in <strong>Authentication</strong> &gt; <strong>Users</strong> e clicca su <strong>Add User</strong> per creare l'account email del cliente.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-gold-primary/10 border border-gold-primary/30 flex items-center justify-center text-gold-primary font-bold shrink-0">3</div>
                <p>Una volta creato, torna qui nel portale AIXUM: troverai il nuovo utente nella lista e potrai assegnare il <strong>Ruolo</strong> e attivare l'account.</p>
              </div>
            </div>

            <button onClick={() => setIsModalOpen(false)} className="w-full mt-8 py-3 gold-gradient text-black rounded-lg text-xs font-black uppercase tracking-widest">Ho Capito</button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-right-10 flex items-center gap-3 px-4 py-3 bg-gold-primary text-black font-bold text-xs rounded-xl shadow-2xl">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  );
};

export default AdminClients;
