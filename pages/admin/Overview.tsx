
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Video, FileText, Activity, UserPlus, ShieldAlert, HardDrive, ChevronRight, Loader2, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    clients: 0,
    videos: 0,
    documents: 0,
    storage: '1.2 GB'
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [c, v, d] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'client'),
        supabase.from('videos').select('id', { count: 'exact' }),
        supabase.from('documents').select('id', { count: 'exact' })
      ]);
      setStats({
        clients: c.count || 0,
        videos: v.count || 0,
        documents: d.count || 0,
        storage: '1.2 GB'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Clienti Attivi', value: stats.clients, icon: Users, path: '/admin/clients' },
    { label: 'Contenuti Video', value: stats.videos, icon: Video, path: '/admin/videos' },
    { label: 'Risorse PDF', value: stats.documents, icon: FileText, path: '/admin/documents' },
    { label: 'Cloud Storage', value: stats.storage, icon: HardDrive, path: '#' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Dashboard <span className="gold-text-gradient">Manager</span></h1>
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.4em] mt-2 font-black">Performance e Infrastruttura AIXUM</p>
        </div>
        <button 
          onClick={fetchStats}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gold-primary transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />} Aggiorna Metriche
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <button 
            key={i} 
            onClick={() => stat.path !== '#' && navigate(stat.path)}
            className="p-6 rounded-[24px] glass-card border border-white/5 flex flex-col items-start gap-4 text-left hover:border-gold-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all group relative overflow-hidden shadow-xl"
          >
            <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold-primary shrink-0 transition-transform group-hover:rotate-12`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-3xl font-display font-bold leading-none">{loading ? '...' : stat.value}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2 group-hover:text-gold-primary transition-colors">{stat.label}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-3">
              <Activity size={14} className="text-gold-primary" /> Log Operazioni Real-time
            </h2>
          </div>
          
          <div className="rounded-[24px] border border-white/5 overflow-hidden divide-y divide-white/5 bg-white/[0.01]">
             {[1,2,3].map(i => (
               <div key={i} className="flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                    <UserPlus size={16} className="text-gold-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-300">Nuova attivazione profilo richiesta</p>
                    <p className="text-[10px] text-gray-600 uppercase tracking-tighter mt-0.5">Sistema • Oggi, 10:45</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-800 group-hover:text-gold-primary" />
               </div>
             ))}
          </div>
        </div>

        <div className="space-y-6">
           <div className="p-8 rounded-[32px] glass-card border border-gold-primary/20 relative overflow-hidden bg-gold-primary/[0.02]">
             <ShieldAlert size={40} className="text-gold-primary/20 absolute -top-2 -right-2 rotate-12" />
             <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gold-primary mb-4">Guida Rapida Utenti</h2>
             <p className="text-xs text-gray-400 leading-relaxed mb-6">
               Per aggiungere un nuovo cliente, crealo prima nella <span className="text-white font-bold">Dashboard di Supabase</span> sotto la sezione Auth &gt; Users. Successivamente, apparirà automaticamente nella tua lista <span className="text-white font-bold">Clienti</span> per l'attivazione finale.
             </p>
             <button 
               onClick={() => navigate('/admin/clients')}
               className="w-full py-3 bg-gold-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
             >
               Vai a Gestione Clienti
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
