import React, { useState } from 'react';
import { AuthService } from '../services/authService';
import { UI_COLORS } from '../constants';
import { styles } from '../styles';

export const LoginPage = ({ onLogin }: { onLogin: (user: any, token: string) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!name) throw new Error('Name is required');
        const { user, token } = await AuthService.register(email, password, name);
        localStorage.setItem('authToken', token);
        onLogin(user, token);
      } else {
        const { user, token } = await AuthService.login(email, password);
        localStorage.setItem('authToken', token);
        onLogin(user, token);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginCard}>
        <h1 style={{...styles.headerTitle, marginBottom: 24}}>Medicare Vision AI</h1>
        <h2 style={{marginTop: 0, marginBottom: 24, color: UI_COLORS.text}}>
          {isRegister ? 'Create Account' : 'Sign In'}
        </h2>
        
        {error && (
          <div style={{...styles.errorBox, marginBottom: 16}}>
            <p style={{margin: 0, color: UI_COLORS.danger}}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.loginForm}>
          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.loginInput}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.loginInput}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.loginInput}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.loginButton,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Loading...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p style={{textAlign: 'center', marginTop: 20, color: UI_COLORS.textSecondary}}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          {' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setEmail('');
              setPassword('');
              setName('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: UI_COLORS.primary,
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: 'inherit'
            }}
          >
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
};

