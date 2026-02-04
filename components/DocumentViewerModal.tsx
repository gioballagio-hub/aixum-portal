
import React, { useState } from 'react';
import { X, Download, Maximize2, Loader2, FileWarning, ExternalLink } from 'lucide-react';
import { Document } from '../types';

interface DocumentViewerModalProps {
  document: Document | null;
  onClose: () => void;
  onDownload: (doc: Document) => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ document, onClose, onDownload }) => {
  const [loading, setLoading] = useState(true);

  if (!document) return null;

  const isPDF = document.file_type.toLowerCase() === 'pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(document.file_type.toLowerCase());

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
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-black">
              <Maximize2 size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg md:text-xl truncate max-w-[200px] md:max-w-md">{document.title}</h2>
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
        <div className="flex-1 bg-black/20 relative flex items-center justify-center overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-dark">
              <Loader2 className="animate-spin text-gold-primary" size={48} />
              <p className="text-gray-500 italic animate-pulse">Caricamento anteprima...</p>
            </div>
          )}

          {isPDF ? (
            <iframe
              src={`${document.file_url}#toolbar=0`}
              className="w-full h-full border-none"
              onLoad={() => setLoading(false)}
              title={document.title}
            />
          ) : isImage ? (
            <div className="w-full h-full p-8 flex items-center justify-center">
              <img 
                src={document.file_url} 
                alt={document.title}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                onLoad={() => setLoading(false)}
              />
            </div>
          ) : (
            <div className="text-center p-12 space-y-6 max-w-md">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center mx-auto">
                <FileWarning size={40} className="text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold">Anteprima non disponibile</h3>
              <p className="text-gray-400">
                I file di tipo <span className="text-white font-bold">.{document.file_type}</span> non possono essere visualizzati direttamente. 
                Scarica il file per consultarlo sul tuo dispositivo.
              </p>
              <button 
                onClick={() => onDownload(document)}
                className="inline-flex items-center gap-2 px-8 py-4 gold-gradient text-black rounded-xl font-bold gold-glow hover:scale-105 transition-all"
              >
                <Download size={20} /> Scarica Ora
              </button>
            </div>
          )}
        </div>

        {/* Mobile Footer Action */}
        <div className="md:hidden p-6 border-t border-white/5">
          <button 
            onClick={() => onDownload(document)}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 gold-gradient text-black rounded-xl font-bold"
          >
            <Download size={18} /> Scarica Documento
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;
