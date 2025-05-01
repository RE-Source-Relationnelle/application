// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import { ProtectedRouteProps } from '../../../types/types';

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuthStore();

  // Afficher un loader pendant la vérification
  if (loading) {
    return <div>Chargement...</div>;
  }

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;