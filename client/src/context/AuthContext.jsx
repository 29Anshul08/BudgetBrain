import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('budgetbrain-token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch {
          localStorage.removeItem('budgetbrain-token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('budgetbrain-token', newToken);
      setToken(newToken);
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}! 🧠`);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.error || 'Login failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  }, [navigate]);

  const signup = useCallback(async (name, email, password, currency) => {
    try {
      const res = await api.post('/auth/signup', { name, email, password, currency });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('budgetbrain-token', newToken);
      setToken(newToken);
      setUser(userData);
      toast.success(`Welcome to BudgetBrain, ${userData.name}! 🎉`);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.error || 'Signup failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('budgetbrain-token');
    setToken(null);
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  }, [navigate]);

  const updateProfile = useCallback(async (data) => {
    try {
      const res = await api.put('/auth/profile', data);
      setUser(res.data.user);
      toast.success('Profile updated!');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.error || 'Update failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
