import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, Calendar, Trophy, Shield, Users, Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Navigation = () => {
  const { user, profile } = useAuth();
  const isAdmin = user && profile?.role === 'admin';

  return (
    <nav className="navigation">
      <div className="nav-tabs">
        <NavLink to="/" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
          <Home size={20} />
          <span>Home</span>
        </NavLink>
        
        <NavLink to="/statistieken" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
          <TrendingUp size={20} />
          <span>Statistieken</span>
        </NavLink>
        
        <NavLink to="/uitslagen" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
          <Trophy size={20} />
          <span>Uitslagen</span>
        </NavLink>

        <NavLink to="/spelers" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Spelers</span>
        </NavLink>

        <NavLink to="/reviews" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
          <Star size={20} />
          <span>Reviews</span>
        </NavLink>
        
        {/* Admin-only links */}
        {isAdmin && (
          <>
            <NavLink to="/admin" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
              <Shield size={20} />
              <span>Admin</span>
            </NavLink>
            
            <NavLink to="/wedstrijd-invoeren" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
              <Calendar size={20} />
              <span>Wedstrijd Invoeren</span>
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};
