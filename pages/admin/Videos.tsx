
import React, { useEffect, useState } from 'react';
import { Video as VideoIcon, Plus, Search, Trash2, Eye, EyeOff, MoreVertical, Filter } from 'lucide-react';
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Libreria Multimediale</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Gestione contenuti video per i clienti</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
            <input 
              type="text"
              placeholder="Cerca per titolo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 gold-gradient text-black rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-gold-primary/5"
          >
            <Plus size={14} /> Nuovo Contenuto
          </button>
        </div>
      </header>

      <div className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.01]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Preview & Titolo</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 hidden md:table-cell">Categoria</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Stato</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-xs text-gray-600 animate-pulse">Sincronizzazione archivio...</td></tr>
            ) : filteredVideos.map((video) => (
              <tr key={video.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 aspect-video rounded-md bg-dark-lighter overflow-hidden border border-white/5 shrink-0 relative">
                      {video.thumbnail_url ? <img src={video.thumbnail_url} className="w-full h-full object-cover opacity-60" /> : <div className="w-full h-full flex items-center justify-center"><VideoIcon size={12} className="text-gray-800" /></div>}
                    </div>
                    <span className="text-xs font-bold text-gray-200 truncate group-hover:text-gold-primary transition-colors">{video.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-bold uppercase text-gray-500 tracking-tight">
                    {video.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${video.is_published ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-gray-600'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${video.is_published ? 'text-emerald-500/80' : 'text-gray-600'}`}>
                      {video.is_published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button 
                      onClick={() => togglePublished(video.id, video.is_published)}
                      className="p-1.5 rounded hover:bg-white/5 text-gray-600 hover:text-gold-primary transition-all"
                      title={video.is_published ? "Metti in Bozza" : "Pubblica"}
                    >
                      {video.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button 
                      onClick={() => deleteVideo(video.id)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all"
                      title="Elimina"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
