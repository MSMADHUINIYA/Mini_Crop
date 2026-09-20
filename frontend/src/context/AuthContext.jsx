import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('agrismart_token');
      const storedUser = localStorage.getItem('agrismart_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else if (storedToken && !storedUser) {
        // Fallback user if token exists but user metadata was missed
        setToken(storedToken);
        setUser({ name: 'User', email: '', role: 'FARMER' });
      }
    } catch {
      localStorage.removeItem('agrismart_token');
      localStorage.removeItem('agrismart_user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('agrismart_token');
    localStorage.removeItem('agrismart_user');
  }, []);

  // Listen to unauthorized event from api interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      toast.error('Session expired. Please log in again.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    const userData = { name: data.name, email: data.email, role: data.role };
    setToken(data.token);
    setUser(userData);
    localStorage.setItem('agrismart_token', data.token);
    localStorage.setItem('agrismart_user', JSON.stringify(userData));
    toast.success(`Welcome back, ${data.name || 'Farmer'}!`);
    return data;
  };

  const register = async (name, email, password, role) => {
    const data = await registerUser(name, email, password, role);
    const userData = { name: data.name, email: data.email, role: data.role };
    setToken(data.token);
    setUser(userData);
    localStorage.setItem('agrismart_token', data.token);
    localStorage.setItem('agrismart_user', JSON.stringify(userData));
    toast.success('Account created successfully!');
    return data;
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
