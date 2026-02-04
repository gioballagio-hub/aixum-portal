
import React, { useEffect, useState } from 'react';
import { Play, Search, Filter, Video as VideoIcon, Clock } from 'lucide-react';
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Libreria Video</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Corsi di formazione e workshop AI</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
            <input 
              type="text"
              placeholder="Cerca video..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all w-48 md:w-64"
            />
          </div>
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-gold-primary transition-all">
            <Filter size={16} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="aspect-[16/10] rounded-xl bg-white/5 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredVideos.map(video => (
            <Link key={video.id} to={`/dashboard/videos/${video.id}`} className="group flex flex-col glass-card rounded-xl overflow-hidden border border-white/5 hover:border-gold-primary/30 transition-all">
              <div className="aspect-video relative overflow-hidden bg-dark-lighter">
                {video.thumbnail_url ? (
                   <img src={video.thumbnail_url} className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gold-primary/5">
                    <VideoIcon size={24} className="text-gold-primary/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                    <Play size={16} className="text-black ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-bold text-gray-300">
                  {Math.floor(video.duration_seconds / 60)}m
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <span className="text-[8px] font-black uppercase text-gold-primary tracking-widest mb-1 opacity-70">{video.category}</span>
                <h3 className="text-xs font-bold text-gray-200 line-clamp-2 leading-relaxed group-hover:text-gold-primary transition-colors">{video.title}</h3>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-1 text-[9px] text-gray-500">
                      <Clock size={10} /> {new Date(video.created_at).toLocaleDateString()}
                   </div>
                   <Play size={10} className="text-gold-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {!loading && filteredVideos.length === 0 && (
        <div className="py-20 text-center border border-dashed border-white/10 rounded-xl">
          <VideoIcon size={32} className="mx-auto text-gray-800 mb-4" />
          <p className="text-xs text-gray-600 font-medium">Nessun video disponibile per i criteri inseriti</p>
        </div>
      )}
    </div>
  );
};

export default VideoList;
