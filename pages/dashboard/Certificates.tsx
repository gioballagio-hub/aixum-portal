
import React, { useEffect, useState } from 'react';
import { Award, Download, Search, Loader2, HardDrive, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Certificate, Profile } from '../../types';
import { downloadFile } from '../../lib/utils';

interface CertificatesProps { profile: Profile | null; }

const ClientCertificates: React.FC<CertificatesProps> = ({ profile }) => {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (profile) fetchCerts();
  }, [profile]);

  const fetchCerts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', profile?.id)
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    
    if (data) setCerts(data);
    setLoading(false);
  };

  const filteredCerts = certs.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold-primary/30 pb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">I Tuoi <span className="gold-text-gradient">Certificati</span></h1>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Traguardi formativi raggiunti con AIXUM</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-primary/60" size={14} />
            <input 
              type="text"
              placeholder="Cerca certificato..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white/5 border border-gold-primary/40 text-white focus:border-gold-primary outline-none transition-all w-48 md:w-64"
            />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 w-full bg-white/[0.02] animate-pulse rounded-2xl border border-gold-primary/20"></div>)}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCerts.map((cert) => (
            <div 
              key={cert.id} 
              className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.03] border-2 border-gold-primary/40 hover:border-gold-primary hover:bg-gold-primary/[0.05] transition-all group shadow-xl"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center text-black shrink-0 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  <Award size={28} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white group-hover:text-gold-primary transition-colors">{cert.title}</p>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Rilasciato il {new Date(cert.created_at).toLocaleDateString()} &bull; {cert.category}</p>
                </div>
              </div>

              <button 
                onClick={() => downloadFile(cert.file_url, cert.file_name)}
                className="flex items-center gap-3 px-8 py-3 gold-gradient text-black rounded-xl text-xs font-black uppercase shadow-lg hover:scale-105 transition-all"
              >
                <Download size={16} /> Scarica PDF
              </button>
            </div>
          ))}

          {filteredCerts.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed border-gold-primary/20 rounded-[40px] bg-white/[0.01]">
              <Award size={40} className="mx-auto text-gray-800 mb-4 opacity-20" />
              <p className="text-xs text-gray-600 font-black uppercase tracking-[0.3em]">Nessun certificato ancora disponibile</p>
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 right-8 z-[200] flex items-center gap-3 px-6 py-4 bg-emerald-500 text-black font-black text-xs rounded-2xl shadow-2xl animate-in slide-in-from-right-10">
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}
    </div>
  );
};

export default ClientCertificates;
