
import React, { useEffect, useState } from 'react';
import { FileText, Plus, Search, Trash2, Eye, EyeOff, Download, Loader2, Edit3, HardDrive, FileCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Document } from '../../types';
import UploadModal from '../../components/UploadModal';
import DocumentViewerModal from '../../components/DocumentViewerModal';
import { downloadFile } from '../../lib/utils';

const AdminDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Document | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

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
    await supabase.from('documents').update({ is_published: !currentStatus }).eq('id', id);
    fetchDocs();
  };

  const deleteDoc = async (id: string) => {
    if (!confirm('Eliminare definitivamente questo documento?')) return;
    await supabase.from('documents').delete().eq('id', id);
    fetchDocs();
  };

  const filteredDocs = documents.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Archivio Documenti</h1>
          <p className="text-dark-muted text-sm mt-1">Carica guide, report e materiale di approfondimento per i tuoi clienti.</p>
        </div>
        
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="px-4 py-2 bg-gold-primary text-black rounded-md text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
        >
          <Plus size={16} /> Nuovo File
        </button>
      </header>

      <div className="flex items-center gap-4 bg-[#0a0a0a] border border-dark-border p-3 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={16} />
          <input 
            type="text"
            placeholder="Cerca risorse per nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border-none text-sm text-white focus:ring-0 outline-none"
          />
        </div>
        <div className="h-6 w-[1px] bg-dark-border"></div>
        <span className="text-[10px] font-bold text-dark-muted uppercase tracking-widest px-2">{filteredDocs.length} Risorse</span>
      </div>

      <div className="business-card rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#1c1c1c] border-b border-dark-border">
              <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-widest">Documento</th>
              <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-widest text-center">Peso</th>
              <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-widest text-center">Stato</th>
              <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-widest text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center"><Loader2 size={24} className="animate-spin text-gold-primary mx-auto" /></td></tr>
            ) : filteredDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-dark-lighter transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-dark-border flex items-center justify-center text-gold-primary">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{doc.title}</p>
                      <p className="text-[10px] text-dark-muted font-bold uppercase tracking-wider">{doc.file_type} • {doc.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                   <p className="text-xs text-white">{(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${doc.is_published ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-dark-muted border-dark-border'}`}>
                    {doc.is_published ? 'Visibile' : 'Nascosto'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => setSelectedDoc(doc)} className="text-dark-muted hover:text-white transition-colors" title="Anteprima">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => togglePublished(doc.id, doc.is_published)} className="text-dark-muted hover:text-white transition-colors" title="Toggle Visibilità">
                      {doc.is_published ? <EyeOff size={18} /> : <FileCheck size={18} />}
                    </button>
                    <button onClick={() => { setEditingItem(doc); setIsModalOpen(true); }} className="text-dark-muted hover:text-gold-primary transition-colors" title="Modifica">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => deleteDoc(doc.id)} className="text-dark-muted hover:text-red-400 transition-colors" title="Elimina">
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
        onSuccess={fetchDocs}
        type="document"
        editingItem={editingItem}
      />

      <DocumentViewerModal 
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDownload={(d) => downloadFile(d.file_url, d.file_name)}
      />
    </div>
  );
};

export default AdminDocuments;
