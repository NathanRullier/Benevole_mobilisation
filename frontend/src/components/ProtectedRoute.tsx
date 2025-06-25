// MVP.2F.9: Protected Route Components

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'volunteer' | 'coordinator';
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true);
      setError(null);

      try {
        if (!isAuthenticated) {
          setIsChecking(false);
          return;
        }

        // MVP.2F.10: Role-based access control
        if (requiredRole && !authService.hasRole(requiredRole)) {
          setError(`Access denied. This page requires ${requiredRole} privileges.`);
          setIsChecking(false);
          return;
        }

        setIsChecking(false);
      } catch (err) {
        setError('Unable to verify access permissions.');
        setIsChecking(false);
      }
    };

    if (!isLoading) {
      checkAccess();
    }
  }, [isAuthenticated, requiredRole, isLoading]);

  // Show loading spinner while checking auth
  if (isLoading || isChecking) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Checking access permissions...
        </Typography>
      </Box>
    );
  }

  // Show error if role check failed
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Please contact support if you believe this is an error.
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ 
          from: location.pathname,
          message: 'Please log in to access this page'
        }}
        replace
      />
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
};

// HOC for protecting components
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'volunteer' | 'coordinator'
) => {
  const ProtectedComponent = (props: P) => (
    <ProtectedRoute requiredRole={requiredRole}>
      <Component {...props} />
    </ProtectedRoute>
  );

  ProtectedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  return ProtectedComponent;
}; 