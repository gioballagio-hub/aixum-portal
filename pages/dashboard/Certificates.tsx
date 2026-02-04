
import React, { useEffect, useState } from 'react';
import { Award, Download, Search, Loader2, Eye, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Certificate, Profile } from '../../types';
import { downloadFile } from '../../lib/utils';
import DocumentViewerModal from '../../components/DocumentViewerModal';

interface CertificatesProps { profile: Profile | null; }

const ClientCertificates: React.FC<CertificatesProps> = ({ profile }) => {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

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
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">I Tuoi Certificati</h1>
          <p className="text-dark-muted text-sm mt-1">Attestati formativi ufficiali rilasciati da AIXUM.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={14} />
          <input 
            type="text"
            placeholder="Cerca certificato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sb-input pl-10"
          />
        </div>
      </header>

      <div className="space-y-3">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-20 w-full bg-dark-lighter animate-pulse rounded-lg border border-dark-border"></div>)
        ) : filteredCerts.map((cert) => (
          <div key={cert.id} className="sb-card p-5 flex items-center justify-between group">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded bg-black border border-dark-border flex items-center justify-center text-gold-primary group-hover:scale-105 transition-transform">
                <Award size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-gold-primary transition-colors">{cert.title}</h3>
                <p className="text-[10px] text-dark-muted font-medium uppercase tracking-widest mt-1">
                  {cert.category} • Rilasciato il {new Date(cert.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedCert(cert)}
                className="sb-button-secondary py-1.5 px-3 text-xs"
              >
                <Eye size={14} /> <span className="hidden sm:inline">Anteprima</span>
              </button>
              <button 
                onClick={() => downloadFile(cert.file_url, cert.file_name)}
                className="sb-button-primary py-1.5 px-3 text-xs"
              >
                <Download size={14} /> <span className="hidden sm:inline">Scarica</span>
              </button>
            </div>
          </div>
        ))}

        {!loading && filteredCerts.length === 0 && (
          <div className="py-20 text-center border border-dashed border-dark-border rounded-lg">
            <p className="text-sm text-dark-muted">Nessun certificato disponibile al momento.</p>
          </div>
        )}
      </div>

      <DocumentViewerModal 
        document={selectedCert}
        onClose={() => setSelectedCert(null)}
        onDownload={(c) => downloadFile(c.file_url, c.file_name)}
      />
    </div>
  );
};

export default ClientCertificates;
