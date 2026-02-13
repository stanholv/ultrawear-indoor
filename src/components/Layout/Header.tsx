import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1>Ultrawear Indoor</h1>
        
        {user && (
          <div className="user-info">
            <span className="user-name">
              {profile?.full_name || user.email}
              {profile?.role === 'admin' && <span className="badge">Admin</span>}
            </span>
            <button onClick={handleSignOut} className="btn-logout">
              Uitloggen
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
