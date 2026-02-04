
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
  ShieldCheck
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
  ];

  const adminItems = [
    { name: 'Admin Hub', path: '/admin', icon: ShieldCheck },
    { name: 'Gestione Video', path: '/admin/videos', icon: Video },
    { name: 'Gestione Docs', path: '/admin/documents', icon: FileText },
    { name: 'Clienti', path: '/admin/clients', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-dark flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-3 bg-dark-lighter border-b border-white/5 sticky top-0 z-[100]">
        <Logo size="sm" />
        <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2 rounded-lg bg-white/5">
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-in fade-in" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-dark-lighter border-r border-white/5 transition-transform duration-300 md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col px-4 py-8">
          <div className="mb-10 px-2 flex items-center gap-3">
            <Logo size="sm" className="shrink-0" withGlow={true} />
            <div className="overflow-hidden">
              <p className="text-[11px] font-black text-white tracking-[0.2em] leading-none">PORTAL</p>
              <p className="text-[8px] text-gray-600 uppercase tracking-tighter mt-1">Enterprise Management</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <p className="text-[9px] font-black text-gray-700 uppercase px-3 py-2 tracking-[0.3em]">General</p>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group relative
                  ${isActive ? 'bg-white/5 text-gold-primary border border-gold-primary/20' : 'text-gray-500 hover:bg-white/[0.02] hover:text-gray-300'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={16} className={`${isActive ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]' : ''}`} />
                    {item.name}
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 gold-gradient rounded-full" />}
                  </>
                )}
              </NavLink>
            ))}

            {role === 'admin' && (
              <>
                <p className="text-[9px] font-black text-gray-700 uppercase px-3 py-6 tracking-[0.3em]">System</p>
                {adminItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group relative
                      ${isActive ? 'bg-white/5 text-gold-primary border border-gold-primary/20' : 'text-gray-500 hover:bg-white/[0.02] hover:text-gray-300'}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={16} className={`${isActive ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]' : ''}`} />
                        {item.name}
                        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 gold-gradient rounded-full" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 mb-6 px-3 py-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center text-black font-black text-sm uppercase">
                {profile?.full_name?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate leading-none mb-1">{profile?.full_name || 'Utente'}</p>
                <p className="text-[9px] text-gray-500 truncate uppercase font-bold tracking-tighter">{profile?.role === 'admin' ? 'Administrator' : profile?.company_name}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs text-gray-600 hover:bg-red-500/10 hover:text-red-400 transition-all font-black uppercase tracking-widest"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen relative overflow-y-auto">
        <div className="p-4 md:p-10 lg:p-12 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
