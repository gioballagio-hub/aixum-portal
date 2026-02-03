
import React, { useEffect, useState } from 'react';
import { Users, Video, FileText, Activity, TrendingUp, UserCheck, HardDrive, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    clients: 0,
    videos: 0,
    documents: 0,
    storage: '1.2 GB'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
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
      setLoading(false);
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Clienti Attivi', value: stats.clients, icon: Users, color: 'from-blue-500 to-indigo-500' },
    { label: 'Video Caricati', value: stats.videos, icon: Video, color: 'from-gold-primary to-gold-secondary' },
    { label: 'Documenti', value: stats.documents, icon: FileText, color: 'from-emerald-500 to-teal-500' },
    { label: 'Storage Usato', value: stats.storage, icon: HardDrive, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <p className="text-gold-primary font-bold uppercase tracking-[0.3em] text-[10px]">Pannello di Controllo</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold">Admin <span className="gold-text-gradient italic">Dashboard</span></h1>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="p-8 rounded-[32px] glass-card gold-border hover:translate-y-[-4px] transition-all duration-300">
            <div className="flex flex-col gap-4">
              <div className={`w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center gold-glow`}>
                <stat.icon size={22} className="text-black" />
              </div>
              <div>
                <p className="text-3xl font-black">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 glass-card rounded-[40px] p-10 gold-border">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Activity className="text-gold-primary" /> Attività Recente
            </h2>
            <button className="text-sm text-gold-primary hover:underline font-bold">Vedi Log Completi</button>
          </div>
          
          <div className="space-y-6">
             {[1,2,3,4].map(i => (
               <div key={i} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <UserCheck className="text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">Accesso effettuato <span className="text-gold-primary">Azienda SRL</span></p>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">Oggi alle 14:30 • IP: 192.168.1.XX</p>
                  </div>
                  {/* Added ChevronRight import to fix the error below */}
                  <ChevronRight size={18} className="text-gray-700" />
               </div>
             ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-8">
           <div className="glass-card rounded-[40px] p-10 gold-border bg-gradient-to-br from-gold-primary/5 to-transparent">
             <h2 className="text-2xl font-bold mb-8">Azioni Rapide</h2>
             <div className="grid gap-4">
               <button className="w-full p-4 glass-card gold-border rounded-xl font-bold hover:bg-gold-primary hover:text-black transition-all text-left flex items-center justify-between group">
                 Nuovo Video <Video size={18} className="group-hover:rotate-12 transition-transform" />
               </button>
               <button className="w-full p-4 glass-card gold-border rounded-xl font-bold hover:bg-gold-primary hover:text-black transition-all text-left flex items-center justify-between group">
                 Nuovo Documento <FileText size={18} className="group-hover:rotate-12 transition-transform" />
               </button>
               <button className="w-full p-4 glass-card gold-border rounded-xl font-bold hover:bg-gold-primary hover:text-black transition-all text-left flex items-center justify-between group">
                 Registra Cliente <Users size={18} className="group-hover:rotate-12 transition-transform" />
               </button>
             </div>
           </div>

           <div className="p-8 rounded-[40px] bg-dark-lighter border border-white/5">
              <div className="flex items-center gap-4 mb-6">
                <TrendingUp className="text-gold-primary" />
                <h3 className="font-bold">Efficienza Sistema</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-gray-500">Uptime</span>
                  <span className="text-emerald-500">99.9%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full gold-gradient w-[99.9%]"></div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
