
import React, { useEffect, useState } from 'react';
import { FileText, Plus, Search, Trash2, Eye, EyeOff, Download, Loader2, HardDrive } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Document } from '../../types';
import UploadModal from '../../components/UploadModal';

const AdminDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (data) setDocuments(data);
    setLoading(false);
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('documents').update({ is_published: !currentStatus }).eq('id', id);
    if (!error) fetchDocs();
  };

  const deleteDoc = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo documento?')) return;
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (!error) fetchDocs();
  };

  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Archivio <span className="gold-text-gradient">Documenti</span></h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-1 font-bold">Gestione risorse e download</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
            <input 
              type="text"
              placeholder="Cerca risorse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all w-48 md:w-64"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 gold-gradient text-black rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={14} /> Nuovo File
          </button>
        </div>
      </header>

      <div className="glass-card border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Documento</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Tipo</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Dimensione</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-20 text-center"><Loader2 size={24} className="animate-spin text-gold-primary mx-auto" /></td></tr>
              ) : filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded bg-white/5 border border-white/5 flex items-center justify-center text-gold-primary group-hover:scale-110 transition-transform">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-200 truncate group-hover:text-gold-primary transition-colors">{doc.title}</p>
                        <p className="text-[9px] text-gray-600 uppercase font-black tracking-tighter mt-0.5">{doc.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">{doc.file_type}</span>
                  </td>
                  <td className="px-6 py-3 text-center text-[10px] text-gray-600">
                    {(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => togglePublished(doc.id, doc.is_published)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gold-primary transition-all"
                        title={doc.is_published ? "Nascondi" : "Pubblica"}
                      >
                        {doc.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <a 
                        href={doc.file_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gold-primary transition-all"
                      >
                        <Download size={14} />
                      </a>
                      <button 
                        onClick={() => deleteDoc(doc.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && !loading && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-xs text-gray-600 italic">Nessun file disponibile.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UploadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDocs}
        type="document"
      />
    </div>
  );
};

export default AdminDocuments;
