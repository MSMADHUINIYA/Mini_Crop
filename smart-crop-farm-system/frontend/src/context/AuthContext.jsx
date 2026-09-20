import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('agrismart_token');
    const storedUser = localStorage.getItem('agrismart_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('agrismart_token');
        localStorage.removeItem('agrismart_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    const userData = { name: data.name, email: data.email, role: data.role };
    setToken(data.token);
    setUser(userData);
    localStorage.setItem('agrismart_token', data.token);
    localStorage.setItem('agrismart_user', JSON.stringify(userData));
    toast.success(`Welcome back, ${data.name}!`);
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

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('agrismart_token');
    localStorage.removeItem('agrismart_user');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
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
