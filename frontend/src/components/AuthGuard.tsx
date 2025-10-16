import { useEffect, useState } from 'react';
import { LoginInterface } from './LoginInterface';

interface AuthGuardProps {
  children: React.ReactNode;
  onLogin: (userData: any) => void;
}

export const AuthGuard = ({ children, onLogin }: AuthGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem('token');
      const user = sessionStorage.getItem('user');
      
      if (!token || !user) {
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      try {
        const userData = JSON.parse(user);
        onLogin(userData);
        setIsAuthenticated(true);
      } catch (error) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setIsAuthenticated(false);
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [onLogin]);

  const handleLogin = (userData: any) => {
    onLogin(userData);
    setIsAuthenticated(true);
    setIsChecking(false);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginInterface onLogin={handleLogin} />;
  }

  return <>{children}</>;
};