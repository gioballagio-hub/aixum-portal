
import React, { useEffect, useState } from 'react';
import { FileText, Download, Search, Filter, HardDrive } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Document } from '../../types';

const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const handleDownload = (doc: Document) => {
    // In actual app, logic to handle authenticated download from Supabase Storage
    window.open(doc.file_url, '_blank');
  };

  return (
    <div className="space-y-12">
       <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
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
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all"
          />
        </div>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 w-full glass-card animate-pulse rounded-2xl"></div>)}
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="hidden md:grid grid-cols-12 px-8 text-xs font-bold uppercase tracking-widest text-gray-500">
            <div className="col-span-6">Nome Documento</div>
            <div className="col-span-2 text-center">Formato</div>
            <div className="col-span-2 text-center">Peso</div>
            <div className="col-span-2 text-right">Azioni</div>
          </div>

          {filteredDocs.map(doc => (
            <div key={doc.id} className="grid grid-cols-1 md:grid-cols-12 items-center p-6 md:px-8 rounded-[24px] glass-card gold-border hover:bg-white/[0.04] transition-all group">
              <div className="col-span-1 md:col-span-6 flex items-center gap-6 mb-4 md:mb-0">
                <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center text-black shadow-lg shadow-gold-primary/20">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:text-gold-primary transition-colors">{doc.title}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mt-1">{doc.category}</p>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 text-center mb-4 md:mb-0">
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase">{doc.file_type}</span>
              </div>

              <div className="col-span-1 md:col-span-2 text-center text-sm text-gray-400 mb-6 md:mb-0">
                {(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-end">
                <button 
                  onClick={() => handleDownload(doc)}
                  className="w-full md:w-auto px-8 py-3 gold-gradient text-black rounded-xl font-bold flex items-center justify-center gap-2 gold-glow hover:scale-105 transition-all"
                >
                  <Download size={18} /> Scarica
                </button>
              </div>
            </div>
          ))}

          {filteredDocs.length === 0 && (
            <div className="py-24 text-center glass-card rounded-[40px] border border-white/5">
              <HardDrive size={64} className="mx-auto text-gray-800 mb-6" />
              <h2 className="text-2xl font-bold text-gray-600">Nessun file disponibile in questa sezione</h2>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
