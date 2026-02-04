
import React, { useEffect, useState } from 'react';
import { FileText, Download, Search, Loader2, Eye, CheckCircle2, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Document } from '../../types';
import DocumentViewerModal from '../../components/DocumentViewerModal';
import { downloadFile } from '../../lib/utils';

const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    const { data } = await supabase.from('documents').select('*').eq('is_published', true).order('created_at', { ascending: false });
    if (data) setDocuments(data);
    setLoading(false);
  };

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
      await downloadFile(doc.file_url, doc.file_name || doc.title);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Archivio Documenti</h1>
          <p className="text-dark-muted text-sm mt-1">Risorse tecniche, guide e report riservati AIXUM.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={14} />
          <input 
            type="text"
            placeholder="Cerca risorse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sb-input pl-10"
          />
        </div>
      </header>

      <div className="space-y-3">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="h-20 w-full bg-dark-lighter animate-pulse rounded-lg border border-dark-border"></div>)
        ) : filteredDocs.map((doc) => (
          <div key={doc.id} className="sb-card p-5 flex items-center justify-between group">
            <div className="flex items-center gap-5 min-w-0">
              <div className="w-10 h-10 rounded bg-black border border-dark-border flex items-center justify-center text-dark-muted group-hover:text-gold-primary transition-all">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white group-hover:text-gold-primary transition-colors truncate">{doc.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-bold text-gold-primary uppercase tracking-widest">{doc.category}</span>
                  <span className="text-[10px] text-dark-muted font-medium uppercase">{doc.file_type} • {(doc.file_size_bytes/1024/1024).toFixed(1)}MB</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedDoc(doc)}
                className="sb-button-secondary py-1.5 px-3 text-xs"
              >
                <Eye size={14} /> <span className="hidden sm:inline">Anteprima</span>
              </button>
              <button 
                onClick={() => handleDownload(doc)}
                disabled={downloadingId === doc.id}
                className="sb-button-primary py-1.5 px-3 text-xs"
              >
                {downloadingId === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                <span className="hidden sm:inline">Scarica</span>
              </button>
            </div>
          </div>
        ))}

        {!loading && filteredDocs.length === 0 && (
          <div className="py-20 text-center border border-dashed border-dark-border rounded-lg">
            <p className="text-sm text-dark-muted">Nessun documento disponibile nell'archivio.</p>
          </div>
        )}
      </div>

      <DocumentViewerModal 
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default DocumentList;
