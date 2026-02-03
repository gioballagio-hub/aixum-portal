
import React, { useEffect, useState } from 'react';
import { Video as VideoIcon, Plus, Search, Trash2, Eye, EyeOff, MoreVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Video } from '../../types';
import UploadModal from '../../components/UploadModal';

const AdminVideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setVideos(data);
    setLoading(false);
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('videos')
      .update({ is_published: !currentStatus })
      .eq('id', id);
    
    if (!error) fetchVideos();
  };

  const deleteVideo = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo video?')) return;
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (!error) fetchVideos();
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-gold-primary font-bold uppercase tracking-[0.3em] text-[10px]">Content Management</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold">Gestione <span className="gold-text-gradient italic">Video</span></h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Cerca video..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 gold-gradient text-black rounded-xl font-bold gold-glow transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Carica Video
          </button>
        </div>
      </header>

      <div className="glass-card gold-border rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-gray-500">Video</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-gray-500">Categoria</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-gray-500">Stato</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-gray-500">Data</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-500 italic">Caricamento...</td>
                </tr>
              ) : filteredVideos.map((video) => (
                <tr key={video.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-10 rounded-lg bg-dark-lighter overflow-hidden border border-white/5 shrink-0">
                        {video.thumbnail_url ? (
                          <img src={video.thumbnail_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><VideoIcon size={16} className="text-gray-700" /></div>
                        )}
                      </div>
                      <span className="font-bold text-white truncate max-w-[200px]">{video.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {video.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {video.is_published ? (
                      <span className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Pubblicato
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase">
                        <div className="w-2 h-2 rounded-full bg-gray-500" /> Bozza
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-500">
                    {new Date(video.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => togglePublished(video.id, video.is_published)}
                        className="p-3 rounded-xl glass-card border border-white/10 hover:border-gold-primary transition-all text-gray-400 hover:text-gold-primary"
                        title={video.is_published ? "Nascondi" : "Pubblica"}
                      >
                        {video.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button 
                        onClick={() => deleteVideo(video.id)}
                        className="p-3 rounded-xl glass-card border border-white/10 hover:border-red-500 transition-all text-gray-400 hover:text-red-500"
                        title="Elimina"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UploadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchVideos}
        type="video"
      />
    </div>
  );
};

export default AdminVideos;
