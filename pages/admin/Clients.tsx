
import React, { useEffect, useState } from 'react';
import { Users, Search, Mail, Building2, UserPlus, X, Loader2, AlertCircle, CheckCircle2, ChevronRight, MoreHorizontal } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';

const AdminClients: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setProfiles(data);
    setLoading(false);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setModalError(null);
    setSuccessMsg(null);
    try {
      // Nota: Richiede permessi admin auth tramite Service Role o Edge Function per la creazione reale
      throw new Error("Si prega di utilizzare la dashboard Auth di Supabase per la creazione utenti diretta. Questa interfaccia admin gestisce solo l'anagrafica profili.");
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
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
              className="pl-9 pr-4 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all w-48 md:w-64"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 gold-gradient text-black rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2"
          >
            <UserPlus size={14} /> Nuovo Cliente
          </button>
        </div>
      </header>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-gold-primary" size={32} /></div>
      ) : (
        <div className="grid gap-4">
          {filteredProfiles.map((profile) => (
            <div key={profile.id} className="glass-card border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-gold-primary/30 transition-all">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gold-primary font-black uppercase shrink-0">
                  {profile.full_name?.[0] || profile.email[0]}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white truncate">{profile.full_name || 'Account Anonimo'}</p>
                    {profile.role === 'admin' && <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-gold-primary/10 text-gold-primary border border-gold-primary/20">Admin</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-[10px] text-gray-500 flex items-center gap-1"><Mail size={10} className="text-gold-primary" /> {profile.email}</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1"><Building2 size={10} className="text-gold-primary" /> {profile.company_name || 'Private'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[9px] font-black text-gray-600 uppercase">Membro dal</p>
                  <p className="text-[10px] font-bold text-gray-500">{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
                <button className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-600 hover:text-gold-primary transition-all">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>
          ))}
          {filteredProfiles.length === 0 && <p className="text-center py-12 text-xs text-gray-600 italic">Nessun profilo corrispondente.</p>}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md glass-card gold-border rounded-xl p-8 animate-in zoom-in-95">
            <h2 className="text-xl font-display font-bold mb-6 text-white">Nuovo Profilo <span className="gold-text-gradient">Enterprise</span></h2>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gold-primary">Nome Completo</label>
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all"
                  placeholder="es. Mario Rossi"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gold-primary">Email Aziendale</label>
                <input 
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all"
                  placeholder="mario@azienda.it"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gold-primary">Nome Azienda</label>
                <input 
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all"
                  placeholder="Nome Società S.p.A."
                />
              </div>

              {modalError && <div className="p-3 text-[10px] text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg">{modalError}</div>}
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all">Annulla</button>
                <button type="submit" disabled={isCreating} className="flex-1 py-2.5 gold-gradient text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all">Crea Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
