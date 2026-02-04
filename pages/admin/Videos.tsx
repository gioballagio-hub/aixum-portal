
import React, { useEffect, useState } from 'react';
import { Video as VideoIcon, Plus, Search, Trash2, Eye, EyeOff, Loader2, Filter, Film } from 'lucide-react';
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
    const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
    if (data) setVideos(data);
    setLoading(false);
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('videos').update({ is_published: !currentStatus }).eq('id', id);
    if (!error) fetchVideos();
  };

  const deleteVideo = async (id: string) => {
    if (!confirm('Eliminare definitivamente questo video?')) return;
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (!error) fetchVideos();
  };

  const filteredVideos = videos.filter(v => v.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Gestione <span className="gold-text-gradient">Video Corsi</span></h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-1 font-bold">Controllo libreria multimediale</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
            <input 
              type="text"
              placeholder="Cerca contenuti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all w-48 md:w-64"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 gold-gradient text-black rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-gold-primary/10"
          >
            <Plus size={14} /> Nuovo Video
          </button>
        </div>
      </header>

      <div className="glass-card border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Video Content</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 hidden md:table-cell">Categoria</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Stato</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-20 text-center"><Loader2 size={24} className="animate-spin text-gold-primary mx-auto" /></td></tr>
              ) : filteredVideos.map((video) => (
                <tr key={video.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-4">
                      <div className="w-14 aspect-video rounded bg-dark-lighter overflow-hidden border border-white/5 shrink-0">
                        {video.thumbnail_url ? (
                          <img src={video.thumbnail_url} className="w-full h-full object-cover opacity-60" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gold-primary/5 text-gold-primary/20"><Film size={14} /></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-200 truncate group-hover:text-gold-primary transition-colors">{video.title}</p>
                        <p className="text-[9px] text-gray-500 uppercase mt-0.5 tracking-tighter">Caricato il {new Date(video.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 hidden md:table-cell">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 border border-white/5 px-2 py-0.5 rounded bg-white/5">
                      {video.category}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${video.is_published ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'}`}>
                      {video.is_published ? 'Visibile' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => togglePublished(video.id, video.is_published)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gold-primary hover:bg-gold-primary/5 transition-all"
                        title={video.is_published ? "Metti in Bozza" : "Pubblica"}
                      >
                        {video.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button 
                        onClick={() => deleteVideo(video.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
                        title="Elimina"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVideos.length === 0 && !loading && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-xs text-gray-600 italic">Nessun video trovato.</td></tr>
              )}
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
