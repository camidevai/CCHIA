import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, supabase } from '../config/supabase';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const session = await authAPI.getSession();
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
    } catch (error) {
      console.error('Error checking session:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { user: authUser } = await authAPI.signIn(email, password);
      setIsAuthenticated(true);
      setUser(authUser);

      // Update last login
      const now = new Date().toISOString();
      localStorage.setItem('cchia-admin-lastLogin', now);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.signOut();
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('cchia-admin-auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const changePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    changePassword,
    username: user?.email || 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

