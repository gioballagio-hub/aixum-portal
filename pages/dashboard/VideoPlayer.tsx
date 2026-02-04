
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Share2, Bookmark, Video as VideoIcon, CheckCircle2 } from 'lucide-react';
import ReactPlayer from 'react-player';
import { supabase } from '../../lib/supabase';
import { Video } from '../../types';
import { copyToClipboard } from '../../lib/utils';

const VideoPlayerPage: React.FC = () => {
  const { id } = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;
      const { data: mainVideo } = await supabase.from('videos').select('*').eq('id', id).single();
      if (mainVideo) {
        setVideo(mainVideo);
        const { data: related } = await supabase.from('videos').select('*').eq('is_published', true).eq('category', mainVideo.category).neq('id', id).limit(4);
        if (related) setRelatedVideos(related);
      }
      setLoading(false);
    };
    fetchVideo();
  }, [id]);

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) showToast("Link copiato negli appunti!");
  };

  const handleBookmark = () => {
    showToast("Video aggiunto ai preferiti!");
  };

  const handleSupport = () => {
    window.location.href = `mailto:support@aixum.it?subject=Supporto Video: ${video?.title}`;
  };

  if (loading) return <div className="h-[400px] w-full glass-card animate-pulse rounded-xl"></div>;
  if (!video) return <div className="text-center py-20 text-xs text-gray-500 uppercase tracking-widest font-bold">Contenuto non disponibile</div>;

  const Player = ReactPlayer as any;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Link to="/dashboard/videos" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase text-gray-500 hover:text-gold-primary transition-all group tracking-widest">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Torna alla Libreria
      </Link>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl relative group">
            <Player 
              url={video.video_url} 
              controls 
              width="100%" 
              height="100%" 
              playing={false}
              light={video.thumbnail_url}
              playIcon={
                <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                  <Play size={24} className="text-black ml-1" fill="black" />
                </div>
              }
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gold-primary">{video.category}</span>
              <h1 className="text-2xl font-bold text-white leading-tight">{video.title}</h1>
              <div className="flex items-center gap-4 text-[10px] font-medium text-gray-500 uppercase tracking-tighter">
                <span className="flex items-center gap-1.5"><Clock size={12} className="text-gold-primary" /> {Math.floor(video.duration_seconds / 60)} minuti</span>
                <span>•</span>
                <span>Aggiornato il {new Date(video.created_at).toLocaleDateString('it-IT')}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 text-sm text-gray-400 leading-relaxed max-w-xl">
                {video.description || "Nessuna descrizione disponibile."}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleShare}
                className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-gray-500 hover:text-gold-primary transition-all"
                title="Copia Link"
              >
                <Share2 size={16} />
              </button>
              <button 
                onClick={handleBookmark}
                className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-gray-500 hover:text-gold-primary transition-all"
                title="Salva nei Preferiti"
              >
                <Bookmark size={16} />
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-600 px-1">Correlati</h2>
          <div className="space-y-3">
            {relatedVideos.map(rv => (
              <Link key={rv.id} to={`/dashboard/videos/${rv.id}`} className="flex gap-3 p-2 rounded-lg hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all group">
                <div className="w-20 aspect-video rounded bg-dark-lighter overflow-hidden shrink-0 border border-white/5">
                  {rv.thumbnail_url ? (
                    <img src={rv.thumbnail_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Play size={10} className="text-gold-primary/20" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-bold text-gray-300 truncate leading-tight group-hover:text-gold-primary transition-colors">{rv.title}</h4>
                  <p className="text-[9px] text-gray-600 mt-1 uppercase font-bold">{rv.category}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl gold-gradient text-black shadow-lg relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xs font-bold uppercase tracking-tight mb-1">Supporto Direttamente in AIXUM</h3>
              <p className="text-[10px] leading-tight font-medium opacity-70 mb-3">Dubbi tecnici su questo modulo?</p>
              <button 
                onClick={handleSupport}
                className="w-full py-2 bg-black/90 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors"
              >
                Contatta Mentore
              </button>
            </div>
            <VideoIcon size={60} className="absolute -bottom-2 -right-2 opacity-10 group-hover:rotate-12 transition-transform" />
          </div>
        </aside>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-right-10 flex items-center gap-3 px-4 py-3 bg-gold-primary text-black font-bold text-xs rounded-xl shadow-2xl">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  );
};

export default VideoPlayerPage;
