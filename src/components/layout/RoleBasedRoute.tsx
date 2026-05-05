import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole | UserRole[];
  fallbackPath?: string;
}

/**
 * Componente que protege rutas basado en el rol del usuario
 * @param children - Componente a renderizar si el usuario tiene el rol requerido
 * @param requiredRole - Rol(es) requerido(s) para acceder a la ruta
 * @param fallbackPath - Ruta a redirigir si el usuario no tiene permiso (default: /dashboard)
 */
export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = '/dashboard',
}) => {
  const { user, token } = useAuthStore();

  // Si no hay token o usuario, redirigir a login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el usuario tiene el rol requerido
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const hasRequiredRole = requiredRoles.includes(user.role);

  if (!hasRequiredRole) {
    // Redirigir a la ruta alternativa si no tiene permisos
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

RoleBasedRoute.displayName = 'RoleBasedRoute';
