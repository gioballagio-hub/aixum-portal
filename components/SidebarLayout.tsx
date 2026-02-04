
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
  ChevronRight,
  Monitor
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

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <NavLink
      to={to}
      onClick={() => setIsOpen(false)}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all
        ${isActive 
          ? 'bg-dark-lighter text-gold-primary border-l-2 border-gold-primary rounded-l-none' 
          : 'text-dark-muted hover:text-white hover:bg-dark-lighter'}
      `}
    >
      <Icon size={16} />
      {label}
    </NavLink>
  );

  return (
    <div className="h-screen bg-black flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-dark-card border-b border-dark-border z-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gold-primary rounded flex items-center justify-center">
            <Monitor size={14} className="text-black" />
          </div>
          <span className="text-sm font-bold tracking-tight">AIXUM Portal</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-dark-border transition-transform duration-200 md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-3 mb-10 px-2 pt-2">
            <div className="w-7 h-7 bg-gold-primary rounded-md flex items-center justify-center">
              <Monitor size={16} className="text-black" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">AIXUM Portal</h1>
              <p className="text-[10px] text-dark-muted font-medium uppercase tracking-widest mt-0.5">Enterprise</p>
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto">
            <nav className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-dark-muted uppercase tracking-widest mb-3">General</p>
              <NavItem to="/dashboard" icon={LayoutDashboard} label="Overview" />
              <NavItem to="/dashboard/videos" icon={Video} label="Libreria Video" />
              <NavItem to="/dashboard/documents" icon={FileText} label="Documenti" />
            </nav>

            {role === 'admin' && (
              <nav className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-dark-muted uppercase tracking-widest mb-3">Management</p>
                <NavItem to="/admin" icon={ShieldCheck} label="Admin Hub" />
                <NavItem to="/admin/videos" icon={Video} label="Gestione Video" />
                <NavItem to="/admin/documents" icon={FileText} label="Gestione Docs" />
                <NavItem to="/admin/clients" icon={Users} label="Clienti" />
              </nav>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-dark-border">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-8 h-8 rounded bg-dark-border flex items-center justify-center text-xs font-bold text-white">
                {profile?.full_name?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{profile?.full_name}</p>
                <p className="text-[10px] text-dark-muted truncate uppercase tracking-tighter">{profile?.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-dark-muted hover:text-white hover:bg-dark-lighter rounded-md transition-all"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-black overflow-y-auto">
        <div className="p-6 md:p-10 lg:p-12 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
