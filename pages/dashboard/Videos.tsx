
import React, { useEffect, useState } from 'react';
import { Play, Search, Filter, Video as VideoIcon } from 'lucide-react';
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
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-gold-primary font-bold uppercase tracking-[0.3em] text-[10px]">Corsi Formativi</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold">Area <span className="gold-text-gradient italic">Video</span></h1>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Cerca video o categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all"
          />
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="aspect-video rounded-3xl bg-white/5 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map(video => (
            <Link key={video.id} to={`/dashboard/videos/${video.id}`} className="group flex flex-col glass-card rounded-[32px] overflow-hidden border border-white/5 hover:border-gold-primary transition-all duration-500 hover:translate-y-[-8px]">
              <div className="aspect-video relative overflow-hidden bg-dark-lighter">
                {video.thumbnail_url ? (
                   <img src={video.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={video.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold-primary/10 to-transparent">
                    <VideoIcon size={48} className="text-gold-primary/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center gold-glow transform scale-75 group-hover:scale-100 transition-transform">
                    <Play size={20} className="text-black ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold">
                  {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="mb-4">
                  <span className="px-3 py-1 rounded-full gold-border text-gold-primary text-[9px] font-black uppercase tracking-widest">{video.category}</span>
                </div>
                <h3 className="text-xl font-bold mb-6 group-hover:text-gold-primary transition-colors flex-1">{video.title}</h3>
                <button className="w-full py-3 rounded-xl gold-gradient text-black font-bold flex items-center justify-center gap-2 group-hover:gold-glow transition-all">
                  Guarda Ora <Play size={16} fill="black" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {!loading && filteredVideos.length === 0 && (
        <div className="py-20 text-center glass-card rounded-[40px] border-dashed border-white/10">
          <VideoIcon size={64} className="mx-auto text-gray-700 mb-6" />
          <h2 className="text-2xl font-bold text-gray-500">Nessun video trovato per i criteri di ricerca</h2>
        </div>
      )}
    </div>
  );
};

export default VideoList;
