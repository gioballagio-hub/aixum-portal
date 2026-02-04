
import React, { useEffect, useState } from 'react';
import { Award, Download, Search, Loader2, HardDrive, CheckCircle2, Eye, ExternalLink } from 'lucide-react';
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
    <div className="space-y-10 animate-in fade-in duration-300">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">I Tuoi Certificati</h1>
          <p className="text-dark-muted text-sm">Visualizza e scarica gli attestati formativi ufficiali rilasciati da AIXUM.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={16} />
          <input 
            type="text"
            placeholder="Cerca certificato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 text-sm rounded-md bg-dark-lighter border border-dark-border text-white focus:border-gold-primary outline-none transition-all w-64"
          />
        </div>
      </header>

      {loading ? (
        <div className="grid gap-4">
          {[1,2,3].map(i => <div key={i} className="h-20 w-full bg-dark-lighter animate-pulse rounded-lg border border-dark-border"></div>)}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredCerts.map((cert) => (
            <div 
              key={cert.id} 
              className="business-card group flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-lg gap-6"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded bg-gold-primary/10 flex items-center justify-center text-gold-primary group-hover:scale-110 transition-transform">
                  <Award size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-gold-primary transition-colors">{cert.title}</h3>
                  <p className="text-xs text-dark-muted font-medium uppercase mt-1 tracking-wider">
                    {cert.category} • Rilasciato il {new Date(cert.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedCert(cert)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-dark-lighter border border-dark-border rounded text-xs font-bold text-white hover:border-gold-primary transition-all flex items-center justify-center gap-2"
                >
                  <Eye size={14} /> Anteprima
                </button>
                <button 
                  onClick={() => downloadFile(cert.file_url, cert.file_name)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gold-primary text-black rounded text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={14} /> Scarica PDF
                </button>
              </div>
            </div>
          ))}

          {filteredCerts.length === 0 && (
            <div className="py-24 text-center border border-dashed border-dark-border rounded-lg bg-dark-lighter/30">
              <Award size={40} className="mx-auto text-dark-border mb-4" />
              <p className="text-sm text-dark-muted font-medium">Nessun certificato disponibile al momento.</p>
            </div>
          )}
        </div>
      )}

      <DocumentViewerModal 
        document={selectedCert}
        onClose={() => setSelectedCert(null)}
        onDownload={(c) => downloadFile(c.file_url, c.file_name)}
      />
    </div>
  );
};

export default ClientCertificates;
