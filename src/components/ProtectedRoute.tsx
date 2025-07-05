import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  message?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, message = "이 페이지에 접근하려면 로그인이 필요합니다." }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return (
      <Navigate 
        to="/votes" 
        replace 
        state={{
          from: location.pathname,
          message: message 
        }} 
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 