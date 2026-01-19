import { createContext, useContext, useState, useEffect } from 'react';
import adminData from '../data/admin.json';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('cchia-admin-auth') === 'true';
  });
  
  const [adminCredentials, setAdminCredentials] = useState(adminData.credentials);

  useEffect(() => {
    localStorage.setItem('cchia-admin-auth', isAuthenticated);
  }, [isAuthenticated]);

  const login = (username, password) => {
    if (username === adminCredentials.username && password === adminCredentials.password) {
      setIsAuthenticated(true);
      // Update last login
      const now = new Date().toISOString();
      localStorage.setItem('cchia-admin-lastLogin', now);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('cchia-admin-auth');
  };

  const changePassword = (currentPassword, newPassword) => {
    if (currentPassword === adminCredentials.password) {
      setAdminCredentials({
        ...adminCredentials,
        password: newPassword,
      });
      // In a real app, this would update the backend
      localStorage.setItem('cchia-admin-password', newPassword);
      localStorage.setItem('cchia-admin-passwordChanged', 'true');
      return true;
    }
    return false;
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    changePassword,
    username: adminCredentials.username,
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

