
import React, { useEffect, useState } from 'react';
import { Video, FileText, ChevronRight, Play, Download, Award, CheckCircle2, Loader2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Profile, Video as IVideo, Document as IDocument } from '../../types';
import { downloadFile } from '../../lib/utils';
import Logo from '../../components/Logo';
import DocumentViewerModal from '../../components/DocumentViewerModal';

interface OverviewProps { profile: Profile | null; }

const ClientDashboard: React.FC<OverviewProps> = ({ profile }) => {
  const [recentVideos, setRecentVideos] = useState<IVideo[]>([]);
  const [recentDocs, setRecentDocs] = useState<IDocument[]>([]);
  const [counts, setCounts] = useState({ videos: 0, docs: 0, certs: 0, hours: '0.0h' });
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<IDocument | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [vids, docs, vCount, dCount, cCount, viewProgress] = await Promise.all([
        supabase.from('videos').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(4),
        supabase.from('documents').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(4),
        supabase.from('videos').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('documents').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('certificates').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
        supabase.from('video_views').select('progress_seconds').eq('user_id', profile.id)
      ]);

      // Calcolo dinamico delle ore di studio effettive
      const totalSeconds = viewProgress.data?.reduce((acc, curr) => acc + (curr.progress_seconds || 0), 0) || 0;
      const hoursDecimal = (totalSeconds / 3600).toFixed(1);

      if (vids.data) setRecentVideos(vids.data);
      if (docs.data) setRecentDocs(docs.data);
      
      setCounts({ 
        videos: vCount.count || 0, 
        docs: dCount.count || 0, 
        certs: cCount.count || 0,
        hours: `${hoursDecimal}h`
      });
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh ogni minuto per tenere le ore aggiornate se l'utente sta guardando video in altre tab
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [profile]);

  const handleDownload = async (doc: IDocument) => {
    const success = await downloadFile(doc.file_url, doc.file_name || doc.title);
    if (success) showToast(`Download avviato: ${doc.title}`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      <header className="flex items-center justify-between border-b border-gold-primary/30 pb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-white">Bentornato, <span className="gold-text-gradient">{profile?.full_name?.split(' ')[0]}</span></h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em] mt-2 italic">{profile?.company_name} &bull; Enterprise Account</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 px-6 py-3 rounded-2xl bg-gold-primary/5 border border-gold-primary/30 text-[10px] font-black uppercase text-gold-primary tracking-widest shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Status: Active
        </div>
      </header>

      {/* Grid Statistiche con Ore Dinamiche */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Video Corsi', value: counts.videos, icon: Video, link: '/dashboard/videos', color: 'gold' },
          { label: 'Documenti', value: counts.docs, icon: FileText, link: '/dashboard/documents', color: 'gray' },
          { label: 'Ore Studio', value: counts.hours, icon: Clock, link: '#', color: 'gold' },
          { label: 'Certificati', value: counts.certs, icon: Award, link: '/dashboard/certificates', color: 'gray' },
        ].map((stat, i) => (
          <Link 
            key={i} 
            to={stat.link} 
            className="group p-8 rounded-[32px] bg-white/[0.02] border-2 border-gold-primary/20 hover:border-gold-primary hover:bg-gold-primary/[0.04] transition-all relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon size={64} className="text-gold-primary" />
            </div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gold-primary/10 flex items-center justify-center text-gold-primary group-hover:scale-110 transition-transform shadow-inner">
                <stat.icon size={22} />
              </div>
              <ChevronRight size={18} className="text-gray-800 group-hover:text-gold-primary transition-all group-hover:translate-x-1" />
            </div>
            <p className="text-4xl font-display font-bold text-white mb-1">{loading ? '...' : stat.value}</p>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest group-hover:text-gold-primary/80 transition-colors">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Ultimi Video */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-gold-primary/60 flex items-center gap-3">
              <Video size={14} /> Ultimi Video Aggiunti
            </h2>
            <Link to="/dashboard/videos" className="text-[10px] text-white font-black uppercase tracking-widest hover:text-gold-primary transition-colors border-b border-gold-primary/40 pb-1">Libreria Completa</Link>
          </div>
          <div className="grid gap-5">
            {recentVideos.map(video => (
              <Link key={video.id} to={`/dashboard/videos/${video.id}`} className="flex items-center gap-6 p-5 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-gold-primary/40 hover:bg-gold-primary/[0.03] transition-all group relative overflow-hidden">
                <div className="w-28 aspect-video rounded-xl bg-dark overflow-hidden shrink-0 relative border border-white/10 shadow-lg">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" alt="" />
                  ) : (
                    <div className="w-full h-full bg-gold-primary/5 flex items-center justify-center">
                      <Logo size="sm" withGlow={false} className="opacity-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-black">
                      <Play size={18} fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-white truncate group-hover:text-gold-primary transition-colors">{video.title}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[9px] text-gold-primary font-black uppercase tracking-widest bg-gold-primary/10 px-2 py-0.5 rounded border border-gold-primary/20">{video.category}</span>
                    <span className="text-[9px] text-gray-500 font-bold uppercase">{Math.floor(video.duration_seconds / 60)} min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Documenti Recenti (Cliccabili per Anteprima) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-gold-primary/60 flex items-center gap-3">
              <FileText size={14} /> Documenti Recenti
            </h2>
            <Link to="/dashboard/documents" className="text-[10px] text-white font-black uppercase tracking-widest hover:text-gold-primary transition-colors border-b border-gold-primary/40 pb-1">Archivio Files</Link>
          </div>
          <div className="grid gap-5">
            {recentDocs.map(doc => (
              <div 
                key={doc.id} 
                onClick={() => setSelectedDoc(doc)}
                className="flex items-center justify-between p-5 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-gold-primary/40 hover:bg-gold-primary/[0.03] cursor-pointer transition-all group shadow-xl"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gold-primary group-hover:scale-110 transition-transform shadow-inner">
                    <FileText size={22} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white truncate max-w-[200px] group-hover:text-gold-primary transition-colors">{doc.title}</p>
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">{(doc.file_size_bytes / 1024 / 1024).toFixed(1)}MB &bull; {doc.category}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-gold-primary hover:text-black text-gray-500 transition-all shadow-lg"
                  title="Scarica Risorsa"
                >
                  <Download size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer Info */}
      <div className="pt-12 border-t border-white/5">
         <div className="flex items-center gap-4 px-8 py-5 rounded-[24px] border-2 border-dashed border-gold-primary/20 bg-gold-primary/[0.01] text-gray-600 text-[11px] font-bold uppercase tracking-[0.2em]">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></div>
            Sync Status: Online &bull; Ultima verifica: {new Date().toLocaleTimeString()}
            <button onClick={() => fetchData()} className="ml-auto text-white hover:text-gold-primary transition-colors border-b border-white/20 hover:border-gold-primary">RE-SYNC DATA</button>
         </div>
      </div>

      <DocumentViewerModal 
        document={selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
        onDownload={handleDownload} 
      />

      {toast && (
        <div className="fixed bottom-10 right-10 z-[200] flex items-center gap-3 px-8 py-5 bg-emerald-500 text-black font-black text-xs rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-right-10">
          <CheckCircle2 size={20} /> {toast}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
