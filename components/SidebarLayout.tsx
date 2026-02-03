
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
  Settings,
  ShieldCheck
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
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Video Corsi', path: '/dashboard/videos', icon: Video },
    { name: 'Documenti', path: '/dashboard/documents', icon: FileText },
  ];

  const adminItems = [
    { name: 'Admin Overview', path: '/admin', icon: ShieldCheck },
    { name: 'Gestione Video', path: '/admin/videos', icon: Video },
    { name: 'Gestione Documenti', path: '/admin/documents', icon: FileText },
    { name: 'Gestione Clienti', path: '/admin/clients', icon: Users },
  ];

  const currentItems = role === 'admin' ? [...menuItems, ...adminItems] : menuItems;

  return (
    <div className="min-h-screen bg-dark flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-dark-lighter border-b border-white/5">
        <img src="logo.png" alt="AIXUM" className="h-8 w-auto object-contain" />
        <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-dark-lighter border-r border-white/5 transition-transform duration-300 md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="mb-12 px-2">
            <img src="logo.png" alt="AIXUM Logo" className="h-12 w-auto object-contain mb-2" />
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Portal System</p>
          </div>

          <nav className="flex-1 space-y-2">
            {currentItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all group
                  ${isActive ? 'gold-gradient text-black gold-glow' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                `}
              >
                {/* Fixed: NavLink children as a function to access isActive and pass string to icon className */}
                {({ isActive }) => (
                  <>
                    <item.icon 
                      size={20} 
                      className={isActive ? 'text-black' : 'group-hover:text-gold-primary'} 
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center gap-4 mb-6 px-4">
              <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-black font-bold">
                {profile?.full_name?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{profile?.full_name || 'Utente'}</p>
                <p className="text-xs text-gray-500 truncate">{profile?.role === 'admin' ? 'Amministratore' : profile?.company_name}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all font-medium"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen relative overflow-y-auto">
        <div className="p-6 md:p-12 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
