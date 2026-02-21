import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Header } from './components/Layout/Header';
import { Navigation } from './components/Layout/Navigation';
import { HomePage } from './components/Home/HomePage';
import { StatsPage } from './components/Stats/StatsPage';
import { DetailedStatsPage } from './pages/DetailedStats';
import { WedstrijdForm } from './components/Wedstrijden/WedstrijdForm';
import { LoginForm } from './components/Auth/LoginForm';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { useAuth } from './hooks/useAuth';
import { AdminPage } from './components/Admin/AdminPage';
import { UitslagenPage } from './components/Uitslagen/UitslagenPage';
import { WedstrijdDetailPage } from './pages/WedstrijdDetailPage';
import './styles/globals.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'var(--color-bg)'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Header />
        <Navigation />
        
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/statistieken" element={<StatsPage />} />
            <Route path="/statistieken/details" element={<DetailedStatsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/uitslagen" element={<UitslagenPage />} />
            <Route path="/uitslagen/:id" element={<WedstrijdDetailPage />} />
            <Route path="/login" element={
              user ? <Navigate to="/" replace /> : <LoginForm />
            } />
            
            {/* Protected Routes */}
            <Route path="/wedstrijd-invoeren" element={
              <ProtectedRoute>
                <WedstrijdForm />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Toaster 
          position="top-right" 
          richColors 
          closeButton 
          duration={5000}
        />
      </div>
    </Router>
  );
}

export default App;
