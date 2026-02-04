
import React, { useState } from 'react';
import { X, Upload, FileVideo, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'video' | 'document';
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess, type }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !category) {
      setError('Tutti i campi obbligatori devono essere compilati.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utente non autenticato');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const bucketName = type === 'video' ? 'videos' : 'documents';
      const filePath = `${user.id}/${fileName}`;

      // 1. Upload file to Supabase Storage - Configurato per gestire file pesanti
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Permette di sovrascrivere se necessario, utile in caso di retry
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // 2. Insert record into database
      const table = type === 'video' ? 'videos' : 'documents';
      const payload: any = {
        title,
        category,
        is_published: false,
        upload_by: user.id,
      };

      if (type === 'video') {
        payload.description = description;
        payload.video_url = publicUrl;
        payload.duration_seconds = 0; 
      } else {
        payload.file_name = file.name;
        payload.file_url = publicUrl;
        payload.file_size_bytes = file.size;
        payload.file_type = fileExt;
      }

      const { error: dbError } = await supabase
        .from(table)
        .insert([payload]);

      if (dbError) throw dbError;

      onSuccess();
      onClose();
      
      // Reset state
      setTitle('');
      setDescription('');
      setCategory('');
      setFile(null);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || 'Errore durante il caricamento. Verifica la tua connessione.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-2xl glass-card gold-border rounded-[32px] p-8 md:p-12 overflow-y-auto max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl font-display font-bold">
            Carica <span className="gold-text-gradient">{type === 'video' ? 'Nuovo Video' : 'Nuovo Documento'}</span>
          </h2>
          <p className="text-gray-400 mt-2">I contenuti verranno salvati come bozze per la massima sicurezza.</p>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gold-primary">Titolo Contenuto*</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
              className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-gold-primary focus:outline-none transition-all disabled:opacity-50"
              placeholder="Inserisci il titolo..."
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-primary">Categoria*</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={uploading}
                className="w-full px-6 py-4 rounded-xl bg-dark-lighter border border-white/10 text-white focus:border-gold-primary focus:outline-none transition-all appearance-none disabled:opacity-50"
                required
              >
                <option value="">Seleziona...</option>
                <option value="AI Strategy">AI Strategy</option>
                <option value="Automation">Automation</option>
                <option value="Data Analysis">Data Analysis</option>
                <option value="Digital Ethics">Digital Ethics</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-primary">
                {type === 'video' ? 'File Video*' : 'File Documento*'}
              </label>
              <div className="relative">
                <input 
                  type="file"
                  accept={type === 'video' ? "video/*" : ".pdf,.doc,.docx,.xls,.xlsx"}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label 
                  htmlFor="file-upload"
                  className={`flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-white/5 border border-dashed border-white/20 text-gray-400 hover:border-gold-primary hover:text-white cursor-pointer transition-all truncate ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {file ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Upload size={18} />}
                  {file ? file.name : (type === 'video' ? 'Seleziona Video...' : 'Seleziona File...')}
                </label>
              </div>
            </div>
          </div>

          {type === 'video' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-primary">Descrizione</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-gold-primary focus:outline-none transition-all min-h-[100px] disabled:opacity-50"
                placeholder="Breve descrizione del contenuto..."
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-pulse">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button 
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 py-4 glass-card gold-border rounded-xl font-bold hover:bg-white/5 transition-all disabled:opacity-50"
            >
              Annulla
            </button>
            <button 
              type="submit"
              disabled={uploading}
              className="flex-[2] py-4 gold-gradient text-black rounded-xl font-bold gold-glow transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Caricamento in corso...
                </>
              ) : (
                <>
                  Avvia Caricamento <Upload size={18} />
                </>
              )}
            </button>
          </div>
          {uploading && (
            <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
              Non chiudere questa finestra fino al termine.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
