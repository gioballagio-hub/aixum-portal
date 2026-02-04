
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
    <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col overflow-hidden">
      <header className="flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Anagrafica <span className="gold-text-gradient">Clienti</span></h1>
          <p className="text-dark-muted text-[10px] mt-1 font-bold uppercase tracking-widest">Gestione permessi e infrastruttura accessi</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchProfiles} className="p-2 text-dark-muted hover:text-white transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gold-primary text-black rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90"
          >
            <UserPlus size={14} /> Nuovo Utente
          </button>
        </div>
      </header>

      <div className="flex items-center gap-4 bg-dark-card border border-dark-border p-2 rounded-lg shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={14} />
          <input 
            type="text"
            placeholder="Filtra per nome, email o azienda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 bg-transparent border-none text-xs text-white focus:ring-0 outline-none"
          />
        </div>
        <span className="text-[10px] font-bold text-dark-muted uppercase tracking-widest px-2">{filteredProfiles.length} Utenti</span>
      </div>

      <div className="business-card rounded-lg overflow-hidden flex-1 flex flex-col min-h-0 border-white/5 shadow-2xl">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#1c1c1c] border-b border-dark-border">
                <th className="px-6 py-3 text-[10px] font-bold text-dark-muted uppercase tracking-widest">Identità</th>
                <th className="px-6 py-3 text-[10px] font-bold text-dark-muted uppercase tracking-widest">Azienda</th>
                <th className="px-6 py-3 text-[10px] font-bold text-dark-muted uppercase tracking-widest">Ruolo / Livello</th>
                <th className="px-6 py-3 text-[10px] font-bold text-dark-muted uppercase tracking-widest text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {loading && profiles.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center"><Loader2 size={24} className="animate-spin text-gold-primary mx-auto" /></td></tr>
              ) : filteredProfiles.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-dark-border flex items-center justify-center text-[10px] font-bold text-white border border-white/5">
                        {p.full_name?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{p.full_name || 'In attesa'}</p>
                        <p className="text-[10px] text-dark-muted truncate">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <p className="text-xs text-white font-medium">{p.company_name || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select 
                        value={p.role}
                        disabled={updatingId === p.id}
                        onChange={(e) => changeRole(p.id, e.target.value as 'admin' | 'client')}
                        className="bg-black border border-dark-border text-[10px] font-bold text-white rounded px-2 py-1 outline-none focus:border-gold-primary cursor-pointer disabled:opacity-50"
                      >
                        <option value="client">CLIENTE</option>
                        <option value="admin">ADMIN</option>
                      </select>
                      {p.role === 'admin' && <Shield size={12} className="text-gold-primary" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => toggleActiveStatus(p.id, p.is_active)}
                      disabled={updatingId === p.id}
                      className={`text-[10px] font-bold px-3 py-1 rounded border transition-all ${p.is_active ? 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10' : 'border-red-500/20 text-red-500 hover:bg-red-500/10'}`}
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
          <div className="relative w-full max-w-md business-card rounded-lg p-8 animate-in zoom-in-95">
            <h2 className="text-xl font-bold mb-4">Istruzioni <span className="text-gold-primary">Registrazione</span></h2>
            <div className="space-y-4 text-xs text-dark-muted">
              <p>Per creare un nuovo utente nel sistema AIXUM:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Accedi alla <span className="text-white font-bold underline">Dashboard di Supabase</span>.</li>
                <li>Vai in Auth > Users e crea l'account con email e password definitiva.</li>
                <li>Aggiorna questa pagina: l'utente apparirà nella lista per la configurazione del ruolo.</li>
              </ol>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="w-full mt-8 py-3 bg-dark-lighter border border-dark-border text-white rounded text-[10px] font-black uppercase tracking-widest hover:border-gold-primary transition-all">Ho Capito</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
