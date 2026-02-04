
import React, { useEffect, useState } from 'react';
import { Video, FileText, ChevronRight, Play, Download, Award, CheckCircle2, Loader2, Clock, ExternalLink } from 'lucide-react';
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

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [vids, docs, vCount, dCount, cCount, viewProgress] = await Promise.all([
        supabase.from('videos').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(3),
        supabase.from('documents').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(4),
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
    <div className="space-y-12 animate-in fade-in duration-300">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Overview</h1>
          <p className="text-dark-muted text-sm">
            Benvenuto nel portale <span className="text-white font-medium">{profile?.company_name}</span>. Gestisci le tue risorse e traccia il progresso.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          Sincronizzato
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Video Disponibili', value: counts.videos, icon: Video, color: 'text-gold-primary' },
          { label: 'Documenti Riservati', value: counts.docs, icon: FileText, color: 'text-white' },
          { label: 'Tempo di Studio', value: counts.hours, icon: Clock, color: 'text-gold-primary' },
          { label: 'Traguardi', value: counts.certs, icon: Award, color: 'text-white' },
        ].map((stat, i) => (
          <div key={i} className="business-card p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded bg-dark-lighter ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-dark-muted uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{loading ? '...' : stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Ultimi Video</h2>
              <Link to="/dashboard/videos" className="text-xs font-medium text-gold-primary hover:underline flex items-center gap-1">
                Vedi tutti <ChevronRight size={14} />
              </Link>
            </div>
            
            <div className="grid gap-4">
              {recentVideos.map(video => (
                <Link key={video.id} to={`/dashboard/videos/${video.id}`} className="business-card group flex items-center gap-4 p-4 rounded-lg">
                  <div className="w-24 aspect-video bg-dark-lighter rounded overflow-hidden relative border border-dark-border">
                    {video.thumbnail_url && <img src={video.thumbnail_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play size={16} className="text-white opacity-40 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate mb-1">{video.title}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">{video.category}</span>
                      <span className="text-[10px] text-dark-muted">•</span>
                      <span className="text-[10px] text-dark-muted font-medium">{Math.floor(video.duration_seconds / 60)}m</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-dark-muted group-hover:text-gold-primary transition-colors" />
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Documenti Recenti</h2>
              <Link to="/dashboard/documents" className="text-xs font-medium text-gold-primary hover:underline">Vedi archivio</Link>
            </div>
            
            <div className="business-card divide-y divide-dark-border rounded-lg overflow-hidden">
              {recentDocs.map(doc => (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-dark-lighter transition-colors cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={18} className="text-dark-muted shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                      <p className="text-[10px] text-dark-muted font-medium uppercase mt-0.5">{doc.file_type} • {(doc.file_size_bytes / 1024 / 1024).toFixed(1)}MB</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-dark-muted" />
                </div>
              ))}
            </div>
          </section>

          <section className="business-card p-6 rounded-lg bg-gold-primary/[0.03] border-gold-primary/20">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded bg-gold-primary/10 text-gold-primary">
                  <Award size={20} />
                </div>
                <h3 className="text-sm font-bold text-white">Certificazioni AIXUM</h3>
             </div>
             <p className="text-xs text-dark-muted mb-4 leading-relaxed">
               I tuoi certificati sono validati crittograficamente sulla piattaforma. Puoi scaricarli in formato PDF per il tuo curriculum aziendale.
             </p>
             <Link to="/dashboard/certificates" className="block text-center py-2 bg-dark-lighter border border-dark-border rounded text-xs font-bold text-white hover:border-gold-primary transition-all">
               Accedi ai certificati
             </Link>
          </section>
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
