import { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, User, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
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
            gap: '16px'
          }}
        >
          {/* Ultrawear Logo Icon */}
          <div style={{ 
            width: '48px', 
            height: '48px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'white',
            borderRadius: '12px',
            padding: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <img 
              src="https://usercontent.one/wp/webshop.ultrawear.be/wp-content/uploads/2020/03/cropped-Logo-ULTRAWEAR-1-1-600x466.png?media=1710336765"
              alt="Ultrawear Logo"
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
          
          {/* Team Name */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.5rem', 
              fontWeight: '800',
              color: 'var(--color-text-primary)'
            }}>
              ULTRAWEAR INDOOR
            </h1>
            <div style={{ 
              fontSize: '0.75rem', 
              color: 'var(--color-text-secondary)',
              fontWeight: '500',
              marginTop: '2px'
            }}>
              Powered by Ultrawear
            </div>
          </div>
        </motion.button>

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
            // Logged in user menu
            <div className="user-menu">
              <div className="user-avatar">
                {profile?.full_name ? getInitials(profile.full_name) : <User size={16} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                  {profile?.full_name || user.email}
                </span>
                {profile?.role === 'admin' && (
                  <span className="badge">Admin</span>
                )}
              </div>
              <motion.button
                className="btn-logout"
                onClick={handleSignOut}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={16} />
                Uitloggen
              </motion.button>
            </div>
          ) : (
            // Login button for non-logged in users
            <motion.button
              className="btn btn-primary"
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '0.875rem'
              }}
            >
              <LogIn size={18} />
              <span>Inloggen</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};
