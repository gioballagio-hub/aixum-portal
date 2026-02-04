
import React, { useEffect, useState } from 'react';
import { FileText, Plus, Search, Trash2, Eye, EyeOff, Loader2, Edit3, RefreshCw, FileCheck } from 'lucide-react';
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
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestione Documenti</h1>
          <p className="text-dark-muted text-sm mt-1">Carica guide tecniche e report riservati AIXUM.</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={fetchDocs} className="sb-button-secondary py-2.5">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="sb-button-primary py-2.5"
          >
            <Plus size={16} /> Carica File
          </button>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={14} />
        <input 
          type="text"
          placeholder="Cerca per nome o categoria..."
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
                <th className="px-6 py-4 text-[11px] font-bold text-dark-muted uppercase tracking-widest">Documento / Tipo</th>
                <th className="px-6 py-4 text-[11px] font-bold text-dark-muted uppercase tracking-widest text-center">Peso</th>
                <th className="px-6 py-4 text-[11px] font-bold text-dark-muted uppercase tracking-widest text-center">Stato</th>
                <th className="px-6 py-4 text-[11px] font-bold text-dark-muted uppercase tracking-widest text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-sm">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center"><Loader2 size={24} className="animate-spin text-gold-primary mx-auto" /></td></tr>
              ) : filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-dark-lighter transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded bg-black border border-dark-border flex items-center justify-center text-dark-muted">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{doc.title}</p>
                        <p className="text-[10px] text-gold-primary font-bold uppercase tracking-wider">{doc.file_type} • {doc.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-xs text-dark-muted">
                    {(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${doc.is_published ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-white/5 text-dark-muted border border-dark-border'}`}>
                      {doc.is_published ? 'Visibile' : 'Nascosto'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3 text-dark-muted">
                      <button onClick={() => setSelectedDoc(doc)} className="hover:text-white transition-colors">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => togglePublished(doc.id, doc.is_published)} className="hover:text-white transition-colors">
                        {doc.is_published ? <EyeOff size={16} /> : <FileCheck size={16} />}
                      </button>
                      <button onClick={() => { setEditingItem(doc); setIsModalOpen(true); }} className="hover:text-gold-primary transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => deleteDoc(doc.id)} className="hover:text-red-400 transition-colors">
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
      
      <DocumentViewerModal 
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDownload={(d) => downloadFile(d.file_url, d.file_name)}
      />
    </div>
  );
};

export default AdminDocuments;
