import { Navigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import { ProtectedRouteProps } from '../../../types/types';

const AdminRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  
  // Pour l'instant, on vérifie simplement si l'email correspond à celui de l'admin
  const isAdmin = isAuthenticated && user?.mail === "emma.lefevre@example.com";
  
  if (!isAuthenticated) {
    // Rediriger vers la page de connexion si non authentifié
    return <Navigate to="/" />;
  }
  
  if (!isAdmin) {
    // Rediriger vers le feed si authentifié mais pas admin
    return <Navigate to="/feed" />;
  }
  
  // Rendre le contenu protégé si l'utilisateur est admin
  return <>{children}</>;
};

export default AdminRoute;
