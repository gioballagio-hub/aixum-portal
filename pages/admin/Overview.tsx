
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Video, FileText, Activity, TrendingUp, UserCheck, HardDrive, ChevronRight, Loader2, Zap } from 'lucide-react';
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
    { label: 'Clienti Attivi', value: stats.clients, icon: Users, path: '/admin/clients', color: 'gold-primary' },
    { label: 'Contenuti Video', value: stats.videos, icon: Video, path: '/admin/videos', color: 'emerald-500' },
    { label: 'Risorse PDF', value: stats.documents, icon: FileText, path: '/admin/documents', color: 'blue-500' },
    { label: 'Occupazione Cloud', value: stats.storage, icon: HardDrive, path: '#', color: 'purple-500' },
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
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-primary/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-gold-primary/10 transition-colors" />
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
            <div className="h-px flex-1 mx-6 bg-white/5 hidden md:block" />
            <button className="text-[10px] text-gold-primary font-black hover:underline uppercase tracking-widest">Global Log</button>
          </div>
          
          <div className="rounded-[24px] border border-white/5 overflow-hidden divide-y divide-white/5 bg-white/[0.01]">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-all group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                    <UserCheck size={16} className="text-emerald-500/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-300">Accesso verificato: <span className="text-white">Partner Enterprise S.r.l.</span></p>
                    <p className="text-[10px] text-gray-600 uppercase tracking-tighter font-medium mt-0.5">Oggi, {15 - i}:30 • Roma HQ • Client v2.1</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-800 group-hover:text-gold-primary transition-colors translate-x-0 group-hover:translate-x-1" />
               </div>
             ))}
          </div>
        </div>

        <div className="space-y-8">
           <div className="p-8 rounded-[32px] glass-card border border-white/5 relative overflow-hidden group">
             <div className="absolute inset-0 gold-gradient opacity-[0.01] group-hover:opacity-[0.03] transition-opacity" />
             <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">Quick Infrastructure</h2>
             <div className="space-y-3">
               {[
                 { label: 'Nuovo Masterclass', icon: Video, path: '/admin/videos' },
                 { label: 'Protocollo Asset', icon: FileText, path: '/admin/documents' },
                 { label: 'Enrollment Cliente', icon: Users, path: '/admin/clients' },
               ].map((btn, i) => (
                 <button 
                   key={i} 
                   onClick={() => navigate(btn.path)}
                   className="w-full p-4 rounded-xl bg-white/5 border border-white/5 text-[11px] font-black uppercase tracking-[0.1em] flex items-center justify-between transition-all hover:border-gold-primary hover:bg-white/[0.08] active:scale-95 group"
                 >
                   {btn.label}
                   <btn.icon size={16} className="text-gray-700 group-hover:text-gold-primary transition-colors" />
                 </button>
               ))}
             </div>
           </div>

           <div className="p-8 rounded-[32px] bg-dark-lighter border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Health Check</h3>
              </div>
              <div className="space-y-5">
                {[
                  { label: 'Server Latency', val: '42ms', color: 'emerald' },
                  { label: 'API Gateway', val: 'Online', color: 'emerald' },
                  { label: 'Storage Sync', val: 'Active', color: 'gold' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-600 uppercase">{s.label}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${s.color === 'emerald' ? 'text-emerald-500' : 'text-gold-primary'}`}>{s.val}</span>
                  </div>
                ))}
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div className="h-full gold-gradient w-[99%] shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
