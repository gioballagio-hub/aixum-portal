
import React, { useEffect, useState } from 'react';
import { Video, FileText, ChevronRight, Play, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Profile, Video as IVideo, Document as IDocument } from '../../types';

interface OverviewProps {
  profile: Profile | null;
}

const ClientDashboard: React.FC<OverviewProps> = ({ profile }) => {
  const [recentVideos, setRecentVideos] = useState<IVideo[]>([]);
  const [recentDocs, setRecentDocs] = useState<IDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vids, docs] = await Promise.all([
          supabase.from('videos').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(2),
          supabase.from('documents').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(5)
        ]);
        
        if (vids.data) setRecentVideos(vids.data);
        if (docs.data) setRecentDocs(docs.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-display font-bold">
          👋 Benvenuto, <span className="gold-text-gradient">{profile?.company_name || profile?.full_name}!</span>
        </h1>
        <p className="text-gray-400">Esplora i tuoi corsi premium e i documenti esclusivi.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-10 rounded-3xl glass-card gold-border group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center gold-glow">
              <Video size={32} className="text-black" />
            </div>
            <div>
              <p className="text-4xl font-bold">12</p>
              <p className="text-gray-400 uppercase tracking-widest text-xs font-bold mt-1">Video Disponibili</p>
            </div>
          </div>
          <Link to="/dashboard/videos" className="mt-8 flex items-center gap-2 text-gold-primary font-bold group-hover:gap-4 transition-all">
            Inizia ad imparare <ChevronRight size={18} />
          </Link>
        </div>

        <div className="p-10 rounded-3xl glass-card gold-border group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center gold-glow">
              <FileText size={32} className="text-black" />
            </div>
            <div>
              <p className="text-4xl font-bold">24</p>
              <p className="text-gray-400 uppercase tracking-widest text-xs font-bold mt-1">Documenti Scaricabili</p>
            </div>
          </div>
          <Link to="/dashboard/documents" className="mt-8 flex items-center gap-2 text-gold-primary font-bold group-hover:gap-4 transition-all">
            Vai ai documenti <ChevronRight size={18} />
          </Link>
        </div>
      </div>

      {/* Recent Videos */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-display font-bold">📚 Ultimi <span className="gold-text-gradient">Video Aggiunti</span></h2>
          <Link to="/dashboard/videos" className="text-gray-400 hover:text-white transition-colors">Vedi tutti</Link>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {recentVideos.map(video => (
            <Link key={video.id} to={`/dashboard/videos/${video.id}`} className="group relative rounded-3xl overflow-hidden border border-white/5 hover:border-gold-primary transition-all duration-300">
              <div className="aspect-video bg-gradient-to-br from-gold-primary/20 to-gold-secondary/20 relative overflow-hidden">
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-40">
                    <Video size={64} className="text-gold-primary" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center gold-glow transform scale-90 group-hover:scale-100 transition-transform">
                    <Play size={24} className="text-black ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-8 glass-card">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gold-primary text-[10px] font-bold uppercase tracking-widest">{video.category}</span>
                <h3 className="text-xl font-bold mt-4 group-hover:text-gold-primary transition-colors">{video.title}</h3>
              </div>
            </Link>
          ))}
          {recentVideos.length === 0 && !loading && <div className="col-span-2 p-12 text-center glass-card rounded-3xl text-gray-500">Nessun video recente trovato.</div>}
        </div>
      </section>

      {/* Recent Documents */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-display font-bold">📑 Documenti <span className="gold-text-gradient">Più Scaricati</span></h2>
          <Link to="/dashboard/documents" className="text-gray-400 hover:text-white transition-colors">Vai a tutti i file</Link>
        </div>
        
        <div className="space-y-4">
          {recentDocs.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-6 rounded-2xl glass-card border border-white/5 hover:bg-white/[0.04] transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                  <FileText size={24} className="text-gold-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">{doc.title}</p>
                  <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">{(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB • {doc.category}</p>
                </div>
              </div>
              <button className="px-6 py-3 gold-border glass-card rounded-xl font-bold hover:bg-white/5 transition-all flex items-center gap-2 group">
                <Download size={18} className="group-hover:translate-y-1 transition-transform" /> Scarica
              </button>
            </div>
          ))}
          {recentDocs.length === 0 && !loading && <div className="p-12 text-center glass-card rounded-3xl text-gray-500">Nessun documento trovato.</div>}
        </div>
      </section>
    </div>
  );
};

export default ClientDashboard;
