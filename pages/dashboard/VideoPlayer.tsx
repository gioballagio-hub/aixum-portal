
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Share2, Bookmark, Video as VideoIcon, CheckCircle2 } from 'lucide-react';
import ReactPlayer from 'react-player';
import { supabase } from '../../lib/supabase';
import { Video } from '../../types';
import { copyToClipboard } from '../../lib/utils';
// Import the Logo component to resolve the error on line 132
import Logo from '../../components/Logo';

const VideoPlayerPage: React.FC = () => {
  const { id } = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const playerRef = useRef<any>(null);
  
  // Tracking
  const [playedSeconds, setPlayedSeconds] = useState(0);

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

  // Sync progress with Supabase every 10 seconds of playback
  useEffect(() => {
    const syncProgress = async () => {
      if (!video || playedSeconds === 0) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;
      
      // Upsert progress
      await supabase.from('video_views').upsert({
        video_id: video.id,
        user_id: userId,
        progress_seconds: Math.floor(playedSeconds),
        completed: playedSeconds > (video.duration_seconds * 0.9) && video.duration_seconds > 0
      }, { onConflict: 'video_id,user_id' });
    };

    const interval = setInterval(syncProgress, 10000);
    return () => clearInterval(interval);
  }, [video, playedSeconds]);

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) showToast("Link copiato negli appunti!");
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
          <div className="aspect-video w-full rounded-[32px] overflow-hidden border-2 border-gold-primary/20 bg-black shadow-2xl relative group">
            <Player 
              ref={playerRef}
              url={video.video_url} 
              controls 
              width="100%" 
              height="100%" 
              playing={false}
              onProgress={(state: any) => setPlayedSeconds(state.playedSeconds)}
              playIcon={
                <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform cursor-pointer">
                  <Play size={32} className="text-black ml-1.5" fill="currentColor" />
                </div>
              }
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gold-primary/10 border border-gold-primary/30 rounded-full text-[9px] font-black uppercase tracking-widest text-gold-primary">{video.category}</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-500">Video Lesson</span>
              </div>
              <h1 className="text-3xl font-display font-bold text-white leading-tight">{video.title}</h1>
              <div className="flex items-center gap-4 text-[10px] font-medium text-gray-500 uppercase tracking-[0.2em]">
                <span className="flex items-center gap-1.5"><Clock size={12} className="text-gold-primary" /> {Math.floor(video.duration_seconds / 60)} minuti</span>
                <span>•</span>
                <span>Modulo caricato il {new Date(video.created_at).toLocaleDateString('it-IT')}</span>
              </div>
              <div className="mt-4 pt-6 border-t border-white/5 text-sm text-gray-400 leading-relaxed max-w-xl italic">
                {video.description || "Nessuna descrizione aggiuntiva fornita per questo modulo di formazione."}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleShare} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-500 hover:text-gold-primary hover:border-gold-primary/40 transition-all shadow-xl"><Share2 size={18} /></button>
              <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-500 hover:text-gold-primary hover:border-gold-primary/40 transition-all shadow-xl"><Bookmark size={18} /></button>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-600 px-1 border-l-2 border-gold-primary/40 ml-1">Libreria Correlata</h2>
          <div className="space-y-4">
            {relatedVideos.map(rv => (
              <Link key={rv.id} to={`/dashboard/videos/${rv.id}`} className="flex gap-4 p-3 rounded-2xl hover:bg-gold-primary/[0.03] border border-transparent hover:border-gold-primary/20 transition-all group">
                <div className="w-24 aspect-video rounded-xl bg-dark-lighter overflow-hidden shrink-0 border border-white/5 shadow-lg">
                  {rv.thumbnail_url ? (
                    <img src={rv.thumbnail_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gold-primary/5">
                      <Logo size="sm" withGlow={false} className="scale-50 opacity-10" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="text-[12px] font-bold text-gray-300 truncate leading-tight group-hover:text-gold-primary transition-colors">{rv.title}</h4>
                  <p className="text-[9px] text-gold-primary/60 mt-1 uppercase font-black tracking-widest">{rv.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-right-10 flex items-center gap-3 px-6 py-4 bg-emerald-500 text-black font-black text-xs rounded-2xl shadow-2xl">
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}
    </div>
  );
};

export default VideoPlayerPage;
