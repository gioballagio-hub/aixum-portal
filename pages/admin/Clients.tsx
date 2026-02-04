
import React, { useEffect, useState } from 'react';
import { Users, Search, Loader2, UserPlus, RefreshCw, Shield, UserCheck, X } from 'lucide-react';
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
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestione Clienti</h1>
          <p className="text-dark-muted text-sm mt-1">Anagrafica utenze e gestione autorizzazioni enterprise.</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={fetchProfiles} className="sb-button-secondary py-2.5">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="sb-button-primary py-2.5"
          >
            <UserPlus size={16} /> Nuovo Utente
          </button>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={14} />
        <input 
          type="text"
          placeholder="Cerca per nome, email o azienda..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sb-input pl-10"
        />
      </div>

      <div className="sb-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-dark-lighter border-b border-dark-border">
                <th className="px-6 py-4 text-[11px] font-bold text-dark-muted uppercase tracking-widest">Identità</th>
                <th className="px-6 py-4 text-[11px] font-bold text-dark-muted uppercase tracking-widest">Azienda</th>
                <th className="px-6 py-4 text-[11px] font-bold text-dark-muted uppercase tracking-widest">Ruolo / Accesso</th>
                <th className="px-6 py-4 text-[11px] font-bold text-dark-muted uppercase tracking-widest text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-sm">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center"><Loader2 size={24} className="animate-spin text-gold-primary mx-auto" /></td></tr>
              ) : filteredProfiles.map((p) => (
                <tr key={p.id} className="hover:bg-dark-lighter transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-black border border-dark-border flex items-center justify-center text-xs font-bold text-gold-primary">
                        {p.full_name?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{p.full_name || 'Pending'}</p>
                        <p className="text-[10px] text-dark-muted truncate tracking-tighter">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-300">
                    {p.company_name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select 
                        value={p.role}
                        disabled={updatingId === p.id}
                        onChange={(e) => changeRole(p.id, e.target.value as 'admin' | 'client')}
                        className="bg-black border border-dark-border text-[10px] font-bold text-white rounded px-2 py-1 outline-none focus:border-gold-primary"
                      >
                        <option value="client">CLIENT</option>
                        <option value="admin">ADMIN</option>
                      </select>
                      {p.role === 'admin' && <Shield size={12} className="text-gold-primary" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => toggleActiveStatus(p.id, p.is_active)}
                      disabled={updatingId === p.id}
                      className={`text-[10px] font-bold px-3 py-1 rounded border transition-all ${p.is_active ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}
                    >
                      {updatingId === p.id ? '...' : (p.is_active ? 'ACTIVE' : 'SUSPENDED')}
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
          <div className="relative w-full max-w-md sb-card p-10 animate-in zoom-in-95 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-white">Configurazione Utente</h2>
            <div className="space-y-4 text-sm text-dark-muted">
              <p>Segui la procedura tecnica per l'attivazione:</p>
              <ol className="list-decimal pl-5 space-y-3 font-medium text-xs">
                <li>Accedi a <span className="text-white">Supabase Auth</span>.</li>
                <li>Crea l'utente con email aziendale.</li>
                <li>L'utente apparirà automaticamente in questa lista.</li>
              </ol>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="sb-button-primary w-full mt-8">Ricevuto</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
