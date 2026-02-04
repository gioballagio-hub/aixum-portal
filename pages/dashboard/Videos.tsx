
import React, { useEffect, useState } from 'react';
import { Play, Search, Video as VideoIcon, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Video } from '../../types';

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase.from('videos').select('*').eq('is_published', true).order('created_at', { ascending: false });
      if (data) setVideos(data);
      setLoading(false);
    };
    fetchVideos();
  }, []);

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(search.toLowerCase()) || 
    v.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Libreria Video</h1>
          <p className="text-dark-muted text-sm mt-1">Moduli formativi e workshop tecnici AIXUM.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={14} />
          <input 
            type="text"
            placeholder="Cerca video o categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sb-input pl-10"
          />
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="aspect-video rounded-lg bg-dark-lighter animate-pulse border border-dark-border"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map(video => (
            <Link key={video.id} to={`/dashboard/videos/${video.id}`} className="sb-card flex flex-col group overflow-hidden">
              <div className="aspect-video relative overflow-hidden bg-black border-b border-dark-border">
                {video.thumbnail_url ? (
                   <img src={video.thumbnail_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <VideoIcon size={24} className="text-dark-muted/20" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <div className="w-10 h-10 rounded-full bg-gold-primary flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                    <Play size={16} className="text-black fill-current" />
                  </div>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase text-gold-primary tracking-widest">{video.category}</span>
                  <div className="flex items-center gap-1 text-[10px] text-dark-muted">
                    <Clock size={10} /> {Math.floor(video.duration_seconds / 60)}m
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-gold-primary transition-colors line-clamp-2 leading-snug">{video.title}</h3>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-[10px] text-dark-muted font-medium uppercase tracking-tighter">Pubblicato {new Date(video.created_at).toLocaleDateString()}</span>
                  <ChevronRight size={14} className="text-dark-muted group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {!loading && filteredVideos.length === 0 && (
        <div className="py-20 text-center border border-dashed border-dark-border rounded-lg">
          <p className="text-sm text-dark-muted">Nessun video trovato per i criteri di ricerca.</p>
        </div>
      )}
    </div>
  );
};

export default VideoList;
