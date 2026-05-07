import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Analyze from './pages/Analyze';
import ContractDetail from './pages/ContractDetail';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/contracts/:id" element={<ContractDetail />} />
          </Route>
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
  );
};

export default App;