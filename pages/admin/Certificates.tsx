
import React, { useEffect, useState } from 'react';
import { Award, Plus, Search, Trash2, Eye, Loader2, Edit3, User, ExternalLink, Filter } from 'lucide-react';
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
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Certificazioni</h1>
          <p className="text-dark-muted text-sm mt-1">Gestione e rilascio attestati formativi per i clienti enterprise.</p>
        </div>
        
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="px-4 py-2 bg-gold-primary text-black rounded-md text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
        >
          <Plus size={16} /> Nuovo Certificato
        </button>
      </header>

      <div className="flex items-center gap-4 bg-[#0a0a0a] border border-dark-border p-3 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={16} />
          <input 
            type="text"
            placeholder="Cerca per titolo, cliente o azienda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border-none text-sm text-white focus:ring-0 outline-none"
          />
        </div>
        <div className="h-6 w-[1px] bg-dark-border"></div>
        <span className="text-[10px] font-bold text-dark-muted uppercase tracking-widest px-2">{filteredCerts.length} Entità</span>
      </div>

      <div className="business-card rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#1c1c1c] border-b border-dark-border">
              <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-widest">Titolo Certificato</th>
              <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-widest">Assegnato A</th>
              <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-widest">Data Rilascio</th>
              <th className="px-6 py-4 text-xs font-bold text-dark-muted uppercase tracking-widest text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center"><Loader2 size={24} className="animate-spin text-gold-primary mx-auto" /></td></tr>
            ) : filteredCerts.map((cert) => (
              <tr key={cert.id} className="hover:bg-dark-lighter transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gold-primary/10 flex items-center justify-center text-gold-primary">
                      <Award size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{cert.title}</p>
                      <p className="text-[10px] text-dark-muted font-bold uppercase tracking-wider">{cert.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-dark-muted" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{cert.profiles?.full_name}</p>
                      <p className="text-[10px] text-dark-muted truncate">{cert.profiles?.company_name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-dark-muted">{new Date(cert.created_at).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={() => setSelectedCert(cert)}
                      className="text-dark-muted hover:text-white transition-colors"
                      title="Anteprima"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleEdit(cert)}
                      className="text-dark-muted hover:text-gold-primary transition-colors"
                      title="Modifica"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => deleteCert(cert.id)}
                      className="text-dark-muted hover:text-red-400 transition-colors"
                      title="Elimina"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
