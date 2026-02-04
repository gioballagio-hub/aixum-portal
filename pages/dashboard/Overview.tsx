
import React, { useEffect, useState } from 'react';
import { Video, FileText, ChevronRight, PlayCircle, Award, Clock, ExternalLink, Loader2, Play, Download, RefreshCw, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Profile, Video as IVideo, Document as IDocument } from '../../types';
import { downloadFile } from '../../lib/utils';
import DocumentViewerModal from '../../components/DocumentViewerModal';

interface OverviewProps { profile: Profile | null; }

const ClientDashboard: React.FC<OverviewProps> = ({ profile }) => {
  const [recentVideos, setRecentVideos] = useState<IVideo[]>([]);
  const [recentDocs, setRecentDocs] = useState<IDocument[]>([]);
  const [counts, setCounts] = useState({ videos: 0, docs: 0, certs: 0, hours: '0' });
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<IDocument | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('it-IT'));

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [vids, docs, vCount, dCount, cCount, viewProgress] = await Promise.all([
        supabase.from('videos').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(1),
        supabase.from('documents').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(2),
        supabase.from('videos').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('documents').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('certificates').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
        supabase.from('video_views').select('progress_seconds').eq('user_id', profile.id)
      ]);

      const totalSeconds = viewProgress.data?.reduce((acc, curr) => acc + (curr.progress_seconds || 0), 0) || 0;
      const hoursDecimal = Math.floor(totalSeconds / 3600);

      if (vids.data) setRecentVideos(vids.data);
      if (docs.data) setRecentDocs(docs.data);
      
      setCounts({ 
        videos: vCount.count || 0, 
        docs: dCount.count || 0, 
        certs: cCount.count || 0,
        hours: `${hoursDecimal}`
      });
      setCurrentTime(new Date().toLocaleTimeString('it-IT'));
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile]);

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-1000 p-4">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-sans font-bold text-white tracking-tight">Bentornato, {profile?.full_name}</h1>
          <p className="text-dark-muted text-[13px] mt-2 font-black uppercase tracking-[0.3em] opacity-80">
            {profile?.company_name} • Enterprise Account
          </p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-dark-card border border-dark-border rounded-xl shadow-2xl">
          <span className="text-[11px] font-black text-dark-muted uppercase tracking-[0.3em]">Status:</span>
          <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            Active
          </span>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Video Corsi', value: counts.videos, icon: Video },
          { label: 'Documenti', value: counts.docs, icon: FileText },
          { label: 'Ore Studio', value: counts.hours + 'h', icon: PlayCircle },
          { label: 'Certificati', value: counts.certs, icon: TrendingUp },
        ].map((stat, i) => (
          <div key={i} className="business-card p-8 rounded-2xl flex flex-col justify-between h-44 group hover:border-gold-primary/40 transition-all duration-500 shadow-xl">
            <div className="flex justify-between items-start">
              <stat.icon size={22} className="text-gold-primary" />
              <ChevronRight size={16} className="text-dark-muted group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-5xl font-sans font-bold text-white leading-none mb-3">
                {loading ? '...' : stat.value}
              </h3>
              <p className="text-[11px] font-black text-dark-muted uppercase tracking-[0.3em]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-16">
        {/* Ultimi Video Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.5em]">Ultimi Video</h2>
            <Link to="/dashboard/videos" className="text-[11px] font-black text-gold-primary uppercase tracking-[0.3em] hover:opacity-80 transition-all">Vedi Tutti</Link>
          </div>
          
          <div className="space-y-4">
            {recentVideos.length > 0 ? recentVideos.map(video => (
              <Link key={video.id} to={`/dashboard/videos/${video.id}`} className="business-card p-8 rounded-2xl flex items-center justify-between group hover:border-gold-primary/30 transition-all shadow-lg">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-14 bg-dark-lighter border border-dark-border rounded-xl overflow-hidden flex items-center justify-center relative">
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                    ) : (
                      <div className="text-[10px] font-black text-gold-primary/20 italic tracking-widest">AIXUM</div>
                    )}
                    <Play size={16} className="absolute text-white/40 group-hover:text-gold-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-gold-primary transition-colors">{video.title}</h3>
                    <p className="text-[11px] text-dark-muted font-black uppercase tracking-[0.3em] mt-1.5">{video.category}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-dark-muted group-hover:text-gold-primary group-hover:translate-x-1 transition-all" />
              </Link>
            )) : (
              <div className="p-12 text-center bg-dark-card border border-dashed border-dark-border rounded-3xl text-xs font-black uppercase tracking-widest text-dark-muted">Nessun video caricato</div>
            )}
          </div>
        </div>

        {/* Documenti Recenti Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.5em]">Documenti Recenti</h2>
            <Link to="/dashboard/documents" className="text-[11px] font-black text-gold-primary uppercase tracking-[0.3em] hover:opacity-80 transition-all">Vai all'Archivio</Link>
          </div>
          
          <div className="space-y-4">
            {recentDocs.length > 0 ? recentDocs.map(doc => (
              <div key={doc.id} className="business-card p-8 rounded-2xl flex items-center justify-between group hover:border-gold-primary/30 transition-all shadow-lg">
                <div className="flex items-center gap-8">
                  <div className="w-12 h-12 bg-dark-lighter border border-dark-border rounded-xl flex items-center justify-center text-gold-primary shadow-inner">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-gold-primary transition-colors">{doc.title}</h3>
                    <p className="text-[11px] text-dark-muted font-black uppercase tracking-[0.2em] mt-1.5">
                      {(doc.file_size_bytes / 1024 / 1024).toFixed(1)}MB • {doc.category}
                    </p>
                  </div>
                </div>
                <button onClick={() => downloadFile(doc.file_url, doc.file_name)} className="text-dark-muted hover:text-gold-primary transition-colors">
                  <Download size={20} />
                </button>
              </div>
            )) : (
              <div className="p-12 text-center bg-dark-card border border-dashed border-dark-border rounded-3xl text-xs font-black uppercase tracking-widest text-dark-muted">Nessun documento disponibile</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Sync Status Bar */}
      <footer className="pt-16">
        <div className="flex items-center justify-between p-8 rounded-2xl bg-dark-card border border-dark-border border-dashed">
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
            <p className="text-xs font-bold text-dark-muted tracking-tight">
              Sincronizzazione completata. Ultimo aggiornamento: <span className="text-gray-400">{currentTime}</span>
            </p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-3 text-[11px] font-black text-dark-muted hover:text-white uppercase tracking-[0.4em] transition-colors group">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />} 
            REFRESH NOW
          </button>
        </div>
      </footer>

      <DocumentViewerModal 
        document={selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
        onDownload={(doc) => downloadFile(doc.file_url, doc.file_name)} 
      />
    </div>
  );
};

export default ClientDashboard;
