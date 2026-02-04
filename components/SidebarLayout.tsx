
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Corsi Video', path: '/dashboard/videos', icon: Video },
    { name: 'Documentazione', path: '/dashboard/documents', icon: FileText },
    { name: 'Certificazioni', path: '/dashboard/certificates', icon: Award },
  ];

  const adminItems = [
    { name: 'Admin Hub', path: '/admin', icon: ShieldCheck },
    { name: 'Gestione Video', path: '/admin/videos', icon: Video },
    { name: 'Gestione Docs', path: '/admin/documents', icon: FileText },
    { name: 'Gestione Cert', path: '/admin/certificates', icon: Award },
    { name: 'Anagrafica Clienti', path: '/admin/clients', icon: Users },
  ];

  return (
    <div className="h-screen bg-black flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Top Nav */}
      <div className="md:hidden flex items-center justify-between p-4 bg-dark-lighter border-b border-dark-border shrink-0">
        <Logo size="sm" withGlow={false} />
        <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar overlay mobile */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#111111] border-r border-dark-border transition-transform duration-200 ease-in-out md:relative md:translate-x-0 shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6">
            <Logo size="md" withGlow={false} />
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            <div className="mb-4">
              <p className="px-3 text-[10px] font-bold text-dark-muted uppercase tracking-widest mb-2">Workspace</p>
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-[#1c1c1c] text-gold-primary border border-[#2e2e2e]' 
                      : 'text-[#999] hover:bg-[#1c1c1c] hover:text-white'}
                  `}
                >
                  <item.icon size={18} className={location.pathname === item.path ? 'text-gold-primary' : ''} />
                  {item.name}
                </NavLink>
              ))}
            </div>

            {role === 'admin' && (
              <div className="pt-4">
                <p className="px-3 text-[10px] font-bold text-dark-muted uppercase tracking-widest mb-2">Amministrazione</p>
                {adminItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-[#1c1c1c] text-gold-primary border border-[#2e2e2e]' 
                        : 'text-[#999] hover:bg-[#1c1c1c] hover:text-white'}
                    `}
                  >
                    <item.icon size={18} className={location.pathname === item.path ? 'text-gold-primary' : ''} />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-dark-border bg-[#0a0a0a] shrink-0">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded bg-dark-border flex items-center justify-center text-xs font-bold text-gold-primary border border-white/5">
                {profile?.full_name?.[0] || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{profile?.full_name}</p>
                <p className="text-[10px] text-dark-muted truncate uppercase tracking-tighter">{profile?.role}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#999] hover:text-red-400 transition-colors uppercase font-bold tracking-widest"
            >
              <LogOut size={14} />
              Esci
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-black overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden p-6 md:p-8 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
