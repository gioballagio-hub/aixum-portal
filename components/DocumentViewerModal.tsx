
import React, { useState, useEffect } from 'react';
import { X, Download, Maximize2, Loader2, FileWarning, ExternalLink } from 'lucide-react';
import { Document, Certificate } from '../types';

interface DocumentViewerModalProps {
  document: Document | Certificate | null;
  onClose: () => void;
  onDownload: (doc: any) => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ document, onClose, onDownload }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (document) setLoading(true);
  }, [document]);

  if (!document) return null;

  const fileExt = document.file_type?.toLowerCase() || 'pdf';
  const isPDF = fileExt === 'pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(fileExt);
  const isOffice = ['xlsx', 'xls', 'docx', 'doc', 'pptx', 'ppt'].includes(fileExt);

  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.file_url)}`;
  const pdfViewerUrl = `${document.file_url}#toolbar=0&navpanes=0&scrollbar=1`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full h-full max-w-5xl business-card rounded-lg overflow-hidden flex flex-col animate-in zoom-in-95 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border bg-dark-lighter shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded bg-gold-primary/10 flex items-center justify-center text-gold-primary">
              <Maximize2 size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm text-white truncate max-w-[200px] sm:max-w-md">{document.title}</h2>
              <p className="text-[10px] text-dark-muted font-bold uppercase tracking-widest">{document.category} • {fileExt.toUpperCase()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onDownload(document)}
              className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-gold-primary text-black rounded text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <Download size={14} /> Scarica
            </button>
            <button onClick={onClose} className="p-2 rounded hover:bg-white/5 text-dark-muted hover:text-white transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Viewer Content */}
        <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black">
              <Loader2 className="animate-spin text-gold-primary" size={32} />
              <p className="text-dark-muted text-[10px] font-bold uppercase tracking-widest">Caricamento risorsa...</p>
            </div>
          )}

          {isPDF ? (
            <iframe src={pdfViewerUrl} className="w-full h-full border-none bg-white" onLoad={() => setLoading(false)} title={document.title} />
          ) : isOffice ? (
            <iframe src={officeViewerUrl} className="w-full h-full border-none bg-white" onLoad={() => setLoading(false)} title={document.title} frameBorder="0" />
          ) : isImage ? (
            <div className="w-full h-full p-4 flex items-center justify-center overflow-auto">
              <img src={document.file_url} alt={document.title} className="max-w-full max-h-full object-contain shadow-2xl" onLoad={() => setLoading(false)} />
            </div>
          ) : (
            <div className="text-center p-12 space-y-4 max-w-sm">
              <div className="w-16 h-16 rounded-full bg-dark-lighter border border-dark-border flex items-center justify-center mx-auto">
                <FileWarning size={32} className="text-dark-muted" />
              </div>
              <h3 className="text-lg font-bold">Anteprima non disponibile</h3>
              <p className="text-xs text-dark-muted leading-relaxed">
                Il formato <span className="text-white">.{fileExt}</span> deve essere scaricato per essere visualizzato.
              </p>
              <button onClick={() => onDownload(document)} className="w-full py-3 bg-gold-primary text-black rounded font-bold text-xs flex items-center justify-center gap-2">
                <Download size={16} /> Scarica Ora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;
