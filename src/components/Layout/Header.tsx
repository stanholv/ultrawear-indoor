import { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, User, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo + naam */}
        <motion.button
          onClick={() => navigate('/')}
          className="logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <div style={{
            width: '44px',
            height: '44px',
            minWidth: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'white',
            borderRadius: '10px',
            padding: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>
            <img
              src="https://usercontent.one/wp/webshop.ultrawear.be/wp-content/uploads/2020/03/cropped-Logo-ULTRAWEAR-1-1-600x466.png?media=1710336765"
              alt="Ultrawear Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Naam — verbergen op kleine schermen via CSS */}
          <div className="header-logo-text">
            <span style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: '800',
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              lineHeight: 1.2,
            }}>
              ULTRAWEAR INDOOR
            </span>
            <span style={{
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.6)',
              fontWeight: '500',
              display: 'block',
            }}>
              Powered by Ultrawear
            </span>
          </div>
        </motion.button>

        {/* Rechts: theme toggle + user */}
        <div className="header-actions">
          <motion.button
            className="theme-toggle"
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </motion.button>

          {user ? (
            <div className="user-menu">
              <div className="user-avatar">
                {profile?.full_name ? getInitials(profile.full_name) : <User size={16} />}
              </div>
              {/* Naam + rol — verbergen op kleine schermen */}
              <div className="user-menu-info">
                <span style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                  {profile?.full_name || user.email}
                </span>
                {profile?.role === 'admin' && (
                  <span className="badge" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Admin</span>
                )}
              </div>
              <motion.button
                className="btn-logout"
                onClick={handleSignOut}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Uitloggen"
              >
                <LogOut size={16} />
                <span className="btn-logout-text">Uitloggen</span>
              </motion.button>
            </div>
          ) : (
            <motion.button
              className="btn btn-primary btn-login"
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogIn size={18} />
              <span className="btn-login-text">Inloggen</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};
