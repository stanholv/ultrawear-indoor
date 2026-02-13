import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Navigation = () => {
  const { user, isAdmin } = useAuth();

  return (
    <nav className="navigation">
      <div className="nav-tabs">
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? 'tab active' : 'tab'}
        >
          📊 Statistieken
        </NavLink>
        
        {user && isAdmin && (
          <>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => isActive ? 'tab active' : 'tab'}
            >
              📈 Dashboard
            </NavLink>
            
            <NavLink 
              to="/wedstrijd" 
              className={({ isActive }) => isActive ? 'tab active' : 'tab'}
            >
              ⚽ Wedstrijd
            </NavLink>
          </>
        )}
        
        {!user && (
          <NavLink 
            to="/login" 
            className={({ isActive }) => isActive ? 'tab active' : 'tab'}
          >
            🔐 Inloggen
          </NavLink>
        )}
      </div>
    </nav>
  );
};
