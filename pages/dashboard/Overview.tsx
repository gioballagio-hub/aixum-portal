
import React, { useEffect, useState } from 'react';
import { Video, FileText, ChevronRight, PlayCircle, Award, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Profile, Video as IVideo, Document as IDocument } from '../../types';
import { downloadFile } from '../../lib/utils';
import DocumentViewerModal from '../../components/DocumentViewerModal';

interface OverviewProps { profile: Profile | null; }

const ClientDashboard: React.FC<OverviewProps> = ({ profile }) => {
  const [recentVideos, setRecentVideos] = useState<IVideo[]>([]);
  const [recentDocs, setRecentDocs] = useState<IDocument[]>([]);
  const [counts, setCounts] = useState({ videos: 0, docs: 0, certs: 0, hours: '0.0h' });
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<IDocument | null>(null);

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [vids, docs, vCount, dCount, cCount, viewProgress] = await Promise.all([
        supabase.from('videos').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(2),
        supabase.from('documents').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(3),
        supabase.from('videos').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('documents').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('certificates').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
        supabase.from('video_views').select('progress_seconds').eq('user_id', profile.id)
      ]);

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
  }, [profile]);

  return (
    <div className="h-full flex flex-col gap-5 animate-in fade-in duration-500 overflow-hidden">
      {/* Header compatto */}
      <header className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-display font-bold text-white leading-none tracking-tight italic">Hub <span className="gold-text-gradient">Enterprise</span></h1>
          <p className="text-[10px] text-dark-muted mt-2 font-bold uppercase tracking-[0.3em]">{profile?.company_name}</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gold-primary bg-gold-primary/5 px-3 py-1.5 rounded border border-gold-primary/20">
          <div className="w-1.5 h-1.5 rounded-full bg-gold-primary animate-pulse"></div>
          CLIENTE PREMIUM
        </div>
      </header>

      {/* Grid Statistiche - Densità maggiore */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {[
          { label: 'Video Academy', value: counts.videos, icon: Video, color: 'text-gold-primary' },
          { label: 'Asset Cloud', value: counts.docs, icon: FileText, color: 'text-white' },
          { label: 'Tempo Formazione', value: counts.hours, icon: Clock, color: 'text-gold-primary' },
          { label: 'Certificazioni', value: counts.certs, icon: Award, color: 'text-white' },
        ].map((stat, i) => (
          <div key={i} className="business-card px-4 py-3 rounded-md flex items-center gap-3 border-white/5">
            <div className={`p-2 rounded bg-dark-lighter ${stat.color} shrink-0`}>
              <stat.icon size={14} />
            </div>
            <div>
              <p className="text-[9px] font-black text-dark-muted uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
              <h3 className="text-sm font-bold text-white leading-none">{loading ? '...' : stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-5 flex-1 min-h-0 overflow-hidden mb-2">
        {/* Moduli Video - Main Column */}
        <div className="lg:col-span-8 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-2 shrink-0 px-1">
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1 h-3 bg-gold-primary rounded-full"></div> Moduli Recenti
            </h2>
            <Link to="/dashboard/videos" className="text-[10px] font-bold text-gold-primary hover:underline flex items-center gap-1">
              VEDI TUTTI <ChevronRight size={10} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0 overflow-hidden">
            {recentVideos.map(video => (
              <Link key={video.id} to={`/dashboard/videos/${video.id}`} className="business-card group flex flex-col rounded-md overflow-hidden border-white/5 hover:border-gold-primary/30 transition-all">
                <div className="aspect-video bg-dark-lighter relative border-b border-white/5 overflow-hidden">
                  {video.thumbnail_url && <img src={video.thumbnail_url} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-all" alt="" />}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle size={24} className="text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[11px] font-bold text-white truncate mb-1">{video.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black text-gold-primary uppercase tracking-wider">{video.category}</span>
                    <span className="text-[8px] text-dark-muted font-bold">{Math.floor(video.duration_seconds / 60)} MIN</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Risorse & Certificati - Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 overflow-hidden">
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-2 shrink-0 px-1">
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Materiale di Studio</h2>
            </div>
            
            <div className="business-card divide-y divide-dark-border rounded-md overflow-hidden flex-1 min-h-0 overflow-y-auto">
              {recentDocs.map(doc => (
                <div key={doc.id} className="p-3 flex items-center justify-between hover:bg-dark-lighter transition-all cursor-pointer group" onClick={() => setSelectedDoc(doc)}>
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={14} className="text-dark-muted shrink-0 group-hover:text-gold-primary" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white truncate">{doc.title}</p>
                      <p className="text-[8px] text-dark-muted font-black uppercase mt-0.5">{doc.file_type} • {(doc.file_size_bytes / 1024 / 1024).toFixed(1)}MB</p>
                    </div>
                  </div>
                  <ExternalLink size={10} className="text-dark-muted opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              ))}
            </div>
          </div>

          <Link to="/dashboard/certificates" className="block text-center py-2 bg-gold-primary text-black rounded text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shrink-0">
            Area Certificazioni
          </Link>
        </div>
      </div>

      <DocumentViewerModal 
        document={selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
        onDownload={(doc) => downloadFile(doc.file_url, doc.file_name)} 
      />
    </div>
  );
};

export default ClientDashboard;
