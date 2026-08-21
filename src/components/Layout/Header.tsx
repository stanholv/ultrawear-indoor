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
          <img
            src="/logo.png"
            alt="Ultrawear Indoor"
            style={{ height: '52px', width: '52px', objectFit: 'contain', flexShrink: 0, display: 'block' }}
          />

          {/* Naam — verbergen op kleine schermen via CSS */}
          <div className="header-logo-text">
            <span style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: '1.7rem',
              fontWeight: '700',
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              lineHeight: 0.95,
            }}>
              Ultrawear <span style={{ color: 'var(--color-primary)' }}>Indoor</span>
            </span>
            <span style={{
              fontFamily: 'var(--font-cond)',
              fontSize: '0.66rem',
              color: 'rgba(255,255,255,0.55)',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              display: 'block',
            }}>
              Minivoetbal · Match Centre
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
