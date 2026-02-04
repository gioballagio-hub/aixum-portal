
import React, { useEffect, useState } from 'react';
import { Video, FileText, ChevronRight, PlayCircle, RefreshCw, Loader2, Play, Download, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Profile, Video as IVideo, Document as IDocument } from '../../types';
import { downloadFile } from '../../lib/utils';

interface OverviewProps { profile: Profile | null; }

const ClientDashboard: React.FC<OverviewProps> = ({ profile }) => {
  const [recentVideos, setRecentVideos] = useState<IVideo[]>([]);
  const [recentDocs, setRecentDocs] = useState<IDocument[]>([]);
  const [counts, setCounts] = useState({ videos: 0, docs: 0, hours: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [vids, docs, vCount, dCount, viewProgress] = await Promise.all([
        supabase.from('videos').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(2),
        supabase.from('documents').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(2),
        supabase.from('videos').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('documents').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('video_views').select('progress_seconds').eq('user_id', profile.id)
      ]);

      const totalHours = Math.floor((viewProgress.data?.reduce((acc, curr) => acc + (curr.progress_seconds || 0), 0) || 0) / 3600);

      if (vids.data) setRecentVideos(vids.data);
      if (docs.data) setRecentDocs(docs.data);
      setCounts({ videos: vCount.count || 0, docs: dCount.count || 0, hours: totalHours });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Benvenuto, {profile?.full_name}</h1>
          <p className="text-dark-muted text-sm mt-1">{profile?.company_name} • Account Client</p>
        </div>
        <button onClick={fetchData} className="sb-button-secondary">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Refresh
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Video Corsi', value: counts.videos, icon: Video },
          { label: 'Documenti', value: counts.docs, icon: FileText },
          { label: 'Ore Studio', value: counts.hours + 'h', icon: PlayCircle },
        ].map((stat, i) => (
          <div key={i} className="sb-card p-6">
            <div className="flex items-center gap-3 text-dark-muted mb-4">
              <stat.icon size={16} />
              <span className="text-[11px] font-bold uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-white">{loading ? '...' : stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Videos */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Ultimi Video Caricati</h2>
            <Link to="/dashboard/videos" className="text-xs text-gold-primary hover:underline">Vedi tutti</Link>
          </div>
          <div className="space-y-3">
            {recentVideos.map(video => (
              <Link key={video.id} to={`/dashboard/videos/${video.id}`} className="sb-card p-4 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black rounded border border-dark-border flex items-center justify-center text-gold-primary group-hover:border-gold-primary/50 transition-all">
                    <Play size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{video.title}</h3>
                    <p className="text-[11px] text-dark-muted">{video.category}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-dark-muted" />
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Documents */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Documenti Recenti</h2>
            <Link to="/dashboard/documents" className="text-xs text-gold-primary hover:underline">Vai all'archivio</Link>
          </div>
          <div className="space-y-3">
            {recentDocs.map(doc => (
              <div key={doc.id} className="sb-card p-4 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black rounded border border-dark-border flex items-center justify-center text-dark-muted group-hover:text-gold-primary transition-all">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{doc.title}</h3>
                    <p className="text-[11px] text-dark-muted uppercase tracking-tighter">{doc.file_type} • {(doc.file_size_bytes/1024/1024).toFixed(1)}MB</p>
                  </div>
                </div>
                <button onClick={() => downloadFile(doc.file_url, doc.file_name)} className="p-2 text-dark-muted hover:text-white transition-colors">
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="pt-10 border-t border-dark-border">
        <div className="flex items-center gap-2 text-[11px] text-dark-muted">
          <Clock size={12} />
          Portal Status: <span className="text-emerald-500 font-bold">Synchronized</span> • Version 2.1.0
        </div>
      </footer>
    </div>
  );
};

export default ClientDashboard;
