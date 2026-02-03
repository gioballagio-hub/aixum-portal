
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
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold-primary border-t-transparent rounded-full animate-spin"></div>
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
