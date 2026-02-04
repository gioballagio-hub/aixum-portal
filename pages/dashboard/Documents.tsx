
import React, { useEffect, useState } from 'react';
import { FileText, Download, Search, HardDrive, Loader2, Eye, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Document } from '../../types';
import DocumentViewerModal from '../../components/DocumentViewerModal';

const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      const { data } = await supabase.from('documents').select('*').eq('is_published', true).order('created_at', { ascending: false });
      if (data) setDocuments(data);
      setLoading(false);
    };
    fetchDocs();
  }, []);

  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) || 
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = async (doc: Document) => {
    setDownloadingId(doc.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('document_downloads').insert([{ document_id: doc.id, user_id: session.user.id }]);
      }
      window.open(doc.file_url, '_blank');
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Archivio Documenti</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Sfoglia e scarica le risorse premium</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
            <input 
              type="text"
              placeholder="Cerca file..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all w-48 md:w-64"
            />
          </div>
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-gold-primary transition-all">
            <Filter size={16} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-14 w-full glass-card animate-pulse rounded-lg"></div>)}
        </div>
      ) : (
        <div className="overflow-hidden border border-white/5 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Nome Documento</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 hidden md:table-cell text-center">Tipo</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 hidden md:table-cell text-center">Dimensione</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDocs.map((doc, idx) => (
                <tr key={doc.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-gold-primary shrink-0 group-hover:scale-110 transition-transform">
                        <FileText size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-200 truncate group-hover:text-gold-primary transition-colors">{doc.title}</p>
                        <p className="text-[9px] text-gray-500 uppercase font-black">{doc.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-500 uppercase">{doc.file_type}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-[10px] text-gray-500 hidden md:table-cell">
                    {(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedDoc(doc)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gold-primary hover:bg-gold-primary/5 transition-all"
                        title="Visualizza"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => handleDownload(doc)}
                        disabled={downloadingId === doc.id}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gold-primary hover:bg-gold-primary/5 transition-all"
                        title="Scarica"
                      >
                        {downloadingId === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDocs.length === 0 && (
            <div className="py-20 text-center bg-white/[0.01]">
              <HardDrive size={32} className="mx-auto text-gray-800 mb-4" />
              <p className="text-xs text-gray-600 font-medium">Nessun file trovato per questa ricerca</p>
            </div>
          )}
        </div>
      )}

      <DocumentViewerModal 
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default DocumentList;
