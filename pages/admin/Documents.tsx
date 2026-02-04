
import React, { useEffect, useState } from 'react';
import { FileText, Plus, Search, Trash2, Eye, EyeOff, Download, Loader2, Edit3, HardDrive } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Document } from '../../types';
import UploadModal from '../../components/UploadModal';

const AdminDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Document | null>(null);

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

  const handleEdit = (doc: Document) => {
    setEditingItem(doc);
    setIsModalOpen(true);
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
              className="pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all w-48 md:w-64"
            />
          </div>
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="px-6 py-2.5 gold-gradient text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:scale-[1.02] transition-all"
          >
            <Plus size={14} /> Nuovo File
          </button>
        </div>
      </header>

      <div className="glass-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600">Documento</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600 text-center">Tipo</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600 text-center">Peso</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-20 text-center"><Loader2 size={24} className="animate-spin text-gold-primary mx-auto" /></td></tr>
              ) : filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gold-primary/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gold-primary group-hover:scale-110 transition-transform shadow-inner">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-200 truncate group-hover:text-gold-primary transition-colors">{doc.title}</p>
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mt-0.5">{doc.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter px-2 py-1 bg-white/5 rounded border border-white/5">{doc.file_type}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-[10px] text-gray-600 font-bold">
                    {(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => togglePublished(doc.id, doc.is_published)}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-gold-primary transition-all"
                        title={doc.is_published ? "Nascondi" : "Pubblica"}
                      >
                        {doc.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button 
                        onClick={() => handleEdit(doc)}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-gold-primary transition-all"
                        title="Modifica"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteDoc(doc.id)}
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
        onSuccess={fetchDocs}
        type="document"
        editingItem={editingItem}
      />
    </div>
  );
};

export default AdminDocuments;
