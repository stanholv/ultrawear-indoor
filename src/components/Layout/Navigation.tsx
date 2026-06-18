import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, Calendar, Trophy, Shield, Users, Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBadges } from '../../hooks/useBadges';

const NavBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <span style={{
      position: 'absolute',
      top: '2px',
      right: '6px',
      minWidth: '18px',
      height: '18px',
      padding: '0 5px',
      borderRadius: '9px',
      background: 'var(--color-primary)',
      color: 'white',
      fontSize: '0.7rem',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 1,
      boxShadow: '0 0 0 2px var(--color-bg-elevated)',
    }}>
      {count > 9 ? '9+' : count}
    </span>
  );
};

export const Navigation = () => {
  const { user, profile } = useAuth();
  const { reviews, uitslagen } = useBadges();
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
          <NavBadge count={uitslagen} />
        </NavLink>

        <NavLink to="/spelers" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Spelers</span>
        </NavLink>

        <NavLink to="/reviews" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
          <Star size={20} />
          <span>Reviews</span>
          <NavBadge count={reviews} />
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
