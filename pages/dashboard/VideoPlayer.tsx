
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Share2, Bookmark, Video as VideoIcon } from 'lucide-react';
import ReactPlayer from 'react-player';
import { supabase } from '../../lib/supabase';
import { Video } from '../../types';

const VideoPlayerPage: React.FC = () => {
  const { id } = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;
      
      const { data: mainVideo } = await supabase.from('videos').select('*').eq('id', id).single();
      if (mainVideo) {
        setVideo(mainVideo);
        const { data: related } = await supabase
          .from('videos')
          .select('*')
          .eq('is_published', true)
          .eq('category', mainVideo.category)
          .neq('id', id)
          .limit(3);
        if (related) setRelatedVideos(related);
      }
      setLoading(false);
    };
    fetchVideo();
  }, [id]);

  if (loading) return <div className="h-96 w-full glass-card animate-pulse rounded-3xl"></div>;
  if (!video) return <div className="text-center py-20">Video non trovato.</div>;

  return (
    <div className="space-y-12">
      <Link to="/dashboard/videos" className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-primary transition-all group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Torna alla lista video
      </Link>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Player */}
          <div className="aspect-video w-full rounded-[40px] overflow-hidden gold-border gold-glow bg-black">
            <ReactPlayer 
              url={video.video_url} 
              controls 
              width="100%" 
              height="100%" 
              playing={false}
              light={video.thumbnail_url}
              playIcon={
                <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center gold-glow">
                  <Play size={32} className="text-black ml-1" fill="black" />
                </div>
              }
            />
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-gold-primary font-bold uppercase tracking-widest text-xs">{video.category}</span>
                <h1 className="text-4xl font-display font-bold">{video.title}</h1>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-4 rounded-xl glass-card gold-border hover:bg-white/5 text-gray-300">
                  <Share2 size={20} />
                </button>
                <button className="p-4 rounded-xl glass-card gold-border hover:bg-white/5 text-gray-300">
                  <Bookmark size={20} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400 pb-8 border-b border-white/5">
              <span className="flex items-center gap-2"><Clock size={16} /> {Math.floor(video.duration_seconds / 60)} min</span>
              <span className="flex items-center gap-2">Caricato il {new Date(video.created_at).toLocaleDateString('it-IT')}</span>
            </div>

            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-bold text-white mb-4">Descrizione</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                {video.description || "Nessuna descrizione disponibile per questo video."}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-1.5 h-8 gold-gradient rounded-full"></span>
            Video <span className="gold-text-gradient">Correlati</span>
          </h2>

          <div className="space-y-6">
            {relatedVideos.map(rv => (
              <Link key={rv.id} to={`/dashboard/videos/${rv.id}`} className="group block glass-card rounded-2xl p-4 gold-border hover:bg-white/5 transition-all">
                <div className="flex gap-4">
                  <div className="w-24 h-16 rounded-lg bg-dark-lighter overflow-hidden shrink-0">
                    {rv.thumbnail_url ? (
                      <img src={rv.thumbnail_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt={rv.title} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Play size={16} className="text-gold-primary/30" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate group-hover:text-gold-primary transition-colors">{rv.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{rv.category}</p>
                  </div>
                </div>
              </Link>
            ))}
            {relatedVideos.length === 0 && <p className="text-gray-500 italic text-sm">Nessun video correlato disponibile.</p>}
          </div>

          <div className="p-8 rounded-[32px] gold-gradient text-black gold-glow relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Supporto Premium</h3>
              <p className="text-sm font-medium opacity-80 mb-6">Hai domande tecniche su questo contenuto? I nostri esperti sono a tua disposizione.</p>
              <button className="w-full py-3 bg-black text-white rounded-xl font-bold text-sm hover:scale-105 transition-all">
                Invia una richiesta
              </button>
            </div>
            {/* Added Video as VideoIcon import to fix the error below */}
            <VideoIcon size={120} className="absolute -bottom-6 -right-6 opacity-10 group-hover:scale-110 transition-transform" />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default VideoPlayerPage;
