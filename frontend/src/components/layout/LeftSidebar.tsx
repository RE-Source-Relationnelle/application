import useAuthStore from "../../store/authStore";
import { Link } from "react-router-dom";

export default function LeftSidebar() {
    const { user, isAuthenticated } = useAuthStore();
    
    return (
      <div className="bg-white rounded-lg shadow p-4">
        {isAuthenticated && user ? (
          // Affichage pour utilisateur connecté
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">
                  {user.prenom?.charAt(0) || user.username?.charAt(0) || "U"}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{user.prenom} {user.nom}</h3>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
            
            <Link to="/profile" className="block w-full text-center py-2 px-4 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition mb-4">
              Mon compte
            </Link>
          </div>
        ) : (
          // Affichage pour utilisateur non connecté
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-200 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Bienvenue !</h3>
            <p className="text-gray-500 mb-4">Connectez-vous pour accéder à toutes les fonctionnalités</p>
            
            <div className="space-y-2">
              <Link to="/connexion" className="block w-full text-center py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition">
                Connexion
              </Link>
              <Link to="/inscription" className="block w-full text-center py-2 px-4 border border-primary text-primary rounded-md hover:bg-primary/10 transition">
                Inscription
              </Link>
            </div>
          </div>
        )}
      </div>
    );
}