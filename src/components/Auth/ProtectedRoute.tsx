import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Laden...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && profile?.role !== 'admin') {
    return (
      <div className="error-container">
        <h2>Geen toegang</h2>
        <p>Je hebt geen rechten om deze pagina te bekijken.</p>
        <p>Alleen administrators kunnen scores invullen.</p>
      </div>
    );
  }

  return <>{children}</>;
};
