
import React, { useEffect, useState } from 'react';
import { Users, Search, Mail, Building2, UserPlus, MoreVertical, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';

const AdminClients: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal Form State
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
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProfiles(data);
    setLoading(false);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setModalError(null);
    setSuccessMsg(null);

    try {
      // Nota: In Supabase, non possiamo creare utenti AUTH direttamente dal frontend admin senza service role.
      // Questa logica inviterà l'utente tramite email o creerà solo il profilo se l'utente esiste già.
      // Per un portale completo, l'admin crea il profilo e l'utente riceve l'invito.
      
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(newEmail, {
        data: { 
          full_name: newName,
          company_name: newCompany,
          role: 'client'
        }
      });

      if (error) {
        // Se non abbiamo i permessi admin auth (necessario service role), proviamo ad inserire solo il profilo
        // Questo funzionerà solo se l'utente si è già registrato o se abbiamo configurato un edge function.
        // Come fallback semplificato per questa demo:
        throw new Error("L'invito via email richiede i permessi Service Role. Per ora, crea l'utente in 'Authentication' e il profilo si aggiornerà al primo login.");
      }

      setSuccessMsg("Invito inviato con successo!");
      fetchProfiles();
      setTimeout(() => setIsModalOpen(false), 2000);
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
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 gold-gradient text-black rounded-xl font-bold gold-glow transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <UserPlus size={18} /> Nuovo Account
          </button>
        </div>
      </header>

      <div className="grid gap-6">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="animate-spin text-gold-primary" size={48} />
            <p className="text-gray-500 italic">Caricamento profili...</p>
          </div>
        ) : filteredProfiles.map((profile, idx) => (
          <div 
            key={profile.id} 
            className="glass-card gold-border p-8 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-white/[0.03] transition-all group animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center text-black font-black text-xl shadow-lg shadow-gold-primary/20 shrink-0">
                {profile.full_name?.[0] || profile.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white truncate group-hover:text-gold-primary transition-colors">{profile.full_name || 'N/A'}</h3>
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
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-600">Membro dal</p>
                <p className="text-sm font-bold text-gray-400 mt-1">{new Date(profile.created_at).toLocaleDateString('it-IT')}</p>
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
          <div className="py-24 text-center glass-card rounded-[40px] border border-dashed border-white/10">
            <Users size={64} className="mx-auto text-gray-800 mb-6" />
            <h2 className="text-2xl font-bold text-gray-600">Nessun cliente trovato</h2>
          </div>
        )}
      </div>

      {/* Modal Creazione Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg glass-card gold-border rounded-[32px] p-10 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-display font-bold mb-2">Crea <span className="gold-text-gradient">Nuovo Cliente</span></h2>
            <p className="text-gray-400 mb-8">Inserisci i dati per creare un nuovo profilo utente.</p>

            <form onSubmit={handleCreateClient} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gold-primary">Nome Completo</label>
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all"
                  placeholder="Esm. Mario Rossi"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gold-primary">Email Aziendale</label>
                <input 
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all"
                  placeholder="email@azienda.it"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gold-primary">Nome Azienda</label>
                <input 
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all"
                  placeholder="Nome Società"
                  required
                />
              </div>

              {modalError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex gap-3">
                  <AlertCircle size={18} className="shrink-0" /> {modalError}
                </div>
              )}

              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex gap-3">
                  <CheckCircle2 size={18} className="shrink-0" /> {successMsg}
                </div>
              )}

              <button 
                type="submit"
                disabled={isCreating}
                className="w-full py-4 gold-gradient text-black rounded-xl font-bold gold-glow flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isCreating ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                {isCreating ? 'Creazione in corso...' : 'Crea Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
