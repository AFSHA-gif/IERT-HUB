import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isStudentAuthenticated } from '../services/studentAuthService';

export default function ProtectedRouteStudent({ children }) {
  const location = useLocation();

  if (!isStudentAuthenticated()) {
    return <Navigate to="/student/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
