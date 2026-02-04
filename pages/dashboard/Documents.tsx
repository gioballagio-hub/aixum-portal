
import React, { useEffect, useState } from 'react';
import { FileText, Download, Search, HardDrive, Loader2, Eye, CheckCircle2 } from 'lucide-react';
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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

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
      const success = await downloadFile(doc.file_url, doc.file_name || doc.title);
      if (success) showToast(`Download avviato: ${doc.title}`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold-primary/30 pb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Archivio <span className="gold-text-gradient">Documenti</span></h1>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Accesso alle risorse riservate AIXUM</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-primary/60" size={14} />
            <input 
              type="text"
              placeholder="Cerca file..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white/5 border border-gold-primary/40 text-white focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/20 outline-none transition-all w-48 md:w-64"
            />
          </div>
        </div>
      </header>

      {loading && documents.length === 0 ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 w-full bg-white/[0.02] animate-pulse rounded-2xl border border-gold-primary/20"></div>)}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocs.map((doc) => (
            <div 
              key={doc.id} 
              className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border-2 border-gold-primary/60 hover:border-gold-primary hover:bg-gold-primary/[0.05] transition-all group shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center gap-5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gold-primary/20 border border-gold-primary/40 flex items-center justify-center text-gold-primary shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                  <FileText size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-white truncate group-hover:text-gold-primary transition-colors">{doc.title}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[10px] text-gold-primary font-black uppercase tracking-widest bg-gold-primary/10 px-2 py-0.5 rounded border border-gold-primary/20">{doc.category}</span>
                    <span className="text-[10px] text-gray-300 font-bold">{(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB &bull; {doc.file_type.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={() => setSelectedDoc(doc)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-[10px] font-black uppercase text-gray-200 hover:text-gold-primary hover:border-gold-primary/50 transition-all"
                >
                  <Eye size={16} /> <span className="hidden sm:inline">Anteprima</span>
                </button>
                <button 
                  onClick={() => handleDownload(doc)}
                  disabled={downloadingId === doc.id}
                  className="flex items-center gap-2 px-6 py-2.5 gold-gradient text-black rounded-xl text-[11px] font-black uppercase shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {downloadingId === doc.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  <span className="hidden sm:inline">Scarica</span>
                </button>
              </div>
            </div>
          ))}

          {filteredDocs.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed border-gold-primary/20 rounded-[32px] bg-white/[0.01]">
              <HardDrive size={40} className="mx-auto text-gray-800 mb-4" />
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Nessun documento trovato</p>
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 right-8 z-[200] animate-in slide-in-from-right-10 flex items-center gap-3 px-6 py-4 bg-emerald-500 text-black font-black text-xs rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <CheckCircle2 size={18} /> {toast}
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
