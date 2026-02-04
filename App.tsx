
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import ClientDashboard from './pages/dashboard/Overview';
import VideoList from './pages/dashboard/Videos';
import VideoPlayerPage from './pages/dashboard/VideoPlayer';
import DocumentList from './pages/dashboard/Documents';
import AdminDashboard from './pages/admin/Overview';
import AdminVideos from './pages/admin/Videos';
import AdminDocuments from './pages/admin/Documents';
import AdminClients from './pages/admin/Clients';
import SidebarLayout from './components/SidebarLayout';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-6">
        <Logo size="lg" className="animate-pulse" />
        <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 gold-gradient animate-[loading_1.5s_infinite]"></div>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
        
        {/* Protected Client Routes */}
        <Route element={session ? <SidebarLayout role={profile?.role} profile={profile} /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<ClientDashboard profile={profile} />} />
          <Route path="/dashboard/videos" element={<VideoList />} />
          <Route path="/dashboard/videos/:id" element={<VideoPlayerPage />} />
          <Route path="/dashboard/documents" element={<DocumentList />} />
          
          {/* Admin Specific Routes */}
          {profile?.role === 'admin' && (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/videos" element={<AdminVideos />} />
              <Route path="/admin/documents" element={<AdminDocuments />} />
              <Route path="/admin/clients" element={<AdminClients />} />
            </>
          )}
        </Route>

        <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default App;
