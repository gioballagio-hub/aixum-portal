
import React, { useEffect, useState } from 'react';
import { Video as VideoIcon, Plus, Search, Trash2, Eye, EyeOff, Loader2, Edit3, Film } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Video } from '../../types';
import UploadModal from '../../components/UploadModal';

const AdminVideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Video | null>(null);

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

  const handleEdit = (video: Video) => {
    setEditingItem(video);
    setIsModalOpen(true);
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
              className="pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all w-48 md:w-64"
            />
          </div>
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="px-6 py-2.5 gold-gradient text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
          >
            <Plus size={14} /> Nuovo Video
          </button>
        </div>
      </header>

      <div className="glass-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600">Video Content</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600 hidden md:table-cell">Categoria</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600 text-center">Stato</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-20 text-center"><Loader2 size={24} className="animate-spin text-gold-primary mx-auto" /></td></tr>
              ) : filteredVideos.map((video) => (
                <tr key={video.id} className="hover:bg-gold-primary/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-5">
                      <div className="w-20 aspect-video rounded-xl bg-dark-lighter overflow-hidden border border-white/10 shrink-0 shadow-lg">
                        {video.thumbnail_url ? (
                          <img src={video.thumbnail_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gold-primary/5 text-gold-primary/20"><Film size={18} /></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-200 truncate group-hover:text-gold-primary transition-colors">{video.title}</p>
                        <p className="text-[10px] text-gray-600 uppercase mt-1 tracking-widest font-bold">Aggiornato {new Date(video.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gold-primary/70 bg-gold-primary/5 px-3 py-1 rounded-full border border-gold-primary/20">
                      {video.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${video.is_published ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'}`}>
                      {video.is_published ? 'Pubblicato' : 'Bozza'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => togglePublished(video.id, video.is_published)}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-gold-primary transition-all"
                        title={video.is_published ? "Nascondi" : "Rendi Pubblico"}
                      >
                        {video.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button 
                        onClick={() => handleEdit(video)}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-gold-primary transition-all"
                        title="Modifica Info"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteVideo(video.id)}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-red-400 transition-all"
                        title="Rimuovi"
                      >
                        <Trash2 size={16} />
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
        editingItem={editingItem}
      />
    </div>
  );
};

export default AdminVideos;
