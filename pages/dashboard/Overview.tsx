
import React, { useEffect, useState } from 'react';
import { Video, FileText, ChevronRight, Play, Download, Loader2, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Profile, Video as IVideo, Document as IDocument } from '../../types';
import { downloadFile } from '../../lib/utils';

interface OverviewProps {
  profile: Profile | null;
}

const ClientDashboard: React.FC<OverviewProps> = ({ profile }) => {
  const [recentVideos, setRecentVideos] = useState<IVideo[]>([]);
  const [recentDocs, setRecentDocs] = useState<IDocument[]>([]);
  const [counts, setCounts] = useState({ videos: 0, docs: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vids, docs, vCount, dCount] = await Promise.all([
        supabase.from('videos').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(4),
        supabase.from('documents').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(4),
        supabase.from('videos').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('documents').select('id', { count: 'exact', head: true }).eq('is_published', true)
      ]);
      
      if (vids.data) setRecentVideos(vids.data);
      if (docs.data) setRecentDocs(docs.data);
      setCounts({
        videos: vCount.count || 0,
        docs: dCount.count || 0
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownload = async (doc: IDocument) => {
    const success = await downloadFile(doc.file_url, doc.file_name || doc.title);
    if (success) showToast(`Download avviato: ${doc.title}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Bentornato, {profile?.full_name}</h1>
          <p className="text-xs text-gray-500">{profile?.company_name} &bull; Enterprise Account</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase text-gray-400">
            Status: Active
          </div>
        </div>
      </header>

      {/* Compact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Video Corsi', value: counts.videos, icon: Video, link: '/dashboard/videos' },
          { label: 'Documenti', value: counts.docs, icon: FileText, link: '/dashboard/documents' },
          { label: 'Ore Studio', value: '12h', icon: Play, link: '#' },
          { label: 'Certificati', value: '2', icon: ArrowUpRight, link: '#' },
        ].map((stat, i) => (
          <Link key={i} to={stat.link} className="p-4 rounded-xl glass-card border border-white/5 hover:border-gold-primary/30 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={14} className="text-gold-primary" />
              <ChevronRight size={12} className="text-gray-700 group-hover:text-gold-primary transition-colors" />
            </div>
            <p className="text-xl font-bold">{loading ? '...' : stat.value}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Videos - Compact List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Ultimi Video</h2>
            <Link to="/dashboard/videos" className="text-[10px] text-gold-primary font-bold hover:underline">Vedi Tutti</Link>
          </div>
          
          <div className="grid gap-3">
            {recentVideos.map(video => (
              <Link key={video.id} to={`/dashboard/videos/${video.id}`} className="flex items-center gap-4 p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                <div className="w-20 aspect-video rounded bg-dark-lighter overflow-hidden shrink-0 relative">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="w-full h-full bg-gold-primary/5 flex items-center justify-center"><Play size={12} className="text-gold-primary/20" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate group-hover:text-gold-primary transition-colors">{video.title}</p>
                  <p className="text-[9px] text-gray-500 uppercase font-bold mt-0.5">{video.category}</p>
                </div>
                <div className="pr-2">
                  <Play size={12} className="text-gray-700 group-hover:text-gold-primary" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Documents - Compact List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Documenti Recenti</h2>
            <Link to="/dashboard/documents" className="text-[10px] text-gold-primary font-bold hover:underline">Vai all'Archivio</Link>
          </div>
          
          <div className="grid gap-2">
            {recentDocs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-gold-primary">
                    <FileText size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold truncate max-w-[150px]">{doc.title}</p>
                    <p className="text-[9px] text-gray-500 uppercase font-bold">{(doc.file_size_bytes / 1024 / 1024).toFixed(1)}MB &bull; {doc.category}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.preventDefault(); handleDownload(doc); }}
                  className="p-2 rounded hover:bg-white/5 text-gray-600 hover:text-gold-primary transition-all"
                >
                  <Download size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="p-4 rounded-xl border border-dashed border-white/10 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full bg-emerald-500 ${loading ? 'animate-ping' : ''}`}></div>
            <p className="text-[11px] text-gray-500 font-medium">Sincronizzazione completata. Ultimo aggiornamento: {new Date().toLocaleTimeString('it-IT')}</p>
         </div>
         <button 
           onClick={fetchData}
           className="text-[10px] font-bold text-gray-400 hover:text-white uppercase tracking-widest flex items-center gap-2"
         >
           {loading && <Loader2 size={10} className="animate-spin" />} Refresh Now
         </button>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-right-10 flex items-center gap-3 px-4 py-3 bg-emerald-500 text-black font-bold text-xs rounded-xl shadow-2xl">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
