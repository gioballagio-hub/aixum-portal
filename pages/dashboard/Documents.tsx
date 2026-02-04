
import React, { useEffect, useState } from 'react';
import { FileText, Download, Search, HardDrive, Loader2, Eye, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Document } from '../../types';
import DocumentViewerModal from '../../components/DocumentViewerModal';

const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // Viewer state
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
    d.category.toLowerCase().includes(search.toLowerCase()) ||
    d.file_type.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = async (doc: Document) => {
    setDownloadingId(doc.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Track the download in the DB
        await supabase.from('document_downloads').insert([
          { document_id: doc.id, user_id: session.user.id }
        ]);
      }
      
      // Open file in new tab for direct download
      const link = document.createElement('a');
      link.href = doc.file_url;
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download tracking failed:', err);
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  const handleView = async (doc: Document) => {
    // Apri il modal
    setSelectedDoc(doc);
    
    // Track viewing (optional but good for analytics)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Possiamo usare la stessa tabella o una dedicata per le "views"
        console.log(`Utente ${session.user.id} sta visualizzando ${doc.id}`);
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-12">
       <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="space-y-2">
          <p className="text-gold-primary font-bold uppercase tracking-[0.3em] text-[10px]">Archivio Digitale</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold">I Tuoi <span className="gold-text-gradient italic">Documenti</span></h1>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Cerca per nome, tipo o categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all placeholder:text-gray-600"
          />
        </div>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 w-full glass-card animate-pulse rounded-2xl"></div>)}
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="hidden md:grid grid-cols-12 px-8 text-xs font-bold uppercase tracking-widest text-gray-500">
            <div className="col-span-5">Nome Documento</div>
            <div className="col-span-2 text-center">Formato</div>
            <div className="col-span-2 text-center">Peso</div>
            <div className="col-span-3 text-right">Azioni</div>
          </div>

          {filteredDocs.map((doc, idx) => (
            <div 
              key={doc.id} 
              className="grid grid-cols-1 md:grid-cols-12 items-center p-6 md:px-8 rounded-[24px] glass-card gold-border hover:bg-white/[0.04] transition-all group animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="col-span-1 md:col-span-5 flex items-center gap-6 mb-4 md:mb-0">
                <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center text-black shadow-lg shadow-gold-primary/20 shrink-0">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg group-hover:text-gold-primary transition-colors truncate">{doc.title}</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">{doc.category}</p>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 text-center mb-4 md:mb-0">
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                  {doc.file_type}
                </span>
              </div>

              <div className="col-span-1 md:col-span-2 text-center text-sm text-gray-500 mb-6 md:mb-0">
                {(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB
              </div>

              <div className="col-span-1 md:col-span-3 flex flex-col sm:flex-row justify-end gap-3">
                <button 
                  onClick={() => handleView(doc)}
                  className="px-6 py-3 glass-card gold-border text-gold-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gold-primary/10 transition-all"
                >
                  <Eye size={18} /> Visualizza
                </button>
                <button 
                  onClick={() => handleDownload(doc)}
                  disabled={downloadingId === doc.id}
                  className="px-6 py-3 gold-gradient text-black rounded-xl font-bold flex items-center justify-center gap-2 gold-glow hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-70"
                >
                  {downloadingId === doc.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  {downloadingId === doc.id ? '...' : 'Scarica'}
                </button>
              </div>
            </div>
          ))}

          {filteredDocs.length === 0 && (
            <div className="py-24 text-center glass-card rounded-[40px] border border-dashed border-white/10">
              <HardDrive size={64} className="mx-auto text-gray-800 mb-6" />
              <h2 className="text-2xl font-bold text-gray-600">Nessun file disponibile per questa ricerca</h2>
            </div>
          )}
        </div>
      )}

      {/* Document Viewer Modal */}
      <DocumentViewerModal 
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default DocumentList;
