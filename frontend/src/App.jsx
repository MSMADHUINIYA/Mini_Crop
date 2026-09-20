import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import RecommendationPage from './pages/RecommendationPage';
import IrrigationPage from './pages/IrrigationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FarmList from './pages/FarmList';
import FarmForm from './pages/FarmForm';
import FarmDetail from './pages/FarmDetail';
import ResourcePage from './pages/ResourcePage';
import ActionPlanPage from './pages/ActionPlanPage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/farms" element={<ProtectedRoute><FarmList /></ProtectedRoute>} />
          <Route path="/farms/new" element={<ProtectedRoute><FarmForm /></ProtectedRoute>} />
          <Route path="/farms/:id" element={<ProtectedRoute><FarmDetail /></ProtectedRoute>} />
          <Route path="/farms/:id/edit" element={<ProtectedRoute><FarmForm editMode={true} /></ProtectedRoute>} />
          <Route path="/recommendation" element={<ProtectedRoute><RecommendationPage /></ProtectedRoute>} />
          <Route path="/irrigation" element={<ProtectedRoute><IrrigationPage /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><ResourcePage /></ProtectedRoute>} />
          <Route path="/action-plans" element={<ProtectedRoute><ActionPlanPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
