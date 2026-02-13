import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

export const LoginForm = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Succesvol ingelogd!');
      } else {
        if (!fullName.trim()) {
          toast.error('Naam is verplicht');
          setLoading(false);
          return;
        }
        await signUp(email, password, fullName);
        toast.success('Account aangemaakt! Check je email voor bevestiging.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Er is iets misgegaan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 'var(--spacing-xl)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card glass"
        style={{ 
          width: '100%', 
          maxWidth: '400px',
          padding: 'var(--spacing-2xl)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
          <div 
            className="logo-icon" 
            style={{ 
              width: '60px', 
              height: '60px', 
              margin: '0 auto var(--spacing-lg)',
              fontSize: '2rem'
            }}
          >
            ⚽
          </div>
          <h2 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '700', 
            marginBottom: 'var(--spacing-sm)',
            color: 'var(--color-text-primary)'
          }}>
            {isLogin ? 'Welkom Terug' : 'Maak Account'}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {isLogin ? 'Log in om verder te gaan' : 'Registreer je voor toegang'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">
                <User size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Naam
              </label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Je volledige naam"
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <Mail size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Email
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="je@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Wachtwoord
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 'var(--spacing-md)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-tertiary)',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--spacing-lg)' }}
          >
            {loading ? (
              <>
                <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Bezig...
              </>
            ) : (
              isLogin ? 'Inloggen' : 'Registreren'
            )}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: 'var(--spacing-lg)',
          paddingTop: 'var(--spacing-lg)',
          borderTop: '1px solid var(--color-border)'
        }}>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            {isLogin ? 'Nog geen account?' : 'Al een account?'}
          </span>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="btn-ghost"
            style={{ 
              marginLeft: 'var(--spacing-sm)',
              color: 'var(--color-primary)',
              fontWeight: '600'
            }}
          >
            {isLogin ? 'Registreren' : 'Inloggen'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
