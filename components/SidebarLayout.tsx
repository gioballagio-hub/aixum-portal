
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
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

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
      <div className="md:hidden flex items-center justify-between p-3 bg-dark-lighter border-b border-white/5">
        <img src="logo.png" alt="AIXUM" className="h-6 w-auto" />
        <button onClick={() => setIsOpen(!isOpen)} className="text-white p-1">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-dark-lighter border-r border-white/5 transition-transform duration-200 md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col px-4 py-6">
          <div className="mb-8 px-2 flex items-center gap-3">
            <div className="w-8 h-8 gold-gradient rounded flex items-center justify-center font-bold text-black text-xs">AX</div>
            <div>
              <p className="text-xs font-bold text-white tracking-wider">AIXUM PORTAL</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-tighter">Enterprise v1.0</p>
            </div>
          </div>

          <nav className="flex-1 space-y-0.5">
            <p className="text-[10px] font-bold text-gray-600 uppercase px-3 py-2 tracking-widest">Main</p>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive ? 'bg-white/5 text-gold-primary border border-gold-primary/20 shadow-sm' : 'text-gray-400 hover:bg-white/[0.03] hover:text-gray-200'}
                `}
              >
                <item.icon size={16} />
                {item.name}
              </NavLink>
            ))}

            {role === 'admin' && (
              <>
                <p className="text-[10px] font-bold text-gray-600 uppercase px-3 py-4 tracking-widest">Management</p>
                {adminItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive ? 'bg-white/5 text-gold-primary border border-gold-primary/20 shadow-sm' : 'text-gray-400 hover:bg-white/[0.03] hover:text-gray-200'}
                    `}
                  >
                    <item.icon size={16} />
                    {item.name}
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-gold-primary font-bold text-xs uppercase">
                {profile?.full_name?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{profile?.full_name || 'Utente'}</p>
                <p className="text-[10px] text-gray-500 truncate">{profile?.role === 'admin' ? 'Super Admin' : profile?.company_name}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all font-medium"
            >
              <LogOut size={14} />
              Termina Sessione
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen relative overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
