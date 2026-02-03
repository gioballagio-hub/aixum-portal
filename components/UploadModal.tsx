
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
      // 1. Verifica sessione attiva
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Sessione non valida. Effettua nuovamente il login.');
      }

      const user = session.user;

      // 2. Preparazione path del file
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const bucketName = type === 'video' ? 'videos' : 'documents';
      const filePath = `${user.id}/${fileName}`;

      // 3. Caricamento su Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Errore Storage: ${uploadError.message}`);
      }

      // 4. Ottieni URL del file
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // 5. Inserimento nel Database
      const table = type === 'video' ? 'videos' : 'documents';
      
      const payload: any = {
        title: title.trim(),
        category: category,
        is_published: false, // Viene salvato come bozza inizialmente
        upload_by: user.id
      };

      if (type === 'video') {
        payload.description = description.trim();
        payload.video_url = publicUrl;
        payload.duration_seconds = 0; 
      } else {
        payload.file_name = file.name;
        payload.file_url = publicUrl;
        payload.file_size_bytes = file.size;
        payload.file_type = fileExt || 'unknown';
      }

      const { error: dbError } = await supabase
        .from(table)
        .insert([payload]);

      if (dbError) {
        console.error('Errore Database dettagliato:', dbError);
        if (dbError.code === '42501') {
          throw new Error('Permesso negato (RLS). Il database non ti riconosce come admin. Assicurati di aver eseguito lo script SQL di riparazione.');
        }
        throw new Error(`Errore Database: ${dbError.message}`);
      }

      // Successo!
      onSuccess();
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Si è verificato un errore durante l\'upload.');
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

        <div className="mb-10">
          <h2 className="text-3xl font-display font-bold">
            Carica <span className="gold-text-gradient">{type === 'video' ? 'Nuovo Video' : 'Nuovo Documento'}</span>
          </h2>
          <p className="text-gray-400 mt-2">I contenuti verranno salvati come bozze in attesa di pubblicazione.</p>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gold-primary">Titolo Contenuto*</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-gold-primary focus:outline-none transition-all"
              placeholder="Inserisci titolo..."
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-primary">Categoria*</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-6 py-4 rounded-xl bg-dark-lighter border border-white/10 text-white focus:border-gold-primary focus:outline-none transition-all appearance-none"
                required
              >
                <option value="">Seleziona...</option>
                <option value="AI Strategy">AI Strategy</option>
                <option value="Automation">Automation</option>
                <option value="Data Analysis">Data Analysis</option>
                <option value="Digital Ethics">Digital Ethics</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gold-primary">
                {type === 'video' ? 'Scegli Video*' : 'Scegli File*' }
              </label>
              <div className="relative">
                <input 
                  type="file"
                  accept={type === 'video' ? "video/*" : ".pdf,.doc,.docx,.xls,.xlsx"}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload-input"
                  required
                />
                <label 
                  htmlFor="file-upload-input"
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-white/5 border border-dashed border-white/20 text-gray-400 hover:border-gold-primary hover:text-white cursor-pointer transition-all truncate"
                >
                  {file ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Upload size={18} />}
                  <span className="truncate">{file ? file.name : 'Scegli file...'}</span>
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
                className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-gold-primary focus:outline-none transition-all min-h-[100px]"
                placeholder="Breve descrizione del video..."
              />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 py-4 glass-card gold-border rounded-xl font-bold hover:bg-white/5 transition-all disabled:opacity-30"
            >
              Annulla
            </button>
            <button 
              type="submit"
              disabled={uploading}
              className="flex-[2] py-4 gold-gradient text-black rounded-xl font-bold gold-glow transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Caricamento...
                </>
              ) : (
                <>
                  Inizia Upload <Upload size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
