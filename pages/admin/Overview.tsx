
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Video, FileText, Activity, TrendingUp, UserCheck, HardDrive, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    clients: 0,
    videos: 0,
    documents: 0,
    storage: '450 MB'
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
        storage: '450 MB'
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
    { label: 'Clienti', value: stats.clients, icon: Users, path: '/admin/clients' },
    { label: 'Video', value: stats.videos, icon: Video, path: '/admin/videos' },
    { label: 'Docs', value: stats.documents, icon: FileText, path: '/admin/documents' },
    { label: 'Storage', value: stats.storage, icon: HardDrive, path: '#' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="border-b border-white/5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Pannello Amministrativo</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1">Gestione infrastruttura e utenti</p>
        </div>
        <button 
          onClick={fetchStats}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-gold-primary transition-all"
        >
          <Loader2 size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <button 
            key={i} 
            onClick={() => stat.path !== '#' && navigate(stat.path)}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-4 text-left hover:border-gold-primary/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center text-black shrink-0">
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{loading ? '...' : stat.value}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mt-1 group-hover:text-gold-primary transition-colors">{stat.label}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Activity size={14} className="text-gold-primary" /> Attività Recente
            </h2>
            <button className="text-[10px] text-gold-primary font-bold hover:underline uppercase">Tutti i Log</button>
          </div>
          
          <div className="rounded-xl border border-white/5 overflow-hidden divide-y divide-white/5">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="flex items-center gap-4 p-3 hover:bg-white/[0.02] transition-all group cursor-pointer">
                  <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                    <UserCheck size={14} className="text-emerald-500/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-300">Login cliente: <span className="text-white">Azienda SRL</span></p>
                    <p className="text-[9px] text-gray-600 uppercase tracking-tighter">Oggi, 14:30 • Milano, IT</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-800 group-hover:text-gold-primary transition-colors" />
               </div>
             ))}
          </div>
        </div>

        <div className="space-y-6">
           <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
             <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Azioni Rapide</h2>
             <div className="space-y-2">
               {[
                 { label: 'Nuovo Video', icon: Video, path: '/admin/videos', color: 'hover:border-gold-primary' },
                 { label: 'Nuovo Documento', icon: FileText, path: '/admin/documents', color: 'hover:border-emerald-500' },
                 { label: 'Registra Cliente', icon: Users, path: '/admin/clients', color: 'hover:border-blue-500' },
               ].map((btn, i) => (
                 <button 
                   key={i} 
                   onClick={() => navigate(btn.path)}
                   className={`w-full p-3 rounded-lg bg-white/5 border border-white/5 text-xs font-bold flex items-center justify-between transition-all group ${btn.color}`}
                 >
                   {btn.label}
                   <btn.icon size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                 </button>
               ))}
             </div>
           </div>

           <div className="p-5 rounded-xl bg-dark-lighter border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={14} className="text-gold-primary" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Salute Sistema</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                  <span className="text-gray-600">Disponibilità</span>
                  <span className="text-emerald-500">99.9%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full gold-gradient w-[99%]"></div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
