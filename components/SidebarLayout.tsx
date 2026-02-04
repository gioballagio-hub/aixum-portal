
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
  Award,
  Settings,
  HelpCircle,
  Square
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
  const location = useLocation();

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
    <div className="h-screen bg-dark flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Mobile Nav */}
      <div className="md:hidden flex items-center justify-between p-4 bg-dark-card border-b border-dark-border z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold-primary/20 rounded-md flex items-center justify-center border border-gold-primary/30">
            <Square size={16} className="text-gold-primary fill-gold-primary/20" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-widest text-white uppercase">Portal</h1>
          </div>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-dark border-r border-dark-border transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="w-8 h-8 bg-gold-primary/20 rounded-md flex items-center justify-center border border-gold-primary/30">
              <Square size={16} className="text-gold-primary fill-gold-primary/20" />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-[0.2em] text-white uppercase leading-none">Portal</h1>
              <p className="text-[8px] font-bold text-dark-muted uppercase tracking-[0.1em] mt-1.5">Enterprise Management</p>
            </div>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2">
            {/* General Section */}
            <div>
              <p className="px-3 text-[10px] font-black text-dark-muted uppercase tracking-[0.3em] mb-4 opacity-50">General</p>
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all
                      ${isActive 
                        ? 'bg-gold-primary/10 text-gold-primary border border-gold-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.05)]' 
                        : 'text-dark-muted hover:text-white hover:bg-white/[0.03]'}
                    `}
                  >
                    <item.icon size={16} />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* System Section for Admins */}
            {role === 'admin' && (
              <div>
                <p className="px-3 text-[10px] font-black text-dark-muted uppercase tracking-[0.3em] mb-4 opacity-50">System</p>
                <nav className="space-y-1">
                  {adminItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all
                        ${isActive 
                          ? 'bg-gold-primary/10 text-gold-primary border border-gold-primary/20 shadow-[0_0_15_px_rgba(212,175,55,0.05)]' 
                          : 'text-dark-muted hover:text-white hover:bg-white/[0.03]'}
                      `}
                    >
                      <item.icon size={16} />
                      {item.name}
                    </NavLink>
                  ))}
                </nav>
              </div>
            )}
          </div>

          {/* Profile & Logout */}
          <div className="mt-auto pt-6 space-y-4">
            <div className="p-4 rounded-2xl bg-dark-card border border-dark-border flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold-primary flex items-center justify-center text-sm font-black text-black shadow-lg">
                {profile?.full_name?.[0] || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{profile?.full_name}</p>
                <p className="text-[9px] text-dark-muted font-black uppercase tracking-widest mt-0.5 truncate">{profile?.role}istrator</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 text-[10px] text-dark-muted hover:text-white transition-colors uppercase font-black tracking-[0.3em]"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 bg-dark overflow-y-auto p-6 md:p-12 lg:p-16">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
