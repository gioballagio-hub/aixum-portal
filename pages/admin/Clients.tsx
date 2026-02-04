
import React, { useEffect, useState } from 'react';
import { Users, Search, Loader2, UserPlus, RefreshCw, Shield, UserCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';

const AdminClients: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setUpdatingId(id);
    await supabase.from('profiles').update({ is_active: !currentStatus }).eq('id', id);
    await fetchProfiles();
    setUpdatingId(null);
  };

  const changeRole = async (id: string, newRole: 'admin' | 'client') => {
    setUpdatingId(id);
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    if (error) alert(error.message);
    await fetchProfiles();
    setUpdatingId(null);
  };

  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Anagrafica <span className="gold-text-gradient">Clienti</span></h1>
          <p className="text-dark-muted text-sm mt-1">Gestione permessi, ruoli e infrastruttura accessi enterprise.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchProfiles} className="p-3 bg-dark-lighter border border-dark-border rounded-xl text-dark-muted hover:text-white transition-all">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gold-primary text-black rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-xl"
          >
            <UserPlus size={16} /> Nuovo Utente
          </button>
        </div>
      </header>

      <div className="flex items-center gap-4 bg-dark-card border border-dark-border p-3 rounded-2xl shadow-xl">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
          <input 
            type="text"
            placeholder="Filtra per nome, email o azienda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none text-sm text-white focus:ring-0 outline-none placeholder:text-dark-muted"
          />
        </div>
        <div className="h-8 w-[1px] bg-dark-border hidden md:block"></div>
        <span className="text-[10px] font-black text-dark-muted uppercase tracking-[0.2em] px-4 hidden md:block">{filteredProfiles.length} Utenti Registrati</span>
      </div>

      <div className="business-card rounded-2xl overflow-hidden border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#1c1c1c] border-b border-dark-border">
                <th className="px-8 py-5 text-[11px] font-black text-dark-muted uppercase tracking-widest">Identità</th>
                <th className="px-8 py-5 text-[11px] font-black text-dark-muted uppercase tracking-widest">Azienda</th>
                <th className="px-8 py-5 text-[11px] font-black text-dark-muted uppercase tracking-widest">Ruolo / Autorizzazione</th>
                <th className="px-8 py-5 text-[11px] font-black text-dark-muted uppercase tracking-widest text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {loading && profiles.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center"><Loader2 size={32} className="animate-spin text-gold-primary mx-auto" /></td></tr>
              ) : filteredProfiles.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-dark-border flex items-center justify-center text-xs font-bold text-gold-primary border border-white/5 shadow-inner">
                        {p.full_name?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{p.full_name || 'Utente in attesa'}</p>
                        <p className="text-xs text-dark-muted truncate">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <p className="text-sm text-gray-300 font-medium">{p.company_name || '-'}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <select 
                        value={p.role}
                        disabled={updatingId === p.id}
                        onChange={(e) => changeRole(p.id, e.target.value as 'admin' | 'client')}
                        className="bg-black border border-dark-border text-[10px] font-black text-white rounded-lg px-3 py-1.5 outline-none focus:border-gold-primary cursor-pointer disabled:opacity-50 uppercase tracking-widest"
                      >
                        <option value="client">CLIENTE</option>
                        <option value="admin">AMMINISTRATORE</option>
                      </select>
                      {p.role === 'admin' && <Shield size={14} className="text-gold-primary" />}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => toggleActiveStatus(p.id, p.is_active)}
                      disabled={updatingId === p.id}
                      className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border transition-all ${p.is_active ? 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10' : 'border-red-500/20 text-red-500 hover:bg-red-500/10'}`}
                    >
                      {updatingId === p.id ? '...' : (p.is_active ? 'ATTIVO' : 'SOSPESO')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md business-card rounded-[32px] p-10 animate-in zoom-in-95 shadow-2xl border-gold-primary/20">
            <h2 className="text-2xl font-display font-bold mb-6 text-white">Setup <span className="gold-text-gradient">Nuovo Utente</span></h2>
            <div className="space-y-6 text-sm text-dark-muted">
              <p>Segui questa procedura per attivare un nuovo cliente nel portale AIXUM:</p>
              <ol className="list-decimal pl-5 space-y-4 font-medium">
                <li>Accedi alla <span className="text-white font-bold underline cursor-pointer">Supabase Dashboard</span> del progetto.</li>
                <li>Vai nella sezione <span className="text-white">Authentication &gt; Users</span>.</li>
                <li>Crea l'utente con l'email aziendale e la password predefinita.</li>
                <li>Torna in questa pagina e aggiorna: l'utente apparirà nella lista per l'assegnazione finale.</li>
              </ol>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="w-full mt-10 py-4 bg-gold-primary text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg">Ho Capito</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
