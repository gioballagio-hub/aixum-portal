
import React, { useState, useEffect } from 'react';
import { X, Upload, CheckCircle2, Loader2, Image as ImageIcon, Edit3, Award, FilePlus, Video, AlertCircle } from 'lucide-react';
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
  const [progress, setProgress] = useState(0);
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
      setProgress(0);
      if (type === 'certificate') {
        supabase.from('profiles').select('id, full_name, email, company_name').then(({ data }) => setProfiles(data || []));
      }
    }
    setError(null);
  }, [isOpen, editingItem, type]);

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing && !file) {
      setError('Seleziona un file prima di procedere.');
      return;
    }

    setUploading(true);
    setProgress(5);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessione non valida.');

      const table = type === 'video' ? 'videos' : (type === 'document' ? 'documents' : 'certificates');
      const bucketName = type === 'video' ? 'videos' : 'documents';
      
      let fileUrl = editingItem?.file_url || editingItem?.video_url;
      let thumbUrl = editingItem?.thumbnail_url;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${type}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;
        
        const progressInterval = setInterval(() => {
          setProgress(prev => (prev < 90 ? prev + Math.random() * 5 : prev));
        }, 1000);

        const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file);
        clearInterval(progressInterval);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        fileUrl = publicUrl;
        setProgress(95);
      }

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
        if (!isEditing) payload.duration_seconds = 0; 
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

      setProgress(100);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Errore durante l\'upload del file pesante.');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl business-card rounded-[32px] p-10 animate-in zoom-in-95 shadow-2xl border-white/5 bg-[#0d0d0d]">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gold-primary/10 flex items-center justify-center text-gold-primary shadow-inner">
              {type === 'video' ? <Video size={28} /> : (type === 'certificate' ? <Award size={28} /> : <FilePlus size={28} />)}
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">
                {isEditing ? 'Gestione' : 'Caricamento'} <span className="gold-text-gradient">{type}</span>
              </h2>
              <p className="text-[10px] font-black text-dark-muted uppercase tracking-[0.4em] mt-1">Infrastruttura Cloud AIXUM</p>
            </div>
          </div>
          <button onClick={onClose} disabled={uploading} className="p-3 rounded-xl hover:bg-white/5 text-dark-muted hover:text-white transition-all">
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleUpload} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gold-primary">Titolo Ufficiale</label>
            <input 
              type="text"
              value={title}
              disabled={uploading}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 text-sm rounded-2xl bg-dark-lighter border-2 border-dark-border text-white focus:border-gold-primary outline-none transition-all placeholder:text-dark-muted shadow-inner"
              placeholder="Esempio: Strategia AI 2026..."
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gold-primary">Categoria</label>
              <select 
                value={category}
                disabled={uploading}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-5 py-4 text-sm rounded-2xl bg-dark-lighter border-2 border-dark-border text-white focus:border-gold-primary outline-none transition-all cursor-pointer appearance-none shadow-inner"
                required
              >
                <option value="">Seleziona...</option>
                <option value="AI Strategy">AI Strategy</option>
                <option value="Automation">Automation</option>
                <option value="Marketing">Marketing</option>
                <option value="Legal">Legal</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gold-primary">Seleziona File</label>
              <label className="flex items-center justify-center gap-3 w-full px-5 py-4 text-[11px] font-black rounded-2xl bg-dark-lighter border-2 border-dashed border-dark-border text-dark-muted hover:border-gold-primary hover:text-white cursor-pointer transition-all truncate shadow-inner">
                <input type="file" className="hidden" disabled={uploading} onChange={(e) => setFile(e.target.files?.[0] || null)} />
                {file ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <Upload size={16} />}
                <span className="truncate">{file ? file.name : (isEditing ? 'Sostituisci File' : 'Sfoglia Risorse')}</span>
              </label>
            </div>
          </div>

          {type === 'certificate' && (
             <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gold-primary">Proprietario Certificato</label>
              <select 
                value={userId}
                disabled={uploading}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-5 py-4 text-sm rounded-2xl bg-dark-lighter border-2 border-dark-border text-white focus:border-gold-primary outline-none transition-all cursor-pointer shadow-inner"
                required
              >
                <option value="">Seleziona cliente...</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.company_name})</option>
                ))}
              </select>
            </div>
          )}

          {uploading && (
            <div className="space-y-4 p-6 bg-gold-primary/5 rounded-2xl border-2 border-gold-primary/20">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-gold-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gold-primary">Sincronizzazione in corso...</span>
                </div>
                <span className="text-lg font-display font-bold text-white leading-none">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-dark-lighter rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gold-primary transition-all duration-300 shadow-[0_0_15px_#D4AF37]" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-[9px] text-dark-muted italic font-medium">Non chiudere il portale durante il trasferimento di contenuti pesanti.</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 text-xs text-red-400 bg-red-500/5 p-5 rounded-2xl border-2 border-red-500/10 font-bold">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} disabled={uploading} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-dark-muted hover:text-white transition-all">Annulla</button>
            <button 
              type="submit" 
              disabled={uploading} 
              className="flex-[2] py-4 bg-gold-primary text-black rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? 'SINCRONIZZAZIONE...' : (isEditing ? 'SALVA MODIFICHE' : 'ESEGUI UPLOAD')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
