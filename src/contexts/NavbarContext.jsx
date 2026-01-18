import { createContext, useContext, useState } from 'react';

const NavbarContext = createContext();

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useNavbar must be used within NavbarProvider');
  }
  return context;
};

export const NavbarProvider = ({ children }) => {
  const [isNavExpanded, setIsNavExpanded] = useState(true);

  const toggleNav = () => {
    setIsNavExpanded(!isNavExpanded);
  };

  return (
    <NavbarContext.Provider value={{ isNavExpanded, setIsNavExpanded, toggleNav }}>
      {children}
    </NavbarContext.Provider>
  );
};

