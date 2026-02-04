
import React, { useEffect, useState } from 'react';
import { Video as VideoIcon, Plus, Search, Trash2, Eye, EyeOff, Loader2, Edit3, Film, PlayCircle } from 'lucide-react';
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
    await supabase.from('videos').update({ is_published: !currentStatus }).eq('id', id);
    fetchVideos();
  };

  const deleteVideo = async (id: string) => {
    if (!confirm('Eliminare definitivamente questo video?')) return;
    await supabase.from('videos').delete().eq('id', id);
    fetchVideos();
  };

  const filteredVideos = videos.filter(v => v.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Libreria Video</h1>
          <p className="text-dark-muted text-sm mt-1">Pubblica nuovi moduli formativi e gestisci i corsi attivi.</p>
        </div>
        
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="px-4 py-2 bg-gold-primary text-black rounded-md text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
        >
          <Plus size={16} /> Nuovo Video
        </button>
      </header>

      <div className="flex items-center gap-4 bg-[#0a0a0a] border border-dark-border p-3 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={16} />
          <input 
            type="text"
            placeholder="Cerca per titolo o categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border-none text-sm text-white focus:ring-0 outline-none"
          />
        </div>
        <div className="h-6 w-[1px] bg-dark-border"></div>
        <span className="text-[10px] font-bold text-dark-muted uppercase tracking-widest px-2">{filteredVideos.length} Asset</span>
      </div>

      <div className="business-card rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#1c1c1c] border-b border-dark-border">
              <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-widest">Contenuto Multimediale</th>
              <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-widest text-center">Durata</th>
              <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-widest text-center">Stato</th>
              <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-widest text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center"><Loader2 size={24} className="animate-spin text-gold-primary mx-auto" /></td></tr>
            ) : filteredVideos.map((video) => (
              <tr key={video.id} className="hover:bg-dark-lighter transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 aspect-video rounded bg-dark-border overflow-hidden relative">
                      {video.thumbnail_url && <img src={video.thumbnail_url} className="w-full h-full object-cover opacity-60" alt="" />}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle size={16} className="text-white opacity-40 group-hover:opacity-100" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{video.title}</p>
                      <p className="text-[10px] text-dark-muted font-bold uppercase tracking-wider">{video.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                   <p className="text-xs text-white">{Math.floor(video.duration_seconds / 60)}m {video.duration_seconds % 60}s</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${video.is_published ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-dark-muted border-dark-border'}`}>
                    {video.is_published ? 'Online' : 'Draft'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => togglePublished(video.id, video.is_published)} className="text-dark-muted hover:text-white transition-colors" title="Toggle Visibilità">
                      {video.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button onClick={() => { setEditingItem(video); setIsModalOpen(true); }} className="text-dark-muted hover:text-gold-primary transition-colors" title="Modifica">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => deleteVideo(video.id)} className="text-dark-muted hover:text-red-400 transition-colors" title="Elimina">
                      <Trash2 size={18} />
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
        editingItem={editingItem}
      />
    </div>
  );
};

export default AdminVideos;
