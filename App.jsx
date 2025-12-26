import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Projects from './pages/Projects';
import TimeTracking from './pages/TimeTracking';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center italic text-slate-500">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/time-tracking" element={<ProtectedRoute><TimeTracking /></ProtectedRoute>} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
