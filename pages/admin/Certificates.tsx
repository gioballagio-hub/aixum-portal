
import React, { useEffect, useState } from 'react';
import { Award, Plus, Search, Trash2, Eye, Loader2, Edit3, User, Download, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Certificate } from '../../types';
import UploadModal from '../../components/UploadModal';
import DocumentViewerModal from '../../components/DocumentViewerModal';
import { downloadFile } from '../../lib/utils';

const AdminCertificates: React.FC = () => {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Certificate | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('certificates')
      .select('*, profiles(full_name, email, company_name)')
      .order('created_at', { ascending: false });
    
    if (data) setCerts(data);
    setLoading(false);
  };

  const deleteCert = async (id: string) => {
    if (!confirm('Eliminare definitivamente questo certificato?')) return;
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (!error) fetchCerts();
  };

  const handleEdit = (cert: Certificate) => {
    setEditingItem(cert);
    setIsModalOpen(true);
  };

  const filteredCerts = certs.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.profiles?.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestione Certificati</h1>
          <p className="text-dark-muted text-sm mt-1">Emissione e monitoraggio degli attestati rilasciati.</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={fetchCerts} className="sb-button-secondary py-2.5">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="sb-button-primary py-2.5"
          >
            <Plus size={16} /> Nuovo Certificato
          </button>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={14} />
        <input 
          type="text"
          placeholder="Cerca per titolo, cliente o azienda..."
          value={search}
          /* Fix: use correct state setter function 'setSearch' */
          onChange={(e) => setSearch(e.target.value)}
          className="sb-input pl-10"
        />
      </div>

      <div className="sb-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-dark-lighter border-b border-dark-border">
                <th className="px-6 py-4 text-[11px] font-bold text-dark-muted uppercase tracking-widest">Certificato / Categoria</th>
                <th className="px-6 py-4 text-[11px] font-bold text-dark-muted uppercase tracking-widest">Assegnato A</th>
                <th className="px-6 py-4 text-[11px] font-bold text-dark-muted uppercase tracking-widest">Data Rilascio</th>
                <th className="px-6 py-4 text-[11px] font-bold text-dark-muted uppercase tracking-widest text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-sm">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center"><Loader2 size={24} className="animate-spin text-gold-primary mx-auto" /></td></tr>
              ) : filteredCerts.map((cert) => (
                <tr key={cert.id} className="hover:bg-dark-lighter transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded bg-black border border-dark-border flex items-center justify-center text-gold-primary">
                        <Award size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{cert.title}</p>
                        <p className="text-[10px] text-dark-muted font-bold uppercase tracking-wider">{cert.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-dark-border flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                        {cert.profiles?.full_name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">{cert.profiles?.full_name}</p>
                        <p className="text-[10px] text-dark-muted truncate">{cert.profiles?.company_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-dark-muted">
                    {new Date(cert.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3 text-dark-muted">
                      <button onClick={() => downloadFile(cert.file_url, cert.file_name)} className="hover:text-white transition-colors">
                        <Download size={16} />
                      </button>
                      <button onClick={() => setSelectedCert(cert)} className="hover:text-white transition-colors">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEdit(cert)} className="hover:text-gold-primary transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => deleteCert(cert.id)} className="hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UploadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCerts}
        type="certificate"
        editingItem={editingItem}
      />

      <DocumentViewerModal 
        document={selectedCert}
        onClose={() => setSelectedCert(null)}
        onDownload={(c) => downloadFile(c.file_url, c.file_name)}
      />
    </div>
  );
};

export default AdminCertificates;