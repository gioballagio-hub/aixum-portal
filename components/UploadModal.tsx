
import React, { useState, useEffect } from 'react';
// Added Video to the imports from lucide-react to fix line 147 error
import { X, Upload, CheckCircle2, Loader2, Image as ImageIcon, Edit3, Award, FilePlus, Video } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'video' | 'document' | 'certificate';
  editingItem?: any;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess, type, editingItem }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [userId, setUserId] = useState(''); 
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);

  const isEditing = !!editingItem;

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setTitle(editingItem.title || '');
        setDescription(editingItem.description || '');
        setCategory(editingItem.category || '');
        setUserId(editingItem.user_id || '');
      } else {
        setTitle('');
        setDescription('');
        setCategory('');
        setUserId('');
        setFile(null);
        setThumbnail(null);
      }

      if (type === 'certificate') {
        supabase.from('profiles').select('id, full_name, email').then(({ data }) => setProfiles(data || []));
      }
    }
    setError(null);
  }, [isOpen, editingItem, type]);

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing && !file) {
      setError('Selezione file obbligatoria per nuovi caricamenti.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessione non valida.');

      const table = type === 'video' ? 'videos' : (type === 'document' ? 'documents' : 'certificates');
      const bucketName = type === 'video' ? 'videos' : 'documents';
      
      let fileUrl = editingItem?.file_url || editingItem?.video_url;
      let thumbUrl = editingItem?.thumbnail_url;

      // Gestione Upload File (solo se selezionato uno nuovo)
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${type}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        fileUrl = publicUrl;
      }

      // Gestione Thumbnail Video
      if (thumbnail && type === 'video') {
        const thumbExt = thumbnail.name.split('.').pop();
        const thumbName = `${Date.now()}-thumb.${thumbExt}`;
        const thumbPath = `${session.user.id}/${thumbName}`;
        await supabase.storage.from('videos').upload(thumbPath, thumbnail);
        const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(thumbPath);
        thumbUrl = publicUrl;
      }

      const payload: any = {
        title: title.trim(),
        category: category,
        is_published: editingItem ? editingItem.is_published : true,
      };

      if (type === 'video') {
        payload.description = description.trim();
        payload.video_url = fileUrl;
        payload.thumbnail_url = thumbUrl;
        // Mock duration se non disponibile
        if (!isEditing) payload.duration_seconds = 1800; 
      } else {
        payload.file_url = fileUrl;
        if (file) {
          payload.file_name = file.name;
          payload.file_size_bytes = file.size;
          payload.file_type = file.name.split('.').pop();
        }
      }

      if (type === 'certificate') {
        payload.user_id = userId;
      }

      let dbError;
      if (isEditing) {
        const { error } = await supabase.from(table).update(payload).eq('id', editingItem.id);
        dbError = error;
      } else {
        const { error } = await supabase.from(table).insert([payload]);
        dbError = error;
      }

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
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl glass-card border-2 border-gold-primary/30 rounded-[40px] p-10 animate-in zoom-in-95 shadow-[0_0_100px_rgba(0,0,0,1)]">
        <div className="absolute top-0 left-0 w-full h-2 gold-gradient"></div>
        
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center text-black shadow-lg">
              {type === 'video' ? <Video size={24} /> : (type === 'certificate' ? <Award size={24} /> : <FilePlus size={24} />)}
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">
                {isEditing ? 'Aggiorna' : 'Carica'} <span className="gold-text-gradient">{type}</span>
              </h2>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-1">AIXUM Knowledge Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleUpload} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-primary px-1">Titolo Ufficiale</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-6 py-4 text-sm rounded-[20px] bg-white/[0.03] border-2 border-white/5 text-white focus:border-gold-primary/50 focus:bg-gold-primary/5 outline-none transition-all shadow-inner"
              placeholder="Inserisci titolo risorsa..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-primary px-1">Ambito / Categoria</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-6 py-4 text-sm rounded-[20px] bg-dark border-2 border-white/5 text-white focus:border-gold-primary outline-none transition-all cursor-pointer"
                required
              >
                <option value="">Seleziona...</option>
                <option value="AI Strategy">AI Strategy</option>
                <option value="Automation">Automation</option>
                <option value="Marketing">Marketing</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Legal">Legal & Compliance</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-primary px-1">{isEditing ? 'Nuovo File (opzionale)' : 'Carica File'}</label>
              <label className="flex items-center justify-center gap-3 w-full px-6 py-4 text-xs rounded-[20px] bg-white/5 border-2 border-dashed border-white/10 text-gray-500 hover:border-gold-primary hover:text-white cursor-pointer transition-all truncate group shadow-sm">
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                {file ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> : <Upload size={18} className="group-hover:translate-y-[-2px] transition-transform" />}
                <span className="truncate font-bold">{file ? file.name : (isEditing ? 'Modifica File' : 'Seleziona...')}</span>
              </label>
            </div>
          </div>

          {type === 'certificate' && (
             <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-primary px-1">Assegna all'Azienda/Cliente</label>
              <select 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-6 py-4 text-sm rounded-[20px] bg-dark border-2 border-white/5 text-white focus:border-gold-primary outline-none transition-all cursor-pointer"
                required
              >
                <option value="">Scegli Account Destinatario...</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.company_name})</option>
                ))}
              </select>
            </div>
          )}

          {type === 'video' && (
            <div className="space-y-8 animate-in slide-in-from-top-2">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-primary px-1">Abstract Formativo</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-6 py-4 text-sm rounded-[20px] bg-white/[0.03] border-2 border-white/5 text-white focus:border-gold-primary/50 focus:bg-gold-primary/5 outline-none transition-all h-28 resize-none shadow-inner"
                  placeholder="Cosa imparerà il cliente in questo modulo?"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-primary px-1">Cover Video (Anteprima)</label>
                <label className="flex items-center justify-center gap-4 w-full px-6 py-4 text-xs rounded-[20px] bg-white/5 border-2 border-dashed border-white/10 text-gray-500 hover:border-gold-primary hover:text-white cursor-pointer transition-all group">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setThumbnail(e.target.files?.[0] || null)} />
                  {thumbnail ? <CheckCircle2 size={18} className="text-emerald-500" /> : <ImageIcon size={18} className="group-hover:scale-110 transition-transform" />}
                  <span className="truncate font-bold">{thumbnail ? thumbnail.name : 'Scegli miniatura...'}</span>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="text-[11px] text-red-400 bg-red-500/10 p-5 rounded-[20px] border border-red-500/20 font-bold animate-shake">
              {error}
            </div>
          )}

          <div className="pt-6 flex gap-6">
            <button type="button" onClick={onClose} disabled={uploading} className="flex-1 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-gray-600 hover:text-white transition-all">Annulla</button>
            <button 
              type="submit" 
              disabled={uploading} 
              className="flex-[2] py-5 gold-gradient text-black rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_15px_40px_rgba(212,175,55,0.3)] transition-all hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {uploading ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? <Edit3 size={18} /> : <Upload size={18} />)}
              {uploading ? 'Processing...' : (isEditing ? 'Salva Modifiche' : 'Crea Contenuto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
