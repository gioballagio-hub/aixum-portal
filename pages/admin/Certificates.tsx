
import React, { useEffect, useState } from 'react';
import { Award, Plus, Search, Trash2, Eye, EyeOff, Loader2, Edit3, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Certificate } from '../../types';
import UploadModal from '../../components/UploadModal';

const AdminCertificates: React.FC = () => {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Certificate | null>(null);

  useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    setLoading(true);
    // Join con profiles per vedere a chi appartiene il certificato
    const { data } = await supabase
      .from('certificates')
      .select('*, profiles(full_name, email)')
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
    c.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Gestione <span className="gold-text-gradient">Certificati</span></h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-1 font-bold">Assegnazione traguardi Enterprise</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
            <input 
              type="text"
              placeholder="Cerca cliente o titolo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:border-gold-primary outline-none transition-all w-48 md:w-64"
            />
          </div>
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="px-6 py-2.5 gold-gradient text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:scale-[1.02] transition-all shadow-lg"
          >
            <Plus size={14} /> Nuovo Certificato
          </button>
        </div>
      </header>

      <div className="glass-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600">Certificato</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600">Assegnato A</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-600 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-20 text-center"><Loader2 size={24} className="animate-spin text-gold-primary mx-auto" /></td></tr>
              ) : filteredCerts.map((cert) => (
                <tr key={cert.id} className="hover:bg-gold-primary/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center text-gold-primary shrink-0 shadow-inner">
                        <Award size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-200 truncate group-hover:text-gold-primary transition-colors">{cert.title}</p>
                        <p className="text-[10px] text-gray-600 uppercase mt-1 tracking-widest font-bold">{cert.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <User size={14} className="text-gold-primary" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-300 truncate">{cert.profiles?.full_name || 'N/A'}</p>
                        <p className="text-[9px] text-gray-600 truncate">{cert.profiles?.email || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(cert)}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-gold-primary transition-all"
                        title="Modifica"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteCert(cert.id)}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-red-400 transition-all"
                        title="Rimuovi"
                      >
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
    </div>
  );
};

export default AdminCertificates;
