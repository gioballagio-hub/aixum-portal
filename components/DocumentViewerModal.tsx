
import React, { useState, useEffect } from 'react';
import { X, Download, Maximize2, Loader2, FileWarning, ExternalLink } from 'lucide-react';
import { Document } from '../types';

interface DocumentViewerModalProps {
  document: Document | null;
  onClose: () => void;
  onDownload: (doc: Document) => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ document, onClose, onDownload }) => {
  const [loading, setLoading] = useState(true);

  // Reset loading state when document changes
  useEffect(() => {
    if (document) setLoading(true);
  }, [document]);

  if (!document) return null;

  const fileExt = document.file_type.toLowerCase();
  const isPDF = fileExt === 'pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(fileExt);
  const isOffice = ['xlsx', 'xls', 'docx', 'doc', 'pptx', 'ppt'].includes(fileExt);

  // Microsoft Office Web Viewer URL
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.file_url)}`;
  
  // PDF URL with parameters to hide toolbar for a cleaner look
  const pdfViewerUrl = `${document.file_url}#toolbar=0&navpanes=0&scrollbar=1`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative w-full h-full max-w-6xl glass-card gold-border rounded-[32px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-black">
              <Maximize2 size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-lg md:text-xl truncate max-w-[150px] sm:max-w-xs md:max-w-md">{document.title}</h2>
              <p className="text-[10px] text-gold-primary font-black uppercase tracking-widest">{document.category} • {document.file_type.toUpperCase()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onDownload(document)}
              className="hidden md:flex items-center gap-2 px-6 py-2 gold-gradient text-black rounded-xl font-bold hover:scale-105 transition-all text-sm"
            >
              <Download size={16} /> Scarica
            </button>
            <button 
              onClick={onClose}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Viewer Content */}
        <div className="flex-1 bg-black/40 relative flex items-center justify-center overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-dark">
              <div className="relative">
                <Loader2 className="animate-spin text-gold-primary" size={48} />
                <div className="absolute inset-0 blur-xl bg-gold-primary/20 animate-pulse"></div>
              </div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest animate-pulse">Generazione Anteprima Premium...</p>
            </div>
          )}

          {isPDF ? (
            <iframe
              src={pdfViewerUrl}
              className="w-full h-full border-none bg-white"
              onLoad={() => setLoading(false)}
              title={document.title}
            />
          ) : isOffice ? (
            <iframe
              src={officeViewerUrl}
              className="w-full h-full border-none bg-white"
              onLoad={() => setLoading(false)}
              title={document.title}
              frameBorder="0"
            />
          ) : isImage ? (
            <div className="w-full h-full p-4 md:p-12 flex items-center justify-center overflow-auto">
              <img 
                src={document.file_url} 
                alt={document.title}
                className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_50px_rgba(212,175,55,0.1)]"
                onLoad={() => setLoading(false)}
              />
            </div>
          ) : (
            <div className="text-center p-12 space-y-6 max-w-md animate-in fade-in zoom-in-95 duration-700">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center mx-auto shadow-xl">
                <FileWarning size={40} className="text-gray-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-bold">Anteprima non <span className="gold-text-gradient">disponibile</span></h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  I file di tipo <span className="text-white font-bold">.{document.file_type}</span> non possono essere visualizzati direttamente per motivi di sicurezza. 
                </p>
              </div>
              <button 
                onClick={() => onDownload(document)}
                className="w-full py-4 gold-gradient text-black rounded-xl font-bold gold-glow hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <Download size={20} /> Scarica Risorsa Premium
              </button>
            </div>
          )}
        </div>

        {/* Mobile Footer Action */}
        <div className="md:hidden p-6 border-t border-white/5 bg-white/[0.01]">
          <button 
            onClick={() => onDownload(document)}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 gold-gradient text-black rounded-xl font-bold shadow-lg"
          >
            <Download size={18} /> Scarica Documento
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;
