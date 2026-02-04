
import React, { useEffect, useState } from 'react';
import { Users, Search, Mail, Building2, UserPlus, Loader2, CheckCircle2, Shield, UserX, UserCheck, MoreVertical, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';

const AdminClients: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
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
    await supabase.from('profiles').update({ is_active: !currentStatus }).eq('id', id);
    fetchProfiles();
  };

  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Clienti</h1>
          <p className="text-dark-muted text-sm mt-1">Gestisci gli accessi, i ruoli e lo stato dei profili aziendali.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gold-primary text-black rounded-md text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <UserPlus size={16} /> Istruzioni
        </button>
      </header>

      <div className="flex items-center gap-4 bg-[#0a0a0a] border border-dark-border p-3 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={16} />
          <input 
            type="text"
            placeholder="Cerca per nome o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border-none text-sm text-white focus:ring-0 outline-none"
          />
        </div>
        <div className="h-6 w-[1px] bg-dark-border"></div>
        <span className="text-[10px] font-bold text-dark-muted uppercase tracking-widest">{filteredProfiles.length} Risultati</span>
      </div>

      <div className="business-card rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#1c1c1c] border-b border-dark-border">
              <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-widest">Utente</th>
              <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-widest">Azienda</th>
              <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-widest">Ruolo</th>
              <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-widest">Stato</th>
              <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-widest text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center"><Loader2 size={24} className="animate-spin text-gold-primary mx-auto" /></td></tr>
            ) : filteredProfiles.map((p) => (
              <tr key={p.id} className="hover:bg-dark-lighter transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-dark-border flex items-center justify-center text-xs font-bold text-white">
                      {p.full_name?.[0] || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{p.full_name || 'In attesa'}</p>
                      <p className="text-xs text-dark-muted truncate">{p.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <p className="text-sm text-white font-medium">{p.company_name || '-'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-tighter ${p.role === 'admin' ? 'bg-gold-primary/5 text-gold-primary border-gold-primary/20' : 'bg-white/5 text-dark-muted border-dark-border'}`}>
                    {p.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`}></div>
                    <span className="text-xs font-medium text-white">{p.is_active ? 'Attivo' : 'Sospeso'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => toggleActiveStatus(p.id, p.is_active)}
                    className="text-xs font-bold text-dark-muted hover:text-white transition-colors"
                  >
                    {p.is_active ? 'Disattiva' : 'Attiva'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md business-card rounded-lg p-8 animate-in zoom-in-95">
            <h2 className="text-xl font-bold mb-2">Setup <span className="text-gold-primary">Clienti</span></h2>
            <div className="space-y-4 text-sm text-dark-muted mt-6">
              <p>Per registrare un nuovo account:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Usa la console <span className="text-white font-medium underline">Supabase Auth</span>.</li>
                <li>Crea l'utente con email e password.</li>
                <li>L'utente apparirà qui per la configurazione finale del profilo.</li>
              </ol>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="w-full mt-8 py-3 bg-dark-lighter border border-dark-border text-white rounded text-sm font-bold hover:border-gold-primary transition-all">Chiudi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
