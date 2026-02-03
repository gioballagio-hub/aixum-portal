
import React, { useEffect, useState } from 'react';
import { FileText, Plus, Search, Trash2, Eye, EyeOff, Download } from 'lucide-react';
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
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setDocuments(data);
    setLoading(false);
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('documents')
      .update({ is_published: !currentStatus })
      .eq('id', id);
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
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-gold-primary font-bold uppercase tracking-[0.3em] text-[10px]">Asset Management</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold">Gestione <span className="gold-text-gradient italic">Documenti</span></h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Cerca file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 gold-gradient text-black rounded-xl font-bold gold-glow transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Nuovo File
          </button>
        </div>
      </header>

      <div className="glass-card gold-border rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-gray-500">File</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-gray-500 text-center">Formato</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-gray-500 text-center">Peso</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-gray-500">Visibilità</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-12 text-center text-gray-500 italic">Caricamento...</td></tr>
              ) : filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gold-primary border border-white/5">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-white">{doc.title}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">{doc.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-xs text-gray-400 font-mono uppercase">{doc.file_type}</span>
                  </td>
                  <td className="px-8 py-6 text-center text-xs text-gray-500">
                    {(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => togglePublished(doc.id, doc.is_published)}
                      className={`flex items-center gap-2 text-[10px] font-bold uppercase transition-colors ${doc.is_published ? 'text-gold-primary' : 'text-gray-500 hover:text-gray-400'}`}
                    >
                      {doc.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                      {doc.is_published ? 'Visibile' : 'Nascosto'}
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3">
                      <a 
                        href={doc.file_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-3 rounded-xl glass-card border border-white/10 text-gray-400 hover:text-white transition-all"
                        title="Scarica"
                      >
                        <Download size={18} />
                      </a>
                      <button 
                        onClick={() => deleteDoc(doc.id)}
                        className="p-3 rounded-xl glass-card border border-white/10 hover:border-red-500 text-gray-400 hover:text-red-500 transition-all"
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
        onSuccess={fetchDocs}
        type="document"
      />
    </div>
  );
};

export default AdminDocuments;
