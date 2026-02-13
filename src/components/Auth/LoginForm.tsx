import { useState, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const LoginForm = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!fullName.trim()) {
          throw new Error('Naam is verplicht');
        }
        await signUp(email, password, fullName);
      }
    } catch (err: any) {
      setError(err.message || 'Er is iets misgegaan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Inloggen' : 'Registreren'}</h2>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Naam</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Je volledige naam"
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="je@email.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Bezig...' : isLogin ? 'Inloggen' : 'Registreren'}
          </button>
        </form>
        
        <div className="auth-toggle">
          {isLogin ? 'Nog geen account?' : 'Al een account?'}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="btn-link"
          >
            {isLogin ? 'Registreren' : 'Inloggen'}
          </button>
        </div>
      </div>
    </div>
  );
};
