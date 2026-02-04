
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Video, 
  FileText, 
  Users, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck,
  Award
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import Logo from './Logo';

interface SidebarLayoutProps {
  role: 'admin' | 'client';
  profile: Profile | null;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ role, profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Video Corsi', path: '/dashboard/videos', icon: Video },
    { name: 'Documenti', path: '/dashboard/documents', icon: FileText },
    { name: 'Certificati', path: '/dashboard/certificates', icon: Award },
  ];

  const adminItems = [
    { name: 'Admin Hub', path: '/admin', icon: ShieldCheck },
    { name: 'Gestione Video', path: '/admin/videos', icon: Video },
    { name: 'Gestione Docs', path: '/admin/documents', icon: FileText },
    { name: 'Gestione Cert', path: '/admin/certificates', icon: Award },
    { name: 'Clienti', path: '/admin/clients', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-dark flex flex-col md:flex-row">
      <div className="md:hidden flex items-center justify-between p-4 bg-dark-lighter border-b border-gold-primary/20 sticky top-0 z-[100]">
        <Logo size="sm" />
        <button onClick={() => setIsOpen(!isOpen)} className="text-gold-primary p-2 rounded-xl bg-gold-primary/5 border border-gold-primary/20">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/90 backdrop-blur-md z-40 animate-in fade-in" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-dark-lighter border-r border-gold-primary/20 transition-transform duration-300 md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col px-6 py-10">
          <div className="mb-12 flex justify-center">
            <Logo size="md" withGlow={true} />
          </div>

          <nav className="flex-1 space-y-2">
            <p className="text-[10px] font-black text-gray-700 uppercase px-4 py-2 tracking-[0.4em]">Portale Studio</p>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-4 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all group relative
                  ${isActive ? 'bg-gold-primary/10 text-gold-primary border border-gold-primary/30' : 'text-gray-500 hover:bg-white/[0.03] hover:text-gray-300'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={18} className={`${isActive ? 'drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]' : 'group-hover:text-gold-primary/70 transition-colors'}`} />
                    {item.name}
                    {isActive && <div className="absolute right-3 w-1.5 h-1.5 bg-gold-primary rounded-full shadow-[0_0_8px_#D4AF37]" />}
                  </>
                )}
              </NavLink>
            ))}

            {role === 'admin' && (
              <>
                <p className="text-[10px] font-black text-gray-700 uppercase px-4 py-6 tracking-[0.4em]">Gestione</p>
                {adminItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-4 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all group relative
                      ${isActive ? 'bg-gold-primary/10 text-gold-primary border border-gold-primary/30' : 'text-gray-500 hover:bg-white/[0.03] hover:text-gray-300'}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={18} className={`${isActive ? 'drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]' : 'group-hover:text-gold-primary/70 transition-colors'}`} />
                        {item.name}
                        {isActive && <div className="absolute right-3 w-1.5 h-1.5 bg-gold-primary rounded-full shadow-[0_0_8px_#D4AF37]" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          <div className="mt-auto pt-8 border-t border-gold-primary/20">
            <div className="flex items-center gap-4 mb-8 px-4 py-4 rounded-2xl bg-white/[0.03] border border-gold-primary/10">
              <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-black font-black text-sm shadow-lg">
                {profile?.full_name?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate leading-tight mb-1">{profile?.full_name || 'Utente'}</p>
                <p className="text-[10px] text-gold-primary/60 truncate uppercase font-black tracking-widest">{profile?.role === 'admin' ? 'Manager' : 'Enterprise'}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] text-gray-500 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all font-black uppercase tracking-[0.2em]"
            >
              <LogOut size={16} />
              Scollegati
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 h-screen relative overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.03),transparent_40%)]">
        <div className="p-6 md:p-12 lg:p-16 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
