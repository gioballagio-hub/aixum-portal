
import React, { useEffect, useState } from 'react';
import { Video as VideoIcon, Plus, Search, Trash2, Eye, EyeOff, Loader2, Edit3, PlayCircle, RefreshCw } from 'lucide-react';
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
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestione Video</h1>
          <p className="text-dark-muted text-sm mt-1">Pubblica nuovi moduli e gestisci la libreria formativa.</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={fetchVideos} className="sb-button-secondary py-2.5">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="sb-button-primary py-2.5"
          >
            <Plus size={16} /> Carica Video
          </button>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={14} />
        <input 
          type="text"
          placeholder="Cerca per titolo o categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sb-input pl-10"
        />
      </div>

      <div className="sb-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-dark-lighter border-b border-dark-border">
                <th className="px-6 py-4 text-[11px] font-bold text-dark-muted uppercase tracking-widest">Modulo / Categoria</th>
                <th className="px-6 py-4 text-[11px] font-bold text-dark-muted uppercase tracking-widest text-center">Durata</th>
                <th className="px-6 py-4 text-[11px] font-bold text-dark-muted uppercase tracking-widest text-center">Stato</th>
                <th className="px-6 py-4 text-[11px] font-bold text-dark-muted uppercase tracking-widest text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-sm">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center"><Loader2 size={24} className="animate-spin text-gold-primary mx-auto" /></td></tr>
              ) : filteredVideos.map((video) => (
                <tr key={video.id} className="hover:bg-dark-lighter transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 aspect-video rounded bg-black border border-dark-border flex items-center justify-center relative overflow-hidden">
                        {video.thumbnail_url && <img src={video.thumbnail_url} className="w-full h-full object-cover opacity-50" alt="" />}
                        <PlayCircle size={14} className="absolute text-white/40" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{video.title}</p>
                        <p className="text-[10px] text-gold-primary font-bold uppercase tracking-wider">{video.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-xs text-dark-muted">
                    {Math.floor(video.duration_seconds / 60)}m {video.duration_seconds % 60}s
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${video.is_published ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-white/5 text-dark-muted border border-dark-border'}`}>
                      {video.is_published ? 'Online' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3 text-dark-muted">
                      <button onClick={() => togglePublished(video.id, video.is_published)} className="hover:text-white transition-colors">
                        {video.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => { setEditingItem(video); setIsModalOpen(true); }} className="hover:text-gold-primary transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => deleteVideo(video.id)} className="hover:text-red-400 transition-colors">
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
