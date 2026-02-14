import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './hooks/useAuth';
import { Header } from './components/Layout/Header';
import { Navigation } from './components/Layout/Navigation';
import { LoginForm } from './components/Auth/LoginForm';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { StatsOverview } from './components/Stats/StatsOverview';
import { StatsTable } from './components/Stats/StatsTable';
import { HomePage } from './components/Home/HomePage';
import { WedstrijdForm } from './components/Wedstrijden/WedstrijdForm';
import './styles/globals.css';

const StatsPage = () => (
  <div className="main-content">
    <div className="page-header">
      <h1 className="page-title">📊 Speler Statistieken</h1>
      <p className="page-subtitle">Bekijk de prestaties van alle spelers</p>
    </div>
    <StatsOverview />
    <StatsTable />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            toastOptions={{
              style: {
                background: 'var(--color-bg-elevated)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              },
            }}
          />
          <Header />
          <Navigation />

          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route
                path="/wedstrijd"
                element={
                  <ProtectedRoute adminOnly>
                    <WedstrijdForm />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <footer className="footer">
            <p>&copy; 2026 Ultrawear Indoor | Made with ⚽ & 💻</p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
