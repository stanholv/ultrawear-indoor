import { NavLink } from 'react-router-dom';
import { BarChart3, PlusCircle, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Navigation = () => {
  const { user, isAdmin } = useAuth();

  return (
    <nav className="navigation">
      <div className="nav-tabs">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
        >
          <BarChart3 size={20} />
          Statistieken
        </NavLink>

        {user && isAdmin && (
          <NavLink
            to="/wedstrijd"
            className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
          >
            <PlusCircle size={20} />
            Wedstrijd Invoeren
          </NavLink>
        )}

        {!user && (
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
          >
            <LogIn size={20} />
            Inloggen
          </NavLink>
        )}
      </div>
    </nav>
  );
};
