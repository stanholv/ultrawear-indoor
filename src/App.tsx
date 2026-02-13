import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Header } from './components/Layout/Header';
import { Navigation } from './components/Layout/Navigation';
import { LoginForm } from './components/Auth/LoginForm';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { StatsTable } from './components/Stats/StatsTable';
import { WedstrijdForm } from './components/Wedstrijden/WedstrijdForm';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Header />
          <Navigation />
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<StatsTable />} />
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
