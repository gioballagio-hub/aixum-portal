
import React, { useState } from 'react';
import { X, Upload, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';
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
  const [thumbnail, setThumbnail] = useState<File | null>(null);
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessione scaduta.');

      const user = session.user;
      const bucketName = type === 'video' ? 'videos' : 'documents';
      
      // Upload Main File
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-main.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl: fileUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);

      // Upload Thumbnail (Optional for Video)
      let thumbUrl = null;
      if (type === 'video' && thumbnail) {
        const thumbExt = thumbnail.name.split('.').pop();
        const thumbName = `${Date.now()}-thumb.${thumbExt}`;
        const thumbPath = `${user.id}/${thumbName}`;
        const { error: thumbUploadError } = await supabase.storage.from('videos').upload(thumbPath, thumbnail);
        if (!thumbUploadError) {
          const { data: { publicUrl: tUrl } } = supabase.storage.from('videos').getPublicUrl(thumbPath);
          thumbUrl = tUrl;
        }
      }

      const table = type === 'video' ? 'videos' : 'documents';
      const payload: any = {
        title: title.trim(),
        category: category,
        is_published: false,
        upload_by: user.id
      };

      if (type === 'video') {
        payload.description = description.trim();
        payload.video_url = fileUrl;
        payload.thumbnail_url = thumbUrl;
        payload.duration_seconds = 0; 
      } else {
        payload.file_name = file.name;
        payload.file_url = fileUrl;
        payload.file_size_bytes = file.size;
        payload.file_type = fileExt || 'unknown';
      }

      const { error: dbError } = await supabase.from(table).insert([payload]);
      if (dbError) throw dbError;

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl glass-card gold-border rounded-xl p-8 animate-in zoom-in-95 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 gold-gradient"></div>
        
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">Carica <span className="gold-text-gradient">{type === 'video' ? 'Video' : 'Asset'}</span></h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">L'elemento verrà salvato in bozza</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all">
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleUpload} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gold-primary opacity-80">Titolo Modulo</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all"
              placeholder="es. Introduzione all'AI Generativa"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gold-primary opacity-80">Categoria</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-lg bg-dark-lighter border border-white/10 text-white focus:border-gold-primary outline-none transition-all"
                required
              >
                <option value="">Seleziona...</option>
                <option value="AI Strategy">AI Strategy</option>
                <option value="Automation">Automation</option>
                <option value="Marketing">Marketing</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gold-primary opacity-80">Sorgente File</label>
              <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs rounded-lg bg-white/5 border border-dashed border-white/10 text-gray-500 hover:border-gold-primary hover:text-white cursor-pointer transition-all truncate">
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                {file ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Upload size={12} />}
                <span className="truncate">{file ? file.name : 'Seleziona...'}</span>
              </label>
            </div>
          </div>

          {type === 'video' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gold-primary opacity-80">Miniatura (Thumbnail)</label>
                <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs rounded-lg bg-white/5 border border-dashed border-white/10 text-gray-500 hover:border-gold-primary hover:text-white cursor-pointer transition-all truncate">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setThumbnail(e.target.files?.[0] || null)} />
                  {thumbnail ? <CheckCircle2 size={12} className="text-emerald-500" /> : <ImageIcon size={12} />}
                  <span className="truncate">{thumbnail ? thumbnail.name : 'Carica immagine...'}</span>
                </label>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gold-primary opacity-80">Descrizione</label>
                <input 
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all"
                  placeholder="Breve descrizione..."
                />
              </div>
            </div>
          )}

          {error && <div className="text-[10px] text-red-400 bg-red-500/5 p-2.5 rounded border border-red-500/10 font-bold">{error}</div>}

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} disabled={uploading} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">Annulla</button>
            <button 
              type="submit" 
              disabled={uploading} 
              className="flex-[2] py-3 gold-gradient text-black rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-gold-primary/10 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? 'Trasferimento...' : 'Avvia Caricamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
