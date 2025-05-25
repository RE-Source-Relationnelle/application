import { Navigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import { ProtectedRouteProps } from '../../../types/types';
import { useEffect, useState } from 'react';

const ModeratorRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, user, fetchUserRole } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkRole = async () => {
      if (isAuthenticated && !user?.role) {
        // Si l'utilisateur est authentifié mais que nous n'avons pas encore son rôle,
        // nous le récupérons
        await fetchUserRole();
      }
      setIsLoading(false);
    };
    
    checkRole();
  }, [isAuthenticated, user, fetchUserRole]);
  
  // Afficher un indicateur de chargement pendant la vérification du rôle
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Vérifier si l'utilisateur est authentifié
  if (!isAuthenticated) {
    console.log("Utilisateur non authentifié, redirection vers la page de connexion");
    return <Navigate to="/" />;
  }
  
  // Vérifier si l'utilisateur a un rôle de modérateur, administrateur ou super-administrateur
  const isModerator = 
    user?.role?.nom_role === "modérateur" || 
    user?.role?.nom_role === "administrateur" || 
    user?.role?.nom_role === "super-administrateur";
  
  if (!isModerator) {
    console.log(`Accès refusé : l'utilisateur a le rôle '${user?.role?.nom_role || "inconnu"}', redirection vers le feed`);
    return <Navigate to="/feed" />;
  }
  
  console.log(`Accès autorisé : l'utilisateur a le rôle '${user?.role?.nom_role}'`);
  // Rendre le contenu protégé si l'utilisateur est modérateur ou plus
  return <>{children}</>;
};

export default ModeratorRoute;
