import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Analyze from './pages/Analyze';
import ContractDetail from './pages/ContractDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

/** Redirects to /login if user is not authenticated */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/** Redirects to /dashboard if user IS authenticated */
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<Home />} />

            {/* Public auth routes */}
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            {/* Protected app routes */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/analyze" element={<Analyze />} />
              <Route path="/contracts/:id" element={<ContractDetail />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                boxShadow: '0 10px 30px rgba(2, 6, 23, 0.10)',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;